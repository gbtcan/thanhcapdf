import React from 'react';
import { Link } from 'react-router-dom';
import { Author } from '../types';

interface AuthorsListProps {
  authors: Author[];
  linkAuthors?: boolean;
  className?: string;
}

const AuthorsList: React.FC<AuthorsListProps> = ({
  authors,
  linkAuthors = true,
  className = ''
}) => {
  if (!authors || authors.length === 0) {
    return <span className={className}>Unknown author</span>;
  }

  return (
    <span className={className}>
      {authors.map((author, index) => {
        // Display author's name with birth and death years if available
        let authorText = author.name;
        
        if (author.birth_year || author.death_year) {
          authorText += ' (';
          
          if (author.birth_year) {
            authorText += author.birth_year;
          }
          
          authorText += '-';
          
          if (author.death_year) {
            authorText += author.death_year;
          }
          
          authorText += ')';
        }
        
        // Add comma between authors except for the last one
        const separator = index < authors.length - 1 ? ', ' : '';
        
        return (
          <React.Fragment key={author.id}>
            {linkAuthors ? (
              <Link 
                to={`/authors/${author.id}`}
                className="hover:underline text-indigo-600 dark:text-indigo-400"
              >
                {authorText}
              </Link>
            ) : (
              <span>{authorText}</span>
            )}
            {separator}
          </React.Fragment>
        );
      })}
    </span>
  );
};

export default AuthorsList;
