"use client";
import { useEffect, useState, useCallback } from "react";

interface Stats {
  totalExpenses: number;
  totalOwed: number;
  totalOwing: number;
  friendsCount: number;
  expensesCount: number;
  pendingSettlements: number;
  biggestCategory: string;
  biggestCategoryAmount: number;
  monthlyChange: number;
}

// Global function for refreshing dashboard data
export const refreshDashboard = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dashboardRefresh'));
  }
};

export default function ExpenseOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard');
      if (response.ok) {
        const data = await response.json();
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    // Listen for refresh events
    const handleRefresh = () => {
      fetchStats();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('dashboardRefresh', handleRefresh);
      return () => {
        window.removeEventListener('dashboardRefresh', handleRefresh);
      };
    }
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 animate-pulse">
            <div className="h-20 bg-white/10 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const netBalance = stats ? stats.totalOwed - stats.totalOwing : 0;

  const expenseData = [
    {
      title: "Total Expenses",
      value: stats ? formatCurrency(stats.totalExpenses) : "₹0",
    },
    {
      title: "Net Balance",
      value: stats ? formatCurrency(netBalance) : "-₹0",
    },
    {
      title: "Pending Settlements",
      value: stats ? formatCurrency(stats.pendingSettlements) : "₹0",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {expenseData.map((item, index) => (
        <div key={index} className="bg-black/20 rounded-xl p-4">
          <h3 className="text-gray-400 text-sm">{item.title}</h3>
          <p className="text-2xl font-semibold text-white">{item.value}</p>
        </div>
      ))}
      <div className="bg-black/20 rounded-xl p-4 flex justify-between items-center">
        <div>
          <h3 className="text-gray-400 text-sm">Biggest Expense Category</h3>
          <p className="text-2xl font-semibold text-white">{stats?.biggestCategory || 'N/A'}</p>
        </div>
        <div className="text-2xl">🍕</div>
      </div>
    </div>
  );
}
