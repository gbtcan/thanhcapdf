import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  BookOpen, ChevronLeft, Music, Search, 
  User, Loader2 
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import PageLayout from '../components/PageLayout';
import type { Category, HymnWithRelations } from '../types';

const CategoryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch category details
  const { 
    data: category, 
    isLoading: categoryLoading, 
    error: categoryError 
  } = useQuery<Category>({
    queryKey: ['category', id],
    queryFn: async () => {
      if (!id) throw new Error('Category ID is required');
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      if (!data) throw new Error('Category not found');
      
      return data;
    },
    enabled: !!id
  });

  // Fetch hymns in this category
  const { 
    data: hymns, 
    isLoading: hymnsLoading, 
    error: hymnsError 
  } = useQuery<HymnWithRelations[]>({
    queryKey: ['category-hymns', id],
    queryFn: async () => {
      if (!id) throw new Error('Category ID is required');
      
      const { data, error } = await supabase
        .from('hymn_categories')
        .select(`
          hymn_id,
          hymns:hymn_id(
            *,
            hymn_authors(authors(*))
          )
        `)
        .eq('category_id', id);
        
      if (error) throw error;
      
      // Transform the nested structure to a flat array of hymns with authors
      return data.map((item: any) => {
        const hymn = item.hymns;
        return {
          ...hymn,
          authors: hymn.hymn_authors?.map((ha: any) => ha.authors) || []
        };
      });
    },
    enabled: !!id
  });

  // Filter hymns based on search
  const filteredHymns = hymns?.filter(hymn => 
    !searchQuery || 
    hymn.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hymn.authors?.some(author => 
      author.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const isLoading = categoryLoading || hymnsLoading;
  const error = categoryError || hymnsError;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>{(error as Error).message || 'Failed to load category'}</p>
        <Link to="/categories" className="inline-block mt-4 text-indigo-600 hover:text-indigo-500">
          ← Back to Categories
        </Link>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="max-w-4xl mx-auto bg-yellow-50 border border-yellow-200 text-yellow-800 px-6 py-4 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Category Not Found</h2>
        <p>The category you're looking for doesn't exist or has been removed.</p>
        <Link to="/categories" className="inline-block mt-4 text-indigo-600 hover:text-indigo-500">
          ← Back to Categories
        </Link>
      </div>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back link */}
        <Link 
          to="/categories" 
          className="flex items-center text-indigo-600 hover:text-indigo-800"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          <span>All Categories</span>
        </Link>

        {/* Category header */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-start space-x-4">
            <div className="bg-indigo-100 p-3 rounded-full flex-shrink-0">
              <BookOpen className="h-8 w-8 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
              
              {category.description && (
                <p className="mt-2 text-gray-600">{category.description}</p>
              )}
              
              <div className="mt-4 bg-indigo-50 py-1 px-3 inline-block rounded-full">
                <span className="text-indigo-700 text-sm font-medium">
                  {filteredHymns?.length || 0} {(filteredHymns?.length || 0) === 1 ? 'hymn' : 'hymns'} in this category
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Hymns search */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search hymns in this category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        {/* Hymns list */}
        {filteredHymns && filteredHymns.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {filteredHymns.map((hymn) => (
                <li key={hymn.id}>
                  <Link 
                    to={`/songs/${hymn.id}`} 
                    className="block hover:bg-gray-50"
                  >
                    <div className="px-6 py-4">
                      <div className="flex items-center">
                        <Music className="h-5 w-5 text-indigo-600 mr-3" />
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{hymn.title}</h3>
                          
                          {hymn.authors && hymn.authors.length > 0 && (
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <User className="h-4 w-4 text-gray-400 mr-1" />
                              <span>{hymn.authors.map(author => author.name).join(', ')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-gray-900">No hymns found</h2>
            <p className="text-gray-500 mt-2">
              {searchQuery ? 
                'No hymns match your search criteria.' : 
                'This category doesn\'t have any hymns yet.'}
            </p>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default CategoryDetail;
