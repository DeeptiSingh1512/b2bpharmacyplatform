import { redirect } from "@tanstack/react-router";

export interface AuthUser {
  id: number;
  role: "distributor" | "retailer" | string;
  name?: string;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function clearAuth(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function requireRole(role: "distributor" | "retailer"): void {
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    throw redirect({ to: "/login" });
  }

  if (user.role !== role) {
    throw redirect({ to: user.role === "distributor" ? "/distributor" : "/retailer" });
  }
}
