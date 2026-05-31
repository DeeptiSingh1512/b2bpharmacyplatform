import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { inr } from "@/lib/mock-data";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { apiClient } from "@/api/config";
import { setCredit } from "@/api/credit";

export const Route = createFileRoute("/distributor/retailers")({
  head: () => ({ meta: [{ title: "Retailers — Distributor" }] }),
  component: RetailersPage,
});

function RetailersPage() {
  const [users, setUsers] = useState<Array<any>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | number | null>(null);
  const [creditLimits, setCreditLimits] = useState<Record<string | number, string>>({});

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/auth/users");
      setUsers(response.data || []);
    } catch (err: unknown) {
      setError("Unable to load retailers. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const retailers = users.filter(
    (user) => user.role === "retailer" || user.type === "retailer" || user.isRetailer || user.is_retailer,
  );
  const pending = retailers.filter((r) => r.status === "Pending" || r.status === "pending");
  const approved = retailers.filter((r) => r.status === "Approved" || r.status === "approved");

  const handleCreditLimitChange = (id: string | number, value: string) => {
    setCreditLimits((prev) => ({ ...prev, [id]: value }));
  };

  const handleSetCredit = async (id: string | number) => {
    const creditLimit = Number(creditLimits[id]);
    if (!creditLimit || creditLimit <= 0) {
      setError("Please enter a valid credit limit.");
      return;
    }

    setError(null);
    setSavingId(id);

    try {
      await setCredit(id, creditLimit);
      setUsers((prev) => prev.map((user) => (user.id === id ? { ...user, creditLimit } : user)));
      setCreditLimits((prev) => ({ ...prev, [id]: "" }));
    } catch (err: unknown) {
      setError("Unable to set credit limit. Please try again.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <>
      <Topbar title="Retailers" subtitle="Approve new pharmacies and manage relationships." />
      <main className="p-4 sm:p-6 space-y-6">
        {error ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
        ) : null}

        {pending.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pending approvals · {pending.length}</CardTitle>
              <p className="text-xs text-muted-foreground">Verify drug licence before approving.</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {pending.map((r) => (
                <div key={r.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">{String(r.name || "?").charAt(0)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{r.name || "Unknown"}</div>
                    <div className="text-xs text-muted-foreground">{r.owner || "Owner"} · {r.city || "City"} · Joined {r.joined ? new Date(r.joined).toLocaleDateString("en-IN") : "-"}</div>
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
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-sm text-muted-foreground">Loading retailers…</TableCell>
                    </TableRow>
                  ) : approved.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-sm text-muted-foreground">No active retailers found.</TableCell>
                    </TableRow>
                  ) : (
                    approved.map((r) => {
                      const creditUsed = Number(r.creditUsed || r.credit_used || 0);
                      const creditLimit = Number(r.creditLimit || r.credit_limit || 0) || 0;
                      const pct = creditLimit > 0 ? Math.round((creditUsed / creditLimit) * 100) : 0;
                      return (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium">{r.name || "Unknown"}</TableCell>
                          <TableCell>{r.owner || "-"}</TableCell>
                          <TableCell>{r.city || "-"}</TableCell>
                          <TableCell className="min-w-50">
                            <div className="flex items-center gap-2">
                              <Progress value={pct} className={cn("h-2", pct > 85 && "[&>div]:bg-destructive")} />
                              <span className="text-xs tabular-nums text-muted-foreground w-10">{pct}%</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">{inr(creditUsed)} used</div>
                          </TableCell>
                          <TableCell className="text-right tabular-nums font-medium">
                            <div>{inr(creditLimit)}</div>
                            <div className="mt-2 flex justify-end items-center gap-2">
                              <Input
                                type="number"
                                min={0}
                                className="w-28"
                                placeholder="Limit"
                                value={creditLimits[r.id] ?? ""}
                                onChange={(event) => handleCreditLimitChange(r.id, event.target.value)}
                              />
                              <Button
                                size="sm"
                                onClick={() => handleSetCredit(r.id)}
                                disabled={savingId === r.id}
                              >
                                {savingId === r.id ? "Saving…" : "Set"}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
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
