import Link from "next/link";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserRole } from "@/lib/auth/get-user-role";

// Экспорт для кэширования (revalidate каждые 60 секунд)
export const revalidate = 60;

// Lazy load ZenBuilder с Suspense для streaming
const ZenBuilder = dynamic(
  () => import("@/components/zen-builder/zen-builder").then((mod) => mod.ZenBuilder),
  {
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full sm:w-[240px]" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    ),
  }
);

// Компонент заголовка (быстро рендерится)
async function BuilderHeader({ courseId, lessonId }: { courseId: string; lessonId: string }) {
  const supabase = await createClient();
  const { data: lesson } = await supabase
    .from("lessons")
    .select("title")
    .eq("id", lessonId)
    .single();

  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/admin/courses/${courseId}/lessons`} prefetch={true}>
          ← Уроки
        </Link>
      </Button>
      <h1 className="text-xl font-semibold">ZenBuilder — {lesson?.title ?? "Загрузка..."}</h1>
    </div>
  );
}

export default async function ZenBuilderPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Оптимизированная параллельная загрузка только критичных данных
  const [lessonResult, courseResult, profileResult] = await Promise.all([
    supabase
      .from("lessons")
      .select("id, title, course_id")
      .eq("id", lessonId)
      .eq("course_id", courseId)
      .single(),
    supabase
      .from("courses")
      .select("created_by")
      .eq("id", courseId)
      .single(),
    supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single(),
  ]);

  const { data: lesson } = lessonResult;
  if (!lesson) notFound();

  const { data: course } = courseResult;
  const { data: profile } = profileResult;
  const role = getUserRole(profile?.role ?? null, user);
  const isSuperAdmin = role === "super_admin";
  if (course?.created_by !== user.id && !isSuperAdmin) notFound();

  // Streaming: заголовок рендерится сразу, ZenBuilder загружается отдельно
  return (
    <div className="space-y-6">
      <Suspense fallback={
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" disabled>← Уроки</Button>
          <Skeleton className="h-7 w-48" />
        </div>
      }>
        <BuilderHeader courseId={courseId} lessonId={lessonId} />
      </Suspense>
      
      <Suspense fallback={
        <div className="space-y-4">
          <Skeleton className="h-10 w-full sm:w-[240px]" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      }>
        <ZenBuilder lessonId={lessonId} initialBlocks={[]} />
      </Suspense>
    </div>
  );
}
