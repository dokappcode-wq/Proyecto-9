// El prólogo: cinco capítulos jugables, de los tejados de Eibar a la primera vista de Ibaia.
'use strict';

// Trayecto de Iker en la carrera. Coordenadas de casilla: x, y como tope de la casilla que pisa.
// Cada salto lleva dx casillas, dy filas de altura (negativo, subir) y h casillas de arco.
const RACE_ROUTE = [
  { x: 5.2, speed: 66 }, { jump: 4.0, h: 1.4, dur: 0.5, dy: 0 },
  { x: 13.0, speed: 66 }, { jump: 5.2, h: 2.2, dur: 0.6, dy: -1 },
  { x: 22.5, speed: 66 }, { jump: 1.6, h: 0.8, dur: 0.35, dy: 1 },
  { x: 31.5, speed: 66 }, { jump: 4.8, h: 3.8, dur: 0.8, dy: -3 },
  { x: 37.6, speed: 66 }, { jump: 1.6, h: 0.6, dur: 0.35, dy: 1 },
  { x: 41.0, speed: 66 }, { jump: 4.3, h: 1.6, dur: 0.55, dy: 0 },
  { x: 56.5, speed: 66 }, { arrive: true },
];

// ================================================================== I · La última noche (Eibar, de noche)
// Cada sala tiene una línea de parkour continua. Entre los tejados hay callejones con
// balcones: caer no mata, pero cuesta volver a subir. Las chispas marcan la línea buena.
room({ id: 'eibar1', area: 'eibar', x: 0, y: 0, W: 72, H: 20, theme: 'eibar', music: 'eibar', title: 'Eibar', sub: 'Prólogo · La última noche', onEnter: 'intro' }, (m) => {
  m.fill(0, 19, 72, 1);
  m.roof(0, 8, 10);
  m.ladder(10, 3, 8, 19);
  m.roof(13, 8, 9); m.set(17, 7, '#');
  m.ladder(22, 3, 9, 19);
  m.roof(25, 9, 9); m.fill(28, 0, 3, 8);
  m.fill(34, 0, 2, 7); m.roof(34, 9, 5);
  m.roof(39, 3, 9);
  m.roof(48, 5, 9); m.set(52, 4, '#');
  m.ladder(57, 3, 5, 19);
  m.roof(60, 3, 12);
  // Detalles
  m.deco('chimenea', 3, 7, { h: 1 }); m.deco('antena', 6, 7); m.deco('chimenea', 20, 7, { h: 1 });
  m.deco('cuerda', 9, 8, { w: 5 }); m.deco('cuerda', 21, 8, { w: 5 });
  m.deco('maceta', 32, 8); m.deco('antena', 44, 2); m.deco('chimenea', 66, 2, { h: 2 });
  m.deco('farola', 5, 18); m.deco('farola', 30, 18); m.deco('farola', 52, 18);
  m.deco('cartel', 14, 7, { text: 'ARRANTZALE' });
  // Chispas: la línea de parkour
  m.arc(8.5, 7, 13.5, 7, 3, 1.6); m.arc(16, 6.6, 18.6, 6.6, 2, 1); m.arc(20.5, 7, 25.5, 8, 3, 1.6);
  m.row(27, 31, 8.2); m.col(37, 1.5, 7.5); m.arc(56, 4, 60.5, 2.5, 3, 1.4); m.row(63, 69, 2);
  m.e('hint', 2, 7, { text: '← →  correr · las chispas doradas marcan el camino' });
  m.e('hint', 9, 7, { text: 'ESPACIO / Z  saltar · suelta antes para saltar menos' });
  m.e('hint', 15, 7, { text: 'Corre contra lo bajo: lo saltas sin frenar' });
  m.e('hint', 25, 8, { text: '↓ corriendo: deslizarse por debajo' });
  m.e('hint', 36, 8, { text: 'Salta contra una pared, y otra vez hacia la otra' });
  m.e('hint', 11, 18, { text: 'Si caes a la calle, vuelve a subir por los balcones' });
});
room({ id: 'puerto', area: 'eibar', after: ['eibar1', 3, 3], W: 80, H: 20, theme: 'eibar', music: 'eibar', title: 'Los tejados del puerto' }, (m) => {
  m.fill(0, 19, 80, 1);
  m.roof(0, 3, 8);
  m.roof(10, 6, 12);                                 // pista para esprintar
  m.ladder(22, 6, 7, 19);                            // si fallas el salto largo, se vuelve por aquí
  m.roof(28, 7, 8);
  m.roof(36, 11, 4); m.bounce(36, 10, 4, '#3e7cb1');  // puesto del mercado con toldo elástico
  m.roof(40, 2, 8);                                  // la casa alta: solo con el toldo
  m.plat(49, 5, 3); m.plat(53, 8, 3);                // lonas para bajar
  m.plat(49, 16, 3); m.plat(53, 13, 3); m.plat(49, 10, 3);
  m.roof(57, 10, 3); m.roof(61, 7, 2);
  m.roof(64, 4, 16); m.set(66, 3, '#'); m.fill(70, 0, 2, 3); m.set(76, 3, '#');
  m.e('pagina', 50, 18, { id: 'p5' });
  m.deco('chimenea', 3, 2, { h: 1 }); m.deco('maceta', 12, 5); m.deco('antena', 18, 5); m.deco('chimenea', 31, 6, { h: 2 });
  m.deco('cartel', 36, 10, { text: 'ARRAINA' }); m.deco('puesto', 24, 18, { col: '#c84a3a' }); m.deco('farola', 45, 18);
  m.deco('antena', 44, 1); m.deco('cuerda', 47, 4, { w: 10 }); m.deco('chimenea', 73, 3, { h: 1 });
  m.arc(21.5, 5, 28.5, 6, 4, 1.6); m.col(38, 0, 8); m.row(41, 46, 1);
  m.arc(47.5, 1.5, 50.5, 4, 2, 1); m.arc(52, 4, 54.5, 7, 2, 1); m.arc(56, 7, 58.5, 9, 2, 1);
  m.arc(59.5, 9, 61.5, 6, 2, 1.2); m.arc(62.5, 6, 64.5, 3, 2, 1.2); m.arc(65, 3, 67.5, 3, 2, 1); m.row(70, 71, 3.2, 1); m.arc(75, 3, 77.5, 3, 2, 1);
  m.e('hint', 12, 5, { text: 'Corre sin soltar: al rato esprintas y saltas mucho más lejos' });
  m.e('hint', 31, 6, { text: 'Toldo elástico: rebota. Mantén el salto al caer encima y subirás mucho más' });
  m.e('hint', 65, 3, { text: 'Encadena movimientos sin pararte: la racha sube y cada 5 te cura' });
});
room({ id: 'fachada', area: 'eibar', after: ['puerto', 4, 27], W: 32, H: 28, theme: 'eibar', music: 'eibar', title: 'La fachada de la cofradía' }, (m) => {
  m.fill(0, 27, 20, 1);
  m.fill(0, 6, 4, 17);                               // casa de la izquierda: se entra por debajo
  m.roof(20, 4, 12);                                 // la cofradía
  m.fill(14, 23, 3, 1); m.fill(8, 19, 3, 1); m.fill(14, 15, 3, 1); m.fill(8, 11, 3, 1); m.fill(13, 7, 4, 1);
  m.plat(4, 9, 2);                                   // balcón para el tejado de la izquierda
  for (const [x, y] of [[15, 22], [9, 18], [15, 14], [9, 10], [14, 6]]) m.deco('maceta', x, y);
  m.deco('cartel', 21, 10, { text: 'KOFRADIA' }); m.deco('farola', 2, 26); m.deco('chimenea', 1, 5, { h: 1 }); m.deco('antena', 27, 3);
  m.ch(15, 21); m.ch(9, 17); m.ch(15, 13); m.ch(9, 9); m.ch(14.5, 5); m.arc(16.5, 5, 20.5, 2.5, 2, 1);
  m.row(0.5, 2.5, 4.5, 1);
  m.e('hint', 4, 26, { text: 'Cornisas: salta junto al borde y empuja hacia él. ↑ o salto para subir, ↓ para soltarte' });
});
room({ id: 'tendederos', area: 'eibar', after: ['fachada', 4, 4], W: 72, H: 18, theme: 'eibar', music: 'eibar', title: 'Los tendederos' }, (m) => {
  m.fill(0, 17, 72, 1);
  m.roof(0, 4, 6);
  m.e('zip', 5, 2, { x2: 19, y2: 7 });
  m.ladder(6, 14, 9, 17);
  m.roof(20, 9, 6);
  m.bar(30, 7); m.bar(36, 7);                        // barras de tendedero sobre la calle
  m.ladder(26, 4, 9, 17);                            // si caes, se vuelve al principio de las barras
  m.roof(42, 9, 8);
  m.e('zip', 49, 7, { x2: 63, y2: 10 });
  m.plat(60, 15, 4);
  m.bounce(52, 16, 3, '#c9a24a'); m.plat(54, 6, 3);   // ruta alta opcional
  m.roof(64, 13, 8);
  m.deco('cuerda', 6, 5, { w: 14 }); m.deco('cuerda', 26, 4, { w: 16 }); m.deco('cuerda', 50, 4, { w: 14 });
  m.deco('maceta', 21, 8); m.deco('antena', 46, 8); m.deco('chimenea', 68, 12, { h: 1 }); m.deco('farola', 33, 16);
  m.ch(9, 3.4); m.ch(12, 4.4); m.ch(15, 5.4); m.arc(26, 8, 30, 8.5, 2, 1); m.arc(31, 8.5, 36, 8.5, 3, 2); m.arc(37, 8.5, 42.5, 8, 3, 2);
  m.ch(53, 8.2); m.ch(56, 9); m.ch(59, 9.8); m.row(54.5, 56.5, 5); m.col(53, 7, 13, 3);
  m.e('hint', 2, 3, { text: 'Salta a la cuerda de tender: te deslizas. Salta para soltarte' });
  m.e('hint', 21, 8, { text: 'Barras: salta hacia ellas y te agarras. ← → para balancearte, salto para soltarte' });
});
room({ id: 'carrera', area: 'eibar', after: ['tendederos', 13, 10], W: 64, H: 14, theme: 'eibar', music: 'eibar', title: 'La carrera' }, (m) => {
  m.fill(0, 10, 6, 4);
  m.fill(9, 10, 5, 4); m.set(11, 9, '#');
  m.fill(18, 9, 6, 5);
  m.fill(24, 10, 9, 4); m.fill(27, 0, 3, 5);
  m.fill(36, 7, 2, 7);
  m.fill(38, 8, 4, 6);
  m.fill(45, 8, 6, 6);
  m.fill(51, 8, 5, 1, '-'); m.fill(51, 13, 5, 1, '^');
  m.fill(56, 8, 8, 6);
  m.e('npc', 4, 9, { who: 'iker', key: 'iker_a', script: 'iker_reto', once: true, auto: 50, racer: 'iker' });
  m.e('meta', 57, 7, { id: 'iker' });
  m.deco('chimenea', 2, 9, { h: 1 }); m.deco('antena', 21, 8); m.deco('maceta', 31, 9); m.deco('chimenea', 47, 7, { h: 1 }); m.deco('antena', 60, 7);
  m.arc(5.5, 9, 9.5, 9, 3, 1.4); m.arc(10.5, 8.5, 12, 8.5, 1, 1); m.arc(13.5, 9, 18.5, 8, 3, 1.8);
  m.arc(32.5, 9, 36.5, 6, 3, 1.8); m.arc(41.5, 7, 45.5, 7, 3, 1.4); m.row(52, 55, 7);
  m.e('hint', 33, 9, { text: 'Lo que no alcanzas de un salto, lo alcanzas agarrándote' });
});
room({ id: 'acantilado', area: 'eibar', after: ['carrera', 8, 3], W: 48, H: 40, theme: 'acantilado', music: 'eibar', title: 'El acantilado' }, (m) => {
  m.fill(0, 3, 8, 31);                               // la última casa, sobre la roca
  m.fill(10, 8, 5, 3);                               // primer saliente
  m.crumble(15, 11, 6); m.fill(21, 11, 4, 3);        // rocas sueltas
  m.fill(22, 14, 3, 14); m.fill(28, 8, 2, 20);       // la chimenea de roca: deslizarse por las paredes
  m.bar(33, 6);                                      // ruta alta: a la muralla por la barra
  m.fill(0, 34, 48, 6);                              // la playa
  m.fill(38, 14, 10, 17);                            // muralla de la fortaleza (el desagüe, abajo)
  for (let x = 38; x < 48; x += 2) m.set(x, 13, '#');
  m.fill(16, 32, 2, 2); m.fill(32, 33, 1, 1);
  m.e('npc', 34, 33, { who: 'iker', script: 'iker2', once: true, auto: 60 });
  m.deco('chimenea', 2, 2, { h: 1 }); m.deco('antena', 5, 2); m.deco('farola', 36, 33);
  m.arc(7.5, 2.5, 11, 7, 3, 1); m.row(15.5, 20.5, 10, 1); m.col(26, 14, 26, 3);
  m.ch(28.5, 6.5); m.arc(30, 6.5, 33, 7, 2, 0.6); m.arc(34, 7.5, 38.5, 11.5, 3, 1.5); m.row(39, 46, 12);
  m.row(19, 35, 32.5, 4);
  m.e('hint', 10, 7, { text: 'Cae desde alto y pulsa ↓ al tocar el suelo: ruedas y no te haces daño' });
  m.e('hint', 15, 10, { text: 'Rocas sueltas: se caen poco después de pisarlas. ¡No te pares!' });
  m.e('hint', 21, 10, { text: 'Contra una pared en el aire te deslizas despacio' });
});
room({ id: 'desague', area: 'eibar', after: ['acantilado', 34, 15], W: 64, H: 16, theme: 'tunel', music: 'fort', title: 'El desagüe' }, (m) => {
  m.fill(0, 0, 64, 2); m.fill(0, 15, 64, 1); m.fill(0, 2, 1, 10);
  m.fill(6, 2, 8, 12);                               // gateo
  m.fill(16, 15, 4, 1, '^');
  m.fill(24, 15, 14, 1, '^');                        // canal con rejas rotas
  m.mover(23, 13, 34, 13, 3, 38, 0.8);               // la balsa
  m.mover(40, 14, 40, 7, 3, 42, 1);                  // el montacargas
  m.fill(43, 7, 14, 8); m.fill(43, 2, 14, 2);        // el conducto de arriba
  m.clear(48, 7, 4, 6); m.fill(48, 13, 4, 1, '^'); m.crumble(48, 7, 4);
  m.fill(59, 2, 5, 12);                              // gateo final
  m.row(7, 13, 14.2); m.arc(15, 13, 20.5, 13, 3, 1.8); m.row(25, 36, 11.5, 3); m.col(41, 7, 13, 2); m.row(44, 55, 5.5, 2); m.row(59, 63, 14.2);
  m.e('hint', 2, 14, { text: '↓ quieto: agáchate. Así te arrastras por donde no cabe nadie' });
  m.e('hint', 21, 14, { text: 'La balsa cruza el canal: súbete y deja que te lleve' });
  m.e('hint', 39, 14, { text: 'El montacargas sube solo. Espera encima' });
});
room({ id: 'fort1', area: 'eibar', after: ['desague', 15, 13], W: 48, H: 14, theme: 'fort', music: 'fort', stealth: true, title: 'La fortaleza', sub: 'Que no te vean' }, (m) => {
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
  m.ch(9, 8); m.ch(17, 5); m.ch(20, 5); m.col(43.5, 6, 11, 2.5);
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
  m.ch(10.5, 13.5); m.ch(19.5, 13.5); m.ch(28.5, 13.5); m.ch(37.5, 13.5);
  m.e('hint', 3, 4, { text: 'Ojos de cristal: no pases bajo su luz. Bajo los tejadillos no te ven' });
  m.e('hint', 22, 14, { text: 'Agachado junto a un barril, nadie te ve' });
});
room({ id: 'almacen', area: 'eibar', after: ['patio', 15, 13], W: 48, H: 14, theme: 'fort', music: 'fort', stealth: true, title: 'El almacén' }, (m) => {
  m.fill(0, 0, 48, 1); m.fill(0, 13, 48, 1); m.fill(0, 1, 1, 9); m.fill(47, 1, 1, 9);
  m.fill(4, 9, 6, 1, '-'); m.fill(12, 6, 8, 1, '-'); m.fill(22, 6, 6, 1, '-'); m.fill(30, 6, 8, 1, '-'); m.fill(40, 9, 5, 1, '-');
  // Pasarela alta: el guardia ve hacia abajo solo a unas casillas; por debajo se pasa
  m.fill(14, 8, 11, 1, '-');
  m.fill(29, 11, 2, 2, 'C');
  m.e('paladin', 18, 7, { patrol: [15, 23], face: 1 });
  // Segunda pasarela, sobre la salida: también se pasa por debajo
  m.fill(36, 8, 9, 1, '-');
  m.e('paladin', 40, 7, { patrol: [37, 43], face: -1 });
  m.e('escondite', 33, 12, { kind: 'cortina', w: 2 });
  m.e('escondite', 9, 12, { kind: 'cortina', w: 2 });
  m.e('pagina', 16, 5, { id: 'p8' });
  m.row(23, 26, 4.8); m.row(31, 36, 4.8);
  m.e('hint', 2, 12, { text: 'El de la pasarela solo ve lo que tiene justo debajo: pasa por abajo' });
  m.e('hint', 30, 12, { text: 'Tras una cortina, agachado, nadie te ve. Espera a que el guardia se dé la vuelta' });
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
  m.ch(2, 22.5); m.ch(20, 16.5); m.ch(2, 10.5); m.ch(19, 5.5);
  m.e('hint', 3, 26, { text: 'Espera bajo el rellano a que el guardia te dé la espalda' });
});
room({ id: 'fort2', area: 'eibar', after: ['torre', 5, 27], W: 32, H: 28, theme: 'fortout', music: 'fort', title: 'La cámara de los naipes', check: { flags: { naipe: true } } }, (m) => {
  m.fill(0, 0, 1, 24);
  m.fill(1, 20, 31, 1); m.clear(22, 20, 3, 1);
  m.fill(31, 7, 1, 21);                              // la salida está arriba: solo por la tirolina
  m.fill(0, 27, 32, 1);
  m.fill(13, 25, 3, 2);
  m.set(18, 26, 'C');
  m.fill(19, 23, 5, 1, '-');
  m.e('gate', 22, 20, { w: 3, h: 1, flag: 'naipe' });
  m.e('naipe', 14, 24);
  // Andamios en zigzag: se suben atravesándolos desde abajo hasta la tirolina
  m.fill(25, 17, 5, 1, '-');
  m.fill(19, 14, 8, 1, '-');
  m.fill(22, 11, 8, 1, '-');
  m.fill(14, 8, 10, 1, '-');
  m.fill(3, 5, 10, 1);
  m.fill(3, 6, 2, 14);
  m.e('zip', 12, 4, { x2: 32, y2: 5 });
  m.e('spawner', 0, 0, { flag: 'naipe', list: [['ballestero', 7, 4], ['vigia', 22, 6], ['paladin', 26, 16, { patrol: [25, 29] }], ['paladin', 21, 13, { patrol: [19, 26] }]] });
  m.ch(27, 15.5); m.ch(20.5, 12.5); m.ch(27, 9.5); m.ch(17, 6.5); m.ch(15, 7); m.ch(21, 7); m.row(16, 30, 5.6, 3);
  m.deco('antorcha', 6, 26); m.deco('antorcha', 26, 26);
});
room({ id: 'murallas', area: 'eibar', after: ['fort2', 7, 10], W: 96, H: 16, theme: 'fortout', music: 'ancla', title: 'Las murallas', sub: '¡Corre!', check: { goal: { x: 90, y: 0, w: 6, h: 13 } } }, (m) => {
  m.roof(0, 10, 14); for (const x of [4, 8, 12]) m.set(x, 9, '#');
  m.roof(17, 10, 10); for (const x of [20, 24]) m.set(x, 9, '#');
  m.plat(25, 7, 2); m.roof(27, 5, 4);
  m.bar(35, 3);                                      // de torre a torre por la barra
  m.roof(41, 5, 4);
  m.crumble(45, 8, 10);                              // almenas que se desmoronan
  m.roof(55, 10, 8); m.plat(58, 7, 3);
  m.roof(63, 4, 3);
  m.e('zip', 65, 2, { x2: 90, y2: 9 });              // la tirolina hasta el acantilado
  m.roof(66, 13, 30);
  m.e('paladin', 21, 9, { patrol: [17, 26], hostile: true });
  m.e('ballestero', 29, 4, { hostile: true });
  m.e('paladin', 58, 9, { patrol: [55, 62], hostile: true });
  m.e('vigia', 40, 2, { hostile: true, patrol: [34, 50] });
  m.e('exit', 90, 0, { w: 6, h: 12, script: 'endP1' });
  m.arc(13.5, 9, 17.5, 9, 3, 1.4); m.arc(25.5, 6, 28, 4, 2, 0.8); m.arc(31, 4, 35, 4.5, 2, 0.8); m.arc(36, 4.5, 41.5, 4, 3, 1.6);
  m.row(46, 54, 7, 2); m.arc(61, 6, 63.5, 3, 2, 1); m.ch(70, 3.5); m.ch(76, 5.2); m.ch(82, 6.8);
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
// El pueblo es un nudo: cada recado queda lejos de los otros y se llega por arriba.
room({ id: 'muelle', area: 'pueblo', x: -64, y: -6, W: 64, H: 20, theme: 'dia', music: 'title', title: 'El muelle',
  check: { start: { x: 62, y: 18 }, goal: { x: 21, y: 1, w: 4, h: 4 } } }, (m) => {
  m.fill(48, 19, 16, 1);                             // el muelle de piedra
  m.fill(50, 17, 2, 2, 'C'); m.set(52, 18, 'C');
  // Barco 1, el viejo (izquierda)
  m.fill(2, 16, 12, 4, 'W'); m.deco('mastil', 7, 15, { h: 10 });
  m.plat(3, 13, 9); m.plat(4, 10, 7); m.plat(5, 7, 5);
  // Barco 2, la trainera de Patxi: la red está en la cofa
  m.fill(18, 17, 12, 3, 'W'); m.deco('mastil', 23, 16, { h: 13 });
  m.plat(19, 14, 9); m.plat(20, 11, 7); m.plat(21, 8, 5); m.plat(22, 5, 3);
  // Barco 3 (derecha), con una lona tensa en cubierta
  m.fill(34, 16, 12, 4, 'W'); m.deco('mastil', 39, 15, { h: 9 });
  m.bounce(43, 15, 2, '#e8e0d0'); m.plat(36, 12, 4); m.plat(41, 9, 4);
  m.bar(32, 10);                                     // la jarcia entre mástiles
  m.mover(14, 17, 16, 17, 2, 18, 0.6);               // una boya que va y viene entre los barcos
  m.e('zip', 25, 4, { x2: 47, y2: 13 });            // de la cofa al muelle
  m.e('item', 23, 4, { kind: 'red', flag: 'red', prompt: 'Soltar la red', script: 'red' });
  m.e('pagina', 6, 6, { id: 'p7' });
  m.e('npc', 56, 18, { who: 'pescador', script: 'pescador' });
  m.deco('farola', 60, 18); m.deco('cuerda', 23, 6, { w: 16 }); m.deco('maceta', 49, 16);
  m.arc(47, 18, 44, 15, 2, 1.4); m.arc(43, 13, 38, 11, 2, 1.4); m.ch(34.5, 11.2); m.arc(31.5, 10.5, 26, 10, 2, 1.6);
  m.col(24, 7, 9.5, 2.5); m.ch(23.5, 3.6); for (const x of [29, 33, 37, 41, 45]) m.ch(x, +(4.6 + (x - 25) * 9 / 22).toFixed(1));
  m.arc(17, 16, 13, 15, 2, 1.4); m.col(7, 6, 12, 3);
  m.e('hint', 58, 18, { text: 'El muelle de Patxi' });
  m.e('hint', 45, 15, { text: 'Lona tensa: rebota en ella como en un toldo' });
});
room({ id: 'casa', area: 'pueblo', x: 0, y: 0, W: 32, H: 14, theme: 'dia', music: 'title', title: 'Eibar', sub: 'La casa de amona', onEnter: 'casa_in' }, (m) => {
  m.fill(0, 13, 32, 1);
  m.e('decor', 3, 12, { kind: 'casa', w: 10, h: 6 });
  m.e('npc', 15, 12, { who: 'abuela', script: 'abuela' });
  m.deco('maceta', 14, 12); m.deco('farola', 27, 12); m.deco('cuerda', 13, 6, { w: 10 });
  m.plat(14, 8, 4); m.plat(22, 5, 4);                // el balcón de la vecina y el alero de enfrente
  m.ch(15, 7); m.ch(17, 7); m.arc(18, 7, 22, 4, 2, 1.2); m.ch(24, 4); m.ch(26, 4);
});
room({ id: 'calle', area: 'pueblo', x: 32, y: 0, W: 48, H: 14, theme: 'dia', music: 'title', title: 'La calle mayor',
  check: { start: { x: 1, y: 12 }, goal: { x: 30, y: 0, w: 4, h: 1 } } }, (m) => {
  m.fill(0, 13, 48, 1);
  m.fill(4, 11, 2, 2, 'C'); m.fill(6, 8, 8, 5); m.fill(18, 6, 6, 7);
  m.bounce(14, 11, 3, '#3e7cb1');                    // el toldo de la ferretería
  m.plat(7, 5, 3); m.plat(11, 3, 3);
  m.fill(29, 0, 1, 9); m.fill(34, 0, 1, 10); m.fill(30, 10, 4, 1, '-');
  m.fill(38, 9, 6, 4); m.plat(39, 6, 3);
  m.e('npc', 25, 12, { who: 'vecina', script: 'vecina' });
  m.deco('cartel', 7, 7, { text: 'BURDINDEGIA' }); m.deco('farola', 16, 12); m.deco('farola', 36, 12); m.deco('maceta', 20, 5); m.deco('chimenea', 22, 5, { h: 1 });
  m.arc(5, 10, 7, 7, 2, 1); m.row(8, 12, 7, 2); m.col(15.5, 6, 9, 3); m.arc(15, 5, 18.5, 5, 2, 1.2); m.row(26, 28, 11.5, 2);
  m.col(31.5, 2, 8, 3);
  m.e('hint', 31, 12, { text: 'Entre estas dos casas se sube al mirador' });
  m.e('hint', 12, 12, { text: 'Recados: pan en el mercado (→), pescado en el muelle (←), correo en el mirador (↑)' });
});
room({ id: 'mirador', area: 'pueblo', x: 56, y: -26, W: 24, H: 26, theme: 'dia', music: 'title', title: 'El mirador',
  check: { start: { x: 13, y: 14 }, goal: { x: 14, y: 0, w: 6, h: 4 } } }, (m) => {
  m.fill(5, 20, 1, 6); m.fill(10, 18, 1, 8);
  m.fill(12, 15, 4, 1, '-'); m.fill(5, 12, 4, 1, '-'); m.fill(12, 9, 4, 1, '-'); m.fill(4, 6, 5, 1, '-');
  m.fill(17, 6, 3, 1, '-'); m.fill(13, 4, 9, 1, '-');
  m.plat(17, 16, 7);                                 // la pasarela que llega desde el mercado
  m.e('pagina', 5, 5, { id: 'p6' });
  m.e('trigger', 15, 1, { w: 4, h: 3, script: 'mirador', once: true });
  m.e('meta', 17, 3, { id: 'ane' });
  m.deco('cuerda', 16, 10, { w: 8 });
  m.col(7.5, 17, 23, 3); m.ch(13.5, 14); m.ch(6.5, 11); m.ch(13.5, 8); m.ch(6, 5); m.arc(9, 5, 17, 5, 3, 1.4); m.row(14, 20, 3, 2);
  m.row(18, 22, 15, 2);
});
room({ id: 'mercado', area: 'pueblo', x: 80, y: -20, W: 48, H: 34, theme: 'dia', music: 'title', title: 'El mercado',
  check: { start: { x: 1, y: 32 }, goal: { x: 41, y: 0, w: 6, h: 3 } } }, (m) => {
  m.fill(0, 33, 48, 1); m.fill(47, 0, 1, 33);
  // Casas de la plaza del mercado, con sus balcones y tejados
  m.house(0, 17, 13); m.house(14, 13, 12); m.house(27, 20, 10);
  m.plat(1, 26, 4); m.plat(8, 23, 4);
  m.fill(9, 13, 2, 4);                               // la chimenea de la casa de Miren
  m.plat(15, 26, 4); m.plat(22, 17, 4);
  m.plat(31, 26, 3);
  m.plat(0, 10, 7);                                  // pasarela al mirador
  // Los puestos, con toldos que rebotan
  m.deco('puesto', 5, 32, { col: '#b5544a', goods: ['#d8a050', '#c88040', '#e8c070'] });
  m.deco('puesto', 15, 32, { col: '#3e7cb1', goods: ['#a8b8c8', '#6a8aa8'] });
  m.deco('puesto', 24, 32, { col: '#c9a24a', goods: ['#7ab04a', '#c84a3a', '#e8a040'] });
  m.bounce(5, 30, 3, '#b5544a'); m.bounce(15, 30, 3, '#3e7cb1'); m.bounce(24, 30, 3, '#c9a24a');
  // El almacén y la torre del reloj: Txuri está en lo más alto
  m.fill(32, 31, 2, 2, 'C'); m.fill(38, 22, 9, 11);
  m.fill(41, 3, 6, 19);
  m.fill(37, 3, 1, 10);                              // el mástil de la bandera: se sube rebotando entre él y la torre
  m.plat(38, 18, 3); m.plat(38, 14, 3);
  m.bar(31, 11);                                     // la cuerda de banderines: atajo del tejado de Miren a la torre
  m.e('item', 43, 2, { kind: 'gato', flag: 'gato', prompt: 'Coger al gato', script: 'gato' });
  m.e('npc', 9, 32, { who: 'panadera', script: 'panadera' });
  m.e('npc', 19, 32, { who: 'vecino', script: 'vecino' });
  m.e('npc', 28, 32, { who: 'ane', script: 'ane' });
  m.e('npc', 36, 32, { who: 'cartero', script: 'cartero' });
  m.deco('cuerda', 26, 9, { w: 14 }); m.deco('chimenea', 18, 12, { h: 1 }); m.deco('antena', 33, 19); m.deco('maceta', 2, 25); m.deco('maceta', 16, 25);
  m.deco('cartel', 42, 12, { text: 'ERLOJUA' });
  m.arc(25.5, 30, 28, 20, 2, 2); m.arc(30, 19.5, 23.5, 16.5, 2, 1.2); m.col(24, 13, 15, 2); m.row(15, 21, 12.4, 3);
  m.arc(13.5, 12.5, 10, 12.5, 1, 1); m.arc(8.5, 12, 5, 9.5, 2, 1);
  m.arc(26, 12.5, 30.5, 11, 2, 1); m.arc(32, 11.5, 38, 13, 3, 1.6); m.col(39.5, 4, 11, 3.5); m.ch(37.5, 3.5); m.ch(43, 1.5); m.ch(36, 21); m.ch(39.5, 17);
  m.e('hint', 2, 32, { text: 'Los toldos de los puestos rebotan. Mantén el salto para llegar a los balcones' });
});

// ================================================================== IV · La tormenta
room({ id: 'ruina', area: 'tormenta', x: -32, y: 0, W: 32, H: 16, theme: 'storm', music: 'storm', onEnter: 'ruina' }, (m) => {
  m.fill(0, 13, 32, 3); m.fill(0, 0, 1, 13);
  m.fill(3, 11, 3, 2, 'C'); m.fill(8, 12, 2, 1, 'C'); m.fill(20, 12, 1, 1, 'C');
});
room({ id: 'storm1', area: 'tormenta', x: 0, y: -6, W: 96, H: 22, theme: 'storm', music: 'storm', title: 'Eibar', sub: 'La tormenta' }, (m) => {
  m.fill(0, 19, 96, 3);
  m.fill(3, 17, 2, 2, 'C'); m.set(6, 18, 'C'); m.bounce(1, 16, 2, '#7a5a8a');
  m.roof(8, 13, 7); m.crumble(15, 13, 3);            // el tejado se viene abajo
  m.roof(18, 10, 6);
  m.fill(24, 18, 3, 1, '^'); m.ladder(24, 3, 10, 18); // callejón con cables cortados
  m.roof(27, 8, 8); m.fill(30, 5, 2, 3);
  m.bar(37, 6);                                      // el balcón arrancado: queda la barandilla
  m.roof(41, 9, 6); m.crumble(47, 9, 5);
  m.fill(44, 18, 8, 1, '^');
  m.roof(52, 12, 6);
  m.fill(58, 18, 4, 1, '^'); m.bounce(58, 16, 4, '#5a6a8a'); // un toldo hecho jirones, aún tenso
  m.roof(62, 6, 8); m.set(65, 5, '#');
  m.e('zip', 69, 4, { x2: 88, y2: 15 });            // el tendido eléctrico caído
  m.fill(72, 18, 12, 1, '^');
  m.roof(76, 14, 4);                                 // un portal: la única pausa sobre los cables
  m.e('lightning', 6, 0, { w: 88 });
  m.deco('chimenea', 11, 12, { h: 1 }); m.deco('antena', 21, 9); m.deco('chimenea', 33, 7, { h: 1 }); m.deco('antena', 44, 8);
  m.deco('farola', 14, 18); m.deco('farola', 54, 11); m.deco('chimenea', 67, 5, { h: 2 }); m.deco('farola', 90, 18);
  m.arc(5, 17, 9, 12, 2, 1.4); m.row(12, 17, 12, 2); m.arc(18, 11.5, 20, 9, 1, 1); m.arc(24, 9, 27.5, 7, 2, 1.2);
  m.arc(31, 4, 33, 7, 1, 1); m.arc(35, 7, 41, 7.5, 3, 1.6); m.row(47, 51, 8, 2); m.arc(52, 8, 54, 11, 1, 1);
  m.col(59.5, 9, 14, 2.5); m.row(63, 68, 4.4, 2); for (const x of [72, 77, 82, 87]) m.ch(x, +(4.6 + (x - 69) * 11 / 19).toFixed(1));
  m.e('hint', 6, 18, { text: 'Mira el suelo antes del rayo: donde parpadea, cae. No te quedes quieto' });
  m.e('hint', 22, 9, { text: 'Cables cortados en la calle: mejor por arriba' });
});
room({ id: 'derrumbe', area: 'tormenta', after: ['storm1', 19, 13], W: 64, H: 18, theme: 'storm', music: 'storm', title: 'La calle hundida' }, (m) => {
  m.fill(0, 13, 10, 5); m.fill(54, 13, 10, 5);
  m.fill(10, 17, 44, 1, '^');                        // el agua de la calle, electrificada
  m.fill(14, 10, 3, 7); m.crumble(17, 10, 4);        // vigas de la casa caída
  m.fill(21, 8, 3, 9);
  m.bar(28, 6);
  m.fill(32, 9, 2, 8);
  m.fill(36, 6, 2, 11); m.plat(38, 11, 3); m.fill(41, 0, 2, 10); // paredes en pie: por encima de una y por debajo de la otra
  m.mover(41, 12, 50, 12, 3, 42, 0.8);               // una puerta arrastrada por el agua
  m.crumble(51, 12, 3);
  m.e('lightning', 4, 0, { w: 56 });
  m.deco('farola', 3, 12); m.deco('farola', 58, 12); m.deco('antena', 22, 7);
  m.arc(9, 12, 14, 9, 2, 1.4); m.row(17, 20, 9, 1.5); m.arc(24, 7.5, 28, 7, 2, 1.2); m.arc(29, 7.5, 32, 8, 2, 1);
  m.ch(36.5, 5); m.ch(39, 10); m.ch(42, 10.2); m.row(44, 50, 11, 3); m.ch(52.5, 11);
  m.e('hint', 4, 12, { text: 'La calle se ha hundido. El agua toca los cables: ni se te ocurra caer' });
});
room({ id: 'storm2', area: 'tormenta', after: ['derrumbe', 13, 13], W: 48, H: 16, theme: 'storm', music: 'storm', check: { goal: { x: 40, y: 9, w: 6, h: 4 } } }, (m) => {
  m.fill(0, 13, 10, 3); m.fill(10, 15, 6, 1, '^'); m.fill(11, 10, 4, 1, '-'); m.fill(16, 13, 32, 3);
  m.fill(20, 11, 3, 2, 'C'); m.fill(26, 9, 6, 4); m.fill(33, 12, 2, 1, 'C');
  m.crumble(23, 9, 3);
  m.fill(47, 0, 1, 13);
  m.e('lightning', 2, 0, { w: 30 });
  m.e('npc', 44, 12, { who: 'desconocido', script: 'desconocido1', once: true, auto: 30, copy: 'energia', sit: true });
  m.arc(9, 12, 16, 12, 3, 2.2); m.row(21, 25, 8.4, 2); m.row(27, 31, 8, 2);
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
  m.bounce(30, 12, 2, null, 'rama'); m.plat(30, 5, 4);
  m.deco('arbol', 20, 12, { h: 6 }); m.deco('arbol', 38, 12, { h: 7 });
  m.arc(19, 12, 22, 10, 2, 1); m.row(23, 27, 8, 2); m.arc(28, 8, 30.5, 11, 1, 0.6); m.col(31, 6, 10, 2); m.row(32, 33, 4, 1); m.arc(34, 4, 40, 8, 3, 0.8); m.row(42, 46, 8, 2);
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
  m.plat(8, 13, 4); m.plat(13, 10, 3);
  m.deco('arbol', 3, 16, { h: 8 }); m.deco('arbol', 36, 6, { h: 4 });
  m.arc(5, 16, 9, 12, 2, 1.4); m.arc(11, 12, 14, 9, 1, 0.8); m.col(20.5, 8, 14, 3); m.row(26, 46, 6, 4);
});
room({ id: 'forest2', area: 'bosque', after: ['arriba', 7, 13], W: 72, H: 14, theme: 'forest', music: 'forest', check: { marks: ['destino', 'energia'] } }, (m) => {
  m.fill(0, 13, 48, 1);
  m.fill(8, 10, 5, 1, '-'); m.fill(18, 7, 6, 1, '-');
  m.fill(28, 11, 4, 2); m.fill(35, 9, 5, 1, '-');
  m.set(26, 12, 'Y'); m.set(44, 12, 'Y');
  // El barranco de zarzas: troncos podridos, una rama que rebota y una liana
  m.fill(48, 13, 18, 1, '^');
  m.crumble(48, 10, 4); m.bounce(53, 12, 2, null, 'rama'); m.plat(56, 6, 3);
  m.bar(61, 7);
  m.fill(66, 13, 6, 1);
  m.e('vigia', 16, 4, { patrol: [8, 24], hostile: true });
  m.e('vigia', 34, 3, { patrol: [28, 42], hostile: true });
  m.e('vigia', 24, 2, { patrol: [14, 36], hostile: true });
  m.e('vigia', 58, 2, { patrol: [50, 66], hostile: true });
  m.deco('arbol', 3, 12, { h: 6 }); m.deco('arbol', 46, 12, { h: 7 }); m.deco('arbol', 68, 12, { h: 6 });
  m.arc(6, 12, 9, 9, 2, 1); m.arc(13, 9, 18, 6, 2, 1.4); m.row(19, 23, 6, 2); m.arc(24, 6, 28, 10, 2, 1);
  m.row(49, 51, 9, 2); m.col(53.5, 6, 10, 2); m.ch(57, 5); m.arc(59, 5.5, 61, 6, 1, 0.6); m.arc(62, 6, 67, 11, 2, 1.4);
  m.e('hint', 4, 12, { text: 'C / L  onda expansiva · en el aire, un rayo hacia abajo' });
  m.e('hint', 47, 12, { text: 'Ramas flexibles: rebotan. Los troncos podridos, no aguantan' });
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
  m.deco('arbol', 2, 12, { h: 6 }); m.deco('arbol', 40, 8, { h: 5 });
  m.arc(5, 12, 9, 8, 2, 1); m.arc(20, 8, 29, 8, 4, 2.4); m.row(35, 45, 8, 2.5);
});
room({ id: 'dashes', area: 'bosque', after: ['forest3', 9, 9], W: 56, H: 14, theme: 'forest', music: 'forest', title: 'Las copas caídas' }, (m) => {
  m.fill(0, 9, 8, 5);
  m.fill(15, 9, 4, 5); m.fill(26, 8, 4, 6); m.fill(37, 9, 4, 5); m.fill(48, 9, 8, 5);
  m.set(4, 8, 'Y'); m.set(27, 7, 'Y');
  m.arc(8, 8, 15, 8, 4, 2.6); m.arc(19, 8, 26, 7, 4, 2.6); m.arc(30, 7, 37, 8, 4, 2.6); m.arc(41, 8, 48, 8, 4, 2.6);
  m.e('vigia', 34, 3, { hostile: true, patrol: [24, 44] });
  m.e('hint', 4, 8, { text: 'Salto, y en lo alto, dash. El dash vuelve al tocar suelo' });
});
room({ id: 'copas', area: 'bosque', after: ['dashes', 9, 9], W: 96, H: 20, theme: 'forest', music: 'forest', title: 'El dosel', check: { marks: ['destino', 'energia'] } }, (m) => {
  m.fill(0, 9, 6, 11);
  m.fill(6, 19, 82, 1); m.fill(6, 18, 82, 1, '^');   // abajo, zarzas
  m.plat(8, 9, 3); m.crumble(12, 9, 3); m.plat(16, 8, 3);
  m.bar(21, 6); m.plat(25, 7, 4);
  m.e('zip', 28, 5, { x2: 40, y2: 12 });            // una liana larga
  m.bounce(43, 15, 4, null, 'rama'); m.plat(44, 6, 4);
  m.crumble(48, 6, 4); m.plat(53, 6, 3);
  m.bar(58, 4); m.bar(63, 4); m.plat(67, 6, 4);
  m.plat(70, 7, 8); m.fill(71, 4, 6, 2);             // un tronco caído: por debajo, deslizándose
  m.mover(79, 9, 86, 9, 3, 36, 0.6);                 // un tronco colgado de lianas, que se mece
  m.plat(90, 11, 3); m.plat(92, 14, 3);
  m.fill(88, 17, 8, 3);
  m.set(2, 8, 'Y'); m.set(93, 16, 'Y');
  m.e('vigia', 34, 2, { hostile: true, patrol: [24, 44] });
  m.e('vigia', 62, 1, { hostile: true, patrol: [52, 72] });
  m.deco('arbol', 22, 17, { h: 9 }); m.deco('arbol', 50, 17, { h: 9 }); m.deco('arbol', 82, 17, { h: 8 });
  m.arc(5, 8, 8.5, 8, 2, 1); m.row(12, 14, 8, 2); m.arc(18, 7, 21, 6.5, 1, 0.8); m.arc(22, 6.5, 26, 6, 2, 1);
  for (const x of [30, 33, 36, 39]) m.ch(x, +(5.6 + (x - 28) * 7 / 12).toFixed(1));
  m.col(45, 8, 13, 2.5); m.row(46, 47, 5, 1); m.row(48.5, 51, 5, 2.5); m.arc(55, 5, 58, 4.5, 1, 0.8); m.arc(59, 4.5, 63, 4.5, 2, 1.4);
  m.arc(64, 4.5, 68, 5, 2, 1.2); m.row(71, 76, 6.2, 2.5); m.row(80, 88, 8, 4); m.ch(91, 10); m.ch(93, 13);
  m.e('hint', 1, 8, { text: 'Las copas de los árboles. Abajo hay zarzas: si caes, duele y vuelves atrás' });
});
room({ id: 'campamento', area: 'bosque', after: ['copas', 17, 13], W: 56, H: 14, theme: 'forest', music: 'forest', title: 'El campamento de la PDC' }, (m) => {
  m.fill(0, 13, 56, 1);
  m.e('decor', 6, 12, { kind: 'tienda' }); m.e('decor', 20, 12, { kind: 'tienda' }); m.e('decor', 13, 12, { kind: 'hoguera' });
  m.fill(29, 6, 5, 1, '-'); m.fill(30, 9, 3, 1, '-'); m.e('decor', 29, 12, { kind: 'atalaya' });
  m.fill(42, 11, 3, 1, '-'); m.fill(46, 8, 3, 1, '-'); m.fill(50, 5, 3, 1, '-');
  m.set(3, 12, 'Y'); m.set(16, 12, 'L'); m.set(40, 12, 'Y');
  m.e('paladin', 22, 12, { patrol: [14, 28], hostile: true });
  m.e('blindado', 37, 12, { patrol: [34, 44], hostile: true });
  m.e('ballestero', 31, 5, { hostile: true });
  m.e('paladin', 47, 12, { patrol: [44, 53], hostile: true });
  m.e('lauburu', 51, 4, { id: 'L3' });
  m.e('hint', 3, 12, { text: 'El blindado para los disparos de frente: pásale por encima con el dash y dispárale por detrás' });
});
room({ id: 'buho', area: 'bosque', after: ['campamento', 13, 13], W: 32, H: 14, theme: 'forest', music: 'forest', title: 'El claro', check: { flags: { buho: true } } }, (m) => {
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
    ['say', 'iker', 'Te estaba esperando. ¿Una carrera hasta el final de los tejados? Yo corro por la calle; tú, por lo alto.'],
    ['say', 'jon', 'Por la calle es más corto.'],
    ['say', 'iker', 'Por eso. ¡Ya!'],
    ['do', 'flag', 'iker_reto'],
    ['do', 'race', 'iker', 26],
    ['actor', 'iker_r', 'iker', 4, 9, { face: 1 }],
    ['do', 'racerGo'],
  ],
  race_iker_ok: [
    ['say', 'iker', '¿Ya estás aquí? Seguro que has hecho trampa.'],
    ['say', 'jon', 'Los tejados no tienen esquinas.'],
    ['say', 'iker', 'Toma, anda. Lo gané en las fiestas. Que te dé suerte ahí dentro.'],
    ['do', 'lauburu', 'L1'],
  ],
  race_iker_fail: [
    ['say', 'iker', 'Te he dejado sitio en la meta. Vuelve a hablar conmigo y lo intentamos otra vez.'],
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
    ['move', 'jon', 93, { run: true }],
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
        ['say', 'panadera', 'Txuri, mi gato, se ha subido a lo alto de la torre del reloj y no hay quien lo baje. Tú que trepas por todo...'],
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
      ['say', 'ane', '¿Tú eres el que corre por los tejados? Demuéstralo: sube a lo alto del mirador en menos de cuarenta segundos. Por los tejados, claro.'],
      ['choice', [['¡Vamos!', 'ane_go', true], ['Ahora no', 'ane_go', false]]],
      ['if', 'ane_go', [['say', 'ane', 'Tres, dos, uno... ¡ya!'], ['do', 'race', 'ane', 40]], []],
    ]],
  ],
  race_ane_ok: [['say', 'jon', 'Cuarenta segundos. Ane va a flipar.'], ['do', 'lauburu', 'L2']],
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
