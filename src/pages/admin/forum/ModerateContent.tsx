import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Trash2, AlertTriangle, Shield, Check, 
  X, Eye, Filter, AlertCircle, MessageSquare
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import LoadingIndicator from '../../../components/LoadingIndicator';
import AlertBanner from '../../../components/AlertBanner';
import { formatRelativeTime } from '../../../utils/dateUtils';

const REASONS = [
  'Inappropriate content',
  'Off-topic',
  'Spam',
  'Harassment',
  'Misinformation',
  'Copyright violation',
  'Other'
];

interface FlaggedContent {
  id: string;
  content_type: 'post' | 'comment';
  content_id: string;
  reason: string;
  details: string;
  user_id: string;
  created_at: string;
  reporter: {
    name: string;
  };
  post?: {
    title: string;
    content: string;
    user: {
      name: string;
    }
  };
  comment?: {
    content: string;
    user: {
      name: string;
    }
  }
}

const ModerateContent: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedFlag, setSelectedFlag] = useState<FlaggedContent | null>(null);
  const [action, setAction] = useState<'approve' | 'delete' | null>(null);
  const [moderatorNote, setModeratorNote] = useState('');
  
  // Fetch flagged content
  const { 
    data: flaggedContent, 
    isLoading,
    error
  } = useQuery<FlaggedContent[]>({
    queryKey: ['flagged-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_flags')
        .select(`
          *,
          reporter:users!reporter_id(name),
          post:posts(*,user:users(*)),
          comment:comments(*,user:users(*))
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    }
  });
  
  // Resolve flag mutation
  const resolveMutation = useMutation({
    mutationFn: async ({
      flagId,
      action,
      note
    }: {
      flagId: string;
      action: 'approve' | 'delete';
      note: string;
    }) => {
      // First update flag status
      const { error: flagError } = await supabase
        .from('content_flags')
        .update({
          status: action === 'approve' ? 'approved' : 'removed',
          moderator_note: note,
          resolved_at: new Date().toISOString()
        })
        .eq('id', flagId);
        
      if (flagError) throw flagError;
      
      // If action is delete, remove the content
      if (action === 'delete' && selectedFlag) {
        const table = selectedFlag.content_type === 'post' ? 'posts' : 'comments';
        const { error: deleteError } = await supabase
          .from(table)
          .delete()
          .eq('id', selectedFlag.content_id);
          
        if (deleteError) throw deleteError;
      }
      
      return { flagId, action };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flagged-content'] });
      setSelectedFlag(null);
      setAction(null);
      setModeratorNote('');
    }
  });
  
  const handleResolve = () => {
    if (!selectedFlag || !action) return;
    
    resolveMutation.mutate({
      flagId: selectedFlag.id,
      action,
      note: moderatorNote
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Content Moderation</h1>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Flagged content list */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-red-50 px-4 py-3 border-b border-red-100">
              <h2 className="font-medium text-red-800 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                Reported Content ({flaggedContent?.length || 0})
              </h2>
            </div>
            
            {isLoading ? (
              <div className="py-12 flex justify-center">
                <LoadingIndicator size="large" message="Loading reports..." />
              </div>
            ) : error ? (
              <div className="p-4">
                <AlertBanner
                  type="error"
                  title="Failed to load content reports"
                  message="Please try refreshing the page"
                />
              </div>
            ) : !flaggedContent?.length ? (
              <div className="p-8 text-center">
                <Shield className="h-12 w-12 mx-auto text-green-500 mb-3" />
                <p className="text-gray-600 font-medium">No content has been flagged</p>
                <p className="text-gray-500 text-sm mt-1">Everything is looking good!</p>
              </div>
            ) : (
              <ul className="max-h-[600px] overflow-y-auto">
                {flaggedContent.map(item => (
                  <li 
                    key={item.id}
                    className={`border-b border-gray-200 last:border-0 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedFlag?.id === item.id ? 'bg-indigo-50' : ''
                    }`}
                    onClick={() => setSelectedFlag(item)}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            item.content_type === 'post'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {item.content_type === 'post' ? 'Post' : 'Comment'}
                          </span>
                          <span className="ml-2 text-xs text-gray-500">
                            {formatRelativeTime(new Date(item.created_at))}
                          </span>
                        </div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          {item.reason}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-800 line-clamp-2">
                        {item.content_type === 'post' 
                          ? item.post?.title 
                          : item.comment?.content}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Reported by: {item.reporter?.name || 'Unknown'}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        {/* Content preview and moderation */}
        <div className="xl:col-span-2">
          {selectedFlag ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="font-medium text-gray-900">
                  {selectedFlag.content_type === 'post' 
                    ? 'Review Reported Post' 
                    : 'Review Reported Comment'}
                </h3>
              </div>
              
              <div className="p-6">
                {/* Content info */}
                <div className="mb-6 space-y-4">
                  {selectedFlag.content_type === 'post' && selectedFlag.post && (
                    <>
                      <div>
                        <h3 className="text-xl font-medium text-gray-900">{selectedFlag.post.title}</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          by {selectedFlag.post.user?.name || 'Unknown user'}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <p className="text-gray-800 whitespace-pre-line">{selectedFlag.post.content}</p>
                      </div>
                    </>
                  )}
                  
                  {selectedFlag.content_type === 'comment' && selectedFlag.comment && (
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="mb-2 text-sm font-medium text-gray-700">
                        Comment by {selectedFlag.comment.user?.name || 'Unknown user'}:
                      </p>
                      <p className="text-gray-800 whitespace-pre-line">{selectedFlag.comment.content}</p>
                    </div>
                  )}
                </div>
                
                {/* Report details */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Report Details</h4>
                  <div className="bg-red-50 p-4 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-red-800">Reason: {selectedFlag.reason}</span>
                      <span className="text-sm text-gray-500">
                        {formatRelativeTime(new Date(selectedFlag.created_at))}
                      </span>
                    </div>
                    {selectedFlag.details && (
                      <p className="text-red-700">{selectedFlag.details}</p>
                    )}
                    <p className="mt-2 text-sm text-gray-600">
                      Reported by: {selectedFlag.reporter?.name || 'Unknown'}
                    </p>
                  </div>
                </div>
                
                {/* Moderation actions */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Moderation Action</h4>
                  <div className="flex space-x-4 mb-4">
                    <button
                      onClick={() => setAction('approve')}
                      className={`flex-1 py-2 px-4 rounded-md flex items-center justify-center ${
                        action === 'approve'
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve Content
                    </button>
                    <button
                      onClick={() => setAction('delete')}
                      className={`flex-1 py-2 px-4 rounded-md flex items-center justify-center ${
                        action === 'delete'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove Content
                    </button>
                  </div>
                  
                  <div>
                    <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
                      Moderator Note (Optional)
                    </label>
                    <textarea
                      id="note"
                      value={moderatorNote}
                      onChange={(e) => setModeratorNote(e.target.value)}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      rows={3}
                    />
                  </div>
                </div>
                
                {/* Submit */}
                <div className="flex justify-end">
                  <button
                    onClick={() => setSelectedFlag(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-3"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResolve}
                    disabled={!action || resolveMutation.isPending}
                    className={`px-4 py-2 rounded-md text-white ${
                      action === 'delete'
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-green-600 hover:bg-green-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {resolveMutation.isPending ? (
                      <LoadingIndicator size="small" color="white" className="mr-2" />
                    ) : action === 'delete' ? (
                      'Confirm Removal'
                    ) : (
                      'Confirm Approval'
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center h-full flex flex-col items-center justify-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Select content to review</h3>
              <p className="text-gray-500">
                Click on a reported item from the list to review and take action
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModerateContent;
