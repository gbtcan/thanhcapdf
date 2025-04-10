import React from 'react';
import AdminLayout from '../../components/AdminLayout';
import ContentDashboard from '../../components/content/ContentDashboard';

const ContentPage: React.FC = () => {
  return (
    <AdminLayout>
      <div className="container px-4 py-8 mx-auto">
        <ContentDashboard />
      </div>
    </AdminLayout>
  );
};

export default ContentPage;
