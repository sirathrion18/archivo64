/* Archivo 64 — logros (expedientes sellados) y desbloqueos. © 2026 Ignacio Dubois. Todos los derechos reservados. */
(function(){
"use strict";
const A64=window.A64,S=A64.S,$=A64.$,$$=A64.$$,esc=A64.esc;
S.cnt=S.cnt||{};S.unlocks=S.unlocks||[];S.mg=S.mg||{};S.mgDaily=S.mgDaily||{};S.achQ=S.achQ||[];
A64.count=(k,n)=>{S.cnt[k]=(S.cnt[k]||0)+(n==null?1:n);A64.save()};
A64.countMax=(k,v)=>{S.cnt[k]=Math.max(S.cnt[k]||0,v);A64.save()};
const C=k=>S.cnt[k]||0;

/* ---------- datos derivados ---------- */
const mine=()=>S.games.filter(g=>g.color);
const won=g=>A64.myResult(g)==="w";
const an=()=>S.games.filter(g=>g.source==="analista");
const li=()=>S.games.filter(g=>g.source==="lichess"&&g.color);
const done=()=>mine().filter(g=>g.done&&g.stats);
const accOf=g=>g.color==="w"?g.accW:g.accB;
const ratingMax=sp=>{let m=0;li().forEach(g=>{if(g.speed===sp){const r=g.color==="w"?g.wr:g.br;if(r>m)m=r}});const cur=(S.ratings||{})[sp];if(cur&&cur.r>m)m=cur.r;return m};
const tours=()=>A64.tourList?A64.tourList():[];
const box=(pre,min)=>Object.keys(S.srs).filter(k=>k.startsWith(pre)&&S.srs[k].box>=min).length;
const mg=(g,k)=>((S.mg[g]||{})[k])||0;
const dailies=()=>Object.values(S.mgDaily);

/* ---------- títulos y avatares ---------- */
A64.TITLES={pasante:"Pasante",tactico:"Ojo táctico",archivista:"Archivista de aperturas",estratega:"Estratega",finalista:"Especialista en finales",cartografo:"Cartógrafo",arcade:"Jugador arcade",inspector:"Inspector",jefe:"Jefe de sección",director:"Director de la oficina",torneista:"Torneísta",constante:"Constante",clasificado:"Agente clasificado"};
A64.AVATARS={ini:{name:"Iniciales"},n:{name:"Caballo",p:"n"},r:{name:"Torre",p:"r"},b:{name:"Alfil",p:"b"},q:{name:"Dama",p:"q"},k:{name:"Rey",p:"k"},p:{name:"Peón",p:"p"},ng:{name:"Caballo de oro",p:"n",gold:true},kg:{name:"Rey de oro",p:"k",gold:true}};
A64.avatarHTML=(cls)=>{const a=A64.AVATARS[S.avatar||"ini"]||A64.AVATARS.ini;const me=S.user||"Vos";
  if(!a.p)return'<span class="avatar '+(cls||"")+'">'+esc(me.slice(0,2).toUpperCase())+"</span>";
  return'<span class="avatar px '+(cls||"")+'">'+A64.pieceSVG(a.gold?"pixeloro":"pixel","w",a.p)+"</span>"};
A64.titleOf=()=>A64.TITLES[S.title||"pasante"]||"Pasante";

/* ---------- catálogo ---------- */
const L=[];
const R=(kind,id)=>({kind,id});
function tier(id,cat,name,unit,metric,needs,rewards){["b","s","g"].forEach((t,i)=>L.push({id:id+"-"+t,base:id,cat,name,tier:t,need:needs[i],metric,desc:unit.replace("{n}",needs[i]),reward:rewards&&rewards[i]||null}))}
function one(id,cat,name,desc,ok,reward,secret){L.push({id,cat,name,desc,ok,reward:reward||null,secret:!!secret})}
const CAT={tac:"Táctica",ape:"Aperturas y estrategia",fin:"Finales y coordenadas",mg:"Minijuegos",an:"Analista",li:"Lichess",con:"Constancia",sec:"Clasificados"};
A64.ACH_CATS=CAT;

/* Táctica */
tier("pz","tac","Puzzles resueltos","Resolver {n} puzzles a la primera.",()=>S.pzSolved||0,[10,50,200],[null,R("title","tactico"),R("board","marmol")]);
tier("pzr","tac","Racha táctica","Encadenar {n} puzzles seguidos sin fallar.",()=>Math.max(S.pzBest||0,S.pzStreak||0),[5,15,40]);
tier("exok","tac","Error corregido","Resolver {n} posiciones de tus propios errores.",()=>C("exOk"),[5,25,100]);
tier("lfm","tac","Aprendé de tus errores","Encontrar la jugada buena en {n} errores revisados.",()=>C("lfm"),[5,25,75]);
tier("clean","tac","Mano firme","{n} partidas de 20+ jugadas sin errores graves.",()=>done().filter(g=>g.stats.blunder===0&&g.stats.moves>=20).length,[1,10,30]);
tier("acc","tac","Precisión","{n} partidas con 80 % de precisión o más.",()=>done().filter(g=>(accOf(g)||0)>=80).length,[1,10,30],[null,null,R("pieces","oficina")]);
tier("nohang","tac","Nada colgado","{n} partidas sin dejar piezas colgadas.",()=>done().filter(g=>!g.stats.themes.hang&&g.stats.moves>=15).length,[3,15,50]);
/* Aperturas y estrategia */
tier("opp","ape","Línea perfecta","Practicar {n} aperturas sin un solo error.",()=>C("opPerfect"),[5,25,100],[null,R("title","archivista"),null]);
tier("opm","ape","Repertorio sólido","Tener {n} aperturas con 3 cuadraditos o más.",()=>box("op:",3),[3,8,17],[null,null,R("board","papel")]);
tier("ops","ape","Lector de aperturas","Recorrer jugada por jugada {n} aperturas.",()=>(S.opSeen||[]).length,[5,10,17]);
tier("opf","ape","Desde el libro","Jugar {n} partidas desde una apertura contra el analista.",()=>C("fromOp"),[3,10,30]);
tier("card","ape","Principios","Acordarte de {n} tarjetas de estrategia.",()=>C("cardOk"),[10,50,150],[null,R("title","estratega"),null]);
tier("cardm","ape","Principios grabados","Tener {n} tarjetas con 3 repasos acertados.",()=>box("card:",3),[5,15,24]);
/* Finales y coordenadas */
tier("endw","fin","Técnica de finales","Ganar {n} finales esenciales distintos.",()=>Object.keys(S.endWon||{}).length,[1,2,4],[null,null,R("title","finalista")]);
tier("endp","fin","Final eficiente","Ganar {n} finales en menos jugadas que la referencia.",()=>C("endPar"),[1,4,10]);
tier("cw","fin","Coordenadas con blancas","{n} casillas en 30 segundos con blancas.",()=>S.coordBest.w||0,[10,20,30],[null,null,R("title","cartografo")]);
tier("cb","fin","Coordenadas con negras","{n} casillas en 30 segundos con negras.",()=>S.coordBest.b||0,[10,20,30]);
tier("cr","fin","Mapa mental","Jugar {n} rondas de coordenadas.",()=>C("coordRuns"),[5,20,60]);
/* Minijuegos */
const MGN={ruta:"Ruta del caballo",peones:"Guerra de peones",mate:"Mate relámpago",come:"Comé todo",colgado:"¿Qué está colgado?",segura:"Casilla segura",contar:"Contá atacantes",dama:"Recorrido de la dama"};
A64.MG_NAMES=MGN;
const MGR={ruta:[R("avatar","n"),null,R("avatar","ng")],peones:[null,R("avatar","p"),null],dama:[null,R("avatar","q"),null],come:[null,R("avatar","r"),null],colgado:[null,null,R("board","cereza")],mate:[null,R("avatar","b"),null]};
for(const g in MGN){tier("mgw-"+g,"mg",MGN[g],"Ganar {n} veces.",()=>mg(g,"wins"),[5,25,100],MGR[g]);tier("mgl-"+g,"mg",MGN[g]+": nivel","Llegar al nivel {n}.",()=>mg(g,"maxLvl"),[4,7,10])}
tier("dly","mg","Desafío del día","Completar {n} desafíos del día.",()=>dailies().length,[7,30,100],[R("title","arcade"),R("pieces","pixeloro"),null]);
tier("dlyp","mg","Desafío perfecto","{n} desafíos del día resueltos perfecto.",()=>dailies().filter(d=>d.perfect).length,[5,20,60]);
/* Analista */
tier("anw","an","Victorias en la oficina","Ganarle {n} partidas al analista.",()=>an().filter(won).length,[1,10,50]);
tier("anl","an","Ascenso","Llegar al nivel {n} del analista.",()=>S.maxLevel||S.level,[10,20,30],[R("title","inspector"),R("title","jefe"),R("title","director")]);
for(const a of ["brizuela","lemos","quiroga","sosa"])tier("ag-"+a,"an",(A64.AGENTS[a]||{}).name||a,"Ganarle {n} veces.",()=>an().filter(g=>g.agent===a&&won(g)).length,[1,5,15],a==="sosa"?[null,null,R("avatar","k")]:null);
tier("ant","an","Modo torneo","Ganar {n} partidas en modo Torneo.",()=>an().filter(g=>g.mode==="torneo"&&won(g)).length,[1,5,20],[null,null,R("board","medianoche")]);
tier("anc","an","Contra reloj","Jugar {n} partidas con reloj contra el analista.",()=>an().filter(g=>g.clockLabel&&g.clockLabel!=="none").length,[5,25,100]);
/* Lichess */
tier("lig","li","Archivo de Lichess","Tener {n} partidas de Lichess analizadas.",()=>li().filter(g=>g.done).length,[10,50,200]);
tier("liw","li","Victorias en Lichess","Ganar {n} partidas en Lichess.",()=>li().filter(won).length,[5,25,100],[null,null,R("board","torneo")]);
tier("lirp","li","Rating en rápidas","Llegar a {n} en partidas rápidas.",()=>ratingMax("rapid"),[1100,1300,1500],[null,null,R("avatar","kg")]);
tier("libz","li","Rating en blitz","Llegar a {n} en blitz.",()=>ratingMax("blitz"),[1000,1200,1400]);
tier("lit","li","Torneísta","Jugar {n} torneos en Lichess.",()=>tours().length,[1,5,20],[null,R("title","torneista"),null]);
tier("lip","li","Puntos de torneo","Sumar {n} puntos en torneos de Lichess.",()=>tours().reduce((s,t)=>s+t.pts,0),[5,20,60]);
tier("lia","li","Precisión en Lichess","{n} partidas de Lichess con 75 % de precisión o más.",()=>li().filter(g=>g.done&&(accOf(g)||0)>=75).length,[1,10,30]);
/* Constancia */
tier("str","con","Racha","Entrenar {n} días seguidos.",()=>Math.max(A64.streak(),S.bestStreak||0),[3,7,30],[null,R("title","constante"),R("pieces","madera")]);
tier("days","con","Días en la oficina","Entrenar {n} días en total.",()=>(S.days||[]).length+(S.daysOld||0),[7,30,100]);
tier("plan","con","Plan cumplido","Completar el plan del día {n} veces.",()=>C("planDays"),[3,15,60],[null,null,R("board","naranja")]);
tier("warm","con","Previa de torneo","Hacer el calentamiento {n} veces.",()=>C("warm"),[1,5,20]);
/* Únicos */
for(const e of A64.ENDGAMES)one("end-"+e.id,"fin",e.name,"Ganarlo contra el analista.",()=>!!(S.endWon||{})[e.id]);
one("share","mg","Para el grupo","Compartir el resultado de un desafío del día.",()=>C("share")>0);
one("deco","con","Decorador","Cambiar el tablero y las piezas en Ajustes.",()=>C("deco")>0);
one("firsttour","li","Primer torneo","Jugar tu primer torneo de Lichess.",()=>tours().length>0);
one("allag","an","Toda la oficina","Ganarle a los cuatro agentes.",()=>["brizuela","lemos","quiroga","sosa"].every(a=>an().some(g=>g.agent===a&&won(g))),R("title","clasificado"));
one("lvlup","an","Primer ascenso","Que el analista te suba de nivel.",()=>(S.maxLevel||0)>(S.startLevel||S.maxLevel||0));
one("allmg","mg","Arcade completo","Ganar los ocho minijuegos al menos una vez.",()=>Object.keys(MGN).every(g=>mg(g,"wins")>0));
/* Clasificados (secretos) */
const last=g=>g.moves&&g.moves[g.moves.length-1];
const myLastMate=(g,f)=>won(g)&&last(g)&&last(g).san.includes("#")&&last(g).color===g.color&&f(last(g),g);
one("sec-n","sec","Coz final","Ganar dando mate con un caballo.",()=>mine().some(g=>myLastMate(g,m=>m.piece==="n")),null,true);
one("sec-p","sec","Dama nueva","Ganar una partida en la que coronaste un peón.",()=>mine().some(g=>won(g)&&g.moves&&g.moves.some(m=>m.color===g.color&&m.promotion)),null,true);
one("sec-ooo","sec","Del otro lado","Ganar después de enrocar largo.",()=>mine().some(g=>won(g)&&g.moves&&g.moves.some(m=>m.color===g.color&&m.flags&&m.flags.includes("q"))),null,true);
one("sec-br","sec","El pasillo","Ganar con mate del pasillo.",()=>mine().some(g=>myLastMate(g,m=>"rq".includes(m.piece)&&(m.to[1]==="1"||m.to[1]==="8"))),null,true);
one("sec-fast","sec","Expediente express","Ganar en 20 jugadas o menos.",()=>mine().some(g=>won(g)&&g.moves&&g.moves.length<=40&&g.moves.length>=10),null,true);
one("sec-back","sec","Remontada","Ganar una partida en la que estuviste perdido.",()=>done().some(g=>won(g)&&g.ev&&g.ev.some(e=>e&&A64.povWin(e,g.color)<=20)),null,true);
one("sec-stale","sec","Ahogado salvador","Conseguir tablas por ahogado.",()=>mine().some(g=>g.status==="stalemate"||g.endText==="stalemate"),null,true);
one("sec-long","sec","Maratón","Jugar una partida de 80 jugadas o más.",()=>mine().some(g=>g.moves&&g.moves.length>=160),null,true);
one("sec-early","sec","Madrugador","Entrenar antes de las 7 de la mañana.",()=>!!S.flags.early,null,true);
one("sec-night","sec","Trasnochado","Entrenar entre la 1 y las 5 de la mañana.",()=>!!S.flags.night,null,true);
one("sec-weekend","sec","Fin de semana completo","Entrenar sábado y domingo del mismo fin de semana.",()=>{const d=new Set(S.days||[]);return [...d].some(t=>new Date(t).getDay()===6&&d.has(t+864e5))},null,true);
one("sec-pawn","sec","Muralla","Ganar la guerra de peones sin perder ningún peón.",()=>!!S.flags.pawnPerfect,null,true);
one("sec-giant","sec","Matagigantes","Ganarle en Lichess a alguien con 150 puntos más de rating.",()=>li().some(g=>won(g)&&((g.color==="w"?g.br-g.wr:g.wr-g.br)>=150)),R("pieces","pixeloro"),true);
one("sec-coord","sec","GPS humano","35 casillas en 30 segundos.",()=>Math.max(S.coordBest.w||0,S.coordBest.b||0)>=35,null,true);
one("sec-7","sec","Semana arcade","Siete desafíos del día seguidos.",()=>{let n=0;for(let i=0;i<7;i++){const d=new Date(Date.now()-i*864e5);const k=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");if(S.mgDaily[k])n++}return n>=7},null,true);
A64.ACH2=L;

/* ---------- desbloqueos ---------- */
A64.unlocked=(kind,id)=>{if(kind==="board"&&!(A64.BOARD_THEMES[id]||{}).lock)return true;if(kind==="pieces"&&!(A64.PIECE_SETS[id]||{}).lock)return true;if(kind==="title"&&id==="pasante")return true;if(kind==="avatar"&&id==="ini")return true;return S.unlocks.includes(kind+":"+id)};
A64.rewardFor=(kind,id)=>L.find(a=>a.reward&&a.reward.kind===kind&&a.reward.id===id);
A64.rewardName=r=>r.kind==="board"?"Tablero "+A64.BOARD_THEMES[r.id].name:r.kind==="pieces"?"Piezas "+A64.PIECE_SETS[r.id].name:r.kind==="title"?"Título «"+A64.TITLES[r.id]+"»":"Avatar "+A64.AVATARS[r.id].name;
A64.achProg=a=>{if(a.ok)return{v:a.ok()?1:0,need:1,pct:a.ok()?100:0};const v=a.metric();return{v,need:a.need,pct:Math.min(100,v/a.need*100)}};
const TIERN={b:"Bronce",s:"Plata",g:"Oro"};A64.TIERN=TIERN;

/* ---------- control ---------- */
A64.inGame=()=>A64.view==="jugar"&&A64.views.jugar&&A64.views.jugar.active&&A64.views.jugar.active();
A64.checkAch=()=>{
  S.maxLevel=Math.max(S.maxLevel||0,S.level);if(S.startLevel==null)S.startLevel=S.level;
  S.bestStreak=Math.max(S.bestStreak||0,A64.streak());
  const h=new Date().getHours();if(h<7&&h>=5)S.flags.early=true;if(h>=1&&h<5)S.flags.night=true;
  const first=S.achV!==3,fresh=[];
  for(const a of L){if(S.ach[a.id])continue;let ok=false;try{ok=a.ok?a.ok():a.metric()>=a.need}catch(e){}
    if(ok){S.ach[a.id]=Date.now();if(a.reward&&!S.unlocks.includes(a.reward.kind+":"+a.reward.id))S.unlocks.push(a.reward.kind+":"+a.reward.id);fresh.push(a.id)}}
  if(first){S.achV=3;A64.save();if(fresh.length)setTimeout(()=>A64.modal('<div class="modal-b"><p class="lbl">Expedientes</p><h2>Abrimos tus expedientes</h2><p>Con lo que ya hiciste en Archivo 64 tenés <b>'+fresh.length+'</b> sellos de entrada. Hay '+L.length+' en total, algunos clasificados.</p><button class="btn main" id="mAch">Ver expedientes</button></div>',b=>{$("#mAch",b).onclick=()=>{A64.closeModal();A64.go("progreso",{tab:"exp"})}}),900);return}
  if(!fresh.length){A64.save();return}
  S.achQ.push(...fresh);A64.save();
  if(!A64.inGame()){const a=L.find(x=>x.id===fresh[0]);stamp(a,fresh.length);A64.Sound.ok()}
};
function stamp(a,n){const t=document.createElement("div");t.className="toast stamp";t.innerHTML='<span class="seal s-'+(a.tier||"u")+'">'+(a.tier?TIERN[a.tier][0]:"★")+'</span><span><b>'+esc(a.secret?"Clasificado: "+a.name:a.name)+(a.tier?" · "+TIERN[a.tier]:"")+"</b>"+(n>1?" y "+(n-1)+" más":"")+"</span>";$("#toasts").appendChild(t);setTimeout(()=>t.remove(),3200)}
/* resumen al terminar una actividad */
A64.achSummaryHTML=()=>{const q=[...new Set(S.achQ)].map(id=>L.find(a=>a.id===id)).filter(Boolean);if(!q.length)return"";
  return'<div class="sealed"><p class="lbl">Expedientes sellados</p>'+q.map(a=>'<div class="srow"><span class="seal s-'+(a.tier||"u")+'">'+(a.tier?TIERN[a.tier][0]:"★")+'</span><span><b>'+esc(a.name)+(a.tier?" · "+TIERN[a.tier]:"")+"</b><br><small class='mute'>"+esc(a.desc)+"</small>"+(a.reward?"<br><small style='color:var(--acc)'>Desbloqueaste: "+esc(A64.rewardName(a.reward))+"</small>":"")+"</span></div>").join("")+"</div>"};
A64.flushAch=(force)=>{if(!S.achQ.length)return;const html=A64.achSummaryHTML();const many=S.achQ.length>=2||S.achQ.some(id=>{const a=L.find(x=>x.id===id);return a&&a.reward});S.achQ=[];A64.save();
  if(many||force)A64.modal('<div class="modal-b"><h2>Buen trabajo</h2>'+html+'<div class="row"><button class="btn main" data-close>Seguir</button><button class="btn" id="mExp">Ver expedientes</button></div></div>',b=>{$("#mExp",b).onclick=()=>{A64.closeModal();A64.go("progreso",{tab:"exp"})}})};

/* ---------- racha con un día de gracia por semana ---------- */
A64.streak=()=>{const set=new Set(S.days||[]);const d=new Date();d.setHours(0,0,0,0);let t=d.getTime();if(!set.has(t))t-=864e5;let n=0;const grace=new Set();
  for(let i=0;i<400;i++){if(set.has(t)){n++;t-=864e5;continue}const wk=Math.floor((t/864e5+3)/7);if(grace.has(wk))break;grace.add(wk);t-=864e5;if(!set.has(t))break}
  return n};

/* ---------- vitrina: expedientes ---------- */
A64.renderExpedientes=(el)=>{
  const cats=Object.keys(CAT);let open=A64._expOpen||null;
  function draw(){
    const tot=L.length,got=L.filter(a=>S.ach[a.id]).length;
    let h='<div class="card"><div class="card-h"><h2>Expedientes sellados</h2><span class="pill acc">'+got+" / "+tot+'</span></div><div class="prog"><span style="width:'+(got/tot*100)+'%"></span></div><p class="mute" style="font-size:13px;margin-top:8px">Bronce, plata y oro por habilidad. Los clasificados se revelan cuando los conseguís. Varios desbloquean tableros, piezas, títulos y avatares.</p></div><div class="folders">';
    for(const c of cats){const list=L.filter(a=>a.cat===c),g=list.filter(a=>S.ach[a.id]).length;
      h+='<button class="folder'+(open===c?" open":"")+'" data-c="'+c+'"><span class="tabf"></span><span class="fl">'+esc(CAT[c])+'</span><span class="fn num">'+g+" / "+list.length+'</span><span class="prog"><span style="width:'+(g/list.length*100)+'%"></span></span></button>'}
    h+="</div>";
    if(open){const list=L.filter(a=>a.cat===open);h+='<div class="card"><div class="card-h"><h2>'+esc(CAT[open])+'</h2><button class="btn sm ghost" id="expClose">Cerrar</button></div><div class="stamps">';
      const groups={};list.forEach(a=>{const k=a.base||a.id;(groups[k]=groups[k]||[]).push(a)});
      for(const k in groups){const gs=groups[k],a0=gs[0];
        if(a0.secret&&!S.ach[a0.id]){h+='<div class="stampc locked"><span class="seal s-x">?</span><div><b>Expediente clasificado</b><small class="mute">Se revela cuando lo conseguís.</small></div></div>';continue}
        const next=gs.find(a=>!S.ach[a.id]),cur=next||gs[gs.length-1],pr=A64.achProg(cur);
        h+='<div class="stampc'+(next?"":" full")+'"><span class="seals">'+gs.map(a=>'<span class="seal s-'+(a.tier||"u")+(S.ach[a.id]?"":" off")+'" title="'+esc((a.tier?TIERN[a.tier]+": ":"")+a.desc)+'">'+(a.tier?TIERN[a.tier][0]:"★")+"</span>").join("")+'</span><div><b>'+esc(a0.name)+"</b><small>"+esc(cur.desc)+"</small>"+(next&&!cur.ok?'<span class="prog"><span style="width:'+pr.pct+'%"></span></span><small class="mute num">'+Math.min(pr.v,pr.need)+" / "+pr.need+"</small>":"")+(cur.reward?'<small style="color:var(--acc)">Premio: '+esc(A64.rewardName(cur.reward))+(A64.unlocked(cur.reward.kind,cur.reward.id)?" ✓":"")+"</small>":"")+"</div></div>"}
      h+="</div></div>"}
    el.innerHTML=h;
    $$("[data-c]",el).forEach(b=>b.onclick=()=>{open=open===b.dataset.c?null:b.dataset.c;A64._expOpen=open;draw()});
    if($("#expClose",el))$("#expClose",el).onclick=()=>{open=null;A64._expOpen=null;draw()};
  }
  draw();
};
})();
