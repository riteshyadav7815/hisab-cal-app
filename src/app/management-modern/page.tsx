import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamically import the ManagementContentModern component
const ManagementContentModern = dynamic(() => import("@/components/ManagementContentModern"), { 
  loading: () => <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 h-full animate-pulse">Loading management...</div>
});

export default async function ManagementModern() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/");
  }

  return (
    <Suspense fallback={<div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 h-full animate-pulse">Loading management...</div>}>
      <ManagementContentModern user={session.user} />
    </Suspense>
  );
}