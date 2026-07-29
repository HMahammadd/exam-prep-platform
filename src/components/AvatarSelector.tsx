"use client";

import { AVATARS } from "@/lib/avatars";
import { Avatar } from "./Avatar";
import { Check } from "lucide-react";

type AvatarSelectorProps = {
  selectedId: string;
  onSelect: (id: string) => void;
};

export function AvatarSelector({ selectedId, onSelect }: AvatarSelectorProps) {
  return (
    <div className="grid grid-cols-5 gap-3 sm:grid-cols-5" role="radiogroup" aria-label="Choose avatar">
      {AVATARS.map((avatar) => {
        const selected = avatar.id === selectedId;
        return (
          <button
            key={avatar.id}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={avatar.label}
            onClick={() => onSelect(avatar.id)}
            className={`relative flex items-center justify-center rounded-xl border-2 p-2 transition ${
              selected
                ? "border-accent bg-accent-soft shadow-sm"
                : "border-card-border bg-card hover:border-accent/50 hover:bg-accent-soft/50"
            }`}
          >
            <Avatar avatarId={avatar.id} size={48} alt={avatar.label} />
            {selected && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white">
                <Check className="h-3 w-3" aria-hidden />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
