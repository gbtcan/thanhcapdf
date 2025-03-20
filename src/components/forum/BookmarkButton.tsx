import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bookmark, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toggleBookmark, isPostBookmarked } from '../../lib/bookmarkService';

interface BookmarkButtonProps {
  postId: string;
  className?: string;
  showText?: boolean;
}

const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  postId,
  className = '',
  showText = false
}) => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // Check if post is bookmarked
  const { data: isBookmarked } = useQuery({
    queryKey: ['post-bookmark-status', postId, user?.id],
    queryFn: () => isPostBookmarked(user!.id, postId),
    enabled: !!isAuthenticated && !!user && !!postId
  });
  
  // Toggle bookmark mutation
  const bookmarkMutation = useMutation({
    mutationFn: () => toggleBookmark(user!.id, postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-bookmark-status', postId, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['user-bookmarks', user?.id] });
    }
  });
  
  // Handle click
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/forum/post/${postId}` } });
      return;
    }
    
    bookmarkMutation.mutate();
  };
  
  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center focus:outline-none ${className}`}
      aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
      title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
    >
      {bookmarkMutation.isPending ? (
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      ) : (
        <Bookmark 
          className={`h-5 w-5 ${
            isBookmarked 
              ? 'fill-indigo-500 text-indigo-500' 
              : 'text-gray-400 hover:text-indigo-500'
          }`} 
        />
      )}
      
      {showText && (
        <span className={`ml-1 text-sm ${isBookmarked ? 'text-indigo-500' : 'text-gray-500'}`}>
          {isBookmarked ? 'Bookmarked' : 'Bookmark'}
        </span>
      )}
    </button>
  );
};

export default BookmarkButton;
