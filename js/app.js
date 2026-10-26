import {templates} from './templates.js';
import {correctedView} from './corrections.js';
const data=await fetch('./data/wiring.json').then(r=>r.json());
const assetGeometry=await fetch('./data/asset-geometry.json').then(r=>r.json());
const stage=document.getElementById('stage');
const SCREEN_IDS=new Set([...data.screens.map(s=>s.id),'bibliografia']);
const HOME='1239:7025',TIMELINE='1725:1287',MENU='1743:189',STUDY='1083:2092',TURNS='1875:4453',REVEALED='1875:4273',PARADOX='1853:3248',COMPETITORS='1770:3285';
const timelineIds=['1867:1352','1867:1586','1867:1464','1867:1648','1867:1526'];
const usageIds=['1239:9172','1239:9305','1239:9433','1239:9556','1239:9679','1239:9802','1239:9920'];
const compareIds=['1093:2247','1093:2185','1093:2321'];
const paradoxIds=['1853:3248','1853:3342','1853:3389'];
let current=HOME,scale=1,tooltip=null,dialog=null,returnFocus=null;
const revealed=new Set(),activeSeries=new Set(['ChatGPT','Gemini','Perplexity','Claude','DeepSeek','Grok','Copilot']);
const byId=(id,scope=stage)=>scope.querySelector(`[data-node-id="${id}"]`);
const valid=(r)=>r[1].some(a=>a.destinationId||a.type==='CLOSE');
const routes=new Map(data.links.map(l=>[l[0],l[3].filter(valid)]));
const special=new Map();
const titleOf=id=>id==='bibliografia'?'Referencias bibliográficas':id===HOME?'De herramienta a compañía':data.screens.find(s=>s.id===id)?.texts.find(t=>t.length>25)||'De herramienta a compañía';
function fit(){scale=Math.min(innerWidth/1440,innerHeight/1024);stage.style.transform=`translate(${(innerWidth-1440*scale)/2}px,${(innerHeight-1024*scale)/2}px) scale(${scale})`;}
addEventListener('resize',fit);fit();
function focusable(el,label,fn){
 if(!el)return;
 el.classList.add('interactive');el.tabIndex=0;el.setAttribute('role','button');el.setAttribute('aria-label',label);
 special.set(el,fn);
}
function navigate(id,{push=true}={}){
 if(!SCREEN_IDS.has(id)||(!templates[id]&&id!=='bibliografia'))return;
 const prev=current;closeDialog();hideTooltip();special.clear();current=id;
 const corrected=correctedView(id,data,navigate,prev);
 stage.replaceChildren(corrected||templates[id]());const root=stage.firstElementChild;root.classList.add('screen','screen-arrive');
 if(!corrected)repairExportGeometry(root);
 if(push)history.pushState({screen:id},'',`#${id.replace(':','-')}`);
 document.title='Taller 2 · '+titleOf(id).slice(0,70);
 document.getElementById('announcement').textContent=titleOf(id);
 if(corrected)return;
 tidySectionHints(root);
 bindOriginal(root);completeControls(root);
 for(const el of root.querySelectorAll('[role="button"]')){
  if(getComputedStyle(el).display==='contents'){
   const label=el.getAttribute('aria-label');const fn=special.get(el);const action=routes.get(el.dataset.nodeId)?.find(r=>r[0]?.type==='ON_CLICK')?.[1]?.find(a=>a.destinationId);
   el.removeAttribute('role');el.removeAttribute('tabindex');
   const visible=[...el.querySelectorAll('[data-node-id]')].find(n=>n.getBoundingClientRect().width>5&&n.getBoundingClientRect().height>5);
   if(visible&&(fn||action)){
    for(const child of el.querySelectorAll('[role="button"]')){child.removeAttribute('role');child.removeAttribute('tabindex');}
    focusable(visible,label||'Continuar',fn||(()=>perform(action,visible)));
   }
  }
 }
 for(const el of root.querySelectorAll('[role="button"]')){
  if(el.parentElement.closest('[role="button"],button')){el.removeAttribute('role');el.removeAttribute('tabindex');}
 }
 animate(root);
}
// Unifica el aviso de las secciones con la cápsula de una sola línea de la referencia.
function tidySectionHints(root){
 for(const card of root.querySelectorAll('[data-name="Interaction hint card (Bottom-Left)"]')){
  if(!card.textContent.includes('Haz click en cada sección'))continue;
  const labels=card.querySelector('[data-name="Instruction labels:margin"]');if(!labels)continue;
  const text=document.createElement('span');text.className='section-hint-text';text.textContent='Hacé clic en cada sección para leer más información.';
  labels.replaceChildren(text);labels.className='section-hint-label';labels.removeAttribute('style');card.classList.add('section-hint');
  const icon=card.querySelector('[data-name="Mouse gesture icon"]');if(icon)icon.setAttribute('aria-hidden','true');
 }
}
function repairExportGeometry(root){
 // Native SVG exports already contain rotation and trim transparent bounds.
 // Keep each design slot and align its unmodified exported visual once.
 for(const img of [...root.querySelectorAll('img')]){
  const name=img.getAttribute('src')?.split('/').pop(),g=assetGeometry[name];if(!g)continue;
  const slot=img.closest('[data-node-id]');img.className='';img.style.cssText=`position:absolute;left:${g.x}px;top:${g.y}px;width:${g.w}px;height:${g.h}px;max-width:none;pointer-events:none`;slot.replaceChildren(img);
 }
}
function bindOriginal(root){
 for(const el of root.querySelectorAll('[data-node-id]')){
  const rr=routes.get(el.dataset.nodeId)||[];
  if(rr.some(r=>r[0]?.type==='ON_CLICK'||r[0]?.type==='ON_DRAG')){
   el.classList.add('interactive');
   if(!['BUTTON','A'].includes(el.tagName)){el.tabIndex=0;el.setAttribute('role','button');}
   if(el.tagName==='A'){el.setAttribute('role','button');el.tabIndex=0;}
   el.setAttribute('aria-label',el.textContent.trim()||el.dataset.name||'Ver detalle');
  }
  const hover=rr.find(r=>r[0]?.type==='ON_HOVER');
  if(hover&&(['1239:9072',...usageIds].includes(current)))continue;
  if(hover){
   el.classList.add('interactive');el.tabIndex=0;el.setAttribute('role','button');el.setAttribute('aria-label',el.textContent.trim()||'Ver datos');
   el.addEventListener('pointerenter',()=>{const a=hover[1][0];if(a?.destinationId)showTooltip(a.destinationId,el)});
   el.addEventListener('pointerleave',hideTooltip);
   el.addEventListener('focus',()=>{const a=hover[1][0];if(a?.destinationId)showTooltip(a.destinationId,el)});
   el.addEventListener('blur',hideTooltip);
  }
  if(el.dataset.name?.endsWith(':shadow')){
   const action=rr.find(r=>r[0]?.type==='ON_CLICK')?.[1]?.find(a=>a.destinationId);
   if(action)focusable(el.parentElement,el.parentElement.textContent.trim()||'Continuar',()=>perform(action,el.parentElement));
  }
 }
}
stage.addEventListener('click',e=>{
 if(e.target.closest('.overlay-dialog-shade'))return;
 for(let el=e.target;el&&el!==stage;el=el.parentElement){
  if(special.has(el)){e.preventDefault();special.get(el)(e);return;}
  const rr=routes.get(el.dataset?.nodeId);if(!rr)continue;
  const r=rr.find(r=>r[0]?.type==='ON_CLICK')||rr.find(r=>r[0]?.type==='ON_DRAG');if(!r)continue;
  for(const a of r[1])if(a.destinationId){e.preventDefault();perform(a,el);return;}
 }
});
stage.addEventListener('keydown',e=>{if(e.target.tagName==='BUTTON')return;if((e.key==='Enter'||e.key===' ')&&e.target.matches('.interactive,[role=button],button,a')){e.preventDefault();e.target.click();}});
function perform(a,el){
 if(a.navigation==='NAVIGATE')navigate(a.destinationId);
 else if(a.navigation==='OVERLAY')a.destinationId.startsWith('1957:')?openDialog(a.destinationId):showTooltip(a.destinationId,el);
 else if(a.navigation==='CHANGE_TO'){
  const map={'1686:2823':timelineIds[0],'1686:2875':timelineIds[1],'1686:2925':timelineIds[2],'1686:2975':timelineIds[3],'1686:3133':timelineIds[4],'1686:2821':TIMELINE};
  if(map[a.destinationId])navigate(map[a.destinationId]);
 }
}
function hideTooltip(){tooltip?.remove();tooltip=null;}
function showTooltip(id,anchor){
 const monthIds=['1239:9040','1239:9043','1239:9058','1239:9046','1239:9049','1239:9052','1239:9055','1239:9061'];
 const monthIndex=monthIds.indexOf(id);
 if(current==='1239:8892'&&monthIndex>=0){
  hideTooltip();const months=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto'],values=[883,888,891,894,899,901,901,1000];
  const box=document.createElement('div');box.className='overlay-tooltip month-tooltip';box.setAttribute('role','tooltip');box.id='month-detail';
  const heading=document.createElement('strong'),description=document.createElement('span');heading.textContent=months[monthIndex];description.textContent=values[monthIndex]+'M de usuarios semanales.';box.append(heading,description);
  const a=anchor.getBoundingClientRect(),st=stage.getBoundingClientRect(),width=250,height=107;
  box.style.left=Math.max(20,Math.min(1420-width,(a.left-st.left+a.width/2)/scale-width/2))+'px';box.style.top=Math.max(80,(a.top-st.top)/scale-height-15)+'px';stage.append(box);tooltip=box;return;
 }
 if(!templates[id])return;
 hideTooltip();const dims=id.startsWith('1957:')?[671,200]:id.startsWith('1239:90')?[405,160]:[355,120];
 if(['1239:9040','1239:9043','1239:9046','1239:9049','1239:9052','1239:9055','1239:9058','1239:9061'].includes(id)){dims[0]=250;dims[1]=107;}
 const box=document.createElement('div');box.className='overlay-tooltip';box.setAttribute('role','tooltip');box.style.width=dims[0]+'px';box.style.height=dims[1]+'px';box.append(templates[id]());
 const a=anchor.getBoundingClientRect(),st=stage.getBoundingClientRect();let x=(a.left-st.left+a.width/2)/scale-dims[0]/2,y=(a.top-st.top)/scale-dims[1]-15;
 if(y<80)y=(a.bottom-st.top)/scale+16;
 box.style.left=Math.max(20,Math.min(1420-dims[0],x))+'px';box.style.top=Math.min(1000-dims[1],y)+'px';stage.append(box);tooltip=box;
}
function closeDialog(){if(!dialog)return;dialog.remove();dialog=null;returnFocus?.focus();returnFocus=null;}
function openDialog(id){
 if(!templates[id])return;closeDialog();hideTooltip();returnFocus=document.activeElement;
 const shade=document.createElement('div');shade.className='overlay-dialog-shade';const box=document.createElement('div');box.className='overlay-dialog';box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-label',data.aux.find(x=>x.id===id)?.texts[0]||'Información');box.tabIndex=-1;
 box.append(templates[id]());const close=document.createElement('button');close.className='dialog-close';close.textContent='×';close.setAttribute('aria-label','Cerrar información');close.onclick=closeDialog;box.append(close);shade.append(box);shade.addEventListener('click',e=>{if(e.target===shade)closeDialog()});stage.append(shade);dialog=shade;close.focus();
 box.addEventListener('keydown',e=>{if(e.key==='Tab'){e.preventDefault();close.focus();}});
}
addEventListener('keydown',e=>{if(e.key==='Escape'){if(dialog)closeDialog();else hideTooltip();}});
addEventListener('popstate',()=>navigate(history.state?.screen||decodeHash(),{push:false}));
function navHotspot(x,y,label,fn){const b=document.createElement('button');b.className='hotspot';b.style.cssText=`left:${x}px;top:${y}px;width:48px;height:48px`;b.setAttribute('aria-label',label);stage.firstElementChild.append(b);focusable(b,label,fn);return b;}
function nextArrow(label,fn){
 const b=navHotspot(1377,89,label,fn);b.classList.add('hotspot-next');
 b.innerHTML='<svg viewBox="0 0 24 48" width="24" height="48" aria-hidden="true"><path d="M7 14 L17 24 L7 34" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';return b;
}
function completeControls(root){
 // Brand is an existing return control in the Figma design.
 for(const el of root.querySelectorAll('[data-name="MainHeader"],[data-name="Barra"]'))focusable(el,'Volver al inicio',()=>navigate(HOME));
 if(timelineIds.includes(current)||current===TIMELINE){
  const i=timelineIds.indexOf(current);
  const points=root.querySelectorAll('[data-name="Puntos"] > [data-node-id]');
  if(current!==TIMELINE)[...points].forEach((el,j)=>focusable(el,'Ver etapa '+(2022+j),()=>navigate(timelineIds[j])));
  if(current===TIMELINE){const pointIds=['I1725:1388;1686:2681','I1725:1388;1686:2672','I1725:1388;1686:2675','I1725:1388;1686:2678','I1725:1388;1686:2684'];pointIds.forEach((id,j)=>focusable(byId(id),'Ver etapa '+(2022+j),()=>navigate(timelineIds[j])));}
  for(const el of root.querySelectorAll('[data-node-id]')){
   const t=el.querySelector('[data-node-id]')?null:el.textContent.trim();
   if(t==='Año anterior')focusable(el,'Año anterior',()=>navigate(i>0?timelineIds[i-1]:TIMELINE));
   if(t==='Siguiente año')focusable(el,'Siguiente año',()=>navigate(i<4?timelineIds[i+1]:MENU));
  }
  navHotspot(16,88,'Volver al inicio',()=>navigate(HOME));navHotspot(1360,78,'Explorar la expansión de ChatGPT',()=>navigate(MENU));
  if(i>=0){const x=i%2===0?1340:580;navHotspot(x,427,'Cerrar etapa',()=>navigate(TIMELINE));}
 }
 if(current===STUDY){focusable(root,'Empezar el estudio',()=>navigate('1092:3752'));navHotspot(15,89,'Volver al inicio',()=>navigate(HOME));}
 if(['1092:3752',...compareIds].includes(current)){
  const buttons=['Consejos personales','“¿Soy yo el forr*?”','Acciones riesgosas.'];
  for(const el of root.querySelectorAll('[data-node-id]'))if(!el.querySelector('[data-node-id]')){const j=buttons.indexOf(el.textContent.trim());if(j>=0)focusable(el,buttons[j],()=>navigate(compareIds[j]));}
  navHotspot(15,89,'Volver a la presentación del estudio',()=>navigate(STUDY));
 }
 if(paradoxIds.includes(current)){
  ['Calidad de la respuesta.','Confianza en el asistente.','Ganas de volver a usar la IA:'].forEach((t,i)=>{for(const el of root.querySelectorAll('[data-node-id]'))if(!el.querySelector('[data-node-id]')&&el.textContent.trim()===t)focusable(el,t,()=>navigate(paradoxIds[i]));});
  navHotspot(15,89,'Volver a los seis turnos',()=>navigate(REVEALED));
  nextArrow('Ir a las referencias bibliográficas',()=>navigate('bibliografia'));
 }
 if(current===TURNS||current===REVEALED){
  navHotspot(15,89,current===TURNS?'Volver a las comparaciones':'Volver a las tarjetas',()=>navigate(current===TURNS?'1093:2321':TURNS));
  navHotspot(1360,78,'Continuar a la valoración de las respuestas',()=>navigate(PARADOX));
  if(current===TURNS)installTurns(root);
 }
 if(current==='1239:8754'||current==='1239:8892')installGrowth(root);
 if(['1239:9072',...usageIds].includes(current))installUsage(root);
 if(current===COMPETITORS)installCompetitors(root);
}
function installTurns(root){
 // Each face reuses the original Figma card and graph layers.
 const open=templates[REVEALED]();open.classList.add('screen');
 const rects=['1875:4477','1875:4480','1875:4483','1875:4486','1875:4489','1875:4492'];
 rects.forEach((id,i)=>{
  const card=byId(id,root);if(!card)return;card.style.visibility='hidden';
  const following=card.nextElementSibling;if(following?.textContent.includes('Click para'))following.style.visibility='hidden';
  const x=118+i*205.6,y=629;const button=document.createElement('button');button.className='turn-flip'+(revealed.has(i)?' revealed':'');button.style.cssText=`left:${x}px;top:${y}px;width:175px;height:298.375px`;button.setAttribute('aria-pressed',revealed.has(i));
  const inner=document.createElement('div');inner.className='flip-inner';const front=document.createElement('div');front.className='turn-face turn-front';front.innerHTML='Click para voltear<br>la tarjeta y comparar';
  const back=document.createElement('div');back.className='turn-face turn-back';back.setAttribute('aria-hidden','true');const original=document.createElement('div');original.className='turn-original';original.style.left=-x+'px';original.style.top=-y+'px';original.append(open.cloneNode(true));back.append(original);inner.append(front,back);button.append(inner);root.append(button);
  focusable(button,'Voltear tarjeta del turno '+(i+1),()=>{if(revealed.has(i))revealed.delete(i);else revealed.add(i);button.classList.toggle('revealed',revealed.has(i));button.setAttribute('aria-pressed',revealed.has(i));});
 });
}
function installUsage(root){
 root.classList.add('usage-screen');
 const labels=['Escritura','Guía práctica','Búsqueda de información','Ayuda técnica','Multimedia','Otro/desconocido','Autoexpresión'];
 const overlayIds=['1239:10052','1239:10068','1239:10060','1239:10076','1239:10084','1239:10092','1239:10044'];
 const sectors=[],sourceByCategory=new Map();
 for(const el of root.querySelectorAll('[data-node-id]')){
  const hover=routes.get(el.dataset.nodeId)?.find(r=>r[0]?.type==='ON_HOVER');
  const i=overlayIds.indexOf(hover?.[1]?.[0]?.destinationId);
  if(i>=0){sourceByCategory.set(i,el);sectors.push(el);el.style.pointerEvents='none';el.removeAttribute('role');el.removeAttribute('tabindex');}
 }
 if(!sectors.length)return;
 const pie=root.querySelector('[data-name="pie-01"]');
 if(pie){const kids=[...pie.children].slice(0,7);if(kids.length===7&&kids.every(k=>k.querySelector('img'))){sourceByCategory.clear();kids.forEach((k,i)=>sourceByCategory.set(i,k));}}
 const rects=sectors.map(e=>e.getBoundingClientRect()),base=stage.getBoundingClientRect();
 const left=Math.min(...rects.map(r=>r.left)),top=Math.min(...rects.map(r=>r.top));
 const right=Math.max(...rects.map(r=>r.right)),bottom=Math.max(...rects.map(r=>r.bottom));
 const ns='http://www.w3.org/2000/svg',hit=document.createElementNS(ns,'svg');
 hit.setAttribute('viewBox','0 0 350 350');hit.classList.add('usage-sectors');
 hit.style.cssText=`position:absolute;left:${(left-base.left)/scale}px;top:${(top-base.top)/scale}px;width:${(right-left)/scale}px;height:${(bottom-top)/scale}px;overflow:visible;pointer-events:none;z-index:10`;
 const selected=usageIds.indexOf(current),paths=[],legendButtons=[];let firstHit=null,selImg=null;const colors=selected<0?['#B80378','#2E7E24','#E01B1B','#D9C513','#6084B5','#C27A28','#7138C2']:['#B868A1','#5C8458','#D07979','#DACB7A','#92A2B8','#C3A685','#8560AE'];
 const tip=document.createElement('div');tip.className='usage-hover-tip';tip.setAttribute('role','tooltip');tip.hidden=true;const tipLine=document.createElement('div'),tipEnd=document.createElement('div');tipLine.className='usage-hover-line';tipEnd.className='usage-hover-end';tipLine.hidden=tipEnd.hidden=true;root.append(tipLine,tipEnd,tip);
 let ringEls=null;const decor=new Map();
 // Imágenes decorativas que coinciden con la porción abierta (anillo interior); se miden una sola vez, en reposo.
 const ringsFor=()=>{if(ringEls)return ringEls;ringEls=[];decor.clear();const all=[...root.querySelectorAll('img')];
  for(const [j,s] of sourceByCategory){if(!s)continue;const sr=s.getBoundingClientRect(),list=[];
   for(const im of all){if(pie?.contains(im)||s.contains(im))continue;const r=im.getBoundingClientRect();if(Math.abs(r.x-sr.x)<8&&Math.abs(r.y-sr.y)<8&&Math.abs(r.width-sr.width)<10&&Math.abs(r.height-sr.height)<10)list.push(im);}
   decor.set(j,list);}return ringEls;};
 const baseTranslate=new Map();
 // Suma el desplazamiento al translate original del Figma (si lo tiene) en vez de reemplazarlo.
 const shifted=(el,o)=>{if(!baseTranslate.has(el)){const t=getComputedStyle(el).translate;baseTranslate.set(el,t&&t!=='none'?t.split(' '):['0px','0px']);}const b=baseTranslate.get(el);return `calc(${b[0]} + ${o[0]}px) calc(${b[1]||'0px'} + ${o[1]}px)`;};
 const preview=i=>{ringsFor();paths.forEach((p,j)=>{const lit=j===i||j===selected;p.classList.toggle('is-lit',lit);sourceByCategory.get(j)?.classList.toggle('usage-source-lit',lit);p.setAttribute('fill',j===selected?'transparent':(j===i?['#B80378','#2E7E24','#E01B1B','#D9C513','#6084B5','#C27A28','#7138C2'][j]:colors[j]));legendButtons[j]?.classList.toggle('is-preview',j===i);legendButtons[j]?.setAttribute('aria-pressed',String(j===selected));});
  if(firstHit){paths.forEach(p=>hit.insertBefore(p,firstHit));if(selImg)hit.insertBefore(selImg,firstHit);if(i>=0&&i!==selected)hit.insertBefore(paths[i],firstHit);}
  paths.forEach((p,j)=>{const o=j===i?[Math.cos(mids[j])*POP,Math.sin(mids[j])*POP]:[0,0];p.style.translate=o[0]+'px '+o[1]+'px';const src=sourceByCategory.get(j);if(src){src.style.translate=shifted(src,o);
   // La capa de color de la porción abierta se dibuja entera encima; el original queda oculto para que no asome por debajo.
   src.style.visibility=(j===i||(j===selected&&selImg))?'hidden':'';if(j===selected&&selImg)selImg.style.translate=o[0]+'px '+o[1]+'px';}
   for(const im of decor.get(j)||[])im.style.visibility=(j===i||(j===selected&&selImg))?'hidden':'';});
  if(i<0){tip.hidden=tipLine.hidden=tipEnd.hidden=true;return;}
  const vivid=['#B80378','#2E7E24','#E01B1B','#D9C513','#6084B5','#C27A28','#7138C2'];
  const pct=document.createElement('strong');pct.className='usage-hover-pct';pct.textContent=String(values[i]).replace('.',',')+'%';
  const dot=document.createElement('i');dot.className='usage-hover-dot';dot.style.background=vivid[i];const nm=document.createElement('span');nm.textContent=labels[i];
  const row=document.createElement('div');row.className='usage-hover-row';row.append(dot,nm);tip.replaceChildren(pct,row);tip.hidden=false;
  // Punto de anclaje sobre la porción (ya desplazada) y popup hacia afuera, unido con una línea fina como en Figma.
  const X0=(left-base.left)/scale,Y0=(top-base.top)/scale,k=((right-left)/scale)/350,dx=Math.cos(mids[i]),dy=Math.sin(mids[i]);
  const px=X0+(175+138*dx)*k+dx*POP,py=Y0+(175+138*dy)*k+dy*POP,side=dx<0?-1:1;
  const dyc=py-(Y0+175*k),half=Math.sqrt(Math.max(0,(175*k+POP)**2-dyc**2)),edge=X0+175*k+side*half+side*TIP_GAP;
  const w=tip.offsetWidth,h=tip.offsetHeight;let tl=side<0?edge-w:edge;tl=Math.max(20,Math.min(1420-w,tl));
  tip.style.left=tl+'px';tip.style.top=(py-h/2)+'px';
  // Grosor compensado por la escala de la página para que la línea no desaparezca en pantallas chicas.
  const lw=Math.max(1.5,2/scale);tipLine.style.height=lw+'px';tipEnd.style.width=tipEnd.style.height=Math.max(7,6/scale)+'px';
  const from=side<0?tl+w:tl;tipLine.style.left=Math.min(from,px)+'px';tipLine.style.width=Math.abs(px-from)+'px';tipLine.style.top=py+'px';
  tipEnd.style.left=px+'px';tipEnd.style.top=py+'px';tipLine.hidden=tipEnd.hidden=false;
 };
 const POP=12,TIP_GAP=70;let angle=0;const mids=[],values=[28.1,28.3,21.3,7.5,6,4.6,4.3],total=values.reduce((a,b)=>a+b,0);
 const point=(r,a)=>[175+r*Math.cos(a),175+r*Math.sin(a)].join(' ');
 values.forEach((v,i)=>{const end=angle+v/total*2*Math.PI,p=document.createElementNS(ns,'path');mids.push((angle+end)/2);
  p.setAttribute('d',`M ${point(175,angle)} A 175 175 0 0 1 ${point(175,end)} L ${point(100,end)} A 100 100 0 0 0 ${point(100,angle)} Z`);
  p.setAttribute('fill',current===usageIds[i]?'transparent':colors[i]);p.style.pointerEvents='all';p.style.cursor='pointer';
  paths.push(p);const source=sourceByCategory.get(i);source?.classList.add('usage-source');p.onpointerenter=()=>preview(i);p.onpointerleave=()=>preview(-1);p.onfocus=()=>preview(i);p.onblur=()=>preview(-1);
  p.setAttribute('role','button');p.setAttribute('tabindex','0');p.setAttribute('aria-label','Ampliar '+labels[i]);p.setAttribute('aria-pressed',String(current===usageIds[i]));
  const activate=()=>navigate(current===usageIds[i]?'1239:9072':usageIds[i]);p.onclick=e=>{e.stopPropagation();activate();};p.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();activate();}};hit.append(p);angle=end;
 });
 // La porción visible se desplaza al pasar el mouse; la detección queda fija en una capa transparente encima.
 paths.slice().forEach((p,i)=>{const hp=document.createElementNS(ns,'path');hp.setAttribute('d',p.getAttribute('d'));hp.setAttribute('fill','transparent');hp.style.pointerEvents='all';hp.style.cursor='pointer';if(!firstHit)firstHit=hp;
  for(const k of ['onpointerenter','onpointerleave','onfocus','onblur','onclick','onkeydown'])hp[k]=p[k];
  for(const k of ['role','tabindex','aria-label','aria-pressed'])hp.setAttribute(k,p.getAttribute(k));
  p.removeAttribute('role');p.removeAttribute('tabindex');p.removeAttribute('aria-label');p.removeAttribute('aria-pressed');p.style.pointerEvents='none';p.onpointerenter=p.onpointerleave=p.onfocus=p.onblur=p.onclick=p.onkeydown=null;hit.append(hp);});
 root.append(hit);
 const selSrc=selected>=0?sourceByCategory.get(selected):null,selPic=selSrc?.querySelector('img');
 if(selPic){const r=selPic.getBoundingClientRect(),kk=((right-left)/scale)/350;selImg=document.createElementNS(ns,'image');selImg.setAttribute('href',selPic.getAttribute('src'));selImg.setAttribute('x',(r.left-left)/scale/kk);selImg.setAttribute('y',(r.top-top)/scale/kk);selImg.setAttribute('width',r.width/scale/kk);selImg.setAttribute('height',r.height/scale/kk);selImg.style.pointerEvents='none';hit.insertBefore(selImg,firstHit);}
 preview(-1);
 const aliases=['Escritura','Guia practica','Busqueda de informacion','Ayuda tecnica','Multimedia','Otro/desconocido','Autoexpresion'];
 for(const el of root.querySelectorAll('[role="button"],button')){const i=aliases.indexOf(el.textContent.trim());if(i<0)continue;legendButtons[i]=el;el.setAttribute('aria-label','Seleccionar '+labels[i]);el.onclick=e=>{e.preventDefault();e.stopPropagation();navigate(selected===i?'1239:9072':usageIds[i]);};el.onpointerenter=()=>preview(i);el.onpointerleave=()=>preview(-1);el.onfocus=()=>preview(i);el.onblur=()=>preview(-1);}preview(-1);
 navHotspot(15,89,current==='1239:9072'?'Volver al menú':'Volver al gráfico completo',()=>navigate(current==='1239:9072'?MENU:'1239:9072'));
 nextArrow('Ir a las referencias bibliográficas',()=>navigate('bibliografia'));
}
function installGrowth(root){
 // Las tarjetas inferiores (botón azul) quedaban tapadas por la capa del gráfico: se suben para poder hacer clic.
 for(const el of root.querySelectorAll('[data-name="Interaction hint card (Bottom-Left)"]')){
  if(!routes.get(el.dataset.nodeId)?.some(r=>r[0]?.type==='ON_CLICK'))continue;
  if(getComputedStyle(el).position==='static')el.style.position='relative';el.style.zIndex=30;
 }
 nextArrow('Ir a las referencias bibliográficas',()=>navigate('bibliografia'));
 if(current==='1239:8892'){
  // Título del mock + eje Y en millones.
  for(const el of root.querySelectorAll('p')){
   if(el.children.length)continue;const t=el.textContent.trim();
   if(t==='Porcentaje del uso'){el.textContent='Cantidad de usuarios';el.style.width='max-content';el.style.whiteSpace='nowrap';}
   else if(['1000','980','960','940','920','900','880'].includes(t)){
    // El texto crece hacia la derecha dentro de una caja de ancho fijo: se corre hacia la izquierda lo que se agrandó, así queda alineado al eje.
    el.textContent=t+'M';el.style.whiteSpace='nowrap';
    const extra=el.scrollWidth-el.clientWidth;if(extra>0)el.style.translate=-extra+'px 0';
   }
  }
  const tooltipIds=['1239:9040','1239:9043','1239:9058','1239:9046','1239:9049','1239:9052','1239:9055','1239:9061'];
  const vals=[883,888,891,894,899,901,901,1000],names=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto'];
  const nodes=[...root.querySelectorAll('[data-node-id]')].filter(n=>n.querySelector('img')&&n.className.includes('size-[19px]'));
  nodes.slice(0,8).forEach((n,i)=>{const show=()=>showTooltip(tooltipIds[i],n);focusable(n,names[i]+': '+vals[i]+'M de usuarios semanales',show);n.onpointerenter=show;n.onpointerleave=hideTooltip;n.onfocus=show;n.onblur=hideTooltip;n.setAttribute('aria-describedby','month-detail');});
 }
}
function installCompetitors(root){
 // Preserve the original static tooltip layers. Their dense original state is
 // intentionally not redesigned here.
 const series=[['1964:4028','ChatGPT','1957:3250'],['1964:4398','Gemini','1957:3397'],['1964:4344','Perplexity','1957:3375'],['1964:4086','Claude','1957:3307'],['1964:4137','DeepSeek','1957:3352'],['1964:4291','Grok','1957:3329'],['1964:4187','Copilot','1957:3276']];
 for(const [id,name,info]of series){const layer=byId(id,root);if(!layer)continue;layer.classList.add('series-layer');
  const line=[...layer.querySelectorAll('[data-name]')].filter(n=>n.dataset.name.toUpperCase().includes('LINEA')&&!n.dataset.name.toUpperCase().includes('BOTON'));
  line.forEach(n=>n.classList.add('series-line'));
  const btn=[...layer.querySelectorAll('button')].find(n=>n.dataset.name!=='info');
  if(btn){btn.classList.add('series-button');focusable(btn,'Mostrar u ocultar '+name,()=>{if(activeSeries.has(name))activeSeries.delete(name);else activeSeries.add(name);layer.classList.toggle('series-off',!activeSeries.has(name));btn.setAttribute('aria-pressed',activeSeries.has(name));});btn.setAttribute('aria-pressed',activeSeries.has(name));}
  layer.classList.toggle('series-off',!activeSeries.has(name));
  const infos=[...layer.querySelectorAll('[data-name="info"]')];
  if(name==='ChatGPT')infos.push(byId('I1964:4028;1957:3482',root));
  if(name==='Claude')infos.push(byId('I1964:4086;1963:3746',root),byId('I1964:4086;1963:3759',root));
  for(let i=infos.length-1;i>=0;i--)if(!infos[i])infos.splice(i,1);
  const infoGraphic=infos.flatMap(n=>[n,...n.querySelectorAll('*')]).find(n=>n.getBoundingClientRect().width>0&&n.getBoundingClientRect().height>0);
  if(infoGraphic){
   const box=infoGraphic.getBoundingClientRect(),base=stage.getBoundingClientRect();
   const control=navHotspot((box.left-base.left)/scale,(box.top-base.top)/scale,'Información sobre '+name,()=>openDialog(info));
   control.style.width=box.width/scale+'px';control.style.height=box.height/scale+'px';
   for(const original of infos){original.removeAttribute('role');original.tabIndex=-1;original.setAttribute('aria-hidden','true');}
  }
 }
 navHotspot(15,89,'Volver al menú',()=>navigate(MENU));
}
function animate(root){
 if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;
 const imgs=[...root.querySelectorAll('img')];
 for(const img of imgs){const p=img.closest('[data-name]');const name=(p?.dataset.name||'').toLowerCase();if(name.includes('camino'))p.classList.add('timeline-arrive');else if(/linea|grafico/.test(name))p.classList.add('graph-arrive');}
 for(const img of imgs){const src=img.getAttribute('src')||'';if(src.endsWith('/4a408.svg'))img.classList.add('timeline-arrive');else if(/\/(515bd|3e502|01191|fabf1)\.svg$/.test(src))img.classList.add('graph-arrive');}
 if([...compareIds,...paradoxIds].includes(current)){
  for(const el of root.querySelectorAll('[data-node-id]'))if(el.offsetWidth>250&&el.offsetHeight>=65&&el.offsetHeight<82&&el.children.length<3&&el.dataset.name!=='MainHeader')el.classList.add('bar-arrive');
 }
 if(current===HOME)for(const n of root.querySelectorAll('[data-name*="Node Graphic"],[data-name*="Particle Cluster"]'))n.classList.add('ambient');
 if([...compareIds,...paradoxIds].includes(current)){
  for(const p of root.querySelectorAll('p')){
   if(!/^\d+%$/.test(p.textContent.trim()))continue;
   const end=Number(p.textContent.trim().slice(0,-1));const start=performance.now();
   const frame=now=>{if(!p.isConnected)return;const f=Math.min(1,(now-start)/800);p.textContent=Math.round(end*(1-Math.pow(1-f,3)))+'%';if(f<1)requestAnimationFrame(frame);};requestAnimationFrame(frame);
  }
 }
}
function decodeHash(){const id=location.hash.slice(1).replace('-',':');return SCREEN_IDS.has(id)&&(templates[id]||id==='bibliografia')?id:HOME;}
navigate(decodeHash(),{push:false});
