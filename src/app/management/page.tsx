import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ManagementContent from "@/components/ManagementContent";
import AppLayout from "@/components/AppLayout";

export default async function Management() {
  const session = await getServerSession(authOptions);
  
  return (
    <AppLayout>
      <ManagementContent user={session?.user} />
    </AppLayout>
  );
}