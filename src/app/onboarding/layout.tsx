import type { ReactNode } from "react";
import { PostHogIdentify } from "@/components/PostHogIdentify";

export default function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <PostHogIdentify />
      {children}
    </>
  );
}
