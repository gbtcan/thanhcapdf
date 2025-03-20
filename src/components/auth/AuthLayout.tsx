import React from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Import auth pages
import LoginPage from '../../pages/auth/Login';
import RegisterPage from '../../pages/auth/Register';
import ForgotPasswordPage from '../../pages/auth/ForgotPassword';
import ResetPasswordPage from '../../pages/auth/ResetPassword';

const AuthLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  // If user is already authenticated, redirect to home
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Routes>
          <Route index element={<LoginPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
        </Routes>
      </div>
    </div>
  );
};

export default AuthLayout;
