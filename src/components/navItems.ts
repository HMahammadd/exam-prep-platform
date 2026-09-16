import { GraduationCap, Home, Info, Library, type LucideIcon } from "lucide-react";

export type NavSectionId = "home" | "exams" | "practice" | "about";

export type NavItem = {
  id: NavSectionId;
  href: string;
  labelKey: string;
  icon: LucideIcon;
};

/** Homepage sections, in document order. */
export const NAV_ITEMS: NavItem[] = [
  { id: "home", href: "/", labelKey: "nav.home", icon: Home },
  { id: "exams", href: "/#exams", labelKey: "nav.exams", icon: Library },
  { id: "practice", href: "/#practice", labelKey: "nav.practice", icon: GraduationCap },
  { id: "about", href: "/#about", labelKey: "nav.about", icon: Info },
];

export const SECTION_IDS: NavSectionId[] = NAV_ITEMS.map((item) => item.id);

export function isNavSectionId(value: string): value is NavSectionId {
  return SECTION_IDS.includes(value as NavSectionId);
}
