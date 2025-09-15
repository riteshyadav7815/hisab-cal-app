"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Insight {
  id: string;
  text: string;
  icon: string;
  type: 'positive' | 'negative' | 'neutral';
  action?: string;
}

export default function QuickInsights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await fetch('/api/insights');
        if (response.ok) {
          const data = await response.json();
          setInsights(data.insights);
        } else {
          // Fallback insights if API is not available
          setInsights([
            {
              id: '1',
              text: 'You spent 20% less than last month',
              icon: '🎉',
              type: 'positive'
            },
            {
              id: '2',
              text: 'Food is your top expense category',
              icon: '🍕',
              type: 'neutral'
            },
            {
              id: '3',
              text: 'You have 3 pending settlements',
              icon: '⏰',
              type: 'negative',
              action: 'Settle now'
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching insights:', error);
        // Fallback insights
        setInsights([
          {
            id: '1',
            text: 'Great job! Your expenses are well managed',
            icon: '✨',
            type: 'positive'
          },
          {
            id: '2',
            text: 'Add your first expense to get started',
            icon: '📝',
            type: 'neutral',
            action: 'Add expense'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="animate-pulse">
          <div className="h-6 bg-white/10 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-white/5 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
          <span className="text-lg">💡</span>
        </div>
        <h3 className="text-xl font-semibold text-white">Quick Insights</h3>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 group"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{insight.icon}</span>
              <span className={`text-sm font-medium ${
                insight.type === 'positive' ? 'text-green-300' :
                insight.type === 'negative' ? 'text-red-300' :
                'text-gray-300'
              }`}>
                {insight.text}
              </span>
            </div>
            
            {insight.action && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1 text-xs font-medium text-white bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg hover:from-purple-600 hover:to-cyan-600 transition-all duration-300"
              >
                {insight.action}
              </motion.button>
            )}
          </motion.div>
        ))}
      </div>

      {/* Add floating animation */}
      <motion.div
        className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  );
}