"use client";
import { motion } from "framer-motion";

const friends = [
  {
    id: 1,
    name: "Aman",
    avatar: "👨‍💼",
    balance: 300,
    balanceType: "owed", // they owe you
    lastTransaction: "You gave ₹200 on 8 Sept",
    lastAmount: 200,
  },
  {
    id: 2,
    name: "Ravi",
    avatar: "👨‍🎓",
    balance: 100,
    balanceType: "owe", // you owe them
    lastTransaction: "You took ₹100 on 6 Sept",
    lastAmount: 100,
  },
  {
    id: 3,
    name: "Priya",
    avatar: "👩‍💻",
    balance: 500,
    balanceType: "owed",
    lastTransaction: "You gave ₹300 on 4 Sept",
    lastAmount: 300,
  },
  {
    id: 4,
    name: "Sam",
    avatar: "👨‍🍳",
    balance: 0,
    balanceType: "settled",
    lastTransaction: "Settled up on 2 Sept",
    lastAmount: 0,
  },
];

export default function FriendsList() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
    >
      <h2 className="text-xl font-bold text-white mb-6">Friends & Balance</h2>
      
      <div className="space-y-4">
        {friends.map((friend, index) => (
          <motion.div
            key={friend.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 border border-white/10"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Friend Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-2xl">
                  {friend.avatar}
                </div>
                
                {/* Friend Info */}
                <div>
                  <h3 className="text-white font-semibold text-lg">{friend.name}</h3>
                  <p className="text-gray-400 text-sm">{friend.lastTransaction}</p>
                </div>
              </div>
              
              {/* Balance */}
              <div className="text-right">
                {friend.balanceType === "owed" && (
                  <p className="text-green-400 font-bold text-lg">
                    +₹{friend.balance} owed
                  </p>
                )}
                {friend.balanceType === "owe" && (
                  <p className="text-red-400 font-bold text-lg">
                    -₹{friend.balance} owed
                  </p>
                )}
                {friend.balanceType === "settled" && (
                  <p className="text-gray-400 font-bold text-lg">
                    Settled up
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
