import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/dashboard/StatCard";
import { inr } from "@/lib/mock-data";
import { CreditCard, Wallet, AlertTriangle, CalendarClock } from "lucide-react";
import { useEffect, useState } from "react";
import { getCredit, requestCredit } from "@/api/credit";

export const Route = createFileRoute("/retailer/credit")({
  head: () => ({ meta: [{ title: "Credit — Retailer" }] }),
  component: CreditPage,
});

function CreditPage() {
  const [creditInfo, setCreditInfo] = useState<{ credit_limit: number; used_credit: number; remaining: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState("");

  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") ?? "null") : null;

  const fetchCredit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!user || !user.id) {
        throw new Error("Unable to determine current user.");
      }
      const data = await getCredit(user.id);
      setCreditInfo(data);
    } catch (err: unknown) {
      setError("Unable to load credit info. Please try again.");
      setCreditInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCredit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      await requestCredit(Number(amount), note);
      setSuccess("Credit request submitted successfully.");
      setAmount("");
      setNote("");
      await fetchCredit();
    } catch (err: unknown) {
      setError("Unable to submit credit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const limit = creditInfo?.credit_limit ?? 0;
  const used = creditInfo?.used_credit ?? 0;
  const remaining = creditInfo?.remaining ?? 0;
  const pct = limit > 0 ? Math.round((used / limit) * 100) : 0;

  return (
    <>
      <Topbar title="Credit usage" subtitle="Manage your wholesale credit line and dues." />
      <main className="p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Credit limit" value={inr(limit)} icon={Wallet} tone="primary" />
          <StatCard label="Used" value={inr(used)} icon={CreditCard} tone="info" />
          <StatCard label="Available" value={inr(remaining)} icon={Wallet} tone="success" />
          <StatCard label="Due in 3 days" value={inr(0)} icon={AlertTriangle} tone="warning" />
        </div>

        {error ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Credit utilisation</CardTitle>
            <p className="text-xs text-muted-foreground">Net 30 terms · auto-debit on day 30.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Loading credit information…</div>
            ) : (
              <>
                <div>
                  <div className="flex justify-between text-sm font-medium mb-2">
                    <span>{inr(used)} used</span>
                    <span className="text-muted-foreground">of {inr(limit)} · {pct}%</span>
                  </div>
                  <Progress value={pct} className="h-3" />
                </div>

                <div className="grid sm:grid-cols-3 gap-4 pt-2">
                  {[
                    { date: "29 May", amount: 12800, status: "Due soon" },
                    { date: "02 Jun", amount: 28450, status: "Upcoming" },
                    { date: "11 Jun", amount: 19850, status: "Upcoming" },
                  ].map((d) => (
                    <div key={d.date} className="rounded-lg border border-border p-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CalendarClock className="h-3.5 w-3.5" /> {d.date}
                      </div>
                      <div className="mt-2 text-xl font-semibold tabular-nums">{inr(d.amount)}</div>
                      <div className="text-xs text-muted-foreground mt-1">{d.status}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Request credit increase</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  min={0}
                  step={100}
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="Enter request amount"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="note">Note</Label>
                <Input
                  id="note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Enter reason for request"
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                {success ? <p className="text-sm text-success">{success}</p> : null}
                <Button type="submit" disabled={isSubmitting || isLoading}>
                  {isSubmitting ? "Submitting…" : "Request credit"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
