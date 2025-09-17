"use client";
import { motion } from "framer-motion";
import { Suspense, memo, useMemo } from "react";
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
  user?: User;
}

const MemoizedHeader = memo(Header);
const MemoizedExpenseOverview = memo(ExpenseOverview);
const MemoizedDashboardCharts = memo(DashboardCharts);
const MemoizedRecentActivity = memo(RecentActivity);

export default memo(function DashboardContent({ user }: DashboardContentProps) {
  // Memoize user data to prevent unnecessary re-renders
  const memoizedUser = useMemo(() => user, [user]);
  
  // Memoize layout components
  const layoutComponents = useMemo(() => ({
    appLayout: (
      <AppLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 md:p-6 border border-white/10 h-full"
        >
          {/* Header */}
          {memoizedUser && <MemoizedHeader user={memoizedUser} />}

          <div className="space-y-6 mt-6">
            {/* Expense Summary Cards */}
            <Suspense fallback={<div className="h-32 bg-white/5 rounded-xl animate-pulse" />}>
              <MemoizedExpenseOverview />
            </Suspense>

            {/* Charts Section */}
            <Suspense fallback={<div className="h-64 bg-white/5 rounded-xl animate-pulse" />}>
              <MemoizedDashboardCharts />
            </Suspense>

            {/* Recent Activity */}
            <Suspense fallback={<div className="h-96 bg-white/5 rounded-xl animate-pulse" />}>
              <MemoizedRecentActivity />
            </Suspense>
          </div>
        </motion.div>
      </AppLayout>
    )
  }), [memoizedUser]);

  return layoutComponents.appLayout;
});