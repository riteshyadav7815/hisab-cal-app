"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import DashboardContent from "./DashboardContent";
import LoginModal from "./LoginModal";
import ThreeBackground from "./ThreeBackground";

export default function DashboardWrapper() {
  const { data: session, status } = useSession();
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (status === "loading") return; // Still loading
    
    if (!session) {
      // Not authenticated, show login modal
      setShowLoginModal(true);
    } else {
      // Authenticated, hide login modal
      setShowLoginModal(false);
    }
  }, [session, status]);

  // Show loading state
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
    <div className="relative min-h-screen">
      {session ? (
        // User is authenticated, show dashboard
        <DashboardContent user={session.user} />
      ) : (
        // User not authenticated, show dashboard preview with modal
        <div className="relative min-h-screen bg-gradient-to-br from-[#1A1735] via-[#2D1B69] to-[#1A1735]">
          <ThreeBackground />
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center text-white">
              <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                Welcome to Dashboard
              </h1>
              <p className="text-2xl text-gray-300">Please sign in to continue</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Login Modal - shows when user is not authenticated, cannot be closed */}
      <LoginModal 
        isOpen={showLoginModal} 
        allowClose={!!session} // Only allow closing if user is authenticated
        onClose={() => {
          // Only allow closing if user is authenticated
          if (session) {
            setShowLoginModal(false);
          }
          // If not authenticated, do nothing (modal stays open)
        }} 
      />
    </div>
  );
}