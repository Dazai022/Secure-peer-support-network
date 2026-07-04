'use client';

import { useState } from 'react';
import Link from 'next/link';
import { VolunteerCredential } from '@/lib/types';
import { saveCredentialToStorage } from '@/lib/storage/indexeddb';
import CredentialCard from '@/components/CredentialCard';

export default function AdminPage() {
  const [ageVerified, setAgeVerified] = useState(true);
  const [trained, setTrained] = useState(true);
  const [responderLevel, setResponderLevel] = useState(2);
  const [loading, setLoading] = useState(false);
  const [issuedCred, setIssuedCred] = useState<VolunteerCredential | null>(null);

  const handleIssue = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/issue-credential', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attributes: {
            age_verified: ageVerified,
            trained,
            responder_level: responderLevel,
          },
        }),
      });

      if (!res.ok) throw new Error('Failed to issue credential');

      const data = await res.json();
      const cred: VolunteerCredential = data.credential;

      setIssuedCred(cred);
      // Save directly to storage for local testing
      await saveCredentialToStorage(cred);
    } catch (err) {
      console.error(err);
      alert('Failed to issue credential');
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
          <span className="text-xs bg-purple-600/30 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full">
            Admin Credential Issuer
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 flex flex-col justify-center">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Issue Form */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Issue Verifiable Credential</h2>
            <p className="text-xs text-slate-500 mb-6">
              Create cryptographically signed credentials for verified volunteer supporters.
            </p>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="font-semibold text-slate-800 block">Age Verified (18+)</span>
                  <span className="text-slate-500">Confirm volunteer is of legal age</span>
                </div>
                <input
                  type="checkbox"
                  checked={ageVerified}
                  onChange={(e) => setAgeVerified(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="font-semibold text-slate-800 block">Certified Support Training</span>
                  <span className="text-slate-500">Completed peer support qualification</span>
                </div>
                <input
                  type="checkbox"
                  checked={trained}
                  onChange={(e) => setTrained(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="font-semibold text-slate-800 block mb-1">
                  Responder Level (1 - 5)
                </label>
                <select
                  value={responderLevel}
                  onChange={(e) => setResponderLevel(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg p-2 bg-white text-xs"
                >
                  <option value={1}>Level 1 - General Supporter</option>
                  <option value={2}>Level 2 - Peer Counselor</option>
                  <option value={3}>Level 3 - Crisis Listener</option>
                  <option value={4}>Level 4 - Advanced Responder</option>
                  <option value={5}>Level 5 - Lead Specialist</option>
                </select>
              </div>

              <button
                onClick={handleIssue}
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl text-sm transition-all shadow-md hover:shadow-purple-500/25 disabled:opacity-50 mt-4"
              >
                {loading ? 'Signing Credential...' : 'Issue & Sign Credential'}
              </button>
            </div>
          </div>

          {/* Issued Preview */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-200 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Issued Credential Output</h2>
              <p className="text-xs text-slate-500 mb-6">
                Cryptographic output with ECDSA digital signature.
              </p>

              {issuedCred ? (
                <div className="space-y-4">
                  <CredentialCard credential={issuedCred} />
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs">
                    ✓ Credential signed by Admin & automatically saved to local IndexedDB storage for testing.
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs">
                  Fill the form and click "Issue & Sign Credential" to create a signed verifiable credential.
                </div>
              )}
            </div>

            {issuedCred && (
              <Link
                href="/volunteer"
                className="block text-center bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2.5 px-4 rounded-xl mt-4 transition-colors"
              >
                Go to Volunteer Portal to Test ZK Proof →
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
