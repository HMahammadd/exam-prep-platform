#!/usr/bin/env python3
"""Extract and validate the College Board SAT question-bank PDF."""

from __future__ import annotations

import argparse
import json
import os
import re
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

import fitz
from wordfreq import zipf_frequency

SOURCE_NAME = "college-board-official-tests"
EXPECTED_QUESTION_COUNT = 1_688
EXPECTED_VISUAL_COUNT = 127
EXPECTED_SKILLS = {
    "Words in Context": ("SVW", 241),
    "Transitions": ("SVT", 173),
    "Inferences": ("SVI", 124),
    "Cross-Text Connections": ("SVC", 58),
    "Command of Evidence": ("SVE", 258),
    "Boundaries": ("SVB", 190),
    "Central Ideas and Details": ("SVM", 125),
    "Form, Structure, and Sense": ("SVS", 189),
    "Text Structure and Purpose": ("SVP", 138),
    "Rhetorical Synthesis": ("SVN", 192),
}
EXPECTED_DIFFICULTIES = {"Easy": 593, "Medium": 562, "Hard": 533}
SKILL_ALIASES = {
    **{name.casefold(): name for name in EXPECTED_SKILLS},
    "cross-text connections": "Cross-Text Connections",
}
QUESTION_ID_RE = re.compile(r"Question ID:\s*([0-9a-f]{8})", re.IGNORECASE)
PAGE_FOOTER_RE = re.compile(r"\n?--\s*\d+\s+of\s+\d+\s*--\n?", re.IGNORECASE)
CHOICE_RE = re.compile(
    r"(?:^|\n)([A-D])\.\s*(.*?)(?=(?:\n[A-D]\.\s)|(?:\nCorrect Answer:))",
    re.DOTALL,
)
SPLIT_RT_RE = re.compile(r"\b([A-Za-z]*r)\s+(t[A-Za-z]*)\b")


def repair_split_rt(match: re.Match[str]) -> str:
    spaced = match.group(0)
    joined = f"{match.group(1)}{match.group(2)}"
    if spaced.casefold() == "mar ta":
        return "Marta" if spaced[0].isupper() else "marta"
    if zipf_frequency(joined, "en") >= zipf_frequency(spaced, "en") + 0.2:
        return joined
    return spaced


def clean_text(value: str) -> str:
    value = (
        value.replace("\u00a0", " ")
        .replace("\u2002", " ")
        .replace("\x00", "ʻ")
    )
    value = value.replace("“", '"').replace("”", '"').replace("’", "'")
    value = re.sub(r"(\w)-\s*\n\s*(\w)", r"\1-\2", value)
    value = re.sub(r"\s*\n\s*", " ", value)
    # The PDF's font positioning frequently splits English words at "rt".
    # Compare corpus frequencies so real phrases such as "for the" stay split.
    value = SPLIT_RT_RE.sub(repair_split_rt, value)
    return re.sub(r"[ \t]+", " ", value).strip()


def canonical_skill(header: str) -> str:
    normalized = clean_text(header).casefold()
    for alias, canonical in SKILL_ALIASES.items():
        if alias in normalized:
            return canonical
    raise ValueError(f"Unknown skill header: {clean_text(header)!r}")


def parse_question_text(raw: str, is_visual: bool, stem_start: str | None) -> dict[str, Any]:
    raw = PAGE_FOOTER_RE.sub("\n", raw)
    # One source page omits the printed "D." even though its rationale identifies
    # the final sentence as choice D.
    if "Question ID: e3bbf2bf" in raw:
        raw = raw.replace(
            "\nThe Choctaw Code Talkers, not the Navajo Code Talkers,",
            "\nD. The Choctaw Code Talkers, not the Navajo Code Talkers,",
            1,
        )
    question_marker = re.search(r"(?:^|\n)Question\s*\n", raw)
    answer_marker = re.search(r"\nAnswer\s*\n", raw)
    correct_marker = re.search(r"\nCorrect Answer:\s*([A-D])\s*\n", raw)
    rationale_marker = re.search(r"\nRationale\s*\n", raw)

    if not all((question_marker, answer_marker, correct_marker, rationale_marker)):
        raise ValueError("Missing Question, Answer, Correct Answer, or Rationale marker")

    question_part = raw[question_marker.end() : answer_marker.start()]
    if is_visual and stem_start:
        stem_index = question_part.find(stem_start.strip())
        if stem_index >= 0:
            question_part = question_part[stem_index:]

    answer_part = raw[answer_marker.end() : correct_marker.start()]
    choices = [
        {
            "label": match.group(1),
            "choice_text": clean_text(match.group(2)),
            "is_correct": match.group(1) == correct_marker.group(1),
            "display_order": ord(match.group(1)) - ord("A"),
        }
        for match in CHOICE_RE.finditer(
            f"\n{answer_part}\nCorrect Answer: {correct_marker.group(1)}"
        )
    ]

    return {
        "question_text": clean_text(question_part),
        "choices": choices,
        "correct_answer": correct_marker.group(1),
        "explanation": clean_text(raw[rationale_marker.end() :]),
    }


def visual_crop(page: fitz.Page) -> tuple[fitz.Rect, str] | None:
    if len(page.get_drawings()) < 46:
        return None

    blocks = page.get_text("blocks", sort=True)
    question_blocks = [
        block for block in blocks if clean_text(block[4]).casefold() == "question"
    ]
    if not question_blocks:
        raise ValueError("Visual page has no Question heading")

    question_bottom = question_blocks[0][3]
    prose_blocks = [
        block
        for block in blocks
        if block[1] > question_bottom + 5
        and block[0] < 40
        and block[2] - block[0] > 300
        and len(clean_text(block[4])) > 70
        and not clean_text(block[4]).startswith(("A.", "B.", "C.", "D."))
    ]
    if not prose_blocks:
        raise ValueError("Could not locate prose below visual")

    first_prose = min(prose_blocks, key=lambda block: block[1])
    crop = fitz.Rect(95, question_bottom + 2, page.rect.width - 95, first_prose[1] - 7)
    if crop.height < 25:
        raise ValueError("Detected visual crop is too short")
    return crop, first_prose[4].strip()


def render_visual(page: fitz.Page, crop: fitz.Rect, output_path: Path) -> None:
    pixmap = page.get_pixmap(matrix=fitz.Matrix(2, 2), clip=crop, alpha=False)
    pixmap.pil_save(output_path, format="WEBP", quality=90)


def extract(pdf_path: Path, output_dir: Path) -> list[dict[str, Any]]:
    document = fitz.open(pdf_path)
    starts: list[tuple[int, str]] = []
    for page_index, page in enumerate(document):
        match = QUESTION_ID_RE.search(page.get_text())
        if match:
            starts.append((page_index, match.group(1).lower()))

    if len(starts) != EXPECTED_QUESTION_COUNT:
        raise ValueError(
            f"Expected {EXPECTED_QUESTION_COUNT} questions, found {len(starts)}"
        )

    assets_dir = output_dir / "assets"
    assets_dir.mkdir(parents=True, exist_ok=True)
    counters: defaultdict[str, int] = defaultdict(int)
    questions: list[dict[str, Any]] = []

    for position, (start_page, source_id) in enumerate(starts):
        end_page = starts[position + 1][0] if position + 1 < len(starts) else len(document)
        pages = [document[index] for index in range(start_page, end_page)]
        raw = "\n".join(page.get_text() for page in pages)
        question_heading = re.search(r"(?:^|\n)Question\s*\n", raw)
        if not question_heading:
            raise ValueError(f"{source_id}: missing Question heading")

        header = raw[: question_heading.start()]
        skill = canonical_skill(header)
        difficulty_match = re.search(r"\b(Easy|Medium|Hard)\b", clean_text(header))
        if not difficulty_match:
            raise ValueError(f"{source_id}: missing difficulty")
        difficulty = difficulty_match.group(1)

        visual = visual_crop(pages[0])
        asset_path: str | None = None
        stem_start: str | None = None
        if visual:
            crop, stem_start = visual
            asset_path = f"assets/{source_id}.webp"
            render_visual(pages[0], crop, output_dir / asset_path)

        parsed = parse_question_text(raw, visual is not None, stem_start)
        counters[skill] += 1
        prefix = EXPECTED_SKILLS[skill][0]
        code = f"{prefix}{counters[skill]:05d}C"

        questions.append(
            {
                "exam_type": "sat",
                "section": "Reading and Writing",
                "group_key": "official-tests",
                "group_label": "Official SAT Question Bank",
                "question_number": position + 1,
                "question_type": "multiple-choice",
                "passage": None,
                "question_text": parsed["question_text"],
                "asset_path": asset_path,
                "image_url": None,
                "correct_answer": parsed["correct_answer"],
                "accepted_answers": [],
                "explanation": parsed["explanation"],
                "difficulty": difficulty.lower(),
                "status": "published",
                "skill": skill,
                "question_code": code,
                "source_name": SOURCE_NAME,
                "source_id": source_id,
                "choices": parsed["choices"],
                "source_pages": [start_page + 1, end_page],
            }
        )

        if (position + 1) % 100 == 0:
            print(f"Extracted {position + 1}/{len(starts)}")

    return questions


def validate(questions: list[dict[str, Any]]) -> None:
    errors: list[str] = []
    ids = [question["source_id"] for question in questions]
    codes = [question["question_code"] for question in questions]
    skills = Counter(question["skill"] for question in questions)
    difficulties = Counter(question["difficulty"].title() for question in questions)
    visual_count = sum(question["asset_path"] is not None for question in questions)

    if len(questions) != EXPECTED_QUESTION_COUNT:
        errors.append(f"question count: {len(questions)}")
    if len(set(ids)) != len(ids):
        errors.append("source IDs are not unique")
    if len(set(codes)) != len(codes):
        errors.append("question codes are not unique")
    if visual_count != EXPECTED_VISUAL_COUNT:
        errors.append(f"visual count: expected {EXPECTED_VISUAL_COUNT}, got {visual_count}")

    expected_skill_counts = {
        name: count for name, (_, count) in EXPECTED_SKILLS.items()
    }
    if dict(skills) != expected_skill_counts:
        errors.append(f"skill counts differ: {dict(skills)}")
    if dict(difficulties) != EXPECTED_DIFFICULTIES:
        errors.append(f"difficulty counts differ: {dict(difficulties)}")

    for question in questions:
        labels = [choice["label"] for choice in question["choices"]]
        if labels != ["A", "B", "C", "D"]:
            errors.append(f'{question["source_id"]}: choices are {labels}')
        if question["correct_answer"] not in labels:
            errors.append(f'{question["source_id"]}: invalid correct answer')
        if not question["question_text"] or not question["explanation"]:
            errors.append(f'{question["source_id"]}: empty question or explanation')
        if any(not choice["choice_text"] for choice in question["choices"]):
            errors.append(f'{question["source_id"]}: empty choice')

    if errors:
        preview = "\n".join(f"- {error}" for error in errors[:50])
        raise ValueError(f"Validation failed with {len(errors)} issue(s):\n{preview}")


def write_report(output_dir: Path, questions: list[dict[str, Any]]) -> None:
    samples: dict[tuple[str, str], dict[str, Any]] = {}
    for question in questions:
        samples.setdefault((question["skill"], question["difficulty"]), question)

    lines = [
        "# Official SAT extraction report",
        "",
        f"- Questions: {len(questions)}",
        f"- Visuals: {sum(q['asset_path'] is not None for q in questions)}",
        f"- Unique source IDs: {len({q['source_id'] for q in questions})}",
        f"- Unique codes: {len({q['question_code'] for q in questions})}",
        "",
        "## Counts by question type",
    ]
    for skill, (prefix, expected) in EXPECTED_SKILLS.items():
        lines.append(f"- {prefix} — {skill}: {expected}")

    lines.extend(["", "## Representative samples"])
    for (skill, difficulty), question in samples.items():
        preview = question["question_text"][:140].replace("\n", " ")
        lines.append(
            f"- {question['question_code']} ({difficulty}, {skill}, "
            f"source {question['source_id']}): {preview}…"
        )

    (output_dir / "report.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "pdf",
        nargs="?",
        type=Path,
        default=Path(
            os.environ.get("OFFICIAL_SAT_PDF", "../Keplerly/Official Tests.pdf")
        ),
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path(".question-import/official-tests"),
    )
    args = parser.parse_args()

    args.output.mkdir(parents=True, exist_ok=True)
    questions = extract(args.pdf.expanduser().resolve(), args.output)
    validate(questions)
    (args.output / "questions.json").write_text(
        json.dumps(questions, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    write_report(args.output, questions)
    print(f"Validated {len(questions)} questions. Report: {args.output / 'report.md'}")


if __name__ == "__main__":
    main()
