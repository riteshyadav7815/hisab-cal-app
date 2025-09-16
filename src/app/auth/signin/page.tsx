"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import LoginModal from "@/components/LoginModal";
import ThreeBackground from "@/components/ThreeBackground";

export default function SignInPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [showLoginModal, setShowLoginModal] = useState(true);

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  // Handle login success
  const handleLoginSuccess = () => {
    router.push("/dashboard");
  };

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
      <header className="absolute top-0 left-0 right-0 p-6">
        <div className="text-2xl font-bold text-white">Hisab Cal</div>
      </header>

      {/* Login Modal */}
      <div className="flex items-center justify-center min-h-screen">
        <LoginModal 
          isOpen={showLoginModal} 
          allowClose={false}
          onClose={handleLoginSuccess}
        />
      </div>
    </div>
  );
}