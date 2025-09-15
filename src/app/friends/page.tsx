import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AddFriendContent from "@/components/AddFriendContent";

export default async function AddFriend() {
  // Get user session
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/");
  }

  return <AddFriendContent />;
}