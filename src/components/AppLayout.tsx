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
      <div className="min-h-screen bg-background text-foreground flex p-4">
        {/* Sidebar */}
        <Sidebar 
          onAddFriendClick={() => setShowAddFriendModal(true)}
          onManagementClick={() => setShowManagementModal(true)}
        />

        {/* Main Content */}
        <div className="flex-1 ml-4">
          {children}
        </div>
      </div>

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