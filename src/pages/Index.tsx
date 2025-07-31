
import { useState } from "react";
import { motion } from "framer-motion";
import HomeScreen from "@/pages/HomeScreen";
import MindModule from "@/components/modules/MindModule";
import ActivityModule from "@/components/modules/ActivityModule";
import BodyModule from "@/components/modules/BodyModule";
import SleepModule from "@/components/modules/SleepModule";
import ProviderDashboard from "@/components/ProviderDashboard";
import ChatAssistant from "@/components/ChatAssistant";

export type ModuleType = 'home' | 'mind' | 'activity' | 'body' | 'sleep' | 'provider' | 'chat';

const Index = () => {
  const [currentModule, setCurrentModule] = useState<ModuleType>('home');
  const [chatOpen, setChatOpen] = useState(false);

  const renderModule = () => {
    switch (currentModule) {
      case 'mind':
        return <MindModule onBack={() => setCurrentModule('home')} />;
      case 'activity':
        return <ActivityModule onBack={() => setCurrentModule('home')} onModuleSelect={function (module: string): void {
          throw new Error("Function not implemented.");
        } } />;
      case 'body':
        return <BodyModule onBack={() => setCurrentModule('home')}  />;
      case 'sleep':
        return <SleepModule onBack={() => setCurrentModule('home')} />;
      case 'provider':
        return <ProviderDashboard onBack={() => setCurrentModule('home')} />;
      default:
        return (
          <HomeScreen onChatOpen={function (): void {
            throw new Error("Function not implemented.");
          } } />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <motion.div
        key={currentModule}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        {renderModule()}
      </motion.div>
      
      <ChatAssistant 
        isOpen={chatOpen} 
        onClose={() => setChatOpen(false)} 
      />
    </div>
  );
};

export default Index;
