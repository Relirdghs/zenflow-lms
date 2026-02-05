"use server";

import { createClient } from "@/lib/supabase/server";
import type { Review } from "@/types/database";

export async function createReview(
  userId: string,
  courseId: string,
  rating: number,
  comment?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Проверяем, есть ли уже отзыв от этого пользователя
  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .single();

  if (existing) {
    // Обновляем существующий отзыв
    const { error } = await supabase
      .from("reviews")
      .update({
        rating,
        comment: comment || null,
        is_moderated: false, // Требуется повторная модерация
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (error) {
      return { success: false, error: error.message };
    }
  } else {
    // Создаем новый отзыв
    const { error } = await supabase
      .from("reviews")
      .insert({
        user_id: userId,
        course_id: courseId,
        rating,
        comment: comment || null,
        is_moderated: false,
      });

    if (error) {
      return { success: false, error: error.message };
    }
  }

  return { success: true };
}

export async function getCourseReviews(courseId: string, includeUnmoderated: boolean = false) {
  const supabase = await createClient();

  let query = supabase
    .from("reviews")
    .select(`
      id,
      user_id,
      course_id,
      rating,
      comment,
      is_moderated,
      created_at,
      updated_at,
      profiles (
        id,
        full_name,
        email
      )
    `)
    .eq("course_id", courseId)
    .order("created_at", { ascending: false });

  if (!includeUnmoderated) {
    query = query.eq("is_moderated", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }

  // Преобразуем данные: profiles может быть массивом или объектом в зависимости от Supabase версии
  return (data || []).map((review: any) => ({
    ...review,
    profiles: Array.isArray(review.profiles) 
      ? review.profiles[0] 
      : review.profiles,
  })) as (Review & { profiles?: { full_name: string | null; email: string | null } })[];
}

export async function moderateReview(reviewId: string, approve: boolean) {
  const supabase = await createClient();

  if (approve) {
    const { error } = await supabase
      .from("reviews")
      .update({ is_moderated: true, updated_at: new Date().toISOString() })
      .eq("id", reviewId);

    if (error) {
      return { success: false, error: error.message };
    }
  } else {
    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId);

    if (error) {
      return { success: false, error: error.message };
    }
  }

  return { success: true };
}
