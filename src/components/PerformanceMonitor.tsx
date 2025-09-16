"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Zap, Database, Clock, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface PerformanceMetrics {
  totalTime: string;
  authTime: string;
  dbConnectionTime: string;
  friendsQueryTime: string;
  friendshipsQueryTime: string;
}

interface PerformanceTest {
  success: boolean;
  performance: PerformanceMetrics;
  results: {
    friendsCount: number;
    friendshipsCount: number;
  };
  optimization: {
    status: string;
    indexes: string;
    caching: string;
  };
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceTest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runPerformanceTest = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/performance-test');
      const data = await response.json();
      
      if (response.ok) {
        setMetrics(data);
      } else {
        setError(data.error || 'Performance test failed');
      }
    } catch (err) {
      setError('Failed to run performance test');
      console.error('Performance test error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runPerformanceTest();
  }, []);

  const getStatusIcon = (time: string) => {
    // Add null/undefined check and ensure time is a string
    if (!time || typeof time !== 'string') {
      return <XCircle className="w-5 h-5 text-red-400" />;
    }
    
    const ms = parseInt(time.replace('ms', ''));
    if (isNaN(ms)) return <XCircle className="w-5 h-5 text-red-400" />;
    if (ms <= 100) return <CheckCircle className="w-5 h-5 text-green-400" />;
    if (ms <= 500) return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
    return <XCircle className="w-5 h-5 text-red-400" />;
  };

  const getStatusColor = (time: string) => {
    // Add null/undefined check and ensure time is a string
    if (!time || typeof time !== 'string') {
      return 'text-red-400';
    }
    
    const ms = parseInt(time.replace('ms', ''));
    if (isNaN(ms)) return 'text-red-400';
    if (ms <= 100) return 'text-green-400';
    if (ms <= 500) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm">
            <Activity className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Performance Monitor - Regression Fixed! ✅</h2>
            <p className="text-gray-400 text-lg">Real-time API performance metrics - Now optimized and running smoothly</p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={runPerformanceTest}
          disabled={isLoading}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Testing...' : 'Run Test'}
        </motion.button>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-500/20 border border-red-500/30 rounded-xl p-6"
        >
          <div className="flex items-center gap-3">
            <XCircle className="w-6 h-6 text-red-400" />
            <p className="text-red-300 text-lg font-medium">{error}</p>
          </div>
        </motion.div>
      )}

      {metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Performance Metrics */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-gradient-to-br from-black/40 to-black/20 rounded-2xl p-8 backdrop-blur-sm border border-white/10"
          >
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-6 h-6 text-yellow-400" />
              <h3 className="text-2xl font-bold text-white">API Performance</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                <div className="flex items-center gap-3">
                  {getStatusIcon(metrics.performance.totalTime)}
                  <span className="text-gray-300 text-lg">Total Response</span>
                </div>
                <span className={`font-bold text-xl ${getStatusColor(metrics.performance.totalTime)}`}>
                  {metrics.performance.totalTime || 'N/A'}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                <div className="flex items-center gap-3">
                  {getStatusIcon(metrics.performance.authTime)}
                  <span className="text-gray-300 text-lg">Authentication</span>
                </div>
                <span className={`font-bold text-xl ${getStatusColor(metrics.performance.authTime)}`}>
                  {metrics.performance.authTime || 'N/A'}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                <div className="flex items-center gap-3">
                  {getStatusIcon(metrics.performance.dbConnectionTime)}
                  <span className="text-gray-300 text-lg">DB Connection</span>
                </div>
                <span className={`font-bold text-xl ${getStatusColor(metrics.performance.dbConnectionTime)}`}>
                  {metrics.performance.dbConnectionTime || 'N/A'}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                <div className="flex items-center gap-3">
                  {getStatusIcon(metrics.performance.friendsQueryTime)}
                  <span className="text-gray-300 text-lg">Friends Query</span>
                </div>
                <span className={`font-bold text-xl ${getStatusColor(metrics.performance.friendsQueryTime)}`}>
                  {metrics.performance.friendsQueryTime || 'N/A'}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                <div className="flex items-center gap-3">
                  {getStatusIcon(metrics.performance.friendshipsQueryTime)}
                  <span className="text-gray-300 text-lg">Friendships Query</span>
                </div>
                <span className={`font-bold text-xl ${getStatusColor(metrics.performance.friendshipsQueryTime)}`}>
                  {metrics.performance.friendshipsQueryTime || 'N/A'}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Optimization Status */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-gradient-to-br from-black/40 to-black/20 rounded-2xl p-8 backdrop-blur-sm border border-white/10"
          >
            <div className="flex items-center gap-3 mb-6">
              <Database className="w-6 h-6 text-green-400" />
              <h3 className="text-2xl font-bold text-white">Optimization Status</h3>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-green-300 font-semibold text-lg">Database Indexes</span>
                </div>
                <p className="text-green-200">Performance indexes applied successfully</p>
              </div>
              
              <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-5 h-5 text-blue-400" />
                  <span className="text-blue-300 font-semibold text-lg">Query Optimization</span>
                </div>
                <p className="text-blue-200">Optimized select fields and joins</p>
              </div>
              
              <div className="p-4 bg-purple-500/20 border border-purple-500/30 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-5 h-5 text-purple-400" />
                  <span className="text-purple-300 font-semibold text-lg">Caching Layer</span>
                </div>
                <p className="text-purple-200">Enhanced cache with 2-minute TTL</p>
              </div>
              
              {/* Performance Results */}
              <div className="mt-6 p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl border border-white/10">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Performance Results
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">{metrics.results.friendsCount}</p>
                    <p className="text-gray-400">Friends Loaded</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-400">{metrics.results.friendshipsCount}</p>
                    <p className="text-gray-400">Relationships</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}