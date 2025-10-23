'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, MessageSquare, Eye } from 'lucide-react';

interface QuestionCardProps {
  question: any;
  questionNumber: string | number;
}

export function QuestionCard({ question, questionNumber }: QuestionCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAnswers, setShowAnswers] = useState(false);

  const hasSubQuestions = question.children && question.children.length > 0;
  const hasAnswers = question.answers && question.answers.length > 0;
  
  // Convert Roman numerals to display format
  const displayNumber = typeof questionNumber === 'string' ? questionNumber.toUpperCase() : questionNumber;

  // Render question text (handle JSON format)
  const renderQuestionText = (text: any) => {
    // Handle null or undefined
    if (text === null || text === undefined) {
      return <p className="text-gray-400 italic">No question text available</p>;
    }

    // Handle string format
    if (typeof text === 'string') {
      return <p className="text-gray-800 whitespace-pre-wrap">{text}</p>;
    }
    
    // Handle object format
    if (typeof text === 'object') {
      // Handle JSON blocks format (EditorJS format)
      if (text.blocks && Array.isArray(text.blocks)) {
        if (text.blocks.length === 0) {
          return <p className="text-gray-400 italic">No question text available</p>;
        }
        
        return (
          <div className="space-y-2">
            {text.blocks.map((block: any, index: number) => {
              // Handle different block types
              if (block.type === 'paragraph') {
                return (
                  <p key={index} className="text-gray-800 whitespace-pre-wrap">
                    {block.data?.text || ''}
                  </p>
                );
              }
              if (block.type === 'header') {
                const HeaderTag = `h${block.data?.level || 3}` as keyof JSX.IntrinsicElements;
                return (
                  <HeaderTag key={index} className="font-semibold text-gray-900">
                    {block.data?.text || ''}
                  </HeaderTag>
                );
              }
              if (block.type === 'list') {
                const ListTag = block.data?.style === 'ordered' ? 'ol' : 'ul';
                return (
                  <ListTag key={index} className="list-inside text-gray-800 space-y-1">
                    {block.data?.items?.map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ListTag>
                );
              }
              // Fallback for unknown block types
              return (
                <p key={index} className="text-gray-800">
                  {block.text || block.data?.text || JSON.stringify(block)}
                </p>
              );
            })}
          </div>
        );
      }
      
      // Fallback: render as JSON string
      return <p className="text-gray-800 text-sm font-mono">{JSON.stringify(text)}</p>;
    }

    // Fallback for unexpected types
    return <p className="text-gray-400 italic">Invalid question text format</p>;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="flex-shrink-0">
              <div className="min-w-[2rem] h-8 px-2 rounded-full bg-teal-100 flex items-center justify-center">
                <span className="text-sm font-semibold text-teal-700">{displayNumber}</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {question.marks && (
                  <Badge variant="secondary" className="text-xs">
                    {question.marks} marks
                  </Badge>
                )}
                {hasSubQuestions && (
                  <Badge variant="outline" className="text-xs">
                    {question.children.length} sub-questions
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {hasSubQuestions && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="ml-2"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main Question Text */}
        <div className="prose prose-sm max-w-none">
          {renderQuestionText(question.text)}
        </div>

        {/* Sub-questions */}
        {hasSubQuestions && isExpanded && (
          <div className="ml-6 space-y-3 border-l-2 border-gray-200 pl-4">
            {question.children.map((subQuestion: any, index: number) => (
              <div key={subQuestion.id || index} className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="font-medium text-gray-700 text-sm min-w-[1.5rem]">
                    {subQuestion.question_number || String.fromCharCode(97 + index)})
                  </span>
                  <div className="flex-1">
                    <div className="prose prose-sm max-w-none">
                      {renderQuestionText(subQuestion.text)}
                    </div>
                    {subQuestion.marks && (
                      <Badge variant="secondary" className="text-xs mt-1">
                        {subQuestion.marks} marks
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Answers Section */}
        {hasAnswers && (
          <div className="pt-3 border-t border-gray-200">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAnswers(!showAnswers)}
              className="text-xs"
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              {showAnswers ? 'Hide' : 'View'} {question.answers.length} Answer(s)
            </Button>

            {showAnswers && (
              <div className="mt-3 space-y-2">
                {question.answers.map((answer: any, index: number) => (
                  <div
                    key={answer.id || index}
                    className="bg-blue-50 border border-blue-200 rounded-lg p-3"
                  >
                    <div className="prose prose-sm max-w-none text-blue-900">
                      {renderQuestionText(answer.text || answer.content)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Question Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-500 pt-2">
          {hasAnswers && (
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              <span>{question.answers.length} answers</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            <span>0 views</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
