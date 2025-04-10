import React from 'react';
import AdminLayout from '../../components/AdminLayout';
import CreateHymn from '../../components/content/hymns/CreateHymn';

const CreateHymnPage: React.FC = () => {
  return (
    <AdminLayout>
      <div className="container px-4 py-8 mx-auto">
        <CreateHymn />
      </div>
    </AdminLayout>
  );
};

export default CreateHymnPage;
