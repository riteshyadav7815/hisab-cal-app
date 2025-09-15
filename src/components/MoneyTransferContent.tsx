"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "./AppLayout";
import Header from "./Header";
import { ArrowLeftRight, ArrowUpCircle, ArrowDownCircle, Calculator, User, DollarSign, MessageSquare, Send } from "lucide-react";
import { refreshDashboard } from "./ExpenseOverview";
import { cachedFetch } from "@/lib/api-cache";

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  username?: string | null;
  image?: string | null;
}

interface Friend {
  id: string;
  name: string;
  avatar?: string;
  balance: number;
  lastActivity: string;
  email?: string;
}

interface MoneyTransferContentProps {
  user: User;
}

export default function MoneyTransferContent({ user }: MoneyTransferContentProps) {
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [transferType, setTransferType] = useState<'give' | 'receive'>('give');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculatorDisplay, setCalculatorDisplay] = useState('0');
  const [calculatorOperation, setCalculatorOperation] = useState<string | null>(null);
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [waitingForValue, setWaitingForValue] = useState(false);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching friends for money transfer...');
      
      const data = await cachedFetch('/api/friendships', {}, 30000); // Cache for 30 seconds
      
      if (data.success && data.data) {
        setFriends(data.data.map((friend: any) => ({
          id: friend.id,
          name: friend.name,
          avatar: friend.avatar || '👤',
          balance: friend.balance || 0,
          lastActivity: friend.lastTransactionAt 
            ? `Last transaction: ${new Date(friend.lastTransactionAt).toLocaleDateString()}`
            : 'No recent activity',
          email: friend.email
        })));
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculatorInput = (value: string) => {
    // Handle number inputs
    if (!isNaN(Number(value))) {
      if (waitingForValue) {
        setCalculatorDisplay(value);
        setWaitingForValue(false);
      } else {
        setCalculatorDisplay(calculatorDisplay === '0' ? value : calculatorDisplay + value);
      }
      return;
    }

    // Handle operations
    if (['+', '-', '×', '÷'].includes(value)) {
      if (calculatorOperation && !waitingForValue) {
        // Perform the pending operation first
        const current = parseFloat(calculatorDisplay);
        const prev = parseFloat(previousValue || '0');
        let result = 0;

        switch (calculatorOperation) {
          case '+':
            result = prev + current;
            break;
          case '-':
            result = prev - current;
            break;
          case '×':
            result = prev * current;
            break;
          case '÷':
            result = current !== 0 ? prev / current : 0;
            break;
        }
        
        setCalculatorDisplay(String(result));
        setPreviousValue(String(result));
      } else {
        setPreviousValue(calculatorDisplay);
      }
      
      setCalculatorOperation(value);
      setWaitingForValue(true);
      return;
    }

    // Handle percentage
    if (value === '%') {
      const current = parseFloat(calculatorDisplay);
      const result = current / 100;
      setCalculatorDisplay(String(result));
      return;
    }

    // Handle equals
    if (value === '=') {
      if (calculatorOperation && previousValue !== null) {
        const current = parseFloat(calculatorDisplay);
        const prev = parseFloat(previousValue);
        let result = 0;

        switch (calculatorOperation) {
          case '+':
            result = prev + current;
            break;
          case '-':
            result = prev - current;
            break;
          case '×':
            result = prev * current;
            break;
          case '÷':
            result = current !== 0 ? prev / current : 0;
            break;
        }

        setCalculatorDisplay(String(result));
        setCalculatorOperation(null);
        setPreviousValue(null);
        setWaitingForValue(false);
      }
      return;
    }

    // Handle clear
    if (value === 'C') {
      setCalculatorDisplay('0');
      setCalculatorOperation(null);
      setPreviousValue(null);
      setWaitingForValue(false);
      return;
    }

    // Handle backspace
    if (value === '⌫') {
      if (calculatorDisplay.length > 1) {
        setCalculatorDisplay(calculatorDisplay.slice(0, -1));
      } else {
        setCalculatorDisplay('0');
      }
      return;
    }

    // Handle decimal
    if (value === '.') {
      if (!calculatorDisplay.includes('.')) {
        setCalculatorDisplay(calculatorDisplay + '.');
      }
      return;
    }

    // Handle Use button
    if (value === 'Use') {
      setAmount(calculatorDisplay);
      setShowCalculator(false);
      return;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFriend || !amount || parseFloat(amount) <= 0) {
      alert('Please select a friend and enter a valid amount');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          friendId: selectedFriend.id,
          amount: parseFloat(amount),
          type: transferType === 'give' ? 'GAVE' : 'RECEIVED',
          description: description || `${transferType === 'give' ? 'Money given to' : 'Money received from'} ${selectedFriend.name}`,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Transaction successful! ${transferType === 'give' ? 'Gave' : 'Received'} ₹${amount} ${transferType === 'give' ? 'to' : 'from'} ${selectedFriend.name}`);
        
        // Reset form
        setSelectedFriend(null);
        setAmount('');
        setDescription('');
        
        // Refresh dashboard data
        refreshDashboard();
        
        // Refresh friends data
        fetchFriends();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert('Failed to create transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculatorButtons = [
    ['C', '⌫', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '=', 'Use']
  ];

  return (
    <AppLayout>
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 h-full">
        {/* Header */}
        <Header user={user} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 mt-6"
        >
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-[#2B2746]/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
                  <ArrowLeftRight className="w-8 h-8 text-purple-400" />
                  <span>Money Transfer</span>
                </h1>
                <p className="text-gray-400 mt-2">Send or receive money from your friends</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCalculator(!showCalculator)}
                  className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center space-x-2 ${
                    showCalculator
                      ? 'bg-gradient-to-r from-[#7B5CFF] to-[#9B7FFF] text-white shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Calculator className="w-4 h-4" />
                  <span>{showCalculator ? 'Hide' : 'Show'} Calculator</span>
                </button>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Transfer Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-2 bg-[#2B2746]/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
            >
              <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                <Send className="w-5 h-5 text-purple-400" />
                <span>Transfer Details</span>
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Transfer Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Transfer Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTransferType('give')}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-center space-x-3 ${
                        transferType === 'give'
                          ? 'border-red-500 bg-gradient-to-r from-red-500 to-orange-500 text-white'
                          : 'border-white/20 bg-white/5 text-gray-300 hover:border-red-400 hover:bg-white/10'
                      }`}
                    >
                      <ArrowUpCircle className="w-6 h-6" />
                      <div className="text-left">
                        <div className="font-semibold">Give Money</div>
                        <div className="text-sm opacity-80">You pay to friend</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTransferType('receive')}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-center space-x-3 ${
                        transferType === 'receive'
                          ? 'border-green-500 bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                          : 'border-white/20 bg-white/5 text-gray-300 hover:border-green-400 hover:bg-white/10'
                      }`}
                    >
                      <ArrowDownCircle className="w-6 h-6" />
                      <div className="text-left">
                        <div className="font-semibold">Receive Money</div>
                        <div className="text-sm opacity-80">Friend pays you</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Friend Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    <User className="w-4 h-4 inline mr-2" />
                    Select Friend
                  </label>
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                    {loading ? (
                      <div className="text-gray-400 text-center py-4">Loading friends...</div>
                    ) : friends.length === 0 ? (
                      <div className="text-gray-400 text-center py-4">
                        No friends found. Add friends first!
                      </div>
                    ) : (
                      friends.map((friend) => (
                        <button
                          key={friend.id}
                          type="button"
                          onClick={() => setSelectedFriend(friend)}
                          className={`p-3 rounded-xl border transition-all duration-200 flex items-center space-x-3 ${
                            selectedFriend?.id === friend.id
                              ? 'border-purple-500 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-white'
                              : 'border-white/20 bg-white/5 text-gray-300 hover:border-purple-400 hover:bg-white/10'
                          }`}
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center text-white">
                            {friend.avatar}
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-semibold">{friend.name}</div>
                            <div className="text-xs opacity-70">
                              Balance: {friend.balance > 0 ? '+' : ''}₹{Math.abs(friend.balance)}
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-2" />
                    Amount (₹) *
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCalculator(!showCalculator)}
                      className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-200"
                    >
                      <Calculator className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <MessageSquare className="w-4 h-4 inline mr-2" />
                    Description (Optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What's this for?"
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedFriend || !amount}
                  className={`w-full py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                    isSubmitting || !selectedFriend || !amount
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : transferType === 'give'
                      ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:shadow-lg hover:shadow-red-500/25'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-green-500/25'
                  }`}
                >
                  <Send className="w-5 h-5" />
                  <span>
                    {isSubmitting 
                      ? 'Processing...' 
                      : `${transferType === 'give' ? 'Give' : 'Receive'} Money`
                    }
                  </span>
                </button>
              </form>
            </motion.div>

            {/* Calculator */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className={`bg-[#2B2746]/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20 ${
                showCalculator ? 'block' : 'hidden lg:block'
              }`}
            >
              <h3 className="text-lg font-bold text-white mb-6 text-center flex items-center justify-center space-x-2">
                <Calculator className="w-5 h-5 text-purple-400" />
                <span>Smart Calculator</span>
              </h3>
                
              {/* Calculator Display - Large Design */}
              <div className="mb-6 p-6 bg-gradient-to-br from-black/70 via-gray-900/60 to-purple-900/40 rounded-xl border border-purple-500/30 shadow-lg">
                <div className="text-right">
                  <div className="text-purple-300 text-sm h-6 mb-3 font-medium">
                    {calculatorOperation && previousValue && `${previousValue} ${calculatorOperation}`}
                  </div>
                  <div className="text-white text-3xl font-bold tracking-wider font-mono">
                    ₹{calculatorDisplay}
                  </div>
                </div>
              </div>

              {/* Calculator Buttons - Large 4-Column Grid */}
              <div className="space-y-3">
                {calculatorButtons.map((row, rowIndex) => (
                  <div key={rowIndex} className="grid grid-cols-4 gap-3">
                    {row.map((btn) => (
                      <button
                        key={btn}
                        onClick={() => handleCalculatorInput(btn)}
                        className={`p-4 rounded-xl font-bold text-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg border ${
                          ['÷', '×', '-', '+', '='].includes(btn)
                            ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white hover:shadow-blue-500/25 border-blue-500/40'
                            : btn === 'C' || btn === '⌫' || btn === '%'
                            ? 'bg-gradient-to-br from-gray-600 to-gray-700 text-white hover:shadow-gray-500/25 border-gray-500/40'
                            : btn === 'Use'
                            ? 'bg-gradient-to-br from-green-600 to-green-700 text-white hover:shadow-green-500/25 border-green-500/40 font-extrabold'
                            : 'bg-gradient-to-br from-slate-700 to-slate-800 text-white hover:from-slate-600 hover:to-slate-700 border-slate-600/40'
                        } ${btn === '0' ? 'col-span-2' : ''}`}
                      >
                        {btn}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}