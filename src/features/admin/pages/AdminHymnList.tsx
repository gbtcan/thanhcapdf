import React from 'react';
import { Link } from 'react-router-dom';
import { Music, Plus } from 'lucide-react';

const AdminHymnList: React.FC = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <Music className="h-6 w-6 mr-2 text-indigo-600" />
          Quản lý bài hát
        </h1>
        
        <Link
          to="/admin/hymns/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
        >
          <Plus className="h-5 w-5 mr-1" /> Thêm bài hát
        </Link>
      </div>
      
      <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-md text-center">
        <p className="text-amber-800 dark:text-amber-300">
          Tính năng quản lý bài hát đang được phát triển và sẽ sẵn sàng trong phiên bản tới.
        </p>
      </div>
    </div>
  );
};

export default AdminHymnList;
