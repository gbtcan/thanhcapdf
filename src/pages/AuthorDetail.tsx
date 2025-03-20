import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { User, ArrowLeft, Music, AlertCircle, BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';
import PageLayout from '../components/PageLayout';
import SongList from '../components/SongList';
import LoadingIndicator from '../components/LoadingIndicator';
import type { Author, HymnWithRelations } from '../types';

const AuthorDetail = () => {
  const { id } = useParams<{ id: string }>();
  const authorId = id ? parseInt(id) : 0;
  
  // Fetch author details
  const { 
    data: author,
    isLoading: authorLoading,
    error: authorError
  } = useQuery<Author>({
    queryKey: ['author-details', authorId],
    queryFn: async () => {
      if (!authorId) throw new Error('Invalid author ID');
      
      const { data, error } = await supabase
        .from('authors')
        .select('*')
        .eq('id', authorId)
        .single();
        
      if (error) throw error;
      if (!data) throw new Error('Author not found');
      
      return data;
    },
    enabled: !!authorId
  });
  
  // Fetch hymns by this author
  const {
    data: hymns,
    isLoading: hymnsLoading,
    error: hymnsError
  } = useQuery<HymnWithRelations[]>({
    queryKey: ['hymns-by-author', authorId],
    queryFn: async () => {
      if (!authorId) return [];
      
      // Get hymn IDs from junction table
      const { data: junctionData, error: junctionError } = await supabase
        .from('hymn_authors')
        .select('hymn_id')
        .eq('author_id', authorId);
        
      if (junctionError) throw junctionError;
      
      if (!junctionData.length) return [];
      
      const hymnIds = junctionData.map(item => item.hymn_id);
      
      // Get hymns with their relations
      const { data, error } = await supabase
        .from('hymns')
        .select(`
          *,
          hymn_authors(authors(*)),
          hymn_categories(categories(*))
        `)
        .in('id', hymnIds)
        .order('title');
        
      if (error) throw error;
      
      return data.map(hymn => ({
        ...hymn,
        authors: hymn.hymn_authors?.map((ha: any) => ha.authors) || [],
        categories: hymn.hymn_categories?.map((hc: any) => hc.categories) || []
      }));
    },
    enabled: !!authorId
  });
  
  if (authorLoading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingIndicator size="large" message="Loading author details..." />
        </div>
      </PageLayout>
    );
  }
  
  if (authorError) {
    return (
      <PageLayout>
        <div className="max-w-3xl mx-auto bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start">
            <AlertCircle className="h-6 w-6 text-red-500 mr-3 flex-shrink-0" />
            <div>
              <h2 className="text-lg font-medium text-red-800">
                Unable to load author details
              </h2>
              <div className="mt-4">
                <Link 
                  to="/authors" 
                  className="text-indigo-600 hover:text-indigo-800 flex items-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to authors list
                </Link>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }
  
  if (!author) {
    return (
      <PageLayout>
        <div className="max-w-3xl mx-auto bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-lg font-medium text-yellow-800">Author not found</h2>
          <p className="mt-2 text-yellow-700">
            The author you are looking for does not exist or has been removed.
          </p>
          <div className="mt-4">
            <Link 
              to="/authors" 
              className="text-indigo-600 hover:text-indigo-800 flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to authors list
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Back navigation */}
        <div>
          <Link 
            to="/authors" 
            className="flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            <span>Back to all authors</span>
          </Link>
        </div>
        
        {/* Author info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-indigo-100 p-3 rounded-full">
              <User className="h-6 w-6 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{author.name}</h1>
          </div>
          
          {author.biography && (
            <div className="prose max-w-none mt-4">
              <p className="text-gray-700">{author.biography}</p>
            </div>
          )}
        </div>
        
        {/* Hymns by this author */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <BookOpen className="h-5 w-5 text-indigo-600 mr-2" />
            Hymns by {author.name}
          </h2>
          
          {hymnsLoading ? (
            <LoadingIndicator />
          ) : hymnsError ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
              <p>Error loading hymns. Please try again later.</p>
            </div>
          ) : hymns && hymns.length > 0 ? (
            <SongList hymns={hymns} />
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Music className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No hymns found</h3>
              <p className="mt-1 text-gray-500">No hymns by this author in our database yet.</p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default AuthorDetail;
