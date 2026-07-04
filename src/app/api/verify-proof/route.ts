import { NextRequest, NextResponse } from 'next/server';
import { verifyProof } from '@/lib/zk/prover';
import { createResponderToken } from '@/lib/jwt';
import { updateChatRoomStatus, validateAndConsumeNonce } from '@/lib/db/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { proof, challengeNonce, publicSignals, proofType, chatRoomId } = body;

    if (!proof || !challengeNonce || !chatRoomId) {
      return NextResponse.json({ error: 'Missing required proof parameters' }, { status: 400 });
    }

    const isValidNonce = await validateAndConsumeNonce(challengeNonce);
    if (!isValidNonce) {
      return NextResponse.json({ error: 'Invalid or expired challenge nonce' }, { status: 400 });
    }

    const isValidProof = await verifyProof({
      proof,
      challengeNonce,
      publicSignals: publicSignals || [],
      proofType: proofType || 'age_verified',
      chatRoomId,
    });

    if (!isValidProof) {
      return NextResponse.json({ error: 'Zero-knowledge proof verification failed' }, { status: 401 });
    }

    const volunteerId = `vol-${Math.random().toString(36).substring(2, 8)}`;

    // Update room status to active
    await updateChatRoomStatus(chatRoomId, 'active', volunteerId);

    // Create JWT token for responder
    const token = await createResponderToken(chatRoomId, volunteerId);

    return NextResponse.json({
      token,
      volunteerId,
      expiresIn: 3600,
    });
  } catch (error) {
    console.error('Verify proof error:', error);
    return NextResponse.json({ error: 'Internal server error verifying proof' }, { status: 500 });
  }
}
