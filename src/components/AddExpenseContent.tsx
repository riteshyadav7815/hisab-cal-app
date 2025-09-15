"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "./AppLayout";
import Header from "./Header";
import { Plus, Calendar, DollarSign, Tag, User, FileText, Save } from "lucide-react";
import { refreshDashboard } from "./ExpenseOverview";

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  username?: string | null;
  image?: string | null;
}

interface AddExpenseContentProps {
  user: User;
}

const categories = [
  { name: "Food", icon: "🍕", color: "from-red-500 to-orange-500" },
  { name: "Travel", icon: "🚗", color: "from-blue-500 to-cyan-500" },
  { name: "Shopping", icon: "🛍️", color: "from-purple-500 to-pink-500" },
  { name: "Entertainment", icon: "🎬", color: "from-green-500 to-emerald-500" },
  { name: "Health", icon: "💊", color: "from-indigo-500 to-purple-500" },
  { name: "Bills", icon: "📱", color: "from-yellow-500 to-orange-500" },
  { name: "Education", icon: "📚", color: "from-teal-500 to-cyan-500" },
  { name: "Other", icon: "💰", color: "from-gray-500 to-slate-500" },
];

export default function AddExpenseContent({ user }: AddExpenseContentProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    date: new Date().toISOString().split('T')[0],
    description: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategorySelect = (category: string) => {
    setFormData(prev => ({
      ...prev,
      category
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.amount || !formData.category) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          amount: parseFloat(formData.amount),
          category: formData.category,
          date: new Date(formData.date),
          description: formData.description,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert('Expense added successfully!');
        
        // Reset form
        setFormData({
          title: "",
          amount: "",
          category: "",
          date: new Date().toISOString().split('T')[0],
          description: "",
        });

        // Refresh dashboard data
        refreshDashboard();
        
        // Navigate back to dashboard
        router.push('/dashboard');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="bg-gradient-to-br from-[#121020] via-[#1E1B34] to-[#1A1735] rounded-2xl p-6 h-full">
        {/* Background Effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        </div>

        <div className="relative">
          {/* Header */}
          <Header user={user} />

          <div className="mt-6">
            {/* Page Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-[#2B2746]/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20 mb-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
                    <Plus className="w-8 h-8 text-purple-400" />
                    <span>Add New Expense</span>
                  </h1>
                  <p className="text-gray-400 mt-2">Track your spending and manage your finances</p>
                </div>
                <button 
                  onClick={() => router.push('/dashboard')}
                  className="px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </motion.div>

            {/* Add Expense Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-[#2B2746]/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title and Amount Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <FileText className="w-4 h-4 inline mr-2" />
                      Expense Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g., Lunch at restaurant"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <DollarSign className="w-4 h-4 inline mr-2" />
                      Amount (₹) *
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-4">
                    <Tag className="w-4 h-4 inline mr-2" />
                    Category *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {categories.map((category) => (
                      <button
                        key={category.name}
                        type="button"
                        onClick={() => handleCategorySelect(category.name)}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          formData.category === category.name
                            ? `border-purple-500 bg-gradient-to-r ${category.color} text-white`
                            : 'border-white/20 bg-white/5 text-gray-300 hover:border-purple-400 hover:bg-white/10'
                        }`}
                      >
                        <div className="text-2xl mb-1">{category.icon}</div>
                        <div className="text-sm font-medium">{category.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Description (Optional)
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Add any additional notes..."
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => router.push('/dashboard')}
                    className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-6 py-3 bg-gradient-to-r from-[#7B5CFF] to-[#9B7FFF] text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 flex items-center space-x-2 ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Save className="w-4 h-4" />
                    <span>{loading ? 'Adding...' : 'Add Expense'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}