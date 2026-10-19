// ========== Загрузка данных ==========
async function loadLessons() {
  const res = await fetch('lessons.json');
  if (!res.ok) throw new Error('Не удалось загрузить lessons.json');
  return await res.json();
}

// ========== Рендер навигации ==========
function renderNav(lessons, activeId) {
  const nav = document.getElementById('nav');
  if (!nav) return;

  nav.innerHTML = '';

  lessons.forEach(lesson => {
    const btn = document.createElement('button');
    btn.className = 'nav-item' + (lesson.id === activeId ? ' active' : '');
    btn.textContent = lesson.title;
    btn.dataset.page = lesson.id;
    btn.addEventListener('click', () => {
      switchLesson(lesson.id);
      closeSidebar();
    });
    nav.appendChild(btn);
  });
}

// ========== Рендер урока ==========
function renderLesson(lesson) {
  const main = document.getElementById('content');
  if (!main) return;

  main.innerHTML = '';

  const container = document.createElement('div');
  container.className = 'container';

  const h1 = document.createElement('h1');
  h1.textContent = lesson.title;
  container.appendChild(h1);

  if (lesson.subtitle) {
    const sub = document.createElement('p');
    sub.className = 'subtitle';
    sub.textContent = lesson.subtitle;
    container.appendChild(sub);
  }

  lesson.blocks.forEach(block => {
    container.appendChild(renderBlock(block));
  });

  main.appendChild(container);
}

// ========== Рендер блока ==========
function renderBlock(block) {
  switch (block.type) {
    case 'heading':      return renderHeading(block);
    case 'symbol-card':  return renderSymbolCard(block);
    case 'grid':         return renderGrid(block);
    case 'grid-2':       return renderGrid2(block);
    case 'note':         return renderNote(block);
    case 'warn':         return renderWarn(block);
    default:             return document.createTextNode('');
  }
}

function renderHeading(block) {
  const h2 = document.createElement('h2');
  h2.textContent = block.text;
  return h2;
}

function renderSymbolCard(block) {
  const card = document.createElement('div');
  card.className = 'card';

  const sym = document.createElement('span');
  sym.className = 'symbol';
  sym.textContent = block.symbol;
  card.appendChild(sym);

  const meaning = document.createElement('p');
  meaning.className = 'meaning';
  meaning.textContent = block.meaning;
  card.appendChild(meaning);

  if (block.text) {
    const p = document.createElement('p');
    p.textContent = block.text;
    card.appendChild(p);
  }

  if (block.code) {
    const pre = document.createElement('pre');
    pre.textContent = block.code;
    card.appendChild(pre);
  }

  if (block.human) {
    const h = document.createElement('p');
    h.className = 'human';
    h.textContent = block.human;
    card.appendChild(h);
  }

  return card;
}

function renderGrid(block) {
  const grid = document.createElement('div');
  grid.className = 'grid';

  block.cards.forEach(card => {
    if (card.type === 'table') {
      grid.appendChild(renderTableCard(card));
    } else if (card.type === 'symbol-card') {
      grid.appendChild(renderSymbolCard(card));
    }
  });

  return grid;
}

function renderGrid2(block) {
  const grid = document.createElement('div');
  grid.className = 'grid-2';

  block.cards.forEach(card => {
    if (card.type === 'symbol-card') {
      grid.appendChild(renderSymbolCard(card));
    } else if (card.type === 'table') {
      grid.appendChild(renderTableCard(card));
    }
  });

  return grid;
}

function renderTableCard(card) {
  const wrap = document.createElement('div');
  wrap.className = 'card';

  const h3 = document.createElement('h3');
  h3.textContent = card.title;
  wrap.appendChild(h3);

  const table = document.createElement('table');

  card.rows.forEach(row => {
    const tr = document.createElement('tr');

    const tdCode = document.createElement('td');
    const code = document.createElement('code');
    code.textContent = row.code;
    tdCode.appendChild(code);
    tr.appendChild(tdCode);

    const tdDesc = document.createElement('td');
    tdDesc.className = 'desc';
    tdDesc.textContent = row.desc;

    if (row.example) {
      const ex = document.createElement('span');
      ex.className = 'example';
      ex.textContent = row.example;
      tdDesc.appendChild(ex);
    }

    if (row.human) {
      const h = document.createElement('span');
      h.className = 'human';
      h.textContent = row.human;
      tdDesc.appendChild(h);
    }

    tr.appendChild(tdDesc);
    table.appendChild(tr);
  });

  wrap.appendChild(table);
  return wrap;
}

function renderNote(block) {
  const div = document.createElement('div');
  div.className = 'note';
  div.innerHTML = block.html || block.text || '';
  return div;
}

function renderWarn(block) {
  const div = document.createElement('div');
  div.className = 'warn';
  div.innerHTML = block.html || block.text || '';
  return div;
}

// ========== Переключение урока ==========
function switchLesson(id, options = {}) {
  document.querySelectorAll('.nav-item').forEach(t => {
    t.classList.toggle('active', t.dataset.page === id);
  });

  const lesson = window.__lessons.find(l => l.id === id);
  if (lesson) {
    renderLesson(lesson);
    if (!options.noScroll) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}

// ========== Sidebar на мобиле ==========
function openSidebar() {
  const sidebar = document.getElementById('sidebar');
  const hamburger = document.getElementById('hamburger');
  const overlay = document.getElementById('overlay');

  if (sidebar) sidebar.classList.add('open');
  if (hamburger) hamburger.classList.add('open');
  if (overlay) overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const hamburger = document.getElementById('hamburger');
  const overlay = document.getElementById('overlay');

  if (sidebar) sidebar.classList.remove('open');
  if (hamburger) hamburger.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function setupSidebar() {
  const sidebar = document.getElementById('sidebar');
  const hamburger = document.getElementById('hamburger');
  const overlay = document.getElementById('overlay');

  if (!sidebar || !hamburger || !overlay) {
    console.warn('Sidebar: не все элементы найдены', {
      sidebar: !!sidebar,
      hamburger: !!hamburger,
      overlay: !!overlay
    });
    return;
  }

  hamburger.addEventListener('click', () => {
    if (sidebar.classList.contains('open')) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  overlay.addEventListener('click', closeSidebar);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSidebar();
  });
}

// ========== ПОИСК (как Ctrl+F) ==========
let searchResults = [];
let currentResultIndex = -1;

function setupSearch() {
  const input = document.getElementById('search-input');
  const prev = document.getElementById('search-prev');
  const next = document.getElementById('search-next');

  console.log('setupSearch:', {
    input: !!input,
    prev: !!prev,
    next: !!next
  });

  if (!input) {
    console.error('setupSearch: не найден #search-input');
    return;
  }

  let debounceTimer;
  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      performSearch(input.value.trim());
    }, 150);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults.length > 0) {
        goToResult(e.shiftKey ? currentResultIndex - 1 : currentResultIndex + 1);
      }
    }
    if (e.key === 'Escape') {
      input.value = '';
      clearSearch();
      input.blur();
    }
  });

  if (prev) prev.addEventListener('click', () => goToResult(currentResultIndex - 1));
  if (next) next.addEventListener('click', () => goToResult(currentResultIndex + 1));

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      input.focus();
      input.select();
    }
  });
}

function clearSearch() {
  searchResults = [];
  currentResultIndex = -1;
  updateCounter();
  clearMarks();
}

function performSearch(query) {
  clearMarks();

  if (!query || query.length < 2) {
    clearSearch();
    return;
  }

  const queryLower = query.toLowerCase();
  searchResults = [];

  window.__lessons.forEach((lesson) => {
    lesson.blocks.forEach((block, blockIndex) => {
      const matches = searchInBlock(block, queryLower, lesson.id, blockIndex);
      searchResults.push(...matches);
    });
  });

  if (searchResults.length === 0) {
    currentResultIndex = -1;
    updateCounter(query);
    return;
  }

  goToResult(0);
}

function searchInBlock(block, query, lessonId, blockIndex) {
  const matches = [];

  const textFields = ['symbol', 'meaning', 'text', 'code', 'human', 'title'];
  textFields.forEach(field => {
    if (block[field] && typeof block[field] === 'string') {
      if (block[field].toLowerCase().includes(query)) {
        matches.push({ lessonId, blockIndex, field, text: block[field], query });
      }
    }
  });

  if (block.rows && Array.isArray(block.rows)) {
    block.rows.forEach((row) => {
      ['code', 'desc', 'example', 'human'].forEach(field => {
        if (row[field] && typeof row[field] === 'string') {
          if (row[field].toLowerCase().includes(query)) {
            matches.push({ lessonId, blockIndex, field, text: row[field], query });
          }
        }
      });
    });
  }

  if (block.cards && Array.isArray(block.cards)) {
    block.cards.forEach(card => {
      matches.push(...searchInBlock(card, query, lessonId, blockIndex));
    });
  }

  if (block.html && typeof block.html === 'string') {
    const text = stripHtml(block.html);
    if (text.toLowerCase().includes(query)) {
      matches.push({ lessonId, blockIndex, field: 'html', text, query });
    }
  }

  return matches;
}

function updateCounter(query = '') {
  const counterEl = document.getElementById('search-counter');
  const prev = document.getElementById('search-prev');
  const next = document.getElementById('search-next');

  if (!counterEl) return;

  if (searchResults.length === 0) {
    counterEl.textContent = query ? 'Ничего не найдено' : '0 / 0';
    counterEl.className = 'search-counter' + (query ? ' no-results' : '');
    if (prev) prev.disabled = true;
    if (next) next.disabled = true;
    return;
  }

  counterEl.textContent = `${currentResultIndex + 1} / ${searchResults.length}`;
  counterEl.className = 'search-counter has-results';
  if (prev) prev.disabled = false;
  if (next) next.disabled = false;
}

function goToResult(index) {
  if (searchResults.length === 0) return;

  if (index < 0) index = searchResults.length - 1;
  if (index >= searchResults.length) index = 0;

  currentResultIndex = index;
  const result = searchResults[index];

  clearMarks();

  const currentLesson = document.querySelector('.nav-item.active')?.dataset.page;
  if (currentLesson !== result.lessonId) {
    switchLesson(result.lessonId, { noScroll: true });
  }

  setTimeout(() => {
    highlightBlock(result);
    updateCounter();
  }, 80);
}

function highlightBlock(result) {
  const container = document.querySelector('.container');
  if (!container) return;

  const blocks = Array.from(container.children).slice(2);
  const block = blocks[result.blockIndex];

  if (!block) return;

  block.scrollIntoView({ behavior: 'smooth', block: 'center' });

  block.classList.remove('highlight');
  void block.offsetWidth;
  block.classList.add('highlight');
  setTimeout(() => block.classList.remove('highlight'), 1500);

  setTimeout(() => {
    markTextInElement(block, result.query, true);
  }, 100);
}

function markTextInElement(element, query, isCurrent = false) {
  if (!query) return;

  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  const textNodes = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.nodeValue.toLowerCase().includes(query.toLowerCase())) {
      textNodes.push(node);
    }
  }

  textNodes.forEach((node, i) => {
    const text = node.nodeValue;
    const lower = text.toLowerCase();
    const queryLower = query.toLowerCase();

    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    let idx;

    while ((idx = lower.indexOf(queryLower, lastIndex)) !== -1) {
      if (idx > lastIndex) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex, idx)));
      }

      const mark = document.createElement('mark');
      mark.className = 'search-hit' + (isCurrent && i === 0 ? ' current' : '');
      mark.textContent = text.slice(idx, idx + query.length);
      fragment.appendChild(mark);

      lastIndex = idx + query.length;
    }

    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
    }

    node.parentNode.replaceChild(fragment, node);
  });
}

function clearMarks() {
  document.querySelectorAll('mark.search-hit').forEach(mark => {
    const parent = mark.parentNode;
    parent.replaceChild(document.createTextNode(mark.textContent), mark);
    parent.normalize();
  });
}

function stripHtml(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || '';
}

// ========== Инициализация ==========
async function init() {
  const content = document.getElementById('content');

  if (!content) {
    console.error('Не найден #content в HTML');
    return;
  }

  try {
    content.innerHTML = '<div class="loading">Загрузка уроков...</div>';

    const data = await loadLessons();
    window.__lessons = data.lessons;

    if (!data.lessons || data.lessons.length === 0) {
      throw new Error('lessons.json пустой');
    }

    renderNav(data.lessons, data.lessons[0].id);
    renderLesson(data.lessons[0]);
    setupSidebar();
    setupSearch();

  } catch (err) {
    content.innerHTML = `
      <div class="error">
        Ошибка: ${err.message}
        <code>Открой сайт через http://localhost, а не file://</code>
      </div>
    `;
    console.error(err);
  }
}

// ========== Запуск ==========
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}