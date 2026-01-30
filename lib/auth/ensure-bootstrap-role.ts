import "server-only";
import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

function parseEmailList(value?: string) {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);
}

export async function ensureBootstrapSuperAdmin(user: User) {
  const emails = parseEmailList(process.env.SUPER_ADMIN_EMAILS);
  if (!user.email || emails.length === 0) return;

  const isBootstrap = emails.includes(user.email.toLowerCase());
  if (!isBootstrap) return;

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return;

  const admin = createAdminClient();
  const metadata = { ...(user.user_metadata ?? {}), role: "super_admin" };

  await admin.from("profiles").upsert(
    {
      id: user.id,
      email: user.email,
      role: "super_admin",
      full_name: user.user_metadata?.full_name ?? null,
    },
    { onConflict: "id" }
  );

  await admin.auth.admin.updateUserById(user.id, {
    user_metadata: metadata,
  });
}
