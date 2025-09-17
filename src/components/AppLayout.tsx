"use client";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import MobileNavigation from "./MobileNavigation";
import AddFriendModal from "./AddFriendModal";
import { ProtectedActionProvider } from "./ProtectedActionProvider";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  // Ensure we only decide layout on the client to avoid hydration issues
  useEffect(() => {
    setIsMounted(true);

    const media = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return (
    <ProtectedActionProvider>
      {/* While mounting, render nothing to prevent double paint on mobile */}
      {!isMounted || isDesktop === null ? null : (
        isDesktop ? (
          // Desktop Layout (>= md)
          <div className="min-h-screen bg-background text-foreground p-6 flex">
            {/* Sidebar - Visible on desktop */}
            <div className="w-64 bg-white/5 backdrop-blur-lg rounded-2xl p-4 border border-white/10 flex-shrink-0 mr-6">
              <Sidebar 
                onAddFriendClick={() => setShowAddFriendModal(true)}
              />
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {children}
            </div>
          </div>
        ) : (
          // Mobile Layout (< md)
          <div className="min-h-screen bg-background text-foreground flex flex-col">
            {/* Main Content - Full width on mobile */}
            <div className="flex-1 pb-20">
              {children}
            </div>

            {/* Mobile Navigation - Fixed at bottom */}
            <MobileNavigation 
              onAddFriendClick={() => setShowAddFriendModal(true)}
            />
          </div>
        )
      )}

      {/* Global Modals */}
      <AddFriendModal 
        isOpen={showAddFriendModal} 
        onClose={() => setShowAddFriendModal(false)} 
      />
    </ProtectedActionProvider>
  );
}