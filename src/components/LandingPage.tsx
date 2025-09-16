"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import LoginModal from "./LoginModal";
import ThreeBackground from "./ThreeBackground";

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  // Show loading state while checking auth status
  if (status === "loading") {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-[#1A1735] via-[#2D1B69] to-[#1A1735]">
        <ThreeBackground />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-2xl font-semibold">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#1A1735] via-[#2D1B69] to-[#1A1735]">
      <ThreeBackground />
      
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center">
        <div className="text-2xl font-bold text-white">Hisab Cal</div>
        <button
          onClick={() => setShowLoginModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl font-semibold text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
        >
          Sign In
        </button>
      </header>

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
          Smart Expense Management
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl">
          Track expenses with friends, manage balances, and get powerful insights into your spending habits.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => setShowLoginModal(true)}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl font-semibold text-white text-lg shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
          >
            Get Started
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-8 py-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl font-semibold text-white text-lg hover:bg-white/20 transition-all duration-200"
          >
            View Demo
          </button>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-16">
            Why Choose Hisab Cal?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-white mb-2">Smart Tracking</h3>
              <p className="text-gray-300">
                Automatically track and categorize your expenses with our intelligent system.
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-white mb-2">Group Expenses</h3>
              <p className="text-gray-300">
                Easily split bills and track shared expenses with friends and family.
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold text-white mb-2">Secure & Private</h3>
              <p className="text-gray-300">
                Your financial data is encrypted and never shared with third parties.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 text-center text-gray-400">
        <p>© {new Date().getFullYear()} Hisab Cal. All rights reserved.</p>
      </footer>

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        allowClose={true}
        onClose={() => setShowLoginModal(false)} 
      />
    </div>
  );
}
