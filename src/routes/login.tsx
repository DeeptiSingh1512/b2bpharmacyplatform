import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, type FormEvent } from "react";
import { login } from "@/api/auth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — MediBridge" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"distributor" | "retailer">("distributor");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      const response = await login(email, password);
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));

      const redirectPath = response.user.role === "distributor" ? "/distributor" : "/retailer";
      navigate({ to: redirectPath });
    } catch (err: unknown) {
      const message =
        typeof err === "object" && err !== null && "message" in err && typeof (err as any).message === "string"
          ? (err as any).message
          : "Login failed. Please check your credentials.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to manage your pharmacy operations."
      footer={<>New retailer? <Link to="/register" className="text-primary font-medium">Create an account</Link></>}
    >
      <div className="flex gap-2 rounded-lg bg-muted p-1">
        {(["distributor", "retailer"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={`flex-1 rounded-md py-1.5 text-sm font-medium capitalize transition ${
              role === r ? "bg-card shadow-sm" : "text-muted-foreground"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Work email</Label>
          <Input id="email" name="email" type="email" defaultValue="hello@medibridge.in" required />
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs text-primary">Forgot?</Link>
          </div>
          <Input id="password" name="password" type="password" defaultValue="••••••••" required />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </AuthShell>
  );
}
