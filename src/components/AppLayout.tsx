"use client";
import { useState } from "react";
import Sidebar from "./Sidebar";
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
      <div className="min-h-screen bg-background text-foreground flex p-6">
        {/* Sidebar - Always visible, same as on PC */}
        <div className="w-64 bg-white/5 backdrop-blur-lg rounded-2xl p-4 border border-white/10 flex-shrink-0 mr-6">
          <Sidebar 
            onAddFriendClick={() => setShowAddFriendModal(true)}
            onManagementClick={() => setShowManagementModal(true)}
          />
        </div>

        {/* Main Content - Same width and styling as on PC */}
        <div className="flex-1">
          {children}
        </div>
      </div>

      {/* Remove mobile navigation to maintain consistent layout */}
      
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