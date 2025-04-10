import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useHymns } from '../../../hooks/useContentManagement';
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
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../../../../../core/components/ui/dropdown-menu';
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
  Eye, 
  MoreHorizontal, 
  Edit, 
  Trash, 
  Music, 
  Search,
  Filter,
  Loader2,
  PlusCircle
} from 'lucide-react';
import { Badge } from '../../../../../core/components/ui/badge';
import { Hymn } from '../../../types/content';

const HymnsList: React.FC = () => {
  // Filters state
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('published');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [hymnToDelete, setHymnToDelete] = useState<Hymn | null>(null);
  
  // Fetch hymns
  const { 
    hymns, 
    totalHymns, 
    isLoading, 
    deleteHymn, 
    isDeleting, 
    refetch 
  } = useHymns({
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
  
  // Handle delete hymn
  const handleDeleteHymn = async () => {
    if (!hymnToDelete) return;
    
    try {
      await deleteHymn(hymnToDelete.id);
      setIsDeleteDialogOpen(false);
      setHymnToDelete(null);
      refetch();
    } catch (error) {
      console.error('Failed to delete hymn:', error);
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
    if (status === 'published') {
      return <Badge variant="success">Đã đăng</Badge>;
    } else if (status === 'draft') {
      return <Badge variant="outline">Bản nháp</Badge>;
    } else if (status === 'archived') {
      return <Badge variant="secondary">Đã lưu trữ</Badge>;
    }
    return null;
  };
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản lý thánh ca</h2>
        <Link to="/admin/content/hymns/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm thánh ca mới
          </Button>
        </Link>
      </div>
      
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="text"
                placeholder="Tìm kiếm thánh ca..."
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
                  <SelectItem value="published">Đã đăng</SelectItem>
                  <SelectItem value="draft">Bản nháp</SelectItem>
                  <SelectItem value="archived">Đã lưu trữ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-40">
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Sắp xếp theo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="title">Tên thánh ca</SelectItem>
                  <SelectItem value="created_at">Ngày tạo</SelectItem>
                  <SelectItem value="updated_at">Ngày cập nhật</SelectItem>
                  <SelectItem value="view_count">Lượt xem</SelectItem>
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
      
      {/* Hymns Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên thánh ca</TableHead>
              <TableHead className="hidden md:table-cell">Trạng thái</TableHead>
              <TableHead className="hidden md:table-cell">Lượt xem</TableHead>
              <TableHead className="hidden md:table-cell">Thời gian</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    <span className="ml-2">Đang tải...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : hymns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <Music className="h-10 w-10 mb-2" />
                    <p>Không tìm thấy thánh ca nào</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              hymns.map((hymn) => (
                <TableRow key={hymn.id}>
                  <TableCell className="font-medium">
                    <Link 
                      to={`/admin/content/hymns/${hymn.id}`}
                      className="hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      {hymn.title}
                    </Link>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {getStatusBadge(hymn.status)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {hymn.view_count.toLocaleString()}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {formatDate(hymn.updated_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <span className="sr-only">Mở menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link to={`/admin/content/hymns/${hymn.id}`}>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Chỉnh sửa</span>
                          </DropdownMenuItem>
                        </Link>
                        <Link to={`/hymns/${hymn.id}`} target="_blank">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            <span>Xem</span>
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem 
                          className="text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300"
                          onClick={() => {
                            setHymnToDelete(hymn);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          <span>Xóa</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {!isLoading && totalHymns > 0 && (
        <Pagination 
          currentPage={page}
          pageSize={pageSize}
          totalItems={totalHymns}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Thánh ca "{hymnToDelete?.title}" sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteHymn}
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

export default HymnsList;
