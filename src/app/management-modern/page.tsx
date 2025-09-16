import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ManagementContentModern from "@/components/ManagementContentModern";

export default async function ManagementModern() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/");
  }

  return <ManagementContentModern user={session.user} />;
}