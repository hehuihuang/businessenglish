import argparse
import json
import re
from pathlib import Path


def _ascii_only_keep_spaces(s: str) -> str:
    # Keep printable ASCII to preserve English words and punctuation; drop the rest (garbled CJK).
    return "".join((ch if 32 <= ord(ch) <= 126 else " ") for ch in s)


def _remove_timestamps(s: str) -> str:
    # 00:00, 02:01, 01:03:19
    return re.sub(r"\b\d{1,2}:\d{2}(?::\d{2})?\b", " ", s)


def _normalize_spaces(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip()


FIX_MAP = {
    # Obvious ASR mistakes seen in this dataset.
    "result a major bug": "resolved a major bug",
    "i practise": "i practice",
    "underpressure": "under pressure",
    "alligns": "aligns",
    "sales force": "salesforce",
    "microsoft suite": "microsoft office suite",
    "cost effective": "cost-effective",
    "solution oriented": "solution-oriented",
    "commonground": "common ground",
    "type project budgets": "tight project budgets",
    "difficult collie": "difficult colleague",
    "difficult college": "difficult colleague",
    "advanced coating course": "advanced coding course",
    "to a specialized online course": "through a specialized online course",
    "what makes you uni": "what makes you unique",
    "in clear concise emails": "and clear, concise emails",
    "our industries landscape": "our industry's landscape",
    "automation and ai": "automation and ai",  # keep lowercase here; we'll case later
    "excel and tableau": "excel and tableau",
}


def _apply_fixes(s: str) -> str:
    out = s
    for a, b in FIX_MAP.items():
        out = re.sub(re.escape(a), b, out, flags=re.IGNORECASE)
    return out


def _normalize_key(s: str) -> str:
    s = s.lower().strip()
    s = _apply_fixes(s)
    s = re.sub(r"[^a-z0-9']+", " ", s)
    s = _normalize_spaces(s)
    return s


QUESTION_STARTERS = {
    "can",
    "could",
    "would",
    "what",
    "why",
    "how",
    "describe",
    "tell",
    "do",
    "did",
    "are",
    "is",
    "have",
    "has",
    "when",
    "where",
    "which",
    "who",
}


def _title_case_pronouns_and_proper_nouns(s: str) -> str:
    # Minimal casing pass; this is an editor helper, not a full NLP truecaser.
    s = s.strip()
    if not s:
        return s

    # Normalize a few common tokens first.
    s = re.sub(r"\bone on one\b", "one-on-one", s, flags=re.IGNORECASE)
    s = re.sub(r"\bwork life balance\b", "work-life balance", s, flags=re.IGNORECASE)

    # Handle "i" and "i'm" variants.
    s = re.sub(r"(?i)\bim\b", "I'm", s)
    s = re.sub(r"(?i)\bi'm\b", "I'm", s)
    s = re.sub(r"(?i)\bi've\b", "I've", s)
    s = re.sub(r"(?i)\bi\b", "I", s)

    # Proper nouns / acronyms.
    s = re.sub(r"(?i)\bit\b", "IT", s)
    s = re.sub(r"(?i)\bagile\b", "Agile", s)
    s = re.sub(r"(?i)\bwaterfall\b", "Waterfall", s)
    s = re.sub(r"(?i)\bsalesforce\b", "Salesforce", s)
    s = re.sub(r"(?i)\bmicrosoft office suite\b", "Microsoft Office Suite", s)
    s = re.sub(r"(?i)\bexcel\b", "Excel", s)
    s = re.sub(r"(?i)\btableau\b", "Tableau", s)
    s = re.sub(r"(?i)\btrello\b", "Trello", s)
    s = re.sub(r"(?i)\bai\b", "AI", s)

    # Sentence initial capitalization.
    s = s[0].upper() + s[1:]
    return s


def _punctuate(s: str) -> str:
    s = s.strip()
    if not s:
        return s
    if s.endswith(("?", ".", "!")):
        return s
    first = s.split(" ", 1)[0].lower()
    if first in QUESTION_STARTERS:
        return s + "?"
    return s + "."


def extract_phrases(text: str) -> list[str]:
    text = _remove_timestamps(text)
    text = _ascii_only_keep_spaces(text)
    text = _normalize_spaces(text)

    words = text.split(" ") if text else []
    phrases: list[str] = []
    i = 0
    n = len(words)

    # Greedy extraction of immediately repeated word windows (common in listening drills).
    while i < n:
        best_k = None
        best_reps = 1

        for k in range(50, 2, -1):
            if i + 2 * k > n:
                continue
            if words[i : i + k] == words[i + k : i + 2 * k]:
                reps = 2
                while i + (reps + 1) * k <= n and words[i : i + k] == words[
                    i + reps * k : i + (reps + 1) * k
                ]:
                    reps += 1
                best_k = k
                best_reps = reps
                break

        if best_k is not None:
            phrases.append(" ".join(words[i : i + best_k]))
            i += best_k * best_reps
            continue

        # No repetition detected; collect a bounded buffer until repetition appears.
        j = i + 1
        while j < n and j - i < 80:
            found = False
            for k in range(50, 2, -1):
                if j + 2 * k <= n and words[j : j + k] == words[j + k : j + 2 * k]:
                    found = True
                    break
            if found:
                break
            j += 1
        phrases.append(" ".join(words[i:j]))
        i = j

    # Fixes + drop intro + order-preserving dedupe.
    clean: list[str] = []
    seen: set[str] = set()
    for ph in phrases:
        ph = _normalize_spaces(_apply_fixes(ph))
        if not ph:
            continue
        key = _normalize_key(ph)
        if not key:
            continue
        if key.startswith("one hour to improve your english listening skills"):
            continue
        if key in seen:
            continue
        seen.add(key)
        clean.append(ph)

    return clean


def to_sentences(phrases: list[str]) -> list[str]:
    out: list[str] = []
    for ph in phrases:
        s = _normalize_spaces(ph)
        s = _title_case_pronouns_and_proper_nouns(s)
        s = _punctuate(s)
        out.append(s)
    return out


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("input", type=str)
    ap.add_argument("--format", choices=["lines", "json"], default="lines")
    ap.add_argument("--out", type=str, default="")
    ap.add_argument("--max", type=int, default=0, help="For inspection: only print the first N items.")
    args = ap.parse_args()

    p = Path(args.input)
    raw = p.read_bytes()
    # UTF-8 with ignore is enough to preserve all ASCII English in this dataset.
    text = raw.decode("utf-8", errors="ignore")

    phrases = extract_phrases(text)
    sentences = to_sentences(phrases)

    if args.max and args.max > 0:
        sentences = sentences[: args.max]

    if args.format == "json":
        payload = json.dumps(sentences, ensure_ascii=True, indent=2)
        if args.out:
            Path(args.out).write_text(payload, encoding="utf-8")
        else:
            print(payload)
        return 0

    if args.out:
        Path(args.out).write_text("\n".join(sentences) + "\n", encoding="utf-8")
    else:
        for i, s in enumerate(sentences, 1):
            print(f"{i:02d}. {s}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
