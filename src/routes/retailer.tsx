import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Sidebar } from "@/components/layout/Sidebar";

export const Route = createFileRoute("/retailer")({
  component: RetailerLayout,
});

function RetailerLayout() {
  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar role="retailer" />
      <div className="flex-1 min-w-0 flex flex-col">
        <Outlet />
      </div>
    </div>
  );
}
