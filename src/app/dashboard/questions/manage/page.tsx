'use client';

import React, { useState, useEffect } from 'react';
import {
    HelpCircle,
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    Eye,
    MoreHorizontal,
    FileText,
    BookOpen,
    Users,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Copy,
    Download,
    Upload,
    Clock,
    Star,
    Hash,
    List,
    Grid,
    ArrowLeft,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { HierarchicalQuestions } from '@/components/ui/hierarchical-questions';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { LoadingSpinner, LoadingOverlay } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { AdminBreadcrumb } from '@/components/ui/breadcrumb';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/stores/ui';
import { adminAPI } from '@/lib/api-admin';
import { formatDate } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import type { components } from '@/types/generated/api';

// Type definitions from API schema
type QuestionRead = components['schemas']['QuestionRead'];
type MainQuestionCreate = components['schemas']['MainQuestionCreate'];
type QuestionSetRead = components['schemas']['QuestionSetRead'];
type ExamPaperRead = components['schemas']['ExamPaperRead'];

// Interface for the display table data
interface QuestionTableData extends QuestionRead {
    displayText: string;
    numberingDisplay: React.ReactNode;
    marksDisplay: React.ReactNode;
    typeDisplay: React.ReactNode;
    statusBadge: React.ReactNode;
    paperInfo: React.ReactNode;
    createdAtFormatted: string;
    actions: React.ReactNode;
}

// Statistics interface
interface QuestionsStats {
    totalQuestions: number;
    mainQuestions: number;
    subQuestions: number;
    totalMarks: number;
    averageMarks: number;
    recentQuestions: number;
    questionsWithAnswers: number;
    orphanQuestions: number;
}

// Filter interface - matches questions list page
interface QuestionsFilters {
    search?: string;
    question_type?: 'main' | 'sub' | 'all';
    marks_range?: 'low' | 'medium' | 'high';
    exam_paper_id?: string;
    question_set_id?: string;
    institution_id?: string;
    course_id?: string;
    module_id?: string;
    programme_id?: string;
    numbering_style?: string;
    has_answers?: 'yes' | 'no' | 'all';
    sort_by?: 'relevance' | 'marks' | 'created_at';
    sort_order?: 'asc' | 'desc';
}

// Initial empty states - data will be loaded from API
const initialStats: QuestionsStats = {
    totalQuestions: 0,
    mainQuestions: 0,
    subQuestions: 0,
    totalMarks: 0,
    averageMarks: 0,
    recentQuestions: 0,
    questionsWithAnswers: 0,
    orphanQuestions: 0,
};

export default function QuestionsManagePage() {
    const { user } = useAuth();
    const { addNotification } = useUIStore();
    const router = useRouter();

    // State management - matches questions list page
    const [questions, setQuestions] = useState<QuestionRead[]>([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<QuestionsStats>(initialStats);
    const [viewMode, setViewMode] = useState<'hierarchical' | 'table'>('hierarchical');
    const [filters, setFilters] = useState<QuestionsFilters>({});
    const [selectedQuestion, setSelectedQuestion] = useState<QuestionRead | null>(null);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    const ITEMS_PER_PAGE = 20;

    // Role-based access control
    const currentUser = user || {
        role: { name: 'Admin' },
        email: 'admin@dev.local',
        name: 'Admin User'
    };

    const isAdmin = typeof currentUser?.role === 'string'
        ? (currentUser?.role === 'admin' || currentUser?.role === 'Admin')
        : (currentUser?.role?.name === 'admin' || currentUser?.role?.name === 'Admin');

    const isManager = typeof currentUser?.role === 'string'
        ? (currentUser?.role === 'manager' || currentUser?.role === 'Manager')
        : (currentUser?.role?.name === 'manager' || currentUser?.role?.name === 'Manager');

    // Check if user has permission to manage questions
    if (!isAdmin && !isManager) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
                    <h3 className="mt-4 text-lg font-semibold">Access Denied</h3>
                    <p className="mt-2 text-gray-600">
                        You need manager or administrator privileges to access questions management.
                    </p>
                </div>
            </div>
        );
    }

    // Load questions data - matches questions list page implementation
    const loadQuestions = async () => {
        try {
            setLoading(true);
            console.log('Loading questions with comprehensive filtering from backend API...');

            // Build search parameters - matches questions list page
            const searchParams: any = {
                question_type: filters.question_type || 'main',
                include_children: true, // Include sub-questions
                skip: currentPage * ITEMS_PER_PAGE,
                limit: ITEMS_PER_PAGE,
                highlight: true, // Enable search highlighting
            };

            // Add search query if provided
            if (filters.search && filters.search.trim() !== '') {
                searchParams.q = filters.search.trim();
            }

            // Add filters - matches questions list page
            if (filters.exam_paper_id) {
                searchParams.exam_paper_id = filters.exam_paper_id;
            }
            if (filters.question_set_id) {
                searchParams.question_set_id = filters.question_set_id;
            }
            if (filters.institution_id) {
                searchParams.institution_id = filters.institution_id;
            }
            if (filters.course_id) {
                searchParams.course_id = filters.course_id;
            }
            if (filters.module_id) {
                searchParams.module_id = filters.module_id;
            }
            if (filters.programme_id) {
                searchParams.programme_id = filters.programme_id;
            }
            if (filters.numbering_style) {
                searchParams.numbering_style = filters.numbering_style;
            }
            if (filters.has_answers && filters.has_answers !== 'all') {
                searchParams.has_answers = filters.has_answers === 'yes';
            }

            // Add marks range filter - matches questions list page
            if (filters.marks_range) {
                const marksMin = getMarksRangeMin(filters.marks_range);
                const marksMax = getMarksRangeMax(filters.marks_range);
                if (marksMin !== undefined) searchParams.marks_min = marksMin;
                if (marksMax !== undefined) searchParams.marks_max = marksMax;
            }

            // Add sorting - matches questions list page
            searchParams.sort_by = filters.sort_by || 'relevance';
            searchParams.sort_order = filters.sort_order || 'desc';

            // Use search endpoint for all queries (more powerful than list) - matches questions list page
            const questionsResponse = await adminAPI.questions.search(searchParams);

            console.log('Questions API response:', questionsResponse);

            if (questionsResponse.data?.data) {
                const responseData = questionsResponse.data.data;
                const questionsData = responseData.items || [];

                // Questions already include their children from the API
                setQuestions(questionsData);
                setTotalItems(responseData.total || 0);
                setTotalPages(Math.ceil((responseData.total || 0) / ITEMS_PER_PAGE));

                // Calculate stats from loaded data - matches questions list page
                const totalSubQuestions = questionsData.reduce((sum: any, q: any) => sum + (q.children?.length || 0), 0);
                const questionsWithAnswers = questionsData.filter((q: any) => q.answers && q.answers.length > 0).length;
                const totalMarks = questionsData.reduce((sum: any, q: any) => {
                    const mainMarks = q.marks || 0;
                    const subMarks = (q.children || []).reduce((subSum: any, sub: any) => subSum + (sub.marks || 0), 0);
                    return sum + mainMarks + subMarks;
                }, 0);
                const totalQuestionCount = questionsData.length + totalSubQuestions;
                const averageMarks = totalQuestionCount > 0 ? totalMarks / totalQuestionCount : 0;

                // For recent questions, count those created in the last 7 days
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                const recentQuestions = questionsData.filter((q: any) => new Date(q.created_at) > sevenDaysAgo).length;

                // Orphan questions are main questions without question_set_id or exam_paper_id
                const orphanQuestions = questionsData.filter((q: any) => !q.question_set_id && !q.exam_paper_id).length;

                setStats({
                    totalQuestions: totalQuestionCount,
                    mainQuestions: questionsData.length,
                    subQuestions: totalSubQuestions,
                    questionsWithAnswers,
                    totalMarks,
                    averageMarks: Math.round(averageMarks * 10) / 10,
                    recentQuestions,
                    orphanQuestions,
                });
            }
        } catch (error) {
            console.error('Error loading questions:', error);
            addNotification({
                type: 'error',
                title: 'Failed to load questions',
                message: error instanceof Error ? error.message : 'Please try again later.',
            });
        } finally {
            setLoading(false);
        }
    };


    // Transform question data for table display
    const transformQuestionForTable = (question: QuestionRead): QuestionTableData => {
        // Extract text content from the QuestionTextSchema structure
        let displayText = 'No text content';
        if (question.text?.blocks && Array.isArray(question.text.blocks)) {
            // Extract text from blocks (Editor.js format)
            const textBlocks = question.text.blocks
                .filter(block => block.type === 'paragraph' || block.type === 'header')
                .map(block => block.data?.text || '')
                .join(' ');
            displayText = textBlocks || 'No text content';
        }

        const truncatedText = displayText.length > 100 ?
            `${displayText.substring(0, 100)}...` : displayText;

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
                {question.marks || 0} marks
            </div>
        );

        const typeDisplay = (
            <div className="flex flex-col space-y-1">
                <Badge variant={question.parent_id ? 'secondary' : 'default'} className="text-xs">
                    {question.parent_id ? 'Sub-question' : 'Main Question'}
                </Badge>
                {question.children && question.children.length > 0 && (
                    <span className="text-xs text-gray-500">
                        {question.children.length} sub-questions
                    </span>
                )}
            </div>
        );

        const statusBadge = (
            <Badge
                variant={question.answers && question.answers.length > 0 ? 'default' : 'secondary'}
                className={question.answers && question.answers.length > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
            >
                {question.answers && question.answers.length > 0 ? (
                    <>
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Has Answers
                    </>
                ) : (
                    <>
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        No Answers
                    </>
                )}
            </Badge>
        );

        const paperInfo = (
            <div className="text-xs text-gray-600">
                <div>Paper: {question.exam_paper_id || 'N/A'}</div>
                <div>Set: {question.question_set_id || 'N/A'}</div>
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
                    <DropdownMenuItem onClick={() => handleViewQuestion(question.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEditQuestion(question)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleManageAnswers(question.id)}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Manage Answers
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAddSubQuestion(question.id)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Sub-question
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleDuplicateQuestion(question.id)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="text-red-600"
                    >
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
            statusBadge,
            paperInfo,
            createdAtFormatted: formatDate(question.created_at),
            actions,
        };
    };

    // Action handlers
    const handleCreateQuestion = () => {
        setSelectedQuestion(null);
        setShowCreateDialog(true);
    };

    const handleEditQuestion = (question: QuestionRead) => {
        setSelectedQuestion(question);
        setShowEditDialog(true);
    };

    const handleViewQuestion = (questionId: string) => {
        router.push(`/dashboard/questions/${questionId}`);
    };

    const handleDeleteQuestion = async (questionId: string) => {
        if (!confirm('Are you sure you want to delete this question? This action cannot be undone.')) return;

        try {
            await adminAPI.questions.delete(questionId);
            addNotification({
                type: 'success',
                title: 'Question Deleted',
                message: 'Question has been deleted successfully.',
            });
            loadQuestions(); // Reload the questions list
        } catch (error) {
            console.error('Error deleting question:', error);
            addNotification({
                type: 'error',
                title: 'Delete Failed',
                message: error instanceof Error ? error.message : 'Failed to delete the question. Please try again.',
            });
        }
    };

    const handleManageAnswers = (questionId: string) => {
        addNotification({
            type: 'info',
            title: 'Manage Answers',
            message: `Opening answer management for question ${questionId}...`,
        });
    };

    const handleAddSubQuestion = (parentQuestionId: string) => {
        addNotification({
            type: 'info',
            title: 'Add Sub-question',
            message: `Adding sub-question to question ${parentQuestionId}...`,
        });
    };

    const handleDuplicateQuestion = (questionId: string) => {
        addNotification({
            type: 'info',
            title: 'Duplicate Question',
            message: `Creating copy of question ${questionId}...`,
        });
    };

    const handleSearch = (searchTerm: string) => {
        setFilters(prev => ({ ...prev, search: searchTerm }));
        setCurrentPage(0);
    };

    const handleFilterChange = (key: keyof QuestionsFilters, value: string | undefined) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(0);
    };

    // Helper functions for marks range - matches questions list page
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

    // Statistics are calculated from loaded questions data
    // This provides real-time stats based on current filters and is more accurate

    // Load data on mount and when filters change
    useEffect(() => {
        loadQuestions();
    }, [currentPage, filters]);

    // Define table columns
    const columns = [
        {
            key: 'select' as keyof QuestionTableData,
            header: 'Select',
            cell: (item: QuestionTableData) => (
                <input
                    type="checkbox"
                    checked={selectedQuestions.includes(item.id)}
                    onChange={(e) => {
                        if (e.target.checked) {
                            setSelectedQuestions(prev => [...prev, item.id]);
                        } else {
                            setSelectedQuestions(prev => prev.filter(id => id !== item.id));
                        }
                    }}
                    className="rounded border-gray-300"
                />
            ),
            sortable: false,
            width: '5%',
        },
        {
            key: 'displayText' as keyof QuestionTableData,
            header: 'Question Content',
            cell: (item: QuestionTableData) => (
                <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100">
                            <HelpCircle className="h-4 w-4 text-purple-600" />
                        </div>
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 mb-1 line-clamp-2">{item.displayText}</div>
                        <div className="flex items-center space-x-2 mb-1">
                            {item.numberingDisplay}
                        </div>
                        <div className="flex items-center space-x-2">
                            {item.marksDisplay}
                            {item.typeDisplay}
                        </div>
                        {item.children && item.children.length > 0 && (
                            <div className="mt-1">
                                <Badge variant="outline" className="text-xs">
                                    <Hash className="mr-1 h-3 w-3" />
                                    {item.children.length} sub-questions
                                </Badge>
                            </div>
                        )}
                    </div>
                </div>
            ),
            sortable: false,
            width: '40%',
        },
        {
            key: 'paperInfo' as keyof QuestionTableData,
            header: 'Context',
            cell: (item: QuestionTableData) => (
                <div className="text-sm">
                    <div className="flex items-center space-x-1 mb-1">
                        <BookOpen className="h-3 w-3 text-blue-500" />
                        <span className="text-gray-600">
                            {item.exam_paper_id ? `Paper ${item.exam_paper_id.slice(0, 8)}` : 'No Paper'}
                        </span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <FileText className="h-3 w-3 text-green-500" />
                        <span className="text-gray-600">
                            {item.question_set_id ? `Set ${item.question_set_id.slice(0, 8)}` : 'No Set'}
                        </span>
                    </div>
                    {item.parent_id && (
                        <div className="mt-1">
                            <Badge variant="secondary" className="text-xs">
                                Sub-question
                            </Badge>
                        </div>
                    )}
                </div>
            ),
            sortable: false,
            width: '15%',
        },
        {
            key: 'statusBadge' as keyof QuestionTableData,
            header: 'Status',
            cell: (item: QuestionTableData) => (
                <div className="space-y-1">
                    {item.statusBadge}
                    <div className="text-xs text-gray-500">
                        {item.answers && item.answers.length > 0 ? (
                            <span className="text-green-600">{item.answers.length} answer{item.answers.length !== 1 ? 's' : ''}</span>
                        ) : (
                            <span className="text-red-600">No answers</span>
                        )}
                    </div>
                </div>
            ),
            sortable: false,
            width: '15%',
        },
        {
            key: 'createdAtFormatted' as keyof QuestionTableData,
            header: 'Created',
            cell: (item: QuestionTableData) => (
                <div className="text-sm">
                    <div className="text-gray-900 font-medium">{item.createdAtFormatted}</div>
                    <div className="text-gray-500 text-xs">
                        {(() => {
                            const now = new Date();
                            const created = new Date(item.created_at);
                            const diffTime = Math.abs(now.getTime() - created.getTime());
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            return diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;
                        })()}
                    </div>
                </div>
            ),
            sortable: true,
            width: '15%',
        },
        {
            key: 'actions' as keyof QuestionTableData,
            header: 'Actions',
            cell: (item: QuestionTableData) => item.actions,
            sortable: false,
            width: '10%',
        },
    ];

    const transformedQuestions = questions.map(transformQuestionForTable);

    return (
        <div className="space-y-6 p-6">
            <AdminBreadcrumb currentPage="Questions Management" />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Questions Management</h1>
                    <p className="text-gray-600">
                        Manage exam questions, answers, and question sets
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 mr-4">
                        <Button
                            variant={viewMode === 'hierarchical' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('hierarchical')}
                        >
                            <BookOpen className="h-4 w-4 mr-1" />
                            Hierarchical
                        </Button>
                        <Button
                            variant={viewMode === 'table' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('table')}
                        >
                            <List className="h-4 w-4 mr-1" />
                            Table
                        </Button>
                    </div>
                    <Button variant="outline" onClick={() => addNotification({ type: 'info', title: 'Import', message: 'Question import feature coming soon...' })}>
                        <Upload className="h-4 w-4 mr-2" />
                        Import
                    </Button>
                    <Button onClick={handleCreateQuestion} className="flex items-center space-x-2">
                        <Plus className="h-4 w-4" />
                        <span>Add Question</span>
                    </Button>
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
                        <div className="text-2xl font-bold">{stats.totalQuestions}</div>
                        <p className="text-xs text-muted-foreground">All questions in system</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Main vs Sub</CardTitle>
                        <List className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.mainQuestions}/{stats.subQuestions}</div>
                        <p className="text-xs text-muted-foreground">Main / Sub questions</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">With Answers</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.questionsWithAnswers}</div>
                        <p className="text-xs text-muted-foreground">
                            {((stats.questionsWithAnswers / stats.totalQuestions) * 100).toFixed(1)}% coverage
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Marks</CardTitle>
                        <Star className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.averageMarks}</div>
                        <p className="text-xs text-muted-foreground">Per question average</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Search */}
            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        {/* Main Search and Quick Filters */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                        placeholder="Search questions by text, number, or content..."
                                    className="pl-10"
                                    value={filters.search || ''}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <Select
                            value={filters.has_answers || 'all'}
                            onValueChange={(value) => handleFilterChange('has_answers', value === 'all' ? undefined : value as any)}
                        >
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Filter by answers" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Questions</SelectItem>
                                <SelectItem value="yes">With Answers</SelectItem>
                                <SelectItem value="no">Without Answers</SelectItem>
                            </SelectContent>
                        </Select>

                            <Select
                                value={filters.question_type || 'all'}
                                onValueChange={(value) => handleFilterChange('question_type', value === 'all' ? undefined : value as any)}
                            >
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Question type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="main">Main Questions</SelectItem>
                                    <SelectItem value="sub">Sub Questions</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button
                                variant="outline"
                                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                className="w-full sm:w-auto"
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                {showAdvancedFilters ? 'Hide' : 'Show'} Filters
                            </Button>
                        </div>

                        {/* Advanced Filters */}
                        {showAdvancedFilters && (
                            <div className="border-t pt-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Select
                            value={filters.numbering_style || 'all'}
                            onValueChange={(value) => handleFilterChange('numbering_style', value === 'all' ? undefined : value)}
                        >
                                        <SelectTrigger>
                                <SelectValue placeholder="Numbering style" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Styles</SelectItem>
                                <SelectItem value="numeric">Numeric (1, 2, 3)</SelectItem>
                                <SelectItem value="alphabetic">Alphabetic (a, b, c)</SelectItem>
                                <SelectItem value="roman">Roman (i, ii, iii)</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.marks_range || 'all'}
                            onValueChange={(value) => handleFilterChange('marks_range', value === 'all' ? undefined : value as any)}
                        >
                                        <SelectTrigger>
                                <SelectValue placeholder="Marks range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Marks</SelectItem>
                                <SelectItem value="low">Low (1-3)</SelectItem>
                                <SelectItem value="medium">Medium (4-7)</SelectItem>
                                <SelectItem value="high">High (8+)</SelectItem>
                            </SelectContent>
                        </Select>

                                    <Select
                                        value={filters.sort_by || 'relevance'}
                                        onValueChange={(value) => handleFilterChange('sort_by', value as any)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sort by" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="relevance">Relevance</SelectItem>
                                            <SelectItem value="marks">Marks</SelectItem>
                                            <SelectItem value="created_at">Created Date</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Select
                                        value={filters.sort_order || 'desc'}
                                        onValueChange={(value) => handleFilterChange('sort_order', value as any)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sort order" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="desc">Descending</SelectItem>
                                            <SelectItem value="asc">Ascending</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setFilters({});
                                                setCurrentPage(0);
                                            }}
                                        >
                                            Clear All
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Questions Display */}
            <LoadingOverlay isLoading={loading}>
                {viewMode === 'hierarchical' ? (
                    <HierarchicalQuestions
                        questionSets={[]}
                        questions={questions}
                        onEditQuestion={handleEditQuestion}
                        onDeleteQuestion={handleDeleteQuestion}
                        onViewQuestion={handleViewQuestion}
                        onAddSubQuestion={handleAddSubQuestion}
                        onEditQuestionSet={(questionSet) => {
                            addNotification({
                                type: 'info',
                                title: 'Edit Question Set',
                                message: `Opening editor for question set ${questionSet.title || questionSet.id}...`,
                            });
                        }}
                        onDeleteQuestionSet={async (questionSetId) => {
                            if (confirm('Are you sure you want to delete this question set? This will also delete all questions in it.')) {
                                try {
                                    await adminAPI.questionSets.delete(questionSetId);
                                    addNotification({
                                        type: 'success',
                                        title: 'Question Set Deleted',
                                        message: 'Question set has been deleted successfully.',
                                    });
                                    loadQuestions();
                                } catch (error) {
                                    addNotification({
                                        type: 'error',
                                        title: 'Delete Failed',
                                        message: 'Failed to delete the question set. Please try again.',
                                    });
                                }
                            }
                        }}
                        onAddQuestion={() => handleCreateQuestion()}
                        showActions={true}
                        defaultExpanded={false}
                        emptyMessage="No question sets found. Create your first question to get started."
                    />
                ) : (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div>
                                        <CardTitle className="text-lg">
                                            Questions Table
                                            {selectedQuestions.length > 0 && (
                                                <Badge variant="secondary" className="ml-2">
                                                    {selectedQuestions.length} selected
                                                </Badge>
                                            )}
                                        </CardTitle>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Showing {questions.length} of {totalItems} questions
                                        </p>
                                    </div>
                                    {questions.length > 0 && (
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={selectedQuestions.length === questions.length}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedQuestions(questions.map(q => q.id));
                                                    } else {
                                                        setSelectedQuestions([]);
                                                    }
                                                }}
                                                className="rounded border-gray-300"
                                            />
                                            <span className="text-sm text-gray-600">Select All</span>
                                        </div>
                                    )}
                                </div>
                                {selectedQuestions.length > 0 && (
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                        addNotification({
                                            type: 'info',
                                            title: 'Export Started',
                                                    message: `Exporting ${selectedQuestions.length} questions...`,
                                                });
                                            }}
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Export ({selectedQuestions.length})
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                        addNotification({
                                            type: 'info',
                                            title: 'Bulk Edit',
                                                    message: `Editing marks for ${selectedQuestions.length} questions...`,
                                                });
                                            }}
                                        >
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit Marks
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => {
                                                if (confirm(`Are you sure you want to delete ${selectedQuestions.length} questions? This action cannot be undone.`)) {
                                            addNotification({
                                                type: 'warning',
                                                title: 'Bulk Delete',
                                                        message: `Deleting ${selectedQuestions.length} questions...`,
                                                    });
                                                }
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete ({selectedQuestions.length})
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSelectedQuestions([])}
                                        >
                                            Clear Selection
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <DataTable
                                data={transformedQuestions}
                                columns={columns}
                                title=""
                                searchable={false}
                                filterable={false}
                                pagination={true}
                                pageSize={ITEMS_PER_PAGE}
                                actions={[]}
                            emptyMessage="No questions found. Create your first question to get started."
                            loading={loading}
                        />
                        </CardContent>
                    </Card>
                )}
            </LoadingOverlay>
        </div>
    );
}