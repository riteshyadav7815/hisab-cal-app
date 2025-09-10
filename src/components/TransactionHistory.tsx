"use client";
import { motion } from "framer-motion";

const transactions = [
  {
    id: 1,
    date: "5 Sept",
    description: "You gave ₹300",
    type: "gave",
    amount: 300,
    friend: "Priya",
  },
  {
    id: 2,
    date: "3 Sept",
    description: "You took ₹100",
    type: "took",
    amount: 100,
    friend: "Ravi",
  },
  {
    id: 3,
    date: "2 Sept",
    description: "Settled up",
    type: "settled",
    amount: 0,
    friend: "Sam",
  },
  {
    id: 4,
    date: "1 Sept",
    description: "You gave ₹150",
    type: "gave",
    amount: 150,
    friend: "Aman",
  },
];

export default function TransactionHistory() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
    >
      <h2 className="text-xl font-bold text-white mb-6">Transaction History</h2>
      
      <div className="space-y-3">
        {transactions.map((transaction, index) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">{transaction.date}</p>
                <p className="text-gray-400 text-sm">{transaction.description}</p>
              </div>
              
              <div className="text-right">
                {transaction.type === "gave" && (
                  <p className="text-red-400 font-bold">-₹{transaction.amount}</p>
                )}
                {transaction.type === "took" && (
                  <p className="text-green-400 font-bold">+₹{transaction.amount}</p>
                )}
                {transaction.type === "settled" && (
                  <p className="text-gray-400 font-bold">Settled</p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
