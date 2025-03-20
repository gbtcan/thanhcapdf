import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { User, Search, Loader2, XCircle, Book } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Author } from '../types';
import PageLayout from '../components/PageLayout';

const AuthorsList = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all authors
  const { data: authors, isLoading, error } = useQuery<Author[]>({
    queryKey: ['public-authors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('authors')
        .select('*')
        .order('name');
        
      if (error) throw error;
      return data;
    }
  });

  // Filter authors based on search
  const filteredAuthors = authors?.filter(author =>
    !searchQuery || 
    author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (author.biography && author.biography.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <PageLayout title="Authors">
      <div className="space-y-6">
        {/* Search and results count */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search authors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          {!isLoading && !error && (
            <div className="text-sm text-gray-500">
              Showing {filteredAuthors?.length || 0} of {authors?.length || 0} authors
            </div>
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
            <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Error loading authors</p>
              <p className="text-sm">{(error as Error).message}</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && filteredAuthors?.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No authors found</h3>
            {searchQuery ? (
              <p className="mt-1 text-gray-500">Try adjusting your search terms</p>
            ) : (
              <p className="mt-1 text-gray-500">No authors have been added yet</p>
            )}
          </div>
        )}

        {/* Authors grid */}
        {!isLoading && !error && filteredAuthors && filteredAuthors.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAuthors.map((author) => (
              <Link
                key={author.id}
                to={`/authors/${author.id}`}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className="bg-indigo-100 p-2 rounded-full">
                    <User className="h-5 w-5 text-indigo-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 truncate">{author.name}</h2>
                </div>
                
                {author.biography ? (
                  <p className="text-gray-600 line-clamp-3 mt-2">{author.biography}</p>
                ) : (
                  <div className="flex items-center text-gray-500 mt-2">
                    <Book className="h-4 w-4 mr-2" />
                    <span className="text-sm">View hymns by this author</span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default AuthorsList;
