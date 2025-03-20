import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { User, Search, Music } from 'lucide-react';
import { fetchAuthors } from '../../lib/authorService';
import PageLayout from '../../components/PageLayout';
import LoadingIndicator from '../../components/LoadingIndicator';
import AlertBanner from '../../components/AlertBanner';

const AuthorList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch authors
  const { data: authors, isLoading, error } = useQuery({
    queryKey: ['authors'],
    queryFn: fetchAuthors
  });
  
  // Filter authors based on search term
  const filteredAuthors = authors?.filter(
    author => author.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <PageLayout title="Authors">
      <div className="max-w-5xl mx-auto">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Authors</h1>
          <p className="mt-1 text-gray-500">Browse hymn authors and composers</p>
        </div>
        
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search authors..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Authors list */}
        <div>
          {error ? (
            <AlertBanner
              type="error"
              title="Error"
              message="Failed to load authors. Please try again."
            />
          ) : isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingIndicator size="large" message="Loading authors..." />
            </div>
          ) : filteredAuthors && filteredAuthors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAuthors.map(author => (
                <Link
                  key={author.id}
                  to={`/authors/${author.id}`}
                  className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                      <User className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{author.name}</h3>
                      {author.hymn_count && (
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                          <Music className="h-3 w-3 mr-1" />
                          {author.hymn_count} hymns
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No authors found</h3>
              <p className="text-gray-500">Try a different search term</p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default AuthorList;
