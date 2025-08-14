import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface CardSkeletonProps {
  showHeader?: boolean
  showFooter?: boolean
  className?: string
}

export function CardSkeleton({ 
  showHeader = true, 
  showFooter = false,
  className 
}: CardSkeletonProps) {
  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
      </CardContent>
      {showFooter && (
        <div className="p-6 pt-0">
          <Skeleton className="h-8 w-24" />
        </div>
      )}
    </Card>
  )
}