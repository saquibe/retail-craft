"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function BillingRowSkeleton() {
  return (
    <tr>
      <td className="p-2">
        <Skeleton className="h-6 w-6" />
      </td>
      <td className="p-2">
        <Skeleton className="h-4 w-24" />
      </td>
      <td className="p-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-20 mt-1" />
      </td>
      <td className="p-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16 mt-1" />
      </td>
      <td className="p-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-16 mt-1" />
      </td>
      <td className="p-2 text-right">
        <Skeleton className="h-4 w-20 ml-auto" />
      </td>
      <td className="p-2 text-right">
        <Skeleton className="h-4 w-16 ml-auto" />
      </td>
      <td className="p-2 text-right">
        <Skeleton className="h-4 w-20 ml-auto" />
      </td>
      <td className="p-2">
        <Skeleton className="h-6 w-20 rounded-full" />
      </td>
      <td className="p-2 text-right">
        <Skeleton className="h-8 w-16 ml-auto" />
      </td>
    </tr>
  );
}

export default function CompletedBillingsSkeleton({
  rows = 5,
}: {
  rows?: number;
}) {
  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <Skeleton className="h-6 w-48" />
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search + Button */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-28" />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <tbody>
              {Array.from({ length: rows }).map((_, i) => (
                <BillingRowSkeleton key={i} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center pt-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-40" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
