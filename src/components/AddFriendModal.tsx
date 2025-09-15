"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Users } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { cachedFetch, apiCache } from "@/lib/api-cache";
import { refreshDashboard } from "./ExpenseOverview";

interface Friend {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddFriendModal({ isOpen, onClose }: AddFriendModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendForm, setFriendForm] = useState({ name: '', email: '', phone: '' });
  const [activeTab, setActiveTab] = useState<'add' | 'list'>('add');

  const fetchFriends = async () => {
    try {
      console.log('🔄 Fetching friends list...');
      // Use shorter cache for friend list to ensure freshness
      const data = await cachedFetch('/api/friends', {}, 10000); // Only 10 second cache
      if (data.success) {
        setFriends(data.data || []);
        console.log('✅ Friends list updated:', data.data?.length || 0, 'friends');
      }
    } catch (error) {
      console.error('❌ Error fetching friends:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchFriends();
    }
  }, [isOpen]);

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      console.log('🚀 Adding friend:', friendForm.name);
      
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(friendForm),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Friend added successfully:', result);
        
        // Clear specific friend-related caches to force fresh data
        apiCache.clearByPattern('/api/friends');
        apiCache.clearByPattern('/api/friendships');
        console.log('🗑️ Friend-related caches cleared for fresh data');
        
        // Reset form
        setFriendForm({ name: '', email: '', phone: '' });
        
        // Refresh friends list immediately
        await fetchFriends();
        
        // Refresh dashboard data
        refreshDashboard();
        
        // Show success message
        alert(`🎉 ${friendForm.name} added successfully!`);
        
        // Switch to list tab to show the new friend
        setActiveTab('list');
      } else {
        const errorData = await response.json();
        console.error('❌ Error adding friend:', errorData);
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('❌ Unexpected error:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
          className="relative bg-[#2B2746]/90 backdrop-blur-xl rounded-2xl border border-white/20 p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Manage Friends</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-white/5 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('add')}
              className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                activeTab === 'add'
                  ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4 inline mr-2" />
              Add Friend
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                activeTab === 'list'
                  ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Friends ({friends.length})
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'add' ? (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-white/5 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Add a New Friend</h3>
                  <form onSubmit={handleAddFriend} className="space-y-4">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Friend's Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={friendForm.name}
                        onChange={(e) => setFriendForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter friend's name"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Email (Optional)
                      </label>
                      <input
                        type="email"
                        value={friendForm.email}
                        onChange={(e) => setFriendForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="friend@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Phone (Optional)
                      </label>
                      <input
                        type="tel"
                        value={friendForm.phone}
                        onChange={(e) => setFriendForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading || !friendForm.name}
                      className="w-full py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-medium rounded-xl hover:from-purple-600 hover:to-cyan-600 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          <span>Adding...</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          <span>Add Friend</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="bg-white/5 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Your Friends</h3>
                  {friends.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {friends.map((friend, index) => (
                        <motion.div
                          key={friend.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-black/20 p-4 rounded-xl flex items-center gap-4 hover:bg-black/30 transition-colors"
                        >
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white font-semibold overflow-hidden">
                            {friend.avatar ? (
                              <Image 
                                src={friend.avatar} 
                                alt={friend.name} 
                                width={48} 
                                height={48} 
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              friend.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-medium">{friend.name}</p>
                            {friend.email && <p className="text-gray-400 text-sm">{friend.email}</p>}
                            {friend.phone && <p className="text-gray-400 text-sm">{friend.phone}</p>}
                          </div>
                          <div className="text-right text-gray-400">
                            <p className="text-xs">Added recently</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">No friends added yet</p>
                      <p className="text-sm">Click "Add Friend" tab to get started</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}