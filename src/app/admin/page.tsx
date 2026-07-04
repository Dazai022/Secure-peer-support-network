'use client';

import { useState } from 'react';
import Link from 'next/link';
import { VolunteerCredential } from '@/lib/types';
import { saveCredentialToStorage } from '@/lib/storage/indexeddb';
import CredentialCard from '@/components/CredentialCard';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const [ageVerified, setAgeVerified] = useState(true);
  const [trained, setTrained] = useState(true);
  const [responderLevel, setResponderLevel] = useState(2);
  const [loading, setLoading] = useState(false);
  const [issuedCred, setIssuedCred] = useState<VolunteerCredential | null>(null);

  // Admin authentication check
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default admin passcode (or can be customized)
    const expectedPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';

    if (adminPasswordInput === expectedPassword) {
      setIsAuthenticated(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between">
        <header className="border-b border-slate-800 py-4 px-6">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <Link href="/" className="font-bold text-base flex items-center gap-2 text-slate-300 hover:text-white">
              ← Secure Peer Support
            </Link>
            <span className="text-xs bg-purple-600/30 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full">
              Admin Portal
            </span>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-8 max-w-md w-full shadow-2xl backdrop-blur-md">
            <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-white text-center mb-1">Admin Authentication</h2>
            <p className="text-slate-400 text-xs text-center mb-6">
              Restricted access. Enter admin passcode to issue credentials.
            </p>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Admin Passcode
                </label>
                <input
                  type="password"
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  placeholder="Enter passcode (default: admin123)"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {passwordError && (
                <p className="text-red-400 text-xs text-center font-medium">
                  Incorrect passcode. Try default: <code className="bg-slate-900 px-1.5 py-0.5 rounded text-purple-300">admin123</code>
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold py-3 rounded-xl transition-all shadow-md hover:shadow-purple-500/25"
              >
                Authenticate Admin
              </button>
            </form>
          </div>
        </main>

        <footer className="py-4 text-center text-slate-500 text-xs border-t border-slate-800">
          Secure Peer Support Network — Admin Security Control
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 text-white py-4 px-6 shadow">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="font-bold text-base flex items-center gap-2 hover:opacity-80 transition-opacity">
            ← Secure Peer Support
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-purple-600/30 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full">
              Admin Authenticated
            </span>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-md border border-slate-700"
            >
              Lock Admin
            </button>
          </div>
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
