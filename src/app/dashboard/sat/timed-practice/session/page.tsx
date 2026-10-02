import { redirect } from "next/navigation";
import { TimedPracticeRunner } from "@/components/sat/timed-practice/TimedPracticeRunner";
import { getCachedUser } from "@/lib/cached-auth";
import { withLocale } from "@/lib/i18n/config";
import { getRequestLocale } from "@/lib/i18n/server";
import { getMyProfile } from "@/lib/services/profile";
import { TIMED_PRACTICE_PATH, TIMED_RESULTS_PATH } from "@/lib/timed-practice";
import { loadLocalTimedResults, loadLocalTimedRunner } from "@/lib/timed-practice-local";

/**
 * The running session — full screen, outside the dashboard shell, like the
 * practice exams. Questions arrive without their answer keys; grading happens
 * in submitTimedPractice.
 */
export default async function TimedPracticeSessionPage() {
  const user = await getCachedUser();

  if (!user) {
    redirect("/login");
  }

  const runner = await loadLocalTimedRunner(user.id);

  if (!runner) {
    // Submitting re-renders this page (the action rewrites the cookie), so a
    // just-finished session lands on its results — the same place the runner
    // navigates to. Locale-prefixed so the proxy doesn't add a redirect hop.
    const locale = await getRequestLocale();
    const finished = await loadLocalTimedResults(user.id, locale);
    redirect(withLocale(finished ? TIMED_RESULTS_PATH : TIMED_PRACTICE_PATH, locale));
  }

  const profile = await getMyProfile();

  return <TimedPracticeRunner data={{ ...runner, studentName: profile?.username || "Student" }} />;
}
