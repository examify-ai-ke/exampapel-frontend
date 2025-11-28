/**
 * AnswerList Component
 * 
 * Displays a list of answers for a question.
 */

'use client';

import { CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import EditorJsRenderer from '@/components/ui/editor-js-renderer';
import type { components } from '@/types/generated/api';

type AnswerReadForQuestion = components['schemas']['AnswerReadForQuestion'];

interface AnswerListProps {
  answers: AnswerReadForQuestion[] | null | undefined;
}

export function AnswerList({ answers }: AnswerListProps) {
  if (!answers || answers.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 space-y-2">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        Answers ({answers.length})
      </div>
      {answers.map((answer, index) => {
        // Parse answer text if it's a string (EditorJS format)
        const answerText = answer.text;
        const parsedText = typeof answerText === 'string' 
          ? JSON.parse(answerText) 
          : answerText;

        return (
          <div
            key={answer.id || index}
            className="pl-4 border-l-2 border-green-200 bg-green-50/50 rounded-r p-2"
          >
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                {answer.is_correct && (
                  <Badge variant="default" className="text-xs bg-green-600 mb-1">
                    Correct Answer
                  </Badge>
                )}
                <div className="text-sm text-gray-700 prose prose-sm max-w-none">
                  {parsedText ? (
                    <EditorJsRenderer data={parsedText} />
                  ) : (
                    <p className="text-gray-400 italic">No answer text</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
