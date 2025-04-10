import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useAuth } from '../../../contexts/AuthContext';
import { Heart, MoreVertical, Edit, Trash2, Reply } from 'lucide-react';
import { CommentWithUser } from '../types';
import CommentForm from './CommentForm';

interface CommentItemProps {
  comment: CommentWithUser;
  onDelete: () => void;
  onUpdate: (content: string) => void;
  onLike: () => void;
  onReply?: (content: string) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ 
  comment, 
  onDelete, 
  onUpdate, 
  onLike,
  onReply
}) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  // Determine if this user can edit or delete the comment
  const canEdit = user?.id === comment.user_id;
  const canDelete = canEdit || user?.isAdmin || user?.isEditor;
  
  // Format date string
  const formattedDate = formatDistanceToNow(new Date(comment.created_at), {
    addSuffix: true,
    locale: vi
  });
  
  // Handle editing
  const handleEdit = () => {
    setIsEditing(true);
    setShowMenu(false);
  };
  
  // Handle update submission
  const handleUpdateSubmit = (content: string) => {
    onUpdate(content);
    setIsEditing(false);
  };
  
  // Handle replying
  const handleReply = () => {
    if (onReply) {
      setIsReplying(true);
      setShowMenu(false);
    }
  };
  
  // Handle reply submission
  const handleReplySubmit = (content: string) => {
    if (onReply) {
      onReply(content);
      setIsReplying(false);
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      {/* Comment header with user info */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {comment.user?.avatar_url ? (
              <img 
                src={comment.user.avatar_url} 
                alt={comment.user.display_name}
                className="h-8 w-8 rounded-full"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <span className="font-medium text-indigo-600 dark:text-indigo-400">
                  {comment.user?.display_name?.charAt(0) || 'U'}
                </span>
              </div>
            )}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {comment.user?.display_name || 'Unknown User'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formattedDate}
              {comment.updated_at && comment.updated_at !== comment.created_at && ' (đã chỉnh sửa)'}
            </p>
          </div>
        </div>
        
        {/* Comment actions menu */}
        {(canEdit || canDelete || onReply) && (
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <MoreVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                {canEdit && (
                  <button
                    onClick={handleEdit}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Chỉnh sửa
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => {
                      onDelete();
                      setShowMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Xóa
                  </button>
                )}
                {onReply && (
                  <button
                    onClick={handleReply}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Reply className="h-4 w-4 mr-2" />
                    Trả lời
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Comment content */}
      {isEditing ? (
        <CommentForm 
          initialValue={comment.content}
          onSubmit={handleUpdateSubmit}
          onCancel={() => setIsEditing(false)}
          buttonText="Cập nhật"
        />
      ) : (
        <div className="prose prose-sm dark:prose-invert">
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{comment.content}</p>
        </div>
      )}
      
      {/* Comment actions */}
      <div className="mt-3 flex items-center space-x-4">
        <button 
          onClick={onLike}
          className="flex items-center text-gray-500 dark:text-gray-400 hover:text-red-500 text-sm"
        >
          <Heart className={`h-4 w-4 mr-1.5 ${comment.likes_count && comment.likes_count > 0 ? 'fill-red-500 text-red-500' : ''}`} />
          {comment.likes_count || 0}
        </button>
        
        {onReply && !isReplying && !isEditing && (
          <button
            onClick={handleReply}
            className="flex items-center text-gray-500 dark:text-gray-400 hover:text-indigo-500 text-sm"
          >
            <Reply className="h-4 w-4 mr-1.5" />
            Trả lời
          </button>
        )}
        
        {comment.reply_count > 0 && !isReplying && !isEditing && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {comment.reply_count} trả lời
          </span>
        )}
      </div>
      
      {/* Reply form */}
      {isReplying && onReply && (
        <div className="mt-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
          <CommentForm 
            onSubmit={handleReplySubmit}
            onCancel={() => setIsReplying(false)}
            buttonText="Trả lời"
            placeholder={`Trả lời ${comment.user?.display_name}...`}
          />
        </div>
      )}
    </div>
  );
};

export default CommentItem;
