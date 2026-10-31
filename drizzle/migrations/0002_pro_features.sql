-- Migration 0002: pro_features
-- Adds: avatar_id and is_pro to profiles, daily_battles table + seed, rate limiting helper

-- 1. Profiles additions
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_id text NOT NULL DEFAULT 'rogue',
  ADD COLUMN IF NOT EXISTS is_pro boolean NOT NULL DEFAULT false;

-- Allow authenticated users to update their own avatar_id
GRANT UPDATE (display_name, avatar_id) ON public.profiles TO authenticated;

-- 2. Daily Battles table
CREATE TABLE IF NOT EXISTS public.daily_battles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_date date UNIQUE NOT NULL,
  title text NOT NULL,
  difficulty text NOT NULL DEFAULT 'Easy',
  description text NOT NULL,
  starter_code text NOT NULL,
  solution_check text NOT NULL, -- regex or function signature check
  test_input text NOT NULL,
  expected_output text NOT NULL,
  xp_reward integer NOT NULL DEFAULT 50,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.daily_battles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can view battles" ON public.daily_battles FOR SELECT USING (true);
GRANT SELECT ON public.daily_battles TO authenticated, anon;
GRANT ALL ON public.daily_battles TO service_role;

-- Seed initial rotating challenges (today and next days)
INSERT INTO public.daily_battles (battle_date, title, difficulty, description, starter_code, solution_check, test_input, expected_output, xp_reward)
VALUES 
  (current_date, 'Reverse a String', 'Easy', 'Given a string s, return a new string with characters reversed.', 'def reverse_string(s):\n    # Write your code here\n    pass', 'reverse_string', 'hello', 'olleh', 50),
  (current_date + 1, 'Sum of Even Numbers', 'Easy', 'Given a list of numbers, return the sum of all even numbers.', 'def sum_evens(nums):\n    # Write your code here\n    pass', 'sum_evens', '[1, 2, 3, 4, 5, 6]', '12', 50),
  (current_date + 2, 'Count Vowels', 'Easy', 'Return the count of vowels (a, e, i, o, u) in a string s.', 'def count_vowels(s):\n    # Write your code here\n    pass', 'count_vowels', 'questbound', '4', 50),
  (current_date + 3, 'Find Maximum Element', 'Medium', 'Find the largest integer in a non-empty list without using max().', 'def find_max(nums):\n    # Write your code here\n    pass', 'find_max', '[12, 45, 2, 99, 31]', '99', 60),
  (current_date + 4, 'Palindrome Checker', 'Easy', 'Return True if s reads the same forwards and backwards, else False.', 'def is_palindrome(s):\n    # Write your code here\n    pass', 'is_palindrome', 'racecar', 'True', 50)
ON CONFLICT (battle_date) DO NOTHING;

-- Update leaderboard view to include avatar_id
CREATE OR REPLACE VIEW public.leaderboard AS
  SELECT id, display_name, xp, streak, avatar_id
  FROM public.profiles
  ORDER BY xp DESC
  LIMIT 50;

GRANT SELECT ON public.leaderboard TO authenticated, anon;
