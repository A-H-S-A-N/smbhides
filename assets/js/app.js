(function(){'use strict';
/* ===== Core helpers ===== */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const DPR=Math.min(window.devicePixelRatio||1,2);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function store(k,v){try{if(v===undefined){const r=localStorage.getItem('orvane:'+k);return r?JSON.parse(r):null}localStorage.setItem('orvane:'+k,JSON.stringify(v))}catch(e){return null}}
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const hexToRgb=h=>{const c=parseInt(h.slice(1),16);return[c>>16,(c>>8)&255,c&255]};
const toHex=(r,g,b)=>'#'+[r,g,b].map(v=>clamp(Math.round(v),0,255).toString(16).padStart(2,'0')).join('');
function shade(h,f){const[r,g,b]=hexToRgb(h);return f>=0?toHex(r+(255-r)*f,g+(255-g)*f,b+(255-b)*f):toHex(r*(1+f),g*(1+f),b*(1+f))}
function mixHex(a,b,t){const A=hexToRgb(a),B=hexToRgb(b);return toHex(lerp(A[0],B[0],t),lerp(A[1],B[1],t),lerp(A[2],B[2],t))}
let toastT=0;
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('on'),2600)}
function onVisible(el,fn,opts){if(!('IntersectionObserver' in window)){fn(true);return}const io=new IntersectionObserver(es=>es.forEach(e=>fn(e.isIntersecting)),opts||{rootMargin:'120px'});io.observe(el);return io}
function sizeCanvas(cv,cap){const r=cv.getBoundingClientRect();const d=cap||DPR;const w=Math.max(2,Math.round(r.width*d)),h=Math.max(2,Math.round(r.height*d));if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h;return true}return false}

/* ===== Catalogue data ===== */
const TINTS={natural:{name:'Natural',hex:'#C69C6D'},saddle:{name:'Saddle',hex:'#8B5A2B'},cognac:{name:'Cognac',hex:'#A0522D'},espresso:{name:'Espresso',hex:'#3A2315'},noir:{name:'Noir',hex:'#1C1A19'}};
const MATS={
  full:{name:'Full-Grain',add:0,rough:.55,bump:1.1,note:'Untouched natural surface'},
  pebble:{name:'Pebble Grain',add:40,rough:.5,bump:1.6,note:'Embossed, forgiving of scratches'},
  suede:{name:'Suede',add:60,rough:.96,bump:.5,note:'Velvet nap, brushed by hand'},
  exotic:{name:'Exotic',add:640,rough:.28,bump:1.8,note:'Hand-scaled, deep lacquer'}
};
const HW={
  brass:{name:'Antique Brass',hex:'#8C6B2E',rough:.42,add:0},
  gold:{name:'Polished Gold',hex:'#E2B94B',rough:.14,add:90},
  gunmetal:{name:'Brushed Gunmetal',hex:'#4B4F55',rough:.38,add:30},
  palladium:{name:'Palladium',hex:'#CDD0D4',rough:.18,add:120}
};
const STAMPS={blind:{name:'Blind Deboss',add:0},gold:{name:'Gold Foil',add:35},silver:{name:'Silver Foil',add:35}};
const PRODUCTS=[
 {id:'meridian',name:'The Meridian Briefcase',cat:'Briefcase',price:1480,cm:[40,30,10],tint:'saddle',carry:'hand',
  m:{flap:1,handle:'top',clasps:2,feet:1},
  blurb:'A structured flap-over briefcase cut from a single hide. Hand-stitched seams, solid clasps and a handle that softens to your grip.',
  specs:[['Dimensions','40 × 30 × 10 cm'],['Fits','15-inch laptop, A4 folders'],['Weight','1.9 kg'],['Lining','Pigskin, hand-glued']]},
 {id:'santacroce',name:'The Santa Croce Tote',cat:'Handbag',price:1120,cm:[36,30,15],tint:'cognac',carry:'arm',
  m:{handle:'twin',stud:1,feet:1},
  blurb:'An open-top tote with a magnetic stud and two rolled handles. Light enough for every day, structured enough for the office.',
  specs:[['Dimensions','36 × 30 × 15 cm'],['Fits','13-inch laptop, daily essentials'],['Weight','1.1 kg'],['Handle drop','19 cm']]},
 {id:'aldwych',name:'The Aldwych Weekender',cat:'Travel',price:1890,cm:[52,28,24],tint:'espresso',carry:'hand',
  m:{handle:'twin',zip:1,feet:1},
  blurb:'Two nights, one bag. A zip-top duffel in thick-cut hide with reinforced handles and solid feet that keep it off wet floors.',
  specs:[['Dimensions','52 × 28 × 24 cm'],['Capacity','34 litres'],['Weight','2.6 kg'],['Zip','Heavy-gauge, self-locking']]},
 {id:'ubrique',name:'The Ubrique Messenger',cat:'Crossbody',price:960,cm:[34,26,8],tint:'natural',carry:'hip',
  m:{flap:1,handle:'top',buckle:1,feet:0},
  blurb:'A slim crossbody with a single buckle strap. Cut in the sierra town that has worked leather for centuries.',
  specs:[['Dimensions','34 × 26 × 8 cm'],['Fits','11-inch tablet, A5 notebook'],['Weight','0.9 kg'],['Strap','Adjustable, 120 cm drop']]},
 {id:'piazza',name:'The Piazza Card Holder',cat:'Small goods',price:210,cm:[10,7.5,1.2],tint:'noir',carry:'hand',
  m:{pocket:1},
  blurb:'Six cards and folded notes in a pocket that opens to the thumb. Edges burnished four times by hand.',
  specs:[['Dimensions','10 × 7.5 × 1.2 cm'],['Capacity','6 cards, folded notes'],['Weight','45 g'],['Edges','Hand-painted, four coats']]},
 {id:'brera',name:'The Brera Document Folio',cat:'Portfolio',price:640,cm:[38,28,3],tint:'espresso',carry:'hand',
  m:{zip:1},
  blurb:'A zipped folio for drawings, contracts and an iPad. Flat enough for a bag, handsome enough to carry alone.',
  specs:[['Dimensions','38 × 28 × 3 cm'],['Fits','A4 documents, 11-inch tablet'],['Weight','0.7 kg'],['Zip','Heavy-gauge, self-locking']]}
];
const byId=id=>PRODUCTS.find(p=>p.id===id)||PRODUCTS[0];
const CUR={USD:{r:1,l:'en-US'},EUR:{r:.92,l:'de-DE'},GBP:{r:.79,l:'en-GB'},AED:{r:3.67,l:'en-AE'},PKR:{r:279,l:'en-PK'}};

/* ===== State ===== */
const state={
  view:'home',pid:'meridian',mat:'full',tint:'saddle',hw:'brass',mono:'',stamp:'blind',qty:1,
  cur:(store('cur')&&CUR[store('cur')])?store('cur'):'USD',
  cart:Array.isArray(store('cart'))?store('cart'):[],
  wish:Array.isArray(store('wish'))?store('wish'):[],
  pat:'natural',gift:false,rib:'chestnut',note:'',sign:'',cert:true
};
function money(usd){
  const c=CUR[state.cur];
  try{return new Intl.NumberFormat(c.l,{style:'currency',currency:state.cur,maximumFractionDigits:0}).format(usd*c.r)}
  catch(e){return state.cur+' '+Math.round(usd*c.r)}
}
const pf=p=>clamp(p.price/1480,.25,1.3);
const r5=v=>Math.round(v/5)*5;
function unitPrice(p,cfg){
  const f=pf(p),c=cfg||state;
  return p.price+r5(MATS[c.mat].add*f)+r5(HW[c.hw].add*f)+(c.mono&&c.mono.length?r5(STAMPS[c.stamp].add*f):0);
}
function cfgSummary(c){
  return MATS[c.mat].name+' · '+TINTS[c.tint].name+' · '+HW[c.hw].name+(c.mono?' · Monogram “'+c.mono+'” ('+STAMPS[c.stamp].name+')':'');
}

/* ===== Product artwork (SVG, 200 x 200) ===== */
function productArt(type,col,acc){
  const dk=shade(col,-.3),lt=shade(col,.18),br=acc||'#D4AF37',st='rgba(245,245,220,.55)';
  const A={
  briefcase:`<path d="M72 54c0-26 56-26 56 0" fill="none" stroke="${dk}" stroke-width="7" stroke-linecap="round"/><rect x="22" y="52" width="156" height="104" rx="12" fill="${col}"/><path d="M22 64a12 12 0 0 1 12-12h132a12 12 0 0 1 12 12v40a14 14 0 0 1-14 14H36a14 14 0 0 1-14-14Z" fill="${lt}" opacity=".5"/><rect x="31" y="61" width="138" height="52" rx="9" fill="none" stroke="${st}" stroke-width="1.6" stroke-dasharray="5 4"/><rect x="58" y="110" width="22" height="26" rx="3" fill="${br}"/><rect x="120" y="110" width="22" height="26" rx="3" fill="${br}"/>`,
  tote:`<path d="M62 62c0-48 76-48 76 0" fill="none" stroke="${dk}" stroke-width="6" stroke-linecap="round"/><path d="M34 62h132l-10 96H44Z" fill="${col}"/><path d="M34 62h132l-2 18H36Z" fill="${lt}" opacity=".45"/><path d="M42 72h116l-8 78H50Z" fill="none" stroke="${st}" stroke-width="1.6" stroke-dasharray="5 4"/><circle cx="100" cy="80" r="5" fill="${br}"/>`,
  weekender:`<path d="M52 66c0-30 30-30 30 0M118 66c0-30 30-30 30 0" fill="none" stroke="${dk}" stroke-width="6" stroke-linecap="round"/><rect x="12" y="64" width="176" height="86" rx="40" fill="${col}"/><path d="M30 80h140" stroke="${dk}" stroke-width="5"/><rect x="146" y="76" width="10" height="9" rx="2" fill="${br}"/><rect x="24" y="72" width="152" height="70" rx="34" fill="none" stroke="${st}" stroke-width="1.6" stroke-dasharray="5 4"/>`,
  messenger:`<path d="M30 70C40 14 160 14 170 70" fill="none" stroke="${dk}" stroke-width="5" stroke-linecap="round"/><rect x="26" y="62" width="148" height="94" rx="10" fill="${col}"/><path d="M26 72a10 10 0 0 1 10-10h128a10 10 0 0 1 10 10v36a12 12 0 0 1-12 12H38a12 12 0 0 1-12-12Z" fill="${lt}" opacity=".5"/><rect x="88" y="104" width="24" height="42" rx="3" fill="${dk}"/><rect x="85" y="98" width="30" height="22" rx="3" fill="none" stroke="${br}" stroke-width="4"/>`,
  cardholder:`<rect x="42" y="56" width="116" height="88" rx="8" fill="${col}"/><path d="M42 84h116v52a8 8 0 0 1-8 8H50a8 8 0 0 1-8-8Z" fill="${lt}" opacity=".5"/><path d="M42 84h116" stroke="${dk}" stroke-width="2"/><rect x="50" y="64" width="100" height="72" rx="5" fill="none" stroke="${st}" stroke-width="1.6" stroke-dasharray="4 3"/>`,
  folio:`<rect x="38" y="30" width="124" height="140" rx="10" fill="${col}"/><path d="M52 44h96" stroke="${dk}" stroke-width="5"/><rect x="140" y="40" width="9" height="9" rx="2" fill="${br}"/><rect x="48" y="38" width="104" height="124" rx="6" fill="none" stroke="${st}" stroke-width="1.6" stroke-dasharray="5 4"/>`
  };
  return `<svg viewBox="0 0 200 200" role="img" aria-hidden="true">${A[type]||A.briefcase}</svg>`;
}
const ART_TYPE={meridian:'briefcase',santacroce:'tote',aldwych:'weekender',ubrique:'messenger',piazza:'cardholder',brera:'folio'};
const artFor=(p,tint)=>productArt(ART_TYPE[p.id],TINTS[tint||p.tint].hex,'#D4AF37');

/* ===== World leather renderer (resolution independent) =====
   World is 2000 x 1300 units; 1 unit = 0.03 mm. Used by hero imagery,
   product cards, gallery, loupe and the deep-zoom macro viewer. */
const LD={pores:[],creases:[],cells:[],fibers:[],mottle:null};
(function(){
  const r=mulberry(11);
  for(let i=0;i<9000;i++)LD.pores.push([r()*1740,r()*1300,1.6+r()*3.2,r()*Math.PI]);
  for(let i=0;i<36;i++){const pts=[];let x=r()*1700,y=r()*1300,a=r()*6.28;for(let k=0;k<7;k++){pts.push([x,y]);a+=(r()-.5)*1.1;x+=Math.cos(a)*90;y+=Math.sin(a)*90}LD.creases.push(pts)}
  const cs=54;let row=0;for(let y=-cs;y<1300+cs;y+=cs*.86,row++){const off=(row%2)*cs/2;for(let x=-cs;x<1760+cs;x+=cs)LD.cells.push([x+off+(r()-.5)*14,y+(r()-.5)*14,cs*(.46+r()*.1)])}
  for(let i=0;i<110;i++)LD.fibers.push([1745+r()*45,r()*1300,20+r()*80,r()]);
  const m=document.createElement('canvas');m.width=500;m.height=325;const c=m.getContext('2d');
  for(let i=0;i<70;i++){const x=r()*500,y=r()*325,rad=30+r()*90,g=c.createRadialGradient(x,y,0,x,y,rad),dark=r()<.5;g.addColorStop(0,dark?'rgba(0,0,0,.17)':'rgba(255,235,200,.12)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(x-rad,y-rad,rad*2,rad*2)}
  LD.mottle=m;
})();
const POI={
  overview:{label:'Overview',cx:1000,cy:650,zoom:1,title:'The full swatch',text:'A 60 mm cut from the shoulder of the hide, shown as it leaves the cutting table.'},
  grain:{label:'Grain pores',cx:520,cy:560,zoom:2.6,title:'Natural grain pores',text:'Each pore marks a hair follicle. No two hides share a pattern, and nothing is sanded away.'},
  stitch:{label:'Stitching',cx:1300,cy:650,zoom:2.6,title:'Saddle-stitch tension',text:'Two needles, one thread. Every stitch is pulled to the same depth in the channel.'},
  edge:{label:'Edge paint',cx:1690,cy:520,zoom:3.2,title:'Burnished, painted edge',text:'Four coats of edge paint, each sanded and burnished by hand before the next.'}
};
function worldScale(cv){return Math.min(cv.width/2000,cv.height/1300)}
function matKind(m){return m==='pebble'||m==='exotic'?'pebble':'grain'}
function drawLeather(cv,view,opt){
  const ctx=cv.getContext('2d'),W=cv.width,H=cv.height,s=view.scale,hex=opt.hex||'#8B5A2B',kind=opt.kind||'grain',soft=!!opt.soft,bold=!!opt.bold;
  ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#0b0a09';ctx.fillRect(0,0,W,H);
  ctx.setTransform(s,0,0,s,W/2-view.cx*s,H/2-view.cy*s);
  const x0=view.cx-W/2/s,x1=view.cx+W/2/s,y0=view.cy-H/2/s,y1=view.cy+H/2/s;
  ctx.fillStyle=hex;ctx.fillRect(0,0,1790,1300);
  ctx.drawImage(LD.mottle,0,0,1790,1300);
  if(kind==='pebble'){
    for(const c of LD.cells){
      if(c[0]>1745||c[0]+c[2]<x0||c[0]-c[2]>x1||c[1]+c[2]<y0||c[1]-c[2]>y1)continue;
      if(s<.3){ctx.fillStyle='rgba(0,0,0,.26)';ctx.beginPath();ctx.arc(c[0],c[1],c[2],0,6.2832);ctx.fill();ctx.fillStyle='rgba(255,235,205,.10)';ctx.beginPath();ctx.arc(c[0]-c[2]*.18,c[1]-c[2]*.18,c[2]*.62,0,6.2832);ctx.fill();continue}
      const g=ctx.createRadialGradient(c[0]-c[2]*.3,c[1]-c[2]*.3,c[2]*.1,c[0],c[1],c[2]);
      g.addColorStop(0,bold?'rgba(255,240,215,.26)':'rgba(255,235,205,.18)');g.addColorStop(.62,'rgba(0,0,0,0)');g.addColorStop(1,bold?'rgba(0,0,0,.62)':'rgba(0,0,0,.42)');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(c[0],c[1],c[2],0,6.2832);ctx.fill();
    }
  }else{
    const step=s<.18?3:s<.3?2:1;ctx.fillStyle=soft?'rgba(15,6,0,.16)':'rgba(15,6,0,.32)';
    for(let i=0;i<LD.pores.length;i+=step){const p=LD.pores[i];if(p[0]<x0-8||p[0]>x1+8||p[1]<y0-8||p[1]>y1+8)continue;
      const rr=p[2];if(rr*s<1.4)ctx.fillRect(p[0],p[1],rr*1.6,rr*1.6);else{ctx.beginPath();ctx.ellipse(p[0],p[1],rr,rr*.7,p[3],0,6.2832);ctx.fill()}}
    if(s>1.4&&!soft){ctx.fillStyle='rgba(255,225,190,.11)';for(let i=0;i<LD.pores.length;i++){const p=LD.pores[i];if(p[0]<x0-8||p[0]>x1+8||p[1]<y0-8||p[1]>y1+8)continue;ctx.beginPath();ctx.ellipse(p[0]+p[2]*.55,p[1]+p[2]*.65,p[2]*.8,p[2]*.5,p[3],0,6.2832);ctx.fill()}}
    ctx.strokeStyle='rgba(10,4,0,.10)';ctx.lineWidth=3;
    for(const pts of LD.creases){ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(let k=1;k<pts.length;k++)ctx.lineTo(pts[k][0],pts[k][1]);ctx.stroke()}
  }
  /* stitch channel and thread */
  const sx=1300;
  if(sx>x0-60&&sx<x1+60){
    ctx.fillStyle='rgba(0,0,0,.30)';ctx.fillRect(sx-4,70,8,1160);ctx.fillStyle='rgba(255,230,190,.12)';ctx.fillRect(sx+4,70,3,1160);
    const thread='#E6DCC0';
    for(let k=0;k<10;k++){
      const ya=110+k*117,yb=ya+117;if(yb<y0-40||ya>y1+40)continue;
      ctx.fillStyle='rgba(0,0,0,.55)';ctx.beginPath();ctx.ellipse(sx,ya,12,9,0,0,6.2832);ctx.fill();
      if(k===9){ctx.beginPath();ctx.ellipse(sx,yb,12,9,0,0,6.2832);ctx.fill()}
      ctx.lineCap='round';
      ctx.strokeStyle='rgba(0,0,0,.4)';ctx.lineWidth=26;ctx.beginPath();ctx.moveTo(sx-4+5,ya+7);ctx.lineTo(sx+4+5,yb-7+8);ctx.stroke();
      ctx.strokeStyle=thread;ctx.lineWidth=22;ctx.beginPath();ctx.moveTo(sx-4,ya+4);ctx.lineTo(sx+4,yb-4);ctx.stroke();
      if(s>.5){
        ctx.save();ctx.beginPath();ctx.moveTo(sx-4,ya+4);ctx.lineTo(sx+4,yb-4);ctx.lineWidth=22;ctx.lineCap='round';
        ctx.strokeStyle='rgba(0,0,0,0)';ctx.stroke();
        ctx.lineWidth=2.4;ctx.strokeStyle='rgba(70,48,22,.5)';
        for(let t=ya+10;t<yb-6;t+=6.5){const xx=sx-4+(t-ya)/117*8;ctx.beginPath();ctx.moveTo(xx-10,t+6);ctx.lineTo(xx+10,t-6);ctx.stroke()}
        ctx.lineWidth=3;ctx.strokeStyle='rgba(255,255,245,.35)';ctx.beginPath();ctx.moveTo(sx-9,ya+8);ctx.lineTo(sx-1,yb-8);ctx.stroke();ctx.restore();
      }
    }
  }
  /* burnished band and painted edge */
  if(x1>1650){
    let g=ctx.createLinearGradient(1680,0,1745,0);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.34)');ctx.fillStyle=g;ctx.fillRect(1680,0,65,1300);
    ctx.fillStyle='rgba(0,0,0,.4)';ctx.fillRect(1708,0,5,1300);ctx.fillStyle='rgba(255,230,190,.12)';ctx.fillRect(1713,0,3,1300);
    g=ctx.createLinearGradient(1745,0,1790,0);g.addColorStop(0,'#1a0f08');g.addColorStop(.28,'#3b261a');g.addColorStop(.46,'#80604a');g.addColorStop(.62,'#2b1a10');g.addColorStop(1,'#0e0806');
    ctx.fillStyle=g;ctx.fillRect(1745,0,45,1300);
    if(s>.7){ctx.strokeStyle='rgba(255,235,210,.07)';ctx.lineWidth=1.4;for(const f of LD.fibers){ctx.beginPath();ctx.moveTo(f[0],f[1]);ctx.lineTo(f[0]+(f[3]-.5)*4,f[1]+f[2]);ctx.stroke()}}
    ctx.fillStyle='rgba(255,235,210,.2)';ctx.fillRect(1787,0,2,1300);
  }
  ctx.setTransform(1,0,0,1,0,0);
  const v=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.25,W/2,H/2,Math.max(W,H)*.75);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.42)');ctx.fillStyle=v;ctx.fillRect(0,0,W,H);
}
function leatherOpt(m,tint){return{hex:TINTS[tint].hex,kind:matKind(m),soft:m==='suede',bold:m==='exotic'}}
function clampView(v,cv){
  const s=worldScale(cv)*v.zoom,vw=cv.width/s,vh=cv.height/s;
  v.cx=vw>=2000?1000:clamp(v.cx,vw/2,2000-vw/2);v.cy=vh>=1300?650:clamp(v.cy,vh/2,1300-vh/2);
}
/* ===== Overlays: modal, drawer, search, menus ===== */
const ov={stack:[],last:null};
function lockScroll(on){document.body.style.overflow=on?'hidden':''}
function focusables(c){return $$('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex="0"]',c).filter(e=>e.offsetParent!==null||e===document.activeElement)}
function trap(e,c){
  if(e.key!=='Tab')return;const f=focusables(c);if(!f.length)return;
  const a=f[0],z=f[f.length-1];
  if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}
  else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}
}
function openModal(html,o){
  o=o||{};const m=$('#modal'),b=$('#modalBox');
  b.className='modal-box '+(o.cls||'');
  b.innerHTML='<button class="icon-btn modal-x" data-close aria-label="Close dialog"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>'+html;
  ov.last=document.activeElement;ov.onClose=o.onClose;
  m.classList.add('on');lockScroll(true);ov.stack.push('modal');
  const f=b.querySelector('[data-autofocus]')||b.querySelector('.opt,.btn,button:not(.modal-x)')||b.querySelector('button');
  if(f)f.focus({preventScroll:true});
  if(o.onOpen)o.onOpen(b);
}
function closeModal(){
  const m=$('#modal');if(!m.classList.contains('on'))return;
  m.classList.remove('on');ov.stack=ov.stack.filter(s=>s!=='modal');
  if(!ov.stack.length)lockScroll(false);
  if(ov.onClose){try{ov.onClose()}catch(e){}ov.onClose=null}
  if(ov.last&&ov.last.focus)ov.last.focus({preventScroll:true});
  $('#modalBox').innerHTML='';
}
const drawer={mode:'cart'};
function openDrawer(mode){
  closeSearch(true);closeMenu(true);
  drawer.mode=mode||'cart';renderDrawer();
  ov.last=document.activeElement;$('#drawer').classList.add('on');$('#scrim').classList.add('on');lockScroll(true);
  if(!ov.stack.includes('drawer'))ov.stack.push('drawer');
  setTimeout(()=>$('#drClose').focus({preventScroll:true}),50);
}
function closeDrawer(silent){
  if(!$('#drawer').classList.contains('on'))return;
  $('#drawer').classList.remove('on');$('#scrim').classList.remove('on');ov.stack=ov.stack.filter(s=>s!=='drawer');
  if(!ov.stack.length)lockScroll(false);
  if(!silent&&ov.last&&ov.last.focus)ov.last.focus({preventScroll:true});
}
function openSearch(){
  closeDrawer(true);closeMenu(true);
  $('#search').classList.add('on');$('#scrim').classList.add('on');lockScroll(true);ov.last=document.activeElement;
  if(!ov.stack.includes('search'))ov.stack.push('search');
  renderSearch('');setTimeout(()=>$('#searchInput').focus(),60);
}
function closeSearch(silent){
  if(!$('#search').classList.contains('on'))return;
  $('#search').classList.remove('on');$('#scrim').classList.remove('on');ov.stack=ov.stack.filter(s=>s!=='search');
  if(!ov.stack.length)lockScroll(false);
  if(!silent&&ov.last&&ov.last.focus)ov.last.focus({preventScroll:true});
}
function openMenu(){
  $('#mobileMenu').classList.add('open');$('#burger').setAttribute('aria-expanded','true');lockScroll(true);
  if(!ov.stack.includes('menu'))ov.stack.push('menu');setTimeout(()=>$('#mmClose').focus(),50);
}
function closeMenu(silent){
  if(!$('#mobileMenu').classList.contains('open'))return;
  $('#mobileMenu').classList.remove('open');$('#burger').setAttribute('aria-expanded','false');ov.stack=ov.stack.filter(s=>s!=='menu');
  if(!ov.stack.length)lockScroll(false);if(!silent)$('#burger').focus();
}
function closeAll(){closeModal();closeDrawer(true);closeSearch(true);closeMenu(true);$$('.nav-item.open').forEach(n=>{n.classList.remove('open');n.firstElementChild.setAttribute('aria-expanded','false')})}
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){
    const top=ov.stack[ov.stack.length-1];
    if(top==='modal')closeModal();else if(top==='drawer')closeDrawer();else if(top==='search')closeSearch();else if(top==='menu')closeMenu();
    $$('.nav-item.open').forEach(n=>{n.classList.remove('open');n.firstElementChild.setAttribute('aria-expanded','false')});
  }
  const top=ov.stack[ov.stack.length-1];
  if(top==='modal')trap(e,$('#modalBox'));else if(top==='drawer')trap(e,$('#drawer'));else if(top==='search')trap(e,$('#search'));else if(top==='menu')trap(e,$('#mobileMenu'));
});
$('#scrim').addEventListener('click',()=>{closeDrawer();closeSearch()});
$('#modal').addEventListener('click',e=>{if(e.target.id==='modal'||e.target.closest('[data-close]'))closeModal()});

/* ===== Router ===== */
const VIEWS=['home','product','craft','care','checkout'];
const viewHooks={};
function go(view,anchor){
  if(!VIEWS.includes(view))view='home';
  closeAll();
  $$('.view').forEach(v=>{v.hidden=v.dataset.view!==view});
  state.view=view;document.body.dataset.view=view;
  try{history.replaceState(null,'','#'+view)}catch(e){}
  if(viewHooks[view])viewHooks[view]();
  if(anchor){setTimeout(()=>{const t=document.getElementById(anchor);if(t)t.scrollIntoView({behavior:RM?'auto':'smooth',block:'start'})},60)}
  else window.scrollTo(0,0);
}
function openProduct(id,o){
  o=o||{};const p=byId(id);
  state.pid=p.id;
  if(!o.keepTint)state.tint=p.tint;
  state.mat=o.mat&&MATS[o.mat]?o.mat:(o.keepMat?state.mat:'full');
  if(!o.keepTint||!o.keepMat){state.hw=state.hw||'brass'}
  state.qty=1;
  if(!o.keepMono){state.mono=''}
  go('product');
}

/* ===== Cart and wishlist ===== */
const cartCount=()=>state.cart.reduce((a,i)=>a+i.qty,0);
const cartSub=()=>state.cart.reduce((a,i)=>a+i.unit*i.qty,0);
const GIFT_PRICE=18;
const shipCost=sub=>sub===0?0:(sub>=500?0:25);
function persist(){store('cart',state.cart);store('wish',state.wish);store('cur',state.cur)}
function setBadges(){
  const c=cartCount(),w=state.wish.length;
  const cb=$('#cartCount'),wb=$('#wishCount');cb.textContent=c||'';cb.dataset.n=c;wb.textContent=w||'';wb.dataset.n=w;
  $('#btnCart').setAttribute('aria-label','Open bag, '+c+' item'+(c===1?'':'s'));
  $('#btnWish').setAttribute('aria-label','Open wishlist, '+w+' saved');
}
function addToCart(item){
  const ex=state.cart.find(i=>i.key===item.key);
  if(ex)ex.qty+=item.qty;else state.cart.push(item);
  persist();setBadges();
}
function cartFromConfig(){
  const p=byId(state.pid),c={mat:state.mat,tint:state.tint,hw:state.hw,mono:state.mono,stamp:state.stamp};
  return{key:[p.id,c.mat,c.tint,c.hw,c.mono,c.mono?c.stamp:''].join('|'),kind:'product',pid:p.id,name:p.name,unit:unitPrice(p,c),qty:state.qty,sub:cfgSummary(c),tint:c.tint};
}
function toggleWish(id){
  const i=state.wish.indexOf(id);if(i>=0)state.wish.splice(i,1);else state.wish.push(id);
  persist();setBadges();syncWishUI();
  toast(i>=0?'Removed from wishlist':'Saved to wishlist');
  if($('#drawer').classList.contains('on'))renderDrawer();
}
function syncWishUI(){
  $$('.heart').forEach(b=>{const on=state.wish.includes(b.dataset.id);b.setAttribute('aria-pressed',on);b.setAttribute('aria-label',(on?'Remove ':'Save ')+byId(b.dataset.id).name+(on?' from wishlist':' to wishlist'))});
  const wb=$('#wishBtn');if(wb){const on=state.wish.includes(state.pid);wb.setAttribute('aria-pressed',on);wb.textContent=on?'Saved to wishlist':'Save to wishlist'}
}
const BOTTLE='<svg viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="#D4AF37" stroke-width="1.6"><path d="M19 6h10v6l5 6v22a3 3 0 0 1-3 3H17a3 3 0 0 1-3-3V18l5-6V6Z"/><path d="M14 26h20"/></svg>';
function renderDrawer(){
  const body=$('#drBody'),foot=$('#drFoot'),cart=drawer.mode==='cart';
  $('#tabCart').setAttribute('aria-selected',cart);$('#tabWish').setAttribute('aria-selected',!cart);
  $('#drBody').setAttribute('aria-labelledby',cart?'tabCart':'tabWish');
  if(cart){
    if(!state.cart.length){body.innerHTML='<div class="empty"><h4 style="margin-bottom:.6rem">Your bag is empty</h4><p>Design a briefcase or build a care kit to begin.</p></div>';foot.innerHTML='<button class="btn block" data-go="home:collection">Browse the collection</button>';return}
    body.innerHTML=state.cart.map((it,i)=>{
      const p=it.pid?byId(it.pid):null;
      return `<div class="dr-row"><div class="thumb" style="background:#1b1714">${p?artFor(p,it.tint):BOTTLE}</div>
      <div><h4>${esc(it.name)}</h4><small>${esc(it.sub||'')}</small>
      <div class="qty" role="group" aria-label="Quantity for ${esc(it.name)}"><button data-action="qty" data-i="${i}" data-d="-1" aria-label="Decrease">&minus;</button><span class="num">${it.qty}</span><button data-action="qty" data-i="${i}" data-d="1" aria-label="Increase">+</button></div></div>
      <div style="text-align:right"><div class="num">${money(it.unit*it.qty)}</div><button class="link-btn" style="font-size:.72rem;margin-top:.5rem" data-action="rm" data-i="${i}" aria-label="Remove ${esc(it.name)}">Remove</button></div></div>`}).join('');
    const sub=cartSub();
    foot.innerHTML=`<div class="sum-line"><span>Subtotal</span><span class="num">${money(sub)}</span></div><span class="fine">${sub>=500?'Complimentary delivery applied.':'Complimentary delivery over '+money(500)+'.'} Duties and taxes are calculated at delivery.</span><button class="btn primary block" data-go="checkout">Checkout</button>`;
  }else{
    if(!state.wish.length){body.innerHTML='<div class="empty"><h4 style="margin-bottom:.6rem">Nothing saved yet</h4><p>Tap the heart on any piece to keep it here.</p></div>';foot.innerHTML='';return}
    body.innerHTML=state.wish.map(id=>{const p=byId(id);return `<div class="dr-row"><div class="thumb" style="background:#1b1714">${artFor(p)}</div><div><h4>${esc(p.name)}</h4><small>${esc(p.cat)}</small><button class="link-btn" style="font-size:.72rem;margin-top:.5rem" data-product="${p.id}">Customize</button></div><div style="text-align:right"><div class="num">${money(p.price)}</div><button class="link-btn" style="font-size:.72rem;margin-top:.5rem" data-action="wish" data-id="${p.id}" aria-label="Remove ${esc(p.name)}">Remove</button></div></div>`}).join('');
    foot.innerHTML='';
  }
}
$('#drawer').addEventListener('click',e=>{const t=e.target.closest('[data-tab]');if(t){drawer.mode=t.dataset.tab;renderDrawer()}});
$('#drClose').addEventListener('click',()=>closeDrawer());
$('#btnCart').addEventListener('click',()=>openDrawer('cart'));
$('#btnWish').addEventListener('click',()=>openDrawer('wish'));

/* ===== Search ===== */
function renderSearch(q){
  q=q.trim().toLowerCase();
  const toks=q.split(/\s+/).filter(Boolean);
  const hay=p=>(p.name+' '+p.cat+' '+p.blurb+' full-grain pebble suede exotic leather '+p.specs.map(s=>s[1]).join(' ')).toLowerCase();
  const res=PRODUCTS.filter(p=>toks.every(t=>hay(p).includes(t)));
  $('#searchRes').innerHTML=res.length?res.map(p=>`<button type="button" data-product="${p.id}">${artFor(p)}<div><b>${esc(p.name)}</b><span class="num">${esc(p.cat)} · ${money(p.price)}</span></div></button>`).join(''):'<p class="muted" style="grid-column:1/-1">No pieces match “'+esc(q)+'”. Try “briefcase”, “tote” or “suede”.</p>';
}
$('#btnSearch').addEventListener('click',openSearch);
$('#searchClose').addEventListener('click',()=>closeSearch());
$('#searchInput').addEventListener('input',e=>renderSearch(e.target.value));
$('#searchForm').addEventListener('submit',e=>{e.preventDefault();const b=$('#searchRes [data-product]');if(b)b.click()});

/* ===== Currency ===== */
function refreshMoney(){
  $('#currency').value=state.cur;
  if(state.view==='product')viewHooks.priceOnly&&viewHooks.priceOnly();
  $$('[data-usd]').forEach(n=>{n.textContent=(n.dataset.pre||'')+money(+n.dataset.usd)});
  if($('#drawer').classList.contains('on'))renderDrawer();
  $('#giftPrice')&&($('#giftPrice').textContent=money(GIFT_PRICE)+' added.');
  if(state.view==='checkout')renderSummary();
  const g=$('#kitGrid');if(g&&g.children.length)renderKits();
}
$('#currency').addEventListener('change',e=>{state.cur=e.target.value;persist();refreshMoney()});

/* ===== Navigation wiring ===== */
$$('.nav-item').forEach(li=>{
  const btn=li.firstElementChild;
  btn.addEventListener('click',()=>{const o=!li.classList.contains('open');$$('.nav-item.open').forEach(n=>{n.classList.remove('open');n.firstElementChild.setAttribute('aria-expanded','false')});li.classList.toggle('open',o);btn.setAttribute('aria-expanded',o)});
  li.addEventListener('mouseenter',()=>btn.setAttribute('aria-expanded','true'));
  li.addEventListener('mouseleave',()=>{if(!li.classList.contains('open'))btn.setAttribute('aria-expanded','false')});
});
document.addEventListener('click',e=>{if(!e.target.closest('.nav-item'))$$('.nav-item.open').forEach(n=>{n.classList.remove('open');n.firstElementChild.setAttribute('aria-expanded','false')})});
$('#burger').addEventListener('click',openMenu);
$('#mmClose').addEventListener('click',()=>closeMenu());
const actions={
  quiz:()=>openQuiz(),
  wish:t=>toggleWish(t.dataset.id),
  qty:t=>{const it=state.cart[+t.dataset.i];if(!it)return;it.qty+=+t.dataset.d;if(it.qty<1)state.cart.splice(+t.dataset.i,1);persist();setBadges();renderDrawer()},
  rm:t=>{state.cart.splice(+t.dataset.i,1);persist();setBadges();renderDrawer()},
  addkit:t=>{const k=CARE[t.dataset.id];if(!k)return;addToCart({key:'care|'+t.dataset.id,kind:'care',name:k.name,unit:k.price,qty:1,sub:k.short});toast('Added to bag');},
};
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-go],[data-product],[data-action]');if(!t)return;
  if(t.dataset.action){e.preventDefault();const f=actions[t.dataset.action];if(f)f(t,e);return}
  e.preventDefault();
  if(t.dataset.product){
    closeAll();
    openProduct(t.dataset.product,{mat:t.dataset.mat,keepTint:t.hasAttribute('data-keep-tint')});
    if(t.hasAttribute('data-go-mono'))setTimeout(()=>{const m=$('#monoSet');m&&m.scrollIntoView({behavior:RM?'auto':'smooth',block:'center'});const i=$('#monoIn');i&&i.focus({preventScroll:true})},250);
    if(t.hasAttribute('data-go-patina'))setTimeout(()=>{const m=$('#patinaSec');m&&m.scrollIntoView({behavior:RM?'auto':'smooth',block:'start'})},250);
    return;
  }
  const[v,a]=t.dataset.go.split(':');go(v,a);
});

/* ===== Home: collection grid and teaser ===== */
function renderGrid(){
  $('#grid').innerHTML=PRODUCTS.map((p,i)=>`<article class="card" data-i="${i}">
    <button class="icon-btn heart" data-action="wish" data-id="${p.id}" aria-pressed="false" aria-label="Save ${esc(p.name)} to wishlist"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10Z"/></svg></button>
    <button class="card-main" data-product="${p.id}" aria-label="Customize ${esc(p.name)}">
      <div class="card-vis"><div class="tex a"></div><div class="tex b"></div><div class="art">${artFor(p)}</div><span class="card-tag"><span class="ta">Full-grain · ${TINTS[p.tint].name}</span><span class="tb">Also in pebble grain</span></span></div>
      <div class="card-info"><h3>${esc(p.name)}</h3><div class="row"><span>${esc(p.cat)}</span><span class="num" data-usd="${p.price}" data-pre="From ">From ${money(p.price)}</span></div></div>
    </button></article>`).join('');
  $$('.card').forEach(card=>{
    const p=PRODUCTS[+card.dataset.i],i=+card.dataset.i;
    onVisible(card,v=>{
      if(!v||card.dataset.done)return;card.dataset.done=1;
      const mk=(kind,sc,cx,cy)=>{const cv=document.createElement('canvas');cv.width=480;cv.height=552;drawLeather(cv,{cx,cy,scale:sc},{hex:TINTS[p.tint].hex,kind,bold:false});return cv.toDataURL('image/jpeg',.82)};
      requestAnimationFrame(()=>{
        $('.tex.a',card).style.backgroundImage='url('+mk('grain',.62,420+i*120,640)+')';
        $('.tex.b',card).style.backgroundImage='url('+mk('pebble',1.25,380+i*130,560)+')';
      });
    });
  });
  syncWishUI();
}
const TEASER_TINTS=['natural','saddle','cognac','espresso','noir'];
function renderTeaser(){
  $('#teaserSw').innerHTML=TEASER_TINTS.map(k=>`<button type="button" class="sw" data-tint="${k}" aria-pressed="${state.tint===k}" aria-label="${TINTS[k].name}"><i style="background:${TINTS[k].hex}"></i></button>`).join('');
  $('#teaserArt').innerHTML=productArt('briefcase',TINTS[state.tint].hex,'#D4AF37');
}
$('#teaserSw').addEventListener('click',e=>{const b=e.target.closest('[data-tint]');if(!b)return;state.tint=b.dataset.tint;renderTeaser();$$('#teaserSw .sw')[TEASER_TINTS.indexOf(state.tint)].focus()});
$('#teaserGo').addEventListener('click',()=>{state.pid='meridian'},true);
/* ===== Module A: 3D configurator (Three.js, loaded lazily) ===== */
const THREE_SRC='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
let threeQ=null;
function ensureThree(ok,fail){
  if(window.THREE){ok();return}
  if(threeQ){threeQ.push([ok,fail]);return}
  threeQ=[[ok,fail]];
  const s=document.createElement('script');s.src=THREE_SRC;
  s.onload=()=>{const q=threeQ;threeQ=null;q.forEach(a=>a[0]())};
  s.onerror=()=>{const q=threeQ;threeQ=null;q.forEach(a=>a[1]&&a[1]())};
  document.head.appendChild(s);
}
const texCache=new Map();
function leatherTextures(kind,hex,renderer){
  const key=kind+hex;if(texCache.has(key))return texCache.get(key);
  const S=512,cc=document.createElement('canvas'),bc=document.createElement('canvas');cc.width=cc.height=bc.width=bc.height=S;
  const c=cc.getContext('2d'),b=bc.getContext('2d'),r=mulberry(kind.length*977+hexToRgb(hex)[0]*13+hexToRgb(hex)[2]);
  c.fillStyle=kind==='suede'?shade(hex,.05):hex;c.fillRect(0,0,S,S);b.fillStyle='#808080';b.fillRect(0,0,S,S);
  const W9=fn=>{for(const i of[-1,0,1])for(const j of[-1,0,1])fn(i*S,j*S)};
  for(let i=0;i<46;i++){const x=r()*S,y=r()*S,rad=40+r()*110,d=r()<.5;
    W9((ox,oy)=>{const g=c.createRadialGradient(x+ox,y+oy,0,x+ox,y+oy,rad);g.addColorStop(0,d?'rgba(0,0,0,.15)':'rgba(255,235,205,.10)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(x+ox-rad,y+oy-rad,rad*2,rad*2)})}
  if(kind==='full'||kind==='suede'){
    const n=kind==='suede'?15000:7000;
    for(let i=0;i<n;i++){const x=3+r()*(S-6),y=3+r()*(S-6);
      if(kind==='suede'){const a=r()*6.28,l=2+r()*5,dx=Math.cos(a)*l,dy=Math.sin(a)*l;c.strokeStyle=r()<.5?'rgba(0,0,0,.08)':'rgba(255,240,215,.09)';c.lineWidth=1;c.beginPath();c.moveTo(x,y);c.lineTo(x+dx,y+dy);c.stroke();b.strokeStyle=r()<.5?'rgba(0,0,0,.28)':'rgba(255,255,255,.28)';b.beginPath();b.moveTo(x,y);b.lineTo(x+dx,y+dy);b.stroke()}
      else{const rad=.7+r()*1.5;c.fillStyle='rgba(20,8,0,.28)';c.beginPath();c.ellipse(x,y,rad,rad*.7,r()*3,0,6.3);c.fill();b.fillStyle='rgba(0,0,0,.55)';b.beginPath();b.arc(x,y,rad*1.2,0,6.3);b.fill()}}
    if(kind==='full')for(let i=0;i<22;i++){let x=r()*S,y=r()*S,a=r()*6.28;c.strokeStyle='rgba(0,0,0,.10)';b.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=1.4;b.lineWidth=1.6;c.beginPath();b.beginPath();c.moveTo(x,y);b.moveTo(x,y);for(let k=0;k<6;k++){a+=(r()-.5);x+=Math.cos(a)*26;y+=Math.sin(a)*26;c.lineTo(x,y);b.lineTo(x,y)}c.stroke();b.stroke()}
  }else if(kind==='pebble'){
    const N=22,cs=S/N;c.fillStyle=shade(hex,-.38);c.fillRect(0,0,S,S);b.fillStyle='#000';b.fillRect(0,0,S,S);
    const cells=[];for(let i=0;i<N;i++)for(let j=0;j<N;j++)cells.push([(i+.5+(r()-.5)*.35)*cs,(j+.5+(r()-.5)*.35)*cs,cs*(.5+r()*.08)]);
    W9((ox,oy)=>{for(const k of cells){const x=k[0]+ox,y=k[1]+oy;if(x<-30||y<-30||x>S+30||y>S+30)continue;
      let g=c.createRadialGradient(x-k[2]*.25,y-k[2]*.25,k[2]*.1,x,y,k[2]);g.addColorStop(0,shade(hex,.14));g.addColorStop(.7,hex);g.addColorStop(1,shade(hex,-.3));c.fillStyle=g;c.beginPath();c.arc(x,y,k[2],0,6.3);c.fill();
      g=b.createRadialGradient(x,y,0,x,y,k[2]);g.addColorStop(0,'#fff');g.addColorStop(.75,'#aaa');g.addColorStop(1,'#000');b.fillStyle=g;b.beginPath();b.arc(x,y,k[2],0,6.3);b.fill()}});
  }else{ /* exotic: scale pattern */
    const cols=11,rows=15,cw=S/cols,rh=S/rows;c.fillStyle=shade(hex,-.55);c.fillRect(0,0,S,S);b.fillStyle='#000';b.fillRect(0,0,S,S);
    const sc=[];for(let j=0;j<rows;j++)for(let i=0;i<cols;i++)sc.push([(i+.5+(j%2?.5:0)+(r()-.5)*.1)*cw,(j+.5)*rh,cw*.43,rh*.43]);
    W9((ox,oy)=>{for(const k of sc){const x=k[0]+ox,y=k[1]+oy;if(x<-40||y<-40||x>S+40||y>S+40)continue;
      const rr=(g,ctx)=>{ctx.fillStyle=g;ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x-k[2],y-k[3],k[2]*2,k[3]*2,k[3]*.55);else ctx.rect(x-k[2],y-k[3],k[2]*2,k[3]*2);ctx.fill()};
      let g=c.createRadialGradient(x-k[2]*.2,y-k[3]*.4,2,x,y,k[2]*1.1);g.addColorStop(0,shade(hex,.2));g.addColorStop(.6,hex);g.addColorStop(1,shade(hex,-.35));rr(g,c);
      g=b.createRadialGradient(x,y,0,x,y,k[2]);g.addColorStop(0,'#fff');g.addColorStop(1,'#222');rr(g,b);
      c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.arc(x+k[2]*.45,y-k[3]*.5,1.3,0,6.3);c.fill()}});
  }
  const mk=cv=>{const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(1/8,1/8);t.anisotropy=renderer?Math.min(8,renderer.capabilities.getMaxAnisotropy()):4;return t};
  const map=mk(cc);map.encoding=THREE.sRGBEncoding;
  const out={map,bump:mk(bc)};texCache.set(key,out);return out;
}
function roundedRectShape(w,h,r,rb){
  rb=rb===undefined?r:rb;const s=new THREE.Shape(),x=-w/2,y=-h/2;
  s.moveTo(x+rb,y);s.lineTo(x+w-rb,y);s.quadraticCurveTo(x+w,y,x+w,y+rb);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+rb);s.quadraticCurveTo(x,y,x+rb,y);return s;
}
function extrude(shape,depth,bev,seg){
  const g=new THREE.ExtrudeGeometry(shape,{depth:Math.max(.01,depth-2*bev),bevelEnabled:true,bevelThickness:bev,bevelSize:bev,bevelSegments:seg||3,curveSegments:10});
  g.translate(0,0,-(depth-2*bev)/2);return g;
}
function stitchRow(shape,z,pitch,len,color){
  const pts=shape.getSpacedPoints(Math.max(24,Math.round(shape.getLength()/pitch))),n=pts.length-1;
  const im=new THREE.InstancedMesh(new THREE.BoxGeometry(len,.075,.09),new THREE.MeshStandardMaterial({color:color||0xefe4c4,roughness:.85}),n),o=new THREE.Object3D();
  for(let i=0;i<n;i++){const a=pts[i],b=pts[i+1];o.position.set((a.x+b.x)/2,(a.y+b.y)/2,z);o.rotation.set(0,0,Math.atan2(b.y-a.y,b.x-a.x));o.updateMatrix();im.setMatrixAt(i,o.matrix)}
  im.instanceMatrix.needsUpdate=true;return im;
}
function buildModel(p,M){
  const[w,h,d]=p.cm,m=p.m,g=new THREE.Group(),L=M.leather,H=M.hw;
  const bev=clamp(d*.12,.18,.55),r=Math.min(w,h)*.07;
  const add=(geo,mat,x,y,z)=>{const mesh=new THREE.Mesh(geo,mat);mesh.position.set(x||0,y||0,z||0);g.add(mesh);return mesh};
  add(extrude(roundedRectShape(w-2*bev,h-2*bev,r),d,bev,4),L);
  const inset=clamp(Math.min(w,h)*.04,.45,1.2),pitch=.44,slen=.32,fz=d/2+.045;
  g.add(stitchRow(roundedRectShape(w-2*inset,h-2*inset,Math.max(.25,r-inset)),fz,pitch,slen));
  g.add(stitchRow(roundedRectShape(w-2*inset,h-2*inset,Math.max(.25,r-inset)),-fz,pitch,slen));
  let frontZ=d/2,flapBottom=0,flapH=0;
  const feetH=(m.feet&&d>6)?.6:0;
  if(m.flap){
    flapH=h*.52;const t=Math.max(.42,d*.06),fb=.08,fw=w*.985;
    const fy=h/2-flapH/2+.05,fzc=d/2+t/2-.04;
    add(extrude(roundedRectShape(fw-2*fb,flapH-2*fb,r*.7,flapH*.28),t,fb,3),L,0,fy,fzc);
    g.add(stitchRow(roundedRectShape(fw-2*inset,flapH-2*inset,Math.max(.25,r*.7-inset),flapH*.22),d/2+t-.0,pitch,slen).translateY(fy));
    frontZ=d/2+t-.04;flapBottom=fy-flapH/2;
    if(m.clasps){for(const i of[-1,1]){
      const cw=Math.max(2.2,w*.07),ch=Math.max(3,h*.13);
      add(extrude(roundedRectShape(cw,ch,.35),.55,.12,2),H,i*w*.27,flapBottom+ch*.18,frontZ+.2);
      add(new THREE.CylinderGeometry(cw*.2,cw*.2,.25,20).rotateX(Math.PI/2),M.dark,i*w*.27,flapBottom+ch*.18,frontZ+.55);
      add(extrude(roundedRectShape(cw*.7,ch*.5,.25),.45,.1,2),H,i*w*.27,flapBottom-ch*.45,d/2+.15);
    }}
    if(m.buckle){
      const tw=w*.1,th=h*.46;
      add(extrude(roundedRectShape(tw,th,tw*.3),.5,.1,2),L,0,flapBottom-th*.28,frontZ+.02);
      const bw=w*.15,bh=h*.12;
      const bs=roundedRectShape(bw,bh,.35),hole=new THREE.Path();const hw=bw*.38,hh=bh*.34;hole.moveTo(-hw,-hh);hole.lineTo(hw,-hh);hole.lineTo(hw,hh);hole.lineTo(-hw,hh);hole.lineTo(-hw,-hh);bs.holes.push(hole);
      add(extrude(bs,.7,.12,2),H,0,flapBottom+bh*.1,frontZ+.4);
      add(new THREE.BoxGeometry(.28,bh*.9,.3),H,0,flapBottom+bh*.1,frontZ+.8);
    }
  }
  if(m.pocket){
    const pw=w*.94,ph=h*.64,pb=.1;
    add(extrude(roundedRectShape(pw-2*pb,ph-2*pb,.5,.5),.28,pb,2),L,0,-h/2+ph/2+.2,d/2+.1);
    g.add(stitchRow(roundedRectShape(pw-1.2,ph-1.2,.3),d/2+.26,.4,.28).translateY(-h/2+ph/2+.2));
  }
  const handle=(x0,x1,topY,hh,z,rad)=>{
    const P=[[0,0],[.08,.55],[.28,.95],[.72,.95],[.92,.55],[1,0]].map(a=>new THREE.Vector3(lerp(x0,x1,a[0]),topY+hh*a[1],z));
    add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(P),64,rad,12,false),L);
    for(const x of[x0,x1])add(new THREE.CylinderGeometry(rad*1.6,rad*1.6,rad*1.4,18),H,x,topY+rad*.2,z);
  };
  if(m.handle==='top')handle(-w*.18,w*.18,h/2,Math.max(2.4,h*.2),0,.55);
  if(m.handle==='twin'){const hw=w*.27,hh=h*.52,zz=d*.26;handle(-hw,hw,h/2,hh,zz,.55);handle(-hw,hw,h/2,hh,-zz,.55)}
  if(m.stud)add(new THREE.CylinderGeometry(.85,.85,.45,24).rotateX(Math.PI/2),H,0,h/2-3.4,d/2+.2);
  if(m.zip){
    add(new THREE.BoxGeometry(w*.86,.2,.8),M.dark,0,h/2+.01,0);
    add(new THREE.BoxGeometry(1.4,.45,1.1),H,w*.36,h/2+.12,0);
    add(new THREE.TorusGeometry(.5,.12,8,18).rotateX(Math.PI/2),H,w*.36,h/2+.1,1.1);
  }
  if(feetH)for(const sx of[-1,1])for(const sz of[-1,1])add(new THREE.CylinderGeometry(.75,.9,feetH,18),H,sx*w*.4,-h/2-feetH/2+.1,sz*d*.3);
  /* monogram decal */
  const dw=clamp(w*.17,2.6,7.5),dh=dw/2;
  const dec=new THREE.Mesh(new THREE.PlaneGeometry(dw,dh),M.decal);
  dec.position.set(0,m.flap?(h/2-flapH*.46):(m.pocket?-h*.12:h*.05),frontZ+.03);dec.visible=false;dec.renderOrder=5;g.add(dec);g.userData.decal=dec;g.userData.bottom=-h/2-feetH;
  return g;
}
function makeEnv(renderer){
  const pm=new THREE.PMREMGenerator(renderer),sc=new THREE.Scene();
  sc.add(new THREE.Mesh(new THREE.BoxGeometry(60,40,60),new THREE.MeshBasicMaterial({color:0x2a2420,side:THREE.BackSide})));
  const panel=(w,h,pos,col)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:col,side:THREE.DoubleSide}));m.position.set(pos[0],pos[1],pos[2]);m.lookAt(0,0,0);sc.add(m)};
  panel(24,12,[0,18,10],0xfff3de);panel(10,26,[-22,4,6],0xffe6c4);panel(12,16,[22,6,-6],0xd9e3f2);panel(40,4,[0,-14,0],0x7a5630);panel(14,10,[0,6,-26],0xfff0d8);
  const t=pm.fromScene(sc,.03).texture;pm.dispose();return t;
}
function monoCanvas(text){
  const cv=document.createElement('canvas');cv.width=512;cv.height=256;const c=cv.getContext('2d');
  c.fillStyle='#000';c.fillRect(0,0,512,256);
  const t=text.toUpperCase();if(!t)return cv;
  let size=170;c.font='600 '+size+'px "Cormorant Garamond",Georgia,serif';c.textBaseline='middle';
  const gap=size*.14,measure=()=>[...t].reduce((a,ch)=>a+c.measureText(ch).width,0)+gap*(t.length-1);
  while(measure()>440&&size>40){size-=6;c.font='600 '+size+'px "Cormorant Garamond",Georgia,serif'}
  const gp=size*.14;let x=(512-([...t].reduce((a,ch)=>a+c.measureText(ch).width,0)+gp*(t.length-1)))/2;
  c.fillStyle='#fff';for(const ch of t){c.fillText(ch,x,134);x+=c.measureText(ch).width+gp}
  return cv;
}
function createMats(){
  return{
    leather:new THREE.MeshPhysicalMaterial({color:0xffffff,roughness:.55,metalness:0,clearcoat:0,envMapIntensity:.8}),
    hw:new THREE.MeshStandardMaterial({color:0x8C6B2E,metalness:1,roughness:.4,envMapIntensity:1.25}),
    dark:new THREE.MeshStandardMaterial({color:0x1a1512,roughness:.7,metalness:.2}),
    decal:new THREE.MeshStandardMaterial({transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2})
  };
}
function configureMats(M,renderer){
  const mat=MATS[state.mat],hex=TINTS[state.tint].hex,tx=leatherTextures(state.mat,hex,renderer),L=M.leather;
  L.map=tx.map;L.bumpMap=tx.bump;L.bumpScale=mat.bump;L.roughness=mat.rough;L.clearcoat=state.mat==='exotic'?.7:0;L.clearcoatRoughness=.18;L.needsUpdate=true;
  const hw=HW[state.hw];M.hw.color.set(hw.hex);M.hw.roughness=hw.rough;
}
function configureDecal(M,deco){
  const t=state.mono.trim(),D=M.decal;
  if(!t){deco.visible=false;return}
  const a=new THREE.CanvasTexture(monoCanvas(t));a.anisotropy=4;
  if(D.alphaMap)D.alphaMap.dispose();D.alphaMap=a;D.bumpMap=a;
  if(state.stamp==='blind'){D.color.set(shade(TINTS[state.tint].hex,-.55));D.metalness=0;D.roughness=.9;D.opacity=.85;D.bumpScale=-2.2;D.envMapIntensity=.3}
  else{D.color.set(state.stamp==='gold'?'#E7C25A':'#D9DCE0');D.metalness=1;D.roughness=.2;D.opacity=1;D.bumpScale=1.4;D.envMapIntensity=1.4}
  D.needsUpdate=true;deco.visible=true;
}
const stage={ready:false,failed:false,visible:false,raf:0,auto:true,drag:false,pid:null,pointers:new Map()};
function initStage(){
  const host=$('#stage3d');if(stage.ready||stage.starting||!host)return;stage.starting=true;
  ensureThree(()=>{
    try{
      const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
      renderer.setPixelRatio(DPR);renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
      host.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-hidden','true');
      const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(32,1,1,2000);
      scene.environment=makeEnv(renderer);
      const key=new THREE.DirectionalLight(0xfff0dc,1.5);key.position.set(60,90,80);scene.add(key);
      const fill=new THREE.DirectionalLight(0xffe0bd,.5);fill.position.set(-70,20,40);scene.add(fill);
      const rim=new THREE.DirectionalLight(0xffffff,.7);rim.position.set(-10,40,-90);scene.add(rim);
      scene.add(new THREE.AmbientLight(0xffffff,.22));
      const mats=createMats();
      Object.assign(stage,{renderer,scene,camera,mats,sph:{th:.55,ph:1.32,r:100,px:0,py:0,pan:new THREE.Vector3()},cur:{th:.55,ph:1.32,r:100,pan:new THREE.Vector3()},R:50});
      stage.ready=true;bindStageInput(host);
      new ResizeObserver(resizeStage).observe(host);
      onVisible(host,v=>{stage.visible=v;if(v)startLoop()},{threshold:0});
      document.addEventListener('visibilitychange',()=>{if(!document.hidden)startLoop()});
      resizeStage();setStageModel();$('#stageLoad').hidden=true;
    }catch(err){stageFail()}
  },stageFail);
}
function stageFail(){
  stage.failed=true;stage.starting=false;
  const l=$('#stageLoad');l.hidden=false;l.style.pointerEvents='auto';
  l.innerHTML='<div class="stage-fallback" style="position:static;max-width:34ch">The 3D view needs WebGL, which is unavailable here. Your selections still apply to the price and the bag. Try the Grain &amp; gallery tab.</div>';
}
function resizeStage(){
  if(!stage.ready)return;const host=$('#stage3d'),w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;
  stage.renderer.setSize(w,h,false);stage.camera.aspect=w/h;stage.camera.updateProjectionMatrix();
}
function setStageModel(){
  if(!stage.ready)return;const p=byId(state.pid);
  if(stage.model){stage.scene.remove(stage.model);stage.model.traverse(o=>{if(o.geometry)o.geometry.dispose()})}
  const M=stage.mats,model=buildModel(p,M),box=new THREE.Box3().setFromObject(model),ctr=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3());
  const wrap=new THREE.Group();model.position.sub(ctr);wrap.add(model);
  /* contact shadow */
  const cv=document.createElement('canvas');cv.width=cv.height=128;const c=cv.getContext('2d'),g=c.createRadialGradient(64,64,6,64,64,62);g.addColorStop(0,'rgba(0,0,0,.65)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(0,0,128,128);
  const sh=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthWrite:false}));
  const bw=Math.max(size.x,size.z);sh.scale.set(bw*1.5,Math.max(size.z*1.9,bw*.6),1);sh.rotation.x=-Math.PI/2;sh.position.y=model.userData.bottom-ctr.y-.05;wrap.add(sh);
  stage.model=wrap;stage.deco=model.userData.decal;stage.scene.add(wrap);
  const R=Math.max(size.x,size.y,size.z)*.5;stage.R=R;
  const fit=R/Math.sin(THREE.MathUtils.degToRad(stage.camera.fov/2))*1.18;stage.fit=fit;
  if(stage.pid!==p.id){stage.sph.r=fit;stage.cur.r=fit;stage.sph.th=.55;stage.sph.pan.set(0,0,0)}
  stage.pid=p.id;stage.camera.near=fit/60;stage.camera.far=fit*12;stage.camera.updateProjectionMatrix();
  apply3D();
}
function apply3D(){
  if(!stage.ready||!stage.model)return;
  configureMats(stage.mats,stage.renderer);updateDecal();
}
function updateDecal(){if(stage.ready&&stage.deco)configureDecal(stage.mats,stage.deco)}
function startLoop(){if(stage.raf||!stage.ready)return;const tick=()=>{if(!stage.visible||document.hidden){stage.raf=0;return}stage.raf=requestAnimationFrame(tick);stepStage()};stage.raf=requestAnimationFrame(tick)}
function stepStage(){
  const t=stage.sph,c=stage.cur,cam=stage.camera;
  if(stage.auto&&!RM&&!stage.drag)t.th+=.0035;
  c.th+=(t.th-c.th)*.12;c.ph+=(t.ph-c.ph)*.12;c.r+=(t.r-c.r)*.12;c.pan.lerp(t.pan,.14);
  const sp=Math.sin(c.ph);
  cam.position.set(c.pan.x+c.r*sp*Math.sin(c.th),c.pan.y+c.r*Math.cos(c.ph),c.pan.z+c.r*sp*Math.cos(c.th));cam.lookAt(c.pan);
  stage.renderer.render(stage.scene,cam);
}
function bindStageInput(host){
  const cv=stage.renderer.domElement,P=stage.pointers,t=stage.sph;
  const setAuto=v=>{stage.auto=v;$('#autoRot').setAttribute('aria-pressed',v)};
  const panBy=(dx,dy)=>{const k=t.r*.0016,th=stage.cur.th;t.pan.x+=(-dx*Math.cos(th))*k;t.pan.z+=(dx*Math.sin(th))*k;t.pan.y+=dy*k;const lim=stage.R*.9;t.pan.clampLength(0,lim)};
  const dist=()=>{const a=[...P.values()];return Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)};
  const mid=()=>{const a=[...P.values()];return{x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2}};
  let last=null,ld=0,lm=null;
  cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);P.set(e.pointerId,{x:e.clientX,y:e.clientY,b:e.button,s:e.shiftKey});stage.drag=true;setAuto(false);host.focus({preventScroll:true});if(P.size===2){ld=dist();lm=mid()}});
  cv.addEventListener('pointermove',e=>{
    const p=P.get(e.pointerId);if(!p)return;const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;
    if(P.size===1){if(p.b===2||p.s||e.shiftKey)panBy(dx,dy);else{t.th-=dx*.0075;t.ph=clamp(t.ph-dy*.006,.25,2.6)}}
    else if(P.size===2){const d=dist(),m=mid();t.r=clamp(t.r*(ld/d),stage.fit*.35,stage.fit*2.6);ld=d;panBy(m.x-lm.x,m.y-lm.y);lm=m}
  });
  const up=e=>{P.delete(e.pointerId);if(!P.size)stage.drag=false;else if(P.size===1){ld=0}};
  cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  cv.addEventListener('contextmenu',e=>e.preventDefault());
  cv.addEventListener('wheel',e=>{if(document.activeElement!==host)return;e.preventDefault();t.r=clamp(t.r*(1+Math.sign(e.deltaY)*.08),stage.fit*.35,stage.fit*2.6)},{passive:false});
  host.addEventListener('keydown',e=>{
    const k=e.key;let h=true;
    if(k==='ArrowLeft')t.th-=.18;else if(k==='ArrowRight')t.th+=.18;else if(k==='ArrowUp')t.ph=clamp(t.ph-.12,.25,2.6);else if(k==='ArrowDown')t.ph=clamp(t.ph+.12,.25,2.6);
    else if(k==='+'||k==='=')t.r=clamp(t.r*.9,stage.fit*.35,stage.fit*2.6);else if(k==='-')t.r=clamp(t.r*1.1,stage.fit*.35,stage.fit*2.6);else h=false;
    if(h){e.preventDefault();setAuto(false)}
  });
  $('#zoomIn').onclick=()=>{t.r=clamp(t.r*.82,stage.fit*.35,stage.fit*2.6)};
  $('#zoomOut').onclick=()=>{t.r=clamp(t.r*1.22,stage.fit*.35,stage.fit*2.6)};
  $('#autoRot').onclick=()=>setAuto(!stage.auto);
  $('#resetCam').onclick=()=>{t.th=.55;t.ph=1.32;t.r=stage.fit;t.pan.set(0,0,0)};
}
/* ===== Product page ===== */
function chipGroup(host,name,opts,val,type){
  host.innerHTML=opts.map(o=>`<label class="chip ${type==='sw'?'sw-chip':''}"><input type="radio" name="${name}" value="${o.v}" ${o.v===val?'checked':''}><span>${type==='sw'?`<i style="background:${o.c}"></i><b class="sr">${o.t}</b>`:o.t}</span></label>`).join('');
}
function renderControls(){
  const p=byId(state.pid),f=pf(p);
  chipGroup($('#grpMat'),'mat',Object.keys(MATS).map(k=>({v:k,t:MATS[k].name+(MATS[k].add?' <span class="muted num">+'+money(r5(MATS[k].add*f))+'</span>':'')})),state.mat);
  chipGroup($('#grpTint'),'tint',Object.keys(TINTS).map(k=>({v:k,t:TINTS[k].name,c:TINTS[k].hex})),state.tint,'sw');
  chipGroup($('#grpHw'),'hw',Object.keys(HW).map(k=>({v:k,t:HW[k].name+(HW[k].add?' <span class="muted num">+'+money(r5(HW[k].add*f))+'</span>':'')})),state.hw);
  chipGroup($('#grpStamp'),'stamp',Object.keys(STAMPS).map(k=>({v:k,t:STAMPS[k].name+(STAMPS[k].add?' <span class="muted num">+'+money(r5(STAMPS[k].add*f))+'</span>':'')})),state.stamp);
  chipGroup($('#grpPat'),'pat',[['natural','Natural veg-tan'],['cognac','Cognac full-grain'],['noir','Noir pebble']].map(a=>({v:a[0],t:a[1]})),state.pat);
  syncOutputs();
}
function syncOutputs(){
  $('#outMat').textContent=MATS[state.mat].name+' · '+MATS[state.mat].note;
  $('#outTint').textContent=TINTS[state.tint].name;
  $('#outHw').textContent=HW[state.hw].name;
}
function updatePrice(){
  const p=byId(state.pid),u=unitPrice(p);
  $('#pPrice').innerHTML=money(u*state.qty)+(state.qty>1?'<small>'+state.qty+' × '+money(u)+'</small>':'<small>incl. selections</small>');
  $('#addBag').textContent='Add to bag · '+money(u*state.qty);
  $('#qVal').textContent=state.qty;
}
function renderPDP(){
  const p=byId(state.pid);
  $('#crumbName').textContent=p.name;$('#pCat').textContent=p.cat;$('#pName').textContent=p.name;$('#pBlurb').textContent=p.blurb;
  $('#pSpecs').innerHTML=p.specs.map(s=>`<div><dt>${s[0]}</dt><dd>${s[1]}</dd></div>`).join('');
  $('#monoIn').value=state.mono;
  renderControls();updatePrice();syncWishUI();
  document.title='Orvane Atelier';
}
function onConfigChange(what){
  syncOutputs();updatePrice();
  if(stage.ready){what==='mono'?updateDecal():apply3D()}
  if(!$('#panelGal').hidden)drawGallery();
  drawPatinaNow();
}
function initPDPEvents(){
  $('#grpMat').addEventListener('change',e=>{state.mat=e.target.value;onConfigChange()});
  $('#grpTint').addEventListener('change',e=>{state.tint=e.target.value;onConfigChange()});
  $('#grpHw').addEventListener('change',e=>{state.hw=e.target.value;onConfigChange()});
  $('#grpStamp').addEventListener('change',e=>{state.stamp=e.target.value;onConfigChange('mono')});
  $('#grpPat').addEventListener('change',e=>{state.pat=e.target.value;drawPatinaNow()});
  $('#monoIn').addEventListener('input',e=>{const v=e.target.value.replace(/[^A-Za-z0-9&.\-]/g,'').slice(0,4).toUpperCase();if(v!==e.target.value)e.target.value=v;state.mono=v;$('#outMono').textContent=v?v.length+' of 4 characters':'Optional, 1 to 4 characters';updatePrice();updateDecal();if(stage.ready)stage.dirty=true});
  $('#qMinus').onclick=()=>{state.qty=clamp(state.qty-1,1,9);updatePrice()};
  $('#qPlus').onclick=()=>{state.qty=clamp(state.qty+1,1,9);updatePrice()};
  $('#addBag').onclick=()=>{addToCart(cartFromConfig());toast('Added to your bag');openDrawer('cart')};
  $('#wishBtn').onclick=()=>toggleWish(state.pid);
  $('#arBtn').onclick=openAR;
  $('#tab3d').onclick=()=>showStageTab('3d');
  $('#tabGal').onclick=()=>showStageTab('gal');
}
function showStageTab(t){
  const g=t==='gal';
  $('#tab3d').setAttribute('aria-selected',!g);$('#tabGal').setAttribute('aria-selected',g);
  $('#panel3d').hidden=g;$('#panelGal').hidden=!g;
  if(g)requestAnimationFrame(drawGallery);else{resizeStage();startLoop()}
}
viewHooks.product=()=>{
  renderPDP();initStage();
  if(stage.ready)setStageModel();
  showStageTab('3d');drawPatinaNow();
};
viewHooks.priceOnly=()=>{renderControls();updatePrice()};

/* ===== Module B: grain gallery, loupe, macro viewer ===== */
const gal={key:'overview',view:null};
function viewFor(cv,key){
  const v=POI[key],o={cx:v.cx,cy:v.cy,zoom:v.zoom};clampView(o,cv);
  return{cx:o.cx,cy:o.cy,zoom:o.zoom,scale:worldScale(cv)*o.zoom};
}
function drawGallery(){
  const cv=$('#galCanvas');if(!cv||$('#panelGal').hidden)return;
  sizeCanvas(cv);gal.view=viewFor(cv,gal.key);drawLeather(cv,gal.view,leatherOpt(state.mat,state.tint));
  if(!$('#galThumbs').children.length){
    $('#galThumbs').innerHTML=Object.keys(POI).map(k=>`<button type="button" data-k="${k}" aria-pressed="${k===gal.key}" aria-label="Show ${POI[k].label}"><canvas></canvas><span>${POI[k].label}</span></button>`).join('');
  }
  $$('#galThumbs button').forEach(b=>{
    b.setAttribute('aria-pressed',b.dataset.k===gal.key);
    const c=$('canvas',b);sizeCanvas(c,1);drawLeather(c,viewFor(c,b.dataset.k),leatherOpt(state.mat,state.tint));
  });
}
function initGallery(){
  const main=$('#galMain'),cv=$('#galCanvas'),lp=$('#loupe'),lc=$('#loupeCanvas');
  $('#galThumbs').addEventListener('click',e=>{const b=e.target.closest('[data-k]');if(!b)return;gal.key=b.dataset.k;drawGallery()});
  let pend=null;
  main.addEventListener('pointermove',e=>{
    if(e.pointerType!=='mouse'||!gal.view)return;
    const r=main.getBoundingClientRect(),v=gal.view;
    const px=(e.clientX-r.left)*(cv.width/r.width),py=(e.clientY-r.top)*(cv.height/r.height);
    const wx=v.cx+(px-cv.width/2)/v.scale,wy=v.cy+(py-cv.height/2)/v.scale;
    lp.hidden=false;lp.style.left=(e.clientX-r.left-105)+'px';lp.style.top=(e.clientY-r.top-105)+'px';
    pend={wx,wy,s:v.scale};
    if(!lp._r)lp._r=requestAnimationFrame(()=>{lp._r=0;const n=Math.round(210*DPR);if(lc.width!==n){lc.width=lc.height=n}if(pend)drawLeather(lc,{cx:pend.wx,cy:pend.wy,scale:pend.s*5},leatherOpt(state.mat,state.tint))});
  });
  main.addEventListener('pointerleave',()=>{lp.hidden=true});
  main.addEventListener('click',()=>{lp.hidden=true;openMacro(gal.key)});
}

function macroViewer(cv,onChange){
  const v={cx:1000,cy:650,zoom:1,tz:1,tcx:1000,tcy:650},P=new Map();let raf=0,dead=false,lastKey='';
  const opt=()=>leatherOpt(state.mat,state.tint);
  const base=()=>worldScale(cv);
  function clampT(){const s=base()*v.tz,vw=cv.width/s,vh=cv.height/s;v.tcx=vw>=2000?1000:clamp(v.tcx,vw/2,2000-vw/2);v.tcy=vh>=1300?650:clamp(v.tcy,vh/2,1300-vh/2)}
  function frame(){
    if(dead)return;raf=requestAnimationFrame(frame);
    const resized=sizeCanvas(cv,DPR),k=RM?1:.2;
    const dz=v.tz-v.zoom,dx=v.tcx-v.cx,dy=v.tcy-v.cy;
    if(!resized&&Math.abs(dz)<.0005&&Math.abs(dx)<.05&&Math.abs(dy)<.05&&lastKey===key())return;
    if(resized)clampT();
    v.zoom+=Math.abs(dz)<.003?dz:dz*k;v.cx+=Math.abs(dx)<.05?dx:dx*k;v.cy+=Math.abs(dy)<.05?dy:dy*k;
    drawLeather(cv,{cx:v.cx,cy:v.cy,scale:base()*v.zoom},opt());lastKey=key();onChange(v,base());
  }
  const key=()=>[v.zoom.toFixed(3),v.cx.toFixed(1),v.cy.toFixed(1),cv.width].join();
  function zoomAt(f,px,py){
    const s=base()*v.tz,wx=v.tcx+(px-cv.width/2)/s,wy=v.tcy+(py-cv.height/2)/s;
    v.tz=clamp(v.tz*f,1,24);const s2=base()*v.tz;v.tcx=wx-(px-cv.width/2)/s2;v.tcy=wy-(py-cv.height/2)/s2;clampT();
  }
  const toPx=e=>{const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)*cv.width/r.width,y:(e.clientY-r.top)*cv.height/r.height,k:cv.width/r.width}};
  const dist=()=>{const a=[...P.values()];return Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)};
  let ld=0,manual=()=>{};
  cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);P.set(e.pointerId,{x:e.clientX,y:e.clientY});if(P.size===2)ld=dist();cv.focus({preventScroll:true})});
  cv.addEventListener('pointermove',e=>{
    const p=P.get(e.pointerId);if(!p)return;const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;
    const q=toPx(e),s=base()*v.tz;
    if(P.size===1){v.tcx-=dx*q.k/s;v.tcy-=dy*q.k/s;clampT();v.cx=v.tcx;v.cy=v.tcy;manual()}
    else if(P.size===2){const d=dist(),c=toPx(e);zoomAt(d/ld,c.x,c.y);ld=d;manual()}
  });
  const up=e=>{P.delete(e.pointerId)};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  cv.addEventListener('wheel',e=>{e.preventDefault();const q=toPx(e);zoomAt(Math.exp(-e.deltaY*.0018),q.x,q.y);manual()},{passive:false});
  cv.addEventListener('keydown',e=>{
    const s=base()*v.tz,st=cv.width*.12/s;let h=true;
    if(e.key==='ArrowLeft')v.tcx-=st;else if(e.key==='ArrowRight')v.tcx+=st;else if(e.key==='ArrowUp')v.tcy-=st;else if(e.key==='ArrowDown')v.tcy+=st;
    else if(e.key==='+'||e.key==='=')zoomAt(1.4,cv.width/2,cv.height/2);else if(e.key==='-')zoomAt(1/1.4,cv.width/2,cv.height/2);else h=false;
    if(h){e.preventDefault();clampT();manual()}
  });
  raf=requestAnimationFrame(frame);
  return{v,set(cx,cy,z){v.tz=z;v.tcx=cx;v.tcy=cy;clampT()},zoomCenter(z){zoomAt(z/v.tz,cv.width/2,cv.height/2)},onManual(f){manual=f},destroy(){dead=true;cancelAnimationFrame(raf)}};
}
function openMacro(startKey){
  let mv=null;
  const tiers=[1,4,8,16];
  const html=`<div class="macro-bar"><div><h3 id="modalTitle">Macro grain inspection</h3><span class="muted" style="font-size:.78rem">${MATS[state.mat].name} · ${TINTS[state.tint].name}</span></div>
    <div class="macro-tools" role="group" aria-label="Zoom level">${tiers.map(t=>`<button type="button" data-z="${t}" aria-pressed="false">×${t}</button>`).join('')}</div>
    <div class="macro-tools" role="group" aria-label="Inspection points">${Object.keys(POI).map(k=>`<button type="button" data-k="${k}" aria-pressed="false">${POI[k].label}</button>`).join('')}</div></div>
    <div class="macro-body"><canvas id="macroCv" tabindex="0" role="img" aria-label="Deep zoom view of the leather. Drag to pan, scroll or pinch to zoom, arrow keys pan, plus and minus zoom."></canvas>
    <div class="macro-read" id="macroRead" aria-live="off"></div><div class="macro-note" id="macroNote"></div></div>`;
  openModal(html,{cls:'full',onClose:()=>{mv&&mv.destroy()},onOpen:b=>{
    const cv=$('#macroCv',b),rd=$('#macroRead',b),nt=$('#macroNote',b);
    const setNote=k=>{const p=POI[k];nt.innerHTML=p?`<b>${p.title}</b>${p.text}`:'';$$('[data-k]',b).forEach(x=>x.setAttribute('aria-pressed',x.dataset.k===k))};
    mv=macroViewer(cv,(v,base)=>{const s=base*v.zoom,fov=(cv.width/s)*.03;rd.innerHTML='Magnification <b class="num">×'+v.zoom.toFixed(1)+'</b><br>Field of view <b class="num">'+fov.toFixed(2)+' mm</b>';$$('[data-z]',b).forEach(x=>x.setAttribute('aria-pressed',Math.abs(v.tz-(+x.dataset.z))<.01))});
    mv.onManual(()=>setNote(null));
    const poi=k=>{const p=POI[k];setNote(k);requestAnimationFrame(()=>{sizeCanvas(cv,DPR);mv.set(p.cx,p.cy,p.zoom)})};
    b.addEventListener('click',e=>{const z=e.target.closest('[data-z]'),k=e.target.closest('[data-k]');if(z){setNote(null);mv.zoomCenter(+z.dataset.z)}else if(k)poi(k.dataset.k)});
    sizeCanvas(cv,DPR);poi(startKey&&POI[startKey]?startKey:'grain');
    $('[data-z="1"]',b).setAttribute('aria-pressed','false');
  }});
}

/* ===== Module C: ageing and patina ===== */
const PAT={
  natural:{k:['#D9B887','#C99A5B','#B07A3E','#96612B','#7F4F22','#6B411C'],sheen:1,grain:.9,note:'Vegetable-tanned hide changes the most. Expect a shift from pale tan to deep honey brown.'},
  cognac:{k:['#A0522D','#94491F','#86401A','#783816','#6A3012','#5E2A10'],sheen:.85,grain:.8,note:'Aniline-dyed full-grain deepens steadily and develops a warm, even glow.'},
  noir:{k:['#1C1A19','#1F1D1B','#221F1D','#252220','#282523','#2B2826'],sheen:1.3,grain:1,note:'Black pebble grain stays dark and instead softens, with a gentle sheen at touch points.'}
};
const PAT_TXT=[
  ['As cut','A pale, even surface with a slightly waxy hand. The leather is firm and the edges are crisp.'],
  ['First warmth','Hands and daylight begin to deepen the surface. The first soft creases appear around the strap.'],
  ['Colour settles in','Oils from handling darken the high-touch zones and the grain starts to glow.'],
  ['A mature sheen','The leather has relaxed around its contents and early scuffs have blended into the surface.'],
  ['Deep and supple','Edges burnish to a soft shine, and the colour is richer than any dye could make it.'],
  ['Fully yours','A dense, glowing patina with creases that map exactly how you carry it.']
];
const PATD=(()=>{
  const r=mulberry(5),d={blobs:[],creases:[],scratches:[]};
  for(let i=0;i<60;i++)d.blobs.push([60+r()*1080,50+r()*640,40+r()*130,r()<.55?1:0]);
  for(let i=0;i<16;i++){const pts=[];let x=380+r()*440,y=330+r()*260,a=(r()-.5)*.6;for(let k=0;k<6;k++){pts.push([x,y]);a+=(r()-.5)*.7;x+=Math.cos(a)*70;y+=Math.sin(a)*40+4}d.creases.push(pts)}
  for(let i=0;i<46;i++)d.scratches.push([100+r()*1000,80+r()*580,20+r()*60,r()*3.14]);
  const t=document.createElement('canvas');t.width=t.height=200;const c=t.getContext('2d');
  for(let i=0;i<1100;i++){c.fillStyle='rgba(15,6,0,'+(.2+r()*.2)+')';c.beginPath();c.ellipse(r()*200,r()*200,.8+r()*1.4,.6+r()*.8,r()*3,0,6.3);c.fill()}
  d.tile=t;return d;
})();
function rrPath(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function drawPatina(cv,t,key){
  const c=cv.getContext('2d'),W=cv.width,H=cv.height,L=PAT[key],k=t/5,i=Math.min(4,Math.floor(t)),f=t-i,col=mixHex(L.k[i],L.k[i+1],f);
  c.setTransform(1,0,0,1,0,0);c.fillStyle='#0c0a09';c.fillRect(0,0,W,H);
  c.save();c.shadowColor='rgba(0,0,0,.7)';c.shadowBlur=44;c.shadowOffsetY=20;rrPath(c,60,50,1080,640,56);c.fillStyle=col;c.fill();c.restore();
  c.save();rrPath(c,60,50,1080,640,56);c.clip();
  let g=c.createLinearGradient(0,50,0,690);g.addColorStop(0,shade(col,.07));g.addColorStop(.5,col);g.addColorStop(1,shade(col,-.1));c.fillStyle=g;c.fillRect(60,50,1080,640);
  c.globalAlpha=L.grain*(1-.5*k);c.fillStyle=c.createPattern(PATD.tile,'repeat');c.fillRect(60,50,1080,640);c.globalAlpha=1;
  for(const b of PATD.blobs){const a=(.05+.11*k)*(b[3]?1:.7),rg=c.createRadialGradient(b[0],b[1],0,b[0],b[1],b[2]);rg.addColorStop(0,b[3]?`rgba(25,10,0,${a})`:`rgba(255,225,190,${a*.55})`);rg.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=rg;c.fillRect(b[0]-b[2],b[1]-b[2],b[2]*2,b[2]*2)}
  /* strap */
  c.fillStyle='rgba(0,0,0,.17)';rrPath(c,525,30,150,500,18);c.fill();
  c.fillStyle='rgba(255,235,205,'+(.04+.05*k)+')';c.fillRect(531,50,8,470);
  c.fillStyle='rgba(0,0,0,.45)';for(const y of[250,310,370]){c.beginPath();c.arc(600,y,8,0,6.3);c.fill()}
  /* hand oils */
  for(const z of[[600,330,330,.34],[600,540,260,.3],[230,420,210,.2],[980,420,200,.16]]){const rg=c.createRadialGradient(z[0],z[1],0,z[0],z[1],z[2]);rg.addColorStop(0,`rgba(40,16,0,${z[3]*k})`);rg.addColorStop(1,'rgba(40,16,0,0)');c.fillStyle=rg;c.fillRect(60,50,1080,640)}
  {const rg=c.createRadialGradient(600,370,260,600,370,720);rg.addColorStop(0,'rgba(30,12,0,0)');rg.addColorStop(1,`rgba(30,12,0,${.14+.3*k})`);c.fillStyle=rg;c.fillRect(60,50,1080,640)}
  /* creases */
  c.lineCap='round';
  for(const pts of PATD.creases){
    for(const[lw,sx,col2] of[[3.5,0,`rgba(20,8,0,${.05+.36*k})`],[1.6,2,`rgba(255,230,200,${.03+.07*k})`]]){
      c.strokeStyle=col2;c.lineWidth=lw;c.beginPath();c.moveTo(pts[0][0]+sx,pts[0][1]+sx);for(let n=1;n<pts.length;n++)c.lineTo(pts[n][0]+sx,pts[n][1]+sx);c.stroke()}
  }
  /* early scuffs that blend away */
  const sa=.34*Math.max(0,1-Math.abs(t-1)/1.7);
  if(sa>.01){c.strokeStyle=`rgba(255,235,210,${sa})`;c.lineWidth=1.6;for(const s of PATD.scratches){c.beginPath();c.moveTo(s[0],s[1]);c.lineTo(s[0]+Math.cos(s[3])*s[2],s[1]+Math.sin(s[3])*s[2]);c.stroke()}}
  /* sheen */
  const sh=Math.min(1,(.04+.16*k)*L.sheen);
  g=c.createLinearGradient(120,60,700,700);g.addColorStop(0,'rgba(255,240,220,0)');g.addColorStop(.38,`rgba(255,240,220,${sh*.5})`);g.addColorStop(.5,`rgba(255,240,220,${sh})`);g.addColorStop(.62,`rgba(255,240,220,${sh*.3})`);g.addColorStop(1,'rgba(255,240,220,0)');c.fillStyle=g;c.fillRect(60,50,1080,640);
  const gl=c.createRadialGradient(330,230,0,330,230,260);gl.addColorStop(0,`rgba(255,240,220,${.2*k*L.sheen})`);gl.addColorStop(1,'rgba(255,240,220,0)');c.fillStyle=gl;c.fillRect(60,50,1080,640);
  c.restore();
  /* painted edge */
  rrPath(c,60,50,1080,640,56);c.strokeStyle=shade(col,-.45);c.lineWidth=8;c.stroke();
  rrPath(c,64,54,1072,632,52);c.strokeStyle=`rgba(255,235,210,${.08+.1*k})`;c.lineWidth=2;c.stroke();
  /* stitching */
  const thread=mixHex('#F2E6C9','#B89A6A',k);
  const stitch=(fn)=>{c.save();c.setLineDash([18,12]);c.lineCap='round';c.translate(2,3);c.strokeStyle='rgba(0,0,0,.45)';c.lineWidth=6;fn();c.stroke();c.restore();c.save();c.setLineDash([18,12]);c.lineCap='round';c.strokeStyle=thread;c.lineWidth=5;fn();c.stroke();c.restore()};
  stitch(()=>rrPath(c,98,88,1004,564,36));
  stitch(()=>{c.beginPath();c.moveTo(548,52);c.lineTo(548,500)});stitch(()=>{c.beginPath();c.moveTo(652,52);c.lineTo(652,500)});
  /* buckle */
  const b1=mixHex('#F0D27A','#8C6B2E',k),b2=mixHex('#B8902E','#4E3A17',k);
  g=c.createLinearGradient(490,440,710,560);g.addColorStop(0,b1);g.addColorStop(.5,b2);g.addColorStop(1,b1);
  c.save();c.shadowColor='rgba(0,0,0,.55)';c.shadowBlur=14;c.shadowOffsetY=6;rrPath(c,492,446,216,128,16);c.strokeStyle=g;c.lineWidth=18;c.stroke();c.restore();
  c.strokeStyle=g;c.lineWidth=11;c.beginPath();c.moveTo(600,470);c.lineTo(600,548);c.stroke();
  c.fillStyle=g;c.beginPath();c.arc(600,470,12,0,6.3);c.fill();
}
const pat={t:0,raf:0};
function setPatina(t){
  pat.t=t;const k=t/5;
  $('#patTag').textContent='Year '+(t%1<.05||t%1>.95?Math.round(t):t.toFixed(1));
  const L=PAT[state.pat],i=Math.min(5,Math.round(t)),tx=PAT_TXT[i];
  $('#patCopy').innerHTML='<b>'+tx[0]+'</b><span class="muted">'+tx[1]+' '+L.note+'</span>';
  const d=Math.round(100*(1-Math.pow(1-k,1.5))),so=Math.round(100*(1-Math.exp(-2.4*k))/(1-Math.exp(-2.4))),sh=Math.round(Math.min(100,100*Math.pow(k,1.2)*L.sheen*.9));
  $('#mDepth').textContent=d+'%';$('#bDepth').style.width=d+'%';$('#mSoft').textContent=so+'%';$('#bSoft').style.width=so+'%';$('#mSheen').textContent=sh+'%';$('#bSheen').style.width=sh+'%';
  const cv=$('#patinaCanvas');if(cv)drawPatina(cv,t,state.pat);
  $('#patYear').setAttribute('aria-valuetext','Year '+t.toFixed(1)+': '+tx[0]);
}
function drawPatinaNow(){if(state.view==='product')setPatina(+$('#patYear').value)}
function initPatina(){
  $('#patYear').addEventListener('input',e=>{stopPlay();setPatina(+e.target.value)});
  $('#patPlay').addEventListener('click',()=>{
    if(pat.raf){stopPlay();return}
    const sl=$('#patYear');let from=+sl.value>=4.95?0:+sl.value;const t0=performance.now(),dur=RM?1:(5-from)*1300+200;
    $('#patPlay').textContent='Pause';
    const step=n=>{const u=clamp((n-t0)/dur,0,1),val=from+(5-from)*u;sl.value=val;setPatina(val);if(u<1)pat.raf=requestAnimationFrame(step);else stopPlay()};
    pat.raf=requestAnimationFrame(step);
  });
}
function stopPlay(){if(pat.raf){cancelAnimationFrame(pat.raf);pat.raf=0}$('#patPlay').textContent='Play five years'}

/* ===== Module D: AR, scale and fit ===== */
/* To enable iOS Quick Look and Android Scene Viewer, host a .usdz and a .glb per product
   (public https URLs) and list them here, e.g. meridian:{usdz:'https://…/meridian.usdz',glb:'https://…/meridian.glb'}. */
const AR_ASSETS={};
function sil(p,x,y,col){
  const[w,h]=p.cm,m=p.m,dk=shade(col,-.3),lt=shade(col,.15),r=Math.min(w,h)*.07,lw=Math.max(.5,w*.012);let s=`<g transform="translate(${x.toFixed(2)},${y.toFixed(2)})">`;
  if(m.handle==='top'){const hh=Math.max(2.4,h*.2);s+=`<path d="M${w*.32} 0C${w*.32} ${-hh*1.35} ${w*.68} ${-hh*1.35} ${w*.68} 0" fill="none" stroke="${dk}" stroke-width="${Math.max(1,w*.03)}" stroke-linecap="round"/>`}
  if(m.handle==='twin'){const hh=h*.52;s+=`<path d="M${w*.22} 0C${w*.22} ${-hh*1.3} ${w*.78} ${-hh*1.3} ${w*.78} 0" fill="none" stroke="${dk}" stroke-width="${Math.max(1,w*.03)}" stroke-linecap="round"/>`}
  s+=`<rect width="${w}" height="${h}" rx="${r}" fill="${col}"/>`;
  if(m.flap)s+=`<path d="M0 ${r}Q0 0 ${r} 0H${w-r}Q${w} 0 ${w} ${r}V${h*.46}Q${w} ${h*.54} ${w*.9} ${h*.54}H${w*.1}Q0 ${h*.54} 0 ${h*.46}Z" fill="${lt}" opacity=".55"/>`;
  s+=`<rect x="${w*.04}" y="${h*.04}" width="${w*.92}" height="${h*.92}" rx="${r*.8}" fill="none" stroke="rgba(245,245,220,.5)" stroke-width="${Math.max(.3,w*.006)}" stroke-dasharray="${w*.012} ${w*.01}"/>`;
  if(m.clasps)for(const i of[.27,.73])s+=`<rect x="${w*i-w*.03}" y="${h*.46}" width="${w*.06}" height="${h*.12}" rx="${w*.008}" fill="#D4AF37"/>`;
  if(m.buckle)s+=`<rect x="${w*.46}" y="${h*.5}" width="${w*.08}" height="${h*.3}" fill="${dk}"/><rect x="${w*.43}" y="${h*.48}" width="${w*.14}" height="${h*.1}" fill="none" stroke="#D4AF37" stroke-width="${w*.012}"/>`;
  return s+'</g>';
}
function dimLabel(x1,y1,x2,y2,txt,off){
  const vert=Math.abs(x1-x2)<.01,mx=(x1+x2)/2,my=(y1+y2)/2;
  return `<g stroke="#D4AF37" stroke-width=".35" fill="none"><path d="M${x1} ${y1}L${x2} ${y2}"/>${vert?`<path d="M${x1-1.4} ${y1}h2.8M${x2-1.4} ${y2}h2.8"/>`:`<path d="M${x1} ${y1-1.4}v2.8M${x2} ${y2-1.4}v2.8"/>`}</g><text x="${vert?mx+off:mx}" y="${vert?my:my+off}" fill="#F5F5DC" font-size="4.6" font-family="Montserrat,sans-serif" text-anchor="${vert?'start':'middle'}" dominant-baseline="middle">${txt}</text>`;
}
function roomSVG(p,col){
  const[w,h]=p.cm,fl=205,desk=75,top=fl-desk,px=74,hh=p.m.handle==='twin'?h*.5:p.m.handle==='top'?Math.max(2.4,h*.2)*1.2:0;
  let s=`<svg viewBox="0 0 260 210" role="img" aria-label="${esc(p.name)} placed on a desk next to a laptop and a door, drawn to scale"><rect width="260" height="210" fill="#0f0d0c"/>`;
  s+=`<path d="M0 ${fl}H260" stroke="#938E7B" stroke-width=".6"/>`;
  s+=`<rect x="180" y="5" width="76" height="${fl-5}" fill="none" stroke="#938E7B" stroke-width=".5" stroke-dasharray="2 2"/><text x="218" y="${fl-100}" text-anchor="middle" fill="#938E7B" font-size="4" font-family="Montserrat,sans-serif">DOOR 200 × 80 CM</text>`;
  s+=`<rect x="14" y="${top}" width="150" height="3" fill="#3b312a"/><rect x="18" y="${top+3}" width="3" height="${desk-3}" fill="#3b312a"/><rect x="157" y="${top+3}" width="3" height="${desk-3}" fill="#3b312a"/>`;
  s+=`<rect x="24" y="${top-1.8}" width="32" height="1.8" fill="#6b6f75"/><rect x="24" y="${top-1.8-21}" width="32" height="21" rx="1" fill="#1a1d22" stroke="#6b6f75" stroke-width=".5"/><text x="40" y="${top-14}" text-anchor="middle" fill="#938E7B" font-size="3.2" font-family="Montserrat,sans-serif">14&quot; LAPTOP</text>`;
  s+=`<rect x="146" y="${top-9.5}" width="8" height="9.5" rx="1" fill="#e6e0cc" opacity=".8"/><text x="150" y="${top+6}" text-anchor="middle" fill="#938E7B" font-size="3" font-family="Montserrat,sans-serif">MUG</text>`;
  s+=sil(p,px,top-h,col);
  s+=dimLabel(px,top-h-hh-3.5,px+w,top-h-hh-3.5,w+' cm',-3.4);
  s+=dimLabel(px+w+4,top-h,px+w+4,top,h+' cm',2.4);
  s+=`<g stroke="#938E7B" stroke-width=".3">${[0,50,100,150,200].map(v=>`<path d="M2 ${fl-v}h4"/><text x="8" y="${fl-v}" fill="#938E7B" font-size="3.2" stroke="none" font-family="Montserrat,sans-serif" dominant-baseline="middle">${v}</text>`).join('')}</g></svg>`;
  return s;
}
function modelSVG(p,col,H){
  const[w,h]=p.cm,fl=203,cx=70,y=f=>fl-f*H,hipW=.19*H,shW=.26*H,carry=p.carry;
  const hh=p.m.handle==='twin'?h*.52:p.m.handle==='top'?Math.max(2.4,h*.2)*1.2:0;
  const sk='rgba(245,245,220,.55)',fillb='rgba(245,245,220,.07)';
  let s=`<svg viewBox="0 0 200 210" role="img" aria-label="${esc(p.name)} carried by a ${H} centimetre tall person, drawn to scale"><rect width="200" height="210" fill="#0f0d0c"/><path d="M0 ${fl}H200" stroke="#938E7B" stroke-width=".6"/>`;
  s+=`<g fill="${fillb}" stroke="${sk}" stroke-width=".6">`;
  s+=`<rect x="${cx-hipW/2}" y="${y(.52)}" width="${hipW/2-.5}" height="${.52*H}" rx="2"/><rect x="${cx+.5}" y="${y(.52)}" width="${hipW/2-.5}" height="${.52*H}" rx="2"/>`;
  s+=`<path d="M${cx-shW/2} ${y(.82)}Q${cx} ${y(.85)} ${cx+shW/2} ${y(.82)}L${cx+hipW/2+1} ${y(.5)}L${cx-hipW/2-1} ${y(.5)}Z"/>`;
  s+=`<circle cx="${cx}" cy="${y(.935)}" r="${.062*H}"/><rect x="${cx-.022*H}" y="${y(.875)}" width="${.044*H}" height="${.04*H}"/></g>`;
  const handY=carry==='arm'?y(.62):carry==='hip'?y(.5):y(.46),px=cx+shW/2+.04*H;
  s+=`<g stroke="${sk}" stroke-width="${.045*H*.5}" stroke-linecap="round" fill="none"><path d="M${cx-shW/2+1} ${y(.8)}L${cx-shW/2-.01*H} ${y(.47)}"/><path d="M${cx+shW/2-1} ${y(.8)}L${px} ${carry==='hip'?y(.5):handY}"/></g>`;
  let bx,by;
  if(carry==='hip'){bx=px-w*.15;by=y(.58);s+=`<path d="M${cx-shW/2+2} ${y(.82)}L${bx+w*.15} ${by}M${cx+shW/2-2} ${y(.82)}L${bx+w*.85} ${by}" stroke="#7a5630" stroke-width="1.2" fill="none"/>`}
  else{bx=px-w/2;by=handY+hh}
  s+=sil(p,bx,by,col);
  s+=dimLabel(bx,by+h+5,bx+w,by+h+5,w+' cm',-3.4);
  s+=`<g stroke="#938E7B" stroke-width=".3">${[0,50,100,150,200].filter(v=>v<=H+20).map(v=>`<path d="M2 ${fl-v}h4"/><text x="8" y="${fl-v}" fill="#938E7B" font-size="3.2" stroke="none" font-family="Montserrat,sans-serif" dominant-baseline="middle">${v}</text>`).join('')}</g>`;
  s+=`<text x="${cx}" y="${y(1)-5}" text-anchor="middle" fill="#F5F5DC" font-size="4.4" font-family="Montserrat,sans-serif">${H} CM</text></svg>`;
  return s;
}
function openAR(){
  const p=byId(state.pid),col=TINTS[state.tint].hex;let tab='room',H=175;
  const html=`<span class="eyebrow">Scale &amp; fit</span><h3 id="modalTitle" style="font-size:clamp(1.8rem,3.4vw,2.6rem);margin:.4rem 0">${esc(p.name)}</h3>
  <p class="muted">Drawn to true scale at ${p.cm.join(' × ')} cm. Use AR on your phone to stand it in the room.</p>
  <div class="ar-tabs" role="tablist" aria-label="Scale view"><button role="tab" id="arTabRoom" aria-selected="true" data-t="room">In your room</button><button role="tab" id="arTabModel" aria-selected="false" data-t="model">On model</button></div>
  <div class="ar-scene" id="arScene" role="tabpanel"></div>
  <div class="ar-ctl" id="arCtl"></div>
  <div class="quiz-actions"><button class="btn primary" id="arLaunch" data-autofocus>Place it in my space with AR</button></div>
  <p class="ar-status" id="arStatus" role="status"></p>`;
  openModal(html,{cls:'wide',onOpen:b=>{
    const draw=()=>{
      $('#arScene',b).innerHTML=tab==='room'?roomSVG(p,col):modelSVG(p,col,H);
      $('#arCtl',b).innerHTML=tab==='model'?`<label class="lbl" for="arH">Model height</label><input class="slider" type="range" id="arH" min="150" max="195" step="1" value="${H}" aria-valuetext="${H} centimetres"><output class="num" for="arH">${H} cm</output>`:'<span class="fine">Laptop, mug and door are shown at real size for comparison.</span>';
      $$('[data-t]',b).forEach(x=>x.setAttribute('aria-selected',x.dataset.t===tab));
      const sl=$('#arH',b);if(sl)sl.oninput=()=>{H=+sl.value;$('#arScene',b).innerHTML=modelSVG(p,col,H);$('output',b).textContent=H+' cm';sl.setAttribute('aria-valuetext',H+' centimetres')};
    };
    b.addEventListener('click',e=>{const t=e.target.closest('[data-t]');if(t){tab=t.dataset.t;draw()}});
    $('#arLaunch',b).onclick=()=>launchAR($('#arStatus',b));
    draw();
  }});
}
async function launchAR(st){
  const ua=navigator.userAgent,ios=/iPad|iPhone|iPod/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1),android=/Android/i.test(ua),a=AR_ASSETS[state.pid]||{};
  let xr=false;try{xr=!!(navigator.xr&&await navigator.xr.isSessionSupported('immersive-ar'))}catch(e){}
  if(xr){st.textContent='Starting AR. Move your phone slowly until the ring appears, then tap to place.';startWebXR(st);return}
  if(ios&&a.usdz){const l=document.createElement('a');l.rel='ar';l.href=a.usdz;l.appendChild(document.createElement('img'));l.click();return}
  if(android&&a.glb){window.location.href='intent://arvr.google.com/scene-viewer/1.0?file='+encodeURIComponent(a.glb)+'&mode=ar_preferred#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;end;';return}
  st.textContent='Camera AR needs a supported phone and a page served over HTTPS. The to-scale views above work on any device.';
}
function startWebXR(st){
  ensureThree(async()=>{
    try{
      const p=byId(state.pid),renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
      renderer.xr.enabled=true;renderer.outputEncoding=THREE.sRGBEncoding;renderer.setPixelRatio(DPR);
      const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera();scene.environment=makeEnv(renderer);
      scene.add(new THREE.HemisphereLight(0xffffff,0x443322,1.1));const dl=new THREE.DirectionalLight(0xffffff,1.1);dl.position.set(1,3,2);scene.add(dl);
      const M=createMats();configureMats(M,renderer);const model=buildModel(p,M);configureDecal(M,model.userData.decal);
      model.position.y=-model.userData.bottom;const placed=new THREE.Group();placed.scale.setScalar(.01);placed.add(model);placed.visible=false;scene.add(placed);
      const ret=new THREE.Mesh(new THREE.RingGeometry(.08,.1,32).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0xD4AF37}));ret.matrixAutoUpdate=false;ret.visible=false;scene.add(ret);
      const session=await navigator.xr.requestSession('immersive-ar',{requiredFeatures:['hit-test']});
      renderer.xr.setReferenceSpaceType('local');await renderer.xr.setSession(session);
      const vs=await session.requestReferenceSpace('viewer'),hit=await session.requestHitTestSource({space:vs});
      renderer.setAnimationLoop((t,frame)=>{
        if(frame){const ref=renderer.xr.getReferenceSpace(),hits=frame.getHitTestResults(hit);if(hits.length){const pose=hits[0].getPose(ref);ret.visible=true;ret.matrix.fromArray(pose.transform.matrix)}else ret.visible=false}
        renderer.render(scene,camera);
      });
      session.addEventListener('select',()=>{if(ret.visible){placed.position.setFromMatrixPosition(ret.matrix);placed.visible=true}});
      session.addEventListener('end',()=>{renderer.setAnimationLoop(null);renderer.dispose();st.textContent='AR session ended.'});
    }catch(err){st.textContent='AR could not start on this device. The to-scale views above still apply.'}
  },()=>{st.textContent='The 3D library could not load, so AR is unavailable right now.'});
}
/* ===== Module E: care concierge ===== */
const CARE={
  balm:{name:'Beeswax Conditioning Balm',price:34,short:'Everyday conditioner, full-grain and pebble'},
  mink:{name:'Mink Oil Paste',price:28,short:'Deep feed for dry, smooth leather'},
  cedar:{name:'Cedar & Lavender Light Cream',price:32,short:'Breathable conditioner for damp climates'},
  silica:{name:'Silica Moisture Pouches (6)',price:18,short:'Keeps stored pieces dry'},
  brush:{name:'Horsehair Finishing Brush',price:42,short:'Daily dust and grit removal'},
  wax:{name:'Water-Repellent Wax',price:30,short:'Weather shield, smooth leather only'},
  dust:{name:'Cotton Dust Bag',price:24,short:'Storage that lets leather breathe'},
  travel:{name:'Travel Care Tin',price:36,short:'Balm and cloth in a pocket tin'},
  scuff:{name:'Scuff-Concealing Wax Crayon',price:22,short:'Hides light scratches and scuffs'},
  suedeSet:{name:'Suede Brush & Eraser Set',price:38,short:'Lifts nap and marks, no liquids'},
  suedeSpray:{name:'Nano Protector Spray',price:26,short:'Invisible water and stain shield'},
  exoticCream:{name:'Exotic Moisturising Cream',price:48,short:'Water-based, safe on lacquer and scales'},
  cloth:{name:'Microfibre Polishing Cloths (3)',price:16,short:'Soft, lint-free finishing'}
};
const QUIZ=[
  {k:'climate',q:'What climate do you live in?',o:[['humid','Humid','Warm and damp, monsoon or coastal'],['arid','Arid','Dry heat or desert air'],['temperate','Temperate','Mild, four seasons']]},
  {k:'usage',q:'How often do you use your leather piece?',o:[['commuter','Daily commuter','On the move every working day'],['occasional','Occasional','A few times a week or less'],['travel','Travel','Planes, trains and suitcases']]},
  {k:'finish',q:'What is the leather finish?',o:[['full','Full-grain','Natural, unfinished surface'],['pebble','Pebble grain','Embossed texture'],['suede','Suede','Soft brushed nap'],['exotic','Exotic','Scaled or lacquered']]}
];
function recommend(a){
  const out=[],why={},push=(id,r)=>{if(!out.includes(id)){out.push(id);why[id]=r}};
  const smooth=a.finish==='full'||a.finish==='pebble';
  if(a.finish==='suede'){push('suedeSet','Suede needs a dry brush to lift the nap. Never oil it.');push('suedeSpray',a.climate==='humid'?'Damp air makes suede stain and ripen quickly. A protector keeps moisture out.':'A fine mist keeps rain and spills from soaking the nap.')}
  else if(a.finish==='exotic'){push('exoticCream','Scales dry out between the plates. A water-based cream keeps them supple without clouding the lacquer.');push('cloth','Soft cloths polish without scratching the lacquered surface.')}
  else if(a.climate==='arid')push('mink','Dry air pulls moisture from the hide. Mink oil feeds deeply and slows cracking.');
  else if(a.climate==='humid')push('cedar','A light cream conditions without clogging the pores, and cedar helps deter mould.');
  else push('balm','Temperate weather suits a gentle beeswax balm, applied each season.');
  if(a.climate==='humid')push('silica','Silica pouches keep stored pieces dry and mould-free.');
  if(a.usage==='commuter'){push('brush','A daily flick with horsehair removes grit before it wears the grain.');if(smooth)push('wax','Daily weather calls for a wax layer, refreshed monthly.')}
  else if(a.usage==='travel'){push('travel','A pocket tin of care for the road.');if(smooth)push('scuff','Hides the scuffs that luggage belts leave behind.')}
  else push('dust','Between uses, a cotton bag lets the leather breathe and keeps the dust off.');
  return out.slice(0,4).map(id=>({id,why:why[id]}));
}
function cadence(a){
  if(a.finish==='suede')return 'Brush after every use and re-apply protector each season.';
  if(a.finish==='exotic')return 'Moisturise every 12 weeks and wipe with a dry cloth after use.';
  const w=a.climate==='arid'?6:a.climate==='humid'?12:8;return 'Condition every '+(a.usage==='commuter'?Math.max(4,Math.round(w*.75)):w)+' weeks and brush weekly.';
}
function openQuiz(){
  const ans={};let step=0;
  const html='<div class="quiz" id="quizBody"></div>';
  openModal(html,{onOpen:b=>{
    const body=$('#quizBody',b);
    const bar=n=>'<div class="quiz-prog" aria-hidden="true">'+QUIZ.map((_,i)=>'<i class="'+(i<=n?'on':'')+'"></i>').join('')+'</div>';
    const render=()=>{
      if(step<QUIZ.length){
        const q=QUIZ[step];
        body.innerHTML=bar(step)+`<span class="eyebrow">Question ${step+1} of ${QUIZ.length}</span><h3 id="modalTitle">${q.q}</h3><div class="opts" role="group" aria-labelledby="modalTitle">${q.o.map(o=>`<button type="button" class="opt" data-v="${o[0]}"><span><b>${o[1]}</b><small>${o[2]}</small></span></button>`).join('')}</div>${step?'<div class="quiz-actions"><button type="button" class="link-btn" data-back>Back</button></div>':''}`;
        const f=$('.opt',body);f&&f.focus();
      }else{
        const rec=recommend(ans),total=rec.reduce((a,r)=>a+CARE[r.id].price,0),disc=Math.round(total*.9*100)/100;
        body.innerHTML=bar(3)+`<span class="eyebrow">Your care kit</span><h3 id="modalTitle">Built for ${ans.climate} air, ${ans.usage==='commuter'?'daily carrying':ans.usage==='travel'?'travel':'occasional use'} and ${QUIZ[2].o.find(o=>o[0]===ans.finish)[1].toLowerCase()} leather</h3>
        <div class="bundle">${rec.map(r=>`<div class="bundle-row"><div><h4>${CARE[r.id].name}</h4><p>${r.why}</p></div><span class="num">${money(CARE[r.id].price)}</span></div>`).join('')}</div>
        <p class="muted">${cadence(ans)}</p>
        <div class="sum-line" style="margin-top:1rem"><span>Bundle price, 10% off</span><span class="num"><s class="muted" style="margin-right:.6rem">${money(total)}</s>${money(disc)}</span></div>
        <div class="quiz-actions"><button type="button" class="btn primary" data-add data-autofocus>Add kit to bag</button><button type="button" class="btn" data-retake>Retake quiz</button></div>`;
        $('[data-add]',body).focus();
        body._rec=rec;
      }
    };
    body.addEventListener('click',e=>{
      const o=e.target.closest('.opt');
      if(o){ans[QUIZ[step].k]=o.dataset.v;step++;render();return}
      if(e.target.closest('[data-back]')){step=Math.max(0,step-1);render();return}
      if(e.target.closest('[data-retake]')){step=0;render();return}
      if(e.target.closest('[data-add]')){
        body._rec.forEach(r=>addToCart({key:'care|'+r.id+'|kit',kind:'care',name:CARE[r.id].name,unit:Math.round(CARE[r.id].price*.9*100)/100,qty:1,sub:'Care kit · 10% off'}));
        closeModal();toast('Care kit added to your bag');openDrawer('cart');
      }
    });
    render();
  }});
}
function renderKits(){
  $('#kitGrid').innerHTML=Object.keys(CARE).map(id=>`<div class="kit"><h4>${CARE[id].name}</h4><span class="num">${money(CARE[id].price)}</span><p>${CARE[id].short}</p><button class="btn" style="grid-column:1/-1;min-height:40px;padding:.5rem 1rem" data-action="addkit" data-id="${id}" aria-label="Add ${CARE[id].name} to bag">Add to bag</button></div>`).join('');
}
viewHooks.care=renderKits;

/* ===== Module F: artisan transparency map ===== */
const LAND=[
 [[-168,65],[-162,70],[-156,71],[-141,70],[-125,70],[-110,68],[-95,68],[-90,64],[-94,59],[-85,55],[-80,52],[-78,58],[-77,62],[-70,61],[-65,60],[-62,56],[-56,52],[-60,47],[-66,44],[-70,42],[-74,40],[-76,35],[-81,31],[-80,26],[-83,29],[-90,30],[-97,27],[-97,22],[-92,18],[-87,21],[-88,16],[-83,15],[-83,10],[-79,9],[-77,8],[-80,8],[-86,11],[-92,14],[-97,16],[-105,20],[-109,25],[-113,31],[-117,32],[-121,35],[-124,40],[-124,47],[-128,51],[-135,58],[-142,60],[-150,60],[-158,57],[-165,54],[-160,59],[-165,62]],
 [[-73,78],[-60,82],[-35,83],[-20,80],[-20,72],[-30,68],[-42,61],[-48,60],[-53,66],[-58,75]],
 [[-77,8],[-72,12],[-62,11],[-52,5],[-50,0],[-44,-2],[-35,-5],[-35,-9],[-39,-14],[-41,-22],[-48,-26],[-53,-34],[-58,-38],[-62,-40],[-65,-45],[-68,-50],[-69,-54],[-73,-52],[-75,-47],[-73,-40],[-71,-30],[-70,-18],[-76,-14],[-81,-6],[-80,-2],[-78,2]],
 [[-9,37],[-9,43],[-2,43.5],[-1,46],[-4,48],[2,51],[5,53],[8,54],[8,57],[10,57.5],[11,54],[14,54],[21,55],[24,58],[29,60],[22,60],[21,63],[25,65.5],[21,65],[17,62],[19,60],[16,56],[12,56],[11,59],[6,58],[5,62],[14,67],[20,70],[30,71],[40,67],[44,66],[60,69],[70,73],[80,73],[100,77],[113,74],[130,72],[150,71],[170,70],[180,68],[180,65],[172,63],[165,60],[160,55],[156,51],[155,58],[143,59],[137,54],[141,52],[140,48],[135,43],[130,42],[129,36],[126,35],[126,38],[121,39],[118,38],[121,37],[120,34],[122,30],[120,26],[117,23],[110,21],[106,20],[109,15],[108,11],[105,9],[103,10],[100,13],[99,8],[101,3],[103,1.3],[100,5],[98,8],[98,13],[94,17],[92,21],[90,22],[87,21],[80,15],[78,8],[75,12],[73,17],[72,21],[68,23],[66,25],[57,25],[56,27],[52,28],[48,30],[50,26],[52,24],[56,26],[57,23],[59,22],[55,17],[52,16],[44,12],[43,15],[39,21],[35,28],[34,31],[35,34],[35,36.5],[30,36.5],[27,37],[26,40],[23,40],[24,38],[22,37],[20,40],[19,42],[13,45.5],[12,44],[16,41],[18,40],[16,38],[15.6,38],[16,40],[13,41],[10,44],[8,44],[4,43.3],[3,42],[0,39],[-1,37.5],[-5,36]],
 [[-5.5,36],[-2,35],[10,37],[11,34],[15,32],[20,32],[30,31],[32,31],[34,28],[35,24],[37,19],[39,15],[43,12],[51,12],[48,5],[41,-2],[40,-10],[35,-20],[33,-26],[28,-33],[20,-35],[18,-32],[14,-23],[12,-13],[13,-5],[9,2],[9,4],[5,6],[-2,5],[-8,4],[-13,8],[-17,14],[-17,21],[-13,27],[-10,30],[-9,33],[-6,35.5]],
 [[-5,50],[1,51],[2,53],[-1,55],[-2,57.5],[-4,58.5],[-6,57],[-5,55],[-3,54],[-5,52]],
 [[-10,52],[-6,52],[-6,55],[-8,55],[-10,54]],
 [[-24,65],[-14,66],[-14,64],[-22,63.5]],
 [[44,-25],[47,-25],[50,-15],[49,-12],[44,-17]],
 [[130,31],[132,34],[136,35],[140,36],[142,40],[141,43],[145,44],[142,45],[140,41],[139,38],[135,36],[131,34]],
 [[95,5],[98,4],[104,-2],[106,-6],[102,-4],[96,2]],
 [[109,1],[113,3],[117,7],[119,5],[116,-3],[111,-3]],
 [[105,-6],[114,-7],[114,-8],[106,-7]],
 [[131,-1],[141,-3],[148,-6],[150,-10],[142,-9],[137,-5]],
 [[114,-22],[122,-17],[130,-12],[137,-12],[136,-15],[141,-12],[143,-14],[146,-19],[153,-26],[151,-34],[147,-39],[141,-38],[135,-35],[130,-31],[124,-34],[115,-34],[114,-26]],
 [[172,-35],[178,-38],[175,-41],[172,-41]],
 [[172,-41],[174,-42],[170,-46],[167,-46]],
 [[120,18],[122,18],[124,13],[126,7],[122,7],[121,14]],
 [[12.5,38],[15.6,38.3],[15,36.7]],[[8.2,41],[9.7,41],[9.5,39],[8.4,39]],[[-85,22],[-80,23],[-74,20],[-77,20]]
];
const LAKES=[[[28,41.5],[41,41],[41,45],[36,45.5],[33,46],[30,46],[28,43.5]],[[47,45],[53,45],[54,40],[53,37],[49,37.5],[49,40],[47,43]]];
const SITES=[
 {id:'tuscany',type:'tannery',name:'Conceria del Valdarno',place:'Santa Croce sull’Arno, Tuscany, Italy',lat:43.71,lon:10.79,role:'Vegetable-tanned full-grain calf in chestnut and quebracho pits. A 40-day cycle.',badges:[['LWG Gold','Leather Working Group audit'],['Vegetable-tanned','Plant tannins only']],m:{trace:100,water:92,chrome:0,energy:64},co2:11.4,scene:{t:'Forty days in the pit',bg:'#24160b',tint:'#a8703a',sp:.5,len:'0:42'}},
 {id:'ubrique',type:'tannery',name:'Curtidos Sierra de Grazalema',place:'Ubrique, Cádiz, Spain',lat:36.68,lon:-5.44,role:'Soft full-grain and suede from Andalusian hides, drum-tanned with low-chrome and mimosa.',badges:[['LWG Gold','Leather Working Group audit'],['Low chrome','Under 1% chromium by weight']],m:{trace:100,water:88,chrome:22,energy:71},co2:13.8,scene:{t:'The tanning drum',bg:'#1f1710',tint:'#9a7248',sp:1.2,len:'0:38'}},
 {id:'ardeche',type:'tannery',name:'Tannerie du Vivarais',place:'Annonay, Ardèche, France',lat:45.24,lon:4.67,role:'Pebble-grain calf, embossed and burnished in a family tannery on the river Deûme.',badges:[['LWG Silver','Leather Working Group audit'],['Traceable','Lot number to farm']],m:{trace:100,water:84,chrome:35,energy:58},co2:14.9,scene:{t:'Embossing the grain',bg:'#221810',tint:'#8c5a2e',sp:.8,len:'0:31'}},
 {id:'devon',type:'tannery',name:'Otter Valley Oak-Bark Pits',place:'Devon, England',lat:50.74,lon:-3.19,role:'Oak-bark bridle butts, tanned for twelve months and finished with tallow and wax.',badges:[['Vegetable-tanned','Oak bark, 12 months'],['Heritage','Continuous since 1830']],m:{trace:100,water:95,chrome:0,energy:80},co2:9.7,scene:{t:'A year in oak bark',bg:'#1e1409',tint:'#b07a3e',sp:.35,len:'0:47'}},
 {id:'london',type:'atelier',name:'Orvane Atelier',place:'Clerkenwell, London, United Kingdom',lat:51.52,lon:-0.11,role:'Where every pattern is cut, every seam is sewn and every edge is burnished by one maker.',badges:[['Repair for life','Free workshop service'],['Renewable energy','100% green tariff']],m:{trace:100,water:100,chrome:0,energy:100},co2:null,scene:{t:'Hand stitching at the bench',bg:'#1b130d',tint:'#c69c6d',sp:.7,len:'0:36'}}
];
const mp={built:false,view:{cx:182.7,cy:45.9,w:42},sel:'tuscany',raf:0,film:{raf:0,playing:true,t:0}};
const lonX=l=>l+180,latY=l=>90-l;
function km(a,b){const R=6371,t=Math.PI/180,dl=(b.lat-a.lat)*t,dn=(b.lon-a.lon)*t,x=Math.sin(dl/2)**2+Math.cos(a.lat*t)*Math.cos(b.lat*t)*Math.sin(dn/2)**2;return Math.round(2*R*Math.asin(Math.sqrt(x)))}
function poly(pts){return 'M'+pts.map(p=>lonX(p[0]).toFixed(2)+' '+latY(p[1]).toFixed(2)).join('L')+'Z'}
function buildMap(){
  const svg=$('#mapSvg'),atelier=SITES.find(s=>s.type==='atelier');
  const land=LAND.map(poly).join(''),lakes=LAKES.map(poly).join('');
  const routes=SITES.filter(s=>s.type==='tannery').map(s=>{const x1=lonX(s.lon),y1=latY(s.lat),x2=lonX(atelier.lon),y2=latY(atelier.lat),mx=(x1+x2)/2,my=Math.min(y1,y2)-Math.hypot(x2-x1,y2-y1)*.28;return `<path d="M${x1} ${y1}Q${mx} ${my} ${x2} ${y2}" fill="none" stroke="#D4AF37" stroke-width="1.1" stroke-dasharray="4 3" opacity=".55" vector-effect="non-scaling-stroke"/>`}).join('');
  svg.innerHTML=`<defs><pattern id="dots" patternUnits="userSpaceOnUse" width="3" height="3"><circle cx="1.5" cy="1.5" r=".7" fill="#D4AF37" opacity=".55"/></pattern><mask id="lm" maskUnits="userSpaceOnUse" x="0" y="0" width="360" height="180"><path d="${land}" fill="#fff"/><path d="${lakes}" fill="#000"/></mask></defs><rect x="0" y="0" width="360" height="180" fill="url(#dots)" mask="url(#lm)"/><path d="${land}" fill="none" stroke="#D4AF37" stroke-opacity=".22" stroke-width=".8" vector-effect="non-scaling-stroke"/>${routes}`;
  $('#pins').innerHTML=SITES.map(s=>`<button class="pin ${s.type}" data-id="${s.id}" aria-pressed="${s.id===mp.sel}" aria-label="${esc(s.name)}, ${esc(s.place)}"><i></i><em>${esc(s.name)}</em></button>`).join('');
  $('#pins').addEventListener('click',e=>{const b=e.target.closest('.pin');if(b)selectSite(b.dataset.id,true)});
  mp.built=true;
  new ResizeObserver(()=>applyMapView(mp.view)).observe($('#map'));
}
function applyMapView(v){
  const box=$('#map'),W=box.clientWidth||800,H=box.clientHeight||400,asp=W/H,w=v.w,h=w/asp,x=v.cx-w/2,y=v.cy-h/2;
  $('#mapSvg').setAttribute('viewBox',`${x.toFixed(3)} ${y.toFixed(3)} ${w.toFixed(3)} ${h.toFixed(3)}`);
  const pt=w/120,pat=$('#dots');if(pat){pat.setAttribute('width',pt);pat.setAttribute('height',pt);const c=pat.firstChild;c.setAttribute('cx',pt/2);c.setAttribute('cy',pt/2);c.setAttribute('r',pt*.24)}
  $$('#pins .pin').forEach(b=>{const s=SITES.find(q=>q.id===b.dataset.id),px=(lonX(s.lon)-x)/w*100,py=(latY(s.lat)-y)/h*100;b.style.left=px+'%';b.style.top=py+'%';b.style.display=(px<-3||px>103||py<-3||py>103)?'none':'grid'});
}
function setMapView(t){
  const from={...mp.view};cancelAnimationFrame(mp.raf);
  $('#mapWorld').setAttribute('aria-pressed',t.w>200);$('#mapEu').setAttribute('aria-pressed',t.w<=200);
  if(RM){mp.view={...t};applyMapView(mp.view);return}
  const t0=performance.now(),dur=700;
  const step=n=>{const u=clamp((n-t0)/dur,0,1),e=u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;mp.view={cx:lerp(from.cx,t.cx,e),cy:lerp(from.cy,t.cy,e),w:lerp(from.w,t.w,e)};applyMapView(mp.view);if(u<1)mp.raf=requestAnimationFrame(step)};
  mp.raf=requestAnimationFrame(step);
}
const VIEW_EU={cx:182.7,cy:45.9,w:42},VIEW_WORLD={cx:185,cy:62,w:350};
function renderSite(s){
  const atelier=SITES.find(q=>q.type==='atelier');
  const ic='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 4.5 6v5.5c0 4.4 3 7.500 7.500 9.500 4.500-2 7.500-5.100 7.500-9.500V6L12 3Z"/><path d="m8.800 12 2.200 2.200 4.200-4.400"/></svg>';
  const M=[['Traceable to the farm',s.m.trace,'%'],['Process water recycled',s.m.water,'%'],['Chromium in tanning',s.m.chrome,'%'],['Renewable energy',s.m.energy,'%']];
  $('#siteCard').innerHTML=`<div><span class="eyebrow">${s.type==='atelier'?'Atelier':'Tannery'}</span><h3 style="margin:.4rem 0 .2rem">${esc(s.name)}</h3><span class="muted" style="font-size:.84rem">${esc(s.place)}</span></div>
  <p class="muted">${esc(s.role)}</p>
  <div class="cert-row">${s.badges.map(b=>`<span class="cert" title="${esc(b[1])}">${ic}${esc(b[0])}</span>`).join('')}</div>
  <div class="film"><canvas id="filmCv" aria-label="Short film: ${esc(s.scene.t)}" role="img"></canvas><div class="film-ui"><button type="button" id="filmBtn" aria-label="Pause film"><svg width="14" height="14" viewBox="0 0 14 14" fill="#F5F5DC" aria-hidden="true"><rect x="2" y="1" width="3.5" height="12"/><rect x="8.5" y="1" width="3.5" height="12"/></svg></button><span>${esc(s.scene.t)}</span><div class="bar"><i id="filmBar" style="width:0"></i></div><span class="num">${s.scene.len}</span></div></div>
  <div class="metrics">${M.map(m=>`<div class="metric"><div><span>${m[0]}</span><b class="num">${m[1]}${m[2]}</b></div><div class="bar"><i style="width:${m[1]}%;display:block;height:100%;background:var(--brass)"></i></div></div>`).join('')}</div>
  <div class="fine num">${s.type==='tannery'?`${km(s,atelier).toLocaleString('en-US')} km to the atelier · ${s.co2} kg CO₂e per m²`:'Every route on the map ends here.'}</div>`;
  startFilm(s);
  $('#filmBtn').onclick=()=>{mp.film.playing=!mp.film.playing;const b=$('#filmBtn');b.setAttribute('aria-label',mp.film.playing?'Pause film':'Play film');b.innerHTML=mp.film.playing?'<svg width="14" height="14" viewBox="0 0 14 14" fill="#F5F5DC" aria-hidden="true"><rect x="2" y="1" width="3.5" height="12"/><rect x="8.5" y="1" width="3.5" height="12"/></svg>':'<svg width="14" height="14" viewBox="0 0 14 14" fill="#F5F5DC" aria-hidden="true"><path d="M3 1l9 6-9 6z"/></svg>';if(mp.film.playing)runFilm()};
}
function selectSite(id,move){
  mp.sel=id;const s=SITES.find(q=>q.id===id);
  $$('#pins .pin').forEach(b=>b.setAttribute('aria-pressed',b.dataset.id===id));
  renderSite(s);
  if(move&&mp.view.w>200)setMapView(VIEW_EU);
}
function startFilm(s){mp.film.scene=s.scene;mp.film.t=0;runFilm()}
function runFilm(){
  const cv=$('#filmCv'),F=mp.film;if(!cv)return;cancelAnimationFrame(F.raf);
  const c=cv.getContext('2d'),dur=+F.scene.len.split(':')[1]+0;let last=performance.now();
  const seeds=Array.from({length:34},(_,i)=>[(Math.sin(i*12.9898)*43758.5453)%1,(Math.sin(i*78.233)*12345.6789)%1,.6+((Math.sin(i*3.1)*9999)%1+1)%1*2.2]);
  const frame=n=>{
    if(state.view!=='craft'||!$('#filmCv')){F.raf=0;return}
    sizeCanvas(cv,1);const W=cv.width,H=cv.height,dt=Math.min(.05,(n-last)/1000);last=n;
    if(F.playing&&!RM)F.t+=dt;const t=F.t,sc=F.scene;
    let g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,shade(sc.bg,.12));g.addColorStop(1,sc.bg);c.fillStyle=g;c.fillRect(0,0,W,H);
    c.lineCap='round';
    for(let i=0;i<5;i++){const x0=W*(.12+.19*i);c.beginPath();for(let y=-10;y<=H+10;y+=10){const x=x0+Math.sin(y*.011+t*sc.sp*1.6+i*1.7)*W*.035;y<0?c.moveTo(x,y):c.lineTo(x,y)}c.strokeStyle=mixHex(sc.tint,sc.bg,.28+.1*i);c.globalAlpha=.85;c.lineWidth=W*.12;c.stroke();c.globalAlpha=1;c.strokeStyle='rgba(255,235,200,.07)';c.lineWidth=W*.012;c.stroke()}
    c.fillStyle='rgba(255,235,200,.28)';for(const s of seeds){const x=Math.abs(s[0])*W,y=H-((t*26*sc.sp*s[2]+Math.abs(s[1])*H)%H);c.beginPath();c.arc(x+Math.sin(t+s[2])*6,y,s[2]*1.6,0,6.3);c.fill()}
    const bar=$('#filmBar');if(bar)bar.style.width=((t%dur)/dur*100).toFixed(1)+'%';
    F.raf=F.playing?requestAnimationFrame(frame):0;
  };
  F.raf=requestAnimationFrame(frame);
}
viewHooks.craft=()=>{
  if(!mp.built)buildMap();
  applyMapView(mp.view);selectSite(mp.sel,false);
  $('#mapWorld').onclick=()=>setMapView(VIEW_WORLD);$('#mapEu').onclick=()=>setMapView(VIEW_EU);
};

/* ===== Checkout and concierge ===== */
const RIBS={chestnut:{n:'Chestnut',c:'#8B5A2B'},ivory:{n:'Ivory',c:'#F5F5DC'},noir:{n:'Noir',c:'#1C1A19'},brass:{n:'Brass',c:'#D4AF37'}};
function giftSVG(on,rc){
  if(!on)return `<svg viewBox="0 0 220 180" role="img" aria-label="Standard packaging: cotton dust bag"><path d="M50 60h120l10 100H40Z" fill="#cfc7ae"/><path d="M50 60c20 14 100 14 120 0l-6-14c-20 10-88 10-108 0Z" fill="#e4dcc3"/><path d="M60 62c28 10 72 10 100 0" stroke="#8B5A2B" stroke-width="3" fill="none"/><text x="110" y="122" text-anchor="middle" font-family="Cormorant Garamond,serif" font-size="20" font-weight="600" letter-spacing="4" fill="#5b4a2e">ORVANE</text><text x="110" y="172" text-anchor="middle" font-family="Montserrat,sans-serif" font-size="8" letter-spacing="2" fill="#938E7B">STANDARD · COTTON DUST BAG</text></svg>`;
  const b=RIBS[rc].c,dk=shade('#2a1d12',.0);
  return `<svg viewBox="0 0 220 180" role="img" aria-label="Gift box with ${RIBS[rc].n.toLowerCase()} ribbon"><path d="M62 52l30-24 36 6-28 28Z" fill="#f2ead2" opacity=".9"/><path d="M96 56l44-26 34 10-48 26Z" fill="#e9dfc2" opacity=".9"/><rect x="40" y="68" width="140" height="82" fill="#2d2119" stroke="#D4AF37" stroke-opacity=".5"/><rect x="34" y="52" width="152" height="28" fill="#3a2a1f" stroke="#D4AF37" stroke-opacity=".5"/><rect x="100" y="52" width="20" height="98" fill="${b}"/><rect x="34" y="60" width="152" height="12" fill="${b}"/><path d="M110 52c-30-26-44-4-26 4 10 4 22 0 26-4Zm0 0c30-26 44-4 26 4-10 4-22 0-26-4Z" fill="${b}" stroke="rgba(0,0,0,.35)" stroke-width="1"/><circle cx="110" cy="52" r="5" fill="${shade(b,-.2)}"/><text x="110" y="136" text-anchor="middle" font-family="Cormorant Garamond,serif" font-size="14" font-weight="600" letter-spacing="3" fill="#D4AF37" opacity=".9">ORVANE</text><text x="110" y="172" text-anchor="middle" font-family="Montserrat,sans-serif" font-size="8" letter-spacing="2" fill="#938E7B">KEEPSAKE BOX · TISSUE · DUST BAG</text></svg>`;
}
function hashStr(s){let h=2166136261;for(const ch of s){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function certSerial(){
  const first=state.cart.find(i=>i.kind==='product'),code=first?first.pid.slice(0,3).toUpperCase():'XXX',h=hashStr(state.cart.map(i=>i.key).join('~')||'empty');
  return 'ORV-'+new Date().getFullYear()+'-'+code+'-'+String(h%100000).padStart(5,'0');
}
function renderGift(){
  $('#giftArt').innerHTML=giftSVG(state.gift,state.rib);
  $('#giftOpts').hidden=!state.gift;
}
function renderCert(){
  const on=$('#certOn').checked;$('#certFields').hidden=!on;
  const sn=certSerial(),h=hashStr(sn);let q='';
  for(let i=0;i<49;i++){const x=i%7,y=(i/7)|0,corner=(x<2&&y<2)||(x>4&&y<2)||(x<2&&y>4);if(corner||((h>>>(i%31))&1))q+=`<rect x="${x*8}" y="${y*8}" width="7" height="7" fill="#D4AF37"/>`}
  const d=new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}),name=$('#certName').value.trim()||'Owner name';
  $('#certPrev').innerHTML=on?`<div class="cert-card"><svg viewBox="0 0 56 56" aria-hidden="true">${q}</svg><h4>Certificate of authenticity</h4><span class="sn">${sn}</span><small>Registered to ${esc(name)} on ${d}.<br>Made by hand at the Orvane Atelier, London. Hide from Conceria del Valdarno, Tuscany.</small></div>`:'<p class="muted" style="padding:.6rem 0">No certificate will be registered. You can add one later from your account.</p>';
}
function renderSummary(){
  const sub=cartSub(),gift=state.gift&&state.cart.length?GIFT_PRICE:0,ship=shipCost(sub),tot=sub+gift+ship;
  $('#sumBody').innerHTML=(state.cart.length?state.cart.map(i=>`<div class="dr-row" style="grid-template-columns:52px 1fr auto"><div class="thumb" style="width:52px;height:52px;background:#1b1714">${i.pid?artFor(byId(i.pid),i.tint):BOTTLE}</div><div><h4 style="font-size:1.05rem">${esc(i.name)}</h4><small>${esc(i.sub||'')} · Qty ${i.qty}</small></div><div class="num">${money(i.unit*i.qty)}</div></div>`).join(''):'<p class="muted">Your bag is empty. <button type="button" class="link-btn" data-go="home:collection">Browse the collection</button></p>')+
  `<div style="display:grid;gap:.5rem;margin-top:1rem"><div class="sum-line"><span>Subtotal</span><span class="num">${money(sub)}</span></div>${gift?`<div class="sum-line"><span>Gift wrapping</span><span class="num">${money(gift)}</span></div>`:''}<div class="sum-line"><span>Delivery</span><span class="num">${ship?money(ship):'Complimentary'}</span></div><div class="sum-line total"><span>Total</span><span class="num">${money(tot)}</span></div></div>`;
  $('#placeOrder').disabled=!state.cart.length;
}
function initCheckout(){
  $('#grpRib').innerHTML=Object.keys(RIBS).map(k=>`<label class="chip"><input type="radio" name="rib" value="${k}" ${k===state.rib?'checked':''}><span>${RIBS[k].n}</span></label>`).join('');
  $('#grpRib').addEventListener('change',e=>{state.rib=e.target.value;renderGift()});
  $('#giftOn').addEventListener('change',e=>{state.gift=e.target.checked;renderGift();renderSummary()});
  $('#certOn').addEventListener('change',renderCert);$('#certName').addEventListener('input',renderCert);
  const upd=()=>{const v=$('#noteIn').value;$('#noteLeft').textContent=240-v.length;$('#noteText').textContent=v||'Your handwritten note will appear here.';$('#noteFrom').textContent=$('#noteSign').value};
  $('#noteIn').addEventListener('input',upd);$('#noteSign').addEventListener('input',upd);upd();
  $('#coForm').addEventListener('submit',e=>{
    e.preventDefault();const err=$('#coErr');err.textContent='';
    if(!state.cart.length){err.textContent='Your bag is empty. Add a piece before placing the order.';return}
    const need=['coFirst','coLast','coEmail','coAddr','coCity'],bad=need.find(id=>!$('#'+id).value.trim());
    if(bad){err.textContent='Please complete the delivery details.';$('#'+bad).focus();return}
    if(!/^\S+@\S+\.\S+$/.test($('#coEmail').value.trim())){err.textContent='Enter a valid email address so we can send your confirmation.';$('#coEmail').focus();return}
    const ref='OR-'+String(hashStr(Date.now()+'')%1000000).padStart(6,'0'),sub=cartSub(),tot=sub+(state.gift?GIFT_PRICE:0)+shipCost(sub),cert=$('#certOn').checked?certSerial():null,name=$('#coFirst').value.trim();
    $('#coForm').hidden=true;
    $('#coDone').hidden=false;
    $('#coDone').innerHTML=`<div class="done"><svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="28"/><path d="m20 33 8 8 16-17"/></svg><h1 style="font-size:clamp(2.2rem,4vw,3.4rem)">Thank you, ${esc(name)}.</h1><p class="lede">Order <b class="num">${ref}</b> for ${money(tot)} is confirmed. A maker will be assigned within two working days and you will receive progress photographs from the bench.</p>${cert?`<p class="muted">Certificate <span class="num">${cert}</span> will be registered to ${esc($('#certMail').value.trim()||$('#coEmail').value.trim())}.</p>`:''}<p class="fine">No payment was taken. This is a demonstration checkout.</p><button class="btn primary" data-go="home">Continue exploring</button></div>`;
    state.cart=[];persist();setBadges();window.scrollTo(0,0);
  });
}
viewHooks.checkout=()=>{
  $('#coForm').hidden=false;$('#coDone').hidden=true;$('#coDone').innerHTML='';
  $('#giftPrice').textContent=money(GIFT_PRICE)+' added.';
  renderGift();renderCert();renderSummary();
};

/* ===== Hero film: hand stitching on canvas ===== */
function initHero(){
  const cv=$('#heroCanvas'),ctx=cv.getContext('2d'),cnt=$('#heroCount'),btn=$('#heroPause'),bg=document.createElement('canvas');
  let running=!RM,vis=true,raf=0,t0=performance.now(),paused=0,geo=null,lastN=-1;
  const TOTAL=412;
  function layout(){
    const w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return false;
    const nw=Math.round(w*DPR),nh=Math.round(h*DPR);
    if(cv.width!==nw||cv.height!==nh||!geo){
      cv.width=bg.width=nw;cv.height=bg.height=nh;
      drawLeather(bg,{cx:700,cy:640,scale:nw/1500},{hex:'#33200f',kind:'grain'});
      const p=24*DPR,xs=nw*.07,xe=nw*.93,n=Math.floor((xe-xs)/p);
      geo={w:nw,h:nh,p,xs,n,y:nh*.6};
    }
    return true;
  }
  function draw(prog,fade){
    if(!layout())return;const{w,h,p,xs,n,y}=geo;
    ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(bg,0,0);
    ctx.fillStyle='rgba(0,0,0,.28)';ctx.fillRect(xs-p,y-1.5*DPR,w-xs*2+p*2,3*DPR);ctx.fillStyle='rgba(255,230,190,.12)';ctx.fillRect(xs-p,y+1.5*DPR,w-xs*2+p*2,1.5*DPR);
    const f=prog*(n-1),done=Math.floor(f),A=fade;
    for(let i=0;i<n;i++){const x=xs+i*p;ctx.fillStyle=`rgba(0,0,0,${.55*A})`;ctx.beginPath();ctx.ellipse(x,y,4*DPR,3*DPR,0,0,6.3);ctx.fill()}
    ctx.lineCap='round';
    for(let i=0;i<done;i++){
      const xa=xs+i*p,xb=xs+(i+1)*p;
      ctx.strokeStyle=`rgba(0,0,0,${.4*A})`;ctx.lineWidth=7*DPR;ctx.beginPath();ctx.moveTo(xa+1*DPR,y+3*DPR);ctx.lineTo(xb-1*DPR,y+1*DPR);ctx.stroke();
      ctx.strokeStyle=`rgba(230,220,192,${A})`;ctx.lineWidth=5.4*DPR;ctx.beginPath();ctx.moveTo(xa+1*DPR,y+1*DPR);ctx.lineTo(xb-1*DPR,y-1*DPR);ctx.stroke();
      ctx.strokeStyle=`rgba(70,48,22,${.5*A})`;ctx.lineWidth=1.1*DPR;for(let t=2;t<p-2;t+=3.4*DPR){ctx.beginPath();ctx.moveTo(xa+t,y+3*DPR);ctx.lineTo(xa+t+2.4*DPR,y-3*DPR);ctx.stroke()}
    }
    if(done<n-1&&A>.9){
      const nx=xs+f*p,dip=Math.sin((f%1)*Math.PI),ny=y-26*DPR+dip*32*DPR,ang=-.62;
      /* thread from last stitch to needle eye */
      const ex=nx+Math.cos(ang)*6*DPR,ey=ny+Math.sin(ang)*6*DPR,sx=xs+Math.max(0,done)*p;
      ctx.strokeStyle='rgba(230,220,192,.9)';ctx.lineWidth=2.2*DPR;ctx.beginPath();ctx.moveTo(sx,y-DPR);ctx.quadraticCurveTo((sx+ex)/2,Math.min(y,ey)-48*DPR,ex,ey);ctx.stroke();
      /* needle */
      ctx.save();ctx.translate(nx,ny);ctx.rotate(ang+Math.PI);ctx.fillStyle='#d8dadd';ctx.shadowColor='rgba(0,0,0,.5)';ctx.shadowBlur=6*DPR;
      ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-70*DPR,-1.6*DPR);ctx.lineTo(-70*DPR,1.6*DPR);ctx.closePath();ctx.fill();
      ctx.fillStyle='#121212';ctx.beginPath();ctx.ellipse(-62*DPR,0,1.6*DPR,.7*DPR,0,0,6.3);ctx.fill();ctx.restore();
    }
    const cur=Math.round(prog*TOTAL);if(cur!==lastN){lastN=cur;cnt.textContent='Stitch '+cur+' / '+TOTAL}
  }
  const SPS=6.5;
  function frame(now){
    raf=0;if(!running||!vis||document.hidden||state.view!=='home')return;
    raf=requestAnimationFrame(frame);
    if(!layout())return;
    const dur=(geo.n-1)/SPS,t=((now-t0)/1000)%(dur+3.4);
    if(t<dur)draw(t/dur,1);else if(t<dur+2.2)draw(1,1);else draw(1,Math.max(0,1-(t-dur-2.2)/1.1));
  }
  function start(){if(!raf&&running&&vis)raf=requestAnimationFrame(frame)}
  viewHooks.home=()=>{lastN=-1;if(RM||!running){requestAnimationFrame(()=>draw(1,1))}start();drawStory()};
  onVisible($('.hero'),v=>{vis=v;if(v)start()},{threshold:0});
  document.addEventListener('visibilitychange',start);
  new ResizeObserver(()=>{if(!running)draw(1,1);else if(!raf)start()}).observe(cv);
  btn.addEventListener('click',()=>{running=!running;btn.setAttribute('aria-pressed',!running);btn.textContent=running?'Pause film':'Play film';if(running){t0=performance.now();start()}else draw(1,1)});
  if(RM){btn.setAttribute('aria-pressed','true');btn.textContent='Play film';requestAnimationFrame(()=>draw(1,1))}
}

/* ===== Parallax story ===== */
let storyDone=false;
function drawStory(){
  const a=$('#storyA'),b=$('#storyB');if(!a)return;
  if(!storyDone){
    onVisible($('#story'),v=>{
      if(!v||storyDone)return;storyDone=true;
      sizeCanvas(a,1);sizeCanvas(b,1);
      drawLeather(a,{cx:1180,cy:650,scale:Math.max(a.width/900,a.height/1300)*1.0},{hex:'#7a4a22',kind:'grain'});
      drawLeather(b,{cx:1690,cy:520,scale:Math.max(b.width/520,b.height/700)},{hex:'#4a2c14',kind:'grain'});
    });
  }
  parallax();
}
function parallax(){
  if(state.view!=='home'||RM)return;
  for(const cv of $$('.px-frame canvas')){
    const fr=cv.parentElement,r=fr.getBoundingClientRect();if(r.bottom<-100||r.top>innerHeight+100)continue;
    const off=(r.top+r.height/2)-innerHeight/2,lim=r.height*.11;
    cv.style.transform='translateY('+clamp(-off*(+cv.dataset.speed),-lim,lim).toFixed(1)+'px)';
  }
}
let pTick=false;
window.addEventListener('scroll',()=>{if(!pTick){pTick=true;requestAnimationFrame(()=>{pTick=false;parallax()})}},{passive:true});

/* ===== Boot ===== */
function boot(){
  $('#currency').value=state.cur;
  renderGrid();renderTeaser();initPDPEvents();initGallery();initPatina();initCheckout();initHero();setBadges();
  $('#newsForm').addEventListener('submit',e=>{e.preventDefault();$('#newsMail').value='';toast('Thank you. You are on the list.')});
  window.addEventListener('hashchange',()=>{const h=location.hash.slice(1);if(VIEWS.includes(h)&&h!==state.view)go(h)});
  const h=location.hash.slice(1);go(VIEWS.includes(h)?h:'home');
  refreshMoney();
}
boot();
})();
