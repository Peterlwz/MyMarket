import { assertSupabaseConfigured, supabase } from "@/lib/supabase";

async function getCurrentUserId() {
  assertSupabaseConfigured();

  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error("Failed to read Supabase session for favorites", error);
    throw error;
  }

  return data.session?.user.id ?? null;
}

export async function getFavoriteIds() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from("favorites")
    .select("listing_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load Supabase favorites", error);
    throw new Error("加载失败，请稍后再试");
  }

  return (data ?? []).flatMap((item) => (typeof item.listing_id === "string" ? [item.listing_id] : []));
}

export async function toggleFavorite(id: string) {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error("登录后才能收藏");
  }

  const { data: existingFavorite, error: findError } = await supabase
    .from("favorites")
    .select("listing_id")
    .eq("user_id", userId)
    .eq("listing_id", id)
    .maybeSingle();

  if (findError) {
    console.error("Failed to check Supabase favorite", findError);
    throw new Error("操作失败，请稍后再试");
  }

  if (existingFavorite) {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .eq("listing_id", id);

    if (error) {
      console.error("Failed to remove Supabase favorite", error);
      throw new Error("操作失败，请稍后再试");
    }
  } else {
    const { error } = await supabase.from("favorites").insert({
      listing_id: id,
      user_id: userId
    });

    if (error) {
      console.error("Failed to insert Supabase favorite", error);
      throw new Error("操作失败，请稍后再试");
    }
  }

  return getFavoriteIds();
}

export async function removeFavorite(id: string) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return [];
  }

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", userId)
    .eq("listing_id", id);

  if (error) {
    console.error("Failed to remove Supabase favorite", error);
    throw new Error("操作失败，请稍后再试");
  }

  return getFavoriteIds();
}
