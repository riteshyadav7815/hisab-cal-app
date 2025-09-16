"use client";
import { motion } from "framer-motion";
import { Suspense, memo } from "react";
import AppLayout from "./AppLayout";
import Header from "./Header";
import ExpenseOverview from "./ExpenseOverview";
import RecentActivity from "./RecentActivity";
import DashboardCharts from "./DashboardCharts";

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  username?: string | null;
  image?: string | null;
  userNumber?: number | null;
}

interface DashboardContentProps {
  user: User;
}

export default memo(function DashboardContent({ user }: DashboardContentProps) {
  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 md:p-6 border border-white/10 h-full"
      >
        {/* Header */}
        <Header user={user} />

        <div className="space-y-6 mt-6">
          {/* Expense Summary Cards */}
          <Suspense fallback={<div className="h-32 bg-white/5 rounded-xl animate-pulse" />}>
            <ExpenseOverview />
          </Suspense>

          {/* Charts Section */}
          <Suspense fallback={<div className="h-64 bg-white/5 rounded-xl animate-pulse" />}>
            <DashboardCharts />
          </Suspense>

          {/* Recent Activity */}
          <Suspense fallback={<div className="h-96 bg-white/5 rounded-xl animate-pulse" />}>
            <RecentActivity />
          </Suspense>
        </div>
      </motion.div>
    </AppLayout>
  );
});