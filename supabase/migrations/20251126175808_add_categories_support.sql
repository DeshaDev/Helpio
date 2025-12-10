/*
  # Add Categories Support

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique) - Category name
      - `slug` (text, unique) - URL-friendly category identifier
      - `icon` (text) - Icon name for UI
      - `description` (text) - Category description
      - `color` (text) - Color theme for category
      - `created_at` (timestamptz)
  
  2. Changes
    - Add `category_id` to `questions` table
    - Add foreign key constraint
    - Add category to indexes

  3. Security
    - Enable RLS on categories table
    - Public read access for categories
    - Only admin can create/update categories (for now, allowing public)

  4. Seed Data
    - Add default categories: Sports, Local, Science, Blockchain, Technology, Health
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  icon text NOT NULL,
  description text DEFAULT '',
  color text DEFAULT '#10b981',
  created_at timestamptz DEFAULT now()
);

-- Add category_id to questions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'questions' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE questions ADD COLUMN category_id uuid REFERENCES categories(id);
  END IF;
END $$;

-- Add category column for direct storage (denormalized for performance)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'questions' AND column_name = 'category'
  ) THEN
    ALTER TABLE questions ADD COLUMN category text DEFAULT 'general';
  END IF;
END $$;

-- Create index on category
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);

-- Enable RLS on categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Categories policies (public read, authenticated write)
CREATE POLICY "Public can view categories"
  ON categories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create categories"
  ON categories FOR INSERT
  TO public
  WITH CHECK (true);

-- Insert default categories
INSERT INTO categories (name, slug, icon, description, color) VALUES
  ('Sports', 'sports', 'Trophy', 'Questions about sports, athletics, and fitness', '#f97316'),
  ('Local', 'local', 'MapPin', 'Local community questions and neighborhood topics', '#8b5cf6'),
  ('Science', 'science', 'Microscope', 'Scientific questions and research discussions', '#3b82f6'),
  ('Blockchain', 'blockchain', 'Link', 'Cryptocurrency, DeFi, and blockchain technology', '#10b981'),
  ('Technology', 'technology', 'Laptop', 'Software, hardware, and tech discussions', '#06b6d4'),
  ('Health', 'health', 'Heart', 'Health, wellness, and medical questions', '#ec4899'),
  ('Business', 'business', 'Briefcase', 'Business, entrepreneurship, and finance', '#f59e0b'),
  ('Education', 'education', 'GraduationCap', 'Learning, education, and academic topics', '#14b8a6'),
  ('Entertainment', 'entertainment', 'Film', 'Movies, music, games, and entertainment', '#a855f7'),
  ('General', 'general', 'MessageCircle', 'General questions and discussions', '#6b7280')
ON CONFLICT (slug) DO NOTHING;