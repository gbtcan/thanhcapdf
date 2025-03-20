import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Tag, Search, Loader2, XCircle, BookOpen, FilterX } from 'lucide-react';
import { supabase } from '../lib/supabase';
import PageLayout from '../components/PageLayout';
import type { Category } from '../types';

// Extended category type with song count
interface CategoryWithCount extends Category {
  hymn_count: number;
}

// // Type for category count data
// interface CategoryCountData {
//   category_id: number;
//   count: string; // Supabase returns count as a string
// }

const CategoriesList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [minSongs, setMinSongs] = useState<number | ''>('');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch categories with song count
  const { data: categories, isLoading, error } = useQuery<CategoryWithCount[]>({
    queryKey: ['public-categories-with-count'],
    queryFn: async () => {
      try {
        // First get all categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('name');
          
        if (categoriesError) throw categoriesError;
        
        // Then get hymn counts for each category using count aggregation
        // Fix: Use a different approach for grouping and counting
        const { data: countData, error: countError } = await supabase
          .from('hymn_categories')
          .select('category_id, count')
          .select('category_id') // Select the category_id column
          .throwOnError(); // This will ensure errors are thrown properly
          
        if (countError) throw countError;
        
        // Count the occurrences of each category_id manually
        const countMap: Record<number, number> = {};
        countData.forEach((item: { category_id: number }) => {
          countMap[item.category_id] = (countMap[item.category_id] || 0) + 1;
        });
        
        // Combine the data
        return categoriesData.map((category) => ({
          ...category,
          hymn_count: countMap[category.id] || 0
        }));
      } catch (error) {
        console.error("Error fetching categories:", error);
        throw error;
      }
    }
  });

  // Filter categories based on search and minimum songs
  const filteredCategories = categories?.filter((category) => {
    const matchesSearch = !searchQuery || 
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (category.description && 
       category.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSongCount = minSongs === '' || category.hymn_count >= minSongs;
    
    return matchesSearch && matchesSongCount;
  }) || [];

  // Reset filters
  const resetFilters = () => {
    setSearchQuery('');
    setMinSongs('');
    setShowFilters(false);
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          {!isLoading && !error && (
            <span className="bg-indigo-100 text-indigo-800 py-1 px-3 rounded-full text-sm font-medium">
              {categories?.length || 0} Categories
            </span>
          )}
        </div>

        {/* Search and filters */}
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
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-4 py-2 border rounded-lg ${
                  showFilters || minSongs !== ''
                    ? 'bg-indigo-100 border-indigo-300 text-indigo-700' 
                    : 'border-gray-300 text-gray-700'
                }`}
              >
                Filters
              </button>
              
              {(searchQuery || minSongs !== '') && (
                <button
                  onClick={resetFilters}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  <FilterX className="h-4 w-4 mr-2" />
                  Reset
                </button>
              )}
            </div>
          </div>
          
          {/* Expanded filters */}
          {showFilters && (
            <div className="mt-4 flex gap-4 items-center">
              <label className="flex items-center">
                <span className="mr-2">Min. hymns:</span>
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
            <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
            <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Error loading categories</p>
              <p className="text-sm">{(error as Error).message}</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && filteredCategories.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <Tag className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No categories found</h3>
            <p className="mt-1 text-gray-500">
              {searchQuery || minSongs !== '' ? 
                'Try adjusting your search or filter criteria' : 
                'No categories have been added yet'}
            </p>
            
            {(searchQuery || minSongs !== '') && (
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Categories grid */}
        {!isLoading && !error && filteredCategories.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCategories.map((category) => (
              <Link
                key={category.id}
                to={`/categories/${category.id}`}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-indigo-100 p-2 rounded-full">
                    <Tag className="h-5 w-5 text-indigo-600" />
                  </div>
                  <span className="bg-indigo-50 text-indigo-700 py-1 px-2 text-xs font-medium rounded-full">
                    {category.hymn_count} {category.hymn_count === 1 ? 'hymn' : 'hymns'}
                  </span>
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{category.name}</h2>
                
                {category.description && (
                  <p className="text-gray-600 line-clamp-2 mb-3">{category.description}</p>
                )}
                
                {category.hymn_count > 0 && (
                  <div className="mt-3 text-sm text-indigo-600 flex items-center">
                    <BookOpen className="h-4 w-4 mr-1" />
                    <span>Browse hymns</span>
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

export default CategoriesList;
