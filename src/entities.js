// Entidades: Jon, la PDC, los Acólitos, fuentes de absorción, Anclas y el resto.
'use strict';
const T = TILE;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const sign = (v) => (v > 0 ? 1 : v < 0 ? -1 : 0);
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

// ------------------------------------------------------------------ Mundo de casillas
function tileAt(tx, ty) {
  const r = G.room;
  if (tx >= 0 && tx < r.W && ty >= 0 && ty < r.H) return r.grid[ty][tx];
  return r.edge(tx, ty);
}
const solidAt = (tx, ty) => SOLID.has(tileAt(tx, ty));
function solidPx(x, y) { return solidAt(Math.floor(x / T), Math.floor(y / T)); }
function rectSolid(x, y, w, h) {
  const x0 = Math.floor(x / T), x1 = Math.floor((x + w - 0.01) / T), y0 = Math.floor(y / T), y1 = Math.floor((y + h - 0.01) / T);
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (solidAt(tx, ty)) return true;
  return false;
}
function rectHas(x, y, w, h, ch) {
  const x0 = Math.floor(x / T), x1 = Math.floor((x + w - 0.01) / T), y0 = Math.floor(y / T), y1 = Math.floor((y + h - 0.01) / T);
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (tileAt(tx, ty) === ch) return true;
  return false;
}
// Línea de visión: pasos de 4 px contra casillas sólidas
function los(x0, y0, x1, y1) {
  const d = Math.hypot(x1 - x0, y1 - y0), n = Math.ceil(d / 4);
  for (let i = 1; i < n; i++) if (solidPx(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n)) return false;
  return true;
}
// Mover un cuerpo con colisiones; devuelve qué ha tocado
function moveBody(b, dt, opts = {}) {
  const res = { ground: false, ceil: false, wall: 0 };
  let dx = b.vx * dt, dy = b.vy * dt;
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 5));
  dx /= steps; dy /= steps;
  for (let s = 0; s < steps; s++) {
    if (dx) {
      b.x += dx;
      if (rectSolid(b.x, b.y, b.w, b.h)) {
        if (dx > 0) b.x = Math.floor((b.x + b.w) / T) * T - b.w - 0.001;
        else b.x = (Math.floor(b.x / T) + 1) * T + 0.001;
        res.wall = sign(dx);
        b.vx = 0; dx = 0;
      }
    }
    if (dy) {
      const prevBottom = b.y + b.h;
      b.y += dy;
      if (dy > 0) {
        const bottom = b.y + b.h;
        const ty = Math.floor((bottom - 0.01) / T);
        const x0 = Math.floor(b.x / T), x1 = Math.floor((b.x + b.w - 0.01) / T);
        let hit = false;
        for (let tx = x0; tx <= x1 && !hit; tx++) {
          const ch = tileAt(tx, ty);
          if (SOLID.has(ch)) hit = true;
          else if (ch === '-' && !opts.drop && prevBottom <= ty * T + 0.5) hit = true;
        }
        let top = ty * T;
        if (!hit && !opts.drop) for (const p of G.platforms) {
          if (b.x + b.w > p.x && b.x < p.x + p.w && prevBottom <= p.y + 0.5 && bottom >= p.y) { hit = true; top = p.y; break; }
        }
        if (hit) { b.y = top - b.h; b.vy = 0; dy = 0; res.ground = true; }
      } else if (rectSolid(b.x, b.y, b.w, b.h)) {
        b.y = (Math.floor(b.y / T) + 1) * T + 0.001;
        b.vy = 0; dy = 0; res.ceil = true;
      }
    }
  }
  return res;
}
function groundBelow(b) {
  const y = b.y + b.h + 1;
  const ty = Math.floor(y / T);
  for (let tx = Math.floor(b.x / T); tx <= Math.floor((b.x + b.w - 0.01) / T); tx++) {
    const ch = tileAt(tx, ty);
    if (SOLID.has(ch) || (ch === '-' && Math.abs(b.y + b.h - ty * T) < 1)) return true;
  }
  for (const p of G.platforms) if (b.x + b.w > p.x && b.x < p.x + p.w && Math.abs(b.y + b.h - p.y) < 1) return true;
  return false;
}

// ------------------------------------------------------------------ Partículas
function burst(x, y, n, cols, speed = 60, life = 0.5, grav = 0, size = 1) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, v = speed * (0.3 + Math.random() * 0.7);
    G.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: life * (0.5 + Math.random() * 0.5), max: life, col: cols[i % cols.length], g: grav, s: size });
  }
}
function floatText(x, y, text, col = '#ffffff') { G.texts.push({ x, y, text, col, life: 1.2 }); }

// ------------------------------------------------------------------ Jon
const PH = {
  run: 128, sprint: 176, crawl: 52, accel: 1500, decel: 1700, air: 950,
  grav: 1150, fall: 430, jump: 358, cut: 0.5, coyote: 0.1, buffer: 0.12,
  wallSlide: 72, wallJumpX: 200, wallJumpY: 340, dash: 480, dashT: 0.15,
  fallHurt: 6 * T + 4,
};
class Player {
  constructor(x, y) {
    this.x = x; this.y = y; this.w = 10; this.h = 26; this.vx = 0; this.vy = 0;
    this.face = 1; this.state = 'normal'; this.st = 0;
    this.onGround = false; this.coyote = 0; this.jumpBuf = 0; this.cutDone = false;
    this.airMinY = y; this.dashCan = true; this.runT = 0; this.wallT = 0; this.wallDir = 0;
    this.inv = 0; this.hurtT = 0; this.landT = 0; this.vaultT = 0; this.rollQ = 0; this.noGrab = 0;
    this.charge = 0; this.castT = 0; this.castCol = null; this.lock = 0;
    this.using = null; this.copyT = 0; this.safe = { x, y }; this.t = 0; this.trail = [];
    this.platUsed = false;
    this.racha = 0; this.rachaT = 0; this.takeoffX = null; this.swingCool = 0;
  }
  get cx() { return this.x + this.w / 2; }
  // Racha de impulso: cada movimiento de parkour sin pararse suma; cada 5, una recompensa
  combo(name) {
    if (G.cine || this.ghost) return;
    this.racha++; this.rachaT = 2.4;
    G.comboPop = { name, n: this.racha, t: 1 };
    const S = G.save;
    S.stats = S.stats || { racha: 0 };
    if (this.racha > S.stats.racha) S.stats.racha = this.racha;
    if (this.racha >= 5 && this.racha % 5 === 0) {
      if (S.hp < S.maxHp) { S.hp++; floatText(this.cx, this.y - 6, '+1 vida', '#ff8a8a'); }
      else for (const m of S.marks) if (S.bars[m] != null) S.bars[m] = Math.min(100, S.bars[m] + 25);
      Audio2.sfx('racha'); burst(this.cx, this.cy, 12, ['#f2c45a', '#ffe7a3'], 60, 0.5);
    }
  }
  get cy() { return this.y + this.h / 2; }
  get feet() { return this.y + this.h; }
  setH(h) { this.y += this.h - h; this.h = h; }
  canStand() { return !rectSolid(this.x, this.feet - 26, this.w, 26); }
  has(m) { return G.save.marks.includes(m); }
  bar(m) { return G.save.bars[m] || 0; }
  spend(m, n) {
    if (!this.has(m) || this.bar(m) < n) { if (this.has(m)) G.flashBar(m); return false; }
    G.save.bars[m] -= n; return true;
  }
  hurt(d, fromX) {
    if (this.inv > 0 || G.cine) return;
    G.save.hp -= d;
    this.inv = 1.1; this.hurtT = 0.25;
    this.endRacha();
    this.vx = sign(this.cx - (fromX ?? this.cx - this.face)) * 150 || -this.face * 150;
    this.vy = -180;
    if (this.state !== 'normal') { this.state = 'normal'; this.setH(26); }
    Audio2.sfx('hurt'); G.shake(4);
    burst(this.cx, this.cy, 10, ['#ff5a6a', '#ffffff'], 80);
    if (G.save.hp <= 0) G.die();
  }
  endRacha() {
    if (this.racha >= 3) G.toast(`Racha ×${this.racha}`, 2);
    this.racha = 0; this.rachaT = 0;
  }
  update(dt) {
    const I = G.cine || this.lock > 0 ? { down: {}, pressed: {}, released: {} } : Input;
    const D = I.down, P = I.pressed;
    this.t += dt;
    if (this.swingCool > 0) this.swingCool -= dt;
    // La racha se apaga despacio en movimiento y deprisa si te paras
    if (this.rachaT > 0) {
      const still = this.onGround && Math.abs(this.vx) < 30 && (this.state === 'normal' || this.state === 'crouch');
      this.rachaT -= dt * (still ? 3 : 1);
      if (this.rachaT <= 0) this.endRacha();
    }
    for (const k of ['coyote', 'jumpBuf', 'inv', 'hurtT', 'landT', 'vaultT', 'rollQ', 'noGrab', 'castT', 'lock', 'wallT']) if (this[k] > 0) this[k] -= dt;
    const dir = (D.right ? 1 : 0) - (D.left ? 1 : 0);
    if (P.jump) this.jumpBuf = PH.buffer;
    if (P.down) this.rollQ = 0.22;

    switch (this.state) {
      case 'hang': return this.updHang(dt, dir, D, P);
      case 'climb': return this.updClimb(dt);
      case 'zip': return this.updZip(dt, P);
      case 'swing': return this.updSwing(dt, dir, D, P);
    }

    // Horizontal
    const crouching = this.state === 'crouch';
    if (this.state === 'dash') {
      this.st -= dt;
      this.vy = 0;
      if (Math.random() < 0.9) this.trail.push({ x: this.x, y: this.y, face: this.face, life: 0.2 });
      if (this.st <= 0) { this.state = 'normal'; this.vx = this.face * PH.sprint; }
    } else if (this.state === 'slide' || this.state === 'roll') {
      this.st -= dt;
      this.vx -= sign(this.vx) * (this.state === 'slide' ? 120 : 200) * dt;
      if (this.state === 'slide' && Math.random() < 0.5) G.parts.push({ x: this.cx - this.face * 4, y: this.feet - 1, vx: -this.face * 30, vy: -20, life: 0.3, max: 0.3, col: '#8a7a8a', g: 200, s: 1 });
      if (this.st <= 0) {
        if (this.canStand()) { this.state = 'normal'; this.setH(26); }
        else { this.state = 'crouch'; this.setH(14); }
      }
    } else if (this.state === 'plunge') {
      this.vx = 0; this.vy = 460;
    } else {
      let max = this.runT > 0.7 ? PH.sprint * (1 + Math.min(0.12, this.racha * 0.012)) : PH.run;
      if (crouching) max = PH.crawl;
      const target = dir * max;
      const acc = this.onGround ? (dir && sign(dir) === sign(this.vx) || !this.vx ? PH.accel : PH.decel) : PH.air;
      if (this.wallT <= 0) {
        if (Math.abs(target - this.vx) <= acc * dt) this.vx = target;
        else this.vx += sign(target - this.vx) * acc * dt;
      }
      if (dir && this.wallT <= 0 && this.castT <= 0.05) this.face = dir;
      if (this.onGround && dir && Math.abs(this.vx) > 100) this.runT += dt; else if (this.onGround || !dir) this.runT = 0;
    }

    // Agacharse, deslizarse
    if (this.onGround && this.state === 'normal' && D.down) {
      if (Math.abs(this.vx) > 100) { this.state = 'slide'; this.st = 0.5; this.setH(13); this.vx = sign(this.vx) * Math.max(Math.abs(this.vx), 170); Audio2.sfx('slide'); this.combo('Deslizar'); }
      else if (!P.jump) { this.state = 'crouch'; this.setH(14); }
    } else if (this.state === 'crouch' && (!D.down || !this.onGround) && this.canStand()) { this.state = 'normal'; this.setH(26); }

    // Saltos
    const touchL = rectSolid(this.x - 2, this.y + 4, 2, this.h - 8), touchR = rectSolid(this.x + this.w, this.y + 4, 2, this.h - 8);
    this.wallDir = touchR ? 1 : touchL ? -1 : 0;
    if (this.jumpBuf > 0 && this.state !== 'plunge' && this.state !== 'dash') {
      if ((this.onGround || this.coyote > 0) && (this.state !== 'crouch' || this.canStand())) {
        // Cruzar plataformas hacia abajo
        if (D.down && this.onGround && this.onPlatform()) { this.dropT = 0.2; this.jumpBuf = 0; }
        else {
          if (this.state === 'slide' || this.state === 'crouch' || this.state === 'roll') { this.state = 'normal'; this.setH(26); }
          this.vy = -PH.jump; this.onGround = false; this.coyote = 0; this.jumpBuf = 0; this.cutDone = false;
          Audio2.sfx('jump');
        }
      } else if (!this.onGround && this.wallDir) {
        this.vx = -this.wallDir * PH.wallJumpX; this.vy = -PH.wallJumpY; this.face = -this.wallDir;
        this.wallT = 0.14; this.jumpBuf = 0; this.cutDone = false; this.dashCan = true; this.platUsed = false;
        this.combo('Pared');
        burst(this.cx + this.wallDir * 6, this.cy, 5, ['#d8d0e0'], 40);
        Audio2.sfx('walljump');
      }
    }
    if (I.released.jump && this.vy < -120 && !this.cutDone) { this.vy *= PH.cut; this.cutDone = true; }

    // Gravedad y pared
    if (this.state !== 'dash') {
      this.vy = Math.min(this.vy + PH.grav * dt, this.state === 'plunge' ? 460 : PH.fall);
      this.wallSliding = !this.onGround && this.wallDir && dir === this.wallDir && this.vy > 0;
      if (this.wallSliding) {
        this.vy = Math.min(this.vy, PH.wallSlide); this.airMinY = this.y; this.dashCan = true;
        if (Math.random() < 0.3) G.parts.push({ x: this.cx + this.wallDir * 6, y: this.y + 4, vx: 0, vy: -10, life: 0.25, max: 0.25, col: '#a89aa8', g: 0, s: 1 });
      }
    }

    // Movimiento
    const wasGround = this.onGround;
    const fallSpeed = this.vy;
    const res = moveBody(this, dt, { drop: this.dropT > 0 });
    if (this.dropT > 0) this.dropT -= dt;
    this.onGround = res.ground || (this.vy >= 0 && groundBelow(this));
    if (this.onGround) {
      this.coyote = PH.coyote; this.dashCan = true; this.platUsed = false;
      if (!wasGround) {
        this.land(fallSpeed);
        if (this.takeoffX != null && Math.abs(this.cx - this.takeoffX) > 6.5 * T) this.combo('Salto largo');
      }
      this.takeoffX = null;
      this.airMinY = this.y;
      const firm = solidAt(Math.floor(this.cx / T), Math.floor((this.feet + 1) / T)) && !rectHas(this.x, this.feet, this.w, 2, 'c');
      if (firm && !rectHas(this.x - 8, this.y, this.w + 16, this.h + 2, '^') && !rectHas(this.x - 4, this.y, this.w + 8, this.h, 'F') && res.ground) this.safe = { x: this.x, y: this.y };
    } else {
      if (wasGround) this.takeoffX = this.cx;
      this.airMinY = Math.min(this.airMinY, this.y);
      if (wasGround && this.state === 'slide') { this.state = 'normal'; if (this.canStand()) this.setH(26); }
    }
    if (res.wall && this.state === 'dash') { this.state = 'normal'; }

    // Valla: saltar lo que llega a la cintura sin frenar
    if (this.onGround && this.state === 'normal' && dir && (Math.abs(this.vx) > 80 || res.wall === dir)) {
      const tx = Math.floor((dir > 0 ? this.x + this.w + 2 : this.x - 2) / T), ty = Math.floor((this.feet - 1) / T);
      if (solidAt(tx, ty) && !solidAt(tx, ty - 1) && !solidAt(tx, ty - 2) && !rectSolid(this.x, this.y - 18, this.w, 18)) {
        this.vy = -255; this.vaultT = 0.25; this.onGround = false; this.vx = dir * Math.max(Math.abs(this.vx), PH.run);
        Audio2.sfx('vault'); this.combo('Valla');
      }
    }
    // Cornisa
    if (!this.onGround && this.vy > -40 && this.noGrab <= 0 && this.state === 'normal' && dir) this.tryGrab(dir);

    // Daños del entorno
    if (rectHas(this.x + 1, this.y + 2, this.w - 2, this.h - 2, '^')) { this.hurt(1); this.respawnSafe(); }
    if (rectHas(this.x - 1, this.y, this.w + 2, this.h, 'F')) this.hurt(1, this.cx + this.face * 8);
    if (this.y > G.room.H * T + 40) { this.hurt(1); this.respawnSafe(); }

    if (!G.cine) this.actions(dt, I, dir);
  }
  onPlatform() {
    const ty = Math.floor((this.feet + 1) / T);
    let plat = false;
    for (let tx = Math.floor(this.x / T); tx <= Math.floor((this.x + this.w - 0.01) / T); tx++) {
      const ch = tileAt(tx, ty);
      if (SOLID.has(ch)) return false;
      if (ch === '-') plat = true;
    }
    return plat;
  }
  land(v) {
    const drop = this.feet - (this.airMinY + this.h);
    if (this.state === 'plunge') { this.state = 'normal'; this.shock(); return; }
    if (drop > PH.fallHurt || (drop > 3 * T && this.rollQ > 0)) {
      if (this.rollQ > 0 || Input.down.down) {
        this.state = 'roll'; this.st = 0.38; this.setH(14); this.vx = (this.vx || this.face * 60) * 1.1;
        this.combo('Rodar');
        Audio2.sfx('roll'); return;
      }
      if (drop > PH.fallHurt) { this.hurt(1); this.landT = 0.25; return; }
    }
    if (v > 150) { this.landT = 0.1; Audio2.sfx('land'); burst(this.cx, this.feet, 4, ['#8a7a8a'], 30, 0.3); }
  }
  tryGrab(dir) {
    const hx = dir > 0 ? this.x + this.w + 1 : this.x - 1;
    const hy = this.y + 2;
    // Indulgente: también agarra si las manos pasan un poco por encima del borde
    const tx = Math.floor(hx / T), ty = Math.floor((hy + 6) / T);
    if (!solidAt(tx, ty) || solidAt(tx, ty - 1) || solidAt(tx, ty - 2)) return;
    const top = ty * T;
    if (hy - top > 9 || hy - top < -6) return;
    if (rectSolid(this.x, top - 4, this.w, 26)) return;
    this.state = 'hang'; this.vx = 0; this.vy = 0; this.face = dir;
    this.y = top - 4; this.x = dir > 0 ? tx * T - this.w - 0.01 : (tx + 1) * T + 0.01;
    this.hangTile = { tx, ty }; this.dashCan = true; this.airMinY = this.y;
  }
  updHang(dt, dir, D, P) {
    if (P.down) { this.state = 'normal'; this.noGrab = 0.3; return; }
    if (P.jump && dir === -this.face) { this.state = 'normal'; this.vx = -this.face * PH.wallJumpX; this.vy = -PH.wallJumpY; this.face = -this.face; this.wallT = 0.14; Audio2.sfx('walljump'); return; }
    if (P.jump || P.up || dir === this.face) {
      const { tx, ty } = this.hangTile;
      const nx = this.face > 0 ? tx * T + 1 : (tx + 1) * T - this.w - 1;
      const ny = ty * T - 26;
      if (!rectSolid(nx, ny, this.w, 26)) {
        this.state = 'climb'; this.st = 0; this.from = { x: this.x, y: this.y }; this.to = { x: nx, y: ny };
        this.combo('Cornisa');
        this.jumpBuf = 0; Audio2.sfx('vault');
      }
    }
  }
  updClimb(dt) {
    this.st += dt;
    const k = Math.min(1, this.st / 0.14);
    const ky = Math.min(1, k * 1.6);
    this.x = this.from.x + (this.to.x - this.from.x) * k;
    this.y = this.from.y + (this.to.y - this.from.y) * ky;
    if (k >= 1) { this.state = 'normal'; this.vx = this.face * PH.run * 0.9; this.vy = 0; this.onGround = true; this.airMinY = this.y; }
  }
  updZip(dt, P) {
    const z = this.zip;
    this.zipV = Math.min(300, this.zipV + 260 * dt);
    z.t += this.zipV * dt / z.len;
    const px = z.x1 + (z.x2 - z.x1) * z.t, py = z.y1 + (z.y2 - z.y1) * z.t;
    this.x = px - this.w / 2; this.y = py + 3;
    this.face = sign(z.x2 - z.x1);
    if (Math.random() < 0.6) G.parts.push({ x: px, y: py, vx: -this.face * 40, vy: 20, life: 0.2, max: 0.2, col: '#ffd48a', g: 300, s: 1 });
    if (P.jump || z.t >= 1) {
      this.state = 'normal'; this.vx = this.face * this.zipV * 0.8; this.vy = P.jump ? -260 : 0;
      this.zipCool = 0.4; this.airMinY = this.y; this.cutDone = true;
    }
  }
  // Barra: Jon cuelga de ella y se balancea; al saltar sale disparado en la dirección del vaivén
  startSwing(bar) {
    this.state = 'swing'; this.swingBar = bar; this.setH(26);
    const L = 16;
    this.swA = clamp((this.cx - bar.px) / L, -1, 1);
    this.swW = clamp(this.vx / L + (this.vy > 0 ? sign(this.vx || this.face) * this.vy / L * 0.35 : 0), -11, 11);
    this.vx = 0; this.vy = 0; this.dashCan = true; this.platUsed = false; this.airMinY = this.y;
    Audio2.sfx('swing');
  }
  updSwing(dt, dir, D, P) {
    const b = this.swingBar, L = 16;
    this.swW += -(PH.grav / L) * Math.sin(this.swA) * dt * 0.55 + dir * 5 * dt;
    this.swW *= 1 - 0.25 * dt;
    this.swA = clamp(this.swA + this.swW * dt, -1.35, 1.35);
    const cx = b.px + Math.sin(this.swA) * L, cy = b.py + Math.cos(this.swA) * L;
    const nx = cx - this.w / 2, ny = cy - this.h / 2 + 8;
    if (rectSolid(nx, ny, this.w, this.h)) { this.swW = -this.swW * 0.4; return; }
    this.x = nx; this.y = ny;
    if (Math.abs(this.swW) > 0.5) this.face = sign(this.swW);
    if (P.jump) {
      const d = sign(this.swW) || this.face, v = Math.abs(this.swW) * L;
      this.state = 'normal'; this.swingCool = 0.35; this.cutDone = true;
      this.vx = d * Math.max(PH.run * 1.1, v * 1.35); this.vy = -330 - Math.min(80, v * 0.3);
      this.face = d; this.airMinY = this.y; this.takeoffX = this.cx;
      Audio2.sfx('jump'); this.combo('Barra');
    } else if (P.down) { this.state = 'normal'; this.swingCool = 0.45; this.vy = 0; }
  }
  respawnSafe() {
    this.x = this.safe.x; this.y = this.safe.y; this.vx = 0; this.vy = 0; this.state = 'normal'; this.setH(26);
    this.airMinY = this.y;
    G.fadeFlash = 0.4;
  }
  // ---------------------------------------------------------------- Marcas
  actions(dt, I, dir) {
    const S = G.save;
    const act = S.active;
    // Cambiar de marca
    const list = S.marks.filter((m) => m !== 'destino');
    if (I.pressed.swap && list.length > 1) {
      const i = list.indexOf(act);
      S.active = list[(i + 1) % list.length];
      Audio2.sfx('select'); G.markPop = 1;
    }
    // Dash
    if (I.pressed.dash && this.has('energia') && this.dashCan && this.state !== 'dash' && this.state !== 'plunge' && !this.onGroundLocked()) {
      if (this.spend('energia', 6)) {
        if (this.state !== 'normal') { this.setH(26); }
        this.state = 'dash'; this.st = PH.dashT; this.vx = (dir || this.face) * PH.dash; this.face = dir || this.face; this.vy = 0;
        this.combo('Dash');
        this.dashCan = this.onGround; this.airMinY = this.y;
        Audio2.sfx('dash'); G.noise();
      }
    }
    // Disparo y carga
    if (act && act !== 'destino') {
      // Energía dispara al pulsar; la Temperatura decide al soltar (toque: fuego, cargado: hielo)
      if (I.pressed.shoot) { if (act === 'energia') this.fire(false); this.charge = 0.001; }
      if (I.down.shoot && this.charge > 0) {
        this.charge += dt;
        if (this.charge > 0.25 && Math.random() < 0.5) {
          const m = PLAYER_MARKS[act];
          const col = act === 'temperatura' ? '#b8fff7' : m.glow;
          const a = Math.random() * Math.PI * 2;
          G.parts.push({ x: this.cx + Math.cos(a) * 10, y: this.cy + Math.sin(a) * 10, vx: -Math.cos(a) * 40, vy: -Math.sin(a) * 40, life: 0.25, max: 0.25, col, g: 0, s: 1 });
        }
      }
      if (I.released.shoot && this.charge > 0) {
        if (this.charge >= 0.6) this.fire(true);
        else if (act === 'temperatura') this.fire(false);
        this.charge = 0;
      }
      if (I.pressed.power) this.power();
    }
    // Usar: hablar, guardar, copiar, cargar el carro, absorber
    this.using = null;
    const tgt = G.interactTarget;
    if (tgt && I.pressed.use && tgt.press) tgt.press();
    if (tgt && I.down.use && tgt.hold && this.onGround && this.state === 'normal') {
      this.using = tgt; this.vx *= 0.8;
      tgt.hold(dt);
      this.face = sign(tgt.cx - this.cx) || this.face;
    }
    if (this.lastUse && this.lastUse !== this.using && this.lastUse.release) this.lastUse.release();
    this.lastUse = this.using;
  }
  onGroundLocked() { return this.state === 'hang' || this.state === 'climb' || this.state === 'zip'; }
  hand() { return { x: this.cx + this.face * 9, y: this.y + Math.min(10, this.h - 6) }; }
  // Apuntar: ↑ dispara hacia arriba; ↑ con una dirección, en diagonal
  aimDir() {
    const D = Input.down;
    if (!D.up || this.state === 'hang' || this.state === 'zip') return { ax: this.face, ay: 0 };
    if (D.left || D.right) return { ax: this.face * 0.7071, ay: -0.7071 };
    return { ax: 0, ay: -1 };
  }
  aimHand(a) {
    if (a.ay === 0) return { x: this.cx + this.face * 9, y: this.y + Math.min(9, this.h - 7) };
    if (a.ax === 0) return { x: this.cx + this.face * 2, y: this.y - 4 };
    return { x: this.cx + this.face * 8, y: this.y + 1 };
  }
  fire(charged) {
    const act = G.save.active;
    const a = this.aimDir(), h = this.aimHand(a);
    this.castT = 0.18; this.aim = a;
    const shot = (v, type) => G.projs.push(new Proj(h.x, h.y, a.ax * v, a.ay * v, type));
    if (act === 'energia') {
      if (!this.spend('energia', charged ? 20 : 4)) return;
      this.castCol = '#9fd0ff';
      if (charged) { shot(380, 'charged'); Audio2.sfx('charge'); G.shake(2); }
      else { shot(330, 'bolt'); Audio2.sfx('shot'); }
    } else if (act === 'temperatura') {
      if (!this.spend('temperatura', charged ? 16 : 4)) return;
      if (charged) { this.castCol = '#b8fff7'; shot(300, 'ice'); Audio2.sfx('ice'); }
      else { this.castCol = '#ffb060'; shot(280, 'fire'); Audio2.sfx('fire'); }
    }
    G.noise();
  }
  power() {
    const act = G.save.active;
    if (act === 'energia') {
      if (!this.onGround && this.state === 'normal') {
        if (!this.spend('energia', 18)) return;
        this.state = 'plunge'; this.vy = 460; this.castT = 0.3; this.castCol = '#9fd0ff';
        Audio2.sfx('dash'); G.noise();
      } else if (this.onGround) {
        if (!this.spend('energia', 22)) return;
        this.castT = 0.3; this.castCol = '#9fd0ff';
        this.wave(64, 2);
      }
    } else if (act === 'temperatura') {
      if (!this.onGround && !this.platUsed && this.state === 'normal') {
        if (!this.spend('temperatura', 18)) return;
        this.platUsed = true;
        G.platforms.push({ x: this.cx - 18, y: this.feet + 1, w: 36, h: 6, life: 4, ice: true });
        this.vy = Math.min(this.vy, 0);
        burst(this.cx, this.feet + 3, 12, ['#b8fff7', '#2ee6d6', '#ffffff'], 50);
        Audio2.sfx('plat'); G.noise();
      } else if (this.onGround) {
        if (!this.spend('temperatura', 14)) return;
        // Llamarada a ras de suelo hacia los dos lados
        this.castT = 0.3; this.castCol = '#ffb060';
        G.projs.push(new Proj(this.cx, this.feet - 6, 200, 0, 'flame'));
        G.projs.push(new Proj(this.cx, this.feet - 6, -200, 0, 'flame'));
        Audio2.sfx('fire'); G.noise();
      }
    }
  }
  wave(r, dmg) {
    G.waves.push({ x: this.cx, y: this.feet - 4, r: 4, max: r, col: '#9fd0ff' });
    for (const e of G.ents) if (e.enemy && !e.dead && Math.hypot(e.cx - this.cx, e.cy - this.cy) < r + 8) e.damage(dmg, this.cx, 'wave');
    for (const e of G.ents) if (e.onShot && Math.hypot(e.cx - this.cx, e.cy - this.cy) < r) e.onShot({ type: 'charged', dmg });
    // Rocas con vetas cercanas
    const r2 = Math.ceil(r / T);
    for (let ty = Math.floor(this.cy / T) - r2; ty <= Math.floor(this.cy / T) + r2; ty++)
      for (let tx = Math.floor(this.cx / T) - r2; tx <= Math.floor(this.cx / T) + r2; tx++)
        if (tileAt(tx, ty) === 'B' && Math.hypot(tx * T + 8 - this.cx, ty * T + 8 - this.cy) < r + 4) G.breakTile(tx, ty);
    Audio2.sfx('wave'); G.shake(3); G.noise();
  }
  shock() { this.wave(48, 2); burst(this.cx, this.feet, 14, ['#9fd0ff', '#2f8bff', '#ffffff'], 90, 0.4); }
  // ---------------------------------------------------------------- Dibujo
  pose() {
    const S = G.save;
    let p;
    if (this.state === 'hang') p = MOVE.hang();
    else if (this.state === 'climb') p = MOVE.vault();
    else if (this.state === 'zip' || this.state === 'swing') p = MOVE.hang();
    else if (this.state === 'dash') p = MOVE.dash();
    else if (this.state === 'slide') p = MOVE.slide();
    else if (this.state === 'roll') p = MOVE.roll();
    else if (this.state === 'crouch') p = MOVE.crouch();
    else if (this.state === 'plunge') p = MOVE.fall();
    else if (this.hurtT > 0) p = MOVE.fall();
    else if (this.vaultT > 0) p = MOVE.vault();
    else if (!this.onGround) {
      if (this.wallSliding) p = MOVE.wall();
      else p = this.vy < -60 ? MOVE.jump() : this.vy < 70 ? MOVE.apex() : MOVE.fall();
    } else if (this.landT > 0) p = MOVE.land();
    else if (Math.abs(this.vx) > 20) p = MOVE.run(Math.floor(this.t * (Math.abs(this.vx) > 150 ? 15 : 12.5)) % 6);
    else { p = IDLE.jon(this.t); }
    p = { ...p };
    if (p.scarf && Math.abs(this.vx) > 20 && this.onGround) p.scarf = SCARF.run(Math.floor(this.t * 12) % 4);
    // Marcas en el brazo
    const marks = S.marks.filter((m) => m !== 'destino').map((m) => (m === S.active ? PLAYER_MARKS[m].glow : PLAYER_MARKS[m].color));
    if (marks.length) p.marks = marks;
    if (this.using) { p.armF = [6, -1]; p.armGlow = this.using.glowCol || '#f2c45a'; }
    else if (this.castT > 0) { p.armF = this.armFor(this.aim); p.armGlow = this.castCol; }
    else if (this.charge > 0) {
      p.armF = this.armFor(this.aimDir());
      if (this.charge > 0.25 && Math.floor(this.t * 16) % 2) p.armGlow = S.active === 'temperatura' ? '#b8fff7' : '#9fd0ff';
    }
    return p;
  }
  armFor(a) { return !a || a.ay === 0 ? [6, -1] : a.ax === 0 ? [1, -7] : [5, -5]; }
  draw(c) {
    if (this.ghost) return;
    const spr = sprite('jon', CH.jon, this.pose(), this.hidden ? '#1a1430' : null);
    const flip = this.face < 0;
    const dx = this.cx - (flip ? 11 : 13), dy = this.feet - 31;
    for (const tr of this.trail) {
      const g = sprite('jon', CH.jon, MOVE.dash(), '#2f8bff');
      drawSprite(c, g, tr.x + this.w / 2 - (tr.face < 0 ? 11 : 13), tr.y + this.h - 31, tr.face < 0, tr.life * 2.5);
    }
    if (this.inv > 0 && Math.floor(this.inv * 20) % 2 && this.hurtT <= 0) return;
    drawSprite(c, spr, dx, dy, flip);
    if (this.state === 'zip') { const z = this.zip; c.fillStyle = '#e6e0d2'; c.fillRect(Math.round(this.cx) - 1, Math.round(this.y) - 3, 3, 2); }
  }
}

// ------------------------------------------------------------------ Proyectiles
class Proj {
  constructor(x, y, vx, vy, type) {
    this.x = x; this.y = y; this.vx = vx; this.vy = vy; this.type = type; this.life = 1.1;
    const big = type === 'charged' || type === 'ice';
    this.w = big ? 10 : type === 'flame' ? 8 : 6; this.h = big ? 8 : type === 'flame' ? 10 : 4;
    if (Math.abs(vy) > Math.abs(vx) * 1.5) { const w = this.w; this.w = this.h; this.h = w; }
    else if (vy && vx) { this.w = this.h = Math.max(this.w, this.h) - 1; }
    this.x -= this.w / 2; this.y -= this.h / 2;
    this.dmg = { bolt: 1, charged: 3, fire: 1, ice: 2, flame: 1, ebolt: 1, orb: 1, arrow: 2 }[type];
    this.player = ['bolt', 'charged', 'fire', 'ice', 'flame'].includes(type);
    this.pierce = type === 'charged';
    this.hitSet = new Set();
    if (type === 'flame') this.life = 0.45;
    if (type === 'orb') this.life = 3.5;
    if (type === 'ebolt' || type === 'arrow') this.life = 2.5;
  }
  get cx() { return this.x + this.w / 2; }
  get cy() { return this.y + this.h / 2; }
  update(dt) {
    this.life -= dt;
    if (this.type === 'orb') {
      // Busca a Jon, despacio
      const p = G.player;
      const a = Math.atan2(p.cy - this.cy, p.cx - this.cx), sp = Math.hypot(this.vx, this.vy);
      const cur = Math.atan2(this.vy, this.vx);
      let da = a - cur; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
      const na = cur + clamp(da, -1.6 * dt, 1.6 * dt);
      this.vx = Math.cos(na) * sp; this.vy = Math.sin(na) * sp;
    }
    if (this.type === 'flame') this.vy = 0;
    this.x += this.vx * dt; this.y += this.vy * dt;
    // Casillas
    const tx = Math.floor(this.cx / T), ty = Math.floor(this.cy / T);
    const ch = tileAt(tx, ty);
    if (this.player) {
      if (ch === 'B' && (this.type === 'bolt' || this.type === 'charged')) { G.breakTile(tx, ty); if (!this.pierce) return this.kill(); }
      if (ch === 'G') { if (this.type === 'charged') { G.breakTile(tx, ty); return this.kill(); } Audio2.sfx('block'); floatText(this.cx, this.cy - 6, 'necesita una descarga cargada', '#9fd0ff'); return this.kill(); }
      if (ch === 'I' && (this.type === 'fire' || this.type === 'flame')) { G.meltTile(tx, ty); return this.kill(); }
      if (ch === 'F' && this.type === 'ice') { G.freezeFire(tx, ty); return this.kill(); }
      if (ch === 'k' && this.type === 'ice') { G.freezeFall(tx, ty); return this.kill(); }
      if (ch === 'K' && (this.type === 'fire' || this.type === 'flame')) { G.thawFall(tx, ty); return this.kill(); }
    }
    if (SOLID.has(ch) || (ch === 'k' && this.type === 'fire')) return this.kill();
    if (this.life <= 0) return this.kill(true);
    // Golpes
    if (this.player) {
      for (const e of G.ents) {
        if (e.dead || this.hitSet.has(e)) continue;
        if ((e.enemy || e.onShot) && overlap(this, e.hitbox ? e.hitbox() : e)) {
          if (e.enemy) {
            if (e.blocks && e.blocks(this)) { Audio2.sfx('block'); burst(this.cx, this.cy, 5, ['#ffffff', '#3ac8ff'], 60); this.vx = -this.vx * 0.5; this.vy = -120; this.player = false; this.life = 0.3; return; }
            e.damage(this.dmg, this.cx, this.type);
          } else e.onShot(this);
          this.hitSet.add(e);
          if (!this.pierce) return this.kill();
        }
      }
    } else {
      const p = G.player;
      if (overlap(this, p)) { p.hurt(this.dmg, this.cx); return this.kill(); }
    }
  }
  // Disparos hacia arriba o en diagonal: una estela en la dirección del vuelo
  drawStreak(c, f) {
    const sp = Math.hypot(this.vx, this.vy), dx = this.vx / sp, dy = this.vy / sp;
    const cols = { bolt: ['#2f8bff', '#9fd0ff', '#ffffff'], charged: ['#2f8bff', '#9fd0ff', '#ffffff'], fire: ['#c03a10', '#ff8a2a', '#ffd23a'], ice: ['#2a8a96', '#2ee6d6', '#e8ffff'] }[this.type] || ['#ffffff', '#ffffff', '#ffffff'];
    const big = this.type === 'charged' || this.type === 'ice';
    const len = big ? 10 : 6, w = big ? 4 : 2;
    const cx = this.cx, cy = this.cy;
    for (let i = 0; i < len; i++) {
      const px = Math.round(cx - dx * i), py = Math.round(cy - dy * i);
      c.fillStyle = i < 2 ? cols[2] : i < len / 2 ? cols[1] : cols[0];
      c.fillRect(px - (w >> 1), py - (w >> 1), w, w);
    }
    if (big && f) { c.fillStyle = cols[2]; c.fillRect(Math.round(cx) - 1, Math.round(cy) - 1, 3, 3); }
  }
  kill(quiet) {
    this.dead = true;
    if (quiet) return;
    const cols = { bolt: ['#9fd0ff', '#ffffff'], charged: ['#9fd0ff', '#2f8bff', '#ffffff'], fire: ['#ffd23a', '#ff8a2a'], flame: ['#ffd23a', '#ff8a2a'], ice: ['#b8fff7', '#ffffff'], ebolt: ['#3ac8ff', '#ffffff'], orb: ['#b45cff', '#e6b0ff'], arrow: ['#ff4a3a', '#ffffff'] }[this.type];
    burst(this.cx, this.cy, this.type === 'charged' ? 10 : 5, cols, 50, 0.3);
  }
  draw(c) {
    const x = Math.round(this.x), y = Math.round(this.y), t = G.t;
    const f = Math.floor(t * 20) % 2;
    if (this.player && this.vy && this.type !== 'flame') return this.drawStreak(c, f);
    switch (this.type) {
      case 'bolt': c.fillStyle = '#2f8bff'; c.fillRect(x, y, 6, 4); c.fillStyle = f ? '#ffffff' : '#9fd0ff'; c.fillRect(x + 1, y + 1, 4, 2); break;
      case 'charged':
        c.fillStyle = '#2f8bff'; c.fillRect(x - 2, y + 1, 14, 6); c.fillStyle = '#9fd0ff'; c.fillRect(x, y, 10, 8);
        c.fillStyle = '#ffffff'; c.fillRect(x + 2, y + 2, 6, 4);
        c.fillStyle = 'rgba(159,208,255,0.5)'; c.fillRect(x - sign(this.vx) * 8, y + 3, 8, 2); break;
      case 'fire': c.fillStyle = '#ff8a2a'; c.fillRect(x, y, 6, 4); c.fillStyle = f ? '#ffd23a' : '#fff1b8'; c.fillRect(x + 1, y + 1, 3, 2); break;
      case 'flame': for (let i = 0; i < 4; i++) { c.fillStyle = i % 2 ? '#ffd23a' : '#ff8a2a'; c.fillRect(x + ((i * 3 + f) % 6), y + 10 - ((t * 60 + i * 4) % 10), 3, 3); } break;
      case 'ice': c.fillStyle = '#2ee6d6'; c.fillRect(x, y + 1, 10, 6); c.fillStyle = '#b8fff7'; c.fillRect(x + 2, y, 6, 8); c.fillStyle = '#ffffff'; c.fillRect(x + 4, y + 2, 2, 4); break;
      case 'ebolt': c.fillStyle = '#3ac8ff'; c.fillRect(x, y + 1, 6, 2); c.fillStyle = '#bff0ff'; c.fillRect(x + 2, y + 1, 2, 2); break;
      case 'arrow': c.fillStyle = '#ff4a3a'; c.fillRect(x, y + 1, 6, 2); c.fillStyle = '#ffffff'; c.fillRect(x + (this.vx > 0 ? 4 : 0), y + 1, 2, 2); break;
      case 'orb': c.fillStyle = '#4b2d5c'; c.fillRect(x, y, 6, 4); c.fillStyle = f ? '#b45cff' : '#e6b0ff'; c.fillRect(x + 1, y, 4, 4); c.fillRect(x, y + 1, 6, 2); break;
    }
  }
}

// ------------------------------------------------------------------ Base de entidad
class Ent {
  constructor(d) {
    this.d = d; this.x = d.x * T; this.y = d.y * T; this.w = 16; this.h = 16; this.t = Math.random() * 10;
  }
  get cx() { return this.x + this.w / 2; }
  get cy() { return this.y + this.h / 2; }
  feetAt(tileY) { this.y = (tileY + 1) * T - this.h; }
  update() {}
  draw() {}
}

// ------------------------------------------------------------------ Enemigos
class Enemy extends Ent {
  constructor(d) {
    super(d);
    this.enemy = true; this.vx = 0; this.vy = 0; this.face = -1; this.flash = 0; this.freeze = 0; this.burn = 0;
    this.hostile = !!d.hostile; this.watch = 0; this.cool = 1 + Math.random(); this.dying = 0;
  }
  get pdc() { return false; }
  hitbox() { return this; }
  damage(n, fromX, type) {
    if (this.dead || this.dying) return;
    if (this.apagado > 0) n *= 2;
    this.hp -= n; this.flash = 0.12;
    if (type === 'ice') { this.freeze = 2.6; this.vx = 0; }
    if (type === 'fire' || type === 'flame') { if (this.freeze > 0) { this.freeze = 0; n += 1; this.hp -= 1; floatText(this.cx, this.y - 4, '¡Choque térmico!', '#ffd23a'); } this.burn = 1.5; }
    if (type !== 'ice') this.vx += sign(this.cx - fromX) * 90;
    Audio2.sfx('hit');
    burst(this.cx, this.cy, 6, ['#ffffff', '#9fd0ff'], 50, 0.3);
    if (this.pdc) G.alarm('hit');
    else if (!this.hostile) this.hostile = true;
    if (this.hp <= 0) { this.dying = 0.6; this.freeze = 0; Audio2.sfx('ko'); this.onDie(); }
  }
  onDie() { burst(this.cx, this.cy, 14, ['#9fd0ff', '#ffffff', '#3a4256'], 70, 0.6); }
  common(dt) {
    this.t += dt;
    if (this.flash > 0) this.flash -= dt;
    if (this.burn > 0) {
      this.burn -= dt;
      if (Math.random() < 0.3) G.parts.push({ x: this.x + Math.random() * this.w, y: this.y + Math.random() * this.h, vx: 0, vy: -30, life: 0.4, max: 0.4, col: Math.random() < 0.5 ? '#ff8a2a' : '#ffd23a', g: -20, s: 1 });
    }
    if (this.dying) {
      this.dying -= dt;
      if (this.dying <= 0) this.dead = true;
      return false;
    }
    if (this.freeze > 0) {
      this.freeze -= dt;
      G.platforms.push({ x: this.x - 2, y: this.y, w: this.w + 4, h: 4, life: 0.02, frozen: true });
      return false;
    }
    // Contacto
    const p = G.player;
    if (this.hostile && this.touch !== false && overlap(this.hitbox(), p)) p.hurt(1, this.cx);
    return true;
  }
  sees(range = 150, cone = 0.55) {
    const p = G.player;
    if (p.hidden || p.ghost) return false;
    const ex = this.cx, ey = this.y + 6;
    const dx = p.cx - ex, dy = p.cy - ey;
    if (Math.abs(dx) > range || Math.abs(dy) > range * 0.8) return false;
    if (this.face && sign(dx) !== this.face && Math.abs(dx) > 6) return false;
    if (Math.abs(dy) > Math.abs(dx) * cone + 22) return false;
    return los(ex, ey, p.cx, p.y + 6) || los(ex, ey, p.cx, p.cy + 4);
  }
  walker(dt) {
    this.vy = Math.min(this.vy + PH.grav * dt, 400);
    const res = moveBody(this, dt);
    this.ground = res.ground;
    if (res.wall) this.face = -this.face;
    return res;
  }
  edgeAhead() {
    const tx = Math.floor((this.face > 0 ? this.x + this.w + 2 : this.x - 2) / T), ty = Math.floor((this.y + this.h + 2) / T);
    const ch = tileAt(tx, ty);
    return !(SOLID.has(ch) || ch === '-') || solidAt(tx, Math.floor((this.y + this.h - 4) / T));
  }
  drawBubble(c, txt, col) {
    const x = Math.round(this.cx), y = Math.round(this.y) - 12;
    c.fillStyle = '#0b0a17'; c.fillRect(x - 3, y - 1, 6, 9);
    c.fillStyle = col;
    if (txt === '!!') { c.fillRect(x - 2, y, 1, 5); c.fillRect(x - 2, y + 6, 1, 1); c.fillRect(x + 1, y, 1, 5); c.fillRect(x + 1, y + 6, 1, 1); }
    else if (txt === '?') { c.fillRect(x - 1, y, 3, 1); c.fillRect(x + 1, y + 1, 1, 2); c.fillRect(x, y + 3, 1, 2); c.fillRect(x, y + 6, 1, 1); }
    else { c.fillRect(x, y, 1, 5); c.fillRect(x, y + 6, 1, 1); }
  }
  tintCol() { return this.freeze > 0 ? '#b8fff7' : this.flash > 0 ? '#ffffff' : null; }
}

// Paladín de la Contención y sus variantes
const PDC_STATS = {
  paladin: { hp: 3, speed: 34, chase: 60, rate: 1.7, ch: 'paladin' },
  reforzado: { hp: 5, speed: 44, chase: 90, rate: 1.15, ch: 'reforzado' },
  blindado: { hp: 5, speed: 26, chase: 46, rate: 2.6, ch: 'blindado' },
  ballestero: { hp: 2, speed: 0, chase: 0, rate: 2.2, ch: 'ballestero' },
};
class Paladin extends Enemy {
  constructor(d) {
    super(d);
    this.kind = d.type;
    const s = PDC_STATS[this.kind];
    this.stats = s; this.hp = s.hp; this.w = 10; this.h = 26; this.x += 3; this.feetAt(d.y);
    this.face = d.face || (this.kind === 'ballestero' ? 1 : -1);
    this.patrol = d.patrol ? [d.patrol[0] * T, (d.patrol[1] + 1) * T] : null;
    this.wait = 0; this.aim = 0;
    if (G.room.alarm) this.hostile = true;
  }
  get pdc() { return true; }
  blocks(p) { return this.kind === 'blindado' && !this.freeze && sign(p.vx) === -this.face && Math.abs(p.cy - this.cy) < 14; }
  update(dt) {
    if (!this.common(dt)) { if (!this.dying) this.walker(dt); return; }
    const p = G.player;
    const S = this.stats;
    if (this.watch > 0) this.watch -= dt;
    if (!this.hostile) {
      // Tranquilo: patrulla, vigila
      if (this.d.guard) {
        if (this.d.turn) { this.wait -= dt; if (this.wait <= 0) { this.face = -this.face; this.wait = this.d.turn; } }
        this.vx = 0;
      } else if (this.patrol && S.speed) {
        if (this.wait > 0) { this.wait -= dt; this.vx = 0; if (this.wait <= 0) this.face = -this.face; }
        else {
          this.vx = this.face * S.speed;
          if ((this.face > 0 && this.x + this.w >= this.patrol[1]) || (this.face < 0 && this.x <= this.patrol[0]) || this.edgeAhead()) { this.wait = 1.4; this.vx = 0; }
        }
      } else if (this.kind === 'ballestero') {
        this.wait -= dt; if (this.wait <= 0) { this.face = -this.face; this.wait = 3; }
      }
      if (G.room.def.stealth && this.sees(140)) G.caught(this);
      if (this.watch > 0 && Math.abs(p.cx - this.cx) > 24) this.face = sign(p.cx - this.cx);
    } else {
      // Hostil: guardar distancia y disparar
      const dx = p.cx - this.cx;
      this.face = sign(dx) || this.face;
      if (this.kind !== 'ballestero') {
        const want = this.kind === 'blindado' ? 0 : 96;
        if (Math.abs(dx) > want + 16) this.vx = this.face * S.chase;
        else if (Math.abs(dx) < want - 24 && this.kind !== 'blindado') this.vx = -this.face * S.chase * 0.6;
        else this.vx *= 0.8;
        if (this.edgeAhead() && sign(this.vx) === this.face) this.vx = 0;
      }
      this.cool -= dt;
      if (this.kind === 'ballestero') {
        if (this.aim > 0) {
          this.aim -= dt;
          if (this.aim <= 0) {
            const a = this.aimAng;
            G.projs.push(new Proj(this.cx + this.face * 8, this.y + 12, Math.cos(a) * 340, Math.sin(a) * 340, 'arrow'));
            Audio2.sfx('enemyShot'); this.cool = S.rate;
          }
        } else if (this.cool <= 0 && los(this.cx, this.y + 10, p.cx, p.cy) && Math.abs(dx) < 300) {
          this.aim = 0.75; this.aimAng = Math.atan2(p.cy - (this.y + 12), p.cx - (this.cx + this.face * 8));
        }
      } else if (this.cool <= 0 && Math.abs(dx) < 220 && Math.abs(p.cy - this.cy) < 50 && los(this.cx, this.y + 10, p.cx, p.cy)) {
        G.projs.push(new Proj(this.cx + this.face * 10, this.y + 12, this.face * 210, 0, 'ebolt'));
        Audio2.sfx('enemyShot'); this.cool = S.rate * (0.8 + Math.random() * 0.4);
      }
    }
    this.walker(dt);
  }
  onDie() { burst(this.cx, this.cy, 12, ['#3ac8ff', '#8c96a8', '#ffffff'], 70, 0.6); }
  draw(c) {
    const ch = PDC[this.kind];
    let pose;
    if (this.dying) pose = { ...MOVE.fall(), noArmF: false };
    else if (Math.abs(this.vx) > 5 && !this.freeze) { pose = MOVE.run(Math.floor(this.t * 8) % 6); delete pose.scarf; }
    else pose = IDLE.paladin(this.t);
    pose = { ...pose };
    if (this.kind === 'blindado') pose.shield = true;
    if (this.kind === 'ballestero' || this.hostile) { pose.noArmF = false; pose.armF = this.kind === 'ballestero' ? [5, -1] : [4, 2]; pose.fxk = 'bow'; pose.fx = this.kind === 'ballestero' ? (g, P, lean, bob) => crossbow(g, P, 18 + lean, 12 + bob) : (g, P, lean, bob) => crossbow(g, P, 17 + lean, 15 + bob); }
    if (this.dying) pose.noArmF = true;
    const spr = sprite('pdc-' + this.kind, ch, pose, this.tintCol());
    const flip = this.face < 0;
    const a = this.dying ? Math.max(0, this.dying / 0.6) : 1;
    drawSprite(c, spr, this.cx - 12, this.y + this.h - 31 + (this.dying ? (1 - a) * 6 : 0), flip, a);
    // Cono de visión en las salas de sigilo
    if (G.room.def.stealth && !this.dying) {
      c.fillStyle = 'rgba(58,200,255,0.10)';
      c.beginPath(); c.moveTo(this.cx, this.y + 6);
      c.lineTo(this.cx + this.face * 140, this.y + 6 - 140 * 0.55 - 22); c.lineTo(this.cx + this.face * 140, this.y + 6 + 140 * 0.55 + 22);
      c.closePath(); c.fill();
    }
    if (this.aim > 0) {
      c.fillStyle = Math.floor(this.t * 20) % 2 ? '#ff4a3a' : '#a01a14';
      const sx = this.cx + this.face * 8, sy = this.y + 12;
      for (let i = 0; i < 60; i++) c.fillRect(Math.round(sx + Math.cos(this.aimAng) * i * 5), Math.round(sy + Math.sin(this.aimAng) * i * 5), 1, 1);
    }
    if (!this.dying) {
      if (this.hostile && G.room.alarm) this.drawBubble(c, '!!', '#ff4a3a');
      else if (this.watch > 0) this.drawBubble(c, '!', '#ffd23a');
    }
  }
}

// Vigía de latón: búho mecánico
class Vigia extends Enemy {
  constructor(d) {
    super(d);
    this.hp = 2; this.w = 14; this.h = 10; this.baseY = this.y; this.x0 = this.x;
    this.patrol = d.patrol ? [d.patrol[0] * T, d.patrol[1] * T] : [this.x - 48, this.x + 48];
    this.face = 1;
    if (G.room.alarm) this.hostile = true;
  }
  get pdc() { return !this.d.hostile; }
  // El ojo de cristal mira hacia abajo: un cono de luz
  sees() {
    const p = G.player;
    if (p.hidden || p.ghost) return false;
    const dx = p.cx - this.cx, dy = p.cy - this.cy;
    if (dy < 0 || dy > 200 || Math.abs(dx) > 10 + dy * 0.24) return false;
    return los(this.cx, this.cy + 6, p.cx, p.y + 4) || los(this.cx, this.cy + 6, p.cx, p.cy + 6);
  }
  beamLen() { let d = 8; while (d < 200 && !solidPx(this.cx, this.cy + d)) d += 4; return d; }
  update(dt) {
    if (!this.common(dt)) {
      if (this.dying) { this.vy += 400 * dt; this.y += this.vy * dt; }
      return;
    }
    const p = G.player;
    if (!this.hostile) {
      this.x += this.face * 30 * dt;
      if (this.x < this.patrol[0]) this.face = 1;
      if (this.x > this.patrol[1]) this.face = -1;
      this.y = this.baseY + Math.sin(this.t * 2) * 4;
      if (G.room.def.stealth && this.sees()) G.caught(this);
      if (this.watch > 0) this.watch -= dt;
    } else {
      const tx = p.cx + Math.sin(this.t * 0.9) * 50, ty = p.y - 64;
      this.x += clamp(tx - this.cx, -70, 70) * dt * 1.1;
      this.y += clamp(ty - this.cy, -60, 60) * dt * 1.1;
      if (solidPx(this.cx, this.cy)) this.y -= 40 * dt;
      this.face = sign(p.cx - this.cx) || 1;
      this.cool -= dt;
      if (this.cool <= 0 && los(this.cx, this.cy, p.cx, p.cy)) {
        const a = Math.atan2(p.cy - this.cy, p.cx - this.cx);
        G.projs.push(new Proj(this.cx, this.cy + 4, Math.cos(a) * 170, Math.sin(a) * 170, 'ebolt'));
        Audio2.sfx('enemyShot'); this.cool = 2 + Math.random();
      }
    }
  }
  onDie() { burst(this.cx, this.cy, 12, ['#b88a4a', '#e0b878', '#3ac8ff'], 70, 0.8, 300); }
  draw(c) {
    const f = Math.sin(this.t * 20) > 0 ? 0 : 1;
    const cv = this.flash > 0 ? OWL_HIT[f] : OWL_CV[f];
    const x = Math.round(this.x) - 1, y = Math.round(this.y) - 1;
    if (this.freeze > 0) c.globalAlpha = 0.7;
    drawSprite(c, cv, x, y, this.face < 0, this.dying ? Math.max(0, this.dying / 0.6) : 1);
    c.globalAlpha = 1;
    if (this.freeze > 0) { c.fillStyle = 'rgba(184,255,247,0.5)'; c.fillRect(x, y, 16, 12); }
    if (!this.dying && !this.hostile) {
      if (G.room.def.stealth) {
        const L = this.beamLen(), cx = this.cx, cy = this.cy + 6;
        c.fillStyle = 'rgba(255,240,170,0.13)';
        c.beginPath(); c.moveTo(cx - 2, cy); c.lineTo(cx + 2, cy); c.lineTo(cx + 10 + L * 0.24, cy + L); c.lineTo(cx - 10 - L * 0.24, cy + L); c.closePath(); c.fill();
        c.fillStyle = 'rgba(255,240,170,0.35)'; c.fillRect(Math.round(cx - 10 - L * 0.24), Math.round(cy + L) - 1, Math.round(20 + L * 0.48), 1);
      } else { c.fillStyle = 'rgba(58,200,255,0.4)'; for (let i = 0; i < 4; i++) c.fillRect(x + 7 + this.face * i, y + 13 + i * 3, 1, 1); }
    }
    if (!this.dying && this.hostile && G.room.alarm) this.drawBubble(c, '!!', '#ff4a3a');
    else if (this.watch > 0) this.drawBubble(c, '!', '#ffd23a');
  }
}

// Acólito: poder prestado violeta
class Acolito extends Enemy {
  constructor(d) {
    super(d);
    this.hp = 3; this.w = 12; this.h = 24; this.hostile = true; this.shots = 0; this.apagado = 0;
    this.baseY = this.y; this.x += 2;
    if (d.spawned) { this.spawnT = 0.7; }
  }
  hitbox() { return { x: this.x, y: this.y + 2, w: this.w, h: this.h - 2 }; }
  update(dt) {
    if (this.spawnT > 0) { this.spawnT -= dt; this.t += dt; if (Math.random() < 0.6) burst(this.cx, this.cy, 1, ['#a24dff', '#d1162b'], 40); return; }
    if (!this.common(dt)) return;
    const p = G.player;
    if (this.apagado > 0) {
      this.apagado -= dt;
      this.y += 20 * dt;
      if (rectSolid(this.x, this.y, this.w, this.h)) this.y -= 20 * dt;
      if (this.apagado <= 0) this.shots = 0;
      return;
    }
    const dx = p.cx - this.cx;
    this.face = sign(dx) || 1;
    const want = 84;
    const tx = Math.abs(dx) > want ? this.face * 40 : Math.abs(dx) < want - 30 ? -this.face * 30 : 0;
    // Sin línea de visión, sube para rodear el obstáculo
    const seen = los(this.cx, this.cy, p.cx, p.cy);
    const ty = seen ? (p.y - 6 + Math.sin(this.t * 2.2) * 8) - this.y : -40;
    const nx = this.x + tx * dt, ny = this.y + clamp(ty, -40, 40) * dt;
    if (!rectSolid(nx, this.y, this.w, this.h)) this.x = nx;
    if (!rectSolid(this.x, ny, this.w, this.h)) this.y = ny;
    this.cool -= dt;
    if (this.cool <= 0 && Math.abs(dx) < 240 && los(this.cx, this.cy, p.cx, p.cy)) {
      const a = Math.atan2(p.cy - this.cy, dx);
      G.projs.push(new Proj(this.cx + this.face * 6, this.cy - 2, Math.cos(a) * 110, Math.sin(a) * 110, 'orb'));
      Audio2.sfx('orb'); this.shots++; this.cool = 1.9 + Math.random() * 0.6;
      if (this.shots >= 4) { this.apagado = 2.4; floatText(this.cx, this.y - 4, 'se apaga', '#a24dff'); }
    }
  }
  onDie() { burst(this.cx, this.cy, 18, ['#a24dff', '#e6b0ff', '#d1162b', '#4b2d5c'], 70, 0.8, -30); }
  draw(c) {
    const pose = { ...IDLE.acolito(this.t) };
    if (this.apagado > 0) { pose.blink = true; pose.armF = [1, 6]; }
    const spr = sprite('acolito', CH.acolito, pose, this.spawnT > 0 ? '#a24dff' : this.tintCol());
    const a = this.dying ? Math.max(0, this.dying / 0.6) : this.spawnT > 0 ? 1 - this.spawnT / 0.7 : this.apagado > 0 ? 0.6 : 1;
    drawSprite(c, spr, this.cx - 12, this.y + this.h - 29, this.face < 0, a);
    if (!this.dying && this.apagado <= 0) { c.fillStyle = '#a24dff'; c.fillRect(Math.round(this.cx - 5 + ((this.t * 5) % 10)), Math.round(this.y + this.h + 1), 1, 1); }
  }
}

// ------------------------------------------------------------------ Fuentes de absorción
const SOURCE_INFO = {
  farol: { mark: 'energia', col: '#2f8bff', glow: '#9fd0ff', name: 'Absorber Energía' },
  cristal: { mark: 'energia', col: '#2f8bff', glow: '#9fd0ff', name: 'Absorber Energía' },
  brasero: { mark: 'temperatura', col: '#ff8a2a', glow: '#ffd23a', name: 'Absorber Temperatura' },
  arcon: { mark: 'temperatura', col: '#2ee6d6', glow: '#b8fff7', name: 'Absorber Temperatura' },
};
class Source extends Ent {
  constructor(d) {
    super(d);
    this.info = SOURCE_INFO[d.type];
    this.res = 100; this.idle = 0; this.w = 12; this.h = d.type === 'farol' ? 34 : 14; this.x += 2; this.feetAt(d.y);
    this.glowCol = this.info.glow;
  }
  get prompt() { return G.player.has(this.info.mark) ? this.info.name : null; }
  get hold() { return G.player.has(this.info.mark) ? this.absorb : null; }
  absorb(dt) {
    const m = this.info.mark, S = G.save;
    if (this.res <= 0 || S.bars[m] >= 100) { if (this.res <= 0 && Math.random() < 0.05) floatText(this.cx, this.y - 6, 'vacío', '#8a8aa0'); return; }
    const n = Math.min(this.res, 55 * dt, 100 - S.bars[m]);
    this.res -= n; S.bars[m] += n; this.idle = 2.5;
    this.absorbing = 0.1;
    Audio2.setHum(true, 160 + S.bars[m] * 2);
    const p = G.player, h = p.hand();
    const sy = this.d.type === 'farol' ? this.y + 3 : this.y + 4;
    if (Math.random() < 0.8) G.parts.push({ x: this.cx + (Math.random() - 0.5) * 6, y: sy, tx: h.x, ty: h.y, life: 0.4, max: 0.4, col: Math.random() < 0.4 ? '#ffffff' : this.info.glow, seek: true, s: 1 });
  }
  release() { Audio2.setHum(false); }
  update(dt) {
    this.t += dt;
    if (this.absorbing > 0) this.absorbing -= dt;
    if (this.idle > 0) this.idle -= dt; else this.res = Math.min(100, this.res + 9 * dt);
  }
  draw(c) {
    const x = Math.round(this.x), y = Math.round(this.y), k = this.res / 100, t = this.t;
    const flick = Math.sin(t * 20) > 0;
    switch (this.d.type) {
      case 'farol': {
        c.fillStyle = '#1b1b26'; c.fillRect(x + 5, y + 6, 2, 28); c.fillRect(x + 3, y + 32, 6, 2);
        c.fillStyle = '#2a2a3a'; c.fillRect(x + 1, y, 10, 7);
        c.fillStyle = k > 0.15 ? (flick ? '#9fd0ff' : '#2f8bff') : '#24406a'; c.fillRect(x + 2, y + 1, 8, 5);
        if (k > 0.15) { c.fillStyle = `rgba(47,139,255,${0.12 * k})`; c.fillRect(x - 10, y - 8, 32, 24); if (Math.random() < 0.05 * k) burst(x + 6, y + 3, 2, ['#9fd0ff'], 30, 0.3); }
        break;
      }
      case 'cristal': {
        const col = k > 0.15 ? (flick ? '#9fd0ff' : '#2f8bff') : '#24406a';
        c.fillStyle = '#4a4656'; c.fillRect(x, y + 10, 12, 4);
        c.fillStyle = col; c.fillRect(x + 4, y, 4, 11); c.fillRect(x + 1, y + 4, 3, 7); c.fillRect(x + 8, y + 3, 3, 8);
        c.fillStyle = '#ffffff'; if (k > 0.5) c.fillRect(x + 5, y + 2, 1, 3);
        if (k > 0.15) { c.fillStyle = `rgba(47,139,255,${0.1 * k})`; c.fillRect(x - 8, y - 6, 28, 22); }
        break;
      }
      case 'brasero': {
        c.fillStyle = '#3a2a2a'; c.fillRect(x, y + 6, 12, 6); c.fillStyle = '#1a1010'; c.fillRect(x + 2, y + 12, 2, 2); c.fillRect(x + 8, y + 12, 2, 2);
        c.fillStyle = '#5a3a2a'; c.fillRect(x, y + 6, 12, 1);
        const n = Math.round(6 * k);
        for (let i = 0; i < n; i++) { c.fillStyle = i % 2 ? '#ffd23a' : '#ff8a2a'; c.fillRect(x + 2 + (i * 5) % 8, y + 5 - ((t * 20 + i * 3) % 6), 2, 2); }
        if (k > 0.15) { c.fillStyle = `rgba(255,138,42,${0.12 * k})`; c.fillRect(x - 10, y - 10, 32, 24); }
        break;
      }
      case 'arcon': {
        c.fillStyle = '#3a4a5a'; c.fillRect(x, y + 2, 12, 12); c.fillStyle = '#5a7a8a'; c.fillRect(x, y + 2, 12, 2);
        c.fillStyle = k > 0.15 ? (flick ? '#b8fff7' : '#2ee6d6') : '#2a4a50'; c.fillRect(x + 2, y + 6, 8, 5);
        if (k > 0.15 && Math.random() < 0.1) G.parts.push({ x: x + Math.random() * 12, y: y + 2, vx: 0, vy: -12, life: 0.6, max: 0.6, col: '#e8ffff', g: 0, s: 1 });
        break;
      }
    }
  }
}

// ------------------------------------------------------------------ Caracola de bronce: guardar
class Caracola extends Ent {
  constructor(d) { super(d); this.w = 12; this.h = 22; this.x += 2; this.feetAt(d.y); this.glowCol = '#ffb547'; }
  get prompt() { return 'Guardar · hablar'; }
  press() {
    const first = CARACOLA_FIRST[G.room.def.id];
    G.saveAt(this);
    if (first && !G.save.flags['cara_' + G.room.def.id]) { G.save.flags['cara_' + G.room.def.id] = true; G.runScript(SCRIPTS[first]); }
    else G.runScript(SCRIPTS.centralita2);
  }
  update(dt) { this.t += dt; }
  draw(c) {
    const x = Math.round(this.x), y = Math.round(this.y), on = G.save.saveRoom === G.room.def.id;
    c.fillStyle = '#3a3036'; c.fillRect(x + 5, y + 8, 2, 14); c.fillRect(x + 2, y + 20, 8, 2);
    const P = ['..aaaa..', '.alllla.', 'alAAAAla', 'aA.aa.Aa', 'aA.al.Aa', '.aA..Aa.', '..aaaa..'];
    const pal = { a: '#b88a4a', A: '#7a5a2e', l: '#e0b878' };
    P.forEach((r, j) => [...r].forEach((ch, i) => { if (pal[ch]) { c.fillStyle = pal[ch]; c.fillRect(x + 2 + i, y + j, 1, 1); } }));
    if (on || Math.sin(this.t * 3) > 0.6) { c.fillStyle = 'rgba(255,181,71,0.25)'; c.fillRect(x - 3, y - 3, 18, 14); }
    if (Math.random() < 0.03) G.parts.push({ x: x + 6, y: y + 2, vx: (Math.random() - 0.5) * 10, vy: -10, life: 0.8, max: 0.8, col: '#ffb547', g: 0, s: 1 });
  }
}

// ------------------------------------------------------------------ Personajes que hablan
const NPC_CH = { iker: 'iker', desconocido: 'desconocido', txema: 'txema', rosa: 'rosa', unai: 'unai', pello: 'pello', narbaiza: 'narbaiza', edurne: 'edurne', martin: 'martin', abuela: 'abuela',
  ane: 'ane', panadera: 'panadera', pescador: 'pescador', vecina: 'vecina', vecino: 'vecino', cartero: 'cartero' };
class NPC extends Ent {
  constructor(d) {
    super(d);
    this.w = 10; this.h = 26; this.x += 3; this.feetAt(d.y); this.face = -1;
    this.who = d.who; this.ch = CH[NPC_CH[d.who]];
    this.copyT = 0; this.glowCol = '#f2c45a';
    this.fkey = 'npc_' + G.room.def.id + (d.key || d.who);
    if (d.once && G.save.flags[this.fkey] && d.leave) this.dead = true;
    if (d.needFlag && !G.save.flags[d.needFlag]) this.dead = true;
    if (d.hideFlag && G.save.flags[d.hideFlag]) this.dead = true;
  }
  get hiddenNow() { return this.d.needFlag && !G.save.flags[this.d.needFlag]; }
  get copyable() { return this.d.copy && G.save.flags['allow_' + this.d.copy] && !G.player.has(this.d.copy); }
  // Mientras corre su carrera, el Iker de la salida es el corredor, no este
  get racing() { return !!this.d.racer && !!G.race && G.race.id === this.d.racer; }
  get prompt() { return this.hiddenNow || this.racing ? null : this.copyable ? 'Copiar su marca (mantén)' : 'Hablar'; }
  press() { if (!this.copyable) this.talk(); }
  get hold() { return this.copyable ? this.copy : null; }
  copy(dt) {
    this.copyT += dt;
    Audio2.setHum(true, 200 + this.copyT * 160);
    const p = G.player, h = p.hand();
    const m = PLAYER_MARKS[this.d.copy];
    if (Math.random() < 0.9) G.parts.push({ x: this.cx, y: this.y + 12, tx: h.x, ty: h.y, life: 0.35, max: 0.35, col: Math.random() < 0.5 ? '#f2c45a' : m.glow, seek: true, s: 1 });
    G.copyProgress = this.copyT / 2.6;
    G.copyMark = this.d.copy;
    if (this.copyT >= 2.6) {
      this.copyT = 0; G.copyProgress = 0; Audio2.setHum(false);
      G.gainMark(this.d.copy);
      Audio2.sfx('copy'); G.shake(3);
      burst(p.cx, p.cy, 30, ['#f2c45a', m.glow, '#ffffff'], 100, 0.8);
      G.runScript(SCRIPTS[this.d.copy === 'energia' ? 'copiedEnergia' : 'copiedTemperatura']);
    }
  }
  release() { if (this.copyT > 0) { this.copyT = 0; G.copyProgress = 0; Audio2.setHum(false); } }
  talk() {
    G.save.flags[this.fkey] = true;
    G.runScript(SCRIPTS[this.d.script], () => { if (this.d.leave) this.leaving = true; });
  }
  update(dt) {
    this.t += dt;
    const p = G.player;
    if (this.leaving) {
      const dir = this.d.leaveDir || 1;
      this.face = dir; this.x += 150 * dir * dt; this.runT = (this.runT || 0) + dt;
      if (this.x > G.room.W * T + 20 || this.x < -30) this.dead = true;
      return;
    }
    if (Math.abs(p.cx - this.cx) > 6) this.face = sign(p.cx - this.cx);
    const key = this.fkey;
    if (this.hiddenNow || this.racing) return;
    if (this.d.auto && !G.save.flags[key] && Math.abs(p.cx - this.cx) < this.d.auto && Math.abs(p.cy - this.cy) < 40 && !G.cine) this.talk();
  }
  pose() {
    if (this.leaving) return MOVE.run(Math.floor(this.runT * 12.5) % 6);
    if (this.d.sit && !G.player.has('energia')) return { ...MOVE.crouch(), blink: false, scarf: undefined };
    if (['iker', 'desconocido', 'narbaiza', 'edurne'].includes(this.who)) return IDLE[this.who](this.t);
    return BASE_IDLE(this.t, this.d.x);
  }
  draw(c) {
    if (this.hiddenNow || this.racing) return;
    const pose = { ...this.pose() };
    if (this.copyT > 0) { pose.armF = [6, -1]; pose.armGlow = PLAYER_MARKS[this.d.copy].glow; }
    const spr = sprite('npc-' + this.who, this.ch, pose);
    drawSprite(c, spr, this.cx - 12, this.y + this.h - 31, this.face < 0);
    const x = Math.round(this.x), y = Math.round(this.y);
    if (this.who === 'desconocido' && Math.random() < 0.4) { const r = Math.random; c.fillStyle = r() < 0.5 ? '#9fd0ff' : '#2f8bff'; c.fillRect(x - 4 + Math.floor(r() * 18), y + Math.floor(r() * 26), 1, 1); }
    if (this.d.chained && !G.save.flags.grilletes) {
      c.fillStyle = '#6a6a7a';
      for (let i = 0; i < 6; i++) { c.fillRect(x - 3 - i * 3, y + 6 - Math.floor(i / 2), 2, 1); c.fillRect(x + 10 + i * 3, y + 6 - Math.floor(i / 2), 2, 1); }
    }
  }
}

// ------------------------------------------------------------------ Grillete cargado de rayo (taller)
class Grillete extends Ent {
  constructor(d) { super(d); this.w = 10; this.h = 14; this.x += 3; this.y += 4; this.hp = 2; if (G.save.flags['gr_' + d.id] || G.save.flags.grilletes) this.dead = true; }
  onShot(p) {
    if (p.type !== 'bolt' && p.type !== 'charged') { Audio2.sfx('block'); return; }
    this.hp -= p.dmg; Audio2.sfx('hit'); burst(this.cx, this.cy, 6, ['#9fd0ff', '#ffffff'], 50);
    G.alarm('hit');
    if (this.hp <= 0) {
      this.dead = true; G.save.flags['gr_' + this.d.id] = true; Audio2.sfx('break');
      burst(this.cx, this.cy, 16, ['#6a6a7a', '#9fd0ff', '#ffffff'], 80, 0.6, 200);
      if (G.save.flags.gr_g1 && G.save.flags.gr_g2) { G.save.flags.grilletes = true; floatText(this.cx, this.y - 10, 'Unai es libre', '#2ee6d6'); }
    }
  }
  update(dt) { this.t += dt; }
  draw(c) {
    const x = Math.round(this.x), y = Math.round(this.y);
    c.fillStyle = '#4a4a5a'; c.fillRect(x, y + 2, 10, 9); c.fillStyle = '#6a6a7a'; c.fillRect(x + 2, y, 6, 3); c.fillStyle = '#1a1a22'; c.fillRect(x + 4, y + 5, 2, 3);
    c.fillStyle = Math.sin(this.t * 25) > 0 ? '#9fd0ff' : '#2f8bff'; c.fillRect(x + 1, y + 3, 1, 7); c.fillRect(x + 8, y + 3, 1, 7);
  }
}

// ------------------------------------------------------------------ Carro de rayo y Anclas
class CarroRayo extends Ent {
  constructor(d) {
    super(d); this.w = 40; this.h = 22; this.feetAt(d.y); this.charge = G.save.flags.ancla1 ? 100 : 0;
    this.vx = 0; this.started = false; this.glowCol = '#9fd0ff'; this.wave = 0; this.spawnT = 2;
    if (G.save.flags.ancla1) this.x = 37 * T;
  }
  get prompt() { return G.save.flags.ancla1 || this.launched ? null : 'Pasar Energía al carro (mantén)'; }
  get hold() { return G.save.flags.ancla1 || this.launched ? null : this.feed; }
  feed(dt) {
    const S = G.save;
    if (S.bars.energia <= 0) { if (Math.random() < 0.05) floatText(G.player.cx, G.player.y - 8, 'sin Energía', '#9fd0ff'); return; }
    const n = Math.min(S.bars.energia, 40 * dt, 100 - this.charge);
    S.bars.energia -= n; this.charge += n;
    Audio2.setHum(true, 120 + this.charge * 3);
    const h = G.player.hand();
    if (Math.random() < 0.8) G.parts.push({ x: h.x, y: h.y, tx: this.cx, ty: this.y + 6, life: 0.3, max: 0.3, col: Math.random() < 0.5 ? '#9fd0ff' : '#ffffff', seek: true, s: 1 });
    if (!this.started) { this.started = true; Audio2.setMusic('ancla'); G.room.alarm = true; G.toast('¡El Ancla zumba! Vienen los Acólitos'); for (const e of G.ents) if (e.pdc) e.hostile = true; }
    if (this.charge >= 100) this.launch();
  }
  release() { Audio2.setHum(false); }
  launch() { this.launched = true; Audio2.setHum(false); Audio2.sfx('charge'); G.toast('¡Rosa suelta el carro!'); }
  update(dt) {
    this.t += dt;
    if (this.started && !this.launched && !G.save.flags.ancla1) {
      this.spawnT -= dt;
      const alive = G.ents.filter((e) => e.enemy && !e.dead).length;
      if (this.spawnT <= 0 && alive < 3) {
        const side = Math.random() < 0.5 ? 3 : 44;
        G.spawn({ type: 'acolito', x: side, y: 20, spawned: true });
        this.spawnT = 5 + Math.random() * 3;
      }
    }
    if (this.launched && !G.save.flags.ancla1) {
      this.vx = Math.min(420, this.vx + 260 * dt);
      this.x += this.vx * dt;
      if (Math.random() < 0.9) burst(this.x + 4, this.y + this.h, 2, ['#9fd0ff', '#ffffff', '#ffd23a'], 60, 0.3, 200);
      const anc = G.ents.find((e) => e instanceof Ancla);
      if (anc && this.x + this.w >= anc.x) { anc.shatter(); this.vx = 0; }
    }
  }
  draw(c) {
    const x = Math.round(this.x), y = Math.round(this.y);
    // Raíles
    c.fillStyle = '#5a4a4a'; c.fillRect(0, y + this.h - 1, G.room.W * T, 1);
    for (let i = 0; i < G.room.W * T; i += 8) c.fillRect(i, y + this.h, 3, 1);
    c.fillStyle = '#3a2e3e'; c.fillRect(x, y + 4, this.w, 14);
    c.fillStyle = '#7a5a4a'; c.fillRect(x, y + 4, this.w, 2);
    c.fillStyle = '#b5544a'; c.fillRect(x + 2, y + 8, this.w - 4, 6);
    c.fillStyle = '#1a1622'; for (const wx of [6, this.w - 10]) c.fillRect(x + wx, y + 17, 5, 5);
    c.fillStyle = '#1b1b26'; c.fillRect(x + 18, y - 6, 2, 10);
    // Barra de carga en el lateral
    c.fillStyle = '#0b0a17'; c.fillRect(x + 4, y + 9, this.w - 8, 4);
    c.fillStyle = Math.floor(this.t * 10) % 2 ? '#9fd0ff' : '#2f8bff'; c.fillRect(x + 4, y + 9, Math.round((this.w - 8) * this.charge / 100), 4);
    if (this.charge > 0) { c.fillStyle = '#9fd0ff'; c.fillRect(x + 16 + (Math.floor(this.t * 20) % 3) * 2, y - 8, 2, 2); }
  }
}
class Ancla extends Ent {
  constructor(d) {
    super(d); this.w = 24; this.h = 52; this.x -= 4; this.feetAt(d.y); this.n = d.n;
    this.broken = !!G.save.flags['ancla' + d.n]; this.hits = 0; this.last = null; this.spawnT = 3; this.started = false;
  }
  hitbox() { return { x: this.x + 4, y: this.y + 8, w: 16, h: 40 }; }
  onShot(p) {
    if (this.broken) return;
    if (this.n !== 2) { Audio2.sfx('block'); burst(p.cx, p.cy, 4, ['#ffb547'], 40); return; }
    const el = p.type === 'fire' || p.type === 'flame' ? 'fire' : p.type === 'ice' ? 'ice' : null;
    if (!el) { Audio2.sfx('block'); floatText(this.cx, this.y - 6, 'necesita frío y calor', '#ffb547'); return; }
    if (!this.started) { this.started = true; Audio2.setMusic('ancla'); G.room.alarm = true; G.toast('El Ancla se defiende'); }
    if (el !== this.last) { this.hits++; this.last = el; Audio2.sfx('break'); G.shake(2); burst(p.cx, p.cy, 10, el === 'fire' ? ['#ff8a2a', '#ffd23a'] : ['#b8fff7', '#2ee6d6'], 70); floatText(this.cx, this.y - 8, `grieta ${this.hits}/6`, '#ffe0a8'); }
    else { Audio2.sfx('block'); floatText(this.cx, this.y - 8, el === 'fire' ? 'ahora frío' : 'ahora calor', '#ffb547'); }
    if (this.hits >= 6) this.shatter();
  }
  shatter() {
    if (this.broken) return;
    this.broken = true;
    G.save.flags['ancla' + this.n] = true;
    Audio2.sfx('veil'); G.shake(8); G.whiteFlash = 0.6;
    burst(this.cx, this.cy, 60, ['#ffb547', '#ffe0a8', '#f2c45a', '#ffffff'], 140, 1.2, 100);
    for (const e of G.ents) if (e.enemy && !e.dead && !e.pdc) e.damage(99, this.cx);
    G.room.alarm = false;
    for (const e of G.ents) if (e.pdc) e.hostile = false;
    G.openVeils();
    Audio2.setMusic(G.room.def.music);
    G.delay(0.9, () => G.runScript(SCRIPTS['anclaRota' + this.n]));
  }
  update(dt) {
    this.t += dt;
    if (this.n === 2 && this.started && !this.broken) {
      this.spawnT -= dt;
      const alive = G.ents.filter((e) => e.enemy && !e.dead).length;
      if (this.spawnT <= 0 && alive < 3) {
        const pick = Math.random();
        if (pick < 0.7) G.spawn({ type: 'acolito', x: 10 + Math.floor(Math.random() * 18), y: 5, spawned: true });
        else G.spawn({ type: 'reforzado', x: 9, y: 12, hostile: true });
        this.spawnT = 4.5 + Math.random() * 2;
      }
    }
  }
  draw(c) {
    const x = Math.round(this.x), y = Math.round(this.y), t = this.t;
    c.fillStyle = '#3a3036'; c.fillRect(x, y + 44, 24, 8); c.fillStyle = '#5a4a52'; c.fillRect(x, y + 44, 24, 1);
    if (this.broken) {
      c.fillStyle = '#6a4a24'; c.fillRect(x + 6, y + 36, 4, 8); c.fillRect(x + 13, y + 38, 5, 6); c.fillRect(x + 9, y + 40, 4, 4);
      return;
    }
    // Rayo hacia el cielo (sostiene el velo)
    for (let yy = y; yy > 0; yy -= 3) { c.fillStyle = Math.sin(t * 6 + yy * 0.2) > 0 ? '#ffb547' : 'rgba(255,181,71,0.35)'; c.fillRect(x + 11, yy, 2, 2); }
    const pulse = Math.sin(t * 4) * 0.5 + 0.5;
    c.fillStyle = `rgba(255,181,71,${0.15 + pulse * 0.1})`; c.fillRect(x - 8, y - 4, 40, 56);
    c.fillStyle = '#8a5a24'; c.fillRect(x + 4, y + 10, 16, 34);
    c.fillStyle = '#ffb547'; c.fillRect(x + 6, y + 6, 12, 36); c.fillRect(x + 9, y, 6, 6);
    c.fillStyle = '#ffe0a8'; c.fillRect(x + 8, y + 8, 3, 28);
    // Hexágonos que laten
    for (let j = 0; j < 5; j++) for (let i = 0; i < 2; i++) if (Math.sin(t * 3 + j + i * 2) > 0.3) { c.fillStyle = '#fff1b8'; c.fillRect(x + 8 + i * 5 + (j % 2) * 2, y + 10 + j * 6, 2, 1); }
    // Grietas
    c.fillStyle = '#3a1a0a';
    for (let k = 0; k < this.hits; k++) { const yy = y + 10 + k * 5; c.fillRect(x + 7 + (k % 2) * 5, yy, 5, 1); c.fillRect(x + 9 + (k % 3), yy + 1, 1, 3); }
    if (this.n === 2 && this.started) {
      c.fillStyle = this.last === 'fire' ? '#2ee6d6' : '#ff8a2a';
      c.fillRect(x + 10, y - 8, 4, 4);
    }
  }
}

// ------------------------------------------------------------------ Objetos y eventos
class Naipe extends Ent {
  constructor(d) { super(d); this.w = 24; this.h = 16; this.x -= 4; this.taken = !!G.save.flags.naipe; this.glowCol = '#f2c45a'; }
  get prompt() { return this.taken ? null : 'Mirar los naipes'; }
  get press() { return this.taken ? null : () => { this.taken = true; G.runScript(SCRIPTS.naipe); }; }
  update(dt) { this.t += dt; }
  draw(c) {
    const x = Math.round(this.x), y = Math.round(this.y);
    for (let i = 0; i < 5; i++) {
      if (i === 2 && this.taken) continue;
      const cx = x + 1 + i * 5, gold = i === 2;
      c.fillStyle = gold ? '#f2c45a' : '#4a4656'; c.fillRect(cx, y + 4 - (gold ? 2 : 0), 4, 7);
      c.fillStyle = gold ? '#fff1b8' : '#6a6676'; c.fillRect(cx + 1, y + 5 - (gold ? 2 : 0), 2, 1);
    }
    if (!this.taken) {
      c.fillStyle = `rgba(242,196,90,${0.2 + Math.sin(this.t * 4) * 0.1})`; c.fillRect(x + 4, y - 6, 16, 20);
      if (Math.random() < 0.1) G.parts.push({ x: x + 12, y: y + 3, vx: (Math.random() - 0.5) * 20, vy: -20, life: 0.8, max: 0.8, col: '#ffe7a3', g: 0, s: 1 });
    }
  }
}
class Pagina extends Ent {
  constructor(d) { super(d); this.id = d.id || 'p1'; this.w = 10; this.h = 12; this.x += 3; this.baseY = this.y + 2; if (G.save.pages.includes(this.id)) this.dead = true; }
  update(dt) {
    this.t += dt; this.y = this.baseY + Math.sin(this.t * 3) * 2;
    if (overlap(this, G.player)) {
      this.dead = true; G.save.pages.push(this.id); Audio2.sfx('pickup');
      burst(this.cx, this.cy, 14, ['#ffe7a3', '#f2c45a', '#ffffff'], 60);
      const [title, txt] = PAGES[this.id];
      G.runScript([['card', title, `${G.save.pages.length} de ${Object.keys(PAGES).length} páginas`, txt, 'pagina']]);
    }
  }
  draw(c) {
    const x = Math.round(this.x), y = Math.round(this.y);
    c.fillStyle = 'rgba(242,196,90,0.25)'; c.fillRect(x - 3, y - 3, 16, 18);
    c.fillStyle = '#e8dcc0'; c.fillRect(x, y, 10, 12); c.fillStyle = '#b8a888'; c.fillRect(x + 7, y, 3, 3);
    c.fillStyle = '#6a5a4a'; for (let i = 0; i < 4; i++) c.fillRect(x + 2, y + 3 + i * 2, i === 3 ? 4 : 6, 1);
  }
}
class Hint extends Ent {
  update(dt) {
    const p = G.player;
    const near = Math.abs(p.cx - this.cx) < 56 && Math.abs(p.cy - this.cy) < 48;
    this.a = clamp((this.a || 0) + (near ? dt * 4 : -dt * 3), 0, 1);
    if (this.a > 0) G.hints.push({ text: this.d.text, a: this.a, x: this.cx, y: this.y - 8 });
  }
}
class Trigger extends Ent {
  constructor(d) { super(d); this.w = (d.w || 1) * T; this.h = (d.h || 1) * T; }
  update() {
    const key = 'trg_' + G.room.def.id + this.d.x + '_' + this.d.y;
    if (this.done || G.cine) return;
    if (this.d.once && G.save.flags[key]) return;
    if (overlap(this, G.player)) {
      this.done = true; if (this.d.once) G.save.flags[key] = true;
      G.runScript(SCRIPTS[this.d.script]);
    }
  }
}
class Zip extends Ent {
  constructor(d) {
    super(d);
    this.x1 = d.x * T + 8; this.y1 = d.y * T; this.x2 = d.x2 * T + 8; this.y2 = d.y2 * T;
    this.len = Math.hypot(this.x2 - this.x1, this.y2 - this.y1);
  }
  update(dt) {
    const p = G.player;
    if (p.zipCool > 0) { p.zipCool -= dt; return; }
    if (p.state !== 'normal' || p.onGround) return;
    const hx = p.cx, hy = p.y - 2;
    const t = clamp(((hx - this.x1) * (this.x2 - this.x1) + (hy - this.y1) * (this.y2 - this.y1)) / (this.len * this.len), 0, 1);
    const lx = this.x1 + (this.x2 - this.x1) * t, ly = this.y1 + (this.y2 - this.y1) * t;
    if (Math.hypot(hx - lx, hy - ly) < 8 && t < 0.95) {
      p.state = 'zip'; p.zip = { x1: this.x1, y1: this.y1, x2: this.x2, y2: this.y2, len: this.len, t }; p.zipV = Math.max(80, Math.abs(p.vx));
      p.combo('Tirolina');
      Audio2.sfx('vault');
    }
  }
  draw(c) {
    c.fillStyle = '#c9a46a';
    const n = Math.ceil(this.len / 2);
    for (let i = 0; i <= n; i++) c.fillRect(Math.round(this.x1 + (this.x2 - this.x1) * i / n), Math.round(this.y1 + (this.y2 - this.y1) * i / n), 1, 1);
    c.fillStyle = '#5a4a3a'; c.fillRect(Math.round(this.x1) - 1, Math.round(this.y1) - 2, 3, 4);
  }
}
class Lightning extends Ent {
  constructor(d) { super(d); this.cool = 2; this.warn = 0; this.strike = 0; }
  update(dt) {
    if (G.cine) return;
    const p = G.player;
    if (this.strike > 0) { this.strike -= dt; return; }
    if (this.warn > 0) {
      this.warn -= dt;
      if (this.warn <= 0) {
        this.strike = 0.18; G.whiteFlash = 0.25; Audio2.sfx('thunder'); G.shake(5);
        if (Math.abs(p.cx - this.sx) < 14) p.hurt(1, this.sx);
        burst(this.sx, this.sy, 16, ['#ffffff', '#9fd0ff', '#2f8bff'], 90, 0.5, 200);
      }
      return;
    }
    this.cool -= dt;
    if (this.cool <= 0 && p.cx > this.d.x * T && p.cx < (this.d.x + this.d.w) * T) {
      this.sx = p.cx + p.vx * 0.5 + (Math.random() - 0.5) * 40;
      let ty = 0; while (ty < G.room.H && !solidAt(Math.floor(this.sx / T), ty)) ty++;
      this.sy = ty * T; this.warn = 0.9; this.cool = 2.2 + Math.random() * 1.5;
    }
  }
  draw(c) {
    if (this.warn > 0 && Math.floor(this.warn * 14) % 2) { c.fillStyle = 'rgba(159,208,255,0.6)'; c.fillRect(Math.round(this.sx) - 8, this.sy - 2, 16, 2); }
    if (this.strike > 0) {
      let x = this.sx;
      for (let y = 0; y < this.sy; y += 6) {
        const nx = this.sx + (Math.random() - 0.5) * 12;
        c.fillStyle = '#ffffff'; c.fillRect(Math.round(Math.min(x, nx)), y, Math.max(2, Math.round(Math.abs(nx - x))), 6);
        c.fillStyle = '#9fd0ff'; c.fillRect(Math.round(nx) - 1, y, 1, 6);
        x = nx;
      }
    }
  }
}
// Carro de presos volcado (decorado del bosque)
class Carro extends Ent {
  draw(c) {
    const x = Math.round(this.x) - 16, y = Math.round(this.y) - 4;
    c.fillStyle = '#2a2420'; c.fillRect(x, y + 4, 34, 16);
    c.fillStyle = '#4a3a2e'; c.fillRect(x, y + 4, 34, 2);
    c.fillStyle = '#1a1622'; for (let i = 0; i < 5; i++) c.fillRect(x + 4 + i * 6, y + 7, 2, 10);
    c.fillStyle = '#3a3036'; c.fillRect(x + 30, y + 14, 8, 8); c.fillStyle = '#1a1622'; c.fillRect(x + 32, y + 16, 4, 4);
    c.fillStyle = '#1f2a44'; c.fillRect(x + 8, y + 1, 18, 3);
  }
}
class Spawner extends Ent {
  update() {
    if (this.done || !G.save.flags[this.d.flag]) return;
    this.done = true;
    for (const [type, x, y, props] of this.d.list) G.spawn({ type, x, y, hostile: true, ...(props || {}) });
  }
}
class Gate extends Ent {}
class Exit extends Trigger {}

// ------------------------------------------------------------------ Escondites: agachado dentro, nadie te ve
class Escondite extends Ent {
  constructor(d) { super(d); this.w = (d.w || 1) * T; this.h = 2 * T; this.y -= T; this.kind = d.kind || 'barril'; }
  update(dt) { this.t += dt; }
  draw(c) {
    const x = Math.round(this.x), y = Math.round(this.y), on = G.player.hidden && overlap(G.player, this);
    if (this.kind === 'cortina') {
      for (let i = 0; i < this.w; i += 2) { c.fillStyle = (i / 2) % 2 ? '#5a1a2a' : '#7a2a3a'; c.fillRect(x + i, y + 2, 2, this.h - 2 + Math.round(Math.sin(this.t * 2 + i) * 0.6)); }
      c.fillStyle = '#b88a4a'; c.fillRect(x - 1, y, this.w + 2, 2);
      c.fillStyle = '#d8b060'; for (let i = 1; i < this.w; i += 3) c.fillRect(x + i, y + this.h - 1, 1, 2);
    } else {
      for (let k = 0; k < this.w / T; k++) {
        const bx = x + k * T;
        c.fillStyle = '#4a3020'; c.fillRect(bx + 1, y + 6, 14, 26);
        c.fillStyle = '#6a4a30'; c.fillRect(bx + 2, y + 6, 12, 26);
        c.fillStyle = '#2a2a30'; c.fillRect(bx + 1, y + 10, 14, 2); c.fillRect(bx + 1, y + 26, 14, 2);
        c.fillStyle = '#8a6a48'; c.fillRect(bx + 3, y + 7, 2, 24);
      }
    }
    if (on) { c.fillStyle = 'rgba(255,240,200,0.5)'; c.fillRect(x + this.w / 2 - 1, y - 6, 2, 2); }
  }
}
// Meta de una carrera contrarreloj
class Meta extends Ent {
  constructor(d) { super(d); this.w = 2 * T; this.h = 3 * T; this.y -= 2 * T; }
  update(dt) {
    this.t += dt;
    if (G.race && G.race.id === this.d.id && overlap(this, G.player)) G.raceWin();
  }
  draw(c) {
    if (!G.race || G.race.id !== this.d.id) return;
    const x = Math.round(this.x) + 8, y = Math.round(this.y);
    c.fillStyle = '#3a3036'; c.fillRect(x, y, 2, 48);
    for (let j = 0; j < 4; j++) for (let i = 0; i < 6; i++) { c.fillStyle = (i + j) % 2 ? '#f3ead8' : '#1a1622'; c.fillRect(x + 2 + i * 2 + Math.round(Math.sin(this.t * 6 + i) * 0.8), y + 1 + j * 2, 2, 2); }
  }
}
// Lauburu de latón: +1 de vida máxima
const LAUBURU = ['..###....', '.#####...', '.###.#...', '..#.##.##', '..####.##', '##.###...', '##.#..###', '...#.####', '....###..'];
function drawLauburu(c, x, y, col = '#f2c45a', sh = '#8a6a20') {
  LAUBURU.forEach((r, j) => [...r].forEach((ch, i) => { if (ch === '#') { c.fillStyle = sh; c.fillRect(x + i + 1, y + j + 1, 1, 1); } }));
  LAUBURU.forEach((r, j) => [...r].forEach((ch, i) => { if (ch === '#') { c.fillStyle = col; c.fillRect(x + i, y + j, 1, 1); } }));
}
class Lauburu extends Ent {
  constructor(d) { super(d); this.w = 10; this.h = 10; this.x += 3; this.baseY = this.y + 3; if (G.save.flags['lb_' + d.id]) this.dead = true; }
  update(dt) {
    this.t += dt; this.y = this.baseY + Math.sin(this.t * 2.5) * 2;
    if (Math.random() < 0.08) G.parts.push({ x: this.cx + (Math.random() - 0.5) * 10, y: this.cy, vx: 0, vy: -14, life: 0.7, max: 0.7, col: '#ffe7a3', g: 0, s: 1 });
    if (overlap(this, G.player)) { this.dead = true; G.gainLauburu(this.d.id); }
  }
  draw(c) {
    const x = Math.round(this.x), y = Math.round(this.y);
    c.fillStyle = `rgba(242,196,90,${0.18 + Math.sin(this.t * 3) * 0.08})`; c.fillRect(x - 4, y - 4, 18, 18);
    drawLauburu(c, x, y);
  }
}
// Objetos de los recados: el gato de la panadera, la red de la cofa
class Item extends Ent {
  constructor(d) { super(d); this.w = 12; this.h = 10; this.x += 2; this.feetAt(d.y); if (G.save.flags[d.flag]) this.dead = true; this.glowCol = '#f2c45a'; }
  get prompt() { return this.d.prompt; }
  press() { this.dead = true; G.save.flags[this.d.flag] = true; Audio2.sfx('pickup'); burst(this.cx, this.cy, 10, ['#ffe7a3', '#ffffff'], 40); if (this.d.script) G.runScript(SCRIPTS[this.d.script]); }
  update(dt) { this.t += dt; }
  draw(c) {
    const x = Math.round(this.x), y = Math.round(this.y), t = this.t;
    if (this.d.kind === 'gato') {
      const tail = Math.round(Math.sin(t * 3) * 1.5);
      c.fillStyle = '#1a1418'; c.fillRect(x + 2, y + 4, 8, 6); c.fillRect(x + 7, y + 1, 5, 5);
      c.fillRect(x + 7, y, 1, 1); c.fillRect(x + 11, y, 1, 1); c.fillRect(x, y + 3 + tail, 2, 5);
      c.fillStyle = Math.floor(t * 0.7) % 4 ? '#c8e84a' : '#1a1418'; c.fillRect(x + 8, y + 2, 1, 1); c.fillRect(x + 10, y + 2, 1, 1);
    } else {
      c.fillStyle = '#6a5a3a'; c.fillRect(x, y + 3, 12, 7);
      c.fillStyle = '#a89068'; for (let i = 0; i < 12; i += 2) c.fillRect(x + i, y + 3 + (i % 4 ? 1 : 3), 1, 1);
      c.fillStyle = '#c8b088'; c.fillRect(x + 1, y + 3, 10, 1);
    }
  }
}
// Decorado sin colisión: fuente, puestos del mercado, casa de la abuela, barcos
class Decor extends Ent {
  draw(c) {
    const x = Math.round(this.x), y = Math.round(this.y) + T, t = G.t;
    switch (this.d.kind) {
      case 'fuente':
        c.fillStyle = '#8a8478'; c.fillRect(x - 16, y - 10, 48, 10); c.fillStyle = '#a8a294'; c.fillRect(x - 16, y - 10, 48, 2);
        c.fillStyle = '#7a7468'; c.fillRect(x + 5, y - 28, 6, 18); c.fillRect(x - 2, y - 30, 20, 3);
        c.fillStyle = '#6ab0d8'; for (let i = 0; i < 6; i++) c.fillRect(x + 7 + Math.round(Math.sin(t * 4 + i) * 6), y - 30 + ((t * 30 + i * 5) % 20), 1, 2);
        c.fillStyle = '#4a8ab8'; c.fillRect(x - 14, y - 8, 44, 3);
        break;
      case 'puesto': {
        const col = this.d.col || '#b5544a';
        c.fillStyle = '#5a4030'; c.fillRect(x, y - 28, 2, 28); c.fillRect(x + 38, y - 28, 2, 28);
        for (let i = 0; i < 40; i += 4) { c.fillStyle = (i / 4) % 2 ? col : '#e8e0d0'; c.fillRect(x + i, y - 32, 4, 6); }
        c.fillStyle = '#7a5a3a'; c.fillRect(x - 2, y - 12, 44, 4); c.fillStyle = '#5a4030'; c.fillRect(x, y - 8, 40, 8);
        const goods = this.d.goods || ['#d8a050', '#c88040'];
        for (let i = 0; i < 6; i++) { c.fillStyle = goods[i % goods.length]; c.fillRect(x + 3 + i * 6, y - 15, 5, 3); }
        break;
      }
      case 'casa': {
        const w = (this.d.w || 6) * T, h = (this.d.h || 5) * T;
        c.fillStyle = '#e8dcc8'; c.fillRect(x, y - h, w, h);
        c.fillStyle = '#a84a3a'; for (let i = -4; i < w + 4; i += 4) c.fillRect(x + i, y - h - 8 + Math.abs(i - w / 2) / (w / 2) * 2, 4, 8);
        // Una fila de ventanas con contraventanas verdes por cada piso
        for (let fy = y - h + 6; fy < y - 34; fy += 48) {
          c.fillStyle = '#6a3a2a'; for (let i = 8; i < w - 8; i += 24) { c.fillRect(x + i, fy + 4, 10, 2); c.fillRect(x + i, fy, 2, 12); c.fillRect(x + i + 8, fy, 2, 12); }
          c.fillStyle = '#3a5a4a'; for (let i = 10; i < w - 10; i += 24) { c.fillRect(x + i + 2, fy + 2, 6, 10); }
          if (fy > y - h + 30) { c.fillStyle = 'rgba(90,60,40,0.35)'; c.fillRect(x, fy - 8, w, 2); }
        }
        c.fillStyle = '#5a3a2a'; c.fillRect(x + w / 2 - 6, y - 22, 12, 22); c.fillStyle = '#c8a050'; c.fillRect(x + w / 2 + 3, y - 12, 1, 1);
        break;
      }
      case 'barco': {
        c.fillStyle = '#5a3a2a'; c.fillRect(x, y - 6, 60, 6); c.fillStyle = this.d.col || '#3e7cb1'; c.fillRect(x + 2, y - 10, 56, 4);
        break;
      }
      case 'mastil': {
        const h = (this.d.h || 8) * T;
        c.fillStyle = '#5a3a2a'; c.fillRect(x + 7, y - h, 2, h);
        c.fillStyle = 'rgba(232,224,208,0.85)'; c.beginPath(); c.moveTo(x + 10, y - h + 10); c.lineTo(x + 10 + 18 + Math.sin(t) * 2, y - h / 2); c.lineTo(x + 10, y - 20); c.closePath(); c.fill();
        break;
      }
      case 'atalaya':
        c.fillStyle = '#4a3a2a'; c.fillRect(x + 1, y - 112, 2, 112); c.fillRect(x + 77, y - 112, 2, 112);
        for (let k = 0; k < 6; k++) { c.fillStyle = '#3a2a1e'; c.fillRect(x + 1, y - 16 - k * 18, 78, 1); }
        c.fillStyle = '#1f2a44'; c.fillRect(x + 30, y - 132, 20, 6);
        break;
      case 'chimenea': {
        const h = (this.d.h || 2) * T;
        c.fillStyle = '#4a3644'; c.fillRect(x + 4, y - h, 8, h); c.fillStyle = '#5a4252'; c.fillRect(x + 3, y - h - 1, 10, 2);
        for (let i = 0; i < 3; i++) { c.fillStyle = 'rgba(180,170,190,0.25)'; c.fillRect(x + 5 + Math.round(Math.sin(t + i) * 3), y - h - 6 - ((t * 10 + i * 8) % 22), 4, 3); }
        break;
      }
      case 'cuerda': {
        // Cuerda de tender con ropa, entre dos puntos (solo decorado)
        const w = (this.d.w || 6) * T, sag = 6;
        for (let i = 0; i <= w; i += 2) { c.fillStyle = '#c9b48a'; c.fillRect(x + i, y - 30 + Math.round(Math.sin(i / w * Math.PI) * sag), 1, 1); }
        const cols = ['#e8e0d0', '#3e7cb1', '#c84a3a', '#c9a24a', '#5a8a4a'];
        for (let i = 8, k = 0; i < w - 6; i += 12, k++) { const yy = y - 29 + Math.round(Math.sin(i / w * Math.PI) * sag); c.fillStyle = cols[k % cols.length]; c.fillRect(x + i + Math.round(Math.sin(t * 2 + i) * 0.6), yy, 6, 7 + (k % 2) * 2); }
        break;
      }
      case 'antorcha':
        c.fillStyle = '#3a2a1e'; c.fillRect(x + 7, y - 26, 2, 8);
        for (let i = 0; i < 4; i++) { c.fillStyle = i % 2 ? '#ffd23a' : '#ff8a2a'; c.fillRect(x + 6 + (i % 2), y - 30 - ((t * 20 + i * 3) % 6), 3, 3); }
        c.fillStyle = 'rgba(255,160,60,0.12)'; c.fillRect(x - 8, y - 44, 32, 30);
        break;
      case 'farola':
        c.fillStyle = '#1b1b26'; c.fillRect(x + 7, y - 40, 2, 40); c.fillRect(x + 7, y - 40, 8, 2);
        c.fillStyle = '#2a2a3a'; c.fillRect(x + 12, y - 38, 6, 5); c.fillStyle = Math.sin(t * 9) > -0.6 ? '#ffd48a' : '#c89a50'; c.fillRect(x + 13, y - 37, 4, 3);
        c.fillStyle = 'rgba(255,212,138,0.10)'; c.fillRect(x + 4, y - 34, 22, 34);
        break;
      case 'antena':
        c.fillStyle = '#5a5262'; c.fillRect(x + 7, y - 28, 1, 28); c.fillRect(x + 2, y - 24, 11, 1); c.fillRect(x + 4, y - 18, 7, 1);
        c.fillStyle = Math.floor(t * 1.5) % 2 ? '#ff4a3a' : '#5a1a14'; c.fillRect(x + 7, y - 30, 1, 2);
        break;
      case 'maceta':
        c.fillStyle = '#a84a3a'; c.fillRect(x + 4, y - 6, 8, 6); c.fillStyle = '#4a8a3a'; c.fillRect(x + 3, y - 11, 10, 5); c.fillStyle = '#c84a6a'; c.fillRect(x + 5, y - 12, 2, 2); c.fillRect(x + 9, y - 11, 2, 2);
        break;
      case 'cartel': {
        const txt2 = this.d.text || 'TABERNA';
        c.fillStyle = '#3a2a1e'; c.fillRect(x, y - 30, 2, 12); c.fillStyle = '#5a3a24'; c.fillRect(x + 2, y - 28, txt2.length * 4 + 4, 9);
        c.fillStyle = '#e0c890'; for (let i = 0; i < txt2.length; i++) if (txt2[i] !== ' ') c.fillRect(x + 4 + i * 4, y - 26 + (i % 2), 3, 4);
        break;
      }
      case 'arbol': {
        const h = (this.d.h || 5) * T;
        c.fillStyle = '#2a2016'; c.fillRect(x + 6, y - h, 5, h);
        c.fillStyle = this.d.col || '#1e3a22'; c.fillRect(x - 10, y - h - 14, 36, 22); c.fillRect(x - 4, y - h - 24, 24, 12);
        c.fillStyle = '#2a4a2a'; c.fillRect(x - 6, y - h - 12, 10, 6); c.fillRect(x + 12, y - h - 18, 8, 5);
        break;
      }
      case 'tienda':
        c.fillStyle = '#4a4a3a'; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 20, y - 26); c.lineTo(x + 40, y); c.closePath(); c.fill();
        c.fillStyle = '#2a2a20'; c.beginPath(); c.moveTo(x + 14, y); c.lineTo(x + 20, y - 12); c.lineTo(x + 26, y); c.closePath(); c.fill();
        c.fillStyle = '#1f2a44'; c.fillRect(x + 18, y - 30, 4, 4);
        break;
      case 'hoguera':
        c.fillStyle = '#3a2a1a'; c.fillRect(x, y - 3, 14, 3);
        for (let i = 0; i < 5; i++) { c.fillStyle = i % 2 ? '#ffd23a' : '#ff8a2a'; c.fillRect(x + 3 + (i * 3) % 8, y - 6 - ((t * 24 + i * 4) % 9), 2, 3); }
        c.fillStyle = 'rgba(255,138,42,0.12)'; c.fillRect(x - 16, y - 30, 46, 30);
        break;
    }
  }
}
// ------------------------------------------------------------------ Búho Mayor: el vigía de latón del convoy
class BuhoMayor extends Enemy {
  constructor(d) {
    super(d);
    this.hp = this.max = 40; this.w = 40; this.h = 26; this.hostile = true; this.state = 'idle'; this.st = 1.5;
    this.face = -1; this.summoned = 0;
    if (G.save.flags.buho) this.dead = true;
  }
  get name() { return 'Búho Mayor · vigía de latón del convoy'; }
  hitbox() { return { x: this.x + 4, y: this.y + 4, w: this.w - 8, h: this.h - 6 }; }
  update(dt) {
    if (!G.save.flags.buho_start) { this.t += dt; this.y = this.d.y * T + Math.sin(this.t * 2) * 3; return; }
    G.boss = this;
    if (!this.common(dt)) { if (this.dying) { this.vy += 300 * dt; this.y += this.vy * dt; if (Math.random() < 0.5) burst(this.cx, this.cy, 2, ['#b88a4a', '#e0b878', '#3ac8ff'], 80); } return; }
    const p = G.player, W = G.room.W * T;
    this.st -= dt;
    const goTo = (tx, ty, sp) => { const dx = tx - this.cx, dy = ty - this.cy, d = Math.hypot(dx, dy); if (d < 3) return true; this.x += dx / d * Math.min(d, sp * dt); this.y += dy / d * Math.min(d, sp * dt); return false; };
    this.face = sign(p.cx - this.cx) || this.face;
    switch (this.state) {
      case 'idle':
        goTo(W / 2 + Math.sin(this.t * 0.7) * W * 0.36, 44 + Math.sin(this.t * 1.9) * 10, 90);
        if (this.st <= 0) {
          if (this.hp < this.max * 0.55 && this.summoned < 2) { this.state = 'summon'; this.st = 0.8; }
          else { this.state = Math.random() < 0.55 ? 'fan' : 'tele'; this.st = 0.6; }
        }
        break;
      case 'fan':
        if (this.st <= 0) {
          for (let i = -2; i <= 2; i++) { const a = Math.atan2(p.cy - this.cy, p.cx - this.cx) + i * 0.22; G.projs.push(new Proj(this.cx, this.cy + 8, Math.cos(a) * 150, Math.sin(a) * 150, 'ebolt')); }
          Audio2.sfx('enemyShot'); this.state = 'idle'; this.st = 1.4 + Math.random();
        }
        break;
      case 'tele':
        this.x += Math.sin(this.t * 60) * 0.6;
        if (this.st <= 0) { this.state = 'dive'; this.dive = { x: p.cx, y: Math.min(p.cy - 6, G.room.H * T - 48) }; Audio2.sfx('dash'); }
        break;
      case 'dive':
        if (goTo(this.dive.x, this.dive.y, 300)) { this.state = 'sweep'; this.sweepX = this.cx < W / 2 ? W - 40 : 40; }
        break;
      case 'sweep':
        if (goTo(this.sweepX, this.dive.y, 260)) { this.state = 'idle'; this.st = 1.6; }
        break;
      case 'summon':
        if (this.st <= 0) {
          for (const k of [-1, 1]) G.spawn({ type: 'vigia', x: Math.floor((this.cx + k * 40) / T), y: 3, hostile: true, patrol: [2, G.room.W - 3] });
          this.summoned++; Audio2.sfx('alert'); floatText(this.cx, this.y - 6, '¡Llama a los vigías!', '#3ac8ff');
          this.state = 'idle'; this.st = 2;
        }
        break;
    }
  }
  damage(n, fromX, type) {
    if (!G.save.flags.buho_start) return;
    super.damage(n, fromX, type);
    this.vx = 0; this.freeze = Math.min(this.freeze, 0.6);
  }
  onDie() {
    G.boss = null; G.save.flags.buho = true;
    burst(this.cx, this.cy, 50, ['#b88a4a', '#e0b878', '#3ac8ff', '#ffffff'], 140, 1.2, 200, 2);
    Audio2.sfx('break'); G.shake(8); G.whiteFlash = 0.4;
    for (const e of G.ents) if (e instanceof Vigia && !e.dead) e.damage(9, this.cx);
    G.delay(1.4, () => G.runScript(SCRIPTS.buho_fin));
  }
  draw(c) {
    const f = this.state === 'dive' || this.state === 'sweep' ? 1 : Math.sin(this.t * 14) > 0 ? 0 : 1;
    const cv = this.flash > 0 ? OWL_HIT[f] : OWL_CV[f];
    const x = Math.round(this.x) - 4, y = Math.round(this.y) - 5;
    c.save();
    c.globalAlpha = this.dying ? Math.max(0, this.dying / 0.6) : 1;
    if (this.face < 0) { c.translate(x + 48, y); c.scale(-1, 1); c.drawImage(cv, 0, 0, 48, 36); }
    else c.drawImage(cv, x, y, 48, 36);
    c.restore();
    if (this.state === 'tele' || this.state === 'fan') { c.fillStyle = Math.floor(this.t * 20) % 2 ? '#ff4a3a' : '#ffd23a'; c.fillRect(x + 14, y + 13, 4, 3); c.fillRect(x + 29, y + 13, 4, 3); }
    if (this.freeze > 0) { c.fillStyle = 'rgba(184,255,247,0.45)'; c.fillRect(x, y, 48, 36); }
  }
}
// ------------------------------------------------------------------ Actores de las escenas animadas
const ACTOR_POSE = {
  idle: null, walk: (a) => MOVE.run(Math.floor(a.t * 8) % 6), run: (a) => MOVE.run(Math.floor(a.t * 13) % 6),
  crouch: () => MOVE.crouch(), kneel: () => MOVE.crouch(), fall: () => MOVE.fall(), jump: () => MOVE.jump(), hurt: () => MOVE.fall(),
  dash: () => MOVE.dash(), roll: () => MOVE.roll(), hang: () => MOVE.hang(), land: () => MOVE.land(), lie: null,
  cast: () => ({ armF: [7, -2], armB: [-2, 5] }), reach: () => ({ armF: [6, -1], armB: [-1, 6] }), armsup: () => ({ armF: [1, -7], armB: [-1, -7] }),
  point: () => ({ armF: [7, -4], armB: [-1, 6] }), carry: () => ({ ...MOVE.run(0), armF: [4, -1], armB: [4, 0] }),
};
class Actor extends Ent {
  constructor(d) {
    super(d);
    this.id = d.id; this.key = d.ch; this.actor = true; this.t = 0;
    this.w = 10; this.h = 26;
    this.x = d.px != null ? d.px : d.x * T + 3;
    if (d.py != null) this.y = d.py - this.h; else this.feetAt(d.y);
    this.face = d.face || 1; this.mode = d.mode || 'idle'; this.alpha = d.alpha ?? 1; this.fadeV = 0; this.tx = null; this.speed = 60;
    this.glow = d.glow || null; this.rot = 0;
    if (this.key === 'carro') { this.w = 44; this.y -= 2; }
  }
  update(dt) {
    this.t += dt;
    // Ruta propia (p. ej. el corredor de la carrera): no bloquea al jugador
    if (this.route && !this.jump && !this.fly && this.tx == null) {
      const s = this.route.shift();
      if (!s) this.route = null;
      else if (s.arrive) { this.route = null; G.raceArrive(); }
      else if (s.jump != null) {
        this.face = sign(s.jump) || this.face; this.mode = 'jump';
        this.jump = { x0: this.x, y0: this.y, x1: this.x + s.jump * T, y1: this.y + (s.dy || 0) * T, h: (s.h || 1) * T, t: 0, dur: s.dur || 0.5, after: 'run' };
      } else {
        this.speed = s.speed || 70; this.tx = s.x * T + 3; this.mode = 'run'; this.afterMode = 'run';
        this.face = sign(this.tx - this.x) || this.face;
      }
    }
    if (this.fadeV) { this.alpha = clamp(this.alpha + this.fadeV * dt, 0, 1); if (this.alpha <= 0 && this.fadeV < 0) this.dead = true; if (this.alpha >= 1 && this.fadeV > 0) this.fadeV = 0; }
    if (this.glowT > 0) { this.glowT -= dt; if (this.glowT <= 0) this.glow = null; }
    if (this.jump) {
      const j = this.jump; j.t += dt;
      const k = Math.min(1, j.t / j.dur);
      this.x = j.x0 + (j.x1 - j.x0) * k; this.y = j.y0 + (j.y1 - j.y0) * k - Math.sin(k * Math.PI) * j.h;
      if (k >= 1) { this.jump = null; if (j.after) this.mode = j.after; burst(this.cx, this.y + this.h, 4, ['#8a7a8a'], 30, 0.3); }
    } else if (this.fly) {
      const f = this.fly, dx = f.x - this.x, dy = f.y - this.y, d = Math.hypot(dx, dy), st = f.speed * dt;
      if (f.spin) this.rot += f.spin * dt;
      if (d <= st) { this.x = f.x; this.y = f.y; this.fly = null; } else { this.x += dx / d * st; this.y += dy / d * st; }
    } else if (this.tx != null) {
      const dx = this.tx - this.x, st = this.speed * dt;
      if (Math.abs(dx) <= st) { this.x = this.tx; this.tx = null; this.mode = this.afterMode || 'idle'; }
      else { this.x += sign(dx) * st; this.face = sign(dx); }
    }
    if (this.key === 'carro' && this.tx != null && Math.random() < 0.3) G.parts.push({ x: this.x + 6, y: this.y + this.h, vx: -20, vy: -10, life: 0.4, max: 0.4, col: '#6a5a4a', g: 100, s: 1 });
  }
  pose() {
    const f = ACTOR_POSE[this.mode];
    let p;
    if (f) p = f(this);
    else if (IDLE[this.key] && this.key !== 'paladin') p = IDLE[this.key](this.t);
    else if (this.key === 'paladin') p = { ...IDLE.paladin(this.t), noArmF: false, armF: [1, 6] };
    else p = BASE_IDLE(this.t, this.id.length);
    p = { ...p };
    if (this.key === 'jon') { const m = G.save.marks.filter((k) => k !== 'destino').map((k) => PLAYER_MARKS[k].color); if (m.length) p.marks = m; }
    if (this.glow && (this.mode === 'cast' || this.mode === 'reach' || this.mode === 'armsup' || this.mode === 'point')) p.armGlow = this.glow;
    return p;
  }
  draw(c) {
    const x = Math.round(this.x), y = Math.round(this.y);
    c.save(); c.globalAlpha = this.alpha;
    if (this.key === 'carro') {
      if (this.rot) { c.translate(x + 22, y + 11); c.rotate(this.rot); c.translate(-x - 22, -y - 11); }
      c.fillStyle = '#2a2420'; c.fillRect(x, y + 2, 44, 16); c.fillStyle = '#4a3a2e'; c.fillRect(x, y + 2, 44, 2);
      c.fillStyle = '#1a1622'; for (let i = 0; i < 6; i++) c.fillRect(x + 4 + i * 6, y + 6, 2, 10);
      const wr = Math.floor(this.t * 10) % 2;
      c.fillStyle = '#1a1622'; c.fillRect(x + 5, y + 17, 7, 7); c.fillRect(x + 32, y + 17, 7, 7);
      c.fillStyle = '#5a4a3a'; c.fillRect(x + 7 + wr, y + 19, 2, 2); c.fillRect(x + 34 + wr, y + 19, 2, 2);
      c.fillStyle = '#1f2a44'; c.fillRect(x + 10, y - 1, 24, 3);
    } else if (this.key === 'owl') {
      drawSprite(c, OWL_CV[Math.sin(this.t * 20) > 0 ? 0 : 1], x, y, this.face < 0);
    } else if (this.key === 'naipe') {
      c.fillStyle = `rgba(242,196,90,${0.25 + Math.sin(this.t * 5) * 0.1})`; c.fillRect(x - 6, y - 6, 18, 22);
      c.fillStyle = '#f2c45a'; c.fillRect(x, y, 6, 10); c.fillStyle = '#fff1b8'; c.fillRect(x + 1, y + 1, 4, 1); c.fillRect(x + 2, y + 4, 2, 2);
    } else if (this.key === 'radio') {
      c.fillStyle = '#5a3a2a'; c.fillRect(x, y + 18, 10, 8); c.fillStyle = '#c8a050'; c.fillRect(x + 1, y + 19, 4, 4); c.fillStyle = '#1a1418'; c.fillRect(x + 6, y + 19, 3, 1); c.fillRect(x + 6, y + 21, 3, 1); c.fillRect(x + 8, y + 14, 1, 4);
    } else {
      const ch = this.key === 'paladin' ? PDC.paladin : CH[this.key];
      const spr = sprite('act-' + this.key, ch, this.pose(), this.tint || null);
      if (this.glow) { c.fillStyle = this.glow; c.globalAlpha = this.alpha * (0.18 + Math.sin(this.t * 8) * 0.06); c.fillRect(x - 8, y - 6, this.w + 16, this.h + 8); c.globalAlpha = this.alpha; }
      if (this.mode === 'lie') {
        c.translate(this.cx, y + this.h - 5); c.rotate(this.face > 0 ? -Math.PI / 2 : Math.PI / 2);
        drawSprite(c, spr, -13, -26, this.face < 0);
      } else drawSprite(c, spr, this.cx - (this.face < 0 ? 11 : 13), y + this.h - 31, this.face < 0);
    }
    c.restore();
    if (this.bubble && this.bubble.t > 0) { this.bubble.t -= 1 / 60; G.bubbles.push({ x: this.cx, y: this.y - 10, text: this.bubble.text, a: Math.min(1, this.bubble.t * 2) }); }
  }
}

// ------------------------------------------------------------------ Parkour: chispas, toldos, barras, montacargas
// Chispa del Destino: marca las líneas de parkour; recogerlas recarga un poco y suma
class Chispa extends Ent {
  constructor(d) {
    super(d); this.w = 8; this.h = 8; this.x += 4; this.y += 4; this.baseY = this.y;
    this.key = 'ch_' + G.room.def.id + '_' + (+d.x).toFixed(1) + '_' + (+d.y).toFixed(1);
    this.t = (d.x * 0.37 + d.y * 0.61) % 6;
    if (G.save.flags[this.key]) this.dead = true;
  }
  update(dt) {
    this.t += dt; this.y = this.baseY + Math.sin(this.t * 3) * 1.5;
    const p = G.player;
    if (!p.ghost && overlap({ x: this.x - 2, y: this.y - 2, w: 12, h: 12 }, p)) { this.dead = true; G.pickChispa(this); }
  }
  draw(c) {
    const x = Math.round(this.x) + 4, y = Math.round(this.y) + 4, k = Math.floor(this.t * 6) % 4;
    c.fillStyle = 'rgba(242,196,90,0.22)'; c.fillRect(x - 4, y - 4, 9, 9);
    c.fillStyle = '#f2c45a'; c.fillRect(x - 1, y - 3, 3, 7); c.fillRect(x - 3, y - 1, 7, 3);
    c.fillStyle = '#fff1b8'; c.fillRect(x, y - 2 + (k === 0 ? 0 : 1), 1, 1); c.fillRect(x, y, 1, 1);
  }
}
// Toldo elástico: rebota al caer encima; manteniendo el salto, mucho más alto
class Rebote extends Ent {
  constructor(d) { super(d); this.w = (d.w || 2) * T; this.h = 6; this.y += 10; this.squash = 0; this.col = d.col || '#c84a3a'; this.kind = d.kind || 'toldo'; }
  update(dt) {
    this.t += dt;
    if (this.squash > 0) this.squash -= dt * 4;
    const p = G.player;
    if (p.ghost || p.state === 'zip' || p.state === 'swing' || p.state === 'hang' || p.state === 'climb') return;
    if (p.x + p.w > this.x + 1 && p.x < this.x + this.w - 1 && p.vy >= 0 && p.feet >= this.y - 2 && p.feet <= this.y + 8) {
      if (p.state !== 'normal' && p.state !== 'dash') { p.state = 'normal'; p.setH(26); }
      p.vy = Input.down.jump && !G.cine ? -615 : -470;
      p.y = this.y - p.h - 1; p.onGround = false; p.coyote = 0; p.cutDone = true; p.jumpBuf = 0;
      p.dashCan = true; p.platUsed = false; p.airMinY = p.y; p.takeoffX = p.cx; p.bounced = true;
      p.combo('Toldo'); this.squash = 1; Audio2.sfx('bounce');
    }
  }
  draw(c) {
    const x = Math.round(this.x), y = Math.round(this.y) + Math.round(this.squash * 3), w = this.w, t = this.t;
    if (this.kind === 'vapor') {
      // Rejilla de vapor de la Forja: el chorro te lanza
      c.fillStyle = '#2a1a16'; c.fillRect(x, y + 2, w, 4); c.fillStyle = '#6a4030'; for (let i = 1; i < w; i += 3) c.fillRect(x + i, y + 2, 1, 4);
      for (let i = 0; i < 6; i++) { c.fillStyle = `rgba(232,224,216,${0.25 + (i % 2) * 0.15})`; c.fillRect(x + 2 + ((i * 7 + Math.floor(t * 30)) % (w - 4)), y - 4 - ((t * 40 + i * 9) % 22), 3, 3); }
      return;
    }
    if (this.kind === 'rama') {
      // Rama flexible del bosque
      c.fillStyle = '#3a2a1a'; c.fillRect(x, y + 1, w, 3); c.fillStyle = '#5a4026'; c.fillRect(x, y + 1, w, 1);
      c.fillStyle = '#3a6a2a'; for (let i = 0; i < w; i += 5) c.fillRect(x + i, y - 1 - (i % 3), 3, 2);
      return;
    }
    c.fillStyle = '#3a2a2a'; c.fillRect(x, y + 4, 2, 6 - Math.round(this.squash * 2)); c.fillRect(x + w - 2, y + 4, 2, 6 - Math.round(this.squash * 2));
    for (let i = 0; i < w; i += 4) { c.fillStyle = (i / 4) % 2 ? this.col : '#e8e0d0'; c.fillRect(x + i, y, 4, 4); }
    c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(x, y + 4, w, 1);
    for (let i = 0; i < w; i += 4) { c.fillStyle = (i / 4) % 2 ? this.col : '#e8e0d0'; c.fillRect(x + i + 1, y + 4, 2, 2); }
  }
}
// Barra para balancearse
class Barra extends Ent {
  constructor(d) { super(d); this.px = d.x * T + 8; this.py = d.y * T + 6; this.x = this.px - 9; this.y = this.py - 2; this.w = 18; this.h = 4; }
  update() {
    const p = G.player;
    if (p.swingCool > 0 || p.state !== 'normal' || p.onGround || p.ghost) return;
    if (Math.abs(p.cx - this.px) < 10 && Math.abs(p.y - 2 - this.py) < 10) p.startSwing(this);
  }
  draw(c) {
    const x = Math.round(this.x), y = Math.round(this.y);
    c.fillStyle = '#3a3036'; c.fillRect(x - 1, y - 6, 2, 8); c.fillRect(x + 17, y - 6, 2, 8);
    c.fillStyle = '#8c949e'; c.fillRect(x, y, 18, 2); c.fillStyle = '#c8d0e0'; c.fillRect(x + 2, y, 14, 1);
  }
}
// Montacargas y plataformas que se mueven entre dos puntos; llevan a Jon encima
class Movil extends Ent {
  constructor(d) {
    super(d); this.w = (d.w || 3) * T; this.h = 6;
    this.ax = d.x * T; this.ay = d.y * T; this.bx = (d.x2 ?? d.x) * T; this.by = (d.y2 ?? d.y) * T;
    this.len = Math.hypot(this.bx - this.ax, this.by - this.ay) || 1;
    this.speed = d.speed || 40; this.wait = d.wait ?? 0.8; this.k = d.k || 0; this.dir = 1; this.pause = 0.5; this.pos();
  }
  pos() { this.x = this.ax + (this.bx - this.ax) * this.k; this.y = this.ay + (this.by - this.ay) * this.k; }
  snapState() { return { k: this.k, dir: this.dir, pause: this.pause }; }
  restoreState(s) { this.k = s.k; this.dir = s.dir; this.pause = s.pause; this.pos(); }
  update(dt) {
    const p = G.player, ox = this.x, oy = this.y;
    const riding = !p.ghost && p.onGround && Math.abs(p.feet - this.y) < 2.5 && p.x + p.w > this.x && p.x < this.x + this.w;
    if (this.pause > 0) this.pause -= dt;
    else {
      this.k += this.dir * this.speed * dt / this.len;
      if (this.k >= 1) { this.k = 1; this.dir = -1; this.pause = this.wait; }
      if (this.k <= 0) { this.k = 0; this.dir = 1; this.pause = this.wait; }
    }
    this.pos();
    const dx = this.x - ox, dy = this.y - oy;
    if (riding) { if (!rectSolid(p.x + dx, p.y, p.w, p.h)) p.x += dx; if (!rectSolid(p.x, p.y + dy, p.w, p.h)) p.y += dy; }
    G.platforms.push({ x: this.x, y: this.y, w: this.w, h: this.h, life: 0.001 });
  }
  draw(c) {
    const x = Math.round(this.x), y = Math.round(this.y), w = this.w;
    if (this.ax === this.bx) { c.fillStyle = '#5a4a3a'; c.fillRect(x + 3, Math.min(this.ay, this.by) - 40, 1, y - Math.min(this.ay, this.by) + 40); c.fillRect(x + w - 4, Math.min(this.ay, this.by) - 40, 1, y - Math.min(this.ay, this.by) + 40); }
    c.fillStyle = '#4a3020'; c.fillRect(x, y, w, 6); c.fillStyle = '#8a6a48'; c.fillRect(x, y, w, 2); c.fillStyle = '#a8885e'; c.fillRect(x, y, w, 1);
    c.fillStyle = '#2a2a30'; for (let i = 3; i < w; i += 8) c.fillRect(x + i, y + 3, 2, 2);
  }
}

const ENT_CLASSES = {
  paladin: Paladin, reforzado: Paladin, blindado: Paladin, ballestero: Paladin, vigia: Vigia, acolito: Acolito,
  farol: Source, cristal: Source, brasero: Source, arcon: Source, caracola: Caracola, npc: NPC, grillete: Grillete,
  carrorayo: CarroRayo, ancla: Ancla, naipe: Naipe, pagina: Pagina, hint: Hint, trigger: Trigger, exit: Exit, zip: Zip,
  lightning: Lightning, carro: Carro, spawner: Spawner, gate: Gate,
  escondite: Escondite, meta: Meta, lauburu: Lauburu, item: Item, decor: Decor, buho: BuhoMayor, actor: Actor,
  chispa: Chispa, rebote: Rebote, barra: Barra, movil: Movil,
};
