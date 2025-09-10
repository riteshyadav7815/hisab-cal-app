import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ThreeBackground from "@/components/ThreeBackground";
import AuthCard from "@/components/AuthCard";

export default async function Home() {
  const session = await auth();
  
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
