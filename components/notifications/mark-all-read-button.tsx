"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function MarkAllReadButton({ userId }: { userId: string }) {
  const router = useRouter();

  const handleMarkAllRead = async () => {
    const supabase = createClient();
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) {
      toast.error("Ошибка при обновлении уведомлений");
    } else {
      toast.success("Все уведомления отмечены как прочитанные");
      router.refresh();
    }
  };

  return (
    <Button onClick={handleMarkAllRead} size="sm" variant="outline">
      Отметить все как прочитанные
    </Button>
  );
}
