import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ManagementContent from "@/components/ManagementContent";

export default async function Management() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/");
  }

  return <ManagementContent user={session.user} />;
}