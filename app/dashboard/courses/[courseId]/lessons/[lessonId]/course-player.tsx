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
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/courses/${courseId}`}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold flex-1 truncate">{lessonTitle}</h1>
      </div>

      <div className="space-y-8">
        {blocks.length === 0 ? (
          <p className="text-muted-foreground">Контента в этом уроке пока нет.</p>
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

      <div className="flex items-center justify-between pt-6 border-t">
        {prevLesson ? (
          <Button variant="outline" asChild>
            <Link
              href={`/dashboard/courses/${courseId}/lessons/${prevLesson.id}`}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              {prevLesson.title}
            </Link>
          </Button>
        ) : (
          <div />
        )}
        {nextLesson ? (
          <Button asChild>
            <Link
              href={`/dashboard/courses/${courseId}/lessons/${nextLesson.id}`}
            >
              {nextLesson.title}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <Button asChild>
            <Link href={`/dashboard/courses/${courseId}`}>Вернуться к курсу</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
