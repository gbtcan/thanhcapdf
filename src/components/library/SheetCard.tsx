import { Link } from 'react-router-dom';
import { FileText, Download, Star, User, Tag } from 'lucide-react';

interface SheetCardProps {
  sheet: {
    id: string;
    title: string;
    authors: any[];
    categories: any[];
    pdfUrl: string | null;
    created_at: string;
  };
}

const SheetCard: React.FC<SheetCardProps> = ({ sheet }) => {
  return (
    <Link 
      to={`/sheets/${sheet.id}`}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      <div className="bg-gray-100 p-4 flex items-center justify-center h-40">
        <FileText className="h-20 w-20 text-indigo-200" />
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-lg text-gray-900 line-clamp-1">{sheet.title}</h3>
        
        {sheet.authors && sheet.authors.length > 0 && (
          <div className="flex items-center mt-2 text-sm text-gray-600">
            <User className="h-4 w-4 mr-1 text-gray-400" />
            <span className="line-clamp-1">{sheet.authors.map(author => author.name).join(', ')}</span>
          </div>
        )}
        
        {sheet.categories && sheet.categories.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {sheet.categories.map(category => (
              <span 
                key={category.id}
                className="inline-flex items-center bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full text-xs"
              >
                <Tag className="h-3 w-3 mr-1" />
                {category.name}
              </span>
            ))}
          </div>
        )}
        
        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
          <div>
            {new Date(sheet.created_at).toLocaleDateString()}
          </div>
          <div className="flex items-center space-x-2">
            <span className="flex items-center">
              <Star className="h-3 w-3 mr-1 text-yellow-400" />
              4.5
            </span>
            <span className="flex items-center">
              <Download className="h-3 w-3 mr-1" />
              42
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default SheetCard;
