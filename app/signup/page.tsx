"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data: signUpData, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    
    if (err) {
      setLoading(false);
      setError(err.message);
      return;
    }

    // Создать профиль вручную, если триггер не сработал
    if (signUpData.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: signUpData.user.id,
          email: signUpData.user.email ?? email,
          full_name: fullName || null,
          role: "client",
        }, {
          onConflict: "id",
        });

      if (profileError) {
        console.warn("Profile creation failed (may already exist):", profileError);
        // Не показываем ошибку пользователю - профиль может быть создан триггером
      }
    }

    setLoading(false);
    // Полная перезагрузка страницы, чтобы избежать "Failed to fetch" при клиентской навигации
    window.location.href = "/dashboard";
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md border-0 shadow-lg bg-card">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-semibold text-primary">
            ZenFlow
          </CardTitle>
          <CardDescription>Создайте аккаунт</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
            <div className="space-y-2">
              <Label htmlFor="fullName">Имя и фамилия</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Ваше имя"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Эл. почта</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Создание аккаунта…" : "Зарегистрироваться"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Уже есть аккаунт?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Войти
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
