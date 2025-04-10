import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../../../core/components/ui/table';
import { Button } from '../../../../core/components/ui/button';
import { Input } from '../../../../core/components/ui/input';
import { 
  PlusCircle, 
  Search, 
  Edit, 
  Trash, 
  AlertTriangle,
  Loader2 
} from 'lucide-react';
import { useRoles } from '../../hooks/useRoles';
import { Role } from '../../types/roles';
import { Pagination } from '../../../../core/components/ui/pagination';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../../core/components/ui/alert-dialog';
import { formatDateTime } from '../../../../core/utils/formatters';

const RoleList: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Sử dụng custom hook để quản lý danh sách vai trò
  const { 
    roles, 
    totalRoles, 
    isLoading, 
    deleteRole, 
    isDeleting, 
    refetch 
  } = useRoles({
    search,
    page,
    pageSize
  });
  
  // Xử lý tìm kiếm
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0); // Reset về trang đầu tiên khi tìm kiếm
  };
  
  // Xử lý xóa vai trò
  const handleDelete = async () => {
    if (!deleteTarget) return;
    
    try {
      await deleteRole(deleteTarget.id);
      setIsDeleteDialogOpen(false);
      setDeleteTarget(null);
      refetch();
    } catch (error) {
      console.error('Failed to delete role:', error);
    }
  };
  
  // Khi người dùng nhấn nút xóa
  const confirmDelete = (role: Role) => {
    setDeleteTarget(role);
    setIsDeleteDialogOpen(true);
  };
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Quản lý vai trò</h2>
        <Link to="/admin/roles/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm vai trò mới
          </Button>
        </Link>
      </div>
      
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          placeholder="Tìm kiếm theo tên vai trò..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Button type="submit" variant="outline">
          <Search className="h-4 w-4" />
        </Button>
      </form>
      
      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">ID</TableHead>
              <TableHead>Tên vai trò</TableHead>
              <TableHead>Cập nhật lúc</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-500 mr-2" />
                    <span>Đang tải...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-gray-500">
                  Không tìm thấy vai trò nào
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.id}</TableCell>
                  <TableCell>{role.name}</TableCell>
                  <TableCell>{formatDateTime(role.updated_at)}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link to={`/admin/roles/${role.id}`}>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => confirmDelete(role)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {!isLoading && totalRoles > 0 && (
        <Pagination
          currentPage={page}
          pageSize={pageSize}
          totalItems={totalRoles}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}
      
      {/* Delete confirmation dialog */}
      <AlertDialog 
        open={isDeleteDialogOpen} 
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              Xác nhận xóa vai trò
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa vai trò "{deleteTarget?.name}"? 
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Xóa vai trò
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RoleList;
