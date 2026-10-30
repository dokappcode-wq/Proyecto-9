// El prólogo: cinco capítulos jugables, de los tejados de Eibar a la primera vista de Ibaia.
'use strict';

// ================================================================== I · La última noche (Eibar, de noche)
room({ id: 'eibar1', area: 'eibar', x: 0, y: 0, W: 48, H: 14, theme: 'eibar', music: 'eibar', title: 'Eibar', sub: 'Prólogo · La última noche', onEnter: 'intro' }, (m) => {
  m.fill(0, 8, 10, 6);
  m.fill(13, 8, 9, 6); m.set(17, 7, '#');
  m.fill(25, 9, 9, 5); m.fill(28, 0, 3, 8);
  m.fill(34, 0, 2, 7); m.fill(34, 9, 5, 5);
  m.fill(39, 3, 9, 11);
  m.e('hint', 2, 7, { text: '← →  correr' });
  m.e('hint', 9, 7, { text: 'ESPACIO / Z  saltar · suelta antes para saltar menos' });
  m.e('hint', 15, 7, { text: 'Corre contra lo bajo: lo saltas sin frenar' });
  m.e('hint', 25, 8, { text: '↓ corriendo: deslizarse por debajo' });
  m.e('hint', 36, 8, { text: 'Salta contra una pared, y otra vez hacia la otra' });
});
room({ id: 'puerto', area: 'eibar', after: ['eibar1', 3, 3], W: 48, H: 14, theme: 'eibar', music: 'eibar', title: 'Los tejados del puerto' }, (m) => {
  m.fill(0, 3, 8, 11);
  m.fill(11, 5, 10, 9);
  m.fill(27, 6, 8, 8);
  m.fill(35, 9, 4, 1, '-'); m.fill(35, 12, 4, 2);
  m.fill(40, 7, 3, 1, '-');
  m.fill(43, 4, 5, 10);
  m.e('pagina', 36, 11, { id: 'p5' });
  m.e('hint', 12, 4, { text: 'Corre sin soltar: al rato esprintas y saltas mucho más lejos' });
  m.e('hint', 33, 5, { text: 'Las lonas aguantan. ↓ + salto para bajar a través de ellas' });
});
room({ id: 'fachada', area: 'eibar', after: ['puerto', 4, 16], W: 32, H: 17, theme: 'eibar', music: 'eibar', title: 'La fachada de la cofradía' }, (m) => {
  m.fill(0, 16, 20, 1); m.fill(20, 4, 12, 13);
  m.fill(14, 12, 3, 1); m.fill(8, 8, 3, 1); m.fill(13, 4, 4, 1);
  m.e('hint', 4, 15, { text: 'Cornisas: salta junto al borde y empuja hacia él. ↑ o salto para subir, ↓ para soltarte' });
});
room({ id: 'tendederos', area: 'eibar', after: ['fachada', 4, 4], W: 48, H: 16, theme: 'eibar', music: 'eibar', title: 'Los tendederos' }, (m) => {
  m.fill(0, 4, 6, 12); m.fill(20, 9, 6, 7); m.fill(41, 13, 7, 3);
  m.e('zip', 5, 2, { x2: 19, y2: 7 });
  m.e('zip', 25, 7, { x2: 40, y2: 11 });
  m.e('hint', 2, 3, { text: 'Salta a la cuerda de tender: te deslizas. Salta para soltarte' });
});
room({ id: 'carrera', area: 'eibar', after: ['tendederos', 13, 10], W: 64, H: 14, theme: 'eibar', music: 'eibar', title: 'La carrera' }, (m) => {
  m.fill(0, 10, 6, 4);
  m.fill(9, 10, 5, 4); m.set(11, 9, '#');
  m.fill(18, 9, 6, 5);
  m.fill(24, 10, 9, 4); m.fill(27, 0, 3, 9);
  m.fill(36, 7, 2, 7);
  m.fill(38, 8, 4, 6);
  m.fill(45, 8, 6, 6);
  m.fill(51, 8, 5, 1, '-'); m.fill(51, 13, 5, 1, '^');
  m.fill(56, 8, 8, 6);
  m.e('npc', 4, 9, { who: 'iker', key: 'iker_a', script: 'iker_reto', once: true, auto: 50, leave: true, leaveDir: -1 });
  m.e('npc', 60, 7, { who: 'iker', key: 'iker_b', script: 'iker_meta', needFlag: 'iker_reto' });
  m.e('meta', 57, 7, { id: 'iker' });
  m.e('hint', 33, 9, { text: 'Lo que no alcanzas de un salto, lo alcanzas agarrándote' });
});
room({ id: 'acantilado', area: 'eibar', after: ['carrera', 8, 3], W: 48, H: 24, theme: 'eibar', music: 'eibar', title: 'El acantilado' }, (m) => {
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
room({ id: 'desague', area: 'eibar', after: ['acantilado', 21, 13], W: 48, H: 14, theme: 'tunel', music: 'fort', title: 'El desagüe' }, (m) => {
  m.fill(0, 0, 48, 2); m.fill(0, 13, 48, 1); m.fill(0, 2, 1, 8);
  m.fill(6, 2, 8, 10);
  m.fill(16, 13, 3, 1, '^');
  m.fill(22, 9, 4, 4);
  m.fill(26, 2, 12, 5); m.fill(26, 9, 12, 4);
  m.fill(40, 2, 8, 10);
  m.e('hint', 2, 12, { text: '↓ quieto: agáchate. Así te arrastras por donde no cabe nadie' });
  m.e('hint', 15, 12, { text: 'Rejas rotas: mejor por encima' });
});
room({ id: 'fort1', area: 'eibar', after: ['desague', 13, 13], W: 48, H: 14, theme: 'fort', music: 'fort', stealth: true, title: 'La fortaleza', sub: 'Que no te vean' }, (m) => {
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
room({ id: 'patio', area: 'eibar', after: ['fort1', 5, 5], W: 48, H: 16, theme: 'fortout', music: 'fort', stealth: true, title: 'El patio de armas' }, (m) => {
  m.fill(0, 5, 6, 1); m.fill(0, 6, 1, 10);
  m.fill(0, 15, 48, 1);
  m.fill(6, 8, 3, 1, '-'); m.fill(2, 11, 3, 1, '-');
  m.fill(9, 11, 4, 1); m.fill(18, 11, 4, 1); m.fill(27, 11, 4, 1); m.fill(36, 11, 4, 1);
  m.fill(47, 0, 1, 12);
  m.e('vigia', 16, 3, { patrol: [8, 26] });
  m.e('vigia', 36, 2, { patrol: [26, 44] });
  m.e('escondite', 23, 14, { kind: 'barril' });
  m.e('escondite', 32, 14, { kind: 'barril' });
  m.e('escondite', 42, 14, { kind: 'barril' });
  m.e('hint', 3, 4, { text: 'Ojos de cristal: no pases bajo su luz. Bajo los tejadillos no te ven' });
  m.e('hint', 22, 14, { text: 'Agachado junto a un barril, nadie te ve' });
});
room({ id: 'almacen', area: 'eibar', after: ['patio', 15, 13], W: 48, H: 14, theme: 'fort', music: 'fort', stealth: true, title: 'El almacén' }, (m) => {
  m.fill(0, 0, 48, 1); m.fill(0, 13, 48, 1); m.fill(0, 1, 1, 9); m.fill(47, 1, 1, 9);
  m.fill(4, 9, 6, 1, '-'); m.fill(12, 6, 8, 1, '-'); m.fill(22, 6, 6, 1, '-'); m.fill(30, 6, 8, 1, '-'); m.fill(40, 9, 5, 1, '-');
  m.fill(22, 11, 2, 2, 'C');
  m.e('paladin', 12, 12, { patrol: [6, 20] });
  m.e('paladin', 34, 12, { patrol: [26, 44] });
  m.e('escondite', 9, 12, { kind: 'cortina', w: 2 });
  m.e('escondite', 37, 12, { kind: 'cortina', w: 2 });
  m.e('pagina', 16, 5, { id: 'p8' });
  m.e('hint', 2, 12, { text: 'Tras una cortina, agachado, los guardias pasan de largo' });
});
room({ id: 'torre', area: 'eibar', after: ['almacen', 13, 27], W: 24, H: 28, theme: 'fort', music: 'fort', stealth: true, title: 'La torre' }, (m) => {
  m.fill(0, 0, 24, 1); m.fill(0, 1, 1, 23); m.fill(23, 1, 1, 1); m.fill(23, 5, 1, 23);
  m.fill(0, 27, 24, 1);
  m.fill(5, 21, 18, 1); m.fill(1, 24, 3, 1, '-');
  m.fill(1, 15, 18, 1); m.fill(19, 18, 3, 1, '-');
  m.fill(5, 9, 18, 1); m.fill(1, 12, 3, 1, '-');
  m.fill(1, 5, 17, 1); m.fill(21, 5, 2, 1); m.fill(18, 7, 3, 1, '-');
  m.e('paladin', 14, 20, { patrol: [6, 21] });
  m.e('paladin', 9, 14, { patrol: [2, 17] });
  m.e('paladin', 14, 8, { patrol: [6, 21] });
  m.e('escondite', 12, 20, { kind: 'cortina', w: 2 });
  m.e('escondite', 9, 14, { kind: 'cortina', w: 2 });
  m.e('escondite', 13, 8, { kind: 'cortina', w: 2 });
  m.e('hint', 3, 26, { text: 'Espera bajo el rellano a que el guardia te dé la espalda' });
});
room({ id: 'fort2', area: 'eibar', after: ['torre', 5, 27], W: 32, H: 28, theme: 'fortout', music: 'fort', title: 'La cámara de los naipes' }, (m) => {
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
  m.e('spawner', 0, 0, { flag: 'naipe', list: [['ballestero', 7, 4], ['vigia', 22, 6], ['paladin', 26, 16, { patrol: [25, 29] }], ['paladin', 18, 13, { patrol: [17, 22] }]] });
});
room({ id: 'murallas', area: 'eibar', after: ['fort2', 17, 10], W: 64, H: 14, theme: 'fortout', music: 'ancla', title: 'Las murallas', sub: '¡Corre!' }, (m) => {
  m.fill(0, 10, 14, 4); for (const x of [4, 8, 12]) m.set(x, 9, '#');
  m.fill(17, 10, 10, 4); for (const x of [20, 24]) m.set(x, 9, '#');
  m.fill(25, 7, 2, 1, '-'); m.fill(27, 5, 4, 9);
  m.fill(31, 10, 8, 4); m.set(35, 9, '#');
  m.fill(43, 10, 21, 4); for (const x of [47, 51]) m.set(x, 9, '#');
  m.e('paladin', 21, 9, { patrol: [17, 26], hostile: true });
  m.e('ballestero', 29, 4, { hostile: true });
  m.e('paladin', 48, 9, { patrol: [43, 55], hostile: true });
  m.e('vigia', 40, 3, { hostile: true, patrol: [34, 50] });
  m.e('exit', 59, 0, { w: 5, h: 10, script: 'endP1' });
  m.e('hint', 2, 9, { text: 'Sin marcas con las que pelear: esquiva y no te pares' });
});

// ================================================================== II · La plaza (de día) y el callejón
room({ id: 'plaza', area: 'plaza', x: 0, y: 0, W: 48, H: 14, theme: 'dia', music: 'storm', title: 'La plaza', sub: 'Eibar, días después', onEnter: 'plaza_in' }, (m) => {
  m.fill(0, 13, 48, 1); m.fill(0, 0, 1, 13); m.fill(47, 0, 1, 13);
  m.e('decor', 2, 12, { kind: 'casa', w: 7, h: 5 });
  m.e('decor', 34, 12, { kind: 'casa', w: 7, h: 6 });
  m.e('decor', 42, 12, { kind: 'casa', w: 5, h: 4 });
  m.e('decor', 22, 12, { kind: 'fuente' });
  m.e('trigger', 11, 8, { w: 2, h: 5, script: 'plaza', once: true });
});
room({ id: 'callejon', area: 'plaza', x: 100, y: 0, W: 32, H: 14, theme: 'noche', music: 'storm', onEnter: 'callejon' }, (m) => {
  m.fill(0, 13, 32, 1); m.fill(0, 0, 3, 13); m.fill(29, 0, 3, 13);
});

// ================================================================== III · Cinco días (el pueblo, de día)
room({ id: 'muelle', area: 'pueblo', x: -48, y: 0, W: 48, H: 14, theme: 'dia', music: 'title', title: 'El muelle' }, (m) => {
  m.fill(0, 0, 1, 11);
  m.fill(2, 11, 9, 3, 'W'); m.e('decor', 6, 10, { kind: 'mastil', h: 8 });
  m.fill(3, 8, 7, 1, '-'); m.fill(4, 5, 5, 1, '-');
  m.fill(14, 11, 10, 3, 'W'); m.e('decor', 18, 10, { kind: 'mastil', h: 9 });
  m.fill(15, 8, 7, 1, '-'); m.fill(16, 5, 5, 1, '-'); m.fill(16, 2, 5, 1, '-');
  m.fill(26, 10, 10, 4, 'W');
  m.fill(36, 13, 12, 1);
  m.e('item', 19, 1, { kind: 'red', flag: 'red', prompt: 'Soltar la red', script: 'red' });
  m.e('pagina', 6, 4, { id: 'p7' });
  m.e('npc', 32, 9, { who: 'pescador', script: 'pescador' });
  m.e('hint', 38, 12, { text: 'El muelle de Patxi' });
});
room({ id: 'casa', area: 'pueblo', x: 0, y: 0, W: 32, H: 14, theme: 'dia', music: 'title', title: 'Eibar', sub: 'La casa de amona', onEnter: 'casa_in' }, (m) => {
  m.fill(0, 13, 32, 1);
  m.e('decor', 3, 12, { kind: 'casa', w: 10, h: 6 });
  m.e('npc', 15, 12, { who: 'abuela', script: 'abuela' });
});
room({ id: 'calle', area: 'pueblo', x: 32, y: 0, W: 48, H: 14, theme: 'dia', music: 'title', title: 'La calle mayor' }, (m) => {
  m.fill(0, 13, 48, 1);
  m.fill(4, 11, 2, 2, 'C'); m.fill(6, 8, 8, 5); m.fill(18, 6, 6, 7);
  m.fill(29, 0, 1, 9); m.fill(34, 0, 1, 10); m.fill(30, 10, 4, 1, '-');
  m.fill(38, 9, 6, 4);
  m.e('npc', 25, 12, { who: 'vecina', script: 'vecina' });
  m.e('hint', 31, 12, { text: 'Entre estas dos casas se sube al mirador' });
});
room({ id: 'mirador', area: 'pueblo', x: 56, y: -26, W: 24, H: 26, theme: 'dia', music: 'title', title: 'El mirador' }, (m) => {
  m.fill(5, 20, 1, 6); m.fill(10, 18, 1, 8);
  m.fill(12, 15, 4, 1, '-'); m.fill(5, 12, 4, 1, '-'); m.fill(12, 9, 4, 1, '-'); m.fill(4, 6, 5, 1, '-');
  m.fill(17, 6, 3, 1, '-'); m.fill(13, 4, 9, 1, '-');
  m.e('pagina', 5, 5, { id: 'p6' });
  m.e('trigger', 15, 1, { w: 4, h: 3, script: 'mirador', once: true });
  m.e('meta', 17, 3, { id: 'ane' });
});
room({ id: 'mercado', area: 'pueblo', x: 80, y: 0, W: 48, H: 14, theme: 'dia', music: 'title', title: 'El mercado' }, (m) => {
  m.fill(0, 13, 48, 1); m.fill(47, 0, 1, 13);
  m.e('decor', 5, 12, { kind: 'puesto', col: '#b5544a', goods: ['#d8a050', '#c88040', '#e8c070'] });
  m.e('decor', 15, 12, { kind: 'puesto', col: '#3e7cb1', goods: ['#a8b8c8', '#6a8aa8'] });
  m.e('decor', 24, 12, { kind: 'puesto', col: '#c9a24a', goods: ['#7ab04a', '#c84a3a', '#e8a040'] });
  m.fill(33, 11, 2, 2, 'C'); m.fill(35, 8, 3, 1, '-'); m.fill(38, 6, 9, 7);
  m.e('item', 44, 5, { kind: 'gato', flag: 'gato', prompt: 'Coger al gato', script: 'gato' });
  m.e('npc', 9, 12, { who: 'panadera', script: 'panadera' });
  m.e('npc', 19, 12, { who: 'vecino', script: 'vecino' });
  m.e('npc', 29, 12, { who: 'ane', script: 'ane' });
  m.e('npc', 36, 12, { who: 'cartero', script: 'cartero' });
});

// ================================================================== IV · La tormenta
room({ id: 'ruina', area: 'tormenta', x: -32, y: 0, W: 32, H: 16, theme: 'storm', music: 'storm', onEnter: 'ruina' }, (m) => {
  m.fill(0, 13, 32, 3); m.fill(0, 0, 1, 13);
  m.fill(3, 11, 3, 2, 'C'); m.fill(8, 12, 2, 1, 'C'); m.fill(20, 12, 1, 1, 'C');
});
room({ id: 'storm1', area: 'tormenta', x: 0, y: 0, W: 56, H: 16, theme: 'storm', music: 'storm', title: 'Eibar', sub: 'La tormenta' }, (m) => {
  m.fill(0, 13, 56, 3);
  m.fill(1, 9, 5, 4); m.fill(1, 5, 2, 4);
  m.fill(10, 11, 2, 2, 'C'); m.set(16, 12, 'C');
  m.fill(21, 10, 7, 3); m.fill(23, 8, 3, 2);
  m.fill(31, 12, 2, 1, 'C');
  m.fill(36, 9, 5, 1, '-');
  m.fill(44, 13, 5, 1, '^'); m.fill(44, 10, 5, 1, '-');
  m.e('lightning', 6, 0, { w: 48 });
  m.e('hint', 6, 8, { text: 'Mira el suelo antes del rayo: donde parpadea, cae' });
  m.e('hint', 42, 12, { text: 'Cables cortados: no los pises' });
});
room({ id: 'storm2', area: 'tormenta', after: ['storm1', 13, 13], W: 48, H: 16, theme: 'storm', music: 'storm' }, (m) => {
  m.fill(0, 13, 10, 3); m.fill(10, 15, 6, 1, '^'); m.fill(11, 10, 4, 1, '-'); m.fill(16, 13, 32, 3);
  m.fill(20, 11, 3, 2, 'C'); m.fill(26, 9, 6, 4); m.fill(33, 12, 2, 1, 'C');
  m.fill(47, 0, 1, 13);
  m.e('lightning', 2, 0, { w: 40 });
  m.e('npc', 44, 12, { who: 'desconocido', script: 'desconocido1', once: true, auto: 30, copy: 'energia', sit: true });
});

// ================================================================== V · El despertar (el bosque)
room({ id: 'viaducto', area: 'bosque', x: -100, y: 0, W: 48, H: 16, theme: 'forest', music: 'storm', onEnter: 'viaducto' }, (m) => {
  m.fill(0, 8, 48, 1);
  for (const x of [8, 22, 36]) m.fill(x, 9, 2, 7);
});
room({ id: 'forest1', area: 'bosque', x: 0, y: 0, W: 48, H: 14, theme: 'forest', music: 'forest', title: 'El bosque del viaducto', sub: 'Prólogo · El despertar', onEnter: 'despertar' }, (m) => {
  m.fill(0, 13, 48, 1); m.fill(0, 0, 1, 13);
  m.fill(15, 9, 2, 4, 'B');
  m.fill(15, 0, 2, 9);
  m.fill(22, 11, 6, 2); m.fill(25, 9, 3, 2);
  m.fill(33, 10, 4, 3);
  m.fill(40, 9, 8, 1, '-');
  m.e('carro', 6, 12);
  m.set(11, 12, 'Y');
  m.e('hint', 4, 12, { text: 'X / J  disparo de Energía' });
  m.e('hint', 10, 12, { text: 'Mantén E junto al cristal: absorbes su Energía' });
  m.e('hint', 18, 12, { text: 'Cada marca se gasta. Solo se llena absorbiendo de su fuente' });
});
room({ id: 'arriba', area: 'bosque', after: ['forest1', 13, 17], W: 48, H: 18, theme: 'forest', music: 'forest', title: 'Bajo las copas' }, (m) => {
  m.fill(0, 17, 48, 1);
  m.fill(18, 6, 1, 9); m.fill(23, 6, 1, 11); m.fill(19, 6, 4, 1, 'B');
  m.fill(24, 7, 24, 10);
  m.set(5, 16, 'Y'); m.set(30, 6, 'Y');
  m.e('vigia', 9, 9, { hostile: true, patrol: [6, 13] });
  m.e('vigia', 34, 1, { hostile: true, patrol: [28, 44] });
  m.e('vigia', 42, 2, { hostile: true, patrol: [30, 46] });
  m.e('hint', 3, 16, { text: '↑ + X: disparo hacia arriba · ↑ + → + X: en diagonal' });
  m.e('hint', 20, 16, { text: 'La roca con vetas tapa la salida: dispárale desde abajo' });
});
room({ id: 'forest2', area: 'bosque', after: ['arriba', 7, 13], W: 48, H: 14, theme: 'forest', music: 'forest' }, (m) => {
  m.fill(0, 13, 48, 1);
  m.fill(8, 10, 5, 1, '-'); m.fill(18, 7, 6, 1, '-');
  m.fill(28, 11, 4, 2); m.fill(35, 9, 5, 1, '-');
  m.set(26, 12, 'Y'); m.set(44, 12, 'Y');
  m.e('vigia', 16, 4, { patrol: [8, 24], hostile: true });
  m.e('vigia', 34, 3, { patrol: [28, 42], hostile: true });
  m.e('vigia', 24, 2, { patrol: [14, 36], hostile: true });
  m.e('hint', 4, 12, { text: 'C / L  onda expansiva · en el aire, un rayo hacia abajo' });
});
room({ id: 'cargada', area: 'bosque', after: ['forest2', 13, 13], W: 48, H: 14, theme: 'forest', music: 'forest', title: 'La roca reforzada' }, (m) => {
  m.fill(0, 13, 48, 1);
  m.fill(14, 0, 2, 6); m.fill(14, 6, 2, 7, 'G');
  m.fill(18, 10, 3, 1, '-');
  m.fill(22, 8, 16, 5); m.clear(24, 10, 14, 2); m.fill(26, 8, 3, 2, 'B');
  m.fill(38, 0, 10, 10);
  m.set(4, 12, 'Y'); m.set(44, 12, 'Y');
  m.e('vigia', 30, 3, { hostile: true, patrol: [22, 36] });
  m.e('hint', 4, 12, { text: 'Mantén X y suelta: la descarga cargada rompe la roca reforzada' });
  m.e('hint', 24, 7, { text: 'En el aire, C: un rayo hacia abajo que revienta el suelo de vetas' });
});
room({ id: 'forest3', area: 'bosque', after: ['cargada', 13, 13], W: 48, H: 14, theme: 'forest', music: 'forest', title: 'El puente roto' }, (m) => {
  m.fill(0, 13, 6, 1); m.fill(6, 11, 3, 3); m.fill(9, 9, 6, 5);
  m.fill(15, 9, 5, 1, '-');
  m.fill(29, 9, 5, 1, '-');
  m.fill(34, 9, 14, 5);
  m.set(12, 8, 'Y');
  m.e('vigia', 38, 4, { patrol: [34, 46], hostile: true });
  m.e('hint', 12, 8, { text: 'SHIFT / V  dash en el aire: uno por salto' });
});
room({ id: 'dashes', area: 'bosque', after: ['forest3', 9, 9], W: 56, H: 14, theme: 'forest', music: 'forest', title: 'Las copas caídas' }, (m) => {
  m.fill(0, 9, 8, 5);
  m.fill(16, 9, 4, 5); m.fill(28, 8, 4, 6); m.fill(40, 9, 4, 5); m.fill(52, 9, 4, 5);
  m.set(4, 8, 'Y'); m.set(29, 7, 'Y');
  m.e('vigia', 34, 3, { hostile: true, patrol: [24, 44] });
  m.e('hint', 4, 8, { text: 'Salto, y en lo alto, dash. El dash vuelve al tocar suelo' });
});
room({ id: 'campamento', area: 'bosque', after: ['dashes', 9, 13], W: 56, H: 14, theme: 'forest', music: 'forest', title: 'El campamento de la PDC' }, (m) => {
  m.fill(0, 13, 56, 1);
  m.e('decor', 6, 12, { kind: 'tienda' }); m.e('decor', 20, 12, { kind: 'tienda' }); m.e('decor', 13, 12, { kind: 'hoguera' });
  m.fill(29, 6, 5, 1, '-'); m.fill(30, 9, 3, 1, '-'); m.e('decor', 29, 12, { kind: 'atalaya' });
  m.fill(46, 8, 3, 1, '-'); m.fill(50, 5, 3, 1, '-');
  m.set(3, 12, 'Y'); m.set(16, 12, 'L'); m.set(40, 12, 'Y');
  m.e('paladin', 22, 12, { patrol: [14, 28], hostile: true });
  m.e('blindado', 37, 12, { patrol: [34, 44], hostile: true });
  m.e('ballestero', 31, 5, { hostile: true });
  m.e('paladin', 47, 12, { patrol: [44, 53], hostile: true });
  m.e('lauburu', 51, 4, { id: 'L3' });
  m.e('hint', 3, 12, { text: 'El blindado para los disparos de frente: pásale por encima con el dash y dispárale por detrás' });
});
room({ id: 'buho', area: 'bosque', after: ['campamento', 13, 13], W: 32, H: 14, theme: 'forest', music: 'forest', title: 'El claro' }, (m) => {
  m.fill(0, 13, 32, 1);
  m.fill(6, 9, 4, 1, '-'); m.fill(22, 9, 4, 1, '-'); m.fill(14, 6, 4, 1, '-');
  m.fill(31, 0, 1, 9);
  m.set(2, 12, 'Y'); m.set(29, 12, 'Y');
  m.e('gate', 31, 9, { w: 1, h: 4, flag: 'buho' });
  m.e('buho', 16, 3);
  m.e('trigger', 8, 6, { w: 2, h: 7, script: 'buho_in', once: true });
});
room({ id: 'vista', area: 'bosque', after: ['buho', 13, 9], W: 24, H: 14, theme: 'vista', music: 'forest' }, (m) => {
  m.fill(0, 9, 18, 5);
  m.e('trigger', 11, 5, { w: 2, h: 4, script: 'vista', once: true });
});

// ------------------------------------------------------------------ Páginas del prólogo
Object.assign(PAGES, {
  p5: ['Página de la Ascensión · V', 'Orden de traslado. Los naipes viajarán a la fortaleza de Eibar «por ser un pueblo donde nunca pasa nada». Firmado: general Narbaiza.'],
  p6: ['Página de la Ascensión · VI', 'Ficha de personal. Dra. E. L., ingeniera de cadenas. Observación del comandante: «Pregunta demasiado por el sujeto D. Vigilarla.»'],
  p7: ['Página de la Ascensión · VII', 'Carta sin enviar, encontrada en un bote: «Si el naipe dorado elige a alguien, que no sea un soldado. Que sea alguien que sepa correr.»'],
  p8: ['Página de la Ascensión · VIII', 'Registro de la fortaleza. «Los cuatro naipes apagados se calientan un poco cuando alguien mueve el dorado. Como si se buscaran.»'],
});

// ------------------------------------------------------------------ Guiones del prólogo
Object.assign(SCRIPTS, {
  // I · La última noche
  intro: [
    ['player', 'hide'],
    ['actor', 'jon', 'jon', -2, 7, { face: 1 }], ['actor', 'iker', 'iker', 7, 7, { face: -1 }],
    ['cam', 7, 6, 3],
    ['title', 'Prólogo · I', 'La última noche', 3],
    ['move', 'jon', 3, { run: true }], ['mode', 'jon', 'land'], ['wait', 0.15], ['mode', 'jon', 'idle'],
    ['say', 'iker', '¡Jon! Llegas tarde. Las patrullas cambian de turno a medianoche.'],
    ['say', 'jon', 'Llego cuando llego. ¿De verdad vamos a entrar en la fortaleza?'],
    ['say', 'iker', 'Dicen que guardan algo que brilla. Algo de la Academia. Quiero verlo antes de irme a la ciudad.'],
    ['say', 'jon', 'Antes de irte. Ya.'],
    ['mode', 'iker', 'point'],
    ['say', 'iker', 'Por los tejados, como siempre. El último paga las sidras.'],
    ['move', 'iker', 9, { run: true }],
    ['jump', 'iker', 5, 2.4, { dur: 0.55, then: 'run' }],
    ['move', 'iker', 21, { run: true }],
    ['remove', 'iker'],
    ['camfree'],
    ['player', 'show'],
  ],
  iker_reto: [
    ['say', 'iker', 'Te estaba esperando. ¿Una carrera hasta el acantilado? Yo voy por la calle; tú, por los tejados.'],
    ['say', 'jon', 'Por la calle es más corto.'],
    ['say', 'iker', 'Por eso. ¡Ya!'],
    ['do', 'flag', 'iker_reto'],
    ['do', 'race', 'iker', 26],
  ],
  race_iker_ok: [
    ['say', 'iker', '¿Ya estás aquí? Seguro que has hecho trampa.'],
    ['say', 'jon', 'Los tejados no tienen esquinas.'],
    ['say', 'iker', 'Toma, anda. Lo gané en las fiestas. Que te dé suerte ahí dentro.'],
    ['do', 'lauburu', 'L1'],
  ],
  race_iker_fail: [['do', 'hint', 'Iker ha llegado antes. Ve a buscarle al final de los tejados.']],
  iker_meta: [
    ['if', 'race_iker', [['say', 'iker', 'La próxima vez voy yo por los tejados.']],
      [['say', 'iker', '¡Lento! Las sidras corren de tu cuenta.'], ['say', 'jon', 'Había un gato en el camino.']]],
  ],
  iker2: [
    ['say', 'iker', 'Por el desagüe. Los paladines miran hacia el mar, no hacia dentro.'],
    ['say', 'iker', 'Yo vigilo aquí fuera. Si te ven, sal corriendo y vuelve a intentarlo.'],
    ['say', 'jon', 'Qué plan tan bueno. «Que no te vean».'],
  ],
  naipe: [
    ['jonActor'], ['cam', 14.5, 23.5, 2.5],
    ['say', 'jon', 'Cinco naipes. Cuatro apagados... y uno dorado.'],
    ['actor', 'card', 'naipe', 14, 0, { px: 225, py: 412 }],
    ['fly', 'card', [14.05, 21.6], 14],
    ['mode', 'jon', 'reach'],
    ['say', 'jon', 'Está caliente. Como si me estuviera mirando.'],
    ['fly', 'card', 'jon', 70],
    ['remove', 'card'],
    ['fx', 'flash', 0.5], ['sfx', 'copy'],
    ['mode', 'jon', 'armsup', '#f2c45a'],
    ['fx', 'burst', 'jon', 0, ['#f2c45a', '#ffe7a3', '#ffffff'], 50, 120],
    ['fx', 'shake', 4],
    ['do', 'gainDestino'],
    ['wait', 0.9], ['mode', 'jon', 'kneel'],
    ['say', 'jon', '¡Aah! Me quema... ¡la muñeca!'],
    ['wait', 0.5], ['mode', 'jon', 'idle'],
    ['title', 'El Destino', 'la marca que copia a las demás', 3],
    ['say', 'jon', 'Un dibujo de luz. Como en los cuentos de amona.'],
    ['do', 'alarm'], ['fx', 'shake', 3],
    ['say', 'paladin', '¡Intrusos en la cámara! ¡Cerrad la torre!'],
    ['camfree'],
    ['say', 'jon', 'Arriba. Siempre arriba.'],
  ],
  endP1: [
    ['jonActor'],
    ['move', 'jon', 63, { run: true }],
    ['jump', 'jon', 5, 1.5, { dy: 9, dur: 1, mode: 'fall', then: 'fall' }],
    ['fade', 'out', 0.5], ['sfx', 'land'],
    ['wait', 0.6],
    ['goto', 'plaza', 2, 12],
  ],
  // II · La plaza
  plaza_in: [
    ['actor', 'vecina', 'vecina', 14, 12, { face: 1 }], ['actor', 'vecino', 'vecino', 17, 12, { face: 1 }],
    ['actor', 'cartero', 'cartero', 19, 12, { face: 1 }], ['actor', 'panadera', 'panadera', 33, 12, { face: -1 }],
    ['actor', 'pescador', 'pescador', 36, 12, { face: -1 }],
    ['actor', 'martin', 'martin', 25, 12, { face: 1, mode: 'kneel' }],
    ['actor', 'narbaiza', 'narbaiza', 28, 12, { face: -1 }],
    ['actor', 'p1', 'paladin', 30, 12, { face: -1 }], ['actor', 'p2', 'paladin', 23, 12, { face: 1 }],
    ['title', 'Prólogo · II', 'La plaza', 3],
    ['bubble', 'vecina', '¿Qué hace aquí el general?', 3],
    ['letterbox', false],
  ],
  plaza: [
    ['jonActor'], ['cam', 24, 8, 2.5],
    ['say', 'narbaiza', 'Eibar. Un pueblo donde nunca pasa nada. Por eso escondimos aquí algo nuestro.'],
    ['say', 'narbaiza', 'Y alguien entró en la fortaleza a por ello. Alguien de este pueblo.'],
    ['face', 'narbaiza', -1], ['mode', 'narbaiza', 'cast', '#d1162b'],
    ['fx', 'stream', 'martin', 'narbaiza', '#d1162b', 2.5], ['mode', 'martin', 'hurt'], ['sfx', 'hurt'],
    ['say', 'martin', '¡Yo no sé nada! ¡No sé nada de ningún naipe!'],
    ['bubble', 'vecina', '¡Déjalo!', 2], ['bubble', 'cartero', 'Martín...', 2],
    ['move', 'jon', 22, { run: true, then: 'armsup' }],
    ['say', 'jon', '¡Basta! Él no tiene nada que ver.'],
    ['mode', 'narbaiza', 'idle'], ['mode', 'martin', 'kneel'],
    ['say', 'narbaiza', '¿Y tú cómo lo sabes, chico?'],
    ['mode', 'narbaiza', 'cast', '#d1162b'], ['fx', 'flash', 0.25], ['sfx', 'hurt'],
    ['fx', 'burst', 'jon', 0, ['#d1162b', '#ff5a6a'], 24, 90],
    ['jump', 'jon', -6, 1.4, { dur: 0.5, mode: 'hurt', then: 'lie' }],
    ['fx', 'shake', 5], ['mode', 'martin', 'lie'],
    ['wait', 0.9],
    ['say', 'narbaiza', 'Las marcas son una enfermedad, chico. Y yo soy la cura.'],
    ['move', 'narbaiza', 52, { wait: false }], ['move', 'p1', 54, { wait: false }], ['move', 'p2', 53, { wait: false }],
    ['wait', 1.2],
    ['move', 'vecina', 15, { run: true, then: 'kneel' }],
    ['bubble', 'vecina', '¡Jon! ¿Me oyes?', 2.5], ['wait', 1.6],
    ['fade', 'out', 1],
    ['goto', 'callejon', 6, 12],
  ],
  callejon: [
    ['player', 'hide'],
    ['actor', 'jon', 'jon', 6, 12, { face: 1 }], ['actor', 'iker', 'iker', 22, 12, { face: -1 }],
    ['cam', 15, 8, 3],
    ['title', 'Esa noche', 'El callejón', 2.5],
    ['move', 'jon', 17],
    ['say', 'iker', 'Te han dejado la cara bonita.'],
    ['say', 'jon', '¿Has venido a reírte?'],
    ['say', 'iker', 'He venido a despedirme. Mañana me voy a Ibaia.'],
    ['move', 'iker', 25, { speed: 30 }], ['face', 'iker', -1],
    ['say', 'iker', 'Alguien tiene que cambiar las cosas desde dentro. Si me alisto...'],
    ['say', 'jon', '¿Alistarte? ¿En la PDC? ¿Después de lo de hoy?'],
    ['say', 'iker', '¡Precisamente por lo de hoy!'],
    ['mode', 'jon', 'point'],
    ['say', 'jon', 'Esos casi matan a Martín. Y a mí.'],
    ['mode', 'jon', 'idle'],
    ['say', 'iker', 'Por eso hay que estar dentro. No se cambia nada saltando tejados, Jon.'],
    ['face', 'iker', 1], ['move', 'iker', 34, { wait: false }], ['fadeActor', 'iker', -0.6],
    ['wait', 1.4],
    ['say', 'jon', '...'],
    ['mode', 'jon', 'kneel'], ['wait', 1.2],
    ['fade', 'out', 1],
    ['goto', 'casa', 14, 12],
  ],
  // III · Cinco días
  casa_in: [
    ['jonActor'], ['player', 'hide'],
    ['tint', 'jon', null],
    ['cam', 12, 8, 3],
    ['title', 'Prólogo · III', 'Cinco días', 3],
    ['say', 'abuela', 'Arriba ese ánimo, que el moratón ya se te está poniendo verde. Eso es que cura.'],
    ['say', 'jon', 'Amona, la muñeca... no se lo digas a nadie.'],
    ['say', 'abuela', '¿Qué muñeca? Yo solo veo una venda. Y una venda no es asunto de nadie.'],
    ['say', 'abuela', 'Hoy me haces los recados: pan donde Miren, en el mercado; pescado donde Patxi, en el muelle; y subes al mirador a ver si viene el barco del correo.'],
    ['say', 'abuela', 'Y nada de tejados. Bueno. Pocos tejados.'],
    ['camfree'],
    ['do', 'hint', 'Recados: pan (mercado, a la derecha), pescado (muelle, a la izquierda), correo (mirador). Mapa: ESC'],
  ],
  abuela: [
    ['do', 'all', 'recados', ['pan', 'pescado', 'correo']],
    ['if', 'recados', [['script', 'cincoDias']], [
      ['say', 'abuela', 'Pan donde Miren, pescado donde Patxi, y el mirador, que se sube entre las casas de la calle mayor.'],
      ['if', 'pan', [['say', 'abuela', 'El pan ya está. Huele que alimenta.']], []],
      ['if', 'pescado', [['say', 'abuela', 'Qué besugo más hermoso. Patxi siempre te guarda el mejor.']], []],
    ]],
  ],
  cincoDias: [
    ['jonActor'], ['cam', 12, 8, 3],
    ['say', 'abuela', 'Todo. Y sin romperte nada. Mira tú.'],
    ['say', 'abuela', '¿Que el barco del correo está parado en la bocana? La PDC para hasta las cartas. En fin.'],
    ['fade', 'out', 0.6], ['theme', 'atardecer'], ['fade', 'in', 0.6],
    ['title', 'Día 2', 'Las cajas del puerto', 2],
    ['mode', 'jon', 'carry'], ['move', 'jon', 24, { then: 'carry' }], ['move', 'jon', 9, { then: 'carry' }], ['mode', 'jon', 'idle'],
    ['fade', 'out', 0.6], ['theme', 'dia'], ['fade', 'in', 0.6],
    ['title', 'Día 3', 'Patrullas por el pueblo', 2],
    ['actor', 'pa', 'paladin', -2, 12, { face: 1 }], ['actor', 'pb', 'paladin', -5, 12, { face: 1 }],
    ['mode', 'jon', 'crouch'],
    ['move', 'pa', 36, { wait: false }], ['move', 'pb', 33],
    ['remove', 'pa'], ['remove', 'pb'], ['mode', 'jon', 'idle'],
    ['fade', 'out', 0.6], ['theme', 'atardecer'], ['fade', 'in', 0.6],
    ['title', 'Día 4', 'La foto de la cocina', 2],
    ['say', 'abuela', 'Mira, aquí estáis Iker y tú, con siete años, subidos al frontón. Siempre arriba.'],
    ['say', 'jon', 'Siempre arriba. ¿Crees que estará bien en la ciudad?'],
    ['say', 'abuela', 'Creo que Iker se parece mucho a ti. Eso me preocupa y me tranquiliza a la vez.'],
    ['fade', 'out', 0.8], ['theme', 'storm'], ['music', 'storm'], ['fade', 'in', 0.8],
    ['title', 'Día 5', 'La tormenta', 2.5],
    ['say', 'abuela', 'Entra en casa, Jon. Esta tormenta no es normal.'],
    ['do', 'hideNpc', 'abuela'], ['actor', 'amona', 'abuela', 15, 12, { face: -1 }],
    ['move', 'amona', 8, { wait: false }], ['move', 'jon', 8],
    ['fadeActor', 'jon', -2], ['fadeActor', 'amona', -2], ['wait', 0.8],
    ['fx', 'lightning', 20], ['wait', 0.7], ['fx', 'lightning', 9],
    ['fx', 'debris', 3, 6, 50, 10], ['fx', 'shake', 9], ['sfx', 'break'], ['fx', 'lightning', 6],
    ['wait', 1.2],
    ['fade', 'out', 1.2],
    ['goto', 'ruina', 13, 12],
  ],
  vecina: [
    ['say', 'vecina', 'Dicen que el general sigue en la fortaleza. Que no se irá sin lo que busca.'],
    ['say', 'vecina', 'Y que en Ibaia han levantado muros de luz alrededor de los barrios. Muros, Jon. De luz.'],
  ],
  vecino: [
    ['say', 'vecino', 'Martín ya anda. Despacio, pero anda. Dice que sintió la sangre salirle por los brazos sin herida.'],
    ['say', 'vecino', 'Eso no es medicina. Eso es una marca.'],
  ],
  cartero: [
    ['say', 'cartero', 'Ni una carta en cinco días. La PDC tiene el barco parado en la bocana.'],
    ['say', 'cartero', 'Sube al mirador y lo verás tú mismo.'],
  ],
  panadera: [
    ['if', 'pan', [['say', 'panadera', 'Dale recuerdos a tu amona. Y que no se le enfríe.']], [
      ['if', 'gato', [
        ['say', 'panadera', '¡Txuri! Ven aquí, sinvergüenza. Gracias, Jon.'],
        ['say', 'panadera', 'Toma: la barra de tu amona, y otra para ti, que estás en los huesos.'],
        ['do', 'flag', 'pan'], ['do', 'hint', 'Tienes el pan'],
      ], [
        ['say', 'panadera', 'Jon, el pan te lo doy encantada, pero antes hazme un favor.'],
        ['say', 'panadera', 'Txuri, mi gato, se ha subido al tejado del almacén y no hay quien lo baje. Tú que trepas por todo...'],
      ]],
    ]],
  ],
  gato: [['say', 'jon', 'Ven aquí, Txuri. Así. Sin arañar.'], ['do', 'hint', 'Lleva el gato a Miren, la panadera']],
  pescador: [
    ['if', 'pescado', [['say', 'pescador', 'Que aproveche ese besugo.']], [
      ['if', 'red', [
        ['say', 'pescador', '¡La red, por fin! Con esto mañana salgo a faenar.'],
        ['say', 'pescador', 'Toma, el besugo más gordo para tu amona.'],
        ['do', 'flag', 'pescado'], ['do', 'hint', 'Tienes el pescado'],
      ], [
        ['say', 'pescador', 'El pescado de tu amona está listo... pero tengo la red enganchada en lo alto de la cofa.'],
        ['say', 'pescador', 'Con estas rodillas yo no subo. Sube por las vergas y suéltala, anda.'],
      ]],
    ]],
  ],
  red: [['say', 'jon', 'Ya está. Patxi va a poder salir a faenar.']],
  mirador: [
    ['jonActor'], ['mode', 'jon', 'point'],
    ['say', 'jon', 'Ahí está el barco del correo... parado en la bocana.'],
    ['say', 'jon', 'Y dos lanchas de la PDC a su lado. Están registrando las sacas una a una.'],
    ['mode', 'jon', 'idle'],
    ['say', 'jon', 'La fortaleza tiene el doble de antorchas que antes. Me buscan a mí.'],
    ['do', 'flag', 'correo'],
    ['do', 'hint', 'Ya sabes qué pasa con el correo. Vuelve con amona'],
  ],
  ane: [
    ['if', 'race_ane', [['say', 'ane', 'Vale, vale, eres rápido. Pero el año que viene te gano.']], [
      ['say', 'ane', '¿Tú eres el que corre por los tejados? Demuéstralo: sube a lo alto del mirador en menos de cincuenta segundos.'],
      ['choice', [['¡Vamos!', 'ane_go', true], ['Ahora no', 'ane_go', false]]],
      ['if', 'ane_go', [['say', 'ane', 'Tres, dos, uno... ¡ya!'], ['do', 'race', 'ane', 50]], []],
    ]],
  ],
  race_ane_ok: [['say', 'jon', 'Cincuenta segundos. Ane va a flipar.'], ['do', 'lauburu', 'L2']],
  race_ane_fail: [['do', 'hint', 'Se acabó el tiempo. Habla con Ane, en el mercado, para volver a intentarlo']],
  // IV · La tormenta
  ruina: [
    ['player', 'hide'],
    ['actor', 'jon', 'jon', 12, 12, { mode: 'lie', face: 1 }], ['actor', 'radio', 'radio', 14, 12],
    ['cam', 13, 8, 3],
    ['fx', 'debris', 10, 5, 24, 6], ['wait', 1.5],
    ['title', 'Prólogo · IV', 'La tormenta', 3],
    ['mode', 'jon', 'crouch'], ['wait', 0.8], ['mode', 'jon', 'idle'],
    ['say', 'jon', '¿Amona?'],
    ['face', 'jon', -1], ['wait', 0.7], ['face', 'jon', 1],
    ['say', 'jon', '¡Amona!'],
    ['fx', 'lightning', 24],
    ['move', 'jon', 13, { then: 'kneel' }], ['remove', 'radio'], ['wait', 0.8],
    ['say', 'radio', '...shhhh...'],
    ['say', 'jon', 'Su radio. Solo queda su radio.'],
    ['wait', 1], ['mode', 'jon', 'idle'], ['fx', 'lightning', 28],
    ['say', 'jon', 'Esos rayos no caen del cielo. Salen de alguien. Del puerto.'],
  ],
  desconocido1: [
    ['jonActor'], ['cam', 40, 8, 2.5],
    ['say', 'desconocido', '¡Eh! Tú... ayúdame. Me siguen. La PDC.'],
    ['say', 'jon', 'Los rayos... ¿has sido tú? ¡Mi casa...!'],
    ['say', 'desconocido', 'No sé pararlo. Llevo días sin poder pararlo. Lo siento. Lo siento mucho.'],
    ['say', 'jon', 'Dame la mano. Creo que sé hacer algo.'],
    ['player', 'show'],
    ['do', 'hint', 'Mantén E junto a él para copiar su marca. Si sueltas, se corta.'],
    ['do', 'allowCopy'],
  ],
  copiedEnergia: [
    ['jonActor', 'reach'], ['cam', 42, 8, 2.5],
    ['mode', 'jon', 'reach', '#9fd0ff'],
    ['fx', 'flash', 0.3], ['mode', 'jon', 'armsup', '#9fd0ff'],
    ['fx', 'burst', 'jon', 0, ['#9fd0ff', '#2f8bff', '#f2c45a', '#ffffff'], 50, 120], ['sfx', 'copy'], ['fx', 'shake', 3],
    ['wait', 1.1],
    ['title', 'Energía', 'copiada · copiar no es quitar', 2.6],
    ['mode', 'jon', 'idle'],
    ['say', 'desconocido', 'Sigue aquí. La mía sigue aquí. ¿Qué eres tú?'],
    ['say', 'desconocido', 'Escucha. Si me cogen, hablaré. De ti, del pueblo, de todos. No aguanto el dolor.'],
    ['say', 'jon', '...'],
    ['choice', [['Matarle', 'mercy', false], ['Perdonarle', 'mercy', true]]],
    ['if', 'mercy', [
      ['say', 'jon', 'Vete. Corre hacia el monte y no vuelvas.'],
      ['say', 'desconocido', 'No olvidaré esto. Te lo juro por mi marca.'],
      ['do', 'hideNpc', 'desconocido'], ['actor', 'desc', 'desconocido', 44, 12, { face: 1 }],
      ['move', 'desc', 58, { run: true, wait: false }], ['fadeActor', 'desc', -0.7], ['wait', 1.2],
    ], [
      ['say', 'jon', 'Lo siento.'],
      ['mode', 'jon', 'cast', '#9fd0ff'], ['fx', 'lightning', 44],
      ['do', 'hideNpc', 'desconocido'], ['actor', 'desc', 'desconocido', 44, 12, { mode: 'lie', face: -1 }],
      ['wait', 1.2], ['fadeActor', 'desc', -0.5], ['mode', 'jon', 'kneel'], ['wait', 1.4], ['mode', 'jon', 'idle'],
    ]],
    ['fx', 'lightning', 30],
    ['actor', 'p1', 'paladin', 54, 12, { face: -1 }], ['actor', 'p2', 'paladin', 57, 12, { face: -1 }],
    ['move', 'p1', 45, { wait: false }], ['move', 'p2', 47],
    ['say', 'paladin', '¡Quieto! ¡Por orden de la Contención!'],
    ['face', 'jon', 1], ['mode', 'jon', 'kneel'],
    ['actor', 'carro', 'carro', 60, 12, { face: -1 }], ['move', 'carro', 48, { speed: 60 }],
    ['say', 'paladin', 'Otro marcado. Al carro.'],
    ['move', 'jon', 49, { speed: 34 }], ['remove', 'jon'],
    ['move', 'carro', 64, { speed: 50, wait: false }], ['move', 'p1', 64, { wait: false }], ['move', 'p2', 64, { wait: false }],
    ['wait', 1.6],
    ['fade', 'out', 1.2],
    ['goto', 'viaducto', 2, 7],
  ],
  // V · El despertar
  viaducto: [
    ['player', 'hide'],
    ['actor', 'carro', 'carro', -4, 7, { face: 1 }], ['actor', 'p1', 'paladin', 0, 7, { face: 1 }], ['actor', 'p2', 'paladin', -7, 7, { face: 1 }],
    ['cam', 24, 6, 3],
    ['title', 'Prólogo · V', 'El despertar', 3],
    ['move', 'carro', 19, { speed: 40, wait: false }], ['move', 'p1', 23, { speed: 40, wait: false }], ['move', 'p2', 16, { speed: 40 }],
    ['fx', 'burst', 32, 3, ['#a24dff', '#e6b0ff', '#d1162b'], 30, 120], ['sfx', 'orb'], ['fx', 'flash', 0.2],
    ['bubble', 'p1', '¡Emboscada!', 1.5], ['wait', 0.8],
    ['fx', 'burst', 21, 7, ['#a24dff', '#e6b0ff', '#ffffff'], 50, 150], ['fx', 'shake', 9], ['sfx', 'break'],
    ['jump', 'p1', 6, 2, { dy: 10, dur: 1, mode: 'hurt', wait: false }],
    ['fly', 'carro', [23, 15], 110, { spin: 3 }],
    ['fx', 'shake', 6], ['wait', 0.5],
    ['fade', 'out', 1],
    ['goto', 'forest1', 3, 12],
  ],
  despertar: [
    ['player', 'hide'],
    ['actor', 'jon', 'jon', 3, 12, { mode: 'lie', face: 1 }],
    ['cam', 8, 8, 3],
    ['wait', 1.4], ['mode', 'jon', 'crouch'], ['wait', 0.7], ['mode', 'jon', 'idle'],
    ['say', 'jon', 'El carro... ¿Dónde están los paladines?'],
    ['say', 'jon', 'Los grilletes se han roto con el golpe.'],
    ['mode', 'jon', 'reach', '#9fd0ff'], ['wait', 0.6],
    ['say', 'jon', 'Y la Energía sigue aquí, en el brazo. Zumba.'],
    ['mode', 'jon', 'idle'],
  ],
  buho_in: [
    ['jonActor'], ['cam', 16, 6, 2],
    ['fx', 'shake', 4], ['sfx', 'alert'],
    ['say', 'jon', 'Ese no es un vigía normal. Es el que guiaba el convoy.'],
    ['title', 'Búho Mayor', 'vigía de latón del convoy', 2.2],
    ['do', 'bossStart'],
  ],
  buho_fin: [
    ['say', 'jon', 'Se acabó el búho. Hay luz al otro lado del claro.'],
  ],
  vista: [
    ['jonActor'], ['do', 'pan'], ['wait', 1.6],
    ['say', 'jon', 'Ibaia.'],
    ['say', 'jon', 'Y esos muros de luz... ámbar. Cerrando cada barrio.'],
    ['say', 'radio', '...shhhh... si alguien me oye... shhhh... baja por la sierra... busca las caracolas de bronce...'],
    ['say', 'jon', '¿La radio de amona?'],
    ['title', 'Acto I', 'Ibaia, la ciudad de los diez velos', 3.5],
    ['goto', 'faroles1', 4, 12],
  ],
});
