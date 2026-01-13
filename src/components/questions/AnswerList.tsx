/**
 * AnswerList Component
 * 
 * Displays a list of answers for a question with interaction features.
 */

'use client';

import { useState } from 'react';
import { CheckCircle, ThumbsUp, ThumbsDown, MessageSquare, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import EditorJsRenderer from '@/components/ui/editor-js-renderer';
import { useAuthStore } from '@/stores/auth';
import { useUIStore } from '@/stores/ui';
import { formatDistanceToNow } from 'date-fns';
import type { components } from '@/types/generated/api';

type AnswerReadForQuestion = components['schemas']['AnswerReadForQuestion'];

interface AnswerListProps {
  answers: AnswerReadForQuestion[] | null | undefined;
}

export function AnswerList({ answers }: AnswerListProps) {
  const { user } = useAuthStore();
  const { addNotification } = useUIStore();
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<string | null>(null);

  if (!answers || answers.length === 0) {
    return null;
  }

  const toggleComments = (answerId: string) => {
    setExpandedComments(prev => {
      const next = new Set(prev);
      if (next.has(answerId)) {
        next.delete(answerId);
      } else {
        next.add(answerId);
      }
      return next;
    });
  };

  const handleCommentSubmit = async (answerId: string) => {
    if (!user) {
      addNotification({
        type: 'error',
        title: 'Authentication Required',
        message: 'Please log in to comment on answers.'
      });
      return;
    }

    const commentText = commentTexts[answerId]?.trim();
    if (!commentText) {
      addNotification({
        type: 'error',
        title: 'Empty Comment',
        message: 'Please enter a comment before submitting.'
      });
      return;
    }

    setSubmittingComment(answerId);
    
    try {
      // TODO: Implement API call to submit comment
      // await adminAPI.answers.addComment(answerId, { text: commentText });
      
      addNotification({
        type: 'success',
        title: 'Comment Added',
        message: 'Your comment has been added successfully.'
      });
      
      // Clear the comment text
      setCommentTexts(prev => ({ ...prev, [answerId]: '' }));
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to add comment. Please try again.'
      });
    } finally {
      setSubmittingComment(null);
    }
  };

  const handleLike = async (answerId: string) => {
    if (!user) {
      addNotification({
        type: 'error',
        title: 'Authentication Required',
        message: 'Please log in to like answers.'
      });
      return;
    }
    
    // TODO: Implement like functionality
    addNotification({
      type: 'info',
      title: 'Coming Soon',
      message: 'Like functionality will be available soon.'
    });
  };

  const handleDislike = async (answerId: string) => {
    if (!user) {
      addNotification({
        type: 'error',
        title: 'Authentication Required',
        message: 'Please log in to dislike answers.'
      });
      return;
    }
    
    // TODO: Implement dislike functionality
    addNotification({
      type: 'info',
      title: 'Coming Soon',
      message: 'Dislike functionality will be available soon.'
    });
  };

  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return '';
    }
  };

  return (
    <div className="mt-3 space-y-3">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        Answers ({answers.length})
      </div>
      {answers.map((answer, index) => {
        // Parse answer text if it's a string (EditorJS format)
        const answerText = answer.text;
        const parsedText = typeof answerText === 'string' 
          ? JSON.parse(answerText) 
          : answerText;

        const isCommentsExpanded = expandedComments.has(answer.id);
        const commentsCount = 0; // TODO: Get from answer.comments_count when available

        return (
          <div
            key={answer.id || index}
            className="border-l-2 border-green-200 bg-green-50/50 rounded-r overflow-hidden"
          >
            {/* Answer Header */}
            <div className="px-4 pt-3 pb-2">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  {answer.is_correct && (
                    <Badge variant="default" className="text-xs bg-green-600 mb-2">
                      Correct Answer
                    </Badge>
                  )}
                  
                  {/* Answer Content */}
                  <div className="text-sm text-gray-700 prose prose-sm max-w-none mb-3">
                    {parsedText ? (
                      <EditorJsRenderer data={parsedText} />
                    ) : (
                      <p className="text-gray-400 italic">No answer text</p>
                    )}
                  </div>

                  {/* Separator */}
                  <div className="border-t border-green-200 my-2"></div>

                  {/* Answer Footer */}
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <div className="flex items-center gap-3">
                      {/* Author */}
                      {answer.created_by && (
                        <div className="flex items-center gap-1.5">
                          <User className="h-3 w-3" />
                          <span>By {answer.created_by.last_name || answer.created_by.first_name}</span>
                        </div>
                      )}
                      
                      {/* Time */}
                      {answer.created_at && (
                        <span className="text-gray-500">
                          {getTimeAgo(answer.created_at)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Like/Dislike */}
                      <button
                        onClick={() => handleLike(answer.id)}
                        className="flex items-center gap-1 hover:text-green-600 transition-colors"
                        title="Like this answer"
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                        <span>{answer.upvotes_count || 0}</span>
                      </button>
                      
                      <button
                        onClick={() => handleDislike(answer.id)}
                        className="flex items-center gap-1 hover:text-red-600 transition-colors"
                        title="Dislike this answer"
                      >
                        <ThumbsDown className="h-3.5 w-3.5" />
                        <span>{answer.downvotes_count || 0}</span>
                      </button>

                      {/* Comments Toggle */}
                      <button
                        onClick={() => toggleComments(answer.id)}
                        className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                        title="View comments"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>{commentsCount} {commentsCount === 1 ? 'comment' : 'comments'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            {isCommentsExpanded && (
              <div className="px-4 pb-3 border-t border-green-200 bg-white/50">
                <div className="mt-3 space-y-3">
                  {/* Existing Comments */}
                  {commentsCount === 0 && (
                    <p className="text-xs text-gray-500 italic">No comments yet. Be the first to comment!</p>
                  )}

                  {/* Add Comment Form */}
                  {user ? (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Write a comment..."
                        value={commentTexts[answer.id] || ''}
                        onChange={(e) => setCommentTexts(prev => ({ ...prev, [answer.id]: e.target.value }))}
                        className="text-sm min-h-[60px] resize-none"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCommentTexts(prev => ({ ...prev, [answer.id]: '' }));
                            toggleComments(answer.id);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleCommentSubmit(answer.id)}
                          disabled={submittingComment === answer.id || !commentTexts[answer.id]?.trim()}
                        >
                          {submittingComment === answer.id ? 'Posting...' : 'Post Comment'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-600">
                      Please <button className="text-blue-600 hover:underline">log in</button> to comment.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
