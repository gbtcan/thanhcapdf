import React from 'react';
import { useParams } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import RoleDetail from '../components/roles/RoleDetail';

const RoleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const roleId = parseInt(id || '0');
  
  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <RoleDetail id={roleId} />
      </div>
    </AdminLayout>
  );
};

export default RoleDetailPage;
