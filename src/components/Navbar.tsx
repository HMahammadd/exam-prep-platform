import { Home, Library, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";
import { KeplerLogo } from "./KeplerLogo";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-card-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <KeplerLogo />

        <nav className="hidden items-center gap-6 text-sm font-medium text-muted md:flex">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 transition hover:text-foreground"
          >
            <Home className="h-4 w-4" aria-hidden />
            Home
          </Link>
          <Link
            href="/#exams"
            className="inline-flex items-center gap-1.5 transition hover:text-foreground"
          >
            <Library className="h-4 w-4" aria-hidden />
            Exams
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition hover:bg-accent-soft sm:inline-flex"
          >
            <LogIn className="h-4 w-4" aria-hidden />
            Log In
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white transition hover:bg-accent-hover sm:px-4"
          >
            <UserPlus className="h-4 w-4" aria-hidden />
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
}
