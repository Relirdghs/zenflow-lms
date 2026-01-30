"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function GroupGoalsForm({ groupId }: { groupId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("goals").insert({
      group_id: groupId,
      title,
      description: description || null,
      deadline: deadline || null,
      is_completed: false,
    });
    setLoading(false);
    if (error) {
      console.error(error);
      return;
    }
    setTitle("");
    setDescription("");
    setDeadline("");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Добавить цель для группы</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="goal-title">Название цели</Label>
            <Input
              id="goal-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Практиковать 3 раза в неделю"
              required
            />
          </div>
          <div>
            <Label htmlFor="goal-desc">Описание (необязательно)</Label>
            <Textarea
              id="goal-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Подробности..."
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="goal-deadline">Срок (необязательно)</Label>
            <Input
              id="goal-deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Добавление…" : "Добавить цель"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
