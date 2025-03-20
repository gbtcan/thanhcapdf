import React from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../components/PageLayout';

const Privacy: React.FC = () => {
  return (
    <PageLayout title="Privacy Policy" description="Privacy policy for the Catholic Hymns application">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Privacy Policy
          </h1>
          
          <div className="prose dark:prose-invert max-w-none">
            <p>
              Your privacy is important to us. This Privacy Policy explains how we collect, use, and disclose information
              about you when you use our Catholic Hymns web application.
            </p>
            
            <h2>1. Information We Collect</h2>
            <p>
              We collect information when you create an account and use our service:
            </p>
            <ul>
              <li>
                <strong>Account Information:</strong> When you register, we collect your email address, name, and 
                other profile information you choose to provide.
              </li>
              <li>
                <strong>User Content:</strong> We collect the content you submit, such as forum posts, comments, and 
                contributions to hymn information.
              </li>
              <li>
                <strong>Usage Information:</strong> We collect information about how you use the service, including 
                hymns you view, your forum participation, and favorites.
              </li>
              <li>
                <strong>Technical Information:</strong> We collect device information, IP address, browser type, and 
                operating system to improve our service.
              </li>
            </ul>
            
            <h2>2. How We Use Your Information</h2>
            <p>
              We use the information we collect to:
            </p>
            <ul>
              <li>Provide, maintain, and improve our service</li>
              <li>Process and fulfill your requests</li>
              <li>Communicate with you about the service</li>
              <li>Customize content based on your preferences</li>
              <li>Monitor and analyze trends, usage, and activities</li>
              <li>Detect, prevent, and address technical issues</li>
              <li>Comply with legal obligations</li>
            </ul>
            
            <h2>3. Information Sharing</h2>
            <p>
              We may share your information in the following circumstances:
            </p>
            <ul>
              <li>
                <strong>Public Content:</strong> Your forum posts, comments, and profile information are publicly visible.
              </li>
              <li>
                <strong>With Your Consent:</strong> We may share information when you direct us to do so.
              </li>
              <li>
                <strong>Service Providers:</strong> We may share information with third-party vendors who perform services on our behalf.
              </li>
              <li>
                <strong>Legal Requirements:</strong> We may share information if required by law or to protect our rights.
              </li>
            </ul>
            
            <h2>4. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information. However, no method of 
              transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
            
            <h2>5. Your Rights and Choices</h2>
            <p>
              You can:
            </p>
            <ul>
              <li>Access and update your account information</li>
              <li>Delete your account and personal data</li>
              <li>Opt out of marketing communications</li>
              <li>Request a copy of your personal data</li>
            </ul>
            
            <h2>6. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to collect information about your browsing activities.
              You can set your browser to refuse all or some cookies, but this may limit your ability to use some features of the service.
            </p>
            
            <h2>7. Children's Privacy</h2>
            <p>
              Our service is not directed to children under 13, and we do not knowingly collect personal information from children under 13.
              If we learn that we have collected personal information from a child under 13, we will delete that information.
            </p>
            
            <h2>8. International Data Transfers</h2>
            <p>
              We may transfer your information to countries other than the country where you live. These countries may have
              different data protection laws than your country.
            </p>
            
            <h2>9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. If we make material changes, we will notify you by email
              or by posting a notice on our website.
            </p>
            
            <h2>10. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please <Link to="/contact" className="text-indigo-600 dark:text-indigo-400 hover:underline">contact us</Link>.
            </p>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
              Last updated: {new Date().toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Privacy;
