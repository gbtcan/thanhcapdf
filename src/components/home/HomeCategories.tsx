import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { fetchCategories } from '../../lib/services/categoryService';
import LoadingIndicator from '../common/LoadingIndicator';

const HomeCategories: React.FC = () => {
  // Try to fetch categories but with error handling for missing table
  const { data: categories, isLoading, isError } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        return await fetchCategories();
      } catch (error) {
        // If categories table doesn't exist, just return empty array
        console.warn('Categories table might not exist yet:', error);
        return [];
      }
    },
    retry: false, // Don't retry if categories table doesn't exist
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // If there's an error or no categories, don't render this component
  if (isError || !categories || categories.length === 0) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingIndicator size="medium" />
      </div>
    );
  }

  return (
    <section className="py-12 bg-gray-50 dark:bg-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Browse by Category</h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Explore hymns organized by themes and categories
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.slice(0, 6).map((category) => (
            <Link
              key={category.id}
              to={`/categories/${category.slug || category.id}`}
              className="bg-white dark:bg-slate-700 shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                {category.name}
              </h3>
              {category.description && (
                <p className="text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">
                  {category.description}
                </p>
              )}
              <span className="inline-flex items-center text-indigo-600 dark:text-indigo-400">
                Browse hymns <ArrowRight className="ml-1 h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/categories"
            className="inline-flex items-center px-5 py-2 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            View all categories <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomeCategories;
