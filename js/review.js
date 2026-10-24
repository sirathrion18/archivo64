/* Archivo 64 — Revisar partidas e informe de torneo. © 2026 Ignacio Dubois. Todos los derechos reservados. */
(function(){
"use strict";
const A64=window.A64,S=A64.S,$=A64.$,$$=A64.$$,esc=A64.esc,F=x=>A64.figSan(x.san,x.color);
let root=null,R=null,bd=null,keyH=null,filter="todas";
const SPEED={bullet:"Bullet",blitz:"Blitz",rapid:"Rápida",classical:"Clásica"};

function show(el,arg){root=el;arg=arg||{};keyH=null;
  if(arg.tour)return tour(arg.tour);
  if(arg.game)return open(arg.game,arg.ply);
  list();
}
/* ================= lista ================= */
function list(){
  R=null;keyH=null;
  const tours=tourList();
  const gs=S.games.filter(g=>filter==="todas"||(filter==="lichess"?g.source==="lichess":filter==="analista"?g.source==="analista":g.speed===filter));
  root.innerHTML='<div class="hello"><h1>Revisar</h1><p>Tus partidas de Lichess y las que jugás acá. El analista las revisa y te lleva a los momentos que importan.</p></div>'
   +(tours.length?'<div class="stack"><p class="lbl">Torneos</p>'+tours.slice(0,3).map(t=>'<button class="item" data-tour="'+t.id+'"><span class="avatar acc">🏆</span><span style="min-width:0"><div class="t">'+esc(t.name)+'</div><div class="s">'+t.games.length+' partida'+(t.games.length>1?'s':'')+' · '+t.pts+' punto'+(t.pts===1?'':'s')+' · '+A64.ago(t.date)+'</div></span><span>Informe ›</span></button>').join("")+'</div>':"")
   +'<div class="row"><div class="chips">'+[["todas","Todas"],["lichess","Lichess"],["analista","Contra el analista"],["blitz","Blitz"],["rapid","Rápidas"],["bullet","Bullet"]].map(([k,n])=>'<button class="chip" data-f="'+k+'" aria-pressed="'+(filter===k)+'">'+n+"</button>").join("")+'</div><span class="sp"></span><button class="btn sm" id="bSync">Traer de Lichess</button></div>'
   +'<p class="mute" id="syncMsg" style="font-size:13.5px">'+esc(A64.syncMsg||"")+'</p>'
   +'<div class="list" id="gList">'+(gs.length?gs.slice(0,60).map(row).join(""):'<p class="mute">No hay partidas acá todavía. Tocá <b>Traer de Lichess</b> o jugá contra el analista.</p>')+'</div>'
   +'<details class="card more"><summary>Pegar una partida (PGN)</summary><div class="stack" style="margin-top:10px"><textarea id="pgnIn" rows="4" placeholder="Pegá acá el PGN"></textarea><div class="row"><select id="pgnSide"><option value="">Detectar por usuario</option><option value="w">Jugué con blancas</option><option value="b">Jugué con negras</option></select><button class="btn main" id="bPgn">Agregar</button></div><p class="mute" id="pgnErr"></p></div></details>';
  $$("[data-f]",root).forEach(b=>b.onclick=()=>{filter=b.dataset.f;list()});
  $$("[data-g]",root).forEach(b=>b.onclick=()=>open(b.dataset.g));
  $$("[data-tour]",root).forEach(b=>b.onclick=()=>tour(b.dataset.tour));
  $("#bSync",root).onclick=()=>{$("#bSync",root).disabled=true;A64.lichess.sync(m=>{A64.syncMsg=m;const e=$("#syncMsg",root);if(e)e.textContent=m}).then(()=>{if(A64.view==="revisar"&&!R)list()})};
  $("#bPgn",root).onclick=addPgn;
}
function row(g){const r=A64.myResult(g),acc=g.color&&g.done?(g.color==="w"?g.accW:g.accB):null;
  const st=g.done&&g.stats?(g.stats.errs?g.stats.errs+" error"+(g.stats.errs>1?"es":""):"sin errores"):(A64.bgState().cur===g.id?"analizando…":"en cola");
  return'<button class="item" data-g="'+g.id+'"><span class="r res-'+(r||"d")+'">'+(r==="w"?"G":r==="l"?"P":r==="d"?"½":"·")+'</span><span style="min-width:0"><div class="t">'+esc(A64.opp(g))+(g.source==="analista"&&g.level?' <small class="mute">nivel '+g.level+"</small>":"")+'</div><div class="s">'+(g.source==="lichess"?"Lichess"+(g.speed?" · "+SPEED[g.speed]:""):g.source==="analista"?"Analista":"PGN")+" · "+A64.ago(g.date)+(g.opening?" · "+esc(g.opening):"")+'</div></span><span class="s" style="text-align:right">'+(acc!=null?'<b style="color:var(--strong)">'+Math.round(acc)+" %</b><br>":"")+st+"</span></button>"}
function addPgn(){const t=$("#pgnIn",root).value.trim(),err=$("#pgnErr",root);if(!t){err.textContent="Pegá primero el PGN.";return}
  const ch=new Chess();const clean=t.replace(/\{[^}]*\}/g," ");if(!ch.load_pgn(clean,{sloppy:true})||!ch.history().length){err.textContent="No pude leer esa partida. Copiá el PGN completo, con los corchetes y todas las jugadas.";return}
  const hd=ch.header(),u=(S.user||"").toLowerCase();let color=$("#pgnSide",root).value||null;if(!color&&u){if((hd.White||"").toLowerCase()===u)color="w";else if((hd.Black||"").toLowerCase()===u)color="b"}
  const site=(hd.Site||"").match(/lichess\.org\/(\w{8})/),id=site?"li-"+site[1]:"pgn-"+Date.now();if(A64.gameById(id))return open(id);
  const rec=A64.buildRecord({id,source:site?"lichess":"pgn",sans:ch.history(),color,white:hd.White,black:hd.Black,result:hd.Result||"*",opening:hd.Opening?A64.openingES(hd.Opening):null,date:Date.now()});
  if(!rec){err.textContent="Hay una jugada que no pude reproducir.";return}S.games.unshift(rec);A64.save();A64.bgAnalyze();open(id)}

/* ================= partida ================= */
function open(id,ply){
  const g=A64.gameById(id);if(!g||!g.fens)return list();
  R={g,idx:ply!=null?ply:(g.key||0),learn:null,flip:g.color==="b"};
  if(!g.done){prioritize(g)}
  render();
}
function prioritize(g){const i=S.games.indexOf(g);if(i>0){S.games.splice(i,1);S.games.unshift(g)}A64.bgAnalyze()}
function render(){
  const g=R.g,me=g.color;
  root.innerHTML='<div class="row"><button class="btn sm ghost" id="back">‹ Partidas</button><span class="sp"></span>'+(g.source==="lichess"?'<a class="btn sm ghost" href="https://lichess.org/'+g.id.slice(3)+'" target="_blank" rel="noopener">Ver en Lichess ↗</a>':"")+'</div>'
   +'<div class="play"><div class="bcol"><div class="evalwrap"><span class="ev" id="evNum">…</span><div class="evalbar"><span id="evBar" style="width:50%"></span></div></div><div class="bstage" id="rStage"><div id="rBoard"></div></div>'
   +'<div class="navbtns"><button class="btn" data-n="first" aria-label="Inicio">⏮</button><button class="btn" data-n="prev" aria-label="Anterior">◀</button><button class="btn" data-n="next" aria-label="Siguiente">▶</button><button class="btn" data-n="last" aria-label="Final">⏭</button></div>'
   +'<div class="legend"><span><i style="background:#E04B3A"></i>lo que se jugó</span><span><i style="background:#3FA65A"></i>lo mejor</span><span><i style="background:#3B82C4"></i>la respuesta del rival</span></div></div>'
   +'<div class="side"><div class="player"><span class="avatar">'+esc((g.white||"B").slice(0,2).toUpperCase())+'</span><span class="pn"><b>'+esc(g.white)+(g.wr?' <small class="mute">'+g.wr+"</small>":"")+'</b><span>Blancas'+(me==="w"?" · vos":"")+'</span></span><b class="num" id="accW"></b></div>'
   +'<div class="player"><span class="avatar" style="background:#2a2826;color:#f4f1ea">'+esc((g.black||"N").slice(0,2).toUpperCase())+'</span><span class="pn"><b>'+esc(g.black)+(g.br?' <small class="mute">'+g.br+"</small>":"")+'</b><span>Negras'+(me==="b"?" · vos":"")+'</span></span><b class="num" id="accB"></b></div>'
   +'<svg class="graph" id="graph" viewBox="0 0 300 70" preserveAspectRatio="none" aria-label="Gráfico de evaluación"></svg>'
   +'<div class="row" id="rBtns"></div>'
   +'<div class="coach" id="rCoach"><span class="avatar acc"><span>AF</span></span><div><div class="who"><b>Analista Ferreyra</b> · <span id="rWho"></span></div><div class="say expl" id="rSay"></div></div></div>'
   +'<div class="moves" id="rMoves" style="max-height:300px"></div>'
   +'<div class="card" id="rTimes" hidden></div>'
   +'</div></div>';
  $("#back",root).onclick=()=>list();
  bd=A64.makeBoard($("#rBoard",root),{orientation:R.flip?"b":"w",
    interactive:()=>!!R.learn&&!R.learn.solved,canPick:sq=>{if(!R.learn)return false;const p=R.learn.ch.get(sq);return p&&p.color===R.learn.ch.turn()},
    legal:sq=>R.learn?R.learn.ch.moves({square:sq,verbose:true}):[],onMove:mv=>learnMove(mv)});
  $$("[data-n]",root).forEach(b=>b.onclick=()=>nav(b.dataset.n));
  $("#graph",root).addEventListener("click",e=>{const r=e.currentTarget.getBoundingClientRect();const n=R.g.fens.length-1;R.learn=null;R.idx=Math.round((e.clientX-r.left)/r.width*n);paint()});
  $("#rMoves",root).addEventListener("click",e=>{const b=e.target.closest("[data-i]");if(b){R.learn=null;R.idx=+b.dataset.i;paint()}});
  keyH=e=>{const k={ArrowLeft:"prev",ArrowRight:"next",ArrowUp:"first",ArrowDown:"last"}[e.key];if(k){nav(k);return true}if(e.key==="f"||e.key==="F"){bd.flip();return true}return false};
  A64.onBg=(gg,i,n)=>{if(R&&gg===R.g){const s=$("#rWho",root);if(s)s.textContent="analizando "+Math.round(i/n*100)+" %"}};
  A64.onBgDone=gg=>{if(R&&gg===R.g&&!R.learn){paint()}};
  paint();
}
function nav(k){const n=R.g.fens.length-1;R.learn=null;R.idx=k==="first"?0:k==="last"?n:k==="prev"?Math.max(0,R.idx-1):Math.min(n,R.idx+1);paint()}
function paint(){
  const g=R.g,i=R.idx,ev=g.ev&&g.ev[i],m=i?g.moves[i-1]:null;
  /* tablero */
  if(!R.learn){bd.last=m;bd.check=null;bd.position(g.fens[i],m);}
  /* evaluación */
  $("#evNum",root).textContent=g.done?A64.fmtEval(ev):"…";$("#evBar",root).style.width=(g.done&&ev?A64.winPct(ev):50)+"%";
  $("#accW",root).textContent=g.done&&g.accW!=null?Math.round(g.accW)+" %":"";$("#accB",root).textContent=g.done&&g.accB!=null?Math.round(g.accB)+" %":"";
  graph();moves();times();
  /* botones */
  const errs=myErrors(g);
  $("#rBtns",root).innerHTML=g.done?(errs.length?'<button class="btn main" id="bLearn">Aprendé de tus errores ('+errs.length+')</button>':"")+(g.key?'<button class="btn" id="bKey">Momento decisivo</button>':""):'<span class="mute">El analista está revisando la partida…</span>';
  if($("#bLearn",root))$("#bLearn",root).onclick=()=>startLearn(0);
  if($("#bKey",root))$("#bKey",root).onclick=()=>{R.learn=null;R.idx=g.key;paint()};
  /* explicación */
  const who=$("#rWho",root),sayEl=$("#rSay",root);
  if(R.learn)return;
  if(!g.done){who.textContent="analizando";sayEl.innerHTML="<p>Estoy revisando la partida jugada por jugada. Mientras tanto, podés recorrerla con las flechas.</p>";bd.setArrows([]);return}
  if(i===0){who.textContent="resumen";sayEl.innerHTML="<p>"+summary(g)+"</p>";bd.setArrows([]);return}
  const v=g.verd[i],V=A64.VERD[g.miss&&g.miss[i]&&(v!=="best"&&v!=="good")?"miss":v]||{t:"",c:""};
  const mine=!g.color||m.color===g.color;
  who.innerHTML="jugada "+Math.ceil(i/2)+" · "+(mine?"vos":"el rival")+' · <span class="tag '+V.c+'">'+V.t+"</span>";
  if(v==="mistake"||v==="blunder"||v==="inacc"||(g.miss&&g.miss[i])){
    const x=A64.explain({fenB:g.fens[i-1],move:m,evB:g.ev[i-1],evA:ev,verdict:v,me:m.color,miss:g.miss&&g.miss[i]&&v!=="best"&&v!=="good"&&mine});
    let t=x.paras.map(p=>"<p>"+esc(p)+"</p>").join("");if(!mine)t="<p><b>El rival se equivocó.</b></p>"+t.replace(/Jugaste/,"Jugó").replace(/Para la próxima:/,"Para aprovecharlo:");
    const tm=g.times&&g.times[i-1];if(mine&&tm!=null&&g.fastT&&tm<g.fastT&&(v==="mistake"||v==="blunder"))t+='<p class="tip">La jugaste en '+A64.fmtSec(tm)+'. Con jaques o capturas en el tablero, eso es poco tiempo.</p>';
    sayEl.innerHTML=t;bd.setArrows(x.arrows);
  }else{const br=A64.bestReason(g.fens[i-1],g.ev[i-1],m.color);sayEl.innerHTML="<p>"+esc(A64.describeMove(m))+" "+(v==="best"?"Es la que elige el motor.":"Sirve.")+"</p><p>"+esc(A64.evalWords(ev,g.color))+"</p>"+(v==="good"&&br&&br.move.san!==m.san?"<p class='mute'>También estaba "+esc(F(br.move))+".</p>":"");
    const nx=ev&&ev.best?A64.uciMove(g.fens[i],ev.best):null;bd.setArrows(nx?[{from:nx.from,to:nx.to,color:"green",opacity:.45}]:[])}
}
function summary(g){const st=g.stats,me=g.color,acc=me==="w"?g.accW:g.accB,r=A64.myResult(g);if(!st||!me)return"Partida analizada. Recorrela con las flechas.";
  const th=Object.entries(st.themes).sort((a,b)=>b[1]-a[1])[0];
  return (r==="w"?"Ganaste":r==="l"?"Perdiste":"Tablas")+(acc!=null?" con "+Math.round(acc)+" % de precisión":"")+". "+(st.errs?"Cometiste "+st.errs+" error"+(st.errs>1?"es":"")+(st.blunder?", "+st.blunder+" grave"+(st.blunder>1?"s":""):"")+".":"Sin errores: muy bien.")
    +(th?" Lo que más se repitió: "+A64.THEME_NAME[th[0]].toLowerCase()+".":"")+(st.miss?" Además dejaste pasar "+st.miss+" regalo"+(st.miss>1?"s":"")+" del rival.":"")+(g.key?" El momento decisivo fue la jugada "+Math.ceil(g.key/2)+": tocá «Momento decisivo».":"")}
function myErrors(g){const out=[];if(!g.verd)return out;for(let i=1;i<g.fens.length;i++){const m=g.moves[i-1];if(g.color&&m.color!==g.color)continue;const v=g.verd[i];if(v==="mistake"||v==="blunder"||(g.miss&&g.miss[i]&&v!=="good"&&v!=="best"))out.push(i)}return out}
function graph(){
  const g=R.g,svg=$("#graph",root),n=g.fens.length-1;if(!g.done||!g.ev){svg.innerHTML='<text x="150" y="38" text-anchor="middle" style="font-size:9px;fill:var(--mute)">El gráfico aparece cuando termina el análisis</text>';return}
  const x=i=>i/Math.max(1,n)*300,y=ev=>70-A64.winPct(ev)/100*70;
  let p="M0 70 ";for(let i=0;i<=n;i++)p+="L"+x(i).toFixed(1)+" "+y(g.ev[i]).toFixed(1)+" ";p+="L300 70 Z";
  let dots="";for(let i=1;i<=n;i++){const v=g.verd[i];if(v==="mistake"||v==="blunder"){dots+='<circle cx="'+x(i)+'" cy="'+y(g.ev[i])+'" r="2.4" fill="'+(v==="blunder"?"#E04B3A":"#e6823a")+'"/>'}}
  svg.innerHTML='<rect width="300" height="70" fill="#2a2826"/><path d="'+p+'" fill="#f1efe9"/><line x1="0" x2="300" y1="35" y2="35" stroke="#888" stroke-width=".4" stroke-dasharray="2 2"/>'+dots+'<line x1="'+x(R.idx)+'" x2="'+x(R.idx)+'" y1="0" y2="70" stroke="#FF6A00" stroke-width="1.4"/>';
}
function moves(){const g=R.g;let s="";for(let i=0;i<g.moves.length;i+=2){s+='<span class="n">'+(i/2+1)+"</span>";for(const k of [i,i+1]){if(k>=g.moves.length){s+="<span></span>";continue}const v=g.verd&&g.verd[k+1],mk=v&&A64.VERD[v].mk?'<span class="g '+A64.VERD[v].c+'">'+A64.VERD[v].mk+"</span>":"";s+='<button class="mv'+(R.idx===k+1?" on":"")+'" data-i="'+(k+1)+'"><span>'+F(g.moves[k])+"</span>"+mk+"</button>"}}
  const el=$("#rMoves",root);el.innerHTML=s;const on=$(".mv.on",el);if(on){const t=on.offsetTop-el.offsetTop;if(t<el.scrollTop||t>el.scrollTop+el.clientHeight-30)el.scrollTop=t-60}}
function times(){const g=R.g,el=$("#rTimes",root);if(!g.times||!g.done||!g.color||!g.times.some(t=>t!=null)){el.hidden=true;return}
  const mine=[];for(let i=1;i<g.fens.length;i++){if(g.moves[i-1].color!==g.color)continue;const t=g.times[i-1];if(t!=null)mine.push({i,t,v:g.verd[i]})}if(!mine.length){el.hidden=true;return}
  el.hidden=false;const W=300,H=60,max=Math.max(...mine.map(m=>m.t),1),bw=W/mine.length,avg=mine.reduce((s,m)=>s+m.t,0)/mine.length;
  const errs=mine.filter(m=>m.v==="mistake"||m.v==="blunder"),fast=errs.filter(m=>g.fastT&&m.t<g.fastT).length;
  let svg='<svg class="chart" viewBox="0 0 '+W+" "+(H+14)+'">';mine.forEach((m,k)=>{const h=Math.max(1,m.t/max*H),c=m.v==="blunder"||m.v==="mistake"?"#E04B3A":m.v==="inacc"?"#d9a43b":"#6f6a62";svg+='<rect data-i="'+m.i+'" x="'+(k*bw+.5)+'" y="'+(H-h)+'" width="'+Math.max(1,bw-1)+'" height="'+h+'" fill="'+c+'" style="cursor:pointer"/>'});
  if(g.fastT)svg+='<line x1="0" x2="'+W+'" y1="'+(H-g.fastT/max*H)+'" y2="'+(H-g.fastT/max*H)+'" stroke="#FF6A00" stroke-dasharray="3 3"/>';svg+='<text x="0" y="'+(H+12)+'">Tus jugadas en orden · rojo = error · línea = jugada apurada</text></svg>';
  el.innerHTML='<div class="card-h"><h2 style="font-size:15px">Cómo usaste el reloj</h2><span class="mute">promedio '+A64.fmtSec(avg)+'</span></div>'+svg+'<p style="margin-top:6px">'+(errs.length?(fast/errs.length>=.5?"El apuro te costó: "+fast+" de tus "+errs.length+" errores fueron jugadas rápidas. Frená cuando haya capturas o jaques.":"Tus errores no vinieron del apuro: pensaste y aun así fallaste. Revisá qué deja atacado cada jugada."):"Sin errores: el reloj lo manejaste bien.")+"</p>";
  $$("[data-i]",el).forEach(r=>r.addEventListener("click",()=>{R.learn=null;R.idx=+r.dataset.i;paint()}))}

/* ---- aprendé de tus errores ---- */
function startLearn(k){const g=R.g,errs=myErrors(g);if(k>=errs.length){R.learn=null;$("#rSay",root).innerHTML="<p><b>Listo.</b> Repasaste todos tus errores de esta partida. Los vas a volver a ver como puzzles.</p>";return}
  const i=errs[k];R.learn={k,i,ch:new Chess(g.fens[i-1]),tries:0,solved:false};R.idx=i-1;
  bd.last=i>1?g.moves[i-2]:null;bd.setArrows([]);bd.setOrientation(g.moves[i-1].color);bd.position(g.fens[i-1]);graph();moves();
  $("#rWho",root).textContent="error "+(k+1)+" de "+errs.length;
  $("#rSay",root).innerHTML="<p>Acá jugaste <b>"+esc(F(g.moves[i-1]))+"</b> y no era lo mejor. <b>Encontrá una jugada mejor.</b></p>"+(g.miss&&g.miss[i]?"<p class='mute'>Pista: el rival acababa de equivocarse.</p>":"");}
async function learnMove(mv){const L=R.learn,g=R.g;if(!L||L.solved)return;const fenB=g.fens[L.i-1],evB=g.ev[L.i-1];
  const m=L.ch.move({from:mv.from,to:mv.to,promotion:"q"});if(!m)return;bd.last=m;bd.position(L.ch.fen(),mv.dragged?null:m);m.captured?A64.Sound.capture():A64.Sound.move();
  let ok=evB&&evB.best&&evB.best.slice(0,4)===mv.from+mv.to;
  if(!ok){$("#rSay",root).innerHTML="<p>Lo verifico…</p>";const a=await A64.engine.analyse(L.ch.fen(),{depth:12,prio:true,tag:"learn"});if(a&&evB){const v=A64.classify(evB,a,m,evB.best);ok=v==="best"||v==="good"}}
  if(R.learn!==L)return;
  if(ok){L.solved=true;A64.Sound.ok();const br=A64.bestReason(fenB,evB,m.color);$("#rSay",root).innerHTML="<p><b style='color:var(--good)'>¡Eso!</b> "+esc(F(m))+" funciona. "+(br&&br.move.san===m.san?esc(br.why):"")+"</p><button class='btn main' id='lNext'>Siguiente error</button>";bd.setArrows([{from:m.from,to:m.to,color:"green"}]);$("#lNext",root).onclick=()=>startLearn(L.k+1);
    const ex=S.ex[g.id+"-"+L.i];if(ex)A64.srs.grade("ex:"+ex.id,true);return}
  L.tries++;A64.Sound.error();await A64.sleep(500);L.ch.undo();bd.last=null;bd.position(L.ch.fen());
  if(L.tries>=2){L.solved=true;const x=A64.explain({fenB,move:g.moves[L.i-1],evB,evA:g.ev[L.i],verdict:g.verd[L.i],me:g.moves[L.i-1].color});
    $("#rSay",root).innerHTML=x.paras.map(p=>"<p>"+esc(p)+"</p>").join("")+"<button class='btn main' id='lNext'>Siguiente error</button>";bd.setArrows(x.arrows);$("#lNext",root).onclick=()=>startLearn(L.k+1)}
  else $("#rSay",root).innerHTML="<p><span class='bad' style='color:var(--blunder);font-weight:700'>No.</span> Probá otra. Mirá qué piezas están atacadas y qué capturas hay.</p>"}

/* ================= torneos ================= */
function tourList(){const by={};S.games.forEach(g=>{if(!g.tour)return;const t=by[g.tour.id]||(by[g.tour.id]={id:g.tour.id,games:[],date:g.date,pts:0});t.games.push(g);t.date=Math.max(t.date,g.date)});
  return Object.values(by).map(t=>{t.games.sort((a,b)=>a.date-b.date);t.name=(S.tournaments[t.id]||{}).name||"Torneo de Lichess";t.pts=t.games.reduce((s,g)=>s+({w:1,d:.5}[A64.myResult(g)]||0),0);return t}).sort((a,b)=>b.date-a.date)}
A64.tourList=tourList;
function tour(id){
  const t=tourList().find(x=>x.id===id);if(!t)return list();keyH=null;
  t.games.forEach(g=>{if(!g.done)prioritize(g)});
  const done=t.games.filter(g=>g.done),th={};let errs=0,blund=0,accs=[],fast=0,keyOpen=0;
  done.forEach(g=>{const st=g.stats;if(!st)return;errs+=st.errs;blund+=st.blunder;fast+=st.fastErr;for(const k in st.themes)th[k]=(th[k]||0)+st.themes[k];const a=g.color==="w"?g.accW:g.accB;if(a!=null)accs.push(a);if(g.key&&g.key<=20)keyOpen++});
  const top=Object.entries(th).sort((a,b)=>b[1]-a[1]);
  const cons=[];if(top[0])cons.push(A64.TIP[top[0][0]]);if(fast>=2)cons.push("Con jaques o capturas en el tablero, no muevas antes de contar hasta cinco: "+fast+" de tus errores fueron jugadas rápidas.");
  if(keyOpen>=2)cons.push(keyOpen+" partidas se definieron antes de la jugada 10: repasá tus aperturas en Aprender.");if(top[1])cons.push(A64.TIP[top[1][0]]);
  while(cons.length<3)cons.push(["Después de cada jugada del rival, preguntate qué amenaza.","Enrocá antes de la jugada 10.","Si vas ganando material, cambiá piezas."][cons.length]);
  const acc=accs.length?accs.reduce((a,b)=>a+b,0)/accs.length:null;
  root.innerHTML='<div class="row"><button class="btn sm ghost" id="back">‹ Partidas</button></div><div class="hello"><p class="lbl">Informe de torneo</p><h1>'+esc(t.name)+'</h1><p>'+t.games.length+" partida"+(t.games.length>1?"s":"")+" · "+t.pts+" punto"+(t.pts===1?"":"s")+" · "+new Date(t.date).toLocaleDateString("es-AR",{day:"numeric",month:"long"})+'</p></div>'
   +(done.length<t.games.length?'<p class="mute">El analista todavía está revisando '+(t.games.length-done.length)+" partida"+(t.games.length-done.length>1?"s":"")+". El informe se completa solo.</p>":"")
   +'<div class="stats"><div class="stat"><span class="lbl">Precisión media</span><div class="v">'+(acc!=null?Math.round(acc)+" %":"—")+'</div></div><div class="stat"><span class="lbl">Errores</span><div class="v">'+errs+' <small>'+blund+' graves</small></div></div><div class="stat"><span class="lbl">Por apuro</span><div class="v">'+fast+'</div></div></div>'
   +'<div class="card"><div class="card-h"><h2>Tres cosas para el próximo torneo</h2></div><ol style="margin:0;padding-left:20px;display:grid;gap:8px">'+cons.slice(0,3).map(c=>"<li>"+esc(c)+"</li>").join("")+'</ol></div>'
   +(top.length?'<div class="card"><div class="card-h"><h2>Lo que más se repitió</h2></div><div class="bars">'+top.slice(0,5).map(([k,v])=>'<div class="b"><span>'+esc(A64.THEME_NAME[k])+'</span><i style="width:'+(v/top[0][1]*100)+'%"></i><b class="num">'+v+"</b></div>").join("")+"</div></div>":"")
   +'<div class="stack"><p class="lbl">Ronda por ronda</p>'+t.games.map((g,k)=>{const r=A64.myResult(g),a=g.color==="w"?g.accW:g.accB;return'<button class="item" data-g="'+g.id+'"><span class="r res-'+(r||"d")+'">'+(r==="w"?"G":r==="l"?"P":"½")+'</span><span style="min-width:0"><div class="t">Ronda '+(k+1)+" · "+esc(A64.opp(g))+" "+(g.color==="w"?g.br||"":g.wr||"")+'</div><div class="s">'+(g.done?(g.key?"Se definió en la jugada "+Math.ceil(g.key/2)+" · "+esc(A64.THEME_NAME[g.themes[g.key]]||"error"):"Sin un error decisivo"):"analizando…")+(g.opening?" · "+esc(g.opening):"")+'</div></span><span class="s">'+(a!=null?Math.round(a)+" %":"")+" ›</span></button>"}).join("")+"</div>";
  $("#back",root).onclick=()=>list();
  $$("[data-g]",root).forEach(b=>b.onclick=()=>{const g=A64.gameById(b.dataset.g);open(b.dataset.g,g&&g.key)});
  A64.onBgDone=()=>{if(A64.view==="revisar"&&!R)tour(id)};
}

A64.views.revisar={show,leave(){keyH=null;A64.onBg=null;A64.onBgDone=null;A64.engine.cancel("learn")},key:e=>keyH?keyH(e):false,refresh(){if(R)render();else list()}};
})();
