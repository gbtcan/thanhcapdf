import React from 'react';
import { DashboardHeader, RecentlyViewedSection, RecommendedHymns } from '../components';
import { useDashboard } from '../hooks/useDashboard';
import { useAuth } from '../../../contexts/AuthContext';
import { LoadingIndicator } from '../../../core/components';

const DashboardPage: React.FC = () => {
  const { stats, recommendations, quickActions, isLoading } = useDashboard();
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Dashboard header with greeting and quick actions */}
      <DashboardHeader quickActions={quickActions} />
      
      {isLoading ? (
        <LoadingIndicator message="Đang tải thông tin..." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column */}
          <div className="lg:col-span-8">
            {/* Recommended hymns section */}
            <RecommendedHymns items={recommendations || []} />
            
            {/* Other sections can be added here */}
            <div className="mt-6">
              {/* Seasonal or upcoming liturgical events */}
            </div>
          </div>
          
          {/* Right column */}
          <div className="lg:col-span-4">
            {/* Recently viewed section */}
            <RecentlyViewedSection 
              items={stats?.recentlyViewed || []} 
              isAuthenticated={isAuthenticated}
            />
            
            {/* Favorites stats */}
            {isAuthenticated && stats?.favorites.total > 0 && (
              <div className="mt-6">
                {/* Favorites stats component */}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
