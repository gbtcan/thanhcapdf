import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useComments } from '../../../hooks/useContentManagement';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../../../../core/components/ui/table';
import { Button } from '../../../../../core/components/ui/button';
import { Input } from '../../../../../core/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../core/components/ui/select';
import { Pagination } from '../../../../../core/components/ui/pagination';
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
import { 
  Search,
  Filter,
  Loader2,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Trash,
  ExternalLink
} from 'lucide-react';
import { Badge } from '../../../../../core/components/ui/badge';
import { Comment } from '../../../types/content';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../../../core/components/ui/tooltip';

const CommentsList: React.FC = () => {
  // Filters state
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<Comment | null>(null);
  
  // Fetch comments
  const { 
    comments, 
    totalComments, 
    isLoading, 
    deleteComment, 
    isDeleting,
    approveComment,
    rejectComment,
    isUpdating,
    refetch 
  } = useComments({
    search,
    status,
    sortBy,
    sortOrder,
    page,
    pageSize
  });
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    refetch();
  };
  
  // Handle status change
  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPage(0);
    refetch();
  };
  
  // Handle sort
  const handleSortChange = (value: string) => {
    setSortBy(value);
    refetch();
  };
  
  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    refetch();
  };
  
  // Handle delete comment
  const handleDeleteComment = async () => {
    if (!commentToDelete) return;
    
    try {
      await deleteComment(commentToDelete.id);
      setIsDeleteDialogOpen(false);
      setCommentToDelete(null);
      refetch();
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };
  
  // Handle approve/reject comment
  const handleApprove = async (id: number) => {
    try {
      await approveComment(id);
      refetch();
    } catch (error) {
      console.error('Failed to approve comment:', error);
    }
  };
  
  const handleReject = async (id: number) => {
    try {
      await rejectComment(id);
      refetch();
    } catch (error) {
      console.error('Failed to reject comment:', error);
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: vi 
      });
    } catch (error) {
      return 'Không rõ';
    }
  };
  
  // Get status badge
  const getStatusBadge = (status: string | undefined) => {
    if (status === 'approved') {
      return <Badge variant="success">Đã duyệt</Badge>;
    } else if (status === 'pending') {
      return <Badge variant="warning">Chờ duyệt</Badge>;
    } else if (status === 'rejected') {
      return <Badge variant="destructive">Từ chối</Badge>;
    }
    return null;
  };
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản lý bình luận</h2>
      </div>
      
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="text"
                placeholder="Tìm kiếm bình luận..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button type="submit" variant="secondary">
              Tìm kiếm
            </Button>
          </div>
          
          <div className="flex gap-2">
            <div className="w-40">
              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="pending">Chờ duyệt</SelectItem>
                  <SelectItem value="approved">Đã duyệt</SelectItem>
                  <SelectItem value="rejected">Từ chối</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-40">
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Sắp xếp theo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Ngày tạo</SelectItem>
                  <SelectItem value="updated_at">Ngày cập nhật</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={toggleSortOrder} 
              title={sortOrder === 'asc' ? 'Tăng dần' : 'Giảm dần'}
            >
              <Filter className={`h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </form>
      </div>
      
      {/* Comments Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nội dung</TableHead>
              <TableHead className="hidden md:table-cell">Người đăng</TableHead>
              <TableHead className="hidden md:table-cell">Bài viết</TableHead>
              <TableHead className="hidden md:table-cell">Trạng thái</TableHead>
              <TableHead className="hidden md:table-cell">Ngày đăng</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    <span className="ml-2">Đang tải...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : comments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <MessageSquare className="h-10 w-10 mb-2" />
                    <p>Không tìm thấy bình luận nào</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              comments.map((comment) => (
                <TableRow key={comment.id}>
                  <TableCell className="max-w-xs">
                    <div className="truncate">
                      {comment.content}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {comment.author?.name || comment.author?.email || 'Ẩn danh'}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Link 
                      to={`/posts/${comment.post_id}`} 
                      target="_blank"
                      className="flex items-center text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                    >
                      <span className="truncate max-w-[150px]">{comment.postTitle}</span>
                      <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
                    </Link>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {getStatusBadge(comment.status)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {formatDate(comment.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-green-600 dark:text-green-500"
                              onClick={() => handleApprove(comment.id)}
                              disabled={isUpdating || comment.status === 'approved'}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Duyệt bình luận</p>
                          </TooltipContent>
                        </Tooltip>
                      
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-red-600 dark:text-red-500"
                              onClick={() => handleReject(comment.id)}
                              disabled={isUpdating || comment.status === 'rejected'}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Từ chối bình luận</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-gray-600 dark:text-gray-400"
                              onClick={() => {
                                setCommentToDelete(comment);
                                setIsDeleteDialogOpen(true);
                              }}
                              disabled={isDeleting}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Xóa bình luận</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {!isLoading && totalComments > 0 && (
        <Pagination 
          currentPage={page}
          pageSize={pageSize}
          totalItems={totalComments}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa bình luận này?</AlertDialogTitle>
            <AlertDialogDescription>
              Bình luận này sẽ bị xóa vĩnh viễn và không thể khôi phục.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteComment}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CommentsList;
