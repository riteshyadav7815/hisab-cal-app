"use client";
import { motion } from "framer-motion";

const stats = [
  {
    title: "Total Users",
    value: "2,543",
    change: "+12%",
    changeType: "positive",
    icon: "👥",
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Revenue",
    value: "$45,231",
    change: "+8.2%",
    changeType: "positive",
    icon: "💰",
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "Orders",
    value: "1,234",
    change: "-2.1%",
    changeType: "negative",
    icon: "📦",
    color: "from-orange-500 to-red-500",
  },
  {
    title: "Conversion",
    value: "3.2%",
    change: "+0.5%",
    changeType: "positive",
    icon: "📈",
    color: "from-purple-500 to-pink-500",
  },
];

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <span
              className={`text-sm font-medium ${
                stat.changeType === "positive" ? "text-green-400" : "text-red-400"
              }`}
            >
              {stat.change}
            </span>
          </div>
          
          <div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">
              {stat.title}
            </h3>
            <p className="text-2xl font-bold text-white">
              {stat.value}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
