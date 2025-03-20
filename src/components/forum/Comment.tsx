import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, Flag, MoreVertical, Edit, Trash, MessageSquare } from 'lucide-react';
import { formatRelativeTime } from '../../utils/dateUtils';
import { useAuth } from '../../contexts/AuthContext';

interface CommentProps {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  likes: number;
  dislikes: number;
  userReaction?: 'like' | 'dislike' | null;
  parentId?: string | null;
  onLike: (id: string) => void;
  onDislike: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string, content: string) => void;
  onReport?: (id: string) => void;
  onReply?: (id: string, parentId?: string) => void;
  isEditing?: boolean;
}

const Comment: React.FC<CommentProps> = ({
  id,
  content,
  createdAt,
  author,
  likes,
  dislikes,
  userReaction,
  parentId,
  onLike,
  onDislike,
  onDelete,
  onEdit,
  onReport,
  onReply,
  isEditing = false,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [isEdited, setIsEdited] = useState(false);
  const isAuthor = isAuthenticated && user?.id === author.id;

  const handleLike = () => {
    if (isAuthenticated) {
      onLike(id);
    }
  };

  const handleDislike = () => {
    if (isAuthenticated) {
      onDislike(id);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(id, editContent);
      setIsEdited(false);
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const startEdit = () => {
    setEditContent(content);
    setIsEdited(true);
    setMenuOpen(false);
  };

  const cancelEdit = () => {
    setIsEdited(false);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow ${parentId ? 'ml-8 mt-2' : 'mb-4'}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">
          {author.avatarUrl ? (
            <img
              src={author.avatarUrl}
              alt={author.name}
              className="h-8 w-8 rounded-full"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
              <span className="text-indigo-600 dark:text-indigo-300 font-medium">
                {author.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex-grow">
          <div className="flex items-center">
            <Link 
              to={`/user/${author.id}`} 
              className="font-medium text-gray-900 dark:text-gray-100"
            >
              {author.name}
            </Link>
            <span className="mx-2 text-gray-400">•</span>
            <time className="text-sm text-gray-500 dark:text-gray-400">
              {formatRelativeTime(createdAt)}
            </time>
          </div>
          
          {isEdited ? (
            <div className="mt-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-2 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
                rows={3}
              />
              <div className="mt-2 flex justify-end space-x-2">
                <button
                  onClick={cancelEdit}
                  className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEdit}
                  className="px-3 py-1 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-1 text-gray-800 dark:text-gray-200">
              {content}
            </div>
          )}
          
          <div className="mt-2 flex items-center">
            <button
              onClick={handleLike}
              className={`inline-flex items-center p-1 rounded-md ${
                userReaction === 'like' 
                  ? 'text-green-600 dark:text-green-500' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-500'
              }`}
              title="Like"
            >
              <ThumbsUp className="h-4 w-4" />
              {likes > 0 && <span className="ml-1 text-xs">{likes}</span>}
            </button>
            
            <button
              onClick={handleDislike}
              className={`inline-flex items-center p-1 ml-1 rounded-md ${
                userReaction === 'dislike' 
                  ? 'text-red-600 dark:text-red-500' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500'
              }`}
              title="Dislike"
            >
              <ThumbsDown className="h-4 w-4" />
              {dislikes > 0 && <span className="ml-1 text-xs">{dislikes}</span>}
            </button>
            
            {onReply && (
              <button
                onClick={() => onReply(id, parentId)}
                className="inline-flex items-center p-1 ml-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-500"
                title="Reply"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="ml-1 text-xs">Reply</span>
              </button>
            )}
            
            {(isAuthor || onReport) && (
              <div className="relative ml-auto">
                <button
                  onClick={toggleMenu}
                  className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  title="More options"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
                
                {menuOpen && (
                  <div className="absolute right-0 mt-1 bg-white dark:bg-gray-700 shadow-lg rounded-md py-1 z-10 w-32">
                    {isAuthor && onEdit && (
                      <button
                        onClick={startEdit}
                        className="flex items-center w-full px-3 py-2 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </button>
                    )}
                    
                    {isAuthor && onDelete && (
                      <button
                        onClick={() => {
                          onDelete(id);
                          setMenuOpen(false);
                        }}
                        className="flex items-center w-full px-3 py-2 text-sm text-left text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </button>
                    )}
                    
                    {!isAuthor && onReport && (
                      <button
                        onClick={() => {
                          onReport(id);
                          setMenuOpen(false);
                        }}
                        className="flex items-center w-full px-3 py-2 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        <Flag className="h-4 w-4 mr-2" />
                        Report
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Comment;
