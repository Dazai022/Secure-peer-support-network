/**
 * JWT Utilities using jose (pure JS, Vercel-compatible)
 */

import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'secure-peer-support-dev-secret-key-change-in-prod'
);

export async function createResponderToken(chatRoomId: string, volunteerId: string): Promise<string> {
  return await new SignJWT({ chatRoomId, volunteerId, role: 'responder' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(JWT_SECRET);
}

export async function verifyResponderToken(token: string): Promise<{ chatRoomId: string; volunteerId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      chatRoomId: payload.chatRoomId as string,
      volunteerId: payload.volunteerId as string,
    };
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}
