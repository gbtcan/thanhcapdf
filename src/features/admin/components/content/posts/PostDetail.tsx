import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePost } from '../../../hooks/useContentManagement';
import PostForm from './PostForm';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../../../core/components/ui/alert-dialog';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Post } from '../../../types/content';
import { PermissionGuard } from '../../../../../core/components/PermissionGuard';
import { useAuth } from '../../../../../contexts/AuthContext';
import { hasPermission } from '../../../../../lib/permissions';

interface PostDetailProps {
  id: number;
}

const PostDetail: React.FC<PostDetailProps> = ({ id }) => {
  const navigate = useNavigate();
  const { post, isLoading, updatePost, deletePost, isUpdating, isDeleting } = usePost(id);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { user } = useAuth();
  
  // Check if user can delete content
  const canDelete = hasPermission(user, 'content.delete');
  // Check if user is the author of this post
  const isAuthor = post && user && post.user_id === user.id;
  
  // Handle navigation back to posts list
  const handleCancel = () => {
    navigate('/admin/content/posts');
  };
  
  // Handle form submission
  const handleSubmit = async (data: Omit<Post, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      await updatePost(data);
      // Stay on the page, the success notification will be shown by the hook
    } catch (error) {
      console.error('Failed to update post:', error);
    }
  };
  
  // Handle post deletion
  const handleDelete = async () => {
    try {
      await deletePost();
      navigate('/admin/content/posts');
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }
  
  // Handle case where post is not found
  if (!post) {
    return (
      <div className="p-8 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Bài viết không tồn tại</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Có thể bài viết đã bị xóa hoặc bạn không có quyền truy cập.
        </p>
        <button 
          onClick={handleCancel}
          className="text-indigo-600 hover:text-indigo-500 font-medium"
        >
          Quay lại danh sách bài viết
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <PostForm
        post={post}
        isSubmitting={isUpdating}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
      
      {/* Delete Post button - only shown if user has delete permission or is author */}
      {(canDelete || isAuthor) && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <button
            type="button"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="px-4 py-2 text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 font-medium rounded-md hover:bg-red-50 dark:hover:bg-red-900/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-opacity-50 flex items-center"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <AlertTriangle className="h-4 w-4 mr-2" />
            )}
            Xóa bài viết
          </button>
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa bài viết</AlertDialogTitle>
            <AlertDialogDescription>
              Bài viết "{post.title}" sẽ bị xóa vĩnh viễn và không thể khôi phục. 
              Bạn có chắc chắn muốn xóa?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
            >
              {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Xác nhận xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PostDetail;
