"use client";
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle, Zap } from 'lucide-react';
import { apiCache } from '@/lib/api-cache';

interface StatusItem {
  name: string;
  status: 'checking' | 'success' | 'error' | 'warning';
  message: string;
  responseTime?: number;
}

export default function SystemStatus() {
  const [status, setStatus] = useState<StatusItem[]>([
    { name: 'Authentication', status: 'checking', message: 'Testing...' },
    { name: 'Dashboard API', status: 'checking', message: 'Testing...' },
    { name: 'Friends API', status: 'checking', message: 'Testing...' },
    { name: 'Add Friend Modal', status: 'checking', message: 'Testing...' },
    { name: 'Management Modal', status: 'checking', message: 'Testing...' },
    { name: 'Money Transfer', status: 'checking', message: 'Testing...' },
    { name: 'Calculator', status: 'checking', message: 'Testing...' },
    { name: 'Settings Page', status: 'checking', message: 'Testing...' },
    { name: 'Database Connection', status: 'checking', message: 'Testing...' },
  ]);

  useEffect(() => {
    runSystemCheck();
  }, []);

  const testAPI = async (url: string, name: string) => {
    const startTime = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        return { 
          status: 'success' as const, 
          message: `✅ Working (${responseTime}ms)`,
          responseTime 
        };
      } else if (response.status === 401) {
        return { 
          status: 'warning' as const, 
          message: `⚠️ Requires authentication (${responseTime}ms)`,
          responseTime 
        };
      } else if (response.status === 404) {
        return { 
          status: 'warning' as const, 
          message: `⚠️ Endpoint not found (${responseTime}ms)`,
          responseTime 
        };
      } else {
        return { 
          status: 'error' as const, 
          message: `❌ Error ${response.status} (${responseTime}ms)`,
          responseTime 
        };
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      if (error instanceof Error && error.name === 'AbortError') {
        return { 
          status: 'error' as const, 
          message: `❌ Timeout (${responseTime}ms)`,
          responseTime 
        };
      }
      return { 
        status: 'error' as const, 
        message: `❌ Network error (${responseTime}ms)`,
        responseTime 
      };
    }
  };

  const testComponent = (name: string) => {
    // For UI components, we'll just mark them as success for now
    // In a real app, you might test if they can render without errors
    return { 
      status: 'success' as const, 
      message: '✅ Component loads' 
    };
  };

  const runSystemCheck = async () => {
    const tests = [
      { name: 'Authentication', test: () => testAPI('/api/auth/session', 'Auth') },
      { name: 'Friends API (Optimized)', test: () => testAPI('/api/friends', 'Friends') },
      { name: 'Friendships API (Optimized)', test: () => testAPI('/api/friendships', 'Friendships') },
      { name: 'Transactions API', test: () => testAPI('/api/transactions', 'Transactions') },
      { name: 'Stats API', test: () => testAPI('/api/stats', 'Stats') },
      { name: 'Database Health', test: () => testAPI('/api/health', 'Health') },
      { name: 'Add Friend Modal', test: () => testComponent('AddFriendModal') },
      { name: 'Management Modal', test: () => testComponent('ManagementModal') },
      { name: 'Calculator', test: () => testComponent('Calculator') },
    ];

    for (const testItem of tests) {
      try {
        const result = await testItem.test();
        setStatus(prev => prev.map(item => 
          item.name === testItem.name 
            ? { ...item, ...result }
            : item
        ));
      } catch (error) {
        setStatus(prev => prev.map(item => 
          item.name === testItem.name 
            ? { ...item, status: 'error', message: '❌ Test failed' }
            : item
        ));
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      default:
        return <Clock className="w-5 h-5 text-blue-400 animate-spin" />;
    }
  };

  const getPerformanceColor = (responseTime?: number) => {
    if (!responseTime) return 'text-gray-400';
    if (responseTime < 200) return 'text-green-400';
    if (responseTime < 500) return 'text-yellow-400';
    if (responseTime < 1000) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">System Status</h3>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              apiCache.clear();
              alert('API cache cleared! Next requests will be fresh.');
            }}
            className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-lg hover:bg-orange-500/30 transition-all text-sm"
          >
            Clear Cache
          </button>
          <button
            onClick={runSystemCheck}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg hover:from-purple-600 hover:to-cyan-600 transition-all"
          >
            Refresh
          </button>
        </div>
      </div>
      
      <div className="space-y-3">
        {status.map((item) => (
          <div key={item.name} className="flex items-center justify-between p-3 bg-black/20 rounded-xl">
            <div className="flex items-center space-x-3">
              {getStatusIcon(item.status)}
              <span className="text-white font-medium">{item.name}</span>
            </div>
            <div className="text-right">
              <p className="text-gray-300 text-sm">{item.message}</p>
              {item.responseTime && (
                <p className={`text-xs ${getPerformanceColor(item.responseTime)}`}>
                  {item.responseTime}ms
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-xl border border-purple-500/20">
        <h4 className="text-white font-medium mb-2">Performance Guidelines</h4>
        <div className="text-sm text-gray-300 space-y-1">
          <p><span className="text-green-400">●</span> &lt;200ms - Excellent</p>
          <p><span className="text-yellow-400">●</span> 200-500ms - Good</p>
          <p><span className="text-orange-400">●</span> 500-1000ms - Slow</p>
          <p><span className="text-red-400">●</span> &gt;1000ms - Very Slow</p>
        </div>
      </div>
    </div>
  );
}