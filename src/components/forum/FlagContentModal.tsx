import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Flag, X, AlertTriangle, Loader2, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface FlagContentModalProps {
  contentType: 'post' | 'comment';
  contentId: string;
  onClose: () => void;
}

const REASONS = [
  'Inappropriate content',
  'Off-topic',
  'Spam',
  'Harassment',
  'Misinformation',
  'Copyright violation',
  'Other'
];

const FlagContentModal: React.FC<FlagContentModalProps> = ({ 
  contentType, 
  contentId, 
  onClose 
}) => {
  const { user, isAuthenticated } = useAuth();
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const flagMutation = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated || !user) {
        throw new Error('You must be logged in to report content');
      }
      
      const { error } = await supabase
        .from('content_flags')
        .insert({
          content_type: contentType,
          content_id: contentId,
          reporter_id: user.id,
          reason,
          details,
          status: 'pending'
        });
        
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      setError(null);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    },
    onError: (err: Error) => {
      setError(err.message);
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    flagMutation.mutate();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-900 flex items-center">
            <Flag className="h-5 w-5 text-red-500 mr-2" />
            Report {contentType === 'post' ? 'Post' : 'Comment'}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {success ? (
          <div className="p-6">
            <div className="flex items-center justify-center text-green-500 mb-4">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-6 w-6" />
              </div>
            </div>
            <h4 className="text-center font-medium text-gray-900 mb-1">Report Submitted</h4>
            <p className="text-center text-gray-500">Thank you for helping keep our community safe.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 text-red-700">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    <p>{error}</p>
                  </div>
                </div>
              )}
              
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for reporting
                </label>
                <select
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  {REASONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-1">
                  Additional details (optional)
                </label>
                <textarea
                  id="details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={4}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Please provide any additional information that will help moderators understand the issue."
                ></textarea>
              </div>
              
              <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                  <p className="text-sm text-amber-700">
                    Reports are reviewed by moderators. Malicious or repeated false reports may result in account restrictions.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-4 py-3 flex justify-end border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                disabled={flagMutation.isPending}
              >
                {flagMutation.isPending ? (
                  <span className="flex items-center">
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Submitting...
                  </span>
                ) : (
                  'Submit Report'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default FlagContentModal;
