import { AppShell } from "@/components/app-shell";
import { requireAppAccess } from "@/lib/subscription";
import { ChatWorkspace } from "./workspace";

export default async function ChatPage() {
  const { profile } = await requireAppAccess();

  return (
    <AppShell profile={profile}>
      <ChatWorkspace />
    </AppShell>
  );
}