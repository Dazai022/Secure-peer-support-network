import { NextResponse } from 'next/server';
import { storeChallengeNonce } from '@/lib/db/supabase';

export async function POST() {
  try {
    const nonce = `nonce-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    await storeChallengeNonce(nonce);

    return NextResponse.json({
      nonce,
      expiresIn: 300,
    });
  } catch (error) {
    console.error('Challenge API error:', error);
    return NextResponse.json({ error: 'Failed to generate challenge' }, { status: 500 });
  }
}
