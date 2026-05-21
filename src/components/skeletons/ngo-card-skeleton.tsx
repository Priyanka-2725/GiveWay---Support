import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function NgoCardSkeleton() {
  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <CardHeader className="items-start pb-2">
        <div className="flex w-full items-start justify-between">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-6 w-16" />
        </div>
        <Skeleton className="h-6 w-32 mt-4" />
        <Skeleton className="h-3 w-24" />
      </CardHeader>
      <CardContent className="flex-grow px-6 text-left">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
      <CardFooter className="mt-auto flex flex-col gap-2 border-t bg-secondary/10 px-6 pt-4">
        <div className="flex justify-between w-full">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-8" />
        </div>
        <Skeleton className="h-1.5 w-full" />
        <Skeleton className="h-3 w-20 ml-auto" />
      </CardFooter>
    </Card>
  );
}
