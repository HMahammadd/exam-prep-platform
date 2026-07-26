import Link from "next/link";
import { KeplerLogo } from "./KeplerLogo";

const FOOTER_LINKS: { heading: string; links: { label: string; href: string }[] }[] =
  [
    {
      heading: "Exams",
      links: [
        { label: "SAT Practice", href: "/dashboard/sat" },
        { label: "DIM Practice", href: "/dashboard/dim" },
        { label: "TOEFL", href: "/dashboard/toefl" },
      ],
    },
    {
      heading: "Account",
      links: [
        { label: "Log In", href: "/login" },
        { label: "Sign Up", href: "/signup" },
        { label: "Dashboard", href: "/dashboard" },
      ],
    },
  ];

export function SiteFooter() {
  return (
    <footer className="border-t border-card-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <KeplerLogo />
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
            Kepler helps students prepare for SAT, TOEFL, and DIM with realistic
            exam-style practice, detailed explanations, and progress tracking.
          </p>
        </div>

        {FOOTER_LINKS.map((group) => (
          <div key={group.heading}>
            <h3 className="text-sm font-semibold text-foreground">
              {group.heading}
            </h3>
            <ul className="mt-3 space-y-2">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted transition hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-card-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} Kepler. All rights reserved.</p>
          <p>Built for students preparing for SAT, TOEFL, and DIM.</p>
        </div>
      </div>
    </footer>
  );
}
