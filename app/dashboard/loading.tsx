import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header skeleton */}
      <div>
        <Skeleton className="h-7 w-48 mb-2" />
        <Skeleton className="h-5 w-64" />
      </div>

      {/* Progress section skeleton */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-2 w-full rounded-full" />
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Goals section skeleton */}
      <section>
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 flex-1" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
