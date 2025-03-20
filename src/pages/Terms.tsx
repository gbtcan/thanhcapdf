import React from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../components/PageLayout';

const Terms: React.FC = () => {
  return (
    <PageLayout title="Terms of Service" description="Terms of service for using the Catholic Hymns application">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Terms of Service
          </h1>
          
          <div className="prose dark:prose-invert max-w-none">
            <p>
              Welcome to Catholic Hymns. By using our service, you agree to comply with and be bound by the following terms and conditions.
              Please review them carefully.
            </p>
            
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using our service, you agree to these Terms of Service. If you do not agree to these terms,
              you may not access or use the service.
            </p>
            
            <h2>2. Description of Service</h2>
            <p>
              Catholic Hymns provides a platform for users to access, share, and discuss Catholic hymns and liturgical music.
              The service includes features such as hymn browsing, searching, community forum discussions, and user profiles.
            </p>
            
            <h2>3. User Accounts</h2>
            <p>
              To access certain features of the service, you may need to register for an account. You are responsible for
              maintaining the confidentiality of your account information, including your password, and for all activity that
              occurs under your account.
            </p>
            
            <h2>4. User Content</h2>
            <p>
              Users may submit content to the service, including forum posts, comments, and hymn contributions. By submitting
              content, you grant us a non-exclusive, royalty-free license to use, reproduce, modify, and display such content
              in connection with the service.
            </p>
            
            <h2>5. Acceptable Use</h2>
            <p>
              You agree not to use the service to:
            </p>
            <ul>
              <li>Post illegal, harmful, threatening, abusive, or objectionable content</li>
              <li>Impersonate others or misrepresent your affiliation</li>
              <li>Collect or store personal data about other users without their permission</li>
              <li>Interfere with or disrupt the service or servers/networks connected to the service</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
            
            <h2>6. Copyright and Intellectual Property</h2>
            <p>
              The service and its content, features, and functionality are owned by Catholic Hymns and are protected by
              international copyright, trademark, and other intellectual property rights laws. Hymns and liturgical music
              may be subject to copyright by their respective owners.
            </p>
            
            <h2>7. Termination</h2>
            <p>
              We may terminate or suspend your account and access to the service immediately, without prior notice or liability,
              for any reason, including if you breach these Terms.
            </p>
            
            <h2>8. Disclaimer of Warranties</h2>
            <p>
              The service is provided "as is" without warranties of any kind, either express or implied. We do not warrant
              that the service will be uninterrupted or error-free.
            </p>
            
            <h2>9. Limitation of Liability</h2>
            <p>
              In no event shall Catholic Hymns be liable for any indirect, incidental, special, consequential or punitive damages.
            </p>
            
            <h2>10. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. If we make changes, we will provide notice by updating
              the date at the top of these terms and by maintaining a current version on our website.
            </p>
            
            <h2>11. Contact</h2>
            <p>
              If you have any questions about these Terms, please <Link to="/contact" className="text-indigo-600 dark:text-indigo-400 hover:underline">contact us</Link>.
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

export default Terms;
