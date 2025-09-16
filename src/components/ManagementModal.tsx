"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Settings, Calculator, TrendingUp, Users, FileText, Shield, CreditCard, ArrowUpDown, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { cachedFetch } from "@/lib/api-cache";

interface ManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
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

interface Friend {
  id: string;
  name: string;
  balance: number;
  lastActivity: string;
  avatar?: string;
}

interface Transaction {
  id: string;
  amount: number;
  type: 'GAVE' | 'RECEIVED';
  description: string;
  createdAt: string;
  friendName: string;
}

export default function ManagementModal({ isOpen, onClose }: ManagementModalProps) {
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

  useEffect(() => {
    if (isOpen) {
      // Fetch settings data when modal opens with debouncing
      const timer = setTimeout(() => {
        fetchSettingsData();
        fetchFriends();
        fetchTransactions();
      }, 100); // Small delay to prevent blocking UI
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching friends with cache...');
      
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

  const handleSettlement = async (friendId: string) => {
    try {
      const response = await fetch('/api/settlements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId })
      });
      
      if (response.ok) {
        alert('Settlement successful!');
        fetchFriends(); // Refresh friends data
        fetchTransactions(); // Refresh transactions
      } else {
        alert('Settlement failed. Please try again.');
      }
    } catch (error) {
      console.error('Settlement error:', error);
      alert('Settlement failed. Please try again.');
    }
  };

  const fetchSettingsData = async () => {
    try {
      // You can add API calls here to fetch actual data
      // For now, we'll use mock data
    } catch (error) {
      console.error('Error fetching settings:', error);
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

    if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-[#2B2746]/95 backdrop-blur-xl rounded-3xl border border-white/20 p-8 w-full max-w-[95vw] mx-4 max-h-[97vh] overflow-hidden flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Management Center</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-white/5 rounded-xl p-1 overflow-x-auto">
            {[
              { id: 'friends', label: 'Friends & Settlements', icon: Users },
              { id: 'categories', label: 'Categories', icon: FileText },
              { id: 'transactions', label: 'Recent Transactions', icon: CreditCard },
              { id: 'preferences', label: 'Preferences', icon: Settings },
              { id: 'security', label: 'Security', icon: Shield },
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'friends' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Friends with Balances */}
                <div className="bg-gradient-to-br from-white/10 via-white/5 to-purple-500/10 rounded-2xl p-8 border border-white/10 shadow-lg">
                  <h3 className="text-2xl font-semibold text-white mb-8 flex items-center space-x-3">
                    <Users className="w-6 h-6 text-cyan-400" />
                    <span>Friends & Balance Summary</span>
                  </h3>
                  
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p className="text-gray-400">Loading friends...</p>
                    </div>
                  ) : friends.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <Users className="w-16 h-16 mx-auto mb-6 opacity-50" />
                      <p className="text-xl mb-3">No friends added yet</p>
                      <p className="text-base">Add friends to start tracking expenses and settlements</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {friends.map((friend) => (
                        <div
                          key={friend.id}
                          className="bg-gradient-to-br from-black/40 via-gray-900/30 to-purple-900/20 p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-4">
                              <div className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                {friend.avatar}
                              </div>
                              <div>
                                <p className="text-white font-semibold text-lg">{friend.name}</p>
                                <p className="text-gray-400 text-sm">{friend.lastActivity}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mb-6">
                            <div className="mb-3">
                              <p className="text-gray-300 text-sm mb-1">Current Balance</p>
                              <div className={`text-2xl font-bold ${
                                friend.balance > 0 
                                  ? 'text-green-400' 
                                  : friend.balance < 0 
                                  ? 'text-red-400' 
                                  : 'text-gray-400'
                              }`}>
                                {friend.balance > 0 && '+'}
                                ₹{Math.abs(friend.balance).toLocaleString()}
                              </div>
                            </div>
                            
                            <div className={`p-3 rounded-xl text-center text-sm font-medium ${
                              friend.balance > 0 
                                ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                                : friend.balance < 0 
                                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                            }`}>
                              {friend.balance > 0 
                                ? `💰 ${friend.name} owes you ₹${Math.abs(friend.balance)}` 
                                : friend.balance < 0 
                                ? `💸 You owe ${friend.name} ₹${Math.abs(friend.balance)}` 
                                : '✅ No pending balance'
                              }
                            </div>
                          </div>
                          
                          {friend.balance !== 0 && (
                            <button
                              onClick={() => handleSettlement(friend.id)}
                              className="w-full py-3 px-6 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white rounded-xl text-base font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 flex items-center justify-center space-x-3 hover:scale-105"
                            >
                              <CheckCircle className="w-5 h-5" />
                              <span>Settle Up ₹{Math.abs(friend.balance)}</span>
                            </button>
                          )}
                          
                          {friend.balance === 0 && (
                            <div className="w-full py-3 px-6 bg-gray-500/20 text-gray-400 rounded-xl text-base font-medium text-center border border-gray-500/30">
                              ✅ All settled up!
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Transactions */}
                <div className="bg-gradient-to-br from-white/10 via-white/5 to-purple-500/10 rounded-2xl p-8 border border-white/10 shadow-lg">
                  <h3 className="text-2xl font-semibold text-white mb-8 flex items-center space-x-3">
                    <CreditCard className="w-6 h-6 text-purple-400" />
                    <span>Recent Money Transfers</span>
                  </h3>
                  
                  {transactions.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <CreditCard className="w-16 h-16 mx-auto mb-6 opacity-50" />
                      <p className="text-xl mb-3">No transactions yet</p>
                      <p className="text-base">Start transferring money to see transactions here</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                      {transactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-black/30 to-gray-900/20 rounded-xl hover:from-black/40 hover:to-gray-900/30 transition-all duration-300 border border-white/5 hover:border-white/10"
                        >
                          <div className="flex items-center space-x-4">
                            <div className={`p-3 rounded-xl ${
                              transaction.type === 'GAVE' 
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                                : 'bg-green-500/20 text-green-400 border border-green-500/30'
                            }`}>
                              <ArrowUpDown className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-white font-semibold text-base">{transaction.friendName}</p>
                              <p className="text-gray-300 text-sm">
                                {transaction.type === 'GAVE' ? '💸 Paid to' : '💰 Received from'} <span className="font-medium">{transaction.friendName}</span>
                              </p>
                              <p className="text-gray-500 text-xs">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className={`font-bold text-lg ${
                              transaction.type === 'GAVE' ? 'text-red-400' : 'text-green-400'
                            }`}>
                              {transaction.type === 'GAVE' ? '-' : '+'}₹{transaction.amount.toLocaleString()}
                            </p>
                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                              transaction.type === 'GAVE' 
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                                : 'bg-green-500/20 text-green-400 border border-green-500/30'
                            }`}>
                              {transaction.type}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'categories' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-white/5 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Expense Categories</h3>
                  
                  {/* Add New Category */}
                  <div className="flex space-x-3 mb-6">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="flex-1 px-4 py-2 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Add new category"
                    />
                    <button
                      onClick={handleAddCategory}
                      className="px-6 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-xl hover:from-purple-600 hover:to-cyan-600 transition-all"
                    >
                      Add
                    </button>
                  </div>

                  {/* Categories List */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {settingsData.categories.map((category, index) => (
                      <motion.div
                        key={category}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-black/20 p-3 rounded-xl flex items-center justify-between group hover:bg-black/30 transition-colors"
                      >
                        <span className="text-white text-sm">{category}</span>
                        <button
                          onClick={() => handleRemoveCategory(category)}
                          className="text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'transactions' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                    <CreditCard className="w-5 h-5 text-green-400" />
                    <span>Recent Money Transfers</span>
                  </h3>
                </div>
                
                <div className="bg-gradient-to-br from-white/10 via-white/5 to-purple-500/10 rounded-2xl p-8 border border-white/10 shadow-lg">
                  {transactionsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white/5 rounded-xl p-4 animate-pulse">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white/10 rounded-full"></div>
                            <div className="flex-1">
                              <div className="h-4 bg-white/10 rounded w-1/2 mb-2"></div>
                              <div className="h-3 bg-white/10 rounded w-1/3"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <CreditCard className="w-16 h-16 mx-auto mb-6 opacity-50" />
                      <p className="text-xl mb-3">No transactions yet</p>
                      <p className="text-base">Start transferring money to see transactions here</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                      {transactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-black/30 to-gray-900/20 rounded-xl hover:from-black/40 hover:to-gray-900/30 transition-all duration-300 border border-white/5 hover:border-white/10"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                              {transaction.friendName.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">{transaction.friendName}</h4>
                              <p className="text-sm text-gray-400">{transaction.description}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(transaction.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-bold ${
                              transaction.type === 'GAVE' ? 'text-red-400' : 'text-green-400'
                            }`}>
                              {transaction.type === 'GAVE' ? '-' : '+'}₹{transaction.amount.toLocaleString()}
                            </p>
                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                              transaction.type === 'GAVE' 
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                                : 'bg-green-500/20 text-green-400 border border-green-500/30'
                            }`}>
                              {transaction.type}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'preferences' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-white/5 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Application Preferences</h3>
                  
                  <div className="space-y-6">
                    {/* Currency */}
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Currency</label>
                      <select
                        value={settingsData.preferences.currency}
                        onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                        className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="INR">₹ Indian Rupee (INR)</option>
                        <option value="USD">$ US Dollar (USD)</option>
                        <option value="EUR">€ Euro (EUR)</option>
                        <option value="GBP">£ British Pound (GBP)</option>
                      </select>
                    </div>

                    {/* Date Format */}
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Date Format</label>
                      <select
                        value={settingsData.preferences.dateFormat}
                        onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
                        className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>

                    {/* Notifications */}
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium">Push Notifications</label>
                        <p className="text-gray-400 text-xs">Receive notifications for expenses and reminders</p>
                      </div>
                      <button
                        onClick={() => handlePreferenceChange('notifications', !settingsData.preferences.notifications)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settingsData.preferences.notifications ? 'bg-purple-500' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settingsData.preferences.notifications ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-white/5 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Security & Privacy</h3>
                  
                  <div className="space-y-6">
                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <Shield className="w-5 h-5 text-green-400" />
                        <div>
                          <p className="text-green-400 font-medium">Account Secure</p>
                          <p className="text-gray-300 text-sm">Your account is protected with end-to-end encryption</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <button className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-xl text-left transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">Change Password</p>
                            <p className="text-gray-400 text-sm">Update your account password</p>
                          </div>
                          <span className="text-gray-400">→</span>
                        </div>
                      </button>

                      <button className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-xl text-left transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">Two-Factor Authentication</p>
                            <p className="text-gray-400 text-sm">Add an extra layer of security</p>
                          </div>
                          <span className="text-gray-400">→</span>
                        </div>
                      </button>

                      <button className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-xl text-left transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">Privacy Settings</p>
                            <p className="text-gray-400 text-sm">Control your data sharing preferences</p>
                          </div>
                          <span className="text-gray-400">→</span>
                        </div>
                      </button>

                      <button className="w-full p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-left transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-red-400 font-medium">Delete Account</p>
                            <p className="text-gray-400 text-sm">Permanently delete your account and all data</p>
                          </div>
                          <span className="text-red-400">→</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}