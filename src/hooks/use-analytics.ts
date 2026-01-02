'use client';

import { useCallback } from 'react';
import { posthog } from '@/lib/posthog';

export interface AnalyticsEvent {
  // Exam Paper Events
  exam_paper_viewed: {
    paper_id: string;
    paper_title: string;
    institution?: string;
    course?: string;
    year?: string;
  };
  exam_paper_downloaded: {
    paper_id: string;
    paper_title: string;
  };
  exam_paper_shared: {
    paper_id: string;
    paper_title: string;
    share_method?: string;
  };

  // Question Events
  question_viewed: {
    question_id: string;
    question_number: string;
    paper_id?: string;
    has_sub_questions: boolean;
  };
  question_expanded: {
    question_id: string;
    question_number: string;
    sub_questions_count: number;
  };
  answer_viewed: {
    answer_id: string;
    question_id: string;
    answer_index: number;
  };
  answer_liked: {
    answer_id: string;
    question_id: string;
  };
  answer_disliked: {
    answer_id: string;
    question_id: string;
  };

  // Search & Browse Events
  search_performed: {
    query: string;
    filters?: Record<string, any>;
    results_count: number;
  };
  filter_applied: {
    filter_type: string;
    filter_value: string;
  };
  institution_viewed: {
    institution_id: string;
    institution_name: string;
  };
  course_viewed: {
    course_id: string;
    course_name: string;
  };

  // User Engagement
  page_time_spent: {
    page: string;
    duration_seconds: number;
  };
  scroll_depth: {
    page: string;
    depth_percentage: number;
  };

  // Auth Events
  user_signed_up: {
    method: string;
  };
  user_logged_in: {
    method: string;
  };
  user_logged_out: Record<string, never>;
}

export function useAnalytics() {
  const trackEvent = useCallback(<K extends keyof AnalyticsEvent>(
    eventName: K,
    properties: AnalyticsEvent[K]
  ) => {
    if (typeof window !== 'undefined' && posthog) {
      posthog.capture(eventName, properties);
    }
  }, []);

  const identifyUser = useCallback((userId: string, traits?: Record<string, any>) => {
    if (typeof window !== 'undefined' && posthog) {
      posthog.identify(userId, traits);
    }
  }, []);

  const resetUser = useCallback(() => {
    if (typeof window !== 'undefined' && posthog) {
      posthog.reset();
    }
  }, []);

  return {
    trackEvent,
    identifyUser,
    resetUser,
  };
}
