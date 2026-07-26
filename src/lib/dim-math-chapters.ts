export type DimMathChapterStatus = "available" | "coming-soon";

export type DimMathChapter = {
  id: number;
  title: string;
  status: DimMathChapterStatus;
};

export const DIM_MATH_CHAPTERS: DimMathChapter[] = [
  { id: 1, title: "Natural ədədlər", status: "available" },
  { id: 2, title: "Çoxluqlar", status: "coming-soon" },
  { id: 3, title: "Adi və onluq kəsrlər", status: "coming-soon" },
  { id: 4, title: "Nisbət. Tənasüb. Faiz", status: "coming-soon" },
  { id: 5, title: "Həndəsənin əsas anlayışları", status: "coming-soon" },
  { id: 6, title: "Həqiqi ədədlər", status: "coming-soon" },
  { id: 7, title: "Üçbucaqlar", status: "coming-soon" },
  { id: 8, title: "Rasional ifadələr", status: "coming-soon" },
  { id: 9, title: "Çevrə", status: "coming-soon" },
  { id: 10, title: "Kvadrat köklər. Həqiqi üstlü qüvvət", status: "coming-soon" },
  { id: 11, title: "Birməchullu tənliklər", status: "coming-soon" },
  { id: 12, title: "Tənliklər sistemi", status: "coming-soon" },
  { id: 13, title: "Dördbucaqlılar", status: "coming-soon" },
  { id: 14, title: "Çoxbucaqlılar", status: "coming-soon" },
  { id: 15, title: "Bərabərsizliklər", status: "coming-soon" },
  { id: 16, title: "Fiqurların sahəsi", status: "coming-soon" },
  { id: 17, title: "Silsilələr", status: "coming-soon" },
  { id: 18, title: "Funksiyalar və qrafiklər", status: "coming-soon" },
  { id: 19, title: "Hərəkət. Oxşarlıq", status: "coming-soon" },
  { id: 20, title: "Triqonometrik funksiyalar", status: "coming-soon" },
  {
    id: 21,
    title: "Triqonometrik funksiyalar üçün toplama düsturları",
    status: "coming-soon",
  },
  {
    id: 22,
    title: "Triqonometrik tənliklər və bərabərsizliklər",
    status: "coming-soon",
  },
  { id: 23, title: "Vektorlar. Koordinatlar metodu", status: "coming-soon" },
  { id: 24, title: "Kompleks ədədlər", status: "coming-soon" },
  { id: 25, title: "Üstlü və loqarifmik funksiyalar", status: "coming-soon" },
  {
    id: 26,
    title: "Üstlü və loqarifmik tənlik, bərabərsizliklər",
    status: "coming-soon",
  },
  { id: 27, title: "Fəzada düz xətt və müstəvilər", status: "coming-soon" },
  { id: 28, title: "Törəmə və tətbiqləri", status: "coming-soon" },
  { id: 29, title: "Ardıcıllığın və funksiyanın limiti", status: "coming-soon" },
  { id: 30, title: "Çoxüzlülər", status: "coming-soon" },
  { id: 31, title: "Permutasiya. Kombinezon", status: "coming-soon" },
  { id: 32, title: "Fırlanma cisimləri", status: "coming-soon" },
  { id: 33, title: "Statistika", status: "coming-soon" },
  { id: 34, title: "Ehtimal nəzəriyyəsi", status: "coming-soon" },
  { id: 35, title: "İbtidai funksiya və inteqral", status: "coming-soon" },
  { id: 36, title: "Situasiya tapşırıqları", status: "coming-soon" },
  { id: 37, title: "Sınaq 10 - Qəbul", status: "available" },
];

export function getDimMathChapter(id: number): DimMathChapter | undefined {
  return DIM_MATH_CHAPTERS.find((chapter) => chapter.id === id);
}

export function isDimMathChapterAvailable(id: number): boolean {
  return getDimMathChapter(id)?.status === "available";
}
