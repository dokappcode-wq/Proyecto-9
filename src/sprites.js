// Sprites y paletas: portado de la Biblia de Ascend (dibujo píxel a píxel por código).
'use strict';
// ------------------------------------------------------------------ Paletas y datos
const MARKS = {
  destino: { name: 'Destino', color: '#f2c45a', glow: '#ffe7a3' },
  energia: { name: 'Energía', color: '#2f8bff', glow: '#9fd0ff' },
  temperatura: { name: 'Temperatura', color: '#2ee6d6', color2: '#ff8a2a', glow: '#b8fff7' },
  hilo: { name: 'Hilo', color: '#e9edf5', glow: '#ffffff' },
  raiz: { name: 'Raíz', color: '#5fbf3f', glow: '#b8f09a' },
  sombra: { name: 'Sombra', color: '#a59fd0', glow: '#d8d2ff' },
  eco: { name: 'Eco', color: '#d8e83a', glow: '#f2ff9a' },
  gravedad: { name: 'Gravedad', color: '#a24dff', glow: '#d9b3ff' },
  marea: { name: 'Marea', color: '#4f6dff', glow: '#a9b8ff' },
  alas: { name: 'Alas', color: '#ff6fa8', glow: '#ffc4dc' },
  defensa: { name: 'Defensa', color: '#ffb547', glow: '#ffe0a8' },
  sangre: { name: 'Sangre', color: '#d1162b', glow: '#ff5a6a' },
};

const GLYPH = {
  destino: ['....#....', '.#..#..#.', '..#.#.#..', '...###...', '#########', '...###...', '..#.#.#..', '.#..#..#.', '....#....'],
  energia: ['.....##..', '....##...', '...##....', '..#####..', '....##...', '...##....', '..##.....', '.##......', '.#.......'],
  temperatura: ['..#...+..', '#.#.#.+..', '.###.+++.', '#####++++', '.###.+++.', '#.#.#+++.', '..#...+..', '.........', '.........'],
  hilo: ['##.......', '#.#......', '...#.....', '....#....', '.....#...', '......#..', '.......#.', '......###', '.......#.'],
  raiz: ['....#....', '...###...', '..#.#.#..', '....#....', '....#....', '...###...', '..#.#.#..', '.#..#..#.', '#...#...#'],
  sombra: ['.........', '..#####..', '.#.....#.', '#..###..#', '#.#####.#', '#..###..#', '.#.....#.', '..#####..', '.........'],
  eco: ['#...#..#.', '#..#..#..', '#.#..#...', '##..#....', '#...#....', '##..#....', '#.#..#...', '#..#..#..', '#...#..#.'],
  gravedad: ['...###...', '.##...##.', '#..###..#', '#.#####.#', '#.#####.#', '#.#####.#', '#..###..#', '.##...##.', '...###...'],
  marea: ['.........', '...###...', '..#...#..', '.#.....#.', '#..##...#', '..#..#...', '##....###', '.........', '#########'],
  alas: ['.......##', '.....####', '...######', '.#######.', '######...', '####.....', '##.......', '#........', '.........'],
  defensa: ['..#####..', '.#.....#.', '#..###..#', '#.#...#.#', '#.#...#.#', '#..###..#', '.#.....#.', '..#####..', '.........'],
  sangre: ['....#....', '....#....', '...###...', '..#####..', '.#######.', '.#######.', '.####.##.', '..#####..', '...###...'],
};

// ------------------------------------------------------------------ Dibujo de píxeles
const R = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };
function line(c, x0, y0, x1, y1, col, w = 1) {
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  c.fillStyle = col;
  for (let i = 0; i < 400; i++) {
    c.fillRect(x0, y0, w, w);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
  }
}
function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.max(0, Math.min(255, Math.round(v * k)));
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
}
function glyph(c, key, x, y, s = 1, col, col2) {
  const g = GLYPH[key];
  const m = MARKS[key];
  for (let j = 0; j < g.length; j++) for (let i = 0; i < g[j].length; i++) {
    const ch = g[j][i];
    if (ch === '#') R(c, x + i * s, y + j * s, s, s, col ?? m.color);
    else if (ch === '+') R(c, x + i * s, y + j * s, s, s, col2 ?? m.color2 ?? m.color);
  }
}
// Mini fuente de dígitos 3×5
const DIG = ['111101101101111', '010110010010111', '111001111100111', '111001111001111', '101101111001001', '111100111001111', '111100111101111', '111001001001001', '111101111101111', '111101111001111'];
function digits(c, str, x, y, col) {
  [...String(str)].forEach((d, k) => {
    const b = DIG[+d];
    for (let i = 0; i < 15; i++) if (b[i] === '1') R(c, x + k * 4 + (i % 3), y + Math.floor(i / 3), 1, 1, col);
  });
}
// Generador con semilla (las escenas son siempre iguales)
function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
function hex2(h) { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
function rgb2hex(r, g, b) { return '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join(''); }
function mix(a, b, t) { const A = hex2(a), B = hex2(b); return rgb2hex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t); }
const INK = '#140d1f';
function outline(g, strength = 0.74, fixed = null) {
  const h = g.length, w = g[0].length, o = g.map((r) => r.slice());
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (g[y][x]) continue;
    const n = [[0, 1], [0, -1], [1, 0], [-1, 0]].map(([a, b]) => g[y + b]?.[x + a]).find(Boolean);
    if (n) o[y][x] = fixed ?? mix(n, INK, strength);
  }
  return o;
}
function blit(c, g, x, y, flip = false, alpha = 1) {
  const w = g[0].length;
  c.globalAlpha = alpha;
  for (let j = 0; j < g.length; j++) for (let i = 0; i < w; i++) {
    const col = g[j][i];
    if (!col) continue;
    c.fillStyle = col;
    c.fillRect(x + (flip ? w - 1 - i : i), y + j, 1, 1);
  }
  c.globalAlpha = 1;
}
const tint = (g, col, k = 0.75) => g.map((r) => r.map((c) => c && mix(c, col, k)));

// Esqueleto: cabeza y torso a mano, extremidades por cinemática inversa
function gset(g,x,y,col){x=Math.round(x);y=Math.round(y);if(g[y]&&x>=0&&x<g[0].length)g[y][x]=col;}
function gline(g,x0,y0,x1,y1,col,w=1){
  x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);
  const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let err=dx+dy;
  const o=Math.floor((w-1)/2);
  for(let i=0;i<200;i++){for(let a=0;a<w;a++)for(let b=0;b<w;b++)gset(g,x0-o+a,y0-o+b,col);
    if(x0===x1&&y0===y1)break;const e2=2*err;if(e2>=dy){err+=dy;x0+=sx;}if(e2<=dx){err+=dx;y0+=sy;}}
}
function ik(hx,hy,fx,fy,L1,L2,bendSign){
  let dx=fx-hx,dy=fy-hy,d=Math.hypot(dx,dy);const max=L1+L2-0.01;
  if(d>max){fx=hx+dx/d*max;fy=hy+dy/d*max;dx=fx-hx;dy=fy-hy;d=max;}
  if(d<0.01)return [hx,hy+L1,fx,fy];
  const a=(L1*L1-L2*L2+d*d)/(2*d),h=Math.sqrt(Math.max(0,L1*L1-a*a));
  const px=hx+a*dx/d,py=hy+a*dy/d;const nx=-dy/d,ny=dx/d;
  let kx=px+nx*h,ky=py+ny*h,k2x=px-nx*h,k2y=py-ny*h;
  if((k2x-kx)*bendSign>0){kx=k2x;ky=k2y;}
  return [kx,ky,fx,fy];
}
function pad(rows,w=24){return rows.map(r=>r.padEnd(w,'.'));}
// pose: { bob, lean, headDx, headDy, legF, legB (pies desde la cadera), armF, armB (manos desde el hombro), blink, air }
function drawChar(ch,pose={},raw=false,w=24,h=32){
  const P=ch.pal,g=Array.from({length:h},()=>Array(w).fill(null));
  const bob=pose.bob||0,lean=pose.lean||0;
  const put=(map,dx,dy,swap)=>map.forEach((row,y)=>{for(let x=0;x<row.length;x++){let c=row[x];if(c==='.')continue;if(swap&&swap[c])c=swap[c];const col=P[c];if(col)gset(g,dx+x,dy+y,col);}});
  // Detrás: bufanda, capa
  if(ch.scarf&&pose.scarf){const s=ch.scarf;let [x,y]=[s.at[0]+lean,s.at[1]+bob];
    pose.scarf.forEach(([dx,dy],k)=>{const nx=x+dx,ny=y+dy;gline(g,x,y,nx,ny,P[k%2?s.c2:s.c],k<2?2:1);x=nx;y=ny;});}
  if(ch.back)ch.back(g,P,pose,lean,bob);
  const limb=(L,root,target,bend,cfg,front)=>{const [kx,ky,fx,fy]=ik(root[0],root[1],root[0]+target[0],root[1]+target[1],L[0],L[1],bend);
    const col=P[front?cfg.c:cfg.cb];gline(g,root[0],root[1],kx,ky,col,cfg.w);gline(g,kx,ky,fx,fy,col,cfg.w);
    if(front&&cfg.edge){gline(g,root[0]+1,root[1],kx+1,ky,P[cfg.edge],1);gline(g,kx+1,ky,fx+1,fy,P[cfg.edge],1);}return [kx,ky,fx,fy];};
  const L=ch.leg,A=ch.arm,f=pose.face||1;
  const hipB=[ch.hipB[0]+lean,ch.hipB[1]+bob],hipF=[ch.hipF[0]+lean,ch.hipF[1]+bob];
  const shB=[ch.shB[0]+lean,ch.shB[1]+bob],shF=[ch.shF[0]+lean,ch.shF[1]+bob];
  // brazo trasero
  if(A&&!pose.noArmB){const r=limb(A.len,shB,pose.armB||[-1,6],-1,A,false);gline(g,r[2],r[3],r[2]+1,r[3],P[A.handB||A.hand],2);}
  // pierna trasera
  const ft=(v)=>pose.air?v:[v[0],v[1]-bob];
  const legF=()=>{const r=limb(L.len,hipF,ft(pose.legF||[1,7]),1,L,true);shoe(g,P,L,r[2],r[3],true,pose.toeF);};
  if(L){const r=limb(L.len,hipB,ft(pose.legB||[-1,7]),1,L,false);shoe(g,P,L,r[2],r[3],false,pose.toeB);}
  if(L&&ch.legsUnder)legF();
  put(pad(ch.torso),lean,ch.torsoY+bob,pose.torsoSwap);
  if(L&&!ch.legsUnder)legF();
  put(pad(ch.head),lean+(pose.headDx||0),ch.headY+bob+(pose.headDy||0),pose.blink?ch.blink:pose.headSwap);
  if(ch.front)ch.front(g,P,pose,lean,bob);
  if(A&&!pose.noArmF){const r=limb(A.len,shF,pose.armF||[1,6],-1,A,true);
    gline(g,r[2],r[3],r[2]+1,r[3],P[A.hand],2);
    if(A.mark){const t=0.7;gline(g,r[0]+(r[2]-r[0])*t,r[1]+(r[3]-r[1])*t,r[0]+(r[2]-r[0])*t+1,r[1]+(r[3]-r[1])*t,P[A.mark],1);}
    // Marcas copiadas, unas encima de otras; al usar un poder fuerte, la luz sube hasta el hombro
    if(pose.marks)pose.marks.forEach((col,k)=>{const t=0.42-k*0.22;gset(g,r[0]+(r[2]-r[0])*t,r[1]+(r[3]-r[1])*t,col);});
    if(pose.armGlow){gline(g,shF[0],shF[1],r[0],r[1],pose.armGlow,1);gline(g,r[0],r[1],r[2]-1,r[3],pose.armGlow,1);}}
  if(pose.fx)pose.fx(g,P,lean,bob);
  return raw?g:outline(g);
}
function shoe(g,P,L,x,y,front,toe){if(!L.shoe)return;const s=front?L.shoe:L.shoeB||L.shoe;
  if(toe){gline(g,x,y,x+1,y+1,P[s],2);return;}
  gline(g,x-1,y,x+2,y,P[s],1);gline(g,x-1,y+1,x+3,y+1,P[L.sole||s],1);}

const CH={};
CH.jon={pal:{h:'#3b2a22',H:'#251a16',i:'#5e4436',s:'#e3ab84',S:'#b97c5e',e:'#1d1622',w:'#ece2cc',W:'#bfae94',j:'#7a4f36',J:'#553524',k:'#9c6c4a',c:'#b8573c',C:'#87392a',d:'#dc7b5c',p:'#3c3e4e',P:'#282a36',b:'#e6e0d2',B:'#a8a196',m:'#f2c45a',M:'#fff1b8'},
 headY:4,head:[
"...........h..h",
".........hhhhhhh.h",
"........hhhiihhhhh",
".......hhhiihhhhhhh",
"......hhhhhhhhhhhhsh",
".......hhhSsssssHss",
"........hSssssssess",
"........hhSssssssss",
".........hSSssssSs",
"..........hSSSsss"],
 torsoY:14,torso:[
".........ccccdddc",
"........CccccccdcJ",
"..........JjjjjwwJ",
"..........JjjjjwwJ",
"..........JjjjjwwJ",
"..........JjjjjwWJ",
"..........JjjjJJJJ",
"..........PppppppP"],
 blink:{e:'S'},hipB:[12,22],hipF:[15,22],shB:[11,16],shF:[13,16],
 leg:{len:[4,4],w:3,c:'p',cb:'P',edge:'P',shoe:'b',shoeB:'B',sole:'B'},
 arm:{len:[3,3],w:2,c:'k',cb:'J',hand:'s',handB:'S',mark:'m'},
 scarf:{at:[10,15],c:'c',c2:'C'}};
CH.iker={pal:{g:'#3d6b66',G:'#284845',y:'#d8cdb0',h:'#2a1d16',s:'#c99172',S:'#9c6a50',e:'#1d1622',r:'#7a3f36',o:'#6b7a45',O:'#4a5530',q:'#8a9a5c',p:'#4a5a78',P:'#33405a',b:'#6f8090',B:'#3e4a58'},
 headY:3,head:[
"..........yy",
".........gyyg",
"........gggggggg",
".......gGgggggggg",
".......GGGGGGGGGG",
".......hSssssssss",
".......hSssssssess",
"........Sssssssss",
"........Sssssrrss",
".........SSssss"],
 torsoY:13,torso:[
".......OOoSSsS",
"......OOooooqyooO",
".......OoooqoyooO",
"........OoooqooooO",
"........OooqqooooO",
"........OoOOOOOOoO",
"........OoooooooOO",
"........PppppppppP"],
 blink:{e:'S'},hipB:[11,21],hipF:[15,21],shB:[10,15],shF:[13,15],
 leg:{len:[4,4],w:3,c:'p',cb:'P',edge:'P',shoe:'b',shoeB:'B',sole:'B'},
 arm:{len:[3,3],w:2,c:'q',cb:'O',hand:'s',handB:'S'}};
CH.narbaiza={pal:{h:'#16121a',i:'#34303c',s:'#c49a80',S:'#94705c',e:'#0c0a10',x:'#241c22',k:'#26262e',K:'#16161c',l:'#3a3a46',a:'#9a9aa8',c:'#1a1a22',C:'#6a0e20',m:'#d1162b',M:'#ff5a6a',p:'#1a1a20',P:'#101016',b:'#0e0e12',B:'#30303a'},
 headY:1,head:[
"........iiihhh",
".......hiiihhhhh",
"......hhhhhhhhhhh",
"......hhhSsssssss",
"......hhSsssssxxs",
"......hhSssssssess",
".......hSsssssssss",
".......xxxxxxxxxs",
"........xxxxxxxx",
".........xxxxx"],
 torsoY:11,torso:[
".......KkkkkkkK",
".....KkkkkkkkkkkkK",
".....KkllkkkkakkkK",
".....KkllkkkkkkkkK",
".....KkllkkkkakkkK",
".....KkllkkkkkkkkK",
".....KkllkkkkakkkK",
".....KKKKKKKKKKKKK",
"......KkkkkkkkkkK",
"......KkkkkkkkkkK",
"......KkkkkKkkkkK"],
 blink:{e:'S'},hipB:[10,21],hipF:[14,21],shB:[8,13],shF:[12,13],legsUnder:true,
 leg:{len:[4,5],w:3,c:'p',cb:'P',shoe:'b',shoeB:'b',sole:'B'},
 arm:{len:[4,3],w:2,c:'l',cb:'K',hand:'S',handB:'S'},
 back(g,P,pose,lean,bob){const sw=pose.cape||0;for(let y=12;y<28;y++){const t=(y-12)/16;const x0=Math.round(5-t*2+lean-sw*t);gline(g,x0,y+bob,x0+3,y+bob,P[y>25?'C':'c'],1);gset(g,x0,y+bob,P.C);}}};
CH.edurne={pal:{h:'#5a4a3a',H:'#3e3228',i:'#9a8a78',s:'#d9a98a',S:'#a97c62',e:'#1d1622',g:'#2a2230',w:'#dff0f6',a:'#b88a4a',A:'#7a5a2e',k:'#9a9482',K:'#6e6a5c',l:'#bab4a0',t:'#3f6464',p:'#3a3440',P:'#28242e',b:'#4a3428',B:'#2e2018'},
 headY:4,head:[
"......hih",
"......hhhhhhhhh",
".......hhhhhhhhhh",
"........hhSsssssh",
"........haSssawas",
"........hASssaeas",
"........hASsssssS",
".........aSSsSSs",
"..........aSSs"],
 torsoY:13,torso:[
"........aKkkttkK",
".......KkkkkttkkK",
".......KlkkkttkkK",
".......KlkkkttkkK",
".......KlkkkkkkkK",
".......KlkkkkkkkK",
".......KlkkkkkkkK",
".......KlkkkkkkkkK",
"......KlkkkkkKkkkK",
"......KKkkkkkKkkkK",
"......KKKKKKKKKKKK"],
 blink:{e:'g'},hipB:[11,21],hipF:[14,21],shB:[9,15],shF:[12,15],legsUnder:true,
 leg:{len:[4,4],w:3,c:'p',cb:'P',shoe:'b',shoeB:'b',sole:'B'},
 arm:{len:[3,3],w:2,c:'l',cb:'K',hand:'s',handB:'S'}};
CH.desconocido={pal:{o:'#3a4252',O:'#262c38',q:'#4e586a',x:'#17171c',h:'#2b201a',s:'#b07a5c',S:'#84583f',e:'#9fd0ff',m:'#2f8bff',M:'#9fd0ff',p:'#2a2a30',P:'#1c1c22',b:'#3a2c22',B:'#231a14'},
 headY:4,head:[
".........OOOO",
"........OooooqO",
".......OooqqqqoO",
".......OoOhhhhhoO",
".......OoOhSsssss",
".......OoOSsssses",
".......OoOSssssss",
"........OoOSSsSS",
"........OxoOSS"],
 torsoY:13,torso:[
".......OoooomooO",
"......OoqooooooO",
"......OoqoooxooO",
"......OoqooooooOm",
"......OoqooooooO",
"......OoqooxoooO",
".....OoqoooooooO",
".....OoqoooooooO",
".....OxOoOoxOoOO",
"......O..x..O..O"],
 blink:{e:'S'},hipB:[11,21],hipF:[14,21],shB:[9,15],shF:[12,15],legsUnder:true,
 leg:{len:[4,4],w:3,c:'p',cb:'P',shoe:'b',shoeB:'b',sole:'B'},
 arm:{len:[3,3],w:2,c:'q',cb:'O',hand:'s',handB:'S',mark:'M'}};
CH.paladin={pal:{a:'#8c96a8',A:'#5c6578',l:'#c8d0e0',v:'#3ac8ff',V:'#bff0ff',n:'#1f2a44',N:'#141c30',u:'#2f8bff',p:'#1a1f2e',P:'#10141e',b:'#2a2e38',B:'#181a22',k:'#3a4256'},
 headY:4,head:[
".........AAAAA",
"........AlaaaaA",
"........Alaaaaa",
"........AaaVvvv",
"........Aaaaaaa",
"........AAaaaaA",
".........AAAAA"],
 torsoY:11,torso:[
"......AAlaAAAaAA",
"......AlaaAnnAaaA",
".......AAnnunnAA",
"........NnnunnN",
"........NnnunnN",
"........NnnunnN",
"........AAAAAAA",
"........NnnunnN",
"........NnnunnN",
"........NnnunnN"],
 blink:null,hipB:[10,21],hipF:[13,21],shB:[8,13],shF:[13,13],legsUnder:true,
 leg:{len:[4,4],w:3,c:'p',cb:'P',shoe:'b',shoeB:'b',sole:'B'},
 arm:{len:[3,3],w:2,c:'a',cb:'A',hand:'A',handB:'A'},
 front(g,P,pose,lean,bob){const x=15+lean,y=12+bob+(pose.shieldDy||0);for(let j=0;j<11;j++)gline(g,x,y+j,x+3,y+j,P[j===0||j===10?'A':'a'],1);
   gline(g,x,y,x,y+10,P.l,1);gline(g,x+2,y+3,x+2,y+6,P.u,1);gline(g,x+1,y+4,x+3,y+4,P.u,1);}};
CH.acolito={pal:{r:'#3a2350',R:'#24153a',q:'#55357a',x:'#0e0816',e:'#e6b0ff',E:'#a24dff',m:'#a24dff',n:'#d1162b',c:'#c8b8d8'},
 headY:2,head:[
"........R",
"........RR",
"........Rrr",
"........Rrrr",
"........Rrrrrr",
"........Rrrrrrr",
"........RrrxxxxR",
"........RrxxxeeR",
"........RrxxxxxR",
"........RrrxxxR"],
 torsoY:12,torso:[
".......RrrrrrrrR",
".......RrqrrrrrrR",
"......RrrqrrmrrrR",
"......RrrqrrrrrrR",
"......RrrqrrrrrrrR",
".....RrrrqrrrrrrrR",
".....RrrrqrrrrrrrR",
".....RrrrqrrrrrrrrR",
"....RrrrrqrrrrrrrrR",
"....RrrrrqrrrrrrrrR",
"....RrrrrqrrrrrrrrrR",
"...RrrrrrqrrrrrrrrrR",
"...RrrrrrrrrrrrrrrrR",
"...RRrRRrRRrRRrRRrR",
"....R..R..R..R..R"],
 blink:{e:'x'},hipB:[11,22],hipF:[14,22],shB:[9,14],shF:[13,14],
 leg:null,
 arm:{len:[3,4],w:2,c:'q',cb:'R',hand:'c',handB:'c'}};
const ORDER=['jon','iker','narbaiza','edurne','desconocido','paladin','acolito'];
// Plantilla para el resto del reparto: misma cabeza, mismo torso, mismas reglas de luz
const SHADOW='#2a1840',LIGHT='#fff1d0';
const dk=(c)=>mix(c,SHADOW,0.38),lt=(c)=>mix(c,LIGHT,0.2);
function hexify(c){if(c.startsWith('#'))return c;const m=c.match(/\d+/g);return rgb2hex(+m[0],+m[1],+m[2]);}
const HAIR={
 short:["","..........hhhhhh","........hhhhhhhhh",".......hhhhhhhhhhh","......hhhhhhhhhhhss"],
 buzz:["","","..........hhhhhh","........hhhhhhhhhh",".......hhhhhhhhhss"],
 slick:["","..........iihhhh","........hiiihhhhh",".......hhhhhhhhhhh","......hhhhhhhhhhhss"],
 messy:["...........h..h",".........hhhhhhh.h","........hhhiihhhhh",".......hhhiihhhhhhh","......hhhhhhhhhhhhsh"],
 bun:["......hh",".....hhhhhhhhhh","........hhhhhhhhh",".......hhhhhhhhhhh","......hhhhhhhhhhhss"],
 long:["","..........hhhhhh","........hhhhhhhhh",".......hhhhhhhhhhh","......hhhhhhhhhhhss"],
};
function template(spec){
  const hs=spec.hairStyle||'short';
  const face=[
   ".......hhhSssssssss",
   "........hSssssssess",
   "........hhSssssssss",
   ".........hSSssssSs",
   "..........hSSSsss"];
  let head=[...HAIR[hs],...face];
  if(hs==='buzz')head=head.map((r,i)=>i>=5?r.replace(/h/g,'.').replace(/^\.{8}\./,'.........'):r).map((r,i)=>i===5?'........SSssssssss':i===6?'........SSsssssess':r);
  if(hs==='long')head=head.map((r,i)=>i>=5&&i<9?'......hh'+r.slice(8):r).concat(['......hh','.......h']);
  if(spec.beard)head=head.map((r,i)=>i===8?'.........hhhhhhhs':i===9?'..........hhhhh':r);
  const j=hexify(spec.jacket),pa=hexify(spec.pants),bo=hexify(spec.boots),sk=hexify(spec.skin),ha=hexify(spec.hair);
  const pal={h:ha,i:lt(lt(ha)),s:sk,S:dk(sk),e:'#1d1622',j,J:dk(j),k:lt(j),p:pa,P:dk(pa),b:bo,B:dk(bo),m:spec.marks?.[0]||sk,c:dk(hexify(spec.cape||spec.jacket)),C:hexify(spec.cape||spec.jacket)};
  const ch={pal,headY:4,head,torsoY:14,torso:[
   ".........jjjjjj",
   "........JjjjjjkjJ",
   "........JjjjjjjjJ",
   "........JjjjjjjjJ",
   "........JjjjjjjjJ",
   "........JjjjjjjjJ",
   "........JJJJJJJJJ",
   "........PppppppP"],
   blink:{e:'S'},hipB:[10,22],hipF:[14,22],shB:[9,16],shF:[12,16],
   leg:{len:[4,4],w:3,c:'p',cb:'P',edge:'P',shoe:'b',shoeB:'B',sole:'B'},
   arm:{len:[3,3],w:2,c:'k',cb:'J',hand:'s',handB:'S',mark:spec.marks?'m':null}};
  if(spec.gear==='cape')ch.back=CH.narbaiza.back;
  return ch;
}
const BASE_IDLE=(t,seed=0)=>({bob:Math.floor((t+seed)/1.0)%2,blink:((t+seed*1.7)%3.4)<0.12,armF:[1,6],armB:[-1,6]});
// Variantes de la PDC
CH.paladin.front=function(g,P,pose,lean,bob){
  if(pose.shield){const x=15+lean,y=12+bob;for(let j=0;j<11;j++)gline(g,x,y+j,x+3,y+j,P[j===0||j===10?'A':'a'],1);
    gline(g,x,y,x,y+10,P.l,1);gline(g,x+2,y+3,x+2,y+6,P.u,1);gline(g,x+1,y+4,x+3,y+4,P.u,1);}
  if(pose.visor!=null){const vx=11+lean+(pose.visor%4);gset(g,vx,7+bob,P.V);}
};
CH.paladin.armPose=null;
const PDC={
  paladin:{...CH.paladin},
  reforzado:{...CH.paladin,pal:{...CH.paladin.pal,a:'#6a7a9a',A:'#424e68',l:'#9aa8c8',v:'#ff8a3a',V:'#ffd0a0',n:'#2a3a5c',N:'#1a2640',u:'#ff8a3a'}},
  blindado:{...CH.paladin,pal:{...CH.paladin.pal,a:'#9aa0aa',A:'#5a6070',n:'#2a3448'}},
  ballestero:{...CH.paladin,pal:{...CH.paladin.pal,a:'#5a6478',A:'#3a4256',l:'#8a96ac',n:'#18223a'}},
};
function crossbow(g,P,x,y){gline(g,x-2,y,x+5,y,'#6b4a2e',1);gline(g,x+5,y-3,x+5,y+3,'#8c96a8',1);gset(g,x+6,y,'#ff4a3a');}
// Vigía de latón: búho mecánico, dos fotogramas de alas
const OWL_PAL={a:'#b88a4a',A:'#7a5a2e',l:'#e0b878',k:'#2a2230',v:'#3ac8ff',V:'#bff0ff',w:'#9a7440',W:'#6a4c26'};
const OWL=[
 ["...A.......A...","...AaA...AaA....","....AaaaaaaA....","...AakkaakkaA...","...AkVvkkvVkA...","...AakkaakkaA...","WwwAaaalaaaaAwwW",".WwAaaaaaaaaAwW.","..WAaaalaaaaAW..","....AaaaaaaA....",".....AaaaaA.....","......A..A......"],
 ["...A.......A...","...AaA...AaA....","....AaaaaaaA....","...AakkaakkaA...","...AkVvkkvVkA...","...AakkaakkaA...","...AaaalaaaaA...","..WAaaaaaaaaAW..",".WwAaaalaaaaAwW.","WwwwAaaaaaaAwwwW",".....AaaaaA.....","......A..A......"],
];

// Ciclos de movimiento (pies relativos a la cadera; brazos relativos al hombro)
const TAU=Math.PI*2;
const SCARF={
  calm:(t)=>[[-1,1],[-1,2],[Math.round(Math.sin(t*2)),2],[-1,1]],
  run:(t)=>[[-2,0],[-2,Math.round(Math.sin(t*20))-0],[-2,0],[-2,Math.round(Math.sin(t*20+1))]],
  up:()=>[[-1,1],[-1,2],[0,2],[0,2]],
  down:()=>[[-1,-1],[-1,-2],[0,-2],[1,-1]],
};
const MOVE={
  run(i,n=6){const f=i/n*TAU;const lift=(a)=>Math.sin(a)>0?Math.round(3*Math.sin(a)):0;
    return {lean:1,bob:Math.cos(2*f)>0?0:-1,air:false,
      legF:[Math.round(4*Math.cos(f)),7-lift(f)],legB:[Math.round(4*Math.cos(f+Math.PI)),7-lift(f+Math.PI)],
      armF:[Math.round(-3*Math.cos(f))+1,5],armB:[Math.round(3*Math.cos(f))-1,5],scarf:SCARF.run(i)};},
  crouch(){return {bob:2,legF:[2,7],legB:[-2,7],armF:[3,4],armB:[-2,4],scarf:SCARF.calm(0)};},
  jump(){return {air:true,legF:[3,3],legB:[-2,6],armF:[1,-5],armB:[-3,-4],scarf:SCARF.up(),toeB:true};},
  apex(){return {air:true,legF:[3,4],legB:[0,3],armF:[4,-2],armB:[-3,-1],scarf:SCARF.calm(0)};},
  fall(){return {air:true,legF:[1,7],legB:[-3,6],armF:[4,-4],armB:[-4,-4],scarf:SCARF.down(),toeB:true,toeF:true};},
  wall(){return {air:true,legF:[3,4],legB:[2,7],armF:[2,-6],armB:[3,-1],scarf:SCARF.down(),toeF:true};},
  hang(){return {air:true,legF:[1,7],legB:[-1,7],armF:[1,-7],armB:[-1,-7],scarf:SCARF.up(),toeF:true,toeB:true};},
  vault(){return {air:true,lean:2,legF:[4,3],legB:[1,3],armF:[1,6],armB:[0,6],scarf:SCARF.run(0)};},
  slide(){return {bob:5,lean:-1,legF:[6,7],legB:[3,7],armF:[-3,1],armB:[-4,2],scarf:SCARF.run(1)};},
  roll(){return {air:true,bob:6,lean:1,headDy:1,legF:[2,3],legB:[0,3],armF:[3,1],armB:[1,2],scarf:SCARF.down(),toeF:true,toeB:true};},
  dash(){return {air:true,lean:2,legF:[-1,6],legB:[-4,5],armF:[-4,2],armB:[-4,3],scarf:[[-3,0],[-3,0],[-3,0],[-2,0]],toeB:true,toeF:true};},
  land(){return {bob:2,legF:[3,7],legB:[-2,7],armF:[4,2],armB:[-3,2],scarf:SCARF.down()};},
};
// Reposo con personalidad: t en segundos
const IDLE={
  jon(t){const breath=Math.floor(t/0.9)%2;const look=(t%6)>4.4;const p={bob:breath,blink:(t%3.2)<0.12,scarf:SCARF.calm(t)};
    if(look){p.armF=[3,3];p.headDy=1;p.glow=true;}else p.armF=[0,6];p.armB=[-1,6];return p;},
  iker(t){const hop=Math.floor(t/0.35)%2;const p={bob:-hop,blink:(t%2.6)<0.12,armF:[1,6-hop],armB:[-2,6]};p.headDx=(t%4)>2.5?-1:0;return p;},
  narbaiza(t){return {bob:0,blink:(t%6.5)<0.12,armF:[-4,5],armB:[-3,5],cape:Math.round(Math.sin(t*1.3)),drops:(t%4)};},
  edurne(t){const call=(t%5)>3.2;return {bob:Math.floor(t/1.1)%2,blink:(t%3.6)<0.12,armF:call?[-1,-5]:[1,6],armB:[-1,6]};},
  desconocido(t){const k=Math.floor(t*14);const j=(n)=>((k*9301+n*49297)%233280)/233280;return {lean:j(1)>0.7?1:0,headDx:j(2)>0.8?-1:0,blink:false,armF:[3,1],armB:[2,1],sparks:k};},
  paladin(t){const tick=Math.floor(t)%2;return {bob:tick,visor:Math.floor(t*6)%8,armB:[-1,6],noArmF:true};},
  acolito(t){const fl=Math.round(Math.sin(t*2.2)*1.4)-1;const tw=(t%3.4)<0.25;return {bob:fl,headDx:tw?1:0,blink:(t%2.2)<0.1,armF:[3,3+Math.round(Math.sin(t*3))],armB:[1,4]};},
};
function sky(c, w, h, top, bottom, bands = 6) {
  for (let i = 0; i < bands; i++) {
    const t = i / (bands - 1);
    const a = parseInt(top.slice(1), 16), b = parseInt(bottom.slice(1), 16);
    const mix = (sh) => Math.round(((a >> sh) & 255) * (1 - t) + ((b >> sh) & 255) * t);
    R(c, 0, Math.floor((h * i) / bands), w, Math.ceil(h / bands) + 1, `rgb(${mix(16)},${mix(8)},${mix(0)})`);
  }
}
function skyline(c, w, base, col, seed, hmin = 10, hmax = 34, wmin = 6, wmax = 16, windows = null) {
  const r = rng(seed);
  for (let x = -4; x < w;) {
    const bw = wmin + Math.floor(r() * (wmax - wmin));
    const bh = hmin + Math.floor(r() * (hmax - hmin));
    R(c, x, base - bh, bw, bh, col);
    if (r() < 0.3) R(c, x + Math.floor(bw / 2) - 1, base - bh - 4, 2, 4, col);
    if (windows) for (let wy = base - bh + 3; wy < base - 2; wy += 4) for (let wx = x + 2; wx < x + bw - 1; wx += 3) if (r() < 0.35) R(c, wx, wy, 1, 2, windows);
    x += bw + (r() < 0.3 ? 2 : 0);
  }
}
function ground(c, w, y, top, body, h = 90) {
  R(c, 0, y, w, h - y, body);
  R(c, 0, y, w, 1, top);
  for (let x = 0; x < w; x += 8) R(c, x, y + 4 + ((x / 8) % 2) * 3, 4, 1, shade(body, 0.8));
}
function veil(c, x, w, y0, y1, t) {
  // Velo de la Defensa: hexágonos ámbar parpadeantes
  for (let y = y0; y < y1; y += 4) for (let i = 0; i < w; i += 4) {
    const on = Math.sin(t * 3 + y * 0.3 + i * 0.7 + x) > 0.2;
    R(c, x + i + ((y / 4) % 2) * 2, y, 2, 1, on ? '#ffb547' : 'rgba(255,181,71,0.35)');
  }
}
function gridOf(map, pal, w, h) {
  const g = Array.from({ length: h }, () => Array(w).fill(null));
  map.forEach((row, y) => { for (let x = 0; x < row.length; x++) if (pal[row[x]]) g[y][x] = pal[row[x]]; });
  return g;
}
const OWL_G = OWL.map((m) => outline(gridOf(m, OWL_PAL, 16, 12)));

// ------------------------------------------------------------------ Juego: caché de sprites
// Cada pose se dibuja una vez en un lienzo y se reutiliza (y su versión teñida).
const SPRITES = new Map();
function gridCanvas(g) {
  const h = g.length, w = g[0].length;
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const c = cv.getContext('2d');
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const col = g[j][i];
    if (!col) continue;
    c.fillStyle = col;
    c.fillRect(i, j, 1, 1);
  }
  return cv;
}
function sprite(key, ch, pose, tintCol = null, w = 24, h = 32) {
  const k = key + '|' + (tintCol || '') + '|' + JSON.stringify(pose);
  let cv = SPRITES.get(k);
  if (!cv) {
    let g = drawChar(ch, pose, false, w, h);
    if (tintCol === 'sil') g = g.map((r) => r.map((v) => v && '#0a0812'));
    else if (tintCol) g = tint(g, tintCol, 0.8);
    cv = gridCanvas(g);
    if (SPRITES.size > 3000) SPRITES.clear();
    SPRITES.set(k, cv);
  }
  return cv;
}
function drawSprite(c, cv, x, y, flip = false, alpha = 1) {
  x = Math.round(x); y = Math.round(y);
  if (alpha !== 1) c.globalAlpha = alpha;
  if (flip) { c.save(); c.translate(x + cv.width, y); c.scale(-1, 1); c.drawImage(cv, 0, 0); c.restore(); }
  else c.drawImage(cv, x, y);
  if (alpha !== 1) c.globalAlpha = 1;
}
const OWL_CV = OWL_G.map(gridCanvas);
const OWL_HIT = OWL_G.map((g) => gridCanvas(tint(g, '#ffffff', 0.85)));
const GLYPH_CV = {};
function glyphCanvas(key, col) {
  const k = key + (col || '');
  if (!GLYPH_CV[k]) {
    const cv = document.createElement('canvas');
    cv.width = 9; cv.height = 9;
    glyph(cv.getContext('2d'), key, 0, 0, 1, col);
    GLYPH_CV[k] = cv;
  }
  return GLYPH_CV[k];
}

// Reparto con plantilla (de la sección de personajes de la biblia)
CH.abuela = template({ skin: '#d8b09a', hair: '#d9d5cf', hairStyle: 'bun', jacket: '#4c3a46', pants: '#3a3438', boots: '#2a2224' });
CH.unai = template({ skin: '#c99a7c', hair: '#3a2a1a', hairStyle: 'buzz', jacket: '#2a6a6a', pants: '#3a3430', boots: '#231d1a', marks: ['#2ee6d6'] });
CH.txema = template({ skin: '#c28d6a', hair: '#241a12', hairStyle: 'messy', beard: true, jacket: '#b3262b', pants: '#34404f', boots: '#e0e0e0' });
CH.rosa = template({ skin: '#d8b09a', hair: '#9a9a9a', hairStyle: 'bun', jacket: '#5a4632', pants: '#2a2a30', boots: '#231a1a' });
CH.pello = template({ skin: '#c28d6a', hair: '#3a2416', hairStyle: 'short', jacket: '#4a5a3a', pants: '#2a2f38', boots: '#3a2c22' });
CH.martin = template({ skin: '#c49a80', hair: '#4a3a30', hairStyle: 'short', beard: true, jacket: '#3a4a5a', pants: '#2a2a30', boots: '#231a1a' });
CH.salaberri = template({ skin: '#c49a80', hair: '#3a3430', hairStyle: 'slick', jacket: '#1f2a44', pants: '#1a1f2e', boots: '#0f0f11', gear: 'cape', cape: '#1f2a44' });

// Retrato: la cabeza y el torso del sprite en reposo
function portrait(key) {
  const k = 'portrait|' + key;
  if (SPRITES.has(k)) return SPRITES.get(k);
  const ch = key === 'paladin' ? PDC.paladin : CH[key];
  let cv;
  if (!ch) { // la caracola de bronce (la voz de la Centralita)
    cv = document.createElement('canvas'); cv.width = 24; cv.height = 24;
    const c = cv.getContext('2d');
    const P = ['.....aaaa......', '...aallllaa....', '..alAAAAAlla...', '.alA.....Ala...', '.aA..aaa..Aa...', 'aA..alla..Aa...', 'aA..aA.a..Aa...', 'aA...aa..aAa...', '.aA.....aAa....', '..aAAAAAAa.....', '...aaaaaa......'];
    const pal = { a: '#b88a4a', A: '#7a5a2e', l: '#e0b878' };
    P.forEach((r, y) => [...r].forEach((ch2, x) => { if (pal[ch2]) { c.fillStyle = pal[ch2]; c.fillRect(x + 4, y + 7, 1, 1); } }));
  } else {
    const pose = key === 'paladin' ? { shield: false, noArmF: true } : {};
    const g = drawChar(ch, pose);
    cv = document.createElement('canvas'); cv.width = 24; cv.height = 24;
    cv.getContext('2d').drawImage(gridCanvas(g), 0, 0, 24, 24, 0, 2, 24, 24);
  }
  SPRITES.set(k, cv);
  return cv;
}
