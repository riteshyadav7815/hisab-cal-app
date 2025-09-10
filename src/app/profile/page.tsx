import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileContent from "@/components/ProfileContent";

export default async function Profile() {
  const session = await auth();
  
  if (!session) {
    redirect("/");
  }

  return <ProfileContent user={session.user} />;
}
