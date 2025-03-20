import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Heart, MessageSquare, Eye, Flag, Share2, Edit, Trash, Pin, ThumbsUp, LockIcon } from 'lucide-react';
import { ForumPost, ForumComment } from '../../types/forum';
import { useAuth } from '../../contexts/AuthContext';
import { togglePostLike, deletePost } from '../../lib/forumService';
import Avatar from '../Avatar';
import AlertBanner from '../AlertBanner';
import CommentsList from './CommentsList';
import CommentForm from './CommentForm';
import ConfirmDialog from '../common/ConfirmDialog';
import ShareButton from '../ShareButton';

interface ForumPostDetailProps {
  post: ForumPost;
  onEdit?: (post: ForumPost) => void;
  className?: string;
}

const ForumPostDetail: React.FC<ForumPostDetailProps> = ({ 
  post, 
  onEdit,
  className = '' 
}) => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check if current user is the author
  const isAuthor = isAuthenticated && user?.id === post.author_id;
  
  // Check if current user is an admin or moderator
  const isAdminOrMod = isAuthenticated && 
    (user?.roles?.name === 'administrator' || user?.roles?.name === 'moderator');
  
  // Check if the post has been liked by the current user
  const isLiked = post.likes?.some(like => like.user_id === user?.id);
  
  // Format date
  const formattedDate = format(
    new Date(post.created_at),
    'MMM d, yyyy h:mm a'
  );
  
  // Like post mutation
  const likeMutation = useMutation({
    mutationFn: () => togglePostLike(post.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', post.id] });
    },
    onError: (error) => {
      console.error('Error toggling like:', error);
      setError('Failed to like post. Please try again.');
    }
  });
  
  // Delete post mutation
  const deleteMutation = useMutation({
    mutationFn: () => deletePost(post.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
      // Redirect to forum home
      window.location.href = '/forum';
    },
    onError: (error) => {
      console.error('Error deleting post:', error);
      setError('Failed to delete post. Please try again.');
      setShowDeleteConfirm(false);
    }
  });
  
  // Handle like button click
  const handleLike = () => {
    if (!isAuthenticated) {
      window.location.href = '/auth/login';
      return;
    }
    
    likeMutation.mutate();
  };
  
  // Handle edit button click
  const handleEdit = () => {
    if (onEdit) {
      onEdit(post);
    }
  };
  
  // Handle delete button click
  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };
  
  // Confirm delete
  const confirmDelete = () => {
    deleteMutation.mutate();
  };
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden ${className}`}>
      {/* Post header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-start justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white pr-4">
            {post.is_pinned && (
              <Pin className="inline h-5 w-5 mr-2 text-indigo-500" title="Pinned" />
            )}
            {post.is_locked && (
              <LockIcon className="inline h-5 w-5 mr-2 text-amber-500" title="Locked" />
            )}
            {post.title}
          </h1>
          
          <div className="flex items-center space-x-2 mt-2 sm:mt-0">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Eye className="h-4 w-4 mr-1" />
              <span>{post.view_count || 0}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <MessageSquare className="h-4 w-4 mr-1" />
              <span>{post.comment_count || 0}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Heart className="h-4 w-4 mr-1" />
              <span>{post.like_count || 0}</span>
            </div>
            
            <ShareButton 
              title={post.title} 
              text={`Check out this forum post: ${post.title}`}
            />
          </div>
        </div>
        
        <div className="flex flex-wrap items-center text-sm">
          {post.category && (
            <Link
              to={`/forum/category/${post.category.slug}`}
              className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300 text-xs font-medium"
            >
              {post.category.name}
            </Link>
          )}
          
          {post.hymn && (
            <Link
              to={`/hymns/${post.hymn.id}`}
              className="ml-2 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs font-medium"
            >
              Hymn: {post.hymn.title}
            </Link>
          )}
          
          <span className="ml-auto text-gray-500 dark:text-gray-400">
            {formattedDate}
          </span>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="px-6 pt-4">
          <AlertBanner
            type="error"
            message={error}
            dismissible
            onDismiss={() => setError(null)}
          />
        </div>
      )}
      
      {/* Post content */}
      <div className="px-6 py-4">
        <div className="flex">
          <div className="flex-shrink-0 mr-4">
            <Avatar 
              src={post.author?.avatar_url} 
              name={post.author?.display_name || 'Unknown'} 
              size="lg" 
            />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center mb-3">
              <Link 
                to={`/profile/${post.author_id}`}
                className="text-base font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                {post.author?.display_name || 'Unknown User'}
              </Link>
            </div>
            
            <div className="prose dark:prose-invert max-w-none mb-4">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>
            
            <div className="flex items-center space-x-4 mt-6">
              <button
                onClick={handleLike}
                disabled={likeMutation.isPending || post.is_locked}
                className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${
                  isLiked
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                } ${post.is_locked ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLiked ? (
                  <Heart className="h-4 w-4 mr-1.5 fill-current" />
                ) : (
                  <Heart className="h-4 w-4 mr-1.5" />
                )}
                {isLiked ? 'Liked' : 'Like'}
              </button>
              
              <button
                onClick={() => document.getElementById('comment-form')?.scrollIntoView({ behavior: 'smooth' })}
                disabled={post.is_locked}
                className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 ${
                  post.is_locked ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <MessageSquare className="h-4 w-4 mr-1.5" />
                Reply
              </button>
              
              <button
                className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <Flag className="h-4 w-4 mr-1.5" />
                Report
              </button>
              
              {/* Edit & Delete buttons for author or admin */}
              {(isAuthor || isAdminOrMod) && (
                <>
                  <button
                    onClick={handleEdit}
                    className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50"
                  >
                    <Edit className="h-4 w-4 mr-1.5" />
                    Edit
                  </button>
                  
                  <button
                    onClick={handleDelete}
                    className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                  >
                    <Trash className="h-4 w-4 mr-1.5" />
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Comments section */}
      <div className="border-t border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Comments ({post.comments?.length || 0})
          </h3>
          
          {post.comments && post.comments.length > 0 ? (
            <CommentsList comments={post.comments} postId={post.id} isLocked={post.is_locked} />
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic text-center py-6">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>
        
        {/* Comment form */}
        {!post.is_locked && isAuthenticated && (
          <div className="bg-gray-50 dark:bg-gray-750 px-6 py-4" id="comment-form">
            <CommentForm postId={post.id} />
          </div>
        )}
        
        {/* Locked message */}
        {post.is_locked && (
          <div className="bg-amber-50 dark:bg-amber-900/20 px-6 py-4 text-center text-amber-800 dark:text-amber-300 border-t border-amber-200 dark:border-amber-900/30">
            <LockIcon className="h-5 w-5 inline-block mr-2" />
            This thread is locked. New comments are not allowed.
          </div>
        )}
        
        {/* Login prompt */}
        {!isAuthenticated && !post.is_locked && (
          <div className="bg-gray-50 dark:bg-gray-750 px-6 py-4 text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-3">
              You need to be logged in to post a comment.
            </p>
            <Link
              to="/auth/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Sign in to comment
            </Link>
          </div>
        )}
      </div>
      
      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete Post"
          message="Are you sure you want to delete this post? This action cannot be undone."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteConfirm(false)}
          isLoading={deleteMutation.isPending}
          isDestructive
        />
      )}
    </div>
  );
};

export default ForumPostDetail;
