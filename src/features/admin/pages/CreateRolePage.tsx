import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import RoleForm from '../components/roles/RoleForm';
import { Button } from '../../../core/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRoles } from '../hooks/useRoles';
import { RoleFormData } from '../types/roles';

const CreateRolePage: React.FC = () => {
  const navigate = useNavigate();
  const { createRole, isCreating } = useRoles();
  
  const handleSubmit = async (data: RoleFormData) => {
    try {
      await createRole(data);
      navigate('/admin/roles');
    } catch (error) {
      console.error('Failed to create role:', error);
    }
  };
  
  return (
    <AdminLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/admin/roles')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <h1 className="text-xl font-bold">Tạo vai trò mới</h1>
        </div>
        
        <RoleForm
          isSubmitting={isCreating}
          onSubmit={handleSubmit}
        />
      </div>
    </AdminLayout>
  );
};

export default CreateRolePage;
