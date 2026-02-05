"use server";

import { createClient } from "@/lib/supabase/server";

export async function toggleFavorite(userId: string, courseId: string): Promise<boolean> {
  const supabase = await createClient();

  // Проверяем, есть ли уже в избранном
  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .single();

  if (existing) {
    // Удаляем из избранного
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .eq("course_id", courseId);

    return !error;
  } else {
    // Добавляем в избранное
    const { error } = await supabase
      .from("favorites")
      .insert({ user_id: userId, course_id: courseId });

    return !error;
  }
}

export async function isFavorite(userId: string, courseId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .single();

  return !!data;
}

export async function getUserFavorites(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("favorites")
    .select(`
      id,
      course_id,
      created_at,
      courses (
        id,
        title,
        description,
        cover_image,
        level,
        average_rating,
        review_count
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching favorites:", error);
    return [];
  }

  return data || [];
}
