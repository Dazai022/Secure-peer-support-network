/**
 * Privacy-Preserving Credential System
 * 
 * Provides verifiable credentials for peer supporters.
 * Uses Web Crypto API for signing and verifying credentials.
 */

import { VolunteerCredential } from '../types';
import { arrayBufferToBase64, base64ToArrayBuffer } from '../crypto/aes';

/**
 * Generate an Issuer Key Pair (ECDSA P-256)
 */
export async function generateIssuerKeyPair(): Promise<{ publicKey: string; secretKey: string }> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'ECDSA',
      namedCurve: 'P-256',
    },
    true,
    ['sign', 'verify']
  );

  const pubExported = await crypto.subtle.exportKey('spki', keyPair.publicKey);
  const privExported = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

  return {
    publicKey: arrayBufferToBase64(pubExported),
    secretKey: arrayBufferToBase64(privExported),
  };
}

/**
 * Issue a volunteer credential signed by the admin secret key
 */
export async function issueCredential(
  attributes: VolunteerCredential['attributes'],
  secretKeyBase64: string,
  publicKeyBase64: string
): Promise<VolunteerCredential> {
  const privKeyBuffer = base64ToArrayBuffer(secretKeyBase64);
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    privKeyBuffer,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );

  const payload = JSON.stringify(attributes);
  const encodedPayload = new TextEncoder().encode(payload);

  const signatureBuffer = await crypto.subtle.sign(
    { name: 'ECDSA', hash: { name: 'SHA-256' } },
    privateKey,
    encodedPayload
  );

  const id = `cred-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  return {
    id,
    attributes,
    signature: arrayBufferToBase64(signatureBuffer),
    issuerPublicKey: publicKeyBase64,
  };
}

/**
 * Verify a credential's signature
 */
export async function verifyCredential(credential: VolunteerCredential): Promise<boolean> {
  try {
    const pubKeyBuffer = base64ToArrayBuffer(credential.issuerPublicKey);
    const publicKey = await crypto.subtle.importKey(
      'spki',
      pubKeyBuffer,
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['verify']
    );

    const payload = JSON.stringify(credential.attributes);
    const encodedPayload = new TextEncoder().encode(payload);
    const signatureBuffer = base64ToArrayBuffer(credential.signature);

    return await crypto.subtle.verify(
      { name: 'ECDSA', hash: { name: 'SHA-256' } },
      publicKey,
      signatureBuffer,
      encodedPayload
    );
  } catch (error) {
    console.error('Credential verification error:', error);
    return false;
  }
}
