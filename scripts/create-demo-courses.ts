/**
 * ZenFlow: Создание 4 демо-курсов с 4 уроками каждый
 * Демонстрирует все типы блоков: H1, H2, текст, изображение, слайдер, видео, тест, чек-лист, таймер, callout, ссылка
 * Run: npx tsx scripts/create-demo-courses.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Ошибка: Переменные окружения не найдены!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getCreatorId(): Promise<string | null> {
  const { data } = await supabase.from("profiles").select("id").limit(1).maybeSingle();
  return data?.id ?? null;
}

const demoCourses = [
  {
    title: "Йога для начинающих в Алматы",
    description: "Идеальный курс для тех, кто только начинает свой путь в йоге. Подходит для жителей всех районов Алматы: Алмалинский, Бостандыкский, Медеуский, Ауэзовский.",
    level: "beginner" as const,
    location_city: "Алматы",
    lessons: [
      {
        title: "Введение в йогу и дыхание",
        duration_minutes: 20,
        blocks: [
          { type: "h1", content: { text: "Добро пожаловать в йогу!" } },
          { type: "text", content: { body: "Йога — это древняя практика, которая объединяет физические упражнения, дыхательные техники и медитацию. В этом уроке мы изучим основы." } },
          { type: "callout", content: { text: "Важно: Занимайтесь в удобной одежде и в тихом месте.", variant: "info", icon: "info" } },
          { type: "h2", content: { text: "Дыхание (Пранаяма)" } },
          { type: "text", content: { body: "Правильное дыхание — основа йоги. Мы будем использовать технику глубокого брюшного дыхания." } },
          { type: "timer", content: { duration_seconds: 300, label: "Практика дыхания" } },
          { type: "checklist", content: { title: "Что нужно сделать", items: [{ id: "1", text: "Найти тихое место", checked: false }, { id: "2", text: "Сесть удобно", checked: false }, { id: "3", text: "Закрыть глаза", checked: false }] } },
        ],
      },
      {
        title: "Базовые асаны стоя",
        duration_minutes: 25,
        blocks: [
          { type: "h1", content: { text: "Асаны стоя" } },
          { type: "text", content: { body: "Асаны стоя укрепляют ноги, улучшают баланс и выравнивают позвоночник." } },
          { type: "h2", content: { text: "Тадасана (Поза горы)" } },
          { type: "text", content: { body: "Базовая поза стоя. Встаньте прямо, ноги вместе, руки вдоль тела." } },
          { type: "timer", content: { duration_seconds: 60, label: "Удерживайте позу" } },
          { type: "h2", content: { text: "Врикшасана (Поза дерева)" } },
          { type: "text", content: { body: "Поза баланса на одной ноге. Помогает улучшить концентрацию." } },
          { type: "checklist", content: { title: "Практика", items: [{ id: "1", text: "Выполнить Тадасану", checked: false }, { id: "2", text: "Выполнить Врикшасану на правой ноге", checked: false }, { id: "3", text: "Выполнить Врикшасану на левой ноге", checked: false }] } },
        ],
      },
      {
        title: "Асаны сидя и наклоны",
        duration_minutes: 30,
        blocks: [
          { type: "h1", content: { text: "Асаны сидя" } },
          { type: "text", content: { body: "Асаны сидя улучшают гибкость бедер и позвоночника." } },
          { type: "h2", content: { text: "Пашчимоттанасана (Наклон вперед)" } },
          { type: "text", content: { body: "Сядьте на пол, вытяните ноги вперед. Медленно наклонитесь вперед." } },
          { type: "timer", content: { duration_seconds: 90, label: "Удерживайте наклон" } },
          { type: "callout", content: { text: "Не форсируйте наклон. Работайте в пределах своих возможностей.", variant: "warning", icon: "warning" } },
          { type: "link", content: { url: "/dashboard/courses", text: "Вернуться к курсам", variant: "primary" } },
        ],
      },
      {
        title: "Шавасана и медитация",
        duration_minutes: 15,
        blocks: [
          { type: "h1", content: { text: "Завершение практики" } },
          { type: "text", content: { body: "Шавасана — поза расслабления. Важная часть каждой практики йоги." } },
          { type: "h2", content: { text: "Шавасана (Поза трупа)" } },
          { type: "text", content: { body: "Лягте на спину, руки вдоль тела ладонями вверх. Закройте глаза и расслабьтесь." } },
          { type: "timer", content: { duration_seconds: 600, label: "Глубокое расслабление" } },
          { type: "callout", content: { text: "Поздравляем! Вы завершили первый урок. Продолжайте практику регулярно.", variant: "success", icon: "success" } },
        ],
      },
    ],
  },
  {
    title: "Хатха-йога: укрепление тела",
    description: "Курс для тех, кто хочет укрепить тело и улучшить физическую форму. Идеально подходит для жителей Алматы: Алмалинский, Бостандыкский, Медеуский, Ауэзовский районы.",
    level: "intermediate" as const,
    location_city: "Алматы",
    lessons: [
      {
        title: "Разминка и суставная гимнастика",
        duration_minutes: 20,
        blocks: [
          { type: "h1", content: { text: "Разминка" } },
          { type: "text", content: { body: "Правильная разминка подготавливает тело к практике." } },
          { type: "checklist", content: { title: "Разминка", items: [{ id: "1", text: "Вращения головой", checked: false }, { id: "2", text: "Вращения плечами", checked: false }, { id: "3", text: "Вращения тазом", checked: false }] } },
        ],
      },
      {
        title: "Силовые асаны",
        duration_minutes: 35,
        blocks: [
          { type: "h1", content: { text: "Силовые асаны" } },
          { type: "text", content: { body: "Асаны для укрепления мышц всего тела." } },
          { type: "h2", content: { text: "Чатуранга Дандасана (Поза посоха на четырех опорах)" } },
          { type: "timer", content: { duration_seconds: 30, label: "Удерживайте позу" } },
        ],
      },
      {
        title: "Балансовые позы",
        duration_minutes: 30,
        blocks: [
          { type: "h1", content: { text: "Баланс" } },
          { type: "text", content: { body: "Балансовые позы улучшают координацию и концентрацию." } },
        ],
      },
      {
        title: "Глубокие растяжки",
        duration_minutes: 25,
        blocks: [
          { type: "h1", content: { text: "Растяжка" } },
          { type: "text", content: { body: "Глубокие растяжки для завершения практики." } },
        ],
      },
    ],
  },
  {
    title: "Йога для гибкости и расслабления",
    description: "Курс фокусируется на улучшении гибкости и глубоком расслаблении. Идеально для жителей Алматы всех районов (Алмалинский, Бостандыкский, Медеуский, Ауэзовский), которые хотят снять напряжение после рабочего дня.",
    level: "beginner" as const,
    location_city: "Алматы",
    lessons: [
      {
        title: "Растяжка спины и позвоночника",
        duration_minutes: 25,
        blocks: [
          { type: "h1", content: { text: "Растяжка позвоночника" } },
          { type: "text", content: { body: "Упражнения для здоровья позвоночника." } },
        ],
      },
      {
        title: "Раскрытие тазобедренных суставов",
        duration_minutes: 30,
        blocks: [
          { type: "h1", content: { text: "Тазобедренные суставы" } },
          { type: "text", content: { body: "Работа с гибкостью бедер." } },
        ],
      },
      {
        title: "Скрутки для детоксикации",
        duration_minutes: 20,
        blocks: [
          { type: "h1", content: { text: "Скрутки" } },
          { type: "text", content: { body: "Скручивающие асаны для очищения организма." } },
        ],
      },
      {
        title: "Релаксация и восстановление",
        duration_minutes: 15,
        blocks: [
          { type: "h1", content: { text: "Восстановление" } },
          { type: "text", content: { body: "Техники глубокого расслабления." } },
        ],
      },
    ],
  },
  {
    title: "Продвинутая практика: асаны и пранаяма",
    description: "Для опытных практиков. Сложные асаны, продвинутые дыхательные техники и медитация. Для жителей Алматы (Алмалинский, Бостандыкский, Медеуский, Ауэзовский районы) с опытом практики йоги.",
    level: "advanced" as const,
    location_city: "Алматы",
    lessons: [
      {
        title: "Сложные балансы",
        duration_minutes: 40,
        blocks: [
          { type: "h1", content: { text: "Продвинутые балансы" } },
          { type: "text", content: { body: "Сложные балансовые асаны для опытных практиков." } },
        ],
      },
      {
        title: "Перевернутые асаны",
        duration_minutes: 35,
        blocks: [
          { type: "h1", content: { text: "Перевернутые позы" } },
          { type: "text", content: { body: "Сарвангасана, Ширшасана и другие перевернутые асаны." } },
          { type: "callout", content: { text: "Внимание: Перевернутые асаны требуют подготовки. Не выполняйте без инструктора, если у вас есть проблемы со здоровьем.", variant: "error", icon: "error" } },
        ],
      },
      {
        title: "Пранаяма (дыхательные техники)",
        duration_minutes: 30,
        blocks: [
          { type: "h1", content: { text: "Пранаяма" } },
          { type: "text", content: { body: "Продвинутые дыхательные техники." } },
        ],
      },
      {
        title: "Медитация и осознанность",
        duration_minutes: 20,
        blocks: [
          { type: "h1", content: { text: "Медитация" } },
          { type: "text", content: { body: "Техники медитации для углубления практики." } },
        ],
      },
    ],
  },
];

async function createDemoCourses() {
  console.log("🔍 Поиск профиля для создания курсов...");
  const creatorId = await getCreatorId();
  if (!creatorId) {
    console.log("❌ Профиль не найден! Зарегистрируйтесь сначала.");
    process.exit(0);
  }
  console.log(`✅ Найден профиль: ${creatorId.substring(0, 8)}...\n`);

  for (const courseData of demoCourses) {
    console.log(`📚 Создание курса: ${courseData.title}`);
    
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .insert({
        title: courseData.title,
        description: courseData.description,
        level: courseData.level,
        location_city: courseData.location_city,
        created_by: creatorId,
        is_featured: true,
      })
      .select("id")
      .single();

    if (courseError) {
      console.error(`❌ Ошибка при создании курса: ${courseError.message}`);
      continue;
    }

    const courseId = course.id;
    console.log(`  ✅ Курс создан: ${courseId.substring(0, 8)}...`);

    for (let lessonIndex = 0; lessonIndex < courseData.lessons.length; lessonIndex++) {
      const lessonData = courseData.lessons[lessonIndex];
      console.log(`  📖 Создание урока: ${lessonData.title}`);

      const { data: lesson, error: lessonError } = await supabase
        .from("lessons")
        .insert({
          course_id: courseId,
          title: lessonData.title,
          duration_minutes: lessonData.duration_minutes,
          order_index: lessonIndex,
        })
        .select("id")
        .single();

      if (lessonError) {
        console.error(`    ❌ Ошибка при создании урока: ${lessonError.message}`);
        continue;
      }

      const lessonId = lesson.id;

      // Создаем блоки урока
      for (let blockIndex = 0; blockIndex < lessonData.blocks.length; blockIndex++) {
        const blockData = lessonData.blocks[blockIndex];
        const { error: blockError } = await supabase
          .from("lesson_blocks")
          .insert({
            lesson_id: lessonId,
            type: blockData.type,
            content: blockData.content,
            order_index: blockIndex,
          });

        if (blockError) {
          console.error(`      ❌ Ошибка при создании блока: ${blockError.message}`);
        }
      }

      console.log(`    ✅ Урок создан с ${lessonData.blocks.length} блоками`);
    }

    console.log(`✅ Курс "${courseData.title}" полностью создан\n`);
  }

  console.log("🎉 Все демо-курсы успешно созданы!");
}

createDemoCourses()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Критическая ошибка:", error);
    process.exit(1);
  });
