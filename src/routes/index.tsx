import { createFileRoute, Link } from "@tanstack/react-router";
import { Pill, Building2, Store, ArrowRight, ShieldCheck, Truck, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MediBridge — B2B Pharmacy Platform" },
      { name: "description", content: "Wholesale pharmacy commerce for distributors and retail pharmacies." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-accent/40 to-background">
      <header className="px-6 lg:px-12 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
            <Pill className="h-5 w-5" />
          </div>
          <span className="font-semibold tracking-tight">MediBridge</span>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost"><Link to="/login">Sign in</Link></Button>
          <Button asChild><Link to="/register">Get started</Link></Button>
        </div>
      </header>

      <section className="px-6 lg:px-12 pt-10 lg:pt-20 pb-16 max-w-6xl mx-auto">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-success" /> Trusted by 1,200+ pharmacies
        </span>
        <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05] max-w-3xl">
          The wholesale pharmacy platform — built for <span className="text-primary">batches, expiry & GST</span>.
        </h1>
        <p className="mt-5 text-lg text-muted-foreground max-w-2xl">
          MediBridge connects distributors with retail pharmacies through a fast catalog,
          credit-aware ordering and end-to-end fulfilment tracking.
        </p>

        <div className="mt-8 grid sm:grid-cols-2 gap-4 max-w-2xl">
          <Link to="/distributor" className="group rounded-xl border border-border bg-card p-5 hover:border-primary/60 transition-colors">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <div className="font-medium">I'm a distributor</div>
                <div className="text-xs text-muted-foreground">Manage orders, retailers, inventory</div>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition" />
            </div>
          </Link>
          <Link to="/retailer" className="group rounded-xl border border-border bg-card p-5 hover:border-primary/60 transition-colors">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-success/15 text-success flex items-center justify-center">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <div className="font-medium">I'm a retailer</div>
                <div className="text-xs text-muted-foreground">Browse & place bulk orders</div>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition" />
            </div>
          </Link>
        </div>

        <div className="mt-16 grid sm:grid-cols-3 gap-4">
          {[
            { i: ShieldCheck, t: "Batch & expiry safe", d: "FIFO indicators, near-expiry alerts and full traceability." },
            { i: Truck, t: "Fulfilment built in", d: "Six-stage lifecycle from approval to delivery." },
            { i: BarChart3, t: "GST-ready reports", d: "HSN-wise summaries, exportable for your CA." },
          ].map((f) => (
            <div key={f.t} className="rounded-xl border border-border bg-card p-5">
              <f.i className="h-5 w-5 text-primary" />
              <div className="mt-3 font-medium">{f.t}</div>
              <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
