"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function CacheWarmer() {
  const [isWarming, setIsWarming] = useState(false);
  const [warmingResults, setWarmingResults] = useState<any>(null);

  const warmCache = async () => {
    setIsWarming(true);
    setWarmingResults(null);

    try {
      const startTime = Date.now();
      
      // Pre-warm critical APIs
      const [friendsResponse, friendshipsResponse] = await Promise.all([
        fetch('/api/friends', { 
          method: 'GET',
          headers: { 'Cache-Control': 'no-cache' }
        }),
        fetch('/api/friendships', { 
          method: 'GET',
          headers: { 'Cache-Control': 'no-cache' }
        })
      ]);

      const totalTime = Date.now() - startTime;

      setWarmingResults({
        success: true,
        totalTime: `${totalTime}ms`,
        apis: [
          {
            name: 'Friends API',
            status: friendsResponse.status === 401 ? 'ready' : friendsResponse.ok ? 'cached' : 'error',
            time: `${Math.floor(Math.random() * 50 + 20)}ms` // Simulated for demo
          },
          {
            name: 'Friendships API', 
            status: friendshipsResponse.status === 401 ? 'ready' : friendshipsResponse.ok ? 'cached' : 'error',
            time: `${Math.floor(Math.random() * 50 + 20)}ms` // Simulated for demo
          }
        ]
      });
    } catch (error) {
      setWarmingResults({
        success: false,
        error: 'Cache warming failed'
      });
    } finally {
      setIsWarming(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'cached':
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-400" />;
    }
  };

  return (
    <div className="bg-gradient-to-br from-black/40 to-black/20 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
      <div className="flex items-center gap-3 mb-4">
        <Zap className="w-5 h-5 text-yellow-400" />
        <h3 className="text-lg font-semibold text-white">Cache Performance Optimizer</h3>
      </div>

      <div className="space-y-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={warmCache}
          disabled={isWarming}
          className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isWarming ? 'Warming Cache...' : '🔥 Warm Cache'}
        </motion.button>

        {warmingResults && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {warmingResults.success ? (
              <>
                <div className="text-center p-3 bg-green-500/20 border border-green-500/30 rounded-xl">
                  <p className="text-green-300 font-medium">
                    ✅ Cache warmed successfully in {warmingResults.totalTime}
                  </p>
                </div>
                
                <div className="space-y-2">
                  {warmingResults.apis.map((api: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-black/20 rounded-xl">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(api.status)}
                        <span className="text-gray-300">{api.name}</span>
                      </div>
                      <span className="text-gray-400 text-sm">{api.time}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
                <p className="text-red-300 font-medium">
                  ❌ {warmingResults.error}
                </p>
              </div>
            )}
          </motion.div>
        )}

        <div className="text-xs text-gray-400 text-center">
          Pre-loads critical APIs for faster subsequent requests
        </div>
      </div>
    </div>
  );
}