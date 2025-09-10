import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ExpensesContent from "@/components/ExpensesContent";

export default async function Expenses() {
  const session = await auth();
  
  if (!session) {
    redirect("/");
  }

  return <ExpensesContent user={session.user} />;
}
