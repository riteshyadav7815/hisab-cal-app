"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "./AppLayout";
import Header from "./Header";
import { Users, BarChart3, CreditCard, Check, X, Send, ArrowDownCircle, ArrowUpCircle, Calculator, User, DollarSign, MessageSquare, Shield, FileText, Settings } from "lucide-react";
import { refreshDashboard } from "./ExpenseOverview";
import { cachedFetch, apiCache } from "@/lib/api-cache";

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  username?: string | null;
  image?: string | null;
}

interface Friend {
  id: string;
  name: string;
  avatar?: string;
  balance: number;
  lastActivity: string;
  email?: string;
}

interface Transaction {
  id: string;
  amount: number;
  type: 'GAVE' | 'RECEIVED';
  description: string;
  createdAt: string;
  friendName: string;
}

interface SettingsData {
  categories: string[];
  preferences: {
    currency: string;
    dateFormat: string;
    notifications: boolean;
  };
  stats: {
    totalExpenses: number;
    totalFriends: number;
    thisMonth: number;
  };
}

interface ManagementContentModernProps {
  user: User;
}

export default function ManagementContentModern({ user }: ManagementContentModernProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'friends' | 'categories' | 'preferences' | 'security' | 'transactions'>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [settingsData, setSettingsData] = useState<SettingsData>({
    categories: ['Food', 'Travel', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Education', 'Other'],
    preferences: {
      currency: 'INR',
      dateFormat: 'DD/MM/YYYY',
      notifications: true,
    },
    stats: {
      totalExpenses: 0,
      totalFriends: 0,
      thisMonth: 0,
    }
  });
  const [newCategory, setNewCategory] = useState('');
  const [settlingFriendId, setSettlingFriendId] = useState<string | null>(null);

  useEffect(() => {
    fetchFriends();
    fetchTransactions();
  }, []);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const data = await cachedFetch('/api/friendships', {
        headers: {
          'Cache-Control': 'max-age=30',
        },
      }, 30000); // Cache for 30 seconds
      
      if (data.success && data.data) {
        setFriends(data.data.map((friend: any) => ({
          id: friend.id,
          name: friend.name,
          balance: friend.balance || 0,
          lastActivity: friend.lastTransactionAt
            ? new Date(friend.lastTransactionAt).toLocaleDateString()
            : 'No recent activity',
          avatar: friend.avatar || friend.name?.charAt(0)?.toUpperCase() || 'U'
        })));
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setTransactionsLoading(true);
      const response = await fetch('/api/transactions/recent');
      const data = await response.json();
      
      if (data.success) {
        setTransactions(data.data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setTransactionsLoading(false);
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

  const handleAddCategory = () => {
    if (newCategory.trim() && !settingsData.categories.includes(newCategory.trim())) {
      setSettingsData(prev => ({
        ...prev,
        categories: [...prev.categories, newCategory.trim()]
      }));
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (category: string) => {
    setSettingsData(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c !== category)
    }));
  };

  const handlePreferenceChange = (key: keyof SettingsData['preferences'], value: any) => {
    setSettingsData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }));
  };

  return (
    <AppLayout>
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 h-full">
        {/* Header */}
        <Header user={user} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 mt-6"
        >
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-[#2B2746]/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
                  <Users className="w-8 h-8 text-purple-400" />
                  <span>Management</span>
                </h1>
                <p className="text-gray-400 mt-2">Manage balances, groups, and settlements</p>
              </div>
            </div>
          </motion.div>

          {/* Tab Navigation */}
          <div className="bg-[#2B2746]/60 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
            <div className="flex space-x-1 overflow-x-auto">
              <button
                onClick={() => setActiveTab('friends')}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-200 ${
                  activeTab === 'friends'
                    ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Friends
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-200 ${
                  activeTab === 'transactions'
                    ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-4 h-4 inline mr-2" />
                Transactions
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-200 ${
                  activeTab === 'categories'
                    ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Categories
              </button>
              <button
                onClick={() => setActiveTab('preferences')}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-200 ${
                  activeTab === 'preferences'
                    ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4 inline mr-2" />
                Preferences
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-200 ${
                  activeTab === 'security'
                    ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Shield className="w-4 h-4 inline mr-2" />
                Security
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-[#2B2746]/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            {/* Friends Tab */}
            {activeTab === 'friends' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white mb-4">Manage Friends</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Friends List */}
                  <div className="bg-white/5 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Users className="w-5 h-5 mr-2 text-purple-400" />
                      Friend List
                    </h3>
                    
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {loading ? (
                        <div className="text-gray-400 text-center py-4">Loading friends...</div>
                      ) : friends.length === 0 ? (
                        <div className="text-gray-400 text-center py-4">
                          No friends found. Add friends first!
                        </div>
                      ) : (
                        friends.map((friend) => (
                          <div key={friend.id} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center text-white">
                                  {friend.avatar}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-white">{friend.name}</h3>
                                  <p className="text-sm text-gray-400">{friend.lastActivity}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={`font-bold ${
                                  friend.balance > 0 ? 'text-green-400' : friend.balance < 0 ? 'text-red-400' : 'text-gray-400'
                                }`}>
                                  {friend.balance > 0 ? '+' : ''}₹{Math.abs(friend.balance)}
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
                  </div>

                  {/* Settlement Actions */}
                  <div className="bg-white/5 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-cyan-400" />
                      Settlement Actions
                    </h3>
                    
                    <div className="space-y-4">
                      <button
                        onClick={handleAutoSettle}
                        className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg hover:shadow-green-500/25 transition-all duration-200 flex items-center justify-center space-x-2"
                      >
                        <Check className="w-5 h-5" />
                        <span>Auto-Settle Balances</span>
                      </button>
                      
                      <div className="border-t border-white/20 pt-4">
                        <h4 className="text-white font-medium mb-3">Manual Settlement</h4>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <User className="w-5 h-5 text-gray-400" />
                            <select className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
                              <option>Select friend</option>
                              {friends.map(friend => (
                                <option key={friend.id} value={friend.id}>{friend.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex items-center space-x-3">
                            <DollarSign className="w-5 h-5 text-gray-400" />
                            <input
                              type="number"
                              placeholder="Amount"
                              className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                            />
                          </div>
                          <button className="w-full py-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-200">
                            Settle Balance
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white mb-4">Recent Transactions</h2>
                
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {transactionsLoading ? (
                    <div className="text-gray-400 text-center py-4">Loading transactions...</div>
                  ) : transactions.length === 0 ? (
                    <div className="text-gray-400 text-center py-4">
                      No transactions found.
                    </div>
                  ) : (
                    transactions.map((transaction) => (
                      <div key={transaction.id} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center text-white">
                              {transaction.friendName.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-white">{transaction.friendName}</h3>
                              <p className="text-sm text-gray-400">{transaction.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold text-lg ${
                              transaction.type === 'GAVE' ? 'text-red-400' : 'text-green-400'
                            }`}>
                              {transaction.type === 'GAVE' ? '-' : '+'}₹{transaction.amount}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Categories Tab */}
            {activeTab === 'categories' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white mb-4">Expense Categories</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/5 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Add New Category</h3>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Category name"
                        className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                      />
                      <button
                        onClick={handleAddCategory}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Existing Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {settingsData.categories.map((category) => (
                        <div key={category} className="flex items-center bg-white/10 rounded-lg px-3 py-1">
                          <span className="text-white">{category}</span>
                          <button
                            onClick={() => handleRemoveCategory(category)}
                            className="ml-2 text-gray-400 hover:text-red-400"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white mb-4">Preferences</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/5 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Display Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Currency</label>
                        <select
                          value={settingsData.preferences.currency}
                          onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                        >
                          <option value="INR">Indian Rupee (₹)</option>
                          <option value="USD">US Dollar ($)</option>
                          <option value="EUR">Euro (€)</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Date Format</label>
                        <select
                          value={settingsData.preferences.dateFormat}
                          onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                        >
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Notifications</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-white">Enable Notifications</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settingsData.preferences.notifications}
                          onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white mb-4">Security Settings</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/5 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Authentication</h3>
                    <div className="space-y-4">
                      <button className="w-full py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all duration-200">
                        Change Password
                      </button>
                      <button className="w-full py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all duration-200">
                        Enable Two-Factor Authentication
                      </button>
                      <button className="w-full py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all duration-200">
                        View Login Activity
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Data Management</h3>
                    <div className="space-y-4">
                      <button className="w-full py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all duration-200">
                        Export Data
                      </button>
                      <button className="w-full py-3 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition-all duration-200">
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}