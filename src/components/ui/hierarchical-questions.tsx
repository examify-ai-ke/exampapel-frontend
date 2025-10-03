'use client';

import React, { useState } from 'react';
import {
    ChevronDown,
    ChevronRight,
    HelpCircle,
    Hash,
    Star,
    CheckCircle,
    AlertTriangle,
    Edit,
    Trash2,
    Eye,
    Plus,
    MoreHorizontal,
    BookOpen,
    FileText,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDate } from '@/lib/utils';
import type { components } from '@/types/generated/api';

// Type definitions
type QuestionRead = components['schemas']['QuestionRead'];
type QuestionSetRead = components['schemas']['QuestionSetRead'];

// Props interfaces
interface QuestionSetDisplayProps {
    questionSet: QuestionSetRead;
    questions: QuestionRead[];
    onEditQuestion?: (question: QuestionRead) => void;
    onDeleteQuestion?: (questionId: string) => void;
    onViewQuestion?: (questionId: string) => void;
    onAddSubQuestion?: (parentId: string) => void;
    onEditQuestionSet?: (questionSet: QuestionSetRead) => void;
    onDeleteQuestionSet?: (questionSetId: string) => void;
    showActions?: boolean;
    defaultExpanded?: boolean;
}

interface MainQuestionDisplayProps {
    question: QuestionRead;
    subQuestions: QuestionRead[];
    onEditQuestion?: (question: QuestionRead) => void;
    onDeleteQuestion?: (questionId: string) => void;
    onViewQuestion?: (questionId: string) => void;
    onAddSubQuestion?: (parentId: string) => void;
    showActions?: boolean;
    defaultExpanded?: boolean;
}

interface SubQuestionDisplayProps {
    question: QuestionRead;
    onEditQuestion?: (question: QuestionRead) => void;
    onDeleteQuestion?: (questionId: string) => void;
    onViewQuestion?: (questionId: string) => void;
    showActions?: boolean;
}

interface HierarchicalQuestionsProps {
    questionSets: QuestionSetRead[];
    questions: QuestionRead[];
    onEditQuestion?: (question: QuestionRead) => void;
    onDeleteQuestion?: (questionId: string) => void;
    onViewQuestion?: (questionId: string) => void;
    onAddSubQuestion?: (parentId: string) => void;
    onEditQuestionSet?: (questionSet: QuestionSetRead) => void;
    onDeleteQuestionSet?: (questionSetId: string) => void;
    onAddQuestion?: (questionSetId?: string) => void;
    showActions?: boolean;
    defaultExpanded?: boolean;
    emptyMessage?: string;
}

// Helper function to extract text from question
const extractQuestionText = (question: QuestionRead): string => {
    if (question.text?.blocks && Array.isArray(question.text.blocks)) {
        const textBlocks = question.text.blocks
            .filter(block => block.type === 'paragraph' || block.type === 'header')
            .map(block => block.data?.text || '')
            .join(' ');
        return textBlocks || 'No text content';
    }
    return 'No text content';
};

// Sub-question component
const SubQuestionDisplay: React.FC<SubQuestionDisplayProps> = ({
    question,
    onEditQuestion,
    onDeleteQuestion,
    onViewQuestion,
    showActions = true,
}) => {
    const questionText = extractQuestionText(question);
    const truncatedText = questionText.length > 150
        ? `${questionText.substring(0, 150)}...`
        : questionText;

    return (
        <div className="ml-8 border-l-2 border-blue-200 pl-4 py-2">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                            <Hash className="mr-1 h-3 w-3" />
                            {question.question_number}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                            Sub-question
                        </Badge>
                        <div className="flex items-center text-sm text-amber-600">
                            <Star className="mr-1 h-3 w-3" />
                            {question.marks || 0} marks
                        </div>
                    </div>

                    <p className="text-sm text-gray-700 mb-2">{truncatedText}</p>

                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Created: {formatDate(question.created_at)}</span>
                        <div className="flex items-center">
                            {question.answers && question.answers.length > 0 ? (
                                <>
                                    <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
                                    Has Answers
                                </>
                            ) : (
                                <>
                                    <AlertTriangle className="mr-1 h-3 w-3 text-orange-500" />
                                    No Answers
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {showActions && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            {onViewQuestion && (
                                <DropdownMenuItem onClick={() => onViewQuestion(question.id)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                </DropdownMenuItem>
                            )}
                            {onEditQuestion && (
                                <DropdownMenuItem onClick={() => onEditQuestion(question)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {onDeleteQuestion && (
                                <DropdownMenuItem
                                    onClick={() => onDeleteQuestion(question.id)}
                                    className="text-red-600"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </div>
    );
};

// Main question component
const MainQuestionDisplay: React.FC<MainQuestionDisplayProps> = ({
    question,
    subQuestions,
    onEditQuestion,
    onDeleteQuestion,
    onViewQuestion,
    onAddSubQuestion,
    showActions = true,
    defaultExpanded = false,
}) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const questionText = extractQuestionText(question);
    const truncatedText = questionText.length > 200
        ? `${questionText.substring(0, 200)}...`
        : questionText;

    return (
        <div className="border border-gray-200 rounded-lg mb-4">
            <div className="p-4">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="h-6 w-6 p-0"
                            >
                                {isExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                ) : (
                                    <ChevronRight className="h-4 w-4" />
                                )}
                            </Button>
                            <HelpCircle className="h-5 w-5 text-blue-600" />
                            <Badge variant="default" className="text-xs">
                                <Hash className="mr-1 h-3 w-3" />
                                {question.question_number}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                                Main Question
                            </Badge>
                            <div className="flex items-center text-sm font-medium text-amber-600">
                                <Star className="mr-1 h-4 w-4" />
                                {question.marks || 0} marks
                            </div>
                            {subQuestions.length > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                    {subQuestions.length} sub-question{subQuestions.length !== 1 ? 's' : ''}
                                </Badge>
                            )}
                        </div>

                        <p className="text-gray-800 mb-3 font-medium">{truncatedText}</p>

                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Created: {formatDate(question.created_at)}</span>
                            <div className="flex items-center">
                                {question.answers && question.answers.length > 0 ? (
                                    <>
                                        <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
                                        Has Answers
                                    </>
                                ) : (
                                    <>
                                        <AlertTriangle className="mr-1 h-3 w-3 text-orange-500" />
                                        No Answers
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {showActions && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                {onViewQuestion && (
                                    <DropdownMenuItem onClick={() => onViewQuestion(question.id)}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Details
                                    </DropdownMenuItem>
                                )}
                                {onEditQuestion && (
                                    <DropdownMenuItem onClick={() => onEditQuestion(question)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                )}
                                {onAddSubQuestion && (
                                    <DropdownMenuItem onClick={() => onAddSubQuestion(question.id)}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Sub-question
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                {onDeleteQuestion && (
                                    <DropdownMenuItem
                                        onClick={() => onDeleteQuestion(question.id)}
                                        className="text-red-600"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                {/* Sub-questions */}
                {isExpanded && subQuestions.length > 0 && (
                    <div className="mt-4 space-y-2">
                        {subQuestions.map((subQuestion) => (
                            <SubQuestionDisplay
                                key={subQuestion.id}
                                question={subQuestion}
                                onEditQuestion={onEditQuestion}
                                onDeleteQuestion={onDeleteQuestion}
                                onViewQuestion={onViewQuestion}
                                showActions={showActions}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Question set component
const QuestionSetDisplay: React.FC<QuestionSetDisplayProps> = ({
    questionSet,
    questions,
    onEditQuestion,
    onDeleteQuestion,
    onViewQuestion,
    onAddSubQuestion,
    onEditQuestionSet,
    onDeleteQuestionSet,
    showActions = true,
    defaultExpanded = false,
}) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    // Filter questions for this question set
    const setQuestions = questions.filter(q => q.question_set_id === questionSet.id);
    const mainQuestions = setQuestions.filter(q => !q.parent_id);

    // Calculate total marks
    const totalMarks = setQuestions.reduce((sum, q) => sum + (q.marks || 0), 0);

    return (
        <Card className="mb-6">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="h-8 w-8 p-0"
                        >
                            {isExpanded ? (
                                <ChevronDown className="h-5 w-5" />
                            ) : (
                                <ChevronRight className="h-5 w-5" />
                            )}
                        </Button>
                        <BookOpen className="h-6 w-6 text-purple-600" />
                        <div>
                            <CardTitle className="text-lg">
                                Question Set: {questionSet.title || `Set ${questionSet.id.slice(0, 8)}`}
                            </CardTitle>
                            <div className="flex items-center space-x-4 mt-1">
                                <Badge variant="outline" className="text-xs">
                                    {mainQuestions.length} main question{mainQuestions.length !== 1 ? 's' : ''}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                    {setQuestions.length} total question{setQuestions.length !== 1 ? 's' : ''}
                                </Badge>
                                <div className="flex items-center text-sm text-amber-600">
                                    <Star className="mr-1 h-4 w-4" />
                                    {totalMarks} total marks
                                </div>
                            </div>
                        </div>
                    </div>

                    {showActions && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Question Set Actions</DropdownMenuLabel>
                                {onEditQuestionSet && (
                                    <DropdownMenuItem onClick={() => onEditQuestionSet(questionSet)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit Question Set
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                {onDeleteQuestionSet && (
                                    <DropdownMenuItem
                                        onClick={() => onDeleteQuestionSet(questionSet.id)}
                                        className="text-red-600"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Question Set
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </CardHeader>

            {isExpanded && (
                <CardContent className="pt-0">
                    {mainQuestions.length > 0 ? (
                        <div className="space-y-4">
                            {mainQuestions.map((mainQuestion) => {
                                const subQuestions = setQuestions.filter(q => q.parent_id === mainQuestion.id);
                                return (
                                    <MainQuestionDisplay
                                        key={mainQuestion.id}
                                        question={mainQuestion}
                                        subQuestions={subQuestions}
                                        onEditQuestion={onEditQuestion}
                                        onDeleteQuestion={onDeleteQuestion}
                                        onViewQuestion={onViewQuestion}
                                        onAddSubQuestion={onAddSubQuestion}
                                        showActions={showActions}
                                        defaultExpanded={false}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                            <p>No questions in this question set yet.</p>
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    );
};

// Main hierarchical questions component
export const HierarchicalQuestions: React.FC<HierarchicalQuestionsProps> = ({
    questionSets,
    questions,
    onEditQuestion,
    onDeleteQuestion,
    onViewQuestion,
    onAddSubQuestion,
    onEditQuestionSet,
    onDeleteQuestionSet,
    onAddQuestion,
    showActions = true,
    defaultExpanded = false,
    emptyMessage = "No question sets found.",
}) => {
    if (questionSets.length === 0) {
        return (
            <div className="text-center py-12">
                <BookOpen className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Question Sets</h3>
                <p className="text-gray-500 mb-4">{emptyMessage}</p>
                {onAddQuestion && (
                    <Button onClick={() => onAddQuestion()}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add First Question
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {questionSets.map((questionSet) => (
                <QuestionSetDisplay
                    key={questionSet.id}
                    questionSet={questionSet}
                    questions={questions}
                    onEditQuestion={onEditQuestion}
                    onDeleteQuestion={onDeleteQuestion}
                    onViewQuestion={onViewQuestion}
                    onAddSubQuestion={onAddSubQuestion}
                    onEditQuestionSet={onEditQuestionSet}
                    onDeleteQuestionSet={onDeleteQuestionSet}
                    showActions={showActions}
                    defaultExpanded={defaultExpanded}
                />
            ))}
        </div>
    );
};

export default HierarchicalQuestions;
