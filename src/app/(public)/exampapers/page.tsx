'use client';

import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import BrowsePageContent from './browse-content';

export default function BrowsePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    }>
      <BrowsePageContent />
    </Suspense>
  );
}
