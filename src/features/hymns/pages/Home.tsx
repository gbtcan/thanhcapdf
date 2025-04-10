import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Music, Info, Star } from 'lucide-react';
import { Input } from '../../../core/components/ui/input';
import { Button } from '../../../core/components/ui/button';
import { Card, CardContent } from '../../../core/components/ui/card';
import PopularHymnsSection from '../components/PopularHymnsSection';
import RecentHymnsSection from '../components/RecentHymnsSection';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero section */}
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 z-0 opacity-20">
          <svg className="h-full w-full" viewBox="0 0 800 800">
            <path d="M0,0 L800,0 L800,800 L0,800 Z" fill="none" stroke="white" strokeWidth="2"></path>
            <circle cx="400" cy="400" r="200" fill="none" stroke="white" strokeWidth="2"></circle>
            <circle cx="400" cy="400" r="300" fill="none" stroke="white" strokeWidth="2"></circle>
            <circle cx="400" cy="400" r="100" fill="none" stroke="white" strokeWidth="2"></circle>
          </svg>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Thành Ca PDF phiên bản mới!</h1>
          
          <div className="inline-block mb-6 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
            <span className="flex items-center text-sm font-medium">
              <Info className="h-4 w-4 mr-1" />
              Phiên bản mới với nhiều tính năng hấp dẫn
            </span>
          </div>
          
          <p className="text-lg md:text-xl mb-6">
            Tìm kiếm, chia sẻ và khám phá kho thánh ca với giao diện hoàn toàn mới.
            Trải nghiệm cùng Thành Ca PDF ngay hôm nay!
          </p>
          
          <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
            <Input
              type="text"
              placeholder="Tìm kiếm thánh ca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 rounded-full bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/70 focus:bg-white/20"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/70" />
            <Button 
              type="submit" 
              className="absolute right-1 top-1 rounded-full bg-white text-indigo-600 hover:bg-white/90"
            >
              Tìm kiếm
            </Button>
          </form>
        </div>
      </section>

      {/* Thẻ tính năng mới */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800/30">
          <CardContent className="p-6">
            <div className="h-12 w-12 rounded-full bg-amber-200 dark:bg-amber-800/50 flex items-center justify-center mb-4">
              <Music className="h-6 w-6 text-amber-700 dark:text-amber-300" />
            </div>
            <h3 className="text-lg font-medium mb-2">Thư viện thánh ca mở rộng</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Thêm hàng trăm bài thánh ca mới với đầy đủ lời, bản nhạc và file PDF chất lượng cao.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-800/30">
          <CardContent className="p-6">
            <div className="h-12 w-12 rounded-full bg-emerald-200 dark:bg-emerald-800/50 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-6 w-6 text-emerald-700 dark:text-emerald-300">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Trình xem PDF tích hợp</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Xem và tải thánh ca dạng PDF ngay trên trình duyệt, không cần phần mềm bổ sung.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800/30">
          <CardContent className="p-6">
            <div className="h-12 w-12 rounded-full bg-purple-200 dark:bg-purple-800/50 flex items-center justify-center mb-4">
              <Star className="h-6 w-6 text-purple-700 dark:text-purple-300" />
            </div>
            <h3 className="text-lg font-medium mb-2">Danh sách yêu thích cá nhân</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Lưu trữ và quản lý danh sách thánh ca yêu thích của riêng bạn để truy cập nhanh chóng.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Thánh ca phổ biến */}
      <section className="py-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <Music className="mr-2 h-6 w-6 text-indigo-600" /> 
          Thánh ca phổ biến
        </h2>
        <PopularHymnsSection limit={5} />
      </section>
      
      {/* Thánh ca mới cập nhật */}
      <section className="py-8">
        <h2 className="text-2xl font-bold mb-6">Vừa cập nhật</h2>
        <RecentHymnsSection limit={4} />
      </section>
    </div>
  );
};

export default Home;
