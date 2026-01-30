"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/ui/image-upload";

interface GroupFormProps {
  adminId?: string;
  groupId?: string;
  defaultName?: string;
  defaultAvatarUrl?: string;
}

export function GroupForm({
  adminId,
  groupId,
  defaultName = "",
  defaultAvatarUrl = "",
}: GroupFormProps) {
  const router = useRouter();
  const [name, setName] = useState(defaultName);
  const [avatarUrl, setAvatarUrl] = useState(defaultAvatarUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();

    if (groupId) {
      const { error: updateError } = await supabase
        .from("groups")
        .update({ name, avatar_url: avatarUrl || null })
        .eq("id", groupId);
      setLoading(false);
      if (updateError) {
        setError("Не удалось сохранить группу. Попробуйте позже.");
        return;
      }
      router.refresh();
      return;
    }

    if (!adminId) {
      setLoading(false);
      setError("Не удалось создать группу. Нет администратора.");
      return;
    }

    const { data, error: insertError } = await supabase
      .from("groups")
      .insert({
        name,
        avatar_url: avatarUrl || null,
        admin_id: adminId,
      })
      .select("id")
      .single();
    setLoading(false);
    if (insertError || !data) {
      setError("Не удалось создать группу. Попробуйте позже.");
      return;
    }
    router.push(`/admin/groups/${data.id}`);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {groupId ? "Данные группы" : "Создание группы"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div>
            <Label htmlFor="group-name">Название группы</Label>
            <Input
              id="group-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Утренний поток"
              required
            />
          </div>
          <div>
            <Label>Аватар группы</Label>
            <ImageUpload
              value={avatarUrl}
              onChange={setAvatarUrl}
              onRemove={() => setAvatarUrl("")}
              label="Перетащите изображение или нажмите для выбора"
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading
              ? "Сохранение…"
              : groupId
                ? "Сохранить"
                : "Создать группу"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
