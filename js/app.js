'use strict';

/* ============================================================
 * Utilitas
 * ============================================================ */
const STORE_KEY = 'englishQuest.v1';
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shuffle = arr => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const sample = (arr, n) => shuffle(arr).slice(0, n);
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const pad = n => String(n).padStart(2, '0');
const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const fmtNum = n => n.toLocaleString('id-ID');
const fmtDuration = secs => {
  const m = Math.floor(secs / 60), h = Math.floor(m / 60);
  if (h) return `${h}j ${m % 60}m`;
  if (m) return `${m}m ${secs % 60}d`;
  return `${secs}d`;
};

const UNITS = {};
LEVELS.forEach(level => level.units.forEach((unit, index) => { UNITS[unit.id] = { unit, level, index }; }));
const TOTAL_VOCAB = LEVELS.reduce((n, l) => n + l.units.reduce((m, u) => m + (u.vocab || []).length, 0), 0);

/* ============================================================
 * State (disimpan di localStorage)
 * ============================================================ */
const makeDefault = () => ({
  v: 1, onboarded: false, name: '', avatar: '🦊', theme: 'system', dailyGoal: 50,
  sound: true, autoplay: true, rate: 0.9,
  totalXp: 0, bestStreak: 0, bestCombo: 0, lastLevel: 'tk',
  units: {},     // unitId → { stars, plays, best }
  history: {},   // 'YYYY-MM-DD' → { xp, lessons, correct, wrong, secs, goalMet, challenge }
  words: {},     // kunci kosakata yang sudah dikuasai
  mistakes: {},  // kunci soal → jumlah salah
  badges: {},    // badgeId → tanggal didapat
});

function loadState() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    return raw && typeof raw === 'object' ? { ...makeDefault(), ...raw } : makeDefault();
  } catch (e) {
    return makeDefault();
  }
}
let S = loadState();
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) { /* mode privat: abaikan */ }
}

const emptyDay = () => ({ xp: 0, lessons: 0, correct: 0, wrong: 0, secs: 0 });
const dayStat = (k = dayKey()) => S.history[k] || emptyDay();
const todayW = () => (S.history[dayKey()] ||= emptyDay());
const isActive = k => (S.history[k]?.lessons || 0) > 0;

function currentStreak() {
  let d = new Date(), n = 0;
  if (!isActive(dayKey(d))) d = addDays(d, -1); // hari ini belum belajar → streak masih hidup dari kemarin
  while (isActive(dayKey(d))) { n++; d = addDays(d, -1); }
  return n;
}
const stars = id => S.units[id]?.stars || 0;
const isUnlocked = id => {
  const { level, index } = UNITS[id];
  return index === 0 || stars(level.units[index - 1].id) > 0;
};
function levelProgress(level) {
  const done = level.units.filter(u => stars(u.id) > 0).length;
  const st = level.units.reduce((n, u) => n + stars(u.id), 0);
  return { done, total: level.units.length, stars: st, maxStars: level.units.length * 3 };
}
function nextUnit(level) {
  return level.units.find(u => isUnlocked(u.id) && !stars(u.id))
    || level.units.find(u => stars(u.id) < 3)
    || level.units[level.units.length - 1];
}
const totals = () => Object.values(S.history).reduce((t, d) => ({
  lessons: t.lessons + d.lessons, correct: t.correct + d.correct, wrong: t.wrong + d.wrong, secs: t.secs + d.secs,
}), { lessons: 0, correct: 0, wrong: 0, secs: 0 });

/* ============================================================
 * Suara & ucapan (Web Audio + Speech Synthesis)
 * ============================================================ */
let actx = null;
function tone(freqs, dur = 0.12, type = 'sine', gap = 0.09, vol = 0.15) {
  if (!S.sound) return;
  try {
    actx ||= new (window.AudioContext || window.webkitAudioContext)();
    const t0 = actx.currentTime;
    freqs.forEach((f, i) => {
      const o = actx.createOscillator(), g = actx.createGain(), t = t0 + i * gap;
      o.type = type; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(actx.destination);
      o.start(t); o.stop(t + dur + 0.02);
    });
  } catch (e) { /* audio tidak tersedia */ }
}
const sfx = {
  ok: () => tone([660, 880]),
  bad: () => tone([220, 170], 0.2, 'square', 0.12, 0.05),
  tap: () => tone([520], 0.05, 'sine', 0, 0.05),
  win: () => tone([523, 659, 784, 1047], 0.2, 'triangle', 0.11),
};

const canSpeak = 'speechSynthesis' in window;
let enVoice = null;
function pickVoice() {
  const vs = speechSynthesis.getVoices();
  enVoice = vs.find(v => /en[-_]US/i.test(v.lang) && /Samantha|Google|Natural|Aria|Jenny/i.test(v.name))
    || vs.find(v => /en[-_](US|GB)/i.test(v.lang)) || vs.find(v => /^en/i.test(v.lang)) || null;
}
if (canSpeak) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
function speak(text, slow = false) {
  if (!canSpeak || !text) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  if (enVoice) u.voice = enVoice;
  u.rate = slow ? Math.max(0.45, S.rate - 0.35) : S.rate;
  speechSynthesis.speak(u);
}

/* ============================================================
 * Tema
 * ============================================================ */
const darkMQ = matchMedia('(prefers-color-scheme: dark)');
const isDark = () => S.theme === 'dark' || (S.theme === 'system' && darkMQ.matches);
function applyTheme() {
  const r = document.documentElement;
  if (S.theme === 'system') delete r.dataset.theme; else r.dataset.theme = S.theme;
  $('#theme-btn').textContent = isDark() ? '☀️' : '🌙';
  $('meta[name="theme-color"]').content = isDark() ? '#0e1120' : '#6c5ce7';
}
darkMQ.addEventListener('change', applyTheme);
$('#theme-btn').addEventListener('click', () => {
  S.theme = isDark() ? 'light' : 'dark';
  save(); applyTheme();
  if (location.hash === '#/settings') renderSettings();
});

/* ============================================================
 * Pembuat soal
 * ============================================================ */
function vocabQ(item, mode, pool, unitId, level) {
  const [emoji, en, id] = item;
  const key = `v:${unitId}:${en}`;
  const d = sample(pool.filter(v => v[1] !== en), 3);
  switch (mode) {
    case 'pic':
      return { t: 'pic', key, emoji, a: en, o: shuffle([en, ...d.map(v => v[1])]), id, say: en };
    case 'listen': {
      if (!canSpeak) return vocabQ(item, level.id === 'tk' || level.id === 'sd' ? 'pic' : 'en2id', pool, unitId, level);
      const kids = level.id === 'tk';
      return {
        t: 'listen', key, say: en, reveal: `${emoji} ${en}`,
        a: kids ? emoji : en, emojiOpts: kids,
        o: shuffle(kids ? [emoji, ...d.map(v => v[0])] : [en, ...d.map(v => v[1])]),
      };
    }
    case 'spell':
      if (!/^[a-z]{2,8}$/.test(en)) return vocabQ(item, 'pic', pool, unitId, level);
      return { t: 'spell', key, emoji, a: en, id, say: en };
    case 'en2id':
      return { t: 'mc', key, kind: 'Arti kata', q: `Apa arti "${en}"?`, emoji, sayPrompt: en, say: en, a: id, o: shuffle([id, ...d.map(v => v[2])]) };
    case 'id2en':
    default:
      return { t: 'mc', key, kind: 'Terjemahkan', q: `Bahasa Inggris dari "${id}" adalah…`, a: en, say: en, o: shuffle([en, ...d.map(v => v[1])]) };
  }
}
function orderQ(unitId, i) {
  const [en, id] = UNITS[unitId].unit.sentences[i];
  return { t: 'order', key: `s:${unitId}:${i}`, en, id, say: en };
}
function matchQ(unitId, items, level) {
  const kids = level.id === 'tk';
  return { t: 'match', key: `m:${unitId}`, pairs: items.map(v => kids ? [v[0], v[1]] : [v[1], v[2]]), kids };
}
function explicitQ(unitId, i) {
  const q = UNITS[unitId].unit.qs[i];
  // Setelah benar, bacakan kalimat lengkapnya (bagian setelah "→", tanpa petunjuk dalam kurung).
  let say = null;
  if (q.t === 'fill') {
    const part = q.q.split('→').pop().split(' (')[0];
    if (part.includes('___')) say = part.replace('___', q.a).trim();
  } else if (q.t === 'dialog') {
    say = q.a;
  }
  return { ...q, o: shuffle(q.o), key: `q:${unitId}:${i}`, say };
}

function buildLesson(unitId, n = 10) {
  const { unit, level } = UNITS[unitId];
  const vocab = unit.vocab || [];
  const qs = (unit.qs || []).map((_, i) => explicitQ(unitId, i));
  const sents = (unit.sentences || []).map((_, i) => orderQ(unitId, i));
  const nSent = Math.min(2, sents.length);
  const out = [
    ...sample(qs, vocab.length ? Math.min(qs.length, 4) : Math.min(qs.length, n - nSent)),
    ...sample(sents, nSent),
  ];
  if (vocab.length >= 4) out.push(matchQ(unitId, sample(vocab, 4), level));
  const words = shuffle(vocab);
  for (let i = 0; out.length < n && words.length; i++) {
    out.push(vocabQ(words[i % words.length], level.modes[i % level.modes.length], vocab, unitId, level));
  }
  if (out.length < n) {
    const used = new Set(out.map(q => q.key));
    out.push(...shuffle(qs.filter(q => !used.has(q.key))).slice(0, n - out.length));
  }
  const res = shuffle(out);
  if (res[0]?.t === 'match' && res.length > 1) res.push(res.shift()); // jangan buka dengan game mencocokkan
  return res;
}

function qFromKey(key) {
  const [type, unitId, ...rest] = key.split(':');
  const info = UNITS[unitId];
  if (!info) return null;
  const arg = rest.join(':');
  if (type === 'q') return info.unit.qs?.[+arg] ? explicitQ(unitId, +arg) : null;
  if (type === 's') return info.unit.sentences?.[+arg] ? orderQ(unitId, +arg) : null;
  if (type === 'v') {
    const item = (info.unit.vocab || []).find(v => v[1] === arg);
    return item ? vocabQ(item, pick(info.level.modes), info.unit.vocab, unitId, info.level) : null;
  }
  return null;
}
function describeKey(key) {
  const [type, unitId, ...rest] = key.split(':');
  const info = UNITS[unitId];
  if (!info) return null;
  const arg = rest.join(':');
  if (type === 'v') {
    const v = (info.unit.vocab || []).find(x => x[1] === arg);
    return v && { e: v[0], main: v[1], sub: v[2], say: v[1], level: info.level };
  }
  if (type === 'q') {
    const q = info.unit.qs?.[+arg];
    const main = q && (q.lines ? q.lines.map(l => `${l[0]}: ${l[1]}`).join(' / ') : q.q);
    return q && { e: info.unit.emoji, main, sub: 'Jawaban: ' + q.a, level: info.level };
  }
  if (type === 's') {
    const s = info.unit.sentences?.[+arg];
    return s && { e: '🧩', main: s[0], sub: s[1], say: s[0], level: info.level };
  }
  return null;
}

/* ============================================================
 * Mesin pelajaran
 * ============================================================ */
let L = null;
const PRAISE = ['Hebat!', 'Mantap!', 'Luar biasa!', 'Keren!', 'Tepat sekali!', 'Good job!', 'Excellent!', 'Awesome!', 'Perfect!'];

function startLesson(build, meta) {
  const questions = build();
  if (!questions.length) { toast('🤔', 'Belum ada soal', 'Coba pilih materi lain.'); return; }
  L = {
    meta, build, queue: questions.map(q => ({ ...q, tries: 0 })), pos: 0, total: questions.length,
    done: 0, firstOk: 0, combo: 0, maxCombo: 0, xp: 0, start: Date.now(), locked: false, result: null,
  };
  if (location.hash === '#/lesson') route(); else location.hash = '#/lesson';
}
function startUnit(unitId) {
  const { unit, level } = UNITS[unitId];
  S.lastLevel = level.id; save();
  startLesson(() => buildLesson(unitId), { mode: 'unit', unitId, title: unit.title, color: level.color, back: `#/level/${level.id}` });
}
function startChallenge() {
  const level = LEVELS.find(l => l.id === S.lastLevel) || LEVELS[0];
  const units = level.units.filter(u => isUnlocked(u.id));
  startLesson(() => {
    const all = units.flatMap(u => buildLesson(u.id)).filter(q => q.t !== 'match');
    return sample(all, 10);
  }, { mode: 'challenge', title: 'Tantangan Harian', color: '#f59f0b', back: '#/' });
}
function startReview() {
  startLesson(() => Object.entries(S.mistakes)
    .sort((a, b) => b[1] - a[1]).slice(0, 12)
    .map(([k]) => qFromKey(k)).filter(Boolean)
    .sort(() => Math.random() - 0.5).slice(0, 10),
  { mode: 'review', title: 'Ulangi Kesalahan', color: '#e5484d', back: '#/review' });
}

function lessonProgress() {
  const remaining = L.queue.length - L.pos;
  return L.done / (L.done + remaining) * 100;
}

function renderLesson() {
  const q = L.queue[L.pos];
  L.locked = false;
  app.innerHTML = `
    <div class="lesson" style="--lc:${L.meta.color}">
      <div class="lesson-top">
        <button class="icon-btn" id="quit" aria-label="Keluar">✕</button>
        <div class="bar" role="progressbar" aria-valuenow="${Math.round(lessonProgress())}" aria-valuemin="0" aria-valuemax="100"><i style="width:${lessonProgress()}%"></i></div>
        <div class="combo" id="combo">${L.combo >= 2 ? '🔥' + L.combo : ''}</div>
      </div>
      <section class="q" id="q" aria-live="polite"></section>
      <div class="feedback hidden" id="fb"></div>
    </div>`;
  $('#quit').onclick = confirmQuit;
  const box = $('#q');
  ({ pic: qPic, listen: qListen, spell: qSpell, mc: qChoice, fill: qChoice, order: qOrder, match: qMatch, dialog: qDialog, read: qRead })[q.t](q, box);
}

function confirmQuit() {
  modal(`
    <div style="text-align:center">
      <div style="font-size:3.4rem">😢</div>
      <h2>Yakin mau berhenti?</h2>
      <p class="muted">Progres pelajaran ini belum tersimpan.</p>
    </div>
    <div class="actions">
      <button class="btn ghost" data-close>Lanjut belajar</button>
      <button class="btn danger" id="do-quit">Keluar</button>
    </div>`);
  $('#do-quit').onclick = () => {
    const back = L.meta.back;
    L = null; closeModal();
    location.hash = back;
  };
}

function optionsHTML(opts, emojiOpts) {
  const long = !emojiOpts && opts.some(o => o.length > 18);
  return `<div class="options ${long ? 'one-col' : ''}">${opts.map((o, i) =>
    `<button class="opt ${emojiOpts ? 'emoji-opt' : ''}" data-v="${esc(o)}"><span class="k">${i + 1}</span>${esc(o)}</button>`).join('')}</div>`;
}
function bindOptions(box, q, onCorrect) {
  $$('.opt', box).forEach(b => b.onclick = () => {
    if (L.locked) return;
    const ok = b.dataset.v === q.a;
    $$('.opt', box).forEach(x => {
      x.disabled = true;
      if (x.dataset.v === q.a) x.classList.add('correct');
    });
    if (!ok) b.classList.add('wrong');
    if (ok && onCorrect) onCorrect();
    answer(ok, q.reveal || q.a, q.ex);
  });
}
const speakBtns = say => canSpeak ? `
  <div class="speak-row">
    <button class="speak-btn" data-say="${esc(say)}" aria-label="Putar suara">🔊</button>
    <button class="speak-btn slow" data-say="${esc(say)}" data-slow="1" aria-label="Putar pelan">🐢</button>
  </div>` : '';
function bindSpeak(box) {
  $$('[data-say]', box).forEach(b => b.onclick = e => { e.stopPropagation(); speak(b.dataset.say, !!b.dataset.slow); });
}

function qPic(q, box) {
  const tk = q.key.includes(':tk-');
  box.innerHTML = `
    <div class="q-type">🖼️ Tebak gambar</div>
    <div class="q-prompt">${tk ? 'Ini apa ya? Pilih kata yang tepat!' : 'Apa bahasa Inggrisnya?'}</div>
    <div class="q-emoji">${q.emoji}</div>
    ${optionsHTML(q.o)}`;
  bindOptions(box, q);
}

function qListen(q, box) {
  box.innerHTML = `
    <div class="q-type">🎧 Dengarkan</div>
    <div class="q-prompt">${q.emojiOpts ? 'Dengarkan, lalu pilih gambarnya!' : 'Dengarkan, lalu pilih kata yang kamu dengar.'}</div>
    ${speakBtns(q.say)}
    ${optionsHTML(q.o, q.emojiOpts)}`;
  bindSpeak(box);
  bindOptions(box, q);
  setTimeout(() => L && speak(q.say), 250);
}

function qChoice(q, box) {
  const isFill = q.t === 'fill';
  const sentence = isFill ? esc(q.q).replace('___', '<span class="blank">&nbsp;</span>') : '';
  box.innerHTML = `
    <div class="q-type">${isFill ? '✏️ Lengkapi kalimat' : '💡 ' + esc(q.kind || 'Pilih jawaban')}</div>
    ${isFill ? `<div class="q-sentence">${sentence}</div>` : `
      ${q.emoji ? `<div class="q-emoji" style="font-size:4rem">${q.emoji}</div>` : ''}
      <div class="q-prompt">${esc(q.q)} ${q.sayPrompt && canSpeak ? `<button class="inline-speak" data-say="${esc(q.sayPrompt)}" aria-label="Dengarkan">🔊</button>` : ''}</div>`}
    ${optionsHTML(q.o)}`;
  bindSpeak(box);
  bindOptions(box, q, () => { const b = $('.blank', box); if (b) b.textContent = q.a; });
  if (q.sayPrompt && S.autoplay) setTimeout(() => L && speak(q.sayPrompt), 250);
}

function qDialog(q, box) {
  const spoken = q.lines.filter(l => l[1] !== '___').map(l => l[1]).join(' ');
  box.innerHTML = `
    <div class="q-type">💬 Percakapan</div>
    <div class="q-prompt">Pilih respons yang paling tepat ${canSpeak ? `<button class="inline-speak" data-say="${esc(spoken)}" aria-label="Dengarkan">🔊</button>` : ''}</div>
    <div class="chat">${q.lines.map(([who, text], i) => `
      <div class="bubble ${i % 2 ? 'right' : 'left'}"><small>${esc(who)}</small>${text === '___' ? '<span class="blank">…</span>' : esc(text)}</div>`).join('')}
    </div>
    ${optionsHTML(q.o)}`;
  bindSpeak(box);
  bindOptions(box, q, () => { const b = $('.blank', box); if (b) b.textContent = q.a; });
}

function qRead(q, box) {
  box.innerHTML = `
    <div class="q-type">📖 Membaca</div>
    <div class="passage">${esc(q.text)} ${canSpeak ? `<button class="inline-speak" data-say="${esc(q.text)}" aria-label="Dengarkan bacaan">🔊</button>` : ''}</div>
    <div class="q-prompt">${esc(q.q)}</div>
    ${optionsHTML(q.o)}`;
  bindSpeak(box);
  bindOptions(box, q);
}

/* Susun huruf (spell) & susun kata (order) memakai mekanisme ubin yang sama */
function tileGame(box, { tiles, letter, check, autoCheck }) {
  const zone = $('.answer-zone', box), bank = $('.bank', box);
  const picked = []; // indeks ubin
  bank.innerHTML = tiles.map((t, i) => `<button class="tile ${letter ? 'letter' : ''}" data-i="${i}">${esc(t)}</button>`).join('');
  const draw = () => {
    zone.innerHTML = picked.map((i, p) => `<button class="tile ${letter ? 'letter' : ''}" data-p="${p}">${esc(tiles[i])}</button>`).join('');
    $$('.tile', bank).forEach(b => b.classList.toggle('used', picked.includes(+b.dataset.i)));
    $$('.tile', zone).forEach(b => b.onclick = () => { if (L.locked) return; sfx.tap(); picked.splice(+b.dataset.p, 1); draw(); });
    const btn = $('#check');
    if (btn) btn.disabled = picked.length === 0;
    if (autoCheck && picked.length === tiles.length) check(picked.map(i => tiles[i]));
  };
  $$('.tile', bank).forEach(b => b.onclick = () => {
    if (L.locked || picked.includes(+b.dataset.i)) return;
    sfx.tap(); picked.push(+b.dataset.i); draw();
  });
  showCheck(() => check(picked.map(i => tiles[i])));
  draw();
}
function showCheck(fn) {
  const fb = $('#fb');
  fb.className = 'feedback';
  fb.innerHTML = `<div class="msg"></div><button class="btn" id="check" disabled>Cek</button>`;
  $('#check').onclick = fn;
}

function qSpell(q, box) {
  let letters = shuffle(q.a.split(''));
  for (let i = 0; i < 5 && letters.join('') === q.a; i++) letters = shuffle(letters);
  box.innerHTML = `
    <div class="q-type">🔤 Eja kata</div>
    <div class="q-prompt">Susun hurufnya!</div>
    <div class="q-emoji">${q.emoji}</div>
    <div class="q-sub" style="text-align:center">${esc(q.id)} ${canSpeak ? `<button class="inline-speak" data-say="${esc(q.a)}" aria-label="Dengarkan">🔊</button>` : ''}</div>
    <div class="answer-zone"></div>
    <div class="bank"></div>`;
  bindSpeak(box);
  tileGame(box, {
    tiles: letters, letter: true, autoCheck: true,
    check: arr => answer(arr.join('') === q.a, q.a),
  });
}

const normSentence = s => s.toLowerCase().replace(/[^a-z0-9' ]/g, '').replace(/\s+/g, ' ').trim();
function qOrder(q, box) {
  const words = q.en.split(/\s+/);
  let tiles = shuffle(words);
  for (let i = 0; i < 5 && tiles.join(' ') === words.join(' '); i++) tiles = shuffle(words);
  box.innerHTML = `
    <div class="q-type">🧩 Susun kalimat</div>
    <div class="q-prompt">Terjemahkan ke bahasa Inggris</div>
    <div class="q-sentence">${esc(q.id)}</div>
    <div class="answer-zone lines"></div>
    <div class="bank"></div>`;
  tileGame(box, {
    tiles,
    check: arr => answer(normSentence(arr.join(' ')) === normSentence(q.en), q.en),
  });
}

function qMatch(q, box) {
  const left = shuffle(q.pairs.map(p => p[0])), right = shuffle(q.pairs.map(p => p[1]));
  const answerOf = Object.fromEntries(q.pairs);
  let sel = null, matched = 0, mistakes = 0;
  box.innerHTML = `
    <div class="q-type">🔗 Cocokkan</div>
    <div class="q-prompt">${q.kids ? 'Cocokkan gambar dengan katanya!' : 'Cocokkan kata dengan artinya'}</div>
    <div class="match">
      <div class="col">${left.map(v => `<button class="opt ${q.kids ? 'emoji-opt' : ''}" style="${q.kids ? 'font-size:2.2rem' : ''}" data-l="${esc(v)}">${esc(v)}</button>`).join('')}</div>
      <div class="col">${right.map(v => `<button class="opt" data-r="${esc(v)}">${esc(v)}</button>`).join('')}</div>
    </div>`;
  const lefts = $$('[data-l]', box), rights = $$('[data-r]', box);
  lefts.forEach(b => b.onclick = () => {
    if (b.disabled) return;
    lefts.forEach(x => x.classList.remove('sel'));
    b.classList.add('sel'); sel = b;
    if (q.kids) speak(answerOf[b.dataset.l]);
    else speak(b.dataset.l);
  });
  rights.forEach(b => b.onclick = () => {
    if (b.disabled || !sel) return;
    if (answerOf[sel.dataset.l] === b.dataset.r) {
      sfx.tap();
      [sel, b].forEach(x => { x.classList.remove('sel'); x.classList.add('done'); x.disabled = true; });
      sel = null; matched++;
      if (matched === q.pairs.length) {
        L.queue[L.pos].tries = mistakes ? 1 : 0; // salah saat mencocokkan → XP lebih kecil
        answer(true, '', mistakes ? `Ada ${mistakes} kali salah pasang.` : '');
      }
    } else {
      sfx.bad(); mistakes++;
      b.classList.add('wrong');
      setTimeout(() => b.classList.remove('wrong'), 400);
    }
  });
}

function answer(ok, correctText, ex) {
  if (L.locked) return;
  L.locked = true;
  const q = L.queue[L.pos];
  const d = todayW();
  if (ok) {
    sfx.ok();
    L.combo++;
    L.maxCombo = Math.max(L.maxCombo, L.combo);
    L.xp += q.tries === 0 ? (L.combo >= 5 ? 15 : 10) : 5;
    if (q.tries === 0) L.firstOk++;
    L.done++;
    d.correct++;
    if (q.key.startsWith('v:')) S.words[q.key] = 1;
    if (S.mistakes[q.key] && (L.meta.mode === 'review' || q.tries === 0)) {
      if (L.meta.mode === 'review' || --S.mistakes[q.key] <= 0) delete S.mistakes[q.key];
    }
    if (q.say && S.autoplay) setTimeout(() => speak(q.say), 200);
    const c = $('#combo');
    if (c && L.combo >= 2) { c.textContent = '🔥' + L.combo; c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); }
  } else {
    sfx.bad();
    L.combo = 0;
    q.tries++;
    d.wrong++;
    if (!q.key.startsWith('m:')) S.mistakes[q.key] = (S.mistakes[q.key] || 0) + 1;
    if (q.tries <= 2) L.queue.push({ ...q, o: q.o ? shuffle(q.o) : q.o }); // ulangi di akhir
    else L.done++;
    $('#combo').textContent = '';
  }
  save();
  $('.lesson-top .bar > i').style.width = lessonProgress() + '%';

  const fb = $('#fb');
  fb.className = 'feedback ' + (ok ? 'ok' : 'bad');
  fb.innerHTML = `
    <div class="msg">
      <h3>${ok ? '✅ ' + pick(PRAISE) : '❌ Belum tepat'}</h3>
      ${!ok && correctText ? `<p>Jawaban benar: <b>${esc(correctText)}</b></p>` : ''}
      ${ex ? `<p class="muted">💡 ${esc(ex)}</p>` : ''}
      ${!ok && q.tries <= 2 ? `<p class="muted">Soal ini akan muncul lagi nanti.</p>` : ''}
    </div>
    <button class="btn ${ok ? 'success' : 'danger'}" id="next">Lanjut</button>`;
  $('#next').onclick = nextQ;
  $('#next').focus({ preventScroll: true });
}

function nextQ() {
  L.pos++;
  if (L.pos >= L.queue.length) finishLesson(); else renderLesson();
}

function finishLesson() {
  const secs = Math.round((Date.now() - L.start) / 1000);
  const acc = L.firstOk / L.total;
  const st = acc >= 0.9 ? 3 : acc >= 0.7 ? 2 : 1;
  const perfect = L.firstOk === L.total;
  const d = todayW();
  const goalBefore = d.xp;
  let bonus = st * 5 + (perfect ? 10 : 0);
  if (L.meta.mode === 'challenge' && !d.challenge) { bonus += 30; d.challenge = true; }
  const gained = L.xp + bonus;
  S.totalXp += gained;
  d.xp += gained;
  d.lessons++;
  d.secs += secs;
  let improved = false;
  if (L.meta.mode === 'unit') {
    const rec = (S.units[L.meta.unitId] ||= { stars: 0, plays: 0, best: 0 });
    improved = st > rec.stars;
    rec.plays++;
    rec.stars = Math.max(rec.stars, st);
    rec.best = Math.max(rec.best, Math.round(acc * 100));
  }
  const goalJustMet = goalBefore < S.dailyGoal && d.xp >= S.dailyGoal;
  if (d.xp >= S.dailyGoal) d.goalMet = true;
  S.bestCombo = Math.max(S.bestCombo, L.maxCombo);
  S.bestStreak = Math.max(S.bestStreak, currentStreak());
  const newBadges = checkBadges({ perfect });
  save();
  L.result = { st, acc, gained, bonus, secs, perfect, newBadges, goalJustMet, improved };
  renderResult();
  sfx.win();
  if (st >= 2 || goalJustMet) confetti();
  setTimeout(() => {
    if (goalJustMet) toast('🎯', 'Target harian tercapai!', `${S.dailyGoal} XP hari ini. Mantap!`);
    newBadges.forEach((b, i) => setTimeout(() => toast(b.emoji, 'Lencana baru: ' + b.name, b.desc), 600 * (i + (goalJustMet ? 1 : 0))));
  }, 500);
}

function renderResult() {
  const r = L.result;
  const titles = { 3: 'Sempurna! Kamu jagoan!', 2: 'Bagus sekali!', 1: 'Kerja bagus, terus berlatih!' };
  const d = dayStat();
  const goalPct = Math.min(100, d.xp / S.dailyGoal * 100);
  app.innerHTML = `
    <div class="lesson result" style="--lc:${L.meta.color}">
      <div class="big-emoji">${r.st === 3 ? '🏆' : r.st === 2 ? '🎉' : '💪'}</div>
      <h1>${titles[r.st]}</h1>
      <p class="muted">${esc(L.meta.title)}${r.improved ? ' · rekor bintang baru!' : ''}</p>
      <div class="stars-big">${[1, 2, 3].map(i => `<span class="${i <= r.st ? '' : 'off'}" style="${i <= r.st ? '' : 'filter:grayscale(1);opacity:.25'}">⭐</span>`).join('')}</div>
      <div class="result-tiles">
        <div class="tile-stat"><small>XP didapat</small><b style="color:var(--warning)">+${r.gained}</b></div>
        <div class="tile-stat"><small>Akurasi</small><b style="color:var(--success)">${Math.round(r.acc * 100)}%</b></div>
        <div class="tile-stat"><small>Combo terbaik</small><b style="color:var(--fire)">🔥${L.maxCombo}</b></div>
        <div class="tile-stat"><small>Waktu</small><b>${fmtDuration(r.secs)}</b></div>
      </div>
      <div class="card" style="text-align:left;margin-bottom:20px">
        <div style="display:flex;justify-content:space-between;font-weight:900"><span>🎯 Target hari ini</span><span>${d.xp} / ${S.dailyGoal} XP</span></div>
        <div class="bar" style="margin-top:8px;--lc:var(--success)"><i style="width:${goalPct}%"></i></div>
      </div>
      <div class="actions">
        <button class="btn ghost" id="again">🔁 Ulangi</button>
        <button class="btn success" id="cont">Lanjut ▶</button>
      </div>
    </div>`;
  $('#again').onclick = () => startLesson(L.build, L.meta);
  $('#cont').onclick = () => { const back = L.meta.back; L = null; location.hash = back; };
  $('#cont').focus();
}

/* ============================================================
 * Lencana
 * ============================================================ */
function checkBadges(ctx = {}) {
  const t = totals();
  const goalDays = Object.values(S.history).filter(d => d.goalMet).length;
  const conds = {
    first: t.lessons >= 1,
    perfect: !!ctx.perfect,
    combo10: S.bestCombo >= 10,
    streak3: S.bestStreak >= 3,
    streak7: S.bestStreak >= 7,
    streak30: S.bestStreak >= 30,
    xp100: S.totalXp >= 100,
    xp1000: S.totalXp >= 1000,
    xp5000: S.totalXp >= 5000,
    words50: Object.keys(S.words).length >= 50,
    goal7: goalDays >= 7,
    challenge: Object.values(S.history).some(d => d.challenge),
  };
  LEVELS.forEach(l => { conds['level-' + l.id] = l.units.every(u => stars(u.id) > 0); });
  const fresh = [];
  BADGES.forEach(b => {
    if (conds[b.id] && !S.badges[b.id]) { S.badges[b.id] = dayKey(); fresh.push(b); }
  });
  return fresh;
}

/* ============================================================
 * Tampilan: Beranda
 * ============================================================ */
const app = $('#app');

function ring(value, max, size = 120, color = '#fff', track = 'rgba(255,255,255,.25)', label = '') {
  const r = size / 2 - 9, c = 2 * Math.PI * r, p = Math.min(1, value / max);
  return `<div class="ring" style="width:${size}px;height:${size}px">
    <svg width="${size}" height="${size}" aria-hidden="true">
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${track}" stroke-width="12"/>
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="12" stroke-linecap="round"
        stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - p)}" style="transition:stroke-dashoffset .8s"/>
    </svg>
    <div class="ring-label">${label}</div>
  </div>`;
}

function renderHome() {
  const d = dayStat();
  const streak = currentStreak();
  const level = LEVELS.find(l => l.id === S.lastLevel) || LEVELS[0];
  const nu = nextUnit(level);
  const goalDone = d.xp >= S.dailyGoal;
  const msg = goalDone ? 'Target hari ini sudah tercapai. Kamu luar biasa! 🎉'
    : d.xp > 0 ? `Tinggal ${S.dailyGoal - d.xp} XP lagi untuk target hari ini.`
    : streak > 0 ? `Jangan putuskan streak ${streak} harimu! Ayo belajar hari ini.`
    : 'Yuk mulai petualangan bahasa Inggrismu hari ini!';
  app.innerHTML = `
    <section class="card hero">
      <div>
        <h1>${S.avatar} Hai, ${esc(S.name || 'Sobat')}!</h1>
        <p>${msg}</p>
        <div class="hero-stats">
          <span>🔥 ${streak} hari</span><span>⚡ ${fmtNum(S.totalXp)} XP</span><span>📖 ${Object.keys(S.words).length} kata</span>
        </div>
        <div style="margin-top:16px"><button class="btn" id="continue">▶ Lanjut: ${esc(level.name)} · ${esc(nu.title)}</button></div>
      </div>
      ${ring(d.xp, S.dailyGoal, 128, '#fff', 'rgba(255,255,255,.25)', `${goalDone ? '✅' : '🎯'}<br>${d.xp}/${S.dailyGoal}<small>XP hari ini</small>`)}
    </section>

    <div class="section-title">🗓️ Tantangan Harian</div>
    <section class="card challenge">
      <div class="big">${d.challenge ? '🏅' : '⚡'}</div>
      <div>
        <h3>${d.challenge ? 'Tantangan hari ini selesai!' : '10 soal acak · bonus +30 XP'}</h3>
        <p>Dari materi ${esc(level.name)} yang sudah terbuka. ${d.challenge ? 'Datang lagi besok untuk tantangan baru.' : ''}</p>
      </div>
      <button class="btn ${d.challenge ? 'ghost' : ''} small" id="challenge" style="${d.challenge ? '' : '--c:var(--warning);--cd:#c27c06;--t:#fff'}">${d.challenge ? 'Main lagi' : 'Mulai'}</button>
    </section>

    <div class="section-title">🗺️ Pilih Jenjang</div>
    <section class="grid levels">
      ${LEVELS.map(l => {
        const p = levelProgress(l);
        return `<button class="card level-card" style="--lc:${l.color}" data-level="${l.id}">
          <div class="level-head">
            <div class="level-emoji">${l.emoji}</div>
            <div><div class="tag">${esc(l.name)}</div><h3>${esc(l.title)}</h3></div>
          </div>
          <p>${esc(l.desc)}</p>
          <div class="bar"><i style="width:${p.stars / p.maxStars * 100}%"></i></div>
          <div class="bar-meta"><span>${p.done}/${p.total} unit</span><span>⭐ ${p.stars}/${p.maxStars}</span></div>
        </button>`;
      }).join('')}
    </section>`;
  $('#continue').onclick = () => openUnit(nu.id);
  $('#challenge').onclick = startChallenge;
  $$('[data-level]').forEach(b => b.onclick = () => { location.hash = '#/level/' + b.dataset.level; });
}

/* ============================================================
 * Tampilan: Peta unit per jenjang
 * ============================================================ */
function renderLevel(id) {
  const level = LEVELS.find(l => l.id === id);
  if (!level) { location.hash = '#/'; return; }
  S.lastLevel = id; save();
  const p = levelProgress(level);
  const cur = nextUnit(level);
  app.innerHTML = `
    <a href="#/" class="back">← Semua jenjang</a>
    <section class="card level-banner" style="--lc:${level.color}">
      <div class="level-emoji">${level.emoji}</div>
      <div style="flex:1">
        <h1>${esc(level.name)} · ${esc(level.title)}</h1>
        <p>${esc(level.desc)}</p>
        <div class="bar" style="margin-top:10px;background:rgba(255,255,255,.25);--lc:#fff"><i style="width:${p.stars / p.maxStars * 100}%"></i></div>
      </div>
    </section>
    <section class="path" style="--lc:${level.color}">
      ${level.units.map(u => {
        const locked = !isUnlocked(u.id), s = stars(u.id);
        return `<div class="node-wrap">
          <button class="node ${locked ? 'locked' : ''} ${u.id === cur.id && !locked ? 'current' : ''}" data-unit="${u.id}" aria-label="${esc(u.title)}${locked ? ' (terkunci)' : ''}">${locked ? '🔒' : u.emoji}</button>
          <div class="node-title">${esc(u.title)}</div>
          <div class="node-sub">${esc(u.titleId)}</div>
          <div class="stars">${[1, 2, 3].map(i => `<span class="${i <= s ? '' : 'off'}">⭐</span>`).join('')}</div>
        </div>`;
      }).join('')}
      <div class="node-wrap"><div style="font-size:3rem">${p.done === p.total ? '🏆' : '🏁'}</div><div class="node-sub">${p.done === p.total ? 'Jenjang selesai!' : 'Garis finis'}</div></div>
    </section>`;
  $$('[data-unit]').forEach(b => b.onclick = () => openUnit(b.dataset.unit));
}

function openUnit(unitId) {
  if (!isUnlocked(unitId)) { sfx.bad(); toast('🔒', 'Unit masih terkunci', 'Selesaikan unit sebelumnya dulu ya.'); return; }
  const { unit, level } = UNITS[unitId];
  const s = stars(unitId), rec = S.units[unitId];
  modal(`
    <div style="display:flex;gap:14px;align-items:center">
      <div class="level-emoji" style="--lc:${level.color}">${unit.emoji}</div>
      <div>
        <div class="muted" style="font-weight:800;font-size:.85rem">${esc(level.name)} · ${esc(unit.titleId)}</div>
        <h2>${esc(unit.title)}</h2>
        <div class="stars">${[1, 2, 3].map(i => `<span class="${i <= s ? '' : 'off'}">⭐</span>`).join('')}
          ${rec ? `<small class="muted"> · terbaik ${rec.best}% · ${rec.plays}x main</small>` : ''}</div>
      </div>
    </div>
    ${unit.tip ? `<div class="tip"><b>📌 Ringkasan materi</b><br>${esc(unit.tip)}</div>` : ''}
    ${unit.vocab ? `
      <div style="font-weight:900;margin-top:14px">📖 Kosakata ${canSpeak ? '<small class="muted">(ketuk untuk dengar)</small>' : ''}</div>
      <div class="vocab-list">${unit.vocab.map(v => `
        <button class="vocab-item" data-say="${esc(v[1])}"><span class="e">${v[0]}</span><span><b>${esc(v[1])}</b><small>${esc(v[2])}</small></span></button>`).join('')}
      </div>` : ''}
    <div class="actions">
      <button class="btn ghost" data-close>Tutup</button>
      <button class="btn success" id="start">${s ? 'Main lagi' : 'Mulai'} ▶</button>
    </div>`);
  $$('#modal-root [data-say]').forEach(b => b.onclick = () => speak(b.dataset.say));
  $('#start').onclick = () => { closeModal(); startUnit(unitId); };
  $('#start').focus();
}

/* ============================================================
 * Tampilan: Progres
 * ============================================================ */
let chartRange = 7;
function barChart(days) {
  const W = 640, H = 220, P = { l: 34, r: 10, t: 22, b: 28 };
  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = addDays(new Date(), -i), k = dayKey(d);
    data.push({ d, k, xp: dayStat(k).xp });
  }
  const max = Math.max(S.dailyGoal * 1.25, ...data.map(x => x.xp)) || 1;
  const iw = W - P.l - P.r, ih = H - P.t - P.b, bw = iw / days;
  const y = v => P.t + ih - v / max * ih;
  const ticks = [0, Math.round(max / 2), Math.round(max)];
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Grafik XP ${days} hari terakhir">
    ${ticks.map(t => `<line x1="${P.l}" x2="${W - P.r}" y1="${y(t)}" y2="${y(t)}" stroke="var(--border)"/>
      <text class="axis" x="${P.l - 6}" y="${y(t) + 4}" text-anchor="end">${t}</text>`).join('')}
    ${data.map((x, i) => {
      const h = ih - (y(x.xp) - P.t), bx = P.l + i * bw + bw * 0.18, w = bw * 0.64;
      const color = x.xp >= S.dailyGoal ? 'var(--success)' : 'var(--primary)';
      const label = days <= 7 ? DAY_NAMES[x.d.getDay()] : (i % 5 === 0 || i === days - 1 ? x.d.getDate() : '');
      return `<g><title>${x.k}: ${x.xp} XP</title>
        ${x.xp ? `<rect x="${bx}" y="${y(x.xp)}" width="${w}" height="${h}" rx="${Math.min(6, w / 2)}" fill="${color}"/>` : ''}
        ${days <= 7 && x.xp ? `<text class="val" x="${bx + w / 2}" y="${y(x.xp) - 6}" text-anchor="middle">${x.xp}</text>` : ''}
        <text class="axis" x="${bx + w / 2}" y="${H - 8}" text-anchor="middle" ${i === days - 1 ? 'style="fill:var(--primary)"' : ''}>${label}</text></g>`;
    }).join('')}
    <line class="goal-line" x1="${P.l}" x2="${W - P.r}" y1="${y(S.dailyGoal)}" y2="${y(S.dailyGoal)}"/>
  </svg>`;
}
function heatmap(weeks = 16) {
  const now = new Date();
  let d = addDays(now, -(weeks * 7 - 1));
  d = addDays(d, -d.getDay());
  const end = addDays(now, 6 - now.getDay());
  const cells = [];
  const todayK = dayKey(now);
  for (; d <= end; d = addDays(d, 1)) {
    const k = dayKey(d), xp = dayStat(k).xp;
    const lvl = xp === 0 ? '' : xp < S.dailyGoal / 2 ? 'l1' : xp < S.dailyGoal ? 'l2' : 'l3';
    const future = k > todayK;
    cells.push(`<i class="${lvl} ${k === todayK ? 'today' : ''} ${future ? 'future' : ''}" title="${k}: ${xp} XP"></i>`);
  }
  return `<div class="heatmap">${cells.join('')}</div>`;
}

function renderProgress() {
  const t = totals();
  const d = dayStat();
  const streak = currentStreak();
  const acc = t.correct + t.wrong ? Math.round(t.correct / (t.correct + t.wrong) * 100) : 0;
  const stat = (e, v, l) => `<div class="card stat"><span class="e">${e}</span><div><b>${v}</b><small>${l}</small></div></div>`;
  app.innerHTML = `
    <h1 style="font-weight:900">📈 Progres Belajar</h1>

    <div class="section-title">Hari ini</div>
    <section class="card" style="display:flex;gap:20px;align-items:center;flex-wrap:wrap">
      ${ring(d.xp, S.dailyGoal, 120, 'var(--success)', 'var(--surface-3)', `${d.xp}<small>/ ${S.dailyGoal} XP</small>`)}
      <div style="flex:1;min-width:200px">
        <h2 style="font-weight:900">${d.xp >= S.dailyGoal ? '🎯 Target tercapai!' : `🎯 ${S.dailyGoal - d.xp} XP lagi`}</h2>
        <p class="muted" style="margin:6px 0 0">${d.lessons} pelajaran · ${d.correct} benar · ${d.wrong} salah · ${fmtDuration(d.secs)} belajar</p>
        <p class="muted" style="margin:4px 0 0">Tantangan harian: ${d.challenge ? '✅ selesai' : '⏳ belum'}</p>
      </div>
    </section>

    <section class="grid stat-grid" style="margin-top:14px">
      ${stat('🔥', streak + ' hari', 'Streak saat ini')}
      ${stat('🏆', S.bestStreak + ' hari', 'Streak terbaik')}
      ${stat('⚡', fmtNum(S.totalXp), 'Total XP')}
      ${stat('📖', `${Object.keys(S.words).length}/${TOTAL_VOCAB}`, 'Kosakata dikuasai')}
      ${stat('🎓', t.lessons, 'Pelajaran selesai')}
      ${stat('🎯', acc + '%', 'Akurasi')}
      ${stat('⏱️', fmtDuration(t.secs), 'Total waktu')}
      ${stat('⚡', '🔥' + S.bestCombo, 'Combo terbaik')}
    </section>

    <div class="section-title" style="justify-content:space-between">
      <span>📊 XP Harian</span>
      <span class="seg" id="range">
        <button data-r="7" class="${chartRange === 7 ? 'on' : ''}">7 hari</button>
        <button data-r="30" class="${chartRange === 30 ? 'on' : ''}">30 hari</button>
      </span>
    </div>
    <section class="card chart">
      ${barChart(chartRange)}
      <div class="legend">
        <span><i style="background:var(--success)"></i>Target tercapai</span>
        <span><i style="background:var(--primary)"></i>Belum tercapai</span>
        <span><i style="background:var(--warning);height:3px"></i>Target ${S.dailyGoal} XP</span>
      </div>
    </section>

    <div class="section-title">🗓️ Kalender Aktivitas (16 minggu)</div>
    <section class="card">
      ${heatmap()}
      <div class="legend">
        <span><i style="background:var(--surface-3)"></i>Libur</span>
        <span><i class="" style="background:color-mix(in srgb, var(--success) 35%, var(--surface-3))"></i>&lt; ½ target</span>
        <span><i style="background:color-mix(in srgb, var(--success) 65%, var(--surface-3))"></i>&lt; target</span>
        <span><i style="background:var(--success)"></i>Target tercapai</span>
      </div>
    </section>

    <div class="section-title">🗺️ Progres per Jenjang</div>
    <section class="card">
      ${LEVELS.map(l => {
        const p = levelProgress(l);
        return `<a class="level-row" href="#/level/${l.id}" style="--lc:${l.color}">
          <span>${l.emoji}</span><b>${esc(l.name)}</b>
          <div class="bar"><i style="width:${p.stars / p.maxStars * 100}%"></i></div>
          <small>⭐ ${p.stars}/${p.maxStars}</small></a>`;
      }).join('')}
    </section>

    <div class="section-title">🏅 Lencana (${Object.keys(S.badges).length}/${BADGES.length})</div>
    <section class="grid badges">
      ${BADGES.map(b => `<div class="card badge ${S.badges[b.id] ? '' : 'locked'}" title="${esc(b.desc)}">
        <div class="e">${b.emoji}</div><b>${esc(b.name)}</b><small>${S.badges[b.id] ? '✓ ' + S.badges[b.id] : esc(b.desc)}</small></div>`).join('')}
    </section>`;
  $$('#range button').forEach(b => b.onclick = () => { chartRange = +b.dataset.r; renderProgress(); });
}

/* ============================================================
 * Tampilan: Ulangi kesalahan
 * ============================================================ */
function renderReview() {
  const entries = Object.entries(S.mistakes).sort((a, b) => b[1] - a[1])
    .map(([k, n]) => ({ k, n, info: describeKey(k) })).filter(x => x.info);
  app.innerHTML = `
    <h1 style="font-weight:900">🔁 Ulangi Kesalahan</h1>
    <p class="muted">Soal yang pernah salah dikumpulkan di sini. Jawab benar saat latihan ulang untuk menghapusnya dari daftar.</p>
    ${entries.length ? `
      <section class="card" style="display:flex;align-items:center;gap:14px;flex-wrap:wrap">
        <div style="font-size:2.6rem">🎯</div>
        <div style="flex:1;min-width:180px"><h3 style="font-weight:900">${entries.length} soal perlu diulang</h3>
          <p class="muted" style="margin:2px 0 0">Latihan berisi hingga 10 soal tersulit.</p></div>
        <button class="btn danger" id="go-review">Latih sekarang</button>
      </section>
      <div class="section-title">Daftar soal sulit</div>
      <section class="card word-list">
        ${entries.map(x => `<div class="word-row">
          <span class="e">${x.info.e}</span>
          <div><b>${esc(x.info.main)}</b><br><small>${esc(x.info.sub)} · ${esc(x.info.level.name)}</small></div>
          ${x.info.say && canSpeak ? `<button class="inline-speak" data-say="${esc(x.info.say)}" aria-label="Dengarkan">🔊</button>` : ''}
          <span class="cnt">✗${x.n}</span>
        </div>`).join('')}
      </section>` : `
      <section class="card empty">
        <div class="e">🌟</div>
        <h2 style="font-weight:900">Tidak ada kesalahan!</h2>
        <p class="muted">Semua soal sudah kamu kuasai. Lanjutkan belajar materi baru.</p>
        <a class="btn" href="#/">Belajar</a>
      </section>`}`;
  const btn = $('#go-review');
  if (btn) btn.onclick = startReview;
  $$('[data-say]', app).forEach(b => b.onclick = () => speak(b.dataset.say));
}

/* ============================================================
 * Tampilan: Pengaturan
 * ============================================================ */
const GOALS = [[20, 'Santai'], [50, 'Normal'], [100, 'Serius'], [200, 'Intens']];
const THEMES = [['system', '🖥️ Sistem'], ['light', '☀️ Terang'], ['dark', '🌙 Gelap']];
const RATES = [[0.7, '🐢 Lambat'], [0.9, '🙂 Normal'], [1.05, '🐇 Cepat']];

function profileFields() {
  return `
    <div class="field"><label for="name">Nama panggilan</label>
      <input class="input" id="name" maxlength="20" placeholder="mis. Kakak Budi" value="${esc(S.name)}"></div>
    <div class="field"><span class="label">Avatar</span>
      <div class="avatars" id="avatars">${AVATARS.map(a => `<button class="${a === S.avatar ? 'on' : ''}" data-a="${a}" aria-label="Avatar ${a}">${a}</button>`).join('')}</div></div>
    <div class="field"><span class="label">Target harian</span>
      <div class="seg" id="goals">${GOALS.map(([v, l]) => `<button class="${v === S.dailyGoal ? 'on' : ''}" data-g="${v}">${l} · ${v} XP</button>`).join('')}</div></div>`;
}
function bindProfile(root) {
  $('#name', root).oninput = e => { S.name = e.target.value.trim(); save(); };
  $$('#avatars button', root).forEach(b => b.onclick = () => {
    S.avatar = b.dataset.a; save();
    $$('#avatars button', root).forEach(x => x.classList.toggle('on', x === b));
  });
  $$('#goals button', root).forEach(b => b.onclick = () => {
    S.dailyGoal = +b.dataset.g; save(); updateTopbar();
    $$('#goals button', root).forEach(x => x.classList.toggle('on', x === b));
  });
}

function renderSettings() {
  const sw = (id, on, label, sub) => `<div class="switch-row"><div><b>${label}</b><br><small class="muted">${sub}</small></div>
    <label class="switch"><input type="checkbox" id="${id}" ${on ? 'checked' : ''}><span></span></label></div>`;
  app.innerHTML = `
    <h1 style="font-weight:900">⚙️ Pengaturan</h1>
    <div class="section-title">👤 Profil</div>
    <section class="card" id="profile">${profileFields()}</section>

    <div class="section-title">🎨 Tampilan & Suara</div>
    <section class="card">
      <div class="field"><span class="label">Tema</span>
        <div class="seg" id="themes">${THEMES.map(([v, l]) => `<button class="${v === S.theme ? 'on' : ''}" data-t="${v}">${l}</button>`).join('')}</div></div>
      ${sw('sound', S.sound, '🔔 Efek suara', 'Bunyi saat jawaban benar/salah')}
      ${sw('autoplay', S.autoplay, '🗣️ Ucapkan otomatis', 'Bacakan kata/kalimat bahasa Inggris setelah menjawab')}
      <div class="field" style="margin-top:16px"><span class="label">Kecepatan suara</span>
        <div class="seg" id="rates">${RATES.map(([v, l]) => `<button class="${v === S.rate ? 'on' : ''}" data-r="${v}">${l}</button>`).join('')}
          ${canSpeak ? '<button id="test-voice">🔊 Coba</button>' : ''}</div>
        ${canSpeak ? '' : '<small class="muted">Browser ini tidak mendukung suara (Speech Synthesis).</small>'}
      </div>
    </section>

    <div class="section-title">📲 Aplikasi</div>
    <section class="card">
      ${isStandalone() ? '<p style="margin:0">✅ English Quest sudah terpasang sebagai aplikasi. Bisa dipakai offline juga.</p>'
        : installPrompt ? `<p class="muted" style="margin-top:0">Pasang English Quest di HP/laptop agar bisa dibuka dari layar utama dan dipakai offline.</p>
          <button class="btn" id="install">📲 Pasang Aplikasi</button>`
        : isIOS() ? '<p style="margin:0">Di iPhone/iPad: buka di Safari, ketuk tombol <b>Bagikan</b> (kotak dengan panah ke atas), lalu pilih <b>Tambah ke Layar Utama</b>.</p>'
        : '<p style="margin:0">Buka menu browser (⋮) lalu pilih <b>Instal aplikasi</b> / <b>Tambahkan ke layar utama</b>.</p>'}
    </section>

    <div class="section-title">💾 Data Progres</div>
    <section class="card">
      <p class="muted" style="margin-top:0">Progres tersimpan di browser ini. Ekspor untuk cadangan atau pindah perangkat.</p>
      <div class="seg">
        <button id="export">⬇️ Ekspor</button>
        <button id="import">⬆️ Impor</button>
        <button id="reset" style="color:var(--danger)">🗑️ Reset progres</button>
      </div>
      <input type="file" id="import-file" accept="application/json" hidden>
    </section>`;
  bindProfile($('#profile'));
  const ib = $('#install');
  if (ib) ib.onclick = promptInstall;
  $$('#themes button').forEach(b => b.onclick = () => { S.theme = b.dataset.t; save(); applyTheme(); renderSettings(); });
  $('#sound').onchange = e => { S.sound = e.target.checked; save(); sfx.tap(); };
  $('#autoplay').onchange = e => { S.autoplay = e.target.checked; save(); };
  $$('#rates button[data-r]').forEach(b => b.onclick = () => {
    S.rate = +b.dataset.r; save();
    $$('#rates button[data-r]').forEach(x => x.classList.toggle('on', x === b));
    speak('Hello! Let\'s learn English together.');
  });
  const tv = $('#test-voice');
  if (tv) tv.onclick = () => speak('Hello! Let\'s learn English together.');
  $('#export').onclick = () => {
    const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `english-quest-${dayKey()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  $('#import').onclick = () => $('#import-file').click();
  $('#import-file').onchange = async e => {
    const f = e.target.files[0];
    if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      if (typeof data !== 'object' || typeof data.totalXp !== 'number' || typeof data.history !== 'object') throw new Error();
      S = { ...makeDefault(), ...data };
      save(); applyTheme(); updateTopbar(); renderSettings();
      toast('✅', 'Progres berhasil diimpor', `${fmtNum(S.totalXp)} XP dipulihkan.`);
    } catch (err) {
      toast('⚠️', 'File tidak valid', 'Pilih file hasil ekspor English Quest.');
    }
  };
  $('#reset').onclick = () => {
    modal(`<div style="text-align:center"><div style="font-size:3rem">⚠️</div><h2>Reset semua progres?</h2>
      <p class="muted">XP, streak, bintang, dan lencana akan dihapus permanen dari browser ini.</p></div>
      <div class="actions"><button class="btn ghost" data-close>Batal</button><button class="btn danger" id="do-reset">Reset</button></div>`);
    $('#do-reset').onclick = () => {
      const keep = { theme: S.theme, name: S.name, avatar: S.avatar, dailyGoal: S.dailyGoal, onboarded: true };
      S = { ...makeDefault(), ...keep };
      save(); closeModal(); updateTopbar(); renderSettings();
      toast('🧹', 'Progres direset', 'Mulai petualangan baru!');
    };
  };
}

/* ============================================================
 * Onboarding
 * ============================================================ */
function onboarding() {
  modal(`
    <div style="text-align:center">
      <div style="font-size:3.6rem">🦊</div>
      <h2>Selamat datang di English Quest!</h2>
      <p class="muted">Belajar bahasa Inggris sambil bermain, dari TK sampai Advanced.</p>
    </div>
    <div id="ob">${profileFields()}
      <div class="field"><span class="label">Mulai dari jenjang</span>
        <div class="seg" id="ob-level">${LEVELS.map(l => `<button class="${l.id === S.lastLevel ? 'on' : ''}" data-l="${l.id}">${l.emoji} ${esc(l.name)}</button>`).join('')}</div></div>
    </div>
    <div class="actions"><button class="btn success block" id="ob-go">Mulai Belajar 🚀</button></div>`, { dismissable: false });
  const root = $('#ob');
  bindProfile(root);
  $$('#ob-level button').forEach(b => b.onclick = () => {
    S.lastLevel = b.dataset.l; save();
    $$('#ob-level button').forEach(x => x.classList.toggle('on', x === b));
  });
  $('#ob-go').onclick = () => {
    S.onboarded = true; save(); closeModal();
    location.hash = '#/level/' + S.lastLevel;
    sfx.win();
  };
}

/* ============================================================
 * Modal, toast, confetti
 * ============================================================ */
let modalOpts = {};
function modal(html, opts = { dismissable: true }) {
  modalOpts = opts;
  $('#modal-root').innerHTML = `<div class="modal-backdrop"><div class="modal" role="dialog" aria-modal="true">${html}</div></div>`;
  const bd = $('.modal-backdrop');
  bd.onclick = e => { if (e.target === bd && modalOpts.dismissable) closeModal(); };
  $$('[data-close]', bd).forEach(b => b.onclick = closeModal);
}
function closeModal() { $('#modal-root').innerHTML = ''; }

function toast(emoji, title, sub = '') {
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<span class="e">${emoji}</span><div>${esc(title)}<small>${esc(sub)}</small></div>`;
  $('#toast-root').appendChild(el);
  setTimeout(() => { el.style.transition = 'opacity .4s'; el.style.opacity = '0'; }, 2800);
  setTimeout(() => el.remove(), 3300);
}

function confetti() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cv = $('#confetti'), ctx = cv.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
  ctx.scale(dpr, dpr);
  const colors = ['#6c5ce7', '#ff8a3d', '#16a571', '#3b82f6', '#ec4899', '#f59f0b'];
  const parts = Array.from({ length: 140 }, () => ({
    x: innerWidth / 2 + (Math.random() - 0.5) * 200, y: innerHeight * 0.35,
    vx: (Math.random() - 0.5) * 12, vy: -Math.random() * 12 - 4,
    s: Math.random() * 7 + 4, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, c: pick(colors),
  }));
  const t0 = performance.now();
  (function frame(t) {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    parts.forEach(p => {
      p.vy += 0.3; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
      ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
      ctx.restore();
    });
    if (t - t0 < 2800) requestAnimationFrame(frame); else ctx.clearRect(0, 0, innerWidth, innerHeight);
  })(t0);
}

/* ============================================================
 * Router & top bar
 * ============================================================ */
function updateTopbar() {
  $('#chip-streak b').textContent = currentStreak();
  const d = dayStat();
  $('#chip-xp b').textContent = `${d.xp}/${S.dailyGoal}`;
  $('#chip-xp').style.borderColor = d.xp >= S.dailyGoal ? 'var(--success)' : '';
}

function route() {
  const parts = (location.hash.slice(1) || '/').split('/').filter(Boolean);
  const page = parts[0] || 'home';
  if (page !== 'lesson') {
    if (L) L = null;
    if (canSpeak) speechSynthesis.cancel();
  }
  if (S.onboarded) closeModal();
  document.body.classList.toggle('in-lesson', page === 'lesson');
  $$('#nav a').forEach(a => a.classList.toggle('active', a.dataset.nav === (page === 'level' ? 'home' : page)));
  switch (page) {
    case 'level': renderLevel(parts[1]); break;
    case 'progress': renderProgress(); break;
    case 'review': renderReview(); break;
    case 'settings': renderSettings(); break;
    case 'lesson':
      if (!L) { location.replace('#/'); return; }
      L.result ? renderResult() : renderLesson();
      break;
    default: renderHome();
  }
  updateTopbar();
  window.scrollTo(0, 0);
}

document.addEventListener('keydown', e => {
  if (e.target.matches('input, textarea')) return;
  if (e.key === 'Escape' && $('.modal-backdrop') && modalOpts.dismissable) { closeModal(); return; }
  if (!L || L.result || $('.modal-backdrop')) return;
  if (e.key === 'Enter') {
    const btn = $('#next') || $('#check');
    if (btn && !btn.disabled && document.activeElement !== btn) { e.preventDefault(); btn.click(); }
  } else if (/^[1-9]$/.test(e.key) && !L.locked) {
    const opt = $$('#q .options .opt')[+e.key - 1];
    if (opt && !opt.disabled) opt.click();
  }
});

/* ============================================================
 * PWA: service worker & pemasangan
 * ============================================================ */
let installPrompt = null;
const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  installPrompt = e;
  $('#install-btn').classList.remove('hidden');
  if (location.hash === '#/settings') renderSettings();
});
window.addEventListener('appinstalled', () => {
  installPrompt = null;
  $('#install-btn').classList.add('hidden');
  toast('🎉', 'Aplikasi terpasang!', 'Buka English Quest dari layar utama.');
});
async function promptInstall() {
  if (!installPrompt) return;
  installPrompt.prompt();
  await installPrompt.userChoice;
  installPrompt = null;
  $('#install-btn').classList.add('hidden');
  if (location.hash === '#/settings') renderSettings();
}
$('#install-btn').onclick = promptInstall;
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

window.addEventListener('hashchange', route);
applyTheme();
route();
if (!S.onboarded) onboarding();
