import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FormEvent } from "react";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Register retailer — MediBridge" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    navigate({ to: "/login" });
  };

  return (
    <AuthShell
      title="Register your pharmacy"
      subtitle="We'll verify your drug licence within 24 hours."
      footer={<>Already onboarded? <Link to="/login" className="text-primary font-medium">Sign in</Link></>}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="store">Pharmacy name</Label>
            <Input id="store" placeholder="MediPlus Pharmacy" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="owner">Owner name</Label>
            <Input id="owner" placeholder="Rohit Sharma" required />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@store.in" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Mobile</Label>
            <Input id="phone" placeholder="+91 98xxxxxx21" required />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="dl">Drug licence no.</Label>
            <Input id="dl" placeholder="MH-MUM-20A-12345" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="gst">GSTIN</Label>
            <Input id="gst" placeholder="27ABCDE1234F1Z5" required />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="addr">Store address</Label>
          <Input id="addr" placeholder="Shop 12, MG Road, Mumbai 400001" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Create password</Label>
          <Input id="password" type="password" required />
        </div>

        <Button type="submit" className="w-full">Submit application</Button>
      </form>
    </AuthShell>
  );
}
