'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Editor from '@/components/ui/editor'
import { OutputData } from '@editorjs/editorjs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { adminAPI } from '@/lib/api-admin'
import { useUIStore } from '@/stores/ui'
import type { QuestionSetRead } from '@/lib/api-admin'
import type { components } from '@/types/generated/api'

type QuestionRead = components['schemas']['QuestionRead']

// Question form schema
const questionFormSchema = z.object({
    text: z.custom<OutputData>(data => data && (data as OutputData).blocks.length > 0, 'Question text cannot be empty'),
    marks: z.coerce.number().min(0, 'Marks must be positive'),
    numbering_style: z.enum(['roman', 'alpha', 'numerical']),
    question_number: z.string().min(1, 'Question number is required'),
    question_type: z.enum(['main', 'sub']),
    parent_id: z.string().optional(),
    question_set_id: z.string().optional(),
})

type QuestionFormData = z.infer<typeof questionFormSchema>

interface QuestionFormProps {
    questionSetId?: string
    examPaperId: string
    question?: any // For editing existing questions
    onSuccess?: () => void
    onCancel?: () => void
    availableQuestionSets?: QuestionSetRead[]
    availableMainQuestions?: QuestionRead[]
}

export function QuestionForm({ questionSetId, examPaperId, question, onSuccess, onCancel, availableQuestionSets, availableMainQuestions }: QuestionFormProps) {
    const { addNotification } = useUIStore()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const isEditing = !!question

    const form = useForm<QuestionFormData>({
        resolver: zodResolver(questionFormSchema),
        defaultValues: {
            text: {
                time: Date.now(),
                blocks: [],
                version: '2.22.2'
            },
            marks: 1,
            numbering_style: 'roman',
            question_number: '1',
            question_type: 'main',
            parent_id: '',
            question_set_id: questionSetId || '',
        },
    })

    // Update question number when numbering style changes
    useEffect(() => {
        const numberingStyle = form.watch('numbering_style');
        const currentQuestionNumber = form.getValues('question_number');

        if (numberingStyle === 'roman') {
            if (!currentQuestionNumber.match(/^(i|ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii|xiii|xiv|xv|xvi|xvii|xviii|xix|xx)$/)) {
                form.setValue('question_number', 'i');
            }
        } else if (numberingStyle === 'alpha') {
            if (!currentQuestionNumber.match(/^[a-z]$/)) {
                form.setValue('question_number', 'a');
            }
        } else if (numberingStyle === 'numerical') {
            if (!currentQuestionNumber.match(/^\d+$/)) {
                form.setValue('question_number', '1');
            }
        }
    }, [form.watch('numbering_style')]);

    // Populate form with existing question data for editing
    useEffect(() => {
        if (question) {
            form.reset({
                text: question.text,
                marks: question.marks || 1,
                numbering_style: question.numbering_style || 'roman',
                question_number: question.question_number || '1',
                question_type: question.is_sub_question ? 'sub' : 'main',
                parent_id: question.parent_id || '',
                question_set_id: question.question_set_id || '',
            })
        }
    }, [question, form])

    const onSubmit = async (data: QuestionFormData) => {
        try {
            setIsSubmitting(true)

            const questionPayload = {
                text: { ...data.text, time: data.text.time || Date.now() },
                marks: data.marks,
                numbering_style: data.numbering_style,
                question_number: data.question_number,
                question_set_id: data.question_set_id || questionSetId || '',
                exam_paper_id: examPaperId,
                ...(data.question_type === 'sub' && data.parent_id && { parent_id: data.parent_id })
            }

            let response
            if (isEditing) {
                response = await adminAPI.questions.update(question.id, questionPayload as any)
            } else {
                if (data.question_type === 'sub') {
                    response = await adminAPI.questions.createSubQuestion({
                        text: { ...data.text, time: data.text.time || Date.now() },
                        marks: data.marks,
                        numbering_style: data.numbering_style,
                        question_number: data.question_number,
                        parent_id: data.parent_id || '',
                    } as any)
                } else {
                    response = await adminAPI.questions.createMain(questionPayload as any)
                }
            }

            if (!response.error) {
                addNotification({
                    type: 'success',
                    title: 'Success',
                    message: `Question ${isEditing ? 'updated' : 'created'} successfully!`
                })
                onSuccess?.()
            } else {
                const errorMessage = (response.error as any)?.message || 'Failed to save question'
                addNotification({
                    type: 'error',
                    title: 'Error',
                    message: errorMessage
                })
            }
        } catch (error) {
            console.error('Error saving question:', error)
            addNotification({
                type: 'error',
                title: 'Error',
                message: 'An unexpected error occurred while saving the question.'
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{isEditing ? 'Edit Question' : 'Create New Question'}</CardTitle>
                <CardDescription>
                    {isEditing ? 'Update the question details below.' : 'Fill in the details to create a new question in this question set.'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Question Type */}
                        <FormField
                            control={form.control}
                            name="question_type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Question Type</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select question type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="main">Main Question</SelectItem>
                                            <SelectItem value="sub">Sub Question</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Main questions are top-level questions. Sub questions are follow-up questions.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Question Set (for main questions) */}
                        {form.watch('question_type') === 'main' && availableQuestionSets && availableQuestionSets.length > 0 && (
                            <FormField
                                control={form.control}
                                name="question_set_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Question Set</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a question set" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {availableQuestionSets.map((qs) => (
                                                    <SelectItem key={qs.id} value={qs.id}>
                                                        {qs.title || 'Unnamed Set'} ({qs.questions_count || 0} questions)
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            Choose the question set that this main question belongs to.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* Parent Question (for sub questions) */}
                        {form.watch('question_type') === 'sub' && availableMainQuestions && availableMainQuestions.length > 0 && (
                            <FormField
                                control={form.control}
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
                                                {availableMainQuestions.map((q) => (
                                                    <SelectItem key={q.id} value={q.id}>
                                                        Q{q.question_number}: {String(q.text?.blocks?.[0]?.data?.text || 'Question')}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            Choose the main question that this sub-question belongs to.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* Numbering Style (first field) */}
                        <FormField
                            control={form.control}
                            name="numbering_style"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Numbering Style</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select numbering style" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="roman">Roman (i, ii, iii)</SelectItem>
                                            <SelectItem value="alpha">Alphabetic (a, b, c)</SelectItem>
                                            <SelectItem value="numerical">Numerical (1, 2, 3)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        How this question should be numbered.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Question Number */}
                            <FormField
                                control={form.control}
                                name="question_number"
                                render={({ field }) => {
                                    const numberingStyle = form.watch('numbering_style');
                                    const getNumberOptions = () => {
                                        if (numberingStyle === 'roman') {
                                            return [
                                                'i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x',
                                                'xi', 'xii', 'xiii', 'xiv', 'xv', 'xvi', 'xvii', 'xviii', 'xix', 'xx'
                                            ];
                                        } else if (numberingStyle === 'alpha') {
                                            return [
                                                'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
                                                'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
                                            ];
                                        } else if (numberingStyle === 'numerical') {
                                            return Array.from({ length: 50 }, (_, i) => (i + 1).toString());
                                        }
                                    };

                                    return (
                                        <FormItem>
                                            <FormLabel>Question Number</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select number" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {getNumberOptions().map((option) => (
                                                        <SelectItem key={option} value={option}>
                                                            {option}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                Choose the question number or identifier.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    );
                                }}
                            />

                            {/* Marks */}
                            <FormField
                                control={form.control}
                                name="marks"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Marks</FormLabel>
                                        <Select onValueChange={(value) => field.onChange(parseFloat(value))} value={field.value?.toString()}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select marks" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {/* Whole numbers 1-20 */}
                                                {Array.from({ length: 20 }, (_, i) => (
                                                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                                                        {i + 1}
                                                    </SelectItem>
                                                ))}
                                                {/* Decimal options */}
                                                <SelectItem value="0.5">0.5</SelectItem>
                                                <SelectItem value="1.5">1.5</SelectItem>
                                                <SelectItem value="2.5">2.5</SelectItem>
                                                <SelectItem value="3.5">3.5</SelectItem>
                                                <SelectItem value="4.5">4.5</SelectItem>
                                                <SelectItem value="5.5">5.5</SelectItem>
                                                <SelectItem value="6.5">6.5</SelectItem>
                                                <SelectItem value="7.5">7.5</SelectItem>
                                                <SelectItem value="8.5">8.5</SelectItem>
                                                <SelectItem value="9.5">9.5</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            Choose points awarded for this question.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Question Text */}
                        <FormField
                            control={form.control}
                            name="text"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Question Text</FormLabel>
                                    <FormControl>
                                        <div className="rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-within:outline-none focus-within:ring-1 focus-within:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                                            <div className="min-h-[200px] max-h-[300px] overflow-y-auto">
                                                <Editor
                                                    data={field.value}
                                                    onChange={field.onChange}
                                                    holder="question-editor"
                                                />
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormDescription>
                                        Enter the full text of the question.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />


                        {/* Form Actions */}
                        <div className="flex justify-end space-x-2">
                            {onCancel && (
                                <Button type="button" variant="outline" onClick={onCancel}>
                                    Cancel
                                </Button>
                            )}
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <LoadingSpinner className="mr-2 h-4 w-4" />
                                        {isEditing ? 'Updating...' : 'Creating...'}
                                    </>
                                ) : (
                                    <>
                                        {isEditing ? 'Update Question' : 'Create Question'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
