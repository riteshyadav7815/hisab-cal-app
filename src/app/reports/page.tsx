import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ReportsContent from "@/components/ReportsContent";

export default async function Reports() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/");
  }

  return <ReportsContent />;
}