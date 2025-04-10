import React from 'react';
import { Link } from 'react-router-dom';

interface Author {
  id: string;
  name: string;
}

interface AuthorNamesProps {
  authors: Author[];
}

const AuthorNames: React.FC<AuthorNamesProps> = ({ authors }) => {
  if (!authors || authors.length === 0) return null;
  
  return (
    <div className="text-gray-600 dark:text-gray-400 flex items-center text-sm">
      <span className="mr-1">Tác giả:</span>
      <ul className="inline-flex flex-wrap">
        {authors.map((author, index) => (
          <li key={author.id} className="inline">
            <Link 
              to={`/authors/${author.id}`}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {author.name}
            </Link>
            {index < authors.length - 1 ? ', ' : ''}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AuthorNames;
