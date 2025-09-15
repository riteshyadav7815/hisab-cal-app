"use client";
import { motion } from "framer-motion";

const actions = [
  {
    title: "Add Friend",
    description: "Add a new friend to track",
    icon: "👥",
    color: "from-blue-500 to-cyan-500",
    href: "/friends",
  },
  {
    title: "Add Expense",
    description: "Record a new expense",
    icon: "💰",
    color: "from-green-500 to-emerald-500",
    href: "/add-expense",
  },
  {
    title: "Money Transfer",
    description: "Give or receive money",
    icon: "💸",
    color: "from-purple-500 to-pink-500",
    href: "/transfer",
  },
  {
    title: "Reports",
    description: "View expense reports",
    icon: "📊",
    color: "from-orange-500 to-red-500",
    href: "/reports",
  },
];

export default function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
    >
      <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
      
      <div className="space-y-4">
        {actions.map((action, index) => (
          <motion.button
            key={action.title}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 text-left group"
            onClick={() => window.location.href = action.href}
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${action.color}`}>
                <span className="text-lg">{action.icon}</span>
              </div>
              
              <div className="flex-1">
                <h3 className="text-white font-medium group-hover:text-purple-300 transition-colors">
                  {action.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {action.description}
                </p>
              </div>
              
              <span className="text-gray-400 group-hover:text-white transition-colors">
                →
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}