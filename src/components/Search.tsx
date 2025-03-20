import React from 'react';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, Music, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Hymn, Author } from '../types';

const Search = () => {
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<{
    hymns: (Hymn & { author: Author })[];
    authors: Author[];
  }>({ hymns: [], authors: [] });
  const [loading, setLoading] = React.useState(false);

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    if (!searchQuery.trim()) {
      setResults({ hymns: [], authors: [] });
      return;
    }

    setLoading(true);
    try {
      const normalizedQuery = searchQuery.toLowerCase();
      
      const [hymnsResponse, authorsResponse] = await Promise.all([
        supabase
          .from('hymns')
          .select(`
            *,
            author:authors(*)
          `)
          .textSearch('search_vector', normalizedQuery),
        supabase
          .from('authors')
          .select('*')
          .ilike('name', `%${normalizedQuery}%`)
      ]);

      if (hymnsResponse.error) throw hymnsResponse.error;
      if (authorsResponse.error) throw authorsResponse.error;

      setResults({
        hymns: hymnsResponse.data || [],
        authors: authorsResponse.data || []
      });
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search hymns and authors..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        query && (
          <div className="space-y-8">
            {results.hymns.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Hymns</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {results.hymns.map((hymn) => (
                    <Link
                      key={hymn.id}
                      to={`/hymns/${hymn.id}`}
                      className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <Music className="h-5 w-5 text-indigo-600" />
                        <h3 className="font-medium text-gray-900">{hymn.title}</h3>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <User className="h-4 w-4" />
                        <span>{hymn.author?.name || 'Unknown Author'}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {results.authors.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Authors</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {results.authors.map((author) => (
                    <Link
                      key={author.id}
                      to={`/authors/${author.id}`}
                      className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-center space-x-3">
                        <User className="h-5 w-5 text-indigo-600" />
                        <h3 className="font-medium text-gray-900">{author.name}</h3>
                      </div>
                      {author.biography && (
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                          {author.biography}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {results.hymns.length === 0 && results.authors.length === 0 && (
              <div className="text-center py-8 text-gray-600">
                No results found for "{query}"
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};

export default Search;