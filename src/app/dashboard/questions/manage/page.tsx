'use client';

import React, { useState, useEffect, useRef } from 'react';
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
    RefreshCw,
    Unlink,
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
import { formatDate, formatRelativeTime } from '@/lib/utils';
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
    statusDisplay: React.ReactNode;
    paperInfo: React.ReactNode;
    createdAtDisplay: React.ReactNode;
    actions: React.ReactNode;
}

// Statistics interface (renamed to match main questions page)
interface QuestionsOverviewStats {
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
const initialStats: QuestionsOverviewStats = {
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
    const [stats, setStats] = useState<QuestionsOverviewStats>(initialStats);
    const [viewMode, setViewMode] = useState<'hierarchical' | 'table'>('table');
    const [filters, setFilters] = useState<QuestionsFilters>({});
    const [selectedQuestion, setSelectedQuestion] = useState<QuestionRead | null>(null);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [apiStatus, setApiStatus] = useState<'connected' | 'error'>('error');
    const hasInitializedRef = useRef(false);

    // Academic hierarchy data for filters
    const [institutions, setInstitutions] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [modules, setModules] = useState<any[]>([]);
    const [programmes, setProgrammes] = useState<any[]>([]);
    const [loadingHierarchy, setLoadingHierarchy] = useState(false);

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

    // Load academic hierarchy data for filters
    const loadHierarchyData = async () => {
        try {
            setLoadingHierarchy(true);
            const [institutionsResponse, coursesResponse, modulesResponse, programmesResponse] = await Promise.all([
                adminAPI.institutions.list({ limit: 100 }),
                adminAPI.courses.list({ limit: 100 }),
                adminAPI.modules.list({ limit: 100 }),
                adminAPI.programmes.list({ limit: 100 })
            ]);

            setInstitutions(institutionsResponse.data?.data?.items || []);
            setCourses(coursesResponse.data?.data?.items || []);
            setModules(modulesResponse.data?.data?.items || []);
            setProgrammes(programmesResponse.data?.data?.items || []);
        } catch (error) {
            console.error('Error loading hierarchy data:', error);
        } finally {
            setLoadingHierarchy(false);
        }
    };

    // Load questions data - matches questions list page implementation
    const loadQuestions = async () => {
        try {
            setLoading(true);
            console.log('Loading questions with comprehensive filtering from backend API...');

            // Build search parameters - matches questions list page
            const searchParams: any = {
                question_type: filters.question_type || 'main',
                include_children: true, // Include sub-questions
                skip: currentPage * pageSize,
                limit: pageSize,
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
                setTotalPages(Math.ceil((responseData.total || 0) / pageSize));

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

                setApiStatus('connected');
            }
        } catch (error) {
            console.error('Error loading questions:', error);
            setApiStatus('error');
            addNotification({
                type: 'error',
                title: 'Failed to load questions',
                message: error instanceof Error ? error.message : 'Please try again later.',
            });

            // Do not fallback – keep empty state
            setQuestions([]);
            setTotalItems(0);
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
                    {!question.parent_id && (
                        <DropdownMenuItem onClick={() => handleAddSubQuestion(question.id)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Sub-question
                        </DropdownMenuItem>
                    )}
                    {question.parent_id && (
                        <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleRemoveSubQuestion(question.parent_id!, question.id)}
                        >
                            <Unlink className="mr-2 h-4 w-4" />
                            Remove from Main Question
                        </DropdownMenuItem>
                    )}
                    {!question.parent_id && question.question_set_id && (
                        <DropdownMenuItem
                            className="text-orange-600"
                            onClick={() => handleUnlinkFromQuestionSet(question.id)}
                        >
                            <Unlink className="mr-2 h-4 w-4" />
                            Unlink from Question Set
                        </DropdownMenuItem>
                    )}
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
            statusDisplay,
            paperInfo,
            createdAtDisplay,
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

    // Handle removing sub-question from main question
    const handleRemoveSubQuestion = async (mainQuestionId: string, subQuestionId: string) => {
        try {
            await adminAPI.questions.removeSubQuestion(mainQuestionId, subQuestionId);
            useUIStore.getState().addNotification({
                type: 'success',
                title: 'Success',
                message: 'Sub-question removed successfully'
            });
            // Reload questions to reflect changes
            void loadQuestions();
        } catch (error) {
            console.error('Error removing sub-question:', error);
            useUIStore.getState().addNotification({
                type: 'error',
                title: 'Error',
                message: 'Failed to remove sub-question'
            });
        }
    };

    // Handle unlinking question from question set
    const handleUnlinkFromQuestionSet = async (mainQuestionId: string) => {
        try {
            await adminAPI.questions.unlinkFromQuestionSet(mainQuestionId);
            useUIStore.getState().addNotification({
                type: 'success',
                title: 'Success',
                message: 'Question unlinked from question set successfully'
            });
            // Reload questions to reflect changes
            void loadQuestions();
        } catch (error) {
            console.error('Error unlinking from question set:', error);
            useUIStore.getState().addNotification({
                type: 'error',
                title: 'Error',
                message: 'Failed to unlink from question set'
            });
        }
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

    // Initial load (guarded to avoid React StrictMode double-fetch in dev)
    useEffect(() => {
        if (!hasInitializedRef.current) {
            hasInitializedRef.current = true;
            void loadQuestions();
            void loadHierarchyData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Load when filters/page change (skip if not initialized yet)
    useEffect(() => {
        if (!hasInitializedRef.current) return;
        void loadQuestions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, filters, pageSize]);

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
            width: '45%',
        },
        {
            key: 'createdAtDisplay' as keyof QuestionTableData,
            header: 'Created',
            cell: (item: QuestionTableData) => item.createdAtDisplay,
            sortable: true,
            width: '15%',
        },
        {
            key: 'institution' as keyof QuestionTableData,
            header: 'Institution',
            cell: (item: QuestionTableData) => (
                <div className="max-w-[120px]">
                    <div className="font-medium text-sm truncate" title={item.institution?.name || 'N/A'}>
                        {item.institution?.name || 'N/A'}
                    </div>
                </div>
            ),
            sortable: false,
            width: '15%',
        },
        {
            key: 'programme' as keyof QuestionTableData,
            header: 'Programme',
            cell: (item: QuestionTableData) => (
                <div className="max-w-[120px]">
                    <div className="font-medium text-sm truncate" title={item.programme?.name || 'N/A'}>
                        {item.programme?.name || 'N/A'}
                    </div>
                </div>
            ),
            sortable: false,
            width: '15%',
        },
        {
            key: 'course' as keyof QuestionTableData,
            header: 'Course',
            cell: (item: QuestionTableData) => (
                <div className="max-w-[120px]">
                    <div className="font-medium text-sm truncate" title={item.course?.name || 'N/A'}>
                        {item.course?.name || 'N/A'}
                    </div>
                </div>
            ),
            sortable: false,
            width: '15%',
        },
        {
            key: 'modules' as keyof QuestionTableData,
            header: 'Modules',
            cell: (item: QuestionTableData) => (
                <div className="max-w-[150px]">
                    {item.modules && item.modules.length > 0 ? (
                        <div className="space-y-1">
                            {item.modules.slice(0, 2).map((module, index) => (
                                <div key={index} className="text-xs bg-gray-100 px-2 py-1 rounded truncate" title={module.name || 'Unnamed Module'}>
                                    {module.name || 'Unnamed Module'}
                                </div>
                            ))}
                            {item.modules.length > 2 && (
                                <div className="text-xs text-gray-500">
                                    +{item.modules.length - 2} more
                                </div>
                            )}
                        </div>
                    ) : (
                        <span className="text-gray-400 text-sm">No modules</span>
                    )}
                </div>
            ),
            sortable: false,
            width: '20%',
        },
        {
            key: 'actions' as keyof QuestionTableData,
            header: '',
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
                    <h1 className="text-2xl font-bold text-gray-900">Questions Management</h1>
                    <p className="text-gray-600 mt-1">
                        Manage exam questions, answers, and question sets
                    </p>
                    {/* API Status Indicator */}
                    <div className="flex items-center gap-2 mt-2">
                        <div className={`w-2 h-2 rounded-full ${apiStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className={`text-sm ${apiStatus === 'connected' ? 'text-green-700' : 'text-red-700'}`}>
                            {apiStatus === 'connected' ? 'Connected to Backend' : 'API Connection Error'}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center space-x-1 mr-2">
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
                            <FileText className="h-4 w-4 mr-1" />
                            Table
                        </Button>
                    </div>
                    <Button
                        variant="outline"
                        onClick={loadQuestions}
                        disabled={loading}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button variant="outline" onClick={() => addNotification({ type: 'info', title: 'Import', message: 'Question import feature coming soon...' })}>
                        <Upload className="h-4 w-4 mr-2" />
                        Import
                    </Button>
                    <Button onClick={handleCreateQuestion} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add Question
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
                            {stats.totalQuestions > 0 ? ((stats.questionsWithAnswers / stats.totalQuestions) * 100).toFixed(1) : 0}% coverage
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
                        <CardTitle className="text-sm font-medium">Recent Questions</CardTitle>
                        <Clock className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.recentQuestions.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Created in last 7 days</p>
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
                                pagination={{
                                    currentPage: currentPage,
                                    totalPages: totalPages,
                                    totalItems: totalItems,
                                    pageSize: pageSize,
                                    onPageChange: (newPage: number) => setCurrentPage(newPage),
                                    onPageSizeChange: (newSize: number) => {
                                        setPageSize(newSize);
                                        setCurrentPage(0);
                                    },
                                }}
                                actions={[]}
                                emptyMessage="No questions found matching your filters"
                                loading={loading}
                            />
                        </CardContent>
                    </Card>
                )}
            </LoadingOverlay>
        </div>
    );
}