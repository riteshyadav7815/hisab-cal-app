"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardContent from "./DashboardContent";
import LoginModal from "./LoginModal";
import ThreeBackground from "./ThreeBackground";

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  username?: string | null;
  image?: string | null;
  userNumber?: number | null;
}

export default function DashboardWrapper() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      // Not authenticated, show login modal
      setShowLoginModal(true);
    }
  }, [status]);

  useEffect(() => {
    if (session?.user?.id) {
      // Fetch user with userNumber
      fetch(`/api/user/${session.user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setUser(data.user);
          }
        })
        .catch(error => {
          console.error('Error fetching user:', error);
          // Fallback to session user data
          setUser({
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            image: session.user.image,
            userNumber: session.user.userNumber
          });
        });
    }
  }, [session]);

  // Handle login success
  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    // Refresh the session to ensure it's up to date
    window.location.reload();
  };

  // Handle modal close without login
  const handleModalClose = () => {
    setShowLoginModal(false);
    // If user closes modal without logging in, redirect to landing page
    if (status === "unauthenticated") {
      router.push("/");
    }
  };

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

  // If not authenticated, show login modal
  if (status === "unauthenticated") {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-[#1A1735] via-[#2D1B69] to-[#1A1735]">
        <ThreeBackground />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
              Welcome to Dashboard
            </h1>
            <p className="text-2xl text-gray-300 mb-8">Please sign in to continue</p>
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl font-semibold text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-200 hover:scale-105 transform"
            >
              Sign In
            </button>
          </div>
        </div>
        
        {/* Login Modal */}
        <LoginModal 
          isOpen={showLoginModal} 
          allowClose={true}
          onClose={handleModalClose}
        />
      </div>
    );
  }

  // If authenticated and we have user data, show dashboard
  if (session && user) {
    return <DashboardContent user={user} />;
  }

  // Fallback - show dashboard without user data
  return <DashboardContent />;
}