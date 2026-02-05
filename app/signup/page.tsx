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
    <div
      className="min-h-screen min-h-[100dvh] flex items-center justify-center p-4 sm:p-6 bg-muted/30 overflow-y-auto"
      style={{
        paddingTop: "max(1rem, env(safe-area-inset-top))",
        paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
        paddingLeft: "max(1rem, env(safe-area-inset-left))",
        paddingRight: "max(1rem, env(safe-area-inset-right))",
      }}
    >
      <Card className="w-full max-w-md border-0 shadow-lg bg-card my-4">
        <CardHeader className="space-y-1 text-center px-4 sm:px-6 pt-6 sm:pt-8">
          <CardTitle className="text-xl sm:text-2xl font-semibold text-primary">
            ZenFlow
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">Создайте аккаунт</CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-6 sm:pb-8">
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
                autoComplete="name"
                className="min-h-[44px] sm:min-h-0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Эл. почта</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error && e.target.value) setError(null);
                }}
                onBlur={(e) => {
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  if (e.target.value && !emailRegex.test(e.target.value)) {
                    setError("Введите корректный email адрес");
                  }
                }}
                required
                autoComplete="email"
                className="min-h-[44px] sm:min-h-0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error && e.target.value.length >= 6) setError(null);
                }}
                onBlur={(e) => {
                  if (e.target.value && e.target.value.length < 6) {
                    setError("Пароль должен содержать минимум 6 символов");
                  }
                }}
                required
                minLength={6}
                autoComplete="new-password"
                className="min-h-[44px] sm:min-h-0"
              />
              <p className="text-xs text-muted-foreground">Минимум 6 символов</p>
            </div>
            <Button type="submit" className="w-full min-h-[44px] sm:min-h-0" disabled={loading}>
              {loading ? "Создание аккаунта…" : "Зарегистрироваться"}
            </Button>
          </form>
          <p className="mt-4 text-center text-xs sm:text-sm text-muted-foreground">
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
