import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-md" />
        <Skeleton className="h-6 w-48" />
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-9 w-40 rounded-md" />
      </div>
      <Skeleton className="mt-4 h-96 w-full rounded-lg" />
    </div>
  )
}
