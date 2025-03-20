import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';
import PageLayout from '../components/PageLayout';

const NotFound: React.FC = () => {
  return (
    <PageLayout title="Page Not Found" description="The requested page could not be found.">
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 text-center">
          <div>
            <h1 className="text-9xl font-extrabold text-indigo-600">404</h1>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Page not found
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Sorry, we couldn't find the page you're looking for.
            </p>
          </div>
          
          <div className="mt-8 space-y-4">
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center">
              <Link 
                to="/"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Home className="h-5 w-5 mr-2" />
                Go to Home
              </Link>
              
              <Link
                to="/hymns/search"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                <Search className="h-5 w-5 mr-2" />
                Search Hymns
              </Link>
            </div>
            
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-700 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Go back to previous page
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default NotFound;
