"use client";
import { motion } from "framer-motion";
import { useEffect, useState, useCallback } from "react";

interface Activity {
  id: string;
  type: "gave" | "received" | "spent";
  amount: number;
  friend?: string;
  category?: string;
  date: string;
  icon: string;
  description: string;
}

// Listen for dashboard refresh events
const dashboardRefreshEvent = new EventTarget();

export default function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecentActivity = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard');
      if (response.ok) {
        const data = await response.json();
        setActivities(data.data.activities || []);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecentActivity();

    // Listen for refresh events from ExpenseOverview
    const handleRefresh = () => {
      fetchRecentActivity();
    };

    // Use the same event listener as ExpenseOverview
    if (typeof window !== 'undefined') {
      window.addEventListener('dashboardRefresh', handleRefresh);
      return () => {
        window.removeEventListener('dashboardRefresh', handleRefresh);
      };
    }
  }, [fetchRecentActivity]);


  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/20"
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-white">Recent Activity</h2>
        </div>
        <div className="space-y-3 sm:space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-xl animate-pulse">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 rounded-full"></div>
              <div className="flex-1">
                <div className="h-3 sm:h-4 bg-white/10 rounded w-3/4 mb-2"></div>
                <div className="h-2 sm:h-3 bg-white/10 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (activities.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/20"
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-white">Recent Activity</h2>
        </div>
        <div className="text-center py-6 sm:py-8">
          <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📊</div>
          <p className="text-gray-400 text-sm sm:text-base">No recent activity</p>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">Start adding expenses or transactions to see them here</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/20"
    >
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-white">Recent Activity</h2>
      </div>
      
      <div className="space-y-3 sm:space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="p-3 sm:p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 border border-white/10"
          >
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Activity Icon */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-lg sm:text-xl">
                {activity.icon}
              </div>
              
              {/* Activity Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <h3 className="text-white font-semibold text-sm sm:text-base truncate">{activity.description}</h3>
                    <p className="text-gray-400 text-xs sm:text-sm">{new Date(activity.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right ml-2">
                    <p className={`font-bold text-sm sm:text-base ${
                      activity.type === 'spent' ? 'text-red-400' :
                      activity.type === 'gave' ? 'text-orange-400' :
                      'text-green-400'
                    }`}>
                      {activity.type === 'spent' ? '-' : activity.type === 'gave' ? '-' : '+'}₹{activity.amount}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{activity.type}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}