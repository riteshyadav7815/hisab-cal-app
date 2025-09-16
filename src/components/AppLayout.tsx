"use client";
import { useState } from "react";
import Sidebar from "./Sidebar";
import MobileNavigation from "./MobileNavigation";
import AddFriendModal from "./AddFriendModal";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);

  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden md:flex min-h-screen bg-background text-foreground p-6">
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

      {/* Mobile Layout */}
      <div className="md:hidden min-h-screen bg-background text-foreground flex flex-col">
        {/* Main Content - Full width on mobile */}
        <div className="flex-1 pb-20">
          {children}
        </div>

        {/* Mobile Navigation - Fixed at bottom */}
        <MobileNavigation 
          onAddFriendClick={() => setShowAddFriendModal(true)}
        />
      </div>

      {/* Global Modals */}
      <AddFriendModal 
        isOpen={showAddFriendModal} 
        onClose={() => setShowAddFriendModal(false)} 
      />
    </>
  );
}