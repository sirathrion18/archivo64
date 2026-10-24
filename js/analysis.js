/* Archivo 64 — análisis. © 2026 Ignacio Dubois. Todos los derechos reservados. */
(function(){
"use strict";
const A64=window.A64=window.A64||{};
const FILES="abcdefgh",MATE=100000,PV={p:100,n:310,b:330,r:500,q:900,k:20000};
const NAME={p:"peón",n:"caballo",b:"alfil",r:"torre",q:"dama",k:"rey"};
const ART={p:"el peón",n:"el caballo",b:"el alfil",r:"la torre",q:"la dama",k:"el rey"};
const UN={p:"un peón",n:"un caballo",b:"un alfil",r:"una torre",q:"la dama",k:"el rey"};
const TU={p:"tu peón",n:"tu caballo",b:"tu alfil",r:"tu torre",q:"tu dama",k:"tu rey"};
A64.NAME=NAME;A64.ART=ART;A64.UN=UN;A64.TU=TU;

/* ---------- números ---------- */
A64.winPct=function(ev){if(!ev)return 50;if(ev.mate!=null&&ev.mate!==0)return ev.mate>0?100:0;if(ev.mate===0)return ev.cp>0?100:0;
  const cp=Math.max(-1500,Math.min(1500,ev.cp));return 50+50*(2/(1+Math.exp(-0.00368208*cp))-1)};
A64.povWin=function(ev,color){const w=A64.winPct(ev);return color==="w"?w:100-w};
A64.moveAcc=function(before,after,color){const d=Math.max(0,A64.povWin(before,color)-A64.povWin(after,color));return Math.max(0,Math.min(100,103.1668*Math.exp(-0.04354*d)-3.1669))};
A64.classify=function(before,after,move,bestUci){
  if(!before||!after)return null;
  if(bestUci&&bestUci.slice(0,4)===move.from+move.to)return"best";
  const d=A64.povWin(before,move.color)-A64.povWin(after,move.color);
  if(d>=15)return"blunder";if(d>=10)return"mistake";if(d>=5)return"inacc";return"good"};
A64.VERD={best:{t:"Mejor",c:"v-best",mk:""},good:{t:"Buena",c:"v-good",mk:""},inacc:{t:"Imprecisión",c:"v-inacc",mk:"?!"},mistake:{t:"Error",c:"v-mistake",mk:"?"},blunder:{t:"Error grave",c:"v-blunder",mk:"??"},miss:{t:"Oportunidad perdida",c:"v-miss",mk:"⌀"}};
A64.fmtEval=function(ev){if(!ev)return"…";if(ev.mate!=null)return ev.mate===0?"#":(ev.mate>0?"+":"−")+"M"+Math.abs(ev.mate);const v=ev.cp/100;return(v>0?"+":v<0?"−":"")+Math.abs(v).toFixed(1)};
A64.evalWords=function(ev,me){
  if(!ev)return"Calculando…";
  const side=c=>me?(c===me?"vos":"el rival"):(c==="w"?"las blancas":"las negras");
  if(ev.mate!=null)return ev.mate===0?"Jaque mate.":"Mate en "+Math.abs(ev.mate)+" para "+side(ev.mate>0?"w":"b")+".";
  const a=Math.abs(ev.cp),who=side(ev.cp>0?"w":"b"),ven=me?(who==="vos"?"tenés":"tiene"):"tienen";
  if(a<40)return"Posición pareja.";if(a<120)return"Ventaja leve: "+who+" "+ven+" algo más de juego.";if(a<300)return"Ventaja clara para "+who+".";if(a<700)return"Ventaja grande para "+who+", como una pieza de más.";return"Ventaja decisiva para "+who+"."};

/* ---------- notación ---------- */
A64.figSan=function(san,color){
  const s=A64.settings||{};
  if(s.notation==="es")return san.replace(/[NBRQK]/g,x=>({N:"C",B:"A",R:"T",Q:"D",K:"R"})[x]);
  const F=A64.FIG[color||"w"];return san.replace(/^([NBRQK])/,x=>F[x.toLowerCase()]).replace(/=([NBRQ])/,(_,x)=>"="+F[x.toLowerCase()]);
};
A64.describeMove=function(m){
  if(!m)return"";let t;
  if(m.flags.includes("k"))t="Enroque corto: el rey va a "+m.to+" y la torre se pone al lado.";
  else if(m.flags.includes("q"))t="Enroque largo: el rey va a "+m.to+" y la torre se pone al lado.";
  else{t=NAME[m.piece][0].toUpperCase()+NAME[m.piece].slice(1)+" de "+m.from+(m.captured?" come en "+m.to+" ("+UN[m.captured]+")":" a "+m.to);if(m.promotion)t+=" y corona dama";t+="."}
  if(m.san.includes("#"))t+=" Jaque mate.";else if(m.san.includes("+"))t+=" Da jaque.";return t};
A64.uciMove=function(fen,uci){if(!uci)return null;try{return new Chess(fen).move({from:uci.slice(0,2),to:uci.slice(2,4),promotion:uci[4]||"q"})}catch(e){return null}};
const F=x=>A64.figSan(x.san,x.color);A64.F=F;
A64.fenAfter=function(fen,mv){const c=new Chess(fen);c.move({from:mv.from,to:mv.to,promotion:mv.promotion||"q"});return c.fen()};
A64.pvSan=function(fen,pv,n){const c=new Chess(fen),out=[];for(const u of (pv||[]).slice(0,n||4)){const m=c.move({from:u.slice(0,2),to:u.slice(2,4),promotion:u[4]||"q"});if(!m)break;out.push(m)}return out};

/* ---------- geometría ---------- */
function board(fen){const g={};const rows=fen.split(" ")[0].split("/");rows.forEach((row,ri)=>{let f=0;for(const c of row){if(/\d/.test(c))f+=+c;else{g[FILES[f]+(8-ri)]={type:c.toLowerCase(),color:c===c.toUpperCase()?"w":"b"};f++}}});return g}
const on=(f,r)=>f>=0&&f<8&&r>=0&&r<8,sqn=(f,r)=>FILES[f]+(r+1);
function attacks(g,from){const p=g[from];if(!p)return[];const f=FILES.indexOf(from[0]),r=+from[1]-1,out=[];
  const ray=(df,dr)=>{let x=f+df,y=r+dr;while(on(x,y)){const s=sqn(x,y);out.push(s);if(g[s])break;x+=df;y+=dr}};
  if(p.type==="p"){const d=p.color==="w"?1:-1;[[-1,d],[1,d]].forEach(([a,b])=>{if(on(f+a,r+b))out.push(sqn(f+a,r+b))})}
  else if(p.type==="n")[[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]].forEach(([a,b])=>{if(on(f+a,r+b))out.push(sqn(f+a,r+b))});
  else if(p.type==="k")[[1,1],[1,0],[1,-1],[0,1],[0,-1],[-1,1],[-1,0],[-1,-1]].forEach(([a,b])=>{if(on(f+a,r+b))out.push(sqn(f+a,r+b))});
  else{if(p.type!=="r")[[1,1],[1,-1],[-1,1],[-1,-1]].forEach(d=>ray(...d));if(p.type!=="b")[[1,0],[-1,0],[0,1],[0,-1]].forEach(d=>ray(...d))}
  return out}
function attackers(g,sq,color){return Object.keys(g).filter(s=>g[s].color===color&&attacks(g,s).includes(sq))}
A64.attackers=(fen,sq,color)=>attackers(board(fen),sq,color);
/* piezas colgadas de un color: atacadas y sin defensa, o atacadas por algo más barato */
A64.hanging=function(fen,color){const g=board(fen),opp=color==="w"?"b":"w",out=[];
  for(const s in g){const p=g[s];if(p.color!==color||p.type==="k")continue;const at=attackers(g,s,opp);if(!at.length)continue;
    const cheapest=Math.min(...at.map(a=>PV[g[a].type]));const def=attackers(g,s,color);
    if(!def.length||cheapest<PV[p.type])out.push({sq:s,type:p.type})}
  return out.sort((a,b)=>PV[b.type]-PV[a.type])};
function rays(g,from){const p=g[from];if(!p||!"bqr".includes(p.type))return[];const f=FILES.indexOf(from[0]),r=+from[1]-1,dirs=[];
  if(p.type!=="r")dirs.push([1,1],[1,-1],[-1,1],[-1,-1]);if(p.type!=="b")dirs.push([1,0],[-1,0],[0,1],[0,-1]);
  return dirs.map(([df,dr])=>{const line=[];let x=f+df,y=r+dr;while(on(x,y)){const s=sqn(x,y);if(g[s])line.push(s);if(line.length===2)break;x+=df;y+=dr}return line})}

/* ---------- temas tácticos ---------- */
/* Explica qué permite la jugada del jugador: fenB = antes, m = su jugada, evA = evaluación después (con pv). */
A64.punish=function(fenB,m,evA){
  const me=m.color,opp=me==="w"?"b":"w",fenA=A64.fenAfter(fenB,m);
  if(evA&&evA.mate!=null&&evA.mate!==0&&Math.sign(evA.mate)===(opp==="w"?1:-1)){
    const line=A64.pvSan(fenA,evA.pv,Math.min(6,Math.abs(evA.mate)*2-1)),last=line[line.length-1];
    let k="mate",txt="Le dejaste al rival un mate en "+Math.abs(evA.mate)+".";
    if(last&&"rq".includes(last.piece)&&(last.to[1]==="1"||last.to[1]==="8"))txt+=" Es un mate del pasillo: tu rey quedó encerrado detrás de sus propios peones.";
    return{key:k,theme:Math.abs(evA.mate)===1?"Mate en 1":"Mate",text:txt,reply:line[0],line}}
  const reply=evA&&evA.pv&&evA.pv[0]?A64.uciMove(fenA,evA.pv[0]):null;
  if(!reply)return{key:"pos",theme:"Posición",text:"Tu posición empeora."};
  const fenR=A64.fenAfter(fenA,reply),gR=board(fenR),gA=board(fenA),line=A64.pvSan(fenA,evA.pv,4);
  /* horquilla: la pieza que movió el rival ataca dos cosas tuyas */
  const tg=attacks(gR,reply.to).filter(s=>gR[s]&&gR[s].color===me&&(gR[s].type==="k"||PV[gR[s].type]>PV[reply.piece]||(PV[gR[s].type]>=300&&!attackers(gR,s,me).length)));
  let tg2=tg;if(tg.length<2){const loose=attacks(gR,reply.to).filter(s=>gR[s]&&gR[s].color===me&&gR[s].type!=="k"&&!attackers(gR,s,me).length);if(loose.length>=2&&loose.some(s=>PV[gR[s].type]>=300))tg2=loose}
  if(tg2.length>=2){const names=tg2.map(s=>TU[gR[s].type]+" de "+s);
    return{key:"fork",theme:reply.piece==="n"?"Horquilla de caballo":reply.piece==="p"?"Horquilla de peón":"Ataque doble",text:"Después de "+F(reply)+", "+ART[reply.piece]+" rival ataca a la vez "+names.join(" y ")+". No podés salvar las dos cosas.",reply,line,targets:tg2}}
  /* captura: te comen algo que quedó sin defensa o mal defendido */
  if(reply.captured){const def=attackers(gR,reply.to,me),moved=reply.to===m.to;
    if(!def.length||PV[reply.captured]>PV[reply.piece]+50){
      return{key:"hang",theme:"Pieza colgada",text:(moved?"La pieza que moviste":ART[reply.captured][0].toUpperCase()+ART[reply.captured].slice(1)+" de "+reply.to)+" quedó "+(def.length?"mal defendida":"sin defensa")+": el rival juega "+F(reply)+" y se "+(reply.captured==="r"||reply.captured==="q"?"la":"lo")+" come"+(def.length?" ganando material en el cambio":"")+".",reply,line}}}
  /* clavada o ensartada creada por la respuesta */
  for(const ln of rays(gR,reply.to)){if(ln.length<2)continue;const a=gR[ln[0]],b=gR[ln[1]];if(a.color!==me||b.color!==me)continue;
    if((b.type==="k"&&a.type!=="p")||(PV[a.type]>=300&&PV[b.type]>PV[a.type]))return{key:"pin",theme:"Clavada",text:"Con "+F(reply)+" el rival clava "+TU[a.type]+" de "+ln[0]+": si se mueve, queda expuesto "+TU[b.type]+" de "+ln[1]+". Una pieza clavada no se puede defender bien.",reply,line};
    if((a.type==="k"||a.type==="q")&&PV[b.type]<PV[a.type])return{key:"skewer",theme:"Ensartada",text:"Con "+F(reply)+" el rival ataca "+TU[a.type]+" y, detrás en la misma línea, "+TU[b.type]+" de "+ln[1]+". Cuando "+(a.type==="k"?"el rey":"la dama")+" se corra, cae lo de atrás.",reply,line}}
  /* ataque descubierto */
  for(const s in gR){const p=gR[s];if(p.color!==opp||s===reply.to||!"bqr".includes(p.type))continue;
    for(const ln of rays(gR,s)){const t=ln[0]&&gR[ln[0]];if(!t||t.color!==me||(t.type!=="k"&&PV[t.type]<300))continue;
      if(!attacks(gA,s).includes(ln[0])&&attacks(gR,s).includes(ln[0]))return{key:"disc",theme:"Ataque descubierto",text:"Al mover "+ART[reply.piece]+" con "+F(reply)+", el rival destapa "+ART[p.type]+" de "+s+" contra "+TU[t.type]+" de "+ln[0]+". Son dos amenazas en una jugada.",reply,line}}}
  if(reply.san.includes("+"))return{key:"check",theme:"Jaque peligroso",text:"Le abriste al rival un jaque con "+F(reply)+" que te complica: "+line.slice(1,3).map(F).join(", ")+"…",reply,line};
  /* lo que se perdió: había algo mejor */
  return{key:"pos",theme:"Posición",text:"No regalaste material enseguida, pero tu posición empeora: el rival sigue con "+line.slice(0,3).map(F).join(" ")+" y queda mejor.",reply,line}};

/* Por qué la mejor jugada era mejor */
A64.bestReason=function(fenB,evB,me){
  const best=evB&&evB.best?A64.uciMove(fenB,evB.best):null;if(!best)return null;
  const gB=board(fenB),fenX=A64.fenAfter(fenB,best),gX=board(fenX),opp=me==="w"?"b":"w";
  let why;
  if(evB.mate!=null&&evB.mate!==0&&Math.sign(evB.mate)===(me==="w"?1:-1))why="Había mate en "+Math.abs(evB.mate)+": "+A64.pvSan(fenB,evB.pv,Math.abs(evB.mate)*2-1).map(F).join(" ")+".";
  else if(best.captured&&(!attackers(gX,best.to,opp).length||PV[best.captured]>=PV[best.piece]))why="Comía "+UN[best.captured]+" en "+best.to+(attackers(gB,best.to,opp).length?" ganando material":" gratis")+".";
  else{
    const tg=attacks(gX,best.to).filter(s=>gX[s]&&gX[s].color===opp&&(gX[s].type==="k"||PV[gX[s].type]>PV[best.piece]||(PV[gX[s].type]>=300&&!attackers(gX,s,opp).length)));
    const hangB=A64.hanging(fenB,me).find(h=>h.sq===best.from);
    if(tg.length>=2)why="Era una horquilla: "+ART[best.piece]+" atacaba a la vez "+tg.map(s=>NAME[gX[s].type]+" de "+s).join(" y ")+".";
    else if(hangB)why="Salvaba "+TU[best.piece]+", que estaba atacado en "+best.from+".";
    else if(best.san.includes("+"))why="Daba jaque y ganaba tiempo: seguía "+A64.pvSan(fenB,evB.pv,3).slice(1).map(F).join(" ")+".";
    else{const hangs=A64.hanging(fenB,me);if(hangs.length&&!A64.hanging(fenX,me).some(h=>h.sq===hangs[0].sq))why="Defendía "+TU[hangs[0].type]+" de "+hangs[0].sq+", que estaba en peligro.";
      else if(best.flags.includes("k")||best.flags.includes("q"))why="Enrocaba y ponía el rey a salvo.";
      else{const mine=(me==="w"?1:-1)*evB.cp;why="Mantenía "+(mine>60?"tu ventaja":mine<-60?"tu posición lo más firme posible":"la posición pareja")+". Seguía "+A64.pvSan(fenB,evB.pv,4).map(F).join(" ")+"."}}}
  return{move:best,why}};

/* Consejo para la próxima según el tema */
A64.TIP={
 mate:"Antes de cada jugada, mirá todos los jaques que tiene el rival. Si alguno es mate, eso va primero.",
 hang:"Antes de soltar la pieza, revisá: ¿quién la ataca y quién la defiende? Contá atacantes y defensores.",
 fork:"Fijate a qué casillas pueden saltar los caballos y peones rivales: si una casilla ataca dos piezas tuyas, cubrila.",
 pin:"Evitá dejar piezas valiosas en la misma línea que el rey o la dama cuando hay alfiles o torres rivales mirando.",
 skewer:"Cuidado con el rey y la dama en la misma fila, columna o diagonal: una sola pieza rival puede atacar a los dos.",
 disc:"Cuando una pieza rival tapa a un alfil, torre o dama, preguntate qué pasa si se mueve.",
 check:"Antes de mover, mirá qué jaques le quedan al rival después de tu jugada.",
 pos:"Si no hay nada concreto, mejorá tu peor pieza: centralizala, desarrollala o enrocá.",
 miss:"Después de cada jugada rival, preguntate: ¿dejó algo sin defender? ¿hay un jaque o una captura buena para mí?"};

/* Explicación completa, estilo Ferreyra: exigente pero sin hundirte, y detallada. */
A64.explain=function(o){/* o: {fenB, move, evB, evA, verdict, me, oppVerdictBefore} */
  const m=o.move,me=o.me||m.color,fig=x=>A64.figSan(x.san,x.color);
  const out={paras:[],arrows:[],theme:null,key:null};
  const br=A64.bestReason(o.fenB,o.evB,me);
  if(o.verdict==="best"||o.verdict==="good"){
    out.short=o.verdict==="best"?"Justo la que había que jugar.":"Bien: no regalaste nada.";
    out.paras.push(A64.describeMove(m)+" "+(o.verdict==="best"?"Es la jugada que elige el motor.":"Sirve: la posición sigue igual que antes."));
    if(o.verdict==="good"&&br&&br.move.san!==m.san)out.paras.push("También estaba "+fig(br.move)+": "+br.why);
    return out}
  if(o.miss){
    out.key="miss";out.theme="Oportunidad perdida";
    out.short="El rival se había equivocado y no lo aprovechaste.";
    out.paras.push("La jugada anterior del rival fue un error, y la tuya no lo castigó. "+(br?"Con "+fig(br.move)+" ganabas: "+br.why:""));
    if(br)out.arrows.push({from:br.move.from,to:br.move.to,color:"green"});out.arrows.unshift({from:m.from,to:m.to,color:"red"});
    out.paras.push("Para la próxima: "+A64.TIP.miss);return out}
  const pu=A64.punish(o.fenB,m,o.evA);out.key=pu.key;out.theme=pu.theme;
  out.short=pu.text;
  out.paras.push("Jugaste "+fig(m)+". "+A64.describeMove(m));
  out.paras.push("El problema: "+pu.text+(pu.line&&pu.line.length>1&&pu.key!=="mate"?" La línea sigue "+pu.line.map(fig).join(" ")+".":""));
  if(br)out.paras.push("Lo correcto era "+fig(br.move)+" (flecha verde). "+br.why);
  out.paras.push("Evaluación: antes, "+A64.evalWords(o.evB,me).toLowerCase().replace(/\.$/,"")+"; después, "+A64.evalWords(o.evA,me).toLowerCase());
  out.paras.push("Para la próxima: "+(pu.theme==="Ataque doble"?"Revisá qué piezas tuyas quedan sin defensor: una sola pieza rival puede atacar dos a la vez.":(A64.TIP[pu.key]||A64.TIP.pos)));
  out.arrows.push({from:m.from,to:m.to,color:"red"});
  if(br)out.arrows.push({from:br.move.from,to:br.move.to,color:"green"});
  if(pu.reply)out.arrows.push({from:pu.reply.from,to:pu.reply.to,color:"blue"});
  return out};

/* ---------- análisis de una partida completa ---------- */
/* g: {fens, moves(verbose-ish), color, lichess:[{eval}|{mate}] opcional}. engine: A64.Engine. */
A64.analyzeGame=async function(g,engine,onStep,isAlive){
  const n=g.fens.length;g.ev=g.ev||new Array(n).fill(null);
  const depth=engine.kind==="sf17"?12:engine.kind==="sf10"?12:2;
  if(g.lichess&&g.lichess.length>=n-1){
    g.ev[0]=g.ev[0]||{cp:20,mate:null,pv:[]};
    for(let i=1;i<n;i++)if(!g.ev[i]){const a=g.lichess[i-1]||{};g.ev[i]={cp:a.mate!=null?Math.sign(a.mate)*(MATE-Math.abs(a.mate)*100):(a.eval||0),mate:a.mate!=null?a.mate:null,best:a.best||null,pv:a.best?[a.best]:[],src:"lichess"}}
  }
  for(let i=0;i<n;i++){
    if(isAlive&&!isAlive())return false;
    if(g.ev[i]&&g.ev[i].src!=="lichess")continue;
    if(g.ev[i]&&g.ev[i].src==="lichess"&&!needsDetail(g,i))continue;
    const r=await engine.analyse(g.fens[i],{depth,movetime:900,tag:"game"});
    if(!r)return false;
    g.ev[i]={cp:Math.round(r.cp),mate:r.mate,best:r.best,pv:(r.pv||[]).slice(0,8)};
    onStep&&onStep(i,n);
  }
  derive(g);return true};
function needsDetail(g,i){/* con evals de Lichess, solo pedimos mejor jugada y línea donde hay errores */
  const prev=g.ev[i-1],cur=g.ev[i],next=g.ev[i+1];
  const drop=(b,a,c)=>b&&a?A64.povWin(b,c)-A64.povWin(a,c):0;
  if(i+1<g.fens.length&&next&&drop(cur,next,g.moves[i].color)>=5)return true;
  if(i>0&&prev&&drop(prev,cur,g.moves[i-1].color)>=5)return true;
  return false}
function derive(g){
  const n=g.fens.length;g.verd=[];g.themes=[];g.acc={w:[],b:[]};g.miss=[];
  for(let i=1;i<n;i++){
    const m=g.moves[i-1],b=g.ev[i-1],a=g.ev[i];if(!b||!a)continue;
    let v=A64.classify(b,a,m,b.best);
    const prevV=i>1?g.verd[i-1]:null;
    if((prevV==="mistake"||prevV==="blunder")&&(v==="mistake"||v==="blunder"||v==="inacc"))g.miss[i]=true;
    g.verd[i]=v;g.acc[m.color].push(A64.moveAcc(b,a,m.color));
    if(v==="mistake"||v==="blunder"){try{g.themes[i]=A64.punish(g.fens[i-1],m,a).key}catch(e){g.themes[i]="pos"}}
  }
  const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:null;
  g.accW=avg(g.acc.w);g.accB=avg(g.acc.b);delete g.acc;
  const st={moves:0,inacc:0,mistake:0,blunder:0,best:0,miss:0,themes:{},fastErr:0,phase:{a:0,m:0,f:0}};
  for(let i=1;i<n;i++){const m=g.moves[i-1];if(g.color&&m.color!==g.color)continue;st.moves++;const v=g.verd[i];
    if(v==="best")st.best++;if(v==="inacc")st.inacc++;if(v==="mistake")st.mistake++;if(v==="blunder")st.blunder++;if(g.miss[i])st.miss++;
    if(v==="mistake"||v==="blunder"){const k=g.themes[i]||"pos";st.themes[k]=(st.themes[k]||0)+1;st.phase[i<=20?"a":phaseOf(g.fens[i-1])]++;
      const t=g.times&&g.times[i-1];if(t!=null&&g.fastT&&t<g.fastT)st.fastErr++}}
  st.errs=st.mistake+st.blunder;g.stats=st;g.done=true;
  /* momento decisivo: la jugada tuya que más bajó tus chances */
  let worst=null,wd=0;for(let i=1;i<n;i++){const m=g.moves[i-1];if(g.color&&m.color!==g.color)continue;const d=A64.povWin(g.ev[i-1],m.color)-A64.povWin(g.ev[i],m.color);if(d>wd){wd=d;worst=i}}
  g.key=worst&&wd>=10?worst:null}
function phaseOf(fen){const g=board(fen);let mat=0;for(const s in g){const t=g[s].type;if("nbrq".includes(t))mat+={n:3,b:3,r:5,q:9}[t]}return mat<=14?"f":"m"}
A64.derive=derive;
})();
