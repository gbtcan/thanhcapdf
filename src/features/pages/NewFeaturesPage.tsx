import React from 'react';
import { Link } from 'react-router-dom';
import { Music, FileText, Headphones, Video, Monitor, Star, Search, Users, Share2, User } from 'lucide-react';
import { Button } from '../../core/components/ui/button';

const NewFeaturesPage: React.FC = () => {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Thành Ca PDF phiên bản mới đã ra mắt!
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Chúng tôi đã cập nhật Thành Ca PDF với nhiều tính năng mới và trải nghiệm người dùng được cải thiện.
          Khám phá những điểm nổi bật dưới đây.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {/* Feature 1 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-700">
          <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-4">
            <Music className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Thư viện thánh ca mở rộng</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Thêm hàng trăm bài thánh ca mới từ nhiều tác giả và nguồn khác nhau,
            được tổ chức theo chủ đề và mục đích sử dụng.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-700">
          <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-4">
            <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Trình xem PDF tích hợp</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Xem và tải thánh ca dạng PDF ngay trong ứng dụng với khả năng phóng to, thu nhỏ
            và điều hướng dễ dàng.
          </p>
        </div>

        {/* Feature 3 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-700">
          <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-4">
            <Headphones className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Trình phát âm thanh</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Nghe các bản thu âm thánh ca với trình phát âm thanh hiện đại và điều khiển dễ dàng.
          </p>
        </div>

        {/* Feature 4 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-700">
          <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-4">
            <Star className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Danh sách yêu thích</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Lưu trữ thánh ca yêu thích để truy cập nhanh chóng và tạo các bộ sưu tập cá nhân.
          </p>
        </div>

        {/* Feature 5 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-700">
          <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-4">
            <Video className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Liên kết video</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Xem video biểu diễn thánh ca từ YouTube và các nguồn khác ngay trong ứng dụng.
          </p>
        </div>

        {/* Feature 6 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-700">
          <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-4">
            <Monitor className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Trình chiếu trình bày</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Tải xuống và sử dụng các bản trình chiếu PowerPoint cho việc trình bày thánh ca.
          </p>
        </div>

        {/* Feature 7 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-700">
          <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-4">
            <Search className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Tìm kiếm nâng cao</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Tìm kiếm thánh ca theo tên, lời, chủ đề, tác giả hoặc số bài với kết quả chính xác hơn.
          </p>
        </div>

        {/* Feature 8 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-700">
          <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-4">
            <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Thông tin tác giả</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Khám phá thông tin chi tiết về các tác giả thánh ca và các tác phẩm của họ.
          </p>
        </div>

        {/* Feature 9 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-700">
          <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-4">
            <Share2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Chia sẻ dễ dàng</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Chia sẻ thánh ca qua mạng xã hội, email hoặc tin nhắn với các liên kết trực tiếp.
          </p>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Bắt đầu trải nghiệm ngay hôm nay!
        </h2>
        <p className="text-lg mb-6 text-gray-600 dark:text-gray-300">
          Hãy khám phá kho thánh ca với giao diện mới của chúng tôi
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild size="lg">
            <Link to="/hymns" className="flex items-center">
              <Music className="mr-2 h-5 w-5" />
              Khám phá thánh ca
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/register" className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Đăng ký tài khoản
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NewFeaturesPage;
