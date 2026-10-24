/* Archivo 64 — contenido de estudio. © 2026 Ignacio Dubois. Todos los derechos reservados.
   Las jugadas van en notación inglesa (la que entiende chess.js); la app las muestra con dibujito de pieza. */
window.A64 = window.A64 || {};

/* ===================== REPERTORIO ===================== */
A64.OPENINGS = [
/* ---------- CON BLANCAS ---------- */
{ id:"italiana", side:"w", group:"Con blancas · tu base", name:"Italiana", en:"Italian Game",
  idea:"Abrís con el peón del rey, sacás el caballo atacando e5 y el alfil a c4 apuntando a f7, la casilla más débil de las negras porque solo la defiende el rey.",
  moves:[
   ["e4","Ocupás el centro y abrís camino para la dama y el alfil de f1."],
   ["e5","Las negras hacen lo mismo y pelean por el centro."],
   ["Nf3","Desarrollás un caballo hacia el centro y atacás el peón de e5."],
   ["Nc6","El caballo negro defiende e5 y se desarrolla."],
   ["Bc4","El alfil apunta a f7. Además prepara el enroque."],
   ["Bc5","Las negras copian la idea: su alfil apunta a f2."],
   ["c3","Preparás d4 para el futuro y le quitás al caballo negro la casilla d4."],
   ["Nf6","Las negras sacan otra pieza y atacan tu peón de e4."],
   ["d3","Defendés e4 de forma sólida y abrís camino al alfil de c1. Plan tranquilo, sin riesgos."],
   ["d6","Las negras también aseguran su peón de e5."],
   ["O-O","Rey a salvo y torre lista para entrar en juego."],
   ["O-O","Las negras enrocan: posición pareja y llena de juego."]],
  plans:["Te1, después Cbd2–f1–g3: el caballo viaja al flanco de rey.","h3 para que ningún alfil se clave en g4.","Cuando todo está desarrollado, d4 para abrir el centro."],
  traps:[{title:"Trampa de 3...Cd4", moves:["e4","e5","Nf3","Nc6","Bc4","Nd4","Nxe5","Qg5"],
    text:"Si las negras juegan 3...Cd4 parece que regalan el peón de e5. Si lo tomás con el caballo, ...Dg5 ataca tu caballo y g2 a la vez, y si seguís comiendo terminás en mate. Contra 3...Cd4, jugá 4.Cxd4 exd4 5.O-O y quedás mejor."}]
},
{ id:"italiana-2c", side:"w", group:"Con blancas · tu base", name:"Italiana contra 3...Cf6", en:"Two Knights Defense",
  idea:"Si las negras sacan el caballo de rey en vez del alfil, no te tentés con ataques prematuros: defendé e4 con d3 y desarrollá.",
  moves:[
   ["e4","Centro."],["e5","Centro."],["Nf3","Atacás e5."],["Nc6","Defienden e5."],["Bc4","Alfil a la diagonal de f7."],
   ["Nf6","Las negras atacan tu peón de e4 en vez de sacar el alfil."],
   ["d3","Defendés e4. Es la forma más simple: nada queda colgado."],
   ["Be7","El alfil negro elige una casilla tranquila."],
   ["O-O","Enroque."],["O-O","Enroque."],
   ["Re1","La torre apoya el peón de e4 y se prepara para la columna e."],
   ["d6","Las negras aseguran e5."],
   ["c3","Mismo plan de siempre: preparar d4 y darle salida a la dama por b3 o c2."]],
  plans:["Cbd2–f1–g3 como en la Italiana tranquila.","Ab3 para que el alfil no quede expuesto a ...d5 o ...Ca5."],
  traps:[]
},
{ id:"petrov", side:"w", group:"Con blancas · si te salen del libreto", name:"Contra la Petrov (2...Cf6)", en:"Petrov Defense",
  idea:"Las negras atacan e4 en vez de defender e5. Lo más simple es comer en e5 y conocer la trampa de la jugada 3.",
  moves:[
   ["e4","Centro."],["e5","Centro."],["Nf3","Atacás e5."],
   ["Nf6","Las negras contraatacan tu peón de e4."],
   ["Nxe5","Comés primero. Ahora la jugada exacta de las negras es ...d6."],
   ["d6","Echan a tu caballo antes de recuperar el peón."],
   ["Nf3","El caballo vuelve a casa, seguro."],
   ["Nxe4","Las negras recuperan el peón. Material igual."],
   ["d4","Ocupás el centro y preparás Ad3 para echar al caballo de e4."]],
  plans:["Ad3, enroque, Te1 y c4: presión contra el caballo de e4.","Desarrollo rápido: estás un tiempo adelantado."],
  traps:[{title:"Si comen en e4 en la jugada 3", moves:["e4","e5","Nf3","Nf6","Nxe5","Nxe4","Qe2"],
    text:"Si después de 3.Cxe5 las negras comen enseguida con 3...Cxe4??, jugá 4.De2. Si el caballo se va, Cc6+ es un jaque descubierto que gana la dama negra. Lo mejor que tienen es 4...De7 5.Dxe4 d6 6.d4 y quedás con un peón de más."}]
},
{ id:"philidor", side:"w", group:"Con blancas · si te salen del libreto", name:"Contra la Philidor (2...d6)", en:"Philidor Defense",
  idea:"Las negras defienden e5 con un peón y quedan algo pasivas. Ocupá el centro con d4 y desarrollá todo.",
  moves:[
   ["e4","Centro."],["e5","Centro."],["Nf3","Atacás e5."],
   ["d6","Defienden e5 con el peón: sólido pero encierra su alfil de f8."],
   ["d4","Golpeás el centro enseguida."],
   ["exd4","Las negras cambian."],
   ["Nxd4","Tu caballo queda dominante en el centro."],
   ["Nf6","Atacan e4."],
   ["Nc3","Defendés e4 y desarrollás."],
   ["Be7","Desarrollo negro."],
   ["Be2","Alfil afuera, listo para enrocar."]],
  plans:["Enroque, Ae3, Dd2 y f4: más espacio que las negras."],
  traps:[]
},
{ id:"alapin", side:"w", group:"Con blancas · si te salen del libreto", name:"Contra la Siciliana (2.c3)", en:"Sicilian Defense: Alapin Variation",
  idea:"En vez de entrar en la Siciliana abierta, llena de teoría, preparás d4 con c3 para quedarte con dos peones en el centro.",
  moves:[
   ["e4","Centro."],["c5","Siciliana: las negras pelean d4 desde el costado."],
   ["c3","Preparás d4 sin dejar que te cambien el peón por el caballo."],
   ["d5","La respuesta más directa: atacan e4."],
   ["exd5","Cambiás."],["Qxd5","La dama negra sale, pero no puede ser atacada por Cc3 porque tu peón está en c3."],
   ["d4","Igual ocupás el centro."],
   ["Nf6","Desarrollo negro."],
   ["Nf3","Desarrollás y defendés d4."],
   ["e6","Las negras abren su alfil."],
   ["Be2","Alfil afuera y enroque en camino."]],
  plans:["Enroque, Ae3 y Ca3–c4 o Cbd2.","Si 2...Cf6, jugá 3.e5 Cd5 4.d4 con mucho espacio."],
  traps:[]
},
{ id:"francesa", side:"w", group:"Con blancas · si te salen del libreto", name:"Contra la Francesa (3.e5)", en:"French Defense: Advance Variation",
  idea:"Avanzás el peón a e5 y te quedás con espacio. Las negras van a atacar tu cadena de peones desde c5: sostenela con c3.",
  moves:[
   ["e4","Centro."],["e6","Francesa: prepara ...d5."],
   ["d4","Dos peones en el centro."],["d5","Atacan e4."],
   ["e5","Avanzás: ganás espacio y le cortás el paso al caballo de f6."],
   ["c5","Las negras atacan la base de tu cadena, el peón de d4."],
   ["c3","Sostenés d4 con otro peón."],
   ["Nc6","Más presión sobre d4."],
   ["Nf3","Otro defensor para d4."],
   ["Qb6","La dama ataca d4 y b2 a la vez."],
   ["Be2","Desarrollás y preparás el enroque. No juegues Ad3 por ahora: deja colgado d4."]],
  plans:["Enroque, después a3 y b4 para ganar espacio en el flanco de dama.","Si cambian en d4, retomá con el peón de c3."],
  traps:[]
},
{ id:"carokann-w", side:"w", group:"Con blancas · si te salen del libreto", name:"Contra la Caro-Kann (3.e5)", en:"Caro-Kann Defense: Advance Variation",
  idea:"Mismo plan que contra la Francesa: avanzar a e5 y sostener tu centro. El alfil negro sale a f5 antes de cerrarse con ...e6.",
  moves:[
   ["e4","Centro."],["c6","Caro-Kann: prepara ...d5."],
   ["d4","Dos peones en el centro."],["d5","Atacan e4."],
   ["e5","Avanzás y ganás espacio."],
   ["Bf5","El alfil sale antes de que ...e6 lo encierre."],
   ["Nf3","Desarrollo y defensa de d4."],
   ["e6","Las negras arman su cadena."],
   ["Be2","Alfil afuera."],
   ["Nd7","Desarrollo negro, preparando ...c5."],
   ["O-O","Enroque."]],
  plans:["c3 y Cbd2, después Ch4 para cambiar el alfil de f5.","Mantené firme el peón de e5."],
  traps:[]
},
{ id:"escandinava-w", side:"w", group:"Con blancas · si te salen del libreto", name:"Contra la Escandinava (1...d5)", en:"Scandinavian Defense",
  idea:"La dama negra sale temprano. Castigala desarrollando piezas con ataque: cada vez que se tiene que mover, vos ganás un tiempo.",
  moves:[
   ["e4","Centro."],["d5","Escandinava: atacan e4 de inmediato."],
   ["exd5","Comés."],["Qxd5","La dama recupera, pero queda en el centro."],
   ["Nc3","Desarrollás atacando la dama: tiempo ganado."],
   ["Qa5","La dama se aparta a un costado."],
   ["d4","Ocupás el centro."],
   ["Nf6","Desarrollo negro."],
   ["Nf3","Otro caballo afuera."],
   ["Bf5","El alfil negro sale."],
   ["Bc4","Desarrollás todo antes de buscar nada."]],
  plans:["Ad2 para amenazar la dama con el caballo de c3 descubierto.","Enroque y Te1."],
  traps:[]
},
{ id:"pirc-w", side:"w", group:"Con blancas · si te salen del libreto", name:"Contra la Pirc o Moderna (1...d6 o 1...g6)", en:"Pirc Defense",
  idea:"Las negras te regalan el centro para atacarlo después. Tomalo con dos peones, desarrollá y enrocá.",
  moves:[
   ["e4","Centro."],["d6","Pirc: las negras no pelean el centro con peones todavía."],
   ["d4","Tomás el centro."],["Nf6","Atacan e4."],
   ["Nc3","Defendés e4."],["g6","Preparan el alfil en g7."],
   ["Nf3","Desarrollo."],["Bg7","El alfil apunta a tu centro desde lejos."],
   ["Be2","Desarrollo tranquilo."],["O-O","Las negras enrocan."],
   ["O-O","Vos también. Centro grande y piezas bien puestas."]],
  plans:["Te1, h3 y Ae3: no te apures.","Si las negras juegan ...e5, mantené el centro con d5 o cambiá en e5."],
  traps:[]
},

/* ---------- CON NEGRAS contra 1.e4 ---------- */
{ id:"e5-italiana", side:"b", group:"Con negras contra 1.e4", name:"1...e5 contra la Italiana", en:"Italian Game (negras)",
  idea:"Copiás el plan de las blancas: peón al centro, caballos, alfil a c5 y enroque. Tu casilla débil es f7: tenela vigilada.",
  moves:[
   ["e4","Las blancas ocupan el centro."],["e5","Respondés igual: también querés tu parte del centro."],
   ["Nf3","Atacan tu peón de e5."],["Nc6","Lo defendés desarrollando."],
   ["Bc4","El alfil blanco apunta a f7."],["Bc5","Tu alfil apunta a f2, igual que el de ellos."],
   ["c3","Las blancas preparan d4."],["Nf6","Desarrollás atacando e4."],
   ["d3","Defienden e4."],["d6","Asegurás e5 y abrís tu alfil de c8."],
   ["O-O","Las blancas enrocan."],["O-O","Vos también: posición pareja."]],
  plans:["...a6 y ...Aa7 para que el alfil no quede expuesto a b4–b5.","...h6 para que no te claven el caballo con Ag5.","...Ce7–g6 llevando el caballo al flanco de rey."],
  traps:[{title:"Si juegan Cg5 temprano", moves:["e4","e5","Nf3","Nc6","Bc4","Nf6","Ng5","d5"],
    text:"Si jugás 3...Cf6 y las blancas atacan f7 con Cg5, la defensa es 4...d5: cortás la diagonal del alfil. Si después de 5.exd5 retomás con el caballo, cuidado con Cxf7. Más simple: 3...Ac5, como en esta lección."}]
},
{ id:"e5-espanola", side:"b", group:"Con negras contra 1.e4", name:"1...e5 contra la Española", en:"Ruy Lopez (negras)",
  idea:"El alfil blanco presiona tu caballo de c6. Echalo con ...a6 y ...b5, desarrollá y enrocá.",
  moves:[
   ["e4","Centro."],["e5","Centro."],["Nf3","Atacan e5."],["Nc6","Defendés."],
   ["Bb5","El alfil ataca al caballo que defiende e5."],
   ["a6","Le preguntás al alfil qué quiere hacer."],
   ["Ba4","Se mantiene en la diagonal."],["Nf6","Desarrollás atacando e4."],
   ["O-O","Las blancas enrocan: e4 queda defendido de forma indirecta."],
   ["Be7","Alfil tranquilo, listo para enrocar."],
   ["Re1","La torre defiende e4."],
   ["b5","Echás al alfil y ganás espacio."],
   ["Bb3","El alfil se va a b3, apuntando a f7."],
   ["d6","Asegurás e5."],
   ["c3","Las blancas preparan d4."],
   ["O-O","Enroque. Posición clásica y sólida."]],
  plans:["...Ca5 para cambiar el alfil de b3.","...Ab7 o ...Ag4 según la posición.","Si te cambian en c6 (Axc6 dxc6), Cxe5 no gana un peón: ...Dd4 lo recupera."],
  traps:[]
},
{ id:"e5-escocesa", side:"b", group:"Con negras contra 1.e4", name:"1...e5 contra la Escocesa", en:"Scotch Game (negras)",
  idea:"Las blancas abren el centro temprano. Cambiá en d4 y atacá al caballo blanco con el alfil y la dama.",
  moves:[
   ["e4","Centro."],["e5","Centro."],["Nf3","Atacan e5."],["Nc6","Defendés."],
   ["d4","Las blancas abren el centro."],
   ["exd4","Cambiás."],["Nxd4","El caballo blanco queda en el centro."],
   ["Bc5","Atacás ese caballo con el alfil."],
   ["Be3","Lo defienden con el alfil."],
   ["Qf6","Más presión sobre d4 y sobre f2."],
   ["c3","Las blancas sostienen d4 con un peón."],
   ["Nge7","Desarrollás el caballo a e7 para no tapar a tu dama."]],
  plans:["Enroque y ...d6 o ...d5.","Si las blancas cambian en c6, retomá hacia el centro cuando puedas."],
  traps:[]
},
{ id:"e5-dama", side:"b", group:"Con negras contra 1.e4", name:"1...e5 contra la dama temprana", en:"Scholar's Mate (defensa)",
  idea:"El 'mate pastor': dama y alfil contra f7. Se defiende fácil y después la dama blanca queda expuesta: desarrollá atacándola.",
  moves:[
   ["e4","Centro."],["e5","Centro."],
   ["Qh5","La dama sale y ataca e5 y f7."],
   ["Nc6","Defendés e5 desarrollando."],
   ["Bc4","Ahora amenazan Dxf7, mate."],
   ["g6","Echás a la dama y cortás la amenaza. No juegues ...Cf6?? por Dxf7#."],
   ["Qf3","Vuelven a apuntar a f7."],
   ["Nf6","Tapás f7 y desarrollás. Ahora la amenaza es ...Cd4 atacando c2 y la dama."]],
  plans:["...Cd4 y ...Ag7: cada jugada tuya con ataque a la dama es un tiempo ganado.","Enroque rápido."],
  traps:[]
},
{ id:"e5-gambito", side:"b", group:"Con negras contra 1.e4", name:"1...e5 contra el Gambito de Rey", en:"King's Gambit Declined",
  idea:"Las blancas ofrecen el peón de f4. No hace falta aceptarlo: sacá el alfil a c5 y su rey ya no puede enrocar corto con comodidad.",
  moves:[
   ["e4","Centro."],["e5","Centro."],
   ["f4","Gambito de Rey: ofrecen un peón para abrir la columna f."],
   ["Bc5","Lo rehusás: el alfil apunta a g1 y molesta el enroque blanco."],
   ["Nf3","Desarrollo."],["d6","Sostenés e5."],
   ["c3","Las blancas preparan d4."],["Nf6","Desarrollás y atacás e4."]],
  plans:["...Cc6, enroque y ...Ag4.","No comas en f4 a menos que sea claramente bueno."],
  traps:[]
},

/* ---------- CON NEGRAS contra 1.d4 y otras ---------- */
{ id:"rehusado", side:"b", group:"Con negras contra 1.d4", name:"Gambito de Dama Rehusado", en:"Queen's Gambit Declined",
  idea:"No tomás el peón de c4: sostenés d5 con e6. Desarrollo sólido, enroque y después liberás la posición con ...c5 o ...e5.",
  moves:[
   ["d4","Las blancas ocupan el centro con el peón de dama."],["d5","Lo mismo."],
   ["c4","Ofrecen el peón de c4 para sacarte del centro."],
   ["e6","Lo rehusás: sostenés d5 con otro peón."],
   ["Nc3","Más presión sobre d5."],["Nf6","Defendés d5 desarrollando."],
   ["Bg5","Clavan tu caballo: si se mueve, la dama queda atacada."],
   ["Be7","Despejás la clavada."],
   ["e3","Desarrollo blanco."],["O-O","Enroque."],
   ["Nf3","Desarrollo."],["Nbd7","El otro caballo, sin tapar el peón de c."],
   ["Rc1","La torre va a la columna c."],
   ["c6","Sostenés d5 y preparás ...dxc4 y ...Cd5 para liberar."]],
  plans:["...h6 para preguntarle al alfil de g5.","...dxc4 seguido de ...Cd5 para cambiar piezas y respirar.","Liberá el juego con ...c5 o ...e5 cuando estés desarrollado."],
  traps:[{title:"Trampa del Elefante", moves:["d4","d5","c4","e6","Nc3","Nf6","Bg5","Nbd7","cxd5","exd5","Nxd5","Nxd5","Bxd8","Bb4+","Qd2","Bxd2+","Kxd2","Kxd8"],
    text:"Si jugaste ...Cbd7 y las blancas comen en d5 pensando que tu caballo está clavado, ...Cxd5! Si Axd8, ...Ab4+ obliga a Dd2 y recuperás la dama: terminás con una pieza de más."}]
},
{ id:"londres-b", side:"b", group:"Con negras contra 1.d4", name:"Contra el Londres", en:"London System (negras)",
  idea:"El Londres es muy sólido. Armá tu centro con ...d5, ...e6 y ...c5, y aprovechá que el alfil blanco dejó de defender b2.",
  moves:[
   ["d4","Centro."],["d5","Centro."],
   ["Bf4","El Londres: el alfil sale antes de e3."],
   ["Nf6","Desarrollo."],["e3","Las blancas abren el otro alfil."],
   ["c5","Atacás d4 y abrís la diagonal de tu dama hacia b2."],
   ["c3","Sostienen d4."],["Nc6","Más presión sobre d4."],
   ["Nd2","Desarrollo blanco."],["e6","Abrís tu alfil de f8."],
   ["Ngf3","Desarrollo."],["Bd6","Ofrecés cambiar el alfil más activo de las blancas."]],
  plans:["...Db6 para atacar b2 y d4 a la vez.","Enroque y ...De7 preparando ...e5."],
  traps:[]
},
{ id:"inglesa-b", side:"b", group:"Con negras contra 1.d4", name:"Contra 1.c4 (Inglesa)", en:"English Opening (negras)",
  idea:"Si arrancan con c4, jugá ...e5: es como una Siciliana con los colores al revés y vos con un tiempo menos, pero sin problemas.",
  moves:[
   ["c4","Las blancas controlan d5 desde el costado."],["e5","Tomás tu parte del centro."],
   ["Nc3","Desarrollo."],["Nf6","Desarrollo."],
   ["g3","Preparan el alfil en g2."],["d5","Golpeás el centro."],
   ["cxd5","Cambian."],["Nxd5","Tu caballo queda centralizado."],
   ["Bg2","El alfil blanco ataca tu caballo."],["Nb6","Lo retirás a un lugar seguro."],
   ["Nf3","Atacan e5."],["Nc6","Lo defendés."]],
  plans:["...Ae7, enroque y ...Ae6.","Contra 1.Cf3, jugá ...d5 y ...Cf6 y armá un centro como en el Rehusado."],
  traps:[]
}
];

/* ===================== TARJETAS DE ESTRATEGIA ===================== */
/* Cada tarjeta: posición (por jugadas o FEN), pregunta en el frente y regla con porqué al dorso. */
A64.CARDS = [
 {id:"centro",phase:"Apertura",moves:["e4","e5","Nf3","Nc6"],q:"¿Por qué las dos partes empiezan con peones al centro?",rule:"El centro manda.",why:"Desde las casillas centrales las piezas controlan más del tablero, y los peones en d4–e4 o d5–e5 le abren camino a tus alfiles y a tu dama."},
 {id:"desarrollo",phase:"Apertura",moves:["e4","e5","Nf3","Nc6","Bc4","Bc5"],q:"¿Qué es más importante en las primeras jugadas?",rule:"Una pieza nueva por jugada.",why:"Cada jugada de apertura saca una pieza que todavía no se movió. Mover dos veces la misma pieza le regala tiempo al rival."},
 {id:"dama",phase:"Apertura",moves:["e4","e5","Qh5","Nc6","Bc4","g6","Qf3","Nf6"],q:"La dama blanca salió temprano. ¿Qué gana el rival?",rule:"La dama sale tarde.",why:"Si la dama sale antes que las piezas menores, el rival la ataca mientras desarrolla y gana tiempos. Primero caballos y alfiles."},
 {id:"borde",phase:"Apertura",fen:"r1bqkbnr/pppp1ppp/2n5/4p3/4P3/N7/PPPP1PPP/R1BQKBNR w KQkq - 2 3",q:"¿Qué tiene de malo el caballo de a3?",rule:"Caballo en el borde, caballo triste.",why:"En el borde un caballo controla como mucho 4 casillas; en el centro, 8. Siempre que puedas, llevalo a c3, f3, c6 o f6."},
 {id:"enroque",phase:"Apertura",moves:["e4","e5","Nf3","Nc6","Bc4","Bc5","O-O"],q:"¿Para qué sirve enrocar temprano?",rule:"Enrocá antes de la jugada 10.",why:"El rey sale del centro, donde se abren las columnas, y la torre entra en juego. Un rey en el centro es blanco fácil de jaques y ataques."},
 {id:"peones-enroque",phase:"Apertura",fen:"r1bq1rk1/pppp1pp1/2n2n1p/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",q:"Las negras jugaron ...h6. ¿Cuándo conviene mover los peones del enroque?",rule:"No toques los peones de tu enroque sin motivo.",why:"Cada peón que avanza frente a tu rey deja un hueco. Movelos solo para evitar algo concreto, como una clavada con Ag5."},
 {id:"torres",phase:"Apertura",fen:"r4rk1/pp2qppp/2nbbn2/3p4/3P4/2NBBN2/PP2QPPP/R4RK1 w - - 0 11",q:"Ya sacaste todas las piezas menores y la dama. ¿Qué falta?",rule:"Conectá las torres.",why:"Cuando entre tus torres no queda ninguna pieza, se defienden entre sí y pueden ir a la columna que quieran. Ahí terminó tu desarrollo."},
 {id:"cct",phase:"Medio juego",moves:["e4","e5","Nf3","Nc6","Bc4","Nf6","Ng5"],q:"El rival acaba de jugar. ¿Qué es lo primero que tenés que mirar?",rule:"Jaques, capturas y amenazas.",why:"Antes de pensar tu plan, preguntate qué quiere hacer el rival con su última jugada: ¿qué ataca? Acá el caballo de g5 amenaza Cxf7."},
 {id:"contar",phase:"Medio juego",fen:"4k3/8/3r4/8/3p4/5N2/3R4/4K3 w - - 0 1",q:"¿Podés comer el peón de d4?",rule:"Contá atacantes y defensores.",why:"El peón de d4 lo atacan tu caballo y tu torre (2) y lo defiende la torre negra (1). Si atacás más veces de las que defienden, podés comer. Cxd4 gana un peón."},
 {id:"colgada",phase:"Medio juego",fen:"r1bqk2r/pppp1ppp/2n5/2b1p3/2B1n3/5N2/PPPP1PPP/RNBQ1RK1 w kq - 0 5",q:"¿Qué pieza negra está sin defender?",rule:"Pieza sin defensor, pieza en peligro.",why:"El caballo de e4 no lo defiende nadie. Antes de cada jugada revisá cuáles de tus piezas no tienen defensor: son las primeras que el rival va a buscar."},
 {id:"horquilla",phase:"Medio juego",fen:"r3k3/ppp2ppp/8/3N4/8/8/PPP2PPP/4K3 w - - 0 1",q:"¿Qué jugada ataca dos piezas a la vez?",rule:"Horquilla: un ataque, dos blancos.",why:"Cxc7+ da jaque al rey y ataca la torre de a8. El rey tiene que salir y perdés la torre. Los caballos son los reyes de la horquilla: mirá siempre a dónde pueden saltar."},
 {id:"clavada",phase:"Medio juego",moves:["e4","e5","Nf3","Nc6","Bb5","d6"],q:"¿Por qué el caballo de c6 no se puede mover?",rule:"Clavada: la pieza no se puede mover sin dejar expuesto algo más valioso.",why:"El alfil de b5 ataca el caballo de c6 y detrás está el rey de e8. Si el caballo se mueve, el rey quedaría en jaque, y eso no está permitido. Una pieza clavada no defiende bien: atacala con más piezas, por ejemplo con d4–d5."},
 {id:"ensartada",phase:"Medio juego",fen:"7R/8/8/3k4/8/8/7K/3q4 w - - 0 1",q:"¿Cómo se gana la dama negra?",rule:"Ensartada: atacás la pieza grande y detrás cae la otra.",why:"Es una clavada al revés: la pieza valiosa está adelante. Td8+ da jaque por la columna d; el rey se tiene que correr y la dama de d1, que estaba detrás, cae."},
 {id:"descubierto",phase:"Medio juego",fen:"8/4q3/8/7k/4N3/8/8/4R1K1 w - - 0 1",q:"El caballo tapa a la torre. ¿Qué pasa si se mueve con jaque?",rule:"Ataque descubierto: una pieza se mueve y destapa a otra.",why:"Cg3+ da jaque al rey y además destapa la torre contra la dama de e7. Las negras tienen que salvar al rey y la dama cae. Ojo: Cf6+ también es jaque, pero ahí la dama se come al caballo."},
 {id:"pasillo",phase:"Medio juego",fen:"6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1",q:"El rey negro está encerrado detrás de sus peones. ¿Qué jugada da mate?",rule:"Mate del pasillo.",why:"Td8#. El rey no puede escapar porque sus propios peones le tapan la salida. Para evitarlo en tus partidas, abrí una ventana con h3 o g3 cuando haya torres en juego."},
 {id:"columnas",phase:"Medio juego",fen:"2r2rk1/pp3ppp/2n1pn2/q7/3P4/P1N1PN2/1P3PPP/2RQ1RK1 w - - 0 14",q:"¿Dónde rinden más las torres?",rule:"Torres a las columnas abiertas.",why:"Una columna sin peones es una autopista para la torre: desde ahí entra a la séptima fila y ataca peones y al rey."},
 {id:"cambios",phase:"Medio juego",fen:"r3k3/pp3ppp/8/8/8/8/PPPR1PPP/3R2K1 w - - 0 1",q:"Tenés una torre de más. ¿Te conviene cambiar piezas?",rule:"Si vas ganando, cambiá piezas. Si vas perdiendo, evitá los cambios.",why:"Con menos piezas en el tablero, una ventaja de material pesa más y el rival tiene menos chances de armar una trampa."},
 {id:"f7",phase:"Medio juego",moves:["e4","e5","Bc4","Nc6","Qh5"],q:"¿Por qué tantas trampas apuntan a f7 (o a f2)?",rule:"f7 y f2 son los puntos débiles al empezar.",why:"Al inicio solo los defiende el rey. Dama y alfil apuntando ahí pueden dar mate en pocas jugadas: vigilalo siempre."},
 {id:"rey-final",phase:"Final",fen:"8/5kpp/8/8/8/8/5KPP/8 w - - 0 1",q:"Quedan solo los reyes y algunos peones. ¿Qué hacés con el rey?",rule:"En el final, el rey ataca.",why:"Sin damas en el tablero el rey ya no corre peligro: llevalo al centro, es una pieza fuerte que defiende tus peones y ataca los del rival."},
 {id:"pasado",phase:"Final",fen:"8/5k2/8/3P4/8/8/5K2/8 w - - 0 1",q:"¿Qué hacés con un peón pasado?",rule:"Peón pasado, peón que se empuja.",why:"Un peón sin peones rivales delante ni a los costados puede coronar. Empujalo con apoyo: el rival va a tener que usar piezas para frenarlo."},
 {id:"cuadrado",phase:"Final",fen:"8/8/8/1P6/8/8/6k1/8 b - - 0 1",q:"¿Llega el rey negro a frenar el peón de b5?",rule:"La regla del cuadrado.",why:"Imaginá un cuadrado desde el peón hasta la casilla de coronar (b5–b8–e8–e5). Si el rey puede entrar en ese cuadrado en su turno, lo alcanza. Acá no llega: el peón corona."},
 {id:"oposicion",phase:"Final",fen:"4k3/8/4K3/4P3/8/8/8/8 w - - 0 1",q:"Rey frente a rey con una casilla en el medio. ¿Quién gana esa pelea?",rule:"La oposición.",why:"Cuando los reyes quedan enfrentados con una casilla de por medio, el que NO tiene que mover gana la pelea: el otro tiene que ceder paso. Acá las blancas ganan igual porque su rey ya está delante del peón en la sexta fila."},
 {id:"torre-detras",phase:"Final",fen:"8/5k2/8/P7/8/8/5K2/R7 w - - 0 1",q:"¿Dónde va la torre con un peón pasado?",rule:"Torre detrás del peón pasado.",why:"Detrás del peón, la torre lo empuja cada vez con más fuerza a medida que avanza; delante, le tapa el camino."},
 {id:"ahogado",phase:"Final",fen:"k7/2Q5/1K6/8/8/8/8/8 b - - 0 1",q:"Las negras mueven y no tienen jugadas, pero no están en jaque. ¿Qué pasó?",rule:"Cuidado con el ahogado.",why:"Si el rival no tiene jugadas legales y no está en jaque, es tablas. Con dama de más, dejale siempre una casilla al rey hasta que puedas dar mate."}
];

/* ===================== PUZZLES PROPIOS ===================== */
/* La solución la verifica el motor; acá van la posición, el tema y una pista. */
A64.PUZZLES = [
 {id:"p-pasillo",theme:"Mate del pasillo",fen:"6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1",hint:"El rey negro no tiene salida."},
 {id:"p-pastor",theme:"Mate en f7",moves:["e4","e5","Bc4","Nc6","Qf3","d6"],hint:"Dama y alfil apuntan al mismo punto."},
 {id:"p-horquilla",theme:"Horquilla de caballo",fen:"r3k3/ppp2ppp/8/3N4/8/8/PPP2PPP/4K3 w - - 0 1",hint:"Un salto con jaque."},
 {id:"p-peon",theme:"Horquilla de peón",fen:"4k3/pp4pp/8/2n1n3/8/8/3P1PPP/R5K1 w - - 0 1",hint:"El peón también ataca dos casillas."},
 {id:"p-coz",theme:"Mate en 1",fen:"6rk/6pp/7N/8/8/1Q6/6PP/6K1 w - - 0 1",hint:"El rey está rodeado por sus propias piezas."},
 {id:"p-descubierto",theme:"Ataque descubierto",fen:"8/4q3/8/7k/4N3/8/8/4R1K1 w - - 0 1",hint:"Mové el caballo con jaque, a una casilla donde la dama no lo alcance."},
 {id:"p-blackburne",theme:"Castigo de la codicia",moves:["e4","e5","Nf3","Nc6","Bc4","Nd4","Nxe5","Qg5","Nxf7"],hint:"Hay un peón blanco sin defensa cerca del rey."},
 {id:"p-elefante",theme:"Trampa del Elefante",moves:["d4","d5","c4","e6","Nc3","Nf6","Bg5","Nbd7","cxd5","exd5","Nxd5"],hint:"El caballo de f6 no está tan clavado como parece."},
 {id:"p-petrov",theme:"Jaque descubierto",moves:["e4","e5","Nf3","Nf6","Nxe5","Nxe4","Qe2","Nf6"],hint:"Tu caballo tapa a tu dama, que mira al rey negro."},
 {id:"p-dama",theme:"Mate con dama",fen:"k7/2K5/8/8/8/8/8/7Q w - - 0 1",hint:"El rey blanco ya cubre las salidas."},
 {id:"p-ensartada",theme:"Ensartada",fen:"7R/8/8/3k4/8/8/7K/3q4 w - - 0 1",hint:"Jaque en una línea donde haya algo detrás del rey."}
];

/* ===================== FINALES ESENCIALES ===================== */
A64.ENDGAMES = [
 {id:"kq",name:"Mate con dama",fen:"8/8/8/4k3/8/8/8/4K2Q w - - 0 1",goal:"mate",par:12,
  method:["Usá la dama para encerrar al rey en una caja cada vez más chica, a un salto de caballo de distancia.","Cuando el rey quede en el borde, acercá tu rey.","Ojo con el ahogado: dejale siempre una casilla."]},
 {id:"krr",name:"Mate con dos torres",fen:"8/8/8/4k3/8/8/8/RR2K3 w - - 0 1",goal:"mate",par:10,
  method:["La escalera: una torre corta una fila y la otra da jaque en la siguiente.","Se van turnando y empujan al rey hasta el borde.","Si el rey se acerca a una torre, llevala al otro extremo de la fila."]},
 {id:"kr",name:"Mate con torre",fen:"8/8/8/4k3/8/8/8/R3K3 w - - 0 1",goal:"mate",par:20,
  method:["La torre corta al rey en una parte del tablero.","Tu rey se acerca enfrentado al otro (oposición).","Cuando los reyes quedan enfrentados, el jaque de torre empuja al rival una fila."]},
 {id:"kp",name:"Rey y peón contra rey",fen:"4k3/8/4K3/4P3/8/8/8/8 w - - 0 1",goal:"queen",par:8,
  method:["El rey va adelante del peón, no detrás.","Ganá la oposición: enfrentá al rey rival con una casilla de por medio.","Empujá el peón solo cuando tu rey le abre paso."]}
];

/* ===================== AGENTES ===================== */
A64.AGENTS = {
 ferreyra:{name:"Analista Ferreyra",ini:"AF",role:"Entrenador",line:"Te digo la verdad aunque duela. Después la arreglamos."},
 brizuela:{name:"Agente Brizuela",ini:"AB",style:"agresivo",role:"Agresivo",line:"Si veo a tu rey, voy a buscarlo.",desc:"Busca jaques, capturas y ataques al rey."},
 lemos:{name:"Agente Lemos",ini:"AL",style:"posicional",role:"Posicional",line:"Despacio. Cada pieza a su casilla.",desc:"Juega lento, ocupa el centro y espera tu error."},
 quiroga:{name:"Agente Quiroga",ini:"AQ",style:"tramposo",role:"Tramposo",line:"¿Ese peón? Llevalo, es un regalo.",desc:"Prepara trampas de apertura conocidas."},
 sosa:{name:"Agente Sosa",ini:"AS",style:"defensivo",role:"Defensivo",line:"Cambio todo y vemos quién se cansa primero.",desc:"Cambia piezas y busca finales."}
};
A64.RANKS = ["Pasante","Archivista","Analista","Inspector","Jefe de sección","Director"];
/* Líneas de trampa que juega el agente tramposo (si el rival le da la oportunidad). */
A64.TRAP_BOOK = [
 ["e4","e5","Nf3","Nc6","Bc4","Nd4"],
 ["e4","e5","Bc4","Nc6","Qh5"],
 ["e4","e5","Qh5"],
 ["d4","e5"],
 ["d4","d5","c4","e6","Nc3","Nf6","Bg5","Nbd7"],
 ["e4","e5","Nf3","Nf6"],
 ["e4","e5","Nf3","Nc6","Bc4","Nf6","Ng5"]
];
A64.PUZZLE_SOL = {"p-pasillo":["d1d8"],"p-pastor":["f3f7"],"p-horquilla":["d5c7","e8d7","c7a8"],"p-peon":["d2d4"],"p-coz":["b3g8"],"p-descubierto":["e4g3","h5g4","e1e7"],"p-blackburne":["g5g2","f7g5","g2h1"],"p-elefante":["f6d5","g5d8","f8b4"],"p-petrov":["e5c6","d8e7","c6e7"],"p-dama":["h1a1"],"p-ensartada":["h8d8","d5e5","d8d1"]};
