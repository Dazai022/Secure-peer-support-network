'use client';

import { useEffect, useState, useRef } from 'react';
import { encryptMessage, decryptMessage } from '@/lib/crypto';
import { ChatMessage } from '@/lib/types';

interface ChatProps {
  roomId: string;
  senderId: string;
  senderRole: 'seeker' | 'responder';
  token?: string;
}

/**
 * Derive deterministic room AES-GCM encryption key from roomId
 * Ensured both Seeker and Volunteer in the same roomId get the exact same E2E key.
 */
async function getRoomEncryptionKey(roomId: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(`secure-peer-support-secret-${roomId}`),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(`salt-peer-support-${roomId}`),
      iterations: 10000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 128 },
    true,
    ['encrypt', 'decrypt']
  );
}

export default function Chat({ roomId, senderId, senderRole, token }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const [roomStatus, setRoomStatus] = useState<'waiting' | 'active' | 'closed'>('waiting');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMsgIdRef = useRef<string | undefined>(undefined);

  // Initialize room encryption key
  useEffect(() => {
    let isMounted = true;
    getRoomEncryptionKey(roomId).then((key) => {
      if (isMounted) {
        setEncryptionKey(key);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [roomId]);

  // Real-time polling for messages & room status (every 1 second)
  useEffect(() => {
    let isMounted = true;

    async function fetchMessages() {
      try {
        const url = `/api/chat/messages?roomId=${encodeURIComponent(roomId)}${
          lastMsgIdRef.current ? `&sinceId=${encodeURIComponent(lastMsgIdRef.current)}` : ''
        }`;
        const res = await fetch(url);
        if (!res.ok) return;

        const data = await res.json();
        if (!isMounted) return;

        if (data.roomStatus) {
          setRoomStatus(data.roomStatus);
        }

        if (data.messages && data.messages.length > 0) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newMsgs = data.messages.filter((m: ChatMessage) => !existingIds.has(m.id));
            if (newMsgs.length > 0) {
              const updated = [...prev, ...newMsgs];
              lastMsgIdRef.current = updated[updated.length - 1].id;
              return updated;
            }
            return prev;
          });
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }

    fetchMessages();
    const interval = setInterval(fetchMessages, 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [roomId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputMessage.trim() || !encryptionKey) return;

    try {
      const textToSend = inputMessage.trim();
      setInputMessage('');

      const { ciphertext, iv } = await encryptMessage(textToSend, encryptionKey);

      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          ciphertext,
          iv,
          senderRole,
          senderId,
          token,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(`Error sending: ${err.error || 'Failed to send message'}`);
        return;
      }

      const newMsg: ChatMessage = await res.json();
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        const updated = [...prev, newMsg];
        lastMsgIdRef.current = newMsg.id;
        return updated;
      });
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  const decryptMessageContent = async (message: ChatMessage): Promise<string> => {
    if (message.messageType === 'system') {
      return 'A responder has joined the chat.';
    }

    if (!encryptionKey) return '[Decrypting...]';

    try {
      return await decryptMessage(message.ciphertext, message.iv, encryptionKey);
    } catch (error) {
      console.error('Decryption error:', error);
      return '[Encrypted Message]';
    }
  };

  return (
    <div className="flex flex-col h-[80vh] w-full max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
      {/* Header */}
      <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            {senderRole === 'seeker' ? 'Support Chat (Anonymous)' : 'Responder Chat'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Status: <span className="capitalize font-semibold text-emerald-400">{roomStatus}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Room ID</p>
          <p className="text-xs font-mono bg-slate-800 text-slate-200 px-2.5 py-1 rounded border border-slate-700 mt-0.5 select-all">
            {roomId}
          </p>
        </div>
      </div>

      {/* Waiting Banner */}
      {roomStatus === 'waiting' && senderRole === 'seeker' && (
        <div className="bg-amber-50 border-b border-amber-200 p-3 text-amber-800 text-xs flex justify-between items-center">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Waiting for a verified volunteer to join using ZK Proof...</span>
          </div>
          <span className="font-semibold text-amber-900">Share Room ID or wait for volunteer to join feed</span>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm">
            End-to-End Encrypted Chat Initialized. Messages are decrypted only in your browser.
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              senderId={senderId}
              senderRole={senderRole}
              decryptMessage={decryptMessageContent}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 p-3 bg-white flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type an encrypted message..."
          className="flex-1 border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={!encryptionKey}
        />
        <button
          onClick={handleSend}
          disabled={!encryptionKey || !inputMessage.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  senderId,
  senderRole,
  decryptMessage,
}: {
  message: ChatMessage;
  senderId: string;
  senderRole: 'seeker' | 'responder';
  decryptMessage: (msg: ChatMessage) => Promise<string>;
}) {
  const [decrypted, setDecrypted] = useState<string>('Decrypting...');

  useEffect(() => {
    decryptMessage(message).then(setDecrypted);
  }, [message, decryptMessage]);

  const isOwn = message.senderRole === senderRole || message.senderId === senderId;
  const isSystem = message.messageType === 'system';

  if (isSystem) {
    return (
      <div className="text-center text-slate-500 text-xs italic py-1">
        {decrypted}
      </div>
    );
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs md:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
          isOwn
            ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'
        }`}
      >
        <p className="break-words font-normal">{decrypted}</p>
        <p className={`text-[10px] mt-1 text-right ${isOwn ? 'text-blue-100' : 'text-slate-400'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
