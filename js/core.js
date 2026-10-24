/* Archivo 64 — núcleo: datos, navegación, ajustes, Lichess. © 2026 Ignacio Dubois. Todos los derechos reservados. */
(function(){
"use strict";
const A64=window.A64;
const $=(s,r)=>(r||document).querySelector(s),$$=(s,r)=>[...(r||document).querySelectorAll(s)];
A64.$=$;A64.$$=$$;
A64.esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
A64.reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
A64.sleep=ms=>new Promise(r=>setTimeout(r,ms));
const ls={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const DAY=864e5;
A64.today=()=>{const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};

/* ================= datos ================= */
const DEF_SET={board:"marron",custom:{l:"#E8D7B9",d:"#9C7B57"},pieces:"plano",coords:true,d3:false,tilt:30,sound:true,vol:.8,theme:"dark",notation:"fig",anim:true};
const DEF={v:2,user:"athrion",level:5,agentMode:"rotar",agentIdx:0,settings:DEF_SET,games:[],srs:{},ex:{},ach:{},days:[],lastSync:0,ratings:{},coordBest:{w:0,b:0},practice:null,daily:null,flags:{},maxLevel:5,tournaments:{}};
let S;
try{S=JSON.parse(ls.get("a64v2")||"null")}catch(e){S=null}
if(!S){S=JSON.parse(JSON.stringify(DEF));
  try{const old=JSON.parse(ls.get("a64")||"null");if(old){
    if(old.user)S.user=old.user;if(old.level)S.level=Math.max(1,Math.min(30,old.level*3-1));
    if(Array.isArray(old.games))S.games=old.games.map(g=>Object.assign({},g,{done:false,verd:null,stats:null,lichess:null}));
    if(old.ex)S.ex=old.ex;if(old.ach)S.ach=old.ach;if(old.days)S.days=old.days;if(old.ratings)S.ratings=old.ratings;if(old.rating)S.rating=old.rating;
    if(old.sound===false)S.settings.sound=false;S.lastSync=0;S.flags.migrated=true}}catch(e){}}
S.settings=Object.assign({},DEF_SET,S.settings||{});
for(const k in DEF)if(S[k]===undefined)S[k]=JSON.parse(JSON.stringify(DEF[k]));
A64.S=S;A64.settings=S.settings;
let saveT=null;A64.save=()=>{clearTimeout(saveT);saveT=setTimeout(()=>{try{ls.set("a64v2",JSON.stringify(S))}catch(e){
  /* si no entra, recortamos análisis viejos */S.games.slice(40).forEach(g=>{g.ev=null;g.fens=null;g.done=false});ls.set("a64v2",JSON.stringify(S))}},250)};
A64.gameById=id=>S.games.find(g=>g.id===id);

/* ================= utilidades de UI ================= */
A64.toast=(title,text)=>{const t=document.createElement("div");t.className="toast";t.innerHTML="<b>"+A64.esc(title)+"</b>"+A64.esc(text||"");$("#toasts").appendChild(t);setTimeout(()=>t.remove(),4200)};
A64.modal=(html,onMount)=>{const ov=$("#ovModal"),box=$("#modalBox");box.innerHTML=html;ov.hidden=false;onMount&&onMount(box);
  const close=()=>{ov.hidden=true;box.innerHTML=""};ov.onclick=e=>{if(e.target===ov)close()};$$("[data-close]",box).forEach(b=>b.onclick=close);return close};
A64.closeModal=()=>{$("#ovModal").hidden=true;$("#modalBox").innerHTML=""};
A64.logoSVG=(color,h)=>{const GL={a:[".....",".....",".###.","....#",".####","#...#",".####"],"6":["..##.",".#...","#....","####.","#...#","#...#",".###."],"4":["...#.","..##.",".#.#.","#..#.","#####","...#.","...#."]};
  let r="",x=0;for(const ch of "a64"){GL[ch].forEach((row,y)=>[...row].forEach((c,i)=>{if(c==="#")r+='<rect x="'+(x+i)+'" y="'+y+'" width="1.02" height="1.02"/>'}));x+=6}
  return '<svg viewBox="-.5 -.5 18 8" style="height:'+(h||"20px")+'" role="img" aria-label="a64"><g fill="'+(color||"#FF6A00")+'" shape-rendering="crispEdges">'+r+"</g></svg>"};
A64.fmtClock=ms=>{ms=Math.max(0,ms);const s=Math.ceil(ms/1000);if(ms<10000&&ms>0)return (ms/1000).toFixed(1).replace(".",",");return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")};
A64.fmtSec=s=>s==null?"—":s<60?(Math.round(s*10)/10).toString().replace(".",",")+" s":Math.floor(s/60)+" min "+Math.round(s%60)+" s";
A64.ago=ts=>{const d=Math.floor((Date.now()-ts)/DAY);return d<=0?"hoy":d===1?"ayer":"hace "+d+" días"};

/* ================= ajustes visuales ================= */
A64.applySettings=()=>{const s=S.settings;
  document.documentElement.setAttribute("data-theme",s.theme==="light"?"light":"dark");
  const th=s.board==="custom"?s.custom:A64.BOARD_THEMES[s.board]||A64.BOARD_THEMES.marron;
  document.documentElement.style.setProperty("--board-l",th.l);document.documentElement.style.setProperty("--board-d",th.d);
  $$(".a64-board").forEach(b=>{b.style.setProperty("--l",th.l);b.style.setProperty("--d",th.d);b.classList.toggle("d3",!!s.d3&&!b.classList.contains("mini"));b.style.setProperty("--tilt",(s.tilt||30)+"deg")});
  A64.Sound.on=s.sound;A64.Sound.vol=s.vol;
  (A64.boards||[]).forEach(b=>{if(b.el.isConnected)b.render()});
  const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=s.theme==="light"?"#ffffff":"#161512";
};
A64.boards=[];
A64.makeBoard=(el,opts)=>{const b=new A64.Board(el,opts);A64.boards=A64.boards.filter(x=>x.el.isConnected);A64.boards.push(b);
  const s=S.settings,th=s.board==="custom"?s.custom:A64.BOARD_THEMES[s.board]||A64.BOARD_THEMES.marron;el.style.setProperty("--l",th.l);el.style.setProperty("--d",th.d);
  el.classList.toggle("d3",!!s.d3&&!opts?.mini);el.style.setProperty("--tilt",(s.tilt||30)+"deg");return b};

A64.openSettings=()=>{
  const ov=$("#ovSettings"),body=$("#setBody"),s=S.settings;
  const sw=(key,val,label,inner)=>'<button class="sw" data-k="'+key+'" data-v="'+val+'" aria-pressed="'+(String(s[key])===String(val))+'">'+inner+"<span>"+label+"</span></button>";
  const boardSw=Object.entries(A64.BOARD_THEMES).map(([k,t])=>sw("board",k,t.name,'<span class="mini4"><i style="background:'+t.l+'"></i><i style="background:'+t.d+'"></i><i style="background:'+t.d+'"></i><i style="background:'+t.l+'"></i></span>')).join("")
    +sw("board","custom","A tu gusto",'<span class="mini4"><i style="background:'+s.custom.l+'"></i><i style="background:'+s.custom.d+'"></i><i style="background:'+s.custom.d+'"></i><i style="background:'+s.custom.l+'"></i></span>');
  const pcSw=Object.entries(A64.PIECE_SETS).map(([k,t])=>sw("pieces",k,t.name,'<span class="pcprev">'+A64.pieceSVG(k,"w","n")+"</span>")).join("");
  body.innerHTML='<div class="set-grid"><div><div id="setPrev"></div><p class="mute" style="font-size:13px;margin-top:8px;text-align:center">Vista previa en vivo</p></div><div class="stack">'
   +'<div><p class="lbl">Tablero</p><div class="swatches" style="margin-top:6px">'+boardSw+'</div><div class="row" id="customRow" style="margin-top:8px"'+(s.board==="custom"?"":" hidden")+'><label class="row" style="gap:6px;font-size:13px">Claras <input type="color" id="cL" value="'+s.custom.l+'"></label><label class="row" style="gap:6px;font-size:13px">Oscuras <input type="color" id="cD" value="'+s.custom.d+'"></label></div></div>'
   +'<div><p class="lbl">Piezas</p><div class="swatches" style="margin-top:6px">'+pcSw+'</div></div></div></div>'
   +'<div class="stack" style="gap:0">'
   +'<label class="switch"><span>Nombre de cada casilla (e4, f3…)<br><small class="mute">Chiquito, en la esquina de cada casilla</small></span><input type="checkbox" id="sCoords"'+(s.coords?" checked":"")+'></label>'
   +'<label class="switch"><span>Tablero inclinado en 3D</span><input type="checkbox" id="s3d"'+(s.d3?" checked":"")+'></label>'
   +'<label class="switch" id="tiltRow"'+(s.d3?"":" hidden")+'><span>Inclinación</span><input type="range" id="sTilt" min="10" max="55" value="'+s.tilt+'" style="width:160px;accent-color:var(--acc)"></label>'
   +'<label class="switch"><span>Sonido de piezas</span><input type="checkbox" id="sSound"'+(s.sound?" checked":"")+'></label>'
   +'<label class="switch"><span>Animaciones</span><input type="checkbox" id="sAnim"'+(s.anim?" checked":"")+'></label>'
   +'<div class="switch"><span>Tema</span><div class="seg" id="sTheme"><button data-v="dark" aria-pressed="'+(s.theme!=="light")+'">Oscuro</button><button data-v="light" aria-pressed="'+(s.theme==="light")+'">Claro</button></div></div>'
   +'<div class="switch"><span>Jugadas escritas con</span><div class="seg" id="sNot"><button data-v="fig" aria-pressed="'+(s.notation!=="es")+'">♘f3</button><button data-v="es" aria-pressed="'+(s.notation==="es")+'">Cf3</button></div></div>'
   +'<div class="switch"><span>Tu usuario de Lichess</span><input type="text" id="sUser" value="'+A64.esc(S.user)+'" autocomplete="off" autocapitalize="off" spellcheck="false" style="width:160px"></div>'
   +'</div><p class="mute" style="font-size:13px">Atajos en la compu: ← → jugadas · F girar tablero · H pista · Esc cerrar. Clic derecho y arrastrar dibuja flechas (con Shift, en rojo).</p>';
  const prev=A64.makeBoard($("#setPrev",body),{noCoords:false});prev.position("r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4");prev.last={from:"g8",to:"f6"};prev.setArrows([{from:"f3",to:"g5",color:"green"}]);prev.render();
  const upd=()=>{A64.applySettings();A64.save();prev.render()};
  $$(".sw",body).forEach(b=>b.onclick=()=>{s[b.dataset.k]=b.dataset.v;$$('.sw[data-k="'+b.dataset.k+'"]',body).forEach(x=>x.setAttribute("aria-pressed",x===b));$("#customRow",body).hidden=s.board!=="custom";upd()});
  $("#cL",body).oninput=e=>{s.custom.l=e.target.value;if(s.board==="custom")upd()};$("#cD",body).oninput=e=>{s.custom.d=e.target.value;if(s.board==="custom")upd()};
  $("#sCoords",body).onchange=e=>{s.coords=e.target.checked;upd()};
  $("#s3d",body).onchange=e=>{s.d3=e.target.checked;$("#tiltRow",body).hidden=!s.d3;upd()};
  $("#sTilt",body).oninput=e=>{s.tilt=+e.target.value;upd()};
  $("#sSound",body).onchange=e=>{s.sound=e.target.checked;upd();if(s.sound)A64.Sound.move()};
  $("#sAnim",body).onchange=e=>{s.anim=e.target.checked;upd()};
  $$("#sTheme button",body).forEach(b=>b.onclick=()=>{s.theme=b.dataset.v;$$("#sTheme button",body).forEach(x=>x.setAttribute("aria-pressed",x===b));upd()});
  $$("#sNot button",body).forEach(b=>b.onclick=()=>{s.notation=b.dataset.v;$$("#sNot button",body).forEach(x=>x.setAttribute("aria-pressed",x===b));upd();A64.rerender()});
  $("#sUser",body).onchange=e=>{S.user=e.target.value.trim();S.lastSync=0;A64.save()};
  ov.hidden=false;const close=()=>{ov.hidden=true;A64.rerender()};$("[data-close]",ov).onclick=close;ov.onclick=e=>{if(e.target===ov)close()};
};

/* ================= navegación ================= */
A64.view="inicio";A64.views={};
A64.go=(v,arg)=>{
  if(A64.views[A64.view]&&A64.views[A64.view].leave)A64.views[A64.view].leave();
  A64.view=v;$$(".view").forEach(x=>x.hidden=x.id!=="v-"+v);
  $$("[data-go]").forEach(b=>{if(b.dataset.go===v)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current")});
  const V=A64.views[v];if(V)V.show($("#v-"+v),arg);
  try{history.replaceState(null,"","#"+v)}catch(e){}window.scrollTo(0,0);
};
A64.rerender=()=>{const V=A64.views[A64.view];if(V&&V.refresh)V.refresh();else if(V)V.show($("#v-"+A64.view))};
document.addEventListener("keydown",e=>{
  if(e.key==="Escape"){if(!$("#ovSettings").hidden){$("#ovSettings").hidden=true;A64.rerender();return}if(!$("#ovModal").hidden){A64.closeModal();return}}
  if(/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)||!$("#ovSettings").hidden||!$("#ovModal").hidden)return;
  const V=A64.views[A64.view];if(V&&V.key&&V.key(e))e.preventDefault();
});

/* ================= motor ================= */
A64.engine=new A64.Engine();
A64.engine.onChange(k=>{const el=$("#engState");el.textContent=A64.engine.label();el.classList.toggle("on",k==="sf17"||k==="sf10")});

/* ================= repetición espaciada ================= */
const BOX=[0,1,2,4,8,16,32];
A64.srs={
  get:id=>S.srs[id],
  due:id=>{const it=S.srs[id];return !it||it.due<=Date.now()},
  grade(id,ok){const it=S.srs[id]||{box:0,due:0,lapses:0,seen:0};it.seen++;if(ok){it.box=Math.min(6,it.box+1)}else{it.box=1;it.lapses++}
    it.due=Date.now()+BOX[it.box]*DAY-3600e3;it.last=Date.now();S.srs[id]=it;A64.save();return it},
  level:id=>(S.srs[id]||{}).box||0
};

/* ================= plan del día ================= */
A64.daily=()=>{const t=A64.today();if(!S.daily||S.daily.date!==t)S.daily={date:t,op:0,pz:0,game:0,cards:0};return S.daily};
A64.markDay=()=>{const d=new Date();d.setHours(0,0,0,0);const t=d.getTime();if(!S.days.includes(t)){S.days.push(t);S.days=S.days.slice(-60)}A64.save()};
A64.streak=()=>{const set=new Set(S.days);let n=0;const d=new Date();d.setHours(0,0,0,0);let t=d.getTime();if(!set.has(t))t-=DAY;while(set.has(t)){n++;t-=DAY}return n};
A64.dailyTarget={op:2,pz:5,game:1};
A64.bump=(k,n)=>{const d=A64.daily();d[k]=(d[k]||0)+(n||1);A64.markDay();A64.save();A64.checkAch()};

/* ================= niveles y agentes ================= */
A64.rating=l=>400+(l-1)*70;
A64.rank=l=>A64.RANKS[Math.min(5,Math.floor((l-1)/5))];
A64.agentList=["brizuela","lemos","quiroga","sosa"];
A64.nextAgent=()=>{if(S.agentMode!=="rotar")return S.agentMode;const a=A64.agentList[S.agentIdx%4];return a};

/* ================= armado de partidas ================= */
A64.buildRecord=o=>{
  const c=new Chess(o.fen||undefined),fens=[c.fen()],moves=[];
  for(const s of o.sans){const m=c.move(s,{sloppy:true});if(!m)return null;moves.push({san:m.san,from:m.from,to:m.to,piece:m.piece,captured:m.captured||null,color:m.color,flags:m.flags,promotion:m.promotion||null});fens.push(c.fen())}
  if(!moves.length)return null;
  let times=o.times||null;
  if(!times&&o.clocks&&o.clocks.length&&o.clock){times=[];const init=o.clock.initial,inc=o.clock.increment||0;
    for(let i=0;i<moves.length;i++){const rem=o.clocks[i]!=null?o.clocks[i]/100:null,prev=i<2?init:(o.clocks[i-2]!=null?o.clocks[i-2]/100:null);times.push(rem==null||prev==null?null:Math.max(0,Math.round((prev-rem+(i<2?0:inc))*10)/10))}}
  const g={id:o.id,source:o.source,date:o.date||Date.now(),color:o.color||null,white:o.white||"Blancas",black:o.black||"Negras",wr:o.wr||null,br:o.br||null,
    result:o.result||"*",opening:o.opening||A64.openingName(moves.map(m=>m.san)),speed:o.speed||null,fens,moves,times,lichess:o.lichess||null,ev:null,done:false,
    tour:o.tour||null,agent:o.agent||null,level:o.level||null,mode:o.mode||null,clockLabel:o.clockLabel||null,status:o.status||null};
  if(times){const mine=times.filter((t,i)=>t!=null&&(!g.color||moves[i].color===g.color));const med=mine.length?mine.slice().sort((a,b)=>a-b)[Math.floor(mine.length/2)]:null;g.fastT=med!=null?Math.max(2,Math.min(med*.45,10)):null}
  return g};
A64.myResult=g=>{if(!g.color||g.result==="*")return"";if(g.result==="1/2-1/2")return"d";return(g.result==="1-0")===(g.color==="w")?"w":"l"};
A64.opp=g=>g.color==="w"?g.black:g.color==="b"?g.white:g.white+" vs. "+g.black;
A64.openingName=sans=>{const s=sans.join(" ")+" ";let best=null;for(const o of A64.OPENINGS){const line=o.moves.map(x=>x[0]);for(let k=line.length;k>=2;k--){const p=line.slice(0,k).join(" ")+" ";if(s.startsWith(p)){if(!best||k>best.k)best={k,name:o.name};break}}}return best&&best.k>=3?best.name:null};

/* ================= análisis en segundo plano ================= */
const BG={running:false};
A64.bgAnalyze=async()=>{
  if(BG.running)return;BG.running=true;
  try{await A64.engine.ready;
    for(;;){const g=S.games.find(x=>!x.done&&x.fens);if(!g)break;BG.cur=g.id;
      const ok=await A64.analyzeGame(g,A64.engine,(i,n)=>{BG.prog=i/n;A64.onBg&&A64.onBg(g,i,n)},()=>!!A64.gameById(g.id));
      if(!ok||!A64.gameById(g.id))continue;
      A64.buildExercises(g);A64.save();A64.checkAch();A64.onBgDone&&A64.onBgDone(g)}
  }finally{BG.running=false;BG.cur=null}};
A64.bgState=()=>BG;
A64.buildExercises=g=>{for(let i=1;i<g.fens.length;i++){const m=g.moves[i-1],v=g.verd&&g.verd[i];
  if(!(v==="mistake"||v==="blunder"))continue;if(g.color&&m.color!==g.color)continue;const b=g.ev[i-1];if(!b||!b.best)continue;const id=g.id+"-"+i;if(S.ex[id])continue;
  let why="";try{why=A64.punish(g.fens[i-1],m,g.ev[i]).text}catch(e){}
  S.ex[id]={id,gid:g.id,ply:i,fen:g.fens[i-1],best:b.best,pv:(b.pv||[]).slice(0,3),played:m.san,color:m.color,why,theme:g.themes&&g.themes[i],date:g.date}}};

/* ================= Lichess ================= */
A64.lichess={
  async sync(onMsg){
    const u=(S.user||"").trim();if(!u){onMsg&&onMsg("Poné tu usuario de Lichess en Ajustes.",true);return 0}
    onMsg&&onMsg("Buscando tus partidas en Lichess…");
    try{
      const ur=await fetch("https://lichess.org/api/user/"+encodeURIComponent(u));
      if(ur.status===404)throw new Error("No encontré el usuario «"+u+"» en Lichess.");
      if(ur.ok){const d=await ur.json();S.user=d.username||u;S.ratings={};for(const k of ["bullet","blitz","rapid","classical"])if(d.perfs&&d.perfs[k]&&d.perfs[k].games)S.ratings[k]={r:d.perfs[k].rating,n:d.perfs[k].games,prov:!!d.perfs[k].prov}}
      const since=S.lastSync?"&since="+(S.lastSync-3*DAY):"";
      const r=await fetch("https://lichess.org/api/games/user/"+encodeURIComponent(S.user)+"?max=40&clocks=true&evals=true&opening=true&perfType=bullet,blitz,rapid,classical"+since,{headers:{Accept:"application/x-ndjson"}});
      if(r.status===429)throw new Error("Lichess pidió esperar un minuto antes de volver a consultar.");
      if(!r.ok)throw new Error("Lichess respondió con un error ("+r.status+"). Probá en un rato.");
      const lines=(await r.text()).split("\n").filter(Boolean);let added=0,upd=0;
      for(const ln of lines){let gj;try{gj=JSON.parse(ln)}catch(e){continue}
        if(gj.variant!=="standard"||!gj.moves)continue;const id="li-"+gj.id,ex=A64.gameById(id);
        if(ex){if(gj.analysis&&!ex.lichess){ex.lichess=gj.analysis;ex.done=false;ex.ev=null;upd++}continue}
        const wn=(gj.players.white.user||{}).name||"Anónimo",bn=(gj.players.black.user||{}).name||"Anónimo",me=S.user.toLowerCase();
        const color=wn.toLowerCase()===me?"w":bn.toLowerCase()===me?"b":null;
        const rec=A64.buildRecord({id,source:"lichess",sans:gj.moves.split(" "),clocks:gj.clocks,clock:gj.clock,color,white:wn,black:bn,wr:gj.players.white.rating,br:gj.players.black.rating,
          result:gj.winner==="white"?"1-0":gj.winner==="black"?"0-1":"1/2-1/2",opening:gj.opening&&gj.opening.name?A64.openingES(gj.opening.name):null,speed:gj.speed,date:gj.createdAt,lichess:gj.analysis||null,
          tour:gj.swiss?{type:"swiss",id:gj.swiss}:gj.tournament?{type:"arena",id:gj.tournament}:null,status:gj.status});
        if(rec){S.games.push(rec);added++}}
      S.games.sort((a,b)=>b.date-a.date);
      const keep=S.games.filter(g=>g.source==="lichess").slice(0,60).map(g=>g.id);S.games=S.games.filter(g=>g.source!=="lichess"||keep.includes(g.id));
      await this.tourNames();
      S.lastSync=Date.now();A64.save();
      onMsg&&onMsg(added?"Traje "+added+" partida"+(added>1?"s":"")+" nueva"+(added>1?"s":"")+(upd?" y "+upd+" con análisis de Lichess":"")+".":"No hay partidas nuevas.");
      A64.bgAnalyze();return added}
    catch(e){onMsg&&onMsg(e instanceof TypeError?"No me pude conectar con Lichess. Revisá la conexión.":e.message,true);return 0}},
  async tourNames(){const ids=new Map();S.games.forEach(g=>{if(g.tour&&!S.tournaments[g.tour.id])ids.set(g.tour.id,g.tour.type)});
    for(const [id,type] of ids){try{const r=await fetch("https://lichess.org/api/"+(type==="swiss"?"swiss":"tournament")+"/"+id);if(r.ok){const d=await r.json();S.tournaments[id]={name:d.name||d.fullName||"Torneo",type,rounds:d.nbRounds||null,date:Date.parse(d.startsAt)||null}}}catch(e){}}},
  async explorer(fen){
    if(S.flags.noExplorer)return null;
    try{const r=await fetch("https://explorer.lichess.ovh/lichess?variant=standard&speeds=blitz,rapid&ratings=1000,1200,1400&moves=6&topGames=0&recentGames=0&fen="+encodeURIComponent(fen));
      if(r.status===401||r.status===403){S.flags.noExplorer=true;A64.save();return null}if(!r.ok)return null;return await r.json()}catch(e){return null}},
  async puzzle(angle){
    if(S.flags.noLiPuzzle)return null;
    try{const r=await fetch("https://lichess.org/api/puzzle/next"+(angle?"?angle="+angle:""));if(r.status===401||r.status===403){S.flags.noLiPuzzle=true;A64.save();return null}if(!r.ok)return null;
      const d=await r.json();const c=new Chess();c.load_pgn(d.game.pgn);return{id:"li-"+d.puzzle.id,fen:c.fen(),sol:d.puzzle.solution,theme:(d.puzzle.themes||[]).map(t=>A64.LI_THEMES[t]).filter(Boolean)[0]||"Táctica",rating:d.puzzle.rating,source:"lichess"}}catch(e){return null}}
};
A64.LI_THEMES={fork:"Horquilla",pin:"Clavada",skewer:"Ensartada",discoveredAttack:"Ataque descubierto",hangingPiece:"Pieza colgada",mateIn1:"Mate en 1",mateIn2:"Mate en 2",backRankMate:"Mate del pasillo",doubleCheck:"Jaque doble",sacrifice:"Sacrificio",trappedPiece:"Pieza atrapada",deflection:"Desviación",attraction:"Atracción",advantage:"Ventaja",crushing:"Golpe decisivo"};
A64.THEME_ANGLE={fork:"fork",hang:"hangingPiece",pin:"pin",skewer:"skewer",disc:"discoveredAttack",mate:"mateIn2",check:"fork",pos:"advantage",miss:"hangingPiece"};
A64.THEME_NAME={fork:"Horquillas y ataques dobles",hang:"Piezas colgadas",pin:"Clavadas",skewer:"Ensartadas",disc:"Ataques descubiertos",mate:"Mates que no viste",check:"Jaques peligrosos",pos:"Errores de posición",miss:"Oportunidades perdidas"};
A64.openingES=en=>{const M=[["Italian","Italiana"],["Giuoco","Italiana"],["Two Knights","Italiana contra 3...Cf6"],["Ruy Lopez","Española"],["Scotch","Escocesa"],["Petrov","Petrov"],["Russian","Petrov"],["Philidor","Philidor"],["Sicilian","Siciliana"],["French","Francesa"],["Caro-Kann","Caro-Kann"],["Scandinavian","Escandinava"],["Pirc","Pirc"],["Modern","Moderna"],["Queen's Gambit Declined","Gambito de Dama Rehusado"],["Queen's Gambit Accepted","Gambito de Dama Aceptado"],["Queen's Gambit","Gambito de Dama"],["Slav","Eslava"],["London","Londres"],["King's Indian","India de Rey"],["Nimzo","Nimzoindia"],["English","Inglesa"],["Dutch","Holandesa"],["King's Gambit","Gambito de Rey"],["Vienna","Vienesa"],["Bishop's Opening","Apertura de Alfil"],["Alekhine","Alekhine"],["Scholar","Ataque pastor"],["King's Pawn","Peón de rey"],["Queen's Pawn","Peón de dama"],["Englund","Gambito Englund"],["Ponziani","Ponziani"],["Four Knights","Cuatro Caballos"],["Three Knights","Tres Caballos"],["Center Game","Juego del Centro"],["Owen","Owen"],["Nimzowitsch","Nimzowitsch"]];
  for(const [k,v] of M)if(en.includes(k))return v+(en.includes(":")?" · "+en.split(":")[1].trim():"");return en};

/* ================= logros ================= */
A64.ACH=[
 {id:"first",t:"Expediente abierto",d:"Primera partida revisada.",ok:()=>S.games.some(g=>g.done)},
 {id:"clean",t:"Mano firme",d:"Partida de 15+ jugadas sin errores graves.",ok:()=>S.games.some(g=>g.done&&g.color&&g.stats&&g.stats.blunder===0&&g.stats.moves>=15)},
 {id:"acc80",t:"Precisión 80",d:"Una partida con 80 % de precisión o más.",ok:()=>S.games.some(g=>g.done&&g.color&&((g.color==="w"?g.accW:g.accB)||0)>=80)},
 {id:"beat",t:"Le ganaste a un agente",d:"Ganarle al analista en cualquier nivel.",ok:()=>S.games.some(g=>g.source==="analista"&&A64.myResult(g)==="w")},
 {id:"beatall",t:"Toda la oficina",d:"Ganarle a los cuatro agentes.",ok:()=>A64.agentList.every(a=>S.games.some(g=>g.source==="analista"&&g.agent===a&&A64.myResult(g)==="w"))},
 {id:"lvl10",t:"Inspector",d:"Llegar al nivel 10 del analista.",ok:()=>(S.maxLevel||0)>=10},
 {id:"lvl20",t:"Jefe de sección",d:"Llegar al nivel 20.",ok:()=>(S.maxLevel||0)>=20},
 {id:"op5",t:"Repertorio en marcha",d:"Cinco aperturas practicadas sin errores.",ok:()=>A64.OPENINGS.filter(o=>A64.srs.level("op:"+o.id)>=2).length>=5},
 {id:"pz25",t:"Ojo táctico",d:"25 puzzles resueltos.",ok:()=>(S.pzSolved||0)>=25},
 {id:"coord20",t:"Mapa en la cabeza",d:"20 casillas en 30 segundos.",ok:()=>Math.max(S.coordBest.w||0,S.coordBest.b||0)>=20},
 {id:"cards",t:"Principios a mano",d:"Todas las tarjetas vistas al menos una vez.",ok:()=>A64.CARDS.every(c=>S.srs["card:"+c.id])},
 {id:"endg",t:"Finales básicos",d:"Ganar los cuatro finales esenciales.",ok:()=>A64.ENDGAMES.every(e=>(S.endWon||{})[e.id])},
 {id:"streak7",t:"Constancia",d:"Siete días seguidos entrenando.",ok:()=>A64.streak()>=7},
 {id:"warm",t:"Previa de torneo",d:"Hacer el calentamiento completo.",ok:()=>!!S.warmDone}];
A64.checkAch=()=>{S.maxLevel=Math.max(S.maxLevel||0,S.level);for(const a of A64.ACH)if(!S.ach[a.id]&&a.ok()){S.ach[a.id]=Date.now();A64.toast("Logro",a.t+". "+a.d);A64.Sound.win()}A64.save()};

/* ================= arranque ================= */
A64.boot=()=>{
  $("#logoTop").innerHTML=A64.logoSVG("#FF6A00","20px");
  $$("[data-go]").forEach(b=>b.addEventListener("click",()=>{A64.Sound.c();A64.go(b.dataset.go)}));
  $("#bSettings").onclick=A64.openSettings;
  A64.applySettings();A64.engine.start();
  const h=(location.hash||"").slice(1);A64.go(["jugar","aprender","revisar","progreso"].includes(h)?h:"inicio");
  if(S.games.some(g=>!g.done&&g.fens))A64.bgAnalyze();
  if(S.user&&Date.now()-S.lastSync>3*3600e3)A64.lichess.sync(m=>{A64.syncMsg=m;if(A64.view==="inicio")A64.rerender()});
  A64.markDay();A64.checkAch();
  if("serviceWorker" in navigator&&location.protocol==="https:"&&!/claude|claudeusercontent/.test(location.hostname))navigator.serviceWorker.register("sw.js").catch(()=>{});
};
})();
