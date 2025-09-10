"use client";
import { motion } from "framer-motion";

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  username?: string | null;
  image?: string | null;
}

interface HeaderProps {
  user: User;
  onMenuClick: () => void;
}

export default function Header({ user, onMenuClick }: HeaderProps) {
  return (
    <header className="bg-white/10 backdrop-blur-xl border-b border-white/20 p-4">
      <div className="flex items-center justify-between">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <span className="text-white text-xl">☰</span>
        </button>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>
        </div>

        {/* User Profile */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-white/10 transition-colors">
            <span className="text-white text-xl">🔔</span>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>

          {/* User Avatar */}
          <div className="flex items-center space-x-3">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name || user.username || "User"}
                className="w-8 h-8 rounded-full border-2 border-white/20"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                {(user.name || user.username || "U").charAt(0).toUpperCase()}
              </div>
            )}
            <div className="hidden md:block">
              <p className="text-white font-medium">
                {user.name || user.username}
              </p>
              <p className="text-gray-400 text-sm">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
