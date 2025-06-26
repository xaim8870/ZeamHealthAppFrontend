import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import HomeScreen from "./pages/Index";
import NotFound from "./pages/NotFound";
import MindModule from "@/components/modules/MindModule";
import BodyModule from "@/components/modules/BodyModule";
import ActivityModule from "@/components/modules/ActivityModule";
import SleepModule from "@/components/modules/SleepModule";
import ProviderDashboard from "@/components/ProviderDashboard";
import ChatAssistant from "@/components/ChatAssistant";
import Footer from "@/components/Footer";

// Import global styles
import "./styles/global.css";

const queryClient = new QueryClient();

// Layout component to include Footer across all routes
const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen dark:bg-black" id="app-root"> {/* Added id for reference */}
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/mind" element={<MindModule onBack={() => navigate("/")} />} />
        <Route path="/body" element={<BodyModule onBack={() => navigate("/")} />} />
        <Route path="/activity" element={<ActivityModule onBack={() => navigate("/")} onModuleSelect={function (module: string): void {
          throw new Error("Function not implemented.");
        } } />} />
        <Route path="/sleep" element={<SleepModule onBack={() => navigate("/")} />} />
        <Route path="/provider" element={<ProviderDashboard onBack={() => navigate("/")} />} />
        <Route path="/chat" element={<ChatAssistant isOpen={true} onClose={() => navigate("/")} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;