import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileContent from "@/components/ProfileContent";

export default async function Profile() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/");
  }

  return <ProfileContent user={session.user} />;
}
