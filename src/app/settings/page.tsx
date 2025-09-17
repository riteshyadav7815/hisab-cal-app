import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamically import the SettingsContent component with better loading strategy
const SettingsContent = dynamic(() => import("@/components/SettingsContent"), { 
  loading: () => (
    <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 rounded-2xl p-6 h-full animate-pulse">
      <div className="space-y-4">
        <div className="h-8 bg-white/10 rounded-lg w-1/3"></div>
        <div className="h-4 bg-white/10 rounded-lg w-full"></div>
        <div className="h-4 bg-white/10 rounded-lg w-2/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="h-64 bg-white/10 rounded-xl"></div>
          <div className="h-64 bg-white/10 rounded-xl"></div>
        </div>
      </div>
    </div>
  ),
  ssr: true // Enable SSR for better initial load
});

export default async function Settings() {
  const session = await getServerSession(authOptions);
  
  return (
    <Suspense fallback={
      <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 rounded-2xl p-6 h-full animate-pulse">
        <div className="space-y-4">
          <div className="h-8 bg-white/10 rounded-lg w-1/3"></div>
          <div className="h-4 bg-white/10 rounded-lg w-full"></div>
          <div className="h-4 bg-white/10 rounded-lg w-2/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="h-64 bg-white/10 rounded-xl"></div>
            <div className="h-64 bg-white/10 rounded-xl"></div>
          </div>
        </div>
      </div>
    }>
      <SettingsContent user={session?.user} />
    </Suspense>
  );
}