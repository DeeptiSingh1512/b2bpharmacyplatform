import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { returns, inr } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/distributor/returns")({
  head: () => ({ meta: [{ title: "Returns — Distributor" }] }),
  component: ReturnsPage,
});

const statusStyles = {
  Requested: "bg-muted text-muted-foreground",
  Approved: "bg-info/15 text-info",
  Rejected: "bg-destructive/10 text-destructive",
  Refunded: "bg-success/15 text-success",
};

function ReturnsPage() {
  return (
    <>
      <Topbar title="Returns" subtitle="Review and process return requests from retailers." />
      <main className="p-4 sm:p-6">
        <Card>
          <CardHeader><CardTitle className="text-base">{returns.length} return requests</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>RT ID</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Retailer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {returns.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.id}</TableCell>
                      <TableCell>{r.order}</TableCell>
                      <TableCell>{r.retailer}</TableCell>
                      <TableCell>{r.product}</TableCell>
                      <TableCell><span className="text-xs text-muted-foreground">{r.reason}</span></TableCell>
                      <TableCell className="text-right tabular-nums font-medium">{inr(r.amount)}</TableCell>
                      <TableCell>
                        <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", statusStyles[r.status])}>
                          {r.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {r.status === "Requested" ? (
                          <div className="flex gap-1 justify-end">
                            <Button size="sm" variant="outline">Reject</Button>
                            <Button size="sm">Approve</Button>
                          </div>
                        ) : (
                          <Button size="sm" variant="ghost">View</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
