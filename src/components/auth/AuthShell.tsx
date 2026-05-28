import { Pill } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function AuthShell({
  title, subtitle, children, footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-primary/15 via-accent to-background relative overflow-hidden">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
            <Pill className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold text-lg tracking-tight">MediBridge</div>
            <div className="text-xs text-muted-foreground">B2B pharmacy commerce</div>
          </div>
        </div>

        <div className="space-y-5 max-w-md">
          <h2 className="text-3xl font-semibold tracking-tight leading-tight">
            The wholesale platform built for modern pharmacy distribution.
          </h2>
          <p className="text-muted-foreground">
            Manage retailers, orders, batches and GST — all in one place. Trusted by 1,200+ pharmacies across India.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { k: "₹68L", v: "monthly GMV" },
              { k: "250+", v: "active retailers" },
              { k: "99.4%", v: "fulfilment SLA" },
            ].map((s) => (
              <div key={s.v} className="rounded-lg border border-border bg-card/60 p-3">
                <div className="text-lg font-semibold tracking-tight">{s.k}</div>
                <div className="text-[11px] text-muted-foreground uppercase tracking-wider">{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">© 2026 MediBridge Health Pvt. Ltd.</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
              <Pill className="h-5 w-5" />
            </div>
            <span className="font-semibold tracking-tight">MediBridge</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8 space-y-5">{children}</div>
          {footer && <div className="mt-6 text-sm text-muted-foreground">{footer}</div>}
          <p className="mt-10 text-xs text-muted-foreground">
            By continuing you accept our <Link to="/" className="underline">Terms</Link> and <Link to="/" className="underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
