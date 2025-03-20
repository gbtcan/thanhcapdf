import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, MessageSquare, ThumbsUp, ThumbsDown, Flag, Edit, Trash2, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import PageLayout from '../../components/PageLayout';
import ErrorBoundary from '../../components/ErrorBoundary';
import AlertBanner from '../../components/AlertBanner';
import { useAuth } from '../../contexts/AuthContext'; 
import DOMPurify from 'dompurify';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user: {
    display_name: string;
    email: string;
  };
  likes: number;
  dislikes: number;
  user_reaction?: 'like' | 'dislike' | null;
}

const ForumPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Fetch post details
  const {
    data: post,
    isLoading,
    isError,
    error: fetchError
  } = useQuery({
    queryKey: ['forum-post', id],
    queryFn: async () => {
      if (!id) throw new Error('Post ID is required');

      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          *,
          users (
            id,
            display_name,
            email
          ),
          hymns (
            id,
            title
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Post not found');
      
      return data;
    }
  });

  // Fetch comments
  const {
    data: comments,
    isLoading: commentsLoading
  } = useQuery({
    queryKey: ['forum-comments', id],
    queryFn: async () => {
      if (!id) return [];

      // First get all comments
      const { data: comments, error: commentError } = await supabase
        .from('forum_comments')
        .select(`
          *,
          user:user_id (
            display_name,
            email
          )
        `)
        .eq('post_id', id)
        .order('created_at', { ascending: true });

      if (commentError) throw commentError;
      
      // If user is logged in, get their reactions
      if (user) {
        const { data: userReactions, error: reactionsError } = await supabase
          .from('comment_reactions')
          .select('comment_id, reaction_type')
          .eq('user_id', user.id)
          .in('comment_id', comments.map(c => c.id));
          
        if (!reactionsError && userReactions) {
          // Map user reactions to comments
          const reactionsMap = userReactions.reduce((acc, reaction) => {
            acc[reaction.comment_id] = reaction.reaction_type;
            return acc;
          }, {} as Record<string, string>);
          
          // Add user_reaction to each comment
          return comments.map(comment => ({
            ...comment,
            user_reaction: reactionsMap[comment.id] as 'like' | 'dislike' | undefined
          }));
        }
      }
      
      return comments;
    },
    enabled: !!id
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (commentContent: string) => {
      if (!user) throw new Error('You must be logged in to comment');
      if (!id) throw new Error('Post ID is required');
      if (!commentContent.trim()) throw new Error('Comment cannot be empty');

      const { data, error } = await supabase
        .from('forum_comments')
        .insert([
          {
            post_id: id,
            user_id: user.id,
            content: commentContent
          }
        ])
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-comments', id] });
      setComment('');
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to add comment');
    }
  });

  // Handle reaction (like/dislike)
  const reactionMutation = useMutation({
    mutationFn: async ({ commentId, reactionType }: { commentId: string, reactionType: 'like' | 'dislike' | null }) => {
      if (!user) throw new Error('You must be logged in to react');
      
      // Check if user already reacted
      const { data: existingReaction } = await supabase
        .from('comment_reactions')
        .select('*')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (existingReaction) {
        // If same reaction, remove it (toggle off)
        if (existingReaction.reaction_type === reactionType) {
          const { error } = await supabase
            .from('comment_reactions')
            .delete()
            .eq('id', existingReaction.id);
            
          if (error) throw error;
        } else {
          // If different reaction, update it
          const { error } = await supabase
            .from('comment_reactions')
            .update({ reaction_type: reactionType })
            .eq('id', existingReaction.id);
            
          if (error) throw error;
        }
      } else if (reactionType) {
        // If no existing reaction and not toggling off, insert new reaction
        const { error } = await supabase
          .from('comment_reactions')
          .insert([
            {
              comment_id: commentId,
              user_id: user.id,
              reaction_type: reactionType
            }
          ]);
          
        if (error) throw error;
      }
      
      return { commentId, reactionType };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-comments', id] });
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to react to comment');
    }
  });

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login', { state: { from: `/forum/post/${id}` } });
      return;
    }
    addCommentMutation.mutate(comment);
  };

  const handleReaction = (commentId: string, reactionType: 'like' | 'dislike') => {
    if (!user) {
      navigate('/login', { state: { from: `/forum/post/${id}` } });
      return;
    }
    
    // Find current comment and its user_reaction
    const currentComment = comments?.find(c => c.id === commentId);
    const currentReaction = currentComment?.user_reaction;
    
    // If same reaction, toggle off (set to null), otherwise set new reaction
    const newReactionType = currentReaction === reactionType ? null : reactionType;
    
    reactionMutation.mutate({ commentId, reactionType: newReactionType });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="max-w-4xl mx-auto p-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-32 bg-gray-200 rounded mb-8"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (isError || !post) {
    return (
      <PageLayout>
        <div className="max-w-4xl mx-auto p-4">
          <AlertBanner 
            type="error"
            title="Error Loading Post"
            message={fetchError instanceof Error ? fetchError.message : 'Failed to load post. Please try again.'}
          />
          <div className="mt-6">
            <Link 
              to="/forum" 
              className="flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Forum
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <ErrorBoundary>
      <PageLayout>
        <div className="max-w-4xl mx-auto p-4">
          {/* Back to forum link */}
          <div className="mb-6">
            <Link 
              to="/forum" 
              className="flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Forum
            </Link>
          </div>
          
          {/* Post content */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            {/* Post header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
              <div className="flex flex-wrap items-center text-sm text-gray-500 mt-2 gap-4">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  <span>{post.users?.display_name || 'Anonymous'}</span>
                </div>
                <div>
                  Posted on {formatDate(post.created_at)}
                </div>
                {post.hymns && (
                  <div>
                    <Link 
                      to={`/songs/${post.hymns.id}`}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      Related Hymn: {post.hymns.title}
                    </Link>
                  </div>
                )}
              </div>
            </div>
            
            {/* Post body */}
            <div className="p-6">
              {/* Render HTML safely */}
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: DOMPurify.sanitize(post.content) 
                }}
              />
            </div>
          </div>
          
          {/* Comments section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-indigo-600" />
                Comments ({comments?.length || 0})
              </h2>
            </div>
            
            {/* Comments list */}
            <div className="divide-y divide-gray-200">
              {comments && comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="p-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="bg-indigo-100 rounded-full p-2">
                          <User className="h-6 w-6 text-indigo-600" />
                        </div>
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {comment.user?.display_name || 'Anonymous'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(comment.created_at)}
                        </p>
                        <div className="mt-2 text-sm text-gray-700">
                          {comment.content}
                        </div>
                        <div className="mt-4 flex items-center space-x-4">
                          <button 
                            onClick={() => handleReaction(comment.id, 'like')}
                            className={`flex items-center text-sm ${comment.user_reaction === 'like' ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}
                          >
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            <span>{comment.likes || 0}</span>
                          </button>
                          <button 
                            onClick={() => handleReaction(comment.id, 'dislike')}
                            className={`flex items-center text-sm ${comment.user_reaction === 'dislike' ? 'text-red-600' : 'text-gray-500 hover:text-red-600'}`}
                          >
                            <ThumbsDown className="h-4 w-4 mr-1" />
                            <span>{comment.dislikes || 0}</span>
                          </button>
                          <button className="flex items-center text-sm text-gray-500 hover:text-yellow-600">
                            <Flag className="h-4 w-4 mr-1" />
                            <span>Report</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No comments yet. Be the first to comment!
                </div>
              )}
            </div>
            
            {/* Add comment form */}
            <div className="p-6 bg-gray-50">
              <h3 className="text-md font-medium text-gray-900 mb-4">Add a Comment</h3>
              
              {error && (
                <AlertBanner 
                  type="error"
                  message={error}
                  className="mb-4"
                  dismissible
                  onDismiss={() => setError(null)}
                />
              )}
              
              {!user ? (
                <div className="bg-white p-4 rounded-md border border-gray-200">
                  <p className="text-gray-600 mb-4">
                    You need to sign in to post a comment.
                  </p>
                  <Link 
                    to={`/login?redirect=/forum/post/${id}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Sign In to Comment
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleAddComment} className="space-y-4">
                  <div>
                    <textarea
                      rows={4}
                      name="comment"
                      id="comment"
                      placeholder="Write your comment here..."
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      required
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={addCommentMutation.isPending}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      {addCommentMutation.isPending ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Posting...
                        </>
                      ) : (
                        'Post Comment'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </PageLayout>
    </ErrorBoundary>
  );
};

export default ForumPost;
