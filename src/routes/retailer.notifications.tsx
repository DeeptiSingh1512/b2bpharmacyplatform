import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notifications } from "@/lib/mock-data";
import { Bell, Truck, IndianRupee, Boxes, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/retailer/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Retailer" }] }),
  component: NotificationsPage,
});

const iconMap = {
  order: Truck,
  payment: IndianRupee,
  stock: Boxes,
  system: Megaphone,
} as const;

function NotificationsPage() {
  return (
    <>
      <Topbar title="Notifications" subtitle="Order, payment and stock updates in one place." />
      <main className="p-4 sm:p-6 max-w-3xl">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">{notifications.length} updates</CardTitle>
            <Button variant="ghost" size="sm">Mark all read</Button>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {notifications.map((n) => {
              const Icon = iconMap[n.type] ?? Bell;
              return (
                <div key={n.id} className="py-4 flex gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium truncate">{n.title}</div>
                      <span className="text-xs text-muted-foreground shrink-0">{n.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{n.body}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
