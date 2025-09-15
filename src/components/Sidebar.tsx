"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Home, Users, Plus, BarChart3, Settings as SettingsIcon, User, LogOut, ArrowLeftRight } from "lucide-react";

interface SidebarProps {
  onAddFriendClick?: () => void;
  onManagementClick?: () => void;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home, type: "link" },
  { name: "Add Friend", href: "/friends", icon: Users, type: "modal", modalType: "addFriend" },
  { name: "Add Expense", href: "/add-expense", icon: Plus, type: "link" },
  { name: "Money Transfer", href: "/transfer", icon: ArrowLeftRight, type: "link" },
  { name: "Reports", href: "/reports", icon: BarChart3, type: "link" },
  { name: "Management", href: "/management", icon: SettingsIcon, type: "modal", modalType: "management" },
  { name: "Settings", href: "/settings", icon: SettingsIcon, type: "link" },
];

export default function Sidebar({ onAddFriendClick, onManagementClick }: SidebarProps) {
  const pathname = usePathname();

  const handleItemClick = (item: typeof navigation[0]) => {
    if (item.type === "modal") {
      if (item.modalType === "addFriend" && onAddFriendClick) {
        onAddFriendClick();
      } else if (item.modalType === "management" && onManagementClick) {
        onManagementClick();
      }
    }
    // For links, the Link component will handle navigation
  };

  return (
    <aside 
      data-testid="sidebar" 
      className="w-64 bg-white/5 backdrop-blur-lg rounded-2xl p-4 border border-white/10 flex flex-col"
    >
      {/* Logo/Profile Avatar */}
      <div className="flex items-center space-x-3 p-4 border-b border-white/10">
        <div className="w-10 h-10 bg-gradient-to-br from-[#7B5CFF] to-[#9B7FFF] rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-bold text-white">Hisab</h2>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const IconComponent = item.icon;
          
          if (item.type === "modal") {
            return (
              <button
                key={item.name}
                onClick={() => handleItemClick(item)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-gradient-to-r from-[#7B5CFF] to-[#9B7FFF] text-white shadow-lg shadow-purple-500/25"
                    : "text-gray-300 hover:bg-white/10 hover:text-white hover:shadow-lg hover:shadow-purple-500/10"
                }`}
              >
                <IconComponent className={`w-5 h-5 transition-all duration-200 ${
                  isActive ? 'text-white' : 'text-gray-400 group-hover:text-purple-400'
                }`} />
                <span className="font-medium">{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-2 h-2 bg-white rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          }
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-gradient-to-r from-[#7B5CFF] to-[#9B7FFF] text-white shadow-lg shadow-purple-500/25"
                  : "text-gray-300 hover:bg-white/10 hover:text-white hover:shadow-lg hover:shadow-purple-500/10"
              }`}
            >
              <IconComponent className={`w-5 h-5 transition-all duration-200 ${
                isActive ? 'text-white' : 'text-gray-400 group-hover:text-purple-400'
              }`} />
              <span className="font-medium">{item.name}</span>
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto w-2 h-2 bg-white rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={() => signOut()}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-400 transition-colors" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
