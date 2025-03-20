import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Edit, Music, BookOpen, Users } from 'lucide-react';

const Editor = () => {
  const location = useLocation();
  const isRootEditorPath = location.pathname === '/editor' || location.pathname === '/editor/';
  
  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4">
        <Edit className="h-8 w-8 text-indigo-600" />
        <h1 className="text-3xl font-bold text-gray-900">Content Editor</h1>
      </div>

      {isRootEditorPath && (
        <div className="grid md:grid-cols-3 gap-6">
          <Link
            to="/editor/hymns"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Music className="h-6 w-6 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900">Edit Hymns</h2>
            </div>
            <p className="text-gray-600">Create, update and manage hymns</p>
          </Link>

          <Link
            to="/editor/authors"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Users className="h-6 w-6 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900">Manage Authors</h2>
            </div>
            <p className="text-gray-600">Add and edit authors</p>
          </Link>

          <Link
            to="/editor/categories"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-3 mb-4">
              <BookOpen className="h-6 w-6 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900">Manage Categories</h2>
            </div>
            <p className="text-gray-600">Create and edit hymn categories</p>
          </Link>
        </div>
      )}

      <div className={isRootEditorPath ? "" : "bg-white rounded-lg shadow-md p-6"}>
        <Routes>
          <Route path="hymns" element={<div>Hymn Editor Component</div>} />
          <Route path="authors" element={<div>Author Management Component</div>} />
          <Route path="categories" element={<div>Category Management Component</div>} />
        </Routes>
      </div>
    </div>
  );
};

export default Editor;
