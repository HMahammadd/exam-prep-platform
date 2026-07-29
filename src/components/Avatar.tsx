"use client";

import { getAvatarById } from "@/lib/avatars";

type AvatarProps = {
  avatarId: string | null | undefined;
  size?: number;
  className?: string;
  alt?: string;
};

export function Avatar({
  avatarId,
  size = 32,
  className = "",
  alt,
}: AvatarProps) {
  const avatar = getAvatarById(avatarId);

  return (
    // eslint-disable-next-line @next/next/no-img-element -- local SVG avatars; avoid next/image SVG quirks
    <img
      src={avatar.src}
      alt={alt ?? avatar.label}
      width={size}
      height={size}
      className={`rounded-full object-cover ${className}`}
      draggable={false}
    />
  );
}
