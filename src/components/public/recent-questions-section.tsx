'use client';

import { useState } from 'react';
import { QuestionCard } from './question-card';
import { QuestionModal } from './question-modal';
import type { QuestionRead } from './types';

interface RecentQuestionsSectionProps {
  questions: QuestionRead[];
}

export function RecentQuestionsSection({ questions }: RecentQuestionsSectionProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionRead | null>(null);

  const handleViewQuestion = (question: QuestionRead) => {
    setSelectedQuestion(question);
  };

  const handleCloseModal = () => {
    setSelectedQuestion(null);
  };

  if (!questions || questions.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Recent Questions
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore the latest exam questions added to our platform. 
              Practice with real past paper questions from top institutions.
            </p>
          </div>

          {/* Questions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {questions.slice(0, 9).map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                preview={true}
                onView={() => handleViewQuestion(question)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Question Modal */}
      {selectedQuestion && (
        <QuestionModal
          question={selectedQuestion}
          isOpen={!!selectedQuestion}
          onClose={handleCloseModal}
        />
      )}
    </section>
  );
}
