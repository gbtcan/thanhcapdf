import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, User, Music, Calendar } from 'lucide-react';
import { fetchAuthorById } from '../../lib/authorService';
import PageLayout from '../../components/PageLayout';
import LoadingIndicator from '../../components/LoadingIndicator';
import AlertBanner from '../../components/AlertBanner';
import HymnList from '../../components/hymns/HymnList';

const AuthorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  // Fetch author details
  const { 
    data: author,
    isLoading,
    error
  } = useQuery({
    queryKey: ['author', id],
    queryFn: () => fetchAuthorById(id!),
    enabled: !!id
  });
  
  if (isLoading) {
    return (
      <PageLayout title="Loading Author...">
        <div className="flex justify-center py-12">
          <LoadingIndicator size="large" message="Loading author details..." />
        </div>
      </PageLayout>
    );
  }
  
  if (error || !author) {
    return (
      <PageLayout title="Error">
        <AlertBanner
          type="error"
          title="Failed to load author"
          message="The author you're looking for could not be found or there was an error loading the details."
        />
        <div className="mt-4">
          <Link
            to="/authors"
            className="text-indigo-600 hover:text-indigo-800 flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Authors
          </Link>
        </div>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout title={author.name}>
      <div className="max-w-5xl mx-auto">
        {/* Back navigation */}
        <div className="mb-6">
          <Link
            to="/authors"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Authors
          </Link>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main content */}
          <div className="md:w-2/3">
            {/* Author profile */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{author.name}</h1>
              
              {author.biography && (
                <div className="mt-4 prose prose-indigo max-w-none">
                  <p>{author.biography}</p>
                </div>
              )}
            </div>
            
            {/* Author's hymns */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Hymns</h2>
              {author.hymns && author.hymns.length > 0 ? (
                <HymnList hymns={author.hymns} />
              ) : (
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                  <Music className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No hymns found for this author</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="md:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-6 flex justify-center">
                <div className="h-24 w-24 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="h-12 w-12 text-indigo-600" />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Name</h3>
                  <p className="mt-1 text-lg text-gray-900">{author.name}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Hymns</h3>
                  <p className="mt-1 text-lg text-gray-900 flex items-center">
                    <Music className="h-5 w-5 mr-1 text-indigo-500" />
                    {author.hymns?.length || 0} hymns
                  </p>
                </div>
                
                {author.born_year && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Born</h3>
                    <p className="mt-1 text-lg text-gray-900">{author.born_year}</p>
                  </div>
                )}
                
                {author.died_year && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Died</h3>
                    <p className="mt-1 text-lg text-gray-900">{author.died_year}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default AuthorDetail;
