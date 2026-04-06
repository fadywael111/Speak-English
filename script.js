/* ═══════════════════════════════════════════════════════════════
   EDUTRACK — Student Results Dashboard
   Core JavaScript Logic
   ═══════════════════════════════════════════════════════════════ */

/* ── Student Data ────────────────────────────────────────────── */
const students = [
    { name: "ابانوب سامح", score: 43, cls: 4, guardian: "", phone: "201061666259" },
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
    { name:  "مادونا روماني", score: 0, cls: 0, guatdian: "", phone: "201227477546" },
];

/* ── Helpers ─────────────────────────────────────────────────── */
const WA_ICON = `<svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>`;

function scoreLevel(s) {
    return s >= 75 ? 'high' : s >= 60 ? 'mid' : 'low';
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
    classes.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = 'Class ' + c;
        sel.appendChild(opt);
    });
}

/* ── Render Table ────────────────────────────────────────────── */
function renderTable(data) {
    const tbody = document.getElementById('tBody');
    const empty = document.getElementById('emptyState');
    const skel = document.getElementById('skeleton');
    skel.classList.add('hidden');

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
            <td>${s.guardian || '<span class="no-data">—</span>'}</td>
            <td>${waButton(s.phone)}</td>
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
                <span class="student-name">${s.name}</span>
                <span class="score-badge ${scoreLevel(s.score)}">${s.score}</span>
            </div>
            <div class="card-grid">
                <div class="card-field"><label>Class</label><span class="class-badge">${s.cls}</span></div>
                <div class="card-field"><label>Guardian</label><span>${s.guardian || '<span class="no-data">—</span>'}</span></div>
            </div>
            <div class="card-actions">${waButton(s.phone)}</div>`;
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
        return matchName && matchClass;
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
    // Show skeleton briefly then render
    setTimeout(() => {
        updateStats();
        initClassFilter();
        // Default sort: score desc
        document.getElementById('th-score').classList.add('desc');
        applySort();
        render();
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

function seekAudio(e, idx) {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audioFiles[idx].el.currentTime = pct * audioFiles[idx].el.duration;
    updateProgress(idx); // immediately update lyrics/progress
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
    e.preventDefault();

    // Update sidebar active state
    document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
    linkEl.classList.add('active');

    let title = 'Students';
    if (tab === 'content') title = 'Content';
    if (tab === 'attendance') title = 'Attendance';
    document.getElementById('navTitle').textContent = title;

    const studentsEls = ['statsGrid', 'tableCard', 'cardsList'];
    const controlsEl = document.querySelector('.controls');
    const contentEl = document.getElementById('contentSection');
    const attendanceEl = document.getElementById('attendanceSection');

    // Hide all
    studentsEls.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
    if (controlsEl) controlsEl.classList.add('hidden');
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
        studentsEls.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.remove('hidden');
        });
        if (controlsEl) controlsEl.classList.remove('hidden');
    } else if (tab === 'content') {
        contentEl.classList.remove('hidden');
    } else if (tab === 'attendance') {
        attendanceEl.classList.remove('hidden');
        initAttendanceUI();
    }

    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('show');
}

/* ═══════════════════════════════════════════════════════════════
   GITHUB API & ATTENDANCE LOGIC
   ═══════════════════════════════════════════════════════════════ */
const REPO = 'Gwargioss/speak-english';
const FILE_PATH = 'data/attendance.json';
let ghToken = localStorage.getItem('eduTrack_ghToken') || '';
let attendanceRecords = [];
let fileSha = '';

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
            initAttendanceUI();
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
    list.innerHTML = `<div style="padding:20px; text-align:center; color:var(--gray-500);">Syncing from GitHub...</div>`;
    renderAttendanceGrid();

    try {
        const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
            headers: {
                'Authorization': `token ${ghToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (res.ok) {
            const data = await res.json();
            fileSha = data.sha;
            // Decode base64 - FIXED: Using proper encoding/decoding
            const decoded = decodeURIComponent(Array.prototype.map.call(atob(data.content), (c) => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            attendanceRecords = JSON.parse(decoded);
        } else if (res.status === 404) {
            // File doesn't exist yet
            attendanceRecords = [];
            fileSha = '';
        } else {
            throw new Error('Failed to fetch API');
        }
    } catch (e) {
        console.error(e);
        list.innerHTML = `<div style="padding:20px; text-align:center; color:var(--danger);">Error fetching data. Check token permissions.</div>`;
        return;
    }

    renderAttendanceHistory();
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
}

function toggleAttendanceCard(idx) {
    const card = document.getElementById(`attCard_${idx}`);
    const check = document.getElementById(`attCheck_${idx}`);
    if (check.checked) card.classList.add('present');
    else card.classList.remove('present');
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

    const btn = document.getElementById('saveAttBtn');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<svg class="animate-spin" viewBox="0 0 24 24" fill="none" width="20" height="20" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg> Syncing...`;

    const presentIds = [];
    students.forEach((s, idx) => {
        if (document.getElementById(`attCheck_${idx}`).checked) presentIds.push(s.name);
    });

    const existingIdx = attendanceRecords.findIndex(r => r.date === dt);
    const record = { date: dt, present: presentIds, total: students.length };

    if (existingIdx >= 0) attendanceRecords[existingIdx] = record;
    else attendanceRecords.push(record);

    attendanceRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

    try {
        // FIXED: Using proper base64 encoding for UTF-8
        const contentStr = btoa(encodeURIComponent(JSON.stringify(attendanceRecords, null, 2)).replace(/%([0-9A-F]{2})/g, (match, p1) => {
            return String.fromCharCode('0x' + p1);
        }));

        const body = {
            message: `Update attendance for ${dt}`,
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

        if (!res.ok) throw new Error('Push failed');

        const data = await res.json();
        fileSha = data.content.sha; // Update sha for future writes

        const msg = document.getElementById('attendanceMessage');
        msg.classList.remove('hidden');
        setTimeout(() => msg.classList.add('hidden'), 3000);

        renderAttendanceHistory();
    } catch (e) {
        console.error(e);
        alert("Failed to save to GitHub. Check your connection and token permissions.");
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

function renderAttendanceHistory() {
    const list = document.getElementById('attendanceHistory');
    if (!attendanceRecords.length) {
        list.innerHTML = `<div class="no-data" style="text-align:center;padding:20px;color:var(--gray-500);">No session records yet</div>`;
        return;
    }

    list.innerHTML = attendanceRecords.map(r => `
                <div class="history-card" onclick="loadSessionData('${r.date}')" title="Click to edit session">
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
        grid.innerHTML = '<div style="padding:20px; text-align:center; color:var(--gray-500); grid-column: 1/-1;">No sessions recorded yet.</div>';
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

/* ── Dark Mode ───────────────────────────────────────────────── */
function toggleDarkMode() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('eduTrack_theme', newTheme);
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
