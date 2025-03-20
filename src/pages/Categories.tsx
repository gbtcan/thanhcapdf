import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Search, Plus, FilterX, Filter, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Category } from '../types';

// Extended category type with song count
interface CategoryWithCount extends Category {
  song_count: number;
}

const Categories = () => {
  const { userRole } = useAuth();
  const isAdmin = userRole === 'administrator';
  const [searchQuery, setSearchQuery] = useState('');
  const [minSongs, setMinSongs] = useState<number | ''>('');
  const [isFiltering, setIsFiltering] = useState(false);

  // Fetch categories with song count
  const { data: categories, isLoading, error } = useQuery<CategoryWithCount[]>({
    queryKey: ['categories-with-count'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          song_count:hymn_categories(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map((category) => ({
        ...category,
        song_count: category.song_count?.[0]?.count || 0
      }));
    },
  });

  // Filter categories based on search and song count
  const filteredCategories = categories?.filter((category) => {
    const matchesSearch = !searchQuery || 
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (category.description && 
       category.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSongCount = minSongs === '' || category.song_count >= minSongs;
    
    return matchesSearch && matchesSongCount;
  });

  // Reset filters
  const resetFilters = () => {
    setSearchQuery('');
    setMinSongs('');
    setIsFiltering(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
        
        <div className="flex items-center space-x-2">
          <span className="bg-indigo-100 text-indigo-800 py-1 px-3 rounded-full text-sm font-medium">
            {categories ? categories.length : 0} Categories
          </span>
          
          {isAdmin && (
            <Link 
              to="/editor/categories/new" 
              className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white py-1 px-3 rounded-full text-sm font-medium"
            >
              <Plus className="h-4 w-4 mr-1" />
              <span>Add</span>
            </Link>
          )}
        </div>
      </div>

      {/* Search and filter */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setIsFiltering(!isFiltering)}
              className={`flex items-center px-4 py-2 border rounded-lg ${
                isFiltering 
                  ? 'bg-indigo-100 border-indigo-300 text-indigo-700' 
                  : 'border-gray-300 text-gray-700'
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
            
            {(searchQuery || minSongs !== '') && (
              <button
                onClick={resetFilters}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
              >
                <FilterX className="h-4 w-4 mr-2" />
                Reset
              </button>
            )}
          </div>
        </div>
        
        {isFiltering && (
          <div className="mt-4 flex gap-4 items-center">
            <label className="flex items-center">
              <span className="mr-2">Min. Songs:</span>
              <input
                type="number"
                min="0"
                value={minSongs}
                onChange={(e) => setMinSongs(e.target.value ? parseInt(e.target.value) : '')}
                className="w-20 border border-gray-300 rounded-md px-2 py-1"
              />
            </label>
          </div>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p>Error loading categories: {(error as Error).message}</p>
        </div>
      )}

      {/* No results */}
      {filteredCategories && filteredCategories.length === 0 && (
        <div className="bg-gray-50 text-center py-12 rounded-lg">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No categories found</h3>
          <p className="mt-2 text-gray-500">
            {searchQuery || minSongs !== '' ? 
              'Try changing your search or filter criteria.' : 
              'Start by adding a new category.'}
          </p>
        </div>
      )}

      {/* Categories grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCategories?.map((category) => (
          <Link
            key={category.id}
            to={`/categories/${category.id}`}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="bg-indigo-100 p-2 rounded-full">
                <BookOpen className="h-5 w-5 text-indigo-600" />
              </div>
              <span className="bg-indigo-50 text-indigo-700 py-1 px-2 text-xs font-medium rounded-full">
                {category.song_count} {category.song_count === 1 ? 'hymn' : 'hymns'}
              </span>
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{category.name}</h2>
            
            {category.description && (
              <p className="text-gray-600 line-clamp-2">{category.description}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Categories;