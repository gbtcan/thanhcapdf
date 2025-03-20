import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Search, FileText, Music, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { fetchHymns } from '../lib/hymnService';
import HymnList from '../components/hymns/HymnList';
import LoadingIndicator from '../components/LoadingIndicator';

const HomePage: React.FC = () => {
  // Fetch latest hymns
  const { data: latestHymns, isLoading: loadingHymns } = useQuery({
    queryKey: ['latest-hymns'],
    queryFn: () => fetchHymns({ 
      sortBy: 'newest',
      limit: 6
    }),
    staleTime: 60000 // 1 minute
  });

  // Fetch popular hymns
  const { data: popularHymns, isLoading: loadingPopular } = useQuery({
    queryKey: ['popular-hymns'],
    queryFn: () => fetchHymns({ 
      sortBy: 'popular',
      limit: 6
    }),
    staleTime: 60000 // 1 minute
  });
  
  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['home-stats'],
    queryFn: async () => {
      const [
        { count: hymnCount },
        { count: authorCount },
        { count: fileCount },
      ] = await Promise.all([
        supabase.from('hymns_new').select('*', { count: 'exact', head: true }),
        supabase.from('authors').select('*', { count: 'exact', head: true }),
        supabase.from('hymn_pdf_files').select('*', { count: 'exact', head: true }),
      ]);
      
      return {
        hymnCount: hymnCount || 0,
        authorCount: authorCount || 0,
        fileCount: fileCount || 0
      };
    },
    staleTime: 300000 // 5 minutes
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero section */}
      <div className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 text-center bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl shadow-xl my-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 max-w-4xl mx-auto">
          Access Catholic Hymns and Sheet Music
        </h1>
        <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
          Find lyrics, sheet music, audio recordings, and more for thousands of traditional and contemporary Catholic hymns
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <Link 
            to="/hymns" 
            className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-medium text-lg hover:bg-indigo-50 transition-colors shadow-md"
          >
            Browse Hymns
          </Link>
          <Link 
            to="/about" 
            className="bg-transparent text-white border-2 border-white px-6 py-3 rounded-lg font-medium text-lg hover:bg-white/10 transition-colors"
          >
            Learn More
          </Link>
        </div>
      </div>
      
      {/* Stats section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 p-4 rounded-full">
            <Music className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="ml-5">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.hymnCount.toLocaleString() || '0'}</p>
            <p className="text-gray-500 dark:text-gray-400">Hymns Available</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center">
          <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-full">
            <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="ml-5">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.authorCount.toLocaleString() || '0'}</p>
            <p className="text-gray-500 dark:text-gray-400">Composers & Authors</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full">
            <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="ml-5">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.fileCount.toLocaleString() || '0'}</p>
            <p className="text-gray-500 dark:text-gray-400">Sheet Music Files</p>
          </div>
        </div>
      </div>
      
      {/* Search box */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 my-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Find a Hymn
        </h2>
        <div className="flex">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by title, lyrics, or author..."
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <Link
            to="/hymns"
            className="bg-indigo-600 text-white px-6 py-3 rounded-r-md font-medium hover:bg-indigo-700 transition-colors"
          >
            Search
          </Link>
        </div>
      </div>
      
      {/* Latest hymns section */}
      <div className="my-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Latest Additions
          </h2>
          <Link to="/hymns?sortBy=newest" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center">
            View all <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        
        {loadingHymns ? (
          <LoadingIndicator size="large" message="Loading latest hymns..." />
        ) : (
          <HymnList 
            hymns={latestHymns?.hymns || []}
            emptyMessage="No hymns available yet"
          />
        )}
      </div>
      
      {/* Popular hymns section */}
      <div className="my-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Most Popular Hymns
          </h2>
          <Link to="/hymns?sortBy=popular" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center">
            View all <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        
        {loadingPopular ? (
          <LoadingIndicator size="large" message="Loading popular hymns..." />
        ) : (
          <HymnList 
            hymns={popularHymns?.hymns || []}
            emptyMessage="No popular hymns available yet"
          />
        )}
      </div>
      
      {/* Features section */}
      <div className="my-16 py-8 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-12">
          Everything You Need for Church Music
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Sheet Music</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Download and view PDF sheet music for all your liturgical needs, with full scores and individual parts.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <div className="bg-purple-100 dark:bg-purple-900/30 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Music className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Audio Recordings</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Listen to recordings of hymns to help learn new music or practice with your choir and music ministers.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <div className="bg-blue-100 dark:bg-blue-900/30 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Community</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Connect with other music ministers, share tips, and discuss liturgical music in our growing community.
            </p>
          </div>
        </div>
      </div>
      
      {/* CTA section */}
      <div className="my-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Ready to enhance your liturgical music?
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          Start exploring our extensive collection of Catholic hymns and resources today.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            to="/hymns" 
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium text-lg hover:bg-indigo-700 transition-colors"
          >
            Browse Library
          </Link>
          <Link 
            to="/register" 
            className="px-8 py-3 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border border-indigo-600 dark:border-indigo-400 rounded-lg font-medium text-lg hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;