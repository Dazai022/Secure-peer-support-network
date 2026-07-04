'use client';

import { VolunteerCredential } from '@/lib/types';

interface CredentialCardProps {
  credential: VolunteerCredential;
  onSelect?: () => void;
  selected?: boolean;
}

export default function CredentialCard({ credential, onSelect, selected }: CredentialCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`border rounded-xl p-4 bg-white shadow-sm transition-all cursor-pointer ${
        selected ? 'ring-2 ring-emerald-500 border-emerald-500' : 'hover:border-slate-300'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            Verified Credential
          </span>
          <h4 className="font-semibold text-slate-900 mt-1">Peer Support Responder</h4>
        </div>
        <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
          {credential.id.slice(0, 10)}...
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs mb-3 text-slate-600">
        <div>
          <span className="text-slate-400 block text-[10px]">Age Verified</span>
          <span className="font-medium text-slate-800">
            {credential.attributes.age_verified ? '✓ Yes (18+)' : '✗ No'}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px]">Trained Support</span>
          <span className="font-medium text-slate-800">
            {credential.attributes.trained ? '✓ Certified' : '✗ No'}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px]">Responder Level</span>
          <span className="font-medium text-slate-800">Level {credential.attributes.responder_level}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px]">Issued Date</span>
          <span className="font-medium text-slate-800">
            {new Date(credential.attributes.issue_date).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-2 flex justify-between">
        <span>Signature: {credential.signature.slice(0, 12)}...</span>
        <span>Client-Side Stored</span>
      </div>
    </div>
  );
}
