-- Migration 0001: live_data
-- Adds: is_admin column, battle_completions table, award_battle_xp function, leaderboard view

-- ─────────────────────────────────────────────
-- 1. Add is_admin to profiles
-- ─────────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- authenticated users may read is_admin (UPDATE is still restricted to display_name only via 0000)
-- No additional GRANT needed — authenticated already has SELECT on profiles from 0000.

-- ─────────────────────────────────────────────
-- 2. battle_completions — one row per user per UTC day, prevents XP farming
-- ─────────────────────────────────────────────
CREATE TABLE public.battle_completions (
  user_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  battle_date date NOT NULL DEFAULT current_date,
  PRIMARY KEY (user_id, battle_date)
);

ALTER TABLE public.battle_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own battle read"
  ON public.battle_completions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "own battle insert"
  ON public.battle_completions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT ON public.battle_completions TO authenticated;
GRANT ALL            ON public.battle_completions TO service_role;

-- ─────────────────────────────────────────────
-- 3. award_battle_xp() — idempotent, 50 XP per day per user
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.award_battle_xp()
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  p public.profiles;
BEGIN
  -- Must be called by an authenticated user
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  -- Attempt to claim today's battle slot; silently return NULL if already done
  BEGIN
    INSERT INTO public.battle_completions (user_id, battle_date)
    VALUES (auth.uid(), current_date);
  EXCEPTION
    WHEN unique_violation THEN   -- SQLSTATE 23505
      RETURN NULL;
  END;

  -- Award 50 XP and update streak (mirrors award_xp logic)
  UPDATE public.profiles SET
    xp          = xp + 50,
    streak      = CASE
                    WHEN last_active = current_date     THEN streak
                    WHEN last_active = current_date - 1 THEN streak + 1
                    ELSE 1
                  END,
    last_active = current_date
  WHERE id = auth.uid()
  RETURNING * INTO p;

  RETURN p;
END $$;

REVOKE EXECUTE ON FUNCTION public.award_battle_xp() FROM public, anon;
GRANT  EXECUTE ON FUNCTION public.award_battle_xp() TO authenticated;

-- ─────────────────────────────────────────────
-- 4. Public leaderboard view (top 50 by XP)
-- ─────────────────────────────────────────────
CREATE OR REPLACE VIEW public.leaderboard AS
  SELECT id, display_name, xp, streak
  FROM public.profiles
  ORDER BY xp DESC
  LIMIT 50;

GRANT SELECT ON public.leaderboard TO authenticated, anon;
