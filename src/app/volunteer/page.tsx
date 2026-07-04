'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Chat from '@/components/Chat';
import CredentialCard from '@/components/CredentialCard';
import ProofStatus from '@/components/ProofStatus';
import { VolunteerCredential } from '@/lib/types';
import { getCredentialsFromStorage, saveCredentialToStorage } from '@/lib/storage/indexeddb';
import { generateProof } from '@/lib/zk/prover';

export default function VolunteerPage() {
  const [credentials, setCredentials] = useState<VolunteerCredential[]>([]);
  const [selectedCred, setSelectedCred] = useState<VolunteerCredential | null>(null);
  const [roomIdInput, setRoomIdInput] = useState('');
  const [chatToken, setChatToken] = useState<string | null>(null);
  const [joinedRoomId, setJoinedRoomId] = useState<string | null>(null);
  const [volunteerId, setVolunteerId] = useState<string | null>(null);
  
  const [proofStatus, setProofStatus] = useState<'idle' | 'challenging' | 'generating' | 'verifying' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Load stored credentials from IndexedDB
  useEffect(() => {
    getCredentialsFromStorage().then((creds) => {
      setCredentials(creds);
      if (creds.length > 0) {
        setSelectedCred(creds[0]);
      }
    });
  }, []);

  // Demo helper: Load a pre-generated demo credential if none exist
  const handleLoadDemoCred = async () => {
    try {
      const res = await fetch('/api/admin/issue-credential', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attributes: {
            age_verified: true,
            trained: true,
            responder_level: 2,
          },
        }),
      });

      if (!res.ok) throw new Error('Failed to issue credential');

      const data = await res.json();
      const newCred: VolunteerCredential = data.credential;

      await saveCredentialToStorage(newCred);
      setCredentials((prev) => [newCred, ...prev]);
      setSelectedCred(newCred);
    } catch (err) {
      console.error(err);
      alert('Error obtaining demo credential');
    }
  };

  const handleJoinChat = async () => {
    if (!selectedCred) {
      alert('Please select or obtain a verifiable credential first');
      return;
    }

    if (!roomIdInput.trim()) {
      alert('Please enter a valid Chat Room ID');
      return;
    }

    setErrorMessage('');
    try {
      // Step 1: Challenge Nonce
      setProofStatus('challenging');
      const challengeRes = await fetch('/api/challenge', { method: 'POST' });
      if (!challengeRes.ok) throw new Error('Failed to obtain server challenge nonce');
      const { nonce } = await challengeRes.json();

      // Step 2: ZK Proof Generation
      setProofStatus('generating');
      const proof = await generateProof(selectedCred, nonce, 'age_verified', roomIdInput.trim());

      // Step 3: Verification Server-Side
      setProofStatus('verifying');
      const verifyRes = await fetch('/api/verify-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proof),
      });

      if (!verifyRes.ok) {
        const errorData = await verifyRes.json();
        throw new Error(errorData.error || 'Proof verification failed');
      }

      const { token, volunteerId: volId } = await verifyRes.json();
      setProofStatus('success');

      // Enter Chat
      setTimeout(() => {
        setChatToken(token);
        setVolunteerId(volId);
        setJoinedRoomId(roomIdInput.trim());
      }, 800);
    } catch (err: any) {
      console.error(err);
      setProofStatus('error');
      setErrorMessage(err.message || 'Verification process failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 text-white py-4 px-6 shadow">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="font-bold text-base flex items-center gap-2 hover:opacity-80 transition-opacity">
            ← Secure Peer Support
          </Link>
          <span className="text-xs bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full">
            Volunteer Portal
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 flex flex-col items-center justify-center">
        {joinedRoomId && chatToken ? (
          <Chat
            roomId={joinedRoomId}
            senderId={volunteerId || 'responder'}
            senderRole="responder"
            token={chatToken}
          />
        ) : (
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
            {/* Left Column: Credentials */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-200 flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Your Anonymous Credentials</h2>
                <p className="text-xs text-slate-500 mb-4">
                  Credentials stored encrypted in your local browser storage.
                </p>

                {credentials.length === 0 ? (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-400 text-xs">
                    <p className="mb-3">No credentials found in local browser storage.</p>
                    <button
                      onClick={handleLoadDemoCred}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-xs"
                    >
                      + Generate Demo Volunteer Credential
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {credentials.map((cred) => (
                      <CredentialCard
                        key={cred.id}
                        credential={cred}
                        selected={selectedCred?.id === cred.id}
                        onSelect={() => setSelectedCred(cred)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {credentials.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs">
                  <span className="text-slate-400">{credentials.length} credential(s) loaded</span>
                  <button
                    onClick={handleLoadDemoCred}
                    className="text-emerald-600 hover:text-emerald-700 font-semibold"
                  >
                    + Add Another Demo Credential
                  </button>
                </div>
              )}
            </div>

            {/* Right Column: Join Room & Proof Pipeline */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-200 flex flex-col justify-between space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Join Support Room</h2>
                <p className="text-xs text-slate-500 mb-4">
                  Prove qualification via ZK Proof to join chat without revealing your identity.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Chat Room ID
                    </label>
                    <input
                      type="text"
                      value={roomIdInput}
                      onChange={(e) => setRoomIdInput(e.target.value)}
                      placeholder="e.g. demo-room-123 or paste room ID"
                      className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <button
                    onClick={handleJoinChat}
                    disabled={proofStatus === 'challenging' || proofStatus === 'generating' || proofStatus === 'verifying'}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl text-sm transition-all shadow-md hover:shadow-emerald-500/25 disabled:opacity-50"
                  >
                    Generate ZK Proof & Join Chat
                  </button>
                </div>
              </div>

              <ProofStatus status={proofStatus} errorMessage={errorMessage} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
