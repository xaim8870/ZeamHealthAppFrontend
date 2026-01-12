import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { DeviceProvider } from "./context/DeviceContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

import AuthPages from "./pages/AuthPages";
import HomeScreen from "./pages/HomeScreen";
import NotFound from "./pages/NotFound";
import MindModule from "@/components/modules/MindModule";
import BodyModule from "@/components/modules/BodyModule";
import ActivityModule from "@/components/modules/ActivityModule";
import SleepModule from "@/components/modules/SleepModule";
import ProviderDashboard from "@/components/ProviderDashboard";
import ProfileScreen from "@/pages/ProfileScreen";
import Footer from "@/components/Footer";
// Signal Quality Screen
import SignalQualityScreen from "./pages/signal/NeurositySignalQuality";
import MuseSignalQuality from "./pages/signal/MuseSignalQuality";
import SplashScreen from "./pages/SplashScreen";
import Chat from "./pages/Chat";

//Connect Pages
import ConnectNeurosity from "./pages/ConnectNeurosity";
import ConnectMuse from "./pages/connect/connectMuse";

import "./styles/global.css";

const queryClient = new QueryClient();

/* -------------------- ProtectedRoute Wrapper -------------------- */
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

/* -------------------- App Routes -------------------- */
const AppRoutes = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  return (
   <div className="min-h-screen dark:bg-black transition-colors duration-300" id="app-root">
      <DeviceProvider>
        <Routes>
          {/* ---------- Auth Routes ---------- */}
          <Route path="/login" element={<AuthPages isSignup={false} onLogin={login} />} />
          <Route path="/signup" element={<AuthPages isSignup={true} onLogin={login} />} />

          {/* ---------- Protected Routes ---------- */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                {/* ✅ Pass onChatOpen prop */}
                <HomeScreen onChatOpen={() => navigate("/chat")} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mind"
            element={
              <ProtectedRoute>
                {/* ✅ Pass onBack prop */}
                <MindModule onBack={() => navigate("/home")} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/body"
            element={
              <ProtectedRoute>
                {/* ✅ Pass onBack prop */}
                <BodyModule onBack={() => navigate("/home")} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/activity"
            element={
              <ProtectedRoute>
                {/* ✅ Pass onBack and onModuleSelect props */}
                <ActivityModule
                  onBack={() => navigate("/home")}
                  onModuleSelect={() => {}}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/sleep"
            element={
              <ProtectedRoute>
                {/* ✅ Pass onBack prop */}
                <SleepModule onBack={() => navigate("/home")} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/provider"
            element={
              <ProtectedRoute>
                {/* ✅ Pass onBack prop */}
                <ProviderDashboard onBack={() => navigate("/home")} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/signal-quality"
            element={
              <ProtectedRoute>
                <SignalQualityScreen />
              </ProtectedRoute>
            }
            
          />
          <Route
            path="/signal-quality-muse"
            element={<MuseSignalQuality onContinue={() => {}} />}
          />
          <Route 
            path="/connect-neurosity" 
            element={
              <ConnectNeurosity />
            } 
          />

          <Route 
            path="/connect-muse" 
            element={
              <ConnectMuse />
            } 
          />

          

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfileScreen />
              </ProtectedRoute>
            }
          />

          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />

          {/* ---------- Default + 404 ---------- */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </DeviceProvider>
    </div>

  );
};

/* -------------------- Main App -------------------- */
const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 4000); // show splash for 4 seconds
    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
          <BrowserRouter>
            <AuthProvider>
              {showSplash ? <SplashScreen /> : <AppRoutes />}
            </AuthProvider>
          </BrowserRouter>
        </GoogleOAuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
