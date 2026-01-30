"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface LessonFormProps {
  courseId: string;
  orderIndex: number;
  lessonId?: string;
  defaultTitle?: string;
  defaultDuration?: number;
}

export function LessonForm({
  courseId,
  orderIndex,
  lessonId,
  defaultTitle = "",
  defaultDuration = 0,
}: LessonFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(defaultTitle);
  const [duration, setDuration] = useState(defaultDuration);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    if (lessonId) {
      await supabase
        .from("lessons")
        .update({ title, duration_minutes: duration })
        .eq("id", lessonId);
    } else {
      const { data } = await supabase
        .from("lessons")
        .insert({
          course_id: courseId,
          title,
          order_index: orderIndex,
          duration_minutes: duration,
        })
        .select("id")
        .single();
      if (data) {
        router.push(`/admin/courses/${courseId}/lessons/${data.id}/builder`);
        router.refresh();
        return;
      }
    }
    setLoading(false);
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Название урока</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введите название урока"
              required
            />
          </div>
          <div>
            <Label htmlFor="duration">Длительность (минуты)</Label>
            <Input
              id="duration"
              type="number"
              min={0}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value) || 0)}
              placeholder="15"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Сохранение…" : lessonId ? "Сохранить" : "Создать и открыть ZenBuilder"}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href={`/admin/courses/${courseId}/lessons`}>Отмена</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
