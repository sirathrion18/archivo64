/* Archivo 64 — Jugar contra el analista. © 2026 Ignacio Dubois. Todos los derechos reservados. */
(function(){
"use strict";
const A64=window.A64,S=A64.S,$=A64.$,$$=A64.$$,esc=A64.esc,F=x=>A64.figSan(x.san,x.color);
const CLOCKS={none:null,"10+0":{base:600,inc:0},"5+3":{base:300,inc:3},"3+2":{base:180,inc:2}};
const MODES={entrena:{name:"Entrenamiento",d:"Te frena antes de cada error, marca tus piezas en peligro y tenés pistas."},normal:{name:"Normal",d:"Un comentario después de cada jugada tuya. Sin freno."},torneo:{name:"Torneo",d:"Nada hasta el final, como en Lichess. Después, el análisis completo."}};
let cfg=Object.assign({agent:"rotar",clock:"none",color:"w",mode:"entrena",from:""},S.playCfg||{});
let G=null,board=null,root=null,tick=null;

/* ================= configuración ================= */
function setup(){
  const lv=S.level,ag=cfg.agent==="rotar"?A64.nextAgent():cfg.agent,AG=A64.AGENTS;
  const agentCard=(k,a,sub)=>'<button class="item" data-agent="'+k+'" aria-pressed="'+(cfg.agent===k)+'" style="'+(cfg.agent===k?"border-color:var(--acc);background:var(--acc-soft)":"")+'"><span class="avatar'+(cfg.agent===k?" acc":"")+'">'+a+'</span><span style="min-width:0"><div class="t">'+sub[0]+'</div><div class="s">'+sub[1]+'</div></span><span></span></button>';
  root.innerHTML='<div class="hello"><h1>Jugar contra la oficina</h1><p>Rival de tu nivel, que sube y baja según cómo jugás.</p></div>'
   +(S.practice?'<div class="warm"><div><h3>Tenés una partida a medias</h3><p class="mute">Contra '+esc((AG[S.practice.agent]||{}).name||"el analista")+', nivel '+S.practice.level+'.</p></div><button class="btn main" id="bResume">Seguir partida</button></div>':"")
   +'<div class="grid2"><div class="card"><div class="card-h"><h2>Rival</h2><span class="pill acc">Nivel '+lv+' · ≈'+A64.rating(lv)+' · '+A64.rank(lv)+'</span></div><div class="list">'
   +agentCard("rotar","↻",["Rotar estilos","Cada partida, un agente distinto. Próximo: "+AG[ag].name])
   +A64.agentList.map(k=>agentCard(k,AG[k].ini,[AG[k].name+" · "+AG[k].role,AG[k].desc])).join("")
   +'</div><div class="row" style="margin-top:12px"><span class="lbl">Nivel</span><span class="sp"></span><button class="btn sm" id="lvDown" aria-label="Bajar nivel">−</button><b class="num" style="min-width:2.4em;text-align:center">'+lv+'</b><button class="btn sm" id="lvUp" aria-label="Subir nivel">+</button></div><div class="ladder" style="margin-top:8px">'+Array.from({length:30},(_,i)=>'<i class="'+(i<lv?"on":"")+(i===lv-1?" now":"")+'"></i>').join("")+'</div><p class="mute" style="font-size:12.5px;margin-top:6px">Se ajusta solo después de cada partida. Los botones son por si querés forzarlo.</p></div>'
   +'<div class="card stack"><div><p class="lbl">Modo</p><div class="list" style="margin-top:6px">'+Object.entries(MODES).map(([k,m])=>'<button class="item" data-mode="'+k+'" style="grid-template-columns:1fr auto;'+(cfg.mode===k?"border-color:var(--acc);background:var(--acc-soft)":"")+'"><span><div class="t">'+m.name+'</div><div class="s" style="white-space:normal">'+m.d+'</div></span><span>'+(cfg.mode===k?"●":"")+'</span></button>').join("")+'</div></div>'
   +'<div><p class="lbl">Reloj</p><div class="chips" style="margin-top:6px">'+Object.keys(CLOCKS).map(k=>'<button class="chip" data-clock="'+k+'" aria-pressed="'+(cfg.clock===k)+'">'+(k==="none"?"Sin reloj":k)+'</button>').join("")+'</div></div>'
   +'<div><p class="lbl">Color</p><div class="seg" style="margin-top:6px">'+[["w","Blancas"],["b","Negras"],["r","Al azar"]].map(([k,n])=>'<button data-color="'+k+'" aria-pressed="'+(cfg.color===k)+'">'+n+'</button>').join("")+'</div></div>'
   +'<div class="field"><label class="lbl" for="pFrom">Empezar desde una apertura</label><select id="pFrom"><option value="">Desde el principio</option>'+A64.OPENINGS.map(o=>'<option value="'+o.id+'"'+(cfg.from===o.id?" selected":"")+'>'+(o.side==="w"?"♔ ":"♚ ")+esc(o.name)+'</option>').join("")+'</select><span class="mute" style="font-size:12.5px">Jugás del lado de la apertura y el analista prueba respuestas distintas.</span></div>'
   +'<button class="btn main wide" id="bStart" style="min-height:52px;font-size:17px">Jugar</button></div></div>';
  $$("[data-agent]",root).forEach(b=>b.onclick=()=>{cfg.agent=b.dataset.agent;saveCfg();setup()});
  $$("[data-mode]",root).forEach(b=>b.onclick=()=>{cfg.mode=b.dataset.mode;if(cfg.mode==="torneo"&&cfg.clock==="none")cfg.clock="5+3";saveCfg();setup()});
  $$("[data-clock]",root).forEach(b=>b.onclick=()=>{cfg.clock=b.dataset.clock;saveCfg();setup()});
  $$("[data-color]",root).forEach(b=>b.onclick=()=>{cfg.color=b.dataset.color;saveCfg();setup()});
  $("#pFrom",root).onchange=e=>{cfg.from=e.target.value;saveCfg()};
  $("#lvDown",root).onclick=()=>{S.level=Math.max(1,S.level-1);A64.save();setup()};
  $("#lvUp",root).onclick=()=>{S.level=Math.min(30,S.level+1);A64.save();setup()};
  $("#bStart",root).onclick=()=>start();
  if($("#bResume",root))$("#bResume",root).onclick=()=>start(S.practice);
}
function saveCfg(){S.playCfg=cfg;A64.save()}

/* ================= partida ================= */
function start(resume,opts){
  opts=opts||{};
  A64.Sound.c();
  const r=resume||null;
  const agent=r?r.agent:(opts.agent||(cfg.agent==="rotar"?A64.nextAgent():cfg.agent));
  const from=r?null:(opts.from!==undefined?opts.from:cfg.from);
  const op=from?A64.OPENINGS.find(o=>o.id===from):null;
  let color=r?r.color:(op?op.side:(opts.color||cfg.color));if(color==="r")color=Math.random()<.5?"w":"b";
  const mode=r?r.mode:(opts.mode||cfg.mode),clockKey=r?r.clock:(opts.clock||cfg.clock),ck=CLOCKS[clockKey];
  const ch=new Chess();
  if(r&&r.pgn)ch.load_pgn(r.pgn);else if(op)op.moves.forEach(m=>ch.move(m[0]));
  G={ch,color,agent,level:r?r.level:S.level,mode,clockKey,clock:ck?{w:(r&&r.tw)||ck.base*1000,b:(r&&r.tb)||ck.base*1000,inc:ck.inc*1000}:null,
     gen:0,busy:false,pre:null,hint:0,hintsUsed:0,undos:0,times:(r&&r.times)||[],turnT:0,last:null,nexo:null,over:false,fromOp:op?op.name:null,opPly:op?op.moves.length:0,feed:[],tips:new Set()};
  const h=ch.history({verbose:true});G.last=h[h.length-1]||null;
  render();save();
  if(op&&!r)coach("Arrancamos desde la <em>"+esc(op.name)+"</em>. "+esc(op.idea));
  else coach(A64.AGENTS[agent].line?"«"+esc(A64.AGENTS[agent].line)+"»":"");
  nextTurn();
}
function save(){if(!G||G.over)return;S.practice={pgn:G.ch.pgn(),color:G.color,agent:G.agent,level:G.level,mode:G.mode,clock:G.clockKey,times:G.times,tw:G.clock&&G.clock.w,tb:G.clock&&G.clock.b};A64.save()}
function myTurn(){return G&&!G.over&&G.ch.turn()===G.color}

function render(){
  const AG=A64.AGENTS[G.agent],me=S.user||"Vos";
  root.innerHTML='<div class="play"><div class="bcol">'
   +'<div class="player" style="width:100%"><span class="avatar acc">'+AG.ini+'</span><span class="pn"><b>'+esc(AG.name)+'</b><span>'+AG.role+' · Nivel '+G.level+' · ≈'+A64.rating(G.level)+'</span></span>'+(G.clock?'<span class="clock" id="ckO"></span>':"")+'</div>'
   +'<div class="bstage" id="pStage"><div id="pBoard"></div><div class="nexo" id="pNexo" hidden></div></div>'
   +'<div class="player" style="width:100%"><span class="avatar">'+esc(me.slice(0,2).toUpperCase())+'</span><span class="pn"><b>'+esc(me)+'</b><span>'+MODES[G.mode].name+(G.fromOp?" · desde "+esc(G.fromOp):"")+'</span></span>'+(G.clock?'<span class="clock" id="ckM"></span>':"")+'</div>'
   +'</div><div class="side">'
   +'<div class="coach" id="pCoach"><span class="avatar acc"><span>AF</span></span><div><div class="who"><b>Analista Ferreyra</b> · <span id="pTurn"></span></div><div class="say" id="pSay"></div></div></div>'
   +'<div class="card" id="pFeed" hidden></div>'
   +'<div class="moves" id="pMoves"></div>'
   +'<div class="ctrl">'+(G.mode!=="torneo"?'<button class="btn" id="bHint">Pista <span class="k">H</span></button><button class="btn" id="bUndo">Deshacer</button>':"")+'<button class="btn" id="bFlip">Girar <span class="k">F</span></button><button class="btn ghost" id="bResign">Abandonar</button></div>'
   +'<div class="legend"><span><i style="background:#E04B3A"></i>tu error</span><span><i style="background:#3FA65A"></i>lo correcto</span><span><i style="background:#3B82C4"></i>amenaza del rival</span><span><i style="background:#F2A531"></i>tus flechas</span></div>'
   +'</div></div>';
  board=A64.makeBoard($("#pBoard",root),{orientation:G.color,
    interactive:()=>myTurn()&&!G.busy&&!G.nexo,
    canPick:sq=>{const p=G.ch.get(sq);return p&&p.color===G.color},
    legal:sq=>G.ch.moves({square:sq,verbose:true}),
    onMove:mv=>userMove(mv),
    onSelect:(sq,dots)=>{if(sq&&G.mode!=="torneo"){const p=G.ch.get(sq);say("Tu "+A64.NAME[p.type]+" en "+sq+(dots.length?": "+dots.length+" casilla"+(dots.length>1?"s":"")+" posible"+(dots.length>1?"s":"")+(dots.some(d=>d.captured)?", con captura marcada en anillo":"")+".":" no se puede mover."))}}});
  if($("#bHint",root))$("#bHint",root).onclick=hint;
  if($("#bUndo",root))$("#bUndo",root).onclick=undo;
  $("#bFlip",root).onclick=()=>board.flip();
  $("#bResign",root).onclick=()=>{if(G.over)return;A64.modal('<div class="modal-b"><h2>¿Abandonar la partida?</h2><p class="mute">Cuenta como derrota.</p><div class="row"><button class="btn main" id="mYes">Abandonar</button><button class="btn" data-close>Seguir jugando</button></div></div>',box=>{$("#mYes",box).onclick=()=>{A64.closeModal();finish("resign")}})};
  draw();
}
function draw(opts){
  const h=G.ch.history({verbose:true});
  board.last=G.last;board.check=G.ch.in_check()?kingSq(G.ch,G.ch.turn()):null;
  board.risk=(G.mode==="entrena"&&myTurn()&&!G.busy)?A64.hanging(G.ch.fen(),G.color).map(x=>x.sq):[];
  board.position(G.ch.fen(),opts&&opts.anim);
  let s="";for(let i=0;i<h.length;i+=2){s+='<span class="n">'+(i/2+1)+'</span><button class="mv">'+F(h[i])+'</button><button class="mv">'+(h[i+1]?F(h[i+1]):"")+'</button>'}
  const mv=$("#pMoves",root);mv.innerHTML=s||'<span class="empty">Todavía no hay jugadas.</span>';mv.scrollTop=1e6;
  $("#pTurn",root).textContent=G.over?"fin":myTurn()?"te toca":"le toca";
  if($("#bHint",root))$("#bHint",root).disabled=!myTurn()||G.busy;
  if($("#bUndo",root))$("#bUndo",root).disabled=G.busy||h.length<=G.opPly;
  drawClock();
}
function kingSq(ch,c){const b=ch.board();for(let r=0;r<8;r++)for(let f=0;f<8;f++){const p=b[r][f];if(p&&p.type==="k"&&p.color===c)return "abcdefgh"[f]+(8-r)}}
function say(h,think){const el=$("#pSay",root);if(!el)return;el.innerHTML=h;$("#pCoach",root).classList.toggle("think",!!think)}
function coach(h){say(h)}

/* ---------- reloj ---------- */
function drawClock(){if(!G.clock)return;const t=G.ch.turn(),mine=G.color,o=mine==="w"?"b":"w";
  const set=(id,c)=>{const el=$(id,root);if(!el)return;el.textContent=A64.fmtClock(G.clock[c]);el.classList.toggle("run",!G.over&&t===c&&!G.paused);el.classList.toggle("low",G.clock[c]<20000)};
  set("#ckM",mine);set("#ckO",o)}
function startTick(){clearInterval(tick);if(!G.clock)return;let lt=performance.now();
  tick=setInterval(()=>{if(!G||G.over){clearInterval(tick);return}const now=performance.now(),dt=now-lt;lt=now;if(G.paused)return;
    const c=G.ch.turn();G.clock[c]-=dt;if(G.clock[c]<=0){G.clock[c]=0;drawClock();finish("flag",c);return}drawClock()},100)}

/* ---------- turnos ---------- */
function nextTurn(){
  if(G.over)return;draw();
  if(G.ch.game_over()){finish();return}
  startTick();
  if(myTurn()){
    G.hint=0;G.turnT=performance.now();G.paused=false;
    const fen=G.ch.fen();G.pre={fen,p:A64.engine.analyse(fen,{depth:12,movetime:700,prio:true,tag:"play"})};
    const risk=board.risk;
    if(G.mode==="entrena"&&risk.length){const r=A64.hanging(fen,G.color)[0];say('<span class="bad">Ojo:</span> '+A64.TU[r.type]+" en "+r.sq+" está en peligro (círculo rojo).")}
    else if(G.ch.in_check())say('<span class="bad">Estás en jaque.</span> Sacá a tu rey del jaque.');
  }else botTurn();
}
async function userMove(mv){
  if(!myTurn()||G.busy)return;
  const gen=G.gen,fenB=G.ch.fen(),secs=(performance.now()-G.turnT)/1000;
  const m=G.ch.move({from:mv.from,to:mv.to,promotion:"q"});if(!m)return;
  G.last=m;board.clearDrawn();board.setArrows([]);board.hl=null;
  sound(m);
  if(G.clock){G.clock[G.color]+=G.clock.inc}
  if(G.mode==="torneo"){G.times.push(Math.round(secs*10)/10);draw({anim:mv.dragged?null:m});save();
    if(G.ch.game_over()){finish();return}nextTurn();return}
  G.busy=true;G.paused=true;draw({anim:mv.dragged?null:m});say("Reviso tu jugada…",true);
  const before=G.pre&&G.pre.fen===fenB?G.pre.p:A64.engine.analyse(fenB,{depth:12,movetime:700,prio:true,tag:"play"});
  const [evB,evA]=await Promise.all([before,A64.engine.analyse(G.ch.fen(),{depth:12,movetime:700,prio:true,tag:"play"})]);
  if(gen!==G.gen||!evB||!evA)return;
  const v=A64.classify(evB,evA,m,evB.best);
  const x=A64.explain({fenB,move:m,evB,evA,verdict:v,me:G.color});
  if(G.mode==="entrena"&&(v==="mistake"||v==="blunder")&&!G.ch.game_over()){nexo(m,v,x,secs);return}
  G.times.push(Math.round(secs*10)/10);
  feedback(m,v,x);
  G.busy=false;save();
  if(G.ch.game_over()){finish();return}
  nextTurn();
}
function sound(m){if(G&&G.ch.in_check())A64.Sound.check();else if(m.captured)A64.Sound.capture();else A64.Sound.move()}
function feedback(m,v,x){
  const el=$("#pFeed",root);if(!el)return;el.hidden=false;const V=A64.VERD[v]||{t:"",c:""};
  el.innerHTML='<div class="card-h"><h2 style="font-size:20px">'+F(m)+'</h2><span class="tag '+V.c+'">'+V.t+'</span></div><div class="expl"><p>'+esc(x.short)+'</p>'
    +(x.paras.length>1?'<details class="more"><summary>Ver la explicación completa</summary><div class="expl">'+x.paras.map(p=>"<p>"+esc(p)+"</p>").join("")+'</div></details>':"")+tipLine(m)+'</div>';
  if(v==="mistake"||v==="blunder"||v==="inacc"){board.setArrows(x.arrows.filter(a=>a.color!=="red"))}
}
function tipLine(m){const n=Math.ceil(G.ch.history().length/2),T=(k,t)=>{if(G.tips.has(k))return"";G.tips.add(k);return'<p class="tip">'+t+"</p>"};
  if(m.flags.includes("k")||m.flags.includes("q"))return T("castled","Enroque hecho: rey a salvo y torre en juego.");
  if(m.piece==="q"&&n<=5)return T("queen","Sacaste la dama en la jugada "+n+": el rival la va a perseguir ganando tiempos. Primero caballos y alfiles.");
  if(m.piece==="n"&&(m.to[0]==="a"||m.to[0]==="h"))return T("rim","Caballo en el borde: controla la mitad de casillas que en el centro.");
  if(n>=9&&kingSq(G.ch,G.color)===(G.color==="w"?"e1":"e8"))return T("castle","Jugada "+n+" y tu rey sigue en el centro. Enrocá pronto.");
  return""}
function nexo(m,v,x,secs){
  G.nexo={m,v,x,secs};A64.Sound.alarm();$("#pStage",root).classList.add("alarm");
  const box=$("#pNexo",root);box.hidden=false;
  box.innerHTML='<div class="t">⚠ Alerta antes del error</div><p><b>'+F(m)+':</b> '+esc(x.short)+'</p><div class="row"><button class="btn main" id="nxBack">Pensarlo de nuevo</button><button class="btn" id="nxWhy">¿Por qué?</button><button class="btn ghost" id="nxGo">Jugar igual</button></div>';
  board.setArrows(x.arrows.filter(a=>a.color!=="green"));
  say('<span class="bad">Pará.</span> Esa jugada te cuesta. Leé el aviso sobre el tablero.');
  $("#nxBack",root).onclick=()=>{hideNexo();G.ch.undo();const h=G.ch.history({verbose:true});G.last=h[h.length-1]||null;if(G.clock)G.clock[G.color]-=G.clock.inc;board.setArrows([]);G.busy=false;A64.Sound.move();nextTurn();say("Volvimos. Mirá la flecha azul: es lo que te iba a hacer el rival.");board.setArrows(x.arrows.filter(a=>a.color==="blue").map(a=>Object.assign({},a,{opacity:.5})))};
  $("#nxWhy",root).onclick=()=>{feedback(m,v,x);const d=$("#pFeed details",root);if(d)d.open=true;$("#pFeed",root).scrollIntoView({block:"nearest",behavior:"smooth"})};
  $("#nxGo",root).onclick=()=>{const n=G.nexo;hideNexo();G.times.push(Math.round(n.secs*10)/10);feedback(n.m,n.v,n.x);G.busy=false;save();if(G.ch.game_over()){finish();return}nextTurn()};
}
function hideNexo(){if(!G)return;G.nexo=null;const b=$("#pNexo",root);if(b)b.hidden=true;const st=$("#pStage",root);if(st)st.classList.remove("alarm")}
async function hint(){
  if(!myTurn()||G.busy)return;const gen=G.gen,fen=G.ch.fen();
  if(!G.pre||G.pre.fen!==fen)G.pre={fen,p:A64.engine.analyse(fen,{depth:12,movetime:700,prio:true,tag:"play"})};
  say("Busco…",true);const r=await G.pre.p;if(gen!==G.gen||G.ch.fen()!==fen||!r||!r.best)return;
  const m=A64.uciMove(fen,r.best);G.hintsUsed++;
  if(G.hint===0){G.hint=1;board.hl=m.from;board.render();say("Pista 1: mirá tu "+A64.NAME[m.piece]+" en <em>"+m.from+"</em>. ¿A dónde la llevarías? Si no sale, tocá Pista otra vez.")}
  else{const br=A64.bestReason(fen,r,G.color);board.hl=null;board.setArrows([{from:m.from,to:m.to,color:"green"}]);board.render();say("Pista 2: <em>"+F(m)+"</em>. "+esc(br?br.why:A64.describeMove(m)))}
}
function undo(){
  if(!G||G.over)return;const h=G.ch.history().length;if(h<=G.opPly)return;
  G.gen++;hideNexo();A64.engine.cancel("play");
  if(myTurn()){G.ch.undo();G.ch.undo();G.times.pop()}else{G.ch.undo();G.times.pop()}
  const hh=G.ch.history({verbose:true});G.last=hh[hh.length-1]||null;G.busy=false;G.undos++;board.setArrows([]);$("#pFeed",root).hidden=true;
  A64.Sound.move();say("Variante podada. Probá otra idea.");save();nextTurn();
}

/* ---------- el agente juega ---------- */
function params(L){return{depth:L<=3?1:L<=6?3:L<=10?5:L<=15?8:L<=20?11:L<=25?14:18,movetime:Math.min(1600,150+L*45),win:Math.max(0,320-L*13),blunder:Math.max(0,.3-L*.022),style:L>=26?.3:1}}
function styleBonus(style,fen,mv,ply){
  const c=new Chess(fen),m=c.move({from:mv.slice(0,2),to:mv.slice(2,4),promotion:mv[4]||"q"});if(!m)return 0;
  const PV=A64.PV,opp=m.color==="w"?"b":"w",ek=kingSq(c,opp),dist=ek?Math.max(Math.abs("abcdefgh".indexOf(ek[0])-"abcdefgh".indexOf(m.to[0])),Math.abs(+ek[1]-+m.to[1])):8;
  let b=0;
  if(style==="agresivo"||style==="tramposo"){const k=style==="tramposo"?.5:1;if(m.san.includes("+"))b+=45*k;if(m.captured)b+=25*k;if(dist<=2)b+=20*k}
  if(style==="posicional"){if(!m.captured&&!m.san.includes("+"))b+=15;if(ply<14&&"nb".includes(m.piece)&&(m.from[1]==="1"||m.from[1]==="8"))b+=25;if(m.piece==="p"&&"cdef".includes(m.to[0])&&ply<16)b+=18;if(m.piece==="q"&&ply<12)b-=30}
  if(style==="defensivo"){if(m.captured&&PV[m.captured]>=PV[m.piece]-40)b+=35;if(m.captured==="q"&&m.piece==="q")b+=60;const back=m.color==="w"?(+m.to[1]<+m.from[1]):(+m.to[1]>+m.from[1]);if(back)b+=10}
  return b}
async function botTurn(){
  const gen=G.gen,fen=G.ch.fen(),L=G.level,P=params(L),style=A64.AGENTS[G.agent].style,t0=performance.now();
  G.busy=true;draw();say("<b>"+esc(A64.AGENTS[G.agent].name)+"</b> piensa…",true);
  let uci=null;
  /* trampas de apertura */
  if(style==="tramposo"&&L<=22){const h=G.ch.history();for(const line of A64.TRAP_BOOK){if(line.length>h.length&&line.slice(0,h.length).join()===h.join()&&Math.random()<.85){const m=new Chess(fen).move(line[h.length]);if(m){uci=m.from+m.to+(m.promotion||"");break}}}}
  if(!uci){
    const r=await A64.engine.analyse(fen,{depth:P.depth,movetime:P.movetime,multipv:5,prio:true,tag:"play"});
    if(gen!==G.gen||!r)return;
    const sg=G.ch.turn()==="w"?1:-1,lines=(r.lines.length?r.lines:[{cp:r.cp,pv:[r.best]}]).filter(l=>l.pv&&l.pv[0]);
    if(Math.random()<P.blunder){const ms=G.ch.moves({verbose:true});const m=ms[Math.floor(Math.random()*ms.length)];uci=m.from+m.to+(m.promotion||"")}
    else{const top=Math.max(...lines.map(l=>sg*l.cp));const ply=G.ch.history().length;let best=null,bs=-Infinity;
      for(const l of lines){const pov=sg*l.cp;if(pov<top-P.win&&l!==lines[0])continue;const s=pov+P.style*styleBonus(style,fen,l.pv[0],ply)+(P.win?(Math.random()-.5)*P.win*.8:0);if(s>bs){bs=s;best=l.pv[0]}}
      uci=best||r.best}
  }
  /* pausa humana */
  const think=G.clock?Math.min(Math.max(600,G.clock[G.ch.turn()]/40),2600):(G.mode==="entrena"?2200:1500);
  const wait=Math.max(0,think-(performance.now()-t0));await A64.sleep(A64.reduced?200:wait);
  if(gen!==G.gen||G.over||!uci)return;
  const m=G.ch.move({from:uci.slice(0,2),to:uci.slice(2,4),promotion:uci[4]||"q"});if(!m){G.busy=false;return}
  if(G.clock)G.clock[m.color]+=G.clock.inc;
  G.last=m;G.busy=false;sound(m);save();
  board.setArrows([]);draw({anim:m});
  if(G.mode!=="torneo"){let t=m.captured?"Me como "+A64.TU[m.captured]+" en "+m.to+".":(m.flags.includes("k")||m.flags.includes("q"))?"Enroco.":"Juego "+F(m)+".";if(m.san.includes("+"))t+=" Jaque.";say("<b>"+esc(A64.AGENTS[G.agent].name)+":</b> "+t)}
  if(G.ch.game_over()){finish();return}
  nextTurn();
}

/* ---------- final ---------- */
async function finish(reason,flagged){
  if(!G||G.over)return;G.over=true;clearInterval(tick);A64.engine.cancel("play");hideNexo();draw();
  const ch=G.ch;let res="1/2-1/2",txt="Tablas.";
  if(reason==="resign"){res=G.color==="w"?"0-1":"1-0";txt="Abandonaste."}
  else if(reason==="flag"){res=flagged==="w"?"0-1":"1-0";txt=flagged===G.color?"Se te terminó el tiempo.":"Al agente se le terminó el tiempo."}
  else if(ch.in_checkmate()){res=ch.turn()==="w"?"0-1":"1-0";txt="Jaque mate."}
  else if(ch.in_stalemate())txt="Ahogado: tablas.";else if(ch.insufficient_material())txt="Tablas por material insuficiente.";else if(ch.in_threefold_repetition())txt="Tablas por triple repetición.";
  const won=(res==="1-0")===(G.color==="w")&&res!=="1/2-1/2",lost=res!=="1/2-1/2"&&!won;
  if(won){A64.Sound.win();board.confetti()}else A64.Sound.move();
  const sans=ch.history(),times=sans.map(()=>null);let k=0;sans.forEach((s,i)=>{if((i%2===0?"w":"b")===G.color&&i>=G.opPly)times[i]=G.times[k++]??null});
  const AG=A64.AGENTS[G.agent];
  const rec=A64.buildRecord({id:"an-"+Date.now(),source:"analista",sans,color:G.color,white:G.color==="w"?(S.user||"Vos"):AG.name,black:G.color==="b"?(S.user||"Vos"):AG.name,result:res,times,date:Date.now(),agent:G.agent,level:G.level,mode:G.mode,clockLabel:G.clockKey});
  S.practice=null;if(rec)S.games.unshift(rec);
  if(cfg.agent==="rotar")S.agentIdx=(S.agentIdx+1)%4;
  A64.bump("game");A64.save();
  const oldL=S.level;
  const box=A64.modal('<div class="modal-b"><p class="lbl">'+esc(AG.name)+' · nivel '+G.level+'</p><h2>'+(won?"Ganaste":lost?"Perdiste":"Tablas")+'</h2><p>'+esc(txt)+'</p><div id="sumBody"><p class="mute">Analizando la partida…</p><div class="prog"><span id="sumProg" style="width:5%"></span></div></div><div class="row"><button class="btn main" id="sRev">Revancha</button><button class="btn" id="sRevisar">Revisar</button><button class="btn" id="sOther">Otro rival</button></div></div>');
  $("#sRev").onclick=()=>{A64.closeModal();start(null,{agent:G.agent,color:G.color,mode:G.mode,clock:G.clockKey,from:""})};
  $("#sRevisar").onclick=()=>{A64.closeModal();if(rec)A64.go("revisar",{game:rec.id})};
  $("#sOther").onclick=()=>{A64.closeModal();G=null;setup()};
  if(!rec)return;
  await A64.engine.ready;
  const ok=await A64.analyzeGame(rec,A64.engine,(i,n)=>{const p=$("#sumProg");if(p)p.style.width=(i/n*100)+"%"},()=>!!A64.gameById(rec.id));
  if(!ok)return;A64.buildExercises(rec);
  const acc=rec.color==="w"?rec.accW:rec.accB;
  /* nivel adaptativo */
  let d=0;if(won)d=acc>=85&&S.level<25?2:1;else if(lost)d=-1;
  S.level=Math.max(1,Math.min(30,S.level+d));S.maxLevel=Math.max(S.maxLevel||0,S.level);A64.save();A64.checkAch();
  const st=rec.stats,errs=[];for(let i=1;i<rec.fens.length;i++){const v=rec.verd[i];if((v==="mistake"||v==="blunder")&&rec.moves[i-1].color===rec.color)errs.push(i)}
  errs.sort((a,b)=>(A64.povWin(rec.ev[a-1],rec.color)-A64.povWin(rec.ev[a],rec.color))<(A64.povWin(rec.ev[b-1],rec.color)-A64.povWin(rec.ev[b],rec.color))?1:-1);
  const top=errs.slice(0,3);
  let good=st.best?"Jugaste "+st.best+" jugada"+(st.best>1?"s":"")+" que coinciden con el motor.":"";
  const keyTheme=Object.entries(st.themes).sort((a,b)=>b[1]-a[1])[0];
  const next=keyTheme?A64.TIP[keyTheme[0]]:(reason==="resign"&&st.moves<15?"Jugala hasta el final: abandonando temprano no hay nada para aprender.":"Seguí así: antes de cada jugada, jaques, capturas y amenazas.");
  const sb=$("#sumBody");if(!sb)return;
  sb.innerHTML='<div class="accs"><div><span class="lbl">Tu precisión</span><b>'+(acc!=null?Math.round(acc)+" %":"—")+'</b></div><div><span class="lbl">Errores</span><b>'+st.errs+(st.inacc?' <small class="mute" style="font-size:14px">+'+st.inacc+' imprec.</small>':"")+'</b></div></div>'
   +'<p>'+(lost?"Esta se perdió, pero hay cosas para rescatar. ":"")+esc(good)+'</p>'
   +(top.length?'<div class="list">'+top.map(i=>{const m=rec.moves[i-1];return'<button class="item" data-ply="'+i+'"><span class="tag '+A64.VERD[rec.verd[i]].c+'">'+A64.VERD[rec.verd[i]].mk+'</span><span style="min-width:0"><div class="t">'+Math.ceil(i/2)+'. '+F(m)+'</div><div class="s">'+esc(A64.THEME_NAME[rec.themes[i]]||"Error")+'</div></span><span>›</span></button>'}).join("")+'</div>':"")
   +'<p class="tip" style="border-left:3px solid var(--acc);padding:6px 10px;background:var(--acc-soft)"><b>Para la próxima:</b> '+esc(next)+'</p>'
   +(d?'<p><span class="pill acc">Nivel '+oldL+' → '+S.level+'</span> '+(d>0?"Subís: el próximo rival va a jugar mejor.":"Bajamos un escalón para que afiances.")+'</p>':"");
  $$("[data-ply]",sb).forEach(b=>b.onclick=()=>{A64.closeModal();A64.go("revisar",{game:rec.id,ply:+b.dataset.ply})});
}

A64.views.jugar={
  show(el,arg){root=el;if(arg&&arg.from){G=null;start(null,{from:arg.from})}else if(G&&!G.over){render();nextTurnSoft()}else setup()},
  leave(){if(G&&!G.over){save()}clearInterval(tick);A64.engine.cancel("play");if(G&&!G.over){G.gen++;G.busy=false}},
  refresh(){if(G&&!G.over){render();draw()}else if(!G)setup()},
  key(e){if(!G||G.over)return false;if(e.key==="f"||e.key==="F"){board.flip();return true}if((e.key==="h"||e.key==="H")&&G.mode!=="torneo"){hint();return true}return false},
  start:(o)=>{A64.go("jugar");G=null;start(null,o)}
};
function nextTurnSoft(){draw();if(!G.ch.game_over())nextTurn()}
})();
