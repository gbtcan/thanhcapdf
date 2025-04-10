import React from 'react';
import AdminLayout from '../../components/AdminLayout';
import CommentsList from '../../components/content/comments/CommentsList';

const CommentsPage: React.FC = () => {
  return (
    <AdminLayout>
      <div className="container px-4 py-8 mx-auto">
        <CommentsList />
      </div>
    </AdminLayout>
  );
};

export default CommentsPage;
