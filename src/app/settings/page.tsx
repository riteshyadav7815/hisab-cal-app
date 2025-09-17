import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamically import the SettingsContent component
const SettingsContent = dynamic(() => import("@/components/SettingsContent"), { 
  loading: () => <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 rounded-2xl p-6 h-full animate-pulse">Loading settings...</div>
});

export default async function Settings() {
  const session = await getServerSession(authOptions);
  
  return (
    <Suspense fallback={<div className="bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 rounded-2xl p-6 h-full animate-pulse">Loading settings...</div>}>
      <SettingsContent user={session?.user} />
    </Suspense>
  );
}