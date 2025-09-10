"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import FriendsList from "./FriendsList";
import TransactionHistory from "./TransactionHistory";
import MiniCalculator from "./MiniCalculator";

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  username?: string | null;
  image?: string | null;
}

interface ManagementContentProps {
  user: User;
}

export default function ManagementContent({ user }: ManagementContentProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      <div className="relative flex">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <Header 
            user={user} 
            onMenuClick={() => setSidebarOpen(true)}
          />
          
          {/* Management Content */}
          <main className="flex-1 p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-6xl mx-auto space-y-6"
            >
              {/* Header Section */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold text-white">Friends & Balance</h1>
                  <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 flex items-center space-x-2">
                    <span>+</span>
                    <span>Add Friend</span>
                  </button>
                </div>
              </div>

              {/* Main Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Friends List */}
                <div className="lg:col-span-2">
                  <FriendsList />
                </div>

                {/* Transaction History */}
                <div className="lg:col-span-1">
                  <TransactionHistory />
                </div>
              </div>

              {/* Mini Calculator */}
              <div className="flex justify-center">
                <button
                  onClick={() => setShowCalculator(!showCalculator)}
                  className="px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-200 flex items-center space-x-2"
                >
                  <span>🧮</span>
                  <span>{showCalculator ? "Hide" : "Show"} Calculator</span>
                </button>
              </div>

              {/* Calculator Widget */}
              {showCalculator && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="flex justify-center"
                >
                  <MiniCalculator />
                </motion.div>
              )}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}
