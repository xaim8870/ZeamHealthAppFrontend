import React, { useState, useEffect } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import AppleSignin from "react-apple-signin-auth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface AuthPagesProps {
  isSignup?: boolean;
  onLogin?: (email: string, password: string) => boolean;
}

const AuthPages = ({ isSignup = false, onLogin }: AuthPagesProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Hide footer dynamically
  useEffect(() => {
    const footer = document.querySelector("footer");
    if (footer) footer.classList.add("hidden");
    return () => footer?.classList.remove("hidden");
  }, []);

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      console.log("Google Login Success", tokenResponse);
      navigate("/home");
    },
    onError: (error) => console.error("Google Login Failed", error),
  });

  const handleAppleLogin = (response: any) => {
    console.log("Apple Login Success", response);
    navigate("/home");
  };

  const handleAppleError = (error: any) => {
    console.error("Apple Login Failed", error);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onLogin && !onLogin(email, password)) {
      setError("Invalid email or password. Use test@zeamhealth.com / password123");
    } else {
      setError(null);
      navigate("/home");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-md relative"
      >
        {/* Glass Card */}
        <div className="p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700">
          {/* Animated Triangle Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-10 relative"
          >
            <motion.svg
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="mx-auto w-16 h-16 drop-shadow-lg"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2"
            >
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#4facfe" />
                  <stop offset="100%" stopColor="#00f2fe" />
                </linearGradient>
                <linearGradient id="grad2" x1="1" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#43e97b" />
                  <stop offset="100%" stopColor="#38f9d7" />
                </linearGradient>
                <linearGradient id="grad3" x1="0" y1="1" x2="1" y2="0">
                  <stop offset="0%" stopColor="#fa709a" />
                  <stop offset="100%" stopColor="#fee140" />
                </linearGradient>
              </defs>
              <path d="M12 2L2 22h20L12 2z" stroke="url(#grad1)" />
              <path d="M2 22h20" stroke="url(#grad2)" />
              <path d="M12 2L2 22" stroke="url(#grad3)" />
            </motion.svg>

            <h1 className="mt-6 text-3xl font-extrabold text-gray-800 dark:text-white">
              Zeam Health
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Wellness & Analytics
            </p>
          </motion.div>

          {/* Heading */}
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-700 dark:text-gray-200">
            {isSignup ? "Create Your Account" : "Welcome Back"}
          </h2>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="you@example.com"
                required
              />
            </motion.div>

            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="••••••••"
                required
              />
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white p-3 rounded-xl font-semibold shadow-lg hover:from-blue-700 hover:to-blue-600 transition-all"
            >
              {isSignup ? "Sign Up" : "Login"}
            </motion.button>
          </form>

          {/* Social Logins */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-3">
              Or continue with
            </p>
            <div className="space-y-2">
              <button
                onClick={() => handleGoogleLogin()}
                className="w-full bg-red-500 text-white p-3 rounded-xl shadow hover:bg-red-600 transition"
              >
                {isSignup ? "Sign up" : "Sign in"} with Google
              </button>
              <AppleSignin
                authOptions={{
                  clientId: "your-service-id",
                  scope: "email name",
                  redirectURI: "http://localhost:3000/auth/callback",
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
          <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => navigate(isSignup ? "/login" : "/signup")}
              className="text-blue-600 font-semibold hover:underline"
            >
              {isSignup ? "Login" : "Sign Up"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPages;
