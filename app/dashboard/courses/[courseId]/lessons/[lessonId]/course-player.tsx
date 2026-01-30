"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { BlockRenderer } from "@/components/course-player/block-renderers";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Block {
  id: string;
  type: string;
  content: Record<string, unknown>;
  order_index: number;
}

interface Lesson {
  id: string;
  title: string;
  order_index: number;
}

interface CoursePlayerProps {
  courseId: string;
  lessonId: string;
  lessonTitle: string;
  blocks: Block[];
  allLessons: Lesson[];
  enrollmentId: string;
}

export function CoursePlayer({
  courseId,
  lessonId,
  lessonTitle,
  blocks,
  allLessons,
  enrollmentId,
}: CoursePlayerProps) {
  const router = useRouter();
  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < allLessons.length - 1
      ? allLessons[currentIndex + 1]
      : null;

  const updateProgress = useCallback(async () => {
    const supabase = createClient();
    const totalLessons = allLessons.length;
    if (totalLessons === 0) return;
    const completedLessons = currentIndex + 1;
    const progress = Math.round((completedLessons / totalLessons) * 100);
    await supabase
      .from("enrollments")
      .update({ progress_percent: Math.min(progress, 100) })
      .eq("id", enrollmentId);
    router.refresh();
  }, [allLessons.length, currentIndex, enrollmentId, router]);

  useEffect(() => {
    updateProgress();
  }, [updateProgress]);

  return (
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 px-1">
      <div className="flex items-center gap-2 sm:gap-4">
        <Button variant="ghost" size="icon" asChild className="shrink-0 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0">
          <Link href={`/dashboard/courses/${courseId}`}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-lg sm:text-xl font-semibold flex-1 truncate">{lessonTitle}</h1>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {blocks.length === 0 ? (
          <p className="text-sm sm:text-base text-muted-foreground">Контента в этом уроке пока нет.</p>
        ) : (
          blocks.map((block) => (
            <BlockRenderer
              key={block.id}
              type={block.type as "h1" | "h2" | "callout" | "link" | "video" | "text" | "image" | "slider" | "quiz" | "checklist" | "timer"}
              content={block.content}
            />
          ))
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 pt-4 sm:pt-6 border-t">
        {prevLesson ? (
          <Button variant="outline" asChild className="min-h-[44px] sm:min-h-0 order-2 sm:order-1">
            <Link
              href={`/dashboard/courses/${courseId}/lessons/${prevLesson.id}`}
              className="flex items-center justify-center"
            >
              <ChevronLeft className="mr-2 h-4 w-4 shrink-0" />
              <span className="truncate">{prevLesson.title}</span>
            </Link>
          </Button>
        ) : (
          <div className="hidden sm:block" />
        )}
        {nextLesson ? (
          <Button asChild className="min-h-[44px] sm:min-h-0 order-1 sm:order-2">
            <Link
              href={`/dashboard/courses/${courseId}/lessons/${nextLesson.id}`}
              className="flex items-center justify-center"
            >
              <span className="truncate">{nextLesson.title}</span>
              <ChevronRight className="ml-2 h-4 w-4 shrink-0" />
            </Link>
          </Button>
        ) : (
          <Button asChild className="min-h-[44px] sm:min-h-0 order-1 sm:order-2">
            <Link href={`/dashboard/courses/${courseId}`}>Вернуться к курсу</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
