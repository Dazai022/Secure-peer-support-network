# Secure Peer Support Network with Zero-Knowledge Verified Responders

A modern Next.js 15 web application implementing privacy-preserving peer support with zero-knowledge proofs, verifiable credentials, and end-to-end encryption.

## 🚀 Features

- **Support Seekers**: Start anonymous chat rooms with zero account creation or tracking.
- **Volunteers**: Join support rooms by proving credentials via Zero-Knowledge (ZK) selective disclosure proofs without revealing real identity.
- **Admin Issuer**: Issue cryptographically signed verifiable credentials (ECDSA/P-256) stored securely in client-side IndexedDB.
- **End-to-End Encryption**: AES-128-GCM client-side encryption via browser Web Crypto API.
- **100% Vercel & Serverless Ready**: Rebuilt using Next.js App Router with polling-based real-time API routes. Zero native C++ or custom WebSocket server dependencies.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router, React 19)
- **Styling**: Tailwind CSS v4
- **Cryptography**: Web Crypto API (AES-GCM, ECDSA, ECDH)
- **Authentication**: JWT (`jose` library)
- **Client Storage**: IndexedDB
- **Database (Optional)**: Supabase / PostgreSQL (includes automatic in-memory fallback for zero-config demo mode)

---

## 📁 Project Structure

```
secure-peer-support/
├── src/
│   ├── app/
│   │   ├── admin/page.tsx         # Admin Portal (Issue Credential)
│   │   ├── seeker/page.tsx        # Seeker Portal (Start Chat)
│   │   ├── volunteer/page.tsx     # Volunteer Portal (ZK Proof & Join)
│   │   ├── api/
│   │   │   ├── admin/issue-credential/route.ts
│   │   │   ├── challenge/route.ts
│   │   │   ├── chat/messages/route.ts
│   │   │   ├── chat/room/route.ts
│   │   │   └── verify-proof/route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx               # Landing Page
│   ├── components/
│   │   ├── Chat.tsx               # Encrypted E2EE Chat Component
│   │   ├── CredentialCard.tsx     # Credential Card Component
│   │   └── ProofStatus.tsx        # ZK Pipeline Status Component
│   └── lib/
│       ├── credentials/bbs.ts     # Verifiable Credential Engine
│       ├── crypto/                # AES-GCM & ECDH Web Crypto
│       ├── db/supabase.ts         # DB Client (with Demo Fallback)
│       ├── storage/indexeddb.ts   # IndexedDB Client Storage
│       ├── jwt.ts                 # JWT Token Signing/Verification
│       ├── types.ts               # TypeScript Interfaces
│       └── zk/prover.ts           # ZK Proof Prover & Verifier
├── database/
│   └── schema.sql                 # Optional Supabase Schema
├── package.json
├── next.config.ts
├── tsconfig.json
└── vercel.json
```

---

## 🌐 Deploy to Vercel

1. Push this repository to GitHub.
2. Go to [Vercel](https://vercel.com) and click **Add New Project**.
3. Import your repository.
4. Click **Deploy**! (Zero extra configuration required for demo mode).

---

## 💻 Local Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev

# Open http://localhost:3000 in your browser
```

---

## 🧪 Testing the Flow

1. Visit `/admin` → Click **Issue & Sign Credential**.
2. Visit `/seeker` → Click **Start Anonymous Chat Room** (Copy the generated Room ID).
3. Visit `/volunteer` → Enter the Room ID → Click **Generate ZK Proof & Join Chat**.
4. Both parties are now connected in an End-to-End Encrypted chat!
