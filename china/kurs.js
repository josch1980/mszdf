/* ==========================================================
   Selbstlernkurs China · GPG M10 · Kurs-Engine
   Alles läuft im Browser, ohne Server und ohne Anmeldung.
   Fortschritt wird nur auf dem eigenen Gerät gespeichert.
   ========================================================== */
(function () {
  'use strict';

  /* ---------- Kursaufbau ---------- */
  const STATIONS = [
    { id: 's1', file: 'station1.html', emoji: '📱', title: 'China in deinem Alltag', short: 'Alltag & Lieferketten',
      badge: 'Lieferketten-Detektiv', acts: ['s1-video', 's1-audio', 's1-chart', 's1-order', 's1-sort', 's1-quiz'] },
    { id: 's2', file: 'station2.html', emoji: '🗺️', title: 'Warum leben die meisten im Osten?', short: 'Naturraum & Bevölkerung',
      badge: 'Kartenprofi', acts: ['s2-video', 's2-audio', 's2-chart', 's2-sort', 's2-cloze', 's2-quiz'] },
    { id: 's3', file: 'station3.html', emoji: '🏭', title: 'Die „Werkbank der Welt“', short: 'Wirtschaft & Export',
      badge: 'Wirtschaftsexperte', acts: ['s3-video', 's3-audio', 's3-chart', 's3-order', 's3-cloze', 's3-quiz'] },
    { id: 's4', file: 'station4.html', emoji: '🏙️', title: 'Warum wachsen Chinas Städte?', short: 'Verstädterung',
      badge: 'Stadtplaner', acts: ['s4-video', 's4-audio', 's4-chart', 's4-order', 's4-sort', 's4-quiz'] },
    { id: 's5', file: 'station5.html', emoji: '👨‍👩‍👦', title: 'Ein Kind – und dann?', short: 'Ein-Kind-Politik',
      badge: 'Bevölkerungsforscher', acts: ['s5-audio', 's5-video', 's5-chart', 's5-chain', 's5-421', 's5-debate', 's5-quiz'] }
  ];
  const EXTRA = { games: ['g-cross', 'g-memory', 'g-words', 'g-emoji', 'g-speed'], final: 'final' };

  /* ---------- Speicher ---------- */
  const KEY = 'chinaKurs.v1';
  function load() {
    try { return Object.assign({ xp: 0, done: {}, name: '', best: {} }, JSON.parse(localStorage.getItem(KEY)) || {}); }
    catch (e) { return { xp: 0, done: {}, name: '', best: {} }; }
  }
  let state = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* privat-Modus */ } }

  /* ---------- Helfer ---------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid.nodeType ? kid : document.createTextNode(kid));
    return el;
  }
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmt = (n, d) => Number(n).toLocaleString('de-DE', { maximumFractionDigits: d == null ? 1 : d, minimumFractionDigits: d || 0 });
  function root(sel) { return typeof sel === 'string' ? $(sel) : sel; }

  /* ---------- Fortschritt, XP, Abzeichen ---------- */
  function isDone(id) { return !!state.done[id]; }
  function stationProgress(st) { const d = st.acts.filter(isDone).length; return { done: d, total: st.acts.length, pct: Math.round(100 * d / st.acts.length) }; }
  function complete(id, xp, msg) {
    const sec = document.querySelector('[data-act="' + id + '"]');
    if (sec) sec.classList.add('is-done');
    if (state.done[id]) { updateHud(); return false; }
    state.done[id] = Date.now();
    state.xp += xp || 10;
    save();
    toast((msg || 'Geschafft!') + '  +' + (xp || 10) + ' XP ⭐');
    updateHud();
    const st = STATIONS.find(s => s.acts.includes(id));
    if (st && stationProgress(st).done === st.acts.length && !state.done['badge-' + st.id]) {
      state.done['badge-' + st.id] = Date.now(); save();
      setTimeout(() => badgeModal(st), 900);
    }
    return true;
  }
  function badgeModal(st) {
    confetti();
    const idx = STATIONS.indexOf(st);
    const next = STATIONS[idx + 1];
    const m = h('div', { class: 'modal', onclick: e => { if (e.target === m) m.remove(); } },
      h('div', { class: 'box' },
        h('div', { class: 'medal' }, '🏅'),
        h('h2', null, 'Abzeichen: ' + st.badge),
        h('p', null, 'Station ' + (idx + 1) + ' komplett! Du hast alle Aufgaben zu „' + st.title + '“ gelöst.'),
        h('div', { class: 'row', style: 'justify-content:center' },
          next ? h('a', { class: 'btn', href: next.file }, 'Weiter zu Station ' + (idx + 2) + ' →')
               : h('a', { class: 'btn', href: 'abschluss.html' }, 'Zum Abschlusstest →'),
          h('button', { class: 'btn ghost', onclick: () => m.remove() }, 'Hierbleiben'))));
    document.body.append(m);
  }
  let toastEl, toastT;
  function toast(t) {
    if (!toastEl) { toastEl = h('div', { class: 'toast', role: 'status' }); document.body.append(toastEl); }
    toastEl.textContent = t; toastEl.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('show'), 2600);
  }
  function confetti() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const c = h('canvas', { class: 'confetti' }); document.body.append(c);
    const ctx = c.getContext('2d'); const W = c.width = innerWidth, H = c.height = innerHeight;
    const cols = ['#c0392b', '#e9a319', '#1f8a70', '#2d6cdf', '#7b4fa0', '#ff8a7d'];
    const ps = Array.from({ length: 140 }, () => ({ x: W / 2 + (Math.random() - .5) * 200, y: H * .45, vx: (Math.random() - .5) * 14, vy: -Math.random() * 14 - 4, r: Math.random() * 6 + 4, c: cols[Math.floor(Math.random() * cols.length)], a: Math.random() * 6 }));
    let f = 0;
    (function step() {
      ctx.clearRect(0, 0, W, H);
      ps.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += .35; p.vx *= .99; p.a += .2; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c; ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); ctx.restore(); });
      if (++f < 160) requestAnimationFrame(step); else c.remove();
    })();
  }

  /* ---------- Kopfzeile ---------- */
  let hud;
  function initPage(opt) {
    opt = opt || {};
    const st = STATIONS.find(s => s.id === opt.station);
    hud = h('header', { class: 'hud' },
      h('div', { class: 'hud-in' },
        opt.home ? h('a', { class: 'back', href: '../index.html', title: 'Zur Übersicht aller Fächer' }, '📚')
                 : h('a', { class: 'back', href: 'index.html' }, '← Kurs'),
        h('div', { class: 't' }, opt.title || (st ? 'Station ' + (STATIONS.indexOf(st) + 1) + ' · ' + st.short : 'China')),
        h('span', { class: 'pill xp', title: 'Erfahrungspunkte' }, '⭐ ', h('b', { id: 'hudxp' }, String(state.xp)), ' XP'),
        h('button', { class: 'iconbtn', title: 'Hell/Dunkel umschalten', 'aria-label': 'Hell/Dunkel umschalten', onclick: toggleTheme }, '◐')),
      h('div', { class: 'bar' }, h('i', { id: 'hudbar' })));
    document.body.prepend(hud);
    hud._st = st;
    try { const t = localStorage.getItem('chinaKurs.theme'); if (t) document.documentElement.dataset.theme = t; } catch (e) {}
    footer();
    // bereits erledigte Abschnitte markieren
    $$('[data-act]').forEach(s => { if (isDone(s.dataset.act)) s.classList.add('is-done'); });
    updateHud();
  }
  function toggleTheme() {
    const r = document.documentElement;
    const dark = r.dataset.theme ? r.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    r.dataset.theme = dark ? 'light' : 'dark';
    try { localStorage.setItem('chinaKurs.theme', r.dataset.theme); } catch (e) {}
  }
  function updateHud() {
    const x = $('#hudxp'); if (x) x.textContent = state.xp;
    const b = $('#hudbar'); if (!b) return;
    let pct;
    if (hud && hud._st) pct = stationProgress(hud._st).pct;
    else { const all = STATIONS.flatMap(s => s.acts); pct = Math.round(100 * all.filter(isDone).length / all.length); }
    b.style.width = pct + '%';
  }
  function footer() {
    const f = h('footer', { class: 'foot' });
    if (Speech.ok) {
      const sel = h('select', { 'aria-label': 'Vorlesestimme' });
      const fill = () => {
        const vs = Speech.voices();
        sel.innerHTML = '';
        if (!vs.length) { sel.append(h('option', null, 'Keine deutsche Stimme gefunden')); return; }
        vs.forEach(v => sel.append(h('option', { value: v.name, selected: Speech.voice && v.name === Speech.voice.name }, v.name)));
      };
      fill(); speechSynthesis.addEventListener && speechSynthesis.addEventListener('voiceschanged', fill);
      sel.onchange = () => { Speech.setVoice(sel.value); toast('Stimme gewechselt'); Speech.say('Hallo! So klinge ich.'); };
      f.append(h('div', { class: 'row' }, h('span', null, '🔊 Vorlesestimme:'), sel));
    }
    f.append(h('p', { class: 'small', style: 'margin-top:10px' }, 'Selbstlernkurs China · GPG M10 · Mister Black. Dein Fortschritt wird nur in diesem Browser gespeichert.'));
    document.body.append(f);
  }

  /* ---------- Sprachausgabe (Vorlesen) ---------- */
  const Speech = {
    ok: typeof window.speechSynthesis !== 'undefined' && typeof window.SpeechSynthesisUtterance !== 'undefined',
    voice: null, rate: 1, token: 0,
    voices() {
      if (!this.ok) return [];
      return speechSynthesis.getVoices().filter(v => /^de(-|_|$)/i.test(v.lang));
    },
    pick() {
      const vs = this.voices(); if (!vs.length) return null;
      let saved; try { saved = localStorage.getItem('chinaKurs.voice'); } catch (e) {}
      const s = saved && vs.find(v => v.name === saved);
      if (s) return (this.voice = s);
      const pref = [/natural|neural|online/i, /google/i, /premium|enhanced|verbessert/i, /anna|petra|helena|katja|marlene|vicki|yannick|markus/i];
      for (const re of pref) { const v = vs.find(v => re.test(v.name)); if (v) return (this.voice = v); }
      return (this.voice = vs.find(v => /de-DE/i.test(v.lang)) || vs[0]);
    },
    setVoice(name) { const v = this.voices().find(v => v.name === name); if (v) { this.voice = v; try { localStorage.setItem('chinaKurs.voice', name); } catch (e) {} } },
    split(text) {
      return String(text).replace(/\s+/g, ' ').match(/[^.!?…]+[.!?…]+["“”«»]?|[^.!?…]+$/g)?.map(s => s.trim()).filter(Boolean) || [];
    },
    /** Liest Sätze nacheinander. Rückgabe: Funktion zum Abbrechen. */
    speak(sentences, { onSentence, onEnd, rate } = {}) {
      const my = ++this.token;
      if (!this.ok) { onEnd && onEnd(false); return () => {}; }
      speechSynthesis.cancel();
      if (!this.voice) this.pick();
      let i = 0;
      const next = () => {
        if (my !== this.token) return;
        if (i >= sentences.length) { onEnd && onEnd(true); return; }
        const u = new SpeechSynthesisUtterance(sentences[i]);
        u.lang = (this.voice && this.voice.lang) || 'de-DE';
        if (this.voice) u.voice = this.voice;
        u.rate = rate || this.rate;
        const idx = i, est = 600 + sentences[i].split(' ').length * 380 / (u.rate || 1);
        let fired = false, started = 0;
        const go = () => {
          if (fired) return; fired = true; clearTimeout(guard);
          // Endet ein Satz viel zu früh, kann der Browser nicht wirklich sprechen: dann im Lesetempo weiter
          const spent = performance.now() - t0;
          if (spent < est * 0.35) { if (!started && onSentence && my === this.token) onSentence(idx); setTimeout(() => { i++; next(); }, est - spent); }
          else { i++; next(); }
        };
        const t0 = performance.now();
        u.onstart = () => { started = 1; onSentence && my === this.token && onSentence(idx); };
        u.onend = go; u.onerror = go;
        // Sicherheitsnetz, falls ein Browser "onend" verschluckt
        const guard = setTimeout(go, 1500 + sentences[i].length * 110 / (u.rate || 1));
        speechSynthesis.speak(u);
      };
      // Chrome braucht einen Moment nach cancel()
      setTimeout(next, 60);
      return () => { if (my === this.token) { this.token++; speechSynthesis.cancel(); } };
    },
    stop() { this.token++; if (this.ok) speechSynthesis.cancel(); },
    say(text) { return this.speak(this.split(text)); }
  };
  if (Speech.ok) {
    Speech.pick();
    if (speechSynthesis.addEventListener) speechSynthesis.addEventListener('voiceschanged', () => { if (!Speech.voice) Speech.pick(); });
    addEventListener('pagehide', () => speechSynthesis.cancel());
  }

  /* ---------- Hörtext-Player ---------- */
  /* opt: { id, title, sub, paras:[ 'Text' | {h:'Zwischenüberschrift'} ], src?: 'audio/datei.mp3', xp } */
  function audio(sel, opt) {
    const el = root(sel);
    const sents = []; // {text, span}
    const tr = h('div', { class: 'transcript' });
    opt.paras.forEach(p => {
      if (typeof p === 'object' && p.h) {
        const hd = h('h4', null, p.h); tr.append(hd);
        sents.push({ text: p.h + '.', span: hd }); return;
      }
      const para = h('p');
      Speech.split(p).forEach(s => {
        const sp = h('span', { class: 's' }, s + ' ');
        sents.push({ text: s, span: sp });
        para.append(sp);
      });
      tr.append(para);
    });
    sents.forEach((s, i) => s.span.addEventListener('click', () => startAt(i)));
    const playBtn = h('button', { class: 'play', 'aria-label': 'Abspielen' }, '▶');
    const progI = h('i');
    const status = h('span', { class: 'small muted' }, 'ca. ' + Math.max(1, Math.round(sents.reduce((a, s) => a + s.text.split(' ').length, 0) / 140)) + ' Min. · Tippe auf einen Satz, um dort zu starten');
    const rates = [0.8, 1, 1.2];
    const seg = h('div', { class: 'seg' }, rates.map(r => h('button', { class: r === 1 ? 'on' : '', onclick: e => { Speech.rate = r; $$('button', seg).forEach(b => b.classList.toggle('on', b === e.target)); if (playing) startAt(cur); } }, r === 1 ? 'normal' : (r < 1 ? 'langsam' : 'schnell'))));
    const hideBtn = h('button', { class: 'btn ghost small', onclick: () => { tr.classList.toggle('hidden'); hideBtn.textContent = tr.classList.contains('hidden') ? '📄 Text zeigen' : '🙈 Text verstecken (nur hören)'; } }, '🙈 Text verstecken (nur hören)');
    const box = h('div', { class: 'player' },
      h('div', { class: 'ph' }, playBtn, h('div', { class: 'meta' }, h('b', null, '🎧 ' + opt.title), opt.sub ? h('span', { class: 'small muted' }, opt.sub) : null, h('div', { class: 'prog' }, progI))),
      h('div', { class: 'ctrl' }, h('span', { class: 'lab' }, 'Tempo'), seg, h('button', { class: 'btn ghost small', onclick: () => startAt(0) }, '⏮ Von vorn'), hideBtn),
      Speech.ok || opt.src ? null : h('div', { class: 'nospeech' }, 'Dein Browser kann leider nicht vorlesen. Lies den Text einfach selbst – das zählt genauso!'),
      tr,
      h('div', { class: 'ctrl', style: 'border:0' }, status));
    el.append(box);

    let cur = 0, playing = false, cancel = null, maxReached = 0;
    let audioEl = null;
    if (opt.src) {
      audioEl = h('audio', { preload: 'metadata', src: opt.src });
      audioEl.addEventListener('error', () => { audioEl = null; }); // Datei fehlt -> Vorlesestimme
      audioEl.addEventListener('timeupdate', () => {
        if (!audioEl.duration) return;
        const p = audioEl.currentTime / audioEl.duration; progI.style.width = (p * 100) + '%';
        const i = Math.min(sents.length - 1, Math.floor(p * sents.length)); mark(i);
        if (p > .9) finish();
      });
      audioEl.addEventListener('ended', () => { setPlaying(false); finish(); });
      box.append(audioEl);
    }
    function mark(i) {
      sents.forEach((s, k) => s.span.classList.toggle('now', k === i));
      cur = i; maxReached = Math.max(maxReached, i);
      progI.style.width = Math.round(100 * (i + 1) / sents.length) + '%';
      const s = sents[i].span, top = s.offsetTop - tr.offsetTop;
      if (top < tr.scrollTop || top > tr.scrollTop + tr.clientHeight - 60) tr.scrollTo({ top: top - 40, behavior: 'smooth' });
      if (maxReached >= sents.length - 2) finish();
    }
    function setPlaying(p) { playing = p; playBtn.textContent = p ? '⏸' : '▶'; playBtn.setAttribute('aria-label', p ? 'Pause' : 'Abspielen'); }
    function finish() { complete(opt.id, opt.xp || 10, 'Hörtext geschafft'); }
    function startAt(i) {
      if (audioEl) { if (audioEl.duration) audioEl.currentTime = audioEl.duration * i / sents.length; audioEl.play(); setPlaying(true); return; }
      if (!Speech.ok) { mark(i); return; }
      stopAll(); setPlaying(true);
      cancel = Speech.speak(sents.slice(i).map(s => s.text), {
        onSentence: k => mark(i + k),
        onEnd: ok => { setPlaying(false); if (ok) { finish(); cur = 0; } }
      });
    }
    function stopAll() { if (cancel) cancel(); cancel = null; }
    playBtn.onclick = () => {
      if (audioEl) { if (audioEl.paused) { audioEl.play(); setPlaying(true); } else { audioEl.pause(); setPlaying(false); } return; }
      if (playing) { stopAll(); setPlaying(false); } else startAt(cur);
    };
    if (!Speech.ok && !opt.src) {
      // Ohne Vorlesefunktion: Lesen bis zum Ende zählt
      tr.addEventListener('scroll', () => { if (tr.scrollTop + tr.clientHeight >= tr.scrollHeight - 30) finish(); });
      el.append(h('div', { class: 'row', style: 'margin-top:8px' }, h('button', { class: 'btn small', onclick: finish }, '✔ Ich habe den Text gelesen')));
    }
    players.push(() => { stopAll(); setPlaying(false); if (audioEl) audioEl.pause(); });
  }
  const players = [];
  function stopOthers() { players.forEach(f => f()); }

  /* ---------- Erklärfilm ---------- */
  /* opt: { id, title, scenes:[{ svg:'<g>..</g>' | fn, say:'Sprechertext' }], xp } */
  function video(sel, opt) {
    const el = root(sel);
    const stage = h('div', { class: 'stage' });
    const cap = h('div', { class: 'cap' }, h('span'));
    const dots = h('div', { class: 'dots' }, opt.scenes.map((s, i) => h('i', { title: 'Szene ' + (i + 1), onclick: () => go(i, true) }, h('b'))));
    const bPlay = h('button', { title: 'Abspielen/Pause', 'aria-label': 'Abspielen oder Pause' }, '▶');
    const bPrev = h('button', { title: 'Zurück', 'aria-label': 'Vorherige Szene' }, '⏮');
    const bNext = h('button', { title: 'Weiter', 'aria-label': 'Nächste Szene' }, '⏭');
    const bCC = h('button', { class: 'on', title: 'Untertitel', 'aria-label': 'Untertitel an/aus' }, 'CC');
    const bSnd = h('button', { title: 'Ton an/aus', 'aria-label': 'Ton an oder aus' }, Speech.ok ? '🔊' : '🔇');
    const bFs = h('button', { title: 'Vollbild', 'aria-label': 'Vollbild' }, '⛶');
    const total = opt.scenes.reduce((a, s) => a + Speech.split(s.say).join(' ').split(' ').length, 0);
    const mins = Math.max(1, Math.round(total / 130 * 60));
    const ov = h('div', { class: 'overlay' }, h('div', null,
      h('button', { class: 'big', 'aria-label': 'Film starten' }, '▶'),
      h('h3', null, '🎬 ' + opt.title),
      h('div', { class: 'small' }, 'Erklärfilm · ca. ' + Math.floor(mins / 60) + ':' + String(mins % 60).padStart(2, '0') + ' Min. · ' + opt.scenes.length + ' Szenen')));
    stage.append(cap, ov);
    const box = h('div', { class: 'video' }, stage, h('div', { class: 'vbar' }, bPlay, bPrev, bNext, dots, bCC, bSnd, bFs));
    el.append(box);
    let i = 0, playing = false, sound = Speech.ok, cancel = null, timer = null, started = false, t0 = 0, dur = 1, raf;
    function render(k) {
      const sc = opt.scenes[k];
      const inner = typeof sc.svg === 'function' ? sc.svg() : sc.svg;
      const old = $('svg.scene', stage); if (old) old.remove();
      stage.insertAdjacentHTML('afterbegin', '<svg class="scene" viewBox="0 0 800 450" role="img" aria-label="' + esc(opt.title + ', Szene ' + (k + 1)) + '">' + inner + '</svg>');
      $$('i', dots).forEach((d, n) => { d.classList.toggle('past', n < k); d.classList.toggle('cur', n === k); $('b', d).style.width = '0'; });
    }
    function caption(t) { $('span', cap).textContent = t || ''; }
    function clear() { if (cancel) cancel(); cancel = null; clearTimeout(timer); cancelAnimationFrame(raf); }
    function progress() {
      const d = $$('i', dots)[i]; if (!d) return;
      const p = Math.min(1, (performance.now() - t0) / dur);
      $('b', d).style.width = (p * 100) + '%';
      if (playing) raf = requestAnimationFrame(progress);
    }
    function playScene() {
      clear();
      const sc = opt.scenes[i];
      const sents = Speech.split(sc.say);
      const words = sc.say.split(/\s+/).length;
      dur = Math.max(3500, words * 400 / Speech.rate); t0 = performance.now(); progress();
      const after = () => { if (!playing) return; timer = setTimeout(() => { if (i < opt.scenes.length - 1) { i++; render(i); playScene(); } else end(); }, 700); };
      if (sound) {
        cancel = Speech.speak(sents, { onSentence: k => caption(sents[k]), onEnd: ok => { if (ok) after(); } });
      } else {
        // ohne Ton: Untertitel satzweise nach Lesetempo
        let k = 0;
        const step = () => {
          if (!playing) return;
          if (k >= sents.length) { after(); return; }
          caption(sents[k]); timer = setTimeout(step, Math.max(2200, sents[k].split(' ').length * 380));
          k++;
        };
        step();
      }
    }
    function setPlaying(p) {
      playing = p; bPlay.textContent = p ? '⏸' : '▶';
      stage.classList.toggle('paused', !p);
    }
    function play() {
      stopOthers();
      ov.classList.add('hidden'); started = true; setPlaying(true); playScene();
    }
    function pause() { setPlaying(false); clear(); }
    function go(k, user) {
      i = Math.max(0, Math.min(opt.scenes.length - 1, k)); render(i);
      if (!started) { ov.classList.add('hidden'); started = true; }
      if (playing || user) { setPlaying(true); playScene(); }
    }
    function end() {
      setPlaying(false); clear(); caption('');
      $$('i', dots).forEach(d => d.classList.add('past'));
      complete(opt.id, opt.xp || 15, 'Film geschaut');
      ov.innerHTML = '';
      ov.append(h('div', null, h('div', { style: 'font-size:48px' }, '🎉'), h('h3', null, 'Film zu Ende!'),
        h('div', { class: 'row', style: 'justify-content:center;margin-top:10px' },
          h('button', { class: 'btn gold', onclick: () => { i = 0; render(0); play(); } }, '↻ Nochmal'),
          opt.next ? h('a', { class: 'btn', href: opt.next }, 'Weiter ↓') : null)));
      ov.classList.remove('hidden');
    }
    $('.big', ov).onclick = () => play();
    bPlay.onclick = () => { if (!started || !ov.classList.contains('hidden')) { if (i >= opt.scenes.length - 1 && started) i = 0, render(0); play(); } else if (playing) pause(); else { setPlaying(true); playScene(); } };
    bPrev.onclick = () => go(i - 1, true);
    bNext.onclick = () => { if (i >= opt.scenes.length - 1) end(); else go(i + 1, true); };
    bCC.onclick = () => { cap.classList.toggle('hidden'); bCC.classList.toggle('on'); };
    bSnd.onclick = () => {
      if (!Speech.ok) { toast('Dein Browser kann leider nicht vorlesen – Untertitel sind an.'); return; }
      sound = !sound; bSnd.textContent = sound ? '🔊' : '🔇'; if (playing) playScene();
    };
    bFs.onclick = () => { if (document.fullscreenElement) document.exitFullscreen(); else if (box.requestFullscreen) box.requestFullscreen().catch(() => {}); };
    render(0); stage.classList.add('paused');
    players.push(() => { if (playing) pause(); });
  }

  /* ---------- China-Karte ---------- */
  const CN = [[123.5,53.5],[126.0,52.8],[127.5,49.8],[130.6,48.9],[134.7,48.3],[133.1,45.1],[131.2,44.9],[131.0,42.9],[130.6,42.4],[128.9,42.0],[127.0,41.6],[124.3,39.9],[122.2,40.4],[121.2,39.0],[121.6,38.8],[120.7,40.3],[119.5,39.8],[118.1,39.1],[117.7,38.6],[118.9,37.5],[120.7,37.8],[122.5,37.3],[120.3,36.0],[119.2,34.8],[120.3,33.8],[120.9,32.1],[121.9,30.9],[121.9,29.9],[121.4,28.7],[120.6,27.8],[119.6,26.0],[118.1,24.5],[116.6,23.3],[115.0,22.7],[114.2,22.3],[113.0,22.0],[111.7,21.6],[110.4,20.4],[109.9,21.4],[108.5,21.6],[107.4,21.6],[106.7,22.8],[105.3,23.3],[103.9,22.6],[102.2,22.4],[101.6,21.2],[100.2,21.5],[99.3,22.1],[99.5,23.0],[98.7,24.1],[97.6,23.9],[97.8,25.5],[98.7,27.5],[97.4,28.3],[96.2,29.0],[94.6,29.2],[92.5,27.8],[91.6,27.9],[89.6,28.2],[88.9,27.3],[88.1,27.9],[86.0,27.9],[84.0,28.7],[82.0,30.1],[81.2,30.0],[79.5,31.0],[78.7,32.5],[79.4,33.5],[78.9,34.3],[78.0,35.5],[76.2,35.8],[74.9,37.2],[73.6,38.6],[73.5,39.4],[74.9,40.4],[76.7,40.9],[78.5,41.5],[80.2,42.1],[80.3,43.0],[80.8,44.9],[82.5,45.2],[83.0,47.2],[85.5,47.0],[87.3,49.1],[88.8,48.1],[90.3,47.6],[91.0,46.0],[90.7,45.3],[93.5,44.9],[96.4,42.7],[100.8,42.6],[105.0,41.6],[107.0,42.4],[110.4,42.8],[111.9,43.7],[111.9,45.1],[114.5,45.4],[116.7,46.4],[119.7,46.7],[119.0,47.6],[116.0,47.8],[115.5,48.1],[117.8,49.5],[119.3,50.3],[120.6,52.6]];
  const HAINAN = [[108.6,19.2],[109.5,18.2],[110.6,18.6],[111.0,19.7],[110.3,20.1],[109.2,20.0]];
  const TAIWAN = [[120.1,23.0],[120.8,22.0],[121.6,23.5],[121.9,25.0],[121.4,25.3],[120.2,23.8]];
  const CITIES = {
    'Peking': [116.4, 39.9], 'Shanghai': [121.5, 31.2], 'Shenzhen': [114.1, 22.6], 'Guangzhou': [113.3, 23.1], 'Hongkong': [114.2, 22.3],
    'Chengdu': [104.1, 30.7], 'Chongqing': [106.5, 29.6], 'Wuhan': [114.3, 30.6], 'Xi’an': [108.9, 34.3], 'Lhasa': [91.1, 29.6],
    'Ürümqi': [87.6, 43.8], 'Kaschgar': [76.0, 39.5], 'Tianjin': [117.2, 39.1], 'Ningbo': [121.6, 29.9], 'Qingdao': [120.4, 36.1], 'Harbin': [126.6, 45.8]
  };
  const RIVERS = {
    huang: [[96,35],[99,35.4],[101.7,36.1],[103.8,36.1],[105.5,37.5],[106.5,39],[107.5,40.6],[110,40.6],[111.2,40.2],[111.4,37],[110.4,35],[111.5,34.8],[113.6,34.9],[115.5,35.6],[116.9,36.7],[118.9,37.6]],
    jangtse: [[91,33],[94,33.2],[97,31.8],[99.3,28],[100.2,26.8],[102.7,26.1],[104.6,28.8],[106.5,29.6],[108.3,30.6],[110.4,31],[112.5,30.3],[114.3,30.6],[116,29.8],[117,30.5],[118.8,32.1],[121.8,31.4]]
  };
  /** Projektion in ein Rechteck (x,y,w,h). Rückgabe: Funktion [lon,lat] -> [x,y] */
  function proj(x, y, w, hgt) {
    const L0 = 72, L1 = 136, B1 = 54.5, B0 = 17, k = 0.81;
    const s = Math.min(w / ((L1 - L0) * k), hgt / (B1 - B0));
    const ox = x + (w - (L1 - L0) * k * s) / 2, oy = y + (hgt - (B1 - B0) * s) / 2;
    return ([lo, la]) => [ox + (lo - L0) * k * s, oy + (B1 - la) * s];
  }
  function pathOf(pts, p) { return 'M' + pts.map(q => p(q).map(n => n.toFixed(1)).join(',')).join('L'); }
  function inPoly(pt, poly) {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if (((yi > pt[1]) !== (yj > pt[1])) && (pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi)) c = !c;
    }
    return c;
  }
  /* Hu-Linie: Heihe (127.5,50.2) – Tengchong (98.5,25.0). Östlich davon lebt der Großteil der Menschen. */
  const HU = [[127.5, 50.2], [98.5, 25.0]];
  function eastOfHu([lo, la]) { const [[x1, y1], [x2, y2]] = HU; return ((x2 - x1) * (la - y1) - (y2 - y1) * (lo - x1)) > 0; }
  let seed = 7, uid = 0;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  /** opt: { x,y,w,h, cities:[names], rivers:bool, hu:bool, dots:bool|n, split:bool, fill, labels:bool, cls } -> SVG-String */
  function map(opt) {
    const o = Object.assign({ x: 0, y: 0, w: 800, h: 450, cities: [], rivers: false, hu: false, dots: false, split: false, fill: 'var(--land)', labels: true }, opt);
    const p = proj(o.x, o.y, o.w, o.h);
    let s = '<g class="' + (o.cls || '') + '">';
    s += '<path d="' + pathOf(TAIWAN, p) + 'Z" fill="#c9c9c9" stroke="#999" stroke-width=".8"/>';
    if (o.split) {
      const id = 'cpE' + (++uid);
      s += '<clipPath id="' + id + '"><path d="' + pathOf(CN, p) + 'Z"/></clipPath>';
      const a = p(HU[0]), b = p(HU[1]);
      const dx = b[0] - a[0], dy = b[1] - a[1], L = 3;
      const A = [a[0] - dx * L, a[1] - dy * L], B = [b[0] + dx * L, b[1] + dy * L];
      s += '<g clip-path="url(#' + id + ')"><path d="' + pathOf(CN, p) + 'Z" fill="' + (o.westFill || '#e8d9b5') + '"/>' +
        '<path d="M' + A + 'L' + B + 'L' + (B[0] + 2000) + ',' + (B[1] + 2000) + 'L' + (A[0] + 2000) + ',' + A[1] + 'Z" fill="' + (o.eastFill || '#9fd3a8') + '"/></g>';
      s += '<path d="' + pathOf(CN, p) + 'Z" fill="none" stroke="#7a6230" stroke-width="1.5"/>';
    } else {
      s += '<path d="' + pathOf(CN, p) + 'Z" fill="' + o.fill + '" stroke="#7a6230" stroke-width="1.5" stroke-linejoin="round"/>';
    }
    s += '<path d="' + pathOf(HAINAN, p) + 'Z" fill="' + (o.split ? (o.eastFill || '#9fd3a8') : o.fill) + '" stroke="#7a6230" stroke-width="1"/>';
    if (o.dots) {
      seed = 11; const n = o.dots === true ? 420 : o.dots; let made = 0, tries = 0, dd = '';
      while (made < n && tries < 40000) {
        tries++;
        const q = [73 + rnd() * 62, 18 + rnd() * 36];
        if (!inPoly(q, CN)) continue;
        const east = eastOfHu(q);
        // ca. 94 % der Menschen östlich der Hu-Linie; Küste noch dichter
        const coast = q[0] > 112 && q[1] < 41 ? 1.6 : 1;
        if (rnd() > (east ? 0.95 * coast : 0.06)) continue;
        const [X, Y] = p(q);
        dd += '<circle cx="' + X.toFixed(1) + '" cy="' + Y.toFixed(1) + '" r="1.7"/>';
        made++;
      }
      s += '<g fill="' + (o.dotFill || '#c0392b') + '" opacity=".75" class="' + (o.dotCls || '') + '">' + dd + '</g>';
    }
    if (o.rivers) {
      s += '<g fill="none" stroke="#2d6cdf" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" class="' + (o.riverCls || '') + '">' +
        '<path d="' + pathOf(RIVERS.huang, p) + '" style="--len:900"/><path d="' + pathOf(RIVERS.jangtse, p) + '" style="--len:1000"/></g>';
      if (o.labels) {
        const a = p([108, 41.3]), b = p([110.5, 31.6]);
        s += '<text x="' + a[0] + '" y="' + a[1] + '" font-size="13" fill="#2d6cdf" font-weight="700">Huang He</text>' +
          '<text x="' + b[0] + '" y="' + (b[1] - 6) + '" font-size="13" fill="#2d6cdf" font-weight="700">Jangtsekiang</text>';
      }
    }
    if (o.hu) {
      const a = p(HU[0]), b = p(HU[1]);
      s += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="#1f2430" stroke-width="2.5" stroke-dasharray="8 6" class="' + (o.huCls || '') + '" style="--len:700"/>';
    }
    o.cities.forEach((c, n) => {
      const ll = CITIES[c]; if (!ll) return;
      const [X, Y] = p(ll);
      s += '<g class="a-pop" style="--d:' + ((o.cityDelay || 0) + n * 0.25) + 's"><circle cx="' + X + '" cy="' + Y + '" r="5" fill="#1f2430" stroke="#fff" stroke-width="2"/>' +
        (o.labels ? '<text x="' + (X + 8) + '" y="' + (Y + 4) + '" font-size="14" font-weight="800" fill="#1f2430" paint-order="stroke" stroke="#fff" stroke-width="3">' + c + '</text>' : '') + '</g>';
    });
    return s + '</g>';
  }

  /* ---------- Diagramme ---------- */
  function chartBox(el, opt) {
    const box = h('figure', { class: 'chart', style: 'margin:0' },
      opt.title ? h('h3', null, opt.title) : null,
      opt.sub ? h('div', { class: 'sub' }, opt.sub) : null);
    root(el).append(box);
    return box;
  }
  function addFoot(box, opt) {
    const r = h('div', { class: 'row', style: 'justify-content:space-between;margin-top:6px' },
      opt.source ? h('div', { class: 'src' }, 'Quelle: ' + opt.source) : h('span'),
      opt.noToggle ? null : h('button', { class: 'btn ghost small', onclick: e => { box.classList.toggle('showvals'); e.target.textContent = box.classList.contains('showvals') ? 'Werte ausblenden' : 'Alle Werte zeigen'; } }, 'Alle Werte zeigen'));
    box.append(r);
    // Antippen eines Punktes zeigt seinen Wert
    box.addEventListener('click', e => { const p = e.target.closest('.pt'); if (!p) return; $$('.pt.act', box).forEach(q => q !== p && q.classList.remove('act')); p.classList.toggle('act'); });
  }
  function onVisible(el, fn) {
    if (!('IntersectionObserver' in window)) { fn(); return; }
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); fn(); } }, { threshold: .3 });
    io.observe(el);
  }
  /* Liniendiagramm. opt: { title, sub, series:[{name,color,data:[[x,y],...], dash}], yMax, yMin, yStep, unit, xLabel, yLabel, source, marks:[{x,label}] } */
  function line(el, opt) {
    const box = chartBox(el, opt);
    const W = 640, H = 330, L = 52, R = 18, T = 18, B = 40;
    const xs = opt.series.flatMap(s => s.data.map(d => d[0]));
    const x0 = opt.xMin != null ? opt.xMin : Math.min(...xs), x1 = opt.xMax != null ? opt.xMax : Math.max(...xs);
    const y0 = opt.yMin || 0, y1 = opt.yMax, ys = opt.yStep || (y1 - y0) / 5;
    const X = x => L + (x - x0) / (x1 - x0) * (W - L - R), Y = y => T + (1 - (y - y0) / (y1 - y0)) * (H - T - B);
    let s = '<g class="grid">';
    for (let y = y0; y <= y1 + 1e-9; y += ys) s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(y) + '" y2="' + Y(y) + '"/><text x="' + (L - 8) + '" y="' + (Y(y) + 4) + '" text-anchor="end">' + fmt(y) + '</text>';
    s += '</g>';
    const xt = opt.xTicks || Array.from(new Set(xs)).sort((a, b) => a - b);
    xt.forEach(x => { s += '<text x="' + X(x) + '" y="' + (H - B + 18) + '" text-anchor="middle">' + (opt.xFmt ? opt.xFmt(x) : x) + '</text>'; });
    s += '<line class="axis" x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(y0) + '" y2="' + Y(y0) + '"/>';
    if (opt.yLabel) s += '<text x="' + L + '" y="' + (T - 6) + '" class="lbl" font-size="11">' + esc(opt.yLabel) + '</text>';
    if (opt.xLabel) s += '<text x="' + (W - R) + '" y="' + (H - 4) + '" text-anchor="end" font-size="11">' + esc(opt.xLabel) + '</text>';
    (opt.marks || []).forEach(m => {
      s += '<line x1="' + X(m.x) + '" x2="' + X(m.x) + '" y1="' + T + '" y2="' + Y(y0) + '" stroke="var(--gold)" stroke-width="2" stroke-dasharray="4 4"/>' +
        '<text x="' + (X(m.x) + 5) + '" y="' + (T + 30) + '" font-size="11" font-weight="800" fill="var(--gold)">' + esc(m.label) + '</text>';
    });
    if (opt.band) s += '<rect x="' + X(opt.band.from) + '" y="' + T + '" width="' + (X(opt.band.to) - X(opt.band.from)) + '" height="' + (Y(y0) - T) + '" fill="var(--red)" opacity=".08"/><text x="' + ((X(opt.band.from) + X(opt.band.to)) / 2) + '" y="' + (Y(y0) - 8) + '" text-anchor="middle" font-size="11" font-weight="800" fill="var(--red)">' + esc(opt.band.label) + '</text>';
    opt.series.forEach((se, n) => {
      const d = 'M' + se.data.map(p => X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1)).join('L');
      s += '<path class="linep" d="' + d + '" fill="none" stroke="' + se.color + '" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round" ' + (se.dash ? 'stroke-dasharray="7 6"' : 'data-anim="1"') + '/>';
      se.data.forEach(p => {
        s += '<circle class="pt" cx="' + X(p[0]) + '" cy="' + Y(p[1]) + '" r="6" fill="var(--card)" stroke="' + se.color + '" stroke-width="3"><title>' + p[0] + ': ' + fmt(p[1], se.dec) + ' ' + (opt.unit || '') + '</title></circle>' +
          '<text class="tipv" x="' + X(p[0]) + '" y="' + (Y(p[1]) - 12 - (n % 2) * 0) + '" text-anchor="middle" font-size="12">' + fmt(p[1], se.dec) + (opt.unitShort || '') + '</text>';
      });
    });
    const leg = opt.series.length > 1 ? h('div', { class: 'legend' }, opt.series.map(se => h('span', null, h('i', { style: 'background:' + se.color }), se.name))) : null;
    if (leg) box.append(leg);
    box.insertAdjacentHTML('beforeend', '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(opt.title || 'Liniendiagramm') + '">' + s + '</svg>');
    addFoot(box, opt);
    const anim = $$('.linep[data-anim]', box);
    anim.forEach(p => { const L = Math.ceil(p.getTotalLength ? p.getTotalLength() : 2000) + 2; p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
    onVisible(box, () => requestAnimationFrame(() => anim.forEach(p => p.style.strokeDashoffset = '0')));
    return box;
  }
  /* Balkendiagramm (waagerecht). opt: { title, sub, items:[{label,value,color,note}], max, unit, source, dec } */
  function bars(el, opt) {
    const box = chartBox(el, opt);
    const W = 640, rowH = 40, L = opt.labelW || 170, R = 110, T = 6;
    const H = T + opt.items.length * rowH + 4;
    const max = opt.max || Math.max(...opt.items.map(i => i.value));
    let s = '';
    opt.items.forEach((it, n) => {
      const y = T + n * rowH, w = Math.max(2, (it.value / max) * (W - L - R));
      s += '<text x="' + (L - 10) + '" y="' + (y + rowH / 2 + 4) + '" text-anchor="end" class="' + (it.hi ? 'lbl' : '') + '" font-size="15">' + esc(it.label) + '</text>' +
        '<rect class="bar-r" x="' + L + '" y="' + (y + 6) + '" height="' + (rowH - 12) + '" rx="5" width="0" data-w="' + w + '" fill="' + (it.color || (it.hi ? 'var(--red)' : 'var(--sky)')) + '"/>' +
        '<text class="lbl" x="' + (L + w + 6) + '" y="' + (y + rowH / 2 + 4) + '" font-size="15">' + fmt(it.value, opt.dec) + (opt.unitShort ? ' ' + opt.unitShort : '') + '</text>';
    });
    box.insertAdjacentHTML('beforeend', '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(opt.title || 'Balkendiagramm') + '">' + s + '</svg>');
    opt.noToggle = true; addFoot(box, opt);
    onVisible(box, () => $$('.bar-r', box).forEach(r => r.setAttribute('width', r.dataset.w)));
    return box;
  }
  /* Säulendiagramm (senkrecht). opt: { items:[{label,value,color}], max, unitShort } */
  function columns(el, opt) {
    const box = chartBox(el, opt);
    const W = 640, H = 300, L = 46, R = 12, T = 22, B = 40;
    const max = opt.max || Math.max(...opt.items.map(i => i.value)) * 1.1;
    const n = opt.items.length, bw = (W - L - R) / n;
    const Y = v => T + (1 - v / max) * (H - T - B);
    let s = '<g class="grid">';
    const step = opt.yStep || max / 4;
    for (let v = 0; v <= max + 1e-9; v += step) s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(v) + '" y2="' + Y(v) + '"/><text x="' + (L - 6) + '" y="' + (Y(v) + 4) + '" text-anchor="end">' + fmt(v) + '</text>';
    s += '</g>';
    if (opt.yLabel) s += '<text x="' + L + '" y="' + (T - 8) + '" class="lbl" font-size="11">' + esc(opt.yLabel) + '</text>';
    opt.items.forEach((it, k) => {
      const x = L + k * bw + bw * .18, w = bw * .64, y = Y(it.value);
      s += '<rect class="a-grow pt" style="--d:' + (k * .08) + 's" x="' + x + '" y="' + y + '" width="' + w + '" height="' + (Y(0) - y) + '" rx="5" fill="' + (it.color || 'var(--sky)') + '"><title>' + esc(it.label) + ': ' + fmt(it.value, opt.dec) + '</title></rect>' +
        '<text class="tipv" x="' + (x + w / 2) + '" y="' + (y - 6) + '" text-anchor="middle" font-size="12">' + fmt(it.value, opt.dec) + (opt.unitShort || '') + '</text>' +
        '<text x="' + (x + w / 2) + '" y="' + (H - B + 16) + '" text-anchor="middle" font-size="12">' + esc(it.label) + '</text>' +
        (it.sub ? '<text x="' + (x + w / 2) + '" y="' + (H - B + 30) + '" text-anchor="middle" font-size="10">' + esc(it.sub) + '</text>' : '');
    });
    s += '<line class="axis" x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(0) + '" y2="' + Y(0) + '"/>';
    box.insertAdjacentHTML('beforeend', '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(opt.title || 'Säulendiagramm') + '">' + s + '</svg>');
    addFoot(box, opt);
    return box;
  }
  /* Bevölkerungspyramide. opt: { groups:['0–9',...] (unten -> oben), men:[], women:[], max, unit, source, mark:{group, label} } */
  function pyramid(el, opt) {
    const box = chartBox(el, opt);
    const W = 640, rowH = 26, C = W / 2, M = 50, T = 24;
    const n = opt.groups.length, H = T + n * rowH + 30;
    const max = opt.max || Math.max(...opt.men, ...opt.women);
    const sc = v => v / max * (C - M - 30);
    let s = '<text x="' + (C - M) + '" y="14" text-anchor="end" class="lbl" fill="var(--sky)">♂ Männer</text><text x="' + (C + M) + '" y="14" class="lbl">Frauen ♀</text>';
    for (let k = 0; k < n; k++) {
      const row = n - 1 - k, y = T + row * rowH;
      const hi = opt.mark && opt.mark.groups.includes(opt.groups[k]);
      const wm = sc(opt.men[k]), wf = sc(opt.women[k]);
      s += '<rect class="pt a-growx" style="transform-origin:right;--d:' + (k * .05) + 's" x="' + (C - M - wm) + '" y="' + (y + 3) + '" width="' + wm + '" height="' + (rowH - 6) + '" rx="4" fill="' + (hi ? 'var(--gold)' : 'var(--sky)') + '"><title>Männer ' + opt.groups[k] + ': ' + fmt(opt.men[k]) + ' ' + (opt.unit || '') + '</title></rect>' +
        '<text class="tipv" x="' + (C - M - wm - 4) + '" y="' + (y + rowH / 2 + 4) + '" text-anchor="end" font-size="11">' + fmt(opt.men[k]) + '</text>' +
        '<rect class="pt a-growx" style="--d:' + (k * .05) + 's" x="' + (C + M) + '" y="' + (y + 3) + '" width="' + wf + '" height="' + (rowH - 6) + '" rx="4" fill="' + (hi ? 'var(--gold)' : 'var(--red)') + '" opacity=".85"><title>Frauen ' + opt.groups[k] + ': ' + fmt(opt.women[k]) + ' ' + (opt.unit || '') + '</title></rect>' +
        '<text class="tipv" x="' + (C + M + wf + 4) + '" y="' + (y + rowH / 2 + 4) + '" font-size="11">' + fmt(opt.women[k]) + '</text>' +
        '<text x="' + C + '" y="' + (y + rowH / 2 + 4) + '" text-anchor="middle" font-size="11" class="lbl">' + opt.groups[k] + '</text>';
    }
    if (opt.mark) {
      const ks = opt.mark.groups.map(g => opt.groups.indexOf(g));
      const yTop = T + (n - 1 - Math.max(...ks)) * rowH;
      s += '<text x="' + (W - 4) + '" y="' + (yTop - 4) + '" text-anchor="end" font-size="11" font-weight="800" fill="var(--gold)">' + esc(opt.mark.label) + '</text>';
    }
    s += '<text x="' + C + '" y="' + (H - 6) + '" text-anchor="middle" font-size="11">' + esc(opt.unit || '') + ' · unten die Jüngsten, oben die Ältesten</text>';
    box.insertAdjacentHTML('beforeend', '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(opt.title || 'Bevölkerungspyramide') + '">' + s + '</svg>');
    addFoot(box, opt);
    return box;
  }
  /* Beliebiges SVG als Schaubild. opt: { title, sub, svg, viewBox, source } */
  function figure(el, opt) {
    const box = chartBox(el, opt);
    box.insertAdjacentHTML('beforeend', '<svg viewBox="' + (opt.viewBox || '0 0 800 450') + '" role="img" aria-label="' + esc(opt.title || 'Schaubild') + '">' + opt.svg + '</svg>');
    opt.noToggle = opt.noToggle !== false; addFoot(box, opt);
    return box;
  }

  /* ---------- Aufgabentypen ---------- */
  function fb(el, kind, html) { el.className = 'fb show ' + kind; el.innerHTML = html; }

  /* Quiz. opt: { id, xp, pass, questions:[{q, o:[...], a:index, e:'Erklärung'}], onDone(score,total) } */
  function quiz(sel, opt) {
    const el = root(sel);
    const qs = opt.shuffle === false ? opt.questions : shuffle(opt.questions);
    const box = h('div', { class: 'task' });
    el.append(box);
    let k = 0, right = 0; const res = [];
    function show() {
      box.innerHTML = '';
      if (k >= qs.length) return finish();
      const q = qs[k];
      const order = shuffle(q.o.map((t, i) => ({ t, i })));
      const f = h('div', { class: 'fb' });
      const next = h('button', { class: 'btn hidden', style: 'margin-top:10px', onclick: () => { k++; show(); } }, k < qs.length - 1 ? 'Nächste Frage →' : 'Auswertung →');
      box.append(
        h('div', { class: 'qhead' }, h('span', null, 'Frage ' + (k + 1) + ' von ' + qs.length), h('div', { class: 'qdots' }, qs.map((_, n) => h('i', { class: n < k ? (res[n] ? 'r' : 'w') : (n === k ? 'c' : '') })))),
        h('div', { class: 'prompt', html: q.q }),
        q.img ? h('div', { html: q.img, style: 'margin-bottom:10px' }) : '',
        h('div', { class: 'opts' }, order.map((o, n) => h('button', {
          class: 'opt', onclick: e => {
            const ok = o.i === q.a; res[k] = ok; if (ok) right++;
            $$('.opt', box).forEach((b, m) => { b.disabled = true; if (order[m].i === q.a) b.classList.add('right'); });
            if (!ok) e.currentTarget.classList.add('wrong');
            fb(f, ok ? 'ok' : 'bad', (ok ? '<b>Richtig!</b> ' : '<b>Leider nicht.</b> ') + (q.e || ''));
            next.classList.remove('hidden'); next.focus({ preventScroll: true });
          }
        }, h('span', { class: 'k' }, 'ABCDEF'[n]), h('span', { html: o.t })))),
        f, next);
    }
    function finish() {
      const pass = opt.pass != null ? opt.pass : Math.ceil(qs.length * 0.6);
      const ok = right >= pass;
      const key = opt.id;
      state.best[key] = Math.max(state.best[key] || 0, right); save();
      box.append(h('div', { class: 'score' },
        h('div', { style: 'font-size:46px' }, right === qs.length ? '🏆' : ok ? '🎉' : '💪'),
        h('div', { class: 'big' }, right + ' / ' + qs.length),
        h('p', null, right === qs.length ? 'Perfekt! Alles richtig.' : ok ? 'Stark – bestanden!' : 'Fast! Du brauchst ' + pass + ' richtige Antworten. Schau dir Film oder Hörtext nochmal an.'),
        h('button', { class: 'btn ghost', onclick: () => { k = 0; right = 0; res.length = 0; show(); } }, '↻ Nochmal')));
      if (ok) complete(opt.id, opt.xp || 20, 'Quiz bestanden');
      opt.onDone && opt.onDone(right, qs.length);
    }
    show();
  }

  /* Reihenfolge. opt: { id, prompt, items:[in richtiger Reihenfolge], xp, explain } */
  function order(sel, opt) {
    const el = root(sel);
    const items = opt.items.map((t, i) => ({ t, i }));
    const placed = new Array(items.length).fill(null);
    const pool = h('div', { class: 'chips pool' });
    const seq = h('div', { class: 'seq' });
    const f = h('div', { class: 'fb' });
    const box = h('div', { class: 'task' }, opt.tag ? h('div', { class: 'tag' }, opt.tag) : null, h('div', { class: 'prompt', html: opt.prompt }),
      h('p', { class: 'small muted' }, 'Tippe die Karten in der richtigen Reihenfolge an. Antippen in der Liste nimmt eine Karte wieder heraus.'),
      pool, seq, h('div', { class: 'row' }, h('button', { class: 'btn', onclick: check }, 'Prüfen'), h('button', { class: 'btn ghost', onclick: reset }, 'Neu mischen')), f);
    el.append(box);
    function draw() {
      pool.innerHTML = ''; seq.innerHTML = '';
      shuffled.forEach(it => { const used = placed.includes(it); pool.append(h('button', { class: 'chip' + (used ? ' used' : ''), onclick: () => put(it) }, it.t)); });
      placed.forEach((it, n) => seq.append(h('div', { class: 'slot' + (it ? ' filled' : '') }, it ? h('button', { class: 'chip', onclick: () => { placed[n] = null; draw(); } }, it.t) : h('span', { class: 'muted small' }, '…'))));
    }
    function put(it) { const n = placed.indexOf(null); if (n < 0) return; placed[n] = it; draw(); }
    let shuffled;
    function reset() { placed.fill(null); shuffled = shuffle(items); if (shuffled.every((x, n) => x.i === n)) shuffled.reverse(); f.className = 'fb'; draw(); }
    function check() {
      if (placed.includes(null)) { fb(f, 'info', 'Lege zuerst alle Karten in die Liste.'); return; }
      let ok = 0;
      $$('.slot', seq).forEach((s, n) => { const r = placed[n].i === n; s.classList.add(r ? 'right' : 'wrong'); if (r) ok++; });
      if (ok === items.length) { fb(f, 'ok', '<b>Perfekt!</b> ' + (opt.explain || '')); complete(opt.id, opt.xp || 15, 'Reihenfolge stimmt'); }
      else {
        fb(f, 'bad', ok + ' von ' + items.length + ' Karten liegen richtig. Die roten Karten antippen, um sie herauszunehmen, und neu legen.');
        placed.forEach((it, n) => { if (it.i !== n) placed[n] = null; });
        setTimeout(draw, 1400);
      }
    }
    reset();
  }

  /* Zuordnen. opt: { id, prompt, cats:[{id,label}], items:[{t, c}], xp, explain } */
  function sort(sel, opt) {
    const el = root(sel);
    const items = shuffle(opt.items.map((x, i) => Object.assign({ k: i }, x)));
    const where = {}; let selected = null;
    const pool = h('div', { class: 'chips pool' });
    const buckets = h('div', { class: 'buckets' });
    const f = h('div', { class: 'fb' });
    const box = h('div', { class: 'task' }, opt.tag ? h('div', { class: 'tag' }, opt.tag) : null, h('div', { class: 'prompt', html: opt.prompt }),
      h('p', { class: 'small muted' }, 'Tippe eine Karte an und dann das passende Feld. (Am Computer kannst du die Karten auch ziehen.)'),
      pool, buckets, h('div', { class: 'row', style: 'margin-top:10px' }, h('button', { class: 'btn', onclick: check }, 'Prüfen'), h('button', { class: 'btn ghost', onclick: () => { for (const k in where) delete where[k]; f.className = 'fb'; draw(); } }, 'Zurücksetzen')), f);
    el.append(box);
    function chip(it, inBucket) {
      const c = h('button', { class: 'chip' + (selected === it ? ' sel' : ''), draggable: 'true' }, it.t);
      c.onclick = e => {
        e.stopPropagation();
        if (inBucket) { if (selected) where[selected.k] = where[it.k]; else delete where[it.k]; selected = null; }
        else selected = selected === it ? null : it;
        draw();
      };
      c.ondragstart = e => { selected = it; e.dataTransfer.setData('text/plain', it.k); };
      return c;
    }
    function draw() {
      pool.innerHTML = ''; buckets.innerHTML = '';
      items.filter(it => where[it.k] == null).forEach(it => pool.append(chip(it, false)));
      if (!pool.children.length) pool.append(h('span', { class: 'muted small' }, 'Alle Karten verteilt – jetzt prüfen!'));
      opt.cats.forEach(cat => {
        const b = h('div', { class: 'bucket' + (selected ? ' hot' : '') }, h('h4', { html: cat.label }), h('div', { class: 'chips' }, items.filter(it => where[it.k] === cat.id).map(it => chip(it, true))));
        b.onclick = () => { if (selected) { where[selected.k] = cat.id; selected = null; draw(); } };
        b.ondragover = e => e.preventDefault();
        b.ondrop = e => { e.preventDefault(); if (selected) { where[selected.k] = cat.id; selected = null; draw(); } };
        buckets.append(b);
      });
    }
    function check() {
      const left = items.filter(it => where[it.k] == null).length;
      if (left) { fb(f, 'info', 'Es fehlen noch ' + left + ' Karten.'); return; }
      let ok = 0;
      opt.cats.forEach((cat, n) => {
        const chips = $$('.chip', buckets.children[n]);
        items.filter(it => where[it.k] === cat.id).forEach((it, m) => { const r = it.c === cat.id; chips[m].classList.add(r ? 'right' : 'wrong'); if (r) ok++; });
      });
      if (ok === items.length) { fb(f, 'ok', '<b>Alles richtig zugeordnet!</b> ' + (opt.explain || '')); complete(opt.id, opt.xp || 15, 'Zuordnung perfekt'); }
      else {
        fb(f, 'bad', ok + ' von ' + items.length + ' richtig. Die roten Karten wandern gleich zurück – versuch es nochmal.');
        setTimeout(() => { items.forEach(it => { if (where[it.k] !== it.c) delete where[it.k]; }); draw(); }, 1600);
      }
    }
    document.addEventListener('click', e => { if (selected && !box.contains(e.target)) { selected = null; draw(); } });
    draw();
  }

  /* Lückentext. opt: { id, prompt, text:'… {Lösung} …', extra:['Ablenker'], xp } */
  function cloze(sel, opt) {
    const el = root(sel);
    const parts = opt.text.split(/(\{[^}]+\})/);
    const answers = [];
    const f = h('div', { class: 'fb' });
    const txt = h('div', { class: 'cloze' });
    const gaps = [];
    parts.forEach(p => {
      const m = p.match(/^\{([^}]+)\}$/);
      if (m) { const g = h('button', { class: 'gap', 'aria-label': 'Lücke' }, ' '); g._ans = m[1]; g._val = null; answers.push(m[1]); gaps.push(g); txt.append(g); }
      else txt.append(h('span', { html: p }));
    });
    const bank = h('div', { class: 'chips pool' });
    const words = shuffle(answers.concat(opt.extra || []));
    let active = gaps[0];
    const box = h('div', { class: 'task' }, opt.tag ? h('div', { class: 'tag' }, opt.tag) : null, h('div', { class: 'prompt', html: opt.prompt || 'Fülle die Lücken.' }),
      h('p', { class: 'small muted' }, 'Tippe eine Lücke an (gelb markiert) und dann das passende Wort. Antippen einer gefüllten Lücke leert sie.'),
      bank, txt, h('div', { class: 'row', style: 'margin-top:12px' }, h('button', { class: 'btn', onclick: check }, 'Prüfen')), f);
    el.append(box);
    function draw() {
      gaps.forEach(g => { g.classList.toggle('act', g === active); g.textContent = g._val || ' '; });
      bank.innerHTML = '';
      const used = gaps.map(g => g._val).filter(Boolean);
      const cnt = {}; used.forEach(u => cnt[u] = (cnt[u] || 0) + 1);
      words.forEach(w => { const isUsed = cnt[w] > 0; if (isUsed) cnt[w]--; bank.append(h('button', { class: 'chip' + (isUsed ? ' used' : ''), onclick: () => fill(w) }, w)); });
    }
    function fill(w) {
      if (!active) active = gaps.find(g => !g._val) || gaps[0];
      active._val = w; active.classList.remove('right', 'wrong');
      active = gaps.find(g => !g._val) || null; draw();
    }
    gaps.forEach(g => g.onclick = () => { if (g._val) { g._val = null; g.classList.remove('right', 'wrong'); } active = g; draw(); });
    function check() {
      if (gaps.some(g => !g._val)) { fb(f, 'info', 'Fülle zuerst alle Lücken.'); return; }
      let ok = 0; gaps.forEach(g => { const r = g._val === g._ans; g.classList.add(r ? 'right' : 'wrong'); if (r) ok++; });
      if (ok === gaps.length) { fb(f, 'ok', '<b>Super, alles richtig!</b> ' + (opt.explain || '')); complete(opt.id, opt.xp || 15, 'Lückentext gelöst'); }
      else fb(f, 'bad', ok + ' von ' + gaps.length + ' richtig. Tippe die roten Lücken an und probiere ein anderes Wort.');
    }
    draw();
  }

  /* Schaubild auswerten in 3 Schritten. opt: { id, xp, steps:[{label:'Beschreiben', type:'mc'|'num'|'open', q, o, a, tol, unit, e, model, hint}] } */
  function analyse(sel, opt) {
    const el = root(sel);
    const box = h('div', { class: 'task' });
    const pills = h('div', { class: 'steps3' }, opt.steps.map((s, i) => h('span', null, (i + 1) + ' ' + s.label)));
    box.append(h('div', { class: 'tag' }, 'Schaubild auswerten'), pills);
    const body = h('div'); box.append(body); el.append(box);
    let k = 0;
    function pill() { $$('span', pills).forEach((p, i) => { p.className = i < k ? 'ok' : i === k ? 'on' : ''; }); }
    function show() {
      pill(); body.innerHTML = '';
      if (k >= opt.steps.length) {
        body.append(h('div', { class: 'fb show ok' }, h('b', null, 'Auswertung abgeschlossen! '), opt.summary || 'Du hast das Schaubild beschrieben, erklärt und beurteilt – genau so geht es auch in der Prüfung.'));
        complete(opt.id, opt.xp || 20, 'Schaubild ausgewertet'); return;
      }
      const s = opt.steps[k];
      const f = h('div', { class: 'fb' });
      const next = h('button', { class: 'btn hidden', style: 'margin-top:10px', onclick: () => { k++; show(); } }, k < opt.steps.length - 1 ? 'Nächster Schritt →' : 'Fertig →');
      body.append(h('div', { class: 'prompt', html: s.q }));
      if (s.hint) body.append(h('p', { class: 'small muted', html: '💡 ' + s.hint }));
      if (s.type === 'mc') {
        const order = shuffle(s.o.map((t, i) => ({ t, i })));
        body.append(h('div', { class: 'opts' }, order.map((o, n) => h('button', {
          class: 'opt', onclick: e => {
            const ok = o.i === s.a;
            if (ok) { $$('.opt', body).forEach(b => b.disabled = true); e.currentTarget.classList.add('right'); fb(f, 'ok', '<b>Genau.</b> ' + (s.e || '')); next.classList.remove('hidden'); }
            else { e.currentTarget.classList.add('wrong'); e.currentTarget.disabled = true; fb(f, 'bad', s.wrong || 'Schau nochmal genau ins Schaubild.'); }
          }
        }, h('span', { class: 'k' }, 'ABCD'[n]), h('span', { html: o.t })))));
      } else if (s.type === 'num') {
        const inp = h('input', { type: 'text', inputmode: 'decimal', class: 'numin', 'aria-label': 'Deine Antwort' });
        let tries = 0;
        body.append(h('div', { class: 'row' }, inp, s.unit ? h('span', null, s.unit) : null, h('button', {
          class: 'btn', onclick: () => {
            const v = parseFloat(String(inp.value).replace(',', '.'));
            if (isNaN(v)) { fb(f, 'info', 'Gib eine Zahl ein.'); return; }
            tries++;
            if (Math.abs(v - s.a) <= (s.tol || 0)) { fb(f, 'ok', '<b>Richtig abgelesen!</b> ' + (s.e || '')); next.classList.remove('hidden'); }
            else if (tries >= 2) { fb(f, 'info', 'Die Lösung ist <b>' + fmt(s.a) + ' ' + (s.unit || '') + '</b>. ' + (s.e || '')); next.classList.remove('hidden'); }
            else fb(f, 'bad', 'Nicht ganz. Tipp: Tippe im Diagramm auf den Punkt oder Balken, dann siehst du den genauen Wert.');
          }
        }, 'Prüfen')));
      } else {
        const ta = h('textarea', { placeholder: s.placeholder || 'Schreib hier deine Antwort …', 'aria-label': 'Deine Antwort' });
        const model = h('div', { class: 'model', html: '<b>So könnte eine gute Antwort lauten:</b><br>' + s.model });
        const reveal = h('button', {
          class: 'btn', onclick: () => {
            if (ta.value.trim().split(/\s+/).length < (s.minWords || 6)) { fb(f, 'info', 'Schreib zuerst mindestens ' + (s.minWords || 6) + ' Wörter – dann darfst du vergleichen.'); return; }
            f.className = 'fb'; model.classList.add('show'); reveal.disabled = true; next.classList.remove('hidden');
          }
        }, 'Mit Musterlösung vergleichen');
        body.append(ta, h('div', { class: 'row', style: 'margin-top:8px' }, reveal), model);
        if (s.check) body.append(h('p', { class: 'small muted', style: 'margin-top:8px', html: '✔ Checkliste: ' + s.check }));
      }
      body.append(f, next);
    }
    show();
  }

  /* Offene Aufgabe mit Musterlösung. opt: { id, prompt, model, xp, minWords, placeholder, two:[labelA,labelB] } */
  function open(sel, opt) {
    const el = root(sel);
    const f = h('div', { class: 'fb' });
    const areas = opt.two ? opt.two.map(l => h('div', null, h('b', { html: l }), h('textarea', { 'aria-label': l }))) : [h('textarea', { placeholder: opt.placeholder || 'Deine Antwort …', 'aria-label': 'Deine Antwort' })];
    const model = h('div', { class: 'model', html: opt.model });
    const btn = h('button', {
      class: 'btn', onclick: () => {
        const tas = $$('textarea', box);
        if (tas.some(t => t.value.trim().split(/\s+/).filter(Boolean).length < (opt.minWords || 5))) { fb(f, 'info', 'Schreib in jedes Feld mindestens ' + (opt.minWords || 5) + ' Wörter.'); return; }
        f.className = 'fb'; model.classList.add('show'); complete(opt.id, opt.xp || 15, 'Gut gedacht');
      }
    }, opt.button || 'Fertig – Ideen vergleichen');
    const box = h('div', { class: 'task' }, opt.tag ? h('div', { class: 'tag' }, opt.tag) : null, h('div', { class: 'prompt', html: opt.prompt }),
      opt.text ? h('div', { html: opt.text }) : null,
      h('div', { class: opt.two ? 'grid2' : '' }, areas), h('div', { class: 'row', style: 'margin-top:10px' }, btn), f, model);
    el.append(box);
  }

  /* Schätzfrage. opt: { id, q, min, max, step, a, unit, e, compare:[{label,value}] } */
  function estimate(sel, opt) {
    const el = root(sel);
    const mid = Math.round((opt.min + opt.max) / 2 / (opt.step || 1)) * (opt.step || 1);
    const r = h('input', { type: 'range', min: opt.min, max: opt.max, step: opt.step || 1, value: mid, 'aria-label': 'Dein Tipp' });
    const val = h('div', { class: 'val' }, fmt(mid) + ' ' + (opt.unit || ''));
    r.oninput = () => val.textContent = fmt(+r.value) + ' ' + (opt.unit || '');
    const f = h('div', { class: 'fb' });
    const cmp = h('div', { class: 'cmp' });
    const btn = h('button', {
      class: 'btn gold', onclick: () => {
        const v = +r.value, d = Math.abs(v - opt.a) / (opt.max - opt.min);
        r.disabled = true; btn.disabled = true;
        const msg = d < .06 ? '🎯 Volltreffer!' : d < .15 ? '👍 Gut geschätzt!' : '😮 Überraschend, oder?';
        fb(f, d < .15 ? 'ok' : 'info', '<b>' + msg + '</b> Richtig ist: <b>' + fmt(opt.a) + ' ' + (opt.unit || '') + '</b>. ' + (opt.e || ''));
        const all = [{ label: 'Dein Tipp', value: v, c: 'var(--gold)' }, { label: 'Richtig', value: opt.a, c: 'var(--red)' }].concat((opt.compare || []).map(c => Object.assign({ c: 'var(--sky)' }, c)));
        const mx = Math.max(...all.map(a => a.value)) || 1;
        cmp.innerHTML = '';
        all.forEach(a => { const b = h('b', { style: 'background:' + a.c }); cmp.append(h('div', null, h('span', null, a.label), h('span', { style: 'display:flex;gap:6px;align-items:center' }, b, h('small', null, fmt(a.value))))); requestAnimationFrame(() => requestAnimationFrame(() => b.style.width = Math.max(2, a.value / mx * 75) + '%')); });
        complete(opt.id, opt.xp || 5, 'Geschätzt');
      }
    }, 'Tipp abgeben');
    el.append(h('div', { class: 'task est' }, h('div', { class: 'tag' }, 'Schätz mal!'), h('div', { class: 'prompt', html: opt.q }), val, r,
      h('div', { class: 'row small muted', style: 'justify-content:space-between' }, h('span', null, fmt(opt.min)), h('span', null, fmt(opt.max))),
      h('div', { class: 'row', style: 'margin-top:8px' }, btn), f, cmp));
  }

  /* Karteikarten. terms: [[Begriff, Erklärung], ...] */
  function flash(sel, terms) {
    const el = root(sel);
    const g = h('div', { class: 'flash' });
    terms.forEach(([t, d]) => {
      const c = h('button', { class: 'fc', 'aria-label': 'Karte ' + t + ' umdrehen' }, h('div', { class: 'fc-in' }, h('div', { class: 'fc-f' }, h('div', null, t, h('small', null, 'antippen zum Umdrehen'))), h('div', { class: 'fc-b' }, d)));
      c.onclick = () => { c.classList.toggle('flip'); if (c.classList.contains('flip') && Speech.ok && el.dataset.read === '1') Speech.say(t + ': ' + d); };
      g.append(c);
    });
    const tg = h('label', { class: 'small row', style: 'margin-top:10px;gap:6px' }, h('input', { type: 'checkbox', onchange: e => el.dataset.read = e.target.checked ? '1' : '' }), 'Karten beim Umdrehen vorlesen');
    el.append(g, Speech.ok ? tg : '');
  }

  /* Panda-Maskottchen */
  const PANDA = '<svg class="panda" viewBox="0 0 64 64" aria-hidden="true"><circle cx="14" cy="14" r="9" fill="#1f2430"/><circle cx="50" cy="14" r="9" fill="#1f2430"/><circle cx="32" cy="34" r="25" fill="#fff" stroke="#1f2430" stroke-width="2.5"/><ellipse cx="22" cy="31" rx="7" ry="9" fill="#1f2430" transform="rotate(-20 22 31)"/><ellipse cx="42" cy="31" rx="7" ry="9" fill="#1f2430" transform="rotate(20 42 31)"/><circle cx="23" cy="31" r="2.6" fill="#fff"/><circle cx="41" cy="31" r="2.6" fill="#fff"/><ellipse cx="32" cy="42" rx="4" ry="3" fill="#1f2430"/><path d="M27 48q5 4 10 0" stroke="#1f2430" stroke-width="2.2" fill="none" stroke-linecap="round"/><circle cx="16" cy="44" r="3.5" fill="#f7a8a8" opacity=".7"/><circle cx="48" cy="44" r="3.5" fill="#f7a8a8" opacity=".7"/></svg>';
  function tip(sel, html) { root(sel).append(h('div', { class: 'tip' }, h('div', { html: PANDA }), h('div', { class: 'bubble', html }))); }

  /* ---------- kleine SVG-Bausteine für Erklärfilme ---------- */
  const Art = {
    panda(x, y, s, cls, d) { return '<g class="' + (cls || 'a-pop') + '" style="--d:' + (d || 0) + 's"><g transform="translate(' + x + ',' + y + ') scale(' + (s || 1) + ')">' + PANDA.replace('<svg class="panda" viewBox="0 0 64 64" aria-hidden="true">', '').replace('</svg>', '') + '</g></g>'; },
    title(t, sub, y) { return '<text x="400" y="' + (y || 70) + '" text-anchor="middle" font-size="36" font-weight="900" fill="#1f2430" class="a-up">' + esc(t) + '</text>' + (sub ? '<text x="400" y="' + ((y || 70) + 34) + '" text-anchor="middle" font-size="20" fill="#5a6170" class="a-fade" style="--d:.4s">' + esc(sub) + '</text>' : ''); },
    label(x, y, t, o) { o = o || {}; return '<text x="' + x + '" y="' + y + '" text-anchor="' + (o.anchor || 'middle') + '" font-size="' + (o.size || 18) + '" font-weight="' + (o.weight || 800) + '" fill="' + (o.fill || '#1f2430') + '" class="' + (o.cls || 'a-fade') + '" style="--d:' + (o.d || 0) + 's">' + esc(t) + '</text>'; },
    box(x, y, w, hh, t, o) {
      o = o || {};
      const lines = String(t).split('\n');
      return '<g class="' + (o.cls || 'a-pop') + '" style="--d:' + (o.d || 0) + 's"><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + hh + '" rx="14" fill="' + (o.fill || '#fff') + '" stroke="' + (o.stroke || '#1f2430') + '" stroke-width="2.5"/>' +
        (o.icon ? '<text x="' + (x + w / 2) + '" y="' + (y + hh / 2 - (lines.length * 10) + 4) + '" text-anchor="middle" font-size="' + (o.iconSize || 34) + '">' + o.icon + '</text>' : '') +
        lines.map((l, i) => '<text x="' + (x + w / 2) + '" y="' + (y + (o.icon ? hh / 2 + 22 : hh / 2 + 6) + (i - (lines.length - 1) / 2) * 20) + '" text-anchor="middle" font-size="' + (o.size || 16) + '" font-weight="800" fill="' + (o.color || '#1f2430') + '">' + esc(l) + '</text>').join('') + '</g>';
    },
    arrow(x1, y1, x2, y2, o) {
      o = o || {};
      const a = Math.atan2(y2 - y1, x2 - x1), L = Math.hypot(x2 - x1, y2 - y1);
      const hx = x2 - Math.cos(a) * 14, hy = y2 - Math.sin(a) * 14;
      return '<g class="a-fade" style="--d:' + (o.d || 0) + 's"><path d="M' + x1 + ',' + y1 + 'L' + hx + ',' + hy + '" stroke="' + (o.color || '#c0392b') + '" stroke-width="' + (o.w || 4) + '" fill="none" stroke-linecap="round" class="a-draw" style="--len:' + Math.ceil(L) + ';--d:' + (o.d || 0) + 's;--t:.6s"/>' +
        '<path d="M' + x2 + ',' + y2 + 'L' + (x2 - Math.cos(a - .45) * 18) + ',' + (y2 - Math.sin(a - .45) * 18) + 'L' + (x2 - Math.cos(a + .45) * 18) + ',' + (y2 - Math.sin(a + .45) * 18) + 'Z" fill="' + (o.color || '#c0392b') + '"/></g>';
    },
    emoji(x, y, e, size, cls, d) { return '<text x="' + x + '" y="' + y + '" text-anchor="middle" font-size="' + (size || 48) + '" class="' + (cls || 'a-pop') + '" style="--d:' + (d || 0) + 's">' + e + '</text>'; },
    bg(c) { return '<rect width="800" height="450" fill="' + (c || '#fbf7f0') + '"/>'; },
    ship(x, y, s) {
      return '<g transform="translate(' + x + ',' + y + ') scale(' + (s || 1) + ')"><path d="M0,40 L200,40 L180,70 L20,70 Z" fill="#1f2430"/>' +
        ['#c0392b', '#e9a319', '#1f8a70', '#2d6cdf', '#7b4fa0', '#c0392b', '#2d6cdf', '#e9a319'].map((c, i) => '<rect x="' + (28 + (i % 4) * 34) + '" y="' + (i < 4 ? 12 : -14) + '" width="32" height="26" fill="' + c + '" stroke="#fff" stroke-width="1.5"/>').join('') +
        '<rect x="168" y="-10" width="18" height="50" fill="#fff" stroke="#1f2430" stroke-width="2"/></g>';
    },
    waves(y) { return '<path d="M0,' + y + ' q25,-10 50,0 t50,0 t50,0 t50,0 t50,0 t50,0 t50,0 t50,0 t50,0 t50,0 t50,0 t50,0 t50,0 t50,0 t50,0 t50,0 V450 H0Z" fill="#9cc7ea"/>'; }
  };

  /* ---------- Öffentliche Schnittstelle ---------- */
  window.Kurs = {
    STATIONS, EXTRA, state: () => state, save, isDone, complete, stationProgress, toast, confetti,
    init: initPage, audio, video, quiz, order, sort, cloze, analyse, open, estimate, flash, tip,
    line, bars, columns, pyramid, figure, map, proj, CITIES, Art, PANDA, Speech, h, $, $$, shuffle, esc, fmt,
    setName(n) { state.name = n; save(); },
    reset() { state = { xp: 0, done: {}, name: '', best: {} }; save(); }
  };
})();
