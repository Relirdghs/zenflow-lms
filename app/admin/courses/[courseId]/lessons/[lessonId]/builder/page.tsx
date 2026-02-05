import Link from "next/link";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserRole } from "@/lib/auth/get-user-role";

// Lazy load ZenBuilder (only used by admins, saves ~100KB from main bundle)
const ZenBuilder = dynamic(
  () => import("@/components/zen-builder/zen-builder").then((mod) => mod.ZenBuilder),
  {
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-12 w-48" />
      </div>
    ),
  }
);

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

  const { data: lesson } = await supabase
    .from("lessons")
    .select("id, title, course_id")
    .eq("id", lessonId)
    .eq("course_id", courseId)
    .single();
  if (!lesson) notFound();

  const { data: course } = await supabase
    .from("courses")
    .select("created_by")
    .eq("id", courseId)
    .single();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const role = getUserRole(profile?.role ?? null, user);
  const isSuperAdmin = role === "super_admin";
  if (course?.created_by !== user.id && !isSuperAdmin) notFound();

  const { data: blocks } = await supabase
    .from("lesson_blocks")
    .select("id, type, content, order_index")
    .eq("lesson_id", lessonId)
    .order("order_index");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/admin/courses/${courseId}/lessons`}>← Уроки</Link>
        </Button>
        <h1 className="text-xl font-semibold">ZenBuilder — {lesson.title}</h1>
      </div>
      <ZenBuilder
        lessonId={lessonId}
        initialBlocks={blocks ?? []}
      />
    </div>
  );
}
