import { NextRequest, NextResponse } from 'next/server';
import { createChatRoom, getChatRoom } from '@/lib/db/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { seekerSessionId } = body;

    if (!seekerSessionId) {
      return NextResponse.json({ error: 'seekerSessionId is required' }, { status: 400 });
    }

    const room = await createChatRoom(seekerSessionId);
    return NextResponse.json(room);
  } catch (error) {
    console.error('Create room error:', error);
    return NextResponse.json({ error: 'Failed to create chat room' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');

    if (!roomId) {
      return NextResponse.json({ error: 'roomId query parameter required' }, { status: 400 });
    }

    const room = await getChatRoom(roomId);
    if (!room) {
      return NextResponse.json({ error: 'Chat room not found' }, { status: 404 });
    }

    return NextResponse.json(room);
  } catch (error) {
    console.error('Get room error:', error);
    return NextResponse.json({ error: 'Failed to fetch chat room' }, { status: 500 });
  }
}
