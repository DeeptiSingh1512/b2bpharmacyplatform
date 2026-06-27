import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { inr, normalizeReturn, toBackendReturnStatus } from "@/lib/api-adapters";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { getReturns, updateReturnStatus } from "@/api/returns";

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
  const [returnsData, setReturnsData] = useState<Array<any>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | number | null>(null);

  const fetchReturns = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getReturns();
      setReturnsData((data as Array<Record<string, unknown>>).map(normalizeReturn));
    } catch (err: unknown) {
      setError("Unable to load return requests. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleStatus = async (id: string | number, status: string) => {
    setSavingId(id);
    setError(null);
    try {
      await updateReturnStatus(id, toBackendReturnStatus(status));
      setReturnsData((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    } catch (err: unknown) {
      setError("Unable to update return status. Please try again.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <>
      <Topbar title="Returns" subtitle="Review and process return requests from retailers." />
      <main className="p-4 sm:p-6">
        {error ? (
          <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
        ) : null}

        <Card>
          <CardHeader><CardTitle className="text-base">{returnsData.length} return requests</CardTitle></CardHeader>
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
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6 text-sm text-muted-foreground">Loading return requests…</TableCell>
                    </TableRow>
                  ) : returnsData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6 text-sm text-muted-foreground">No return requests found.</TableCell>
                    </TableRow>
                  ) : (
                    returnsData.map((r) => (
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
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatus(r.id, "Rejected")}
                                disabled={savingId === r.id}
                              >
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleStatus(r.id, "Approved")}
                                disabled={savingId === r.id}
                              >
                                {savingId === r.id ? "Saving…" : "Approve"}
                              </Button>
                            </div>
                          ) : (
                            <Button size="sm" variant="ghost">View</Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
