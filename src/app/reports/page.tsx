import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ReportsContent from "@/components/ReportsContent";

export default async function Reports() {
  const session = await getServerSession(authOptions);
  
  return <ReportsContent />;
}