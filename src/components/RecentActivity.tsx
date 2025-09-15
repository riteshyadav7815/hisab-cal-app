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
        className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Recent Activity</h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-4 p-4 rounded-xl animate-pulse">
              <div className="w-10 h-10 bg-white/10 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-white/10 rounded w-1/4"></div>
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
        className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Recent Activity</h2>
        </div>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-gray-400">No recent activity</p>
          <p className="text-gray-500 text-sm">Start adding expenses or transactions to see them here</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Recent Activity</h2>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 border border-white/10"
          >
            <div className="flex items-center space-x-4">
              {/* Activity Icon */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-xl">
                {activity.icon}
              </div>
              
              {/* Activity Info */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold text-sm">{activity.description}</h3>
                    <p className="text-gray-400 text-xs">{new Date(activity.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm ${
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
