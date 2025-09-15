import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import MoneyTransferContent from "@/components/MoneyTransferContent";

export default async function MoneyTransfer() {
  // Get user session
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/");
  }

  return <MoneyTransferContent user={session.user} />;
}