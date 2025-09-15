import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ThreeBackground from "@/components/ThreeBackground";
import AuthCard from "@/components/AuthCard";

export default async function SignInPage() {
  let session;
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    // Handle JWT decryption errors by treating as no session
    if (process.env.NODE_ENV === 'development') {
      console.log('Session error, treating as logged out:', error);
    }
    session = null;
  }
  
  // If user is already logged in, redirect to dashboard
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="relative min-h-screen">
      <ThreeBackground />
      <AuthCard />
    </div>
  );
}