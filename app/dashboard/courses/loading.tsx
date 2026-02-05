import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function CoursesLoading() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header skeleton */}
      <div>
        <Skeleton className="h-7 w-32 mb-2" />
        <Skeleton className="h-5 w-48" />
      </div>

      {/* Enrolled courses section */}
      <section>
        <Skeleton className="h-6 w-28 mb-4" />
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              {/* Cover image skeleton */}
              <Skeleton className="h-36 w-full rounded-none" />
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-3" />
                {/* Progress bar skeleton */}
                <div className="flex items-center gap-2 mb-3">
                  <Skeleton className="h-2 flex-1 rounded-full" />
                  <Skeleton className="h-4 w-8" />
                </div>
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Available courses section */}
      <section>
        <Skeleton className="h-6 w-36 mb-4" />
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-36 w-full rounded-none" />
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-3" />
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
