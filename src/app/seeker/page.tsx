'use client';

import { useState } from 'react';
import Link from 'next/link';
import Chat from '@/components/Chat';

export default function SeekerPage() {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `seeker-${Math.random().toString(36).substring(2, 9)}`);

  const handleStartChat = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/chat/room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seekerSessionId: sessionId }),
      });

      if (!res.ok) throw new Error('Failed to create chat room');

      const data = await res.json();
      setRoomId(data.id);
    } catch (err) {
      console.error(err);
      alert('Error creating chat room. Please try again.');
    } finally {
      setLoading(false);
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
          <span className="text-xs bg-blue-600/30 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-full">
            Seeker Mode (Anonymous)
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 flex flex-col items-center justify-center">
        {!roomId ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center border border-slate-200">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Need Peer Support?</h1>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              Connect with a verified support volunteer anonymously. No accounts, names, or personal data are collected.
            </p>

            <button
              onClick={handleStartChat}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-6 rounded-xl text-sm transition-all shadow-md hover:shadow-blue-500/25 disabled:opacity-50"
            >
              {loading ? 'Creating Secure Chat Room...' : 'Start Anonymous Chat Room'}
            </button>

            <div className="mt-6 pt-6 border-t border-slate-100 text-left space-y-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold">✓</span> End-to-End Encrypted (AES-128-GCM)
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold">✓</span> Volunteers verified via Zero-Knowledge Proofs
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold">✓</span> Zero data logging or identity tracking
              </div>
            </div>
          </div>
        ) : (
          <Chat roomId={roomId} senderId={sessionId} senderRole="seeker" />
        )}
      </main>
    </div>
  );
}
