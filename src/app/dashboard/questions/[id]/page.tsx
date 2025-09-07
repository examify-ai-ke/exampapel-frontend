'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    HelpCircle,
    Hash,
    Star,
    BookOpen,
    FileText,
    Edit,
    Plus,
    Trash2,
    ArrowLeft,
    Clock,
    CheckCircle,
    AlertTriangle,
    Users,
    Eye,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner, LoadingOverlay } from '@/components/ui/loading-spinner';
import { AdminBreadcrumb } from '@/components/ui/breadcrumb';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/stores/ui';
import { api } from '@/lib/api';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import Link from 'next/link';
import type { components } from '@/types/generated/api';

// Type definitions from API schema
type QuestionRead = components['schemas']['QuestionRead'];
type AnswerReadForQuestion = components['schemas']['AnswerReadForQuestion'];

export default function QuestionDetailPage() {
    const router = useRouter();
    const routeParams = useParams();
    const questionId = Array.isArray((routeParams as any)?.id)
        ? (routeParams as any)?.id?.[0]
        : (routeParams as any)?.id;
    const { user } = useAuth();
    const { addNotification } = useUIStore();

    // State management
    const [question, setQuestion] = useState<QuestionRead | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Load question data
    const loadQuestion = async () => {
        try {
            setLoading(true);

            if (questionId) {
                const response = await api.GET('/api/v1/questions/{question_id}', {
                    params: {
                        path: { question_id: questionId as string },
                        query: { include_children: true },
                    },
                });
                const data = (response as any).data?.data ?? (response as any).data;
                if (data) {
                    setQuestion(data as QuestionRead);
                }
            } else {
                // Fallback to mock data for development
                console.log('Using mock data - questions API not available');
                setQuestion({
                    id: (questionId as string) || 'unknown-id',
                    text: {
                        time: Date.now(),
                        blocks: [
                            {
                                id: 'block-1',
                                type: 'paragraph',
                                data: { text: 'This is a sample question about object-oriented programming principles. Explain the key concepts of encapsulation, inheritance, and polymorphism with examples.' }
                            }
                        ]
                    },
                    marks: 15,
                    numbering_style: 'roman',
                    question_number: 'i',
                    slug: 'oop-principles-question',
                    created_at: '2024-12-15T10:30:00Z',
                    question_set_id: 'set-1',
                    exam_paper_id: 'paper-1',
                    parent_id: null,
                    children: [],
                    answers: [],
                    is_main_question: true,
                    is_sub_question: false,
                    /*children: [
                        {
                            id: '1a',
                            text: { time: Date.now(), blocks: [{ id: 'b-a', type: 'paragraph', data: { text: 'Define encapsulation with an example.' } }] },
                            marks: 5,
                            numbering_style: 'alpha',
                            question_number: 'a',
                            created_at: '2024-12-15T10:30:00Z',
                            question_set_id: 'set-1',
                            exam_paper_id: 'paper-1',
                            parent_id: (questionId as string) || 'unknown-id',
                            children: [],
                            answers: [],
                            slug: 'encapsulation-definition',
                        },
                        {
                            id: '1b',
                            text: { time: Date.now(), blocks: [{ id: 'b-b', type: 'paragraph', data: { text: 'Explain inheritance and provide a code example.' } }] },
                            marks: 5,
                            numbering_style: 'alpha',
                            question_number: 'b',
                            created_at: '2024-12-15T10:30:00Z',
                            question_set_id: 'set-1',
                            exam_paper_id: 'paper-1',
                            parent_id: (questionId as string) || 'unknown-id',
                            children: [],
                            answers: [],
                            slug: 'inheritance-explanation',
                        },
                        {
                            id: '1c',
                            text: { time: Date.now(), blocks: [{ id: 'b-c', type: 'paragraph', data: { text: 'Describe polymorphism and give examples of method overriding.' } }] },
                            marks: 5,
                            numbering_style: 'alpha',
                            question_number: 'c',
                            created_at: '2024-12-15T10:30:00Z',
                            question_set_id: 'set-1',
                            exam_paper_id: 'paper-1',
                            parent_id: (questionId as string) || 'unknown-id',
                            children: [],
                            answers: [],
                            slug: 'polymorphism-description',
                        }
                    ],
                    answers: [
                        {
                            id: 'a1',
                            text: { time: Date.now(), blocks: [{ id: 'ans-1', type: 'paragraph', data: { text: 'Encapsulation is the bundling of data and methods that operate on that data within a single unit or object. It provides data hiding and protects the internal state of an object from external interference.' } }] },
                            likes: 0,
                            dislikes: 0,
                            reviewed: false,
                            auto_answer: false,
                            created_at: '2024-12-15T11:00:00Z',
                            created_by_id: 'user-1',
                            parent_id: null,
                            created_by: { id: 'user-1', email: 'professor@university.edu', full_name: 'Dr. Smith' } as any
                        }
                    ],*/
                });
            }
        } catch (error) {
            console.error('Error loading question:', error);
            addNotification({
                type: 'error',
                title: 'Failed to load question',
                message: 'Please try again later.',
            });
        } finally {
            setLoading(false);
        }
    };

    // Load data on mount
    useEffect(() => {
        if (questionId) {
            loadQuestion();
        }
    }, [questionId]);

    // Handle question deletion
    const handleDelete = async () => {
        if (!question) return;

        if (!confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
            return;
        }

        try {
            setDeleting(true);

            if (question.id) {
                await api.DELETE('/api/v1/questions/{question_id}', {
                    params: {
                        path: { question_id: question.id },
                        query: { cascade: false },
                    },
                });
                addNotification({
                    type: 'success',
                    title: 'Question Deleted',
                    message: 'The question has been deleted successfully.',
                });
                router.push('/dashboard/questions');
            }
        } catch (error) {
            console.error('Error deleting question:', error);
            addNotification({
                type: 'error',
                title: 'Deletion Failed',
                message: 'Failed to delete question. Please try again.',
            });
        } finally {
            setDeleting(false);
        }
    };

    // Handle question update
    const handleUpdate = async (data: any) => {
        if (!question) return;

        try {
            setEditing(true);

            if (question.id) {
                const response = await api.PUT('/api/v1/questions/{question_id}', {
                    params: { path: { question_id: question.id } },
                    body: data,
                });
                const updated = (response as any).data?.data ?? (response as any).data;
                if (updated) {
                    setQuestion(updated as QuestionRead);
                    addNotification({
                        type: 'success',
                        title: 'Question Updated',
                        message: 'The question has been updated successfully.',
                    });
                    setEditing(false);
                }
            }
        } catch (error) {
            console.error('Error updating question:', error);
            addNotification({
                type: 'error',
                title: 'Update Failed',
                message: 'Failed to update question. Please try again.',
            });
        } finally {
            setEditing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    if (!question) {
        return (
            <div className="space-y-6 p-6">
                <AdminBreadcrumb currentPage="Question Not Found" />
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Question Not Found</h1>
                    <p className="text-gray-600 mt-2">The question you're looking for doesn't exist.</p>
                    <Button className="mt-4" onClick={() => router.push('/dashboard/questions')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Questions
                    </Button>
                </div>
            </div>
        );
    }

    const isMainQuestion = !question.parent_id;
    const hasSubQuestions = question.children && question.children.length > 0;
    const hasAnswers = question.answers && question.answers.length > 0;

    return (
        <div className="space-y-6 p-6">
            <AdminBreadcrumb
                items={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Questions', href: '/dashboard/questions' },
                    { label: question.question_number, href: `/dashboard/questions/${question.id}` },
                ]}
                currentPage={`Question ${question.question_number}`}
            />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Question {question.question_number}
                    </h1>
                    <p className="text-gray-600">
                        {isMainQuestion ? 'Main Question' : 'Sub-Question'} • {question.marks} marks
                    </p>
                </div>
                <div className="flex space-x-3">
                    <Button variant="outline" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <Button onClick={() => setEditing(true)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                        {deleting ? (
                            <LoadingSpinner className="mr-2 h-4 w-4" />
                        ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        Delete
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Question Content */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <HelpCircle className="h-5 w-5 text-blue-600 mr-2" />
                                Question Content
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="prose max-w-none">
                                <p className="text-lg leading-relaxed">
                                    {(() => {
                                        const firstBlock = (question.text as any)?.blocks?.[0];
                                        const content = typeof firstBlock?.data?.['text'] === 'string' ? firstBlock.data['text'] : '';
                                        return content || 'No question text available';
                                    })()}
                                </p>
                            </div>

                            <div className="mt-6 flex items-center space-x-4 text-sm text-gray-600">
                                <div className="flex items-center">
                                    <Hash className="mr-1 h-4 w-4" />
                                    <span>Number: {question.question_number}</span>
                                </div>
                                <div className="flex items-center">
                                    <Star className="mr-1 h-4 w-4 text-yellow-500" />
                                    <span>{question.marks} marks</span>
                                </div>
                                <div className="flex items-center">
                                    <Clock className="mr-1 h-4 w-4" />
                                    <span>Created {formatRelativeTime(question.created_at)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sub-Questions */}
                    {isMainQuestion && hasSubQuestions && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Hash className="h-5 w-5 text-green-600 mr-2" />
                                        Sub-Questions ({question.children!.length})
                                    </div>
                                    <Button size="sm" variant="outline">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Sub-Question
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {question.children!.map((subQuestion) => (
                                        <div key={subQuestion.id} className="border rounded-lg p-4 hover:bg-gray-50">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <Badge variant="secondary">
                                                            {subQuestion.question_number}
                                                        </Badge>
                                                        <span className="text-sm text-gray-600">
                                                            {subQuestion.marks} marks
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-900">
                                                        {(() => {
                                                            const fb = (subQuestion.text as any)?.blocks?.[0];
                                                            const txt = typeof fb?.data?.['text'] === 'string' ? fb.data['text'] : '';
                                                            return txt || 'No text available';
                                                        })()}
                                                    </p>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Button size="sm" variant="ghost" asChild>
                                                        <Link href={`/dashboard/questions/${subQuestion.id}`}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button size="sm" variant="ghost">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Answers */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                                    Answers ({question.answers?.length || 0})
                                </div>
                                <Button size="sm" variant="outline">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Answer
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {hasAnswers ? (
                                <div className="space-y-4">
                                    {question.answers!.map((answer) => (
                                        <div key={answer.id} className="border rounded-lg p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center space-x-2">
                                                    <Badge variant={'default'}>
                                                        Answer
                                                    </Badge>
                                                    <span className="text-sm text-gray-600">
                                                        by {((answer as any)?.created_by as any)?.full_name || 'Unknown'}
                                                    </span>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Button size="sm" variant="ghost">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" className="text-red-600">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <p className="text-gray-900 mb-3">
                                                {(() => {
                                                    const fb = (answer.text as any)?.blocks?.[0];
                                                    const txt = typeof fb?.data?.['text'] === 'string' ? fb.data['text'] : '';
                                                    return txt || 'No answer text';
                                                })()}
                                            </p>
                                            {(answer as any).explanation && (
                                                <div className="bg-blue-50 p-3 rounded">
                                                    <p className="text-sm text-blue-800">
                                                        <strong>Explanation:</strong> {(answer as any).explanation}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                    <p>No answers have been provided for this question yet.</p>
                                    <Button className="mt-4" variant="outline">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add First Answer
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Question Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Question Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">Type</span>
                                <Badge variant={isMainQuestion ? 'default' : 'secondary'}>
                                    {isMainQuestion ? 'Main Question' : 'Sub-Question'}
                                </Badge>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">Numbering Style</span>
                                <span className="text-sm capitalize">{question.numbering_style}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">Marks</span>
                                <span className="text-sm font-semibold">{question.marks}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">Created</span>
                                <span className="text-sm">{formatDate(question.created_at)}</span>
                            </div>

                            {question.slug && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600">Slug</span>
                                    <span className="text-sm font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                        {question.slug}
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button className="w-full" variant="outline" size="sm">
                                <Plus className="mr-2 h-4 w-4" />
                                {isMainQuestion ? 'Add Sub-Question' : 'Add Answer'}
                            </Button>

                            <Button className="w-full" variant="outline" size="sm">
                                <BookOpen className="mr-2 h-4 w-4" />
                                View Exam Paper
                            </Button>

                            <Button className="w-full" variant="outline" size="sm">
                                <FileText className="mr-2 h-4 w-4" />
                                View Question Set
                            </Button>

                            <Button className="w-full" variant="outline" size="sm">
                                <Users className="mr-2 h-4 w-4" />
                                Share Question
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Statistics */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Statistics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Sub-Questions</span>
                                <span className="text-sm font-semibold">
                                    {question.children?.length || 0}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Answers</span>
                                <span className="text-sm font-semibold">
                                    {question.answers?.length || 0}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Total Marks</span>
                                <span className="text-sm font-semibold">
                                    {(question.marks || 0) + (question.children?.reduce((sum, child) => sum + (child.marks || 0), 0) || 0)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
