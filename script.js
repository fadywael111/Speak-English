/* ═══════════════════════════════════════════════════════════════
   EDUTRACK — Student Results Dashboard
   Core JavaScript Logic
   ═══════════════════════════════════════════════════════════════ */

/* ── Multi-Level Data Architecture ────────────────────────────── */
let levelsData = JSON.parse(localStorage.getItem('eduTrack_levelsData')) || {};
const LEVELS_DATA_PATH = 'data/levelsData.json';
let levelsSha = '';

let currentLevel = localStorage.getItem('eduTrack_currentLevel') || 'Level 3';
let students = levelsData[currentLevel] || [];

/* ── Helpers ─────────────────────────────────────────────────── */
const WA_ICON = `<svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>`;

function scoreLevel(s) {
    return s >= 40 ? 'high' : s >= 25 ? 'mid' : 'low';
}

const COPY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"/></svg>`;

function copyPhone(phone, btn) {
    const display = phone.replace(/^20/, '0');
    navigator.clipboard.writeText(display).then(() => {
        btn.innerHTML = '✓ Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
            btn.innerHTML = COPY_ICON + ' Copy';
            btn.classList.remove('copied');
        }, 1500);
    });
}

function waButton(phone) {
    if (!phone) return '<span class="no-data">—</span>';
    const display = phone.replace(/^20/, '0');
    return `<div class="contact-actions">`
        + `<a class="wa-btn" href="https://wa.me/${phone}" target="_blank" rel="noopener">${WA_ICON} Contact</a>`
        + `<button class="copy-btn" onclick="copyPhone('${phone}', this)">${COPY_ICON} Copy</button>`
        + `</div>`;
}

/* ── State ───────────────────────────────────────────────────── */
let sortKey = 'score', sortAsc = false; // default: score descending
let filtered = [...students];
let smartFilter = 'all';

/* ── Dropdown & Level Switching ────────────────────────────── */
function toggleLevelMenu(e) {
    if (e) e.stopPropagation();
    const menu = document.getElementById('levelMenu');
    const btn = document.getElementById('currentLevelBtn');
    menu.classList.toggle('hidden');

    if (!menu.classList.contains('hidden')) {
        if (btn) btn.classList.add('active-glow');
    } else {
        if (btn) btn.classList.remove('active-glow');
    }
}

// Close dropdown on click outside
document.addEventListener('click', (e) => {
    const menu = document.getElementById('levelMenu');
    const btn = document.getElementById('currentLevelBtn');
    if (menu && !menu.classList.contains('hidden') && e.target !== btn && !menu.contains(e.target)) {
        menu.classList.add('hidden');
        if (btn) btn.classList.remove('active-glow');
    }
});

function changeLevel(level) {
    currentLevel = level;
    localStorage.setItem('eduTrack_currentLevel', level);
    const textEl = document.getElementById('currentLevelText');
    if (textEl) textEl.textContent = level;
    else document.getElementById('currentLevelBtn').textContent = level;

    document.querySelectorAll('.level-item').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.trim() === level);
    });

    document.getElementById('levelMenu').classList.add('hidden');
    const btn = document.getElementById('currentLevelBtn');
    if (btn) btn.classList.remove('active-glow');

    // UI Elements
    checkAdminVisibility();
    updateTeachers();

    // Update Data
    students = levelsData[currentLevel] || [];
    curriculumData = fullCurriculumData[currentLevel] || {};

    // UI Elements
    const audioGrid = document.getElementById('audioGrid');
    const currAcc = document.getElementById('curriculumAccordion');
    const emptyContent = document.getElementById('emptyStateContent');

    // Reset Curriculum UI Transformations (Clear old videos/quizzes)
    document.querySelectorAll('.lesson-actions-beast').forEach(el => el.remove());
    document.querySelectorAll('.lesson-card').forEach(card => {
        const lessonId = card.getAttribute('data-lesson');
        const info = card.querySelector('.lesson-file-count');

        // Reset info text
        if (info) {
            info.textContent = "No files yet";
            info.classList.remove('video-available', 'video-ready', 'quiz-ready');
        }

        // Restore Upload button if it doesn't exist AND user is admin
        if (!card.querySelector('.upload-btn') && ghToken) {
            const btn = document.createElement('button');
            btn.className = 'upload-btn';
            btn.setAttribute('onclick', `promptVideoLink('${lessonId}')`);
            btn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                </svg> Upload
            `;
            card.appendChild(btn);
        }
    });

    // Apply specific level data (Videos/Quizzes)
    applyCurriculumData();

    // Alway show Audio and Curriculum structures, hide ONLY if no students? 
    // User wants audio everywhere and videos only on L3 (which is naturally empty on others)
    if (audioGrid) audioGrid.classList.remove('hidden');
    if (currAcc) currAcc.classList.remove('hidden');
    if (emptyContent) emptyContent.classList.add('hidden');

    // Refresh UI with Skeleton Animation
    const skel = document.getElementById('skeleton');
    if (skel) {
        document.getElementById('tBody').innerHTML = ''; // Clear table
        skel.classList.remove('hidden', 'fade-out'); // Show skeleton
        setTimeout(() => {
            initClassFilter();
            applySort();
            applyFilters();
            updateStats();
        }, 500);
    } else {
        initClassFilter();
        applySort();
        applyFilters();
        updateStats();
    }

    if (document.getElementById('attendanceSection') && !document.getElementById('attendanceSection').classList.contains('hidden')) {
        initAttendanceUI();
    }
}

function setSmartFilter(val, e) {
    if (e) e.preventDefault();
    smartFilter = val;
    document.querySelectorAll('.filter-pill').forEach(btn => btn.classList.remove('active'));
    if (e && e.target) e.target.classList.add('active');
    applyFilters();
}

/* ── Stats ───────────────────────────────────────────────────── */
function updateStats() {
    const n = students.length;
    document.getElementById('statTotal').textContent = n;
    document.getElementById('statAvg').textContent = (students.reduce((a, s) => a + s.score, 0) / n).toFixed(1);
    document.getElementById('statTop').textContent = Math.max(...students.map(s => s.score));
}

/* ── Populate class filter dropdown ──────────────────────────── */
function initClassFilter() {
    const classes = [...new Set(students.map(s => s.cls))].sort();
    const sel = document.getElementById('classFilter');
    if (sel) {
        sel.innerHTML = '<option value="all">All Classes</option>';
        classes.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c;
            opt.textContent = 'Class ' + c;
            sel.appendChild(opt);
        });
    }
}

/* ── Render Table ────────────────────────────────────────────── */
function renderTable(data) {
    const tbody = document.getElementById('tBody');
    const empty = document.getElementById('emptyState');
    const skel = document.getElementById('skeleton');

    if (skel && !skel.classList.contains('fade-out')) {
        skel.classList.add('fade-out');
        setTimeout(() => skel.classList.add('hidden'), 500);
    }

    if (!data.length) {
        tbody.innerHTML = '';
        empty.classList.remove('hidden');
        return;
    }
    empty.classList.add('hidden');

    tbody.innerHTML = data.map((s, i) => `
        <tr class="fade-in" style="animation-delay:${i * 30}ms">
            <td><span class="student-rank">${i + 1}</span></td>
            <td><span class="student-name">${s.name}</span></td>
            <td><span class="score-badge ${scoreLevel(s.score)}">${s.score}</span></td>
            <td><span class="class-badge">${s.cls}</span></td>
            <td class="sub-text">${s.guardian || '<span class="no-data">—</span>'}</td>
            <td>${waButton(s.phone)}</td>
            <td class="admin-only ${ghToken ? '' : 'hidden'}">
                <div class="td-actions">
                    <button class="action-icon-btn edit" onclick="openEditStudentModal(${i})" title="Edit Student">
                        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"/></svg>
                    </button>
                    <button class="action-icon-btn delete" onclick="deleteStudent(${i})" title="Delete Student">
                        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>
            </td>
        </tr>`).join('');
}

/* ── Render Cards (mobile) ───────────────────────────────────── */
function renderCards(data) {
    const list = document.getElementById('cardsList');
    const empty = document.getElementById('emptyStateCards');
    list.querySelectorAll('.student-card').forEach(c => c.remove());

    if (!data.length) {
        empty.classList.remove('hidden');
        return;
    }
    empty.classList.add('hidden');

    data.forEach((s, i) => {
        const card = document.createElement('div');
        card.className = 'student-card fade-in';
        card.style.animationDelay = `${i * 40}ms`;
        card.innerHTML = `
            <div class="card-header">
                <div class="card-title-group">
                    <span class="student-name">${s.name}</span>
                    <div class="card-subtitle">
                        <span class="class-label">Class ${s.cls}</span>
                        <span class="sep">•</span>
                        <span class="guardian-name">${s.guardian || 'No Guardian'}</span>
                    </div>
                </div>
                <span class="score-badge ${scoreLevel(s.score)}">${s.score}</span>
            </div>
            <div class="card-actions-wrapper">
                ${waButton(s.phone)}
                <div class="admin-actions admin-only ${ghToken ? '' : 'hidden'}">
                    <button class="action-icon-btn edit" onclick="openEditStudentModal(${i})" title="Edit">
                        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"/></svg>
                    </button>
                    <button class="action-icon-btn delete" onclick="deleteStudent(${i})" title="Delete">
                        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>
            </div>`;
        list.appendChild(card);
    });
}

/* ── Apply Search & Filter ───────────────────────────────────── */
function applyFilters() {
    const q = document.getElementById('searchInput').value.toLowerCase().trim();
    const cls = document.getElementById('classFilter').value;

    filtered = students.filter(s => {
        const matchName = s.name.toLowerCase().includes(q);
        const matchClass = cls === 'all' || s.cls == cls;
        let matchSmart = true;
        if (smartFilter === 'high' && s.score < 40) matchSmart = false;
        if (smartFilter === 'low' && s.score >= 25) matchSmart = false;
        if (smartFilter === 'mid' && (s.score < 25 || s.score >= 40)) matchSmart = false;
        return matchName && matchClass && matchSmart;
    });

    applySort();
    render();
}

/* ── Sort ─────────────────────────────────────────────────────── */
function sort(key) {
    if (sortKey === key) sortAsc = !sortAsc;
    else { sortKey = key; sortAsc = key === 'name'; }

    // update header classes
    document.querySelectorAll('.sortable').forEach(th => th.classList.remove('asc', 'desc'));
    const id = { name: 'th-name', score: 'th-score', cls: 'th-cls' }[key];
    document.getElementById(id).classList.add(sortAsc ? 'asc' : 'desc');

    applySort();
    render();
}

function applySort() {
    filtered.sort((a, b) => {
        let va = a[sortKey], vb = b[sortKey];
        if (typeof va === 'string') {
            va = va.toLowerCase();
            vb = vb.toLowerCase();
        }
        return sortAsc ? (va < vb ? -1 : va > vb ? 1 : 0) : (va > vb ? -1 : va < vb ? 1 : 0);
    });
}

function render() {
    renderTable(filtered);
    renderCards(filtered);
    document.getElementById('countBadge').textContent = `${filtered.length} of ${students.length}`;
}

/* ── Sidebar Toggle ──────────────────────────────────────────── */
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sidebarOverlay').classList.toggle('show');
}

/* ── Loading Simulation ──────────────────────────────────────── */
function init() {
    // 1. Load Persisted Level
    const savedLevel = localStorage.getItem('eduTrack_currentLevel') || 'Level 3';
    currentLevel = savedLevel;
    const textEl = document.getElementById('currentLevelText');
    if (textEl) textEl.textContent = savedLevel;
    else document.getElementById('currentLevelBtn').textContent = savedLevel;
    updateTeachers();

    // Highlight active level in dropdown
    document.querySelectorAll('.level-item').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.trim() === savedLevel);
    });

    // 2. Reset to Default Tab
    const defaultTab = 'students';
    const tabLink = document.querySelector(`.sidebar-nav a[data-tab="${defaultTab}"]`);
    if (tabLink) {
        // Delay to ensure DOM sections are ready
        setTimeout(() => switchTab(defaultTab, tabLink), 50);
    }

    // 3. Populate and show
    setTimeout(async () => {
        await fetchLevelsData(); // Fetch global students data FIRST
        checkAdminVisibility();

        if (defaultTab === 'students') {
            updateStats();
            initClassFilter();
            // Default sort: score desc
            const th = document.getElementById('th-score');
            if (th) th.classList.add('desc');
            applySort();
            render();
        }
        fetchCurriculumData(); // Load custom video links for currentLevel
        initSeek(); // Initialize audio seeking dragging
    }, 600);
}

/* ═══════════════════════════════════════════════════════════════
 AUDIO PLAYER & TAB SWITCHING
 ═══════════════════════════════════════════════════════════════ */

/* ── Audio Elements ─────────────────────────────────────────── */
const audioFiles = [
    { src: "Lord's Prayer.mp3", el: null },
    { src: "The Trinitarian Formula.mp3", el: null }
];

let isDragging = false;
let dragIdx = -1;

audioFiles.forEach((af, i) => {
    af.el = new Audio(af.src);
    af.el.preload = 'metadata';
    af.el.addEventListener('timeupdate', () => updateProgress(i));
    af.el.addEventListener('ended', () => resetPlayer(i));
    af.el.addEventListener('loadedmetadata', () => {
        document.getElementById('time' + (i + 1)).textContent =
            `0:00 / ${fmtTime(af.el.duration)}`;
    });
});

function fmtTime(sec) {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function togglePlay(idx) {
    const audio = audioFiles[idx].el;
    const btn = document.getElementById('playBtn' + (idx + 1));

    // Pause all other players
    audioFiles.forEach((af, i) => {
        if (i !== idx && !af.el.paused) {
            af.el.pause();
            resetPlayerUI(i);
        }
    });

    if (audio.paused) {
        audio.play();
        btn.querySelector('.icon-play').classList.add('hidden');
        btn.querySelector('.icon-pause').classList.remove('hidden');
        btn.querySelector('.play-label').classList.add('hidden');
        btn.querySelector('.pause-label').classList.remove('hidden');
        btn.classList.add('playing');
    } else {
        audio.pause();
        btn.querySelector('.icon-play').classList.remove('hidden');
        btn.querySelector('.icon-pause').classList.add('hidden');
        btn.querySelector('.play-label').classList.remove('hidden');
        btn.querySelector('.pause-label').classList.add('hidden');
        btn.classList.remove('playing');
    }
}

// Lyrics Data with Arabic Translations
const lyricsData = [
    // Lord's Prayer (approx 28s)
    [
        { t: 0, text: "The Lord's Prayer", arabic: "الصلاة الربانية" },
        { t: 0.8, text: "Our Father in heaven,", arabic: "أبانا الذي في السماوات" },
        { t: 3.0, text: "hallowed be Your name,", arabic: "ليتقدس اسمك" },
        { t: 4.8, text: "Your kingdom come,", arabic: "ليأتِ ملكوتك" },
        { t: 6.6, text: "Your will be done,", arabic: "لتكن مشيئتك" },
        { t: 8.3, text: "on earth as in heaven.", arabic: "كما في السماء كذلك على الأرض" },
        { t: 10.8, text: "Give us today our daily bread.", arabic: "خبزنا كفافنا أعطنا اليوم" },
        { t: 13.0, text: "Forgive us our sins", arabic: "واغفر لنا ذنوبنا" },
        { t: 14.8, text: "as we forgive those who sin against us.", arabic: "كما نغفر نحن أيضاً للمذنبين إلينا" },
        { t: 17.5, text: "Lead us not into temptation", arabic: "ولا تُدخلنا في تجربة" },
        { t: 19.3, text: "but deliver us from evil.", arabic: "لكن نجنا من الشرير" },
        { t: 21.3, text: "For the kingdom, the power,", arabic: "لأن لك الملك والقوة" },
        { t: 23.5, text: "and the glory are Yours", arabic: "والمجد" },
        { t: 25.0, text: "now and forever.", arabic: "إلى الأبد" },
        { t: 26.2, text: "Amen.", arabic: "آمين" }
    ],
    // The Trinitarian Formula (approx 6s)
    [
        { t: 0, text: "In the name of the Father,", arabic: "باسم الآب" },
        { t: 1.2, text: "the Son,", arabic: "والابن" },
        { t: 2.7, text: "and the Holy Spirit,", arabic: "والروح القدس" },
        { t: 4.2, text: "one God. Amen", arabic: "إله واحد. آمين" }
    ]
];

function updateProgress(idx) {
    const audio = audioFiles[idx].el;
    const pct = (audio.currentTime / audio.duration) * 100;

    document.getElementById('progress' + (idx + 1)).style.width = pct + '%';
    const thumb = document.getElementById('thumb' + (idx + 1));
    if (thumb) thumb.style.left = pct + '%';

    document.getElementById('time' + (idx + 1)).textContent =
        `${fmtTime(audio.currentTime)} / ${fmtTime(audio.duration)}`;

    // Sync Lyrics
    const time = audio.currentTime;
    const lyrics = lyricsData[idx];
    let activeText = "AUDIO";
    let activeArabic = "ترجمة";
    let hasLyric = false;

    for (let i = lyrics.length - 1; i >= 0; i--) {
        if (time >= lyrics[i].t) {
            activeText = lyrics[i].text;
            activeArabic = lyrics[i].arabic || "ترجمة";
            hasLyric = true;
            break;
        }
    }

    const labelEl = document.getElementById('lyrics' + (idx + 1));
    const arabicEl = document.getElementById('arabic' + (idx + 1));
    const artworkEl = labelEl.closest('.audio-artwork');

    // Update English text
    if (activeText !== labelEl.textContent) {
        labelEl.style.animation = 'none';
        labelEl.offsetHeight; // Trigger reflow
        labelEl.style.animation = null;
        labelEl.textContent = activeText;
    }

    // Update Arabic text
    if (activeArabic !== arabicEl.textContent) {
        arabicEl.style.animation = 'none';
        arabicEl.offsetHeight; // Trigger reflow
        arabicEl.style.animation = null;
        arabicEl.textContent = activeArabic;
    }

    if (hasLyric && !audio.paused) {
        artworkEl.classList.add('has-lyrics');
    } else {
        artworkEl.classList.remove('has-lyrics');
        labelEl.textContent = "AUDIO";
        arabicEl.textContent = "ترجمة";
    }
}

function initSeek() {
    window.addEventListener('mousemove', (e) => {
        if (isDragging) handleSeek(e);
    });
    window.addEventListener('mouseup', () => {
        if (isDragging) {
            document.querySelectorAll('.progress-container').forEach(c => c.classList.remove('dragging'));
            isDragging = false;
            dragIdx = -1;
        }
    });
    // Touch support
    window.addEventListener('touchmove', (e) => {
        if (isDragging) {
            handleSeek(e.touches[0]);
            e.preventDefault();
        }
    }, { passive: false });
    window.addEventListener('touchend', () => {
        if (isDragging) {
            document.querySelectorAll('.progress-container').forEach(c => c.classList.remove('dragging'));
            isDragging = false;
            dragIdx = -1;
        }
    });
}

function startSeek(e, idx) {
    isDragging = true;
    dragIdx = idx;
    const container = document.querySelectorAll('.progress-container')[idx];
    if (container) container.classList.add('dragging');
    handleSeek(e.touches ? e.touches[0] : e);
}

function handleSeek(e) {
    if (dragIdx === -1) return;
    const containers = document.querySelectorAll('.progress-container');
    const container = containers[dragIdx];
    if (!container) return;

    const rect = container.getBoundingClientRect();
    let pct = (e.clientX - rect.left) / rect.width;
    pct = Math.max(0, Math.min(1, pct));
    const audio = audioFiles[dragIdx].el;
    if (audio.duration) {
        audio.currentTime = pct * audio.duration;
        updateProgress(dragIdx);
    }
}

function resetPlayer(idx) {
    resetPlayerUI(idx);
    document.getElementById('progress' + (idx + 1)).style.width = '0%';
    document.getElementById('time' + (idx + 1)).textContent =
        `0:00 / ${fmtTime(audioFiles[idx].el.duration)}`;

    // Reset lyrics
    document.getElementById('lyrics' + (idx + 1)).textContent = "AUDIO";
    document.getElementById('arabic' + (idx + 1)).textContent = "ترجمة";
    document.getElementById('lyrics' + (idx + 1)).closest('.audio-artwork').classList.remove('has-lyrics');
}

function resetPlayerUI(idx) {
    const btn = document.getElementById('playBtn' + (idx + 1));
    btn.querySelector('.icon-play').classList.remove('hidden');
    btn.querySelector('.icon-pause').classList.add('hidden');
    btn.querySelector('.play-label').classList.remove('hidden');
    btn.querySelector('.pause-label').classList.add('hidden');
    btn.classList.remove('playing');
}

/* ── Waveform Drawing ───────────────────────────────────────── */
function drawWaveform(canvasId, color1, color2) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const bars = 40;
    const gap = 2;
    const barW = (w - (bars - 1) * gap) / bars;
    const gradient = ctx.createLinearGradient(0, 0, w, 0);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    ctx.fillStyle = gradient;
    for (let i = 0; i < bars; i++) {
        const barH = Math.random() * (h * 0.7) + h * 0.15;
        const x = i * (barW + gap);
        const y = (h - barH) / 2;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, barH, 2);
        ctx.fill();
    }
}

/* ── Tab Switching ──────────────────────────────────────────── */
function switchTab(tab, linkEl, e) {
    if (e) e.preventDefault();

    // Update sidebar active state
    document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
    linkEl.classList.add('active');

    let title = 'Students';
    if (tab === 'content') title = 'Content';
    if (tab === 'attendance') title = 'Attendance';

    // Fallback if navTitle inside breadcrumbs or original title
    const titleEl = document.getElementById('navTitle');
    if (titleEl) titleEl.textContent = title;

    const studentsEls = ['statsGrid', 'tableCard', 'cardsList'];
    const controlsEl = document.querySelector('.controls');
    const smartFiltersEl = document.querySelector('.smart-filters');
    const contentEl = document.getElementById('contentSection');
    const attendanceEl = document.getElementById('attendanceSection');

    // Hide all
    studentsEls.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
    if (controlsEl) controlsEl.classList.add('hidden');
    if (smartFiltersEl) smartFiltersEl.classList.add('hidden');
    contentEl.classList.add('hidden');
    attendanceEl.classList.add('hidden');

    // Pause all audio when switching away
    if (tab !== 'content') {
        audioFiles.forEach((af, i) => {
            af.el.pause();
            resetPlayerUI(i);
        });
    }

    if (tab === 'students') {
        let delay = 0;
        studentsEls.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.classList.remove('hidden');
                el.style.animation = 'none';
                el.offsetHeight; // trigger reflow
                el.style.animation = `slideFadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards ${delay}s`;
                delay += 0.1;
            }
        });
        if (controlsEl) controlsEl.classList.remove('hidden');
        if (smartFiltersEl) smartFiltersEl.classList.remove('hidden');
    } else if (tab === 'content') {
        contentEl.classList.remove('hidden');
        contentEl.style.animation = 'none';
        contentEl.offsetHeight; // trigger reflow
        contentEl.style.animation = `slideFadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards`;
    } else if (tab === 'attendance') {
        attendanceEl.classList.remove('hidden');
        attendanceEl.style.animation = 'none';
        attendanceEl.offsetHeight; // trigger reflow
        attendanceEl.style.animation = `slideFadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards`;
        initAttendanceUI();
    }

    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('show');
}

/* ═══════════════════════════════════════════════════════════════
   GITHUB API & ATTENDANCE LOGIC
   ═══════════════════════════════════════════════════════════════ */
const FILE_PATH = 'data/attendance.json';
const CURRICULUM_PATH = 'data/curriculum.json';

// Dynamic Repository Detection
let REPO = 'Gwargioss/speak-english'; // Default
try {
    if (window.location.hostname.includes('github.io')) {
        const owner = window.location.hostname.split('.')[0];
        const pathParts = window.location.pathname.split('/').filter(p => p);
        if (pathParts.length > 0) {
            REPO = `${owner}/${pathParts[0]}`;
        }
    }
} catch (e) {
    console.warn("Auto-repo detection failed, using fallback.");
}

console.log(`[Persistence] Target Repository: ${REPO}`);

let ghToken = localStorage.getItem('eduTrack_ghToken') || '';
let attendanceRecords = []; // Currently assigned attendance mapped to currentLevel
let fullAttendanceData = {}; // Full JSON object from github
let fullCurriculumData = {}; // Full JSON object from github for curriculum
let curriculumData = {}; // Currently unused, or same logic applies
let fileSha = '';
let curriculumSha = '';

async function loginToGitHub() {
    const input = document.getElementById('ghTokenInput').value.trim();
    const btn = document.getElementById('authBtn');
    const err = document.getElementById('authError');

    if (!input) return;
    btn.disabled = true;
    btn.textContent = 'Authenticating...';
    err.classList.add('hidden');

    try {
        const res = await fetch('https://api.github.com/user', {
            headers: { 'Authorization': `token ${input}` }
        });

        if (res.ok) {
            ghToken = input;
            localStorage.setItem('eduTrack_ghToken', ghToken);
            document.getElementById('attendanceAuth').classList.add('hidden');
            document.getElementById('attendanceDashboard').classList.remove('hidden');
            checkAdminVisibility();
            initAttendanceUI();
            // Refresh current view
            changeLevel(currentLevel);
        } else {
            throw new Error('Invalid token');
        }
    } catch (e) {
        err.classList.remove('hidden');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Authenticate';
    }
}

function logoutGitHub() {
    ghToken = '';
    localStorage.removeItem('eduTrack_ghToken');
    document.getElementById('ghTokenInput').value = '';
    document.getElementById('attendanceAuth').classList.remove('hidden');
    document.getElementById('attendanceDashboard').classList.add('hidden');
    checkAdminVisibility();
    changeLevel(currentLevel); // Hide upload buttons etc
}

async function initAttendanceUI() {
    if (!ghToken) {
        document.getElementById('attendanceAuth').classList.remove('hidden');
        document.getElementById('attendanceDashboard').classList.add('hidden');
        return;
    } else {
        document.getElementById('attendanceAuth').classList.add('hidden');
        document.getElementById('attendanceDashboard').classList.remove('hidden');
    }

    const dtInput = document.getElementById('attendanceDate');
    if (!dtInput.value) {
        dtInput.value = new Date().toISOString().split('T')[0];
    }

    await fetchAttendanceData();
}

async function fetchAttendanceData() {
    const list = document.getElementById('attendanceHistory');
    list.innerHTML = `<div class="sync-msg">Syncing from GitHub...</div>`;

    try {
        const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}?t=${Date.now()}`, {
            cache: 'no-store',
            headers: {
                'Authorization': `token ${ghToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (res.ok) {
            const data = await res.json();
            fileSha = data.sha;
            // Decode base64
            const b64 = data.content.replace(/\s/g, '');
            const decoded = decodeURIComponent(Array.prototype.map.call(atob(b64), (c) => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            let parsed = JSON.parse(decoded);
            if (Array.isArray(parsed)) {
                // Migration: old format was array for Level 3
                fullAttendanceData = { 'Level 3': parsed };
            } else {
                fullAttendanceData = parsed;
            }
            attendanceRecords = fullAttendanceData[currentLevel] || [];
        } else if (res.status === 404) {
            // File doesn't exist yet
            fullAttendanceData = {};
            attendanceRecords = [];
            fileSha = '';
        } else {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.message || `HTTP ${res.status}`);
        }
    } catch (e) {
        console.error(e);
        list.innerHTML = `<div class="error-msg">Error: ${e.message}. Check token permissions.</div>`;
        return;
    }

    renderAttendanceHistory();

    // Automatically load the checkboxes for the currently selected date (if it exists)
    const currentDt = document.getElementById('attendanceDate').value;
    const existingRecord = attendanceRecords.find(r => r.date === currentDt);
    renderAttendanceGrid(existingRecord || null);
}

function renderAttendanceGrid(sessionData = null) {
    const grid = document.getElementById('attendanceGrid');
    grid.innerHTML = students.map((s, i) => {
        const isPresent = sessionData ? sessionData.present.includes(s.name) : false;
        return `
                <label class="attendance-card ${isPresent ? 'present' : ''}" id="attCard_${i}">
                    <div class="attendance-info">
                        <div class="attendance-name">${s.name}</div>
                        <div class="attendance-class">Class ${s.cls}</div>
                    </div>
                    <div class="custom-checkbox">
                        <input type="checkbox" class="hidden-check" id="attCheck_${i}" onchange="toggleAttendanceCard(${i})" ${isPresent ? 'checked' : ''}>
                        <div class="check-circle">
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                        </div>
                    </div>
                </label>
            `;
    }).join('');

    updateLiveSummary();
}

function updateLiveSummary() {
    let presentCount = 0;
    students.forEach((s, idx) => {
        const check = document.getElementById(`attCheck_${idx}`);
        if (check && check.checked) presentCount++;
    });
    const absentCount = students.length - presentCount;
    const elP = document.getElementById('liveAttPresent');
    const elA = document.getElementById('liveAttAbsent');
    if (elP) elP.textContent = presentCount;
    if (elA) elA.textContent = absentCount;
}

function toggleAttendanceCard(idx) {
    const card = document.getElementById(`attCard_${idx}`);
    const check = document.getElementById(`attCheck_${idx}`);
    if (check.checked) card.classList.add('present');
    else card.classList.remove('present');

    updateLiveSummary();
}

function loadSessionData(dateStr) {
    const record = attendanceRecords.find(r => r.date === dateStr);
    if (!record) return;
    document.getElementById('attendanceDate').value = dateStr;
    renderAttendanceGrid(record);
    window.scrollTo({
        top: document.getElementById('attendanceDashboard').offsetTop,
        behavior: 'smooth'
    });
}

async function pushAttendanceData() {
    const dt = document.getElementById('attendanceDate').value;
    if (!dt) return alert("Please select a date first.");

    const presentIds = [];
    students.forEach((s, idx) => {
        if (document.getElementById(`attCheck_${idx}`).checked) presentIds.push(s.name);
    });

    const existingIdx = attendanceRecords.findIndex(r => r.date === dt);
    const record = { date: dt, present: presentIds, total: students.length };

    if (existingIdx >= 0) attendanceRecords[existingIdx] = record;
    else attendanceRecords.push(record);

    attendanceRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

    await syncAttendanceToGitHub(`Update attendance for ${dt}`);
}

async function syncAttendanceToGitHub(commitMessage = 'Update attendance data') {
    // Save to master store
    fullAttendanceData[currentLevel] = attendanceRecords;

    const btn = document.getElementById('saveAttBtn');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<svg class="animate-spin icon-med" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg> Syncing...`;

    try {
        const contentStr = btoa(encodeURIComponent(JSON.stringify(fullAttendanceData, null, 2)).replace(/%([0-9A-F]{2})/g, (match, p1) => {
            return String.fromCharCode('0x' + p1);
        }));

        const body = {
            message: commitMessage,
            content: contentStr,
            branch: 'main'
        };
        if (fileSha) body.sha = fileSha;

        const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${ghToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            let errMsg = errData.message || `Status ${res.status}`;
            if (res.status === 403) errMsg = "Permission Denied. Check if your token has 'repo' scope.";
            if (res.status === 401) errMsg = "Invalid Token. Please logout and login again.";
            throw new Error(errMsg);
        }

        const data = await res.json();
        fileSha = data.content.sha;

        const msg = document.getElementById('attendanceMessage');
        if (msg) {
            msg.textContent = "✓ Saved Successfully!";
            msg.classList.remove('hidden', 'error-text');
            setTimeout(() => msg.classList.add('hidden'), 4000);
        }

        renderAttendanceHistory();
    } catch (e) {
        console.error(e);
        const msg = document.getElementById('attendanceMessage');
        if (msg) {
            msg.textContent = `Error: ${e.message}`;
            msg.classList.remove('hidden');
            msg.style.color = 'var(--danger)'; // Quick inline override for error visibility
        } else {
            alert(`Failed to sync: ${e.message}`);
        }
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

let activeContextDate = null;
let longPressTimer = null;

function renderAttendanceHistory() {
    const list = document.getElementById('attendanceHistory');
    if (!attendanceRecords.length) {
        list.innerHTML = `<div class="no-data-msg">No session records yet</div>`;
        return;
    }

    list.innerHTML = attendanceRecords.map(r => `
                <div class="history-card" 
                     onclick="loadSessionData('${r.date}')" 
                     oncontextmenu="handleSessionContextMenu(event, '${r.date}')"
                     ontouchstart="handleTouchStart(event, '${r.date}')"
                     ontouchend="handleTouchEnd(event)"
                     title="Click to edit, Right-click for options">
                    <div class="history-date">
                        <svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                        </svg>
                        ${r.date}
                    </div>
                    <div class="history-stats">
                        <span class="present-count">${r.present.length} Present</span>
                        <span class="absent-count">${r.total - r.present.length} Absent</span>
                    </div>
                </div>
            `).join('');
}

function showAllResults() {
    const grid = document.getElementById('resultsModalGrid');
    if (!attendanceRecords || !attendanceRecords.length) {
        grid.innerHTML = '<div class="results-empty-msg">No sessions recorded yet.</div>';
    } else {
        const totalSessions = attendanceRecords.length;
        let html = '';
        students.forEach(s => {
            let presentCount = 0;
            attendanceRecords.forEach(r => {
                if (r.present && r.present.includes(s.name)) presentCount++;
            });
            const absentCount = totalSessions - presentCount;

            html += `
                        <div class="result-list-item">
                            <div class="result-name">${s.name}</div>
                            <div class="result-badges">
                                <span class="badge-present"><svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" /></svg> ${presentCount}</span>
                                <span class="badge-absent"><svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg> ${absentCount}</span>
                            </div>
                        </div>
                    `;
        });
        grid.innerHTML = html;
    }

    const modal = document.getElementById('resultsModal');
    modal.classList.remove('hidden');
    setTimeout(() => { modal.classList.add('show'); }, 10);
    modal.onclick = closeResultsModal;
}

function closeResultsModal() {
    const modal = document.getElementById('resultsModal');
    modal.classList.remove('show');
    setTimeout(() => { modal.classList.add('hidden'); }, 300);
}

/* ── Initialize on DOM Load ─────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    init();
    drawWaveform('waveform1', '#6366f1', '#a78bfa');
    drawWaveform('waveform2', '#6366f1', '#a78bfa');
});

async function addNewSession() {
    const dtInput = document.getElementById('attendanceDate');
    const today = new Date().toISOString().split('T')[0];

    // Use input date if changed, otherwise use today
    const selectedDate = dtInput.value || today;

    const existing = attendanceRecords.find(r => r.date === selectedDate);
    if (existing) {
        alert("A session for this date already exists. Loading its data...");
        loadSessionData(selectedDate);
        return;
    }

    // Create new empty record
    const newRecord = {
        date: selectedDate,
        present: [],
        total: students.length
    };

    attendanceRecords.unshift(newRecord);
    attendanceRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

    dtInput.value = selectedDate;
    renderAttendanceGrid(newRecord);
    renderAttendanceHistory();

    // Automatically save this new skeleton to GitHub
    await syncAttendanceToGitHub(`Added new session for ${selectedDate}`);

    // Jump to top of history
    const historyList = document.getElementById('attendanceHistory');
    if (historyList) historyList.scrollTop = 0;
}

/* ── Dark Mode ───────────────────────────────────────────────── */
function toggleDarkMode() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('eduTrack_theme', newTheme);
}

function handleSessionContextMenu(e, date) {
    e.preventDefault();
    showContextMenu(e.clientX, e.clientY, date);
}

function handleTouchStart(e, date) {
    longPressTimer = setTimeout(() => {
        const touch = e.touches[0];
        showContextMenu(touch.clientX, touch.clientY, date);
    }, 600);
}

function handleTouchEnd() {
    clearTimeout(longPressTimer);
}

function showContextMenu(x, y, date) {
    activeContextDate = date;
    const menu = document.getElementById('sessionContextMenu');
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    menu.classList.remove('hidden');

    // Ensure menu stays within viewport
    const menuRect = menu.getBoundingClientRect();
    if (x + menuRect.width > window.innerWidth) menu.style.left = `${window.innerWidth - menuRect.width - 10}px`;
    if (y + menuRect.height > window.innerHeight) menu.style.top = `${window.innerHeight - menuRect.height - 10}px`;

    document.addEventListener('click', closeContextMenu);
}

function closeContextMenu() {
    const menu = document.getElementById('sessionContextMenu');
    menu.classList.add('hidden');
    document.removeEventListener('click', closeContextMenu);
}

async function deleteCurrentSession() {
    if (!activeContextDate) return;
    if (confirm(`Are you sure you want to delete the session for ${activeContextDate}?`)) {
        attendanceRecords = attendanceRecords.filter(r => r.date !== activeContextDate);

        if (document.getElementById('attendanceDate').value === activeContextDate) {
            renderAttendanceGrid(null);
        }

        await syncAttendanceToGitHub(`Deleted session for ${activeContextDate}`);
    }
}

async function clearCurrentSessionData() {
    if (!activeContextDate) return;
    if (confirm(`Clear all attendance data for ${activeContextDate}?`)) {
        const record = attendanceRecords.find(r => r.date === activeContextDate);
        if (record) {
            record.present = [];
            if (document.getElementById('attendanceDate').value === activeContextDate) {
                renderAttendanceGrid(record);
            }
            await syncAttendanceToGitHub(`Cleared attendance data for ${activeContextDate}`);
        }
    }
}

function initTheme() {
    const saved = localStorage.getItem('eduTrack_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
}

// Run immediately (before DOM loads) to avoid flash
initTheme();

/* ═══════════════════════════════════════════════════════════════════
   📚 COURSE CURRICULUM — Accordion & File Upload
   ═══════════════════════════════════════════════════════════════════ */

function toggleUnit(unitNum) {
    const block = document.querySelector(`.unit-block[data-unit="${unitNum}"]`);
    if (!block) return;

    const wasOpen = block.classList.contains('open');

    // Close all
    document.querySelectorAll('.unit-block').forEach(b => b.classList.remove('open'));

    // Toggle clicked
    if (!wasOpen) {
        block.classList.add('open');
    }
}

// File upload storage
const uploadedFiles = {};

function handleFileUpload(input, lessonId) {
    const files = input.files;
    if (!files.length) return;

    if (!uploadedFiles[lessonId]) uploadedFiles[lessonId] = [];

    const container = document.getElementById(`files-${lessonId}`);

    for (const file of files) {
        const fileObj = {
            name: file.name,
            size: file.size,
            type: file.type,
            url: URL.createObjectURL(file)
        };
        uploadedFiles[lessonId].push(fileObj);

        const item = createFileItem(fileObj, lessonId, uploadedFiles[lessonId].length - 1);
        container.appendChild(item);
    }

    updateFileCount(lessonId);
    input.value = ''; // Reset for re-upload
}

function createFileItem(fileObj, lessonId, index) {
    const div = document.createElement('div');
    div.className = 'file-item';
    div.id = `file-${lessonId}-${index}`;

    const typeInfo = getFileTypeInfo(fileObj.type, fileObj.name);
    const sizeStr = formatFileSize(fileObj.size);

    div.innerHTML = `
        <div class="file-item-icon ${typeInfo.cls}">${typeInfo.icon}</div>
        <div class="file-item-info">
            <div class="file-item-name" title="${fileObj.name}">${fileObj.name}</div>
            <div class="file-item-size">${sizeStr}</div>
        </div>
        <div class="file-item-actions">
            <a href="${fileObj.url}" download="${fileObj.name}" title="Download">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="var(--primary-500)"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg>
            </a>
            <button onclick="removeFile('${lessonId}', ${index})" title="Remove">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="#ef4444"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
            </button>
        </div>
    `;

    return div;
}

function removeFile(lessonId, index) {
    const el = document.getElementById(`file-${lessonId}-${index}`);
    if (el) {
        el.style.transform = 'scale(0.8)';
        el.style.opacity = '0';
        setTimeout(() => {
            el.remove();
            if (uploadedFiles[lessonId] && uploadedFiles[lessonId][index]) {
                URL.revokeObjectURL(uploadedFiles[lessonId][index].url);
                uploadedFiles[lessonId][index] = null;
            }
            updateFileCount(lessonId);
        }, 200);
    }
}

function updateFileCount(lessonId) {
    const el = document.getElementById(`fileCount-${lessonId}`);
    if (!el) return;

    const files = uploadedFiles[lessonId] ? uploadedFiles[lessonId].filter(f => f !== null) : [];
    el.textContent = files.length ? `${files.length} file${files.length > 1 ? 's' : ''}` : 'No files yet';
    el.style.color = files.length ? 'var(--primary-500)' : '';
}

function getFileTypeInfo(mimeType, name) {
    const ext = name.split('.').pop().toLowerCase();

    if (mimeType.startsWith('image/')) return { icon: '🖼️', cls: 'img' };
    if (mimeType.startsWith('video/')) return { icon: '🎬', cls: 'video' };
    if (mimeType.startsWith('audio/')) return { icon: '🎵', cls: 'audio' };
    if (mimeType === 'application/pdf' || ext === 'pdf') return { icon: '📄', cls: 'pdf' };
    if (['doc', 'docx', 'pptx', 'ppt', 'xlsx', 'xls'].includes(ext)) return { icon: '📑', cls: 'doc' };
    return { icon: '📎', cls: 'other' };
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
}

async function fetchCurriculumData() {
    try {
        const headers = ghToken ? { 'Authorization': `token ${ghToken}` } : {};
        const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${CURRICULUM_PATH}?t=${Date.now()}`, {
            cache: 'no-store',
            headers: headers
        });

        if (res.status === 404) {
            // File doesn't exist yet, that's fine
            curriculumData = {};
            curriculumSha = '';
            return;
        }

        if (res.ok) {
            const data = await res.json();
            curriculumSha = data.sha;
            const b64 = data.content.replace(/\s/g, '');
            const decoded = decodeURIComponent(Array.prototype.map.call(atob(b64), (c) => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            let parsed = JSON.parse(decoded);
            if (parsed && typeof parsed === 'object' && !('Level 3' in parsed) && Object.keys(parsed).some(k => !k.startsWith('Level '))) {
                // Migration: old format
                fullCurriculumData = { 'Level 3': parsed };
            } else {
                fullCurriculumData = parsed || {};
            }
            curriculumData = fullCurriculumData[currentLevel] || {};
            applyCurriculumData();
        }
    } catch (e) {
        console.warn("Curriculum fetch failed:", e);
    }
}

function applyCurriculumData() {
    for (const [id, value] of Object.entries(curriculumData)) {
        if (id.includes('-quiz')) {
            transformQuizUI(id, value);
        } else {
            transformLessonUI(id, value);
        }
    }
}

function transformLessonUI(lessonId, id) {
    const card = document.querySelector(`.lesson-card[data-lesson="${lessonId}"]`);
    if (!card) return;

    if (card.querySelector('.lesson-actions-beast')) return;

    const watchLink = `https://drive.google.com/file/d/${id}/view`;
    const downloadLink = `https://drive.google.com/uc?id=${id}&export=download`;

    const infoSpan = card.querySelector('.lesson-file-count');
    if (infoSpan) {
        infoSpan.textContent = "Video Available";
        infoSpan.classList.add('video-available');
    }

    const uploadBtn = card.querySelector('.upload-btn');
    if (uploadBtn) uploadBtn.remove();

    // Check for any legacy file inputs
    const fileInput = card.querySelector('.file-input-hidden');
    if (fileInput) fileInput.remove();

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'lesson-actions-beast';
    actionsDiv.innerHTML = `
        <a href="${watchLink}" target="_blank" rel="noopener noreferrer" class="action-btn-p watch">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="icon-sm">
                <path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clip-rule="evenodd" />
            </svg>
            <span>Watch</span>
        </a>
        <a href="${downloadLink}" target="_blank" rel="noopener noreferrer" class="action-btn-p download">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="icon-sm">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span>Download</span>
        </a>
    `;
    card.appendChild(actionsDiv);
}

async function syncCurriculumToGitHub(commitMessage = 'Update curriculum data') {
    if (!ghToken) return;

    fullCurriculumData[currentLevel] = curriculumData;

    try {
        const contentStr = btoa(encodeURIComponent(JSON.stringify(fullCurriculumData, null, 2)).replace(/%([0-9A-F]{2})/g, (match, p1) => {
            return String.fromCharCode('0x' + p1);
        }));

        const body = {
            message: commitMessage,
            content: contentStr,
            branch: 'main'
        };
        if (curriculumSha) body.sha = curriculumSha;

        const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${CURRICULUM_PATH}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${ghToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.message || `Status ${res.status}`);
        }

        const data = await res.json();
        curriculumSha = data.content.sha;
    } catch (e) {
        console.error("Curriculum sync failed:", e);
        alert(`Curriculum Sync Error: ${e.message}`);
    }
}

function promptVideoLink(lessonId) {
    if (!ghToken) return alert("You must be logged in with a GitHub token to add video links.");

    const link = prompt("Enter Google Drive Video Link:");
    if (!link) return;

    const idMatch = link.match(/\/d\/([-\w]{25,})/) || link.match(/id=([-\w]{25,})/);
    if (!idMatch) return alert("Invalid Google Drive link format.");

    const id = idMatch[1];
    curriculumData[lessonId] = id;

    // Optimistic UI update
    transformLessonUI(lessonId, id);

    // Sync to GitHub
    syncCurriculumToGitHub(`Link video for lesson ${lessonId}`);
}

function promptQuizLink(lessonId) {
    if (!ghToken) return alert("You must be logged in with a GitHub token to add quiz links.");

    const link = prompt("Enter Quiz Link (Google Form, etc.):");
    if (!link) return;

    curriculumData[lessonId] = link;

    // Optimistic UI update
    transformQuizUI(lessonId, link);

    // Sync to GitHub
    syncCurriculumToGitHub(`Link quiz for ${lessonId}`);
}

function transformQuizUI(lessonId, url) {
    const card = document.querySelector(`.lesson-card[data-lesson="${lessonId}"]`);
    if (!card) return;

    const infoSpan = card.querySelector('.lesson-file-count');
    if (infoSpan) {
        infoSpan.textContent = "Quiz Ready";
        infoSpan.classList.add('video-available');
    }

    const uploadBtn = card.querySelector('.upload-btn');
    if (uploadBtn) uploadBtn.remove();

    if (card.querySelector('.lesson-actions-beast')) return;

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'lesson-actions-beast';
    actionsDiv.innerHTML = `
        <a href="${url}" target="_blank" rel="noopener noreferrer" class="action-btn-p download">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="icon-sm">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            <span>Open Quiz</span>
        </a>
    `;
    card.appendChild(actionsDiv);
}

/* ── Custom Modern Calendar Logic ──────────────────────────────── */
let currentViewDate = new Date();

function initCalendar() {
    const dtInput = document.getElementById('attendanceDate');
    const wrapper = document.querySelector('.date-trigger-wrapper');
    if (!dtInput || !wrapper) return;

    // Trigger calendar only via the wrapper to avoid double-toggle
    wrapper.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleCalendar();
    });

    dtInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            toggleCalendar();
        }
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
        const modal = document.getElementById('customCalendar');
        const trigger = document.querySelector('.date-trigger-wrapper');
        if (modal && !modal.classList.contains('hidden')) {
            if (!trigger.contains(e.target)) {
                modal.classList.add('hidden');
            }
        }
    });

    // Prevent closing when clicking inside the calendar itself
    const modal = document.getElementById('customCalendar');
    if (modal) {
        modal.addEventListener('mousedown', (e) => e.stopPropagation());
        modal.addEventListener('click', (e) => e.stopPropagation());
    }

    renderCalendar();
}

function toggleCalendar() {
    const modal = document.getElementById('customCalendar');
    if (modal.classList.contains('hidden')) {
        const dtInput = document.getElementById('attendanceDate');
        if (dtInput.value) {
            // Split to avoid timezone shifts from new Date(str)
            const parts = dtInput.value.split('-');
            currentViewDate = new Date(parts[0], parts[1] - 1, parts[2]);
        } else {
            currentViewDate = new Date();
        }
        renderCalendar();
        modal.classList.remove('hidden');
    } else {
        modal.classList.add('hidden');
    }
}

function renderCalendar() {
    const monthYearEl = document.getElementById('calendarMonthYear');
    const daysContainer = document.getElementById('calendarDays');
    if (!monthYearEl || !daysContainer) return;

    const year = currentViewDate.getFullYear();
    const month = currentViewDate.getMonth();

    monthYearEl.textContent = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentViewDate);

    daysContainer.innerHTML = '';

    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        daysContainer.appendChild(emptyDay);
    }

    const today = new Date();
    const selectedVal = document.getElementById('attendanceDate').value;

    for (let d = 1; d <= totalDays; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const isToday = today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;
        const isSelected = selectedVal === dateStr;

        const dayEl = document.createElement('div');
        dayEl.className = `calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`;
        dayEl.textContent = d;
        dayEl.onclick = (e) => {
            e.stopPropagation();
            selectCalendarDate(dateStr);
        };
        daysContainer.appendChild(dayEl);
    }
}

function changeMonth(dir) {
    currentViewDate.setMonth(currentViewDate.getMonth() + dir);
    renderCalendar();
}

function selectCalendarDate(dateStr) {
    const dtInput = document.getElementById('attendanceDate');
    dtInput.value = dateStr;
    document.getElementById('customCalendar').classList.add('hidden');
    fetchAttendanceData();
}

/* ── GitHub Data Sync (Levels/Students) ───────────────────────── */
async function fetchLevelsData() {
    try {
        // 1. Try GitHub first if token exists
        if (ghToken) {
            const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${LEVELS_DATA_PATH}?t=${Date.now()}`, {
                cache: 'no-store',
                headers: { 'Authorization': `token ${ghToken}` }
            });

            if (res.ok) {
                const data = await res.json();
                levelsSha = data.sha;
                const b64 = data.content.replace(/\s/g, '');
                const decoded = decodeURIComponent(Array.prototype.map.call(atob(b64), (c) => {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));

                levelsData = JSON.parse(decoded);
                students = levelsData[currentLevel] || [];
                return; // Success
            }
        }

        // 2. Fallback to local file or public GitHub fetch
        const localRes = await fetch(`${LEVELS_DATA_PATH}?t=${Date.now()}`).catch(() => null);
        if (localRes && localRes.ok) {
            levelsData = await localRes.json();
            students = levelsData[currentLevel] || [];
        } else {
            // 3. Last resort: Initial skeleton
            if (Object.keys(levelsData).length === 0) {
                levelsData = {
                    'Level 1': [], 'Level 2': [], 'Level 3': [
                        { name: " سامح", score: 43, cls: 4, guardian: "", phone: "201061666259" },
                        { name: "ابانوب كريم", score: 41, cls: 5, guardian: "", phone: "201270138311" },
                        { name: "مارتن سمير", score: 0, cls: 0, guardian: "", phone: "201220571549" },
                        { name: "فادي عماد", score: 0, cls: 0, guardian: "", phone: "201229090239" },
                        { name: "رويس مجدي", score: 0, cls: 0, guardian: "", phone: "201288328216" },
                        { name: "جورجينا ميشيل", score: 42, cls: 5, guardian: "", phone: "201201292873" },
                        { name: "مارفل مجدي", score: 39, cls: 3, guardian: "", phone: "201288803191" },
                        { name: "آن عوض", score: 37, cls: 3, guardian: "", phone: "" },
                        { name: "بتول ادوارد", score: 41, cls: 2, guardian: "", phone: "201226313147" },
                        { name: "جاسيكا عماد", score: 36, cls: 1, guardian: "", phone: "" },
                        { name: "ماري شحات", score: 46, cls: 6, guardian: "", phone: "201288412742" },
                        { name: "جومانا حليم", score: 36, cls: 2, guardian: "", phone: "201279396808" },
                        { name: "ميرولا ناصر", score: 0, cls: 0, guardian: "", phone: "20109265753" },
                        { name: "ايريني سلامه", score: 0, cls: 0, guardian: "", phone: "201271736600" },
                        { name: "جيسيكا", score: 0, cls: 0, guardian: "", phone: "201271185009" },
                        { name: "مادونا روماني", score: 0, cls: 0, guardian: "", phone: "201227477546" },
                    ], 'Level 4': [], 'Level 5': [], 'Level 6': [], 'Level 7': []
                };
                students = levelsData[currentLevel] || [];
            }
        }
        // Cache the latest fetched data to localStorage
        localStorage.setItem('eduTrack_levelsData', JSON.stringify(levelsData));
    } catch (e) {
        console.error("Levels fetch failed:", e);
    }
}

async function syncLevelsToGitHub(msg = 'Update students data') {
    // Persist to local storage immediately
    localStorage.setItem('eduTrack_levelsData', JSON.stringify(levelsData));

    if (!ghToken) return;

    try {
        const contentStr = btoa(encodeURIComponent(JSON.stringify(levelsData, null, 2)).replace(/%([0-9A-F]{2})/g, (match, p1) => {
            return String.fromCharCode('0x' + p1);
        }));

        const body = { message: msg, content: contentStr, branch: 'main' };
        if (levelsSha) body.sha = levelsSha;

        const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${LEVELS_DATA_PATH}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${ghToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (res.ok) {
            const data = await res.json();
            levelsSha = data.content.sha;
        }
    } catch (e) {
        console.error("Levels sync failed:", e);
    }
}

/* ── Student Management Logic ────────────────────────────────── */
function checkAdminVisibility() {
    const isAdmin = !!ghToken;
    document.querySelectorAll('.admin-only').forEach(el => {
        if (isAdmin) el.classList.remove('hidden');
        else el.classList.add('hidden');
    });
}

function openAddStudentModal() {
    document.getElementById('modalTitle').textContent = 'Add New Student';
    document.getElementById('studentForm').reset();
    document.getElementById('editStudentIndex').value = '';
    document.getElementById('studentModal').classList.remove('hidden');
}

function openEditStudentModal(index) {
    const s = students[index];
    if (!s) return;
    document.getElementById('modalTitle').textContent = 'Edit Student';
    document.getElementById('editStudentIndex').value = index;
    document.getElementById('stdName').value = s.name;
    document.getElementById('stdScore').value = s.score;
    document.getElementById('stdClass').value = s.cls;
    document.getElementById('stdGuardian').value = s.guardian || '';
    document.getElementById('stdPhone').value = (s.phone || '').replace('+', '');
    document.getElementById('studentModal').classList.remove('hidden');
}

function closeStudentModal() {
    document.getElementById('studentModal').classList.add('hidden');
}

async function handleStudentSubmit(e) {
    e.preventDefault();
    const index = document.getElementById('editStudentIndex').value;
    const name = document.getElementById('stdName').value;
    const score = parseInt(document.getElementById('stdScore').value);
    const cls = parseInt(document.getElementById('stdClass').value);
    const guardian = document.getElementById('stdGuardian').value;
    let phone = document.getElementById('stdPhone').value.trim();

    const studentObj = { name, score, cls, guardian, phone };

    if (!levelsData[currentLevel]) levelsData[currentLevel] = [];

    if (index === '') {
        // Add
        levelsData[currentLevel].push(studentObj);
    } else {
        // Edit
        levelsData[currentLevel][index] = studentObj;
    }

    students = levelsData[currentLevel];
    closeStudentModal();
    applyFilters();
    updateStats();
    await syncLevelsToGitHub(`Update student: ${name}`);
}

async function deleteStudent(index) {
    if (!confirm('Are you sure you want to delete this student?')) return;
    const name = students[index].name;
    levelsData[currentLevel].splice(index, 1);
    students = levelsData[currentLevel];
    applyFilters();
    updateStats();
    await syncLevelsToGitHub(`Deleted student: ${name}`);
}

// Intercept init to setup calendar
const originalInitAttendanceUI = initAttendanceUI;
initAttendanceUI = async function () {
    await originalInitAttendanceUI();
    initCalendar();
};

// Start the App
document.addEventListener('DOMContentLoaded', init);
const levelTeachers = {
    "Level 1": ["->", "->", "->"],
    "Level 2": ["->", "->", "->"],
    "Level 3": ["Mr: Fady Wael", "Ms: Evan Nabil", "Ms: Nesma Saad"],
    "Level 4": ["->", "->", "->"],
    "Level 5": ["->", "->", "->"],
    "Level 6": ["->", "->", "->"],
    "Level 7": ["->", "->", "->"],
    "Level 8": ["->", "->", "->"],
};

function updateTeachers() {
    const t1 = document.getElementById('teacher1');
    const t2 = document.getElementById('teacher2');
    const t3 = document.getElementById('teacher3');

    if (t1 && t2 && t3) {
        const teachers = levelTeachers[currentLevel] || ["->", "->", "->"];
        t1.textContent = teachers[0];
        t2.textContent = teachers[1];
        t3.textContent = teachers[2];
    }
}
