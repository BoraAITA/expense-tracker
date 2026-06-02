import { AppSidebar } from "@/components/layout/app-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden md:block">
        <AppSidebar className="fixed inset-y-0 left-0 z-30" />
      </div>
      <div className="flex flex-1 flex-col md:pl-64">{children}</div>
    </div>
  );
}
