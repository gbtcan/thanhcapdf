import React from 'react';
import AdminLayout from '../../components/AdminLayout';
import CreatePost from '../../components/content/posts/CreatePost';

const CreatePostPage: React.FC = () => {
  return (
    <AdminLayout>
      <div className="container px-4 py-8 mx-auto">
        <CreatePost />
      </div>
    </AdminLayout>
  );
};

export default CreatePostPage;
