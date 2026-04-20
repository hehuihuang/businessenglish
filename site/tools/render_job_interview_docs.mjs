import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '..');
const sourceDir = path.resolve(workspaceRoot, '..', 'JOB_INTERVIEW');

const targets = [
  {
    root: workspaceRoot,
    dataFile: path.join(workspaceRoot, 'data', 'job_interview_docs.js'),
    markdownDir: path.join(workspaceRoot, 'job_interview_docs'),
    htmlDir: path.join(workspaceRoot, 'job_interview_docs_html'),
  },
  {
    root: path.join(workspaceRoot, 'businessenglish'),
    dataFile: path.join(workspaceRoot, 'businessenglish', 'data', 'job_interview_docs.js'),
    markdownDir: path.join(workspaceRoot, 'businessenglish', 'job_interview_docs'),
    htmlDir: path.join(workspaceRoot, 'businessenglish', 'job_interview_docs_html'),
  },
];

const ENTITY_MAP = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&nbsp;': ' ',
};

function decodeHtml(text) {
  return text.replace(/&(amp|lt|gt|quot|#39|apos|nbsp);/g, (match) => ENTITY_MAP[match] || match);
}

function stripHtml(text) {
  return decodeHtml(
    text
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, '')
  ).trim();
}

function escapeHtml(text) {
  return String(text ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char]));
}

function classifySnippet(text) {
  const normalized = text.trim();

  if (
    /^(?:\d+\.\s*)?(Tell|Why|How|What|Can|Do|Describe|Have|Where|When|Would|Walk|Give|Share|Explain|Introduce)\b/i.test(normalized) ||
    /^\d+\.\s+[^:]{1,80}:/i.test(normalized) ||
    /\?$/.test(normalized)
  ) {
    return 'question';
  }

  if (normalized.length <= 140) {
    return 'answer';
  }

  return 'insight';
}

function labelForSnippet(type) {
  return {
    question: 'Question Drill',
    answer: 'Answer Line',
    insight: 'Doc Insight',
  }[type] || 'Notebook Note';
}

async function loadJobInterviewLessons() {
  const lessonsFile = path.join(workspaceRoot, 'data', 'job_interview_lessons.js');
  const source = await fs.readFile(lessonsFile, 'utf8');
  const context = { globalThis: {} };
  vm.createContext(context);
  vm.runInContext(`${source}\nglobalThis.__LESSONS__ = JOB_INTERVIEW_LESSONS;`, context);
  return context.globalThis.__LESSONS__ || [];
}

async function parseDocFile(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  const sections = content
    .split(/^\s*---\s*$/m)
    .map((segment) => segment.trim())
    .filter(Boolean);

  const pairs = [];

  for (const section of sections) {
    const matches = Array.from(section.matchAll(/<div[^>]*>([\s\S]*?)<\/div>/gi));
    if (matches.length < 2) continue;

    const english = stripHtml(matches[0][1]);
    const chinese = stripHtml(matches[1][1]);
    if (!english || !chinese) continue;

    pairs.push({
      type: classifySnippet(english),
      en: english,
      zh: chinese,
    });
  }

  return pairs;
}

function cleanDocTitle(fileName) {
  return path
    .basename(fileName, '.md')
    .replace(/^.*?watchv=[A-Za-z0-9_-]{11}-*/, '')
    .replace(/^-+/, '')
    .trim();
}

function buildPageHtml(doc) {
  const visibleBlocks = doc.blocks.filter((block) => block.type !== 'insight');
  const heroLeadZh = visibleBlocks.length > 0
    ? `这里整理了 ${visibleBlocks.length} 张可直接练习的面试卡片，只保留问题和答案表达，方便你跟读、复述和记忆。`
    : '这个来源目前更偏讲解型笔记，所以这里暂时没有可直接练习的问题或答案卡片。';
  const heroLeadEn = visibleBlocks.length > 0
    ? `This notebook keeps ${visibleBlocks.length} practice-ready cards and shows only question and answer material for faster review.`
    : 'This source currently reads more like commentary notes, so there are no question or answer cards to show here yet.';
  const modeChip = visibleBlocks.length > 0 ? 'Question & Answer Only' : 'Practice Cards Unavailable';

  const noteGuideByType = {
    question: 'Use this as a practice prompt and answer it aloud before checking the translation.',
    answer: 'Treat this as a compact response pattern you can shadow, adapt, and memorize.',
  };

  const cards = visibleBlocks.length > 0
    ? visibleBlocks.map((block, index) => `
      <article class="note-card note-${block.type}">
        <div class="note-head">
          <div class="note-meta">
            <span class="note-index">${String(index + 1).padStart(2, '0')}</span>
            <span class="note-tag">${labelForSnippet(block.type)}</span>
          </div>
          <p class="note-caption">${noteGuideByType[block.type] || 'Review the English first, then use the Chinese to confirm your understanding.'}</p>
        </div>
        <div class="note-grid">
          <section class="lang-panel lang-en">
            <div class="lang-label">EN</div>
            <p>${escapeHtml(block.en)}</p>
          </section>
          <section class="lang-panel lang-zh">
            <div class="lang-label">ZH</div>
            <p>${escapeHtml(block.zh)}</p>
          </section>
        </div>
      </article>
    `).join('')
    : `
      <section class="empty-state">
        <div class="empty-state-kicker">Notebook Notice</div>
        <h2>No drill cards available yet</h2>
        <p>This source currently reads more like commentary notes, so this page does not show any question or answer cards.</p>
      </section>
    `;

  const homeHref = doc.lessonId ? `../index.html#lesson-${doc.lessonId}` : '../index.html';
  const indexHref = '../index.html';
  const videoButton = doc.videoUrl
    ? `<a class="button secondary" href="${doc.videoUrl}" target="_blank" rel="noopener noreferrer">Watch YouTube</a>`
    : '';
  const sourceLine = doc.docTitle && doc.docTitle !== doc.lessonTitle
    ? `<p class="hero-source">Source notebook: ${escapeHtml(doc.docTitle)}</p>`
    : '';

  return `<!DOCTYPE html>
<html lang="zh-CN" id="top">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(doc.lessonTitle || doc.docTitle)} | Lesson Notebook</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600&family=Playfair+Display:wght@400;500;600;700&family=Source+Sans+3:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --paper: #f6f1e8;
      --paper-strong: rgba(255, 252, 246, 0.92);
      --ink: #1e1a16;
      --ink-soft: #5f584f;
      --line: #e4d8c9;
      --accent: #94631a;
      --accent-soft: #f3e4ca;
      --shadow: 0 22px 48px rgba(45, 33, 17, 0.08);
      --radius-xl: 30px;
      --radius-lg: 22px;
      --radius-md: 18px;
      --radius-sm: 13px;
      --font-display: "Playfair Display", Georgia, serif;
      --font-body: "Source Sans 3", "Segoe UI", system-ui, sans-serif;
      --font-mono: "IBM Plex Mono", Consolas, monospace;
    }

    * { box-sizing: border-box; }

    html, body { margin: 0; padding: 0; }

    body {
      font-family: var(--font-body);
      color: var(--ink);
      line-height: 1.7;
      background:
        radial-gradient(circle at top left, rgba(183, 132, 45, 0.16), transparent 34%),
        radial-gradient(circle at right 18%, rgba(170, 127, 58, 0.08), transparent 22%),
        linear-gradient(180deg, #fcfaf6 0%, var(--paper) 100%);
    }

    body::before {
      content: "";
      position: fixed;
      inset: 0;
      pointer-events: none;
      opacity: 0.22;
      background-image: radial-gradient(rgba(40, 28, 13, 0.08) 0.45px, transparent 0.45px);
      background-size: 4px 4px;
      z-index: -1;
    }

    a {
      color: inherit;
      text-decoration: none;
    }

    .page {
      width: min(1180px, calc(100vw - 32px));
      margin: 28px auto 56px;
    }

    .hero {
      position: relative;
      overflow: hidden;
      border: 1px solid rgba(148, 99, 26, 0.2);
      border-radius: var(--radius-xl);
      background:
        linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(249, 241, 228, 0.92)),
        var(--paper-strong);
      box-shadow: var(--shadow);
      padding: 34px;
    }

    .hero::before {
      content: "";
      position: absolute;
      inset: 0;
      background:
        linear-gradient(120deg, rgba(255,255,255,0.42), transparent 38%),
        radial-gradient(circle at 88% 6%, rgba(183, 132, 45, 0.16), transparent 26%);
      pointer-events: none;
    }

    .eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      font-family: var(--font-mono);
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--accent);
      position: relative;
      z-index: 1;
    }

    .eyebrow::before,
    .eyebrow::after {
      content: "";
      width: 24px;
      height: 1px;
      background: rgba(148, 99, 26, 0.32);
    }

    h1 {
      position: relative;
      z-index: 1;
      margin: 18px 0 14px;
      font-family: var(--font-display);
      font-size: clamp(2.45rem, 2rem + 2vw, 4rem);
      line-height: 0.98;
      letter-spacing: -0.03em;
      max-width: 12ch;
    }

    .hero-grid {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: minmax(0, 1.35fr) minmax(290px, 0.82fr);
      gap: 24px;
      align-items: start;
    }

    .hero-copy {
      max-width: 720px;
    }

    .lead-zh {
      margin: 0 0 12px;
      font-size: 1.14rem;
      line-height: 1.85;
      color: #2d2721;
      text-shadow: 0 1px 2px rgba(255, 255, 255, 0.4);
    }

    .lead-en {
      margin: 0;
      font-size: 0.98rem;
      line-height: 1.75;
      color: var(--ink-soft);
    }

    .hero-source {
      margin: 12px 0 0;
      font-size: 0.92rem;
      line-height: 1.65;
      color: #746a5f;
    }

    .hero-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 22px;
    }

    .chip {
      display: inline-flex;
      align-items: center;
      min-height: 34px;
      padding: 0 14px;
      border-radius: 999px;
      border: 1px solid var(--line);
      background: rgba(255, 255, 255, 0.84);
      font-family: var(--font-mono);
      font-size: 12px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--ink-soft);
    }

    .hero-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 22px;
    }

    .button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 42px;
      padding: 0 16px;
      border-radius: 999px;
      border: 1px solid rgba(148, 99, 26, 0.24);
      font-family: var(--font-mono);
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      transition: transform 160ms ease, border-color 160ms ease, background-color 160ms ease, color 160ms ease;
    }

    .button:hover {
      transform: translateY(-1px);
    }

    .button:focus-visible {
      outline: 2px solid rgba(148, 99, 26, 0.55);
      outline-offset: 2px;
    }

    .button.primary {
      background: linear-gradient(135deg, rgba(148, 99, 26, 0.18), rgba(217, 184, 123, 0.12));
      color: #7a5308;
    }

    .button.secondary {
      background: rgba(255, 255, 255, 0.82);
      color: var(--ink);
    }

    .hero-panel {
      border: 1px solid rgba(148, 99, 26, 0.18);
      border-radius: 22px;
      background: rgba(255, 255, 255, 0.74);
      padding: 18px;
      display: grid;
      gap: 18px;
      backdrop-filter: blur(8px);
    }

    .hero-panel-title {
      margin: 0 0 8px;
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--accent);
    }

    .hero-panel-copy {
      margin: 0;
      font-size: 0.95rem;
      line-height: 1.72;
      color: var(--ink-soft);
    }

    .source-note {
      margin: 0;
      font-family: var(--font-display);
      font-size: 1.06rem;
      line-height: 1.45;
      color: var(--ink);
    }

    .guide-list {
      margin: 0;
      padding-left: 20px;
      display: grid;
      gap: 8px;
      color: var(--ink-soft);
      font-size: 0.93rem;
    }

    .content {
      display: grid;
      gap: 16px;
      margin-top: 18px;
    }

    .empty-state {
      border: 1px dashed rgba(148, 99, 26, 0.28);
      border-radius: var(--radius-lg);
      background: rgba(255, 255, 255, 0.76);
      padding: 34px 28px;
      text-align: center;
      box-shadow: 0 12px 28px rgba(45, 33, 17, 0.04);
    }

    .empty-state-kicker {
      margin-bottom: 12px;
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--accent);
    }

    .empty-state h2 {
      margin: 0 0 10px;
      font-family: var(--font-display);
      font-size: 2rem;
      line-height: 1.05;
      color: var(--ink);
    }

    .empty-state p {
      max-width: 58ch;
      margin: 0 auto;
      font-size: 1rem;
      line-height: 1.75;
      color: var(--ink-soft);
    }

    .note-card {
      --note-accent: #8d6738;
      --note-border: rgba(141, 103, 56, 0.18);
      --note-head-bg: rgba(248, 242, 234, 0.9);
      --note-en-bg: rgba(255, 253, 248, 0.95);
      --note-zh-bg: rgba(248, 241, 231, 0.95);
      position: relative;
      overflow: hidden;
      border: 1px solid var(--note-border);
      border-radius: var(--radius-lg);
      background: rgba(255, 255, 255, 0.84);
      box-shadow: 0 12px 28px rgba(45, 33, 17, 0.05);
    }

    .note-card::before {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--note-accent), rgba(255, 255, 255, 0.2));
    }

    .note-card.note-question {
      --note-accent: #b37418;
      --note-border: rgba(179, 116, 24, 0.22);
      --note-head-bg: rgba(255, 247, 235, 0.94);
      --note-en-bg: rgba(255, 251, 242, 0.98);
      --note-zh-bg: rgba(252, 242, 224, 0.94);
    }

    .note-card.note-answer {
      --note-accent: #855e2d;
      --note-border: rgba(133, 94, 45, 0.2);
      --note-head-bg: rgba(250, 243, 235, 0.94);
      --note-en-bg: rgba(255, 252, 247, 0.98);
      --note-zh-bg: rgba(245, 236, 226, 0.94);
    }

    .note-head {
      display: grid;
      gap: 10px;
      padding: 18px 20px 14px;
      border-bottom: 1px solid var(--note-border);
      background: var(--note-head-bg);
    }

    .note-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .note-index {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 38px;
      height: 38px;
      padding: 0 10px;
      border-radius: 999px;
      border: 1px solid var(--note-border);
      background: rgba(255, 255, 255, 0.86);
      font-family: var(--font-mono);
      font-size: 12px;
      color: var(--note-accent);
    }

    .note-tag {
      font-family: var(--font-mono);
      font-size: 12px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--note-accent);
    }

    .note-caption {
      margin: 0;
      font-size: 0.9rem;
      line-height: 1.62;
      color: var(--ink-soft);
    }

    .note-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
      padding: 18px;
    }

    .lang-panel {
      border: 1px solid var(--note-border);
      border-radius: var(--radius-md);
      padding: 18px;
    }

    .lang-en {
      background: var(--note-en-bg);
    }

    .lang-zh {
      background: var(--note-zh-bg);
    }

    .lang-label {
      margin-bottom: 10px;
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--note-accent);
    }

    .lang-panel p {
      margin: 0;
      font-size: 1rem;
      line-height: 1.88;
      letter-spacing: 0.012em;
    }

    .lang-en p {
      color: var(--ink);
    }

    .lang-zh p {
      color: #544c42;
    }

    .footer {
      padding: 22px 8px 0;
      text-align: center;
      color: var(--ink-soft);
      font-size: 0.9rem;
    }

    .page-actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 12px;
      margin-top: 28px;
    }

    @media (max-width: 840px) {
      .page {
        width: min(100vw - 18px, 1180px);
        margin: 10px auto 28px;
      }

      .hero {
        padding: 22px 16px 18px;
      }

      .hero-grid,
      .note-grid {
        grid-template-columns: 1fr;
      }

      .hero-actions {
        flex-direction: column;
      }

      .button {
        width: 100%;
      }

      .page-actions {
        flex-direction: column;
      }

      .note-head,
      .note-grid {
        padding-left: 14px;
        padding-right: 14px;
      }

      .empty-state {
        padding: 26px 18px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }

      .button:hover {
        transform: none;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <header class="hero">
      <div class="eyebrow">Lesson Notebook</div>
      <h1>${escapeHtml(doc.lessonTitle || doc.docTitle)}</h1>
      <div class="hero-grid">
        <div class="hero-copy">
          <p class="lead-zh">${escapeHtml(heroLeadZh)}</p>
          <p class="lead-en">${escapeHtml(heroLeadEn)}</p>
          ${sourceLine}
          <div class="hero-meta">
            <span class="chip">${modeChip}</span>
            <span class="chip">${escapeHtml(doc.videoId)}</span>
          </div>
          <div class="hero-actions">
            <a class="button primary" href="${homeHref}">Back to Lesson</a>
            ${videoButton}
          </div>
        </div>
        <aside class="hero-panel">
          <div>
            <div class="hero-panel-title">Notebook Source</div>
            <p class="source-note">${escapeHtml(doc.docTitle)}</p>
          </div>
          <div>
            <div class="hero-panel-title">Reading Guide</div>
            <p class="hero-panel-copy">This page keeps only the practice-ready question and answer cards, so you can review without extra commentary blocks.</p>
          </div>
          <div>
            <div class="hero-panel-title">How To Use It</div>
            <ol class="guide-list">
              <li>Read the English block first and try to answer or paraphrase it yourself.</li>
              <li>Pause briefly before checking the Chinese panel for meaning and nuance.</li>
              <li>Reuse the answer lines as interview-ready phrasing you can memorize and adapt.</li>
            </ol>
          </div>
        </aside>
      </div>
    </header>

    <main class="content">
      ${cards}
    </main>

    <div class="page-actions">
      <a class="button secondary" href="#top">Back to Top</a>
      <a class="button primary" href="${indexHref}">Back to Home</a>
    </div>

    <footer class="footer">
      Source document: ${escapeHtml(doc.docTitle)}
    </footer>
  </div>
</body>
</html>`;
}

async function ensureCleanDir(dirPath) {
  await fs.rm(dirPath, { recursive: true, force: true });
  await fs.mkdir(dirPath, { recursive: true });
}

async function main() {
  const lessons = await loadJobInterviewLessons();
  const lessonByVideoId = new Map(
    lessons
      .filter((lesson) => lesson?.source?.videoId)
      .map((lesson) => [
        lesson.source.videoId,
        {
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          sourceTitle: lesson.source.title,
          videoUrl: lesson.source.url,
        },
      ])
  );

  const sourceEntries = await fs.readdir(sourceDir, { withFileTypes: true });
  const markdownFiles = sourceEntries.filter((entry) => entry.isFile() && entry.name.endsWith('.md'));
  const docs = [];

  for (const entry of markdownFiles) {
    const match = entry.name.match(/watchv=([A-Za-z0-9_-]{11})/);
    if (!match) continue;

    const videoId = match[1];
    const blocks = await parseDocFile(path.join(sourceDir, entry.name));
    if (blocks.length === 0) continue;

    const lessonMeta = lessonByVideoId.get(videoId) || {};
    const overviewIndex = blocks.length > 1 && blocks[0].type === 'question' && blocks[1].type !== 'question' ? 1 : 0;
    const overview = blocks[overviewIndex];
    const snippets = blocks.filter((_, index) => index !== overviewIndex).slice(0, 6);

    docs.push({
      videoId,
      lessonId: lessonMeta.lessonId || null,
      lessonTitle: lessonMeta.lessonTitle || cleanDocTitle(entry.name),
      sourceTitle: lessonMeta.sourceTitle || cleanDocTitle(entry.name),
      videoUrl: lessonMeta.videoUrl || null,
      docTitle: cleanDocTitle(entry.name),
      fileName: `${videoId}.html`,
      fileUrl: `job_interview_docs_html/${videoId}.html`,
      rawFileName: `${videoId}.md`,
      rawUrl: `job_interview_docs/${videoId}.md`,
      overview,
      snippets,
      blocks,
      blockCount: blocks.length,
      sourceName: entry.name,
    });
  }

  docs.sort((a, b) => (a.lessonId || '').localeCompare(b.lessonId || ''));

  const docMap = Object.fromEntries(
    docs.map((doc) => [
      doc.videoId,
      {
        videoId: doc.videoId,
        lessonId: doc.lessonId,
        lessonTitle: doc.lessonTitle,
        docTitle: doc.docTitle,
        fileName: doc.fileName,
        fileUrl: doc.fileUrl,
        rawFileName: doc.rawFileName,
        rawUrl: doc.rawUrl,
        overview: doc.overview,
        snippets: doc.snippets,
        blockCount: doc.blockCount,
      },
    ])
  );

  const dataPayload = `const JOB_INTERVIEW_DOCS = ${JSON.stringify(docMap, null, 2)};\n`;

  for (const target of targets) {
    await ensureCleanDir(target.markdownDir);
    await ensureCleanDir(target.htmlDir);
    await fs.mkdir(path.dirname(target.dataFile), { recursive: true });
    await fs.writeFile(target.dataFile, dataPayload, 'utf8');

    for (const doc of docs) {
      const sourceFile = path.join(sourceDir, doc.sourceName);
      await fs.copyFile(sourceFile, path.join(target.markdownDir, doc.rawFileName));
      await fs.writeFile(path.join(target.htmlDir, doc.fileName), buildPageHtml(doc), 'utf8');
    }
  }

  console.log(`Rendered ${docs.length} job interview doc pages.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
