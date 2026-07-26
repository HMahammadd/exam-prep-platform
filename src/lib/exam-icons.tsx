import {
  BookOpen,
  FileText,
  Globe,
  type LucideIcon,
} from "lucide-react";

const EXAM_ICONS: Record<string, LucideIcon> = {
  sat: BookOpen,
  toefl: Globe,
  dim: FileText,
};

export function getExamIcon(examId: string): LucideIcon {
  return EXAM_ICONS[examId] ?? BookOpen;
}
