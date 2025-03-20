import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import PageLayout from '../components/PageLayout';
import AlertBanner from '../components/AlertBanner';
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const initialFormData: ContactFormData = {
  name: '',
  email: '',
  subject: '',
  message: ''
};

const Contact: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<ContactFormData>(() => ({
    ...initialFormData,
    name: user?.display_name || '',
    email: user?.email || ''
  }));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Validate form
      if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
        throw new Error('Please fill out all required fields');
      }
      
      // Email validation regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }
      
      // Submit to contact_messages table in Supabase
      const { error: submitError } = await supabase
        .from('contact_messages')
        .insert({
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim() || 'General Inquiry',
          message: formData.message.trim(),
          user_id: user?.id || null
        });
      
      if (submitError) throw new Error(submitError.message);
      
      // Success case
      setSuccess(true);
      setFormData(initialFormData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      console.error('Contact form error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <PageLayout title="Contact Us" description="Get in touch with the Catholic Hymns team">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Contact information */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Get in Touch</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Have questions, suggestions, or want to report an issue? Reach out to our team and we'll get back to you as soon as possible.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Mail className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="ml-3 text-gray-700 dark:text-gray-300">
                  <p className="font-medium">Email</p>
                  <p>support@catholichymns.org</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Phone className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="ml-3 text-gray-700 dark:text-gray-300">
                  <p className="font-medium">Phone</p>
                  <p>(555) 123-4567</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <MapPin className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="ml-3 text-gray-700 dark:text-gray-300">
                  <p className="font-medium">Address</p>
                  <p>123 Liturgical Lane</p>
                  <p>Vatican City, 00120</p>
                </div>
              </div>
            </div>
            
            <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">About Catholic Hymns</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Catholic Hymns is a community platform dedicated to preserving and sharing the rich musical heritage of the Catholic Church. Our mission is to provide access to traditional and contemporary liturgical music for worship communities around the world.
              </p>
            </div>
          </div>
          
          {/* Contact form */}
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            {success ? (
              <div className="text-center py-12">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
                  <CheckIcon className="h-6 w-6 text-green-600 dark:text-green-300" />
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900 dark:text-white">Message Sent!</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Thank you for contacting us. We'll get back to you as soon as possible.
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setSuccess(false);
                      setFormData(initialFormData);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Contact Form</h2>
                
                {error && (
                  <AlertBanner
                    type="error"
                    message={error}
                    className="mb-6"
                    dismissible
                    onDismiss={() => setError(null)}
                  />
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  
                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  
                  {/* Subject */}
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Hymn Request">Hymn Request</option>
                      <option value="Report Issue">Report Issue</option>
                      <option value="Feature Suggestion">Feature Suggestion</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  
                  {/* Submit */}
                  <div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="animate-spin h-4 w-4 mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

// Helper component for the success message
const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

export default Contact;
