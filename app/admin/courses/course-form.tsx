"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ImageUpload } from "@/components/ui/image-upload";
import type { CourseLevel } from "@/types/database";

interface CourseFormProps {
  createdBy: string;
  courseId?: string;
  defaultTitle?: string;
  defaultDescription?: string;
  defaultLevel?: CourseLevel;
  defaultCoverImage?: string;
  defaultIsPublic?: boolean;
  defaultGroupIds?: string[];
  groups?: { id: string; name: string }[];
}

export function CourseForm({
  createdBy,
  courseId,
  defaultTitle = "",
  defaultDescription = "",
  defaultLevel = "beginner",
  defaultCoverImage = "",
  defaultIsPublic = true,
  defaultGroupIds = [],
  groups = [],
}: CourseFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState(defaultDescription);
  const [level, setLevel] = useState<CourseLevel>(defaultLevel);
  const [coverImage, setCoverImage] = useState(defaultCoverImage);
  const [isPublic, setIsPublic] = useState(defaultIsPublic);
  const [groupIds, setGroupIds] = useState<string[]>(defaultGroupIds);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    if (courseId) {
      const { error: updateError } = await supabase
        .from("courses")
        .update({
          title,
          description,
          level,
          cover_image: coverImage || null,
          is_public: isPublic,
        })
        .eq("id", courseId);
      if (updateError) {
        setLoading(false);
        setError("Не удалось сохранить курс. Попробуйте позже.");
        return;
      }

      await supabase.from("course_groups").delete().eq("course_id", courseId);
      if (!isPublic && groupIds.length > 0) {
        await supabase
          .from("course_groups")
          .insert(groupIds.map((groupId) => ({ course_id: courseId, group_id: groupId })));
      }
    } else {
      // Вставка без is_public — колонка может отсутствовать (миграция 00006)
      const insertPayload: Record<string, unknown> = {
        title,
        description,
        level,
        cover_image: coverImage || null,
        created_by: createdBy,
      };
      const { data, error: insertError } = await supabase
        .from("courses")
        .insert(insertPayload)
        .select("id")
        .single();

      if (insertError) {
        setLoading(false);
        setError(insertError.message || "Не удалось создать курс. Попробуйте позже.");
        return;
      }
      if (!data) {
        setLoading(false);
        setError("Не удалось создать курс. Попробуйте позже.");
        return;
      }

      // Если есть is_public и курс закрытый — обновить и привязать группы (после миграции 00006)
      try {
        await supabase.from("courses").update({ is_public: isPublic }).eq("id", data.id);
        if (!isPublic && groupIds.length > 0) {
          await supabase
            .from("course_groups")
            .insert(groupIds.map((groupId) => ({ course_id: data.id, group_id: groupId })));
        }
      } catch {
        // Игнорируем — колонка/таблица может отсутствовать
      }

      setLoading(false);
      window.location.href = `/admin/courses/${data.id}/lessons`;
      return;
    }
    setLoading(false);
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div>
            <Label htmlFor="title">Название курса</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введите название курса"
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Краткое описание курса"
              rows={3}
            />
          </div>
          <div>
            <Label>Обложка курса</Label>
            <ImageUpload
              value={coverImage}
              onChange={setCoverImage}
              onRemove={() => setCoverImage("")}
            />
          </div>
          <div>
            <Label>Уровень</Label>
            <Select value={level} onValueChange={(v) => setLevel(v as CourseLevel)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Начальный</SelectItem>
                <SelectItem value="intermediate">Средний</SelectItem>
                <SelectItem value="advanced">Продвинутый</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Доступ</Label>
            <Select
              value={isPublic ? "public" : "private"}
              onValueChange={(v) => setIsPublic(v === "public")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Публичный</SelectItem>
                <SelectItem value="private">Только для групп</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Закрытые курсы видны только участникам назначенных групп.
            </p>
          </div>
          {!isPublic && (
            <div>
              <Label>Группы с доступом</Label>
              <div className="mt-2 space-y-2">
                {groups.length > 0 ? (
                  groups.map((g) => (
                    <label key={g.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-input"
                        checked={groupIds.includes(g.id)}
                        onChange={(e) => {
                          setGroupIds((prev) =>
                            e.target.checked
                              ? [...prev, g.id]
                              : prev.filter((id) => id !== g.id)
                          );
                        }}
                      />
                      <span>{g.name}</span>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Пока нет групп для назначения.
                  </p>
                )}
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Сохранение…" : courseId ? "Сохранить" : "Создать и добавить уроки"}
            </Button>
            {courseId && (
              <Button type="button" variant="outline" asChild>
                <Link href={`/admin/courses/${courseId}/lessons`}>Отмена</Link>
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
