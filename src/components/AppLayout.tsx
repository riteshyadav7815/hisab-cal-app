"use client";
import { useState } from "react";
import Sidebar from "./Sidebar";
import MobileNavigation from "./MobileNavigation";
import AddFriendModal from "./AddFriendModal";
import ManagementModal from "./ManagementModal";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [showManagementModal, setShowManagementModal] = useState(false);

  return (
    <>
      <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row p-2 sm:p-4 md:p-6 pb-20 md:pb-6">
        {/* Sidebar - Hidden on mobile, shown on larger screens */}
        <div className="hidden md:block w-full md:w-64 bg-white/5 backdrop-blur-lg rounded-2xl p-4 border border-white/10 flex-shrink-0 mr-0 md:mr-4 mb-4 md:mb-0">
          <Sidebar 
            onAddFriendClick={() => setShowAddFriendModal(true)}
            onManagementClick={() => setShowManagementModal(true)}
          />
        </div>

        {/* Main Content - Full width on mobile, reduced on larger screens */}
        <div className="flex-1 w-full">
          {children}
        </div>
      </div>

      {/* Mobile Navigation - Shown only on mobile */}
      <MobileNavigation 
        onAddFriendClick={() => setShowAddFriendModal(true)}
        onManagementClick={() => setShowManagementModal(true)}
      />

      {/* Global Modals */}
      <AddFriendModal 
        isOpen={showAddFriendModal} 
        onClose={() => setShowAddFriendModal(false)} 
      />
      <ManagementModal 
        isOpen={showManagementModal} 
        onClose={() => setShowManagementModal(false)} 
      />
    </>
  );
}