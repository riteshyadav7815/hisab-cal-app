import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AddExpenseContent from "@/components/AddExpenseContent";

export default async function AddExpense() {
  // Get user session
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/");
  }

  return <AddExpenseContent user={session.user} />;
}