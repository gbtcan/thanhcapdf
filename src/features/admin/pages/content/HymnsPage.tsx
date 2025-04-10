import React from 'react';
import AdminLayout from '../../components/AdminLayout';
import HymnsList from '../../components/content/hymns/HymnsList';

const HymnsPage: React.FC = () => {
  return (
    <AdminLayout>
      <div className="container px-4 py-8 mx-auto">
        <HymnsList />
      </div>
    </AdminLayout>
  );
};

export default HymnsPage;
