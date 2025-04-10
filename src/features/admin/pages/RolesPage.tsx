import React from 'react';
import AdminLayout from '../components/AdminLayout';
import RoleList from '../components/roles/RoleList';

const RolesPage: React.FC = () => {
  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <RoleList />
      </div>
    </AdminLayout>
  );
};

export default RolesPage;
