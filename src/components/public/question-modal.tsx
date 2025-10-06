'use client';

import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, UserPlus } from 'lucide-react';
import type { QuestionRead } from './types';

interface QuestionModalProps {
  question: QuestionRead;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Helper to extract plain text from question blocks
 */
function extractQuestionText(questionText: unknown): string {
  if (typeof questionText === 'string') {
    return questionText;
  }
  
  if (Array.isArray(questionText)) {
    return questionText
      .map((block: unknown) => {
        if (typeof block === 'string') return block;
        const blockObj = block as Record<string, unknown>;
        if (blockObj?.text) return String(blockObj.text);
        if (blockObj?.content) {
          if (typeof blockObj.content === 'string') return blockObj.content;
          if (Array.isArray(blockObj.content)) {
            return blockObj.content
              .map((item: unknown) => {
                const itemObj = item as Record<string, unknown>;
                return itemObj?.text ? String(itemObj.text) : '';
              })
              .join(' ');
          }
        }
        return '';
      })
      .join('\n')
      .trim();
  }
  
  return '';
}

export function QuestionModal({ question, isOpen, onClose }: QuestionModalProps) {
  const router = useRouter();
  const questionText = extractQuestionText(question.question_text);
  
  // Extract metadata
  const examPaper = question.exam_paper;
  const institution = examPaper?.institution?.name || 'Unknown Institution';
  const year = examPaper?.year_of_exam || 'N/A';
  const course = examPaper?.course?.name || examPaper?.course?.code || '';
  const paperTitle = examPaper?.title?.title || 'Exam Paper';
  const paperId = examPaper?.id;

  const handleViewPaper = () => {
    if (paperId) {
      router.push(`/browse/${paperId}`);
      onClose();
    }
  };

  const handleSignUp = () => {
    router.push('/auth/register');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold pr-8">
            {paperTitle}
          </DialogTitle>
          <DialogDescription className="text-base">
            {institution} • {year}
            {course && ` • ${course}`}
          </DialogDescription>
        </DialogHeader>

        <Separator />

        {/* Question Content */}
        <div className="space-y-4">
          {/* Question Number and Marks */}
          <div className="flex items-center justify-between">
            {question.question_number && (
              <div className="font-semibold text-gray-700">
                Question {question.question_number}
              </div>
            )}
            {question.marks && (
              <Badge variant="secondary">
                {question.marks} marks
              </Badge>
            )}
          </div>

          {/* Question Text */}
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
              {questionText || 'No question text available'}
            </div>
          </div>

          {/* Sub-questions if any */}
          {question.sub_questions && question.sub_questions.length > 0 && (
            <div className="mt-4 space-y-3">
              <h4 className="font-semibold text-sm text-gray-700">Sub-questions:</h4>
              {question.sub_questions.map((subQ, index) => (
                <div key={subQ.id || index} className="pl-4 border-l-2 border-gray-200">
                  <div className="flex items-start justify-between mb-1">
                    <span className="font-medium text-sm">
                      {subQ.question_number || `(${String.fromCharCode(97 + index)})`}
                    </span>
                    {subQ.marks && (
                      <Badge variant="outline" className="text-xs">
                        {subQ.marks} marks
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-700">
                    {extractQuestionText(subQ.question_text)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="space-y-3">
          {paperId && (
            <Button
              onClick={handleViewPaper}
              className="w-full"
              variant="default"
            >
              <FileText className="h-4 w-4 mr-2" />
              View Full Exam Paper
            </Button>
          )}

          {/* Sign up prompt */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <UserPlus className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-gray-900 mb-1">
                  Want to save questions and track your progress?
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Sign up to bookmark questions, view answers, and get personalized recommendations.
                </p>
                <Button
                  onClick={handleSignUp}
                  size="sm"
                  variant="default"
                >
                  Sign Up Free
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
