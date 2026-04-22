const LESSON_RESOURCE_LIBRARY = {};
const RESOURCE_INDEX = {};

const App = {
  currentView: 'list',
  currentLesson: null,
  currentFilter: { type: null, value: null },
  searchQuery: '',
  currentTrack: 'businessenglish',
  expandedJobLessonId: null,
  selectedJobLessonId: null,
  currentListLessonIds: [],
  unlockedResources: {},
  resourceFeedback: {},
  expandedTracks: {
    businessenglish: true,
    job_interview: true
  },

  init() {
    this.renderHero();
    this.renderCategories();
    this.renderTagCloud();
    this.renderJobInterviewList();
    this.bindEvents();
    this.updateCounts();
    this.syncTrackPanels();
    this.showBusinessEnglish(false);
  },

  bindEvents() {
    const searchInput = document.getElementById('search-input');
    const searchClear = document.getElementById('search-clear');
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const jobLessonList = document.getElementById('job-lesson-list');
    const heroTrackGrid = document.getElementById('hero-track-grid');
    const heroTagRibbon = document.getElementById('hero-tag-ribbon');
    const categoryList = document.getElementById('category-list');
    const tagCloud = document.getElementById('tag-cloud');
    const contextReset = document.getElementById('context-reset');

    searchInput.addEventListener('input', (event) => {
      this.searchQuery = event.target.value;
      this.performSearch();
      searchClear.classList.toggle('visible', this.searchQuery.trim().length > 0);
    });

    searchClear.addEventListener('click', () => {
      this.resetSearch();
      this.performSearch();
      searchInput.focus();
    });

    categoryList.addEventListener('click', (event) => {
      const button = event.target.closest('.category-item');
      if (!button) return;
      this.filterByCategory(button.dataset.category);
    });

    tagCloud.addEventListener('click', (event) => {
      const button = event.target.closest('.tag-btn');
      if (!button) return;
      this.filterByTag(button.dataset.tag);
    });

    if (heroTrackGrid) {
      heroTrackGrid.addEventListener('click', (event) => {
        const button = event.target.closest('[data-track]');
        if (!button) return;
        this.openTrackFocus(button.dataset.track);
      });
    }

    if (heroTagRibbon) {
      heroTagRibbon.addEventListener('click', (event) => {
        const button = event.target.closest('[data-hero-tag]');
        if (!button) return;
        this.filterByTag(button.dataset.heroTag);
        this.scrollToCatalogue();
      });
    }

    contextReset.addEventListener('click', () => {
      this.clearContext();
    });

    document.addEventListener('submit', (event) => {
      const resourceForm = event.target.closest('.pdf-download-form');
      if (!resourceForm) return;

      event.preventDefault();
      this.handleResourceUnlock(resourceForm);
    });

    jobLessonList.addEventListener('click', (event) => {
      const openButton = event.target.closest('.job-lesson-open');
      if (openButton) {
        this.showLesson(openButton.dataset.lessonId);
        return;
      }

      const toggleButton = event.target.closest('.job-lesson-toggle');
      if (toggleButton) {
        this.toggleJobLesson(toggleButton.dataset.lessonId);
      }
    });

    document.addEventListener('click', (event) => {
      if (window.innerWidth > 900) return;
      if (!sidebar.classList.contains('open')) return;
      if (sidebar.contains(event.target) || sidebarToggle.contains(event.target)) return;
      sidebar.classList.remove('open');
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) {
        sidebar.classList.remove('open');
      }
    });

    window.addEventListener('popstate', (event) => {
      if (event.state && event.state.lessonId) {
        this.showLesson(event.state.lessonId, false);
        return;
      }
      this.goBack(false);
    });
  },

  getTrackLessons(track) {
    return getLessonsByTrack(track).slice().sort((left, right) => left.number - right.number);
  },

  getReadingListForLesson(lesson) {
    if (
      Array.isArray(this.currentListLessonIds) &&
      this.currentListLessonIds.length > 0 &&
      this.currentListLessonIds.includes(lesson.id)
    ) {
      return this.currentListLessonIds.map((id) => getLessonById(id)).filter(Boolean);
    }

    return this.getTrackLessons(lesson.track || 'businessenglish');
  },

  getSiteStats() {
    const sectionCount = ALL_LESSONS.reduce(
      (total, lesson) => total + (lesson.sections || []).length,
      0
    );
    const itemCount = ALL_LESSONS.reduce((total, lesson) => {
      return total + (lesson.sections || []).reduce(
        (sectionTotal, section) => sectionTotal + (section.items || []).length,
        0
      );
    }, 0);
    const exampleCount = ALL_LESSONS.reduce((total, lesson) => {
      return total + (lesson.sections || []).reduce((sectionTotal, section) => {
        return sectionTotal + (section.items || []).reduce(
          (itemTotal, item) => itemTotal + (item.examples || []).length,
          0
        );
      }, 0);
    }, 0);

    return {
      totalLessons: ALL_LESSONS.length,
      businessLessons: this.getTrackLessons('businessenglish').length,
      jobLessons: this.getTrackLessons('job_interview').length,
      categoryCount: Object.keys(CATEGORIES).filter((key) => key !== 'job_interview').length,
      sectionCount,
      itemCount,
      exampleCount,
      tagCount: getAllTags().length,
      notebookCount: typeof JOB_INTERVIEW_DOCS === 'undefined' ? 0 : Object.keys(JOB_INTERVIEW_DOCS).length
    };
  },

  getLessonStats(lesson) {
    const sections = lesson.sections || [];
    const itemCount = sections.reduce(
      (total, section) => total + (section.items || []).length,
      0
    );
    const exampleCount = sections.reduce((total, section) => {
      return total + (section.items || []).reduce(
        (itemTotal, item) => itemTotal + (item.examples || []).length,
        0
      );
    }, 0);

    return {
      sectionCount: sections.length,
      itemCount,
      exampleCount,
      relatedCount: (lesson.related || []).length,
      tagCount: (lesson.tags || []).length
    };
  },

  getSectionAnchorId(lessonId, sectionIndex) {
    return `section-${lessonId}-${sectionIndex + 1}`;
  },

  getJobInterviewDoc(lesson) {
    if (
      lesson.track !== 'job_interview' ||
      !lesson.source ||
      typeof JOB_INTERVIEW_DOCS === 'undefined'
    ) {
      return null;
    }

    return JOB_INTERVIEW_DOCS[lesson.source.videoId] || null;
  },

  getLessonResource(lesson) {
    if (!lesson) return null;
    return LESSON_RESOURCE_LIBRARY[lesson.id] || null;
  },

  getResourceById(resourceId) {
    return RESOURCE_INDEX[resourceId] || null;
  },

  getResourceFeedback(resourceId) {
    return this.resourceFeedback[resourceId] || null;
  },

  async sha256Hex(value) {
    if (!window.crypto?.subtle) {
      throw new Error('Current browser does not support secure hashing.');
    }

    const encoded = new TextEncoder().encode(value);
    const digest = await window.crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  },

  async handleResourceUnlock(form) {
    const resourceId = form.dataset.resourceId;
    const resource = this.getResourceById(resourceId);
    const passwordInput = form.querySelector('input[name="download-password"]');

    if (!resource || !passwordInput) return;

    const enteredPassword = passwordInput.value.trim();

    if (!enteredPassword) {
      this.resourceFeedback[resourceId] = {
        type: 'error',
        text: '请输入下载密码。'
      };

      if (this.currentLesson) this.renderLessonDetail(this.currentLesson);
      this.focusResourcePasswordInput(resourceId);
      return;
    }

    try {
      const passwordHash = await this.sha256Hex(enteredPassword);

      if (passwordHash === resource.passwordHash) {
        this.unlockedResources[resourceId] = true;
        this.resourceFeedback[resourceId] = {
          type: 'success',
          text: '密码正确，下载权限已解锁。'
        };
      } else {
        this.resourceFeedback[resourceId] = {
          type: 'error',
          text: '密码不正确，请重试。'
        };
      }
    } catch (error) {
      this.resourceFeedback[resourceId] = {
        type: 'error',
        text: '当前浏览器不支持密码验证，请更换浏览器后重试。'
      };
    }

    if (this.currentLesson) this.renderLessonDetail(this.currentLesson);

    if (!this.unlockedResources[resourceId]) {
      this.focusResourcePasswordInput(resourceId);
    }
  },

  focusResourcePasswordInput(resourceId) {
    requestAnimationFrame(() => {
      const input = document.querySelector(`.pdf-download-form[data-resource-id="${resourceId}"] input[name="download-password"]`);
      if (!input) return;
      input.focus();
      input.select();
    });
  },

  getReadingContextLabel() {
    if (this.searchQuery.trim()) {
      return `Search sequence for "${this.searchQuery.trim()}"`;
    }

    if (this.currentFilter.type === 'tag') {
      return `Tag view: ${this.currentFilter.value}`;
    }

    if (this.currentFilter.type === 'category') {
      const category = CATEGORIES[this.currentFilter.value];
      return category ? `Category view: ${category.label_en}` : 'Category view';
    }

    if (this.currentTrack === 'job_interview') {
      return 'Job Interview track';
    }

    return 'Business English track';
  },

  resetSearch() {
    this.searchQuery = '';
    document.getElementById('search-input').value = '';
    document.getElementById('search-clear').classList.remove('visible');
  },

  clearContext() {
    this.resetSearch();
    this.showBusinessEnglish(false);
  },

  prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  scrollToCatalogue() {
    const target = document.getElementById('panel-list');
    if (!target) return;

    target.scrollIntoView({
      behavior: this.prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start'
    });
  },

  focusSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    searchInput.focus();
    searchInput.scrollIntoView({
      behavior: this.prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'center'
    });
  },

  scrollToSection(sectionId) {
    const target = document.getElementById(sectionId);
    if (!target) return;

    target.scrollIntoView({
      behavior: this.prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start'
    });
  },

  escapeHTML(text) {
    return String(text ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char]));
  },

  includesQuery(text, query) {
    if (!text || !query) return false;
    return String(text).toLowerCase().includes(query.toLowerCase());
  },

  createSnippet(text, query, maxLength = 108) {
    const source = String(text || '').trim();
    if (!source) return '';

    if (!query) {
      return source.length > maxLength ? `${source.slice(0, maxLength - 3).trim()}...` : source;
    }

    const normalizedSource = source.toLowerCase();
    const normalizedQuery = query.toLowerCase();
    const matchIndex = normalizedSource.indexOf(normalizedQuery);

    if (matchIndex === -1) {
      return source.length > maxLength ? `${source.slice(0, maxLength - 3).trim()}...` : source;
    }

    const queryLength = normalizedQuery.length;
    const padding = Math.max(16, Math.floor((maxLength - queryLength) / 2));
    const start = Math.max(0, matchIndex - padding);
    const end = Math.min(source.length, matchIndex + queryLength + padding);

    let snippet = source.slice(start, end).trim();
    if (start > 0) snippet = `...${snippet}`;
    if (end < source.length) snippet = `${snippet}...`;

    return snippet;
  },

  getSearchContext(lesson, query) {
    const sections = lesson.sections || [];
    const directCandidates = [
      { label: 'Title match', text: lesson.title },
      { label: 'Chinese title', text: lesson.chinese_title },
      { label: 'Summary match', text: lesson.summary },
      { label: 'Tag match', text: (lesson.tags || []).join(' / ') }
    ];

    for (const candidate of directCandidates) {
      if (this.includesQuery(candidate.text, query)) {
        return {
          label: candidate.label,
          text: this.createSnippet(candidate.text, query)
        };
      }
    }

    for (const section of sections) {
      if (this.includesQuery(section.heading, query)) {
        return {
          label: 'Section match',
          text: this.createSnippet(section.heading, query)
        };
      }

      for (const item of section.items || []) {
        const itemCandidates = [
          { label: 'Term match', text: item.term },
          { label: 'Definition match', text: item.definition },
          { label: 'Note match', text: item.note },
          { label: 'Chinese gloss', text: item.chinese }
        ];

        for (const candidate of itemCandidates) {
          if (this.includesQuery(candidate.text, query)) {
            return {
              label: candidate.label,
              text: this.createSnippet(candidate.text, query)
            };
          }
        }

        for (const example of item.examples || []) {
          if (this.includesQuery(example.en, query)) {
            return {
              label: 'Example match',
              text: this.createSnippet(example.en, query)
            };
          }

          if (this.includesQuery(example.zh, query)) {
            return {
              label: 'Example match',
              text: this.createSnippet(example.zh, query)
            };
          }
        }
      }
    }

    return null;
  },

  buildCardContext(lesson) {
    if (this.searchQuery.trim()) {
      return this.getSearchContext(lesson, this.searchQuery.trim());
    }

    if (this.currentFilter.type === 'tag') {
      const stats = this.getLessonStats(lesson);
      return {
        label: 'Connected content',
        text: `${stats.relatedCount} related lessons and ${stats.tagCount} tags attached to this topic.`
      };
    }

    if (this.currentFilter.type === 'category') {
      const firstSection = (lesson.sections || [])[0];
      if (firstSection && firstSection.heading) {
        return {
          label: 'Starts with',
          text: firstSection.heading
        };
      }
    }

    return null;
  },

  highlight(text) {
    if (!this.searchQuery || !text) return text;
    const escapedQuery = this.searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const matcher = new RegExp(`(${escapedQuery})`, 'gi');
    return String(text).replace(matcher, '<mark>$1</mark>');
  },

  renderHero() {
    const trackGrid = document.getElementById('hero-track-grid');
    const tagRibbon = document.getElementById('hero-tag-ribbon');
    const statsHost = document.getElementById('hero-stats');

    if (!trackGrid || !tagRibbon || !statsHost) return;

    const stats = this.getSiteStats();
    const heroTracks = [
      {
        track: 'businessenglish',
        kicker: 'Track 01',
        title: 'Business English',
        count: stats.businessLessons,
        copy: 'Meetings, emails, presentations, negotiation, grammar, and workplace communication.',
        tags: ['Meetings', 'Emails', 'Presentations', 'Negotiation']
      },
      {
        track: 'job_interview',
        kicker: 'Track 02',
        title: 'Job Interview',
        count: stats.jobLessons,
        copy: 'Scenario-driven interview lessons with notebook previews, source links, and repeatable answer patterns.',
        tags: ['Behavioral', 'STAR', 'Remote', 'Listening']
      }
    ];

    trackGrid.innerHTML = heroTracks.map((track) => `
      <button
        type="button"
        class="track-spotlight"
        data-track="${track.track}"
        aria-label="Open ${track.title}"
      >
        <span class="track-spotlight-kicker">${track.kicker}</span>
        <div class="track-spotlight-head">
          <div>
            <h3 class="track-spotlight-title">${track.title}</h3>
            <p class="track-spotlight-copy">${track.copy}</p>
          </div>
          <span class="track-spotlight-count">${track.count} lessons</span>
        </div>
        <div class="track-spotlight-tags">
          ${track.tags.map((tag) => `<span>${tag}</span>`).join('')}
        </div>
      </button>
    `).join('');

    tagRibbon.innerHTML = getAllTags().slice(0, 10).map((tag) => `
      <button
        type="button"
        class="hero-tag"
        data-hero-tag="${this.escapeHTML(tag)}"
        aria-label="Filter by tag ${this.escapeHTML(tag)}"
      >
        ${this.escapeHTML(tag)}
      </button>
    `).join('');

    const heroStats = [
      {
        value: stats.totalLessons,
        label: 'Structured lessons',
        note: `${stats.businessLessons} business topics + ${stats.jobLessons} interview modules`
      },
      {
        value: stats.categoryCount,
        label: 'Core categories',
        note: 'Meetings, emails, workplace communication, negotiation, and more'
      },
      {
        value: stats.itemCount,
        label: 'Key terms & patterns',
        note: `${stats.sectionCount} teaching sections indexed for quick retrieval`
      },
      {
        value: stats.exampleCount,
        label: 'Bilingual examples',
        note: `${stats.notebookCount} notebook-backed interview documents linked in detail pages`
      }
    ];

    statsHost.innerHTML = heroStats.map((item) => `
      <article class="hero-stat-card">
        <div class="hero-stat-value">${item.value}</div>
        <div class="hero-stat-label">${item.label}</div>
        <p class="hero-stat-note">${item.note}</p>
      </article>
    `).join('');
  },

  renderCategories() {
    const container = document.getElementById('category-list');
    const categories = Object.entries(CATEGORIES).filter(([key]) => key !== 'job_interview');

    container.innerHTML = categories.map(([key, category]) => {
      const count = getLessonsByCategory(key).filter(
        (lesson) => lesson.track === 'businessenglish'
      ).length;

      return `
        <button
          type="button"
          class="category-item"
          data-category="${key}"
          aria-label="Filter ${category.label_en}"
        >
          <span class="category-icon">${category.icon}</span>
          <span class="category-name">${category.label}</span>
          <span class="category-count">${count}</span>
        </button>
      `;
    }).join('');
  },

  renderTagCloud() {
    const container = document.getElementById('tag-cloud');
    const tags = getAllTags().slice(0, 24);

    container.innerHTML = tags.map((tag) => `
      <button
        type="button"
        class="tag-btn"
        data-tag="${this.escapeHTML(tag)}"
        aria-label="Filter tag ${this.escapeHTML(tag)}"
      >
        ${this.escapeHTML(tag)}
      </button>
    `).join('');
  },

  renderJobInterviewList() {
    const container = document.getElementById('job-lesson-list');
    const lessons = this.getTrackLessons('job_interview');

    container.innerHTML = lessons.map((lesson) => {
      const previewTitle = lesson.chinese_title || 'Interview lesson';
      const previewSummary = lesson.summary || 'Open the card to preview this lesson.';
      const sourceTitle = lesson.source?.title
        ? `<div class="job-lesson-source">${this.escapeHTML(lesson.source.title)}</div>`
        : '';

      return `
        <article class="job-lesson-item" data-lesson-id="${lesson.id}">
          <button
            type="button"
            class="job-lesson-toggle"
            data-lesson-id="${lesson.id}"
            aria-expanded="false"
            aria-controls="job-lesson-panel-${lesson.id}"
            aria-label="Preview interview lesson ${lesson.number}"
          >
            <span class="job-lesson-number">${lesson.number}</span>
            <span class="job-lesson-title">${this.escapeHTML(lesson.title)}</span>
            <span class="job-lesson-chevron" aria-hidden="true">v</span>
          </button>

          <div class="job-lesson-panel" id="job-lesson-panel-${lesson.id}" hidden>
            <div class="job-lesson-preview-title">${this.escapeHTML(previewTitle)}</div>
            <p class="job-lesson-summary">${this.escapeHTML(previewSummary)}</p>
            ${sourceTitle}
            <button
              type="button"
              class="job-lesson-open"
              data-lesson-id="${lesson.id}"
            >
              Open lesson
            </button>
          </div>
        </article>
      `;
    }).join('');

    this.syncJobLessonListState();
  },

  renderLessonGrid(lessons) {
    const grid = document.getElementById('lesson-grid');
    const resultCount = document.getElementById('result-count');

    this.currentListLessonIds = lessons.map((lesson) => lesson.id);
    this.updateContextBar(lessons);

    if (lessons.length === 0) {
      grid.innerHTML = `
        <div class="no-results">
          <div class="no-results-icon">No match</div>
          <h3>No lessons matched this view</h3>
          <p>Try a different keyword, switch tracks, or clear the current filter.</p>
        </div>
      `;
      resultCount.textContent = '';
      return;
    }

    resultCount.textContent = `${lessons.length} ${lessons.length === 1 ? 'lesson' : 'lessons'}`;

    grid.innerHTML = lessons.map((lesson) => {
      const category = CATEGORIES[lesson.category] || CATEGORIES.vocabulary;
      const lessonLabel = lesson.track === 'job_interview' ? 'Interview' : 'Lesson';
      const stats = this.getLessonStats(lesson);
      const cardContext = this.buildCardContext(lesson);
      const tags = (lesson.tags || []).slice(0, 3);

      return `
        <button
          type="button"
          class="lesson-card"
          onclick="App.showLesson('${lesson.id}')"
          aria-label="Open ${lessonLabel.toLowerCase()} ${lesson.number}: ${this.escapeHTML(lesson.title)}"
        >
          <div class="card-meta-row">
            <span class="card-track">${lesson.track === 'job_interview' ? 'Job Interview' : 'Business English'}</span>
            <span class="card-stats">${stats.itemCount} items / ${stats.exampleCount} examples</span>
          </div>

          <div class="card-number">
            <span class="card-number-label">${lessonLabel}</span>
            <span class="card-number-value">${lesson.number}</span>
          </div>

          <div class="card-title">${this.highlight(this.escapeHTML(lesson.title))}</div>
          <div class="card-chinese">${this.highlight(this.escapeHTML(lesson.chinese_title || ''))}</div>
          <div class="card-summary">${this.highlight(this.escapeHTML(lesson.summary || ''))}</div>

          ${cardContext ? `
            <div class="card-insight-label">${cardContext.label}</div>
            <p class="card-insight">${this.highlight(this.escapeHTML(cardContext.text))}</p>
          ` : ''}

          ${tags.length > 0 ? `
            <div class="card-tags">
              ${tags.map((tag) => `<span class="card-tag">${this.highlight(this.escapeHTML(tag))}</span>`).join('')}
            </div>
          ` : ''}

          <div class="card-footer">
            <span class="card-category cat-${lesson.category}">
              ${category.icon} ${category.label}
            </span>
            <span class="card-arrow">-&gt;</span>
          </div>
        </button>
      `;
    }).join('');
  },

  updateContextBar(lessons = []) {
    const label = document.getElementById('context-label');
    const description = document.getElementById('context-description');
    const resetButton = document.getElementById('context-reset');

    let heading = 'Business English track';
    let copy = 'Browse 40 structured business English lessons organized by category, tags, and related topics.';

    if (this.searchQuery.trim()) {
      heading = 'Search mode';
      copy = `Searching for "${this.searchQuery.trim()}" across titles, summaries, tags, terms, notes, and examples. ${lessons.length} match${lessons.length === 1 ? '' : 'es'} in the current result set.`;
    } else if (this.currentFilter.type === 'tag') {
      heading = `Tag view: ${this.currentFilter.value}`;
      copy = 'This view groups lessons connected by a shared tag so you can compare expressions across topics and tracks.';
    } else if (this.currentFilter.type === 'category') {
      const category = CATEGORIES[this.currentFilter.value];
      heading = category ? `Category view: ${category.label_en}` : 'Category view';
      copy = 'This view narrows the catalogue to a single business-English category for faster focused review.';
    } else if (this.currentTrack === 'job_interview') {
      heading = 'Job Interview track';
      copy = 'Browse 10 interview-focused lessons with notebook previews, source links, and reusable answer structures.';
    }

    label.textContent = heading;
    description.textContent = copy;

    const shouldShowReset =
      this.searchQuery.trim().length > 0 ||
      this.currentFilter.type !== null ||
      this.currentTrack !== 'businessenglish';

    resetButton.classList.toggle('visible', shouldShowReset);
  },

  toggleJobLesson(lessonId) {
    this.expandedJobLessonId = this.expandedJobLessonId === lessonId ? null : lessonId;
    this.syncJobLessonListState();
  },

  syncJobLessonListState() {
    document.querySelectorAll('#job-lesson-list .job-lesson-item').forEach((item) => {
      const lessonId = item.dataset.lessonId;
      const isExpanded = lessonId === this.expandedJobLessonId;
      const isActive = lessonId === this.selectedJobLessonId;
      const toggle = item.querySelector('.job-lesson-toggle');
      const panel = item.querySelector('.job-lesson-panel');

      item.classList.toggle('expanded', isExpanded);
      item.classList.toggle('active', isActive);

      if (toggle) {
        toggle.setAttribute('aria-expanded', String(isExpanded));
      }

      if (panel) {
        panel.hidden = !isExpanded;
      }
    });
  },

  setTrackExpanded(track, expanded) {
    this.expandedTracks[track] = expanded;
    this.syncTrackPanels();
  },

  syncTrackPanels() {
    [
      ['businessenglish', 'btn-business', 'business-track', 'business-track-content'],
      ['job_interview', 'btn-job', 'job-track', 'job-track-content']
    ].forEach(([track, buttonId, groupId, contentId]) => {
      const isExpanded = Boolean(this.expandedTracks[track]);
      const button = document.getElementById(buttonId);
      const group = document.getElementById(groupId);
      const content = document.getElementById(contentId);

      if (button) {
        button.classList.toggle('expanded', isExpanded);
        button.setAttribute('aria-expanded', String(isExpanded));
      }

      if (group) {
        group.classList.toggle('expanded', isExpanded);
      }

      if (content) {
        content.hidden = !isExpanded;
      }
    });
  },

  toggleTrack(track) {
    const nextExpanded = !this.expandedTracks[track];
    this.setTrackExpanded(track, nextExpanded);

    if (track === 'job_interview') {
      this.showJobInterview(false);
      return;
    }

    this.showBusinessEnglish(false);
  },

  openTrackFocus(track) {
    if (track === 'job_interview') {
      this.setTrackExpanded('job_interview', true);
      this.showJobInterview();
    } else {
      this.setTrackExpanded('businessenglish', true);
      this.showBusinessEnglish();
    }

    this.scrollToCatalogue();
  },

  showBusinessEnglish(resetSearch = true) {
    this.currentFilter = { type: null, value: null };
    this.currentTrack = 'businessenglish';
    this.selectedJobLessonId = null;

    if (resetSearch) this.resetSearch();
    if (this.currentView === 'detail') this.goBack(false);

    this.clearActiveStates();
    document.getElementById('btn-business').classList.add('active');
    document.getElementById('panel-title').textContent = 'BUSINESSENGLISH';
    this.closeSidebarOnMobile();

    this.renderLessonGrid(this.getTrackLessons('businessenglish'));
  },

  showJobInterview(resetSearch = true) {
    this.currentFilter = { type: null, value: null };
    this.currentTrack = 'job_interview';
    this.selectedJobLessonId = null;

    if (resetSearch) this.resetSearch();
    if (this.currentView === 'detail') this.goBack(false);

    this.clearActiveStates();
    document.getElementById('btn-job').classList.add('active');
    document.getElementById('panel-title').textContent = 'JOB_INTERVIEW';
    this.closeSidebarOnMobile();

    this.renderLessonGrid(this.getTrackLessons('job_interview'));
  },

  showAll() {
    this.showBusinessEnglish();
  },

  goHome() {
    this.goBack(false);
    this.setTrackExpanded('businessenglish', true);
    this.showBusinessEnglish();
  },

  filterByCategory(category) {
    this.currentFilter = { type: 'category', value: category };
    this.currentTrack = 'businessenglish';
    this.selectedJobLessonId = null;
    this.resetSearch();
    this.setTrackExpanded('businessenglish', true);
    if (this.currentView === 'detail') this.goBack(false);

    const lessons = getLessonsByCategory(category).filter(
      (lesson) => lesson.track === 'businessenglish'
    );
    const categoryMeta = CATEGORIES[category];

    this.clearActiveStates();
    const activeButton = document.querySelector(`[data-category="${category}"]`);
    if (activeButton) activeButton.classList.add('active');
    document.getElementById('panel-title').textContent = categoryMeta
      ? `${categoryMeta.icon} ${categoryMeta.label}`
      : 'Category';
    this.closeSidebarOnMobile();

    this.renderLessonGrid(lessons);
  },

  filterByTag(tag) {
    this.currentFilter = { type: 'tag', value: tag };
    this.currentTrack = 'all';
    this.selectedJobLessonId = null;
    this.resetSearch();
    this.setTrackExpanded('businessenglish', true);
    if (this.currentView === 'detail') this.goBack(false);

    const lessonIds = TAG_INDEX[tag] || [];
    const lessons = lessonIds.map((id) => getLessonById(id)).filter(Boolean);

    this.clearActiveStates();
    const activeButton = Array.from(document.querySelectorAll('.tag-btn')).find(
      (button) => button.dataset.tag === tag
    );
    if (activeButton) activeButton.classList.add('active');
    document.getElementById('panel-title').textContent = `Tag: ${tag}`;
    this.closeSidebarOnMobile();

    this.renderLessonGrid(lessons);
  },

  performSearch() {
    if (!this.searchQuery.trim()) {
      this.showBusinessEnglish(false);
      return;
    }

    const results = searchLessons(this.searchQuery);
    this.currentTrack = 'all';
    this.selectedJobLessonId = null;

    if (this.currentView === 'detail') this.goBack(false);

    this.clearActiveStates();
    document.getElementById('panel-title').textContent = `Search: "${this.searchQuery.trim()}"`;
    this.renderLessonGrid(results);
  },

  showLesson(lessonId, pushState = true) {
    const lesson = getLessonById(lessonId);
    if (!lesson) return;

    this.currentLesson = lesson;
    this.currentView = 'detail';
    this.currentTrack = lesson.track || 'businessenglish';

    if (pushState) {
      history.pushState({ lessonId }, '', `#lesson-${lesson.id}`);
    }

    document.getElementById('panel-list').classList.add('hidden');
    document.getElementById('panel-detail').classList.remove('hidden');
    this.closeSidebarOnMobile();

    this.clearActiveStates();
    if (lesson.track === 'job_interview') {
      this.selectedJobLessonId = lesson.id;
      this.expandedJobLessonId = lesson.id;
      this.setTrackExpanded('job_interview', true);
      document.getElementById('btn-job').classList.add('active');
    } else {
      this.selectedJobLessonId = null;
      this.setTrackExpanded('businessenglish', true);
      document.getElementById('btn-business').classList.add('active');
    }

    this.syncJobLessonListState();
    this.renderLessonDetail(lesson);
    this.updateNavButtons(lesson);

    window.scrollTo({
      top: 0,
      behavior: this.prefersReducedMotion() ? 'auto' : 'smooth'
    });
  },

  renderLessonDetail(lesson) {
    const category = CATEGORIES[lesson.category] || CATEGORIES.vocabulary;
    const lessonLabel = lesson.track === 'job_interview' ? 'Interview' : 'Lesson';
    const docSource = this.getJobInterviewDoc(lesson);
    const stats = this.getLessonStats(lesson);
    const related = getRelatedLessons(lesson.id);
    const lessonResource = this.getLessonResource(lesson);
    const sourceLinks = [];

    if (lesson.source?.url) {
      sourceLinks.push({
        label: 'Open source video',
        href: lesson.source.url
      });
    }

    if (docSource?.fileUrl) {
      sourceLinks.push({
        label: 'Open notebook',
        href: docSource.fileUrl
      });
    }

    document.getElementById('detail-header').innerHTML = `
      <div class="detail-lesson-num">${lessonLabel} ${lesson.number}</div>
      <h1 class="detail-title">${this.highlight(this.escapeHTML(lesson.title))}</h1>
      <div class="detail-chinese-title">${this.highlight(this.escapeHTML(lesson.chinese_title || ''))}</div>
      <div class="detail-meta">
        <span class="detail-category cat-${lesson.category}">
          ${category.icon} ${category.label}
        </span>
        ${(lesson.tags || []).map((tag) => `
          <span class="detail-tag">${this.highlight(this.escapeHTML(tag))}</span>
        `).join('')}
      </div>
      <div class="detail-summary">${this.highlight(this.escapeHTML(lesson.summary || ''))}</div>
      <div class="detail-stat-strip">
        <div class="detail-stat-chip">
          <span class="detail-stat-number">${stats.sectionCount}</span>
          <span class="detail-stat-name">Sections</span>
        </div>
        <div class="detail-stat-chip">
          <span class="detail-stat-number">${stats.itemCount}</span>
          <span class="detail-stat-name">Items</span>
        </div>
        <div class="detail-stat-chip">
          <span class="detail-stat-number">${stats.exampleCount}</span>
          <span class="detail-stat-name">Examples</span>
        </div>
        <div class="detail-stat-chip">
          <span class="detail-stat-number">${stats.relatedCount}</span>
          <span class="detail-stat-name">Connections</span>
        </div>
      </div>
    `;

    const bodyHTML = (lesson.sections || []).map((section, index) => {
      const sectionId = this.getSectionAnchorId(lesson.id, index);
      const itemCount = (section.items || []).length;

      return `
        <section class="section-block" id="${sectionId}">
          <div class="section-heading">
            <span class="section-index">${String(index + 1).padStart(2, '0')}</span>
            <span>${this.highlight(this.escapeHTML(section.heading || `Section ${index + 1}`))}</span>
            <span class="section-count">${itemCount} items</span>
          </div>
          ${(section.items || []).map((item) => `
            <div class="vocab-item">
              <div class="vocab-term">${this.highlight(this.escapeHTML(item.term || ''))}</div>
              ${item.chinese ? `<div class="vocab-chinese">${this.highlight(this.escapeHTML(item.chinese))}</div>` : ''}
              ${item.definition ? `<div class="vocab-definition">${this.highlight(this.escapeHTML(item.definition))}</div>` : ''}
              ${item.note ? `<div class="vocab-note">Note / ${this.highlight(this.escapeHTML(item.note))}</div>` : ''}
              ${item.examples && item.examples.length > 0 ? `
                <div class="examples-list">
                  ${item.examples.map((example) => `
                    <div class="example-pair">
                      <div class="example-en">${this.highlight(this.escapeHTML(example.en || ''))}</div>
                      <div class="example-zh">${this.highlight(this.escapeHTML(example.zh || ''))}</div>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </section>
      `;
    }).join('');

    const notebookHTML = docSource ? `
      <section class="section-block notebook-block">
        <div class="section-heading">
          <span class="section-index">NB</span>
          <span>Notebook Preview</span>
          <span class="section-count">${(docSource.snippets || []).length} notes</span>
        </div>
        <div class="notebook-overview">
          <div class="notebook-kicker">Lesson Notebook</div>
          <div class="notebook-doc-title">${this.escapeHTML(docSource.docTitle)}</div>
          <p class="notebook-overview-zh">${this.escapeHTML(docSource.overview.zh)}</p>
          <p class="notebook-overview-en">${this.escapeHTML(docSource.overview.en)}</p>
          <div class="notebook-actions">
            <a class="source-link" href="${docSource.fileUrl}" target="_blank" rel="noopener noreferrer">Open notebook</a>
          </div>
        </div>
        <div class="notebook-grid">
          ${(docSource.snippets || []).map((snippet) => {
            const labelMap = {
              question: 'Question drill',
              answer: 'Answer line',
              insight: 'Doc insight'
            };

            return `
              <article class="notebook-card">
                <div class="notebook-card-label">${labelMap[snippet.type] || 'Notebook note'}</div>
                <div class="notebook-card-en">${this.escapeHTML(snippet.en)}</div>
                <div class="notebook-card-zh">${this.escapeHTML(snippet.zh)}</div>
              </article>
            `;
          }).join('')}
        </div>
      </section>
    ` : '';

    const sourceHTML = sourceLinks.length > 0 ? `
      <section class="section-block source-block">
        <div class="section-heading">
          <span class="section-index">SR</span>
          <span>Source Links</span>
          <span class="section-count">${sourceLinks.length} links</span>
        </div>
        <div class="source-grid">
          ${sourceLinks.map((link) => `
            <article class="source-card">
              <div class="source-kind">External source</div>
              <div class="source-title">${this.escapeHTML(link.label)}</div>
              <div class="source-actions">
                <a class="source-link" href="${link.href}" target="_blank" rel="noopener noreferrer">${this.escapeHTML(link.label)}</a>
              </div>
            </article>
          `).join('')}
        </div>
      </section>
    ` : '';

    document.getElementById('detail-body').innerHTML = notebookHTML + bodyHTML + sourceHTML;

    this.renderDetailRail(lesson, docSource, related, stats, sourceLinks, lessonResource);
    this.renderDetailFooterNav(lesson);
    this.renderRelatedSection(related);
  },

  renderLessonResourceCard(resource) {
    const feedback = this.getResourceFeedback(resource.id);
    const isUnlocked = Boolean(this.unlockedResources[resource.id]);

    return `
      <div class="rail-card pdf-resource-card">
        <div class="rail-label">PDF Download</div>
        <p class="pdf-resource-note">${this.escapeHTML(resource.note)}</p>
        <div class="pdf-resource-head">
          <div class="pdf-resource-title">${this.escapeHTML(resource.title)}</div>
          <div class="pdf-resource-meta">${this.escapeHTML(resource.fileMeta)}</div>
        </div>
        <p class="pdf-resource-description">${this.escapeHTML(resource.description)}</p>

        ${isUnlocked ? `
          <div class="pdf-download-state is-success">
            <span class="pdf-download-state-label">Access Ready</span>
            <span class="pdf-download-state-copy">密码已验证，可以直接下载 PDF 原件。</span>
          </div>
        ` : `
          <form class="pdf-download-form" data-resource-id="${resource.id}">
            <label class="pdf-download-label" for="${resource.id}-password">Download password</label>
            <div class="pdf-download-row">
              <input
                type="password"
                id="${resource.id}-password"
                name="download-password"
                class="pdf-download-input"
                placeholder="输入下载密码"
                autocomplete="off"
              >
              <button type="submit" class="pdf-download-submit">验证密码</button>
            </div>
          </form>
        `}

        <p class="pdf-download-feedback ${feedback ? `is-${feedback.type}` : ''}">
          ${feedback ? this.escapeHTML(feedback.text) : '输入密码后即可下载完整 PDF。'}
        </p>

        <div class="pdf-download-actions">
          ${isUnlocked ? `
            <a
              class="pdf-download-link"
              href="${resource.fileUrl}"
              download="${resource.fileName}"
            >
              下载 PDF 原件
            </a>
          ` : `
            <button type="button" class="pdf-download-link is-disabled" disabled>
              验证密码后下载
            </button>
          `}
        </div>

        <div class="pdf-preview-grid">
          ${resource.previewImages.map((preview) => `
            <figure class="pdf-preview-card">
              <img
                class="pdf-preview-image"
                src="${preview.src}"
                alt="${this.escapeHTML(preview.alt)}"
                loading="lazy"
              >
              <figcaption class="pdf-preview-caption">Preview / Page ${preview.page}</figcaption>
            </figure>
          `).join('')}
        </div>
      </div>
    `;
  },

  renderDetailRail(lesson, docSource, related, stats, sourceLinks, lessonResource) {
    const rail = document.getElementById('detail-rail');

    const outline = (lesson.sections || []).map((section, index) => {
      const sectionId = this.getSectionAnchorId(lesson.id, index);
      const itemCount = (section.items || []).length;

      return `
        <button
          type="button"
          class="rail-outline-btn"
          onclick="App.scrollToSection('${sectionId}')"
        >
          <span class="rail-outline-index">${String(index + 1).padStart(2, '0')}</span>
          <span class="rail-outline-copy">
            <span class="rail-outline-title">${this.escapeHTML(section.heading || `Section ${index + 1}`)}</span>
            <span class="rail-outline-meta">${itemCount} items</span>
          </span>
        </button>
      `;
    }).join('');

    rail.innerHTML = `
      ${lessonResource ? this.renderLessonResourceCard(lessonResource) : ''}

      <div class="rail-card">
        <div class="rail-label">Lesson snapshot</div>
        <div class="rail-stat-grid">
          <div class="rail-stat">
            <span class="rail-stat-value">${stats.sectionCount}</span>
            <span class="rail-stat-name">Sections</span>
          </div>
          <div class="rail-stat">
            <span class="rail-stat-value">${stats.itemCount}</span>
            <span class="rail-stat-name">Items</span>
          </div>
          <div class="rail-stat">
            <span class="rail-stat-value">${stats.exampleCount}</span>
            <span class="rail-stat-name">Examples</span>
          </div>
          <div class="rail-stat">
            <span class="rail-stat-value">${stats.relatedCount}</span>
            <span class="rail-stat-name">Connections</span>
          </div>
        </div>
      </div>

      ${outline ? `
        <div class="rail-card">
          <div class="rail-label">Jump to section</div>
          <div class="rail-outline">${outline}</div>
        </div>
      ` : ''}

      ${sourceLinks.length > 0 || docSource ? `
        <div class="rail-card">
          <div class="rail-label">Resources</div>
          <div class="rail-link-list">
            ${sourceLinks.map((link) => `
              <a class="rail-link" href="${link.href}" target="_blank" rel="noopener noreferrer">
                <span>${this.escapeHTML(link.label)}</span>
                <span aria-hidden="true">-&gt;</span>
              </a>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${related.length > 0 ? `
        <div class="rail-card">
          <div class="rail-label">Connected lessons</div>
          <div class="rail-related-list">
            ${related.slice(0, 4).map((item) => `
              <button
                type="button"
                class="rail-related-card"
                onclick="App.showLesson('${item.id}')"
              >
                <span class="rail-related-num">${item.track === 'job_interview' ? `J${item.number}` : `L${item.number}`}</span>
                <span class="rail-related-copy">
                  <span class="rail-related-title">${this.escapeHTML(item.title)}</span>
                  <span class="rail-related-meta">${this.escapeHTML(item.chinese_title || '')}</span>
                </span>
              </button>
            `).join('')}
          </div>
        </div>
      ` : ''}
    `;
  },

  renderDetailFooterNav(lesson) {
    const container = document.getElementById('detail-footer-nav');
    const readingList = this.getReadingListForLesson(lesson);
    const currentIndex = readingList.findIndex((item) => item.id === lesson.id);
    const previousLesson = currentIndex > 0 ? readingList[currentIndex - 1] : null;
    const nextLesson = currentIndex < readingList.length - 1 ? readingList[currentIndex + 1] : null;

    const renderCard = (item, direction) => {
      if (!item) {
        return `
          <div class="detail-jump-card is-disabled">
            <div class="detail-jump-kicker">${direction === 'prev' ? 'Previous lesson' : 'Next lesson'}</div>
            <div class="detail-jump-title">${direction === 'prev' ? 'Start of this sequence' : 'End of this sequence'}</div>
            <div class="detail-jump-meta">${this.getReadingContextLabel()}</div>
          </div>
        `;
      }

      return `
        <button
          type="button"
          class="detail-jump-card"
          onclick="App.showLesson('${item.id}')"
        >
          <div class="detail-jump-kicker">${direction === 'prev' ? 'Previous lesson' : 'Next lesson'}</div>
          <div class="detail-jump-title">${this.escapeHTML(item.title)}</div>
          <div class="detail-jump-meta">${item.track === 'job_interview' ? 'Job Interview' : 'Business English'} / ${this.getReadingContextLabel()}</div>
        </button>
      `;
    };

    container.innerHTML = `
      <div class="detail-footer-label">Continue reading</div>
      <div class="detail-footer-grid">
        ${renderCard(previousLesson, 'prev')}
        ${renderCard(nextLesson, 'next')}
      </div>
    `;
  },

  renderRelatedSection(related) {
    const container = document.getElementById('related-section');

    if (!related || related.length === 0) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = `
      <div class="related-label">Connected lessons (${related.length})</div>
      <div class="related-grid">
        ${related.map((item) => `
          <button
            type="button"
            class="related-card"
            onclick="App.showLesson('${item.id}')"
            aria-label="Open related lesson ${this.escapeHTML(item.title)}"
          >
            <span class="related-num">${item.track === 'job_interview' ? `J${item.number}` : `L${item.number}`}</span>
            <div class="related-info">
              <div class="related-title">${this.escapeHTML(item.title)}</div>
              <div class="related-zh">${this.escapeHTML(item.chinese_title || '')}</div>
            </div>
          </button>
        `).join('')}
      </div>
    `;
  },

  updateNavButtons(lesson) {
    const buttonPrev = document.getElementById('btn-prev');
    const buttonNext = document.getElementById('btn-next');
    const readingList = this.getReadingListForLesson(lesson);
    const currentIndex = readingList.findIndex((item) => item.id === lesson.id);
    const previousLesson = currentIndex > 0 ? readingList[currentIndex - 1] : null;
    const nextLesson = currentIndex < readingList.length - 1 ? readingList[currentIndex + 1] : null;

    buttonPrev.disabled = !previousLesson;
    buttonNext.disabled = !nextLesson;
    buttonPrev.title = previousLesson ? `Previous: ${previousLesson.title}` : 'No previous lesson';
    buttonNext.title = nextLesson ? `Next: ${nextLesson.title}` : 'No next lesson';
    buttonPrev.setAttribute(
      'aria-label',
      previousLesson ? `Previous lesson: ${previousLesson.title}` : 'No previous lesson'
    );
    buttonNext.setAttribute(
      'aria-label',
      nextLesson ? `Next lesson: ${nextLesson.title}` : 'No next lesson'
    );
  },

  navigateLesson(direction) {
    if (!this.currentLesson) return;

    const readingList = this.getReadingListForLesson(this.currentLesson);
    const currentIndex = readingList.findIndex((item) => item.id === this.currentLesson.id);
    const nextIndex = currentIndex + direction;

    if (nextIndex < 0 || nextIndex >= readingList.length) return;
    this.showLesson(readingList[nextIndex].id);
  },

  goBack(pushState = true) {
    this.currentView = 'list';
    this.currentLesson = null;

    if (pushState) {
      history.pushState(null, '', '#');
    }

    document.getElementById('panel-detail').classList.add('hidden');
    document.getElementById('panel-list').classList.remove('hidden');

    window.scrollTo({
      top: 0,
      behavior: this.prefersReducedMotion() ? 'auto' : 'smooth'
    });
  },

  toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
  },

  closeSidebarOnMobile() {
    if (window.innerWidth <= 900) {
      document.getElementById('sidebar').classList.remove('open');
    }
  },

  clearActiveStates() {
    document.querySelectorAll('.sidebar-track-toggle, .category-item, .tag-btn, .job-lesson-item').forEach((element) => {
      element.classList.remove('active');
    });
  },

  updateCounts() {
    document.getElementById('count-business').textContent = this.getTrackLessons('businessenglish').length;
    document.getElementById('count-job').textContent = this.getTrackLessons('job_interview').length;
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}

window.addEventListener('load', () => {
  const hash = window.location.hash;
  if (!hash.startsWith('#lesson-')) return;

  const token = hash.replace('#lesson-', '');
  let lesson = null;

  if (/^\d+$/.test(token)) {
    const lessonNumber = parseInt(token, 10);
    lesson = getLessonsByTrack('businessenglish').find((item) => item.number === lessonNumber) || null;
  } else {
    lesson = getLessonById(token);
  }

  if (lesson) {
    App.showLesson(lesson.id, false);
  }
});
