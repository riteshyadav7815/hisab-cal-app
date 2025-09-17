import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AddFriendContent from "@/components/AddFriendContent";

export default async function AddFriend() {
  // Get user session
  const session = await getServerSession(authOptions);
  
  return <AddFriendContent />;
}