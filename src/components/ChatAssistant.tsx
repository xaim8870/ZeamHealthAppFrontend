
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, MessageCircle, Send, Bot, User } from "lucide-react";

interface ChatAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const ChatAssistant = ({ isOpen, onClose }: ChatAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your personal health assistant. I can help you interpret your health data, provide wellness recommendations, and answer questions about your mind, body, activity, and sleep patterns. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState("");

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: messages.length + 2,
        text: generateBotResponse(inputText),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const generateBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('sleep') || input.includes('tired')) {
      return "Based on your recent sleep data, I see your sleep score was 82 last night. Your REM sleep percentage is optimal, but you might benefit from going to bed 15 minutes earlier to increase deep sleep. Would you like me to suggest some sleep hygiene tips?";
    }
    
    if (input.includes('stress') || input.includes('anxiety') || input.includes('mind')) {
      return "I noticed your EEG data shows elevated stress levels. Based on CBT principles, let's try a quick breathing exercise: Breathe in for 4 counts, hold for 4, exhale for 6. This can help activate your parasympathetic nervous system. Would you like to start a guided session?";
    }
    
    if (input.includes('activity') || input.includes('exercise') || input.includes('workout')) {
      return "Your Whoop data shows a recovery score of 68% today. This suggests you're ready for moderate activity. I recommend a light to moderate workout focusing on Zone 2 cardio or yoga. Your heart rate variability indicates good recovery status.";
    }
    
    if (input.includes('nutrition') || input.includes('food') || input.includes('eat')) {
      return "Looking at your nutrition log today, you've consumed 1,150 calories so far with good protein distribution. Your glucose levels are stable. I suggest adding some healthy fats and complex carbs for your next meal to maintain energy levels throughout the afternoon.";
    }
    
    if (input.includes('pain') || input.includes('symptoms')) {
      return "I see you logged a pain level of 3 earlier. Based on your activity and sleep patterns, this might be related to muscle tension. Consider some gentle stretching or meditation. If pain persists or increases, please consult with your healthcare provider through the app.";
    }
    
    return "I understand you're asking about your health data. Let me analyze your recent metrics and provide personalized recommendations. Could you be more specific about which area you'd like to focus on: mind, body, activity, or sleep?";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4"
        >
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="w-full max-w-md h-[70vh] sm:h-[80vh]"
          >
            <Card className="h-full flex flex-col">
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-3 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                  Health Assistant
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex items-start gap-3 ${
                        message.sender === 'user' ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.sender === 'bot' 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {message.sender === 'bot' ? (
                          <Bot className="w-4 h-4" />
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                      </div>
                      
                      <div className={`max-w-[80%] p-3 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <p className="text-sm">{message.text}</p>
                        <p className={`text-xs mt-1 opacity-70 ${
                          message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {/* Input */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Ask about your health data..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSendMessage();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} size="sm">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatAssistant;
