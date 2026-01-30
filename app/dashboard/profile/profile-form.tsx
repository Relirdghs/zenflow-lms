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
      <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
        <CardTitle className="text-sm sm:text-base">Данные</CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm">Эл. почта</Label>
            <Input value={email} disabled className="bg-muted min-h-[44px] sm:min-h-0" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm">Имя и фамилия</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="min-h-[44px] sm:min-h-0"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full sm:w-auto min-h-[44px] sm:min-h-0">
            {loading ? "Сохранение…" : "Сохранить"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
