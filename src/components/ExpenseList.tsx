"use client";
import { motion } from "framer-motion";

interface ExpenseListProps {
  filter: string;
}

const expenses = [
  {
    id: 1,
    title: "Food - Pizza Night",
    amount: 500,
    category: "Food",
    note: "Dinner with Sam",
    date: "Sept 8",
    photo: "🍕",
  },
  {
    id: 2,
    title: "Travel - Uber Ride",
    amount: 120,
    category: "Travel",
    note: "To College",
    date: "Sept 8",
    photo: "🚗",
  },
  {
    id: 3,
    title: "Shopping - T-Shirt",
    amount: 700,
    category: "Shopping",
    note: "Myntra Sale",
    date: "Sept 7",
    photo: "👕",
  },
  {
    id: 4,
    title: "Entertainment - Movie",
    amount: 300,
    category: "Entertainment",
    note: "Spider-Man with friends",
    date: "Sept 6",
    photo: "🎬",
  },
  {
    id: 5,
    title: "Health - Medicine",
    amount: 150,
    category: "Health",
    note: "Cold medicine",
    date: "Sept 5",
    photo: "💊",
  },
];

export default function ExpenseList({ filter }: ExpenseListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
    >
      <h2 className="text-xl font-bold text-white mb-6">Expenses</h2>
      
      <div className="space-y-4">
        {expenses.map((expense, index) => (
          <motion.div
            key={expense.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 border border-white/10"
          >
            <div className="flex items-center space-x-4">
              {/* Expense Photo */}
              <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-2xl">
                {expense.photo}
              </div>
              
              {/* Expense Info */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold text-lg">{expense.title}</h3>
                    <p className="text-gray-400 text-sm">{expense.note}</p>
                    <p className="text-gray-500 text-xs">({expense.date})</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-white font-bold text-xl">₹{expense.amount}</p>
                    <p className="text-gray-400 text-sm">{expense.category}</p>
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
