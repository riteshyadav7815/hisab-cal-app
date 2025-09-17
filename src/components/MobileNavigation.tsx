"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, 
  Users, 
  Plus, 
  BarChart3, 
  Settings, 
  User, 
  LogOut, 
  ArrowLeftRight,
  Menu,
  X
} from "lucide-react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useProtectedAction } from "./ProtectedActionProvider";
import { useRouter } from "next/navigation";

interface MobileNavProps {
  onAddFriendClick?: () => void;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home, type: "link", protected: false },
  { name: "Add Friend", href: "/friends", icon: Users, type: "modal", modalType: "addFriend", protected: true },
  { name: "Add Expense", href: "/add-expense", icon: Plus, type: "link", protected: true },
  { name: "Money Transfer", href: "/transfer", icon: ArrowLeftRight, type: "link", protected: true },
  { name: "Reports", href: "/reports", icon: BarChart3, type: "link", protected: true },
  { name: "Management", href: "/management", icon: Settings, type: "link", protected: true },
  { name: "Settings", href: "/settings", icon: Settings, type: "link", protected: true },
];

export default function MobileNavigation({ onAddFriendClick }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { handleProtectedAction } = useProtectedAction();
  const router = useRouter();

  const handleItemClick = (item: typeof navigation[0]) => {
    if (item.type === "modal") {
      if (item.modalType === "addFriend" && onAddFriendClick) {
        if (item.protected) {
          handleProtectedAction(onAddFriendClick);
        } else {
          onAddFriendClick();
        }
      }
    } else if (item.type === "link") {
      if (item.protected) {
        handleProtectedAction(() => router.push(item.href));
      } else {
        router.push(item.href);
      }
    }
    setIsOpen(false); // Close menu after selection
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* Mobile menu button */}
      <div className="bg-white/10 backdrop-blur-lg border-t border-white/20 p-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-3 bg-gradient-to-r from-[#7B5CFF] to-[#9B7FFF] rounded-xl text-white shadow-lg shadow-purple-500/25"
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#7B5CFF] to-[#9B7FFF] rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg">Hisab</span>
          </div>
          
          <button
            onClick={() => signOut()}
            className="p-3 bg-red-500/20 rounded-xl text-red-400 hover:bg-red-500/30 transition-colors"
            aria-label="Sign out"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-full left-0 right-0 mb-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-t-2xl p-4"
          >
            <nav className="space-y-2 max-h-[60vh] overflow-y-auto">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                const IconComponent = item.icon;
                
                if (item.type === "modal") {
                  return (
                    <button
                      key={item.name}
                      onClick={() => handleItemClick(item)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-[#7B5CFF] to-[#9B7FFF] text-white shadow-lg shadow-purple-500/25"
                          : "text-gray-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <IconComponent className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium text-left">{item.name}</span>
                    </button>
                  );
                }
                
                return (
                  <button
                    key={item.name}
                    onClick={() => handleItemClick(item)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-[#7B5CFF] to-[#9B7FFF] text-white shadow-lg shadow-purple-500/25"
                        : "text-gray-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <IconComponent className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium text-left">{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}