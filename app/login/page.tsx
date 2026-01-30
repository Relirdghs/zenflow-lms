"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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

function LoginForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    // Полная перезагрузка страницы, чтобы избежать "Failed to fetch" при клиентской навигации
    window.location.href = redirect;
  }

  return (
    <div
      className="min-h-screen min-h-[100dvh] flex items-center justify-center p-4 sm:p-6 bg-muted/30"
      style={{
        paddingTop: "max(1rem, env(safe-area-inset-top))",
        paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
        paddingLeft: "max(1rem, env(safe-area-inset-left))",
        paddingRight: "max(1rem, env(safe-area-inset-right))",
      }}
    >
      <Card className="w-full max-w-md border-0 shadow-lg bg-card">
        <CardHeader className="space-y-1 text-center px-4 sm:px-6 pt-6 sm:pt-8">
          <CardTitle className="text-xl sm:text-2xl font-semibold text-primary">
            ZenFlow
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">Войдите в свой аккаунт</CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-6 sm:pb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Эл. почта</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="min-h-[44px] sm:min-h-0"
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
                className="min-h-[44px] sm:min-h-0"
              />
            </div>
            <Button type="submit" className="w-full min-h-[44px] sm:min-h-0" disabled={loading}>
              {loading ? "Вход…" : "Войти"}
            </Button>
          </form>
          <p className="mt-4 text-center text-xs sm:text-sm text-muted-foreground">
            Нет аккаунта?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Зарегистрироваться
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen min-h-[100dvh] flex items-center justify-center p-4 bg-muted/30">Загрузка…</div>}>
      <LoginForm />
    </Suspense>
  );
}
