"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, User } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { AvatarSelector } from "@/components/AvatarSelector";
import { NicknameEditor } from "@/components/NicknameEditor";
import { getMyProfile, updateProfile } from "@/lib/services/profile";
import { validateNickname } from "@/lib/username";

export function ProfileContent() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nickname, setNickname] = useState("");
  const [originalNickname, setOriginalNickname] = useState("");
  const [avatarId, setAvatarId] = useState("default");
  const [originalAvatarId, setOriginalAvatarId] = useState("default");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    async function load() {
      const profile = await getMyProfile();
      if (profile) {
        setNickname(profile.nickname ?? "");
        setOriginalNickname(profile.nickname ?? "");
        setAvatarId(profile.avatar_id ?? "default");
        setOriginalAvatarId(profile.avatar_id ?? "default");
      }
      setLoading(false);
    }
    load();
  }, []);

  const hasChanges =
    nickname.trim() !== originalNickname || avatarId !== originalAvatarId;
  const nicknameError =
    nickname.trim() && nickname.trim() !== originalNickname
      ? validateNickname(nickname.trim())
      : null;

  async function handleSave() {
    setMessage(null);
    setSaving(true);

    const updates: { nickname?: string; avatar_id?: string } = {};
    if (nickname.trim() !== originalNickname) updates.nickname = nickname.trim();
    if (avatarId !== originalAvatarId) updates.avatar_id = avatarId;

    const result = await updateProfile(updates);

    if (result.success) {
      setOriginalNickname(nickname.trim());
      setOriginalAvatarId(avatarId);
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } else {
      setMessage({
        type: "error",
        text: result.error ?? "Failed to update profile.",
      });
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-card-border bg-card p-6 shadow-card">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
          <User className="h-5 w-5 text-accent" aria-hidden />
          Profile Picture
        </h2>
        <div className="mb-4 flex justify-center">
          <Avatar
            avatarId={avatarId}
            size={80}
            className="ring-4 ring-accent-soft"
          />
        </div>
        <AvatarSelector selectedId={avatarId} onSelect={setAvatarId} />
      </div>

      <div className="rounded-2xl border border-card-border bg-card p-6 shadow-card">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Nickname</h2>
        <NicknameEditor
          currentNickname={originalNickname}
          value={nickname}
          onChange={setNickname}
        />
        <p className="mt-2 text-xs text-muted">
          3–24 characters: letters, numbers, underscores, and periods
        </p>
      </div>

      {message && (
        <p
          className={`rounded-lg px-4 py-2.5 text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400"
              : "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400"
          }`}
        >
          {message.text}
        </p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={!hasChanges || saving || !!nicknameError}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Saving…
          </>
        ) : (
          <>
            <Save className="h-4 w-4" aria-hidden />
            Save Changes
          </>
        )}
      </button>
    </div>
  );
}
