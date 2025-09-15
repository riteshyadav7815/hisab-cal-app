"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { Calculator, Users, TrendingUp, Shield, ArrowRight, Play, Star, CheckCircle } from "lucide-react";
import ThreeBackground from "./ThreeBackground";
import LoginModal from "./LoginModal";

export default function LandingPage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleGetStarted = () => {
    setShowLoginModal(true);
  };

  const handleTryDemo = () => {
    setShowLoginModal(true);
  };

  const features = [
    {
      icon: Calculator,
      title: "Smart Calculator",
      description: "Built-in calculator for quick expense calculations with professional 4-column layout",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Users,
      title: "Friend Management",
      description: "Track expenses with friends, manage balances, and settle up with one click",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: TrendingUp,
      title: "Analytics & Reports",
      description: "Detailed insights into your spending patterns with beautiful charts and graphs",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your financial data is encrypted and secured with industry-standard protection",
      color: "from-orange-500 to-red-500"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Student",
      content: "Perfect for tracking shared expenses with roommates. The settlement feature is a game-changer!",
      rating: 5
    },
    {
      name: "Mike Chen",
      role: "Freelancer",
      content: "Clean interface and powerful features. Love the built-in calculator and expense analytics.",
      rating: 5
    },
    {
      name: "Emily Davis",
      role: "Professional",
      content: "Makes expense tracking effortless. The friend balance system works flawlessly.",
      rating: 5
    }
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#1A1735] via-[#2D1B69] to-[#1A1735] text-white overflow-hidden">
      <ThreeBackground />
      
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex justify-between items-center p-6 max-w-7xl mx-auto"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Hisab Cal</h1>
        </div>
        
        <motion.button
          onClick={handleGetStarted}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
        >
          Sign In
        </motion.button>
      </motion.header>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center"
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent"
        >
          Smart Expense
          <br />
          Management
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
        >
          Track expenses with friends, manage balances, and get powerful insights with our intuitive expense tracking platform
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.button
            onClick={handleGetStarted}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300 flex items-center space-x-2"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
          
          <motion.button
            onClick={handleTryDemo}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-300 flex items-center space-x-2"
          >
            <Play className="w-5 h-5" />
            <span>Try Demo</span>
          </motion.button>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="relative z-10 max-w-7xl mx-auto px-6 py-20"
      >
        <h2 className="text-4xl font-bold text-center mb-16">
          Everything You Need for
          <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"> Smart Tracking</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                onHoverStart={() => setHoveredFeature(index)}
                onHoverEnd={() => setHoveredFeature(null)}
                className="relative group"
              >
                <div className="h-full p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:border-white/20 hover:shadow-xl">
                  <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="relative z-10 max-w-7xl mx-auto px-6 py-20"
      >
        <h2 className="text-4xl font-bold text-center mb-16">
          Loved by
          <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"> Thousands</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-4 leading-relaxed">"{testimonial.content}"</p>
              <div>
                <p className="font-semibold">{testimonial.name}</p>
                <p className="text-gray-400 text-sm">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center"
      >
        <div className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 backdrop-blur-sm border border-white/20 rounded-3xl p-12">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Take Control of Your
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"> Expenses?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already managing their finances smarter with Hisab Cal
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.button
              onClick={handleGetStarted}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-5 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl font-bold text-xl hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300 flex items-center space-x-3"
            >
              <CheckCircle className="w-6 h-6" />
              <span>Start Free Today</span>
            </motion.button>
          </div>
          
          <p className="text-gray-400 mt-6">No credit card required • Free forever plan available</p>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 mt-20 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Calculator className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold">Hisab Cal</span>
          </div>
          <p className="text-gray-400">© 2024 Hisab Cal. All rights reserved.</p>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </div>
  );
}