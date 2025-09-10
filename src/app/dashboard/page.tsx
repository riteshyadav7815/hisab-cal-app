import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardContent from "@/components/DashboardContent";

export default async function Dashboard() {
  const session = await auth();
  
  if (!session) {
    redirect("/");
  }

  return <DashboardContent user={session.user} />;
}
