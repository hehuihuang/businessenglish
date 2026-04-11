// app.js — Business English Knowledge Base Application Logic
// Handles search, navigation, filtering, and cross-linking

const App = {
  // State
  currentView: 'list',
  currentLesson: null,
  currentFilter: { type: null, value: null },
  searchQuery: '',

  // Initialize
  init() {
    this.renderCategories();
    this.renderTagCloud();
    this.renderLessonGrid(ALL_LESSONS);
    this.bindEvents();
    this.updateCounts();
  },

  // Bind event listeners
  bindEvents() {
    const searchInput = document.getElementById('search-input');
    const searchClear = document.getElementById('search-clear');

    searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.performSearch();
      searchClear.classList.toggle('visible', this.searchQuery.length > 0);
    });

    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      this.searchQuery = '';
      this.performSearch();
      searchClear.classList.remove('visible');
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

    // Handle browser back/forward
    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.lessonId) {
        this.showLesson(e.state.lessonId, false);
      } else {
        this.goBack(false);
      }
    });
  },

  // Render category list in sidebar
  renderCategories() {
    const container = document.getElementById('category-list');
    const categories = Object.entries(CATEGORIES);

    container.innerHTML = categories.map(([key, cat]) => {
      const count = getLessonsByCategory(key).length;
      return `
        <button class="category-item" data-category="${key}">
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
    const tags = getAllTags().slice(0, 20); // Top 20 tags

    container.innerHTML = tags.map(tag =>
      `<button class="tag-btn" data-tag="${tag}">${tag}</button>`
    ).join('');
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
          <p>试试其他关键词或浏览分类</p>
        </div>
      `;
      resultCount.textContent = '';
      return;
    }

    resultCount.textContent = `共 ${lessons.length} 个课题`;

    grid.innerHTML = lessons.map(lesson => {
      const cat = CATEGORIES[lesson.category];
      return `
        <div class="lesson-card" onclick="App.showLesson('${lesson.id}')">
          <div class="card-number">Lesson ${lesson.number}</div>
          <div class="card-title">${this.highlight(lesson.title)}</div>
          <div class="card-chinese">${this.highlight(lesson.chinese_title)}</div>
          <div class="card-summary">${this.highlight(lesson.summary)}</div>
          <div class="card-footer">
            <span class="card-category cat-${lesson.category}">
              ${cat.icon} ${cat.label}
            </span>
            <span class="card-arrow">→</span>
          </div>
        </div>
      `;
    }).join('');
  },

  // Show all lessons
  showAll() {
    this.currentFilter = { type: null, value: null };
    this.searchQuery = '';
    document.getElementById('search-input').value = '';
    document.getElementById('search-clear').classList.remove('visible');

    this.clearActiveStates();
    document.getElementById('btn-all').classList.add('active');
    document.getElementById('panel-title').textContent = '全部 40 个课题';

    this.renderLessonGrid(ALL_LESSONS);
  },

  // Go home - return to all lessons view
  goHome() {
    this.goBack(false);
    this.showAll();
  },

  // Filter by category
  filterByCategory(category) {
    this.currentFilter = { type: 'category', value: category };
    this.searchQuery = '';
    document.getElementById('search-input').value = '';
    document.getElementById('search-clear').classList.remove('visible');

    const lessons = getLessonsByCategory(category);
    const cat = CATEGORIES[category];

    this.clearActiveStates();
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
    document.getElementById('panel-title').textContent = `${cat.icon} ${cat.label}`;

    this.renderLessonGrid(lessons);
  },

  // Filter by tag
  filterByTag(tag) {
    this.currentFilter = { type: 'tag', value: tag };
    this.searchQuery = '';
    document.getElementById('search-input').value = '';
    document.getElementById('search-clear').classList.remove('visible');

    const lessonIds = TAG_INDEX[tag] || [];
    const lessons = lessonIds.map(id => getLessonById(id)).filter(Boolean);

    this.clearActiveStates();
    document.querySelector(`[data-tag="${tag}"]`).classList.add('active');
    document.getElementById('panel-title').textContent = `标签: ${tag}`;

    this.renderLessonGrid(lessons);
  },

  // Perform search
  performSearch() {
    if (!this.searchQuery.trim()) {
      this.showAll();
      return;
    }

    const results = searchLessons(this.searchQuery);

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

    // Update URL
    if (pushState) {
      history.pushState({ lessonId }, '', `#lesson-${lesson.number}`);
    }

    // Hide list, show detail
    document.getElementById('panel-list').classList.add('hidden');
    document.getElementById('panel-detail').classList.remove('hidden');

    // Render detail
    this.renderLessonDetail(lesson);

    // Update prev/next buttons
    this.updateNavButtons(lesson.number);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // Render lesson detail
  renderLessonDetail(lesson) {
    const cat = CATEGORIES[lesson.category];

    // Header
    document.getElementById('detail-header').innerHTML = `
      <div class="detail-lesson-num">Lesson ${lesson.number}</div>
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

    // Body sections
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

    document.getElementById('detail-body').innerHTML = bodyHTML;

    // Related lessons
    const related = getRelatedLessons(lesson.id);
    if (related.length > 0) {
      document.getElementById('related-section').innerHTML = `
        <div class="related-label">相关课题 (${related.length})</div>
        <div class="related-grid">
          ${related.map(rel => `
            <button class="related-card" onclick="App.showLesson('${rel.id}')">
              <span class="related-num">L${rel.number}</span>
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

  // Update prev/next navigation buttons
  updateNavButtons(currentNumber) {
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');

    btnPrev.disabled = currentNumber <= 1;
    btnNext.disabled = currentNumber >= 40;
  },

  // Navigate to prev/next lesson
  navigateLesson(direction) {
    if (!this.currentLesson) return;
    const newNumber = this.currentLesson.number + direction;
    if (newNumber < 1 || newNumber > 40) return;

    const newLesson = ALL_LESSONS.find(l => l.number === newNumber);
    if (newLesson) {
      this.showLesson(newLesson.id);
    }
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

  // Clear active states
  clearActiveStates() {
    document.querySelectorAll('.sidebar-btn, .category-item, .tag-btn').forEach(el => {
      el.classList.remove('active');
    });
  },

  // Update counts
  updateCounts() {
    document.getElementById('count-all').textContent = ALL_LESSONS.length;
  },

  // Highlight search matches
  highlight(text) {
    if (!this.searchQuery || !text) return text;
    const regex = new RegExp(`(${this.searchQuery})`, 'gi');
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
  if (hash.startsWith('#lesson-')) {
    const lessonNum = parseInt(hash.replace('#lesson-', ''));
    const lesson = ALL_LESSONS.find(l => l.number === lessonNum);
    if (lesson) {
      App.showLesson(lesson.id, false);
    }
  }
});
