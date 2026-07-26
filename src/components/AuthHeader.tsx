import { KeplerLogo } from "./KeplerLogo";
import { ThemeToggle } from "./ThemeToggle";

export function AuthHeader() {
  return (
    <header className="border-b border-card-border bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <KeplerLogo />
        <ThemeToggle />
      </div>
    </header>
  );
}
