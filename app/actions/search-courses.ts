"use server";

import { createClient } from "@/lib/supabase/server";
import type { Course } from "@/types/database";

export async function searchCourses(query: string, filters?: {
  level?: string;
  minRating?: number;
  location?: string;
}): Promise<Course[]> {
  const supabase = await createClient();
  
  let queryBuilder = supabase
    .from("courses")
    .select("id, title, description, cover_image, level, average_rating, review_count, location_city")
    .order("title");

  // Поиск по названию
  if (query.trim().length > 0) {
    queryBuilder = queryBuilder.ilike("title", `%${query.trim()}%`);
  }

  // Фильтр по уровню
  if (filters?.level) {
    queryBuilder = queryBuilder.eq("level", filters.level);
  }

  // Фильтр по рейтингу
  if (filters?.minRating !== undefined) {
    queryBuilder = queryBuilder.gte("average_rating", filters.minRating);
  }

  // Фильтр по локации (район Алматы) - поиск по частичному совпадению
  if (filters?.location) {
    queryBuilder = queryBuilder.ilike("location_city", `%${filters.location}%`);
  }

  const { data, error } = await queryBuilder.limit(20);

  if (error) {
    console.error("Error searching courses:", error);
    return [];
  }

  return (data || []) as Course[];
}
