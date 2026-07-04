import { NextRequest, NextResponse } from 'next/server';
import { generateIssuerKeyPair, issueCredential } from '@/lib/credentials/bbs';

let demoIssuerKeys: { publicKey: string; secretKey: string } | null = null;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { attributes } = body;

    if (!attributes) {
      return NextResponse.json({ error: 'Credential attributes are required' }, { status: 400 });
    }

    if (!demoIssuerKeys) {
      demoIssuerKeys = await generateIssuerKeyPair();
    }

    const credential = await issueCredential(
      {
        age_verified: Boolean(attributes.age_verified),
        trained: Boolean(attributes.trained),
        responder_level: Number(attributes.responder_level) || 1,
        issue_date: new Date().toISOString(),
      },
      demoIssuerKeys.secretKey,
      demoIssuerKeys.publicKey
    );

    return NextResponse.json({
      credential,
      message: 'Credential issued successfully',
    });
  } catch (error) {
    console.error('Issue credential error:', error);
    return NextResponse.json({ error: 'Failed to issue credential' }, { status: 500 });
  }
}
