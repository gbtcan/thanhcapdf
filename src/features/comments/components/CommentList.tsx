import React from 'react';
import { useComments } from '../hooks/useComments';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import { LoadingIndicator } from '../../../core/components';
import { MessageSquare } from 'lucide-react';

interface CommentListProps {
  hymnId: string;
}

const CommentList: React.FC<CommentListProps> = ({ hymnId }) => {
  const { 
    comments, 
    totalComments,
    isLoading, 
    error,
    page,
    nextPage,
    previousPage,
    actions 
  } = useComments({
    hymn_id: hymnId,
    parent_id: null, // Get only top-level comments
    sort: 'newest'
  });

  if (isLoading) {
    return <LoadingIndicator size="small" message="Đang tải bình luận..." />;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-md text-red-600 dark:text-red-300">
        <p>Không thể tải bình luận. Vui lòng thử lại.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
          <MessageSquare className="h-5 w-5 mr-2 text-indigo-600" />
          Bình luận ({totalComments})
        </h3>
        
        <CommentForm 
          hymnId={hymnId} 
          onSubmit={actions.addComment}
        />
      </div>
      
      {comments.length === 0 ? (
        <div className="py-6 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-md">
          <p>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onDelete={() => actions.deleteComment(comment.id)}
              onUpdate={(content) => actions.updateComment(comment.id, content)}
              onLike={() => actions.likeComment(comment.id)}
            />
          ))}
          
          {/* Pagination */}
          {totalComments > comments.length && (
            <div className="flex justify-between mt-4 pt-2 border-t border-gray-200 dark:border-gray-700">
              <button
                disabled={page === 0}
                onClick={previousPage}
                className={`px-3 py-1 text-sm rounded-md ${
                  page === 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                }`}
              >
                Trước
              </button>
              
              <button
                onClick={nextPage}
                className="px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md"
              >
                Xem thêm
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentList;
