import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import LoadingIndicator from '../LoadingIndicator';

interface ReportModalProps {
  contentId: string;
  contentType: 'post' | 'comment';
  onClose: () => void;
}

const REPORT_REASONS = [
  'Inappropriate content',
  'Offensive language',
  'Misinformation',
  'Copyright violation',
  'Off-topic',
  'Spam',
  'Other'
];

const ReportModal: React.FC<ReportModalProps> = ({
  contentId,
  contentType,
  onClose
}) => {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState<string>(REPORT_REASONS[0]);
  const [details, setDetails] = useState<string>('');
  const [success, setSuccess] = useState(false);
  
  // Create report mutation
  const reportMutation = useMutation({
    mutationFn: async ({ 
      contentId, 
      contentType, 
      reason, 
      details 
    }: { 
      contentId: string;
      contentType: string;
      reason: string;
      details: string;
    }) => {
      const { data, error } = await supabase
        .from('content_flags')
        .insert({
          content_id: contentId,
          content_type: contentType,
          reason,
          details: details || null,
          reporter_id: supabase.auth.getUser().then(({ data }) => data.user?.id)
        })
        .select();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setSuccess(true);
      // No need to invalidate queries since reports are managed separately
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    reportMutation.mutate({ contentId, contentType, reason, details });
  };
  
  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
            Report {contentType === 'post' ? 'Discussion' : 'Comment'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {success ? (
          /* Success message */
          <div className="p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Report Submitted</h3>
            <p className="text-gray-500">
              Thank you for helping keep our community safe. A moderator will review your report.
            </p>
          </div>
        ) : (
          /* Report form */
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
              {/* Reason selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Report
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  {REPORT_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Additional details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Details (Optional)
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  rows={4}
                  placeholder="Please provide any additional context or details about this report."
                ></textarea>
              </div>
            </div>
            
            {/* Footer with actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={reportMutation.isPending}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                {reportMutation.isPending ? (
                  <>
                    <LoadingIndicator size="small" color="white" className="mr-2" />
                    Submitting...
                  </>
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

export default ReportModal;
