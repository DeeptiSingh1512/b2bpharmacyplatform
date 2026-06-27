import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { inr, normalizeReturn } from "@/lib/api-adapters";
import { cn } from "@/lib/utils";
import { useEffect, useState, type FormEvent } from "react";
import { createReturn, getReturns } from "@/api/returns";

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
  const [returnsData, setReturnsData] = useState<Array<any>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | string>("");
  const [reason, setReason] = useState("Damaged");
  const [refundMethod, setRefundMethod] = useState("Credit note");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReturns = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getReturns();
      setReturnsData((data as Array<Record<string, unknown>>).map(normalizeReturn));
    } catch (err: unknown) {
      setError("Unable to load returns. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      await createReturn(Number(orderId), reason, refundMethod);
      setSuccess("Return request submitted successfully.");
      setOrderId("");
      setReason("Damaged");
      setRefundMethod("Credit note");
      setNotes("");
      await fetchReturns();
    } catch (err: unknown) {
      setError("Unable to submit return request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-sm text-muted-foreground">Loading returns…</TableCell>
                    </TableRow>
                  ) : returnsData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-sm text-muted-foreground">No returns found.</TableCell>
                    </TableRow>
                  ) : (
                    returnsData.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.id}</TableCell>
                        <TableCell>{r.product || "-"}</TableCell>
                        <TableCell><span className="text-xs text-muted-foreground">{r.reason}</span></TableCell>
                        <TableCell className="text-right tabular-nums">{inr(r.amount)}</TableCell>
                        <TableCell>
                          <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", statusStyles[r.status])}>
                            {r.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader><CardTitle className="text-base">Raise a return</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {success ? <p className="text-sm text-success">{success}</p> : null}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="order_id">Order ID</Label>
                <Input
                  id="order_id"
                  type="number"
                  value={orderId}
                  onChange={(event) => setOrderId(event.target.value)}
                  placeholder="12345"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Refund method</Label>
                <Select value={refundMethod} onValueChange={setRefundMethod}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Credit note', 'Payment refund'].map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Reason</Label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Damaged', 'Expired', 'Incorrect product'].map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Add any helpful detail…"
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting…' : 'Submit return'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
