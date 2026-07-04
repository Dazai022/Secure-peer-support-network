'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Chat from '@/components/Chat';
import CredentialCard from '@/components/CredentialCard';
import ProofStatus from '@/components/ProofStatus';
import { VolunteerCredential, ChatRoom } from '@/lib/types';
import { getCredentialsFromStorage, saveCredentialToStorage } from '@/lib/storage/indexeddb';
import { generateProof } from '@/lib/zk/prover';

export default function VolunteerPage() {
  const [credentials, setCredentials] = useState<VolunteerCredential[]>([]);
  const [selectedCred, setSelectedCred] = useState<VolunteerCredential | null>(null);
  
  const [waitingRooms, setWaitingRooms] = useState<ChatRoom[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');

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

  // Fetch waiting support requests feed
  const fetchWaitingRooms = async () => {
    setLoadingRooms(true);
    try {
      const res = await fetch('/api/chat/room?filter=waiting');
      if (res.ok) {
        const data = await res.json();
        setWaitingRooms(data.rooms || []);
        if (data.rooms && data.rooms.length > 0 && !selectedRoomId) {
          setSelectedRoomId(data.rooms[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch waiting rooms:', err);
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    fetchWaitingRooms();
    const interval = setInterval(fetchWaitingRooms, 3000);
    return () => clearInterval(interval);
  }, []);

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

  const handleJoinChat = async (targetRoomId?: string) => {
    const roomIdToJoin = targetRoomId || selectedRoomId;

    if (!selectedCred) {
      alert('Please select or obtain a verifiable credential first');
      return;
    }

    if (!roomIdToJoin.trim()) {
      alert('Please select a waiting support request to join');
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
      const proof = await generateProof(selectedCred, nonce, 'age_verified', roomIdToJoin.trim());

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
        setJoinedRoomId(roomIdToJoin.trim());
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
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl w-full">
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

            {/* Right Column: Live Waiting Support Requests Feed */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-200 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <h2 className="text-lg font-bold text-slate-900">Active Support Requests</h2>
                  <button
                    onClick={fetchWaitingRooms}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                  >
                    🔄 Refresh Feed
                  </button>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Select a waiting anonymous support seeker to join using ZK Proof.
                </p>

                {waitingRooms.length === 0 ? (
                  <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                    No seekers currently waiting. Create a seeker session in another tab at <Link href="/seeker" target="_blank" className="text-blue-600 underline">/seeker</Link> to see it appear live here!
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {waitingRooms.map((room, idx) => (
                      <div
                        key={room.id}
                        onClick={() => setSelectedRoomId(room.id)}
                        className={`p-3.5 border rounded-xl flex justify-between items-center cursor-pointer transition-all ${
                          selectedRoomId === room.id
                            ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                            <span className="font-bold text-xs text-slate-800">
                              Anonymous Seeker #{idx + 1}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Waiting since {new Date(room.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRoomId(room.id);
                            handleJoinChat(room.id);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm"
                        >
                          Join via ZK Proof
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <ProofStatus status={proofStatus} errorMessage={errorMessage} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
