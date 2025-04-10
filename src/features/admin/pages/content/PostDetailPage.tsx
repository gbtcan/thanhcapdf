import React from 'react';
import { useParams } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import PostDetail from '../../components/content/posts/PostDetail';

const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const postId = parseInt(id || '0');

  return (
    <AdminLayout>
      <div className="container px-4 py-8 mx-auto">
        <PostDetail id={postId} />
      </div>
    </AdminLayout>
  );
};

export default PostDetailPage;
