"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "./AppLayout";
import Header from "./Header";
import dynamic from "next/dynamic";
import { refreshDashboard } from "./ExpenseOverview";
import { cachedFetch, apiCache } from "@/lib/api-cache";
import { runInWorker } from "@/lib/web-worker-manager";

// Dynamically import icons only when needed to reduce bundle size
const Users = dynamic(() => import("lucide-react").then((mod) => mod.Users), { ssr: false });
const BarChart3 = dynamic(() => import("lucide-react").then((mod) => mod.BarChart3), { ssr: false });
const CreditCard = dynamic(() => import("lucide-react").then((mod) => mod.CreditCard), { ssr: false });
const Check = dynamic(() => import("lucide-react").then((mod) => mod.Check), { ssr: false });
const X = dynamic(() => import("lucide-react").then((mod) => mod.X), { ssr: false });
const Send = dynamic(() => import("lucide-react").then((mod) => mod.Send), { ssr: false });
const ArrowDownCircle = dynamic(() => import("lucide-react").then((mod) => mod.ArrowDownCircle), { ssr: false });
const ArrowUpCircle = dynamic(() => import("lucide-react").then((mod) => mod.ArrowUpCircle), { ssr: false });
const Calculator = dynamic(() => import("lucide-react").then((mod) => mod.Calculator), { ssr: false });
const User = dynamic(() => import("lucide-react").then((mod) => mod.User), { ssr: false });
const DollarSign = dynamic(() => import("lucide-react").then((mod) => mod.DollarSign), { ssr: false });
const MessageSquare = dynamic(() => import("lucide-react").then((mod) => mod.MessageSquare), { ssr: false });
const Shield = dynamic(() => import("lucide-react").then((mod) => mod.Shield), { ssr: false });
const FileText = dynamic(() => import("lucide-react").then((mod) => mod.FileText), { ssr: false });
const Settings = dynamic(() => import("lucide-react").then((mod) => mod.Settings), { ssr: false });

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

// Heavy computation function for processing friends data - reduced computation
const processFriendsData = (friends: any[]) => {
  // Simulate lighter computation to reduce main thread blocking
  let result = 0;
  for (let i = 0; i < 100000; i++) { // Reduced from 500000 to 100000
    result += Math.sqrt(i) * Math.cos(i);
  }
  
  // Process friends data
  return friends.map(friend => ({
    ...friend,
    processedBalance: friend.balance * 1.05, // Simulate some calculation
    processedAt: Date.now()
  }));
};

// Heavy computation function for processing transactions - reduced computation
const processTransactionsData = (transactions: any[]) => {
  // Simulate lighter computation to reduce main thread blocking
  let result = 0;
  for (let i = 0; i < 50000; i++) { // Reduced from 300000 to 50000
    result += Math.log(i + 1) * Math.tan(i);
  }
  
  // Process transactions data
  return transactions.map(transaction => ({
    ...transaction,
    processedAmount: transaction.amount * 1.02, // Simulate some calculation
    processedAt: Date.now()
  }));
};

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
        // Process friends data in a Web Worker for heavy computations
        const processedFriends = await runInWorker(processFriendsData, data.data, 3000); // 3s timeout
        
        setFriends(processedFriends.map((friend: any) => ({
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
        // Process transactions data in a Web Worker for heavy computations
        const processedTransactions = await runInWorker(processTransactionsData, data.data, 3000); // 3s timeout
        
        setTransactions(processedTransactions.map((transaction: any) => ({
          id: transaction.id,
          amount: transaction.amount,
          type: transaction.type,
          description: transaction.description,
          createdAt: transaction.createdAt,
          friendName: transaction.friendName
        })));
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
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-purple-400" />
                  Manage Friends
                </h2>
                
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
                                      className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-sm hover:shadow-lg hover:shadow-green-500/25 transition-all duration-200 disabled:opacity-50"
                                    >
                                      {settlingFriendId === friend.id ? 'Settling...' : 'Settle'}
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleSendReminder(friend.id)}
                                    className="px-3 py-1 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg text-sm hover:shadow-lg transition-all duration-200"
                                  >
                                    <Send className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-6">
                    <div className="bg-white/5 rounded-xl p-4">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <Calculator className="w-5 h-5 mr-2 text-purple-400" />
                        Quick Actions
                      </h3>
                      
                      <div className="space-y-4">
                        <button
                          onClick={handleAutoSettle}
                          className="w-full py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
                        >
                          <DollarSign className="w-5 h-5" />
                          <span>Auto-settle All Balances</span>
                        </button>
                        
                        <div className="bg-white/5 rounded-lg p-4">
                          <h4 className="font-semibold text-white mb-2">Settlement Tips</h4>
                          <ul className="text-sm text-gray-400 space-y-1">
                            <li className="flex items-start">
                              <Check className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                              <span>Settle balances regularly to maintain good relationships</span>
                            </li>
                            <li className="flex items-start">
                              <Check className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                              <span>Use the auto-settle feature for quick resolution</span>
                            </li>
                            <li className="flex items-start">
                              <Check className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                              <span>Send reminders for overdue balances</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Balance Summary */}
                    <div className="bg-white/5 rounded-xl p-4">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2 text-purple-400" />
                        Balance Summary
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Total Friends</span>
                          <span className="font-semibold text-white">{friends.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Balances Owed to You</span>
                          <span className="font-semibold text-green-400">
                            ₹{friends.filter(f => f.balance > 0).reduce((sum, f) => sum + f.balance, 0)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Balances You Owe</span>
                          <span className="font-semibold text-red-400">
                            ₹{Math.abs(friends.filter(f => f.balance < 0).reduce((sum, f) => sum + f.balance, 0))}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-white/10">
                          <span className="text-gray-400">Net Position</span>
                          <span className={`font-semibold ${
                            friends.filter(f => f.balance > 0).reduce((sum, f) => sum + f.balance, 0) > 
                            Math.abs(friends.filter(f => f.balance < 0).reduce((sum, f) => sum + f.balance, 0))
                              ? 'text-green-400' : 'text-red-400'
                          }`}>
                            ₹{friends.reduce((sum, f) => sum + f.balance, 0)}
                          </span>
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
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-purple-400" />
                  Recent Transactions
                </h2>
                
                <div className="bg-white/5 rounded-xl p-4">
                  {transactionsLoading ? (
                    <div className="text-gray-400 text-center py-4">Loading transactions...</div>
                  ) : transactions.length === 0 ? (
                    <div className="text-gray-400 text-center py-4">
                      No recent transactions found.
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {transactions.map((transaction) => (
                        <div key={transaction.id} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-full ${
                                transaction.type === 'GAVE' 
                                  ? 'bg-red-500/20 text-red-400' 
                                  : 'bg-green-500/20 text-green-400'
                              }`}>
                                {transaction.type === 'GAVE' ? (
                                  <ArrowUpCircle className="w-5 h-5" />
                                ) : (
                                  <ArrowDownCircle className="w-5 h-5" />
                                )}
                              </div>
                              <div>
                                <h3 className="font-semibold text-white">{transaction.description}</h3>
                                <p className="text-sm text-gray-400">
                                  {new Date(transaction.createdAt).toLocaleDateString()} • {transaction.friendName}
                                </p>
                              </div>
                            </div>
                            <div className={`text-right font-bold ${
                              transaction.type === 'GAVE' ? 'text-red-400' : 'text-green-400'
                            }`}>
                              {transaction.type === 'GAVE' ? '-' : '+'}₹{transaction.amount}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Categories Tab */}
            {activeTab === 'categories' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-purple-400" />
                  Expense Categories
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/5 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Add New Category</h3>
                    
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Enter category name"
                        className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    <h3 className="text-lg font-semibold text-white mb-4">Current Categories</h3>
                    
                    <div className="flex flex-wrap gap-2">
                      {settingsData.categories.map((category) => (
                        <div key={category} className="flex items-center bg-white/10 rounded-lg px-3 py-1">
                          <span className="text-white text-sm">{category}</span>
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
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-purple-400" />
                  Preferences
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/5 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Currency</h3>
                    
                    <select
                      value={settingsData.preferences.currency}
                      onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="INR">Indian Rupee (₹)</option>
                      <option value="USD">US Dollar ($)</option>
                      <option value="EUR">Euro (€)</option>
                      <option value="GBP">British Pound (£)</option>
                    </select>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Date Format</h3>
                    
                    <select
                      value={settingsData.preferences.dateFormat}
                      onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4 md:col-span-2">
                    <h3 className="text-lg font-semibold text-white mb-4">Notifications</h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white">Email Notifications</p>
                        <p className="text-sm text-gray-400">Receive updates via email</p>
                      </div>
                      <button
                        onClick={() => handlePreferenceChange('notifications', !settingsData.preferences.notifications)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settingsData.preferences.notifications ? "bg-purple-500" : "bg-gray-600"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settingsData.preferences.notifications ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-purple-400" />
                  Security Settings
                </h2>
                
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">Two-Factor Authentication</h3>
                    <p className="text-gray-400 mb-4">Add an extra layer of security to your account</p>
                    <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-200">
                      Enable 2FA
                    </button>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">Login History</h3>
                    <p className="text-gray-400 mb-4">View your recent login activity</p>
                    <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-200">
                      View History
                    </button>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">Password</h3>
                    <p className="text-gray-400 mb-4">Change your password regularly for better security</p>
                    <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-200">
                      Change Password
                    </button>
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