import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, FileCheck, Heart, Shield, MessageCircle, 
  Users, AlertTriangle, ThumbsUp, Copyright 
} from 'lucide-react';
import PageLayout from '../components/PageLayout';

const ForumGuidelines: React.FC = () => {
  return (
    <PageLayout title="Forum Guidelines">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back navigation */}
        <div>
          <Link
            to="/forum"
            className="text-indigo-600 hover:text-indigo-800 flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Forum
          </Link>
        </div>
        
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 mb-4">
            <FileCheck className="h-8 w-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Catholic Hymns Forum Guidelines
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Please follow these guidelines to ensure our forum remains respectful and valuable to all members.
          </p>
        </div>
        
        {/* Guidelines sections */}
        <div className="bg-white rounded-lg shadow-md">
          {/* Respect and courtesy */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="flex items-center text-xl font-medium text-gray-900 mb-4">
              <Heart className="h-5 w-5 text-red-500 mr-2" />
              Respect and Courtesy
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>
                Treat all members with respect and courtesy, regardless of their background or beliefs. 
                Our community welcomes Catholics and non-Catholics alike who share an interest in sacred music.
              </p>
              <p>
                Avoid hostile or condescending language. Critique ideas respectfully, not the individuals expressing them.
              </p>
            </div>
          </div>
          
          {/* Doctrinal fidelity */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="flex items-center text-xl font-medium text-gray-900 mb-4">
              <Shield className="h-5 w-5 text-indigo-600 mr-2" />
              Doctrinal Fidelity
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>
                Discussions about hymn lyrics and their theological implications should remain faithful 
                to Catholic teaching and tradition.
              </p>
              <p>
                When discussing interpretations of hymn texts, provide references to authoritative 
                Catholic sources whenever possible.
              </p>
            </div>
          </div>
          
          {/* Quality contributions */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="flex items-center text-xl font-medium text-gray-900 mb-4">
              <MessageCircle className="h-5 w-5 text-green-600 mr-2" />
              Quality Contributions
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>
                Make meaningful contributions that advance the discussion. Share insights about hymn texts, 
                melodies, historical context, or liturgical use.
              </p>
              <p>
                When asking questions, provide context and be specific about what you're trying to understand.
              </p>
              <p>
                For discussions about specific hymns, include references to verses or musical elements to help 
                focus the conversation.
              </p>
            </div>
          </div>
          
          {/* Community engagement */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="flex items-center text-xl font-medium text-gray-900 mb-4">
              <Users className="h-5 w-5 text-blue-600 mr-2" />
              Community Engagement
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>
                Engage constructively with other members. Acknowledge valuable contributions and 
                build upon insights shared by others.
              </p>
              <p>
                Use the "like" feature to show appreciation for helpful or insightful posts.
              </p>
              <p>
                If you have particular expertise in music, liturgy, or theology, consider sharing 
                this context when providing specialized information.
              </p>
            </div>
          </div>
          
          {/* Prohibited content */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="flex items-center text-xl font-medium text-gray-900 mb-4">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              Prohibited Content
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>
                The following content is not allowed and will be removed:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Personal attacks, insults, or harassment</li>
                <li>Profane, vulgar, or obscene language</li>
                <li>Content that contradicts or disrespects Catholic teaching</li>
                <li>Spam, advertisements, or self-promotion</li>
                <li>Political discussions unrelated to sacred music</li>
                <li>Copyright violations (see Copyright section below)</li>
              </ul>
            </div>
          </div>
          
          {/* Moderation */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="flex items-center text-xl font-medium text-gray-900 mb-4">
              <ThumbsUp className="h-5 w-5 text-purple-600 mr-2" />
              Moderation
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>
                Forum moderators may edit or remove content that violates these guidelines.
                Repeated violations may result in temporary or permanent loss of posting privileges.
              </p>
              <p>
                If you see content that violates these guidelines, please report it using the "Report" button 
                rather than engaging directly.
              </p>
              <p>
                Moderation decisions seek to maintain a positive atmosphere for discussion, not to 
                censor legitimate viewpoints expressed respectfully.
              </p>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="p-6">
            <h2 className="flex items-center text-xl font-medium text-gray-900 mb-4">
              <Copyright className="h-5 w-5 text-gray-600 mr-2" />
              Copyright Considerations
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>
                Many hymns, especially modern ones, are protected by copyright. When sharing content:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Include proper attribution for texts and melodies</li>
                <li>Do not share complete scores or sheet music that is under copyright protection</li>
                <li>Limit quotes from copyrighted works to what's necessary for discussion (fair use)</li>
                <li>If you are the copyright holder of content being shared improperly, please contact moderators</li>
              </ul>
              <p className="italic mt-4">
                These guidelines are subject to change as our community grows. Thank you for helping create
                a respectful and enriching environment for discussing Catholic sacred music.
              </p>
            </div>
          </div>
        </div>
        
        {/* Return button */}
        <div className="flex justify-center">
          <Link
            to="/forum"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Return to Forum
          </Link>
        </div>
      </div>
    </PageLayout>
  );
};

export default ForumGuidelines;
