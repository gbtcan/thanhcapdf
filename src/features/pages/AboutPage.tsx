import React from 'react';
import { Link } from 'react-router-dom';
import { Music, Users, BookOpen, Heart, ChevronRight } from 'lucide-react';
import { Button } from '../../core/components/ui/button';

const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero section */}
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
          Về ThánhCaPDF
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
          Dự án chia sẻ và lưu trữ thánh ca Công giáo miễn phí cho cộng đồng
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Button asChild>
            <Link to="/hymns">
              <Music className="h-5 w-5 mr-2" />
              Khám phá thánh ca
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/contact">
              Liên hệ với chúng tôi
            </Link>
          </Button>
        </div>
      </section>

      {/* Mission section */}
      <section className="py-12 border-t border-gray-200 dark:border-gray-800">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Sứ mệnh của chúng tôi</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            ThánhCaPDF được tạo ra với mục tiêu mang âm nhạc Công giáo đến gần hơn với người hát và người nghe,
            đồng thời lưu trữ và bảo tồn kho tàng thánh ca Việt Nam.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 h-12 w-12 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Lưu trữ</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Thu thập và số hóa các bản nhạc thánh ca, đảm bảo rằng chúng được bảo tồn cho các thế hệ tương lai.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 h-12 w-12 rounded-full flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Chia sẻ</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Cung cấp một nền tảng miễn phí để chia sẻ và trao đổi thánh ca giữa các cộng đoàn và ca đoàn.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 h-12 w-12 rounded-full flex items-center justify-center mb-4">
              <Heart className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Phục vụ</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Hỗ trợ phụng vụ và hoạt động tôn giáo bằng cách cung cấp dễ dàng các tài nguyên âm nhạc cần thiết.
            </p>
          </div>
        </div>
      </section>

      {/* History section */}
      <section className="py-12 border-t border-gray-200 dark:border-gray-800">
        <div className="mb-10">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Lịch sử phát triển</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            ThánhCaPDF được thành lập vào năm 2023, bắt đầu từ một dự án nhỏ với mục tiêu số hóa các bản thánh ca.
          </p>
        </div>

        <div className="space-y-8">
          <div className="relative pl-10 pb-10 border-l-2 border-gray-200 dark:border-gray-700">
            <div className="absolute top-0 left-[-9px] h-4 w-4 rounded-full bg-indigo-600"></div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">2023 - Thành lập dự án</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Khởi đầu với việc thu thập và số hóa các bản nhạc thánh ca phổ biến.
              </p>
            </div>
          </div>

          <div className="relative pl-10 pb-10 border-l-2 border-gray-200 dark:border-gray-700">
            <div className="absolute top-0 left-[-9px] h-4 w-4 rounded-full bg-indigo-600"></div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">2024 - Phát triển nền tảng</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Xây dựng website và ứng dụng di động để chia sẻ thánh ca một cách dễ dàng hơn.
              </p>
            </div>
          </div>

          <div className="relative pl-10">
            <div className="absolute top-0 left-[-9px] h-4 w-4 rounded-full bg-indigo-600"></div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">2025 - Mở rộng cộng đồng</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Phát triển mạng lưới cộng tác viên và người đóng góp trên toàn quốc.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-12 border-t border-gray-200 dark:border-gray-800">
        <div className="bg-indigo-600 rounded-lg p-8 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Tham gia với chúng tôi</h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            Bạn có thể góp phần xây dựng kho tàng thánh ca bằng cách đóng góp bản nhạc, 
            lời bài hát hoặc các tài liệu liên quan đến thánh ca.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/contact" className="inline-flex items-center">
              Liên hệ đóng góp
              <ChevronRight className="ml-1 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
