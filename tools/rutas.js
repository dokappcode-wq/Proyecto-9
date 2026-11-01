// Validador de rutas: busca cómo atravesar una sala usando la física real de Jon.
// Desde cada punto donde se puede estar de pie prueba «macros» (andar, saltar con
// distintas duraciones, carrerilla, salto de pared, cornisas, dash, deslizarse...)
// y explora con Dijkstra por fotogramas. Informa si la salida es alcanzable, el
// tiempo mínimo, qué movimientos exige el camino y qué coleccionables se alcanzan.
// Se ejecuta dentro de la página (ver tools/validar.js).
'use strict';
window.RUTAS = (() => {
  const DT = 1 / 60, MAXF = 170;
  const KEYS = ['left', 'right', 'up', 'down', 'jump', 'shoot', 'power', 'dash', 'use', 'swap', 'pause', 'confirm', 'map'];
  const DYN = ['Zip', 'Movil', 'Barra', 'Rebote', 'Teja'];
  const PICK = ['Pagina', 'Lauburu', 'Chispa'];

  function setKeys(k, prev) {
    for (const a of KEYS) { const now = !!k[a], was = !!prev[a]; Input.down[a] = now; Input.pressed[a] = now && !was; Input.released[a] = !now && was; }
  }
  function snap(p) { const s = {}; for (const key of Object.keys(p)) s[key] = p[key]; s.trail = []; s.zip = p.zip ? { ...p.zip } : null; s.safe = { ...p.safe }; return s; }
  function restore(p, s) { for (const key of Object.keys(s)) p[key] = s[key]; p.trail = []; p.zip = s.zip ? { ...s.zip } : null; p.safe = { ...s.safe }; }
  function snapEnts(ents) { return ents.map((e) => (e.snapState ? e.snapState() : null)); }
  function restoreEnts(ents, st) { ents.forEach((e, i) => { if (st[i] && e.restoreState) e.restoreState(st[i]); }); }

  // ---------------------------------------------------------------- Macros
  function policies(hasDash) {
    const L = [];
    for (const d of [-1, 1]) {
      const D = d > 0 ? 'right' : 'left';
      const n0 = L.length;
      const tag = () => { for (let i = n0; i < L.length; i++) L[i].d = d; };
      for (const n of [8, 16, 30]) L.push({ name: 'andar', walkEnd: n, f: (f) => (f < n ? { [D]: true } : {}) });
      for (const H of [4, 10, 18]) {
        L.push({ name: 'salto', f: (f) => ({ [D]: true, jump: f < H }) });
        L.push({ name: 'salto', f: (f) => ({ [D]: f >= 12, jump: f < H }) });
      }
      // Mantener el salto mucho rato: rebotar alto en toldos y ramas
      L.push({ name: 'rebote', f: (f) => ({ jump: true, [D]: f >= 30 }) });
      L.push({ name: 'rebote', f: (f) => ({ jump: true, [D]: f < 10 || f >= 40 }) });
      for (const R of [8, 16, 30, 50]) L.push({ name: 'carrerilla', f: (f) => ({ [D]: true, jump: f >= R && f < R + 18 }) });
      // Zigzag entre dos paredes
      L.push({
        name: 'pared', init: () => ({ cur: d, last: -99, hold: 18 }),
        f: (f, p, m) => {
          if (p.wallDir === m.cur && !p.onGround && p.vy > -130 && f - m.last > 6) { m.cur = -m.cur; m.last = f; m.hold = 14; }
          const k = { [m.cur > 0 ? 'right' : 'left']: true };
          if (m.hold > 0 && f - m.last > 0) { k.jump = true; m.hold--; }
          if (f === 0) k.jump = true;
          return k;
        },
      });
      // Pegado a una pared: subir con salto de pared hacia fuera y volver
      L.push({ name: 'deslizar', f: (f) => ({ [D]: true, down: f >= 6 && f < 40 }) });
      L.push({ name: 'gatear', walkEnd: 30, f: (f) => (f < 30 ? { [D]: true, down: true } : { down: true }) });
      if (hasDash) {
        L.push({ name: 'dash', init: () => ({ done: false }), f: (f, p, m) => { const k = { [D]: true, jump: f < 18 }; if (!m.done && f > 4 && p.vy > -40) { k.dash = true; m.done = true; } return k; } });
        L.push({ name: 'dash', init: () => ({ done: false }), f: (f, p, m) => { const k = { [D]: true, jump: f >= 16 && f < 34 }; if (!m.done && f > 22 && p.vy > -40) { k.dash = true; m.done = true; } return k; } });
        L.push({ name: 'dash', init: () => ({ done: false }), f: (f, p, m) => { const k = { [D]: true, jump: f < 18 }; if (!m.done && f > 10) { k.dash = true; m.done = true; } return k; } });
      }
      tag();
    }
    for (const q of L) if (q.d == null) q.d = q.dirOf;
    L.push({ name: 'arriba', f: (f) => ({ jump: f < 18 }) });
    for (const n of [20, 45, 90]) L.push({ name: 'esperar', walkEnd: n, f: () => ({}) });
    L.push({ name: 'bajar', f: (f) => ({ down: f < 3, jump: f >= 1 && f < 3 }) });
    return L;
  }

  // ---------------------------------------------------------------- Simulación
  function run(p, pol, goal, dyn, picks, got) {
    const ev = { frames: 0, grab: 0, wall: 0, vault: 0, slide: 0, roll: 0, zip: 0, dash: 0, hurt: 0, bounce: 0, swing: 0 };
    let prev = {}, air = false, gf = 0, fail = false;
    p.respawnSafe = () => { fail = true; };
    const m = pol.init ? pol.init() : {};
    for (let f = 0; f < MAXF; f++) {
      let k = pol.f(f, p, m) || {};
      if (p.state === 'hang') k = { up: true };
      // En una barra: empujar hacia el lado del macro y soltarse cuando el vaivén va hacia allí
      if (p.state === 'swing') {
        m.sw = (m.sw || 0) + 1;
        const dd = pol.d || p.face;
        k = { [dd > 0 ? 'right' : 'left']: true };
        if (m.sw > 16 && Math.sign(p.swW) === dd && Math.abs(p.swW) > 3 && !prev.jump) k.jump = true;
      }
      setKeys(k, prev); prev = k;
      const st0 = p.state, vt0 = p.vaultT, wt0 = p.wallT, vy0 = p.vy;
      G.save.hp = 99; p.inv = 0; G.interactTarget = null; G.cine = false;
      for (const e of dyn) e.update(DT);
      p.update(DT);
      G.platforms = G.platforms.filter((q) => q.keep || (!q.frozen && (q.life -= DT) > 0));
      G.parts.length = 0; G.projs.length = 0; G.texts.length = 0;
      ev.frames++;
      if (fail) return null;
      if (G.save.hp < 99) ev.hurt++;
      if (p.state === 'hang' && st0 !== 'hang') ev.grab++;
      if (p.state === 'zip' && st0 !== 'zip') ev.zip++;
      if (p.state === 'dash' && st0 !== 'dash') ev.dash++;
      if (p.state === 'slide' && st0 !== 'slide') ev.slide++;
      if (p.state === 'roll' && st0 !== 'roll') ev.roll++;
      if (p.state === 'swing' && st0 !== 'swing') ev.swing++;
      if (p.vaultT > 0.2 && !(vt0 > 0)) ev.vault++;
      if (p.wallT > 0.12 && !(wt0 > 0)) ev.wall++;
      if (p.bounced) { ev.bounce++; p.bounced = false; }
      for (const e of picks) if (!got.has(e) && overlap(p, e)) got.add(e);
      if (goal(p)) { ev.goal = true; return ev; }
      if (p.y > G.room.H * T + 40) return null;
      if (!p.onGround || p.state === 'hang' || p.state === 'zip' || p.state === 'swing') air = true;
      if (p.onGround && (p.state === 'normal' || p.state === 'crouch')) {
        gf++;
        if ((air && gf >= 2) || (!air && pol.walkEnd && f >= pol.walkEnd)) return ev;
      } else gf = 0;
      if (!air && !pol.walkEnd && f > 40 && p.onGround) return ev;
    }
    return p.onGround && p.state !== 'swing' ? ev : null;
  }

  // ---------------------------------------------------------------- Búsqueda
  // opts: { room, start:{x,y} (casilla, y = fila de los pies), goal: 'right'|'left'|'top'|'bottom'|{x,y,w,h}, marks:[] }
  function validate(opts) {
    const t0 = performance.now();
    const S = G.save;
    S.marks = opts.marks || ['destino']; S.active = S.marks.includes('energia') ? 'energia' : null;
    S.bars = { energia: 100, temperatura: 100 };
    G.roomStates = {}; G.timers = []; G.race = null; G.queue = []; G.dlg = null; G.cine = false; G.cutscene = false;
    const r = ROOMS[opts.room];
    const sp = opts.start || spawnPoint(r);
    const p = G.player;
    p.ghost = false; p.state = 'normal'; p.setH(26); p.vx = 0; p.vy = 0; p.charge = 0;
    G.loadRoom(opts.room, sp.x * T + 3, (sp.y + 1) * T - 26);
    // Lo que las marcas de Jon pueden abrir, se da por abierto
    const g = G.room.grid, M = S.marks;
    for (const row of g) for (let i = 0; i < row.length; i++) {
      if (M.includes('energia') && (row[i] === 'B' || row[i] === 'G')) row[i] = '.';
      if (M.includes('temperatura')) { if (row[i] === 'I' || row[i] === 'F') row[i] = '.'; if (row[i] === 'K') row[i] = 'k'; }
    }
    G.tileChanged();
    G.ents = G.room.ents = G.ents.filter((e) => DYN.includes(e.constructor.name) || PICK.includes(e.constructor.name));
    const dyn = G.ents.filter((e) => DYN.includes(e.constructor.name));
    const picks = G.ents.filter((e) => PICK.includes(e.constructor.name));
    const got = new Set();
    const W = r.W * T, H = r.H * T;
    const gl = opts.goal || 'right';
    const goal = typeof gl === 'object' ? (q) => q.cx >= gl.x * T && q.cx < (gl.x + gl.w) * T && q.cy >= gl.y * T && q.cy < (gl.y + gl.h) * T
      : gl === 'right' ? (q) => q.cx >= W - 1 : gl === 'left' ? (q) => q.cx < 1 : gl === 'top' ? (q) => q.cy < 1 : (q) => q.cy >= H - 1;
    // Asentar al jugador
    for (let i = 0; i < 20; i++) { setKeys({}, {}); p.update(DT); }
    p.vx = 0;
    const pols = policies(S.marks.includes('energia'));
    // La clave incluye la fase de las plataformas móviles: esperar a que vuelvan es otro estado
    const movers = dyn.filter((e) => e.snapState);
    const key = (q) => Math.floor(q.cx / 8) + ',' + Math.round(q.feet / 8) + (q.state === 'crouch' ? 'c' : '') + '|' + movers.map((e) => (near(e, q) ? Math.round(e.k * 6) + (e.dir > 0 ? '+' : '-') : '·')).join('');
    // Solo cuenta la fase de los móviles cuyo recorrido queda cerca: así no se multiplican los estados
    function near(e, q) {
      const x0 = Math.min(e.ax ?? e.x, e.bx ?? e.x) - 96, x1 = Math.max(e.ax ?? e.x, e.bx ?? e.x) + (e.w || 16) + 96;
      const y0 = Math.min(e.ay ?? e.y, e.by ?? e.y) - 112, y1 = Math.max(e.ay ?? e.y, e.by ?? e.y) + 80;
      return q.cx > x0 && q.cx < x1 && q.feet > y0 && q.feet < y1;
    }
    const start = { s: snap(p), e: snapEnts(dyn), t: 0, prev: null, how: null, ev: null };
    const best = new Map([[key(p), start]]);
    const open = [start];
    let found = null, expanded = 0;
    while (open.length) {
      open.sort((a, b) => a.t - b.t);
      const node = open.shift();
      if (node.done) continue;
      node.done = true; expanded++;
      if (expanded > (opts.maxNodes || 3000)) break;
      for (const pol of pols) {
        restore(p, node.s); restoreEnts(dyn, node.e);
        p.vx = 0; p.runT = 0; p.jumpBuf = 0; p.dashCan = true;
        S.bars.energia = 100; S.bars.temperatura = 100; // cada intento con la barra llena (hay fuentes cerca)
        const ev = run(p, pol, goal, dyn, picks, got);
        if (!ev) continue;
        const t = node.t + ev.frames;
        if (ev.goal) { if (!found || t < found.t) found = { t, prev: node, how: pol.name, ev }; continue; }
        const k = key(p);
        const old = best.get(k);
        if (old && old.t <= t) continue;
        if (old) old.done = true;
        const nn = { s: snap(p), e: snapEnts(dyn), t, prev: node, how: pol.name, ev };
        best.set(k, nn); open.push(nn);
      }
      // Con la ruta hallada, se sigue explorando (hasta el límite) solo si faltan coleccionables
      if (found && (got.size === picks.length || opts.fast) && open.every((n) => n.done || n.t >= found.t)) break;
    }
    // Camino y movimientos
    const moves = { grab: 0, wall: 0, vault: 0, slide: 0, roll: 0, zip: 0, dash: 0, hurt: 0, bounce: 0, swing: 0 };
    const steps = [];
    for (let n = found; n && n.how; n = n.prev) { steps.unshift(n.how); for (const k in moves) moves[k] += n.ev[k] || 0; }
    return {
      room: opts.room, ok: !!found, seconds: found ? +(found.t / 60).toFixed(1) : null, nodes: best.size, expanded,
      moves, steps: steps.length, picks: picks.length, reachedPicks: got.size,
      missing: picks.filter((e) => !got.has(e)).map((e) => e.constructor.name + '@' + Math.floor(e.cx / T) + ',' + Math.floor(e.cy / T)),
      ms: Math.round(performance.now() - t0),
    };
  }
  return { validate };
})();
