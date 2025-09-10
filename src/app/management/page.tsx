import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ManagementContent from "@/components/ManagementContent";

export default async function Management() {
  const session = await auth();
  
  if (!session) {
    redirect("/");
  }

  return <ManagementContent user={session.user} />;
}
