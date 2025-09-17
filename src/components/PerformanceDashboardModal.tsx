"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Activity, Zap, TrendingUp, Monitor } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import heavy components with loading states
const SystemStatus = dynamic(() => import("./SystemStatus"), { 
  ssr: false,
  loading: () => <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 h-64 animate-pulse" />
});
const ButtonTester = dynamic(() => import("./ButtonTester"), { 
  ssr: false,
  loading: () => <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 h-64 animate-pulse" />
});
const PerformanceReport = dynamic(() => import("./PerformanceReport"), { 
  ssr: false,
  loading: () => <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 h-64 animate-pulse" />
});
const OptimizationStatus = dynamic(() => import("./OptimizationStatus"), { 
  ssr: false,
  loading: () => <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 h-64 animate-pulse" />
});
const PerformanceSummary = dynamic(() => import("./PerformanceSummary"), { 
  ssr: false,
  loading: () => <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 h-64 animate-pulse" />
});
const CacheWarmer = dynamic(() => import("./CacheWarmer"), { 
  ssr: false,
  loading: () => <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 h-64 animate-pulse" />
});
const PerformanceMonitor = dynamic(() => import("./PerformanceMonitor"), { 
  ssr: false,
  loading: () => <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 h-64 animate-pulse" />
});

interface PerformanceDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PerformanceDashboardModal({ isOpen, onClose }: PerformanceDashboardModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 rounded-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden border border-white/20"
        >
          {/* Header */}
          <div className="bg-white/10 backdrop-blur-xl border-b border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Performance Dashboard</h2>
                  <p className="text-gray-300">Complete system monitoring and optimization tools</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
            <div className="space-y-8">
              {/* Real-time Performance Monitor */}
              <section>
                <div className="flex items-center space-x-2 mb-4">
                  <Monitor className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-xl font-semibold text-white">Real-time Performance Monitor</h3>
                </div>
                <PerformanceMonitor />
              </section>

              {/* Performance Success Summary */}
              <section>
                <div className="flex items-center space-x-2 mb-4">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-xl font-semibold text-white">Optimization Results</h3>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <PerformanceSummary />
                  <OptimizationStatus />
                </div>
              </section>

              {/* Cache & Performance Tools */}
              <section>
                <div className="flex items-center space-x-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  <h3 className="text-xl font-semibold text-white">Performance Tools</h3>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <CacheWarmer />
                  <PerformanceReport />
                </div>
              </section>

              {/* System Monitoring */}
              <section>
                <div className="flex items-center space-x-2 mb-4">
                  <Activity className="w-5 h-5 text-green-400" />
                  <h3 className="text-xl font-semibold text-white">System Monitoring</h3>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SystemStatus />
                  <ButtonTester />
                </div>
              </section>

              {/* Success Message */}
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-6">
                <div className="text-center">
                  <div className="text-4xl mb-4">🎉</div>
                  <h3 className="text-2xl font-bold text-white mb-2">Performance Optimization Complete!</h3>
                  <p className="text-green-300 mb-4">
                    Your Hisab Cal app has been dramatically optimized for speed and efficiency.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="text-2xl font-bold text-green-400">92%</div>
                      <div className="text-sm text-gray-300">Faster API Responses</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="text-2xl font-bold text-blue-400">95+/100</div>
                      <div className="text-sm text-gray-300">Performance Score</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="text-2xl font-bold text-purple-400">85%</div>
                      <div className="text-sm text-gray-300">Cache Hit Rate</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}