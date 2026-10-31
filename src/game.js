// Bucle principal: estados, salas, guiones, menús, mapa, guardado.
'use strict';
const SAVE_KEY = 'ascend-partida-v2';
const FONT = "'Pixelify Sans', 'VT323', ui-monospace, monospace";

const PAUSE_TABS = ['Mapa', 'Marcas', 'Páginas', 'Controles', 'Opciones'];
// Punto de aparición de un admin: la casilla de suelo más baja entre las primeras columnas
function spawnPoint(r) {
  let best = null;
  for (let x = 1; x <= Math.min(r.W - 2, 12); x++) {
    for (let y = r.H - 2; y >= 0; y--) {
      if (!SOLID.has(r.grid[y][x]) && SOLID.has(r.grid[y + 1][x])) { if (!best || y > best.y) best = { x, y }; break; }
    }
  }
  return best || { x: 2, y: r.H - 2 };
}

const G = {
  state: 'title', t: 0, save: null, room: null, roomStates: {}, ents: [], player: null,
  projs: [], parts: [], waves: [], platforms: [], texts: [], hints: [], toasts: [],
  cam: { x: 0, y: 0 }, shakeT: 0, shakeA: 0, whiteFlash: 0, fadeFlash: 0, barFlash: {},
  cine: false, queue: [], dlg: null, scriptDone: null, interactTarget: null, copyProgress: 0, copyMark: 'energia',
  banner: null, lastBanner: null, menu: { sel: 0, tab: 0 }, entry: null, caughtT: 0, dieT: 0, reinforce: 0, markPop: 0,
  titleT: 0, graceT: 0, adminOn: /admin/i.test(location.href), adminSession: false, timers: [], bubbles: [], streams: [], bolts: [], waitT: 0, waitFn: null, camLock: null,
  fade: 0, fadeTarget: 0, fadeSpeed: 2, cutscene: false, letterbox: 0, titleCard: null, trans: null, race: null, boss: null,
  delay(s, fn) { this.timers.push({ s, fn }); },

  newSave() {
    return {
      marks: [], active: null, bars: { energia: 0, temperatura: 0 }, hp: 6, maxHp: 6, flags: {}, pages: [],
      checkpoint: { room: START_ROOM, x: 2, y: 7 }, saveRoom: null, visited: {}, time: 0,
    };
  },
  hasSave() { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } },
  writeSave() { if (this.adminSession) return; try { localStorage.setItem(SAVE_KEY, JSON.stringify(this.save)); } catch (e) { /* sin almacenamiento */ } },
  readSave() { try { return JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { return null; } },

  start(load, admin) {
    this.adminSession = !!admin;
    this.save = (load && this.readSave()) || this.newSave();
    const S = this.save;
    S.hp = S.maxHp;
    this.roomStates = {};
    const cp = S.checkpoint;
    this.player = new Player(0, 0);
    this.loadRoom(cp.room, cp.px ?? cp.x * T + 3, cp.py ?? (cp.y + 1) * T - 26);
    this.state = 'play';
    this.cam.x = this.camTarget().x; this.cam.y = this.camTarget().y;
    this.lastBanner = null; this.showBanner();
    this.fade = this.fadeTarget = 0; this.cutscene = false; this.queue = []; this.dlg = null; this.cine = false;
    if (!admin) this.enterScript();
  },

  // ---------------------------------------------------------------- Salas
  findRoom(area, wx, wy) {
    for (const id in ROOMS) { const r = ROOMS[id]; if (r.area === area && wx >= r.x && wx < r.x + r.W && wy >= r.y && wy < r.y + r.H) return r; }
    return null;
  },
  buildRoom(id) {
    const def = ROOMS[id];
    const rs = { def, W: def.W, H: def.H, grid: def.grid.map((r) => r.slice()), alarm: false, edgeCache: new Map() };
    if (def.veilFlag && this.save.flags[def.veilFlag]) for (const row of rs.grid) for (let i = 0; i < row.length; i++) if (row[i] === 'V') row[i] = '.';
    rs.edge = (tx, ty) => {
      const k = tx + ',' + ty;
      let v = rs.edgeCache.get(k);
      if (v !== undefined) return v;
      const n = this.findRoom(def.area, def.x + tx, def.y + ty);
      if (n) { const g = this.roomStates[n.id] ? this.roomStates[n.id].grid : n.grid; v = g[def.y + ty - n.y][def.x + tx - n.x]; if (v === 'V' && n.veilFlag && this.save.flags[n.veilFlag]) v = '.'; }
      else v = ty >= def.H ? '.' : '#';
      rs.edgeCache.set(k, v);
      return v;
    };
    for (const d of def.ents) if (d.type === 'gate' && !this.save.flags[d.flag]) for (let j = 0; j < (d.h || 1); j++) for (let i = 0; i < (d.w || 1); i++) rs.grid[d.y + j][d.x + i] = 'X';
    const prev = this.room;
    this.room = rs;
    rs.ents = def.ents.filter((d) => ENT_CLASSES[d.type] && d.type !== 'spawn').map((d) => new ENT_CLASSES[d.type](d)).filter((e) => !e.dead);
    this.room = prev;
    renderTiles(rs);
    return rs;
  },
  loadRoom(id, px, py) {
    this.graceT = 1.2;
    const rs = this.roomStates[id] || (this.roomStates[id] = this.buildRoom(id));
    // Las tejas que se cayeron vuelven a su sitio
    if (rs.crumbles && rs.crumbles.size) { for (const c of rs.crumbles.values()) rs.grid[c.ty][c.tx] = 'c'; rs.crumbles.clear(); renderTiles(rs); }
    rs.crumbles = rs.crumbles || new Map();
    this.room = rs; this.ents = rs.ents;
    this.projs = []; this.platforms = []; this.waves = []; this.parts = this.parts.filter((p) => !p.seek).slice(-60);
    const p = this.player;
    if (px != null) { p.x = px; p.y = py; }
    p.safe = { x: p.x, y: p.y }; p.airMinY = p.y; p.trail = [];
    this.entry = { x: p.x, y: p.y };
    this.save.visited[id] = true;
    const th = themeOf(rs);
    if (!rs.alarm) Audio2.setMusic(rs.def.music);
    Audio2.setRain(th.rain || 0);
    Audio2.setHum(false);
    this.interactTarget = null;
  },
  checkTransition() {
    const p = this.player, r = this.room;
    const cx = p.cx, cy = p.cy;
    if (cx >= 0 && cx < r.W * T && cy >= 0 && cy < r.H * T) return;
    const wx = Math.floor((r.def.x * T + cx) / T), wy = Math.floor((r.def.y * T + cy) / T);
    const n = this.findRoom(r.def.area, wx, wy);
    if (!n || n.id === r.def.id) return;
    const ox = (r.def.x - n.x) * T, oy = (r.def.y - n.y) * T;
    // Transición: la sala vieja se desliza fuera y entra la nueva
    const snap = this.snapCv || (this.snapCv = document.createElement('canvas'));
    snap.width = VIEW_W; snap.height = VIEW_H;
    snap.getContext('2d').drawImage(sceneCv, 0, 0);
    const dx = cx < 0 ? -1 : cx >= r.W * T ? 1 : 0, dy = dx ? 0 : cy < 0 ? -1 : 1;
    this.loadRoom(n.id, p.x + ox, p.y + oy);
    const ct = this.camTarget(); this.cam.x = ct.x; this.cam.y = ct.y;
    this.trans = { t: 0, dur: 0.42, dx, dy };
    // En el prólogo, cada sala es un punto de control
    if (n.area !== 'ibaia') { this.save.checkpoint = { room: n.id, px: this.player.x, py: this.player.y }; this.writeSave(); }
    this.showBanner();
    this.enterScript();
  },
  enterScript() {
    const d = this.room.def;
    if (d.onEnter && !this.save.flags['enter_' + d.id]) { this.save.flags['enter_' + d.id] = true; this.runScript(SCRIPTS[d.onEnter]); }
  },
  showBanner() {
    const d = this.room.def;
    if (d.onEnter && !this.save.flags['enter_' + d.id]) { this.lastBanner = d.title; return; }
    if (d.title && this.lastBanner !== d.title) { this.banner = { title: d.title, sub: d.sub || '', life: 3.2 }; this.lastBanner = d.title; }
  },
  goto(id, x, y, noEnter) {
    this.roomStates = {}; this.timers = [];
    this.save.checkpoint = { room: id, x, y };
    this.save.saveRoom = null;
    this.loadRoom(id, x * T + 3, (y + 1) * T - 26);
    const p = this.player; p.vx = 0; p.vy = 0; p.state = 'normal'; p.setH(26); p.ghost = false; p.charge = 0;
    this.camLock = null; this.streams = []; this.race = null; this.boss = null;
    this.cam.x = this.camTarget().x; this.cam.y = this.camTarget().y;
    this.showBanner();
    this.writeSave();
    if (!noEnter) this.enterScript();
  },
  // Chispas: cada una recarga un poco las marcas; cada 40, un fragmento de Destino (+1 vida)
  pickChispa(e) {
    const S = this.save;
    S.flags[e.key] = true; S.chispas = (S.chispas || 0) + 1;
    for (const m of S.marks) if (S.bars[m] != null) S.bars[m] = Math.min(100, S.bars[m] + 3);
    this.chispaChain = this.chispaT > 0 ? (this.chispaChain || 0) + 1 : 0; this.chispaT = 0.9;
    Audio2.sfx('chispa', this.chispaChain);
    burst(e.cx, e.cy, 5, ['#f2c45a', '#fff1b8'], 40, 0.3);
    if (S.chispas % 40 === 0 && (S.chispaVidas || 0) < 4) {
      S.chispaVidas = (S.chispaVidas || 0) + 1; S.maxHp++; S.hp = S.maxHp;
      this.titleCard = { title: 'Fragmento de Destino', sub: `${S.chispas} chispas · +1 de vida máxima`, t: 0, dur: 2.6, lb: true };
      Audio2.sfx('copy');
    }
  },
  gainLauburu(id) {
    const S = this.save;
    if (S.flags['lb_' + id]) return;
    S.flags['lb_' + id] = true; S.maxHp++; S.hp = S.maxHp;
    Audio2.sfx('copy'); this.shake(2);
    burst(this.player.cx, this.player.cy, 24, ['#f2c45a', '#ffe7a3', '#ffffff'], 90, 0.8);
    this.titleCard = { title: 'Lauburu de latón', sub: '+1 de vida máxima', t: 0, dur: 2.6, lb: true };
  },
  raceWin() { this.endRace(true); },
  // El corredor ha llegado a la meta: gana él
  raceArrive() { if (this.race && this.race.id === 'iker') this.endRace(false); },
  endRace(won) {
    const r = this.race;
    if (!r) return;
    this.race = null;
    const runner = this.actor(r.id + '_r');
    if (runner) { runner.route = null; runner.fadeV = -1.5; }
    if (won) { this.save.flags['race_' + r.id] = true; Audio2.sfx('pickup'); this.toast(`¡Conseguido! ${(r.max - r.t).toFixed(1)} s`); }
    else Audio2.sfx('hurt');
    const s = SCRIPTS['race_' + r.id + (won ? '_ok' : '_fail')];
    if (s) this.runScript(s); else this.toast(won ? '¡Conseguido!' : 'Se acabó el tiempo');
  },
  saveAt(e) {
    const S = this.save;
    S.checkpoint = { room: this.room.def.id, x: Math.floor(e.x / T), y: Math.floor((e.y + e.h - 1) / T) };
    S.saveRoom = this.room.def.id; S.hp = S.maxHp;
    this.writeSave();
    Audio2.sfx('save');
    burst(e.cx, e.y, 16, ['#ffb547', '#ffe0a8'], 50);
    this.toast('Partida guardada');
  },
  die() {
    if (this.dieT > 0) return;
    this.dieT = 1.4; this.cine = true; this.queue = []; this.dlg = null; this.scriptDone = null;
    Audio2.sfx('die'); Audio2.setHum(false);
  },
  respawn() {
    const S = this.save;
    S.hp = S.maxHp;
    for (const m of S.marks) if (S.bars[m] != null) S.bars[m] = Math.max(S.bars[m], 40);
    this.roomStates = {};
    const cp = S.checkpoint;
    const p = this.player; p.vx = 0; p.vy = 0; p.state = 'normal'; p.setH(26); p.inv = 1.5; p.ghost = false;
    p.charge = 0;
    this.camLock = null; this.cutscene = false; this.waitFn = null; this.waitT = 0; this.race = null; this.boss = null; this.fade = this.fadeTarget = 0;
    this.loadRoom(cp.room, cp.px ?? cp.x * T + 3, cp.py ?? (cp.y + 1) * T - 26);
    this.cam.x = this.camTarget().x; this.cam.y = this.camTarget().y;
    this.cine = false;
  },
  caught(e) {
    if (this.caughtT > 0 || this.cine || this.graceT > 0) return;
    this.caughtT = 1.1; this.cine = true;
    e.watch = 2; Audio2.sfx('alert');
    this.toast('¡Te han visto!');
  },
  spawn(d) {
    const C = ENT_CLASSES[d.type];
    const e = new C(d);
    this.ents.push(e);
    if (d.type === 'acolito') Audio2.sfx('orb');
    return e;
  },
  // ---------------------------------------------------------------- La PDC
  noise() {
    const r = this.room;
    if (r.def.stealth || r.alarm) return;
    for (const e of this.ents) {
      if (!e.pdc || e.dead || e.dying || e.hostile) continue;
      if (e.sees(180, 0.9)) {
        if (e.watch > 0) { this.alarm('power'); return; }
        e.watch = 3.5;
        floatText(e.cx, e.y - 14, '¡Nada de marcas en la calle!', '#ffd23a');
        Audio2.sfx('select');
      }
    }
  },
  alarm() {
    const r = this.room;
    if (r.alarm) return;
    const pdcs = this.ents.filter((e) => e.pdc && !e.dead && !e.dying);
    if (!pdcs.length) return;
    r.alarm = true;
    for (const e of pdcs) e.hostile = true;
    Audio2.sfx('alert');
    this.toast('¡Alarma! La PDC va a por ti');
    if (!r.def.stealth) this.reinforce = 3;
  },
  // ---------------------------------------------------------------- Casillas que cambian
  // Tejas sueltas ('c'): tiemblan al pisarlas, caen y vuelven a los 3 s
  updateCrumbles(dt) {
    const rs = this.room, p = this.player;
    if (!rs.crumbles) rs.crumbles = new Map();
    if (p.onGround && !p.ghost) {
      const ty = Math.floor((p.feet + 1) / T);
      for (let tx = Math.floor(p.x / T); tx <= Math.floor((p.x + p.w - 0.01) / T); tx++) {
        const k = tx + ',' + ty;
        if (tileAt(tx, ty) === 'c' && !rs.crumbles.has(k)) { rs.crumbles.set(k, { tx, ty, t: 0.45, gone: false }); Audio2.sfx('crumble'); }
      }
    }
    let changed = false;
    for (const [k, c] of rs.crumbles) {
      c.t -= dt;
      if (!c.gone && c.t <= 0) { c.gone = true; c.t = 3; rs.grid[c.ty][c.tx] = '.'; changed = true; burst(c.tx * T + 8, c.ty * T + 6, 8, ['#7a5a5a', '#5a4048', '#a07a6a'], 60, 0.7, 300, 2); }
      else if (c.gone && c.t <= 0 && !overlap(p, { x: c.tx * T, y: c.ty * T, w: T, h: T })) { rs.grid[c.ty][c.tx] = 'c'; rs.crumbles.delete(k); changed = true; }
    }
    if (changed) this.tileChanged();
  },
  tileChanged() { for (const id in this.roomStates) this.roomStates[id].edgeCache.clear(); renderTiles(this.room); },
  breakTile(tx, ty) {
    // La roca entera: todas las casillas con vetas conectadas
    const g = this.room.grid, st = [[tx, ty]], ch = g[ty][tx];
    while (st.length) {
      const [x, y] = st.pop();
      if (!g[y] || g[y][x] !== ch) continue;
      g[y][x] = '.';
      burst(x * T + 8, y * T + 8, 8, ['#4a4656', '#5e5a6c', '#2f8bff', '#9fd0ff'], 80, 0.6, 300, 2);
      st.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    Audio2.sfx('break'); this.shake(3);
    this.tileChanged();
  },
  thawFall(tx, ty) {
    const g = this.room.grid;
    for (let y = 0; y < this.room.H; y++) if (g[y][tx] === 'K') g[y][tx] = 'k';
    burst(tx * T + 8, ty * T + 8, 10, ['#e8ffff', '#4f6dff'], 50, 0.6, -30);
    Audio2.sfx('fire'); this.tileChanged();
  },
  meltTile(tx, ty) {
    // Se derrite todo el bloque de hielo conectado
    const g = this.room.grid, st = [[tx, ty]];
    while (st.length) {
      const [x, y] = st.pop();
      if (!g[y] || g[y][x] !== 'I') continue;
      g[y][x] = '.';
      burst(x * T + 8, y * T + 8, 6, ['#b8fff7', '#5ad8e0', '#ffffff'], 40, 0.5, 100);
      st.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    Audio2.sfx('fire'); this.tileChanged();
  },
  freezeFire(tx, ty) {
    const g = this.room.grid, st = [[tx, ty]];
    while (st.length) {
      const [x, y] = st.pop();
      if (!g[y] || g[y][x] !== 'F') continue;
      g[y][x] = '.';
      burst(x * T + 8, y * T + 8, 5, ['#e8ffff', '#b8fff7', '#9a9aaa'], 40, 0.8, -40);
      st.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    Audio2.sfx('ice'); floatText(tx * T + 8, ty * T, '¡Vapor!', '#e8ffff'); this.tileChanged();
  },
  freezeFall(tx, ty) {
    const g = this.room.grid;
    for (let y = 0; y < this.room.H; y++) if (g[y][tx] === 'k') { g[y][tx] = 'K'; burst(tx * T + 8, y * T + 8, 3, ['#b8fff7', '#ffffff'], 30); }
    Audio2.sfx('ice'); this.tileChanged();
  },
  openVeils() {
    const g = this.room.grid;
    for (let y = 0; y < this.room.H; y++) for (let x = 0; x < this.room.W; x++) if (g[y][x] === 'V') { g[y][x] = '.'; burst(x * T + 8, y * T + 8, 8, ['#ffb547', '#ffe0a8'], 60, 1, -20); }
    this.tileChanged();
  },
  gainMark(m) {
    const S = this.save;
    if (!S.marks.includes(m)) S.marks.push(m);
    S.bars[m] = 100; S.active = m; this.markPop = 1;
  },
  // ---------------------------------------------------------------- Guiones
  runScript(steps, done) {
    if (!steps) return;
    if (this.cine && this.queue && this.dieT <= 0) { this.queue.unshift(...steps); if (done) { const d0 = this.scriptDone; this.scriptDone = () => { d0 && d0(); done(); }; } return; }
    this.queue = steps.slice(); this.cine = true; this.scriptDone = done || null;
    Audio2.setHum(false);
    this.player.charge = 0;
    this.nextStep();
  },
  actor(id) { return this.ents.find((e) => e.actor && e.id === id && !e.dead); },
  nextStep() {
    this.dlg = null;
    while (this.queue.length) {
      const s = this.queue.shift();
      const [k, a1, a2, a3, a4] = s;
      const A = () => this.actor(a1);
      switch (k) {
        case 'say': this.dlg = { type: 'say', who: a1, text: a2, shown: 0 }; return;
        case 'card': this.dlg = { type: 'card', title: a1, sub: a2, text: a3, scene: a4, t: 0 }; Audio2.sfx('card'); return;
        case 'choice': this.dlg = { type: 'choice', opts: a1, sel: 0, t: 0 }; return;
        case 'if': this.queue.unshift(...(this.save.flags[a1] ? a2 : a3 || [])); continue;
        case 'do': if (this.doAction(a1, ...s.slice(2)) === 'stop') return; continue;
        case 'script': this.queue.unshift(...SCRIPTS[a1]); continue;
        case 'wait': this.waitT = a1; return;
        // Actores
        case 'actor': {
          const old = this.actor(a1); if (old) old.dead = true;
          this.cutscene = true;
          this.ents.push(new Actor({ id: a1, ch: a2, x: a3, y: a4, ...(s[5] || {}) }));
          continue;
        }
        case 'jonActor': {
          const p = this.player, old = this.actor('jon'); if (old) old.dead = true;
          this.cutscene = true;
          this.ents.push(new Actor({ id: 'jon', ch: 'jon', px: p.x, py: p.y + p.h, face: p.face, mode: a1 || 'idle' }));
          p.ghost = true; p.vx = 0; p.vy = 0; p.charge = 0;
          continue;
        }
        case 'move': {
          const a = A(); if (!a) continue;
          const o = a3 || {};
          a.tx = a2 * T + 3; a.speed = o.speed || (o.run ? 130 : 52); a.mode = o.run ? 'run' : 'walk'; a.afterMode = o.then || 'idle';
          if (o.wait !== false) { this.waitFn = () => a.dead || a.tx == null; return; }
          continue;
        }
        case 'mode': { const a = A(); if (a) { a.mode = a2; if (a3) { a.glow = a3; a.glowT = 0; } else if (a2 === 'idle') a.glow = null; } continue; }
        case 'face': { const a = A(); if (a) a.face = a2; continue; }
        case 'jump': {
          const a = A(); if (!a) continue;
          const o = s[4] || {};
          a.jump = { x0: a.x, y0: a.y, x1: a.x + a2 * T, y1: a.y + (o.dy || 0) * T, h: a3 * T, t: 0, dur: o.dur || 0.6, after: o.then || 'idle' };
          a.mode = o.mode || 'jump';
          if (o.wait !== false) { this.waitFn = () => a.dead || !a.jump; return; }
          continue;
        }
        case 'fly': {
          const a = A(); if (!a) continue;
          const o = s[4] || {};
          if (typeof a2 === 'string') { const b = this.actor(a2); a.fly = { x: b ? b.x + b.face * 6 : a.x, y: b ? b.y + 6 : a.y, speed: a3 || 80 }; }
          else a.fly = { x: a2[0] * T, y: a2[1] * T, speed: a3 || 80, spin: o.spin || 0 };
          if (o.wait !== false) { this.waitFn = () => a.dead || !a.fly; return; }
          continue;
        }
        case 'fadeActor': { const a = A(); if (a) a.fadeV = a2 || -1.5; continue; }
        case 'remove': { const a = A(); if (a) a.dead = true; continue; }
        case 'bubble': { const a = A(); if (a) a.bubble = { text: a2, t: a3 || 2.5 }; continue; }
        case 'tint': { const a = A(); if (a) a.tint = a2 || null; continue; }
        // Cámara, jugador, pantalla
        case 'cam': this.cutscene = true; this.camLock = { x: a1 * T, y: a2 * T, speed: a3 || 3 }; if (s[4]) { this.waitT = s[4]; return; } continue;
        case 'camfree': this.camLock = null; continue;
        case 'player': {
          const p = this.player;
          if (a1 === 'hide') { p.ghost = true; }
          else if (a1 === 'show') {
            const j = this.actor('jon');
            if (j) { p.x = j.x; p.y = j.y + j.h - p.h; p.face = j.face; j.dead = true; }
            p.ghost = false; p.state = 'normal'; p.vx = 0; p.vy = 0; p.safe = { x: p.x, y: p.y }; p.airMinY = p.y;
          } else if (a1 === 'at') { p.x = a2 * T + 3; p.y = (a3 + 1) * T - p.h; if (a4) p.face = a4; }
          continue;
        }
        case 'fade': this.fadeTarget = a1 === 'out' ? 1 : 0; this.fadeSpeed = 1 / (a2 || 0.6); this.cutscene = true; this.waitFn = () => Math.abs(this.fade - this.fadeTarget) < 0.01; return;
        case 'title': this.titleCard = { title: a1, sub: a2 || '', t: 0, dur: a3 || 3 }; Audio2.sfx('card'); this.waitT = a3 || 3; return;
        case 'theme': this.room.themeOverride = a1; renderTiles(this.room); Audio2.setRain(themeOf(this.room).rain || 0); continue;
        case 'music': Audio2.setMusic(a1); continue;
        case 'sfx': Audio2.sfx(a1); continue;
        case 'letterbox': this.cutscene = !!a1; continue;
        case 'fx': this.fx(a1, ...s.slice(2)); continue;
        case 'goto':
          this.queue.unshift(['fade', 'out', 0.5], ['do', 'gotoNow', a1, a2, a3], ['fade', 'in', 0.7], ['do', 'enterNow']);
          continue;
      }
    }
    this.dlg = null; this.cine = false; this.cutscene = false; this.camLock = null; this.waitFn = null; this.waitT = 0;
    if (this.player.ghost && !this.actor('jon')) this.player.ghost = false;
    else if (this.player.ghost) { this.queue = [['player', 'show']]; this.nextStep(); return; }
    const d = this.scriptDone; this.scriptDone = null;
    if (d) d();
  },
  // Efectos de las escenas
  fx(type, ...a) {
    const actorPos = (id) => { const e = this.actor(id); return e ? { x: e.cx, y: e.y + 10 } : { x: 0, y: 0 }; };
    switch (type) {
      case 'lightning': {
        const x = typeof a[0] === 'string' ? actorPos(a[0]).x : a[0] * T + 8;
        let ty = 0; while (ty < this.room.H && !solidAt(Math.floor(x / T), ty)) ty++;
        this.bolts.push({ x, y: ty * T, life: 0.3 });
        this.whiteFlash = 0.35; this.shake(6); Audio2.sfx('thunder');
        burst(x, ty * T, 20, ['#ffffff', '#9fd0ff', '#2f8bff'], 100, 0.6, 200);
        break;
      }
      case 'flash': this.whiteFlash = a[0] || 0.3; break;
      case 'shake': this.shake(a[0] || 5); break;
      case 'burst': { const pos = typeof a[0] === 'string' ? actorPos(a[0]) : { x: a[0] * T + 8, y: a[1] * T + 8 }; burst(pos.x, pos.y, a[3] || 20, a[2] || ['#ffffff'], a[4] || 80, 0.8, a[5] || 0, 2); break; }
      case 'stream': this.streams.push({ from: a[0], to: a[1], col: a[2], t: a[3] || 2 }); break;
      case 'debris': for (let i = 0; i < (a[2] || 30); i++) this.parts.push({ x: (a[0] + Math.random() * (a[3] || 4)) * T, y: a[1] * T - Math.random() * 60, vx: (Math.random() - 0.5) * 40, vy: Math.random() * 40, life: 1.4, max: 1.4, col: ['#5a4a52', '#7a6a6a', '#3a3036', '#a84a3a'][i % 4], g: 400, s: 2 }); break;
      case 'glow': { const e = this.actor(a[0]); if (e) { e.glow = a[1]; e.glowT = a[2] || 1.5; } break; }
    }
  },
  doAction(a, ...args) {
    const S = this.save;
    switch (a) {
      case 'shake': this.shake(args[0] * 6); break;
      case 'gainDestino': if (!S.marks.includes('destino')) S.marks.unshift('destino'); S.flags.naipe = true; this.whiteFlash = 0.5; Audio2.sfx('copy'); break;
      case 'alarm': this.room.alarm = true; Audio2.sfx('alert'); break;
      case 'goto': this.queue.unshift(['goto', args[0], args[1], args[2]]); break;
      case 'gotoNow': this.goto(args[0], args[1], args[2], true); break;
      case 'enterNow': this.enterScript(); break;
      case 'flag': S.flags[args[0]] = args[1] === undefined ? true : args[1]; break;
      case 'all': S.flags[args[0]] = args[1].every((f) => S.flags[f]); break;
      case 'hideNpc': for (const e of this.ents) if (e instanceof NPC && e.who === args[0]) e.dead = true; break;
      case 'race': this.race = { id: args[0], t: args[1], max: args[1] }; Audio2.sfx('alert'); this.toast('¡Contrarreloj!'); break;
      case 'racerGo': { const a = this.actor('iker_r'); if (a) a.route = RACE_ROUTE.map((s) => ({ ...s })); break; }
      case 'lauburu': this.gainLauburu(args[0]); break;
      case 'heal': S.hp = S.maxHp; break;
      case 'bossStart': S.flags.buho_start = true; Audio2.setMusic('ancla'); break;
      case 'hint': this.toast(args[0], 6); break;
      case 'allowCopy': { const n = this.ents.find((e) => e.d && e.d.copy); if (n) S.flags['allow_' + n.d.copy] = true; break; }
      case 'pan': this.panT = 4; break;
      case 'script': this.queue.unshift(...SCRIPTS[args[0]]); break;
      case 'ending': this.state = 'ending'; this.endT = 0; this.cine = false; this.queue = []; this.dlg = null; Audio2.setMusic('title'); this.writeSave(); return 'stop';
    }
  },
  updateDialog(dt) {
    const d = this.dlg;
    if (!d) return;
    if (d.type === 'say') {
      const before = Math.floor(d.shown);
      d.shown = Math.min(d.text.length, d.shown + dt * 48);
      if (Math.floor(d.shown) !== before && Math.floor(d.shown) % 3 === 0) Audio2.sfx('blip');
      if (Input.ok() || Input.pressed.shoot) { if (d.shown < d.text.length) d.shown = d.text.length; else this.nextStep(); }
    } else if (d.type === 'card') {
      d.t += dt;
      if (d.t > 0.6 && (Input.ok() || Input.pressed.shoot)) this.nextStep();
    } else if (d.type === 'choice') {
      d.t += dt;
      if (Input.pressed.up || Input.pressed.left) { d.sel = (d.sel + d.opts.length - 1) % d.opts.length; Audio2.sfx('select'); }
      if (Input.pressed.down || Input.pressed.right) { d.sel = (d.sel + 1) % d.opts.length; Audio2.sfx('select'); }
      if (d.t > 0.4 && (Input.pressed.confirm || Input.pressed.jump || Input.pressed.use)) {
        const [, flag, val] = d.opts[d.sel];
        this.save.flags[flag] = val; Audio2.sfx('pickup');
        this.nextStep();
      }
    }
  },
  toast(text, life = 3) { this.toasts = this.toasts.filter((x) => x.text !== text); this.toasts.push({ text, life, max: life }); if (this.toasts.length > 3) this.toasts.shift(); },
  shake(a) { this.shakeA = Math.max(this.shakeA, a); this.shakeT = 0.3; },
  flashBar(m) { this.barFlash[m] = 0.5; },

  // ---------------------------------------------------------------- Actualizar
  camTarget() {
    const r = this.room;
    const p = this.player.ghost && this.actor('jon') ? this.actor('jon') : this.player;
    let x = p.cx + (p.face || 1) * 24 - VIEW_W / 2, y = p.cy - VIEW_H / 2 - 8;
    if (this.camLock) { x = this.camLock.x - VIEW_W / 2; y = this.camLock.y - VIEW_H / 2; }
    if (this.panT > 0 && r.def.theme === 'vista') x = r.W * T - VIEW_W;
    x = r.W * T <= VIEW_W ? (r.W * T - VIEW_W) / 2 : clamp(x, 0, r.W * T - VIEW_W);
    y = r.H * T <= VIEW_H ? (r.H * T - VIEW_H) : clamp(y, 0, r.H * T - VIEW_H);
    return { x, y };
  },
  update(dt) {
    this.t += dt;
    if (this.state === 'title') return this.updateTitle(dt);
    if (this.state === 'pause') return this.updatePause(dt);
    if (this.state === 'ending') { this.endT += dt; if (this.endT > 1.5 && Input.ok()) { this.state = 'title'; this.menu.sel = 0; } return; }
    if (Input.pressed.pause && !this.dlg && this.dieT <= 0) { this.state = 'pause'; this.menu.tab = 0; Audio2.sfx('select'); Audio2.setHum(false); return; }
    if (Input.pressed.map && !this.dlg && this.dieT <= 0) { this.state = 'pause'; this.menu.tab = 0; return; }
    this.save.time += dt;
    // Fundidos y bandas de cine
    if (this.fade !== this.fadeTarget) { const st = this.fadeSpeed * dt; this.fade = Math.abs(this.fadeTarget - this.fade) <= st ? this.fadeTarget : this.fade + Math.sign(this.fadeTarget - this.fade) * st; }
    this.letterbox += ((this.cutscene ? 1 : 0) - this.letterbox) * Math.min(1, dt * 6);
    if (this.titleCard) { this.titleCard.t += dt; if (this.titleCard.t > this.titleCard.dur) this.titleCard = null; }
    if (this.trans) { this.trans.t += dt; if (this.trans.t >= this.trans.dur) this.trans = null; else return; }
    if (this.waitT > 0) { this.waitT -= dt; if (this.waitT <= 0) { this.waitT = 0; this.nextStep(); } }
    else if (this.waitFn && this.waitFn()) { this.waitFn = null; this.nextStep(); }
    for (const st of this.streams) {
      st.t -= dt;
      const a = this.actor(st.from), b = this.actor(st.to);
      if (a && b) for (let i = 0; i < 2; i++) this.parts.push({ x: a.cx + (Math.random() - 0.5) * 6, y: a.y + 10 + (Math.random() - 0.5) * 8, tx: b.cx + b.face * 8, ty: b.y + 12, life: 0.5, max: 0.5, col: Math.random() < 0.3 ? '#ffffff' : st.col, seek: true, s: 1 });
    }
    this.streams = this.streams.filter((st) => st.t > 0);
    for (const b of this.bolts) b.life -= dt;
    this.bolts = this.bolts.filter((b) => b.life > 0);
    if (this.race && !this.cine) {
      this.race.t -= dt;
      if (this.race.t <= 0) this.endRace(false);
    }
    if (this.boss && (this.boss.dead || this.boss.dying)) this.boss = null;
    // Muerte y sala perdida por sigilo
    if (this.dieT > 0) { this.dieT -= dt; if (this.dieT <= 0) this.respawn(); }
    if (this.caughtT > 0) {
      this.caughtT -= dt;
      if (this.caughtT <= 0) {
        const id = this.room.def.id, e = this.entry;
        delete this.roomStates[id];
        this.player.state = 'normal'; this.player.setH(26); this.player.vx = 0; this.player.vy = 0;
        this.loadRoom(id, e.x, e.y); this.cine = false; this.fadeFlash = 0.5;
      }
    }
    this.updateDialog(dt);
    for (const tm of this.timers) if ((tm.s -= dt) <= 0) tm.fn();
    this.timers = this.timers.filter((tm) => tm.s > 0);
    if (this.graceT > 0) this.graceT -= dt;
    if (this.shakeT > 0) { this.shakeT -= dt; if (this.shakeT <= 0) this.shakeA = 0; }
    for (const k in this.barFlash) this.barFlash[k] -= dt;
    if (this.whiteFlash > 0) this.whiteFlash -= dt;
    if (this.fadeFlash > 0) this.fadeFlash -= dt;
    if (this.markPop > 0) this.markPop -= dt * 2;
    if (this.comboPop) { this.comboPop.t -= dt * 0.9; if (this.comboPop.t <= 0) this.comboPop = null; }
    if (this.chispaT > 0) this.chispaT -= dt;
    if (this.panT > 0) this.panT -= dt;
    if (this.banner) { this.banner.life -= dt; if (this.banner.life <= 0) this.banner = null; }
    for (const t of this.toasts) t.life -= dt;
    this.toasts = this.toasts.filter((t) => t.life > 0);
    if (this.reinforce > 0) {
      this.reinforce -= dt;
      if (this.reinforce <= 0 && this.room.alarm) {
        const p = this.player, side = p.cx > this.room.W * T / 2 ? 2 : this.room.W - 3;
        let ty = 1; while (ty < this.room.H - 1 && !(solidAt(side, ty + 1) && !solidAt(side, ty) && !solidAt(side, ty - 1))) ty++;
        if (ty < this.room.H - 1) { this.spawn({ type: 'reforzado', x: side, y: ty, hostile: true }); this.toast('Llegan refuerzos de la PDC'); }
      }
    }
    // Plataformas temporales (hielo, enemigos congelados)
    this.platforms = this.platforms.filter((p) => !p.frozen && (p.life -= dt) > 0);
    this.updateCrumbles(dt);
    // Objetivo de E
    const p = this.player;
    this.interactTarget = null;
    if (!this.cine) {
      let best = 30;
      for (const e of this.ents) {
        if (e.dead || !e.prompt) continue;
        const dx = Math.abs(e.cx - p.cx);
        if (dx < best && p.y < e.y + e.h + 14 && p.y + p.h > e.y - 8) { best = dx; this.interactTarget = e; }
      }
    }
    if (!this.interactTarget || !Input.down.use) { if (this.copyProgress > 0 && !(this.interactTarget && this.interactTarget.copyT)) this.copyProgress = 0; }
    this.hints = [];
    p.hidden = p.state === 'crouch' && this.ents.some((e) => e instanceof Escondite && overlap(p, e));
    for (const e of this.ents) if (!e.dead) e.update(dt);
    if (p.ghost) { /* en una escena: lo mueve su actor */ }
    else if (this.dieT <= 0 && this.caughtT <= 0) p.update(dt);
    else { p.vx *= 0.9; p.vy = Math.min(p.vy + PH.grav * dt, PH.fall); moveBody(p, dt); }
    for (const tr of p.trail) tr.life -= dt;
    p.trail = p.trail.filter((tr) => tr.life > 0);
    this.ents = this.room.ents = this.ents.filter((e) => !e.dead);
    for (const pr of this.projs) pr.update(dt);
    this.projs = this.projs.filter((pr) => !pr.dead);
    for (const w of this.waves) w.r += 260 * dt;
    this.waves = this.waves.filter((w) => w.r < w.max);
    for (const q of this.parts) {
      q.life -= dt;
      if (q.seek) { const k = Math.min(1, dt * 12); q.x += (q.tx - q.x) * k; q.y += (q.ty - q.y) * k; }
      else { q.vy += (q.g || 0) * dt; q.x += q.vx * dt; q.y += q.vy * dt; }
    }
    this.parts = this.parts.filter((q) => q.life > 0);
    if (this.parts.length > 600) this.parts.splice(0, this.parts.length - 600);
    for (const t of this.texts) { t.life -= dt; t.y -= 14 * dt; }
    this.texts = this.texts.filter((t) => t.life > 0);
    // Puertas que se abren con un evento
    for (const d of this.room.def.ents) if (d.type === 'gate' && this.save.flags[d.flag] && this.room.grid[d.y][d.x] === 'X') {
      for (let j = 0; j < (d.h || 1); j++) for (let i = 0; i < (d.w || 1); i++) this.room.grid[d.y + j][d.x + i] = '.';
      burst(d.x * T + 24, d.y * T + 8, 14, ['#6a6a7a', '#9a9aaa'], 60, 0.6, 200); Audio2.sfx('break'); this.tileChanged();
    }
    if (!this.cine) this.checkTransition();
    const ct = this.camTarget();
    const k = Math.min(1, dt * (this.camLock ? this.camLock.speed : 7));
    this.cam.x += (ct.x - this.cam.x) * k; this.cam.y += (ct.y - this.cam.y) * Math.min(1, dt * (this.camLock ? this.camLock.speed : 9));
  },
  // ---------------------------------------------------------------- Título
  // Admin: ir a cualquier sala para verla. Sus partidas no escriben el progreso real.
  adminList() {
    const order = ['eibar', 'plaza', 'pueblo', 'tormenta', 'bosque', 'ibaia'];
    const short = { eibar: 'Eibar', plaza: 'Plaza', pueblo: 'Pueblo', tormenta: 'Tormenta', bosque: 'Bosque', ibaia: 'Ibaia' };
    const rooms = Object.values(ROOMS)
      .sort((a, b) => order.indexOf(a.area) - order.indexOf(b.area))
      .map((r) => ({ id: r.id, label: `${short[r.area] || r.area} · ${r.title || r.id}` }));
    return [{ action: 'max', label: 'Marcas y vida al máximo' }, ...rooms];
  },
  adminMax() {
    const S = this.save;
    for (const m of ['destino', 'energia', 'temperatura']) if (!S.marks.includes(m)) S.marks.push(m);
    S.bars.energia = 100; S.bars.temperatura = 100; S.hp = S.maxHp;
    if (!S.active || S.active === 'destino') S.active = 'energia';
    this.toast('Admin: marcas y vida al máximo');
  },
  adminGo(id) {
    const r = ROOMS[id];
    if (!r) return;
    this.adminSession = true;
    const sp = spawnPoint(r);
    this.roomStates = {}; this.timers = []; this.race = null; this.boss = null; this.trans = null;
    this.queue = []; this.dlg = null; this.cine = false; this.cutscene = false; this.camLock = null;
    this.waitFn = null; this.waitT = 0; this.scriptDone = null; this.titleCard = null;
    this.fade = this.fadeTarget = 0; this.caughtT = 0; this.dieT = 0;
    const p = this.player;
    p.ghost = false; p.state = 'normal'; p.setH(26); p.vx = 0; p.vy = 0; p.inv = 2; p.charge = 0; p.trail = [];
    delete this.save.flags['enter_' + id];   // así también se ven las escenas de entrada
    this.loadRoom(id, sp.x * T + 3, (sp.y + 1) * T - 26);
    const ct = this.camTarget(); this.cam.x = ct.x; this.cam.y = ct.y;
    this.state = 'play'; this.lastBanner = null;
    this.enterScript();
  },
  titleOpts() {
    const o = this.hasSave() ? ['Continuar', 'Nueva partida', 'Controles'] : ['Nueva partida', 'Controles'];
    if (this.adminOn) o.push('Admin');
    return o;
  },
  updateTitle(dt) {
    this.titleT += dt;
    if (this.menu.controls) { if (Input.ok() || Input.pressed.pause || Input.pressed.shoot) { this.menu.controls = false; Audio2.sfx('select'); } return; }
    const opts = this.titleOpts();
    if (Input.pressed.up) { this.menu.sel = (this.menu.sel + opts.length - 1) % opts.length; Audio2.sfx('select'); }
    if (Input.pressed.down) { this.menu.sel = (this.menu.sel + 1) % opts.length; Audio2.sfx('select'); }
    this.menu.sel = Math.min(this.menu.sel, opts.length - 1);
    if (Input.ok()) {
      Audio2.unlock();
      const o = opts[this.menu.sel];
      Audio2.sfx('pickup');
      if (o === 'Continuar') this.start(true);
      else if (o === 'Nueva partida') this.start(false);
      else if (o === 'Admin') { this.start(false, true); this.state = 'pause'; this.menu.tab = this.tabs().indexOf('Admin'); this.menu.sel = 0; }
      else this.menu.controls = true;
    }
  },
  tabs() { return this.adminOn ? [...PAUSE_TABS, 'Admin'] : PAUSE_TABS; },
  updatePause() {
    const m = this.menu;
    if (Input.pressed.pause || Input.pressed.map) { this.state = 'play'; Audio2.sfx('select'); return; }
    const nTabs = this.tabs().length;
    if (Input.pressed.left) { m.tab = (m.tab + nTabs - 1) % nTabs; m.sel = 0; Audio2.sfx('select'); }
    if (Input.pressed.right || Input.pressed.swap) { m.tab = (m.tab + 1) % nTabs; m.sel = 0; Audio2.sfx('select'); }
    if (this.tabs()[m.tab] === 'Opciones') {
      if (Input.pressed.up || Input.pressed.down) { m.sel = (m.sel + 1) % 3; Audio2.sfx('select'); }
      if (Input.ok()) {
        if (m.sel === 0) { this.state = 'play'; }
        else if (m.sel === 1) { Audio2.toggleMute(); }
        else { this.state = 'title'; this.menu.sel = 0; Audio2.setMusic('title'); Audio2.setRain(0); Audio2.setHum(false); }
      }
    }
    if (this.tabs()[m.tab] === 'Admin') {
      const list = this.adminList(), n = list.length;
      if (Input.pressed.up) { m.sel = (m.sel + n - 1) % n; Audio2.sfx('select'); }
      if (Input.pressed.down) { m.sel = (m.sel + 1) % n; Audio2.sfx('select'); }
      if (Input.ok()) { const it = list[m.sel]; if (it.action === 'max') this.adminMax(); else this.adminGo(it.id); }
    }
  },
};

// ================================================================== Dibujo
const screen = document.getElementById('screen');
const SC = screen.getContext('2d');
const buf = document.createElement('canvas');
buf.width = VIEW_W; buf.height = VIEW_H;
const B = buf.getContext('2d');
let S = 3, OX = 0, OY = 0;
function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = window.innerWidth, h = window.innerHeight;
  screen.width = Math.floor(w * dpr); screen.height = Math.floor(h * dpr);
  screen.style.width = w + 'px'; screen.style.height = h + 'px';
  let s = Math.min(screen.width / VIEW_W, screen.height / VIEW_H);
  if (s >= 2) s = Math.floor(s);
  S = s; OX = Math.floor((screen.width - VIEW_W * S) / 2); OY = Math.floor((screen.height - VIEW_H * S) / 2);
}
addEventListener('resize', resize);
resize();

function keyName(a) {
  const pad = { jump: 'A', shoot: 'X', dash: 'B', use: 'Y', power: 'RT', swap: 'LB', pause: 'Start' };
  const kb = { jump: 'Espacio', shoot: 'X', dash: 'Shift', use: 'E', power: 'C', swap: 'Q', pause: 'Esc' };
  return Input.usingPad ? pad[a] : kb[a];
}
// Texto a resolución de pantalla, encima de los píxeles
function txt(str, x, y, size = 8, col = '#f3ead8', align = 'left', shadow = true, alpha = 1) {
  SC.font = `${Math.round(size * S)}px ${FONT}`;
  SC.textAlign = align; SC.textBaseline = 'top';
  SC.globalAlpha = alpha;
  if (shadow) { SC.fillStyle = 'rgba(11,10,23,0.9)'; SC.fillText(str, OX + x * S + Math.max(1, S * 0.5), OY + y * S + Math.max(1, S * 0.5)); }
  SC.fillStyle = col; SC.fillText(str, OX + x * S, OY + y * S);
  SC.globalAlpha = 1;
}
function wrap(str, maxW, size) {
  SC.font = `${Math.round(size * S)}px ${FONT}`;
  const out = [];
  for (const para of str.split('\n')) {
    if (!para) { out.push(''); continue; }
    let line = '';
    for (const w of para.split(' ')) {
      const t2 = line ? line + ' ' + w : w;
      if (SC.measureText(t2).width / S > maxW && line) { out.push(line); line = w; } else line = t2;
    }
    out.push(line);
  }
  return out;
}
function box(x, y, w, h, fill = 'rgba(11,10,23,0.88)', edge = '#5a4a62') {
  SC.fillStyle = fill; SC.fillRect(OX + x * S, OY + y * S, w * S, h * S);
  SC.fillStyle = edge;
  SC.fillRect(OX + x * S, OY + y * S, w * S, Math.max(1, S / 2)); SC.fillRect(OX + x * S, OY + (y + h) * S - Math.max(1, S / 2), w * S, Math.max(1, S / 2));
  SC.fillRect(OX + x * S, OY + y * S, Math.max(1, S / 2), h * S); SC.fillRect(OX + (x + w) * S - Math.max(1, S / 2), OY + y * S, Math.max(1, S / 2), h * S);
}
function blitBuf() {
  SC.imageSmoothingEnabled = false;
  SC.fillStyle = '#05040a'; SC.fillRect(0, 0, screen.width, screen.height);
  SC.drawImage(buf, 0, 0, VIEW_W, VIEW_H, OX, OY, VIEW_W * S, VIEW_H * S);
}

const sceneCv = document.createElement('canvas');
sceneCv.width = VIEW_W; sceneCv.height = VIEW_H;
const sceneC = sceneCv.getContext('2d');
const ease = (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
function renderWorld() {
  const c = B, r = G.room, t = G.t;
  G.bubbles = [];
  let cx = Math.round(G.cam.x), cy = Math.round(G.cam.y);
  if (G.shakeA) { cx += Math.round((Math.random() - 0.5) * G.shakeA); cy += Math.round((Math.random() - 0.5) * G.shakeA); }
  drawBackground(c, r, G.cam, t);
  c.save(); c.translate(-cx, -cy);
  c.drawImage(r.tileCv, 0, 0);
  drawAnimTiles(c, r, t);
  for (const p of G.platforms) if (p.ice) {
    if (p.life < 1 && Math.floor(p.life * 10) % 2) continue;
    R(c, p.x, p.y, p.w, 5, '#5ad8e0'); R(c, p.x, p.y, p.w, 1, '#e8ffff'); R(c, p.x + 2, p.y + 5, p.w - 4, 1, '#2a8a96');
  }
  const back = [], front = [];
  for (const e of G.ents) (e.enemy ? front : back).push(e);
  for (const e of back) e.draw(c);
  for (const e of front) e.draw(c);
  G.player.draw(c);
  for (const pr of G.projs) pr.draw(c);
  for (const b of G.bolts) {
    let x = b.x;
    for (let y = -40; y < b.y; y += 6) {
      const nx = b.x + (Math.random() - 0.5) * 14;
      R(c, Math.min(x, nx), y, Math.max(2, Math.abs(nx - x)), 6, '#ffffff'); R(c, nx - 1, y, 1, 6, '#9fd0ff');
      x = nx;
    }
  }
  for (const w of G.waves) {
    const n = 28;
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; R(c, w.x + Math.cos(a) * w.r, w.y + Math.sin(a) * w.r * 0.6, 2, 1, i % 2 ? '#ffffff' : w.col); }
  }
  for (const q of G.parts) {
    c.globalAlpha = Math.max(0, Math.min(1, q.life / (q.max || 0.5) * 1.5));
    R(c, q.x, q.y, q.s || 1, q.s || 1, q.col);
  }
  c.globalAlpha = 1;
  c.restore();
  drawWeather(c, r, G.cam, t);
  if (themeOf(r).interior) {
    // Viñeta suave
    const g = c.createRadialGradient(VIEW_W / 2, VIEW_H / 2, 80, VIEW_W / 2, VIEW_H / 2, 260);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(5,4,10,0.55)');
    c.fillStyle = g; c.fillRect(0, 0, VIEW_W, VIEW_H);
  }
  if (G.whiteFlash > 0) { c.fillStyle = `rgba(255,255,255,${Math.min(0.8, G.whiteFlash * 2)})`; c.fillRect(0, 0, VIEW_W, VIEW_H); }
  // Transición entre salas: la vieja sale, la nueva entra
  if (G.trans) {
    const k = ease(Math.min(1, G.trans.t / G.trans.dur)), { dx, dy } = G.trans;
    sceneC.clearRect(0, 0, VIEW_W, VIEW_H); sceneC.drawImage(buf, 0, 0);
    c.fillStyle = '#05040a'; c.fillRect(0, 0, VIEW_W, VIEW_H);
    c.drawImage(G.snapCv, Math.round(-k * VIEW_W * dx), Math.round(-k * VIEW_H * dy));
    c.drawImage(sceneCv, Math.round((1 - k) * VIEW_W * dx), Math.round((1 - k) * VIEW_H * dy));
    c.fillStyle = `rgba(5,4,10,${Math.sin(k * Math.PI) * 0.35})`; c.fillRect(0, 0, VIEW_W, VIEW_H);
  } else { sceneC.clearRect(0, 0, VIEW_W, VIEW_H); sceneC.drawImage(buf, 0, 0); }
  // Bandas de cine durante las escenas
  if (G.letterbox > 0.01) { const h = Math.round(20 * G.letterbox); c.fillStyle = '#05040a'; c.fillRect(0, 0, VIEW_W, h); c.fillRect(0, VIEW_H - h, VIEW_W, h); }
  if ((!G.dlg || G.dlg.type !== 'card') && G.letterbox < 0.5) drawHUD(c);
  if (G.fade > 0) { c.fillStyle = `rgba(5,4,10,${G.fade})`; c.fillRect(0, 0, VIEW_W, VIEW_H); }
  let fade = 0;
  if (G.dieT > 0) fade = 1 - G.dieT / 1.4;
  if (G.caughtT > 0) fade = Math.max(0, 1 - G.caughtT / 0.5);
  if (G.fadeFlash > 0) fade = Math.max(fade, G.fadeFlash * 2);
  if (fade > 0) { c.fillStyle = `rgba(5,4,10,${Math.min(1, fade)})`; c.fillRect(0, 0, VIEW_W, VIEW_H); }
}
function renderOverlay() {
  const cx = G.cam.x, cy = G.cam.y;
  // Pistas en el mundo
  // La pista más cercana, en una franja fija abajo
  const hint = G.hints.reduce((m, h) => (!m || h.a > m.a ? h : m), null);
  if (hint && !G.dlg && !G.cine) {
    const w = Math.min(360, hint.text.length * 4.3 + 18);
    SC.globalAlpha = hint.a * 0.9; box(VIEW_W / 2 - w / 2, VIEW_H - 50, w, 13, 'rgba(20,13,31,0.85)', '#6a5a40'); SC.globalAlpha = 1;
    txt(hint.text, VIEW_W / 2, VIEW_H - 47, 6.5, '#ffe7a3', 'center', false, hint.a);
  }
  for (const t of G.texts) txt(t.text, t.x - cx, t.y - cy, 6, t.col, 'center', true, Math.min(1, t.life * 2));
  for (const b of G.bubbles) {
    const w = b.text.length * 4 + 10;
    SC.globalAlpha = b.a; box(b.x - cx - w / 2, b.y - cy - 12, w, 11, 'rgba(243,234,216,0.95)', '#5a4a62'); SC.globalAlpha = 1;
    txt(b.text, b.x - cx, b.y - cy - 10, 6, '#1a1428', 'center', false, b.a);
  }
  if (G.race) {
    const r = G.race, low = r.t < 5;
    box(VIEW_W / 2 - 28, 4, 56, 15, 'rgba(11,10,23,0.8)', low ? '#ff4a3a' : '#f2c45a');
    txt(r.t.toFixed(1) + ' s', VIEW_W / 2, 6, 9, low && Math.floor(G.t * 6) % 2 ? '#ff4a3a' : '#f2c45a', 'center', false);
  }
  if (G.boss && G.letterbox < 0.5) {
    const b = G.boss, w = 220, x = (VIEW_W - w) / 2, y = VIEW_H - 22;
    txt(b.name, VIEW_W / 2, y - 10, 6.5, '#e0b878', 'center');
    box(x, y, w, 7, 'rgba(11,10,23,0.85)', '#7a5a2e');
    SC.fillStyle = '#b88a4a'; SC.fillRect(OX + (x + 1) * S, OY + (y + 1) * S, (w - 2) * Math.max(0, b.hp / b.max) * S, 5 * S);
  }
  // Indicación de E
  const it = G.interactTarget;
  if (it && !G.cine) txt(`[${keyName('use')}] ${it.prompt}`, it.cx - cx, it.y - cy - 12, 6.5, '#ffffff', 'center');
  // Nombre de la marca al cambiar
  // Racha: el último movimiento y el multiplicador
  const cp = G.comboPop, pl = G.player;
  if (cp && pl.racha >= 2 && !G.cine) {
    const a = Math.min(1, cp.t * 2);
    txt(`${cp.name}  ×${pl.racha}`, VIEW_W / 2, 22, pl.racha >= 10 ? 9 : 7.5, pl.racha >= 10 ? '#ffe7a3' : '#f2c45a', 'center', true, a);
  }
  if (G.markPop > 0 && G.save.active && G.save.active !== 'destino') txt(PLAYER_MARKS[G.save.active].name, 22, 31, 7, PLAYER_MARKS[G.save.active].glow, 'left', true, Math.min(1, G.markPop * 2));
  // Rótulo del barrio
  if (G.banner) {
    const a = Math.min(1, G.banner.life, (3.2 - G.banner.life) * 3);
    txt(G.banner.title, VIEW_W / 2, 40, 14, '#f2c45a', 'center', true, a);
    if (G.banner.sub) txt(G.banner.sub, VIEW_W / 2, 58, 7, '#d8cce8', 'center', true, a);
  }
  G.toasts.forEach((t, i) => {
    const a = Math.min(1, t.life * 2, (t.max - t.life) * 4);
    const w = Math.min(320, t.text.length * 4.4 + 16);
    SC.globalAlpha = a; box(VIEW_W / 2 - w / 2, VIEW_H - 30 - i * 16, w, 13); SC.globalAlpha = 1;
    txt(t.text, VIEW_W / 2, VIEW_H - 27 - i * 16, 7, '#ffe7a3', 'center', false, a);
  });
  if (G.titleCard) {
    const tc = G.titleCard, a = Math.min(1, tc.t * 2, (tc.dur - tc.t) * 2);
    const n = Math.min(tc.title.length, Math.floor(tc.t * 28));
    if (tc.lb) { SC.globalAlpha = a; box(VIEW_W / 2 - 80, 60, 160, 44, 'rgba(11,10,23,0.88)', '#8a6a20'); SC.globalAlpha = 1; }
    txt(tc.title.slice(0, n), VIEW_W / 2, tc.lb ? 68 : 80, tc.lb ? 10 : 16, '#f2c45a', 'center', true, a);
    if (tc.sub) txt(tc.sub, VIEW_W / 2, tc.lb ? 86 : 102, 7.5, '#d8cce8', 'center', true, Math.max(0, Math.min(a, tc.t * 2 - 0.6)));
  }
  if (G.dlg) drawDialog();
}
function drawDialog() {
  const d = G.dlg;
  if (d.type === 'say') {
    // En las escenas, arriba: así no tapa a los personajes
    const x = 16, y = G.letterbox > 0.5 ? 22 : VIEW_H - 62, w = VIEW_W - 32, h = 52;
    box(x, y, w, h);
    const pk = { centralita: null, radio: null, paladin: 'paladin', acolito: 'acolito' };
    const pc = portrait(d.who in pk ? pk[d.who] : NPC_CH[d.who] || d.who);
    SC.imageSmoothingEnabled = false;
    box(x + 6, y + 6, 40, 40, '#1a1428', '#3a2e4a');
    SC.drawImage(pc, 0, 0, 24, 24, OX + (x + 8) * S, OY + (y + 8) * S, 36 * S, 36 * S);
    txt(NAMES[d.who] || d.who, x + 52, y + 5, 7, '#f2c45a');
    const lines = wrap(d.text.slice(0, Math.floor(d.shown)), w - 62, 7);
    lines.slice(0, 4).forEach((l, i) => txt(l, x + 52, y + 16 + i * 8.5, 7));
    if (d.shown >= d.text.length && Math.floor(G.t * 3) % 2) txt('▼', x + w - 10, y + h - 10, 6, '#f2c45a', 'center');
  } else if (d.type === 'choice') {
    const x = 96, y = VIEW_H - 60, w = 192, h = 14 + d.opts.length * 13;
    box(x, y - 4, w, h);
    d.opts.forEach(([label], i) => {
      const sel = i === d.sel;
      txt((sel ? '▸ ' : '  ') + label, x + 14, y + 2 + i * 13, 8, sel ? '#f2c45a' : '#b5aed0');
    });
  } else if (d.type === 'card') {
    SC.fillStyle = 'rgba(5,4,10,0.94)'; SC.fillRect(0, 0, screen.width, screen.height);
    const sw = 200, sh = 76;
    const cv = drawDialog.cv || (drawDialog.cv = document.createElement('canvas'));
    cv.width = sw; cv.height = sh;
    const c = cv.getContext('2d'); c.clearRect(0, 0, sw, sh);
    drawScene(d.scene, c, sw, sh, G.t);
    SC.imageSmoothingEnabled = false;
    const sx = (VIEW_W - sw) / 2, sy = 10;
    SC.drawImage(cv, OX + sx * S, OY + sy * S, sw * S, sh * S);
    box(sx - 1, sy - 1, sw + 2, sh + 2, 'rgba(0,0,0,0)', '#5a4a62');
    const a = Math.min(1, d.t * 3);
    txt(d.title, VIEW_W / 2, sy + sh + 6, 11, '#f2c45a', 'center', true, a);
    txt(d.sub, VIEW_W / 2, sy + sh + 20, 7, '#d8cce8', 'center', true, a);
    const lines = wrap(d.text, 300, 6.5);
    lines.forEach((l, i) => txt(l, VIEW_W / 2, sy + sh + 32 + i * 8, 6.5, '#f3ead8', 'center', true, Math.min(1, Math.max(0, d.t * 3 - 0.5 - i * 0.08))));
    if (d.t > 0.6 && Math.floor(G.t * 3) % 2) txt('▼', VIEW_W / 2, VIEW_H - 10, 6, '#f2c45a', 'center');
  }
}

// ------------------------------------------------------------------ Título
const titleRoofs = (() => { const r = rng(7), a = []; let x = 0; for (let i = 0; i < 40; i++) { const w = 34 + Math.floor(r() * 50), top = 150 + Math.floor(r() * 26); a.push({ x, w, top, chim: r() < 0.5 }); x += w + 12 + Math.floor(r() * 18); } return a; })();
const titleLoop = titleRoofs[titleRoofs.length - 1].x;
const tj = { y: 150, vy: 0, air: false, dash: 0 };
let tScroll = 0;
function roofAtT(wx) { const m = ((wx % titleLoop) + titleLoop) % titleLoop; return titleRoofs.find((r) => m >= r.x && m < r.x + r.w) || null; }
function renderTitle(dt) {
  const c = B, t = G.t;
  sky(c, VIEW_W, VIEW_H, '#1a1838', '#6a3a58', 8);
  R(c, 320, 26, 10, 10, '#f3e7c9'); R(c, 318, 28, 2, 6, '#f3e7c9');
  const r0 = rng(3); for (let i = 0; i < 50; i++) R(c, Math.floor(r0() * VIEW_W), Math.floor(r0() * 100), 1, 1, r0() < 0.5 ? '#c9c2e6' : '#7a74a0');
  const tx = 270 - ((tScroll * 0.05) % 500);
  for (const k of [0, 500]) { const x = tx + k; R(c, x, 30, 6, 120, '#3a3060'); R(c, x - 3, 50, 12, 100, '#2e2650'); R(c, x + 2, 26, 2, 4, '#ffb547'); for (let a = 0; a <= 40; a++) { const ang = Math.PI * a / 40; R(c, x + 3 + Math.cos(ang) * 60, 150 - Math.sin(ang) * 70, 1, 1, Math.sin(t * 3 + a) > 0 ? '#ffb547' : '#8a5a24'); } }
  const vx = 40 - ((tScroll * 0.12) % 260); for (let k = 0; k < 3; k++) veil(c, Math.round(vx + k * 260), 6, 30, 160, t);
  c.save(); c.translate(-Math.floor((tScroll * 0.2) % 384), 0); skyline(c, 800, 160, '#2a2448', 11, 16, 50, 8, 18, '#e8b860'); c.restore();
  c.save(); c.translate(-Math.floor((tScroll * 0.45) % 384), 0); skyline(c, 800, 172, '#221d3a', 5, 10, 40, 10, 20, '#ffd48a'); c.restore();
  for (const rf of titleRoofs) for (const off of [0, titleLoop]) {
    const x = Math.round(rf.x + off - tScroll);
    if (x > VIEW_W + 10 || x + rf.w < -10) continue;
    R(c, x, rf.top, rf.w, VIEW_H - rf.top, '#3c2e3e'); R(c, x, rf.top, rf.w, 3, '#7a5a5a'); R(c, x, rf.top, rf.w, 1, '#9a7a72');
    for (let wy = rf.top + 9; wy < VIEW_H; wy += 9) for (let wx = x + 5; wx < x + rf.w - 4; wx += 8) R(c, wx, wy, 3, 4, (wx * 7 + wy) % 5 ? '#241a2a' : '#ffcf7a');
    if (rf.chim) { R(c, x + 7, rf.top - 10, 6, 10, '#4a3644'); R(c, x + 6, rf.top - 11, 8, 1, '#5a4252'); }
    if ((rf.x / 10 | 0) % 3 === 0) { R(c, x + rf.w - 9, rf.top - 12, 1, 12, '#1b1b26'); R(c, x + rf.w - 10, rf.top - 14, 3, 2, Math.sin(t * 9) > 0 ? '#9fd0ff' : '#2f8bff'); }
  }
  // Jon corriendo solo por los tejados
  const wx = tScroll + 110, under = roofAtT(wx);
  if (!tj.air) { if (!under) { tj.air = true; tj.vy = 0; } else { tj.y = under.top; const ah = roofAtT(wx + 14); if (!ah || ah !== under) { tj.air = true; tj.vy = -150; } } }
  else {
    tj.vy += 420 * dt; tj.y += tj.vy * dt;
    if (tj.vy > -10 && tj.dash <= 0 && !roofAtT(wx + 36) && !roofAtT(wx + 8)) tj.dash = 0.22;
    if (under && tj.vy > 0 && tj.y >= under.top) { tj.y = under.top; tj.air = false; }
    if (tj.y > 240) { tj.y = 100; tj.vy = 0; }
  }
  if (tj.dash > 0) { tj.dash -= dt; tj.vy = Math.min(tj.vy, 5); }
  const pose = tj.dash > 0 ? MOVE.dash() : tj.air ? (tj.vy < -40 ? MOVE.jump() : tj.vy < 40 ? MOVE.apex() : MOVE.fall()) : MOVE.run(Math.floor(t * 12.5) % 6);
  const spr = sprite('jon', CH.jon, { ...pose, marks: ['#2f8bff'] });
  if (tj.dash > 0) for (let i = 1; i <= 3; i++) drawSprite(c, sprite('jon', CH.jon, MOVE.dash(), '#2f8bff'), 98 - i * 8, Math.round(tj.y) - 31, false, 0.6 - i * 0.15);
  drawSprite(c, spr, 98, Math.round(tj.y) - 31);
  tScroll += dt * (tj.dash > 0 ? 130 : 60);
  // Logo
  const logo = 'ASCEND';
  c.fillStyle = 'rgba(11,10,23,0.45)'; c.fillRect(0, 36, VIEW_W, 44);
  glyph(c, 'destino', VIEW_W / 2 - 13, 10, 3);
}
function renderTitleText() {
  txt('ASCEND', VIEW_W / 2 + 1, 41, 30, '#6a4a10', 'center', false);
  txt('ASCEND', VIEW_W / 2, 40, 30, '#f2c45a', 'center', true);
  txt('Un chico de Eibar con una marca dorada · plataformas en pixel art', VIEW_W / 2, 84, 6.5, '#d8cce8', 'center');
  if (G.menu.controls) { drawControls(60, 95); return; }
  const opts = G.titleOpts();
  opts.forEach((o, i) => {
    const sel = i === G.menu.sel;
    txt((sel ? '▸ ' : '') + o, VIEW_W / 2, 112 + i * 14, 9, sel ? '#f2c45a' : '#b5aed0', 'center');
  });
  txt('Flechas o WASD · Espacio o E para elegir · también con mando', VIEW_W / 2, VIEW_H - 12, 6, '#7a74a0', 'center');
}
const CONTROLS = [
  ['Mover', '← → · A D'], ['Saltar (suelta antes: salto corto)', 'Espacio · Z · K'], ['Agacharse · deslizarse · rodar', '↓ · S'],
  ['Disparo de la marca (mantén: carga)', 'X · J'], ['Poder de la marca', 'C · L'], ['Dash en el aire (Energía)', 'Shift · V'],
  ['Apuntar arriba (con dirección: diagonal)', '↑ · W'], ['Usar · absorber · copiar (mantén)', 'E · I'], ['Cambiar de marca', 'Q · Tab'], ['Pausa y mapa', 'Esc · P · M'],
];
function drawControls(x, y) {
  const lh = 9;
  box(x - 8, y - 5, VIEW_W - 2 * x + 16, CONTROLS.length * lh + 20);
  CONTROLS.forEach(([a, k], i) => { txt(a, x, y + i * lh, 6.3, '#d8cce8'); txt(k, VIEW_W - x, y + i * lh, 6.3, '#f2c45a', 'right'); });
  txt('Mando: A saltar · X disparo · B dash · Y usar · RT poder · LB/RB marca · Start pausa', VIEW_W / 2, y + CONTROLS.length * lh + 3, 5.5, '#9a94b8', 'center');
}

// ------------------------------------------------------------------ Pausa: mapa, marcas, páginas
// Lista de salas del admin: una ventana de filas con la selección centrada
function drawAdmin() {
  const list = G.adminList(), m = G.menu, rows = 12, lh = 12, top = 34;
  txt('Admin · elige una sala para verla', VIEW_W / 2, 22, 7, '#f2c45a', 'center');
  const off = clamp(m.sel - Math.floor(rows / 2), 0, Math.max(0, list.length - rows));
  for (let i = off; i < Math.min(list.length, off + rows); i++) {
    const it = list[i], y = top + (i - off) * lh, sel = i === m.sel;
    txt((sel ? '▸ ' : '  ') + it.label, 36, y, 6.8, sel ? '#f2c45a' : '#c8c0d8');
    if (it.id) txt(it.id, VIEW_W - 36, y, 6, '#7a74a0', 'right');
  }
  txt(`${m.sel + 1} / ${list.length}`, VIEW_W - 36, 22, 6, '#7a74a0', 'right');
  txt('↑ ↓ elegir · Espacio o E ir · ← → pestañas · M cerrar', VIEW_W / 2, VIEW_H - 12, 6, '#7a74a0', 'center');
}
function renderPause() {
  SC.fillStyle = 'rgba(5,4,10,0.86)'; SC.fillRect(0, 0, screen.width, screen.height);
  const m = G.menu;
  const tabs = G.tabs(), step = (VIEW_W - 72) / (tabs.length - 1);
  tabs.forEach((tb, i) => txt(tb, 36 + i * step, 8, 7.5, i === m.tab ? '#f2c45a' : '#7a74a0', 'center'));
  txt('◂ ▸', VIEW_W - 14, 8, 7, '#7a74a0', 'right');
  const tab = tabs[m.tab];
  if (tab === 'Mapa') drawMap();
  else if (tab === 'Marcas') drawMarks();
  else if (tab === 'Páginas') {
    const ids = Object.keys(PAGES);
    txt(`Páginas de la Ascensión: ${G.save.pages.length} de ${ids.length}`, VIEW_W / 2, 26, 8, '#f2c45a', 'center');
    let y = 42;
    for (const id of ids) {
      const have = G.save.pages.includes(id);
      txt(have ? PAGES[id][0] : '· · ·', 30, y, 7, have ? '#ffe7a3' : '#5a5470');
      if (have) { const ls = wrap(PAGES[id][1], VIEW_W - 60, 5.8); ls.slice(0, 3).forEach((l, i) => txt(l, 30, y + 9 + i * 7, 5.8, '#c8c0d8')); y += 9 + Math.min(3, ls.length) * 7 + 6; }
      else y += 14;
    }
  } else if (tab === 'Admin') drawAdmin();
  else if (tab === 'Controles') drawControls(50, 30);
  else {
    ['Seguir jugando', Audio2.muted ? 'Activar sonido' : 'Silenciar', 'Volver al título'].forEach((o, i) => txt((i === m.sel ? '▸ ' : '') + o, VIEW_W / 2, 70 + i * 16, 9, i === m.sel ? '#f2c45a' : '#b5aed0', 'center'));
    const tm = Math.floor(G.save.time);
    txt(`Tiempo: ${Math.floor(tm / 60)} min ${tm % 60} s · Chispas: ${G.save.chispas || 0} · Mejor racha: ×${(G.save.stats && G.save.stats.racha) || 0}`, VIEW_W / 2, 130, 6.5, '#7a74a0', 'center');
    txt('La partida se guarda en las caracolas de bronce y al cambiar de capítulo', VIEW_W / 2, 142, 6, '#7a74a0', 'center');
  }
}
const AREA_NAMES = { eibar: 'Eibar · La última noche', plaza: 'Eibar · La plaza', pueblo: 'Eibar · Cinco días', tormenta: 'Eibar · La tormenta', bosque: 'El bosque del viaducto', ibaia: 'Ibaia' };
function drawMap() {
  const area = G.room.def.area;
  const rooms = Object.values(ROOMS).filter((r) => r.area === area);
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const r of rooms) { x0 = Math.min(x0, r.x); y0 = Math.min(y0, r.y); x1 = Math.max(x1, r.x + r.W); y1 = Math.max(y1, r.y + r.H); }
  const k = Math.min(320 / (x1 - x0), 150 / (y1 - y0));
  const ox = (VIEW_W - (x1 - x0) * k) / 2, oy = 30 + (150 - (y1 - y0) * k) / 2;
  txt(AREA_NAMES[area], VIEW_W / 2, 20, 7, '#d8cce8', 'center');
  const P = G.player, S2 = G.save;
  for (const r of rooms) {
    const vis = S2.visited[r.id];
    if (!vis) continue;
    const rx = ox + (r.x - x0) * k, ry = oy + (r.y - y0) * k, rw = r.W * k, rh = r.H * k;
    const th = THEMES[r.theme];
    SC.fillStyle = r.id === G.room.def.id ? mix(th.cap, '#ffffff', 0.2) : th.body;
    SC.fillRect(OX + rx * S, OY + ry * S, rw * S - S, rh * S - S);
    // Silueta de las casillas sólidas
    SC.fillStyle = 'rgba(11,10,23,0.55)';
    for (let y = 0; y < r.H; y += 2) for (let x = 0; x < r.W; x += 2) if (SOLID.has(r.grid[y][x])) SC.fillRect(OX + (rx + x * k) * S, OY + (ry + y * k) * S, Math.ceil(2 * k * S), Math.ceil(2 * k * S));
    // Sitios a los que volver: falta una marca
    const needs = !G.player.has('temperatura') && r.grid.some((row) => row.includes('F') || row.includes('k') || row.includes('I'));
    if (needs) txt('!', rx + rw - 4, ry + 1, 7, '#ff8a2a', 'center');
    if (r.grid.some((row) => row.includes('V')) && !(r.veilFlag && S2.flags[r.veilFlag])) txt('◆', rx + rw / 2, ry + rh - 8, 6, '#ffb547', 'center');
    if (S2.saveRoom === r.id || r.ents.some((e) => e.type === 'caracola')) txt('◎', rx + 4, ry + 1, 6, '#e0b878', 'center');
  }
  const r = G.room.def;
  const px = ox + (r.x - x0) * k + P.cx / T * k, py = oy + (r.y - y0) * k + P.cy / T * k;
  if (Math.floor(G.t * 4) % 2) { SC.fillStyle = '#f2c45a'; SC.fillRect(OX + (px - 1.5) * S, OY + (py - 1.5) * S, 3 * S, 3 * S); }
  txt('◎ caracola   ! falta una marca   ◆ velo', VIEW_W / 2, VIEW_H - 14, 6, '#9a94b8', 'center');
}
function drawMarks() {
  const S2 = G.save;
  const list = [
    ['destino', 'Destino', 'Copiar: mantén E junto a una Encarnación que te dé permiso. Copiar no es quitar.'],
    ['energia', 'Energía', 'Disparo y descarga cargada · Onda (C), en el aire un rayo hacia abajo · Dash (Shift). Se recarga en faroles de tormenta y cristales de rayo.'],
    ['temperatura', 'Temperatura', 'Fuego (toque) y hielo (cargado): el hielo congela muros de fuego, cascadas y enemigos; el fuego derrite el hielo · Plataforma de hielo en el aire (C). Se recarga en braseros y arcones de escarcha.'],
  ];
  let y = 28;
  for (const [key, name, desc] of list) {
    const have = S2.marks.includes(key);
    SC.imageSmoothingEnabled = false;
    if (have) SC.drawImage(glyphCanvas(key), 0, 0, 9, 9, OX + 30 * S, OY + y * S, 18 * S, 18 * S);
    txt(have ? name : '???', 56, y, 9, have ? MARKS[key].color : '#5a5470');
    if (have) wrap(desc, VIEW_W - 90, 6).forEach((l, i) => txt(l, 56, y + 12 + i * 7, 6, '#c8c0d8'));
    y += 48;
  }
  txt('Las once marcas esperan en los barrios de Ibaia', VIEW_W / 2, VIEW_H - 14, 6, '#7a74a0', 'center');
}
function renderEnding() {
  SC.fillStyle = '#05040a'; SC.fillRect(0, 0, screen.width, screen.height);
  const cv = drawDialog.cv || (drawDialog.cv = document.createElement('canvas'));
  cv.width = 200; cv.height = 76;
  const c = cv.getContext('2d'); drawScene('final', c, 200, 76, G.t);
  SC.imageSmoothingEnabled = false;
  SC.drawImage(cv, OX + 92 * S, OY + 10 * S, 200 * S, 76 * S);
  const a = Math.min(1, G.endT);
  txt('Cae el segundo velo', VIEW_W / 2, 94, 12, '#f2c45a', 'center', true, a);
  const S2 = G.save, tm = Math.floor(S2.time);
  const lines = [
    'Jon ha roto dos Anclas. La Orilla Este respira.',
    S2.flags.mercy ? 'En algún lugar del monte, el Desconocido sigue vivo y te debe una.' : 'La marca de la Energía todavía tiembla cuando llueve.',
    `Páginas de la Ascensión: ${S2.pages.length} de ${Object.keys(PAGES).length} · Tiempo: ${Math.floor(tm / 60)} min ${tm % 60} s`,
    '', 'Continuará en Las Agujas.',
  ];
  lines.forEach((l, i) => txt(l, VIEW_W / 2, 114 + i * 10, 7, i === 4 ? '#ffb547' : '#d8cce8', 'center', true, Math.min(1, Math.max(0, G.endT - 0.4 - i * 0.2))));
  if (G.endT > 1.5 && Math.floor(G.t * 3) % 2) txt('Pulsa para volver al título', VIEW_W / 2, VIEW_H - 14, 6, '#7a74a0', 'center');
}

// ================================================================== Bucle
let last = performance.now();
function frame(now) {
  let dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  Input.update();
  // Pasos de física cortos; lo pulsado solo cuenta en el primero
  let first = true;
  while (dt > 0.0001) {
    const step = Math.min(dt, 1 / 60);
    G.update(step);
    if (first) { for (const a of ACTIONS) { Input.pressed[a] = false; Input.released[a] = false; } first = false; }
    dt -= step;
  }
  if (G.state === 'title') { renderTitle(Math.min(0.05, 1 / 60)); blitBuf(); renderTitleText(); }
  else if (G.state === 'ending') { renderEnding(); }
  else {
    renderWorld(); blitBuf(); renderOverlay();
    if (G.state === 'pause') renderPause();
  }
  requestAnimationFrame(frame);
}
// Escribir «gaur» en el título activa la opción Admin (o añade #admin al enlace).
// La clave no usa letras de confirmar (E, I, Z, K), para no elegir nada por error.
let typedKeys = '';
addEventListener('keydown', (e) => {
  if (!e.key || e.key.length !== 1) return;
  typedKeys = (typedKeys + e.key.toLowerCase()).slice(-4);
  if (typedKeys === 'gaur') G.adminOn = true;
});
Input.init();
Audio2.setMusic('title');
window.ASCEND = G;
requestAnimationFrame(frame);
