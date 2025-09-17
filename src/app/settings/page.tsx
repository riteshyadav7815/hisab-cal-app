import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SettingsContent from "@/components/SettingsContent";

export default async function Settings() {
  const session = await getServerSession(authOptions);
  
  return <SettingsContent user={session?.user} />;
}