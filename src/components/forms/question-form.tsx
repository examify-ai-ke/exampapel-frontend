'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    HelpCircle,
    Hash,
    Star,
    BookOpen,
    FileText,
    Save,
    X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useUIStore } from '@/stores/ui';
import { adminAPI } from '@/lib/api-admin';
import type { components } from '@/types/generated/api';

// Type definitions from API schema
type MainQuestionUpdate = components['schemas']['MainQuestionUpdate'];
type SubQuestionUpdate = components['schemas']['SubQuestionUpdate'];
type MainQuestionRead = components['schemas']['MainQuestionRead'];
type SubQuestionRead = components['schemas']['SubQuestionRead'];
type QuestionSetRead = components['schemas']['QuestionSetRead'];
type ExamPaperRead = components['schemas']['ExamPaperRead'];

// Form validation schemas
const mainQuestionUpdateSchema = z.object({
    text: z.string().min(10, 'Question text must be at least 10 characters'),
    marks: z.number().min(1, 'Marks must be at least 1').max(100, 'Marks cannot exceed 100'),
    numbering_style: z.enum(['roman', 'alpha']),
    question_number: z.string().min(1, 'Question number is required'),
    question_set_id: z.string().min(1, 'Question set is required'),
    exam_paper_id: z.string().min(1, 'Exam paper is required'),
});

const subQuestionUpdateSchema = z.object({
    text: z.string().min(10, 'Question text must be at least 10 characters'),
    marks: z.number().min(1, 'Marks must be at least 1').max(50, 'Marks cannot exceed 50'),
    numbering_style: z.enum(['roman', 'alpha']),
    question_number: z.string().min(1, 'Question number is required'),
    parent_id: z.string().min(1, 'Parent question is required'),
});

type MainQuestionFormData = z.infer<typeof mainQuestionUpdateSchema>;
type SubQuestionFormData = z.infer<typeof subQuestionUpdateSchema>;

interface QuestionFormProps {
    question: MainQuestionRead | SubQuestionRead;
    onSave: (data: MainQuestionUpdate | SubQuestionUpdate) => void;
    onCancel: () => void;
    loading?: boolean;
}

export default function QuestionForm({ question, onSave, onCancel, loading = false }: QuestionFormProps) {
    const { addNotification } = useUIStore();
    const [examPapers, setExamPapers] = useState<ExamPaperRead[]>([]);
    const [questionSets, setQuestionSets] = useState<QuestionSetRead[]>([]);
    const [mainQuestions, setMainQuestions] = useState<MainQuestionRead[]>([]);
    const [loadingData, setLoadingData] = useState(false);

    const isMainQuestion = !('parent_id' in question) || !question.parent_id;

    // Form instances
    const mainQuestionForm = useForm<MainQuestionFormData>({
        resolver: zodResolver(mainQuestionUpdateSchema),
        defaultValues: {
            text: question.text?.content || '',
            marks: question.marks || 5,
            numbering_style: question.numbering_style || 'roman',
            question_number: question.question_number || '',
            question_set_id: question.question_set_id || '',
            exam_paper_id: question.exam_paper_id || '',
        },
    });

    const subQuestionForm = useForm<SubQuestionFormData>({
        resolver: zodResolver(subQuestionUpdateSchema),
        defaultValues: {
            text: question.text?.content || '',
            marks: question.marks || 3,
            numbering_style: question.numbering_style || 'alpha',
            question_number: question.question_number || '',
            parent_id: 'parent_id' in question ? question.parent_id || '' : '',
        },
    });

    // Load lookup data
    const loadLookupData = async () => {
        try {
            setLoadingData(true);

            // Load exam papers
            if (adminAPI.examPapers) {
                const papersResponse = await adminAPI.examPapers.list({ skip: 0, limit: 100 });
                if (papersResponse.data?.data?.items) {
                    setExamPapers(papersResponse.data.data.items as ExamPaperRead[]);
                }
            }

            // Load question sets
            if (adminAPI.questionSets) {
                const setsResponse = await adminAPI.questionSets.list({ skip: 0, limit: 100 });
                if (setsResponse.data?.data?.items) {
                    setQuestionSets(setsResponse.data.data.items as QuestionSetRead[]);
                }
            }

            // Load main questions for sub-question parent selection
            if (adminAPI.questions) {
                const questionsResponse = await adminAPI.questions.list({ skip: 0, limit: 100 });
                if (questionsResponse.data?.data?.items) {
                    const mainQuestionsOnly = questionsResponse.data.data.items.filter(
                        (q: any) => !q.parent_id
                    );
                    setMainQuestions(mainQuestionsOnly);
                }
            }
        } catch (error) {
            console.error('Error loading lookup data:', error);
            addNotification({
                type: 'error',
                title: 'Failed to load data',
                message: 'Could not load exam papers and question sets.',
            });
        } finally {
            setLoadingData(false);
        }
    };

    // Load data on mount
    useEffect(() => {
        loadLookupData();
    }, []);

    // Handle form submission
    const handleSubmit = (data: MainQuestionFormData | SubQuestionFormData) => {
        onSave(data);
    };

    // Render form based on question type
    if (isMainQuestion) {
        return (
            <Form {...mainQuestionForm}>
                <form onSubmit={mainQuestionForm.handleSubmit(handleSubmit)} className="space-y-6">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <HelpCircle className="h-5 w-5 text-blue-600 mr-2" />
                            Edit Main Question
                        </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={mainQuestionForm.control}
                                name="exam_paper_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Exam Paper</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select exam paper" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {loadingData ? (
                                                    <div className="flex justify-center py-4">
                                                        <LoadingSpinner />
                                                    </div>
                                                ) : examPapers.length === 0 ? (
                                                    <div className="text-center text-muted-foreground py-4">
                                                        No exam papers available
                                                    </div>
                                                ) : (
                                                    examPapers.map((paper) => (
                                                        <SelectItem key={paper.id} value={paper.id}>
                                                            {paper.title} ({paper.exam_year})
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={mainQuestionForm.control}
                                name="question_set_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Question Set</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select question set" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {loadingData ? (
                                                    <div className="flex justify-center py-4">
                                                        <LoadingSpinner />
                                                    </div>
                                                ) : questionSets.length === 0 ? (
                                                    <div className="text-center text-muted-foreground py-4">
                                                        No question sets available
                                                    </div>
                                                ) : (
                                                    questionSets.map((set) => (
                                                        <SelectItem key={set.id} value={set.id}>
                                                            {set.title || `Question Set ${set.id.slice(0, 8)}`}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Question Content */}
                        <FormField
                            control={mainQuestionForm.control}
                            name="text"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Question Text</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter your question here..."
                                            className="min-h-[200px] resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Marks and Numbering */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField
                                control={mainQuestionForm.control}
                                name="marks"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Marks</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="1"
                                                max="100"
                                                {...field}
                                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={mainQuestionForm.control}
                                name="numbering_style"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Numbering Style</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="roman">Roman (i, ii, iii)</SelectItem>
                                                <SelectItem value="alpha">Alpha (a, b, c)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={mainQuestionForm.control}
                                name="question_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Question Number</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="1"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>

                    {/* Form Actions */}
                    <div className="flex items-center justify-end space-x-3 p-6 border-t">
                        <Button type="button" variant="outline" onClick={onCancel}>
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <LoadingSpinner className="mr-2 h-4 w-4" />
                            ) : (
                                <Save className="mr-2 h-4 w-4" />
                            )}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Form>
        );
    } else {
        return (
            <Form {...subQuestionForm}>
                <form onSubmit={subQuestionForm.handleSubmit(handleSubmit)} className="space-y-6">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Hash className="h-5 w-5 text-green-600 mr-2" />
                            Edit Sub-Question
                        </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                        {/* Parent Question */}
                        <FormField
                            control={subQuestionForm.control}
                            name="parent_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Parent Question</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select parent question" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {loadingData ? (
                                                <div className="flex justify-center py-4">
                                                    <LoadingSpinner />
                                                </div>
                                            ) : mainQuestions.length === 0 ? (
                                                <div className="text-center text-muted-foreground py-4">
                                                    No main questions available
                                                </div>
                                            ) : (
                                                mainQuestions.map((q) => (
                                                    <SelectItem key={q.id} value={q.id}>
                                                        {q.text?.content?.substring(0, 50)}...
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Question Content */}
                        <FormField
                            control={subQuestionForm.control}
                            name="text"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Question Text</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter your question here..."
                                            className="min-h-[200px] resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Marks and Numbering */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField
                                control={subQuestionForm.control}
                                name="marks"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Marks</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="1"
                                                max="50"
                                                {...field}
                                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={subQuestionForm.control}
                                name="numbering_style"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Numbering Style</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="roman">Roman (i, ii, iii)</SelectItem>
                                                <SelectItem value="alpha">Alpha (a, b, c)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={subQuestionForm.control}
                                name="question_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Question Number</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="a"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>

                    {/* Form Actions */}
                    <div className="flex items-center justify-end space-x-3 p-6 border-t">
                        <Button type="button" variant="outline" onClick={onCancel}>
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <LoadingSpinner className="mr-2 h-4 w-4" />
                            ) : (
                                <Save className="mr-2 h-4 w-4" />
                            )}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Form>
        );
    }
}
