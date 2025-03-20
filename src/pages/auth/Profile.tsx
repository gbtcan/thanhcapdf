import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingIndicator from '../../components/LoadingIndicator';
import PageLayout from '../../components/PageLayout';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Redirect to main profile page when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/profile', { replace: true });
    } else if (!isAuthenticated) {
      navigate('/auth/login', { 
        replace: true,
        state: { from: '/profile' }
      });
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <PageLayout title="Profile">
      <div className="flex justify-center items-center h-64">
        <LoadingIndicator size="large" message="Loading profile..." />
      </div>
    </PageLayout>
  );
};

export default Profile;
