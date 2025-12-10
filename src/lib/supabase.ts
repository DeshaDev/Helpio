import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface User {
  id: string;
  wallet_address: string;
  username: string;
  total_points: number;
  created_at: string;
}

export interface Question {
  id: string;
  user_id: string;
  wallet_address: string;
  title: string;
  content: string;
  category: string;
  best_answer_id: string | null;
  tx_hash: string;
  created_at: string;
  users?: User;
}

export interface Answer {
  id: string;
  question_id: string;
  user_id: string;
  wallet_address: string;
  content: string;
  is_best_answer: boolean;
  tx_hash: string;
  created_at: string;
  users?: User;
}
