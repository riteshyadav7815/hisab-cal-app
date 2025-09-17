"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardContent from "./DashboardContent";
import LoginModal from "./LoginModal";
import LazyThreeBackground from "./LazyThreeBackground";

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

  // Show loading state
  if (status === "loading") {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-[#1A1735] via-[#2D1B69] to-[#1A1735]">
        <LazyThreeBackground />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-2xl font-semibold">Loading...</div>
        </div>
      </div>
    );
  }

  // Show dashboard content regardless of authentication status
  // Protected actions will trigger login modal when needed
  return (
    <>
      <DashboardContent user={user || undefined} />
      
      {/* Login Modal - only shown when needed for protected actions */}
      <LoginModal 
        isOpen={showLoginModal} 
        allowClose={true}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
}