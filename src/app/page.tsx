import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-emerald-400 flex items-center justify-center font-bold text-white shadow-lg">
              S
            </div>
            <span className="font-bold text-lg tracking-tight">Secure Peer Support</span>
          </div>
          <div className="flex gap-4 text-xs font-medium">
            <Link href="/seeker" className="text-slate-300 hover:text-white transition-colors py-2 px-3 rounded-md">
              Need Help
            </Link>
            <Link href="/volunteer" className="text-slate-300 hover:text-white transition-colors py-2 px-3 rounded-md">
              Volunteer
            </Link>
            <Link href="/admin" className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 py-2 px-3.5 rounded-md transition-all">
              Admin Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-16 flex-1 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Zero-Knowledge Verified Anonymous Support
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Confidential Peer Support Powered by <span className="bg-gradient-to-r from-blue-400 via-emerald-400 to-teal-300 bg-clip-text text-transparent">Zero-Knowledge Proofs</span>
          </h1>
          <p className="text-slate-400 text-base md:text-lg leading-relaxed">
            Support seekers remain completely anonymous. Volunteers prove credentials using zero-knowledge selective disclosure proofs without revealing identity. All chat is end-to-end encrypted.
          </p>
        </div>

        {/* Roles Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16 w-full">
          {/* Seeker Card */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-7 hover:border-blue-500/50 transition-all flex flex-col justify-between group shadow-xl">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">I Need Support</h2>
              <p className="text-slate-400 text-xs leading-relaxed mb-6">
                Get immediate, confidential support from qualified volunteers. No account or personal details required.
              </p>
            </div>
            <Link
              href="/seeker"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-3 px-4 rounded-xl text-center transition-all shadow-md hover:shadow-blue-500/25"
            >
              Start Anonymous Chat →
            </Link>
          </div>

          {/* Volunteer Card */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-7 hover:border-emerald-500/50 transition-all flex flex-col justify-between group shadow-xl">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">I Want to Help</h2>
              <p className="text-slate-400 text-xs leading-relaxed mb-6">
                Join chat rooms using your verified credential. Prove qualifications via ZK proof while keeping your real identity private.
              </p>
            </div>
            <Link
              href="/volunteer"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold py-3 px-4 rounded-xl text-center transition-all shadow-md hover:shadow-emerald-500/25"
            >
              Volunteer Portal →
            </Link>
          </div>

          {/* Admin Card */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-7 hover:border-purple-500/50 transition-all flex flex-col justify-between group shadow-xl">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Admin Issuer</h2>
              <p className="text-slate-400 text-xs leading-relaxed mb-6">
                Issue cryptographic verifiable credentials to vetted support volunteers with selective disclosure capabilities.
              </p>
            </div>
            <Link
              href="/admin"
              className="w-full bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold py-3 px-4 rounded-xl text-center transition-all border border-slate-600"
            >
              Issue Credentials →
            </Link>
          </div>
        </div>

        {/* Security Feature Cards */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-8 max-w-5xl mx-auto w-full">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-6 text-center">
            Cryptographic Security & Privacy Guarantees
          </h3>
          <div className="grid md:grid-cols-4 gap-6 text-xs">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="font-bold text-slate-200 mb-1">E2E Encryption</div>
              <p className="text-slate-400">Client-side AES-128-GCM message encryption using Web Crypto API.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="font-bold text-slate-200 mb-1">Zero-Knowledge Proofs</div>
              <p className="text-slate-400">Volunteers prove qualification without disclosing real identity.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="font-bold text-slate-200 mb-1">Verifiable Credentials</div>
              <p className="text-slate-400">Cryptographically signed credentials stored in client IndexedDB.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="font-bold text-slate-200 mb-1">Serverless & Vercel-Ready</div>
              <p className="text-slate-400">Built for Next.js App Router with 100% cloud deployment compatibility.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-slate-500 text-xs">
        Secure Peer Support Network — Zero-Knowledge Privacy Demonstration App
      </footer>
    </div>
  );
}
