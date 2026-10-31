// Dibujo del mundo: casillas por tema, fondos con paralaje, clima, viñetas y HUD.
'use strict';
const hash = (x, y, s = 0) => { let h = (x * 374761393 + y * 668265263 + s * 982451653) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

// ------------------------------------------------------------------ Casillas
function renderTiles(rs) {
  const th = themeOf(rs);
  const cv = rs.tileCv || document.createElement('canvas');
  cv.width = rs.W * T; cv.height = rs.H * T;
  const c = cv.getContext('2d');
  c.clearRect(0, 0, cv.width, cv.height);
  const at = (x, y) => (x >= 0 && x < rs.W && y >= 0 && y < rs.H ? rs.grid[y][x] : rs.edge(x, y));
  const sol = (x, y) => SOLID.has(at(x, y)) && at(x, y) !== 'F';
  rs.anim = [];
  const edgeCol = mix(th.body, INK, 0.6), lit = mix(th.cap, '#fff1d0', 0.25);
  for (let y = 0; y < rs.H; y++) for (let x = 0; x < rs.W; x++) {
    const ch = rs.grid[y][x], px = x * T, py = y * T;
    if (ch === 'F' || ch === 'V' || ch === 'k' || ch === 'c') { rs.anim.push({ x, y, ch }); continue; }
    if (ch === '#') {
      const up = !sol(x, y - 1), down = !sol(x, y + 1), left = !sol(x - 1, y), right = !sol(x + 1, y);
      R(c, px, py, T, T, th.body);
      if (th.brick) {
        const bc = mix(th.body, INK, 0.3);
        for (let r = 0; r < 4; r++) {
          R(c, px, py + r * 4 + 3, T, 1, bc);
          const off = ((y * 4 + r) % 2) * 4;
          R(c, px + off + 3, py + r * 4, 1, 3, bc); R(c, px + off + 11, py + r * 4, 1, 3, bc);
        }
      } else {
        const h1 = hash(x, y);
        if (h1 < 0.35) R(c, px + 3 + Math.floor(h1 * 20), py + 5, 3, 1, mix(th.body, INK, 0.25));
        if (th.win && !up && h1 > 0.62) { R(c, px + 4, py + 4, 3, 5, h1 > 0.85 ? th.win : th.dark); R(c, px + 9, py + 4, 3, 5, h1 > 0.9 ? th.win : th.dark); }
      }
      if (up) {
        if (th.grass) {
          R(c, px, py, T, 3, th.cap); R(c, px, py + 3, T, 1, mix(th.cap, INK, 0.4));
          for (let i = 0; i < 4; i++) if (hash(x, y, i) > 0.4) R(c, px + i * 4 + 1, py - 1, 1, 1, lit);
        } else if (th.roof) {
          R(c, px, py, T, 4, th.cap); R(c, px, py, T, 1, lit);
          for (let i = 0; i < 4; i++) R(c, px + i * 4 + (y % 2) * 2, py + 2, 1, 2, mix(th.cap, INK, 0.35));
        } else { R(c, px, py, T, 2, th.cap); R(c, px, py, T, 1, lit); }
      }
      if (left) R(c, px, py, 1, T, edgeCol);
      if (right) R(c, px + T - 1, py, 1, T, edgeCol);
      if (down) R(c, px, py + T - 1, T, 1, edgeCol);
    } else if (ch === 'C') {
      const b = '#7a5a3a';
      R(c, px, py, T, T, mix(b, INK, 0.7)); R(c, px + 1, py + 1, T - 2, T - 2, b);
      R(c, px + 1, py + 1, T - 2, 1, lt(b)); R(c, px + 1, py + 1, 1, T - 2, lt(b));
      R(c, px + 1, py + T - 3, T - 2, 2, dk(b)); R(c, px + T - 3, py + 1, 2, T - 2, dk(b));
      line(c, px + 2, py + 2, px + T - 3, py + T - 3, dk(b));
    } else if (ch === 'W') {
      const up = !sol(x, y - 1), wd = '#6a4a30';
      R(c, px, py, T, T, wd);
      for (let r = 0; r < 4; r++) { R(c, px, py + r * 4 + 3, T, 1, '#4a3020'); if ((x + r) % 3 === 0) R(c, px + 6, py + r * 4, 1, 3, '#4a3020'); }
      if (up) { R(c, px, py, T, 2, '#8a6a48'); R(c, px, py, T, 1, '#a8885e'); }
      if (!sol(x - 1, y)) R(c, px, py, 1, T, '#3a2414');
      if (!sol(x + 1, y)) R(c, px + T - 1, py, 1, T, '#3a2414');
      if ((x * 7 + y) % 5 === 0) R(c, px + 3, py + 6, 1, 1, '#c8a050');
    } else if (ch === 'G') {
      R(c, px, py, T, T, '#262230'); R(c, px + 1, py + 1, T - 2, T - 2, '#3a3646'); R(c, px + 1, py + 1, T - 2, 2, '#4e4a5c');
      line(c, px + 1, py + 3 + (x % 2) * 4, px + 14, py + 12, '#2f8bff', 2); line(c, px + 9, py + 1, px + 4, py + 14, '#1a5abf', 1);
      R(c, px + 6, py + 7, 2, 2, '#9fd0ff'); R(c, px + 2, py + 2, 2, 2, '#5e5a6c'); R(c, px + 12, py + 12, 2, 2, '#5e5a6c');
    } else if (ch === 'B') {
      R(c, px, py, T, T, '#3a3646'); R(c, px + 1, py + 1, T - 2, T - 2, '#4a4656'); R(c, px + 1, py + 1, T - 2, 1, '#5e5a6c');
      line(c, px + 2 + (y % 2) * 3, py + 2, px + 10, py + 13, '#2f8bff'); line(c, px + 12, py + 3, px + 7, py + 8, '#2f8bff');
      R(c, px + 9, py + 10, 1, 1, '#9fd0ff');
    } else if (ch === 'I' || ch === 'K') {
      R(c, px, py, T, T, '#2a8a96'); R(c, px + 1, py + 1, T - 2, T - 2, '#5ad8e0');
      R(c, px + 2, py + 2, 3, T - 5, '#b8fff7'); R(c, px + 9, py + 4, 1, 6, '#e8ffff');
      if (ch === 'K') { R(c, px + 4, py, 1, T, '#9ff0ff'); R(c, px + 11, py + 3, 1, T - 3, '#9ff0ff'); }
    } else if (ch === 'X') {
      R(c, px, py, T, 3, '#4a4a5a');
      for (let i = 1; i < T; i += 4) R(c, px + i, py, 2, T, '#6a6a7a');
    } else if (ch === '-') {
      const w = th.grass ? '#6a4a2e' : th.brick ? '#5a4a3a' : '#6a4a3a';
      R(c, px, py, T, 4, w); R(c, px, py, T, 1, lt(w)); R(c, px, py + 3, T, 1, dk(w));
      if (x % 3 === 0) R(c, px + 2, py + 4, 1, 3, dk(w));
    } else if (ch === '^') {
      if (th.cables) { R(c, px, py + 13, T, 3, '#2a2a30'); line(c, px, py + 12, px + 8, py + 8, '#1a1a20', 2); line(c, px + 8, py + 8, px + 15, py + 13, '#1a1a20', 2); rs.anim.push({ x, y, ch: '^' }); }
      else for (let i = 0; i < 4; i++) { R(c, px + i * 4 + 1, py + 10, 3, 6, '#5a5a6a'); R(c, px + i * 4 + 2, py + 7, 1, 4, '#9a9aaa'); }
    }
  }
  rs.tileCv = cv;
}
// Casillas animadas: fuego, velos, cascadas
function drawAnimTiles(c, rs, t) {
  for (const a of rs.anim) {
    const px = a.x * T, py = a.y * T, ch = rs.grid[a.y][a.x];
    if (ch !== a.ch) continue;
    if (ch === 'F') {
      for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) {
        const v = Math.sin(t * 18 + a.y * 3 + j * 1.7 + i * 2.3 + a.x);
        R(c, px + i * 4, py + j * 4, 4, 4, v > 0.5 ? '#ffd23a' : v > -0.3 ? '#ff8a2a' : '#c03a10');
      }
      if (Math.random() < 0.04) G.parts.push({ x: px + Math.random() * T, y: py, vx: 0, vy: -40, life: 0.5, max: 0.5, col: '#ffd23a', g: -30, s: 1 });
    } else if (ch === 'V') {
      for (let j = 0; j < T; j += 4) for (let i = 0; i < T; i += 4) {
        const on = Math.sin(t * 3 + (py + j) * 0.3 + (px + i) * 0.7) > 0.2;
        R(c, px + i + ((j / 4) % 2) * 2, py + j, 2, 1, on ? '#ffb547' : 'rgba(255,181,71,0.35)');
        R(c, px + i + 1 + ((j / 4) % 2) * 2, py + j + 2, 1, 1, on ? '#ffe0a8' : 'rgba(255,181,71,0.2)');
      }
    } else if (ch === 'c') {
      // Teja suelta: tiembla cuando la pisan
      const cr = rs.crumbles && rs.crumbles.get(a.x + ',' + a.y);
      const j = cr && !cr.gone ? Math.round((Math.random() - 0.5) * 2) : 0;
      R(c, px + j, py, T, 6, '#8a5a50'); R(c, px + j, py, T, 1, '#b07a6a');
      for (let i = 0; i < 4; i++) R(c, px + j + i * 4 + (a.y % 2) * 2, py + 2, 1, 3, '#5a3a38');
      R(c, px + j + 3, py + 6, 10, 3, '#6a4a44'); R(c, px + j + 5, py + 9, 2, 2, '#4a3034');
    } else if (ch === '^') {
      if (Math.random() < 0.15) { R(c, px + 6 + Math.random() * 4, py + 6 + Math.random() * 4, 1, 1, '#ffffff'); R(c, px + 4 + Math.random() * 8, py + 4 + Math.random() * 8, 1, 1, '#9fd0ff'); }
    } else if (ch === 'k') {
      R(c, px + 2, py, 12, T, 'rgba(79,109,255,0.55)');
      for (let i = 0; i < 4; i++) R(c, px + 3 + i * 3, py + ((t * 90 + i * 7 + a.y * 5) % T), 1, 4, '#c8d8ff');
    }
  }
}

// ------------------------------------------------------------------ Fondos
const BG_CACHE = {};
function bgLayers(name) {
  if (BG_CACHE[name]) return BG_CACHE[name];
  const th = THEMES[name];
  const mk = (fn) => { const cv = document.createElement('canvas'); cv.width = 768; cv.height = VIEW_H; fn(cv.getContext('2d')); return cv; };
  const L = {};
  if (th.interior) {
    L.far = mk((c) => {
      R(c, 0, 0, 768, VIEW_H, mix(th.dark, INK, 0.3));
      for (let y = 0; y < VIEW_H; y += 8) for (let x = 0; x < 768; x += 16) R(c, x + ((y / 8) % 2) * 8, y, 15, 7, mix(th.dark, th.body, 0.25 + hash(x, y) * 0.15));
      for (let x = 40; x < 768; x += 96) { R(c, x, 0, 10, VIEW_H, mix(th.dark, INK, 0.45)); R(c, x + 2, 0, 1, VIEW_H, mix(th.dark, th.cap, 0.3)); }
    });
    if (th.glow) L.near = mk((c) => { for (let x = 0; x < 768; x += 128) { c.fillStyle = 'rgba(255,138,42,0.10)'; c.fillRect(x + 30, 60, 60, 156); R(c, x + 50, 120, 20, 96, '#1a0e0a'); R(c, x + 54, 140, 12, 30, '#ff8a2a'); R(c, x + 56, 146, 8, 18, '#ffd23a'); } });
    if (name === 'escarcha') L.near = mk((c) => { for (let x = 0; x < 768; x += 96) { R(c, x + 20, 0, 4, 40 + hash(x, 1) * 40, '#5a8a9a'); R(c, x + 21, 0, 2, 30 + hash(x, 2) * 40, '#b8fff7'); } });
    return (BG_CACHE[name] = L);
  }
  L.far = mk((c) => { skyline(c, 768, 196, th.far, name.length * 7 + 3, 16, 60, 10, 22, th.win ? th.win + '88' : null); if (th.trees) for (let x = 0; x < 768; x += 22) { const h = 70 + hash(x, 3) * 60; R(c, x + 8, VIEW_H - h, 4, h, th.far); R(c, x, VIEW_H - h - 6, 20, 30, th.far); R(c, x + 4, VIEW_H - h - 14, 12, 10, th.far); } });
  L.near = mk((c) => {
    if (th.trees) { for (let x = 0; x < 768; x += 34) { const h = 90 + hash(x, 9) * 70; R(c, x + 12, VIEW_H - h, 6, h, th.near); R(c, x, VIEW_H - h - 10, 30, 40, th.near); R(c, x + 6, VIEW_H - h - 20, 18, 12, th.near); } }
    else skyline(c, 768, 210, th.near, name.length * 13 + 5, 30, 90, 12, 26, th.win || null);
  });
  return (BG_CACHE[name] = L);
}
function themeOf(rs) { return THEMES[rs.themeOverride || rs.def.theme]; }
function drawBackground(c, rs, cam, t) {
  const th = themeOf(rs);
  const L = bgLayers(rs.themeOverride || rs.def.theme);
  if (th.interior) {
    const ox = -Math.floor(cam.x * 0.3) % 768;
    c.drawImage(L.far, ox, 0); c.drawImage(L.far, ox + 768, 0);
    if (L.near) { const nx = -Math.floor(cam.x * 0.6) % 768; c.drawImage(L.near, nx, 0); c.drawImage(L.near, nx + 768, 0); }
    return;
  }
  sky(c, VIEW_W, VIEW_H, th.sky[0], th.sky[1], 8);
  if (th.stars) { const r = rng(3); for (let i = 0; i < 50; i++) R(c, Math.floor(r() * VIEW_W), Math.floor(r() * 90), 1, 1, r() < 0.5 ? '#c9c2e6' : '#7a74a0'); }
  if (th.moon) { R(c, 300, 22, 10, 10, '#f3e7c9'); R(c, 298, 24, 2, 6, '#f3e7c9'); R(c, 304, 24, 2, 2, '#d8cca8'); }
  if (th.sun) { c.fillStyle = 'rgba(255,240,190,0.25)'; c.fillRect(290, 14, 30, 30); R(c, 296, 20, 18, 18, '#fff4d0'); R(c, 294, 24, 22, 10, '#fff4d0'); R(c, 300, 18, 10, 22, '#fff4d0'); }
  if (th.clouds) for (let i = 0; i < 5; i++) { const x = ((i * 97 + t * 4 - cam.x * 0.05) % (VIEW_W + 80)) - 40, y = 18 + (i * 23) % 50; c.fillStyle = 'rgba(255,255,255,0.55)'; c.fillRect(Math.round(x), y, 34, 6); c.fillRect(Math.round(x) + 6, y - 4, 20, 5); }
  if (th.ibaia) drawIbaia(c, t, 1);
  if (th.tower) {
    const tx = 250 - cam.x * 0.04;
    R(c, tx, 20, 6, 120, '#3a3060'); R(c, tx - 3, 40, 12, 100, '#2e2650'); R(c, tx + 2, 16, 2, 4, '#ffb547');
    for (let a = 0; a <= 40; a++) { const ang = Math.PI * a / 40; R(c, tx + 3 + Math.cos(ang) * 70, 140 - Math.sin(ang) * 80, 1, 1, Math.sin(t * 3 + a) > 0 ? '#ffb547' : '#8a5a24'); }
  }
  if (th.veils) { const vx = 60 - (cam.x * 0.1) % 260; for (let k = 0; k < 3; k++) veil(c, Math.round(vx + k * 260), 6, 10, 150, t); }
  const fy = th.ibaia ? 40 : 0;
  const ox = -Math.floor(cam.x * 0.15) % 768, oy = Math.floor(-cam.y * 0.05) + fy;
  c.drawImage(L.far, ox, oy); c.drawImage(L.far, ox + 768, oy);
  if (th.sea) { const sy = 176 - Math.floor(cam.y * 0.05), sc = th.seaCol || ['#141a34', '#3a4a7a']; R(c, 0, sy, VIEW_W, VIEW_H - sy, sc[0]); for (let i = 0; i < 24; i++) R(c, (i * 37 + Math.floor(t * 8)) % VIEW_W, sy + 4 + (i * 7) % 30, 4, 1, sc[1]); }
  const nx = -Math.floor(cam.x * 0.35) % 768, ny = Math.floor(-cam.y * 0.12) + 10 + fy;
  c.drawImage(L.near, nx, ny); c.drawImage(L.near, nx + 768, ny);
}
// Panorama de Ibaia con sus diez velos
function drawIbaia(c, t, k) {
  const base = 150;
  R(c, 0, base, VIEW_W, 60, '#1a2440');
  for (let i = 0; i < 30; i++) R(c, (i * 53) % VIEW_W, base + 6 + (i * 11) % 40, 6, 1, '#3a4a7a');
  const r = rng(77);
  for (let x = 20; x < 370;) { const w = 4 + Math.floor(r() * 8), h = 6 + Math.floor(r() * 26); R(c, x, base - h, w, h, '#2a2448'); if (r() < 0.5) R(c, x + 1, base - h + 2, 1, 1, '#ffd48a'); x += w + 1; }
  // Torre y cúpula
  R(c, 200, 50, 6, 100, '#3a3060'); R(c, 197, 70, 12, 80, '#2e2650'); R(c, 202, 46, 2, 4, '#ffe0a8');
  for (let a = 0; a <= 50; a++) { const ang = Math.PI * a / 50; R(c, 203 + Math.cos(ang) * 46, base - Math.sin(ang) * 56, 1, 1, Math.sin(t * 3 + a) > 0 ? '#ffb547' : '#8a5a24'); }
  // Velos de cada barrio
  for (let i = 0; i < 9; i++) { const x = 30 + i * 38 + (i > 4 ? 12 : 0); if (Math.abs(x - 203) < 40) continue; veil(c, x, 4, base - 70 + (i % 3) * 8, base, t + i); }
}
function drawWeather(c, rs, cam, t) {
  const th = themeOf(rs);
  if (th.rain) {
    c.fillStyle = 'rgba(160,180,230,0.45)';
    const n = Math.round(90 * th.rain);
    for (let i = 0; i < n; i++) {
      const x = (i * 97 + t * 60 - cam.x * 0.2) % (VIEW_W + 40), y = (i * 53 + t * 380) % (VIEW_H + 20);
      c.fillRect(Math.round(((x % (VIEW_W + 40)) + VIEW_W + 40) % (VIEW_W + 40)) - 20, Math.round(y) - 10, 1, 5);
    }
  }
  if (th.embers) for (let i = 0; i < 30; i++) { const x = (i * 61 + Math.sin(t + i) * 10) % VIEW_W, y = VIEW_H - ((i * 37 + t * 30) % VIEW_H); R(c, x, y, 1, 1, i % 3 ? '#ff8a2a' : '#ffd23a'); }
  if (th.snow) for (let i = 0; i < 40; i++) { const x = (i * 47 + Math.sin(t * 0.7 + i) * 12 + VIEW_W) % VIEW_W, y = (i * 29 + t * 18) % VIEW_H; R(c, x, y, 1, 1, '#e8ffff'); }
  if (th.drips) for (let i = 0; i < 14; i++) { const x = (i * 71 + 13) % VIEW_W, y = (t * 120 + i * 41) % VIEW_H; R(c, x, y, 1, 3, 'rgba(160,200,200,0.5)'); }
  if (th.fog) { for (let i = 0; i < 4; i++) { c.fillStyle = 'rgba(160,190,190,0.06)'; c.fillRect(0, 120 + i * 18 + Math.sin(t * 0.5 + i) * 6, VIEW_W, 14); } }
  if (th.lightning && Math.random() < 0.004) { G.whiteFlash = 0.15; Audio2.sfx('thunder'); }
}

// ------------------------------------------------------------------ Viñetas de las cartas
function drawScene(id, c, W, H, t) {
  const jon = (x, y, pose, flip = false, tint) => drawSprite(c, sprite('jon', CH.jon, pose, tint), x, y, flip);
  const ch = (key, x, y, pose, flip = false) => drawSprite(c, sprite('scene-' + key, CH[key], pose), x, y, flip);
  const S = G.save;
  const marks = S.marks.filter((m) => m !== 'destino').map((m) => PLAYER_MARKS[m].color);
  switch (id) {
    case 'destino': case 'energia': case 'temperatura': {
      sky(c, W, H, '#0c0a18', '#1e1830', 5);
      const key = id === 'destino' ? 'destino' : id;
      const col = id === 'destino' ? '#f2c45a' : MARKS[key].color;
      const s = 6, gx = W / 2 - 27, gy = 8;
      c.globalAlpha = 0.25 + Math.sin(t * 3) * 0.1; R(c, gx - 10, gy - 10, 74, 74, col); c.globalAlpha = 1;
      glyph(c, key, gx, gy, s);
      for (let i = 0; i < 12; i++) { const a = t * 0.8 + i * Math.PI / 6; R(c, W / 2 + Math.cos(a) * 44, 35 + Math.sin(a) * 30, 1, 1, MARKS[key].glow); }
      jon(W / 2 - 60, H - 34, { ...IDLE.jon(1), armF: [6, -1], armGlow: MARKS[key].glow, marks });
      break;
    }
    case 'plaza': {
      sky(c, W, H, '#3a1a2a', '#8a4a3a', 5); skyline(c, W, H - 14, '#2a1820', 5, 10, 30, 8, 16, '#ffcf7a');
      R(c, 0, H - 14, W, 14, '#3a2a2a');
      ch('narbaiza', 40, H - 46, { armF: [7, -2], armB: [-3, 5], cape: Math.round(Math.sin(t * 1.3)) });
      ch('martin', 100, H - 44, MOVE.crouch(), true);
      for (let i = 0; i < 10; i++) { const k = (t * 0.8 + i / 10) % 1; R(c, 60 + k * 44, H - 34 - Math.sin(k * Math.PI) * 14, 1, 1, '#d1162b'); }
      jon(140, H - 45, { ...IDLE.jon(t) }, true);
      break;
    }
    case 'callejon': {
      sky(c, W, H, '#0e0c1c', '#2a2440', 5);
      R(c, 0, 0, 40, H, '#241a2a'); R(c, W - 40, 0, 40, H, '#241a2a'); R(c, 0, H - 12, W, 12, '#2e2636');
      R(c, W / 2 - 2, 20, 4, 4, '#ffcf7a'); c.fillStyle = 'rgba(255,207,122,0.1)'; c.fillRect(W / 2 - 30, 24, 60, H - 36);
      jon(W / 2 - 34, H - 43, IDLE.jon(t)); ch('iker', W / 2 + 10, H - 43, IDLE.iker(t), true);
      break;
    }
    case 'pueblo': {
      sky(c, W, H, '#6a9ac8', '#e8d8b8', 5);
      R(c, 0, H - 22, W, 22, '#3a6a9a'); for (let i = 0; i < 12; i++) R(c, (i * 23 + t * 6) % W, H - 18 + (i % 3) * 5, 5, 1, '#a8c8e0');
      for (let i = 0; i < 6; i++) { const x = 6 + i * 30; R(c, x, H - 50, 24, 28, ['#e8e0d0', '#d8c8b0', '#f0e8d8'][i % 3]); R(c, x - 2, H - 54, 28, 5, '#a84a3a'); R(c, x + 6, H - 40, 4, 6, '#3a5a4a'); R(c, x + 15, H - 40, 4, 6, '#3a5a4a'); }
      R(c, 120, H - 26, 20, 4, '#6a3a2a'); R(c, 129, H - 40, 1, 14, '#4a3a2a'); R(c, 130, H - 38, 8, 8, '#e8e0d0');
      jon(60, H - 53, MOVE.run(Math.floor(t * 10) % 6));
      break;
    }
    case 'tormenta': {
      sky(c, W, H, '#0a0a18', '#2a2a44', 5);
      R(c, 30, H - 40, 50, 30, '#34303e'); line(c, 30, H - 40, 55, H - 60, '#4a3a3a', 2); line(c, 55, H - 60, 80, H - 44, '#4a3a3a', 2);
      R(c, 0, H - 12, W, 12, '#201c28');
      if (Math.sin(t * 2.3) > 0.8) { c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(0, 0, W, H); line(c, 140, 0, 130, 30, '#ffffff', 2); line(c, 130, 30, 145, H - 12, '#ffffff', 2); }
      for (let i = 0; i < 50; i++) R(c, (i * 37) % W, (i * 23 + t * 200) % H, 1, 4, 'rgba(160,180,230,0.5)');
      jon(100, H - 43, MOVE.crouch());
      break;
    }
    case 'carro': {
      sky(c, W, H, '#1a1838', '#4a3050', 5); R(c, 0, H - 12, W, 12, '#2e2636');
      const x = (t * 20) % (W + 80) - 60;
      R(c, x, H - 32, 44, 18, '#2a2420'); for (let i = 0; i < 6; i++) R(c, x + 4 + i * 6, H - 29, 2, 12, '#1a1622');
      R(c, x + 6, H - 14, 6, 6, '#1a1622'); R(c, x + 32, H - 14, 6, 6, '#1a1622');
      drawSprite(c, sprite('scene-pdc', PDC.paladin, MOVE.run(Math.floor(t * 8) % 6)), x + 46, H - 43);
      break;
    }
    case 'bosque': {
      sky(c, W, H, '#101a24', '#2a3a40', 5);
      for (let i = 0; i < 8; i++) { R(c, i * 26 + 4, 0, 6, H, '#18262a'); R(c, i * 26, 10, 16, 20, '#14201e'); }
      R(c, 0, H - 12, W, 12, '#2e2a22'); R(c, 0, H - 12, W, 2, '#4a6a30');
      R(c, 120, H - 26, 34, 14, '#2a2420'); for (let i = 0; i < 4; i++) R(c, 124 + i * 7, H - 24, 2, 10, '#1a1622');
      for (let i = 0; i < 3; i++) { c.fillStyle = 'rgba(160,190,190,0.08)'; c.fillRect(0, 30 + i * 14 + Math.sin(t + i) * 4, W, 10); }
      jon(60, H - 43, Math.floor(t) % 4 < 2 ? MOVE.roll() : MOVE.crouch());
      break;
    }
    case 'ibaia': { sky(c, W, H, '#1a1838', '#c86a48', 6); c.save(); c.translate(-(VIEW_W - W) / 2, -(VIEW_H - H) / 2 - 30); drawIbaia(c, t, 1); c.restore(); break; }
    case 'pagina': {
      R(c, 0, 0, W, H, '#1a1420');
      R(c, W / 2 - 30, 6, 60, H - 12, '#e8dcc0'); R(c, W / 2 + 22, 6, 8, 8, '#b8a888');
      for (let i = 0; i < 8; i++) R(c, W / 2 - 24, 14 + i * 7, i % 3 === 2 ? 26 : 44, 1, '#6a5a4a');
      glyph(c, 'destino', W / 2 - 4, H - 24, 1);
      break;
    }
    case 'final': {
      sky(c, W, H, '#1a1020', '#5a3a20', 6);
      for (let a = 0; a <= 40; a++) { const ang = Math.PI * a / 40; R(c, W / 2 + Math.cos(ang) * 60, H - 10 - Math.sin(ang) * 60, 1, 1, Math.sin(t * 3 + a) > 0 ? '#ffb547' : '#8a5a24'); }
      R(c, W / 2 - 3, H - 70, 6, 60, '#3a3060'); R(c, W / 2 - 1, H - 74, 2, 4, '#ffe0a8');
      for (let i = 0; i < 30; i++) { const k = (t * 0.3 + i / 30) % 1; R(c, 20 + (i * 37) % (W - 40), 10 + k * (H - 20), 2, 1, `rgba(255,181,71,${1 - k})`); }
      R(c, 0, H - 10, W, 10, '#2e2636');
      jon(30, H - 41, IDLE.jon(t));
      break;
    }
  }
}

// ------------------------------------------------------------------ HUD (en píxeles del juego)
const HEART = ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...'];
function drawHeart(c, x, y, full) {
  HEART.forEach((r, j) => [...r].forEach((ch, i) => { if (ch === '#') R(c, x + i, y + j, 1, 1, full ? (j < 2 && i < 3 ? '#ff8a8a' : '#d1162b') : '#3a2a3a'); }));
}
function drawHUD(c) {
  const S = G.save;
  // Chispas recogidas, arriba a la derecha
  if (S.chispas) {
    const n = String(S.chispas), x = VIEW_W - 10 - n.length * 4;
    R(c, x - 12, 4, n.length * 4 + 16, 9, 'rgba(11,10,23,0.55)');
    R(c, x - 9, 5, 3, 7, '#f2c45a'); R(c, x - 10, 7, 5, 3, '#f2c45a'); R(c, x - 8, 8, 1, 1, '#fff1b8');
    digits(c, n, x, 6, '#ffe7a3');
  }
  // Barra de racha bajo los corazones
  const pl = G.player;
  if (pl.racha >= 2) {
    const w = Math.min(60, pl.racha * 4);
    R(c, 4, 14, 62, 2, 'rgba(11,10,23,0.55)'); R(c, 5, 14, Math.round(w * Math.min(1, pl.rachaT / 2.4)), 2, pl.racha >= 10 ? '#ffe7a3' : '#f2c45a');
  }
  R(c, 4, 4, S.maxHp * 9 + 2, 9, 'rgba(11,10,23,0.55)');
  for (let i = 0; i < S.maxHp; i++) drawHeart(c, 6 + i * 9, 5, i < S.hp);
  let y = 16;
  if (S.marks.includes('destino')) {
    R(c, 4, y, 13, 13, 'rgba(11,10,23,0.55)');
    c.drawImage(glyphCanvas('destino'), 6, y + 2);
  }
  let x = 20;
  for (const m of S.marks) {
    if (m === 'destino') continue;
    const info = PLAYER_MARKS[m], active = S.active === m;
    const flash = G.barFlash[m] > 0 && Math.floor(G.t * 20) % 2;
    R(c, x, y, 58, 13, active ? 'rgba(242,196,90,0.35)' : 'rgba(11,10,23,0.55)');
    if (active) { R(c, x, y, 58, 1, '#f2c45a'); R(c, x, y + 12, 58, 1, '#f2c45a'); }
    c.drawImage(glyphCanvas(m), x + 2, y + 2);
    R(c, x + 13, y + 4, 42, 5, '#0b0a17');
    const v = S.bars[m] / 100;
    R(c, x + 14, y + 5, Math.round(40 * v), 3, flash ? '#ff4a3a' : info.color);
    if (m === 'temperatura') R(c, x + 14, y + 5, Math.round(40 * v / 2), 1, info.color2);
    R(c, x + 14, y + 5, Math.round(40 * v), 1, info.glow);
    x += 62;
  }
  if (G.room.alarm) {
    const on = Math.floor(G.t * 4) % 2;
    R(c, VIEW_W - 34, 4, 30, 9, on ? '#a01a14' : '#5a0e0a');
    R(c, VIEW_W - 30, 6, 1, 4, '#ffffff'); R(c, VIEW_W - 30, 11, 1, 1, '#ffffff'); R(c, VIEW_W - 27, 6, 1, 4, '#ffffff'); R(c, VIEW_W - 27, 11, 1, 1, '#ffffff');
    R(c, VIEW_W - 24, 7, 18, 3, on ? '#ff8a8a' : '#a01a14');
  }
  if (G.copyProgress > 0) {
    const p = G.player, bx = Math.round(p.cx - G.cam.x) - 20, by = Math.round(p.y - G.cam.y) - 14;
    R(c, bx - 1, by - 1, 42, 6, '#0b0a17'); R(c, bx, by, Math.round(40 * Math.min(1, G.copyProgress)), 4, '#f2c45a');
    c.drawImage(glyphCanvas('destino'), bx - 12, by - 3); c.drawImage(glyphCanvas(G.copyMark), bx + 43, by - 3);
  }
}
