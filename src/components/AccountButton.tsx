import { getMyProfile } from "@/lib/services/profile";
import { getUnreadCount } from "@/lib/services/inbox";
import { AccountDropdown } from "./AccountDropdown";

export async function AccountButton() {
  try {
    const [profile, unreadCount] = await Promise.all([
      getMyProfile(),
      getUnreadCount().catch(() => 0),
    ]);

    if (!profile) {
      return null;
    }

    return (
      <AccountDropdown
        nickname={profile.nickname || "User"}
        avatarId={profile.avatar_id || "default"}
        unreadCount={unreadCount}
      />
    );
  } catch {
    // Never blank the header if profile/inbox queries fail.
    return (
      <AccountDropdown nickname="User" avatarId="default" unreadCount={0} />
    );
  }
}
