import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { retailers, inr } from "@/lib/mock-data";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/distributor/retailers")({
  head: () => ({ meta: [{ title: "Retailers — Distributor" }] }),
  component: RetailersPage,
});

function RetailersPage() {
  const pending = retailers.filter((r) => r.status === "Pending");
  const approved = retailers.filter((r) => r.status === "Approved");

  return (
    <>
      <Topbar title="Retailers" subtitle="Approve new pharmacies and manage relationships." />
      <main className="p-4 sm:p-6 space-y-6">
        {pending.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pending approvals · {pending.length}</CardTitle>
              <p className="text-xs text-muted-foreground">Verify drug licence before approving.</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {pending.map((r) => (
                <div key={r.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">{r.name.charAt(0)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{r.owner} · {r.city} · Joined {new Date(r.joined).toLocaleDateString("en-IN")}</div>
                  </div>
                  <Button variant="outline" size="sm">View docs</Button>
                  <Button variant="outline" size="sm">Reject</Button>
                  <Button size="sm">Approve</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle className="text-base">Active retailers</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pharmacy</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Credit usage</TableHead>
                    <TableHead className="text-right">Limit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approved.map((r) => {
                    const pct = Math.round((r.creditUsed / r.creditLimit) * 100);
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.name}</TableCell>
                        <TableCell>{r.owner}</TableCell>
                        <TableCell>{r.city}</TableCell>
                        <TableCell className="min-w-[200px]">
                          <div className="flex items-center gap-2">
                            <Progress value={pct} className={cn("h-2", pct > 85 && "[&>div]:bg-destructive")} />
                            <span className="text-xs tabular-nums text-muted-foreground w-10">{pct}%</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">{inr(r.creditUsed)} used</div>
                        </TableCell>
                        <TableCell className="text-right tabular-nums font-medium">{inr(r.creditLimit)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
