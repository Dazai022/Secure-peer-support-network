-- Supabase SQL Schema for Secure Peer Support Network

-- Create Chat Rooms Table
CREATE TABLE IF NOT EXISTS chat_rooms (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'waiting', -- 'waiting', 'active', 'closed'
  seeker_session_id TEXT NOT NULL,
  volunteer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  chat_room_id TEXT NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL,
  sender_role TEXT NOT NULL, -- 'seeker', 'responder'
  ciphertext TEXT NOT NULL,
  iv TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text', -- 'text', 'system'
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Nonces Table for ZK Proof Challenges
CREATE TABLE IF NOT EXISTS challenge_nonces (
  nonce TEXT PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  consumed BOOLEAN DEFAULT FALSE
);

-- Index for fast message polling
CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON chat_messages(chat_room_id, timestamp);
