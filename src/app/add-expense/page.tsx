import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AddExpenseContent from "@/components/AddExpenseContent";

export default async function AddExpense() {
  // Get user session (can be null)
  const session = await getServerSession(authOptions);

  return <AddExpenseContent user={session?.user} />;
}