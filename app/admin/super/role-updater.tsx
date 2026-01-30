"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AppRole } from "@/types/database";

interface RoleUpdaterProps {
  userId: string;
  currentRole: AppRole;
}

export function RoleUpdater({ userId, currentRole }: RoleUpdaterProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleChange(value: AppRole) {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("profiles").update({ role: value }).eq("id", userId);
    setLoading(false);
    router.refresh();
  }

  return (
    <Select
      value={currentRole}
      onValueChange={handleChange}
      disabled={loading}
    >
      <SelectTrigger className="w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="client">Клиент</SelectItem>
        <SelectItem value="admin">Администратор</SelectItem>
        <SelectItem value="super_admin">Супер-админ</SelectItem>
      </SelectContent>
    </Select>
  );
}
