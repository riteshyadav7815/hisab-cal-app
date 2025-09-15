"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  description?: string;
  date: string;
  createdAt: string;
}

interface ExpenseListProps {
  filters?: {
    category?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  };
}

export default function ExpenseList({ filters }: ExpenseListProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const fetchExpenses = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(filters?.category && filters.category !== 'all' && { category: filters.category }),
        ...(filters?.startDate && { startDate: filters.startDate }),
        ...(filters?.endDate && { endDate: filters.endDate }),
        ...(filters?.search && { search: filters.search }),
      });

      const response = await fetch(`/api/expenses?${params}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setExpenses(data.expenses);
          setPagination(data.pagination);
        }
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses(1);
  }, [filters]);

  const handlePageChange = (newPage: number) => {
    fetchExpenses(newPage);
  };

  const getCategoryEmoji = (category: string) => {
    const emojiMap: { [key: string]: string } = {
      Food: '🍽️',
      Travel: '🚗',
      Shopping: '🛍️',
      Entertainment: '🎬',
      Health: '💊',
      Bills: '📄',
      Education: '📚',
      Other: '📝',
    };
    return emojiMap[category] || '📝';
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
      >
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
          <span className="ml-2 text-white">Loading expenses...</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Expenses</h2>
        <span className="text-gray-400 text-sm">
          {pagination.totalCount} total expenses
        </span>
      </div>
      
      {expenses.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-gray-400 text-lg mb-2">No expenses found</p>
          <p className="text-gray-500 text-sm">Try adjusting your filters or add some expenses</p>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {expenses.map((expense, index) => (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 border border-white/10"
              >
                <div className="flex items-center space-x-4">
                  {/* Expense Photo */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-xl">
                    {getCategoryEmoji(expense.category)}
                  </div>
                  
                  {/* Expense Info */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-semibold text-base">{expense.title}</h3>
                        {expense.description && (
                          <p className="text-gray-400 text-sm">{expense.description}</p>
                        )}
                        <p className="text-gray-500 text-xs">
                          {new Date(expense.date).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-white font-bold text-lg">₹{expense.amount.toLocaleString()}</p>
                        <p className="text-gray-400 text-sm">{expense.category}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-gray-400 text-sm">
                Page {pagination.page} of {pagination.totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPreviousPage}
                  className="p-2 rounded-lg bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNextPage}
                  className="p-2 rounded-lg bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
