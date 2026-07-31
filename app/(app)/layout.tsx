import { requireUser } from "@/lib/rbac";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="flex min-h-screen">
      <AppSidebar role={user.role} />
      <div className="flex flex-1 flex-col">
        <AppHeader name={user.name ?? user.email ?? ""} role={user.role} />
        <main className="flex-1 bg-muted/20 p-6">{children}</main>
      </div>
    </div>
  );
}
