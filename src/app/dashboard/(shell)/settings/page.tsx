import { SettingsContent } from "./SettingsContent";

/** Chrome comes from the shell layout; this returns content only. */
export default function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <SettingsContent />
    </div>
  );
}
