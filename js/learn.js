/* Archivo 64 — Aprender: aperturas, estrategia, puzzles, coordenadas y finales. © 2026 Ignacio Dubois. Todos los derechos reservados. */
(function(){
"use strict";
const A64=window.A64,S=A64.S,$=A64.$,$$=A64.$$,esc=A64.esc,F=x=>A64.figSan(x.san,x.color);
let root=null,tab="aperturas",cleanup=null,keyH=null;
const TABS=[["aperturas","Aperturas"],["minijuegos","Minijuegos"],["estrategia","Estrategia"],["puzzles","Puzzles"],["coordenadas","Coordenadas"],["finales","Finales"]];
const sideName=c=>c==="w"?"blancas":"negras";
function stop(){if(cleanup){try{cleanup()}catch(e){}cleanup=null}keyH=null;A64.engine.cancel("learn");A64.mgStop&&A64.mgStop()}

/* ================= sesiones (plan del día y calentamiento) ================= */
A64.session=null;
A64.startSession=(tasks,title,onEnd)=>{A64.session={tasks,i:0,title,onEnd};A64.go("aprender",{runSession:true})};
function sessionBanner(){const s=A64.session;if(!s)return"";return'<div class="warm" style="padding:10px 14px"><div><p class="lbl">'+esc(s.title)+'</p><h3>Paso '+(s.i+1)+' de '+s.tasks.length+'</h3></div><div class="dots5">'+s.tasks.map((t,i)=>'<i class="'+(i<s.i?"on":"")+'"></i>').join("")+'</div><button class="btn sm ghost" id="sessStop">Salir</button></div>'}
function bindBanner(){const b=$("#sessStop",root);if(b)b.onclick=()=>{A64.session=null;show(root,{})}}
function runSession(){const s=A64.session;if(!s)return show(root,{});
  if(s.i>=s.tasks.length){const end=s.onEnd;A64.session=null;end&&end();return}
  const t=s.tasks[s.i];
  if(t.kind==="op")drill(A64.OPENINGS.find(o=>o.id===t.id),true);
  else if(t.kind==="pz")puzzles(t.n||5,t.easy);
  else if(t.kind==="cards")cards(t.n||4);
}
function sessionNext(){if(!A64.session)return false;A64.session.i++;runSession();return true}

/* ================= hub ================= */
function show(el,arg){
  root=el;stop();arg=arg||{};
  if(arg.runSession)return runSession();
  if(arg.tab)tab=arg.tab;
  if(arg.chapter)return chapter(A64.OPENINGS.find(o=>o.id===arg.chapter),arg.step||"idea");
  if(arg.drill)return drill(A64.OPENINGS.find(o=>o.id===arg.drill));
  if(arg.mg){tab="minijuegos";root.innerHTML='<div id="lBody" class="stack"></div>';return A64.mgPlay($("#lBody",root),arg.mg,!!arg.daily,()=>show(root,{tab:"minijuegos"}))}
  root.innerHTML='<div class="hello"><h1>Aprender</h1><p>Entender las aperturas, los principios y la táctica, y practicarlos hasta que salgan solos.</p></div>'
    +'<div class="tabs" role="tablist">'+TABS.map(([k,n])=>'<button role="tab" data-tab="'+k+'" aria-selected="'+(tab===k)+'">'+n+"</button>").join("")+'</div><div id="lBody" class="stack"></div>';
  $$("[data-tab]",root).forEach(b=>b.onclick=()=>{tab=b.dataset.tab;show(root,{})});
  const body=$("#lBody",root);
  ({aperturas:hubOpenings,minijuegos:b=>A64.mgHub(b,()=>show(root,{tab:"minijuegos"})),estrategia:hubCards,puzzles:hubPuzzles,coordenadas:hubCoords,finales:hubEnd})[tab](body);
}

/* ================= aperturas ================= */
function hubOpenings(body){
  const due=A64.OPENINGS.filter(o=>A64.srs.due("op:"+o.id)&&S.srs["op:"+o.id]);
  let h='<div class="warm"><div><h3>'+(due.length?due.length+" apertura"+(due.length>1?"s":"")+" para repasar hoy":"Repaso al día")+'</h3><p class="mute">Te pide tus jugadas y vuelve más seguido lo que fallás.</p></div><button class="btn main" id="bDue"'+(due.length?"":" disabled")+'>Repasar</button></div>';
  let grp="";
  for(const o of A64.OPENINGS){if(o.group!==grp){grp=o.group;h+='<p class="lbl group-h">'+esc(grp)+"</p>"}
    const lv=A64.srs.level("op:"+o.id),d=S.srs["op:"+o.id]&&A64.srs.due("op:"+o.id);
    h+='<button class="item op-item" data-op="'+o.id+'"><span class="avatar" style="width:34px;height:34px;font-size:15px">'+(o.side==="w"?"♔":"♚")+'</span><span style="min-width:0"><div class="t">'+esc(o.name)+'</div><div class="s">'+esc(o.idea)+'</div></span><span class="stack" style="gap:4px;justify-items:end"><span class="dots5">'+[1,2,3,4,5].map(i=>'<i class="'+(lv>=i?"on":"")+'"></i>').join("")+'</span>'+(d?'<span class="pill acc">Repasar</span>':"")+'</span></button>'}
  body.innerHTML=h+'<p class="mute" style="font-size:13px">Los cuadraditos muestran cuánto la tenés: se llenan cada vez que la practicás sin errores.</p>';
  $$("[data-op]",body).forEach(b=>b.onclick=()=>chapter(A64.OPENINGS.find(o=>o.id===b.dataset.op),"idea"));
  $("#bDue",body).onclick=()=>A64.startSession(due.slice(0,4).map(o=>({kind:"op",id:o.id})),"Repaso de aperturas",()=>{A64.toast("Listo","Repaso terminado.");show(root,{tab:"aperturas"})});
}
function chapter(op,step){
  stop();if(!op)return show(root,{});
  const n=op.moves.length;let idx=step==="jugadas"?0:n,trap=null,trapIdx=0;
  root.innerHTML='<div class="row"><button class="btn sm ghost" id="back">‹ Aperturas</button><span class="sp"></span><span class="pill">'+(op.side==="w"?"Con blancas":"Con negras")+'</span></div>'
   +'<div class="play"><div class="bcol"><div id="lBoard"></div><div class="navbtns" id="nav"><button class="btn" data-n="0" aria-label="Inicio">⏮</button><button class="btn" data-n="-1" aria-label="Anterior">◀</button><button class="btn" data-n="1" aria-label="Siguiente">▶</button><button class="btn" data-n="9" aria-label="Final">⏭</button></div></div>'
   +'<div class="side"><div><p class="lbl">'+esc(op.en)+'</p><h2 style="font-size:24px">'+esc(op.name)+'</h2></div>'
   +'<div class="steps" id="steps">'+[["idea","Idea"],["jugadas","Jugada por jugada"],["planes","Planes"],["trampas","Trampas"],["practica","Práctica"]].map(([k,t])=>'<button data-step="'+k+'">'+t+"</button>").join("")+'</div>'
   +'<div id="cBody" class="stack"></div>'
   +'<div class="card" id="cExp" hidden></div>'
   +'<div class="row"><button class="btn" id="bPlayFrom">Jugar desde acá contra el analista</button></div></div></div>';
  const bd=A64.makeBoard($("#lBoard",root),{orientation:op.side});
  $("#back",root).onclick=()=>show(root,{tab:"aperturas"});
  $("#bPlayFrom",root).onclick=()=>A64.go("jugar",{from:op.id});
  const line=op.moves.map(m=>m[0]);
  const posAt=(mv,k)=>{const c=new Chess();let last=null;for(let i=0;i<k;i++)last=c.move(mv[i]);return{c,last}};
  function setStep(s){step=s;$$("#steps button",root).forEach(b=>b.setAttribute("aria-current",b.dataset.step===s?"step":"false"));
    $("#nav",root).hidden=!(s==="jugadas"||s==="trampas");
    if(s==="idea"){idx=n;paint();$("#cBody",root).innerHTML='<div class="why"><p>'+esc(op.idea)+'</p></div><p class="mute" style="font-size:13.5px">El tablero muestra la posición a la que querés llegar.</p><button class="btn main" id="go1">Empezar jugada por jugada</button>';$("#go1",root).onclick=()=>{idx=0;setStep("jugadas")}}
    if(s==="jugadas"){paint()}
    if(s==="planes"){idx=n;paint();$("#cBody",root).innerHTML='<div class="why"><p class="lbl">Cómo sigue la partida</p><ul style="margin:0;padding-left:18px;display:grid;gap:6px">'+op.plans.map(p=>"<li>"+esc(p)+"</li>").join("")+"</ul></div>"}
    if(s==="trampas"){if(!op.traps.length){idx=n;paint();$("#cBody",root).innerHTML='<div class="why"><p>Esta apertura no tiene una trampa famosa para tu nivel. Lo importante es el plan: repasalo en <b>Planes</b>.</p></div>';return}
      trap=op.traps[0];trapIdx=trap.moves.length;paint()}
    if(s==="practica"){drill(op)}
  }
  function paint(){
    const exp=$("#cExp",root);exp.hidden=true;
    if(step==="trampas"&&trap){const {c,last}=posAt(trap.moves,trapIdx);bd.last=last;bd.setArrows([]);bd.position(c.fen());
      $("#cBody",root).innerHTML='<div class="why"><p class="lbl">'+esc(trap.title)+'</p><div class="row" style="gap:3px">'+trap.moves.map((m,i)=>'<button class="btn sm '+(i<trapIdx?"":"ghost")+'" data-t="'+(i+1)+'" style="min-height:28px;padding:2px 7px">'+F(posAt(trap.moves,i+1).last)+"</button>").join("")+'</div><p>'+esc(trap.text)+"</p></div>";
      $$("[data-t]",root).forEach(b=>b.onclick=()=>{trapIdx=+b.dataset.t;paint()});return}
    const {c,last}=posAt(line,idx);bd.last=last;bd.position(c.fen(),last);
    if(step==="jugadas"){
      bd.setArrows(idx<n?[{from:posAt(line,idx+1).last.from,to:posAt(line,idx+1).last.to,color:"green",opacity:.55}]:[]);
      const mine=idx>0&&(last.color===op.side);
      $("#cBody",root).innerHTML='<div class="why">'+(idx===0?'<p class="lbl">Posición inicial</p><p>Tocá ▶ para ver la primera jugada y por qué se juega. La flecha verde marca la jugada que viene.</p>':'<span class="side">Jugada '+Math.ceil(idx/2)+' · '+(mine?"vos":"el rival")+' ('+sideName(last.color)+')</span><span class="mvh">'+F(last)+'</span><p>'+esc(op.moves[idx-1][1])+"</p>")+'</div>'
        +'<div class="row" style="gap:3px">'+line.map((m,i)=>'<button class="btn sm '+(i<idx?"":"ghost")+'" data-k="'+(i+1)+'" style="min-height:28px;padding:2px 7px">'+(i%2===0?((i/2+1)+". "):"")+F(posAt(line,i+1).last)+"</button>").join("")+'</div>'
        +(idx===n?'<button class="btn main" id="toPlan">Ver los planes</button>':"");
      if(idx===n){S.opSeen=S.opSeen||[];if(!S.opSeen.includes(op.id)){S.opSeen.push(op.id);A64.save();A64.checkAch()}}
      $$("[data-k]",root).forEach(b=>b.onclick=()=>{idx=+b.dataset.k;paint()});if($("#toPlan",root))$("#toPlan",root).onclick=()=>setStep("planes");
      explorer(c.fen());
    }else bd.setArrows([]);
  }
  async function explorer(fen){const exp=$("#cExp",root);const d=await A64.lichess.explorer(fen);if(!d||!d.moves||!d.moves.length||step!=="jugadas"||!exp.isConnected)return;
    const tot=d.moves.reduce((s,m)=>s+m.white+m.draws+m.black,0);exp.hidden=false;
    exp.innerHTML='<div class="card-h"><h2 style="font-size:15px">Qué se juega acá en tu nivel</h2><span class="mute" style="font-size:12px">Lichess · 1000–1600</span></div><div class="explorer">'+d.moves.slice(0,5).map(m=>{const t=m.white+m.draws+m.black;return'<div class="ex-row"><b>'+F({san:m.san,color:fen.split(" ")[1]})+'</b><span class="mute">'+Math.round(t/tot*100)+' %</span><span class="wdl" title="Blancas ganan / tablas / negras ganan"><i style="width:'+(m.white/t*100)+'%"></i><i style="width:'+(m.draws/t*100)+'%"></i><i style="width:'+(m.black/t*100)+'%"></i></span></div>'}).join("")+'</div><p class="mute" style="font-size:12px">Barra: blancas ganan · tablas · negras ganan.</p>'}
  $$("#steps button",root).forEach(b=>b.onclick=()=>setStep(b.dataset.step));
  $$("#nav button",root).forEach(b=>b.onclick=()=>{const v=+b.dataset.n;if(step==="trampas"&&trap){trapIdx=v===0?0:v===9?trap.moves.length:Math.max(0,Math.min(trap.moves.length,trapIdx+v))}else{idx=v===0?0:v===9?n:Math.max(0,Math.min(n,idx+v))}paint()});
  keyH=e=>{if(step!=="jugadas"&&step!=="trampas")return false;const m={ArrowLeft:-1,ArrowRight:1,ArrowUp:0,ArrowDown:9}[e.key];if(m===undefined){if(e.key==="f"||e.key==="F"){bd.flip();return true}return false}const b=$('#nav [data-n="'+m+'"]',root);b&&b.click();return true};
  setStep(step);
}
/* ---- práctica con repetición espaciada ---- */
function drill(op,inSession){
  stop();if(!op)return show(root,{});
  const line=op.moves.map(m=>m[0]);let ch=new Chess(),k=0,errors=0,tries=0,done=false;
  root.innerHTML=(inSession?sessionBanner():'<div class="row"><button class="btn sm ghost" id="back">‹ '+esc(op.name)+'</button></div>')
   +'<div class="play"><div class="bcol"><div id="dBoard"></div></div><div class="side"><div><p class="lbl">Práctica · '+(op.side==="w"?"con blancas":"con negras")+'</p><h2 style="font-size:24px">'+esc(op.name)+'</h2></div>'
   +'<div class="coach"><span class="avatar acc"><span>AF</span></span><div><div class="who"><b>Analista Ferreyra</b></div><div class="say" id="dSay">Jugá tus jugadas de memoria. Las del rival las juego yo.</div></div></div>'
   +'<div class="prog"><span id="dProg" style="width:0"></span></div><div class="why" id="dWhy" hidden></div><div class="row" id="dEnd" hidden></div></div></div>';
  bindBanner();if($("#back",root))$("#back",root).onclick=()=>chapter(op,"idea");
  const bd=A64.makeBoard($("#dBoard",root),{orientation:op.side,interactive:()=>!done&&ch.turn()===op.side,canPick:sq=>{const p=ch.get(sq);return p&&p.color===op.side},legal:sq=>ch.moves({square:sq,verbose:true}),onMove:mv=>user(mv)});
  const say=h=>{$("#dSay",root).innerHTML=h};
  function paint(last,anim){bd.last=last;bd.check=null;bd.position(ch.fen(),anim);$("#dProg",root).style.width=(k/line.length*100)+"%"}
  async function auto(){while(k<line.length&&ch.turn()!==op.side){await A64.sleep(A64.reduced?150:650);if(!root.contains(bd.el))return;const m=ch.move(line[k]);k++;A64.Sound.move();paint(m,m);
      const w=$("#dWhy",root);w.hidden=false;w.innerHTML='<span class="side">El rival juega</span><span class="mvh">'+F(m)+'</span><p>'+esc(op.moves[k-1][1])+"</p>"}
    if(k>=line.length)return end();say("Te toca. ¿Cuál es tu jugada?")}
  function user(mv){
    const want=new Chess(ch.fen()).move(line[k]);
    if(want&&mv.from===want.from&&mv.to===want.to){const m=ch.move(line[k]);k++;tries=0;A64.Sound.move();paint(m,mv.dragged?null:m);bd.setArrows([]);
      const w=$("#dWhy",root);w.hidden=false;w.innerHTML='<span class="side">Bien · tu jugada</span><span class="mvh">'+F(m)+'</span><p>'+esc(op.moves[k-1][1])+"</p>";say("<em>Correcto.</em>");
      if(k>=line.length)return end();auto();return}
    errors++;tries++;A64.Sound.error();bd.flash(mv.to,"bad");
    if(tries>=2){bd.setArrows([{from:want.from,to:want.to,color:"green"}]);say('<span class="bad">No es esa.</span> La jugada es '+F(want)+' (flecha verde). '+esc(op.moves[k][1]))}
    else say('<span class="bad">No es esa.</span> Probá otra vez. Pista: mové '+A64.ART[want.piece]+".")}
  function end(){done=true;const ok=errors===0;const it=A64.srs.grade("op:"+op.id,ok);if(ok)A64.count("opPerfect");A64.bump("op");if(ok)A64.Sound.ok();setTimeout(()=>A64.flushAch(),900);
    say(ok?"<em>Perfecta.</em> La línea entera sin errores. Vuelve en "+[0,1,2,4,8,16,32][it.box]+" día"+(it.box>1?"s":"")+".":"Terminada con "+errors+" error"+(errors>1?"es":"")+". La repasamos mañana de nuevo.");
    const e=$("#dEnd",root);e.hidden=false;
    e.innerHTML=inSession?'<button class="btn main" id="dNext">Seguir</button>':'<button class="btn main" id="dAgain">Repetir</button><button class="btn" id="dPlay">Jugar desde acá</button><button class="btn ghost" id="dBack">Volver</button>';
    if(inSession)$("#dNext",root).onclick=()=>sessionNext();
    else{$("#dAgain",root).onclick=()=>drill(op);$("#dPlay",root).onclick=()=>A64.go("jugar",{from:op.id});$("#dBack",root).onclick=()=>chapter(op,"idea")}}
  paint(null);auto();
  keyH=e=>{if(e.key==="f"||e.key==="F"){bd.flip();return true}return false};
}

/* ================= estrategia (tarjetas) ================= */
function hubCards(body){
  const due=A64.CARDS.filter(c=>S.srs["card:"+c.id]&&A64.srs.due("card:"+c.id)).length,nw=A64.CARDS.filter(c=>!S.srs["card:"+c.id]).length;
  let h='<div class="warm"><div><h3>'+(due?due+" para repasar":"Nada pendiente")+(nw?" · "+nw+" nuevas":"")+'</h3><p class="mute">Cada tarjeta: una posición, una pregunta, y al dorso la regla con su porqué. Las que no te acordás vuelven antes.</p></div><button class="btn main" id="bCards">Empezar</button></div>';
  let ph="";for(const c of A64.CARDS){if(c.phase!==ph){ph=c.phase;h+='<p class="lbl group-h">'+esc(ph)+"</p>"}const lv=A64.srs.level("card:"+c.id);h+='<div class="item" style="cursor:default"><span class="dots5">'+[1,2,3].map(i=>'<i class="'+(lv>=i?"on":"")+'"></i>').join("")+'</span><span style="min-width:0"><div class="t">'+esc(c.rule)+'</div><div class="s">'+esc(c.q)+"</div></span><span></span></div>"}
  body.innerHTML=h;$("#bCards",body).onclick=()=>cards(6);
}
function cardFen(c){if(c.fen)return{fen:c.fen,last:null};const ch=new Chess();let last=null;c.moves.forEach(m=>last=ch.move(m));return{fen:ch.fen(),last}}
function cards(n,inSessionFlag){
  stop();const inSession=!!A64.session;
  const due=A64.CARDS.filter(c=>S.srs["card:"+c.id]&&A64.srs.due("card:"+c.id)),fresh=A64.CARDS.filter(c=>!S.srs["card:"+c.id]);
  const deck=[...due,...fresh].slice(0,n);if(!deck.length)deck.push(...A64.CARDS.slice().sort(()=>Math.random()-.5).slice(0,n));
  let i=0,good=0;
  root.innerHTML=(inSession?sessionBanner():'<div class="row"><button class="btn sm ghost" id="back">‹ Estrategia</button></div>')+'<div class="play"><div class="bcol"><div id="kBoard"></div></div><div class="side" id="kSide"></div></div>';
  bindBanner();if($("#back",root))$("#back",root).onclick=()=>show(root,{tab:"estrategia"});
  const bd=A64.makeBoard($("#kBoard",root),{});
  function paint(){const c=deck[i],{fen,last}=cardFen(c);bd.setOrientation(fen.split(" ")[1]==="b"&&!c.moves?"b":"w");bd.last=last;bd.setArrows([]);bd.position(fen);
    $("#kSide",root).innerHTML='<div class="row"><span class="lbl">'+esc(c.phase)+'</span><span class="sp"></span><span class="mute">'+(i+1)+" / "+deck.length+'</span></div><div class="flash"><p style="font-size:17px;font-weight:600;color:var(--strong)">'+esc(c.q)+'</p><button class="btn main" id="kShow">Ver respuesta</button><div id="kAns" hidden><p class="rule">'+esc(c.rule)+'</p><p>'+esc(c.why)+'</p></div></div><div class="row" id="kGrade" hidden><button class="btn" id="kNo">No me acordaba</button><button class="btn main" id="kYes">Me acordaba</button></div>';
    $("#kShow",root).onclick=()=>{$("#kAns",root).hidden=false;$("#kGrade",root).hidden=false;$("#kShow",root).hidden=true};
    $("#kNo",root).onclick=()=>grade(false);$("#kYes",root).onclick=()=>grade(true)}
  function grade(ok){A64.srs.grade("card:"+deck[i].id,ok);if(ok){good++;A64.count("cardOk")}i++;A64.bump("cards");if(i<deck.length)return paint();
    setTimeout(()=>A64.flushAch(),600);$("#kSide",root).innerHTML='<div class="flash"><p class="rule">Listo: '+good+" de "+deck.length+'</p><p>Las que no te acordaste vuelven mañana.</p>'+(inSession?'<button class="btn main" id="kNext">Seguir</button>':'<button class="btn main" id="kBack">Volver</button>')+"</div>";
    if(inSession)$("#kNext",root).onclick=()=>sessionNext();else $("#kBack",root).onclick=()=>show(root,{tab:"estrategia"})}
  paint();
}

/* ================= puzzles ================= */
function hubPuzzles(body){
  const own=Object.values(S.ex).filter(e=>A64.srs.due("ex:"+e.id)).length;
  const weak=weakTheme();
  body.innerHTML='<div class="warm"><div><h3>Sesión de 5 puzzles</h3><p class="mute">Primero tus propios errores ('+own+' pendientes), después los de la oficina'+(S.flags.noLiPuzzle?"":" y de Lichess sobre "+(A64.THEME_NAME[weak]||"táctica").toLowerCase())+'.</p></div><button class="btn main" id="bPz">Empezar</button></div>'
   +'<div class="stats"><div class="stat"><span class="lbl">Resueltos</span><div class="v">'+(S.pzSolved||0)+'</div></div><div class="stat"><span class="lbl">Racha</span><div class="v">'+(S.pzStreak||0)+'</div></div><div class="stat"><span class="lbl">Tus errores</span><div class="v">'+Object.keys(S.ex).length+' <small>guardados</small></div></div></div>';
  $("#bPz",body).onclick=()=>puzzles(5);
}
function weakTheme(){const t={};S.games.forEach(g=>{if(g.stats&&g.stats.themes)for(const k in g.stats.themes)t[k]=(t[k]||0)+g.stats.themes[k]});return Object.entries(t).filter(x=>x[0]!=="pos").sort((a,b)=>b[1]-a[1])[0]?.[0]||"fork"}
async function nextPuzzles(n,easy){
  const out=[];
  if(!easy)for(const e of Object.values(S.ex).filter(e=>A64.srs.due("ex:"+e.id)).slice(0,3))out.push({id:"ex:"+e.id,fen:e.fen,sol:[e.best],theme:A64.THEME_NAME[e.theme]||"Tu error",own:e,source:"own"});
  const bank=A64.PUZZLES.filter(p=>A64.srs.due("pz:"+p.id)).sort(()=>Math.random()-.5);
  for(const p of bank){if(out.length>=n)break;let fen=p.fen;if(!fen){const c=new Chess();p.moves.forEach(m=>c.move(m));fen=c.fen()}out.push({id:"pz:"+p.id,fen,sol:A64.PUZZLE_SOL[p.id],theme:p.theme,hint:p.hint,source:"bank"})}
  while(out.length<n&&!S.flags.noLiPuzzle){const p=await A64.lichess.puzzle(A64.THEME_ANGLE[weakTheme()]);if(!p)break;out.push(p)}
  if(out.length<n)for(const p of A64.PUZZLES.slice().sort(()=>Math.random()-.5)){if(out.length>=n)break;if(out.some(x=>x.id==="pz:"+p.id))continue;let fen=p.fen;if(!fen){const c=new Chess();p.moves.forEach(m=>c.move(m));fen=c.fen()}out.push({id:"pz:"+p.id,fen,sol:A64.PUZZLE_SOL[p.id],theme:p.theme,hint:p.hint,source:"bank"})}
  return out}
async function puzzles(n,easy){
  stop();const inSession=!!A64.session;
  root.innerHTML=(inSession?sessionBanner():'<div class="row"><button class="btn sm ghost" id="back">‹ Puzzles</button></div>')+'<div class="play"><div class="bcol"><div id="zBoard"></div></div><div class="side" id="zSide"><p class="mute">Preparando puzzles…</p></div></div>';
  bindBanner();if($("#back",root))$("#back",root).onclick=()=>show(root,{tab:"puzzles"});
  const list=await nextPuzzles(n,easy);let i=0,ok=0,ch,step,fails,cur,busy=false;
  const bd=A64.makeBoard($("#zBoard",root),{interactive:()=>!busy&&cur&&ch.turn()===cur.me,canPick:sq=>{const p=ch.get(sq);return p&&p.color===cur.me},legal:sq=>ch.moves({square:sq,verbose:true}),onMove:mv=>move(mv)});
  function load(){cur=list[i];if(!cur)return end();ch=new Chess(cur.fen);cur.me=ch.turn();step=0;fails=0;busy=false;bd.setOrientation(cur.me);bd.last=null;bd.setArrows([]);bd.position(ch.fen());
    $("#zSide",root).innerHTML='<div class="row"><span class="lbl">Puzzle '+(i+1)+" de "+list.length+'</span><span class="sp"></span><span class="pill">'+(cur.source==="own"?"Tu partida":cur.source==="lichess"?"Lichess"+(cur.rating?" · "+cur.rating:""):"Oficina")+'</span></div><div class="coach"><span class="avatar acc"><span>AF</span></span><div><div class="who"><b>Analista Ferreyra</b></div><div class="say" id="zSay">Juegan las <b>'+sideName(cur.me)+'</b>. Encontrá la mejor jugada.'+(cur.own?" Esta es una posición tuya: ahí jugaste "+esc(A64.figSan(cur.own.played,cur.own.color))+".":"")+'</div></div></div><div id="zInfo" class="why" hidden></div><div class="row"><button class="btn" id="zHint">Pista</button><button class="btn ghost" id="zSol">Ver solución</button><span class="sp"></span><button class="btn main" id="zNext" hidden>Siguiente</button></div>';
    $("#zHint",root).onclick=()=>{const u=cur.sol[step];if(!u)return;bd.hl=u.slice(0,2);bd.render();$("#zSay",root).innerHTML=cur.hint?esc(cur.hint):"Mirá la pieza marcada."};
    $("#zSol",root).onclick=()=>reveal(false);$("#zNext",root).onclick=()=>{i++;load()}}
  const say=h=>{const s=$("#zSay",root);if(s)s.innerHTML=h};
  async function move(mv){
    const want=cur.sol[step];const m=ch.move({from:mv.from,to:mv.to,promotion:"q"});if(!m)return;
    const exact=want&&want.slice(0,4)===mv.from+mv.to;let good=exact||ch.in_checkmate();
    if(!good&&cur.source==="own"&&step===0){busy=true;say("Lo verifico…");const fenB=new Chess(cur.fen);const [b,a]=await Promise.all([A64.engine.analyse(cur.fen,{depth:12,prio:true,tag:"learn"}),A64.engine.analyse(ch.fen(),{depth:12,prio:true,tag:"learn"})]);busy=false;
      if(b&&a){const v=A64.classify(b,a,m,b.best);good=v==="best"||v==="good"}}
    bd.last=m;bd.position(ch.fen(),mv.dragged?null:m);m.captured?A64.Sound.capture():A64.Sound.move();
    if(!good){fails++;A64.Sound.error();bd.flash(mv.to,"bad");await A64.sleep(450);ch.undo();bd.last=null;bd.position(ch.fen());say('<span class="bad">No es esa.</span> '+(fails>=2?"Tocá Pista o Ver solución.":"Probá otra vez."));return}
    step++;
    if(step>=cur.sol.length||ch.in_checkmate()){return solved(true)}
    busy=true;await A64.sleep(500);const r=cur.sol[step];const rm=ch.move({from:r.slice(0,2),to:r.slice(2,4),promotion:r[4]||"q"});step++;busy=false;
    if(rm){bd.last=rm;bd.position(ch.fen(),rm);A64.Sound.move()}
    if(step>=cur.sol.length)return solved(true);say("<em>Bien.</em> Seguí: ¿y ahora?")}
  function solved(win){
    busy=true;const first=fails===0;
    if(win){A64.Sound.ok();if(first){ok++;S.pzSolved=(S.pzSolved||0)+1;S.pzStreak=(S.pzStreak||0)+1;S.pzBest=Math.max(S.pzBest||0,S.pzStreak);if(cur.source==="own")A64.count("exOk")}else S.pzStreak=0}
    if(cur.source!=="lichess")A64.srs.grade(cur.id,win&&first);
    A64.bump("pz");info(win&&first?"Resuelto":win?"Resuelto con ayuda":"Solución");$("#zNext",root).hidden=false;$("#zHint",root).hidden=true;$("#zSol",root).hidden=true}
  function reveal(){fails=9;const c=new Chess(cur.fen),arrows=[];let last=null;for(const u of cur.sol){last=c.move({from:u.slice(0,2),to:u.slice(2,4),promotion:u[4]||"q"});if(!last)break;arrows.push({from:last.from,to:last.to,color:arrows.length%2?"blue":"green"})}
    bd.setArrows(arrows.slice(0,3));solved(false)}
  function info(title){const el=$("#zInfo",root);el.hidden=false;const first=A64.uciMove(cur.fen,cur.sol[0]);
    let t='<p class="lbl">'+esc(title)+" · "+esc(cur.theme||"Táctica")+'</p><span class="mvh">'+(first?F(first):"")+"</span>";
    if(cur.own)t+="<p>"+esc(cur.own.why||"")+"</p>"+(first?"<p>Lo correcto: "+esc(A64.describeMove(first))+"</p>":"");
    else if(first)t+="<p>"+esc(A64.describeMove(first))+"</p>";
    el.innerHTML=t;say(title==="Resuelto"?"<em>Muy bien.</em>":"Mirá la explicación y seguimos.")}
  function end(){A64.save();A64.checkAch();setTimeout(()=>A64.flushAch(),800);if(ok===list.length&&list.length>=3)bd.confetti();
    $("#zSide",root).innerHTML='<div class="flash"><p class="score-big">'+ok+" / "+list.length+'</p><p class="rule">'+(ok===list.length?"Perfecto.":ok>=list.length/2?"Bien. Los que fallaste vuelven pronto.":"Los que fallaste vuelven mañana. Así se entrena el ojo.")+'</p>'+(inSession?'<button class="btn main" id="zGo">Seguir</button>':'<div class="row"><button class="btn main" id="zMore">Otros 5</button><button class="btn" id="zBack">Volver</button></div>')+"</div>";
    if(inSession)$("#zGo",root).onclick=()=>sessionNext();else{$("#zMore",root).onclick=()=>puzzles(5);$("#zBack",root).onclick=()=>show(root,{tab:"puzzles"})}}
  load();keyH=e=>{if(e.key==="f"||e.key==="F"){bd.flip();return true}return false};
}

/* ================= coordenadas ================= */
function hubCoords(body){
  body.innerHTML='<div class="grid2"><div class="card stack coordgame"><div class="card-h"><h2>Encontrá la casilla</h2><div class="seg" id="cSide"><button data-v="w" aria-pressed="true">Blancas</button><button data-v="b" aria-pressed="false">Negras</button></div></div><p class="mute">Te digo una casilla y la tocás. Tenés 30 segundos. Así dejás de perderte con las posiciones.</p><div class="target" id="cTarget">—</div><div class="row"><span class="score-big num" id="cScore">0</span><span class="mute">aciertos</span><span class="sp"></span><span class="score-big num" id="cTime">30</span></div><button class="btn main wide" id="cStart">Empezar</button><p class="mute" style="font-size:13px">Récord: blancas '+(S.coordBest.w||0)+' · negras '+(S.coordBest.b||0)+'</p></div><div id="cBoardW"><div id="cBoard"></div></div></div>';
  let side="w",run=false,score=0,target=null,t0=0,iv=null;
  const bd=A64.makeBoard($("#cBoard",body),{noCoords:true,interactive:()=>run,onTap:sq=>tap(sq),canPick:()=>false});bd.position("8/8/8/8/8/8/8/8 w - - 0 1");
  $$("#cSide button",body).forEach(b=>b.onclick=()=>{if(run)return;side=b.dataset.v;$$("#cSide button",body).forEach(x=>x.setAttribute("aria-pressed",x===b));bd.setOrientation(side)});
  const pick=()=>{let s;do{s="abcdefgh"[Math.floor(Math.random()*8)]+(1+Math.floor(Math.random()*8))}while(s===target);target=s;$("#cTarget",body).textContent=s};
  function tap(sq){if(!run)return;if(sq===target){score++;$("#cScore",body).textContent=score;bd.flash(sq,"mk-good");A64.Sound.move();pick()}else{bd.flash(sq,"bad");A64.Sound.error()}}
  $("#cStart",body).onclick=()=>{score=0;run=true;$("#cScore",body).textContent=0;pick();t0=performance.now();$("#cStart",body).disabled=true;
    iv=setInterval(()=>{const left=30-(performance.now()-t0)/1000;$("#cTime",body).textContent=Math.max(0,Math.ceil(left));if(left<=0){clearInterval(iv);run=false;$("#cTarget",body).textContent="¡Tiempo!";$("#cStart",body).disabled=false;$("#cStart",body).textContent="Otra vez";
      A64.count("coordRuns");const best=S.coordBest[side]||0;if(score>best){S.coordBest[side]=score;A64.toast("Récord",score+" casillas con "+(side==="w"?"blancas":"negras")+".");bd.confetti()}A64.markDay();A64.save();A64.checkAch()}},100)};
  cleanup=()=>clearInterval(iv);
}

/* ================= finales ================= */
function hubEnd(body){
  body.innerHTML='<p class="mute">Los cuatro finales que todo jugador tiene que saber ganar. El analista defiende con todo.</p><div class="list">'+A64.ENDGAMES.map(e=>'<button class="item" data-end="'+e.id+'"><span class="avatar">'+((S.endWon||{})[e.id]?"✓":"♔")+'</span><span style="min-width:0"><div class="t">'+esc(e.name)+'</div><div class="s">'+esc(e.method[0])+'</div></span><span class="pill">'+(e.goal==="mate"?"Dar mate":"Coronar")+"</span></button>").join("")+"</div>";
  $$("[data-end]",body).forEach(b=>b.onclick=()=>endgame(A64.ENDGAMES.find(e=>e.id===b.dataset.end)));
}
function endgame(eg){
  stop();let ch=new Chess(eg.fen),busy=false,moves=0,over=false;
  root.innerHTML='<div class="row"><button class="btn sm ghost" id="back">‹ Finales</button></div><div class="play"><div class="bcol"><div id="eBoard"></div></div><div class="side"><div><p class="lbl">'+(eg.goal==="mate"?"Objetivo: dar mate":"Objetivo: coronar el peón")+'</p><h2 style="font-size:24px">'+esc(eg.name)+'</h2></div><div class="why"><p class="lbl">El método</p><ol style="margin:0;padding-left:18px;display:grid;gap:5px">'+eg.method.map(m=>"<li>"+esc(m)+"</li>").join("")+'</ol></div><div class="coach"><span class="avatar acc"><span>AF</span></span><div><div class="who"><b>Analista Ferreyra</b> · <span id="eCount">0 jugadas</span></div><div class="say" id="eSay">Jugás con blancas. Referencia: unas '+eg.par+' jugadas.</div></div></div><div class="row"><button class="btn" id="eHint">Pista</button><button class="btn" id="eReset">Empezar de nuevo</button></div></div></div>';
  $("#back",root).onclick=()=>show(root,{tab:"finales"});
  const bd=A64.makeBoard($("#eBoard",root),{orientation:"w",interactive:()=>!busy&&!over&&ch.turn()==="w",canPick:sq=>{const p=ch.get(sq);return p&&p.color==="w"},legal:sq=>ch.moves({square:sq,verbose:true}),onMove:mv=>user(mv)});
  const say=h=>$("#eSay",root).innerHTML=h;
  bd.position(ch.fen());
  async function user(mv){const m=ch.move({from:mv.from,to:mv.to,promotion:"q"});if(!m)return;moves++;$("#eCount",root).textContent=moves+" jugada"+(moves>1?"s":"");bd.last=m;bd.setArrows([]);bd.check=null;bd.position(ch.fen(),mv.dragged?null:m);A64.Sound.move();
    if(check())return;busy=true;say("Defiendo…");const r=await A64.engine.analyse(ch.fen(),{depth:12,movetime:600,prio:true,tag:"learn"});await A64.sleep(400);if(!r||!r.best||!root.contains(bd.el)){busy=false;return}
    const b=ch.move({from:r.best.slice(0,2),to:r.best.slice(2,4),promotion:r.best[4]||"q"});busy=false;bd.last=b;bd.position(ch.fen(),b);A64.Sound.move();check()||say("Te toca.")}
  function check(){
    if(ch.in_checkmate()){win("Jaque mate en "+moves+" jugadas.");return true}
    if(eg.goal==="queen"&&/Q/.test(ch.fen().split(" ")[0])&&ch.history({verbose:true}).some(m=>m.promotion)){win("Coronaste en "+moves+" jugadas.");return true}
    if(ch.in_stalemate()){over=true;A64.Sound.error();say('<span class="bad">Ahogado: tablas.</span> El rey negro no tenía jugadas y no estaba en jaque. Dejale siempre una casilla.');return true}
    if(ch.game_over()||(eg.goal==="queen"&&!/P/.test(ch.fen().split(" ")[0]))){over=true;say('<span class="bad">Se escapó.</span> Probá de nuevo con el método.');return true}
    return false}
  function win(t){over=true;S.endWon=S.endWon||{};S.endWon[eg.id]=true;if(moves<=eg.par)A64.count("endPar");setTimeout(()=>A64.flushAch(),1200);A64.Sound.win();bd.confetti();say("<em>"+esc(t)+"</em> "+(moves<=eg.par?"Mejor que la referencia.":"Funciona; con práctica sale en menos."));A64.markDay();A64.save();A64.checkAch()}
  $("#eHint",root).onclick=async()=>{if(busy||over)return;const r=await A64.engine.analyse(ch.fen(),{depth:14,prio:true,tag:"learn"});if(!r||!r.best)return;const m=A64.uciMove(ch.fen(),r.best);bd.setArrows([{from:m.from,to:m.to,color:"green"}]);say("Pista: "+F(m)+".")};
  $("#eReset",root).onclick=()=>endgame(eg);
}

A64.views.aprender={show,leave:stop,key:e=>keyH?keyH(e):false,refresh(){if(!A64.session&&!keyH&&!cleanup)show(root,{})}};
})();
