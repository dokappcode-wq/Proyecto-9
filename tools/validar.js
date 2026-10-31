// Pasa el validador de rutas por todas las salas (o las indicadas) y muestra un informe.
// Uso: node tools/validar.js [sala ...]
// Necesita Playwright con Chromium.
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };

(async () => {
  const server = http.createServer((req, res) => {
    const file = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]).replace(/^\/$/, '/index.html'));
    fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
      res.end(data);
    });
  }).listen(0);
  const port = server.address().port;
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  await page.goto(`http://localhost:${port}/index.html`);
  await page.waitForFunction(() => window.ASCEND);
  await page.evaluate(() => { localStorage.clear(); ASCEND.start(false, true); });
  await page.addScriptTag({ content: fs.readFileSync(path.join(__dirname, 'rutas.js'), 'utf8') });
  const only = process.argv.slice(2);
  const results = await page.evaluate((only) => {
    const out = [];
    for (const id of Object.keys(ROOMS)) {
      const r = ROOMS[id];
      if (only.length && !only.includes(id)) continue;
      if (r.check === false) continue;
      const c = r.check || {};
      // Entrada: la indicada, o la de la sala anterior de la cadena
      const start = c.start || (r.after ? { x: 1, y: r.after[2] - 1 } : null);
      // Salida: la indicada, o el borde derecho si alguna sala va después
      const next = Object.values(ROOMS).some((o) => o.after && o.after[0] === id);
      const goal = c.goal || (next ? 'right' : null);
      if (!goal) continue;
      for (const f of Object.keys(ASCEND.save.flags)) delete ASCEND.save.flags[f];
      Object.assign(ASCEND.save.flags, c.flags || {});
      for (const id2 in ROOMS) ASCEND.save.flags['enter_' + id2] = true;
      try {
        out.push(RUTAS.validate({ room: id, start, goal, marks: c.marks || r.marks || ['destino'], maxNodes: c.maxNodes }));
      } catch (e) { out.push({ room: id, ok: false, error: e.message }); }
    }
    return out;
  }, only);
  let bad = 0;
  for (const r of results) {
    if (!r.ok) bad++;
    const mv = r.moves ? Object.entries(r.moves).filter(([, v]) => v).map(([k, v]) => `${k}:${v}`).join(' ') : '';
    const pk = r.picks ? ` coleccionables ${r.reachedPicks}/${r.picks}${r.missing && r.missing.length ? ' (faltan ' + r.missing.join(', ') + ')' : ''}` : '';
    console.log(`${r.ok ? 'OK  ' : 'FALLA'} ${r.room.padEnd(12)} ${r.ok ? (r.seconds + ' s').padEnd(8) : (r.error || 'sin ruta').padEnd(8)} nodos ${String(r.nodes).padEnd(4)} ${mv}${pk}  [${r.ms} ms]`);
  }
  if (errors.length) console.log('Errores de página:\n' + errors.join('\n'));
  console.log(`${results.length - bad}/${results.length} salas con ruta`);
  await browser.close();
  server.close();
  process.exit(bad ? 1 : 0);
})();
