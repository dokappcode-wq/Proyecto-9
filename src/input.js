// Entrada: teclado, mando y controles táctiles. Todo se traduce a acciones.
'use strict';
const KEYMAP = {
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
  Space: 'jump', KeyZ: 'jump', KeyK: 'jump',
  KeyX: 'shoot', KeyJ: 'shoot',
  KeyC: 'power', KeyL: 'power',
  ShiftLeft: 'dash', ShiftRight: 'dash', KeyV: 'dash',
  KeyE: 'use', KeyI: 'use',
  KeyQ: 'swap', Tab: 'swap',
  Escape: 'pause', KeyP: 'pause', Enter: 'confirm',
  KeyM: 'map',
};
const ACTIONS = ['left', 'right', 'up', 'down', 'jump', 'shoot', 'power', 'dash', 'use', 'swap', 'pause', 'confirm', 'map'];
const Input = {
  down: {}, pressed: {}, released: {},
  keys: {}, pad: {}, touch: {}, tapped: {},
  any: false,
  usingPad: false,
  init() {
    addEventListener('keydown', (e) => {
      const a = KEYMAP[e.code];
      if (a) { e.preventDefault(); this.keys[a] = true; this.tapped[a] = true; }
      this.any = true;
      this.usingPad = false;
      Audio2.unlock();
    });
    addEventListener('keyup', (e) => { const a = KEYMAP[e.code]; if (a) { e.preventDefault(); this.keys[a] = false; } });
    addEventListener('blur', () => { this.keys = {}; });
    this.initTouch();
  },
  initTouch() {
    const box = document.getElementById('touch');
    if (!box) return;
    const isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
    if (!isTouch) return;
    box.hidden = false;
    for (const b of box.querySelectorAll('[data-a]')) {
      const acts = b.dataset.a.split(' ');
      const on = (e) => { e.preventDefault(); for (const a of acts) { this.touch[a] = true; this.tapped[a] = true; } this.any = true; Audio2.unlock(); };
      const off = (e) => { e.preventDefault(); for (const a of acts) this.touch[a] = false; };
      b.addEventListener('pointerdown', on);
      b.addEventListener('pointerup', off);
      b.addEventListener('pointercancel', off);
      b.addEventListener('pointerleave', off);
    }
  },
  pollPad() {
    this.pad = {};
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const p of pads) {
      if (!p) continue;
      const b = (i) => p.buttons[i] && p.buttons[i].pressed;
      const ax = p.axes[0] || 0, ay = p.axes[1] || 0;
      const P = this.pad;
      P.left = b(14) || ax < -0.4; P.right = b(15) || ax > 0.4;
      P.up = b(12) || ay < -0.6; P.down = b(13) || ay > 0.6;
      P.jump = b(0); P.dash = b(1) || b(6); P.shoot = b(2); P.use = b(3);
      P.swap = b(4) || b(5); P.power = b(7); P.pause = b(9); P.confirm = b(0) || b(9); P.map = b(8);
      if (p.buttons.some((x) => x.pressed)) { this.any = true; this.usingPad = true; }
      break;
    }
  },
  update() {
    this.pollPad();
    for (const a of ACTIONS) {
      // Una pulsación muy corta (bajar y soltar en el mismo fotograma) cuenta igual
      const now = !!(this.keys[a] || this.pad[a] || this.touch[a] || this.tapped[a]);
      this.tapped[a] = false;
      const was = !!this.down[a];
      this.pressed[a] = now && !was;
      this.released[a] = !now && was;
      this.down[a] = now;
    }
  },
  // Para menús: confirmar con salto, disparo o intro
  ok() { return this.pressed.confirm || this.pressed.jump || this.pressed.use; },
};
