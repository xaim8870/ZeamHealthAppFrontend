import { Toaster } from "@/components/ui/toaster";
import { DeviceProvider } from "./context/DeviceContext";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import AuthPages from "./pages/AuthPages";
import HomeScreen from "./pages/HomeScreen";
import NotFound from "./pages/NotFound";
import MindModule from "@/components/modules/MindModule";
import BodyModule from "@/components/modules/BodyModule";
import ActivityModule from "@/components/modules/ActivityModule";
import SleepModule from "@/components/modules/SleepModule";
import ProviderDashboard from "@/components/ProviderDashboard";
import ChatAssistant from "@/components/ChatAssistant";
import ProfileScreen from "@/pages/ProfileScreen";
import Footer from "@/components/Footer";
import SignalQualityScreen from "./pages/SignalQualityScreen";

// Import global styles
import "./styles/global.css";
import React from "react";

// Mock authentication state with test login
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false); // Initial state
  const login = (email: string, password: string) => {
    // Test credentials
    if (email === "test@zeamhealth.com" && password === "password123") {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };
  const logout = () => setIsAuthenticated(false);
  return { isAuthenticated, setIsAuthenticated, login, logout };
};

const queryClient = new QueryClient();

// Layout component to include Footer across all routes
const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();

  return (
    <div className="min-h-screen dark:bg-black" id="app-root">
      <DeviceProvider>
      <Routes>
        <Route
          path="/login"
          element={<AuthPages isSignup={false} onLogin={login} />}
        />
        <Route
          path="/signup"
          element={<AuthPages isSignup={true} onLogin={login} />}
        />
        <Route
          path="/home"
          element={isAuthenticated ? <HomeScreen onChatOpen={() => navigate('/chat')} /> : <Navigate to="/login" />}
        />
        <Route
          path="/mind"
          element={isAuthenticated ? <MindModule onBack={() => navigate("/home")} /> : <Navigate to="/login" />}
        />
        <Route
          path="/body"
          element={isAuthenticated ? <BodyModule onBack={() => navigate("/home")} /> : <Navigate to="/login" />}
        />
        <Route
          path="/activity"
          element={isAuthenticated ? <ActivityModule onBack={() => navigate("/home")} onModuleSelect={() => {}} /> : <Navigate to="/login" />}
        />
        <Route
          path="/sleep"
          element={isAuthenticated ? <SleepModule onBack={() => navigate("/home")} /> : <Navigate to="/login" />}
        />
        <Route
          path="/provider"
          element={isAuthenticated ? <ProviderDashboard onBack={() => navigate("/home")} /> : <Navigate to="/login" />}
        />
        <Route
          path="/signal-quality"
          element={isAuthenticated ? <SignalQualityScreen /> : <Navigate to="/login" />}
        />
        <Route
          path="/chat"
          element={isAuthenticated ? <ChatAssistant isOpen={true} onClose={() => navigate("/home")} /> : <Navigate to="/login" />}
        />
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? "/home" : "/login"} />}
        />
        <Route
          path="/profile"
          element={isAuthenticated ? <ProfileScreen /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </DeviceProvider>
      <Footer />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID"> {/* Replace with your Google Client ID */}
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </GoogleOAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;