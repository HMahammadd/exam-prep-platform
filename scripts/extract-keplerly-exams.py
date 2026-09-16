#!/usr/bin/env python3
"""Extract Keplerly SAT Reading & Writing exam PDFs into importable JSON."""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

import fitz

SOURCE_NAME = "keplerly-exams"
SOURCE_LETTER = "E"
GROUP_KEY = "keplerly-exams"
GROUP_LABEL = "Keplerly Exams"

SKILL_PREFIXES = {
    "Words in Context": "SVW",
    "Transitions": "SVT",
    "Inferences": "SVI",
    "Cross-Text Connections": "SVC",
    "Command of Evidence": "SVE",
    "Boundaries": "SVB",
    "Central Ideas and Details": "SVM",
    "Form, Structure, and Sense": "SVS",
    "Text Structure and Purpose": "SVP",
    "Rhetorical Synthesis": "SVN",
}

SKILL_ALIASES = {
    "words in context": "Words in Context",
    "transitions": "Transitions",
    "transition": "Transitions",
    "inferences": "Inferences",
    "cross-text": "Cross-Text Connections",
    "cross-text connections": "Cross-Text Connections",
    "command of evidence": "Command of Evidence",
    "boundaries": "Boundaries",
    "ideas and detail": "Central Ideas and Details",
    "central ideas and details": "Central Ideas and Details",
    "form structure sense": "Form, Structure, and Sense",
    "form, structure, and sense": "Form, Structure, and Sense",
    "structure purpose": "Text Structure and Purpose",
    "text structure and purpose": "Text Structure and Purpose",
    "expression of ideas": "Rhetorical Synthesis",
    "rhetorical synthesis": "Rhetorical Synthesis",
}

FILE_RE = re.compile(
    r"^Exam_(\d+)_M([12])(?:_Incomplete)?\.pdf(?:\.bak)?$",
    re.IGNORECASE,
)
QUESTION_START_RE = re.compile(
    r"(?:^|\n)Question\s+(\d+)(?:\s+Difficulty:|\s*\n)",
)
DIFFICULTY_RE = re.compile(
    r"Difficulty:\s*\d\s*-\s*(Easy|Medium|Hard)",
    re.IGNORECASE,
)
ANSWER_RE = re.compile(
    r"(?:^|\n)(?:AI-Derived Answer|Correct Answer|Answer):\s*"
    r"([A-D])(?:\s*[).:-]\s*[^\n]*)?",
    re.IGNORECASE,
)
EXPLANATION_RE = re.compile(r"(?:^|\n)Explanation:\s*", re.IGNORECASE)
CHOICE_LINE_RE = re.compile(
    r"(?:^|\n)([A-D])[.)]\s*(.*?)(?=(?:\n[A-D][.)]\s)|(?:\n(?:AI-Derived Answer|Correct Answer|Answer):)|\Z)",
    re.DOTALL | re.IGNORECASE,
)
CHOICE_BLOCK_START_RE = re.compile(
    r"(?:^|\n)A[.)]\s+",
)
SKILL_LINE_RE = re.compile(
    r"^(?:"
    + "|".join(
        re.escape(alias)
        for alias in sorted(SKILL_ALIASES, key=len, reverse=True)
    )
    + r")\s*$",
    re.IGNORECASE | re.MULTILINE,
)
PAGE_NOISE_RE = re.compile(
    r"(?:^|\n)(?:Page\s+\d+|Exam\s+\d+\s+M[12].*?\|.*|\d+\s*$|"
    r"_{10,}|-{10,}|"
    r"Exam\s+\d+\s+M[12]\s*$|"
    r"\d+\s+questions.*?explanations.*?$)",
    re.IGNORECASE | re.MULTILINE,
)

STEM_START_RE = re.compile(
    r"(?<![A-Za-z])("
    r"Which choice|Which finding|Which quotation|Which statement|"
    r"According to the text|Based on the texts?|The student wants|"
    r"What is the main|What does the|As used in the text"
    r")\b",
    re.IGNORECASE,
)
VISUAL_HINT_RE = re.compile(
    r"\b(graph|table|figure|scatterplot|chart|data from the)\b",
    re.IGNORECASE,
)
TABLE_TITLE_RE = re.compile(
    r"(?:"
    r"Number and Origin of[\w\s,]{0,80}|"
    r"Indian Lok Sabha Results[\w\s,%-]{0,80}|"
    r"Tourist Visits to[\w\s,]{0,60}|"
    r"Depth below surface[\w\s()]{0,40}|"
    r"Pyramids in Egypt and the Americas|"
    r"Correlation between[\w\s,]{0,100}|"
    r"(?:Mean\s+)?(?:change|difference|values?) in[\w\s,]{0,60}(?:FLD|fibrosis|glucose|insulin)|"
    r"[A-Z][^\n.?]{8,100}\b(?:by Percentage of Seats Won|Results by Percentage)\b[^\n.?]{0,40}"
    r")",
    re.IGNORECASE,
)


STRUCTURAL_LINE_RE = re.compile(
    r"^(?:[•●▪◦]\s|[-–—]\s|\d+[.)]\s|[A-D][.)]\s|Text\s*[12]\b)",
    re.IGNORECASE,
)
TEXT_HEADER_LINE_RE = re.compile(r"^Text\s*[12]\s*$", re.IGNORECASE)


def clean_text(value: str) -> str:
    """Normalize PDF text: join soft wraps, keep bullets / Text 1–2 breaks."""
    value = (
        value.replace("\u00a0", " ")
        .replace("\u2002", " ")
        .replace("\x00", "'")
        .replace("“", '"')
        .replace("”", '"')
        .replace("’", "'")
        .replace("‘", "'")
        .replace("–", "-")
        .replace("—", "-")
    )
    # Join hyphenated line wraps, but never glue a choice label onto the prior line.
    value = re.sub(r"(\w)-\s*\n\s*(?![A-D][.)]\s)(\w)", r"\1-\2", value)

    parts: list[str] = []

    def last_content() -> str | None:
        for part in reversed(parts):
            if part not in {"\n", " "}:
                return part
        return None

    for raw_line in value.replace("\r\n", "\n").replace("\r", "\n").split("\n"):
        line = raw_line.strip()
        if not line:
            if parts and parts[-1] != "\n":
                parts.append("\n")
            continue
        if not parts:
            parts.append(line)
            continue
        previous = last_content()
        should_break = (
            parts[-1] == "\n"
            or STRUCTURAL_LINE_RE.match(line) is not None
            or (previous is not None and TEXT_HEADER_LINE_RE.match(previous) is not None)
        )
        if should_break:
            if parts[-1] != "\n":
                parts.append("\n")
            parts.append(line)
            continue
        parts.append(" ")
        parts.append(line)

    value = "".join(parts)
    value = re.sub(r"[ \t]+", " ", value)
    value = re.sub(r" ?\n ?", "\n", value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    return value.strip()


def canonical_skill(raw: str) -> str | None:
    normalized = clean_text(raw).casefold()
    return SKILL_ALIASES.get(normalized)


def list_exam_files(input_dir: Path) -> list[tuple[int, int, Path]]:
    files: list[tuple[int, int, Path]] = []
    for path in sorted(input_dir.iterdir()):
        match = FILE_RE.match(path.name)
        if not match:
            continue
        files.append((int(match.group(1)), int(match.group(2)), path))
    files.sort(key=lambda item: (item[0], item[1], item[2].name))
    return files


def extract_document_text(path: Path) -> str:
    document = fitz.open(path)
    return "\n".join(page.get_text() for page in document)


def find_question_anchors(document: fitz.Document) -> dict[int, tuple[int, float]]:
    """Map question number -> (page_index, y0), ignoring substring false positives."""
    anchors: dict[int, tuple[int, float]] = {}
    for page_index, page in enumerate(document):
        for number in range(1, 40):
            for rect in page.search_for(f"Question {number}"):
                label = page.get_textbox(rect).split("\n", 1)[0].strip()
                if not re.fullmatch(rf"Question\s+{number}", label, re.IGNORECASE):
                    continue
                candidate = (page_index, float(rect.y0))
                previous = anchors.get(number)
                if previous is None or candidate < previous:
                    anchors[number] = candidate
    return anchors


def is_table_like_text(text: str) -> bool:
    compact = text.strip()
    if not compact:
        return False
    if re.search(
        r"\b(Which choice|Answer:|Explanation:|Difficulty:|Question\s+\d+)\b",
        compact,
        re.IGNORECASE,
    ):
        return False
    if TABLE_TITLE_RE.search(compact):
        return True
    digit_ratio = sum(character.isdigit() for character in compact) / max(
        len(compact), 1
    )
    percent_count = compact.count("%")
    lines = [line.strip() for line in compact.splitlines() if line.strip()]
    if digit_ratio >= 0.12 and len(compact) < 500:
        return True
    if percent_count >= 2:
        return True
    if len(lines) >= 3 and (sum(len(line) for line in lines) / len(lines)) < 42:
        return True
    return False


def find_embedded_table_title(text: str) -> re.Match[str] | None:
    for match in TABLE_TITLE_RE.finditer(text):
        window = text[match.end() : match.end() + 160]
        digit_count = sum(character.isdigit() for character in window)
        if digit_count >= 4 or window.count("%") >= 2 or is_table_like_text(window):
            return match
    return None


def strip_visual_ocr_from_stem(stem: str) -> str:
    """Remove table/graph OCR that sits around the stem question."""
    cleaned = clean_text(stem)

    stem_match = STEM_START_RE.search(cleaned)
    if stem_match:
        prefix = cleaned[: stem_match.start()]
        rest = cleaned[stem_match.start() :]
        question_end = rest.find("?")
        if question_end != -1:
            trailing = rest[question_end + 1 :].strip()
            if trailing and (
                sum(character.isdigit() for character in trailing) >= 4
                or find_embedded_table_title(trailing) is not None
                or is_table_like_text(trailing)
                or TABLE_TITLE_RE.search(trailing)
            ):
                return clean_text(prefix + rest[: question_end + 1])

    title = find_embedded_table_title(cleaned)
    if not title:
        return cleaned

    before = cleaned[: title.start()].rstrip()
    after = cleaned[title.end() :]
    stem_in_before = STEM_START_RE.search(before)
    stem_in_after = STEM_START_RE.search(after)
    if stem_in_before and not stem_in_after:
        return clean_text(before)
    if stem_in_after:
        return clean_text(before + " " + after[stem_in_after.start() :])
    if before:
        return clean_text(before)
    return cleaned


def find_image_crop(page: fitz.Page, y_min: float, y_max: float) -> fitz.Rect | None:
    best: tuple[float, fitz.Rect] | None = None
    for image in page.get_image_info(xrefs=True):
        x0, y0, x1, y1 = image["bbox"]
        if y1 < y_min - 8 or y0 > y_max + 8:
            continue
        if image["width"] < 180 or image["height"] < 70:
            continue
        width = x1 - x0
        height = y1 - y0
        if width < 140 or height < 60:
            continue
        area = width * height
        if best is None or area > best[0]:
            best = (area, fitz.Rect(x0, y0, x1, y1))
    return best[1] if best else None


def find_drawing_crop(page: fitz.Page, y_min: float, y_max: float) -> fitz.Rect | None:
    rects = [
        drawing["rect"]
        for drawing in page.get_drawings()
        if drawing["rect"].width > 8
        and drawing["rect"].height > 8
        and drawing["rect"].y1 >= y_min
        and drawing["rect"].y0 <= y_max
    ]
    if len(rects) < 8:
        return None
    union = rects[0]
    for rect in rects[1:]:
        union |= rect
    if union.height < 55 or union.width < 160:
        return None
    return fitz.Rect(
        max(36, union.x0 - 24),
        max(y_min, union.y0 - 36),
        min(page.rect.width - 36, union.x1 + 24),
        min(y_max, union.y1 + 18),
    )


def find_choice_y(
    blocks: list[tuple[float, float, float, float, str]], after_y: float
) -> float | None:
    for y0, _y1, _x0, _x1, text in blocks:
        if y0 < after_y - 1:
            continue
        if re.match(r"^[A-D][.)]\s+\S", text.strip()):
            return y0
    return None


def find_table_text_crop(page: fitz.Page, y_min: float, y_max: float) -> fitz.Rect | None:
    blocks: list[tuple[float, float, float, float, str]] = []
    for block in page.get_text("blocks"):
        x0, y0, x1, y1, text, *_ = block
        if y1 < y_min or y0 > y_max:
            continue
        stripped = text.strip()
        if stripped:
            blocks.append((y0, y1, x0, x1, stripped))
    if not blocks:
        return None

    stem_y: float | None = None
    for y0, _y1, _x0, _x1, text in blocks:
        if STEM_START_RE.match(text):
            stem_y = y0
            break

    regions: list[tuple[float, float]] = []
    if stem_y is None:
        regions.append((y_min, y_max))
    else:
        choice_y = find_choice_y(blocks, stem_y + 8)
        regions.append((y_min, stem_y))
        regions.append((stem_y + 8, choice_y if choice_y is not None else y_max))

    best: tuple[float, fitz.Rect] | None = None
    for region_top, region_bot in regions:
        if region_bot <= region_top + 20:
            continue
        table_blocks = [
            block
            for block in blocks
            if block[0] >= region_top
            and block[1] <= region_bot
            and is_table_like_text(block[4])
        ]
        if len(table_blocks) < 2 and not any(
            TABLE_TITLE_RE.search(block[4]) for block in table_blocks
        ):
            continue

        top = min(block[0] for block in table_blocks) - 6
        bottom = max(block[1] for block in table_blocks) + 8
        left = min(block[2] for block in table_blocks) - 8
        right = max(block[3] for block in table_blocks) + 8
        if bottom - top < 40 or right - left < 140:
            continue
        crop = fitz.Rect(
            max(36, left),
            max(y_min, top),
            min(page.rect.width - 36, right),
            min(y_max, bottom),
        )
        area = crop.width * crop.height
        if best is None or area > best[0]:
            best = (area, crop)
    return best[1] if best else None


def find_visual_for_question(
    document: fitz.Document,
    start: tuple[int, float],
    end: tuple[int, float],
) -> tuple[int, fitz.Rect, str] | None:
    start_page, start_y = start
    end_page, end_y = end
    candidates: list[tuple[float, int, fitz.Rect, str]] = []

    for page_index in range(start_page, end_page + 1):
        page = document[page_index]
        y_min = start_y if page_index == start_page else 0.0
        y_max = end_y if page_index == end_page else page.rect.height
        if y_max <= y_min + 4:
            continue

        for kind, finder in (
            ("image", find_image_crop),
            ("drawing", find_drawing_crop),
            ("table", find_table_text_crop),
        ):
            crop = finder(page, y_min, y_max)
            if crop is None or crop.width < 140 or crop.height < 50:
                continue
            candidates.append((crop.width * crop.height, page_index, crop, kind))

    if not candidates:
        return None
    _area, page_index, crop, kind = max(candidates, key=lambda item: item[0])
    return page_index, crop, kind


def render_visual(page: fitz.Page, crop: fitz.Rect, output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    pixmap = page.get_pixmap(matrix=fitz.Matrix(2, 2), clip=crop, alpha=False)
    pixmap.pil_save(output_path, format="WEBP", quality=90)


def attach_visuals(
    path: Path,
    questions: list[dict[str, Any]],
    assets_dir: Path,
) -> int:
    document = fitz.open(path)
    anchors = find_question_anchors(document)
    if not anchors:
        return 0

    ordered = sorted(
        anchors.items(), key=lambda item: (item[1][0], item[1][1], item[0])
    )
    span_by_number: dict[int, tuple[tuple[int, float], tuple[int, float]]] = {}
    for index, (number, start) in enumerate(ordered):
        if index + 1 < len(ordered):
            end = ordered[index + 1][1]
        else:
            last_page = len(document) - 1
            end = (last_page, float(document[last_page].rect.height))
        span_by_number[number] = (start, end)

    attached = 0
    for question in questions:
        number = int(question["question_number"])
        span = span_by_number.get(number)
        if span is None:
            continue
        visual = find_visual_for_question(document, span[0], span[1])
        if visual is None:
            continue
        page_index, crop, kind = visual
        has_hint = bool(
            VISUAL_HINT_RE.search(question["question_text"])
            or TABLE_TITLE_RE.search(question["question_text"])
        )
        if kind != "image" and not has_hint:
            continue
        asset_path = f"assets/{question['source_id']}.webp"
        render_visual(
            document[page_index], crop, assets_dir / f"{question['source_id']}.webp"
        )
        question["asset_path"] = asset_path
        question["question_text"] = strip_visual_ocr_from_stem(
            question["question_text"]
        )
        attached += 1
    return attached


def skill_before(text: str, index: int) -> str | None:
    preceding = text[:index]
    matches = list(SKILL_LINE_RE.finditer(preceding))
    if not matches:
        return None
    return canonical_skill(matches[-1].group(0))


def parse_choices(choice_block: str, correct: str) -> list[dict[str, Any]]:
    # Anchor on the final A/B/C/D block before the answer so stems like
    # "C. difficile..." are not mistaken for choice C.
    starts = list(CHOICE_BLOCK_START_RE.finditer(choice_block))
    if not starts:
        return []

    for start in reversed(starts):
        segment = choice_block[start.start() :]
        found: dict[str, dict[str, Any]] = {}
        for match in CHOICE_LINE_RE.finditer(segment):
            label = match.group(1).upper()
            choice_text = clean_text(match.group(2))
            if not choice_text:
                continue
            existing = found.get(label)
            if existing is None or len(choice_text) > len(existing["choice_text"]):
                found[label] = {
                    "label": label,
                    "choice_text": choice_text,
                    "is_correct": label == correct,
                    "display_order": ord(label) - ord("A"),
                }
        if all(label in found for label in ("A", "B", "C", "D")):
            return [found[label] for label in ("A", "B", "C", "D")]
    return []


def split_stem_and_choices(question_body: str, correct: str) -> tuple[str, list[dict[str, Any]]]:
    search_area = f"{question_body}\nAnswer: {correct}"
    starts = list(CHOICE_BLOCK_START_RE.finditer(search_area))
    if not starts:
        raise ValueError("missing choices")

    for start in reversed(starts):
        choice_region = search_area[start.start() :]
        choices = parse_choices(choice_region, correct)
        if len(choices) != 4:
            continue
        stem = clean_text(search_area[: start.start()])
        stem = re.sub(
            r"\nAnswer:\s*[A-D].*$",
            "",
            stem,
            flags=re.IGNORECASE | re.DOTALL,
        ).strip()
        if stem:
            return stem, choices

    raise ValueError("expected 4 choices")


def parse_question_block(
    block: str,
    *,
    exam_number: int,
    module: int,
    question_number: int,
    skill: str,
) -> dict[str, Any]:
    difficulty_match = DIFFICULTY_RE.search(block)
    if not difficulty_match:
        raise ValueError("missing difficulty")
    difficulty = difficulty_match.group(1).lower()

    answer_match = ANSWER_RE.search(block)
    if not answer_match:
        raise ValueError("missing answer")
    correct = answer_match.group(1).upper()

    explanation_match = EXPLANATION_RE.search(block)
    if not explanation_match:
        raise ValueError("missing explanation")

    explanation = clean_text(block[explanation_match.end() :])
    # Stop explanation if another question leaked into the same block.
    explanation = re.split(
        r"\nQuestion\s+\d+\b|\n(?:Words in Context|Transitions?|Inferences|"
        r"Cross-Text|Command of Evidence|Boundaries|Ideas and Detail|"
        r"Form Structure Sense|Structure Purpose|Expression of Ideas)\b",
        explanation,
        maxsplit=1,
    )[0].strip()

    question_body = block[: answer_match.start()]
    question_body = re.sub(
        r"^\s*Question\s+\d+\s*",
        "",
        question_body,
        count=1,
        flags=re.IGNORECASE,
    )
    question_body = DIFFICULTY_RE.sub("", question_body, count=1)
    question_body = PAGE_NOISE_RE.sub("\n", question_body)
    question_body = clean_text(question_body)

    stem, choices = split_stem_and_choices(question_body, correct)
    if not explanation:
        raise ValueError("empty explanation")

    source_id = f"exam-{exam_number}-m{module}-q{question_number:02d}"
    return {
        "exam_type": "sat",
        "section": "Reading and Writing",
        "group_key": GROUP_KEY,
        "group_label": GROUP_LABEL,
        "question_number": question_number,
        "question_type": "multiple-choice",
        "passage": None,
        "question_text": stem,
        "asset_path": None,
        "image_url": None,
        "correct_answer": correct,
        "accepted_answers": [],
        "explanation": explanation,
        "difficulty": difficulty,
        "status": "published",
        "skill": skill,
        "question_code": "",  # filled after global numbering
        "source_name": SOURCE_NAME,
        "source_id": source_id,
        "choices": choices,
        "exam_number": exam_number,
        "module": module,
    }


def extract_file(
    path: Path,
    exam_number: int,
    module: int,
    assets_dir: Path,
) -> tuple[list[dict[str, Any]], list[str], int]:
    text = extract_document_text(path)
    starts = list(QUESTION_START_RE.finditer(text))
    if not starts:
        raise ValueError(f"{path.name}: no questions found")

    by_number: dict[int, dict[str, Any]] = {}
    errors: list[str] = []

    for index, match in enumerate(starts):
        question_number = int(match.group(1))
        end = starts[index + 1].start() if index + 1 < len(starts) else len(text)
        block = text[match.start() : end]
        if "Missing Source Content" in block:
            errors.append(f"q{question_number}: missing source content")
            continue
        if re.search(r"does not identify an official answer", block, re.IGNORECASE):
            errors.append(f"q{question_number}: no official answer")
            continue

        skill = skill_before(text, match.start())
        if not skill:
            # Fallback: skill header may sit inside the block after a page break.
            header_in_block = SKILL_LINE_RE.search(block)
            skill = canonical_skill(header_in_block.group(0)) if header_in_block else None
        if not skill:
            errors.append(f"q{question_number}: missing skill")
            continue

        try:
            parsed = parse_question_block(
                block,
                exam_number=exam_number,
                module=module,
                question_number=question_number,
                skill=skill,
            )
        except ValueError as exc:
            errors.append(f"q{question_number}: {exc}")
            continue

        existing = by_number.get(question_number)
        if existing is None or len(parsed["question_text"]) > len(existing["question_text"]):
            by_number[question_number] = parsed

    if errors and not by_number:
        raise ValueError(f"{path.name}: {'; '.join(errors[:5])}")

    questions = [by_number[number] for number in sorted(by_number)]
    visuals = attach_visuals(path, questions, assets_dir)
    return questions, errors, visuals


def assign_codes(questions: list[dict[str, Any]]) -> None:
    counters: defaultdict[str, int] = defaultdict(int)
    for question in questions:
        skill = question["skill"]
        counters[skill] += 1
        prefix = SKILL_PREFIXES[skill]
        question["question_code"] = f"{prefix}{counters[skill]:05d}{SOURCE_LETTER}"


def validate(questions: list[dict[str, Any]]) -> None:
    errors: list[str] = []
    ids = [q["source_id"] for q in questions]
    codes = [q["question_code"] for q in questions]

    if len(set(ids)) != len(ids):
        errors.append("duplicate source_id values")
    if len(set(codes)) != len(codes):
        errors.append("duplicate question_code values")

    for question in questions:
        labels = [choice["label"] for choice in question["choices"]]
        if labels != ["A", "B", "C", "D"]:
            errors.append(f'{question["source_id"]}: choices {labels}')
        if question["correct_answer"] not in labels:
            errors.append(f'{question["source_id"]}: bad correct answer')
        if not question["question_text"] or not question["explanation"]:
            errors.append(f'{question["source_id"]}: empty text')
        if any(not choice["choice_text"] for choice in question["choices"]):
            errors.append(f'{question["source_id"]}: empty choice')
        if not re.fullmatch(r"[A-Z]{3}\d{5}E", question["question_code"]):
            errors.append(f'{question["source_id"]}: bad code {question["question_code"]}')

    if errors:
        preview = "\n".join(f"- {error}" for error in errors[:40])
        raise ValueError(f"Validation failed ({len(errors)}):\n{preview}")


def write_report(
    output_dir: Path,
    questions: list[dict[str, Any]],
    file_summaries: list[dict[str, Any]],
    warnings: list[str],
) -> None:
    skills = Counter(q["skill"] for q in questions)
    difficulties = Counter(q["difficulty"] for q in questions)
    lines = [
        "# Keplerly exams extraction report",
        "",
        f"- Questions: {len(questions)}",
        f"- Visuals: {sum(q.get('asset_path') is not None for q in questions)}",
        f"- Unique codes: {len({q['question_code'] for q in questions})}",
        f"- Source: {SOURCE_NAME}",
        "",
        "## Files",
    ]
    for summary in file_summaries:
        lines.append(
            f"- {summary['file']}: {summary['count']} questions"
            + (f", {summary.get('visuals', 0)} visuals" if summary.get("visuals") else "")
            + (f" ({summary['warnings']} warnings)" if summary["warnings"] else "")
        )

    lines.extend(["", "## Skills"])
    for skill, prefix in SKILL_PREFIXES.items():
        lines.append(f"- {prefix} — {skill}: {skills.get(skill, 0)}")

    lines.extend(["", "## Difficulties"])
    for difficulty in ("easy", "medium", "hard"):
        lines.append(f"- {difficulty}: {difficulties.get(difficulty, 0)}")

    if warnings:
        lines.extend(["", "## Warnings"])
        lines.extend(f"- {warning}" for warning in warnings[:100])

    samples: dict[str, dict[str, Any]] = {}
    for question in questions:
        samples.setdefault(question["skill"], question)
    lines.extend(["", "## Samples"])
    for skill, question in samples.items():
        preview = question["question_text"][:120].replace("\n", " ")
        lines.append(
            f"- {question['question_code']} ({question['difficulty']}, {skill}): {preview}…"
        )

    (output_dir / "report.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--input",
        type=Path,
        default=Path("../Keplerly/Exams Full"),
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path(".question-import/keplerly-exams"),
    )
    args = parser.parse_args()

    input_dir = args.input.expanduser().resolve()
    output_dir = args.output
    output_dir.mkdir(parents=True, exist_ok=True)
    assets_dir = output_dir / "assets"
    assets_dir.mkdir(parents=True, exist_ok=True)
    for stale in assets_dir.glob("*.webp"):
        stale.unlink()

    files = list_exam_files(input_dir)
    if not files:
        raise SystemExit(f"No exam PDFs found in {input_dir}")

    all_questions: list[dict[str, Any]] = []
    file_summaries: list[dict[str, Any]] = []
    warnings: list[str] = []
    total_visuals = 0

    for exam_number, module, path in files:
        questions, file_errors, visuals = extract_file(
            path, exam_number, module, assets_dir
        )
        total_visuals += visuals
        for error in file_errors:
            warning = f"{path.name}: {error}"
            warnings.append(warning)
            print(f"WARN {warning}")
        file_summaries.append(
            {
                "file": path.name,
                "count": len(questions),
                "warnings": len(file_errors),
                "visuals": visuals,
            }
        )
        print(
            f"Extracted {len(questions):2d} from {path.name} ({visuals} visuals)"
        )
        all_questions.extend(questions)

    assign_codes(all_questions)
    validate(all_questions)

    payload = []
    for question in all_questions:
        item = dict(question)
        item.pop("exam_number", None)
        item.pop("module", None)
        payload.append(item)

    (output_dir / "questions.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    write_report(output_dir, payload, file_summaries, warnings)
    print(
        f"\nValidated {len(payload)} questions ({total_visuals} visuals) → {output_dir / 'questions.json'}"
    )
    print(f"Report: {output_dir / 'report.md'}")


if __name__ == "__main__":
    main()
