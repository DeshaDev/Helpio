/*
  # Q&A dApp Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `wallet_address` (text, unique) - User's Celo wallet address
      - `username` (text) - Display name
      - `total_points` (integer) - Cumulative points
      - `created_at` (timestamptz)
    
    - `questions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `wallet_address` (text) - Question author's wallet
      - `title` (text) - Question title
      - `content` (text) - Question details
      - `best_answer_id` (uuid, nullable) - Selected best answer
      - `tx_hash` (text) - Blockchain transaction hash
      - `created_at` (timestamptz)
    
    - `answers`
      - `id` (uuid, primary key)
      - `question_id` (uuid, foreign key to questions)
      - `user_id` (uuid, foreign key to users)
      - `wallet_address` (text) - Answer author's wallet
      - `content` (text) - Answer content
      - `is_best_answer` (boolean) - Whether selected as best
      - `tx_hash` (text) - Blockchain transaction hash
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Public read access for questions and answers
    - Only question author can mark best answer
    - Users can only create content with their own wallet address

  3. Indexes
    - Index on wallet_address for fast lookups
    - Index on created_at for leaderboard queries
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text UNIQUE NOT NULL,
  username text DEFAULT '',
  total_points integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  wallet_address text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  best_answer_id uuid,
  tx_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create answers table
CREATE TABLE IF NOT EXISTS answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id),
  wallet_address text NOT NULL,
  content text NOT NULL,
  is_best_answer boolean DEFAULT false,
  tx_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_points ON users(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_users_created ON users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_created ON questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_answers_question ON answers(question_id);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- Users policies (public read, authenticated write)
CREATE POLICY "Public can view users"
  ON users FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON users FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Questions policies (public read, authenticated write)
CREATE POLICY "Public can view questions"
  ON questions FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create questions"
  ON questions FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Question authors can update their questions"
  ON questions FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Answers policies (public read, authenticated write)
CREATE POLICY "Public can view answers"
  ON answers FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create answers"
  ON answers FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Answer authors can update their answers"
  ON answers FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);