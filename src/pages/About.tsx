import React from 'react';
import { Link } from 'react-router-dom';
import { Music, Users, Tag, Search, BookOpen, Heart, Info, PlusCircle } from 'lucide-react';
import PageLayout from '../components/PageLayout';

const About: React.FC = () => {
  return (
    <PageLayout title="About Catholic Hymns Library">
      <div className="space-y-8">
        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-indigo-100 p-3 rounded-full">
              <Info className="h-6 w-6 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
          </div>
          
          <div className="prose max-w-none">
            <p>
              The Catholic Hymns Library aims to preserve, share, and celebrate the rich tradition 
              of sacred music in the Catholic Church. Our digital collection makes centuries of 
              beautiful hymns accessible to all who wish to use them for prayer, liturgy, or 
              personal inspiration.
            </p>
            <p>
              From ancient Gregorian chants to contemporary compositions, our library serves as a 
              comprehensive resource for parishes, choirs, music ministers, and anyone interested 
              in Catholic sacred music.
            </p>
          </div>
        </div>
        
        {/* Features */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="bg-indigo-100 p-2 rounded-full">
                  <Music className="h-5 w-5 text-indigo-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Extensive Collection</h3>
                <p className="mt-2 text-gray-600">
                  Browse through hundreds of sacred hymns from various traditions, periods, and languages.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="bg-indigo-100 p-2 rounded-full">
                  <Search className="h-5 w-5 text-indigo-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Powerful Search</h3>
                <p className="mt-2 text-gray-600">
                  Find hymns by title, lyrics, author, or category with our advanced search capabilities.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="bg-indigo-100 p-2 rounded-full">
                  <BookOpen className="h-5 w-5 text-indigo-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Complete Lyrics</h3>
                <p className="mt-2 text-gray-600">
                  Access the full text of hymns for personal use, prayer, or liturgical planning.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="bg-indigo-100 p-2 rounded-full">
                  <Users className="h-5 w-5 text-indigo-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Author Information</h3>
                <p className="mt-2 text-gray-600">
                  Learn about the composers, lyricists, and translators behind the sacred music.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="bg-indigo-100 p-2 rounded-full">
                  <Tag className="h-5 w-5 text-indigo-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Categorization</h3>
                <p className="mt-2 text-gray-600">
                  Find hymns organized by liturgical season, theme, occasion, or musical style.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="bg-indigo-100 p-2 rounded-full">
                  <Heart className="h-5 w-5 text-indigo-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Personal Collections</h3>
                <p className="mt-2 text-gray-600">
                  Registered users can save favorites and create personalized collections.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Call to Action */}
        <div className="bg-indigo-700 text-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Join Our Community</h2>
          <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
            Are you passionate about sacred music? Join our community to contribute, share insights, 
            and help preserve this beautiful tradition of the Church.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/register"
              className="bg-white text-indigo-700 hover:bg-indigo-50 px-6 py-2 rounded-md font-medium"
            >
              Create Account
            </Link>
            <Link
              to="/songs"
              className="bg-indigo-600 text-white hover:bg-indigo-500 px-6 py-2 rounded-md font-medium"
            >
              Explore Hymns
            </Link>
          </div>
        </div>
        
        {/* Contribute Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-indigo-100 p-3 rounded-full">
              <PlusCircle className="h-6 w-6 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">How to Contribute</h2>
          </div>
          
          <div className="prose max-w-none">
            <p>
              Our library grows through the contributions of users like you. Here's how you can help:
            </p>
            
            <ul>
              <li>Submit new hymns with accurate lyrics and attribution</li>
              <li>Provide information about hymn authors and composers</li>
              <li>Share sheet music and PDF files (with proper copyright clearance)</li>
              <li>Help categorize and tag hymns for better organization</li>
              <li>Provide translations for hymns in different languages</li>
            </ul>
            
            <p>
              To contribute, please <Link to="/login" className="text-indigo-600 hover:text-indigo-800">sign in</Link> or 
              contact our editorial team at <a href="mailto:contact@catholichymns.org" className="text-indigo-600 hover:text-indigo-800">contact@catholichymns.org</a>.
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default About;
