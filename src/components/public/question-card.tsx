'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Eye, BookOpen } from 'lucide-react';
import type { QuestionCardProps } from './types';

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
      .join(' ')
      .trim();
  }
  
  return '';
}

/**
 * Truncate text to specified length
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

export function QuestionCard({ question, preview = true, onView, className = '' }: QuestionCardProps) {
  const questionText = extractQuestionText(question.question_text);
  const displayText = preview ? truncateText(questionText, 150) : questionText;
  
  // Extract metadata
  const examPaper = question.exam_paper;
  const institution = examPaper?.institution?.name || 'Unknown Institution';
  const year = examPaper?.year_of_exam || 'N/A';
  const course = examPaper?.course?.name || examPaper?.course?.code || '';
  const paperTitle = examPaper?.title?.title || 'Exam Paper';

  return (
    <Card className={`hover:shadow-lg transition-shadow ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base line-clamp-2 mb-1">
              {paperTitle}
            </h3>
            <p className="text-sm text-gray-600">
              {institution} • {year}
            </p>
          </div>
          {question.marks && (
            <Badge variant="secondary" className="shrink-0">
              {question.marks} marks
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm text-gray-700 line-clamp-3 mb-3">
          {displayText || 'No question text available'}
        </p>
        
        {course && (
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              <BookOpen className="h-3 w-3 mr-1" />
              {course}
            </Badge>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={onView}
        >
          <Eye className="h-4 w-4 mr-2" />
          View Full Question
        </Button>
      </CardFooter>
    </Card>
  );
}
