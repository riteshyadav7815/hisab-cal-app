"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import AppLayout from "./AppLayout";
import Header from "./Header";
import ExpenseList from "./ExpenseList";
import ExpenseFilters from "./ExpenseFilters";

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  username?: string | null;
  image?: string | null;
}

interface ExpensesContentProps {
  user: User;
}

export default function ExpensesContent({ user }: ExpensesContentProps) {
  const [activeFilter, setActiveFilter] = useState("Today");

  return (
    <AppLayout>
      <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 rounded-2xl p-6 h-full">
        {/* Background Effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        </div>

        <div className="relative">
          {/* Header */}
          <Header user={user} />
          
          {/* Expenses Content */}
          <div className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl mx-auto space-y-6"
            >
              {/* Header Section */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold text-white">Today&apos;s Expenses</h1>
                  <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 flex items-center space-x-2">
                    <span>+</span>
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Filters */}
              <ExpenseFilters 
                activeFilter={activeFilter} 
                onFilterChange={setActiveFilter} 
              />

              {/* Expense List */}
              <ExpenseList />

              {/* Monthly Summary */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-2">Monthly Total</h3>
                  <p className="text-gray-300">
                    You spent <span className="text-purple-400 font-bold">₹7,800</span> in September so far
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
