'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    HelpCircle,
    Search,
    Filter,
    Eye,
    Star,
    CheckCircle,
    XCircle,
    Hash,
    BookOpen,
    FileText,
    TrendingUp,
    Plus,
    Edit,
    Trash2,
    MoreHorizontal,
    Clock,
    AlertTriangle,
    RefreshCw,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LoadingSpinner, LoadingOverlay } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { AdminBreadcrumb } from '@/components/ui/breadcrumb';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/stores/ui';
import { adminAPI } from '@/lib/api-admin';
import { api } from '@/lib/api';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import Link from 'next/link';
import type { components } from '@/types/generated/api';

// Type definitions from API schema
type QuestionRead = components['schemas']['QuestionRead'];

// Interface for the display table data
interface QuestionTableData extends QuestionRead {
    displayText: string;
    numberingDisplay: React.ReactNode;
    marksDisplay: React.ReactNode;
    typeDisplay: React.ReactNode;
    statusDisplay: React.ReactNode;
    paperInfo: React.ReactNode;
    createdAtDisplay: React.ReactNode;
    actions: React.ReactNode;
}

// Statistics interface
interface QuestionsOverviewStats {
    totalQuestions: number;
    mainQuestions: number;
    subQuestions: number;
    questionsWithAnswers: number;
    totalMarks: number;
    averageMarks: number;
    recentQuestions: number;
    orphanQuestions: number;
}

// Filter interface
interface QuestionsFilters {
    search?: string;
    numbering_style?: string;
    has_answers?: 'yes' | 'no';
    question_type?: 'main' | 'sub';
    marks_range?: 'low' | 'medium' | 'high';
    exam_paper_id?: string;
}

// No mock data – always use backend API

export default function AllQuestionsPage() {
    const { user } = useAuth();
    const { addNotification } = useUIStore();

    // State management
    const [questions, setQuestions] = useState<QuestionRead[]>([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<QuestionsOverviewStats>({
        totalQuestions: 0,
        mainQuestions: 0,
        subQuestions: 0,
        questionsWithAnswers: 0,
        totalMarks: 0,
        averageMarks: 0,
        recentQuestions: 0,
        orphanQuestions: 0,
    });
    const [filters, setFilters] = useState<QuestionsFilters>({});
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [apiStatus, setApiStatus] = useState<'connected' | 'error'>('error');
    const hasInitializedRef = useRef(false);

    const ITEMS_PER_PAGE = 20;

    // Initial load (guarded to avoid React StrictMode double-fetch in dev)
    useEffect(() => {
        if (!hasInitializedRef.current) {
            hasInitializedRef.current = true;
            void loadQuestions();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Load questions data
    const loadQuestions = async () => {
        try {
            setLoading(true);
            console.log('Loading questions from backend API...');

            // Always call backend API
            let response;
            if (filters.search && filters.search.trim() !== '') {
                console.log('Searching questions with query:', filters.search);
                const hasAnswersBool =
                    filters.has_answers === 'yes' ? true : filters.has_answers === 'no' ? false : undefined;
                response = await api.GET('/api/v1/questions/search', {
                    params: {
                        query: {
                            q: filters.search,
                            numbering_style: (filters.numbering_style as any) ?? undefined,
                            marks_min: getMarksRangeMin(filters.marks_range),
                            marks_max: getMarksRangeMax(filters.marks_range),
                            question_type: (filters.question_type as any) ?? undefined,
                            has_answers: hasAnswersBool ?? null,
                            exam_paper_id: filters.exam_paper_id ?? null,
                            skip: currentPage * ITEMS_PER_PAGE,
                            limit: ITEMS_PER_PAGE,
                        }
                    }
                });
            } else {
                console.log('Listing questions with filters:', filters);
                response = await api.GET('/api/v1/questions', {
                    params: {
                        query: {
                            question_type: (filters.question_type as any) ?? undefined,
                            exam_paper_id: filters.exam_paper_id ?? null,
                            parent_id: undefined,
                            question_set_id: undefined,
                            skip: currentPage * ITEMS_PER_PAGE,
                            limit: ITEMS_PER_PAGE,
                        }
                    }
                });
            }

            console.log('API Response:', response);

            if (response.data) {
                const responseData = (response as any).data.data ?? (response as any).data;
                console.log('Response data:', responseData);
                setQuestions(responseData.items || []);
                setTotalItems(responseData.total || 0);
                setTotalPages(Math.ceil((responseData.total || 0) / ITEMS_PER_PAGE));
                setApiStatus('connected');

                // Update stats if available
                if (responseData.stats) {
                    setStats({
                        totalQuestions: responseData.total || 0,
                        mainQuestions: responseData.stats.main_questions || 0,
                        subQuestions: responseData.stats.sub_questions || 0,
                        questionsWithAnswers: responseData.stats.with_answers || 0,
                        totalMarks: responseData.stats.total_marks || 0,
                        averageMarks: responseData.stats.average_marks || 0,
                        recentQuestions: responseData.stats.recent || 0,
                        orphanQuestions: responseData.stats.orphan || 0,
                    });
                }
            } else {
                console.log('No data in response');
                setQuestions([]);
                setTotalItems(0);
                setApiStatus('error');
            }
        } catch (error) {
            console.error('Error loading questions:', error);
            setApiStatus('error');
            addNotification({
                type: 'error',
                title: 'Failed to load questions',
                message: 'Please try again later.',
            });

            // Do not fallback – keep empty state
            setQuestions([]);
            setTotalItems(0);
        } finally {
            setLoading(false);
        }
    };

    // Helper function to get marks range
    const getMarksRangeMin = (range?: string) => {
        switch (range) {
            case 'low': return 1;
            case 'medium': return 4;
            case 'high': return 8;
            default: return undefined;
        }
    };

    const getMarksRangeMax = (range?: string) => {
        switch (range) {
            case 'low': return 3;
            case 'medium': return 7;
            case 'high': return undefined;
            default: return undefined;
        }
    };

    // Transform question data for table display
    const transformQuestionForTable = (question: QuestionRead): QuestionTableData => {
        // The API returns QuestionTextSchema for text with blocks; derive a plain preview
        const firstBlock = question.text?.blocks?.[0];
        // Most editors store paragraph text under data.text
        const blockText = typeof firstBlock?.data?.['text'] === 'string' ? (firstBlock?.data?.['text'] as string) : '';
        const displayText = blockText || 'No text content';
        const truncatedText = displayText.length > 120 ?
            `${displayText.substring(0, 120)}...` : displayText;

        const numberingDisplay = (
            <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                    <Hash className="mr-1 h-3 w-3" />
                    {question.question_number}
                </Badge>
                <span className="text-xs text-gray-500 capitalize">
                    {question.numbering_style}
                </span>
            </div>
        );

        const marksDisplay = (
            <div className="flex items-center text-sm font-medium">
                <Star className="mr-1 h-4 w-4 text-yellow-500" />
                <span className="font-bold">{question.marks || 0}</span>
                <span className="text-gray-500 ml-1">pts</span>
            </div>
        );

        const typeDisplay = (
            <div className="flex flex-col space-y-1">
                <Badge
                    variant={question.parent_id ? 'secondary' : 'default'}
                    className={question.parent_id ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}
                >
                    {question.parent_id ? 'Sub-question' : 'Main Question'}
                </Badge>
                {question.children && question.children.length > 0 && (
                    <span className="text-xs text-gray-500">
                        {question.children.length} sub-questions
                    </span>
                )}
            </div>
        );

        const statusDisplay = (
            <div className="flex flex-col space-y-1">
                <Badge
                    variant={question.answers && question.answers.length > 0 ? 'default' : 'secondary'}
                    className={question.answers && question.answers.length > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                >
                    {question.answers && question.answers.length > 0 ? (
                        <>
                            <CheckCircle className="mr-1 h-3 w-3" />
                            {question.answers.length} Answer{question.answers.length !== 1 ? 's' : ''}
                        </>
                    ) : (
                        <>
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            No Answers
                        </>
                    )}
                </Badge>
            </div>
        );

        const paperInfo = (
            <div className="text-xs text-gray-600 space-y-1">
                <div className="flex items-center">
                    <BookOpen className="mr-1 h-3 w-3" />
                    <span>Paper: {question.exam_paper_id?.slice(0, 8) || 'N/A'}</span>
                </div>
                <div className="flex items-center">
                    <FileText className="mr-1 h-3 w-3" />
                    <span>Set: {question.question_set_id?.slice(0, 8) || 'N/A'}</span>
                </div>
            </div>
        );

        const createdAtDisplay = (
            <div className="text-xs text-gray-600">
                <div>{formatDate(question.created_at)}</div>
                <div className="text-gray-500">{formatRelativeTime(question.created_at)}</div>
            </div>
        );

        const actions = (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                        <Link href={`/dashboard/questions/${question.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Question
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Manage Answers
                    </DropdownMenuItem>
                    {!question.parent_id && (
                        <DropdownMenuItem>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Sub-question
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );

        return {
            ...question,
            displayText: truncatedText,
            numberingDisplay,
            marksDisplay,
            typeDisplay,
            statusDisplay,
            paperInfo,
            createdAtDisplay,
            actions,
        };
    };

    const handleSearch = (searchTerm: string) => {
        setFilters(prev => ({ ...prev, search: searchTerm }));
        setCurrentPage(0);
    };

    const handleFilterChange = (key: keyof QuestionsFilters, value: string | undefined) => {
        setFilters(prev => ({ ...prev, [key]: value === 'all' ? undefined : value }));
        setCurrentPage(0);
    };

    // Load when filters/page change (skip if not initialized yet)
    useEffect(() => {
        if (!hasInitializedRef.current) return;
        void loadQuestions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, filters]);

    // Define table columns
    const columns = [
        {
            key: 'displayText' as keyof QuestionTableData,
            header: 'Question',
            cell: (item: QuestionTableData) => (
                <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                        <HelpCircle className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 mb-2 leading-tight">{item.displayText}</div>
                        <div className="flex items-center space-x-3 mb-1">
                            {item.numberingDisplay}
                            {item.marksDisplay}
                        </div>
                        <div className="flex items-center space-x-2">
                            {item.typeDisplay}
                        </div>
                    </div>
                </div>
            ),
            sortable: false,
            width: '40%',
        },
        {
            key: 'paperInfo' as keyof QuestionTableData,
            header: 'Paper & Set',
            cell: (item: QuestionTableData) => item.paperInfo,
            sortable: false,
            width: '15%',
        },
        {
            key: 'statusDisplay' as keyof QuestionTableData,
            header: 'Answers',
            cell: (item: QuestionTableData) => item.statusDisplay,
            sortable: false,
            width: '15%',
        },
        {
            key: 'createdAtDisplay' as keyof QuestionTableData,
            header: 'Created',
            cell: (item: QuestionTableData) => item.createdAtDisplay,
            sortable: true,
            width: '15%',
        },
        {
            key: 'actions' as keyof QuestionTableData,
            header: '',
            cell: (item: QuestionTableData) => item.actions,
            sortable: false,
            width: '15%',
        },
    ];

    const transformedQuestions = questions.map(transformQuestionForTable);

    return (
        <div className="space-y-6 p-6">
            <AdminBreadcrumb currentPage="All Questions" />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Questions Bank</h1>
                    <p className="text-gray-600 mt-1">
                        Manage and organize all questions in the system
                    </p>
                    {/* API Status Indicator */}
                    <div className="flex items-center gap-2 mt-2">
                        <div className={`w-2 h-2 rounded-full ${apiStatus === 'connected' ? 'bg-green-500' :
                            apiStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                            }`} />
                        <span className={`text-sm ${apiStatus === 'connected' ? 'text-green-700' :
                            apiStatus === 'error' ? 'text-red-700' : 'text-yellow-700'
                            }`}>
                            {apiStatus === 'connected' ? 'Connected to Backend' :
                                apiStatus === 'error' ? 'API Error - Using Mock Data' :
                                    'Using Mock Data'}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={loadQuestions}
                        disabled={loading}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Link href="/dashboard/questions/create">
                        <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Add Question
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalQuestions.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.mainQuestions.toLocaleString()} main, {stats.subQuestions.toLocaleString()} sub
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">With Answers</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.questionsWithAnswers.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            {((stats.questionsWithAnswers / stats.totalQuestions) * 100).toFixed(1)}% coverage
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Marks</CardTitle>
                        <Star className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalMarks.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            Avg {stats.averageMarks} per question
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recent</CardTitle>
                        <Clock className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.recentQuestions}</div>
                        <p className="text-xs text-muted-foreground">Added this week</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Search */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="lg:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search questions by content..."
                                    className="pl-10"
                                    value={filters.search || ''}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <Select
                            value={filters.question_type || 'all'}
                            onValueChange={(value) => handleFilterChange('question_type', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Question type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="main">Main Questions</SelectItem>
                                <SelectItem value="sub">Sub-questions</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.has_answers || 'all'}
                            onValueChange={(value) => handleFilterChange('has_answers', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Answer status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Questions</SelectItem>
                                <SelectItem value="yes">With Answers</SelectItem>
                                <SelectItem value="no">Without Answers</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.marks_range || 'all'}
                            onValueChange={(value) => handleFilterChange('marks_range', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Marks range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Marks</SelectItem>
                                <SelectItem value="low">Low (1-3 pts)</SelectItem>
                                <SelectItem value="medium">Medium (4-7 pts)</SelectItem>
                                <SelectItem value="high">High (8+ pts)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Data Table */}
            <Card>
                <LoadingOverlay isLoading={loading}>
                    <DataTable
                        data={transformedQuestions}
                        columns={columns}
                        title={`${totalItems} Questions`}
                        searchable={false}
                        filterable={false}
                        pagination={true}
                        pageSize={ITEMS_PER_PAGE}
                        emptyMessage="No questions found. Try adjusting your search criteria."
                        loading={loading}
                    />
                </LoadingOverlay>
            </Card>
        </div>
    );
}