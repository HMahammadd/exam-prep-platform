"use client";

import {
  ArrowLeft,
  Award,
  BarChart3,
  BookMarked,
  BookOpen,
  ClipboardList,
  PanelLeft,
  Settings,
  Star,
  Target,
  Timer,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { KeplerLogo } from "@/components/KeplerLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LocaleLink } from "@/components/LocaleLink";
import { SatBackdrop } from "@/components/sat/SatBackdrop";
import { ThemeSelector } from "@/components/ThemeSelector";
import { parseLocalePath } from "@/lib/i18n/config";
import { getSatLesson } from "@/lib/sat-lessons";

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
  // No "Dashboard" row: the exam-selection page is reached through "Back to
  // exams" in the sidebar, and two controls for one destination read as two
  // different places.
  { icon: BookOpen, label: "SAT Lessons", href: "/dashboard/sat/lessons" },
  { icon: ClipboardList, label: "Practice Exams", href: "/dashboard/sat" },
  { icon: TrendingUp, label: "Progress", href: "/dashboard/sat/progress" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/sat/analytics" },
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
 * The shell is mounted once by the layout, so it cannot take a title from the
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
    case "/dashboard/sat/progress":
      return { title: "Progress", breadcrumb: "Dashboard / SAT / Progress" };
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
  const pathname = usePathname() ?? "";
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Below this width the rail is always collapsed, so the collapsed layout is
  // one code path instead of a CSS duplicate of itself.
  const [forced, setForced] = useState(false);

  // Below this width the sidebar is a full-width drawer (see the 767px CSS
  // block), so the icon-only squeeze that the collapsed rail applies to the
  // footer controls must not also apply there — there is no width to save.
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 1100px)");
    const mobileMedia = window.matchMedia("(max-width: 767px)");

    let stored = false;
    try {
      stored = localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      // storage blocked — start expanded
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCollapsed(stored);
    setForced(media.matches);
    setIsMobile(mobileMedia.matches);

    const onChange = (event: MediaQueryListEvent) => setForced(event.matches);
    const onMobileChange = (event: MediaQueryListEvent) =>
      setIsMobile(event.matches);
    media.addEventListener("change", onChange);
    mobileMedia.addEventListener("change", onMobileChange);
    return () => {
      media.removeEventListener("change", onChange);
      mobileMedia.removeEventListener("change", onMobileChange);
    };
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

          {/*
            Explicit route, not history.back(): the selection page must be
            the destination however the user arrived here (direct link,
            refresh, or deep into a lesson).
          */}
          <LocaleLink
            href="/dashboard"
            className="sat-nav-item sat-sidebar-back"
            data-tip="Back to exams"
            title="Back to exams"
            aria-label="Back to exams"
          >
            <span className="sat-nav-slot">
              <ArrowLeft className="sat-nav-icon" aria-hidden />
            </span>
            <span className="sat-nav-label">Back to exams</span>
          </LocaleLink>

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
            <div className="sat-sidebar-controls">
              <LanguageSwitcher compact={isRailCollapsed && !isMobile} />
              <ThemeSelector variant="nav" />
            </div>

            <LocaleLink
              href="/dashboard/profile"
              className="sat-nav-item sat-sidebar-profile"
              data-tip="Profile"
              aria-label="Profile"
              title="Student — SAT track"
            >
              <span className="sat-avatar" aria-hidden>
                K
              </span>
              <span className="sat-sidebar-profile-text">
                <span className="sat-sidebar-profile-name">Student</span>
                <span className="sat-sidebar-profile-role">SAT track</span>
              </span>
            </LocaleLink>
          </div>
        </div>
      </aside>

      <div className="sat-main">
        <main className="sat-content">
          <div className="sat-page-head">
            <button
              type="button"
              className="sat-drawer-btn"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation"
            >
              <PanelLeft className="h-[1.15rem] w-[1.15rem]" aria-hidden />
            </button>

            <div className="sat-page-head-text">
              <h1>{title}</h1>
              {breadcrumb ? (
                <p className="sat-breadcrumb">{breadcrumb}</p>
              ) : null}
            </div>
          </div>

          {/*
            Keyed on the route so the swap animation replays per section. Only
            this inner node remounts — the shell and rail above it stay
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
