import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Ctx = { user: User | null; profile: Profile | null; loading: boolean; refresh: () => Promise<void> };
const AuthCtx = createContext<Ctx>({ user: null, profile: null, loading: true, refresh: async () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (u: User | null) => {
    setUser(u);
    if (u) {
      const { data } = await supabase.from("profiles").select("*").eq("id", u.id).maybeSingle();
      setProfile(data);
    } else setProfile(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "TOKEN_REFRESHED") return;
      setTimeout(() => load(session?.user ?? null), 0);
    });
    supabase.auth.getUser().then(({ data }) => load(data.user));
    return () => sub.subscription.unsubscribe();
  }, [load]);

  const refresh = useCallback(async () => load(user), [load, user]);
  return <AuthCtx.Provider value={{ user, profile, loading, refresh }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);

/** Award XP for a completed activity (idempotent per lesson id). */
export async function completeLesson(lessonId: string, xp: number) {
  const { error } = await supabase.from("lesson_progress").insert({ lesson_id: lessonId, user_id: (await supabase.auth.getUser()).data.user!.id });
  if (error && error.code === "23505") return false; // already done
  if (error) throw error;
  await supabase.rpc("award_xp", { _amount: xp });
  return true;
}
