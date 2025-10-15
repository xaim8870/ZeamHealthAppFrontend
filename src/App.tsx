import React, { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { DeviceProvider } from "./context/DeviceContext";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

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
import SplashScreen from "./pages/SplashScreen";
import Chat from "./pages/Chat";
import "./styles/global.css";
import NeuralBackground from "./components/NeuralBackground";
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const login = (email: string, password: string) => {
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

const AppRoutes = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();

  return (
    <div className="min-h-screen dark:bg-black transition-colors duration-300" id="app-root">
      <DeviceProvider>
        
        <Routes>
          <Route path="/login" element={<AuthPages isSignup={false} onLogin={login} />} />
          <Route path="/signup" element={<AuthPages isSignup={true} onLogin={login} />} />
          <Route
            path="/home"
            element={
              isAuthenticated ? (
                <HomeScreen onChatOpen={() => navigate("/chat")} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/mind"
            element={
              isAuthenticated ? (
                <MindModule onBack={() => navigate("/home")} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/body"
            element={
              isAuthenticated ? (
                <BodyModule onBack={() => navigate("/home")} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/activity"
            element={
              isAuthenticated ? (
                <ActivityModule onBack={() => navigate("/home")} onModuleSelect={() => {}} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/sleep"
            element={
              isAuthenticated ? (
                <SleepModule onBack={() => navigate("/home")} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/provider"
            element={
              isAuthenticated ? (
                <ProviderDashboard onBack={() => navigate("/home")} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/signal-quality"
            element={
              isAuthenticated ? <SignalQualityScreen /> : <Navigate to="/login" />
            }
          />
          <Route path="/chat" element={<Chat />} />
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

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 4000); // show for 4 seconds
    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
          <BrowserRouter>
            {showSplash ? <SplashScreen /> : <AppRoutes />}
          </BrowserRouter>
        </GoogleOAuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
