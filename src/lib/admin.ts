import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";

export type AdminProfile = {
  id: string;
  email: string | null;
  fullName: string | null;
  role: "user" | "admin";
};

/**
 * Bootstrap allowlist. Lets you reach the admin panel before the `profiles`
 * table exists, or to recover if a role was cleared by mistake.
 * Set ADMIN_EMAILS="you@example.com,other@example.com" in .env.local
 */
function allowlistedEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function getAdminProfile(): Promise<AdminProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const email = user.email ?? null;
  const isAllowlisted =
    email !== null && allowlistedEmails().includes(email.toLowerCase());

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  // The profiles table may not exist yet; the allowlist still grants access.
  const role: "user" | "admin" =
    profile?.role === "admin" || isAllowlisted ? "admin" : "user";

  return {
    id: user.id,
    email: profile?.email ?? email,
    fullName:
      profile?.full_name ??
      (typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : null),
    role,
  };
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  const profile = await getAdminProfile();
  return profile?.role === "admin";
}

/** Redirects away unless the signed-in user is an admin. */
export async function requireAdmin(): Promise<AdminProfile> {
  const profile = await getAdminProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "admin") {
    redirect("/dashboard");
  }

  return profile;
}
