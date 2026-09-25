import { Plus_Jakarta_Sans } from "next/font/google";

/**
 * The Daily Mission scene's typeface. Scoped to this page through a CSS
 * variable (see .daily-goal in globals.css) rather than added to the root
 * layout, so no other page pays for the download.
 */
export const missionFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mission",
  display: "swap",
});
