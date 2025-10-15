// src/pages/Chat.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, Sun, Moon, Send } from "lucide-react";
import NeuralPatternBackground from "@/components/NeuralPatternBackground";
import HamburgerMenu from "@/components/HamburgerMenu";

const Chat = () => {
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<string[]>([]);
  const [status, setStatus] = useState("");

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
    if (!isDarkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  const getThemeButtonIcon = () =>
    isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />;

  // ✅ Send message to backend /send-message API
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Optimistically add to local chat
    setChatHistory([...chatHistory, message]);
    const currentMessage = message;
    setMessage("");
    setStatus("Sending...");

    try {
      const response = await fetch("http://localhost:5000/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentMessage, sender: "Client" }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("✅ Message sent successfully!");
      } else {
        setStatus(`❌ Failed: ${data.error || "Server error"}`);
      }
    } catch (err) {
      setStatus("❌ Network error, please try again.");
    }

    // Clear status after few seconds
    setTimeout(() => setStatus(""), 4000);
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-100 dark:bg-black">
      <div className="relative min-h-screen w-full max-w-md pb-20 
        dark:bg-gradient-to-br dark:from-black dark:via-gray-900 dark:to-cyan-900 
        bg-gradient-to-b from-blue-50 via-white to-indigo-50 shadow-sm top-3 
        border border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden">

        {/* Background */}
        <NeuralPatternBackground
          className="absolute inset-0 w-full h-full z-[1] pointer-events-none"
          opacity={0.5}
        />

        {/* Hamburger Menu */}
        <HamburgerMenu
          isOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
          onNavigate={() => setMenuOpen(false)}
          user={{ name: "David", loggedIn: true }}
        />

        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
            onClick={() => setMenuOpen(false)}
          />
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center px-4 pt-6 pb-3 relative z-10"
        >
          <Button onClick={() => setMenuOpen(true)} variant="ghost" size="sm">
            <Menu className="w-6 h-6" />
          </Button>

          <h1
            className="
              font-orbitron text-2xl font-extrabold tracking-widest
              text-gray-800 dark:text-white
              text-glow-teal animate-pulse-glow
            "
          >
            ZEAM CHAT
          </h1>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="rounded-full p-2"
          >
            {getThemeButtonIcon()}
          </Button>
        </motion.div>

        {/* Chat Section */}
        <div className="relative z-10 flex flex-col justify-between h-[calc(100vh-120px)] px-4">
          {/* Chat messages */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex-1 overflow-y-auto mb-4 p-2 space-y-3 rounded-xl bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm border border-gray-300 dark:border-gray-700"
          >
            {chatHistory.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 mt-10">
                Start the conversation with the development team 👇
              </p>
            ) : (
              chatHistory.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex justify-end"
                >
                  <div className="max-w-xs bg-gradient-to-br from-indigo-600 to-blue-600 text-white px-4 py-2 rounded-2xl shadow-md text-sm">
                    {msg}
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>

          {/* Status feedback */}
          {status && (
            <p className="text-center text-xs text-gray-600 dark:text-gray-400 mb-1 animate-pulse">
              {status}
            </p>
          )}

          {/* Input bar */}
          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 bg-white/70 dark:bg-gray-900/60 border border-gray-300 dark:border-gray-700 rounded-full px-3 py-2 backdrop-blur-md"
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
              className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white"
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
