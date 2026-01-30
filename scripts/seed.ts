/**
 * ZenFlow seed: 4 courses × 4 lessons with rich lesson_blocks.
 * Run: npx tsx scripts/seed.ts
 * Requires: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY for bypass RLS).
 */

import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

// Загрузить переменные из .env.local
config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Ошибка: Переменные окружения не найдены!");
  console.error("");
  console.error("Убедитесь, что файл .env.local существует и содержит:");
  console.error("  NEXT_PUBLIC_SUPABASE_URL=ваш-url");
  console.error("  NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш-ключ");
  console.error("  (или SUPABASE_SERVICE_ROLE_KEY=ваш-service-ключ)");
  console.error("");
  console.error("Текущие значения:");
  console.error(`  NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? "✅ установлен" : "❌ не найден"}`);
  console.error(`  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ установлен" : "❌ не найден"}`);
  console.error(`  SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ установлен" : "❌ не найден"}`);
  process.exit(1);
}

console.log("✅ Переменные окружения загружены");
console.log(`   URL: ${supabaseUrl.substring(0, 30)}...`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function getCreatorId(): Promise<string | null> {
  const { data } = await supabase.from("profiles").select("id").limit(1).maybeSingle();
  return data?.id ?? null;
}

async function seed() {
  console.log("🔍 Поиск профиля для создания курсов...");
  const creatorId = await getCreatorId();
  if (!creatorId) {
    console.log("");
    console.log("❌ Профиль не найден!");
    console.log("");
    console.log("Действия:");
    console.log("  1. Запустите приложение: npm run dev");
    console.log("  2. Зарегистрируйтесь через форму Sign up");
    console.log("  3. Запустите seed снова: npm run seed");
    process.exit(0);
  }
  console.log(`✅ Найден профиль: ${creatorId.substring(0, 8)}...`);
  console.log("");

  const courses = [
    {
      title: "Yoga for Beginners",
      description:
        "Gentle introduction to yoga: breathing, basic poses, and relaxation. Perfect for your first steps on the mat.",
      level: "beginner" as const,
    },
    {
      title: "Morning Energy",
      description:
        "Start your day with flow and intention. Short sequences to wake up body and mind.",
      level: "beginner" as const,
    },
    {
      title: "Flexibility",
      description:
        "Deep stretches and mobility work to improve range of motion and release tension.",
      level: "intermediate" as const,
    },
    {
      title: "Anti-stress",
      description:
        "Calming practices: restorative poses, breathing, and mindfulness to reduce stress.",
      level: "intermediate" as const,
    },
  ];

  for (const course of courses) {
    const { data: courseRow, error: courseErr } = await supabase
      .from("courses")
      .insert({ ...course, created_by: creatorId })
      .select("id")
      .single();
    if (courseErr) {
      console.error("Course insert error:", courseErr);
      continue;
    }
    const courseId = courseRow!.id;

    const lessonTitles = [
      ["Welcome & Breathing", "Standing Poses", "Floor Basics", "Relaxation"],
      ["Wake Up Flow", "Sun Salutation Lite", "Balance & Focus", "Cool Down"],
      ["Hips & Hamstrings", "Back & Spine", "Full Body Stretch", "Deep Release"],
      ["Breath Work", "Restorative Poses", "Mindfulness", "Savasana"],
    ];
    const titles = lessonTitles[courses.indexOf(course)] ?? lessonTitles[0];

    for (let i = 0; i < 4; i++) {
      const { data: lessonRow, error: lessonErr } = await supabase
        .from("lessons")
        .insert({
          course_id: courseId,
          title: titles[i] ?? `Lesson ${i + 1}`,
          order_index: i,
          duration_minutes: 10 + i * 2,
        })
        .select("id")
        .single();
      if (lessonErr) {
        console.error("Lesson insert error:", lessonErr);
        continue;
      }
      const lessonId = lessonRow!.id;

      const blocks: { type: string; content: Record<string, unknown>; order_index: number }[] = [
        {
          type: "text",
          content: {
            body: `## ${titles[i]}\n\nThis lesson is part of **${course.title}**. Take your time and breathe.`,
            variant: "paragraph",
          },
          order_index: 0,
        },
        {
          type: "video",
          content: {
            url: "https://www.youtube.com/watch?v=4Bk4af6tOYo",
            caption: "Guided practice",
          },
          order_index: 1,
        },
        {
          type: "timer",
          content: { duration_seconds: 60, label: "Hold pose" },
          order_index: 2,
        },
      ];
      if (i === 1) {
        blocks.push({
          type: "quiz",
          content: {
            question: "What is the main benefit of breathing slowly?",
            options: [
              { id: "a", text: "Calms the nervous system", correct: true },
              { id: "b", text: "Increases heart rate", correct: false },
            ],
            explanation: "Slow breathing activates the parasympathetic nervous system.",
          },
          order_index: 3,
        });
      }
      if (i === 2) {
        blocks.push({
          type: "checklist",
          content: {
            title: "Today's routine",
            items: [
              { id: "1", text: "Warm up", checked: false },
              { id: "2", text: "Main poses", checked: false },
              { id: "3", text: "Cool down", checked: false },
            ],
          },
          order_index: 3,
        });
      }

      for (let j = 0; j < blocks.length; j++) {
        await supabase.from("lesson_blocks").insert({
          lesson_id: lessonId,
          type: blocks[j].type,
          content: blocks[j].content,
          order_index: blocks[j].order_index,
        });
      }
    }
    console.log(`✅ Создан курс: ${course.title}`);
  }

  console.log("");
  console.log("🎉 Seed завершен успешно!");
  console.log("   Создано: 4 курса × 4 урока с блоками контента");
  console.log("");
}

seed().catch((e) => {
  console.error("");
  console.error("❌ Ошибка при выполнении seed:");
  console.error(e);
  console.error("");
  process.exit(1);
});
