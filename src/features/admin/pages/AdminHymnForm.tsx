import React from 'react';
import { useParams } from 'react-router-dom';
import { Music } from 'lucide-react';

const AdminHymnForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
        <Music className="h-6 w-6 mr-2 text-indigo-600" />
        {isEditMode ? 'Chỉnh sửa bài hát' : 'Thêm bài hát mới'}
      </h1>
      
      <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-md text-center">
        <p className="text-amber-800 dark:text-amber-300">
          Form {isEditMode ? 'chỉnh sửa' : 'thêm'} bài hát đang được phát triển và sẽ sẵn sàng trong phiên bản tới.
        </p>
      </div>
    </div>
  );
};

export default AdminHymnForm;
