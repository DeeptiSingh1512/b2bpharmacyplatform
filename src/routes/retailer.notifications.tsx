import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Truck, IndianRupee, Boxes, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getNotifications, markAllAsRead, markAsRead } from "@/api/notifications";
import { normalizeNotification } from "@/lib/api-adapters";

export const Route = createFileRoute("/retailer/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Retailer" }] }),
  component: NotificationsPage,
});

const iconMap = {
  order: Truck,
  payment: IndianRupee,
  stock: Boxes,
  system: Megaphone,
  status: Truck,
} as const;

function NotificationsPage() {
  const [notifications, setNotifications] = useState<Array<ReturnType<typeof normalizeNotification>>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getNotifications();
      setNotifications((data as Array<Record<string, unknown>>).map(normalizeNotification));
    } catch {
      setError("Unable to load notifications. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: number | string) => {
    try {
      await markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch {
      setError("Unable to mark notification as read. Please try again.");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      setError("Unable to mark all notifications as read.");
    }
  };

  return (
    <>
      <Topbar title="Notifications" subtitle="Order, payment and stock updates in one place." />
      <main className="p-4 sm:p-6 max-w-3xl">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">{notifications.length} updates</CardTitle>
              {unreadCount > 0 ? (
                <span className="rounded-full bg-primary/10 text-primary px-2 py-1 text-xs font-medium">{unreadCount} unread</span>
              ) : null}
            </div>
            <Button variant="ghost" size="sm" disabled={unreadCount === 0} onClick={handleMarkAllRead}>
              Mark all read
            </Button>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {isLoading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">Loading notifications…</div>
            ) : notifications.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">No notifications found.</div>
            ) : (
              notifications.map((n) => {
                const Icon = iconMap[n.type as keyof typeof iconMap] ?? Bell;
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
                    {!n.read ? (
                      <Button size="sm" variant="outline" onClick={() => handleMarkAsRead(n.id)}>
                        Mark as read
                      </Button>
                    ) : null}
                  </div>
                );
              })
            )}
          </CardContent>
          {error ? <div className="px-4 pb-4 text-sm text-destructive">{error}</div> : null}
        </Card>
      </main>
    </>
  );
}
