"use client";
import { useEffect, useState, Suspense, lazy } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, DollarSign, Users, PieChart as PieChartIcon, BarChart3, Activity } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import heavy charting components with proper typing and lazy loading
const PieChart = dynamic(() => import("recharts").then(mod => mod.PieChart), { 
  ssr: false, 
  loading: () => <ChartSkeleton />
});
const Pie = dynamic(() => import("recharts").then(mod => mod.Pie), { ssr: false });
const Cell = dynamic(() => import("recharts").then(mod => mod.Cell), { ssr: false });
const LineChart = dynamic(() => import("recharts").then(mod => mod.LineChart), { 
  ssr: false, 
  loading: () => <ChartSkeleton />
});
const Line = dynamic(() => import("recharts").then(mod => mod.Line), { ssr: false });
const BarChart = dynamic(() => import("recharts").then(mod => mod.BarChart), { 
  ssr: false, 
  loading: () => <ChartSkeleton />
});
const Bar = dynamic(() => import("recharts").then(mod => mod.Bar), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then(mod => mod.ResponsiveContainer), { ssr: false });
const XAxis = dynamic(() => import("recharts").then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(mod => mod.Tooltip), { ssr: false });
// Legend component removed due to TypeScript compatibility issues
const Area = dynamic(() => import("recharts").then(mod => mod.Area), { ssr: false });
const AreaChart = dynamic(() => import("recharts").then(mod => mod.AreaChart), { 
  ssr: false, 
  loading: () => <ChartSkeleton />
});

interface ChartData {
  categoryData: Array<{ name: string; value: number; color: string }>;
  trendData: Array<{ month: string; expenses: number; income: number }>;
  friendsData: Array<{ name: string; you: number; friend: number }>;
}

// Loading skeleton component
const ChartSkeleton = () => (
  <div className="bg-gradient-to-br from-black/40 to-black/20 rounded-2xl h-64 sm:h-80 backdrop-blur-sm border border-white/10 animate-pulse"></div>
);

export default function DashboardCharts() {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [visibleCharts, setVisibleCharts] = useState<Set<string>>(new Set());

  // Intersection Observer to lazy load charts
  useEffect(() => {
    if (typeof window === 'undefined' || !window.IntersectionObserver) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const chartId = entry.target.getAttribute('data-chart-id');
          if (chartId) {
            setVisibleCharts(prev => new Set(prev).add(chartId));
          }
        }
      });
    }, { threshold: 0.1 });

    const chartElements = document.querySelectorAll('[data-chart-id]');
    chartElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch('/api/charts');
        if (response.ok) {
          const data = await response.json();
          setChartData(data.charts);
        } else {
          // Fallback demo data
          setChartData({
            categoryData: [
              { name: 'Food', value: 400, color: '#8B5CF6' },
              { name: 'Travel', value: 300, color: '#6366F1' },
              { name: 'Shopping', value: 300, color: '#3B82F6' },
              { name: 'Other', value: 200, color: '#6B7280' },
            ],
            trendData: [
              { month: 'Jan', expenses: 4000, income: 2400 },
              { month: 'Feb', expenses: 3000, income: 1398 },
              { month: 'Mar', expenses: 2000, income: 9800 },
              { month: 'Apr', expenses: 2780, income: 3908 },
              { month: 'May', expenses: 1890, income: 4800 },
              { month: 'Jun', expenses: 2390, income: 3800 },
            ],
            friendsData: [
              { name: 'Alice', you: 400, friend: 240 },
              { name: 'Bob', you: 300, friend: 139 },
              { name: 'Carol', you: 200, friend: 980 },
              { name: 'David', you: 278, friend: 390 },
            ],
          });
        }
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, []);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6 sm:space-y-8"
      >
        <div className="flex items-center gap-3 sm:gap-4 mb-6">
          <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm">
            <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2">Charts & Insights</h2>
            <p className="text-gray-400 text-sm sm:text-base">Analyzing your financial data...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </motion.div>
    );
  }

  const totalExpenses = chartData?.categoryData.reduce((sum, item) => sum + item.value, 0) || 0;
  const currentMonthExpenses = chartData?.trendData[chartData.trendData.length - 1]?.expenses || 0;
  const previousMonthExpenses = chartData?.trendData[chartData.trendData.length - 2]?.expenses || 0;
  const expensesTrend = currentMonthExpenses - previousMonthExpenses;
  const totalFriends = chartData?.friendsData.length || 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 backdrop-blur-sm border border-white/20 rounded-xl p-3 sm:p-4 shadow-2xl">
          <p className="text-white font-semibold text-base sm:text-lg mb-1 sm:mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-gray-300 text-sm sm:text-base">
              <span className="inline-block w-2 h-2 sm:w-3 sm:h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
              {entry.name}: ₹{entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 sm:space-y-8"
    >
      {/* Header Section */}
      <div className="flex items-center gap-3 sm:gap-4 mb-6">
        <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm">
          <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2">Charts & Insights</h2>
          <p className="text-gray-400 text-sm sm:text-base">Comprehensive financial analytics and trends</p>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-2xl p-4 sm:p-6 backdrop-blur-sm border border-purple-500/20"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
            <span className="text-purple-300 font-medium text-base sm:text-lg">Total Expenses</span>
          </div>
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">₹{totalExpenses.toLocaleString()}</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-2xl p-4 sm:p-6 backdrop-blur-sm border border-blue-500/20"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            {expensesTrend >= 0 ? (
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
            ) : (
              <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
            )}
            <span className="text-blue-300 font-medium text-base sm:text-lg">This Month</span>
          </div>
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">₹{currentMonthExpenses.toLocaleString()}</p>
          <p className={`text-xs sm:text-sm mt-1 ${expensesTrend >= 0 ? 'text-red-400' : 'text-green-400'}`}>
            {expensesTrend >= 0 ? '+' : ''}₹{expensesTrend.toLocaleString()} from last month
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-2xl p-4 sm:p-6 backdrop-blur-sm border border-green-500/20"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
            <span className="text-green-300 font-medium text-base sm:text-lg">Friends</span>
          </div>
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">{totalFriends}</p>
          <p className="text-xs sm:text-sm text-green-400 mt-1">Active connections</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-2xl p-4 sm:p-6 backdrop-blur-sm border border-orange-500/20"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
            <span className="text-orange-300 font-medium text-base sm:text-lg">Categories</span>
          </div>
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">{chartData?.categoryData.length || 0}</p>
          <p className="text-xs sm:text-sm text-orange-400 mt-1">Expense categories</p>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
        {/* Category Distribution - Pie Chart */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-gradient-to-br from-black/40 to-black/20 rounded-2xl p-4 sm:p-6 md:p-8 backdrop-blur-sm border border-white/10"
          data-chart-id="pie-chart"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <PieChartIcon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Expense Categories</h3>
          </div>
          <Suspense fallback={<ChartSkeleton />}>
            {visibleCharts.has('pie-chart') || typeof window === 'undefined' ? (
              <ResponsiveContainer width="100%" height={250} className="sm:h-[350px]">
                <PieChart>
                  <Pie
                    data={chartData?.categoryData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    strokeWidth={2}
                    stroke="rgba(255,255,255,0.1)"
                  >
                    {chartData?.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <ChartSkeleton />
            )}
          </Suspense>
        </motion.div>

        {/* Monthly Trends - Area Chart */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-gradient-to-br from-black/40 to-black/20 rounded-2xl p-4 sm:p-6 md:p-8 backdrop-blur-sm border border-white/10"
          data-chart-id="area-chart"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Monthly Trends</h3>
          </div>
          <Suspense fallback={<ChartSkeleton />}>
            {visibleCharts.has('area-chart') || typeof window === 'undefined' ? (
              <ResponsiveContainer width="100%" height={250} className="sm:h-[350px]">
                <AreaChart data={chartData?.trendData}>
                  <defs>
                    <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    fill="url(#expensesGradient)"
                    name="Expenses"
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="#10B981"
                    strokeWidth={2}
                    fill="url(#incomeGradient)"
                    name="Income"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <ChartSkeleton />
            )}
          </Suspense>
        </motion.div>
      </div>

      {/* Friends Comparison - Enhanced Bar Chart */}
      <motion.div
        whileHover={{ scale: 1.005 }}
        className="bg-gradient-to-br from-black/40 to-black/20 rounded-2xl p-4 sm:p-6 md:p-8 backdrop-blur-sm border border-white/10"
        data-chart-id="bar-chart"
      >
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Friends Balance Overview</h3>
        </div>
        <Suspense fallback={<ChartSkeleton />}>
          {visibleCharts.has('bar-chart') || typeof window === 'undefined' ? (
            <ResponsiveContainer width="100%" height={300} className="sm:h-[400px]">
              <BarChart data={chartData?.friendsData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="you"
                  fill="#8B5CF6"
                  name="You Owe"
                  radius={[4, 4, 0, 0]}
                  strokeWidth={1}
                  stroke="rgba(139, 92, 246, 0.3)"
                />
                <Bar
                  dataKey="friend"
                  fill="#10B981"
                  name="They Owe"
                  radius={[4, 4, 0, 0]}
                  strokeWidth={1}
                  stroke="rgba(16, 185, 129, 0.3)"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ChartSkeleton />
          )}
        </Suspense>
      </motion.div>
    </motion.div>
  );
}