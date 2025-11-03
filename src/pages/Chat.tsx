import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, Send, Sun, Moon, Stethoscope, User } from "lucide-react";
import HamburgerMenu from "@/components/HamburgerMenu";
import NeuralPatternBackground from "@/components/NeuralPatternBackground";

interface Message {
  sender: "doctor" | "patient";
  text: string;
  time: string;
}

const Chat = () => {
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [status, setStatus] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
    document.documentElement.classList.toggle("dark");
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage: Message = {
      sender: "patient",
      text: message,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatHistory((prev) => [...prev, newMessage]);
    setMessage("");
    setStatus("Sending...");

    // Simulate backend reply (for now)
    setTimeout(() => {
      setChatHistory((prev) => [
        ...prev,
        {
          sender: "doctor",
          text: "Thank you for sharing, I’ll review your symptoms shortly.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setStatus("");
    }, 2000);
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-100 dark:bg-black">
      <div className="relative w-full max-w-md min-h-screen rounded-3xl overflow-hidden border border-gray-300 dark:border-gray-800 shadow-xl 
        bg-gradient-to-b from-blue-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-black">

        {/* Background */}
        <NeuralPatternBackground className="absolute inset-0 z-0 opacity-30 pointer-events-none" />

        {/* Hamburger Menu */}
        <HamburgerMenu
          isOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
          onNavigate={() => setMenuOpen(false)}
          user={{ name: "Patient", loggedIn: true }}
        />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-20 flex items-center justify-between px-4 py-4
          bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800"
        >
          <Button variant="ghost" size="sm" onClick={() => setMenuOpen(true)}>
            <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </Button>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500">
                <Stethoscope className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-base font-semibold text-gray-800 dark:text-gray-100">
                Dr. Sarah Williams
              </h1>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Psychiatrist • Online</p>
          </div>

          <Button variant="ghost" size="sm" onClick={toggleTheme}>
            {isDarkMode ? <Sun className="w-5 h-5 text-gray-300" /> : <Moon className="w-5 h-5 text-gray-700" />}
          </Button>
        </motion.div>

        {/* Chat Section */}
        <div className="relative z-10 flex flex-col justify-between h-[calc(100vh-140px)] px-4 pt-2">
          {/* Chat messages */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex-1 overflow-y-auto mb-4 space-y-3 px-1 py-2 rounded-2xl bg-white/60 dark:bg-gray-900/40 backdrop-blur-md border border-gray-200 dark:border-gray-700"
          >
            {chatHistory.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 mt-12 text-sm">
                Start your conversation with your doctor 👇
              </p>
            ) : (
              chatHistory.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.sender === "doctor" ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`relative max-w-[75%] px-4 py-2 rounded-2xl shadow-md text-sm ${
                      msg.sender === "doctor"
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none"
                        : "bg-gradient-to-br from-indigo-600 to-cyan-600 text-white rounded-br-none"
                    }`}
                  >
                    {msg.text}
                    <div
                      className={`text-[10px] mt-1 ${
                        msg.sender === "doctor"
                          ? "text-gray-500 dark:text-gray-400 text-left"
                          : "text-gray-200 text-right"
                      }`}
                    >
                      {msg.time}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
            <div ref={chatEndRef} />
          </motion.div>

          {/* Status feedback */}
          {status && (
            <p className="text-center text-xs text-gray-600 dark:text-gray-400 mb-2 animate-pulse">
              {status}
            </p>
          )}

          {/* Input */}
          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 bg-white/80 dark:bg-gray-900/70 border border-gray-300 dark:border-gray-700 rounded-full px-3 py-2 backdrop-blur-md shadow-md mb-4"
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-transparent focus:outline-none text-sm text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <Button
              type="submit"
              size="icon"
              className="rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-90 text-white shadow-lg"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
