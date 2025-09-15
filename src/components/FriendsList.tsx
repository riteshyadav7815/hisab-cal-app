"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Friend {
  id: string;
  name: string;
  avatar: string;
  balance: number;
  balanceType: string;
  lastTransaction: string;
  lastAmount: number;
}

export default function FriendsList() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const response = await fetch('/api/friends');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setFriends(data.data.map((friend: any) => ({
            id: friend.id,
            name: friend.name,
            avatar: friend.avatar || '👤',
            balance: 0,
            balanceType: 'settled',
            lastTransaction: 'No transactions yet',
            lastAmount: 0
          })));
        }
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
    >
      <h2 className="text-xl font-bold text-white mb-6">Friends & Balance</h2>
      
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-4 p-4 rounded-xl animate-pulse">
              <div className="w-12 h-12 bg-white/10 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-white/10 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : friends.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">👥</div>
          <p className="text-gray-400">No friends added yet</p>
          <p className="text-gray-500 text-sm">Add friends to start tracking expenses</p>
        </div>
      ) : (
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
      )}
    </motion.div>
  );
}
