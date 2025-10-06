import { Suspense } from 'react';
import {
  HeroSection,
  RecentQuestionsSection,
  FeaturedInstitutionsSection,
  StatsSection,
} from '@/components/public';
import { publicAPI } from '@/lib/api-public';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

async function LandingPageContent() {
  // Fetch data for all sections
  const [statsResult, questionsResult, institutionsResult] = await Promise.allSettled([
    publicAPI.stats.getPlatformStats(),
    publicAPI.questions.getRecent(9),
    publicAPI.institutions.getFeatured(8),
  ]);

  // Extract data with fallbacks
  const stats = statsResult.status === 'fulfilled' 
    ? statsResult.value.data 
    : { totalPapers: 0, totalInstitutions: 0, totalQuestions: 0 };

  const questions = questionsResult.status === 'fulfilled'
    ? questionsResult.value.data
    : [];

  const institutions = institutionsResult.status === 'fulfilled'
    ? institutionsResult.value.data
    : [];

  return (
    <>
      {/* Hero Section with Search and Stats */}
      <HeroSection stats={stats} />

      {/* Recent Questions Section */}
      <RecentQuestionsSection questions={questions} />

      {/* Featured Institutions Section */}
      <FeaturedInstitutionsSection institutions={institutions} />

      {/* Stats Section with Animated Counters */}
      <StatsSection stats={stats} />
    </>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      }>
        <LandingPageContent />
      </Suspense>
    </div>
  );
} 