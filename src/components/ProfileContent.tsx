"use client";
import { motion } from "framer-motion";
import Image from 'next/image';
import { useState } from "react";
import AppLayout from "./AppLayout";
import Header from "./Header";

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  username?: string | null;
  image?: string | null;
}

interface ProfileContentProps {
  user: User;
}

export default function ProfileContent({ user }: ProfileContentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || "",
    username: user.username || "",
    email: user.email || "",
  });

  const handleSave = () => {
    // TODO: Implement save functionality
    setIsEditing(false);
  };

  return (
    <AppLayout>
      <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 rounded-2xl p-6 h-full">
        {/* Background Effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        </div>

        <div className="relative">
          {/* Header */}
          <Header user={user} />
          
          {/* Profile Content */}
          <div className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl mx-auto space-y-6"
            >
              {/* Profile Header */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
                <div className="flex items-center space-x-6">
                  {/* Avatar */}
                  <div className="relative">
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt={user.name || user.username || "User"}
                        width={96}
                        height={96}
                        className="w-24 h-24 rounded-full border-4 border-white/20"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white text-3xl font-bold border-4 border-white/20">
                        {(user.name || user.username || "U").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white hover:bg-purple-600 transition-colors">
                      ✏️
                    </button>
                  </div>

                  {/* User Info */}
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-white mb-2">
                      {user.name || user.username || "User"}
                    </h1>
                    <p className="text-gray-300 mb-1">@{user.username}</p>
                    <p className="text-gray-400">{user.email}</p>
                  </div>

                  {/* Edit Button */}
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all duration-200"
                  >
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </button>
                </div>
              </div>

              {/* Profile Form */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6">Profile Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      disabled={!isEditing}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-6 flex justify-end space-x-4">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all duration-200"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </div>

              {/* Account Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                  <h3 className="text-lg font-semibold text-white mb-2">Member Since</h3>
                  <p className="text-gray-300">January 2024</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                  <h3 className="text-lg font-semibold text-white mb-2">Total Logins</h3>
                  <p className="text-gray-300">127</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                  <h3 className="text-lg font-semibold text-white mb-2">Last Active</h3>
                  <p className="text-gray-300">2 minutes ago</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
