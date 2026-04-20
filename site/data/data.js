// data.js — Unified data loader for Business English + Job Interview
// Combines 40 business lessons and 10 job interview lessons

// All lesson batch arrays must be loaded before this file via script tags:
// lessons_01_08.js, lessons_09_16.js, lessons_17_24.js, lessons_25_32.js,
// lessons_33_40.js, job_interview_lessons.js

const BUSINESS_ENGLISH_LESSONS = [
  ...LESSONS_BATCH_1,
  ...LESSONS_BATCH_2,
  ...LESSONS_BATCH_3,
  ...LESSONS_BATCH_4,
  ...LESSONS_BATCH_5
].map(lesson => ({
  ...lesson,
  track: lesson.track || 'businessenglish'
}));

const ALL_LESSONS = [
  ...BUSINESS_ENGLISH_LESSONS,
  ...JOB_INTERVIEW_LESSONS
];

// Category metadata
const CATEGORIES = {
  meetings: {
    label: "会议",
    label_en: "Meetings",
    icon: "🤝",
    color: "#2563eb"
  },
  emails: {
    label: "邮件",
    label_en: "Emails",
    icon: "✉️",
    color: "#16a34a"
  },
  presentations: {
    label: "演讲",
    label_en: "Presentations",
    icon: "📊",
    color: "#9333ea"
  },
  vocabulary: {
    label: "词汇",
    label_en: "Vocabulary",
    icon: "📖",
    color: "#ea580c"
  },
  grammar: {
    label: "语法",
    label_en: "Grammar",
    icon: "📝",
    color: "#0891b2"
  },
  workplace: {
    label: "职场",
    label_en: "Workplace",
    icon: "🏢",
    color: "#be185d"
  },
  career: {
    label: "职业发展",
    label_en: "Career",
    icon: "🚀",
    color: "#854d0e"
  },
  negotiation: {
    label: "谈判",
    label_en: "Negotiation",
    icon: "⚖️",
    color: "#115e59"
  },
  job_interview: {
    label: "JOB_INTERVIEW",
    label_en: "Job Interview",
    icon: "🎯",
    color: "#8a6a1e"
  }
};

// Build lookup index for fast access by id
const LESSON_INDEX = {};
ALL_LESSONS.forEach(lesson => {
  LESSON_INDEX[lesson.id] = lesson;
});

// Build tag-to-lessons index
const TAG_INDEX = {};
ALL_LESSONS.forEach(lesson => {
  (lesson.tags || []).forEach(tag => {
    if (!TAG_INDEX[tag]) TAG_INDEX[tag] = [];
    TAG_INDEX[tag].push(lesson.id);
  });
});

// Get all unique tags sorted by frequency
function getAllTags() {
  return Object.entries(TAG_INDEX)
    .sort((a, b) => b[1].length - a[1].length)
    .map(([tag]) => tag);
}

// Get lessons by category
function getLessonsByCategory(category) {
  return ALL_LESSONS.filter(l => l.category === category);
}

// Get lessons by track
function getLessonsByTrack(track) {
  return ALL_LESSONS.filter(l => l.track === track);
}

// Get lesson by id
function getLessonById(id) {
  return LESSON_INDEX[id] || null;
}

// Get related lessons for a given lesson
function getRelatedLessons(lessonId) {
  const lesson = getLessonById(lessonId);
  if (!lesson || !lesson.related) return [];
  return lesson.related
    .map(id => getLessonById(id))
    .filter(Boolean);
}

// Full-text search across all lesson content
function searchLessons(query) {
  if (!query || query.trim() === "") return ALL_LESSONS;
  const q = query.toLowerCase().trim();
  return ALL_LESSONS.filter(lesson => {
    // Search in title, chinese_title, summary, tags
    if (lesson.title.toLowerCase().includes(q)) return true;
    if (lesson.chinese_title && lesson.chinese_title.includes(q)) return true;
    if (lesson.summary && lesson.summary.includes(q)) return true;
    if (lesson.tags && lesson.tags.some(t => t.includes(q))) return true;
    // Search in section items
    for (const section of (lesson.sections || [])) {
      if (section.heading && section.heading.includes(q)) return true;
      for (const item of (section.items || [])) {
        if (item.term && item.term.toLowerCase().includes(q)) return true;
        if (item.chinese && item.chinese.includes(q)) return true;
        if (item.definition && item.definition.toLowerCase().includes(q)) return true;
        for (const ex of (item.examples || [])) {
          if (ex.en && ex.en.toLowerCase().includes(q)) return true;
          if (ex.zh && ex.zh.includes(q)) return true;
        }
      }
    }
    return false;
  });
}
