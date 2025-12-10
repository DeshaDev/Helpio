/*
  # Create funded wallets tracking table

  1. New Tables
    - `funded_wallets`
      - `id` (uuid, primary key)
      - `wallet_address` (text, unique, lowercase) - The funded wallet address
      - `transaction_hash` (text) - The funding transaction hash
      - `amount` (text) - Amount funded (e.g., "0.12")
      - `funded_at` (timestamptz) - When the wallet was funded
      - `ip_address` (text, optional) - For additional fraud prevention
      
  2. Security
    - Enable RLS on `funded_wallets` table
    - Add policy for public read access (to check if wallet was funded)
    - Add policy for service role only insert (only backend can add records)
    
  3. Indexes
    - Add index on wallet_address for fast lookups
*/

CREATE TABLE IF NOT EXISTS funded_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text UNIQUE NOT NULL,
  transaction_hash text NOT NULL,
  amount text DEFAULT '0.12',
  funded_at timestamptz DEFAULT now(),
  ip_address text
);

-- Create index for fast wallet lookup
CREATE INDEX IF NOT EXISTS idx_funded_wallets_address ON funded_wallets(wallet_address);

-- Enable RLS
ALTER TABLE funded_wallets ENABLE ROW LEVEL SECURITY;

-- Allow anyone to check if a wallet was funded (read-only)
CREATE POLICY "Anyone can check funded wallets"
  ON funded_wallets FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only service role can insert new funded wallet records
CREATE POLICY "Service role can insert funded wallets"
  ON funded_wallets FOR INSERT
  TO service_role
  WITH CHECK (true);