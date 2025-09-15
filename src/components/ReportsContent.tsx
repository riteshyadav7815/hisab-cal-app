"use client";
import { motion } from "framer-motion";
import { useState, useEffect, Suspense } from "react";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react";

interface ReportData {
  categoryBreakdown: Array<{ name: string; value: number; color: string; amount: number }>;
  expenseTrends: Array<{ month: string; expenses: number; budget: number }>;
  topSpends: Array<{ title: string; amount: number; date: string; category: string }>;
  friendReports: Array<{ name: string; youOwe: number; owesYou: number; netBalance: number }>;
  monthlyStats: {
    totalSpent: number;
    dailyAverage: number;
    biggestSpend: number;
    savingsVsTarget: number;
  };
}

// Loading component for better UX
function ReportsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#121020] via-[#1E1B34] to-[#2D1B69] flex items-center justify-center">
      <div className="flex items-center space-x-3 text-white">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="text-xl">Loading reports...</span>
      </div>
    </div>
  );
}

// Summary cards component for better code splitting
function SummaryCards({ monthlyStats }: { monthlyStats: ReportData['monthlyStats'] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
    >
      {[
        { label: 'Total Spent This Month', value: `₹${monthlyStats.totalSpent.toLocaleString()}`, icon: '💰', color: 'from-red-500 to-pink-500' },
        { label: 'Average Daily Spend', value: `₹${monthlyStats.dailyAverage}`, icon: '📈', color: 'from-blue-500 to-cyan-500' },
        { label: 'Biggest Spend', value: `₹${monthlyStats.biggestSpend.toLocaleString()}`, icon: '🎯', color: 'from-orange-500 to-red-500' },
        { label: 'Savings vs Target', value: `${monthlyStats.savingsVsTarget}%`, icon: '💡', color: 'from-green-500 to-emerald-500' }
      ].map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02 }}
          className="bg-[#2B2746]/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
              <span className="text-2xl">{stat.icon}</span>
            </div>
          </div>
          <h3 className="text-gray-400 text-sm font-medium mb-1">{stat.label}</h3>
          <p className="text-2xl font-bold text-white">{stat.value}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}

export default function ReportsContent() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
        
        const response = await fetch(`/api/reports?period=${selectedPeriod}&start=${dateRange.start}&end=${dateRange.end}`, {
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.reports) {
            setReportData(data.reports);
          } else {
            // Set empty data structure if no data
            setReportData({
              categoryBreakdown: [],
              expenseTrends: [],
              topSpends: [],
              friendReports: [],
              monthlyStats: {
                totalSpent: 0,
                dailyAverage: 0,
                biggestSpend: 0,
                savingsVsTarget: 0
              }
            });
          }
        } else {
          throw new Error('Failed to fetch reports');
        }
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          console.error('Request timed out');
        } else {
          console.error('Error fetching report data:', error);
        }
        // Set empty data structure on error
        setReportData({
          categoryBreakdown: [],
          expenseTrends: [],
          topSpends: [],
          friendReports: [],
          monthlyStats: {
            totalSpent: 0,
            dailyAverage: 0,
            biggestSpend: 0,
            savingsVsTarget: 0
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [selectedPeriod, dateRange]);

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      const response = await fetch(`/api/reports/export?format=${format}&period=${selectedPeriod}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateRange, reportData })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `expense-report-${selectedPeriod}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Export functionality coming soon!');
    }
  };

  const generateShareLink = () => {
    const shareCode = Math.random().toString(36).substring(2, 15);
    const shareUrl = `${window.location.origin}/shared-report/${shareCode}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Share link copied to clipboard!');
  };

  if (loading) {
    return <ReportsLoading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#121020] via-[#1E1B34] to-[#2D1B69]">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      <div className="relative max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <span className="text-4xl">📊</span>
            Your Financial Reports
          </h1>
          <p className="text-gray-300">Analyze your spending patterns and insights</p>
        </motion.div>

        {/* Date Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#2B2746]/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20 mb-8"
        >
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-3">
              {['weekly', 'monthly', 'yearly', 'custom'].map((period) => (
                <motion.button
                  key={period}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 rounded-xl transition-all duration-300 ${
                    selectedPeriod === period
                      ? 'bg-gradient-to-r from-[#7B5CFF] to-[#9B7FFF] text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </motion.button>
              ))}
            </div>
            
            {selectedPeriod === 'custom' && (
              <div className="flex gap-3">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>
            )}
          </div>
        </motion.div>

        {/* Summary Cards */}
        <Suspense fallback={<div className="h-32 bg-white/5 animate-pulse rounded-2xl"></div>}>
          <SummaryCards monthlyStats={reportData?.monthlyStats!} />
        </Suspense>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Category Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#2B2746]/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
          >
            <h3 className="text-xl font-bold text-white mb-4">Category Breakdown</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={reportData?.categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1000}
                >
                  {reportData?.categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-black/80 backdrop-blur-xl rounded-lg p-3 border border-white/20">
                          <p className="text-white font-medium">{data.name}</p>
                          <p className="text-purple-300">₹{data.amount.toLocaleString()}</p>
                          <p className="text-gray-400">{data.value}% of total</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Expense Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#2B2746]/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
          >
            <h3 className="text-xl font-bold text-white mb-4">Expense Trends</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={reportData?.expenseTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="month" stroke="#ffffff60" />
                <YAxis stroke="#ffffff60" />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-black/80 backdrop-blur-xl rounded-lg p-3 border border-white/20">
                          <p className="text-white font-medium">{label}</p>
                          <p className="text-purple-300">Expenses: ₹{payload[0].value?.toLocaleString()}</p>
                          <p className="text-cyan-300">Budget: ₹{payload[1]?.value?.toLocaleString()}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#7B5CFF" 
                  strokeWidth={3}
                  dot={{ fill: '#7B5CFF', strokeWidth: 2, r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="budget" 
                  stroke="#4ECDC4" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Top 5 Biggest Spends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#2B2746]/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
          >
            <h3 className="text-xl font-bold text-white mb-4">Top 5 Biggest Spends</h3>
            <div className="space-y-4">
              {reportData?.topSpends.map((spend, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{spend.title}</p>
                    <p className="text-gray-400 text-sm">{spend.date} • {spend.category}</p>
                  </div>
                  <span className="text-purple-400 font-bold">₹{spend.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Friend Reports */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          <div className="bg-[#2B2746]/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">Friend Reports</h3>
            <div className="space-y-4">
              {reportData?.friendReports.map((friend, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                      {friend.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-medium">{friend.name}</p>
                      <p className="text-gray-400 text-sm">
                        You owe: ₹{friend.youOwe} • Owes you: ₹{friend.owesYou}
                      </p>
                    </div>
                  </div>
                  <span className={`font-bold ${friend.netBalance > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {friend.netBalance > 0 ? '+' : ''}₹{friend.netBalance}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Export Options */}
          <div className="bg-[#2B2746]/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">Export & Share</h3>
            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleExport('pdf')}
                className="w-full p-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>📄</span>
                Download PDF Report
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleExport('excel')}
                className="w-full p-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>📊</span>
                Download Excel Report
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={generateShareLink}
                className="w-full p-4 bg-gradient-to-r from-[#7B5CFF] to-[#9B7FFF] text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>🔗</span>
                Share Report Link
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}