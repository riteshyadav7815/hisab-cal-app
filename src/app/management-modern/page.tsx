import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamically import the ManagementContentModern component with better loading strategy
const ManagementContentModern = dynamic(() => import("@/components/ManagementContentModern"), { 
  loading: () => (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 h-full animate-pulse">
      <div className="space-y-4">
        <div className="h-8 bg-white/10 rounded-lg w-1/2"></div>
        <div className="h-4 bg-white/10 rounded-lg w-full"></div>
        <div className="h-4 bg-white/10 rounded-lg w-3/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-white/10 rounded-xl"></div>
          ))}
        </div>
        <div className="h-64 bg-white/10 rounded-xl mt-8"></div>
      </div>
    </div>
  ),
  ssr: true // Enable SSR for better initial load
});

export default async function ManagementModern() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/");
  }

  return (
    <Suspense fallback={
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 h-full animate-pulse">
        <div className="space-y-4">
          <div className="h-8 bg-white/10 rounded-lg w-1/2"></div>
          <div className="h-4 bg-white/10 rounded-lg w-full"></div>
          <div className="h-4 bg-white/10 rounded-lg w-3/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-white/10 rounded-xl"></div>
            ))}
          </div>
          <div className="h-64 bg-white/10 rounded-xl mt-8"></div>
        </div>
      </div>
    }>
      <ManagementContentModern user={session.user} />
    </Suspense>
  );
}