"use server";

import { createClient } from "@/lib/supabase/server";
import type { Course } from "@/types/database";

export async function getRecommendations(userId: string, limit: number = 4): Promise<Course[]> {
  const supabase = await createClient();

  // Получаем просмотренные курсы пользователя
  const { data: views } = await supabase
    .from("course_views")
    .select("course_id")
    .eq("user_id", userId)
    .order("viewed_at", { ascending: false })
    .limit(10);

  // Получаем записанные курсы пользователя
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("course_id")
    .eq("user_id", userId);

  const viewedCourseIds = (views || []).map((v: { course_id: string }) => v.course_id);
  const enrolledCourseIds = (enrollments || []).map((e: { course_id: string }) => e.course_id);
  const excludedIds = [...new Set([...viewedCourseIds, ...enrolledCourseIds])];

  // Если пользователь просмотрел курсы, рекомендуем похожие по уровню
  let recommendations: Course[] = [];

  if (viewedCourseIds.length > 0) {
    // Получаем уровни просмотренных курсов
    const { data: viewedCourses } = await supabase
      .from("courses")
      .select("level")
      .in("id", Array.from(viewedCourseIds));

    const levels = new Set((viewedCourses || []).map((c: { level: string }) => c.level));

    // Рекомендуем курсы того же уровня, которые пользователь не просматривал
    if (levels.size > 0) {
      const { data } = await supabase
        .from("courses")
        .select("id, title, description, cover_image, level, average_rating, review_count, location_city")
        .in("level", Array.from(levels))
        .order("average_rating", { ascending: false, nullsFirst: false })
        .order("view_count", { ascending: false, nullsFirst: false })
        .limit(limit * 2); // Берем больше, чтобы после фильтрации осталось достаточно

      // Фильтруем исключенные курсы на клиенте
      recommendations = ((data || []) as Course[])
        .filter((c) => !excludedIds.includes(c.id))
        .slice(0, limit);
    }
  }

  // Если недостаточно рекомендаций, добавляем популярные курсы
  if (recommendations.length < limit) {
    const { data } = await supabase
      .from("courses")
      .select("id, title, description, cover_image, level, average_rating, review_count, location_city")
      .order("is_featured", { ascending: false })
      .order("average_rating", { ascending: false, nullsFirst: false })
      .order("view_count", { ascending: false, nullsFirst: false })
      .limit(limit * 2);

    const filtered = excludedIds.length > 0
      ? ((data || []) as Course[]).filter((c) => !excludedIds.includes(c.id))
      : (data || []) as Course[];

    const additional = filtered
      .filter((c) => !recommendations.some((r) => r.id === c.id))
      .slice(0, limit - recommendations.length);

    recommendations = [...recommendations, ...additional];
  }

  return recommendations.slice(0, limit);
}
