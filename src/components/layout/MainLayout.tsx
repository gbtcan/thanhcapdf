import React, { ReactNode } from 'react';
import Navbar from '../Navbar';
import Footer from '../Footer';
import ErrorBoundary from '../ErrorBoundary';
// Remove the import for Toaster from react-hot-toast

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <ErrorBoundary>
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </ErrorBoundary>
      
      {/* Remove the Toaster component */}
    </div>
  );
};

export default MainLayout;
