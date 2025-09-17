import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import MoneyTransferContent from "@/components/MoneyTransferContent";

export default async function MoneyTransfer() {
  // Get user session (can be null)
  const session = await getServerSession(authOptions);

  return <MoneyTransferContent user={session?.user} />;
}