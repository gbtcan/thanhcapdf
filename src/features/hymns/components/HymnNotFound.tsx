import React from 'react';
import { Link } from 'react-router-dom';
import { Music, Search, ArrowLeft } from 'lucide-react';
import { Button } from '../../../core/components/ui/button';

interface HymnNotFoundProps {
  id?: string;
}

const HymnNotFound: React.FC<HymnNotFoundProps> = ({ id }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6 mb-6">
        <Music className="h-16 w-16 text-gray-400" />
      </div>
      
      <h1 className="text-2xl font-bold mb-2">Thánh ca không tìm thấy</h1>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
        {id 
          ? `Không tìm thấy thánh ca với ID: ${id}. Nó có thể đã bị xóa hoặc chưa được thêm vào hệ thống.`
          : 'Không tìm thấy thánh ca được yêu cầu. Nó có thể đã bị xóa hoặc chưa được thêm vào hệ thống.'}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild variant="outline">
          <Link to="/hymns" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách
          </Link>
        </Button>
        
        <Button asChild>
          <Link to="/search" className="flex items-center">
            <Search className="mr-2 h-4 w-4" />
            Tìm kiếm thánh ca
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default HymnNotFound;
