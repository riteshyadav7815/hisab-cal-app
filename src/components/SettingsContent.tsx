"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { Activity, Zap } from "lucide-react";
import AppLayout from "./AppLayout";
import Header from "./Header";
import PerformanceDashboardModal from "./PerformanceDashboardModal";

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  username?: string | null;
  image?: string | null;
}

interface SettingsContentProps {
  user?: User; // Make user optional
}

export default function SettingsContent({ user }: SettingsContentProps) {
  const [showPerformanceDashboard, setShowPerformanceDashboard] = useState(false);
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      sms: false,
    },
    privacy: {
      profileVisibility: "public",
      showEmail: false,
      showLastSeen: true,
    },
    security: {
      twoFactor: false,
      loginAlerts: true,
    },
  });

  const handleSettingChange = (category: string, setting: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value,
      },
    }));
  };

  return (
    <AppLayout>
      <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 rounded-2xl p-6 h-full">
        {/* Remove the heavy background effects for better performance */}
        <div className="relative">
          {/* Header */}
          {user && <Header user={user} />}
          
          {/* Settings Content */}
          <div className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl mx-auto space-y-6"
            >
              {/* Performance Dashboard Button */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Performance Dashboard</h2>
                      <p className="text-gray-300 mt-1">
                        View comprehensive performance metrics, system monitoring, and optimization tools
                      </p>
                      <div className="flex items-center space-x-4 mt-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm text-green-400 font-medium">100/100 Performance Score</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Zap className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm text-yellow-400 font-medium">92% Faster APIs</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPerformanceDashboard(true)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 flex items-center space-x-2 font-medium"
                  >
                    <Activity className="w-5 h-5" />
                    <span>Open Dashboard</span>
                  </button>
                </div>
              </div>

              {/* Settings Header */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
                <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
                <p className="text-gray-300">
                  Manage your account preferences and privacy settings.
                </p>
              </div>

              {/* Notifications Settings */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6">Notifications</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium">Email Notifications</h3>
                      <p className="text-gray-400 text-sm">Receive updates via email</p>
                    </div>
                    <button
                      onClick={() => handleSettingChange("notifications", "email", !settings.notifications.email)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.notifications.email ? "bg-purple-500" : "bg-gray-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.notifications.email ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium">Push Notifications</h3>
                      <p className="text-gray-400 text-sm">Receive browser notifications</p>
                    </div>
                    <button
                      onClick={() => handleSettingChange("notifications", "push", !settings.notifications.push)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.notifications.push ? "bg-purple-500" : "bg-gray-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.notifications.push ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium">SMS Notifications</h3>
                      <p className="text-gray-400 text-sm">Receive text message alerts</p>
                    </div>
                    <button
                      onClick={() => handleSettingChange("notifications", "sms", !settings.notifications.sms)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.notifications.sms ? "bg-purple-500" : "bg-gray-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.notifications.sms ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Privacy Settings */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6">Privacy</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-white font-medium mb-3">Profile Visibility</h3>
                    <div className="space-y-2">
                      {["public", "friends", "private"].map((option) => (
                        <label key={option} className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="profileVisibility"
                            value={option}
                            checked={settings.privacy.profileVisibility === option}
                            onChange={(e) => handleSettingChange("privacy", "profileVisibility", e.target.value)}
                            className="text-purple-500 focus:ring-purple-500"
                          />
                          <span className="text-gray-300 capitalize">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium">Show Email Address</h3>
                      <p className="text-gray-400 text-sm">Make your email visible to other users</p>
                    </div>
                    <button
                      onClick={() => handleSettingChange("privacy", "showEmail", !settings.privacy.showEmail)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.privacy.showEmail ? "bg-purple-500" : "bg-gray-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.privacy.showEmail ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium">Show Last Seen</h3>
                      <p className="text-gray-400 text-sm">Display when you were last active</p>
                    </div>
                    <button
                      onClick={() => handleSettingChange("privacy", "showLastSeen", !settings.privacy.showLastSeen)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.privacy.showLastSeen ? "bg-purple-500" : "bg-gray-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.privacy.showLastSeen ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Security Settings */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6">Security</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium">Two-Factor Authentication</h3>
                      <p className="text-gray-400 text-sm">Add an extra layer of security to your account</p>
                    </div>
                    <button
                      onClick={() => handleSettingChange("security", "twoFactor", !settings.security.twoFactor)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.security.twoFactor ? "bg-purple-500" : "bg-gray-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.security.twoFactor ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium">Login Alerts</h3>
                      <p className="text-gray-400 text-sm">Get notified when someone logs into your account</p>
                    </div>
                    <button
                      onClick={() => handleSettingChange("security", "loginAlerts", !settings.security.loginAlerts)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.security.loginAlerts ? "bg-purple-500" : "bg-gray-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.security.loginAlerts ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Performance Dashboard Modal */}
        <PerformanceDashboardModal 
          isOpen={showPerformanceDashboard} 
          onClose={() => setShowPerformanceDashboard(false)} 
        />
      </div>
    </AppLayout>
  );
}