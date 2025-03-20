import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Music } from 'lucide-react';
import { fetchThemeById } from '../../lib/themeService';
import PageLayout from '../../components/PageLayout';
import LoadingIndicator from '../../components/LoadingIndicator';
import AlertBanner from '../../components/AlertBanner';
import HymnList from '../../components/hymns/HymnList';

const ThemeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  // Fetch theme details
  const { 
    data: theme,
    isLoading,
    error
  } = useQuery({
    queryKey: ['theme', id],
    queryFn: () => fetchThemeById(id!),
    enabled: !!id
  });
  
  if (isLoading) {
    return (
      <PageLayout title="Loading Theme...">
        <div className="flex justify-center py-12">
          <LoadingIndicator size="large" message="Loading theme details..." />
        </div>
      </PageLayout>
    );
  }
  
  if (error || !theme) {
    return (
      <PageLayout title="Error">
        <AlertBanner
          type="error"
          title="Failed to load theme"
          message="The theme you're looking for could not be found or there was an error loading the details."
        />
        <div className="mt-4">
          <Link
            to="/themes"
            className="text-indigo-600 hover:text-indigo-800 flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Themes
          </Link>
        </div>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout title={`${theme.name} - Theme`}>
      <div className="max-w-5xl mx-auto">
        {/* Back navigation */}
        <div className="mb-6">
          <Link
            to="/themes"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Themes
          </Link>
        </div>
        
        {/* Theme header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center mb-4">
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
              <Music className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{theme.name}</h1>
              <p className="text-gray-500">
                {theme.hymns?.length || 0} hymns in this theme
              </p>
            </div>
          </div>
          
          {theme.description && (
            <div className="mt-4 prose prose-green max-w-none text-gray-700">
              <p>{theme.description}</p>
            </div>
          )}
        </div>
        
        {/* Hymns section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Hymns with this theme</h2>
          {theme.hymns && theme.hymns.length > 0 ? (
            <HymnList hymns={theme.hymns} />
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <Music className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No hymns found for this theme</p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default ThemeDetail;
