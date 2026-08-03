"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Check, Loader2, X } from "lucide-react";
import { USERNAME_MAX, validateUsername } from "@/lib/username";
import { checkUsernameAvailabilityForEdit } from "@/lib/services/profile";

type UsernameEditorProps = {
  currentUsername: string;
  value: string;
  onChange: (value: string) => void;
};

export function UsernameEditor({
  currentUsername,
  value,
  onChange,
}: UsernameEditorProps) {
  const [status, setStatus] = useState<
    "idle" | "checking" | "available" | "taken" | "invalid"
  >("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const checkAvailability = useCallback(
    async (username: string) => {
      const trimmed = username.trim();

      if (trimmed.toLowerCase() === currentUsername.toLowerCase()) {
        setStatus("idle");
        setStatusMessage("");
        return;
      }

      const validationError = validateUsername(trimmed);
      if (validationError) {
        setStatus("invalid");
        setStatusMessage(validationError);
        return;
      }

      setStatus("checking");
      setStatusMessage("Checking availability…");

      const result = await checkUsernameAvailabilityForEdit(trimmed);
      if (result.available) {
        setStatus("available");
        setStatusMessage("Username is available");
      } else {
        setStatus(result.error ? "invalid" : "taken");
        setStatusMessage(result.error ?? "Username is already taken");
      }
    },
    [currentUsername]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = value.trim();
    if (!trimmed || trimmed.toLowerCase() === currentUsername.toLowerCase()) {
      setStatus("idle");
      setStatusMessage("");
      return;
    }

    const validationError = validateUsername(trimmed);
    if (validationError) {
      setStatus("invalid");
      setStatusMessage(validationError);
      return;
    }

    setStatus("checking");
    setStatusMessage("Checking…");
    debounceRef.current = setTimeout(() => checkAvailability(trimmed), 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, currentUsername, checkAvailability]);

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
      <label
        htmlFor="username"
        className="mb-1.5 block text-sm font-medium text-foreground"
      >
        Username
      </label>
      <input
        id="username"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        minLength={3}
        maxLength={USERNAME_MAX}
        className="w-full rounded-lg border border-card-border bg-card px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
        placeholder="Your username"
        aria-describedby={statusMessage ? "username-status" : undefined}
        aria-invalid={status === "taken" || status === "invalid"}
      />
      {statusMessage && (
        <p
          id="username-status"
          className={`mt-1.5 flex items-center gap-1.5 text-xs ${statusColor}`}
        >
          {StatusIcon && (
            <StatusIcon
              className={`h-3.5 w-3.5 ${status === "checking" ? "animate-spin" : ""}`}
              aria-hidden
            />
          )}
          {statusMessage}
        </p>
      )}
    </div>
  );
}
