"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, BarChart3, CreditCard, Check, X, Send, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { refreshDashboard } from "./ExpenseOverview";
import { cachedFetch, apiCache } from "@/lib/api-cache";

interface Friend {
  id: string;
  name: string;
  avatar?: string;
  balance: number;
  lastActivity: string;
  email?: string;
}

interface Group {
  id: string;
  name: string;
  members: string[];
  totalExpenses: number;
  avatar: string;
}

interface SettlementSuggestion {
  id: string;
  description: string;
  amount: number;
  from: string;
  to: string;
}

export default function ManagementContent() {
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [groups] = useState<Group[]>([]); // Groups functionality can be added later
  const [settlementSuggestions] = useState<SettlementSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [settlingFriendId, setSettlingFriendId] = useState<string | null>(null);

  useEffect(() => {
    fetchFriends();
    
    // Listen for dashboard refresh events
    const handleRefresh = () => {
      console.log('🔄 Dashboard refresh event received - updating management data');
      apiCache.clear(); // Clear cache to get fresh data
      fetchFriends();
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('dashboardRefresh', handleRefresh);
      return () => {
        window.removeEventListener('dashboardRefresh', handleRefresh);
      };
    }
  }, []);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching friends for management...');
      
      // Use cached fetch for better performance
      const data = await cachedFetch('/api/friendships', {}, 30000); // Cache for 30 seconds
      
      if (data.success && data.data) {
        setFriends(data.data.map((friend: any) => ({
          id: friend.id,
          name: friend.name,
          avatar: friend.avatar || friend.name?.charAt(0)?.toUpperCase() || '👤',
          balance: friend.balance || 0,
          lastActivity: friend.lastTransactionAt 
            ? `Last transaction: ${new Date(friend.lastTransactionAt).toLocaleDateString()}`
            : 'No recent activity',
          email: friend.email
        })));
        console.log('✅ Friends loaded successfully:', data.data.length);
      }
    } catch (error) {
      console.error('❌ Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettleBalance = async (friendId: string) => {
    try {
      setSettlingFriendId(friendId);
      
      const friend = friends.find(f => f.id === friendId);
      if (!friend) {
        alert('Friend not found');
        return;
      }

      if (friend.balance === 0) {
        alert('No balance to settle');
        return;
      }

      const confirmMessage = friend.balance > 0 
        ? `Settle ₹${friend.balance} owed to you by ${friend.name}?`
        : `Settle ₹${Math.abs(friend.balance)} you owe to ${friend.name}?`;
      
      if (!confirm(confirmMessage)) {
        return;
      }

      const response = await fetch('/api/settlements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId, action: 'settle' })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Update the friend's balance locally
        setFriends(prev => prev.map(f => 
          f.id === friendId ? { 
            ...f, 
            balance: 0, 
            lastActivity: 'Balance settled - just now' 
          } : f
        ));
        
        alert(result.message || 'Balance settled successfully!');
        
        // Refresh dashboard data
        refreshDashboard();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Settlement error:', error);
      alert('Failed to settle balance. Please try again.');
    } finally {
      setSettlingFriendId(null);
    }
  };

  const handleAutoSettle = () => {
    alert('Auto-settlement optimization coming soon!');
  };

  const handleSendReminder = (friendId: string) => {
    const friend = friends.find(f => f.id === friendId);
    if (friend) {
      alert(`Reminder sent to ${friend.name}!`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#121020] via-[#1E1B34] to-[#1A1735] p-6">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Header Section */}
          <div className="bg-[#2B2746]/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
                  <Users className="w-8 h-8 text-purple-400" />
                  <span>Management</span>
                </h1>
                <p className="text-gray-400 mt-2">Manage balances, groups, and settlements</p>
              </div>
              <button 
                onClick={() => router.push('/friends')}
                className="px-6 py-3 bg-gradient-to-r from-[#7B5CFF] to-[#9B7FFF] text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 flex items-center space-x-2"
              >
                <Users className="w-4 h-4" />
                <span>Add Friend</span>
              </button>
            </div>
          </div>

          {/* Friends List Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Friends List */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-[#2B2746]/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-400" />
                <span>Friend List</span>
              </h2>
              <div className="space-y-4">
                {loading ? (
                  // Loading skeleton
                  <>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white/5 rounded-xl p-4 animate-pulse">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-white/10 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-white/10 rounded w-1/2 mb-2"></div>
                            <div className="h-3 bg-white/10 rounded w-1/3"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : friends.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">👥</div>
                    <p className="text-gray-400">No friends added yet</p>
                    <p className="text-gray-500 text-sm">Add friends to start tracking balances</p>
                  </div>
                ) : (
                  friends.map((friend) => (
                  <div key={friend.id} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-lg">
                          {friend.avatar}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{friend.name}</h3>
                          <p className="text-sm text-gray-400">{friend.lastActivity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-xl mb-1 ${
                          friend.balance > 0 ? 'text-green-400' : friend.balance < 0 ? 'text-red-400' : 'text-gray-400'
                        }`}>
                          {friend.balance > 0 ? '+' : ''}₹{Math.abs(friend.balance).toFixed(2)}
                        </p>
                        <p className={`text-sm font-medium ${
                          friend.balance > 0 ? 'text-green-300' : friend.balance < 0 ? 'text-red-300' : 'text-gray-500'
                        }`}>
                          {friend.balance > 0 ? 'Owes you' : friend.balance < 0 ? 'You owe' : 'Settled'}
                        </p>
                        <div className="flex space-x-2 mt-2">
                          {friend.balance !== 0 && (
                            <button
                              onClick={() => handleSettleBalance(friend.id)}
                              disabled={settlingFriendId === friend.id}
                              className={`px-3 py-1 text-white text-xs rounded-lg transition-all duration-200 ${
                                settlingFriendId === friend.id
                                  ? 'bg-gray-500 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-[#7B5CFF] to-[#9B7FFF] hover:shadow-lg'
                              }`}
                            >
                              {settlingFriendId === friend.id ? 'Settling...' : 'Settle'}
                            </button>
                          )}
                          <button
                            onClick={() => handleSendReminder(friend.id)}
                            className="px-3 py-1 bg-white/10 text-white text-xs rounded-lg hover:bg-white/20 transition-all duration-200"
                          >
                            <Send className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Groups Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-[#2B2746]/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                <span>Groups</span>
              </h2>
              <div className="space-y-4">
                {groups.map((group) => (
                  <div key={group.id} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white text-lg">
                          {group.avatar}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{group.name}</h3>
                          <p className="text-sm text-gray-400">{group.members.join(', ')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-cyan-400">₹{group.totalExpenses}</p>
                        <button className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-lg hover:bg-cyan-500/30 transition-all duration-200 mt-1">
                          Manage
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  className="w-full py-3 border-2 border-dashed border-gray-600 rounded-xl text-gray-400 hover:border-cyan-400 hover:text-cyan-400 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <span>+</span>
                  <span>Create New Group</span>
                </button>
              </div>
            </motion.div>
          </div>

          {/* Settlement Suggestions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-[#2B2746]/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
          >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-green-400" />
              <span>Settlement Suggestions</span>
            </h2>
            <div className="space-y-4">
              {settlementSuggestions.map((suggestion) => (
                <div key={suggestion.id} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-white">{suggestion.description}</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Amount: ₹{suggestion.amount} • {suggestion.from} → {suggestion.to}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={handleAutoSettle}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center space-x-1"
                      >
                        <Check className="w-4 h-4" />
                        <span>Apply</span>
                      </button>
                      <button className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
