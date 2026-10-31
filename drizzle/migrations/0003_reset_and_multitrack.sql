-- ==========================================================
-- Migration 0003: reset_and_multitrack
-- Completely cleans all existing data to 0 and adds:
-- - track column to lesson_progress
-- - user_streaks / streak freeze support
-- - password resets support
-- ==========================================================

-- 1. Clean slate: Reset all tables to 0
TRUNCATE TABLE public.battle_completions CASCADE;
TRUNCATE TABLE public.exam_results CASCADE;
TRUNCATE TABLE public.lesson_progress CASCADE;
TRUNCATE TABLE public.daily_battles CASCADE;

-- Reset all existing user profiles to 0 XP and streak 0, and default avatar
UPDATE public.profiles
SET xp = 0,
    streak = 0,
    last_active = NULL,
    avatar_id = 'rogue',
    is_pro = false;

-- 2. Add streak_freezes to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS streak_freezes integer NOT NULL DEFAULT 1;

-- 3. Add track column to lesson_progress to support multi-language courses
ALTER TABLE public.lesson_progress
  ADD COLUMN IF NOT EXISTS track text NOT NULL DEFAULT 'python';

-- 4. Re-seed clean daily battles with varied curriculum
INSERT INTO public.daily_battles (battle_date, title, difficulty, description, starter_code, solution_check, test_input, expected_output, xp_reward)
VALUES 
  (current_date, 'Reverse a String', 'Easy', 'Given a string s, return a new string with characters reversed.', 'def reverse_string(s):\n    # Write your code here\n    pass\n\nprint(reverse_string("hello"))\n', 'reverse_string', 'hello', 'olleh', 50),
  (current_date + 1, 'Sum of Even Numbers', 'Easy', 'Given a list of numbers, return the sum of all even numbers.', 'def sum_evens(nums):\n    # Write your code here\n    pass\n\nprint(sum_evens([1, 2, 3, 4, 5, 6]))\n', 'sum_evens', '[1, 2, 3, 4, 5, 6]', '12', 50),
  (current_date + 2, 'Count Vowels', 'Easy', 'Return the count of vowels (a, e, i, o, u) in a string s.', 'def count_vowels(s):\n    # Write your code here\n    pass\n\nprint(count_vowels("questbound"))\n', 'count_vowels', 'questbound', '4', 50),
  (current_date + 3, 'Find Maximum Element', 'Medium', 'Find the largest integer in a non-empty list without using max().', 'def find_max(nums):\n    # Write your code here\n    pass\n\nprint(find_max([12, 45, 2, 99, 31]))\n', 'find_max', '[12, 45, 2, 99, 31]', '99', 60),
  (current_date + 4, 'Palindrome Checker', 'Easy', 'Return True if s reads the same forwards and backwards, else False.', 'def is_palindrome(s):\n    # Write your code here\n    pass\n\nprint(is_palindrome("racecar"))\n', 'is_palindrome', 'racecar', 'True', 50)
ON CONFLICT (battle_date) DO UPDATE
SET title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    description = EXCLUDED.description,
    starter_code = EXCLUDED.starter_code,
    solution_check = EXCLUDED.solution_check,
    test_input = EXCLUDED.test_input,
    expected_output = EXCLUDED.expected_output,
    xp_reward = EXCLUDED.xp_reward;
