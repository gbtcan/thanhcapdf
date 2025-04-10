import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoleDetail } from '../../hooks/useRoles';
import RoleForm from './RoleForm';
import { 
  ArrowLeft, 
  Shield, 
  User, 
  AlertTriangle, 
  Loader2 
} from 'lucide-react';
import { Button } from '../../../../core/components/ui/button';
import {
  Alert,
  AlertDescription,
  AlertTitle
} from '../../../../core/components/ui/alert';
import { RoleFormData } from '../../types/roles';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../../../core/components/ui/alert-dialog';

interface RoleDetailProps {
  id: number;
}

const RoleDetail: React.FC<RoleDetailProps> = ({ id }) => {
  const navigate = useNavigate();
  const { 
    role, 
    usageCount,
    isLoading, 
    isUpdating,
    isDeleting,
    updateRole,
    deleteRole,
    isInUse
  } = useRoleDetail(id);
  
  // Function to go back to roles list
  const goBack = () => {
    navigate('/admin/roles');
  };
  
  // Function to handle role update
  const handleUpdate = async (data: RoleFormData) => {
    await updateRole(data);
  };
  
  // Function to handle role deletion
  const handleDelete = async () => {
    await deleteRole();
    navigate('/admin/roles');
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }
  
  if (!role) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={goBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>
            Không tìm thấy thông tin vai trò. Vai trò có thể đã bị xóa.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={goBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <h1 className="text-xl font-bold">
            Chỉnh sửa vai trò: {role.name}
          </h1>
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={isDeleting || isInUse}>
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                <>Xóa vai trò</>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
              <AlertDialogDescription>
                Hành động này sẽ xóa vai trò "{role.name}" và không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600"
              >
                Xóa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      
      {/* Usage warning */}
      {isInUse && (
        <Alert>
          <User className="h-4 w-4" />
          <AlertTitle>Vai trò đang được sử dụng</AlertTitle>
          <AlertDescription>
            Có {usageCount} người dùng đang sử dụng vai trò này. 
            Bạn không thể xóa vai trò này cho đến khi không còn người dùng nào sử dụng nó.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Form */}
      <RoleForm
        initialData={{
          name: role.name,
          permissions: role.permissions
        }}
        isSubmitting={isUpdating}
        onSubmit={handleUpdate}
      />
    </div>
  );
};

export default RoleDetail;
