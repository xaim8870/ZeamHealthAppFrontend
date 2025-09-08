import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import AppleSignin from 'react-apple-signin-auth';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Add type declaration for AppleSignin
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

  // Hide footer dynamically (if your Footer component is in App.tsx)
  React.useEffect(() => {
    const footer = document.querySelector('footer');
    if (footer) footer.classList.add('hidden');
    return () => footer?.classList.remove('hidden');
  }, []);

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      console.log('Google Login Success', tokenResponse);
      navigate('/home');
    },
    onError: (error) => console.error('Google Login Failed', error),
  });

  const handleAppleLogin = (response: any) => {
    console.log('Apple Login Success', response);
    navigate('/home');
  };

  const handleAppleError = (error: any) => {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
        {/* Logo + Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 relative"
        >
          {/* Multi-colored triangle using SVG gradients */}
          <svg
            className="absolute left-1/2 -translate-x-1/2 -top-12 w-14 h-14"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="2"
          >
            <defs>
              <linearGradient id="side1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FF6B6B" />
                <stop offset="100%" stopColor="#FFD93D" />
              </linearGradient>
              <linearGradient id="side2" x1="1" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6BCB77" />
                <stop offset="100%" stopColor="#4D96FF" />
              </linearGradient>
              <linearGradient id="side3" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="#9D4EDD" />
                <stop offset="100%" stopColor="#FF6B6B" />
              </linearGradient>
            </defs>
            <path d="M12 2L2 22h20L12 2z" stroke="url(#side1)" />
            <path d="M2 22h20" stroke="url(#side2)" />
            <path d="M12 2L2 22" stroke="url(#side3)" />
          </svg>

          <h1 className="mt-6 text-3xl font-extrabold text-gray-800">
            Zeam Health
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Wellness & Analytics
          </p>
        </motion.div>

        {/* Form */}
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-700">
          {isSignup ? 'Create Your Account' : 'Welcome Back'}
        </h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="••••••••"
              required
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-medium shadow hover:bg-blue-700 transition"
          >
            {isSignup ? 'Sign Up' : 'Login'}
          </motion.button>
        </form>

        {/* Social Logins */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 mb-3">Or continue with</p>
          <div className="space-y-2">
            <button
              onClick={() => handleGoogleLogin()}
              className="w-full bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 transition"
            >
              {isSignup ? 'Sign up' : 'Sign in'} with Google
            </button>
            <AppleSignin
              authOptions={{
                clientId: 'your-service-id',
                scope: 'email name',
                redirectURI: 'http://localhost:3000/auth/callback',
                usePopup: true,
              }}
              onSuccess={handleAppleLogin}
              onError={handleAppleError}
              uiType="dark"
              className="w-full mt-2"
            />
          </div>
        </div>

        {/* Switch Links */}
        <p className="mt-6 text-center text-gray-600">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => navigate(isSignup ? '/login' : '/signup')}
            className="text-blue-600 font-semibold hover:underline"
          >
            {isSignup ? 'Login' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPages;
