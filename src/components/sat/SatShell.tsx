"use client";

import {
  Award,
  BarChart3,
  BookMarked,
  BookOpen,
  ClipboardList,
  LayoutGrid,
  LogOut,
  PanelLeft,
  Settings,
  Star,
  Target,
  Timer,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { useLinkStatus } from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useI18n, useTranslations } from "@/components/I18nProvider";
import { KeplerLogo } from "@/components/KeplerLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LocaleLink } from "@/components/LocaleLink";
import { SatBackdrop } from "@/components/sat/SatBackdrop";
import { ThemeSelector } from "@/components/ThemeSelector";
import { parseLocalePath, withLocale } from "@/lib/i18n/config";
import { getSatLesson } from "@/lib/sat-lessons";
import { supabase } from "@/lib/supabaseClient";

type NavItem = {
  icon: LucideIcon;
  label: string;
  /** Omitted while the destination does not exist yet. */
  href?: string;
};

/**
 * Only the routes that actually exist get links; the rest are rendered as
 * disabled rows with a "soon" dot rather than links into 404s.
 */
const NAV: NavItem[] = [
  { icon: LayoutGrid, label: "Dashboard", href: "/dashboard" },
  { icon: BookOpen, label: "SAT Lessons", href: "/dashboard/sat/lessons" },
  { icon: ClipboardList, label: "Practice Exams", href: "/dashboard/sat" },
  { icon: TrendingUp, label: "Progress" },
  { icon: BarChart3, label: "Analytics" },
  { icon: Star, label: "Mistakes" },
  { icon: BookMarked, label: "Vocabulary", href: "/dashboard/vocabulary" },
  { icon: Timer, label: "Timed Practice" },
  { icon: Target, label: "Daily Goal" },
  { icon: Award, label: "Achievements" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

const STORAGE_KEY = "sat-sidebar-collapsed";

/**
 * Replaces the old full-content skeleton. The routes below have no loading.js
 * any more, so a slow section holds the previous content on screen instead of
 * blanking it; this marks the row that is actually waiting, inside the rail.
 * Must stay a descendant of the Link for useLinkStatus to see it.
 */
function NavPending() {
  const { pending } = useLinkStatus();
  return (
    <span
      className={`sat-nav-pending${pending ? " is-pending" : ""}`}
      aria-hidden
    />
  );
}

/**
 * The topbar is mounted once by the layout, so it cannot take a title from the
 * page below it. It reads the current route instead, which also means the
 * heading and the active rail row update on the same render as the URL.
 */
function describeRoute(bare: string): { title: string; breadcrumb?: string } {
  const lesson = bare.match(/^\/dashboard\/sat\/lessons\/([^/]+)$/);
  if (lesson) {
    const title = getSatLesson(lesson[1])?.title ?? "Lesson";
    return { title, breadcrumb: `Dashboard / SAT / Lessons / ${title}` };
  }

  const exam = bare.match(/^\/dashboard\/sat\/exam\/([^/]+)\/(details|results)$/);
  if (exam) {
    return {
      title: exam[2] === "results" ? "Exam Results" : "Exam Details",
      breadcrumb: `Dashboard / SAT / Exam ${exam[1]}`,
    };
  }

  switch (bare) {
    case "/dashboard/sat":
      return { title: "SAT Practice", breadcrumb: "Dashboard / SAT" };
    case "/dashboard/sat/lessons":
      return { title: "SAT Lessons", breadcrumb: "Dashboard / SAT / Lessons" };
    case "/dashboard/vocabulary":
      return { title: "Vocabulary", breadcrumb: "Dashboard / Vocabulary" };
    case "/dashboard/settings":
      return { title: "Settings", breadcrumb: "Dashboard / Settings" };
    default:
      return { title: "Dashboard", breadcrumb: "Dashboard / Overview" };
  }
}

/** Longest matching prefix wins, so nested routes keep their section lit. */
function activeNavIndex(bare: string): number {
  let best = -1;
  let bestLength = 0;

  NAV.forEach((item, index) => {
    if (!item.href) return;
    const matches = bare === item.href || bare.startsWith(`${item.href}/`);
    if (matches && item.href.length > bestLength) {
      best = index;
      bestLength = item.href.length;
    }
  });

  // /dashboard/sat/exam/... belongs to Practice Exams, which lives at
  // /dashboard/sat — already covered by the prefix test above.
  return best;
}

export function SatShell({ children }: { children: ReactNode }) {
  const t = useTranslations();
  const { locale } = useI18n();
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Below this width the rail is always collapsed, so the collapsed layout is
  // one code path instead of a CSS duplicate of itself.
  const [forced, setForced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 1100px)");

    let stored = false;
    try {
      stored = localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      // storage blocked — start expanded
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCollapsed(stored);
    setForced(media.matches);

    const onChange = (event: MediaQueryListEvent) => setForced(event.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const isRailCollapsed = collapsed || forced;

  const toggleCollapsed = () => {
    setCollapsed((value) => {
      const next = !value;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        // nothing to persist to
      }
      return next;
    });
  };

  const bare = parseLocalePath(pathname).pathname;
  const { title, breadcrumb } = describeRoute(bare);

  // The active row drives the sliding indicator via a CSS custom property.
  const activeIndex = activeNavIndex(bare);
  const indicatorRow = Math.max(activeIndex, 0);

  const logoutLabel =
    t("nav.logout") === "nav.logout" ? "Log out" : t("nav.logout");

  const handleLogout = async () => {
    if (signingOut) return;
    setSigningOut(true);
    await supabase.auth.signOut();
    router.replace(withLocale("/login", locale));
    router.refresh();
  };

  return (
    <div className={`sat-shell${isRailCollapsed ? " is-collapsed" : ""}`}>
      <SatBackdrop />

      <div
        className={`sat-drawer-scrim${drawerOpen ? " is-open" : ""}`}
        aria-hidden
        onClick={() => setDrawerOpen(false)}
      />

      <aside className={`sat-sidebar${drawerOpen ? " is-open" : ""}`}>
        <div className="sat-sidebar-inner">
          <div className="sat-sidebar-head">
            <span className="sat-sidebar-brand">
              <KeplerLogo size="sm" />
            </span>
            <button
              type="button"
              className="sat-collapse-btn"
              onClick={toggleCollapsed}
              aria-label="Toggle sidebar"
              aria-expanded={!isRailCollapsed}
            >
              <PanelLeft className="h-[1.1rem] w-[1.1rem]" aria-hidden />
            </button>
          </div>

          <nav
            className="sat-nav"
            style={{ "--active-row": indicatorRow } as CSSProperties}
            aria-label="SAT sections"
          >
            <span className="sat-nav-indicator" aria-hidden />

            {NAV.map(({ icon: Icon, label, href }, index) => {
              const active = index === activeIndex;
              const content = (
                <>
                  <span className="sat-nav-slot">
                    <Icon className="sat-nav-icon" aria-hidden />
                  </span>
                  <span className="sat-nav-label">{label}</span>
                  {href ? <NavPending /> : null}
                  {!href ? <span className="sat-nav-soon" aria-hidden /> : null}
                </>
              );

              return href ? (
                <LocaleLink
                  key={label}
                  href={href}
                  prefetch
                  className={`sat-nav-item${active ? " is-active" : ""}`}
                  data-tip={label}
                  title={label}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setDrawerOpen(false)}
                >
                  {content}
                </LocaleLink>
              ) : (
                <span
                  key={label}
                  className="sat-nav-item is-upcoming"
                  data-tip={`${label} — soon`}
                  title={`${label} — soon`}
                  aria-disabled="true"
                >
                  {content}
                </span>
              );
            })}
          </nav>

          <span className="sat-rail-spacer" aria-hidden />

          <div className="sat-sidebar-foot">
            <button
              type="button"
              className="sat-nav-item"
              onClick={handleLogout}
              disabled={signingOut}
              data-tip={logoutLabel}
              title={logoutLabel}
            >
              <span className="sat-nav-slot">
                <LogOut className="sat-nav-icon" aria-hidden />
              </span>
              <span className="sat-nav-label">
                {signingOut ? "Signing out…" : logoutLabel}
              </span>
            </button>
          </div>
        </div>
      </aside>

      <div className="sat-main">
        <header className="sat-topbar">
          <button
            type="button"
            className="sat-drawer-btn"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation"
          >
            <PanelLeft className="h-[1.15rem] w-[1.15rem]" aria-hidden />
          </button>

          <div className="sat-topbar-title">
            <h1>{title}</h1>
            {breadcrumb ? (
              <p className="sat-breadcrumb">{breadcrumb}</p>
            ) : null}
          </div>

          <div className="sat-topbar-actions">
            <LanguageSwitcher />
            <ThemeSelector />
            <LocaleLink
              href="/dashboard/profile"
              className="sat-topbar-profile"
              aria-label="Profile"
              title="Student — SAT track"
            >
              <span className="sat-avatar" aria-hidden>
                K
              </span>
              <span className="sat-topbar-profile-text hidden min-w-0 flex-col sm:flex">
                <span className="sat-topbar-profile-name">Student</span>
                <span className="sat-topbar-profile-role">SAT track</span>
              </span>
            </LocaleLink>
          </div>
        </header>

        <main className="sat-content">
          {/*
            Keyed on the route so the swap animation replays per section. Only
            this inner node remounts — the shell, rail and topbar above it stay
            mounted across every navigation.
          */}
          <div key={bare} className="sat-route">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
