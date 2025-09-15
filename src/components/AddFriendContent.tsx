"use client";
import { motion } from "framer-motion";
import Image from 'next/image';
import { useState, useEffect } from "react";



interface Friend {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  nickname?: string;
  category?: string;
  tags?: string[];
}


export default function AddFriendContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendForm, setFriendForm] = useState({ name: '', email: '', phone: '' });

  const fetchFriends = async () => {
    try {
      const response = await fetch('/api/friends');
      if (response.ok) {
        const data = await response.json();
        setFriends(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(friendForm),
      });
      if (response.ok) {
        setFriendForm({ name: '', email: '', phone: '' });
        fetchFriends(); // Refresh the list
        alert('Friend added successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch {
      alert('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex p-4">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Add Friend Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Add a New Friend</h2>
          <form onSubmit={handleAddFriend} className="space-y-4">
            <input
              type="text"
              required
              value={friendForm.name}
              onChange={(e) => setFriendForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Friend's Name"
            />
            <input
              type="email"
              value={friendForm.email}
              onChange={(e) => setFriendForm(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Email (Optional)"
            />
            <input
              type="tel"
              value={friendForm.phone}
              onChange={(e) => setFriendForm(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Phone (Optional)"
            />
            <button
              type="submit"
              disabled={isLoading || !friendForm.name}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-medium rounded-xl hover:from-purple-600 hover:to-cyan-600 disabled:opacity-50 transition-all"
            >
              {isLoading ? 'Adding...' : 'Add Friend'}
            </button>
          </form>
        </motion.div>

        {/* Friends List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Your Friends</h2>
          <div className="space-y-3 overflow-y-auto max-h-[70vh]">
            {friends.length > 0 ? (
              friends.map(friend => (
                <div key={friend.id} className="bg-black/20 p-4 rounded-xl flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center text-gray-400 overflow-hidden">
                    {friend.avatar ? (
                      <Image src={friend.avatar} alt={friend.name} width={40} height={40} className="w-full h-full object-cover" />
                    ) : (
                      friend.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">{friend.name}</p>
                    {friend.email && <p className="text-gray-400 text-sm">{friend.email}</p>}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-400">
                <p>No friends added yet.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}