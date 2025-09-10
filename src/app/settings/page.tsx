import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import SettingsContent from "@/components/SettingsContent";

export default async function Settings() {
  const session = await auth();
  
  if (!session) {
    redirect("/");
  }

  return <SettingsContent user={session.user} />;
}
