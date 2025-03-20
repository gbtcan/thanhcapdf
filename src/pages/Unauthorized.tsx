import React from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../components/PageLayout';

const Unauthorized: React.FC = () => {
  return (
    <PageLayout>
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-gray-700 mb-6">
          You don't have permission to access this page. If you believe this is an error,
          please contact the administrator.
        </p>
        <Link
          to="/"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Return to Home
        </Link>
      </div>
    </PageLayout>
  );
};

export default Unauthorized;
