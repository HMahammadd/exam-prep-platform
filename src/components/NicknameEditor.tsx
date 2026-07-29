"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Check, Loader2, X } from "lucide-react";
import { validateNickname } from "@/lib/username";
import { checkNicknameAvailability } from "@/lib/services/profile";

type NicknameEditorProps = {
  currentNickname: string;
  value: string;
  onChange: (value: string) => void;
};

export function NicknameEditor({ currentNickname, value, onChange }: NicknameEditorProps) {
  const [status, setStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const checkAvailability = useCallback(async (nickname: string) => {
    const trimmed = nickname.trim();
    
    // Don't check if same as current
    if (trimmed.toLowerCase() === currentNickname.toLowerCase()) {
      setStatus("idle");
      setStatusMessage("");
      return;
    }

    const validationError = validateNickname(trimmed);
    if (validationError) {
      setStatus("invalid");
      setStatusMessage(validationError);
      return;
    }

    setStatus("checking");
    setStatusMessage("Checking availability…");

    const result = await checkNicknameAvailability(trimmed);
    if (result.available) {
      setStatus("available");
      setStatusMessage("Nickname is available");
    } else {
      setStatus(result.error ? "invalid" : "taken");
      setStatusMessage(result.error ?? "Nickname is already taken");
    }
  }, [currentNickname]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = value.trim();
    if (!trimmed || trimmed.toLowerCase() === currentNickname.toLowerCase()) {
      setStatus("idle");
      setStatusMessage("");
      return;
    }

    const validationError = validateNickname(trimmed);
    if (validationError) {
      setStatus("invalid");
      setStatusMessage(validationError);
      return;
    }

    setStatus("checking");
    setStatusMessage("Checking…");
    debounceRef.current = setTimeout(() => checkAvailability(trimmed), 500);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [value, currentNickname, checkAvailability]);

  const statusColor = {
    idle: "",
    checking: "text-muted",
    available: "text-green-600 dark:text-green-400",
    taken: "text-red-600 dark:text-red-400",
    invalid: "text-red-600 dark:text-red-400",
  }[status];

  const StatusIcon = {
    idle: null,
    checking: Loader2,
    available: Check,
    taken: X,
    invalid: X,
  }[status];

  return (
    <div>
      <label htmlFor="nickname" className="mb-1.5 block text-sm font-medium text-foreground">
        Nickname
      </label>
      <input
        id="nickname"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        minLength={3}
        maxLength={24}
        className="w-full rounded-lg border border-card-border bg-card px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
        placeholder="Your nickname"
        aria-describedby={statusMessage ? "nickname-status" : undefined}
        aria-invalid={status === "taken" || status === "invalid"}
      />
      {statusMessage && (
        <p id="nickname-status" className={`mt-1.5 flex items-center gap-1.5 text-xs ${statusColor}`}>
          {StatusIcon && (
            <StatusIcon className={`h-3.5 w-3.5 ${status === "checking" ? "animate-spin" : ""}`} aria-hidden />
          )}
          {statusMessage}
        </p>
      )}
    </div>
  );
}
