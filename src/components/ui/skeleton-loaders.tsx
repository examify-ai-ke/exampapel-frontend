'use client';

import { cn } from '@/lib/utils';

// Base Skeleton component
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200 rounded',
        className
      )}
    />
  );
}

// Question Card Skeleton
export function QuestionCardSkeleton() {
  return (
    <div className="border-b border-gray-200 p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
      
      {/* Content */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
      
      {/* Footer */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-24" />
      </div>
    </div>
  );
}

// Filter Section Skeleton
export function FilterSectionSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-5 w-32" />
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Stats Card Skeleton
export function StatsCardSkeleton() {
  return (
    <div className="flex flex-col items-center text-center p-4 bg-white rounded-lg shadow-sm border border-gray-100">
      <Skeleton className="w-10 h-10 rounded-full mb-2" />
      <Skeleton className="h-8 w-20 mb-1" />
      <Skeleton className="h-4 w-24" />
    </div>
  );
}

// Questions List Skeleton (multiple cards)
export function QuestionsListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div>
      {[...Array(count)].map((_, i) => (
        <QuestionCardSkeleton key={i} />
      ))}
    </div>
  );
}
