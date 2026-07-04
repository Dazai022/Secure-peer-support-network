import { NextRequest, NextResponse } from 'next/server';
import { saveMessage, getMessages, getChatRoom } from '@/lib/db/supabase';
import { verifyResponderToken } from '@/lib/jwt';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');
    const sinceId = searchParams.get('sinceId') || undefined;

    if (!roomId) {
      return NextResponse.json({ error: 'roomId required' }, { status: 400 });
    }

    const room = await getChatRoom(roomId);
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const messages = await getMessages(roomId, sinceId);
    return NextResponse.json({ messages, roomStatus: room.status });
  } catch (error) {
    console.error('Fetch messages error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomId, ciphertext, iv, senderRole, senderId, token } = body;

    if (!roomId || !ciphertext || !iv || !senderRole) {
      return NextResponse.json({ error: 'Missing message parameters' }, { status: 400 });
    }

    // Authenticate responder if sending as responder
    if (senderRole === 'responder') {
      if (!token) {
        return NextResponse.json({ error: 'Responder authentication token required' }, { status: 401 });
      }

      const verified = await verifyResponderToken(token);
      if (!verified || verified.chatRoomId !== roomId) {
        return NextResponse.json({ error: 'Invalid or expired responder token' }, { status: 403 });
      }
    }

    const message = await saveMessage({
      chatRoomId: roomId,
      senderId: senderId || (senderRole === 'responder' ? 'responder' : 'seeker'),
      senderRole,
      ciphertext,
      iv,
      messageType: 'text',
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
