import { redirect } from "next/navigation";

// Voice agent is now a global companion widget (in layout).
// Redirect this old page to home.
export default function VoicePage() {
  redirect("/");
}
