// Datos del mundo: salas, entidades, guiones y textos.
'use strict';
const TILE = 16;
const VIEW_W = 384, VIEW_H = 216;

// Casillas
//  .  aire            #  sólido           -  plataforma (se cruza desde abajo)
//  C  caja (sólida)   B  roca con vetas azules (Energía)     I  hielo (se derrite con fuego)
//  F  muro de fuego (Temperatura: hielo)  V  velo de la Defensa (cae al romper el Ancla)
//  k  cascada (se congela y se trepa)     K  cascada helada    ^  pinchos / cristales
//  X  reja (se abre con un evento)
const SOLID = new Set(['#', 'C', 'B', 'I', 'F', 'V', 'K', 'X']);

// Letras de entidad dentro del mapa
const ENT_LETTERS = {
  P: 'spawn', L: 'farol', Y: 'cristal', T: 'brasero', R: 'arcon', S: 'caracola',
  p: 'paladin', r: 'reforzado', b: 'blindado', x: 'ballestero', o: 'vigia', a: 'acolito', g: 'pagina',
};

const NAMES = {
  jon: 'Jon', iker: 'Iker', desconocido: 'El Desconocido', centralita: 'La Centralita', radio: 'La radio de la abuela',
  narbaiza: 'General Narbaiza', martin: 'Martín', txema: 'Txema', rosa: 'Rosa', unai: 'Unai', paladin: 'Paladín',
  abuela: 'La abuela', pello: 'Pello', edurne: 'Dra. Edurne Lasa', acolito: 'Acólito',
};
const PORTRAIT_OF = { centralita: null, radio: null };

// Temas: colores de piedra, cielo, ciudad lejana y clima
const THEMES = {
  eibar: { sky: ['#1a1838', '#6a3a58'], far: '#2a2448', near: '#221d3a', win: '#ffcf7a', body: '#3c2e3e', cap: '#7a5a5a', dark: '#241a2a', brick: false, roof: true, moon: true, stars: true, sea: true },
  fort: { sky: ['#14142a', '#2a2a48'], far: '#22223a', near: '#1a1a30', win: '#ffb060', body: '#3a3a4e', cap: '#5a5a70', dark: '#26263a', brick: true, interior: true, torch: true },
  fortout: { sky: ['#1a1838', '#5a3a58'], far: '#2a2448', near: '#221d3a', win: '#ffcf7a', body: '#3a3a4e', cap: '#5a5a70', dark: '#26263a', brick: true, moon: true, stars: true, sea: true, tower: true },
  storm: { sky: ['#0e0e20', '#2a2a44'], far: '#1c1c34', near: '#16162a', win: '#3a3a5a', body: '#34303e', cap: '#5a5262', dark: '#201c28', brick: false, roof: true, rain: 1, lightning: true },
  forest: { sky: ['#101a24', '#2a3a40'], far: '#18262a', near: '#14201e', win: null, body: '#2e2a22', cap: '#4a6a30', dark: '#1e1a14', grass: true, trees: true, fog: true, stars: true },
  vista: { sky: ['#1a1838', '#c86a48'], far: '#2a2448', near: '#221d3a', win: '#ffd48a', body: '#2e2a22', cap: '#4a6a30', dark: '#1e1a14', grass: true, ibaia: true, stars: true },
  faroles: { sky: ['#202848', '#5a4a6a'], far: '#2a2a4a', near: '#22223e', win: '#ffd48a', body: '#4a2e2e', cap: '#7a5a5a', dark: '#2e1c1e', brick: true, rain: 0.7, veils: true },
  roofs: { sky: ['#1a2040', '#5a4a6a'], far: '#2a2a4a', near: '#22223e', win: '#ffd48a', body: '#3c2e3e', cap: '#7a5a5a', dark: '#241a2a', roof: true, rain: 0.7, veils: true, tower: true },
  pozo: { sky: ['#0e0c1c', '#2a1a20'], far: '#1a1424', near: '#140f1c', win: null, body: '#33283a', cap: '#4e3e52', dark: '#1c1522', brick: true, interior: true },
  forja: { sky: ['#2a1418', '#a8542a'], far: '#3a1a1a', near: '#2a1414', win: '#ff8a2a', body: '#3a2622', cap: '#6a4030', dark: '#22140f', brick: true, embers: true, interior: true, glow: '#ff8a2a' },
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
function room(def, paint) { ROOMS[def.id] = makeRoom(def, paint); }

// ================================================================== PRÓLOGO I · La última noche
room({ id: 'eibar1', area: 'eibar', x: 0, y: 0, W: 48, H: 14, theme: 'eibar', music: 'eibar', title: 'Eibar', sub: 'Prólogo · La última noche' }, (m) => {
  m.fill(0, 8, 10, 6);
  m.fill(13, 8, 9, 6); m.set(17, 7, '#');
  m.fill(25, 9, 9, 5); m.fill(28, 0, 3, 8);
  m.fill(34, 0, 2, 7); m.fill(34, 9, 5, 5);
  m.fill(39, 3, 9, 11);
  m.set(2, 7, 'P');
  m.e('npc', 6, 7, { who: 'iker', script: 'iker1', once: true, auto: 70, leave: true });
  m.e('hint', 2, 7, { text: '← →  correr' });
  m.e('hint', 9, 7, { text: 'ESPACIO / Z  saltar · suelta antes para saltar menos' });
  m.e('hint', 15, 7, { text: 'Corre contra lo bajo: lo saltas sin frenar' });
  m.e('hint', 25, 8, { text: '↓ corriendo: deslizarse por debajo' });
  m.e('hint', 36, 8, { text: 'Salta contra una pared, y otra vez hacia la otra' });
});
room({ id: 'eibar2', area: 'eibar', x: 48, y: 0, W: 48, H: 24, theme: 'eibar', music: 'eibar' }, (m) => {
  m.fill(0, 3, 8, 21);
  m.fill(10, 9, 5, 2);
  m.fill(18, 13, 6, 2);
  m.fill(28, 17, 4, 1, '-');
  m.fill(24, 21, 24, 3);
  m.fill(38, 6, 10, 12);
  for (let x = 38; x < 48; x += 2) m.set(x, 5, '#');
  m.e('hint', 9, 8, { text: 'Cae desde alto y pulsa ↓ al tocar el suelo: ruedas y no te haces daño' });
  m.e('hint', 18, 12, { text: 'Contra una pared en el aire: te deslizas y te agarras a las cornisas' });
  m.e('npc', 34, 20, { who: 'iker', script: 'iker2', once: true, auto: 60 });
});
room({ id: 'fort1', area: 'eibar', x: 96, y: 8, W: 48, H: 14, theme: 'fort', music: 'fort', stealth: true, title: 'La fortaleza', sub: 'Que no te vean' }, (m) => {
  m.fill(0, 0, 48, 1); m.fill(0, 13, 48, 1);
  m.fill(0, 1, 1, 9);
  m.fill(47, 1, 1, 1); m.fill(47, 5, 1, 8);
  m.fill(4, 11, 2, 2, 'C'); m.set(8, 12, 'C');
  m.fill(7, 9, 6, 1, '-');
  m.fill(15, 6, 7, 1, '-');
  m.fill(24, 5, 19, 1); m.fill(42, 6, 1, 4);
  m.fill(45, 5, 2, 8);
  m.set(31, 4, 'C');
  m.e('paladin', 20, 12, { patrol: [10, 30] });
  m.e('paladin', 40, 4, { guard: true });
  m.e('hint', 2, 12, { text: 'Si un paladín te ve, vuelves a la entrada. ↓ quieto: agacharte tras las cajas' });
  m.e('hint', 17, 5, { text: 'Desde arriba no te ven' });
  m.e('hint', 38, 12, { text: 'Un hueco entre dos paredes: salta de una a otra' });
});
room({ id: 'fort2', area: 'eibar', x: 144, y: -14, W: 32, H: 28, theme: 'fortout', music: 'fort', title: 'La cámara de los naipes' }, (m) => {
  m.fill(0, 0, 1, 24);
  m.fill(1, 20, 31, 1); m.clear(22, 20, 3, 1);
  m.fill(31, 20, 1, 8);
  m.fill(0, 27, 32, 1);
  m.fill(13, 25, 3, 2);
  m.set(18, 26, 'C');
  m.fill(19, 23, 5, 1, '-');
  m.e('gate', 22, 20, { w: 3, h: 1, flag: 'naipe' });
  m.e('naipe', 14, 24);
  m.fill(25, 17, 5, 1, '-');
  m.fill(17, 14, 6, 1, '-');
  m.fill(25, 11, 5, 1, '-');
  m.fill(14, 8, 7, 1, '-');
  m.fill(3, 5, 10, 1);
  m.fill(3, 6, 2, 14);
  m.e('zip', 12, 4, { x2: 31, y2: 15 });
  m.e('exit', 30, 12, { w: 2, h: 5, script: 'endP1' });
  m.e('spawner', 0, 0, { flag: 'naipe', list: [['ballestero', 7, 4], ['vigia', 22, 6], ['paladin', 26, 16, { patrol: [25, 29] }], ['paladin', 18, 13, { patrol: [17, 22] }]] });
});

// ================================================================== PRÓLOGO IV · La tormenta
room({ id: 'storm1', area: 'tormenta', x: 0, y: 0, W: 56, H: 16, theme: 'storm', music: 'storm', title: 'Eibar', sub: 'Prólogo · La tormenta' }, (m) => {
  m.fill(0, 13, 56, 3);
  m.fill(0, 0, 1, 13);
  m.fill(1, 9, 5, 4); m.fill(1, 5, 2, 4);
  m.fill(10, 11, 2, 2, 'C'); m.set(16, 12, 'C');
  m.fill(21, 10, 7, 3); m.fill(23, 8, 3, 2);
  m.fill(31, 12, 2, 1, 'C');
  m.fill(36, 9, 5, 1, '-');
  m.fill(55, 0, 1, 13);
  m.set(3, 8, 'P');
  m.e('lightning', 12, 0, { w: 30 });
  m.e('npc', 47, 12, { who: 'desconocido', script: 'desconocido1', once: true, auto: 30, copy: 'energia', sit: true });
  m.e('hint', 6, 8, { text: 'La tormenta: mira el suelo antes del rayo' });
});

// ================================================================== PRÓLOGO V · El despertar
room({ id: 'forest1', area: 'bosque', x: 0, y: 0, W: 48, H: 14, theme: 'forest', music: 'forest', title: 'El bosque del viaducto', sub: 'Prólogo · El despertar' }, (m) => {
  m.fill(0, 13, 48, 1); m.fill(0, 0, 1, 13);
  m.fill(15, 9, 2, 4, 'B');
  m.fill(15, 0, 2, 9);
  m.fill(22, 11, 6, 2); m.fill(25, 9, 3, 2);
  m.fill(33, 10, 4, 3);
  m.fill(40, 9, 8, 1, '-');
  m.set(3, 12, 'P');
  m.e('carro', 6, 12);
  m.set(11, 12, 'Y');
  m.e('hint', 4, 12, { text: 'X / J  disparo de Energía · mantén para cargar' });
  m.e('hint', 10, 12, { text: 'Mantén E junto al cristal: absorbes su Energía' });
  m.e('hint', 18, 12, { text: 'Cada marca se gasta. Solo se llena absorbiendo de su fuente' });
});
room({ id: 'forest2', area: 'bosque', x: 48, y: 0, W: 48, H: 14, theme: 'forest', music: 'forest' }, (m) => {
  m.fill(0, 13, 48, 1);
  m.fill(8, 10, 5, 1, '-'); m.fill(18, 7, 6, 1, '-');
  m.fill(28, 11, 4, 2); m.fill(35, 9, 5, 1, '-');
  m.set(26, 12, 'Y'); m.set(44, 12, 'Y');
  m.e('vigia', 16, 4, { patrol: [8, 24], hostile: true });
  m.e('vigia', 34, 3, { patrol: [28, 42], hostile: true });
  m.e('hint', 4, 12, { text: 'C / L  onda expansiva · en el aire, un rayo hacia abajo' });
});
room({ id: 'forest3', area: 'bosque', x: 96, y: 0, W: 48, H: 14, theme: 'forest', music: 'forest', title: 'El viaducto' }, (m) => {
  m.fill(0, 13, 6, 1); m.fill(6, 11, 3, 3); m.fill(9, 9, 6, 5);
  m.fill(15, 9, 5, 1, '-');
  m.fill(29, 9, 5, 1, '-');
  m.fill(34, 9, 14, 5);
  m.set(12, 8, 'Y');
  m.e('vigia', 38, 4, { patrol: [34, 46], hostile: true });
  m.e('hint', 12, 8, { text: 'SHIFT / V  dash en el aire: uno por salto' });
});
room({ id: 'vista', area: 'bosque', x: 144, y: 0, W: 24, H: 14, theme: 'vista', music: 'forest' }, (m) => {
  m.fill(0, 9, 18, 5);
  m.e('trigger', 11, 5, { w: 2, h: 4, script: 'vista', once: true });
});

// ================================================================== ACTO I · 1 · El barrio de los faroles
room({ id: 'faroles1', area: 'ibaia', x: 0, y: 0, W: 48, H: 16, theme: 'faroles', music: 'faroles', title: 'El barrio de los faroles', sub: 'Thriller noir · antes Distrito Cero' }, (m) => {
  m.fill(0, 13, 48, 3); m.fill(0, 0, 1, 13);
  m.fill(19, 9, 6, 1, '-'); m.fill(27, 6, 5, 1, '-');
  m.fill(34, 10, 4, 3);
  m.set(4, 12, 'P'); m.set(7, 12, 'S'); m.set(13, 12, 'L'); m.set(31, 12, 'L');
  m.e('paladin', 24, 12, { patrol: [16, 32] });
  m.e('npc', 42, 12, { who: 'txema', script: 'txema' });
  m.e('hint', 9, 12, { text: 'E junto a la caracola: guardar y hablar con la Centralita' });
});
room({ id: 'faroles2', area: 'ibaia', x: 48, y: 0, W: 48, H: 16, theme: 'faroles', music: 'faroles' }, (m) => {
  m.fill(0, 13, 48, 3);
  m.fill(6, 10, 5, 1, '-');
  m.fill(14, 8, 4, 5);
  m.fill(29, 0, 1, 7); m.fill(34, 0, 1, 10);
  m.fill(30, 10, 4, 1, '-');
  m.fill(25, 7, 4, 1, '-');
  m.set(22, 12, 'L');
  m.e('acolito', 40, 9);
  m.e('acolito', 9, 7);
  m.e('npc', 4, 12, { who: 'pello', script: 'pello' });
});
room({ id: 'tejados', area: 'ibaia', x: 48, y: -14, W: 48, H: 14, theme: 'roofs', music: 'faroles', title: 'Los tejados' }, (m) => {
  m.fill(0, 9, 12, 5);
  m.fill(12, 11, 17, 3); m.fill(29, 10, 1, 4); m.fill(34, 10, 1, 4);
  m.fill(35, 11, 13, 3);
  m.fill(6, 4, 5, 1, '-'); m.fill(15, 6, 5, 1, '-'); m.fill(22, 3, 4, 1, '-');
  m.fill(38, 4, 10, 1); m.fill(38, 5, 1, 6, 'F'); m.fill(47, 5, 1, 6);
  m.fill(35, 8, 3, 1, '-'); m.fill(35, 5, 3, 1, '-');
  m.set(2, 8, 'L');
  m.set(23, 2, 'g');
  m.e('pagina', 43, 10, { id: 'p2' });
  m.e('ballestero', 8, 8);
  m.e('vigia', 26, 5, { patrol: [16, 34] });
  m.e('hint', 36, 10, { text: 'Aquí falta otra marca' });
});
room({ id: 'cocheras', area: 'ibaia', x: 96, y: -14, W: 48, H: 30, theme: 'faroles', music: 'faroles', title: 'Las cocheras', sub: 'El Ancla del barrio', veilFlag: 'ancla1' }, (m) => {
  m.fill(0, 27, 48, 3);
  m.fill(0, 4, 1, 2); m.fill(0, 7, 1, 7);
  m.fill(0, 6, 12, 1, '-');
  m.fill(47, 0, 1, 27);
  m.fill(16, 24, 4, 1, '-'); m.fill(21, 21, 4, 1, '-'); m.fill(15, 18, 4, 1, '-');
  m.fill(9, 15, 4, 1, '-'); m.fill(14, 12, 4, 1, '-'); m.fill(8, 9, 4, 1, '-');
  m.fill(28, 17, 5, 1, '-'); m.fill(34, 21, 4, 1, '-');
  m.clear(20, 27, 4, 3); m.fill(20, 27, 4, 1, 'V');
  m.set(12, 26, 'L'); m.set(30, 26, 'L'); m.set(3, 5, 'L');
  m.e('npc', 4, 26, { who: 'rosa', script: 'rosa' });
  m.e('carrorayo', 8, 26);
  m.e('ancla', 40, 26, { n: 1 });
});
room({ id: 'pozo', area: 'ibaia', x: 108, y: 16, W: 24, H: 28, theme: 'pozo', music: 'faroles', title: 'El pozo del velo' }, (m) => {
  m.fill(0, 0, 8, 28); m.fill(14, 0, 10, 28);
  m.clear(8, 27, 6, 1);
  for (let k = 0; k < 9; k++) m.fill(k % 2 ? 11 : 8, 2 + k * 3, 3, 1, '-');
  m.set(13, 4, 'L');
});

// ================================================================== ACTO I · 2 · La Forja
room({ id: 'forja1', area: 'ibaia', x: 96, y: 44, W: 48, H: 16, theme: 'forja', music: 'forja', title: 'La Forja', sub: 'Huelga y sabotaje · antes La Fundición' }, (m) => {
  m.fill(0, 13, 48, 3); m.fill(0, 0, 20, 1); m.fill(26, 0, 22, 1);
  m.fill(0, 1, 1, 8); m.fill(1, 9, 2, 4, 'F');
  m.fill(8, 9, 6, 1, '-'); m.fill(30, 9, 6, 1, '-');
  m.fill(20, 10, 3, 1, '-'); m.fill(23, 7, 3, 1, '-'); m.fill(20, 4, 3, 1, '-'); m.fill(23, 1, 3, 1, '-');
  m.fill(15, 11, 3, 2, 'C');
  m.set(6, 12, 'T'); m.set(40, 12, 'T'); m.set(24, 12, 'S');
  m.e('blindado', 32, 12, { patrol: [26, 44] });
  m.e('acolito', 12, 6);
  m.e('hint', 5, 12, { text: 'Un muro de fuego. Haría falta hielo' });
});
room({ id: 'taller', area: 'ibaia', x: 144, y: 44, W: 48, H: 16, theme: 'forja', music: 'forja', title: 'El taller de temple' }, (m) => {
  m.fill(0, 13, 48, 3); m.fill(0, 0, 48, 1); m.fill(47, 1, 1, 12);
  m.fill(0, 1, 1, 8);
  m.fill(8, 3, 1, 10, 'k');
  m.fill(9, 5, 8, 1); m.fill(17, 1, 1, 5); m.fill(4, 1, 1, 10);
  m.fill(20, 9, 5, 1, '-'); m.fill(28, 6, 4, 1, '-');
  m.set(22, 12, 'T'); m.set(30, 12, 'R');
  m.e('pagina', 14, 4, { id: 'p3' });
  m.e('hint', 10, 12, { text: 'Una cascada. Ponte detrás y hiélala: se podría trepar' });
  m.e('npc', 41, 12, { who: 'unai', script: 'unai', copy: 'temperatura', chained: true });
  m.e('grillete', 38, 11, { id: 'g1' });
  m.e('grillete', 44, 11, { id: 'g2' });
  m.e('paladin', 26, 12, { patrol: [18, 34] });
  m.e('reforzado', 14, 12, { patrol: [10, 18] });
});
room({ id: 'escarcha', area: 'ibaia', x: 48, y: 44, W: 48, H: 16, theme: 'escarcha', music: 'forja', title: 'Las cámaras de escarcha' }, (m) => {
  m.fill(0, 13, 48, 3);
  m.fill(0, 1, 4, 12); m.fill(8, 0, 40, 1);
  m.fill(7, 0, 1, 13, 'k');
  m.fill(14, 9, 2, 4, 'I'); m.fill(14, 1, 2, 8);
  m.fill(22, 10, 6, 1, '-'); m.fill(23, 6, 3, 1, '-');
  m.fill(30, 1, 2, 12, 'F');
  m.fill(36, 9, 5, 1, '-');
  m.set(20, 12, 'R'); m.set(42, 12, 'T');
  m.e('pagina', 24, 5, { id: 'p4' });
  m.e('acolito', 25, 6); m.e('acolito', 40, 5);
  m.e('hint', 18, 12, { text: 'El hielo se derrite con fuego' });
  m.e('hint', 10, 12, { text: 'Ponte detrás de la cascada y hiélala (X mantenido). El fuego la deshiela' });
});
room({ id: 'antorcha', area: 'ibaia', x: 48, y: 28, W: 48, H: 16, theme: 'forja', music: 'forja', title: 'La Antorcha', sub: 'El Ancla de la Forja' }, (m) => {
  m.fill(0, 0, 48, 1); m.fill(0, 1, 4, 15); m.fill(47, 1, 1, 15);
  m.fill(7, 13, 41, 3);
  m.fill(16, 9, 5, 1, '-'); m.fill(25, 6, 5, 1, '-');
  m.fill(33, 1, 1, 12, 'F'); m.fill(37, 1, 1, 12, 'F');
  m.set(14, 12, 'T'); m.set(22, 12, 'R'); m.set(29, 12, 'T');
  m.e('ancla', 42, 12, { n: 2 });
});

const START_ROOM = 'eibar1';

// Puntos de reaparición por zona (si no hay caracola)
const AREA_START = { eibar: ['eibar1', 2, 7], tormenta: ['storm1', 3, 8], bosque: ['forest1', 3, 12], ibaia: ['faroles1', 4, 12] };

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
const SCRIPTS = {
  iker1: [
    ['say', 'iker', '¡Jon! Llegas tarde. Las patrullas cambian de turno a medianoche.'],
    ['say', 'jon', 'Llego cuando llego. ¿De verdad vamos a entrar en la fortaleza?'],
    ['say', 'iker', 'Dicen que guardan algo que brilla. Algo de la Academia. Quiero verlo antes de irme a la ciudad.'],
    ['say', 'jon', 'Antes de irte. Ya.'],
    ['say', 'iker', 'Por los tejados, como siempre. El último paga las sidras.'],
  ],
  iker2: [
    ['say', 'iker', 'Por el desagüe. Los paladines miran hacia el mar, no hacia dentro.'],
    ['say', 'iker', 'Yo vigilo aquí fuera. Si te ven, sal corriendo y vuelve a intentarlo.'],
    ['say', 'jon', 'Qué plan tan bueno. «Que no te vean».'],
  ],
  naipe: [
    ['do', 'shake', 0.6],
    ['say', 'jon', 'Cinco naipes. Cuatro apagados... y uno dorado.'],
    ['say', 'jon', 'Está caliente. Como si me estuviera mirando.'],
    ['do', 'gainDestino'],
    ['card', 'El Destino', 'la marca que copia a las demás', 'El naipe dorado se deshace en luz y se mete bajo la piel de tu muñeca izquierda. Quema. Cuando se apaga, queda un dibujo: el Destino.\n\nCopiar no es robar. Con contacto, voluntad y tiempo, podrás tener la marca de otro sin quitársela.', 'destino'],
    ['do', 'alarm'],
    ['say', 'paladin', '¡Intrusos en la cámara! ¡Cerrad la torre!'],
    ['say', 'jon', 'Arriba. Siempre arriba.'],
  ],
  endP1: [
    ['card', 'Prólogo · II', 'La plaza', 'Días después, el general Narbaiza llega a Eibar buscando el naipe. En la plaza, delante de todos, usa la Marca de Sangre contra Martín, un vecino.\n\nJon se mete en medio. Acaba a un golpe de morir.', 'plaza'],
    ['say', 'narbaiza', 'Las marcas son una enfermedad, chico. Y yo soy la cura.'],
    ['say', 'jon', '...'],
    ['card', 'Prólogo · II', 'El callejón', 'Esa noche, Iker le espera en el callejón.\n—Me voy a Ibaia. Alguien tiene que cambiar las cosas desde dentro.\n—¿Desde dentro de qué? ¿De la PDC?\nNo se despiden bien.', 'callejon'],
    ['card', 'Prólogo · III', 'Cinco días', 'Cinco días de vida normal. El puerto, los rumores, la foto familiar en la cocina, las patrullas vistas desde el mirador.\n\nLa abuela le manda al mercado. Jon lleva la muñeca vendada para que nadie vea la marca.', 'pueblo'],
    ['card', 'Prólogo · IV', 'La tormenta', 'Una tormenta de rayos cae sobre Eibar. La casa no aguanta.\n\nJon sale de entre las vigas con la vieja radio de la abuela en la mano. Ella no sale.', 'tormenta'],
    ['do', 'goto', 'storm1', 3, 8],
  ],
  desconocido1: [
    ['say', 'desconocido', '¡Eh! Tú... ayúdame. Me siguen. La PDC.'],
    ['say', 'jon', 'Los rayos... ¿has sido tú?'],
    ['say', 'desconocido', 'No sé pararlo. Llevo días sin poder pararlo.'],
    ['say', 'jon', 'Dame la mano. Creo que sé hacer algo.'],
    ['do', 'hint', 'Mantén E junto a él para copiar su marca. Si sueltas, se corta.'],
    ['do', 'allowCopy'],
  ],
  copiedEnergia: [
    ['card', 'Energía', 'copiada', 'Una luz azul te sube por el brazo y se queda dibujada junto al Destino. El Desconocido sigue teniendo su marca entera.\n\nCopiar no es quitar.', 'energia'],
    ['say', 'desconocido', 'Sigue aquí. La mía sigue aquí. ¿Qué eres tú?'],
    ['say', 'desconocido', 'Escucha. Si me cogen, hablaré. De ti, del pueblo, de todos. No aguanto el dolor.'],
    ['say', 'jon', '...'],
    ['choice', [['Matarle', 'mercy', false], ['Perdonarle', 'mercy', true]]],
    ['if', 'mercy',
      [['say', 'jon', 'Vete. Corre hacia el monte y no vuelvas.'], ['say', 'desconocido', 'No olvidaré esto. Te lo juro por mi marca.']],
      [['say', 'jon', 'Lo siento.'], ['card', 'Prólogo · IV', 'El rayo', 'Jon levanta la mano. El rayo hace el resto.\n\nLa marca de la Energía, en su brazo, tarda mucho en dejar de temblar.', 'tormenta']]],
    ['card', 'Prólogo · IV', 'El carro de presos', 'Los paladines llegan con la última luz. A Jon le ponen grilletes de latón y le meten en un carro de presos hacia Ibaia.', 'carro'],
    ['card', 'Prólogo · V', 'El despertar', 'Alguien ataca el convoy en el viaducto. El carro cae al bosque.\n\nJon despierta solo, entre la niebla, con los grilletes rotos.', 'bosque'],
    ['do', 'goto', 'forest1', 3, 12],
  ],
  vista: [
    ['do', 'pan'],
    ['say', 'jon', 'Ibaia.'],
    ['say', 'jon', 'Y esos muros de luz... ámbar. Cerrando cada barrio.'],
    ['say', 'radio', '...shhhh... si alguien me oye... shhhh... baja por la sierra... busca las caracolas de bronce...'],
    ['say', 'jon', '¿La radio de la abuela?'],
    ['card', 'Acto I', 'Ibaia, la ciudad de los diez velos', 'Una ciudad en el delta de un río, encerrada en diez velos de la Defensa. Cada velo lo sostiene su Ancla.\n\nRompe un Ancla y cae un velo.', 'ibaia'],
    ['do', 'goto', 'faroles1', 4, 12],
  ],
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
