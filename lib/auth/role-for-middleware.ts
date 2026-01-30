import { createClient } from "@supabase/supabase-js";
import type { AppRole } from "@/types/database";

function parseEmails(value?: string): string[] {
  if (!value) return [];
  return value.split(",").map((v) => v.trim().toLowerCase()).filter(Boolean);
}

/**
 * Resolve user role for redirect (middleware). Uses service role to bootstrap
 * SUPER_ADMIN_EMAILS and read role, so it works even when RLS blocks anon profile read.
 */
export async function getRoleForRedirect(
  userId: string,
  userEmail: string | null | undefined,
  userMetadata: Record<string, unknown> | undefined
): Promise<AppRole> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const emails = parseEmails(process.env.SUPER_ADMIN_EMAILS);

  if (!url || !serviceKey) return "client";

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (userEmail && emails.length > 0 && emails.includes(userEmail.toLowerCase())) {
    await admin.from("profiles").upsert(
      {
        id: userId,
        email: userEmail,
        role: "super_admin",
        full_name: (userMetadata?.full_name as string) ?? null,
      },
      { onConflict: "id" }
    );
    try {
      await admin.auth.admin.updateUserById(userId, {
        user_metadata: { ...(userMetadata ?? {}), role: "super_admin" },
      });
    } catch {
      // ignore
    }
  }

  const { data: row } = await admin
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  const role = row?.role;
  if (role === "super_admin" || role === "admin" || role === "client") return role;
  return "client";
}
