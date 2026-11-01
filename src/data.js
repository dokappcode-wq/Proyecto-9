// Datos del mundo: salas, entidades, guiones y textos.
'use strict';
const TILE = 16;
const VIEW_W = 384, VIEW_H = 216;

// Casillas
//  .  aire            #  sólido           -  plataforma (se cruza desde abajo)
//  C  caja (sólida)   B  roca con vetas azules (Energía)     I  hielo (se derrite con fuego)
//  F  muro de fuego (Temperatura: hielo)  V  velo de la Defensa (cae al romper el Ancla)
//  k  cascada (se congela y se trepa)     K  cascada helada    ^  pinchos / cristales
//  X  reja (se abre con un evento)   W  madera (cascos, muelles)   G  roca reforzada (descarga cargada)
const SOLID = new Set(['#', 'C', 'B', 'G', 'I', 'F', 'V', 'K', 'X', 'W', 'c']);

// Letras de entidad dentro del mapa
const ENT_LETTERS = {
  P: 'spawn', L: 'farol', Y: 'cristal', T: 'brasero', R: 'arcon', S: 'caracola',
  p: 'paladin', r: 'reforzado', b: 'blindado', x: 'ballestero', o: 'vigia', a: 'acolito', g: 'pagina', '*': 'chispa',
};

const NAMES = {
  jon: 'Jon', iker: 'Iker', desconocido: 'El Desconocido', centralita: 'La Centralita', radio: 'La radio de la abuela',
  narbaiza: 'General Narbaiza', martin: 'Martín', txema: 'Txema', rosa: 'Rosa', unai: 'Unai', paladin: 'Paladín',
  abuela: 'Amona', pello: 'Pello', edurne: 'Dra. Edurne Lasa', acolito: 'Acólito',
  ane: 'Ane', panadera: 'Miren, la panadera', pescador: 'Patxi, el pescador', vecina: 'Vecina', vecino: 'Vecino', cartero: 'Koldo, el cartero',
};
const PORTRAIT_OF = { centralita: null, radio: null };

// Temas: colores de piedra, cielo, ciudad lejana y clima
const THEMES = {
  eibar: { sky: ['#1a1838', '#6a3a58'], far: '#2a2448', near: '#221d3a', win: '#ffcf7a', body: '#3c2e3e', cap: '#7a5a5a', dark: '#241a2a', brick: false, roof: true, moon: true, stars: true, sea: true },
  fort: { sky: ['#14142a', '#2a2a48'], far: '#22223a', near: '#1a1a30', win: '#ffb060', body: '#3a3a4e', cap: '#5a5a70', dark: '#26263a', brick: true, interior: true, torch: true },
  fortout: { sky: ['#1a1838', '#5a3a58'], far: '#2a2448', near: '#221d3a', win: '#ffcf7a', body: '#3a3a4e', cap: '#5a5a70', dark: '#26263a', brick: true, moon: true, stars: true, sea: true, tower: true },
  storm: { sky: ['#0e0e20', '#2a2a44'], far: '#1c1c34', near: '#16162a', win: '#3a3a5a', body: '#34303e', cap: '#5a5262', dark: '#201c28', brick: false, roof: true, rain: 1, lightning: true, cables: true },
  forest: { sky: ['#101a24', '#2a3a40'], far: '#18262a', near: '#14201e', win: null, body: '#2e2a22', cap: '#4a6a30', dark: '#1e1a14', grass: true, trees: true, fog: true, stars: true },
  vista: { sky: ['#1a1838', '#c86a48'], far: '#2a2448', near: '#221d3a', win: '#ffd48a', body: '#2e2a22', cap: '#4a6a30', dark: '#1e1a14', grass: true, ibaia: true, stars: true },
  faroles: { sky: ['#202848', '#5a4a6a'], far: '#2a2a4a', near: '#22223e', win: '#ffd48a', body: '#4a2e2e', cap: '#7a5a5a', dark: '#2e1c1e', brick: true, rain: 0.7, veils: true },
  roofs: { sky: ['#1a2040', '#5a4a6a'], far: '#2a2a4a', near: '#22223e', win: '#ffd48a', body: '#3c2e3e', cap: '#7a5a5a', dark: '#241a2a', roof: true, rain: 0.7, veils: true, tower: true },
  pozo: { sky: ['#0e0c1c', '#2a1a20'], far: '#1a1424', near: '#140f1c', win: null, body: '#33283a', cap: '#4e3e52', dark: '#1c1522', brick: true, interior: true },
  forja: { sky: ['#2a1418', '#a8542a'], far: '#3a1a1a', near: '#2a1414', win: '#ff8a2a', body: '#3a2622', cap: '#6a4030', dark: '#22140f', brick: true, embers: true, interior: true, glow: '#ff8a2a' },
  acantilado: { sky: ['#1a1838', '#6a3a58'], far: '#2a2448', near: '#221d3a', win: null, body: '#3e3a44', cap: '#6a6a58', dark: '#2a2630', grass: true, moon: true, stars: true, sea: true },
  dia: { sky: ['#5a8ac0', '#f0dcb0'], far: '#8a9ab8', near: '#7a8aa8', win: '#3a5a4a', body: '#d8ccb4', cap: '#a84a3a', dark: '#9a8a70', roof: true, sea: true, seaCol: ['#3a6a9a', '#a8c8e0'], sun: true, clouds: true },
  atardecer: { sky: ['#4a2a4a', '#f0905a'], far: '#5a3a5a', near: '#4a2e4a', win: '#ffcf7a', body: '#a89078', cap: '#8a3a2e', dark: '#6a5a4a', roof: true, sea: true, seaCol: ['#4a3a5a', '#d8805a'], clouds: true },
  noche: { sky: ['#0e0e22', '#2a2448'], far: '#1e1a34', near: '#18142a', win: '#ffcf7a', body: '#4a4050', cap: '#6a4a4a', dark: '#2a222e', roof: true, stars: true, moon: true },
  tunel: { sky: ['#0a0e10', '#141c1e'], far: '#121a1a', near: '#0e1414', win: null, body: '#2e3a38', cap: '#4a5a56', dark: '#1a2222', brick: true, interior: true, drips: true },
  escarcha: { sky: ['#101c2a', '#2a5a6a'], far: '#1a2a3a', near: '#14202e', win: '#9ff0ff', body: '#2e3a46', cap: '#5a7a8a', dark: '#1a242e', brick: true, interior: true, snow: true },
};

// ------------------------------------------------------------------ Pintor de salas
function makeRoom(def, paint) {
  const W = def.W, H = def.H;
  const g = Array.from({ length: H }, () => Array(W).fill('.'));
  const ents = [];
  const m = {
    fill(x, y, w, h, ch = '#') { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (g[j] && i >= 0 && i < W) g[j][i] = ch; },
    set(x, y, ch) { if (g[y] && x >= 0 && x < W) g[y][x] = ch; },
    clear(x, y, w = 1, h = 1) { this.fill(x, y, w, h, '.'); },
    e(type, x, y, props = {}) { ents.push({ type, x, y, ...props }); },
    // Piezas de parkour
    roof(x, top, w, ch = '#') { this.fill(x, top, w, H - top, ch); },   // bloque hasta el suelo de la sala
    plat(x, y, w) { this.fill(x, y, w, 1, '-'); },                     // toldo o balcón: se cruza desde abajo
    // Balcón con barandilla y cajón de flores; el decorado va en la fila de encima
    balcon(x, y, w) { this.plat(x, y, w); this.deco('balcon', x, y - 1, { w }); },
    crumble(x, y, w) { this.fill(x, y, w, 1, 'c'); },                  // tejas sueltas
    bar(x, y) { this.e('barra', x, y); },
    bounce(x, y, w = 2, col, kind) { this.e('rebote', x, y, { w, col, kind }); },
    mover(x, y, x2, y2, w = 3, speed = 40, wait = 0.8, k = 0) { this.e('movil', x, y, { x2, y2, w, speed, wait, k }); },
    deco(kind, x, y, props = {}) { this.e('decor', x, y, { kind, ...props }); },
    // Casa de fondo con tejado transitable en la fila r (el tejado rojo tapa el borde): base es la fila del suelo
    house(x, r, w, base = H - 1) { this.deco('casa', x, base - 1, { w, h: base - r - 0.5 }); this.plat(x, r, w); },
    // Escalera de balcones en un callejón: para volver a subir si caes a la calle
    ladder(x, w, yTop, yBottom, step = 3) { for (let y = yBottom - step; y > yTop; y -= step) this.plat(x, y, w); },
    // Chispas: puntos, filas y arcos que dibujan la línea de parkour
    ch(x, y) { this.e('chispa', x, y); },
    row(x0, x1, y, step = 2) { for (let x = x0; x <= x1; x += step) this.ch(x, y); },
    col(x, y0, y1, step = 2) { for (let y = y0; y <= y1; y += step) this.ch(x, y); },
    arc(x0, y0, x1, y1, n = 4, h = 2) {
      for (let i = 1; i <= n; i++) { const t = i / (n + 1); this.ch(+(x0 + (x1 - x0) * t).toFixed(1), +(y0 + (y1 - y0) * t - h * 4 * t * (1 - t)).toFixed(1)); }
    },
  };
  paint(m);
  // Letras de entidades
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const t = ENT_LETTERS[g[y][x]];
    if (t) { ents.push({ type: t, x, y }); g[y][x] = '.'; }
  }
  return { ...def, grid: g, ents };
}

const ROOMS = {};
// after: [sala anterior, fila del suelo a su salida, fila del suelo a mi entrada]
function room(def, paint) {
  if (def.after) { const [pid, pe, me] = def.after, pr = ROOMS[pid]; def.x = pr.x + pr.W; def.y = pr.y + pe - me; }
  ROOMS[def.id] = makeRoom(def, paint);
}

// ================================================================== ACTO I · 1 · El barrio de los faroles
// La calle va por debajo de los soportales; por encima, los tejados llevan a «Los tejados» sin pisar la calle.
room({ id: 'faroles1', area: 'ibaia', x: 0, y: -14, W: 48, H: 30, theme: 'faroles', music: 'faroles', title: 'El barrio de los faroles', sub: 'Thriller noir · antes Distrito Cero',
  check: { start: { x: 4, y: 26 }, goal: { x: 46, y: 4, w: 2, h: 6 } } }, (m) => {
  m.fill(0, 27, 48, 3); m.fill(0, 0, 1, 27);
  // Casas sobre soportales
  m.fill(1, 8, 11, 14); m.fill(16, 12, 11, 10); m.fill(30, 6, 9, 16); m.fill(42, 9, 6, 13);
  for (const x of [5, 10, 17, 25, 31, 37, 43]) m.deco('pilar', x, 26, { h: 5 });
  // Callejón 1: balcones en zigzag
  m.plat(12, 19, 2); m.plat(14, 16, 2); m.plat(12, 13, 2); m.plat(14, 10, 2);
  // Callejón 2: se sube rebotando entre las dos fachadas
  m.plat(27, 9, 3);
  // Callejón 3: una barandilla y un tejadillo que no aguanta
  m.bar(40, 11); m.crumble(39, 18, 3);
  m.fill(4, 6, 2, 2); m.fill(20, 10, 2, 2); m.fill(34, 4, 1, 2);   // chimeneas
  m.set(4, 26, 'P'); m.set(7, 26, 'S'); m.set(13, 26, 'L'); m.set(31, 26, 'L'); m.set(23, 11, 'L');
  m.e('paladin', 24, 26, { patrol: [16, 32] });
  m.e('npc', 42, 26, { who: 'txema', script: 'txema' });
  m.deco('antena', 8, 7); m.deco('cuerda', 12, 8, { w: 4 }); m.deco('antena', 36, 5); m.deco('cartel', 18, 21, { text: 'TABERNA' });
  m.col(13, 18, 9, 3); m.col(15, 15, 9, 3); m.arc(11, 7, 16, 11, 2, 1.2); m.row(18, 25, 11, 3.5); m.col(28.5, 13, 20, 3);
  m.ch(28.5, 8); m.arc(30, 8, 32, 5, 1, 0.8); m.row(35, 38, 5, 3); m.arc(39, 5, 42, 8, 1, 1); m.ch(40.5, 10); m.row(44, 47, 8, 3);
  m.e('hint', 9, 26, { text: 'E junto a la caracola: guardar y hablar con la Centralita' });
  m.e('hint', 14, 26, { text: 'Por los callejones se sube a los tejados' });
});
room({ id: 'faroles2', area: 'ibaia', x: 48, y: 0, W: 48, H: 16, theme: 'faroles', music: 'faroles',
  check: { start: { x: 1, y: 12 }, goal: { x: 30, y: 0, w: 4, h: 1 } } }, (m) => {
  m.fill(0, 13, 48, 3);
  m.fill(6, 10, 5, 1, '-');
  m.fill(14, 8, 4, 5);
  m.bounce(19, 11, 3, '#6a3a5a');                    // el toldo de la casa de empeños
  m.fill(29, 0, 1, 7); m.fill(34, 0, 1, 10);
  m.fill(30, 10, 4, 1, '-');
  m.fill(25, 7, 4, 1, '-');
  m.crumble(38, 9, 4); m.plat(43, 6, 3);
  m.set(22, 12, 'L');
  m.e('acolito', 40, 9);
  m.e('acolito', 9, 7);
  m.e('npc', 4, 12, { who: 'pello', script: 'pello' });
  m.deco('farola', 12, 12); m.deco('farola', 37, 12); m.deco('cartel', 15, 7, { text: 'BAHITETXEA' }); m.deco('cuerda', 35, 5, { w: 12 });
  m.arc(5, 12, 8, 9, 2, 1); m.arc(11, 9, 14, 7, 1, 0.8); m.row(15, 17, 7, 2); m.col(20.5, 6, 10, 2); m.row(25, 28, 6, 3);
  m.col(31.5, 2, 9, 3.5); m.row(38.5, 41, 8, 2.5); m.ch(44, 5);
});
room({ id: 'tejados', area: 'ibaia', x: 48, y: -14, W: 48, H: 14, theme: 'roofs', music: 'faroles', title: 'Los tejados',
  check: { start: { x: 1, y: 8 }, goal: { x: 46, y: 0, w: 2, h: 4 } } }, (m) => {
  m.fill(0, 9, 12, 5);
  m.fill(12, 11, 17, 3); m.fill(29, 10, 1, 4); m.fill(34, 10, 1, 4);
  m.fill(35, 11, 13, 3);
  m.fill(6, 4, 5, 1, '-'); m.fill(15, 6, 5, 1, '-'); m.fill(22, 3, 4, 1, '-');
  m.crumble(12, 8, 3); m.bar(27, 5);
  m.fill(38, 4, 10, 1); m.fill(38, 5, 1, 6, 'F'); m.fill(47, 5, 1, 6);
  m.fill(35, 8, 3, 1, '-'); m.fill(35, 5, 3, 1, '-');
  m.e('zip', 26, 2, { x2: 37, y2: 7 });
  m.set(2, 8, 'L');
  m.set(23, 2, 'g');
  m.e('pagina', 43, 10, { id: 'p2' });
  m.e('ballestero', 8, 8);
  m.e('vigia', 26, 5, { patrol: [16, 34] });
  m.deco('antena', 3, 8); m.deco('chimenea', 18, 10, { h: 1 }); m.deco('antena', 44, 3);
  m.arc(6, 8, 8, 3.5, 1, 1); m.row(9, 13, 7, 2); m.arc(14, 7, 16, 5, 1, 0.8); m.arc(20, 5, 23, 2, 1, 0.8);
  m.arc(26, 2.5, 29, 4.5, 1, 0.8); m.arc(30, 5, 35, 4, 2, 1); m.row(39, 46, 3, 2.5);
  m.e('hint', 36, 10, { text: 'Aquí falta otra marca' });
});
room({ id: 'cocheras', area: 'ibaia', x: 96, y: -14, W: 48, H: 30, theme: 'faroles', music: 'faroles', title: 'Las cocheras', sub: 'El Ancla del barrio', veilFlag: 'ancla1',
  check: { start: { x: 2, y: 5 }, goal: { x: 36, y: 22, w: 8, h: 5 } } }, (m) => {
  m.fill(0, 27, 48, 3);
  m.fill(0, 4, 1, 2); m.fill(0, 7, 1, 7);
  m.fill(0, 6, 12, 1, '-');
  m.fill(47, 0, 1, 27);
  m.fill(16, 24, 4, 1, '-'); m.fill(21, 21, 4, 1, '-'); m.fill(15, 18, 4, 1, '-');
  m.fill(9, 15, 4, 1, '-'); m.fill(14, 12, 4, 1, '-'); m.fill(8, 9, 4, 1, '-');
  m.fill(28, 17, 5, 1, '-'); m.fill(34, 21, 4, 1, '-');
  // La pasarela de la grúa y el montacargas de las cocheras
  m.bar(15, 4); m.fill(20, 6, 18, 1, '-'); m.crumble(26, 6, 4);
  m.mover(43, 26, 43, 7, 3, 44, 1.2);
  m.clear(20, 27, 4, 3); m.fill(20, 27, 4, 1, 'V');
  m.set(12, 26, 'L'); m.set(30, 26, 'L'); m.set(3, 5, 'L');
  m.e('npc', 4, 26, { who: 'rosa', script: 'rosa' });
  m.e('carrorayo', 8, 26);
  m.e('ancla', 40, 26, { n: 1 });
  m.deco('farola', 26, 26);
  m.row(3, 11, 5, 2); m.arc(12, 5, 15, 4.5, 1, 0.6); m.arc(16, 4.5, 20, 5, 1, 0.6); m.row(21, 37, 5, 4); m.col(44, 9, 24, 5);
  m.col(10, 8, 14, 3); m.ch(16, 11); m.ch(17, 17); m.ch(23, 20); m.ch(18, 23);
});
room({ id: 'pozo', area: 'ibaia', x: 108, y: 16, W: 24, H: 28, theme: 'pozo', music: 'faroles', title: 'El pozo del velo',
  check: { start: { x: 9, y: 1 }, goal: 'bottom' } }, (m) => {
  m.fill(0, 0, 8, 28); m.fill(14, 0, 10, 28);
  m.clear(8, 27, 6, 1);
  for (let k = 0; k < 9; k++) m.fill(k % 2 ? 11 : 8, 2 + k * 3, 3, 1, '-');
  m.set(13, 4, 'L');
  for (let k = 0; k < 8; k++) m.ch(k % 2 ? 9.5 : 11.5, 3.5 + k * 3);
});

// ================================================================== ACTO I · 2 · La Forja
// Bajo el pozo, un foso de escoria: vagonetas colgadas, chorros de vapor y pasarelas.
room({ id: 'forja1', area: 'ibaia', x: 96, y: 44, W: 48, H: 16, theme: 'forja', music: 'forja', title: 'La Forja', sub: 'Huelga y sabotaje · antes La Fundición',
  check: { start: { x: 21, y: 3 }, goal: 'right' } }, (m) => {
  m.fill(0, 13, 14, 3); m.fill(34, 13, 14, 3); m.fill(14, 15, 20, 1, '^');   // el foso de escoria
  m.fill(0, 0, 20, 1); m.fill(26, 0, 22, 1);
  m.fill(0, 1, 1, 8); m.fill(1, 9, 2, 4, 'F');
  m.fill(8, 9, 6, 1, '-'); m.fill(36, 9, 6, 1, '-');
  m.fill(20, 10, 3, 1, '-'); m.fill(23, 7, 3, 1, '-'); m.fill(20, 4, 3, 1, '-'); m.fill(23, 1, 3, 1, '-');
  m.mover(14, 12, 30, 12, 4, 46, 0.9);               // la vagoneta colgante
  m.bounce(16, 14, 2, null, 'vapor'); m.bounce(29, 14, 2, null, 'vapor');
  m.fill(11, 11, 3, 2, 'C');
  m.set(6, 12, 'T'); m.set(44, 12, 'T'); m.set(38, 12, 'S');
  m.e('blindado', 40, 12, { patrol: [35, 46] });
  m.e('acolito', 12, 6);
  m.ch(21, 3); m.ch(24, 6); m.ch(21, 9); m.row(16, 30, 10.5, 3.5); m.col(17, 8, 12, 2); m.col(30, 8, 12, 2); m.row(37, 41, 8, 2);
  m.e('hint', 5, 12, { text: 'Un muro de fuego. Haría falta hielo' });
  m.e('hint', 36, 12, { text: 'Rejillas de vapor: el chorro te lanza hacia arriba' });
});
room({ id: 'taller', area: 'ibaia', x: 144, y: 44, W: 48, H: 16, theme: 'forja', music: 'forja', title: 'El taller de temple',
  check: { start: { x: 1, y: 12 }, goal: { x: 36, y: 9, w: 8, h: 4 } } }, (m) => {
  m.fill(0, 13, 48, 3); m.fill(0, 0, 48, 1); m.fill(47, 1, 1, 12);
  m.fill(0, 1, 1, 8);
  m.fill(8, 3, 1, 10, 'k');
  m.fill(9, 5, 8, 1); m.fill(17, 1, 1, 5); m.fill(4, 1, 1, 10);
  m.fill(20, 9, 5, 1, '-'); m.fill(28, 6, 4, 1, '-');
  m.mover(33, 12, 33, 4, 3, 36, 1);                  // el montacargas de los lingotes
  m.fill(36, 4, 10, 1, '-'); m.bounce(24, 12, 2, null, 'vapor');
  m.set(22, 12, 'T'); m.set(30, 12, 'R');
  m.e('pagina', 14, 4, { id: 'p3' });
  m.e('hint', 10, 12, { text: 'Una cascada. Ponte detrás y hiélala: se podría trepar' });
  m.e('npc', 41, 12, { who: 'unai', script: 'unai', copy: 'temperatura', chained: true });
  m.e('grillete', 38, 11, { id: 'g1' });
  m.e('grillete', 44, 11, { id: 'g2' });
  m.e('paladin', 26, 12, { patrol: [18, 34] });
  m.e('reforzado', 14, 12, { patrol: [10, 18] });
  m.row(20, 24, 8, 2); m.col(24.5, 6, 10, 2); m.row(28, 31, 5, 3); m.col(34, 5, 11, 3); m.row(37, 45, 3, 2);
});
room({ id: 'escarcha', area: 'ibaia', x: 48, y: 44, W: 48, H: 16, theme: 'escarcha', music: 'forja', title: 'Las cámaras de escarcha',
  check: { start: { x: 5, y: 12 }, goal: { x: 4, y: 0, w: 3, h: 2 }, marks: ['destino', 'energia', 'temperatura'] } }, (m) => {
  m.fill(0, 13, 48, 3);
  m.fill(0, 1, 4, 12); m.fill(8, 0, 40, 1);
  m.fill(7, 0, 1, 13, 'k');
  m.fill(14, 9, 2, 4, 'I'); m.fill(14, 1, 2, 8);
  m.fill(22, 10, 6, 1, '-'); m.fill(23, 6, 3, 1, '-');
  m.crumble(17, 7, 3);                               // carámbanos: se rompen al pisarlos
  m.fill(30, 1, 2, 12, 'F');
  m.fill(36, 9, 5, 1, '-'); m.crumble(41, 6, 3); m.bar(34, 5);
  m.set(20, 12, 'R'); m.set(42, 12, 'T');
  m.e('pagina', 24, 5, { id: 'p4' });
  m.e('acolito', 25, 6); m.e('acolito', 40, 5);
  m.arc(16, 12, 22, 9, 2, 1.4); m.row(23, 27, 9, 2); m.ch(24.5, 5); m.row(36, 40, 8, 2); m.arc(35, 4, 41, 5, 2, 1); m.row(8.5, 13, 12, 1.5);
  m.e('hint', 18, 12, { text: 'El hielo se derrite con fuego' });
  m.e('hint', 10, 12, { text: 'Ponte detrás de la cascada y hiélala (X mantenido). El fuego la deshiela' });
});
room({ id: 'antorcha', area: 'ibaia', x: 48, y: 28, W: 48, H: 16, theme: 'forja', music: 'forja', title: 'La Antorcha', sub: 'El Ancla de la Forja',
  check: { start: { x: 8, y: 12 }, goal: { x: 38, y: 9, w: 8, h: 4 }, marks: ['destino', 'energia', 'temperatura'] } }, (m) => {
  m.fill(0, 0, 48, 1); m.fill(0, 1, 4, 15); m.fill(47, 1, 1, 15);
  m.fill(7, 13, 41, 3);
  m.fill(16, 9, 5, 1, '-'); m.fill(25, 6, 5, 1, '-');
  m.bounce(10, 12, 2, null, 'vapor'); m.plat(9, 5, 4); m.bar(21, 3);
  m.fill(33, 1, 1, 12, 'F'); m.fill(37, 1, 1, 12, 'F');
  m.set(14, 12, 'T'); m.set(22, 12, 'R'); m.set(29, 12, 'T');
  m.e('ancla', 42, 12, { n: 2 });
  m.col(11, 6, 10, 2); m.row(10, 12, 4, 2); m.arc(13, 4, 21, 4, 3, 0.8); m.arc(22, 4, 26, 5, 1, 0.6); m.row(17, 20, 8, 3);
});

const START_ROOM = 'eibar1';

// Puntos de reaparición por zona (si no hay caracola)
const AREA_START = { eibar: ['eibar1', 2, 7], plaza: ['plaza', 2, 12], pueblo: ['casa', 14, 12], tormenta: ['ruina', 13, 12], bosque: ['forest1', 3, 12], ibaia: ['faroles1', 4, 26] };

// ------------------------------------------------------------------ Marcas que el jugador puede llevar
const PLAYER_MARKS = {
  energia: { name: 'Energía', color: '#2f8bff', glow: '#9fd0ff', source: ['farol', 'cristal'] },
  temperatura: { name: 'Temperatura', color: '#2ee6d6', color2: '#ff8a2a', glow: '#b8fff7', source: ['brasero', 'arcon'] },
};

// ------------------------------------------------------------------ Páginas de la Ascensión
const PAGES = {
  p1: ['Página de la Ascensión · I', 'Informe de la forja de la Academia. «La marca no muere con el portador: se queda en el aire un instante, como el calor en una piedra. Si se la encierra a tiempo en papel de latón, se conserva.» Al margen, a mano: «Naipes. Llamadlos naipes.»'],
  p2: ['Página de la Ascensión · II', 'Inventario del traslado a la fortaleza de Eibar: cinco naipes. Uno dorado, sin identificar, que «se calienta cuando alguien lo mira». Cuatro con ficha. De esas cuatro fichas, tres aparecen tachadas.'],
  p3: ['Página de la Ascensión · III', 'Ficha sin foto. Nombre: [tachado]. Marca: [tachado]. Estado: «en custodia». Fecha de la custodia: la noche del convoy del viaducto.'],
  p4: ['Página de la Ascensión · IV', 'Plano de una cadena: diez eslabones, uno por barrio, y un Amplificador en lo alto. «El sujeto D no debe despertar del todo. Diseño: Dra. E. L.»'],
};

// ------------------------------------------------------------------ Guiones
// ['say', quién, texto] · ['choice', [[texto, flag, valor], ...]] · ['card', título, subtítulo, texto, escena]
// ['do', acción, ...args] · ['if', flag, [sí], [no]]
// Recados de amona: el marcador de misión sale de aquí. (x, y) es el punto de la sala donde flota el rombo.
const RECADOS = [
  { flag: 'gato', place: 'El mercado', room: 'mercado', x: 43.5, y: 0, text: 'Sube a la torre del reloj y coge a Txuri, el gato de la panadera', after: null },
  { flag: 'pan', place: 'El mercado', room: 'mercado', x: 9.5, y: 28.5, text: 'Lleva el gato a la panadera: abajo, a la izquierda del mercado', after: 'gato' },
  { flag: 'red', place: 'El muelle', room: 'muelle', x: 23.5, y: 0, text: 'Sube a la cofa de la trainera y suelta la red de Patxi', after: null },
  { flag: 'pescado', place: 'El muelle', room: 'muelle', x: 56.5, y: 15, text: 'Habla con Patxi, el pescador, para llevarle el pescado a amona', after: 'red' },
  { flag: 'correo', place: 'El mirador', room: 'mirador', x: 17, y: 0, text: 'Sube al mirador a ver el barco del correo', after: null },
];

const SCRIPTS = {
  centralita1: [
    ['say', 'centralita', 'Por fin. Aquí la Centralita. Te oí bajar por la sierra, chico del naipe dorado.'],
    ['say', 'jon', '¿Cómo sabes lo del naipe?'],
    ['say', 'centralita', 'Sé muchas cosas. Las caracolas son mis oídos. Úsalas para guardar y para hablar conmigo.'],
    ['say', 'centralita', 'Los paladines de la PDC no te atacarán si no les das motivo. No uses tus marcas delante de ellos y no les pongas la mano encima.'],
    ['say', 'centralita', 'Los Acólitos son otra cosa: usan un poder que no es suyo. Esos atacan siempre.'],
    ['say', 'centralita', 'El Ancla de este barrio está en las cocheras, al este. Rosa te espera con el carro de rayo. Si cae el Ancla, cae el velo.'],
    ['say', 'centralita', 'Pulsa ESC para ver el mapa del barrio.'],
  ],
  centralita2: [
    ['say', 'centralita', 'Guardado. Sigue moviéndote, chico. Nadie para a quien no se para.'],
  ],
  txema: [
    ['say', 'txema', 'Pasa, pasa, que te mojas. Aquí no preguntamos nombres.'],
    ['say', 'txema', 'Hay un chivato en el barrio. Ya han caído dos pisos de la resistencia. Si ves a un paladín demasiado tranquilo, desconfía.'],
    ['if', 'mercy', [['say', 'txema', 'Por cierto, pasó un tipo con la ropa quemada preguntando por un chaval con la muñeca vendada. Dijo que te debía una.']], []],
  ],
  pello: [
    ['say', 'pello', 'No soy un chivato. Solo hago recados. Recados que pagan bien.'],
    ['say', 'pello', 'Mi hermana está en la Colmena. Si tuvieras una hermana allí, tú también harías recados.'],
  ],
  rosa: [
    ['say', 'rosa', 'Treinta años conduciendo el carro de rayo y ahora lo uso de ariete. La vida.'],
    ['say', 'rosa', 'Mira ese Ancla: chupa rayo del velo. Si le metemos más del que aguanta, revienta.'],
    ['say', 'rosa', 'Mantén E junto al carro para pasarle tu Energía. Cuando se te acabe, recarga en los faroles. Y date prisa: cuando empiece a zumbar, vendrán los Acólitos.'],
  ],
  anclaRota1: [
    ['do', 'shake', 1.2],
    ['say', 'rosa', '¡Toma ya! ¡Treinta años!'],
    ['say', 'jon', 'El Destino... ha reaccionado. Como si el Ancla estuviera viva.'],
    ['say', 'centralita', 'El velo del suelo ha caído. Bajo las cocheras está el pozo que lleva a la Forja.'],
    ['say', 'centralita', 'Allí la PDC tiene a un fundidor, Unai, templando el acero de sus escudos. Tiene la marca de la Temperatura.'],
    ['say', 'centralita', 'Recuerda la tercera regla, chico: se copia a quien lo permite.'],
  ],
  unaiChained: [
    ['say', 'unai', 'Si vienes a mirar, mira rápido. Los grilletes están cargados de rayo: si me muevo, me queman.'],
    ['say', 'jon', 'Rayo. Eso lo entiendo.'],
    ['do', 'hint', 'Rompe los dos grilletes con disparos de Energía'],
  ],
  unai: [
    ['if', 'grilletes', [
      ['say', 'unai', 'Libre. Hacía meses que no sentía las manos.'],
      ['say', 'jon', 'Necesito tu marca. Para abrir la Antorcha.'],
      ['say', 'unai', 'La Antorcha... dentro de un muro de fuego que solo el hielo abre. Y yo soy las dos cosas.'],
      ['say', 'unai', 'Tómala. Con permiso, que se nota que te importa. Mitad caliente, mitad fría: no la uses solo para una cosa.'],
      ['do', 'allowCopy'],
      ['do', 'hint', 'Mantén E junto a Unai para copiar la Temperatura'],
    ], [['do', 'script', 'unaiChained']]],
  ],
  copiedTemperatura: [
    ['card', 'Temperatura', 'copiada', 'Una luz turquesa y naranja se enrosca en tu brazo, encima de la Energía.\n\nQ / TAB cambia de marca. Con la Temperatura: toque, fuego; cargado, hielo. C crea una plataforma de hielo en el aire.', 'temperatura'],
    ['say', 'unai', 'El muro de fuego de la entrada de la Forja lleva a las cámaras de escarcha. De ahí se sube a la Antorcha.'],
    ['say', 'unai', 'El Ancla de allí no se rompe a golpes: hay que darle frío y calor, frío y calor, hasta que se agriete.'],
  ],
  anclaRota2: [
    ['do', 'shake', 1.4],
    ['say', 'centralita', 'Dos velos. Dos Anclas. Chico... lo que viste en el Ancla, esa sensación de que estaba viva...'],
    ['say', 'jon', 'Me ha parecido oír a alguien. Una voz que conozco.'],
    ['say', 'centralita', 'Las Agujas te esperan. Y lo que hay en lo alto de la Torre, también.'],
    ['do', 'ending'],
  ],
  pagina: [],
};

// Guiones de la caracola de cada sala la primera vez
const CARACOLA_FIRST = { faroles1: 'centralita1' };
