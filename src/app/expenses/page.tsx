import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ExpensesContent from "@/components/ExpensesContent";

export default async function Expenses() {
  // Get user session
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/");
  }

  return <ExpensesContent user={session.user} />;
}
