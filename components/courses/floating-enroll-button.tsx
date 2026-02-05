"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingEnrollButtonProps {
  courseId: string;
  isEnrolled: boolean;
  className?: string;
}

export function FloatingEnrollButton({ courseId, isEnrolled, className }: FloatingEnrollButtonProps) {
  if (isEnrolled) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border p-4 md:hidden",
        className
      )}
      style={{
        paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
      }}
    >
      <Button asChild size="lg" className="w-full min-h-[48px] text-base">
        <Link href={`/dashboard/courses/${courseId}/enroll`}>
          Записаться на курс
          <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </Button>
    </div>
  );
}
