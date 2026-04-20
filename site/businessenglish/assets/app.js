// app.js — Business English Knowledge Base + Job Interview
// Handles search, navigation, filtering, and cross-linking

const App = {
  // State
  currentView: 'list',
  currentLesson: null,
  currentFilter: { type: null, value: null },
  searchQuery: '',
  currentTrack: 'businessenglish',
  expandedJobLessonId: null,
  selectedJobLessonId: null,
  expandedTracks: {
    businessenglish: true,
    job_interview: true
  },

  // Initialize
  init() {
    this.renderCategories();
    this.renderTagCloud();
    this.renderJobInterviewList();
    this.bindEvents();
    this.updateCounts();
    this.syncTrackPanels();
    this.showBusinessEnglish(false);
  },

  // Bind event listeners
  bindEvents() {
    const searchInput = document.getElementById('search-input');
    const searchClear = document.getElementById('search-clear');
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const jobLessonList = document.getElementById('job-lesson-list');

    searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.performSearch();
      searchClear.classList.toggle('visible', this.searchQuery.length > 0);
    });

    searchClear.addEventListener('click', () => {
      this.resetSearch();
      this.performSearch();
      searchInput.focus();
    });

    // Event delegation for tag clicks
    document.getElementById('tag-cloud').addEventListener('click', (e) => {
      const tagBtn = e.target.closest('.tag-btn');
      if (tagBtn) {
        const tag = tagBtn.dataset.tag;
        this.filterByTag(tag);
      }
    });

    // Event delegation for category clicks
    document.getElementById('category-list').addEventListener('click', (e) => {
      const catBtn = e.target.closest('.category-item');
      if (catBtn) {
        const category = catBtn.dataset.category;
        this.filterByCategory(category);
      }
    });

    // Event delegation for job interview lesson quick links
    jobLessonList.addEventListener('click', (e) => {
      const openBtn = e.target.closest('.job-lesson-open');
      if (openBtn) {
        this.showLesson(openBtn.dataset.lessonId);
        return;
      }

      const toggleBtn = e.target.closest('.job-lesson-toggle');
      if (toggleBtn) {
        this.toggleJobLesson(toggleBtn.dataset.lessonId);
      }
    });

    // Close mobile sidebar when tapping outside
    document.addEventListener('click', (e) => {
      if (window.innerWidth > 900) return;
      if (!sidebar.classList.contains('open')) return;
      if (sidebar.contains(e.target) || sidebarToggle.contains(e.target)) return;
      sidebar.classList.remove('open');
    });

    // Handle browser back/forward
    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.lessonId) {
        this.showLesson(e.state.lessonId, false);
      } else {
        this.goBack(false);
      }
    });
  },

  // Helpers
  getTrackLessons(track) {
    return getLessonsByTrack(track).slice().sort((a, b) => a.number - b.number);
  },

  resetSearch() {
    this.searchQuery = '';
    document.getElementById('search-input').value = '';
    document.getElementById('search-clear').classList.remove('visible');
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

  toggleJobLesson(lessonId) {
    this.expandedJobLessonId = this.expandedJobLessonId === lessonId ? null : lessonId;
    this.syncJobLessonListState();
  },

  syncJobLessonListState() {
    document.querySelectorAll('#job-lesson-list .job-lesson-item').forEach(item => {
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

    if (track === 'businessenglish') {
      this.showBusinessEnglish(false);
      return;
    }

    this.showJobInterview(false);
  },

  // Render category list in sidebar
  renderCategories() {
    const container = document.getElementById('category-list');
    const categories = Object.entries(CATEGORIES).filter(([key]) => key !== 'job_interview');

    container.innerHTML = categories.map(([key, cat]) => {
      const count = getLessonsByCategory(key).filter(lesson => lesson.track === 'businessenglish').length;
      return `
        <button type="button" class="category-item" data-category="${key}" aria-label="按类别筛选：${cat.label}">
          <span class="category-icon">${cat.icon}</span>
          <span class="category-name">${cat.label}</span>
          <span class="category-count">${count}</span>
        </button>
      `;
    }).join('');
  },

  // Render tag cloud
  renderTagCloud() {
    const container = document.getElementById('tag-cloud');
    const tags = getAllTags().slice(0, 24);

    container.innerHTML = tags.map(tag =>
      `<button type="button" class="tag-btn" data-tag="${tag}" aria-label="按标签筛选：${tag}">${tag}</button>`
    ).join('');
  },

  // Render job interview lesson list in sidebar
  renderJobInterviewList() {
    const container = document.getElementById('job-lesson-list');
    const lessons = this.getTrackLessons('job_interview');

    container.innerHTML = lessons.map(lesson => {
      const previewTitle = lesson.chinese_title || 'Interview Lesson';
      const previewSummary = lesson.summary || 'Click to expand and preview the lesson summary.';
      const sourceTitle = lesson.source?.title
        ? `<div class="job-lesson-source">${lesson.source.title}</div>`
        : '';

      return `
        <article class="job-lesson-item" data-lesson-id="${lesson.id}">
          <button
        type="button"
        class="job-lesson-toggle"
        data-lesson-id="${lesson.id}"
        aria-expanded="false"
        aria-controls="job-lesson-panel-${lesson.id}"
        aria-label="查看面试课题 ${lesson.number}：${lesson.title}"
      >
        <span class="job-lesson-number">${lesson.number}</span>
        <span class="job-lesson-title">${lesson.title}</span>
        <span class="job-lesson-chevron" aria-hidden="true">v</span>
      </button>
          <div class="job-lesson-panel" id="job-lesson-panel-${lesson.id}" hidden>
            <div class="job-lesson-preview-title">${previewTitle}</div>
            <p class="job-lesson-summary">${previewSummary}</p>
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

  // Render lesson grid
  renderLessonGrid(lessons) {
    const grid = document.getElementById('lesson-grid');
    const resultCount = document.getElementById('result-count');

    if (lessons.length === 0) {
      grid.innerHTML = `
        <div class="no-results">
          <div class="no-results-icon">🔍</div>
          <h3>未找到匹配结果</h3>
          <p>试试其他关键词或切换分区查看</p>
        </div>
      `;
      resultCount.textContent = '';
      return;
    }

    resultCount.textContent = `共 ${lessons.length} 个课题`;

    grid.innerHTML = lessons.map(lesson => {
      const cat = CATEGORIES[lesson.category] || CATEGORIES.vocabulary;
      const lessonLabel = lesson.track === 'job_interview' ? 'Interview' : 'Lesson';
      return `
        <button type="button" class="lesson-card" onclick="App.showLesson('${lesson.id}')" aria-label="查看 ${lessonLabel} ${lesson.number}：${lesson.title}">
          <div class="card-number">
            <span class="card-number-label">${lessonLabel}</span>
            <span class="card-number-value">${lesson.number}</span>
          </div>
          <div class="card-title">${this.highlight(lesson.title)}</div>
          <div class="card-chinese">${this.highlight(lesson.chinese_title)}</div>
          <div class="card-summary">${this.highlight(lesson.summary)}</div>
          <div class="card-footer">
            <span class="card-category cat-${lesson.category}">
              ${cat.icon} ${cat.label}
            </span>
            <span class="card-arrow">→</span>
          </div>
        </button>
      `;
    }).join('');
  },

  // Show business lessons
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

  // Backward-compatible alias
  showAll() {
    this.showBusinessEnglish();
  },

  // Go home - return to business lessons
  goHome() {
    this.goBack(false);
    this.setTrackExpanded('businessenglish', true);
    this.showBusinessEnglish();
  },

  // Filter by category
  filterByCategory(category) {
    this.currentFilter = { type: 'category', value: category };
    this.currentTrack = 'businessenglish';
    this.selectedJobLessonId = null;
    this.resetSearch();
    this.setTrackExpanded('businessenglish', true);
    if (this.currentView === 'detail') this.goBack(false);

    const lessons = getLessonsByCategory(category).filter(lesson => lesson.track === 'businessenglish');
    const cat = CATEGORIES[category];

    this.clearActiveStates();
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
    document.getElementById('panel-title').textContent = `${cat.icon} ${cat.label}`;
    this.closeSidebarOnMobile();

    this.renderLessonGrid(lessons);
  },

  // Filter by tag
  filterByTag(tag) {
    this.currentFilter = { type: 'tag', value: tag };
    this.currentTrack = 'all';
    this.selectedJobLessonId = null;
    this.resetSearch();
    this.setTrackExpanded('businessenglish', true);
    if (this.currentView === 'detail') this.goBack(false);

    const lessonIds = TAG_INDEX[tag] || [];
    const lessons = lessonIds.map(id => getLessonById(id)).filter(Boolean);

    this.clearActiveStates();
    document.querySelector(`[data-tag="${tag}"]`).classList.add('active');
    document.getElementById('panel-title').textContent = `标签: ${tag}`;
    this.closeSidebarOnMobile();

    this.renderLessonGrid(lessons);
  },

  // Perform search
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
    document.getElementById('panel-title').textContent = `搜索: "${this.searchQuery}"`;

    this.renderLessonGrid(results);
  },

  // Show lesson detail
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
      document.getElementById('btn-business').classList.add('active');
      this.setTrackExpanded('businessenglish', true);
    }
    this.syncJobLessonListState();

    this.renderLessonDetail(lesson);
    this.updateNavButtons(lesson);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // Render lesson detail
  renderLessonDetail(lesson) {
    const cat = CATEGORIES[lesson.category] || CATEGORIES.vocabulary;
    const lessonLabel = lesson.track === 'job_interview' ? 'Interview' : 'Lesson';
    const docSource = this.getJobInterviewDoc(lesson);

    document.getElementById('detail-header').innerHTML = `
      <div class="detail-lesson-num">${lessonLabel} ${lesson.number}</div>
      <h1 class="detail-title">${lesson.title}</h1>
      <div class="detail-chinese-title">${lesson.chinese_title}</div>
      <div class="detail-meta">
        <span class="detail-category cat-${lesson.category}">
          ${cat.icon} ${cat.label}
        </span>
        ${(lesson.tags || []).map(tag =>
          `<span class="detail-tag">${tag}</span>`
        ).join('')}
      </div>
      <div class="detail-summary">${lesson.summary}</div>
    `;

    const bodyHTML = (lesson.sections || []).map(section => `
      <div class="section-block">
        <div class="section-heading">${section.heading}</div>
        ${(section.items || []).map(item => `
          <div class="vocab-item">
            <div class="vocab-term">${item.term}</div>
            ${item.chinese ? `<div class="vocab-chinese">${item.chinese}</div>` : ''}
            ${item.definition ? `<div class="vocab-definition">${item.definition}</div>` : ''}
            ${item.note ? `<div class="vocab-note">💡 ${item.note}</div>` : ''}
            ${item.examples && item.examples.length > 0 ? `
              <div class="examples-list">
                ${item.examples.map(ex => `
                  <div class="example-pair">
                    <div class="example-en">${ex.en}</div>
                    <div class="example-zh">${ex.zh}</div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `).join('');

    const notebookHTML = docSource
      ? `
        <div class="section-block notebook-block">
          <div class="section-heading">Notebook Preview</div>
          <div class="notebook-overview">
            <div class="notebook-kicker">Lesson Notebook</div>
            <div class="notebook-doc-title">${this.escapeHTML(docSource.docTitle)}</div>
            <p class="notebook-overview-zh">${this.escapeHTML(docSource.overview.zh)}</p>
            <p class="notebook-overview-en">${this.escapeHTML(docSource.overview.en)}</p>
            <div class="notebook-actions">
              <a class="source-link" href="${docSource.fileUrl}" target="_blank" rel="noopener noreferrer">Open Notebook</a>
            </div>
          </div>
          <div class="notebook-grid">
            ${(docSource.snippets || []).map(snippet => {
              const labelMap = {
                question: 'Question Drill',
                answer: 'Answer Line',
                insight: 'Doc Insight'
              };

              return `
                <article class="notebook-card">
                  <div class="notebook-card-label">${labelMap[snippet.type] || 'Notebook Note'}</div>
                  <div class="notebook-card-en">${this.escapeHTML(snippet.en)}</div>
                  <div class="notebook-card-zh">${this.escapeHTML(snippet.zh)}</div>
                </article>
              `;
            }).join('')}
          </div>
        </div>
      `
      : '';

    const sourceCards = [];
    if (lesson.track === 'job_interview' && lesson.source) {
      sourceCards.push(`
        <article class="source-card">
          <div class="source-kind">YouTube 来源</div>
          <div class="source-title">${this.escapeHTML(lesson.source.title)}</div>
          <div class="source-actions">
            <a class="source-link" href="${lesson.source.url}" target="_blank" rel="noopener noreferrer">Open Video</a>
          </div>
        </article>
      `);

      if (docSource) {
        sourceCards.push(`
          <article class="source-card">
            <div class="source-kind">文档来源</div>
            <div class="source-title">${this.escapeHTML(docSource.docTitle)}</div>
            <div class="source-actions">
              <a class="source-link" href="${docSource.fileUrl}" target="_blank" rel="noopener noreferrer">Open Notebook</a>
            </div>
          </article>
        `);
      } else {
        sourceCards.push(`
          <article class="source-card source-card-muted">
            <div class="source-kind">文档来源</div>
            <div class="source-title">Notebook page not available yet</div>
            <div class="source-meta">当前这一课还没有整理好的 Notebook 页面。</div>
          </article>
        `);
      }
    }

    const sourceHTML = sourceCards.length > 0
      ? `
        <div class="section-block source-block">
          <div class="section-heading">Source Links</div>
          <div class="source-grid">
            ${sourceCards.join('')}
          </div>
        </div>
      `
      : '';

    document.getElementById('detail-body').innerHTML = notebookHTML + bodyHTML + sourceHTML;

    const related = getRelatedLessons(lesson.id);
    if (related.length > 0) {
      document.getElementById('related-section').innerHTML = `
        <div class="related-label">相关课题 (${related.length})</div>
        <div class="related-grid">
          ${related.map(rel => `
            <button type="button" class="related-card" onclick="App.showLesson('${rel.id}')" aria-label="查看相关课题：${rel.title}">
              <span class="related-num">${rel.track === 'job_interview' ? `J${rel.number}` : `L${rel.number}`}</span>
              <div class="related-info">
                <div class="related-title">${rel.title}</div>
                <div class="related-zh">${rel.chinese_title}</div>
              </div>
            </button>
          `).join('')}
        </div>
      `;
    } else {
      document.getElementById('related-section').innerHTML = '';
    }
  },

  // Update prev/next navigation buttons by current track
  updateNavButtons(lesson) {
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const trackLessons = this.getTrackLessons(lesson.track || 'businessenglish');
    const currentIndex = trackLessons.findIndex(l => l.id === lesson.id);

    btnPrev.disabled = currentIndex <= 0;
    btnNext.disabled = currentIndex >= trackLessons.length - 1;
  },

  // Navigate to prev/next lesson within current track
  navigateLesson(direction) {
    if (!this.currentLesson) return;

    const trackLessons = this.getTrackLessons(this.currentLesson.track || 'businessenglish');
    const currentIndex = trackLessons.findIndex(l => l.id === this.currentLesson.id);
    const nextIndex = currentIndex + direction;

    if (nextIndex < 0 || nextIndex >= trackLessons.length) return;
    this.showLesson(trackLessons[nextIndex].id);
  },

  // Go back to list
  goBack(pushState = true) {
    this.currentView = 'list';
    this.currentLesson = null;

    if (pushState) {
      history.pushState(null, '', '#');
    }

    document.getElementById('panel-detail').classList.add('hidden');
    document.getElementById('panel-list').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // Toggle mobile sidebar
  toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
  },

  // Close sidebar on mobile after selection
  closeSidebarOnMobile() {
    if (window.innerWidth <= 900) {
      document.getElementById('sidebar').classList.remove('open');
    }
  },

  // Clear active states
  clearActiveStates() {
    document.querySelectorAll('.sidebar-track-toggle, .category-item, .tag-btn, .job-lesson-item').forEach(el => {
      el.classList.remove('active');
    });
  },

  // Update counts
  updateCounts() {
    const businessCount = this.getTrackLessons('businessenglish').length;
    const jobCount = this.getTrackLessons('job_interview').length;
    document.getElementById('count-business').textContent = businessCount;
    document.getElementById('count-job').textContent = jobCount;
  },

  // Highlight search matches
  highlight(text) {
    if (!this.searchQuery || !text) return text;
    const escaped = this.searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }
};

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}

// Handle initial hash
window.addEventListener('load', () => {
  const hash = window.location.hash;
  if (!hash.startsWith('#lesson-')) return;

  const token = hash.replace('#lesson-', '');
  let lesson = null;

  // Backward compatibility with old numeric hash: #lesson-12
  if (/^\d+$/.test(token)) {
    const lessonNum = parseInt(token, 10);
    lesson = getLessonsByTrack('businessenglish').find(l => l.number === lessonNum) || null;
  } else {
    lesson = getLessonById(token);
  }

  if (lesson) {
    App.showLesson(lesson.id, false);
  }
});
