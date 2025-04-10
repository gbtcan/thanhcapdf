import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Reply as ReplyIcon, Loader } from 'lucide-react';
import { getPostReplies, createPostReply } from '../api/communityApi';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotifications } from '../../../contexts/NotificationContext';
import { LoadingIndicator } from '../../../core/components';

interface ReplySectionProps {
  postId: string;
}

const ReplySection: React.FC<ReplySectionProps> = ({ postId }) => {
  const { user, isAuthenticated } = useAuth();
  const { addNotification } = useNotifications();
  const queryClient = useQueryClient();
  const [replyContent, setReplyContent] = useState('');
  
  // Fetch replies
  const { data, isLoading, error } = useQuery({
    queryKey: ['forum-replies', postId],
    queryFn: () => getPostReplies(postId, null, 0, 50),
    enabled: !!postId
  });
  
  // Create reply mutation
  const mutation = useMutation({
    mutationFn: () => {
      if (!user?.id) {
        throw new Error('Bạn phải đăng nhập để trả lời');
      }
      
      if (!replyContent.trim()) {
        throw new Error('Vui lòng nhập nội dung trả lời');
      }
      
      return createPostReply(postId, replyContent, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-replies', postId] });
      setReplyContent('');
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Phản hồi của bạn đã được đăng',
        duration: 3000
      });
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error instanceof Error ? error.message : 'Đã có lỗi xảy ra',
        duration: 5000
      });
    }
  });
  
  // Handle reply submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
          <MessageSquare className="h-5 w-5 mr-2 text-indigo-600" />
          Phản hồi ({data?.count || 0})
        </h2>
      </div>
      
      {/* Reply form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            placeholder="Viết phản hồi của bạn..."
            required
          />
          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center disabled:opacity-50"
            >
              {mutation.isPending ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <ReplyIcon className="h-4 w-4 mr-2" />
                  Gửi phản hồi
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Vui lòng <a href="/auth/login" className="text-indigo-600 dark:text-indigo-400 font-medium">đăng nhập</a> để trả lời bài viết này.
          </p>
        </div>
      )}
      
      {/* Replies list */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {isLoading ? (
          <div className="px-6 py-8">
            <LoadingIndicator size="small" message="Đang tải phản hồi..." />
          </div>
        ) : error ? (
          <div className="px-6 py-4 text-center text-red-600 dark:text-red-400">
            Không thể tải phản hồi. Vui lòng thử lại sau.
          </div>
        ) : !data?.replies.length ? (
          <div className="px-6 py-8 text-center text-gray-600 dark:text-gray-400">
            Chưa có phản hồi nào. Hãy là người đầu tiên phản hồi!
          </div>
        ) : (
          data.replies.map(reply => (
            <div key={reply.id} className="px-6 py-4">
              <div className="flex">
                {/* User avatar */}
                <div className="flex-shrink-0 mr-3">
                  {reply.user?.avatar_url ? (
                    <img 
                      src={reply.user.avatar_url} 
                      alt={reply.user.display_name}
                      className="h-10 w-10 rounded-full" 
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                      <span className="font-medium text-indigo-600 dark:text-indigo-400">
                        {reply.user?.display_name?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Reply content */}
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {reply.user?.display_name}
                    </span>
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(new Date(reply.created_at), {
                        addSuffix: true,
                        locale: vi
                      })}
                    </span>
                  </div>
                  
                  <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {reply.content}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReplySection;
