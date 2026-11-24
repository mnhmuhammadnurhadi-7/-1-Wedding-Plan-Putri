import type { Metadata } from "next";
import { LoginForm } from "@/components/modules/auth/login-form";

export const metadata: Metadata = {
  title: "Masuk | Wedding Planner Antariksa & Sofiya",
  description: "Masuk ke sistem Wedding Planner Antariksa & Sofiya",
};

export default function LoginPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 16px",
        background: "var(--bg)",
      }}
    >
      <LoginForm />
    </main>
  );
}
