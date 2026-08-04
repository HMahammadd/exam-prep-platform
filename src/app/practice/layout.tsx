import type { ReactNode } from "react";
import { PostHogIdentify } from "@/components/PostHogIdentify";

export default function PracticeLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PostHogIdentify />
      {children}
    </>
  );
}
