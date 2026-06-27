import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Sidebar } from "@/components/layout/Sidebar";
import { requireRole } from "@/lib/auth";

export const Route = createFileRoute("/distributor")({
  beforeLoad: () => {
    requireRole("distributor");
  },
  component: DistributorLayout,
});

function DistributorLayout() {
  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar role="distributor" />
      <div className="flex-1 min-w-0 flex flex-col">
        <Outlet />
      </div>
    </div>
  );
}
