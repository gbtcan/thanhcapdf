import React from 'react';
import { Link } from 'react-router-dom';
import { User, Tag, Music, Eye, FileText, Clock } from 'lucide-react';
import { HymnWithDetails } from '../../types/hymns';
import { formatDate } from '../../utils/dateUtils';

interface HymnDashboardProps {
  hymn: HymnWithDetails;
  className?: string;
}

const HymnDashboard: React.FC<HymnDashboardProps> = ({ hymn, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Hymn Information</h2>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{hymn.title}</h3>
          
          {/* View count */}
          <div className="flex items-center text-sm text-gray-500">
            <Eye className="h-4 w-4 mr-1" />
            <span>{hymn.view_count || 0} views</span>
            <span className="mx-2">•</span>
            <Clock className="h-4 w-4 mr-1" />
            <span>Added {formatDate(new Date(hymn.created_at))}</span>
          </div>
        </div>
        
        {/* Authors */}
        {hymn.authors && hymn.authors.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              {hymn.authors.length > 1 ? 'Authors' : 'Author'}
            </h4>
            <div className="flex flex-wrap gap-2">
              {hymn.authors.map(author => (
                <Link
                  key={author.id}
                  to={`/authors/${author.id}`}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800 hover:bg-purple-200"
                >
                  <User className="h-3.5 w-3.5 mr-1" />
                  {author.name}
                </Link>
              ))}
            </div>
          </div>
        )}
        
        {/* Themes */}
        {hymn.themes && hymn.themes.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Themes</h4>
            <div className="flex flex-wrap gap-2">
              {hymn.themes.map(theme => (
                <Link
                  key={theme.id}
                  to={`/hymns?themeId=${theme.id}`}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 hover:bg-green-200"
                >
                  <Music className="h-3.5 w-3.5 mr-1" />
                  {theme.name}
                </Link>
              ))}
            </div>
          </div>
        )}
        
        {/* Tags */}
        {hymn.tags && hymn.tags.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {hymn.tags.map(tag => (
                <Link
                  key={tag.id}
                  to={`/hymns?tagId=${tag.id}`}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 hover:bg-blue-200"
                >
                  <Tag className="h-3.5 w-3.5 mr-1" />
                  {tag.name}
                </Link>
              ))}
            </div>
          </div>
        )}
        
        {/* Available Files */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Available Files ({hymn.pdf_files?.length || 0})
          </h4>
          {hymn.pdf_files && hymn.pdf_files.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {hymn.pdf_files.map(pdf => (
                <div
                  key={pdf.id}
                  className="inline-flex items-center px-3 py-1 rounded-md text-sm bg-gray-100 text-gray-800"
                >
                  <FileText className="h-3.5 w-3.5 mr-1" />
                  {pdf.description || 'Sheet music'}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No PDF files available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HymnDashboard;
