/* Archivo 64 — minijuegos en tableros chicos. © 2026 Ignacio Dubois. Todos los derechos reservados. */
(function(){
"use strict";
const A64=window.A64,S=A64.S,$=A64.$,$$=A64.$$,esc=A64.esc;
const V={p:1,n:3,b:3,r:5,q:9,k:100};
const NM={p:"peón",n:"caballo",b:"alfil",r:"torre",q:"dama",k:"rey"};

/* ================= modelo de tablero N×N ================= */
const at=(N,x,y)=>y*N+x,X=(N,i)=>i%N,Y=(N,i)=>Math.floor(i/N),inb=(N,x,y)=>x>=0&&y>=0&&x<N&&y<N;
function attacks(b,N,i){const p=b[i];if(!p)return[];const x=X(N,i),y=Y(N,i),out=[];
  const ray=(dx,dy)=>{let a=x+dx,c=y+dy;while(inb(N,a,c)){const j=at(N,a,c);out.push(j);if(b[j])break;a+=dx;c+=dy}};
  if(p.t==="p"){const d=p.c==="w"?-1:1;[[-1,d],[1,d]].forEach(([a,c])=>{if(inb(N,x+a,y+c))out.push(at(N,x+a,y+c))})}
  else if(p.t==="n")[[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]].forEach(([a,c])=>{if(inb(N,x+a,y+c))out.push(at(N,x+a,y+c))});
  else if(p.t==="k")[[1,1],[1,0],[1,-1],[0,1],[0,-1],[-1,1],[-1,0],[-1,-1]].forEach(([a,c])=>{if(inb(N,x+a,y+c))out.push(at(N,x+a,y+c))});
  else{if(p.t!=="r")[[1,1],[1,-1],[-1,1],[-1,-1]].forEach(d=>ray(...d));if(p.t!=="b")[[1,0],[-1,0],[0,1],[0,-1]].forEach(d=>ray(...d))}
  return out}
function attackedBy(b,N,i,c){for(let j=0;j<b.length;j++){const p=b[j];if(p&&p.c===c&&attacks(b,N,j).includes(i))return true}return false}
function attackersOf(b,N,i,c){const o=[];for(let j=0;j<b.length;j++){const p=b[j];if(p&&p.c===c&&attacks(b,N,j).includes(i))o.push(j)}return o}
function pseudo(b,N,i){const p=b[i],x=X(N,i),y=Y(N,i),out=[];
  if(p.t==="p"){const d=p.c==="w"?-1:1;if(inb(N,x,y+d)&&!b[at(N,x,y+d)])out.push(at(N,x,y+d));[-1,1].forEach(a=>{if(inb(N,x+a,y+d)){const j=at(N,x+a,y+d);if(b[j]&&b[j].c!==p.c)out.push(j)}});return out}
  return attacks(b,N,i).filter(j=>!b[j]||b[j].c!==p.c)}
function apply(b,N,f,t){const n=b.slice();const p=n[f];n[t]=p;n[f]=null;if(p.t==="p"&&(Y(N,t)===0||Y(N,t)===N-1))n[t]={t:"q",c:p.c};return n}
function kingOf(b,c){return b.findIndex(p=>p&&p.t==="k"&&p.c===c)}
function inCheck(b,N,c){const k=kingOf(b,c);return k>=0&&attackedBy(b,N,k,c==="w"?"b":"w")}
function legal(b,N,c){const out=[];for(let i=0;i<b.length;i++){const p=b[i];if(!p||p.c!==c)continue;for(const t of pseudo(b,N,i)){if(b[t]&&b[t].t==="k")continue;const n=apply(b,N,i,t);if(!inCheck(n,N,c))out.push([i,t])}}return out}
function rng(seed){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const ri=(R,n)=>Math.floor(R()*n);
const sqName=(N,i)=>"abcdefgh"[X(N,i)]+(N-Y(N,i));

/* ================= tablero chico (vista) ================= */
function mini(el,N,o){
  o=o||{};const set=o.set||"pixel";
  const st={b:Array(N*N).fill(null),marks:{},dots:new Set(),sel:null,stars:new Set(),blocked:new Set()};
  el.className="mb";el.style.setProperty("--n",N);
  el.addEventListener("pointerdown",e=>{const s=e.target.closest("[data-i]");if(!s)return;A64.Sound.c();o.onTap&&o.onTap(+s.dataset.i)});
  function draw(){let h="";for(let i=0;i<N*N;i++){const x=X(N,i),y=Y(N,i),p=st.b[i],cls=["c",(x+(N-1-y))%2===0?"d":"l"];
      if(st.marks[i])cls.push(st.marks[i]);if(st.sel===i)cls.push("sel");if(st.dots.has(i))cls.push(p?"cap":"dot");
      h+='<div class="'+cls.join(" ")+'" data-i="'+i+'"><span class="co">'+sqName(N,i)+"</span>"+(st.stars.has(i)?'<span class="star">★</span>':"")+(p?'<span class="pc">'+A64.pieceSVG(set,p.c,p.t)+"</span>":"")+"</div>"}
    el.innerHTML=h}
  return{st,draw,flash(i,k){const c=el.querySelector('[data-i="'+i+'"]');if(!c)return;c.classList.add(k||"bad");setTimeout(()=>c.classList.remove(k||"bad"),550)}};
}
/* búsqueda del mínimo de jugadas para juntar objetivos */
function bfs(N,start,targets,stepFn){const K=targets.length,full=(1<<K)-1,idx=new Map(targets.map((t,k)=>[t,k]));
  const key=(p,m)=>p*1024+m,seen=new Map([[key(start,0),0]]);let q=[[start,0]];
  for(let d=0;d<40&&q.length;d++){const nq=[];for(const [p,m] of q){if(m===full)return d;for(const t of stepFn(p,m)){let nm=m;if(idx.has(t))nm|=1<<idx.get(t);const k=key(t,nm);if(!seen.has(k)){seen.set(k,d+1);nq.push([t,nm])}}}q=nq}
  return -1}

/* ================= juegos ================= */
const G={};
/* ---- Ruta del caballo ---- */
G.ruta={name:"Ruta del caballo",skill:"Entrena los saltos del caballo y a esquivar casillas atacadas.",rule:"Llevá el caballo a la estrella en la menor cantidad de saltos. Las casillas rojas están atacadas: si caés ahí, te comen.",
 play(ctx){const L=ctx.lvl,N=L<=3?5:L<=7?6:7,R=ctx.rng,rounds=3;let r=0,res=[],moves=0,opt=0,cur=null;
  const v=mini(ctx.board,N,{onTap:tap});
  function gen(){for(let tries=0;tries<500;tries++){const b=Array(N*N).fill(null),ne=Math.min(1+Math.floor(L/2),5);
      for(let k=0;k<ne;k++){const i=ri(R,N*N);if(!b[i])b[i]={t:L>=6&&R()<.35?(R()<.5?"b":"n"):"p",c:"b"}}
      const danger=new Set();b.forEach((p,i)=>{if(p)attacks(b,N,i).forEach(j=>danger.add(j))});
      const free=[...Array(N*N).keys()].filter(i=>!b[i]&&!danger.has(i));if(free.length<4)continue;
      const s=free[ri(R,free.length)],t=free[ri(R,free.length)];if(s===t)continue;
      const kn=i=>attacks([...Array(N*N)].map((_,j)=>j===i?{t:"n",c:"w"}:null),N,i).filter(j=>!b[j]&&!danger.has(j));
      const d=bfs(N,s,[t],p=>kn(p));if(d<(L<=2?2:3)||d>6)continue;return{b,danger,s,t,d,kn}}return null}
  function next(){if(r>=rounds)return finish();cur=gen();if(!cur)return finish();cur.k=cur.s;cur.n=0;opt+=cur.d;draw();ctx.msg("Ruta "+(r+1)+" de "+rounds+". Mínimo: "+cur.d+" saltos.");hud()}
  function draw(){const st=v.st;st.b=cur.b.slice();st.b[cur.k]={t:"n",c:"w"};st.stars=new Set([cur.t]);st.marks={};cur.danger.forEach(i=>{if(!cur.b[i])st.marks[i]="danger"});
    st.dots=new Set(cur.kn(cur.k).concat(attacks(st.b,N,cur.k).filter(j=>!cur.b[j]&&cur.danger.has(j))));v.draw()}
  function tap(i){if(!cur)return;if(!attacks([...Array(N*N)].map((_,j)=>j===cur.k?{t:"n",c:"w"}:null),N,cur.k).includes(i)||cur.b[i])return;
    cur.n++;moves++;
    if(cur.danger.has(i)){A64.Sound.error();v.flash(i);ctx.msg("¡Te comieron en "+sqName(N,i)+"! Volvés al inicio (+2 saltos).");cur.n+=2;moves+=2;cur.k=cur.s;draw();hud();return}
    A64.Sound.move();cur.k=i;
    if(i===cur.t){const e=cur.n===cur.d?"g":cur.n<=cur.d+2?"y":"r";res.push(e);A64.Sound.ok();r++;ctx.msg(cur.n===cur.d?"¡Ruta perfecta!":"Llegaste en "+cur.n+" (mínimo "+cur.d+").");draw();setTimeout(next,700);hud();return}
    draw();hud()}
  function hud(){ctx.hud('<span>Saltos <b>'+moves+'</b></span><span>Mínimo <b>'+opt+'</b></span><span>'+res.map(e=>A64.EMO[e]).join("")+"</span>")}
  function finish(){ctx.end({win:moves<=opt+rounds,perfect:res.every(e=>e==="g")&&res.length===rounds,res,line:moves+" saltos (mínimo "+opt+")",score:opt?Math.round(opt/moves*100):0})}
  next()}};
/* ---- Guerra de peones ---- */
G.peones={name:"Guerra de peones",skill:"Entrena el cálculo con peones: rupturas, peones pasados y quién corona primero.",rule:"Solo peones. Gana el primero que corona. Si te quedás sin jugadas, perdés. Jugás con blancas.",
 play(ctx){const L=ctx.lvl,N=L<=5?5:6,R=ctx.rng,depth=Math.min(6,1+Math.ceil(L/2));let b=Array(N*N).fill(null),sel=null,over=false,lost=0;
  for(let x=0;x<N;x++){b[at(N,x,N-2)]={t:"p",c:"w"};b[at(N,x,1)]={t:"p",c:"b"}}
  const v=mini(ctx.board,N,{onTap:tap});
  const gen=(bb,c)=>{const o=[];bb.forEach((p,i)=>{if(p&&p.c===c)for(const t of pseudo(bb,N,i))o.push([i,t])});return o};
  const promoted=(bb,c)=>bb.some((p,i)=>p&&p.c===c&&(c==="w"?Y(N,i)===0:Y(N,i)===N-1));
  const mv=(bb,f,t)=>{const n=bb.slice();n[t]=n[f];n[f]=null;return n};
  function ev(bb){let s=0;bb.forEach((p,i)=>{if(!p)return;const adv=p.c==="w"?N-1-Y(N,i):Y(N,i);s+=(p.c==="b"?1:-1)*(10+adv*adv*2)});return s}
  function mm(bb,d,a,be,c){if(promoted(bb,"b"))return 1000+d;if(promoted(bb,"w"))return-1000-d;const ms=gen(bb,c);if(!ms.length)return c==="b"?-900:900;if(d===0)return ev(bb);
    if(c==="b"){let best=-1e9;for(const [f,t] of ms){const v2=mm(mv(bb,f,t),d-1,a,be,"w");if(v2>best)best=v2;if(best>a)a=best;if(a>=be)break}return best}
    let best=1e9;for(const [f,t] of ms){const v2=mm(mv(bb,f,t),d-1,a,be,"b");if(v2<best)best=v2;if(best<be)be=best;if(a>=be)break}return best}
  function draw(){v.st.b=b;v.st.sel=sel;v.st.dots=new Set(sel!=null?pseudo(b,N,sel):[]);v.draw();ctx.hud('<span>Tus peones <b>'+b.filter(p=>p&&p.c==="w").length+'</b></span><span>Rivales <b>'+b.filter(p=>p&&p.c==="b").length+"</b></span>")}
  function tap(i){if(over)return;if(sel!=null&&pseudo(b,N,sel).includes(i)){const cap=!!b[i];b=mv(b,sel,i);sel=null;cap?A64.Sound.capture():A64.Sound.move();draw();if(check())return;ctx.msg("Pienso…");setTimeout(ai,350);return}
    if(b[i]&&b[i].c==="w"){sel=i;draw()}else{sel=null;draw()}}
  function ai(){const ms=gen(b,"b");if(!ms.length){return end(true,"El rival se quedó sin jugadas.")}
    let best=null,bv=-1e9;const sh=ms.slice().sort(()=>R()-.5);
    for(const [f,t] of sh){const v2=mm(mv(b,f,t),depth-1,-1e9,1e9,"w")+(L<=3?(R()-.5)*60:0);if(v2>bv){bv=v2;best=[f,t]}}
    if(L<=2&&R()<.3)best=sh[0];
    const cap=!!b[best[1]];if(cap)lost++;b=mv(b,best[0],best[1]);cap?A64.Sound.capture():A64.Sound.move();draw();if(check())return;
    if(!gen(b,"w").length)return end(false,"Te quedaste sin jugadas.");ctx.msg("Te toca.")}
  function check(){if(promoted(b,"w")){end(true,"¡Coronaste!");return true}if(promoted(b,"b")){end(false,"El rival coronó.");return true}if(!b.some(p=>p&&p.c==="b")){end(true,"Te comiste todos los peones.");return true}return false}
  function end(win,txt){over=true;ctx.msg(txt);if(win&&lost===0)S.flags.pawnPerfect=true;setTimeout(()=>ctx.end({win,perfect:win&&lost===0,res:[win?(lost===0?"g":"y"):"r"],line:txt+(win?" Perdiste "+lost+" peón"+(lost===1?"":"es")+".":""),score:win?100-lost*10:0}),600)}
  draw();ctx.msg("Te toca. Tocá un peón y después a dónde va.")}};
/* ---- Mate relámpago ---- */
G.mate={name:"Mate relámpago",skill:"Entrena a ver mates en una jugada rápido, como en un blitz.",rule:"Dá mate en una jugada. Tenés 90 segundos para resolver todos los que puedas.",
 play(ctx){const L=ctx.lvl,N=L<=5?5:6,R=ctx.rng,need=3+Math.floor(L/2);let cur=null,sel=null,ok=0,bad=0,res=[],t0=performance.now(),iv,fails=0,over=false;
  const v=mini(ctx.board,N,{onTap:tap});
  function gen(){const pool=L<=2?["q","r"]:L<=5?["q","r","r","b","n"]:["q","r","b","n","n","b"];
    for(let tries=0;tries<4000;tries++){const b=Array(N*N).fill(null),bk=ri(R,N*N);b[bk]={t:"k",c:"b"};let wk;do{wk=ri(R,N*N)}while(wk===bk||Math.abs(X(N,wk)-X(N,bk))<=1&&Math.abs(Y(N,wk)-Y(N,bk))<=1);b[wk]={t:"k",c:"w"};
      const np=1+(L>=4?1:0)+(L>=8&&R()<.5?1:0);for(let k=0;k<np;k++){const i=ri(R,N*N);if(!b[i])b[i]={t:pool[ri(R,pool.length)],c:"w"}}
      if(L>=6)for(let k=0;k<1+ri(R,2);k++){const i=ri(R,N*N);if(!b[i]&&Y(N,i)>0&&Y(N,i)<N-1)b[i]={t:"p",c:"b"}}
      if(inCheck(b,N,"b")||inCheck(b,N,"w"))continue;if(!legal(b,N,"b").length)continue;
      const mates=legal(b,N,"w").filter(([f,t])=>{const n=apply(b,N,f,t);return inCheck(n,N,"b")&&!legal(n,N,"b").length});
      if(mates.length>=1&&mates.length<=2)return{b,mates}}return null}
  function next(){cur=gen();sel=null;fails=0;if(!cur)return finish();draw()}
  function draw(){v.st.b=cur.b;v.st.sel=sel;v.st.dots=new Set(sel!=null?legal(cur.b,N,"w").filter(m=>m[0]===sel).map(m=>m[1]):[]);v.draw()}
  function tap(i){if(over||!cur)return;const ls=legal(cur.b,N,"w");
    if(sel!=null&&ls.some(m=>m[0]===sel&&m[1]===i)){const n=apply(cur.b,N,sel,i);if(inCheck(n,N,"b")&&!legal(n,N,"b").length){ok++;res.push("g");A64.Sound.ok();v.st.b=n;v.st.sel=null;v.st.dots=new Set();v.draw();v.flash(i,"good");ctx.msg("¡Mate!");setTimeout(next,450)}
      else{fails++;bad++;A64.Sound.error();v.flash(i);if(fails>=2){res.push("r");const m=cur.mates[0];ctx.msg("Era "+NM[cur.b[m[0]].t]+" a "+sqName(N,m[1])+".");v.st.marks={[m[0]]:"hint",[m[1]]:"hint"};v.draw();setTimeout(()=>{v.st.marks={};next()},1200)}else ctx.msg("No es mate. Probá otra.")}
      sel=null;return}
    if(cur.b[i]&&cur.b[i].c==="w"){sel=i;draw()}else{sel=null;draw()}}
  function tick(){const left=90-(performance.now()-t0)/1000;ctx.hud('<span>Mates <b>'+ok+" / "+need+'</b></span><span class="tbar"><i style="width:'+Math.max(0,left/90*100)+'%"></i></span><span><b>'+Math.max(0,Math.ceil(left))+"</b> s</span>");if(left<=0)finish()}
  function finish(){if(over)return;over=true;clearInterval(iv);ctx.end({win:ok>=need,perfect:ok>=need&&bad===0,res:res.slice(-12),line:ok+" mates en 90 segundos (objetivo "+need+")",score:ok})}
  iv=setInterval(tick,200);ctx.onStop(()=>clearInterval(iv));next();ctx.msg("Juegan las blancas. Mate en 1.")}};
/* ---- Comé todo ---- */
G.come={name:"Comé todo",skill:"Entrena cómo se mueve cada pieza y a no pararte en casillas defendidas.",rule:"Comé todas las piezas negras en la menor cantidad de jugadas. No podés pararte en una casilla que esté defendida.",
 play(ctx){const L=ctx.lvl,N=L<=4?5:6,R=ctx.rng,piece=L<=2?"r":L<=4?"b":L<=6?"n":"q",rounds=2;let r=0,res=[],moves=0,opt=0,cur=null;
  const v=mini(ctx.board,N,{onTap:tap});
  function danger(b){const d=new Set();b.forEach((p,i)=>{if(p&&p.c==="b")attacks(b,N,i).forEach(j=>d.add(j))});return d}
  function gen(){const k=Math.min(3+Math.floor(L/3),6);for(let tries=0;tries<800;tries++){const b=Array(N*N).fill(null);const tg=[];
      for(let j=0;j<k;j++){const i=ri(R,N*N);if(b[i])continue;b[i]={t:L>=6&&j===0?"n":"p",c:"b"};tg.push(i)}
      const s=ri(R,N*N);if(b[s]||danger(b).has(s))continue;
      const step=(p,m)=>{const bb=b.map((x,i)=>{const t=tg.indexOf(i);return t>=0&&(m>>t&1)?null:x});bb[p]={t:piece,c:"w"};const out=[];
        for(const t of attacks(bb,N,p)){if(bb[t]&&bb[t].c==="w")continue;const nb=bb.slice();nb[t]={t:piece,c:"w"};nb[p]=null;if(!danger(nb).has(t))out.push(t)}return out};
      const d=bfs(N,s,tg,step);if(d<k||d>k+5)continue;return{b,tg,s,d}}return null}
  function next(){if(r>=rounds)return finish();cur=gen();if(!cur)return finish();cur.pos=cur.s;cur.n=0;cur.left=cur.b.slice();opt+=cur.d;draw();ctx.msg("Ronda "+(r+1)+" de "+rounds+". Mínimo: "+cur.d+" jugadas.")}
  function draw(){const b=cur.left.slice();b[cur.pos]={t:piece,c:"w"};v.st.b=b;v.st.marks={};danger(b).forEach(i=>{if(!b[i])v.st.marks[i]="danger"});v.st.dots=new Set(attacks(b,N,cur.pos).filter(t=>!b[t]||b[t].c==="b"));v.draw();hud()}
  function tap(i){const b=cur.left.slice();b[cur.pos]={t:piece,c:"w"};if(!attacks(b,N,cur.pos).includes(i))return;
    const nb=b.slice();nb[i]={t:piece,c:"w"};nb[cur.pos]=null;if(danger(nb).has(i)){A64.Sound.error();v.flash(i);ctx.msg("Esa casilla está defendida: te comerían.");return}
    const cap=!!cur.left[i];cur.left[i]=null;cur.pos=i;cur.n++;moves++;cap?A64.Sound.capture():A64.Sound.move();
    if(!cur.left.some(p=>p)){const e=cur.n===cur.d?"g":cur.n<=cur.d+2?"y":"r";res.push(e);r++;A64.Sound.ok();ctx.msg(cur.n===cur.d?"¡Perfecto!":"Lo hiciste en "+cur.n+" (mínimo "+cur.d+").");draw();setTimeout(next,700);return}draw()}
  function hud(){ctx.hud('<span>Pieza <b>'+NM[piece]+'</b></span><span>Jugadas <b>'+moves+'</b></span><span>Mínimo <b>'+opt+'</b></span><span>'+res.map(e=>A64.EMO[e]).join("")+"</span>")}
  function finish(){ctx.end({win:moves<=opt+rounds*2,perfect:res.length===rounds&&res.every(e=>e==="g"),res,line:moves+" jugadas (mínimo "+opt+") con "+NM[piece],score:opt?Math.round(opt/moves*100):0})}
  next()}};
/* ---- posiciones al azar para los juegos de vista ---- */
function randPos(R,N,nw,nb,kings){const b=Array(N*N).fill(null);const put=(t,c)=>{for(let k=0;k<50;k++){const i=ri(R,N*N);if(b[i])continue;if(t==="p"&&(Y(N,i)===0||Y(N,i)===N-1))continue;b[i]={t,c};return i}};
  if(kings){const a=put("k","w");let k2;do{k2=ri(R,N*N)}while(b[k2]||Math.abs(X(N,k2)-X(N,a))<=1&&Math.abs(Y(N,k2)-Y(N,a))<=1);b[k2]={t:"k",c:"b"}}
  const pool=["p","p","n","b","r","q"];for(let k=0;k<nw;k++)put(pool[ri(R,pool.length)],"w");for(let k=0;k<nb;k++)put(pool[ri(R,pool.length)],"b");return b}
function hangingW(b,N){const out=[];b.forEach((p,i)=>{if(!p||p.c!=="w"||p.t==="k")return;const at=attackersOf(b,N,i,"b");if(!at.length)return;const df=attackersOf(b,N,i,"w");const ch=Math.min(...at.map(j=>V[b[j].t]));if(!df.length||ch<V[p.t])out.push(i)});return out}
/* ---- ¿Qué está colgado? ---- */
G.colgado={name:"¿Qué está colgado?",skill:"Entrena tu error más común: ver qué piezas tuyas quedan sin defensa.",rule:"Tocá todas tus piezas (blancas) que están colgadas: atacadas y sin defensa, o atacadas por algo más barato. Después tocá Listo.",
 play(ctx){const L=ctx.lvl,N=6,R=ctx.rng,rounds=5,T=Math.max(7,16-L);let r=0,res=[],cur=null,pick=new Set(),iv,t0,over=false;
  const v=mini(ctx.board,N,{onTap:i=>{if(!cur||cur.done)return;const p=cur.b[i];if(!p||p.c!=="w"||p.t==="k")return;pick.has(i)?pick.delete(i):pick.add(i);A64.Sound.move();draw()}});
  ctx.ctl('<button class="btn main" id="mgDone">Listo</button>');$("#mgDone").onclick=()=>judge();
  function gen(){for(let k=0;k<400;k++){const b=randPos(R,N,3+Math.min(3,Math.floor(L/3)),3+Math.min(3,Math.floor(L/3)),true);if(inCheck(b,N,"w")||inCheck(b,N,"b"))continue;const h=hangingW(b,N);if(h.length>=1&&h.length<=3)return{b,h}}return null}
  function next(){if(r>=rounds)return finish();cur=gen();pick=new Set();if(!cur)return finish();t0=performance.now();draw();ctx.msg("Ronda "+(r+1)+" de "+rounds+".")}
  function draw(){v.st.b=cur.b;v.st.marks={};pick.forEach(i=>v.st.marks[i]="pick");if(cur.done){cur.h.forEach(i=>v.st.marks[i]=pick.has(i)?"good":"miss");pick.forEach(i=>{if(!cur.h.includes(i))v.st.marks[i]="bad"})}v.draw()}
  function judge(){if(!cur||cur.done)return;cur.done=true;const right=cur.h.filter(i=>pick.has(i)).length,wrong=[...pick].filter(i=>!cur.h.includes(i)).length;
    const e=right===cur.h.length&&!wrong?"g":right>0&&!wrong?"y":"r";res.push(e);e==="g"?A64.Sound.ok():A64.Sound.error();
    ctx.msg(e==="g"?"¡Exacto!":"Colgadas: "+cur.h.map(i=>NM[cur.b[i].t]+" de "+sqName(N,i)).join(", ")+".");draw();r++;setTimeout(next,e==="g"?700:1700)}
  function tick(){if(!cur||cur.done){ctx.hud(hudTxt(T));return}const left=T-(performance.now()-t0)/1000;ctx.hud(hudTxt(left));if(left<=0)judge()}
  const hudTxt=left=>'<span>Ronda <b>'+Math.min(r+1,rounds)+" / "+rounds+'</b></span><span class="tbar"><i style="width:'+Math.max(0,left/T*100)+'%"></i></span><span>'+res.map(e=>A64.EMO[e]).join("")+"</span>";
  function finish(){if(over)return;over=true;clearInterval(iv);const g=res.filter(e=>e==="g").length;ctx.end({win:g>=4,perfect:g===rounds,res,line:g+" de "+rounds+" rondas exactas",score:g})}
  iv=setInterval(tick,200);ctx.onStop(()=>clearInterval(iv));next()}};
/* ---- Casilla segura ---- */
G.segura={name:"Casilla segura",skill:"Entrena a ver qué casillas controla el rival antes de mover el rey.",rule:"Tocá todas las casillas a las que tu rey puede ir sin quedar en jaque. Después tocá Listo.",
 play(ctx){const L=ctx.lvl,N=6,R=ctx.rng,rounds=5,T=Math.max(8,20-L);let r=0,res=[],cur=null,pick=new Set(),iv,t0,over=false;
  const v=mini(ctx.board,N,{onTap:i=>{if(!cur||cur.done||i===cur.k)return;const kx=X(N,cur.k),ky=Y(N,cur.k);if(Math.max(Math.abs(X(N,i)-kx),Math.abs(Y(N,i)-ky))!==1)return;pick.has(i)?pick.delete(i):pick.add(i);A64.Sound.move();draw()}});
  ctx.ctl('<button class="btn main" id="mgDone">Listo</button>');$("#mgDone").onclick=()=>judge();
  function gen(){for(let k=0;k<400;k++){const b=Array(N*N).fill(null),kw=ri(R,N*N);b[kw]={t:"k",c:"w"};const nb=2+Math.min(4,Math.floor(L/2));const pool=["p","n","b","r","q"];
      for(let j=0;j<nb;j++){const i=ri(R,N*N);if(!b[i]&&Math.max(Math.abs(X(N,i)-X(N,kw)),Math.abs(Y(N,i)-Y(N,kw)))>(L<=3?1:0))b[i]={t:pool[ri(R,L<=3?3:5)],c:"b"}}
      const safe=legal(b,N,"w").filter(m=>m[0]===kw).map(m=>m[1]);const nbrs=attacks(b,N,kw).length;if(safe.length>=1&&safe.length<nbrs)return{b,k:kw,safe}}return null}
  function next(){if(r>=rounds)return finish();cur=gen();pick=new Set();if(!cur)return finish();t0=performance.now();draw();ctx.msg("Ronda "+(r+1)+" de "+rounds+". Tu rey está en "+sqName(N,cur.k)+".")}
  function draw(){v.st.b=cur.b;v.st.marks={};pick.forEach(i=>v.st.marks[i]="pick");if(cur.done){cur.safe.forEach(i=>v.st.marks[i]=pick.has(i)?"good":"miss");pick.forEach(i=>{if(!cur.safe.includes(i))v.st.marks[i]="bad"})}v.draw()}
  function judge(){if(!cur||cur.done)return;cur.done=true;const right=cur.safe.filter(i=>pick.has(i)).length,wrong=[...pick].filter(i=>!cur.safe.includes(i)).length;
    const e=right===cur.safe.length&&!wrong?"g":wrong<=1&&right>=cur.safe.length-1?"y":"r";res.push(e);e==="g"?A64.Sound.ok():A64.Sound.error();ctx.msg(e==="g"?"¡Exacto!":"Seguras: "+cur.safe.map(i=>sqName(N,i)).join(", ")+".");draw();r++;setTimeout(next,e==="g"?700:1700)}
  function tick(){const left=cur&&!cur.done?T-(performance.now()-t0)/1000:T;ctx.hud('<span>Ronda <b>'+Math.min(r+1,rounds)+" / "+rounds+'</b></span><span class="tbar"><i style="width:'+Math.max(0,left/T*100)+'%"></i></span><span>'+res.map(e=>A64.EMO[e]).join("")+"</span>");if(cur&&!cur.done&&left<=0)judge()}
  function finish(){if(over)return;over=true;clearInterval(iv);const g=res.filter(e=>e==="g").length;ctx.end({win:g>=4,perfect:g===rounds,res,line:g+" de "+rounds+" rondas exactas",score:g})}
  iv=setInterval(tick,200);ctx.onStop(()=>clearInterval(iv));next()}};
/* ---- Contá atacantes ---- */
function see(b,N,i){const tv=V[b[i].t],att=attackersOf(b,N,i,"w").map(j=>V[b[j].t]).sort((a,c)=>a-c),def=attackersOf(b,N,i,"b").map(j=>V[b[j].t]).sort((a,c)=>a-c);
  if(!att.length)return null;const g=[tv];let on=att[0],a=1,d=0,side="b";
  for(;;){if(side==="b"){if(d>=def.length)break;g.push(on-g[g.length-1]);on=def[d++];side="w"}else{if(a>=att.length)break;g.push(on-g[g.length-1]);on=att[a++];side="b"}}
  for(let k=g.length-1;k>0;k--)g[k-1]=-Math.max(-g[k-1],g[k]);return g[0]}
G.contar={name:"Contá atacantes",skill:"Entrena a contar atacantes y defensores antes de comer.",rule:"¿Ganás material si comés la pieza marcada? Contá quién ataca y quién defiende. Tenés 60 segundos.",
 play(ctx){const L=ctx.lvl,N=6,R=ctx.rng,need=6+Math.floor(L/2);let cur=null,ok=0,bad=0,res=[],t0=performance.now(),iv,over=false,want=R()<.5;
  const v=mini(ctx.board,N,{});
  ctx.ctl('<button class="btn main" id="mgYes" style="min-width:120px">Sí, gano</button><button class="btn" id="mgNo" style="min-width:120px">No</button>');
  $("#mgYes").onclick=()=>ans(true);$("#mgNo").onclick=()=>ans(false);
  function gen(){for(let k=0;k<600;k++){const b=randPos(R,N,3+Math.min(3,Math.floor(L/3)),3+Math.min(3,Math.floor(L/3)),false);const cand=[];b.forEach((p,i)=>{if(p&&p.c==="b"){const s=see(b,N,i);if(s!=null)cand.push([i,s])}});
      const f=cand.filter(c=>(c[1]>0)===want);if(f.length){const [i,s]=f[ri(R,f.length)];want=R()<.5;return{b,i,yes:s>0,s}}}return null}
  function next(){cur=gen();if(!cur)return finish();v.st.b=cur.b;v.st.marks={[cur.i]:"target"};v.draw()}
  function ans(y){if(over||!cur)return;if(y===cur.yes){ok++;res.push("g");A64.Sound.ok();ctx.msg(cur.yes?"Sí: ganás "+(cur.s>=3?"una pieza":"material")+".":"Bien: no ganás nada comiendo ahí.")}else{bad++;res.push("r");A64.Sound.error();
      const at=attackersOf(cur.b,N,cur.i,"w").length,df=attackersOf(cur.b,N,cur.i,"b").length;ctx.msg((cur.yes?"Sí ganabas":"No ganabas")+": "+at+" atacante"+(at>1?"s":"")+" contra "+df+" defensor"+(df===1?"":"es")+".")}next()}
  function tick(){const left=60-(performance.now()-t0)/1000;ctx.hud('<span>Bien <b>'+ok+" / "+need+'</b></span><span>Errores <b>'+bad+'</b></span><span class="tbar"><i style="width:'+Math.max(0,left/60*100)+'%"></i></span><span><b>'+Math.max(0,Math.ceil(left))+"</b> s</span>");if(left<=0)finish()}
  function finish(){if(over)return;over=true;clearInterval(iv);ctx.end({win:ok>=need&&bad<=2,perfect:ok>=need&&bad===0,res:res.slice(-12),line:ok+" bien y "+bad+" errores en 60 segundos",score:ok})}
  iv=setInterval(tick,200);ctx.onStop(()=>clearInterval(iv));next();ctx.msg("La pieza marcada en naranja: ¿la comés y ganás?")}};
/* ---- Recorrido de la dama ---- */
G.dama={name:"Recorrido de la dama",skill:"Entrena las líneas largas de la dama y la torre.",rule:"Pasá por todas las estrellas (tenés que pararte encima) en la menor cantidad de jugadas. Tus peones bloquean el paso.",
 play(ctx){const L=ctx.lvl,N=L<=6?6:7,R=ctx.rng,piece=L<=3?"r":"q",rounds=2;let r=0,res=[],moves=0,opt=0,cur=null;
  const v=mini(ctx.board,N,{onTap:tap});
  function gen(){const k=Math.min(3+Math.floor(L/3),6),ob=2+Math.floor(L/3);for(let tries=0;tries<600;tries++){const b=Array(N*N).fill(null);for(let j=0;j<ob;j++){const i=ri(R,N*N);b[i]={t:"p",c:"w"}}
      const free=[...Array(N*N).keys()].filter(i=>!b[i]);const s=free[ri(R,free.length)];const st=[];while(st.length<k){const i=free[ri(R,free.length)];if(i!==s&&!st.includes(i))st.push(i)}
      const step=p=>{const bb=b.slice();bb[p]={t:piece,c:"w"};return attacks(bb,N,p).filter(t=>!bb[t])};const d=bfs(N,s,st,step);if(d<k||d>k+4)continue;return{b,s,st,d}}return null}
  function next(){if(r>=rounds)return finish();cur=gen();if(!cur)return finish();cur.pos=cur.s;cur.n=0;cur.left=new Set(cur.st);opt+=cur.d;draw();ctx.msg("Ronda "+(r+1)+" de "+rounds+". Mínimo: "+cur.d+" jugadas.")}
  function draw(){const b=cur.b.slice();b[cur.pos]={t:piece,c:"w"};v.st.b=b;v.st.stars=cur.left;v.st.dots=new Set(attacks(b,N,cur.pos).filter(t=>!b[t]));v.draw();ctx.hud('<span>Pieza <b>'+NM[piece]+'</b></span><span>Jugadas <b>'+moves+'</b></span><span>Mínimo <b>'+opt+'</b></span><span>'+res.map(e=>A64.EMO[e]).join("")+"</span>")}
  function tap(i){const b=cur.b.slice();b[cur.pos]={t:piece,c:"w"};if(!attacks(b,N,cur.pos).includes(i)||b[i])return;cur.pos=i;cur.n++;moves++;A64.Sound.move();if(cur.left.delete(i))A64.Sound.tick();
    if(!cur.left.size){const e=cur.n===cur.d?"g":cur.n<=cur.d+2?"y":"r";res.push(e);r++;A64.Sound.ok();ctx.msg(cur.n===cur.d?"¡Recorrido perfecto!":"En "+cur.n+" (mínimo "+cur.d+").");draw();setTimeout(next,700);return}draw()}
  function finish(){ctx.end({win:moves<=opt+rounds*2,perfect:res.length===rounds&&res.every(e=>e==="g"),res,line:moves+" jugadas (mínimo "+opt+") con "+NM[piece],score:opt?Math.round(opt/moves*100):0})}
  next()}};

A64.MG_ORDER=["ruta","colgado","peones","mate","segura","come","contar","dama"];
A64.EMO={g:"🟩",y:"🟨",r:"🟥"};
A64.mgState=id=>{S.mg[id]=S.mg[id]||{lvl:1,plays:0,wins:0,best:0,maxLvl:1,perfect:0};return S.mg[id]};
A64.dailyGame=()=>{const d=new Date();d.setHours(0,0,0,0);const n=Math.floor(d.getTime()/864e5);return A64.MG_ORDER[n%A64.MG_ORDER.length]};
const hash=s=>{let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};

/* ================= pantalla de minijuegos ================= */
let stopFns=[];
function stopAll(){stopFns.forEach(f=>{try{f()}catch(e){}});stopFns=[]}
A64.mgHub=(el,onBack)=>{stopAll();
  const today=A64.today(),dg=A64.dailyGame(),dd=S.mgDaily[today];
  let h='<div class="arcade-daily"><div><p class="lbl">Desafío del día · '+new Date().toLocaleDateString("es-AR",{day:"numeric",month:"long"})+'</p><h3>'+esc(G[dg].name)+'</h3><p class="mute">'+esc(G[dg].skill)+'</p></div>'+(dd?'<div class="stack" style="justify-items:end"><span class="emo">'+(dd.res||[]).map(e=>A64.EMO[e]).join("")+'</span><button class="btn sm" id="mgShare">Compartir</button></div>':'<button class="btn main" id="mgDaily">Jugar el desafío</button>')+'</div>';
  h+='<div class="mg-grid">'+A64.MG_ORDER.map(id=>{const s=A64.mgState(id);return'<button class="mg-card" data-g="'+id+'"><span class="mg-ic">'+A64.pieceSVG("pixel","w",{ruta:"n",colgado:"b",peones:"p",mate:"q",segura:"k",come:"r",contar:"n",dama:"q"}[id])+'</span><b>'+esc(G[id].name)+'</b><small>'+esc(G[id].skill)+'</small><span class="mg-meta"><span>Nivel <b>'+s.lvl+'</b></span><span>'+s.wins+" / "+s.plays+" ganados</span></span></button>"}).join("")+"</div>";
  h+='<div class="card"><div class="card-h"><h2>Calendario del desafío</h2><span class="mute" style="font-size:13px">últimas 5 semanas</span></div>'+calendar()+"</div>";
  el.innerHTML=h;
  $$("[data-g]",el).forEach(b=>b.onclick=()=>A64.mgPlay(el,b.dataset.g,false,onBack));
  if($("#mgDaily",el))$("#mgDaily",el).onclick=()=>A64.mgPlay(el,dg,true,onBack);
  if($("#mgShare",el))$("#mgShare",el).onclick=()=>share(dd,$("#mgShare",el));
};
function calendar(){const d=new Date();d.setHours(0,0,0,0);const dow=(d.getDay()+6)%7;const start=new Date(d.getTime()-(28+dow)*864e5);let h='<div class="cal">'+["L","M","M","J","V","S","D"].map(x=>'<span class="cal-h">'+x+"</span>").join("");
  for(let i=0;i<35;i++){const t=new Date(start.getTime()+i*864e5),k=t.getFullYear()+"-"+String(t.getMonth()+1).padStart(2,"0")+"-"+String(t.getDate()).padStart(2,"0"),r=S.mgDaily[k],fut=t>d;
    h+='<span class="cal-d'+(r?(r.perfect?" p":r.win?" w":" l"):"")+(fut?" f":"")+(t.getTime()===d.getTime()?" now":"")+'" title="'+k+'">'+t.getDate()+"</span>"}
  return h+'</div><div class="legend" style="margin-top:6px"><span><i style="background:var(--good)"></i>perfecto</span><span><i style="background:var(--acc)"></i>ganado</span><span><i style="background:var(--line2)"></i>jugado</span></div>'}
function shareText(r){const d=new Date();return"Archivo 64 · Desafío del "+d.getDate()+"/"+(d.getMonth()+1)+"\n"+G[r.g].name+" · nivel "+r.lvl+"\n"+(r.res||[]).map(e=>A64.EMO[e]).join("")+"\n"+r.line+"\nsirathrion18.github.io/archivo64"}
function share(r,btn){const t=shareText(r);const done=()=>{btn.textContent="¡Copiado!";A64.count("share");A64.checkAch()};
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(done,()=>fallback(t,done));else fallback(t,done)}
function fallback(t,done){const ta=document.createElement("textarea");ta.value=t;ta.style.cssText="position:fixed;opacity:0";document.body.appendChild(ta);ta.select();try{document.execCommand("copy");done()}catch(e){A64.modal('<div class="modal-b"><h2>Copiá el resultado</h2><textarea rows="5" style="width:100%">'+esc(t)+'</textarea><button class="btn main" data-close>Listo</button></div>')}ta.remove()}
A64.mgPlay=(el,id,daily,onBack)=>{stopAll();const g=G[id],s=A64.mgState(id),lvl=s.lvl,today=A64.today();
  el.innerHTML='<div class="row"><button class="btn sm ghost" id="mgBack">‹ Minijuegos</button><span class="sp"></span>'+(daily?'<span class="pill acc">Desafío del día</span>':"")+'<span class="pill">Nivel '+lvl+'</span></div>'
    +'<div class="arcade"><div class="arc-head"><div><h2>'+esc(g.name)+'</h2><p class="mute">'+esc(g.rule)+'</p></div></div><div class="arc-hud" id="mgHud"></div><div class="arc-board"><div id="mgBoard"></div></div><p class="arc-msg" id="mgMsg"></p><div class="row" id="mgCtl" style="justify-content:center"></div></div>';
  $("#mgBack",el).onclick=()=>{stopAll();onBack?onBack():A64.mgHub(el)};
  const seed=daily?hash(today+id):((Date.now()*997)>>>0);
  const ctx={lvl,rng:rng(seed),board:$("#mgBoard",el),hud:h=>{const x=$("#mgHud",el);if(x)x.innerHTML=h},msg:m=>{const x=$("#mgMsg",el);if(x)x.textContent=m},ctl:h=>{$("#mgCtl",el).innerHTML=h},onStop:f=>stopFns.push(f),
    end(r){stopAll();s.plays++;if(r.win){s.wins++;s.lvl=Math.min(10,s.lvl+1)}else s.lvl=Math.max(1,s.lvl-1);if(r.perfect)s.perfect++;s.maxLvl=Math.max(s.maxLvl||1,s.lvl);s.best=Math.max(s.best||0,r.score||0);
      const rec={g:id,lvl,win:r.win,perfect:r.perfect,res:r.res,line:r.line,score:r.score};
      if(daily&&!S.mgDaily[today]){S.mgDaily[today]=rec;A64.bump("mg")}A64.markDay();A64.save();
      if(r.win)A64.Sound.win();A64.checkAch();
      $("#mgCtl",el).innerHTML="";
      const box=document.createElement("div");box.className="arc-end";
      box.innerHTML='<p class="score-big">'+(r.win?(r.perfect?"¡Perfecto!":"¡Ganaste!"):"Esta vez no")+'</p><p class="emo">'+(r.res||[]).map(e=>A64.EMO[e]).join("")+'</p><p>'+esc(r.line)+'</p><p class="mute">'+(r.win?(s.lvl>lvl?"Subís al nivel "+s.lvl+".":"Ya estás en el nivel máximo."):(s.lvl<lvl?"Bajamos al nivel "+s.lvl+" para afianzar.":"Seguís en el nivel "+s.lvl+". Probá de nuevo."))+'</p>'+A64.achSummaryHTML()
        +'<div class="row" style="justify-content:center">'+(daily?'<button class="btn main" id="mgSh">Compartir resultado</button>':'<button class="btn main" id="mgAgain">Otra</button>')+'<button class="btn" id="mgOut">Volver</button></div>';
      el.querySelector(".arcade").appendChild(box);S.achQ=[];A64.save();
      if($("#mgSh",el))$("#mgSh",el).onclick=e=>share(rec,e.currentTarget);if($("#mgAgain",el))$("#mgAgain",el).onclick=()=>A64.mgPlay(el,id,false,onBack);
      $("#mgOut",el).onclick=()=>{onBack?onBack():A64.mgHub(el)};box.scrollIntoView({block:"nearest",behavior:"smooth"})}};
  g.play(ctx);
};
A64.mgStop=stopAll;
A64.mgStats=()=>A64.MG_ORDER.map(id=>({id,name:G[id].name,...A64.mgState(id)}));
})();
