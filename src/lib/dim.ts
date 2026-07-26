export type DimOptionStatus = "available" | "coming-soon";

export type DimOption = {
  id: string;
  name: string;
  description: string;
  status: DimOptionStatus;
  href: string;
};

export const DIM_FORMATS: DimOption[] = [
  {
    id: "buraxilis",
    name: "BURAXILIŞ",
    description: "Graduation exam format with subject-based practice.",
    status: "available",
    href: "/dashboard/dim/buraxilis",
  },
  {
    id: "blok",
    name: "BLOK",
    description: "Block exam format for DIM preparation.",
    status: "coming-soon",
    href: "/dashboard/dim/blok",
  },
];

export const DIM_BURAXILIS_SUBJECTS: DimOption[] = [
  {
    id: "azerbaijani",
    name: "AZERBAIJANI LANGUAGE",
    description: "Practice Azerbaijani language questions for DIM.",
    status: "coming-soon",
    href: "/dashboard/dim/buraxilis/azerbaijani",
  },
  {
    id: "math",
    name: "MATH",
    description: "Practice math questions for DIM Buraxılış.",
    status: "available",
    href: "/dashboard/dim/buraxilis/math",
  },
  {
    id: "english",
    name: "ENGLISH",
    description: "Practice English questions for DIM.",
    status: "coming-soon",
    href: "/dashboard/dim/buraxilis/english",
  },
];
