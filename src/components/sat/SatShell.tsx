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
import { usePathname } from "next/navigation";
import {
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useTranslations } from "@/components/I18nProvider";
import { KeplerLogo } from "@/components/KeplerLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LocaleLink } from "@/components/LocaleLink";
import { ThemeSelector } from "@/components/ThemeSelector";

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
  { icon: BookMarked, label: "Vocabulary" },
  { icon: Timer, label: "Timed Practice" },
  { icon: Target, label: "Daily Goal" },
  { icon: Award, label: "Achievements" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

const STORAGE_KEY = "sat-sidebar-collapsed";

export function SatShell({
  title,
  breadcrumb,
  children,
}: {
  title: string;
  breadcrumb?: string;
  children: ReactNode;
}) {
  const t = useTranslations();
  const pathname = usePathname() ?? "";
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    let stored = false;
    try {
      stored = localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      // storage blocked — start expanded
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCollapsed(stored);
  }, []);

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

  // The active row drives the sliding indicator via a CSS custom property.
  const activeIndex = Math.max(
    NAV.findIndex((item) => item.href && pathname.endsWith(item.href)),
    0
  );

  return (
    <div className={`sat-shell${collapsed ? " is-collapsed" : ""}`}>
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
              aria-expanded={!collapsed}
            >
              <PanelLeft className="h-[1.1rem] w-[1.1rem]" aria-hidden />
            </button>
          </div>

          <nav
            className="sat-nav"
            style={{ "--active-row": activeIndex } as CSSProperties}
            aria-label="SAT sections"
          >
            <span className="sat-nav-indicator" aria-hidden />

            {NAV.map(({ icon: Icon, label, href }) => {
              const active = Boolean(href) && pathname.endsWith(href as string);
              const content = (
                <>
                  <Icon className="sat-nav-icon" aria-hidden />
                  <span className="sat-nav-label">{label}</span>
                  {!href ? <span className="sat-nav-soon" aria-hidden /> : null}
                </>
              );

              return href ? (
                <LocaleLink
                  key={label}
                  href={href}
                  className={`sat-nav-item${active ? " is-active" : ""}`}
                  data-tip={label}
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
                  aria-disabled="true"
                >
                  {content}
                </span>
              );
            })}
          </nav>

          <div className="sat-sidebar-foot">
            <span className="sat-theme-slot" data-tip="Theme">
              <ThemeSelector />
            </span>

            <LocaleLink
              href="/dashboard"
              className="sat-nav-item"
              data-tip={t("nav.logout") === "nav.logout" ? "Log out" : t("nav.logout")}
            >
              <LogOut className="sat-nav-icon" aria-hidden />
              <span className="sat-nav-label">Log out</span>
            </LocaleLink>
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
            <LocaleLink
              href="/dashboard/profile"
              className="sat-avatar"
              aria-label="Profile"
            >
              <span aria-hidden>K</span>
            </LocaleLink>
          </div>
        </header>

        <main className="sat-content">{children}</main>
      </div>
    </div>
  );
}
