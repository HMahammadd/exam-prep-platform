/**
 * Collapse PDF soft-wrap newlines into spaces while keeping intentional breaks
 * (blank lines, bullets, and Cross-Text "Text 1" / "Text 2" headers).
 */
const STRUCTURAL_LINE =
  /^(?:[•●▪◦]\s|[-–—]\s|\d+[.)]\s|[A-D][.)]\s|Text\s*[12]\b)/i;
const TEXT_HEADER_LINE = /^Text\s*[12]\s*$/i;

export function normalizeWrappedProse(text: string): string {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const parts: string[] = [];

  function lastContent(): string | undefined {
    for (let index = parts.length - 1; index >= 0; index -= 1) {
      const part = parts[index];
      if (part !== "\n" && part !== " ") {
        return part;
      }
    }
    return undefined;
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      if (parts.length > 0 && parts[parts.length - 1] !== "\n") {
        parts.push("\n");
      }
      continue;
    }

    if (parts.length === 0) {
      parts.push(line);
      continue;
    }

    const previous = lastContent();
    const shouldBreak =
      parts[parts.length - 1] === "\n" ||
      STRUCTURAL_LINE.test(line) ||
      (previous !== undefined && TEXT_HEADER_LINE.test(previous));

    if (shouldBreak) {
      if (parts[parts.length - 1] !== "\n") {
        parts.push("\n");
      }
      parts.push(line);
      continue;
    }

    parts.push(" ", line);
  }

  return parts
    .join("")
    .replace(/[ \t]+/g, " ")
    .replace(/ ?\n ?/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
