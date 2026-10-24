/* Archivo 64 — motor. © 2026 Ignacio Dubois. Todos los derechos reservados.
   Stockfish 17.1 (GPL-3.0, ver engine/COPYING-stockfish.txt) corre en un Worker aparte y se comunica por UCI. */
(function(){
"use strict";
const A64=window.A64=window.A64||{};
const MATE=100000,PV={p:100,n:310,b:330,r:500,q:900,k:0};

/* ---- respaldo en JavaScript, por si no carga ningún Stockfish ---- */
function evalW(ch){const b=ch.board();let s=0;for(let r=0;r<8;r++)for(let c=0;c<8;c++){const p=b[r][c];if(!p)continue;let v=PV[p.type];const cent=(3.5-Math.abs(3.5-c))+(3.5-Math.abs(3.5-r));
  if(p.type==="n"||p.type==="b")v+=cent*6;else if(p.type==="p")v+=(p.color==="w"?6-r:r-1)*8;else if(p.type==="q")v+=cent*2;s+=p.color==="w"?v:-v}return s}
function nm(ch,d,a,b,ply){const ms=ch.moves({verbose:true});if(!ms.length)return ch.in_check()?-(MATE-ply):0;if(ch.in_draw())return 0;if(d===0){const e=evalW(ch);return ch.turn()==="w"?e:-e}
  ms.sort((x,y)=>(y.captured?PV[y.captured]*10-PV[y.piece]:0)-(x.captured?PV[x.captured]*10-PV[x.piece]:0));let best=-Infinity;
  for(const m of ms){ch.move(m);const v=-nm(ch,d-1,-b,-a,ply+1);ch.undo();if(v>best)best=v;if(v>a)a=v;if(a>=b)break}return best}
function jsSearch(fen,depth,multipv){const ch=new Chess(fen),stm=fen.split(" ")[1],sg=stm==="w"?1:-1;
  const sc=ch.moves({verbose:true}).map(m=>{ch.move(m);const v=-nm(ch,depth-1,-Infinity,Infinity,1);ch.undo();return{m,v}}).sort((x,y)=>y.v-x.v);
  const u=m=>m.from+m.to+(m.promotion||"");
  const lines=sc.slice(0,multipv||1).map(x=>{const mate=Math.abs(x.v)>MATE-200?Math.sign(x.v)*sg*Math.ceil((MATE-Math.abs(x.v))/2):null;return{cp:mate!=null?Math.sign(mate)*(MATE-Math.abs(mate)*100):x.v*sg,mate,pv:[u(x.m)]}});
  return lines}

class Engine{
  constructor(){this.kind="init";this.queue=[];this.cur=null;this.listeners=[];this.ready=new Promise(r=>this._ready=r)}
  onChange(f){this.listeners.push(f)}
  set(kind){this.kind=kind;this.listeners.forEach(f=>{try{f(kind)}catch(e){}});if(kind!=="init")this._ready(kind)}
  start(){
    this.tryWorker(()=>new Worker("engine/stockfish.js"),"sf17",9000).catch(()=>
      this.tryWorker(()=>new Worker(URL.createObjectURL(new Blob(["importScripts('https://cdn.jsdelivr.net/npm/stockfish@10.0.2/src/stockfish.asm.js');"],{type:"application/javascript"}))),"sf10",20000)
    ).catch(()=>{this.set("js");this.pump()});
  }
  tryWorker(make,kind,timeout){
    return new Promise((res,rej)=>{
      let w;try{w=make()}catch(e){rej(e);return}
      const t=setTimeout(()=>{try{w.terminate()}catch(e){}rej(new Error("timeout"))},timeout);
      w.onerror=e=>{clearTimeout(t);try{w.terminate()}catch(_){}rej(e)};
      w.onmessage=e=>{const l=String(e.data);
        if(l==="uciok"){w.postMessage("isready")}
        else if(l==="readyok"&&this.kind==="init"){clearTimeout(t);this.w=w;w.onmessage=ev=>this.line(String(ev.data));w.onerror=()=>this.crash();this.set(kind);res();this.pump()}};
      w.postMessage("uci");
    });
  }
  crash(){try{this.w&&this.w.terminate()}catch(e){}this.w=null;this.set("js");if(this.cur){const j=this.cur;this.cur=null;this.queue.unshift(j)}this.pump()}
  line(l){
    const j=this.cur;if(!j)return;
    if(l.startsWith("info")&&l.includes(" pv ")&&l.includes(" score ")){
      if(/ (lowerbound|upperbound)/.test(l))return;
      const mp=+(l.match(/ multipv (\d+)/)||[0,1])[1],sc=l.match(/ score (cp|mate) (-?\d+)/),dp=+(l.match(/ depth (\d+)/)||[0,0])[1];if(!sc)return;
      const v=+sc[2],sg=j.stm==="w"?1:-1,line={pv:l.split(" pv ")[1].trim().split(" ").slice(0,12),depth:dp};
      if(sc[1]==="cp"){line.cp=v*sg;line.mate=null}else{line.mate=v*sg;line.cp=(v>0?1:-1)*sg*(MATE-Math.abs(v)*100)}
      j.lines[mp-1]=line;j.depth=dp;
    }else if(l.startsWith("bestmove")){clearTimeout(j.wd);this.finish(j,l.split(" ")[1])}
  }
  finish(j,best){
    this.cur=null;
    if(!j.cancelled){const lines=j.lines.filter(Boolean);const top=lines[0]||{cp:0,mate:null,pv:[]};
      j.resolve({best:best&&best!=="(none)"?best:(top.pv[0]||null),cp:top.cp,mate:top.mate,pv:top.pv,lines,depth:j.depth||0,kind:this.kind})}
    else j.resolve(null);
    this.pump();
  }
  /* o: {depth, movetime, multipv, prio, tag} */
  analyse(fen,o){o=o||{};return new Promise(resolve=>{
    let ch;try{ch=new Chess(fen)}catch(e){resolve(null);return}
    if(ch.game_over()){resolve({best:null,cp:ch.in_checkmate()?(ch.turn()==="w"?-MATE:MATE):0,mate:ch.in_checkmate()?0:null,pv:[],lines:[],over:true});return}
    const j={fen,o,resolve,stm:fen.split(" ")[1],lines:[]};
    if(o.prio)this.queue.unshift(j);else this.queue.push(j);this.pump()})}
  cancel(tag){this.queue=this.queue.filter(j=>{if(j.o.tag===tag){j.resolve(null);return false}return true});
    if(this.cur&&this.cur.o.tag===tag){this.cur.cancelled=true;if(this.w)this.w.postMessage("stop")}}
  pump(){
    if(this.cur||!this.queue.length||this.kind==="init")return;
    const j=this.queue.shift();this.cur=j;const o=j.o,mpv=o.multipv||1;
    if(this.w){
      this.w.postMessage("setoption name MultiPV value "+mpv);
      if(this.kind==="sf10")this.w.postMessage("setoption name Skill Level value 20");
      this.w.postMessage("position fen "+j.fen);
      const go=o.depth?"go depth "+o.depth+(o.movetime?" movetime "+o.movetime:""):"go movetime "+(o.movetime||400);
      this.w.postMessage(go);
      j.wd=setTimeout(()=>{if(this.cur===j&&this.w)this.w.postMessage("stop")},(o.movetime||1500)+(o.depth?6000:3000));
    }else{
      setTimeout(()=>{const lines=jsSearch(j.fen,Math.min(3,o.depth||2),mpv);j.lines=lines;this.finish(j,lines[0]&&lines[0].pv[0])},10);
    }
  }
  label(){return {sf17:"Stockfish 17",sf10:"Stockfish 10",js:"Motor básico",init:"Cargando motor…"}[this.kind]}
}
A64.Engine=Engine;A64.MATE=MATE;A64.PV=PV;
})();
