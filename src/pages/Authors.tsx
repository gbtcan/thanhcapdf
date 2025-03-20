import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { User, Book } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Author } from '../types';

const Authors = () => {
  const { data: authors, isLoading, error } = useQuery({
    queryKey: ['authors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('authors')
        .select('*')
        .order('name');
        
      if (error) throw error;
      return data as Author[];
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p>Error loading authors: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Authors</h1>
        <span className="bg-indigo-100 text-indigo-800 py-1 px-3 rounded-full text-sm font-medium">
          {authors?.length} Authors
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {authors?.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-gray-500">No authors found.</div>
        ) : (
          authors?.map((author) => (
            <Link
              key={author.id}
              to={`/authors/${author.id}`}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="bg-indigo-100 p-2 rounded-full">
                  <User className="h-5 w-5 text-indigo-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{author.name}</h2>
              </div>
              
              {author.biography ? (
                <p className="mt-2 text-gray-600 line-clamp-2">{author.biography}</p>
              ) : (
                <div className="flex items-center text-gray-500 mt-2">
                  <Book className="h-4 w-4 mr-2" />
                  <span className="text-sm">View hymns</span>
                </div>
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default Authors;