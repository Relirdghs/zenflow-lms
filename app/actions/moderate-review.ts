"use server";

import { moderateReview } from "./reviews";

export async function moderateReviewAction(reviewId: string, approve: boolean) {
  return await moderateReview(reviewId, approve);
}
