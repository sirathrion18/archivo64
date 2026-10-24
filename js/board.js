/* Archivo 64 — tablero. © 2026 Ignacio Dubois. Todos los derechos reservados. */
(function(){
"use strict";
const A64 = window.A64 = window.A64 || {};
const FILES = "abcdefgh";

/* ---------- Temas de tablero ---------- */
A64.BOARD_THEMES = {
  marron:  {name:"Marrón",       l:"#F0D9B5", d:"#B58863"},
  madera:  {name:"Madera clara", l:"#F3E4C8", d:"#C9A26B"},
  verde:   {name:"Verde",        l:"#EEEED2", d:"#769656"},
  azul:    {name:"Azul",         l:"#DEE3E6", d:"#8CA2AD"},
  gris:    {name:"Gris a64",     l:"#E6E1D7", d:"#8E8B85"},
  noche:   {name:"Noche",        l:"#9FA4AA", d:"#4D5560"},
  marmol:  {name:"Mármol",       l:"#ECEAE6", d:"#A3A8AC", lock:true},
  naranja: {name:"Oficina",      l:"#F6E3CF", d:"#D98A4B", lock:true},
  cereza:  {name:"Cereza",       l:"#F3D9D4", d:"#B5625C", lock:true},
  papel:   {name:"Papel",        l:"#FBF8F0", d:"#C9C2B4", lock:true},
  medianoche:{name:"Medianoche", l:"#7C8A99", d:"#2F3B4A", lock:true},
  torneo:  {name:"Torneo",       l:"#FFFFDD", d:"#86A666", lock:true}
};

/* ---------- Sets de piezas ---------- */
/* Plano: dibujo propio de Archivo 64, en el estilo plano que se usa online. viewBox 0 0 100 100. */
const FLAT = {
  base:'<path d="M22 90 Q22 81 31 80 H69 Q78 81 78 90 Z"/>',
  p:'<path d="M37 80 Q38 64 44 56 H56 Q62 64 63 80 Z"/><rect x="39" y="50" width="22" height="7" rx="3.5"/><circle cx="50" cy="38" r="12.5"/>',
  r:'<path d="M33 80 L36 46 H64 L67 80 Z"/><rect x="31" y="40" width="38" height="8" rx="2"/><path d="M31 41 V22 H39.5 V29 H46 V22 H54 V29 H60.5 V22 H69 V41 Z"/>',
  b:'<path d="M37 80 Q44 66 45 56 H55 Q56 66 63 80 Z"/><rect x="38" y="50" width="24" height="7" rx="3.5"/><path d="M50 15 C64 26 66 40 58 51 H42 C34 40 36 26 50 15 Z"/><circle cx="50" cy="12" r="4.5"/><path class="dl" d="M55 27 L45 40" fill="none" stroke-width="3.2" stroke-linecap="round"/>',
  n:'<path d="M32 80 C31 68 34 59 42 52 C36 54 28 55 24 51 C20 47 22 41 28 37 C35 32 39 26 42 17 L46 10 L51 18 C65 20 74 33 72 51 C71 62 68 71 66 80 Z"/><circle class="d" cx="38" cy="32" r="3"/><path class="dl" d="M53 21 C62 30 65 44 62 58" fill="none" stroke-width="3" stroke-linecap="round"/>',
  q:'<path d="M35 80 Q42 66 43 54 H57 Q58 66 65 80 Z"/><rect x="36" y="48" width="28" height="7" rx="3.5"/><path d="M34 49 L26 22 L39 35 L43 15 L50 31 L57 15 L61 35 L74 22 L66 49 Z"/><circle cx="26" cy="20" r="4.5"/><circle cx="43" cy="13" r="4.5"/><circle cx="57" cy="13" r="4.5"/><circle cx="74" cy="20" r="4.5"/>',
  k:'<path d="M35 80 Q42 66 43 54 H57 Q58 66 65 80 Z"/><rect x="36" y="48" width="28" height="7" rx="3.5"/><path d="M38 49 C32 38 38 29 50 29 C62 29 68 38 62 49 Z"/><path d="M46.5 29 V22 H41 V16 H46.5 V9 H53.5 V16 H59 V22 H53.5 V29 Z"/>'
};
function flatSVG(c,t){
  const w=c==="w", fill=w?"#FAF8F3":"#2B2926", stroke=w?"#1B1A18":"#0B0A09", det=w?"#1B1A18":"#EDE6D8";
  return '<svg viewBox="0 0 100 100"><g fill="'+fill+'" stroke="'+stroke+'" stroke-width="3.4" stroke-linejoin="round">'+FLAT.base+FLAT[t].replace(/class="dl"/g,'stroke="'+det+'"').replace(/class="d"/g,'stroke="'+det+'" fill="'+det+'"')+"</g></svg>";
}
/* Staunton: las piezas de torneo de la versión 1. viewBox 0 0 100 140. */
const ST_BASE='<path d="M24 134 C24 126 30 123 37 122 L63 122 C70 123 76 126 76 134 Z"/><ellipse cx="50" cy="134" rx="26" ry="3.6"/><path d="M31 122 C33 117 40 115 50 115 C60 115 67 117 69 122 Z"/>';
const ST={
 p:'<path d="M40 115 C43 104 45 96 45.5 89 L54.5 89 C55 96 57 104 60 115 Z"/><ellipse cx="50" cy="89" rx="11" ry="2.8"/><path d="M45 89 C46.5 85 47 83 47.5 81 L52.5 81 C53 83 53.5 85 55 89 Z"/><circle cx="50" cy="70" r="11.5"/>',
 r:'<path d="M36.5 115 C38.5 100 39.5 87 39.5 74 L60.5 74 C60.5 87 61.5 100 63.5 115 Z"/><ellipse cx="50" cy="74" rx="13" ry="2.8"/><path d="M36 74 L36 52 L42.5 52 L42.5 58.5 L47 58.5 L47 52 L53 52 L53 58.5 L57.5 58.5 L57.5 52 L64 52 L64 74 Z"/>',
 b:'<path d="M39.5 115 C43.5 101 46 89 46.5 78 L53.5 78 C54 89 56.5 101 60.5 115 Z"/><ellipse cx="50" cy="78" rx="10.5" ry="2.6"/><ellipse cx="50" cy="73" rx="8" ry="2.2"/><path d="M50 31 C63.5 41 64.5 57 57 70 L43 70 C35.5 57 36.5 41 50 31 Z"/><path d="M55.5 43 L46.5 56" fill="none" stroke-width="2.6"/><circle cx="50" cy="26.5" r="4.5"/>',
 n:'<path d="M37 115 C39 107 40.5 101 41 97 L59 97 C59.5 101 61 107 63 115 Z"/><ellipse cx="50" cy="97" rx="12.5" ry="2.8"/><path d="M41.5 97 C39.5 87 41 78 47 70 C41.5 72 34 73.5 29 69.5 C25 66 26 60 31.5 56 C37.5 51 42.5 43 46 35 L48.5 24 L53.5 32.5 C66.5 34.5 74 49 71 67 C69.5 79 64.5 89 61 97 Z"/><path d="M53.5 33 C62 41 65.5 55 62.5 70 C61.5 77 59.5 84 58 90" fill="none" stroke-width="1.6"/>',
 q:'<path d="M37.5 115 C42 101 45 87 45.5 74 L54.5 74 C55 87 58 101 62.5 115 Z"/><ellipse cx="50" cy="74" rx="11.5" ry="2.8"/><ellipse cx="50" cy="68" rx="9" ry="2.3"/><path d="M41 67 L33.5 40 L43 51 L46 31.5 L50 47 L54 31.5 L57 51 L66.5 40 L59 67 Z"/><circle cx="33.5" cy="37.5" r="3.4"/><circle cx="46" cy="29" r="3.4"/><circle cx="54" cy="29" r="3.4"/><circle cx="66.5" cy="37.5" r="3.4"/>',
 k:'<path d="M37.5 115 C42 101 45 87 45.5 74 L54.5 74 C55 87 58 101 62.5 115 Z"/><ellipse cx="50" cy="74" rx="11.5" ry="2.8"/><ellipse cx="50" cy="68" rx="9" ry="2.3"/><path d="M41.5 67 C35.5 55 39 44.5 50 44.5 C61 44.5 64.5 55 58.5 67 Z"/><path d="M47.6 44.5 L47.6 36.5 L42 36.5 L42 31.5 L47.6 31.5 L47.6 21 L52.4 21 L52.4 31.5 L58 31.5 L58 36.5 L52.4 36.5 L52.4 44.5 Z"/>'
};
function stauntonSVG(c,t){
  const w=c==="w";
  return '<svg viewBox="0 0 100 140" preserveAspectRatio="xMidYMax meet"><g fill="'+(w?"url(#a64gw)":"url(#a64gb)")+'" stroke="'+(w?"#3A3127":"#000")+'" stroke-width="2" stroke-linejoin="round">'+ST_BASE+ST[t]+'</g><path d="M31.5 121.6 C38 119.6 62 119.6 68.5 121.6" fill="none" stroke="#FF6A00" stroke-width="1.8"/>'+(t==="n"?'<circle cx="41.5" cy="49" r="2.4" fill="'+(w?"#2A2218":"#FF6A00")+'"/>':"")+"</svg>";
}
/* Pixel: piezas de 12×12, con la misma estética que el logo a64. */
const PX={"p":["......................","......................","......................","......................","......................","......................",".........oooo.........","........oooooo........",".......oooooooo.......",".......oooooooo.......",".......oooooooo.......",".......oooooooo.......",".......ooooooo........","........oooooo........",".......ooooooo........",".......oooooooo.......","........ooooo.........","........oooooo........","........oooooo........",".......ooooooo........",".......oooooooo.......",".......oooooooo.......",".......oooooooo.......",".......oooooooo.......","...oooooooooooooooo...","..oooooooooooooooooo..","..oooooooooooooooooo..","......................"],"r":["......................","......................","......................","......................","......................",".....ooo.ooo..ooo.....",".....ooo.ooo..ooo.....",".....oooooooooooo.....",".....oooooooooooo.....",".....oooooooooooo.....",".....oooooooooooo.....",".....oooooooooooo.....",".....odddddddddoo.....",".....oddddddddddo.....","......oooooooooo......","......oooooooooo......","......oooooooooo......","......oooooooooo......","......oooooooooo......","......oooooooooo......","......oooooooooo......","......oooooooooo......",".....ooooooooooo......",".....oooooooooooo.....","...oooooooooooooooo...","..oooooooooooooooooo..","..oooooooooooooooooo..","......................"],"b":["..........oo..........",".........oooo.........","..........oo..........","..........oo..........",".........oooo.........","........ooooo.........","........oooodo........",".......ooooddo........",".......oooddooo.......",".......ooodoooo.......",".......ooddoooo.......",".......oooooooo.......",".......oooooooo.......","........oooooo........",".......oooooooo.......",".......oooooooo.......",".........oooo.........",".........oooo.........",".........oooo.........","........ooooo.........","........oooooo........","........oooooo........",".......oooooooo.......",".......oooooooo.......","...oooooooooooooooo...","..oooooooooooooooooo..","..oooooooooooooooooo..","......................"],"n":["......................","......................",".........o............","........ooo...........","........oooooo........",".......ooooodoo.......",".......oooooddoo......","......doooooodooo.....",".....oddoooooodoo.....","....oooooooooodooo....","...ooooooooooodooo....","..ooooooooooooddoo....","..ooooooooooooddoo....","..ooooooooooooddoo....","...oooooooooooddoo....",".......ooooooodooo....",".......ooooooodooo....","......oooooooooooo....","......ooooooooooo.....",".....oooooooooooo.....",".....oooooooooooo.....",".....oooooooooooo.....",".....ooooooooooo......",".....ooooooooooo......","...oooooooooooooooo...","..oooooooooooooooooo..","..oooooooooooooooooo..","......................"],"q":["......................",".......ooo..oo........",".......ooo.oooo.......","..oo....oo..oo...ooo..",".oooo...o...oo...ooo..","..oo....oo..oo...ooo..","....o...oo.ooo...o....","....oo..oooooo..oo....","....oooooooooo.ooo....","....ooooooooooooo.....",".....oooooooooooo.....",".....oooooooooooo.....",".....ooooooooooo......","......oooooooooo......","......ooooooooo.......","......ooooooooo.......","........ooooo.........","........oooooo........","........oooooo........","........oooooo........",".......oooooooo.......",".......oooooooo.......","......ooooooooo.......","......oooooooooo......","...oooooooooooooooo...","..oooooooooooooooooo..","..oooooooooooooooooo..","......................"],"k":["......................","..........oo..........","..........oo..........","........oooooo........","........oooooo........","..........oo..........","..........oo..........",".........oooo.........",".......oooooooo.......",".......oooooooo.......","......oooooooooo......","......ooooooooo.......","......ooooooooo.......","......ooooooooo.......","......ooooooooo.......","......ooooooooo.......","........ooooo.........","........oooooo........","........oooooo........","........oooooo........",".......oooooooo.......",".......oooooooo.......","......ooooooooo.......","......oooooooooo......","...oooooooooooooooo...","..oooooooooooooooooo..","..oooooooooooooooooo..","......................"]};
/* Pixel HD: contorno afuera, luz a la izquierda y sombra a la derecha, detalles marcados. */
const PXPAL={pixel:{w:{o:"#1A1816",f:"#F2ECE0",h:"#FFFFFF",s:"#C4B79F",d:"#1A1816"},b:{o:"#0A0908",f:"#46413B",h:"#716A60",s:"#25221E",d:"#D9CFBC"}},
  pixeloro:{w:{o:"#3A2A05",f:"#F2C94C",h:"#FFF1B8",s:"#C9962A",d:"#3A2A05"},b:{o:"#0A0908",f:"#8C96A3",h:"#C8D0DA",s:"#5A6370",d:"#1A1816"}}};
function pixelSVG(c,t,pal){
  const P=(PXPAL[pal]||PXPAL.pixel)[c],m=PX[t],H=m.length,W=m[0].length;let r="";
  const on=(x,y)=>y>=0&&y<H&&x>=0&&x<W&&m[y][x]!==".";
  for(let y=-1;y<=H;y++)for(let x=-1;x<=W;x++){
    let col=null;
    if(on(x,y)){const ch=m[y][x];if(ch==="d")col=P.d;else if(!on(x-1,y)||!on(x,y-1))col=P.h;else if(!on(x+1,y)||!on(x,y+1)||!on(x+1,y+1))col=P.s;else col=P.f}
    else{for(let dy=-1;dy<=1&&!col;dy++)for(let dx=-1;dx<=1;dx++)if((dx||dy)&&on(x+dx,y+dy)){col=P.o;break}}
    if(col)r+='<rect x="'+(x+1)+'" y="'+(y+1)+'" width="1.02" height="1.02" fill="'+col+'"/>'}
  return '<svg viewBox="0 0 '+(W+2)+" "+(H+2)+'" preserveAspectRatio="xMidYMid meet" shape-rendering="crispEdges">'+r+"</svg>";
}
/* Variantes de color del set plano (se desbloquean con logros) */
function flatPal(c,t,pal){const P={oficina:{w:["#FAF8F3","#FF6A00","#1B1A18"],b:["#24221F","#FF6A00","#FF6A00"]},madera:{w:["#F1D9A7","#5B3A1A","#5B3A1A"],b:["#6B3F1F","#2A170A","#F1D9A7"]}}[pal][c];
  return '<svg viewBox="0 0 100 100"><g fill="'+P[0]+'" stroke="'+P[1]+'" stroke-width="3.4" stroke-linejoin="round">'+FLAT.base+FLAT[t].replace(/class="dl"/g,'stroke="'+P[2]+'"').replace(/class="d"/g,'stroke="'+P[2]+'" fill="'+P[2]+'"')+"</g></svg>"}
A64.PIECE_SETS = {
  plano:{name:"Plano",svg:flatSVG,tall:false},
  staunton:{name:"Staunton",svg:stauntonSVG,tall:true},
  pixel:{name:"Pixel",svg:(c,t)=>pixelSVG(c,t,"pixel"),tall:false},
  oficina:{name:"Oficina",svg:(c,t)=>flatPal(c,t,"oficina"),tall:false,lock:true},
  madera:{name:"Madera",svg:(c,t)=>flatPal(c,t,"madera"),tall:false,lock:true},
  pixeloro:{name:"Pixel oro",svg:(c,t)=>pixelSVG(c,t,"pixeloro"),tall:false,lock:true}
};
const pieceCache={};
A64.pieceSVG=function(set,c,t){const k=set+c+t;if(!pieceCache[k])pieceCache[k]=(A64.PIECE_SETS[set]||A64.PIECE_SETS.plano).svg(c,t);return pieceCache[k]};
A64.FIG={w:{k:"♔",q:"♕",r:"♖",b:"♗",n:"♘",p:""},b:{k:"♚",q:"♛",r:"♜",b:"♝",n:"♞",p:""}};

/* gradientes para Staunton, una sola vez */
(function(){if(document.getElementById("a64grad"))return;const d=document.createElement("div");d.id="a64grad";d.style.cssText="position:absolute;width:0;height:0;overflow:hidden";
  d.innerHTML='<svg width="0" height="0"><defs><linearGradient id="a64gw" x1="0" x2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".38" stop-color="#F6F0E4"/><stop offset=".7" stop-color="#E2D6C0"/><stop offset="1" stop-color="#A8977A"/></linearGradient><linearGradient id="a64gb" x1="0" x2="1"><stop offset="0" stop-color="#6B4E3D"/><stop offset=".3" stop-color="#3A291F"/><stop offset=".7" stop-color="#1A120D"/><stop offset="1" stop-color="#050302"/></linearGradient></defs></svg>';
  (document.body||document.documentElement).appendChild(d)})();

/* ---------- Sonidos (sintetizados, sin archivos) ---------- */
A64.Sound={ctx:null,on:true,vol:.8,
  c(){if(!this.on)return null;try{this.ctx=this.ctx||new (window.AudioContext||window.webkitAudioContext)();if(this.ctx.state==="suspended")this.ctx.resume();return this.ctx}catch(e){return null}},
  knock(freq,dur,gain,noiseG){const c=this.c();if(!c)return;const t=c.currentTime,g=c.createGain();g.gain.value=this.vol;g.connect(c.destination);
    const len=Math.floor(c.sampleRate*.05),b=c.createBuffer(1,len,c.sampleRate),x=b.getChannelData(0);for(let i=0;i<len;i++)x[i]=(Math.random()*2-1)*Math.pow(1-i/len,4);
    const s=c.createBufferSource(),bp=c.createBiquadFilter(),ng=c.createGain();bp.type="bandpass";bp.frequency.value=freq*6;bp.Q.value=1.2;ng.gain.value=noiseG;s.buffer=b;s.connect(bp);bp.connect(ng);ng.connect(g);s.start(t);
    const o=c.createOscillator(),og=c.createGain();o.type="sine";o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(freq*.6,t+dur);og.gain.setValueAtTime(gain,t);og.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(og);og.connect(g);o.start(t);o.stop(t+dur+.02)},
  tone(f,d,type,v,at){const c=this.c();if(!c)return;const t=c.currentTime+(at||0),o=c.createOscillator(),g=c.createGain();o.type=type||"sine";o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime((v||.1)*this.vol,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+d+.02)},
  move(){this.knock(180,.09,.35,.9)},
  capture(){this.knock(140,.14,.5,1.6);this.knock(240,.06,.2,.6)},
  check(){this.move();this.tone(880,.12,"triangle",.07,.05)},
  error(){this.tone(220,.18,"square",.05);this.tone(170,.22,"square",.05,.15)},
  ok(){this.tone(660,.12,"triangle",.08);this.tone(990,.16,"triangle",.07,.1)},
  alarm(){this.tone(660,.18,"square",.05);this.tone(520,.22,"square",.05,.22)},
  win(){[523,659,784,1046].forEach((f,i)=>this.tone(f,.28,"triangle",.07,i*.11))},
  tick(){this.tone(1200,.03,"square",.03)}
};

/* ---------- Componente tablero ---------- */
/* opts: {orientation:'w'|'b', interactive:fn(sq)->bool, onMove:fn({from,to}), legal:fn(from)->[{to,captured}], mini:bool} */
class Board{
  constructor(el,opts){
    this.el=el;this.o=Object.assign({orientation:"w"},opts||{});this.fen="8/8/8/8/8/8/8/8 w - - 0 1";
    this.marks={};this.arrows=[];this.drawn=[];this.sel=null;this.dots=[];this.last=null;this.check=null;this.risk=[];this.hl=null;
    this.el.classList.add("a64-board");if(this.o.mini)this.el.classList.add("mini");
    this.el.innerHTML='<div class="bwrap"><div class="bgrid"></div><svg class="barrows" viewBox="0 0 8 8" aria-hidden="true"></svg><div class="bfx"></div></div>';
    this.grid=this.el.querySelector(".bgrid");this.svg=this.el.querySelector(".barrows");this.fx=this.el.querySelector(".bfx");
    this.pencil=false;this.bind();
  }
  get set(){return (A64.settings&&A64.settings.pieces)||"plano"}
  sqXY(sq){const f=FILES.indexOf(sq[0]),r=+sq[1]-1;return this.o.orientation==="b"?{x:7-f,y:r}:{x:f,y:7-r}}
  xySq(x,y){return this.o.orientation==="b"?FILES[7-x]+(y+1):FILES[x]+(8-y)}
  setOrientation(c){this.o.orientation=c;this.render()}
  flip(){this.setOrientation(this.o.orientation==="w"?"b":"w")}
  position(fen,anim){const prev=this.fen;this.fen=fen;this.render(anim&&prev!==fen?anim:null)}
  grid8(){const rows=this.fen.split(" ")[0].split("/"),g=[];for(const row of rows){const r=[];for(const c of row){if(/\d/.test(c))for(let i=0;i<+c;i++)r.push(null);else r.push(c)}g.push(r)}return g}
  pieceAt(sq){const g=this.grid8(),f=FILES.indexOf(sq[0]),r=+sq[1];const c=g[8-r][f];if(!c)return null;return{type:c.toLowerCase(),color:c===c.toUpperCase()?"w":"b"}}
  render(anim){
    const s=A64.settings||{},g=this.grid8(),coords=s.coords!==false&&!this.o.noCoords,dots=new Map(this.dots.map(d=>[d.to,d])),risk=new Set(this.risk),tall=(A64.PIECE_SETS[this.set]||{}).tall;
    this.el.classList.toggle("tall",!!tall);
    let h="";
    for(let y=0;y<8;y++)for(let x=0;x<8;x++){
      const sq=this.xySq(x,y),f=FILES.indexOf(sq[0]),r=+sq[1],light=(f+r)%2===0,p=g[8-r][f],cls=["sq",light?"l":"d"];
      if(this.last&&(this.last.from===sq||this.last.to===sq))cls.push("last");
      if(this.sel===sq)cls.push("sel");if(this.check===sq)cls.push("chk");if(this.hl===sq)cls.push("hl");
      const mk=this.marks[sq];if(mk)cls.push("mk-"+mk);
      const d=dots.get(sq);if(d)cls.push(d.captured?"cap":"dot");
      let inner="";
      if(coords&&!this.o.mini)inner+='<span class="co">'+sq+"</span>";
      if(p){const c=p===p.toUpperCase()?"w":"b",t=p.toLowerCase();if(risk.has(sq))inner+='<i class="risk"></i>';inner+='<span class="pc" data-c="'+c+'" data-t="'+t+'">'+A64.pieceSVG(this.set,c,t)+"</span>"}
      h+='<div class="'+cls.join(" ")+'" data-sq="'+sq+'">'+inner+"</div>";
    }
    this.grid.innerHTML=h;this.drawArrows();
    if(anim&&anim.from&&anim.to&&s.anim!==false&&!A64.reduced){
      const pc=this.grid.querySelector('[data-sq="'+anim.to+'"] .pc');
      if(pc){const w=this.grid.clientWidth/8,a=this.sqXY(anim.from),b=this.sqXY(anim.to);
        pc.style.transform="translate("+(a.x-b.x)*w+"px,"+(a.y-b.y)*w+"px)";pc.style.zIndex=5;void pc.offsetWidth;
        pc.style.transition="transform .2s cubic-bezier(.25,.8,.3,1)";pc.style.transform="";setTimeout(()=>{pc.style.transition="";pc.style.zIndex=""},230)}}
  }
  setArrows(a){this.arrows=a||[];this.drawArrows()}
  drawArrows(){
    const COL={red:"#E04B3A",green:"#3FA65A",blue:"#3B82C4",orange:"#FF6A00",user:"#F2A531",grey:"#888"};
    let h="";const list=[...this.arrows,...this.drawn];
    for(const a of list){
      const c=COL[a.color]||a.color||COL.orange;
      if(!a.to||a.to===a.from){const p=this.sqXY(a.from);h+='<circle cx="'+(p.x+.5)+'" cy="'+(p.y+.5)+'" r=".44" fill="none" stroke="'+c+'" stroke-width=".08" opacity=".9"/>';continue}
      const A=this.sqXY(a.from),B=this.sqXY(a.to),x1=A.x+.5,y1=A.y+.5,x2=B.x+.5,y2=B.y+.5,dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L;
      const ex=x2-ux*.38,ey=y2-uy*.38,hw=.24,sw=a.thin?.1:.15;
      h+='<g opacity="'+(a.opacity||.85)+'"><line x1="'+(x1+ux*.18)+'" y1="'+(y1+uy*.18)+'" x2="'+ex+'" y2="'+ey+'" stroke="'+c+'" stroke-width="'+sw+'" stroke-linecap="round"/><polygon points="'+(x2-ux*.06)+","+(y2-uy*.06)+" "+(ex-uy*hw)+","+(ey+ux*hw)+" "+(ex+uy*hw)+","+(ey-ux*hw)+'" fill="'+c+'"/></g>';
    }
    this.svg.innerHTML=h;
  }
  clearDrawn(){if(this.drawn.length){this.drawn=[];this.drawArrows()}}
  flash(sq,kind){const el=this.grid.querySelector('[data-sq="'+sq+'"]');if(!el)return;el.classList.add(kind||"bad");setTimeout(()=>el.classList.remove(kind||"bad"),600)}
  sqFromPoint(x,y){const el=document.elementFromPoint(x,y);const s=el&&el.closest&&el.closest(".a64-board .sq");return s&&this.el.contains(s)?s.dataset.sq:null}
  bind(){
    const el=this.el;let drag=null,draw=null;
    el.addEventListener("contextmenu",e=>e.preventDefault());
    el.addEventListener("pointerdown",e=>{
      const sq=this.sqFromPoint(e.clientX,e.clientY);if(!sq)return;
      A64.Sound.c();
      if(e.button===2||this.pencil){draw={from:sq,shift:e.shiftKey||e.altKey};e.preventDefault();return}
      if(e.button!==0)return;
      this.clearDrawn();
      if(!this.o.interactive||!this.o.interactive(sq)){this.o.onTap&&this.o.onTap(sq);return}
      const p=this.pieceAt(sq);
      if(this.sel&&this.sel!==sq&&this.dots.some(d=>d.to===sq)){const from=this.sel;this.select(null);this.o.onMove&&this.o.onMove({from,to:sq});return}
      if(p&&this.o.canPick&&this.o.canPick(sq)){
        this.select(sq);
        const pcEl=this.grid.querySelector('[data-sq="'+sq+'"] .pc');
        if(pcEl){const r=pcEl.getBoundingClientRect();drag={from:sq,el:pcEl,x0:e.clientX,y0:e.clientY,moved:false,w:r.width,h:r.height};}
        try{el.setPointerCapture(e.pointerId)}catch(_){}
      }else{this.select(null);this.o.onTap&&this.o.onTap(sq)}
    });
    el.addEventListener("pointermove",e=>{
      if(!drag)return;const dx=e.clientX-drag.x0,dy=e.clientY-drag.y0;
      if(!drag.moved&&Math.hypot(dx,dy)<5)return;
      if(!drag.moved){drag.moved=true;drag.el.classList.add("dragging");el.classList.add("is-drag")}
      drag.el.style.transform="translate("+dx+"px,"+dy+"px) scale(1.12)";
      const over=this.sqFromPoint(e.clientX,e.clientY);this.grid.querySelectorAll(".over").forEach(x=>x.classList.remove("over"));
      if(over&&this.dots.some(d=>d.to===over)){const s=this.grid.querySelector('[data-sq="'+over+'"]');s&&s.classList.add("over")}
    });
    const end=e=>{
      if(draw){const to=this.sqFromPoint(e.clientX,e.clientY)||draw.from;const color=draw.shift?"red":"user";
        const i=this.drawn.findIndex(a=>a.from===draw.from&&a.to===to);if(i>=0)this.drawn.splice(i,1);else this.drawn.push({from:draw.from,to,color});draw=null;this.drawArrows();return}
      if(!drag)return;const d=drag;drag=null;el.classList.remove("is-drag");
      if(!d.moved){d.el.classList.remove("dragging");return}
      const to=this.sqFromPoint(e.clientX,e.clientY);
      d.el.classList.remove("dragging");d.el.style.transform="";
      this.grid.querySelectorAll(".over").forEach(x=>x.classList.remove("over"));
      if(to&&to!==d.from&&this.dots.some(x=>x.to===to)){this.select(null);this.o.onMove&&this.o.onMove({from:d.from,to,dragged:true})}
    };
    el.addEventListener("pointerup",end);el.addEventListener("pointercancel",()=>{if(drag){drag.el.classList.remove("dragging");drag.el.style.transform="";drag=null;el.classList.remove("is-drag")}draw=null});
  }
  select(sq){this.sel=sq;this.dots=sq&&this.o.legal?this.o.legal(sq):[];this.render();this.o.onSelect&&this.o.onSelect(sq,this.dots)}
  confetti(){if(A64.reduced||(A64.settings&&A64.settings.anim===false))return;const f=this.fx;const cols=["#FF6A00","#F2A531","#3FA65A","#3B82C4","#EDEAE4"];
    for(let i=0;i<60;i++){const s=document.createElement("i");s.className="conf";s.style.left=Math.random()*100+"%";s.style.background=cols[i%cols.length];s.style.animationDelay=(Math.random()*.4)+"s";s.style.setProperty("--dx",(Math.random()*2-1)*60+"px");s.style.setProperty("--rot",Math.random()*720+"deg");f.appendChild(s);setTimeout(()=>s.remove(),2200)}}
}
A64.Board=Board;
})();
