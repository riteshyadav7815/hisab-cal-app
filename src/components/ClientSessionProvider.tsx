"use client";
import { SessionProvider } from "next-auth/react";
import { ProtectedActionProvider } from "./ProtectedActionProvider";

export default function ClientSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <ProtectedActionProvider>
        {children}
      </ProtectedActionProvider>
    </SessionProvider>
  );
}