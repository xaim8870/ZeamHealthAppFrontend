import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Brain,
  Activity,
  HeartPulse,
  MoonStar,
  Users,
  Settings,
  Bell,
  LogOut,
  LogIn,
  HelpCircle,
} from "lucide-react";

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
  user?: { name: string; avatarUrl?: string; loggedIn: boolean };
}

const HamburgerMenu = ({ isOpen, onClose, onNavigate, user }: HamburgerMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "spring", stiffness: 80, damping: 18 }}
          className="
            fixed top-0 left-0 h-full w-72 z-40
            backdrop-blur-lg bg-white/70 dark:bg-gray-900/40
            border-r border-white/30 dark:border-white/10
            shadow-xl flex flex-col
          "
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/20 dark:border-white/10">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              Menu
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/20 dark:hover:bg-white/10"
            >
              <X className="w-5 h-5 text-gray-800 dark:text-gray-200" />
            </button>
          </div>

          {/* User Section */}
          <div className="flex items-center gap-3 p-4 border-b border-white/20 dark:border-white/10">
            <img
              src={user?.avatarUrl || "https://via.placeholder.com/40"}
              alt="User Avatar"
              className="w-12 h-12 rounded-full border border-white/40 shadow-sm"
            />
            <div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
                {user?.name || "Guest User"}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                EEG Wellness Journey
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-3">
            <MenuItem
              icon={<HeartPulse className="w-5 h-5 text-pink-500" />}
              label="Body"
              onClick={() => onNavigate("/body")}
            />
            <MenuItem
              icon={<Brain className="w-5 h-5 text-indigo-500" />}
              label="Mind"
              onClick={() => onNavigate("/mind")}
            />
            <MenuItem
              icon={<Activity className="w-5 h-5 text-green-500" />}
              label="Activity"
              onClick={() => onNavigate("/activity")}
            />
            <MenuItem
              icon={<MoonStar className="w-5 h-5 text-purple-500" />}
              label="Sleep"
              onClick={() => onNavigate("/sleep")}
            />
            <MenuItem
              icon={<Users className="w-5 h-5 text-cyan-500" />}
              label="Providers"
              onClick={() => onNavigate("/provider")}
            />
            <MenuItem
              icon={<Bell className="w-5 h-5 text-yellow-500" />}
              label="Notifications"
              onClick={() => onNavigate("/notifications")}
            />
            <MenuItem
              icon={<Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />}
              label="Settings"
              onClick={() => onNavigate("/settings")}
            />
            <MenuItem
              icon={<HelpCircle className="w-5 h-5 text-blue-500" />}
              label="Help & Support"
              onClick={() => onNavigate("/help")}
            />
          </nav>

          {/* Footer Actions */}
          <div className="p-4 border-t border-white/20 dark:border-white/10">
            {user?.loggedIn ? (
              <MenuItem
                icon={<LogOut className="w-5 h-5 text-red-500" />}
                label="Log Out"
                onClick={() => onNavigate("/logout")}
              />
            ) : (
              <MenuItem
                icon={<LogIn className="w-5 h-5 text-green-500" />}
                label="Log In"
                onClick={() => onNavigate("/login")}
              />
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

const MenuItem = ({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) => (
  <motion.button
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className="
      w-full flex items-center gap-3 px-3 py-2 rounded-lg
      text-sm font-medium text-gray-700 dark:text-gray-200
      hover:bg-white/40 dark:hover:bg-white/10 transition-colors
    "
  >
    {icon}
    <span>{label}</span>
  </motion.button>
);

export default HamburgerMenu;
