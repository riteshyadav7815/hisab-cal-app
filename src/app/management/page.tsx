import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ManagementContent from "@/components/ManagementContent";

export default async function Management() {
  const session = await getServerSession(authOptions);
  
  return <ManagementContent user={session?.user} />;
}