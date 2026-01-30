"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProfileForm({
  email,
  fullName,
  avatarUrl,
}: {
  email: string;
  fullName: string;
  avatarUrl: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(fullName);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("profiles")
      .update({ full_name: name })
      .eq("id", user.id);
    setLoading(false);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Данные</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Эл. почта</Label>
            <Input value={email} disabled className="bg-muted" />
          </div>
          <div>
            <Label htmlFor="name">Имя и фамилия</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Сохранение…" : "Сохранить"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
