/* Archivo 64 — Inicio y Progreso. © 2026 Ignacio Dubois. Todos los derechos reservados. */
(function(){
"use strict";
const A64=window.A64,S=A64.S,$=A64.$,$$=A64.$$,esc=A64.esc;
const ICON={op:'<svg viewBox="0 0 24 24"><path d="M4 5h7v14H4zM13 5h7v14h-7z"/></svg>',pz:'<svg viewBox="0 0 24 24"><path d="M9 3h6v3a2 2 0 1 0 0 4v3h-3a2 2 0 1 1-4 0H5V9a2 2 0 1 0 0-4V3z"/></svg>',game:'<svg viewBox="0 0 24 24"><circle cx="12" cy="6" r="3"/><path d="M9.5 10h5l1 7h-7zM7 21h10l-1-4H8z"/></svg>',fire:'<svg viewBox="0 0 24 24"><path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z"/></svg>'};

/* ================= consignas (salen de tus partidas) ================= */
A64.consignas=()=>{
  const gs=S.games.filter(g=>g.done&&g.color&&g.stats).slice(0,20);
  if(gs.length<2)return{n:gs.length,list:[{t:"Antes de soltar una pieza, mirá cada pieza tuya: ¿quién la ataca y quién la defiende?",w:"Consigna de arranque. Con dos partidas analizadas, las saco de tus errores."},{t:"Buscá primero jaques y capturas, tuyos y del rival.",w:"El hábito que más errores evita en tu nivel."},{t:"En la apertura: centro, caballos y alfiles afuera, enroque.",w:"Antes de la jugada 10, ninguna pieza se mueve dos veces sin motivo."}]};
  const th={};let fast=0,errs=0,miss=0,ph={a:0,m:0,f:0};
  gs.forEach(g=>{const s=g.stats;errs+=s.errs;fast+=s.fastErr||0;miss+=s.miss||0;for(const k in s.themes)th[k]=(th[k]||0)+s.themes[k];for(const k in s.phase)ph[k]+=s.phase[k]});
  const c=[];const T={hang:"Antes de soltar la pieza, revisá cada pieza tuya: ¿quién la ataca y quién la defiende?",fork:"Mirá a qué casillas pueden saltar los caballos rivales y qué piezas tuyas quedan sin defensor.",mate:"Antes de cada jugada, mirá todos los jaques del rival. Si alguno es mate, eso va primero.",pin:"No dejes piezas valiosas en la misma línea que tu rey o tu dama si hay alfiles o torres rivales mirando.",disc:"Cuando una pieza rival tapa a otra de largo alcance, preguntate qué pasa si se mueve.",skewer:"Cuidado con rey y dama en la misma línea.",check:"Después de tu jugada, ¿qué jaques le quedan al rival?",pos:"Si no hay nada concreto, mejorá tu peor pieza."};
  Object.entries(th).sort((a,b)=>b[1]-a[1]).slice(0,2).forEach(([k,v])=>c.push({s:v*3,t:T[k]||T.pos,w:A64.THEME_NAME[k]+": "+v+" vez"+(v>1?"es":"")+" en tus últimas "+gs.length+" partidas."}));
  if(fast&&errs)c.push({s:fast*2.5,t:"Con capturas o jaques en el tablero, no muevas antes de contar hasta cinco.",w:Math.round(fast/errs*100)+" % de tus errores fueron jugadas rápidas."});
  if(miss)c.push({s:miss*2,t:"Después de cada jugada rival, preguntate: ¿dejó algo colgado?",w:"Dejaste pasar "+miss+" regalo"+(miss>1?"s":"")+" del rival."});
  const top=Object.entries(ph).sort((a,b)=>b[1]-a[1])[0];if(errs&&top[1]/errs>=.45)c.push({s:top[1]*1.5,t:{a:"Primeras diez jugadas: centro, desarrollo y enroque. Repasá tu repertorio.",m:"En el medio juego, antes de atacar, fijate que tu rey y tus piezas estén cubiertos.",f:"En el final, el rey es una pieza más: llevalo al centro."}[top[0]],w:Math.round(top[1]/errs*100)+" % de tus errores aparecen en "+{a:"la apertura",m:"el medio juego",f:"el final"}[top[0]]+"."});
  c.sort((a,b)=>b.s-a.s);const fill=[{t:"Desarrollá caballos y alfiles antes de mover la dama.",w:"Principio general."},{t:"Cambiá piezas cuando vas ganando.",w:"Principio general."},{t:"Enrocá antes de la jugada 10.",w:"Principio general."}];
  const seen=new Set(),out=[];for(const x of c)if(!seen.has(x.t)){seen.add(x.t);out.push(x)}while(out.length<3)out.push(fill[out.length]);return{n:gs.length,list:out.slice(0,3)}};

/* ================= inicio ================= */
function home(el){
  const d=A64.daily(),T=A64.dailyTarget,hr=new Date().getHours();
  const hi=hr<12?"Buen día":hr<20?"Buenas tardes":"Buenas noches";
  const dueOps=A64.OPENINGS.filter(o=>S.srs["op:"+o.id]&&A64.srs.due("op:"+o.id));
  const nextNew=A64.OPENINGS.find(o=>!S.srs["op:"+o.id]);
  const tours=(A64.tourList?A64.tourList():[]).filter(t=>Date.now()-t.date<4*864e5);
  const c=A64.consignas(),cons=c.list[Math.floor(Date.now()/864e5)%c.list.length];
  const ag=A64.AGENTS[A64.nextAgent()];
  const done=(k)=>(d[k]||0)>=T[k];
  const rt=Object.entries(S.ratings||{}).sort((a,b)=>b[1].n-a[1].n);
  const lg=S.games[0];
  el.innerHTML='<div class="hello"><h1>'+hi+'</h1><p>'+(A64.streak()?"Racha de "+A64.streak()+" día"+(A64.streak()>1?"s":"")+" entrenando.":"Quince minutos por día alcanzan.")+'</p></div>'
   +(tours.length?'<button class="warm" id="hTour" style="text-align:left;color:inherit;cursor:pointer"><div><p class="lbl">Informe de torneo</p><h3>'+esc(tours[0].name)+'</h3><p class="mute">'+tours[0].games.length+" partida"+(tours[0].games.length>1?"s":"")+" · "+tours[0].pts+" punto"+(tours[0].pts===1?"":"s")+'. Mirá dónde se definió cada una.</p></div><span class="btn main">Ver informe</span></button>':"")
   +'<div class="card"><div class="card-h"><h2>Plan del día</h2><span class="mute">≈15 min</span></div><div class="plan">'
   +'<button class="task'+(done("op")?" done":"")+'" id="tOp"><div class="row"><span class="ic">'+ICON.op+'</span><span class="sp"></span><span class="pill">'+Math.min(d.op||0,T.op)+" / "+T.op+'</span></div><h3>Aperturas</h3><p class="mute" style="font-size:13.5px">'+(dueOps.length?dueOps.length+" para repasar.":nextNew?"Nueva: "+esc(nextNew.name)+".":"Repaso libre.")+'</p><div class="prog"><span style="width:'+Math.min(100,(d.op||0)/T.op*100)+'%"></span></div></button>'
   +'<button class="task'+(done("pz")?" done":"")+'" id="tPz"><div class="row"><span class="ic">'+ICON.pz+'</span><span class="sp"></span><span class="pill">'+Math.min(d.pz||0,T.pz)+" / "+T.pz+'</span></div><h3>Táctica</h3><p class="mute" style="font-size:13.5px">'+(Object.keys(S.ex).length?"Empieza por tus propios errores.":"Cinco puzzles cortos.")+'</p><div class="prog"><span style="width:'+Math.min(100,(d.pz||0)/T.pz*100)+'%"></span></div></button>'
   +'<button class="task'+(done("game")?" done":"")+'" id="tGame"><div class="row"><span class="ic">'+ICON.game+'</span><span class="sp"></span><span class="pill">'+Math.min(d.game||0,1)+' / 1</span></div><h3>Partida</h3><p class="mute" style="font-size:13.5px">Contra '+esc(ag.name)+" · nivel "+S.level+'.</p><div class="prog"><span style="width:'+Math.min(100,(d.game||0)*100)+'%"></span></div></button>'
   +'</div></div>'
   +'<div class="warm"><div><h3>Calentamiento antes de un torneo</h3><p class="mute">10 minutos: tus tres aperturas base, cinco puzzles fáciles y la consigna para jugar.</p></div><button class="btn main" id="hWarm">Calentar</button></div>'
   +'<div class="grid2"><div class="card"><div class="card-h"><h2>Consigna del día</h2></div><p style="font-size:17px;font-weight:600;color:var(--strong)">'+esc(cons.t)+'</p><p class="mute" style="font-size:13px;margin-top:6px">'+esc(cons.w)+'</p></div>'
   +'<div class="card"><div class="card-h"><h2>Tu estado</h2><span class="mute" style="font-size:13px">'+esc(S.user||"")+'</span></div><div class="stats">'
   +(rt.length?rt.slice(0,2).map(([k,v])=>'<div class="stat"><span class="lbl">'+({bullet:"Bullet",blitz:"Blitz",rapid:"Rápidas",classical:"Clásicas"}[k])+'</span><div class="v">'+v.r+(v.prov?"?":"")+"</div></div>").join(""):'<div class="stat"><span class="lbl">Lichess</span><div class="v">—</div></div>')
   +'<div class="stat"><span class="lbl">Analista</span><div class="v">'+S.level+' <small>'+A64.rank(S.level)+'</small></div></div></div><p class="mute" style="font-size:13px;margin-top:10px" id="hSync">'+esc(A64.syncMsg||(S.lastSync?"Partidas traídas "+A64.ago(S.lastSync)+".":"Todavía no traje tus partidas."))+'</p><button class="btn sm" id="hSyncB" style="margin-top:8px">Traer partidas de Lichess</button></div></div>'
   +(lg?'<div class="card"><div class="card-h"><h2>Última partida</h2><span class="mute">'+A64.ago(lg.date)+'</span></div><div class="row"><div style="min-width:0;flex:1"><b style="color:var(--strong)">'+esc(A64.opp(lg))+'</b><p class="mute" style="font-size:13.5px">'+({w:"Ganaste",l:"Perdiste",d:"Tablas"}[A64.myResult(lg)]||"")+(lg.opening?" · "+esc(lg.opening):"")+(lg.done&&lg.stats?" · "+lg.stats.errs+" error"+(lg.stats.errs===1?"":"es"):" · en análisis")+'</p></div><button class="btn" id="hLast">Revisar</button></div></div>':"");
  if($("#hTour",el))$("#hTour",el).onclick=()=>A64.go("revisar",{tour:tours[0].id});
  $("#tOp",el).onclick=()=>{const list=dueOps.length?dueOps.slice(0,T.op):nextNew?[nextNew]:A64.OPENINGS.slice(0,1);if(!dueOps.length&&nextNew)A64.go("aprender",{chapter:nextNew.id,step:"jugadas"});else A64.startSession(list.map(o=>({kind:"op",id:o.id})),"Plan del día · aperturas",()=>A64.go("inicio"))};
  $("#tPz",el).onclick=()=>A64.startSession([{kind:"pz",n:5}],"Plan del día · táctica",()=>A64.go("inicio"));
  $("#tGame",el).onclick=()=>A64.go("jugar");
  $("#hWarm",el).onclick=()=>{const base=["italiana","e5-italiana","rehusado"];A64.startSession([...base.map(id=>({kind:"op",id})),{kind:"pz",n:5,easy:true}],"Calentamiento",()=>{S.warmDone=Date.now();A64.save();A64.checkAch();const c2=A64.consignas().list[0];
    A64.go("inicio");A64.modal('<div class="modal-b"><p class="lbl">Listo para jugar</p><h2>Consigna para el torneo</h2><p style="font-size:18px;font-weight:600;color:var(--strong)">'+esc(c2.t)+'</p><p class="mute">Una sola idea en la cabeza. Si te sale eso, ya jugaste mejor que la última vez. ¡Suerte!</p><button class="btn main" data-close>Vamos</button></div>')})};
  $("#hSyncB",el).onclick=()=>{$("#hSyncB",el).disabled=true;A64.lichess.sync(m=>{A64.syncMsg=m;const s=$("#hSync",el);if(s)s.textContent=m}).then(()=>{if(A64.view==="inicio")home(el)})};
  if($("#hLast",el))$("#hLast",el).onclick=()=>A64.go("revisar",{game:lg.id});
}

/* ================= progreso ================= */
function weekKey(ts){const d=new Date(ts);d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return d.getTime()}
function progress(el){
  const c=A64.consignas(),gs=S.games.filter(g=>g.done&&g.color&&g.stats);
  const accOf=g=>g.color==="w"?g.accW:g.accB,acc=gs.slice(0,20).map(accOf).filter(x=>x!=null),accAvg=acc.length?acc.reduce((a,b)=>a+b,0)/acc.length:null;
  const errAvg=gs.slice(0,20).length?gs.slice(0,20).reduce((s,g)=>s+g.stats.errs,0)/gs.slice(0,20).length:null;
  const th={};gs.slice(0,30).forEach(g=>{for(const k in g.stats.themes)th[k]=(th[k]||0)+g.stats.themes[k]});const thE=Object.entries(th).sort((a,b)=>b[1]-a[1]);
  el.innerHTML='<div class="hello"><h1>Progreso</h1><p>Cómo venís, qué repetís y qué trabajar.</p></div>'
   +'<div class="card"><div class="card-h"><h2>Tres consignas para tu próxima partida</h2><span class="mute" style="font-size:13px">'+(c.n>=2?"según "+c.n+" partidas":"")+'</span></div><div class="grid3">'+c.list.map((x,i)=>'<div class="why"><span class="lbl" style="color:var(--acc)">Consigna '+(i+1)+'</span><p style="font-weight:600;color:var(--strong)">'+esc(x.t)+'</p><p class="mute" style="font-size:13px">'+esc(x.w)+"</p></div>").join("")+"</div></div>"
   +'<div class="stats"><div class="stat"><span class="lbl">Partidas analizadas</span><div class="v">'+gs.length+'</div></div><div class="stat"><span class="lbl">Precisión media</span><div class="v">'+(accAvg!=null?Math.round(accAvg)+" %":"—")+'</div></div><div class="stat"><span class="lbl">Errores por partida</span><div class="v">'+(errAvg!=null?errAvg.toFixed(1).replace(".",","):"—")+'</div></div><div class="stat"><span class="lbl">Puzzles resueltos</span><div class="v">'+(S.pzSolved||0)+'</div></div></div>'
   +'<div class="grid2"><div class="card"><div class="card-h"><h2>Errores por partida</h2><span class="mute" style="font-size:13px">por semana</span></div>'+chartErr(gs)+'</div><div class="card"><div class="card-h"><h2>Tu rating en Lichess</h2></div>'+chartRt()+'</div></div>'
   +'<div class="grid2"><div class="card"><div class="card-h"><h2>Lo que más fallás</h2></div>'+(thE.length?'<div class="bars">'+thE.slice(0,6).map(([k,v])=>'<div class="b"><span>'+esc(A64.THEME_NAME[k])+'</span><i style="width:'+(v/thE[0][1]*100)+'%"></i><b class="num">'+v+"</b></div>").join("")+"</div>":'<p class="mute">Aparece cuando haya partidas analizadas.</p>')+'</div>'
   +'<div class="card"><div class="card-h"><h2>Escalera del analista</h2><span class="pill acc">Nivel '+S.level+" · "+A64.rank(S.level)+'</span></div><div class="ladder">'+Array.from({length:30},(_,i)=>'<i class="'+(i<S.level?"on":"")+(i===S.level-1?" now":"")+'"></i>').join("")+'</div><div class="row" style="justify-content:space-between;margin-top:6px;font-size:12px" class="mute">'+A64.RANKS.map(r=>'<span class="mute">'+r+"</span>").join("")+'</div><p class="mute" style="font-size:13px;margin-top:8px">Nivel '+S.level+' equivale más o menos a '+A64.rating(S.level)+' de rating. Récord: nivel '+(S.maxLevel||S.level)+'.</p></div></div>'
   +'<div class="card"><div class="card-h"><h2>Logros</h2><span class="mute">'+Object.keys(S.ach).length+" / "+A64.ACH.length+'</span></div><div class="ach">'+A64.ACH.map(a=>'<div class="ac'+(S.ach[a.id]?" on":"")+'"><b>'+esc(a.t)+"</b><span>"+esc(a.d)+"</span>"+(S.ach[a.id]?'<span style="color:var(--acc);font-weight:600">Sellado '+new Date(S.ach[a.id]).toLocaleDateString("es-AR")+"</span>":"")+"</div>").join("")+"</div></div>"
   +'<div class="card"><div class="card-h"><h2>Respaldo</h2></div><p>Tus partidas de Lichess se vuelven a bajar siempre. Lo demás (aperturas practicadas, tarjetas, puzzles, nivel del analista) vive en este dispositivo. Descargá un respaldo y subilo a la carpeta <b>Archivo 64 › Respaldos</b> de tu Drive; para pasarlo al celu, cargalo desde ahí.</p><div class="row" style="margin-top:10px"><button class="btn main" id="bExp">Descargar respaldo</button><label class="btn" for="fImp">Cargar respaldo</label><input type="file" id="fImp" accept="application/json,.json" hidden></div><p class="mute" id="bkMsg" style="font-size:13px;margin-top:6px"></p></div>';
  $("#bExp",el).onclick=()=>{try{const data=Object.assign({},S,{games:S.games.map(g=>Object.assign({},g,{fens:null,ev:null,done:false}))});const blob=new Blob([JSON.stringify(data)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="archivo64-respaldo-"+A64.today()+".json";document.body.appendChild(a);a.click();a.remove();$("#bkMsg",el).textContent="Respaldo descargado. Subilo a Drive › Herramientas de IA › Archivo 64 › Respaldos."}catch(e){$("#bkMsg",el).textContent="No pude descargar el archivo desde acá."}};
  $("#fImp",el).onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(!d||!Array.isArray(d.games))throw 0;
    d.games=d.games.map(g=>{if(!g.fens&&g.moves){const rec=A64.buildRecord({id:g.id,source:g.source,sans:g.moves.map(m=>m.san),color:g.color,white:g.white,black:g.black,result:g.result,times:g.times,date:g.date,speed:g.speed,opening:g.opening,lichess:g.lichess,tour:g.tour,agent:g.agent,level:g.level,mode:g.mode});return rec||g}return g});
    Object.keys(S).forEach(k=>delete S[k]);Object.assign(S,d);A64.settings=S.settings;A64.save();A64.applySettings();$("#bkMsg",el).textContent="Respaldo cargado: "+S.games.length+" partidas. Las vuelvo a analizar de a una.";A64.bgAnalyze()}catch(x){$("#bkMsg",el).textContent="Ese archivo no es un respaldo de Archivo 64."}};r.readAsText(f)};
}
function chartErr(gs){const by={};gs.forEach(g=>{const k=weekKey(g.date);(by[k]=by[k]||[]).push(g.stats.errs)});const ks=Object.keys(by).map(Number).sort((a,b)=>a-b).slice(-8);
  if(!ks.length)return'<p class="mute">Aparece cuando haya partidas analizadas.</p>';
  const vals=ks.map(k=>by[k].reduce((a,b)=>a+b,0)/by[k].length),mx=Math.max(2,Math.ceil(Math.max(...vals))),W=320,H=120,L=22,bw=(W-L)/8;
  let s='<svg class="chart" viewBox="0 0 '+W+" "+(H+20)+'">';for(let y=0;y<=mx;y+=Math.max(1,Math.ceil(mx/4))){const yy=H-y/mx*H;s+='<line x1="'+L+'" x2="'+W+'" y1="'+yy+'" y2="'+yy+'" stroke="var(--line)"/><text x="0" y="'+(yy+4)+'">'+y+"</text>"}
  ks.forEach((k,i)=>{const v=vals[i],h=v/mx*H,x=L+i*bw+bw*.2;s+='<rect x="'+x+'" y="'+(H-h)+'" width="'+bw*.6+'" height="'+h+'" rx="2" fill="'+(i===ks.length-1?"#FF6A00":"#6f6a62")+'"/><text x="'+(x+bw*.3)+'" y="'+(H+14)+'" text-anchor="middle">'+new Date(k).toLocaleDateString("es-AR",{day:"numeric",month:"numeric"})+'</text><text x="'+(x+bw*.3)+'" y="'+(H-h-4)+'" text-anchor="middle" style="fill:var(--strong)">'+v.toFixed(1).replace(".",",")+"</text>"});return s+"</svg>"}
function chartRt(){
  const sp={};S.games.filter(g=>g.source==="lichess"&&g.color&&g.speed).forEach(g=>{const r=g.color==="w"?g.wr:g.br;if(r)(sp[g.speed]=sp[g.speed]||[]).push({t:g.date,r})});
  const keys=Object.keys(sp).filter(k=>sp[k].length>=2);if(!keys.length)return'<p class="mute">Aparece cuando traigas al menos dos partidas del mismo ritmo.</p>';
  const all=keys.flatMap(k=>sp[k]),lo=Math.floor((Math.min(...all.map(p=>p.r))-20)/50)*50,hi=Math.ceil((Math.max(...all.map(p=>p.r))+20)/50)*50,t0=Math.min(...all.map(p=>p.t)),t1=Math.max(...all.map(p=>p.t))||t0+1;
  const W=320,H=120,L=36,sx=t=>L+(t-t0)/Math.max(1,t1-t0)*(W-L-6),sy=r=>H-(r-lo)/Math.max(1,hi-lo)*H,COL={blitz:"#FF6A00",rapid:"#3fa3d6",bullet:"#d9a43b",classical:"#59b36b"};
  let s='<svg class="chart" viewBox="0 0 '+W+" "+(H+20)+'">';for(let r=lo;r<=hi;r+=Math.max(50,Math.round((hi-lo)/3/50)*50))s+='<line x1="'+L+'" x2="'+W+'" y1="'+sy(r)+'" y2="'+sy(r)+'" stroke="var(--line)"/><text x="0" y="'+(sy(r)+4)+'">'+r+"</text>";
  keys.forEach(k=>{const pts=sp[k].sort((a,b)=>a.t-b.t);s+='<path d="'+pts.map((p,i)=>(i?"L":"M")+sx(p.t).toFixed(1)+" "+sy(p.r).toFixed(1)).join(" ")+'" fill="none" stroke="'+COL[k]+'" stroke-width="2"/>';const lp=pts[pts.length-1];s+='<circle cx="'+sx(lp.t)+'" cy="'+sy(lp.r)+'" r="3.5" fill="'+COL[k]+'"/>'});
  s+='<text x="'+L+'" y="'+(H+15)+'">'+keys.map(k=>({blitz:"Blitz",rapid:"Rápidas",bullet:"Bullet",classical:"Clásicas"}[k])+" "+sp[k][sp[k].length-1].r).join(" · ")+"</text></svg>";return s}

A64.views.inicio={show:el=>home(el)};
A64.views.progreso={show:el=>progress(el)};
})();
