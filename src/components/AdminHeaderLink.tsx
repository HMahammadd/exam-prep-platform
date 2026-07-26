import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { isCurrentUserAdmin } from "@/lib/admin";

/** Renders an Admin link in headers, only for admin accounts. */
export async function AdminHeaderLink() {
  const isAdmin = await isCurrentUserAdmin();

  if (!isAdmin) {
    return null;
  }

  return (
    <Link
      href="/admin"
      className="inline-flex items-center gap-1.5 rounded-lg border border-card-border px-3 py-1.5 text-sm font-medium text-muted transition hover:border-accent hover:text-accent"
    >
      <ShieldCheck className="h-4 w-4" aria-hidden />
      Admin
    </Link>
  );
}
