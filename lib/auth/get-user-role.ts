import type { AppRole } from "@/types/database";
import type { User } from "@supabase/supabase-js";

export function getUserRole(
  profileRole: AppRole | null | undefined,
  user?: User | null
): AppRole {
  const metaRole = user?.user_metadata?.role ?? user?.app_metadata?.role;
  const role = profileRole ?? metaRole;
  if (role === "super_admin" || role === "admin" || role === "client") {
    return role;
  }
  return "client";
}
