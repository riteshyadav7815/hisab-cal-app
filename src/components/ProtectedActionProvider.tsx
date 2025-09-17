"use client";
import { useSession } from "next-auth/react";
import { createContext, useContext, useState, ReactNode } from "react";
import LoginModal from "./LoginModal";

interface ProtectedActionContextType {
  handleProtectedAction: (action: () => void) => void;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
}

const ProtectedActionContext = createContext<ProtectedActionContextType | undefined>(undefined);

export function ProtectedActionProvider({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleProtectedAction = (action: () => void) => {
    if (status === "authenticated") {
      action();
    } else {
      setShowLoginModal(true);
    }
  };

  return (
    <ProtectedActionContext.Provider value={{ 
      handleProtectedAction, 
      showLoginModal, 
      setShowLoginModal 
    }}>
      {children}
      <LoginModal 
        isOpen={showLoginModal} 
        allowClose={true}
        onClose={() => setShowLoginModal(false)} 
      />
    </ProtectedActionContext.Provider>
  );
}

export function useProtectedAction() {
  const context = useContext(ProtectedActionContext);
  if (context === undefined) {
    throw new Error("useProtectedAction must be used within a ProtectedActionProvider");
  }
  return context;
}