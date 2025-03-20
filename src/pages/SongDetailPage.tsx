import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Music, User, Tag, ArrowLeft, FileText, Loader2, AlertCircle, BookOpen, MessageSquare, ExternalLink } from 'lucide-react';
import DOMPurify from 'dompurify';
import { supabase } from '../lib/supabase';
import PageLayout from '../components/PageLayout';
import { fetchPosts } from '../lib/forumService';

interface Song {
  id: string;
  title: string;
  lyrics: string;
  created_at: string;
  authors: Author[];
  categories: Category[];
}

interface Author {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

interface RelatedSong {
  id: string;
  title: string;
}

const SongDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  
  // Fetch song details
  const { 
    data: song,
    isLoading: songLoading,
    isError: songError,
    error: songErrorData
  } = useQuery({
    queryKey: ['song-details', id],
    queryFn: async () => {
      if (!id) throw new Error('Song ID is required');
      
      try {
        console.log('Fetching hymn details for ID:', id);
        
        // Fetch the hymn with related data
        const { data, error } = await supabase
          .from('hymns')
          .select(`
            *,
            hymn_authors!inner(
              author_id,
              authors(*)
            ),
            hymn_categories!inner(
              category_id,
              categories(*)
            ),
            pdf_files(*)
          `)
          .eq('id', id)
          .single();
        
        if (error) {
          console.error('Error fetching hymn:', error);
          throw error;
        }
        
        if (!data) {
          console.error('No hymn found with ID:', id);
          throw new Error('Song not found');
        }
        
        console.log('Hymn data received:', data);
        
        // Transform data structure for easier access
        const transformedData = {
          ...data,
          authors: data.hymn_authors?.map((ha: any) => ha.authors) || [],
          categories: data.hymn_categories?.map((hc: any) => hc.categories) || [],
          pdfUrl: data.pdf_files?.[0]?.file_url || null
        };
        
        return transformedData as Song;
      } catch (error) {
        console.error('Exception in fetching song details:', error);
        throw error;
      }
    },
    retry: 1
  });
  
  // Fetch related songs once we have the main song data
  const { 
    data: relatedSongs,
    isLoading: relatedLoading
  } = useQuery<RelatedSong[]>({
    queryKey: ['related-songs', id, song?.authors, song?.categories],
    queryFn: async () => {
      if (!song) return [];
      
      try {
        // Get author IDs and category IDs
        const authorIds = song.authors.map(author => author.id);
        const categoryIds = song.categories.map(category => category.id);
        
        if (authorIds.length === 0 && categoryIds.length === 0) {
          return [];
        }
        
        // Instead of a complex in() query with hundreds of IDs, use a simpler approach
        // Just get a few random songs from the same categories or by the same authors
        
        let query;
        
        // If we have categories, try those first
        if (categoryIds.length > 0) {
          // Get hymns with the first category (limit query complexity)
          const { data: byCategory } = await supabase
            .from('hymn_categories')
            .select('hymn_id')
            .eq('category_id', categoryIds[0])
            .limit(15); // Fetch a reasonable number
            
          if (byCategory && byCategory.length > 0) {
            const hymnIds = byCategory.map(item => item.hymn_id);
            query = supabase
              .from('hymns')
              .select('id, title')
              .in('id', hymnIds)
              .neq('id', id) // Exclude current song
              .limit(10);
          }
        }
        
        // If no results from categories or no categories, try by author
        if (!query && authorIds.length > 0) {
          const { data: byAuthor } = await supabase
            .from('hymn_authors')
            .select('hymn_id')
            .eq('author_id', authorIds[0])
            .limit(15);
            
          if (byAuthor && byAuthor.length > 0) {
            const hymnIds = byAuthor.map(item => item.hymn_id);
            query = supabase
              .from('hymns')
              .select('id, title')
              .in('id', hymnIds)
              .neq('id', id) // Exclude current song
              .limit(10);
          }
        }
        
        // If we have a query, execute it
        if (query) {
          const { data, error } = await query;
          if (error) throw error;
          return data as RelatedSong[];
        }
        
        // Fallback: just get some random hymns
        const { data: randomSongs, error: randomError } = await supabase
          .from('hymns')
          .select('id, title')
          .neq('id', id)
          .limit(10)
          .order('created_at', { ascending: false });
          
        if (randomError) throw randomError;
        return randomSongs as RelatedSong[];
      } catch (error) {
        console.error('Error fetching related songs:', error);
        return []; // Return empty array on error instead of throwing
      }
    },
    enabled: !!song
  });

  // Fetch related forum discussions
  const { data: hymnDiscussions } = useQuery({
    queryKey: ['hymn-discussions', id],
    queryFn: () => fetchPosts({ hymnId: id, limit: 5 }),
    enabled: !!id
  });
  
  // Format lyrics with proper line breaks
  const formatLyrics = (lyrics: string) => {
    if (!lyrics) return 'No lyrics available';
    
    // Sanitize the lyrics first
    const sanitized = DOMPurify.sanitize(lyrics);
    
    // Replace newlines with line breaks
    return sanitized.split('\n').map((line, index) => (
      <p key={index} className={line.trim() === '' ? 'h-6' : ''}>
        {line || '\u00A0'} {/* Use non-breaking space if line is empty */}
      </p>
    ));
  };
  
  // Handle loading state
  if (songLoading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mb-4" />
            <p className="text-gray-600">Loading song details...</p>
          </div>
        </div>
      </PageLayout>
    );
  }
  
  // Handle error state
  if (songError) {
    return (
      <PageLayout>
        <div className="max-w-3xl mx-auto bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start">
            <AlertCircle className="h-6 w-6 text-red-500 mr-3 flex-shrink-0" />
            <div>
              <h2 className="text-lg font-medium text-red-800">
                {songErrorData instanceof Error && songErrorData.message === 'Song not found'
                  ? 'Song does not exist'
                  : 'Unable to load song. Please try again later.'}
              </h2>
              <div className="mt-4">
                <Link 
                  to="/songs" 
                  className="text-indigo-600 hover:text-indigo-800 flex items-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to songs list
                </Link>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }
  
  if (!song) {
    return (
      <PageLayout>
        <div className="max-w-3xl mx-auto bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-lg font-medium text-yellow-800">Song not found</h2>
          <p className="mt-2 text-yellow-700">
            The song you are looking for does not exist or has been removed.
          </p>
          <div className="mt-4">
            <Link 
              to="/songs" 
              className="text-indigo-600 hover:text-indigo-800 flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to songs list
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back navigation */}
        <div>
          <Link 
            to="/songs" 
            className="flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            <span>Back to all songs</span>
          </Link>
        </div>
        
        {/* Song details */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header section */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-indigo-100 p-3 rounded-full">
                <Music className="h-6 w-6 text-indigo-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{song.title}</h1>
            </div>
            
            <div className="flex flex-wrap gap-4">
              {/* Authors */}
              {song.authors && song.authors.length > 0 && (
                <div className="flex items-center text-gray-600">
                  <User className="h-5 w-5 mr-2 text-gray-400" />
                  <span>
                    <span className="text-gray-500">Author:</span>{' '}
                    {song.authors.map(author => author.name).join(', ')}
                  </span>
                </div>
              )}
              
              {/* Categories */}
              {song.categories && song.categories.length > 0 && (
                <div className="flex items-center text-gray-600">
                  <Tag className="h-5 w-5 mr-2 text-gray-400" />
                  <span>
                    <span className="text-gray-500">Genre:</span>{' '}
                    {/* Fix: Map through each category and access name on each individual item */}
                    {song.categories.map((category, index) => (
                      <span key={category.id}>
                        {index > 0 && ', '}
                        {category.name}
                      </span>
                    ))}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Lyrics section */}
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Lyrics</h2>
            <div className="bg-gray-50 rounded-lg p-6 whitespace-pre-line text-gray-800">
              {formatLyrics(song.lyrics)}
            </div>
          </div>
        </div>
        
        {/* Related songs */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <BookOpen className="h-5 w-5 text-indigo-600 mr-2" />
            Related Songs
          </h2>
          
          {relatedLoading ? (
            <div className="flex justify-center items-center h-20">
              <Loader2 className="h-6 w-6 text-indigo-600 animate-spin" />
            </div>
          ) : relatedSongs && relatedSongs.length > 0 ? (
            <ul className="space-y-2 divide-y divide-gray-100">
              {relatedSongs.map(relatedSong => (
                <li key={relatedSong.id} className="pt-2">
                  <Link
                    to={`/songs/${relatedSong.id}`}
                    className="flex items-center hover:bg-gray-50 p-2 rounded-md"
                  >
                    <Music className="h-4 w-4 text-indigo-600 mr-2" />
                    <span className="text-gray-800 hover:text-indigo-600">
                      {relatedSong.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No related songs found</p>
          )}
        </div>

        {/* Forum link */}
        <Link 
          to={`/forum?hymn=${id}`} 
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Discuss This Hymn
        </Link>

        {/* Related discussions */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Related Discussions</h2>
          
          {hymnDiscussions?.posts && hymnDiscussions.posts.length > 0 ? (
            <div className="space-y-2">
              {hymnDiscussions.posts.map(post => (
                <Link 
                  key={post.id}
                  to={`/forum/post/${post.id}`}
                  className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50"
                >
                  <span className="font-medium text-gray-900">{post.title}</span>
                  <ExternalLink className="h-4 w-4 text-gray-500" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center bg-gray-50 py-6 rounded-lg border border-gray-200">
              <p className="text-gray-600 mb-4">No discussions about this hymn yet.</p>
              <Link
                to={`/forum/new?hymn=${id}`}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Start a Discussion
              </Link>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default SongDetailPage;
