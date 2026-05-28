import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { returns, inr, products } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/retailer/returns")({
  head: () => ({ meta: [{ title: "Returns — Retailer" }] }),
  component: RetailerReturns,
});

const statusStyles = {
  Requested: "bg-muted text-muted-foreground",
  Approved: "bg-info/15 text-info",
  Rejected: "bg-destructive/10 text-destructive",
  Refunded: "bg-success/15 text-success",
};

function RetailerReturns() {
  return (
    <>
      <Topbar title="Return requests" subtitle="Raise a return for damaged or near-expiry stock." />
      <main className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">My returns</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>RT</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {returns.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.id}</TableCell>
                      <TableCell>{r.product}</TableCell>
                      <TableCell><span className="text-xs text-muted-foreground">{r.reason}</span></TableCell>
                      <TableCell className="text-right tabular-nums">{inr(r.amount)}</TableCell>
                      <TableCell>
                        <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", statusStyles[r.status])}>
                          {r.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader><CardTitle className="text-base">Raise a return</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Order</Label>
              <Input placeholder="ORD-9009" />
            </div>
            <div className="space-y-1.5">
              <Label>Product</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                <SelectContent>{products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Reason</Label>
              <Select defaultValue="Near expiry">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Near expiry", "Damaged packaging", "Wrong batch", "Quality issue"].map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea placeholder="Add any helpful detail…" rows={3} />
            </div>
            <Button className="w-full">Submit return</Button>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
