/**
 * TypeScript Interfaces for Secure Peer Support Network
 */

export interface ChatMessage {
  id: string;
  chatRoomId: string;
  senderId: string;
  senderRole: 'seeker' | 'responder';
  ciphertext: string;
  iv: string;
  timestamp: string | Date;
  messageType: 'text' | 'system';
}

export interface ChatRoom {
  id: string;
  status: 'waiting' | 'active' | 'closed';
  seekerSessionId: string;
  volunteerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VolunteerCredential {
  id: string;
  attributes: {
    age_verified: boolean;
    trained: boolean;
    responder_level: number;
    issue_date: string;
  };
  signature: string;
  issuerPublicKey: string;
}

export interface ZKProof {
  proof: string;
  challengeNonce: string;
  publicSignals: string[];
  proofType: 'age_verified' | 'trained' | 'responder_level';
  chatRoomId: string;
}

export interface ChallengeResponse {
  nonce: string;
  expiresIn: number;
}

export interface VerifyProofResponse {
  token: string;
  volunteerId: string;
  expiresIn: number;
}
