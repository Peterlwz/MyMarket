import type { Session, User } from "@supabase/supabase-js";

import { assertSupabaseConfigured, supabase } from "@/lib/supabase";

export type AuthResult = {
  session: Session | null;
  user: User | null;
};

async function upsertProfile(user: User) {
  const displayName = user.email?.split("@")[0] ?? "Nest Market 用户";

  const { error } = await supabase.from("profiles").upsert({
    display_name: displayName,
    id: user.id
  });

  if (error) {
    console.error("Failed to upsert Supabase profile", error);
  }
}

export async function getSession(): Promise<AuthResult> {
  assertSupabaseConfigured();

  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error("Failed to get Supabase session", error);
    throw error;
  }

  return {
    session: data.session,
    user: data.session?.user ?? null
  };
}

export function onAuthStateChange(callback: (result: AuthResult) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback({
      session,
      user: session?.user ?? null
    });
  });
}

export async function signUp(email: string, password: string): Promise<AuthResult> {
  assertSupabaseConfigured();

  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    console.error("Supabase sign up failed", error);
    throw error;
  }

  if (data.user) {
    await upsertProfile(data.user);
  }

  return {
    session: data.session,
    user: data.user
  };
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  assertSupabaseConfigured();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    console.error("Supabase sign in failed", error);
    throw error;
  }

  if (data.user) {
    await upsertProfile(data.user);
  }

  return {
    session: data.session,
    user: data.user
  };
}

export async function signOut() {
  assertSupabaseConfigured();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Supabase sign out failed", error);
    throw error;
  }
}
