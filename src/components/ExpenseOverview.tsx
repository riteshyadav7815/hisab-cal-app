"use client";
import { motion } from "framer-motion";

const expenseData = [
  {
    title: "Total Expenses",
    value: "₹4,500",
    icon: "💰",
    color: "from-red-500 to-pink-500",
    description: "This month",
  },
  {
    title: "Pending Balance",
    value: "+₹2,300",
    icon: "📊",
    color: "from-green-500 to-emerald-500",
    description: "to take",
  },
];

export default function ExpenseOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {expenseData.map((expense, index) => (
        <motion.div
          key={expense.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-r ${expense.color}`}>
              <span className="text-2xl">{expense.icon}</span>
            </div>
            <span className="text-gray-400 text-sm">
              {expense.description}
            </span>
          </div>
          
          <div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">
              {expense.title}
            </h3>
            <p className="text-3xl font-bold text-white">
              {expense.value}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
