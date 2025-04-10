import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../../features/layouts/components/Navbar';
import Footer from '../../features/layouts/components/Footer';
import BottomNavigation from '../../core/components/BottomNavigation';
import { useMediaQuery } from '../../core/hooks/useMediaQuery';

const PublicLayout: React.FC = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Navbar toggleSidebar={toggleSidebar} />

      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-6 mb-16 md:mb-0">
        <Outlet />
      </main>

      {/* Footer - hide on mobile */}
      {!isMobile && <Footer />}
      
      {/* Bottom navigation - only show on mobile */}
      {isMobile && <BottomNavigation />}
    </div>
  );
};

export default PublicLayout;
