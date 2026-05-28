import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/dashboard/StatCard";
import { inr } from "@/lib/mock-data";
import { CreditCard, Wallet, AlertTriangle, CalendarClock } from "lucide-react";

export const Route = createFileRoute("/retailer/credit")({
  head: () => ({ meta: [{ title: "Credit — Retailer" }] }),
  component: CreditPage,
});

const limit = 200000;
const used = 142500;
const dueSoon = 42300;

function CreditPage() {
  const pct = Math.round((used / limit) * 100);
  return (
    <>
      <Topbar title="Credit usage" subtitle="Manage your wholesale credit line and dues." />
      <main className="p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Credit limit" value={inr(limit)} icon={Wallet} tone="primary" />
          <StatCard label="Used" value={inr(used)} icon={CreditCard} tone="info" />
          <StatCard label="Available" value={inr(limit - used)} icon={Wallet} tone="success" />
          <StatCard label="Due in 3 days" value={inr(dueSoon)} icon={AlertTriangle} tone="warning" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Credit utilisation</CardTitle>
            <p className="text-xs text-muted-foreground">Net 30 terms · auto-debit on day 30.</p>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>
      </main>
    </>
  );
}
