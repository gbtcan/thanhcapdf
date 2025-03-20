import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Music, Book } from 'lucide-react';

const HeroSection: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-indigo-700 to-purple-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Catholic Hymns Library
            </h1>
            <p className="text-xl text-indigo-100 mb-8">
              Discover, learn, and share Catholic hymns and songs. 
              Access sheet music, lyrics, and recordings in one place.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link
                to="/hymns"
                className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50"
              >
                <Music className="h-5 w-5 mr-2" />
                Browse Hymns
              </Link>
              <Link
                to="/search"
                className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 bg-opacity-30 hover:bg-opacity-40"
              >
                <Search className="h-5 w-5 mr-2" />
                Search Collection
              </Link>
            </div>
          </div>
          
          <div className="hidden md:flex justify-center">
            <div className="relative">
              {/* Decorative elements that represent sheet music */}
              <div className="absolute -top-6 -left-6 w-28 h-36 bg-white rounded-lg shadow-lg transform rotate-12 z-10">
                <div className="h-full flex flex-col justify-center items-center text-indigo-700">
                  <Music className="h-8 w-8 mb-2" />
                  <div className="h-px w-16 bg-indigo-200 mb-1"></div>
                  <div className="h-px w-16 bg-indigo-200 mb-1"></div>
                  <div className="h-px w-16 bg-indigo-200 mb-1"></div>
                  <div className="h-px w-16 bg-indigo-200"></div>
                </div>
              </div>
              <div className="w-64 h-80 bg-white rounded-lg shadow-xl flex flex-col justify-center items-center p-6 text-indigo-700">
                <Book className="h-12 w-12 mb-4" />
                <h3 className="text-lg font-semibold text-center mb-2">Catholic Hymnal</h3>
                <div className="space-y-2 w-full">
                  <div className="h-2 bg-indigo-100 rounded w-full"></div>
                  <div className="h-2 bg-indigo-100 rounded w-5/6 mx-auto"></div>
                  <div className="h-2 bg-indigo-100 rounded w-full"></div>
                  <div className="h-2 bg-indigo-100 rounded w-4/6 mx-auto"></div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-28 h-36 bg-white rounded-lg shadow-lg transform -rotate-6 z-10">
                <div className="h-full flex flex-col justify-center items-center text-indigo-700">
                  <Music className="h-8 w-8 mb-2" />
                  <div className="h-px w-16 bg-indigo-200 mb-1"></div>
                  <div className="h-px w-16 bg-indigo-200 mb-1"></div>
                  <div className="h-px w-16 bg-indigo-200 mb-1"></div>
                  <div className="h-px w-16 bg-indigo-200"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Wave divider */}
      <div className="w-full overflow-hidden leading-none">
        <svg className="w-full h-12 md:h-16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#ffffff"></path>
        </svg>
      </div>
    </div>
  );
};

export default HeroSection;
