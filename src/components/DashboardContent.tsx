"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import ExpenseOverview from "./ExpenseOverview";
import RecentActivity from "./RecentActivity";
import QuickActions from "./QuickActions";

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  username?: string | null;
  image?: string | null;
}

interface DashboardContentProps {
  user: User;
}

export default function DashboardContent({ user }: DashboardContentProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
          
          {/* Dashboard Content */}
          <main className="flex-1 p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Welcome Section */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name || user.username || "User"}
                        className="w-12 h-12 rounded-full border-2 border-white/20"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                        {(user.name || user.username || "U").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h1 className="text-2xl font-bold text-white">
                        Hi, {user.name || user.username}! 👋
                      </h1>
                      <p className="text-gray-300">
                        {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <button className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                    <span className="text-white text-xl">⚙️</span>
                  </button>
                </div>
              </div>

              {/* Expense Summary Cards */}
              <ExpenseOverview />

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <div className="lg:col-span-2">
                  <RecentActivity />
                </div>

                {/* Quick Actions */}
                <div className="lg:col-span-1">
                  <QuickActions />
                </div>
              </div>
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}
