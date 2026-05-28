import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset password — MediBridge" }] }),
  component: ForgotPage,
});

function ForgotPage() {
  const [sent, setSent] = useState(false);
  const onSubmit = (e: FormEvent) => { e.preventDefault(); setSent(true); };

  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll email you a secure reset link."
      footer={<>Remembered it? <Link to="/login" className="text-primary font-medium">Back to sign in</Link></>}
    >
      {sent ? (
        <div className="rounded-lg border border-success/30 bg-success/10 p-4 flex gap-3">
          <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
          <div className="text-sm">
            <div className="font-medium text-foreground">Check your inbox</div>
            <p className="text-muted-foreground mt-0.5">If an account exists, a reset link is on its way.</p>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Work email</Label>
            <Input id="email" type="email" placeholder="you@pharmacy.in" required />
          </div>
          <Button type="submit" className="w-full">Send reset link</Button>
        </form>
      )}
    </AuthShell>
  );
}
