/**
 * Скрипт для подтверждения всех пользователей (для разработки)
 * Запуск: npx tsx scripts/confirm-users.ts
 * Требует: SUPABASE_SERVICE_ROLE_KEY в .env.local
 */

import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

// Загрузить переменные из .env.local
config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Ошибка: Переменные окружения не найдены!");
  console.error("");
  console.error("Убедитесь, что файл .env.local содержит:");
  console.error("  NEXT_PUBLIC_SUPABASE_URL=ваш-url");
  console.error("  SUPABASE_SERVICE_ROLE_KEY=ваш-service-role-ключ");
  console.error("");
  console.error("⚠️ ВАЖНО: Service Role Key имеет полный доступ к базе данных!");
  console.error("   Используйте только для разработки!");
  process.exit(1);
}

// Используем service_role ключ для доступа к auth.users
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function confirmAllUsers() {
  console.log("🔍 Поиск пользователей без подтвержденного email...");

  // Получить всех пользователей через Admin API
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error("❌ Ошибка при получении списка пользователей:", listError);
    process.exit(1);
  }

  if (!users || users.length === 0) {
    console.log("ℹ️ Пользователи не найдены");
    return;
  }

  const unconfirmedUsers = users.filter((u) => !u.email_confirmed_at);

  if (unconfirmedUsers.length === 0) {
    console.log("✅ Все пользователи уже подтверждены!");
    return;
  }

  console.log(`📧 Найдено ${unconfirmedUsers.length} пользователей без подтверждения:`);
  unconfirmedUsers.forEach((u) => {
    console.log(`   - ${u.email} (${u.id.substring(0, 8)}...)`);
  });

  console.log("");
  console.log("🔄 Подтверждение email для всех пользователей...");

  for (const user of unconfirmedUsers) {
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      email_confirm: true,
    });

    if (updateError) {
      console.error(`❌ Ошибка при подтверждении ${user.email}:`, updateError.message);
    } else {
      console.log(`✅ Подтвержден: ${user.email}`);
    }
  }

  console.log("");
  console.log("🎉 Готово! Все пользователи подтверждены.");
}

confirmAllUsers().catch((e) => {
  console.error("");
  console.error("❌ Ошибка при выполнении скрипта:");
  console.error(e);
  console.error("");
  process.exit(1);
});
