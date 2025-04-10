import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import HeaderBanner from './HeaderBanner';
import { useLocalStorage } from '../../../core/hooks/useLocalStorage';
import { Button } from '../../../core/components/ui/button';
import { ArrowUp } from 'lucide-react';

const MainLayout: React.FC = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  // Đặt mặc định là true để hiển thị banner khi người dùng truy cập lần đầu
  const [showBanner, setShowBanner] = useLocalStorage('show-new-version-banner', true);
  const location = useLocation();

  // Reset scroll position when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Show scroll to top button when scrolled down
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Hiển thị banner thông báo phiên bản mới */}
      <HeaderBanner 
        showBanner={showBanner}
        onClose={() => setShowBanner(false)}
        variant="promotion"
        title="Thành Ca PDF phiên bản mới đã ra mắt!"
        description="Khám phá kho thánh ca với giao diện mới."
        actionText="Xem tính năng mới"
        actionUrl="/about/new-features"
      />
      
      {/* Navbar */}
      <Navbar toggleSidebar={toggleSidebar} />
      
      {/* Main Content */}
      <div className="flex-1 w-full">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <Outlet />
        </main>
      </div>
      
      {/* Footer */}
      <Footer />
      
      {/* Scroll to top button */}
      {showScrollTop && (
        <Button
          className="fixed bottom-6 right-6 h-10 w-10 rounded-full shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white z-40"
          onClick={scrollToTop}
          size="icon"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};

export default MainLayout;
