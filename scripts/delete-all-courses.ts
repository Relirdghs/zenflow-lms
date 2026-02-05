import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deleteAllCourses() {
  console.log("Начинаем удаление всех курсов...");

  // Получаем все курсы
  const { data: courses, error: coursesError } = await supabase
    .from("courses")
    .select("id");

  if (coursesError) {
    console.error("Ошибка при получении курсов:", coursesError);
    return;
  }

  if (!courses || courses.length === 0) {
    console.log("Нет курсов для удаления.");
    return;
  }

  console.log(`Найдено ${courses.length} курсов для удаления.`);

  // Удаляем связанные данные
  const courseIds = courses.map((c) => c.id);

  // Удаляем enrollments
  const { error: enrollmentsError } = await supabase
    .from("enrollments")
    .delete()
    .in("course_id", courseIds);
  if (enrollmentsError) {
    console.error("Ошибка при удалении enrollments:", enrollmentsError);
  } else {
    console.log("Enrollments удалены.");
  }

  // Удаляем favorites
  const { error: favoritesError } = await supabase
    .from("favorites")
    .delete()
    .in("course_id", courseIds);
  if (favoritesError) {
    console.error("Ошибка при удалении favorites:", favoritesError);
  } else {
    console.log("Favorites удалены.");
  }

  // Удаляем reviews
  const { error: reviewsError } = await supabase
    .from("reviews")
    .delete()
    .in("course_id", courseIds);
  if (reviewsError) {
    console.error("Ошибка при удалении reviews:", reviewsError);
  } else {
    console.log("Reviews удалены.");
  }

  // Удаляем course_views
  const { error: viewsError } = await supabase
    .from("course_views")
    .delete()
    .in("course_id", courseIds);
  if (viewsError) {
    console.error("Ошибка при удалении course_views:", viewsError);
  } else {
    console.log("Course views удалены.");
  }

  // Удаляем course_groups
  const { error: courseGroupsError } = await supabase
    .from("course_groups")
    .delete()
    .in("course_id", courseIds);
  if (courseGroupsError) {
    console.error("Ошибка при удалении course_groups:", courseGroupsError);
  } else {
    console.log("Course groups удалены.");
  }

  // Удаляем lessons (каскадно удалят lesson_blocks)
  const { error: lessonsError } = await supabase
    .from("lessons")
    .delete()
    .in("course_id", courseIds);
  if (lessonsError) {
    console.error("Ошибка при удалении lessons:", lessonsError);
  } else {
    console.log("Lessons удалены.");
  }

  // Удаляем курсы
  const { error: coursesDeleteError } = await supabase
    .from("courses")
    .delete()
    .in("id", courseIds);

  if (coursesDeleteError) {
    console.error("Ошибка при удалении курсов:", coursesDeleteError);
  } else {
    console.log(`✅ Успешно удалено ${courses.length} курсов и все связанные данные.`);
  }
}

deleteAllCourses()
  .then(() => {
    console.log("Готово!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Критическая ошибка:", error);
    process.exit(1);
  });
