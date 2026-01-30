"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function EnrollForm({
  courseId,
  userId,
}: {
  courseId: string;
  userId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEnroll() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.from("enrollments").insert({
      user_id: userId,
      course_id: courseId,
      progress_percent: 0,
    });
    setLoading(false);
    if (error) {
      console.error(error);
      setError("Не удалось записаться на курс. Попробуйте позже.");
      return;
    }
    router.push(`/dashboard/courses/${courseId}`);
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-muted-foreground mb-4">
          Вы получите доступ ко всем урокам и сможете отслеживать прогресс.
        </p>
        {error && (
          <p className="text-sm text-destructive mb-3">{error}</p>
        )}
        <Button onClick={handleEnroll} disabled={loading} className="w-full">
          {loading ? "Запись..." : "Записаться сейчас"}
        </Button>
      </CardContent>
    </Card>
  );
}
