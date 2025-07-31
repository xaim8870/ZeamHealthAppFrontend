import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import AppleSignin from 'react-apple-signin-auth';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Add basic type declaration for AppleSignin
declare module 'react-apple-signin-auth' {
  export interface AppleSigninProps {
    authOptions: {
      clientId: string;
      scope: string;
      redirectURI: string;
      usePopup?: boolean;
    };
    onSuccess: (response: any) => void;
    onError: (error: any) => void;
    uiType?: 'dark' | 'light';
    className?: string;
  }
  const AppleSignin: React.FC<AppleSigninProps>;
}

interface AuthPagesProps {
  isSignup?: boolean;
  onLogin?: (email: string, password: string) => boolean;
}

const AuthPages = ({ isSignup = false, onLogin }: AuthPagesProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      console.log('Google Login Success', tokenResponse);
      // Simulate successful login (replace with backend call)
      navigate('/home');
    },
    onError: (error) => console.error('Google Login Failed', error),
  });

  const handleAppleLogin = (response) => {
    console.log('Apple Login Success', response);
    // Simulate successful login (replace with backend call)
    navigate('/home');
  };

  const handleAppleError = (error) => {
    console.error('Apple Login Failed', error);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onLogin && !onLogin(email, password)) {
      setError('Invalid email or password. Use test@zeamhealth.com / password123');
    } else {
      setError(null);
      navigate('/home');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-6 mx-auto bg-white rounded-lg shadow">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 relative"
        >
          <svg className="absolute left-0 top-0 transform -translate-x-8 -translate-y-2 w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 22h20L12 2z" strokeLinejoin="round" />
          </svg>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent inline-block">
            Zeam Health
          </h1>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">
            Wellness & Analytics
          </p>
        </motion.div>
        <h2 className="text-2xl font-bold text-center mb-6">{isSignup ? 'Sign Up' : 'Login'}</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            {isSignup ? 'Sign Up' : 'Login'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <p>Or {isSignup ? 'sign up' : 'sign in'} with:</p>
          <button
            onClick={() => handleGoogleLogin()}
            className="w-full bg-red-500 text-white p-2 mt-2 rounded hover:bg-red-600"
          >
            {isSignup ? 'Sign up' : 'Sign in'} with Google
          </button>
          <AppleSignin
            authOptions={{
              clientId: 'your-service-id', // Replace with your Apple Service ID
              scope: 'email name',
              redirectURI: 'http://localhost:3000/auth/callback', // Replace with your redirect URI
              usePopup: true,
            }}
            onSuccess={handleAppleLogin}
            onError={handleAppleError}
            uiType="dark"
            className="w-full mt-2"
          />
        </div>
        <p className="mt-4 text-center">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => navigate(isSignup ? '/login' : '/signup')}
            className="text-blue-500 hover:underline"
          >
            {isSignup ? 'Login' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPages;