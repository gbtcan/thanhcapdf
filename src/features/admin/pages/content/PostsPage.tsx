import React from 'react';
import AdminLayout from '../../components/AdminLayout';
import PostsList from '../../components/content/posts/PostsList';

const PostsPage: React.FC = () => {
  return (
    <AdminLayout>
      <div className="container px-4 py-8 mx-auto">
        <PostsList />
      </div>
    </AdminLayout>
  );
};

export default PostsPage;
