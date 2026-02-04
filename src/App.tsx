import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { DeviceProvider } from "./context/DeviceContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

/* ---------- Layouts ---------- */
import MainLayout from "@/layouts/MainLayout";
import EEGLayout from "@/layouts/EEGLayout";

/* ---------- Pages ---------- */
import AuthPages from "./pages/AuthPages";
import HomeScreen from "./pages/HomeScreen";
import ProfileScreen from "./pages/ProfileScreen";
import NotFound from "./pages/NotFound";
import SplashScreen from "./pages/SplashScreen";
import Chat from "./pages/Chat";

/* ---------- Modules ---------- */
import MindModule from "@/components/modules/MindModule";
import BodyModule from "@/components/modules/BodyModule";
import ActivityModule from "@/components/modules/ActivityModule";
import SleepModule from "@/components/modules/SleepModule";
import ProviderDashboard from "@/components/ProviderDashboard";

/* ---------- EEG / Device ---------- */
import SignalQualityScreen from "./pages/signal/NeurositySignalQuality";
import MuseSignalQuality from "./pages/signal/MuseSignalQuality";
import ConnectNeurosity from "./pages/ConnectNeurosity";
import ConnectMuse from "./pages/connect/ConnectMuse";
import EEGAssessmentFlow from "./components/EEGAssessment/EEGAssessmentFlow";

import "./styles/global.css";

const queryClient = new QueryClient();

/* ================= PROTECTED ROUTE ================= */
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

/* ================= ROUTES ================= */
const AppRoutes = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  return (
    <DeviceProvider>
      <Routes>
        {/* ========== AUTH ========== */}
        <Route
          path="/login"
          element={<AuthPages isSignup={false} onLogin={login} />}
        />
        <Route
          path="/signup"
          element={<AuthPages isSignup={true} onLogin={login} />}
        />

        {/* ========== MAIN APP (WITH FOOTER) ========== */}
        <Route element={<MainLayout />}>
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomeScreen onChatOpen={() => navigate("/chat")} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mind"
            element={
              <ProtectedRoute>
                <MindModule onBack={() => navigate("/home")} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/body"
            element={
              <ProtectedRoute>
                <BodyModule onBack={() => navigate("/home")} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/activity"
            element={
              <ProtectedRoute>
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
                <SleepModule onBack={() => navigate("/home")} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/provider"
            element={
              <ProtectedRoute>
                <ProviderDashboard onBack={() => navigate("/home")} />
              </ProtectedRoute>
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
        </Route>

        {/* ========== EEG FLOW (NO FOOTER) ========== */}
        <Route element={<EEGLayout />}>
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

          <Route path="/connect-neurosity" element={<ConnectNeurosity />} />
          <Route path="/connect-muse" element={<ConnectMuse />} />

          <Route
            path="/eeg/assessment"
            element={
              <ProtectedRoute>
                <EEGAssessmentFlow
                  onBack={() => navigate("/home")}
                  onComplete={() => navigate("/home")}
                />
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
        </Route>

        {/* ========== DEFAULT / 404 ========== */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </DeviceProvider>
  );
};

/* ================= MAIN APP ================= */
const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 4000);
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
