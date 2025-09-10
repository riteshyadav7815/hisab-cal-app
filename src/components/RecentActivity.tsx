"use client";
import { motion } from "framer-motion";

const activities = [
  {
    id: 1,
    type: "gave",
    amount: "₹200",
    friend: "Aman",
    date: "Sept 8",
    icon: "💸",
  },
  {
    id: 2,
    type: "spent",
    amount: "₹500",
    category: "Food",
    date: "Sept 7",
    icon: "🍕",
  },
  {
    id: 3,
    type: "took",
    amount: "₹100",
    friend: "Ravi",
    date: "Sept 6",
    icon: "💰",
  },
  {
    id: 4,
    type: "spent",
    amount: "₹120",
    category: "Travel",
    date: "Sept 5",
    icon: "🚗",
  },
  {
    id: 5,
    type: "gave",
    amount: "₹300",
    friend: "Priya",
    date: "Sept 4",
    icon: "💸",
  },
];

export default function RecentActivity() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Recent Activity</h2>
        <button className="text-purple-400 hover:text-purple-300 transition-colors">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-center space-x-4 p-4 rounded-xl hover:bg-white/5 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center">
              <span className="text-lg">{activity.icon}</span>
            </div>
            
            <div className="flex-1">
              <p className="text-white font-medium">
                {activity.type === "gave" && `You gave ${activity.amount} to ${activity.friend}`}
                {activity.type === "took" && `You took ${activity.amount} from ${activity.friend}`}
                {activity.type === "spent" && `Spent ${activity.amount} on ${activity.category}`}
              </p>
              <p className="text-gray-400 text-sm">{activity.date}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
