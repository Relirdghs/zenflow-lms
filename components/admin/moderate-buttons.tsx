"use client";

import { Button } from "@/components/ui/button";
import { moderateReviewAction } from "@/app/actions/moderate-review";
import { useRouter } from "next/navigation";

export function ModerateButtons({ reviewId }: { reviewId: string }) {
  const router = useRouter();

  const handleApprove = async () => {
    await moderateReviewAction(reviewId, true);
    router.refresh();
  };

  const handleReject = async () => {
    await moderateReviewAction(reviewId, false);
    router.refresh();
  };

  return (
    <>
      <Button onClick={handleApprove} size="sm" className="mr-2">
        Одобрить
      </Button>
      <Button onClick={handleReject} size="sm" variant="destructive">
        Отклонить
      </Button>
    </>
  );
}
