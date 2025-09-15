import { redirect } from "next/navigation";

export default function Home() {
  // Always redirect to dashboard - login popup will show there if not authenticated
  redirect("/dashboard");
}
