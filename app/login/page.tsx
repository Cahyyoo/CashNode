import { Wallet, ShieldCheck, TrendingUp, ReceiptText } from "lucide-react";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-sidebar p-10 text-sidebar-foreground lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, oklch(0.68 0.19 152 / 0.35), transparent 45%), radial-gradient(circle at 80% 70%, oklch(0.58 0.18 245 / 0.3), transparent 45%)",
          }}
        />
        <div className="relative flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Wallet className="size-5" />
          </div>
          <span className="text-xl font-semibold tracking-tight">CashNode</span>
        </div>

        <div className="relative space-y-6">
          <h1 className="text-3xl font-semibold leading-tight text-balance">
            Kendalikan anggaran proyek dengan presisi.
          </h1>
          <p className="max-w-md text-sidebar-foreground/70">
            Pantau pengeluaran, revisi anggaran, dan audit trail perusahaan
            dalam satu platform yang aman dan transparan.
          </p>
          <ul className="space-y-3 text-sm text-sidebar-foreground/80">
            <li className="flex items-center gap-2.5">
              <ShieldCheck className="size-4 text-sidebar-primary" />
              Hak akses berlapis (RBAC) per departemen
            </li>
            <li className="flex items-center gap-2.5">
              <TrendingUp className="size-4 text-sidebar-primary" />
              Forecasting burn-rate & threshold alert
            </li>
            <li className="flex items-center gap-2.5">
              <ReceiptText className="size-4 text-sidebar-primary" />
              Audit trail otomatis untuk setiap perubahan
            </li>
          </ul>
        </div>

        <p className="relative text-xs text-sidebar-foreground/40">
          &copy; {new Date().getFullYear()} CashNode. Internal use only.
        </p>
      </div>

      <div className="flex items-center justify-center bg-muted/30 px-4 py-16">
        <LoginForm callbackUrl={callbackUrl} />
      </div>
    </div>
  );
}
