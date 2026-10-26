// Correcciones de composición: una sola instancia por elemento interactivo.
const svgNS='http://www.w3.org/2000/svg';
const node=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
const svg=(tag,attrs)=>{const e=document.createElementNS(svgNS,tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);return e;};
const button=(label,fn,cls='')=>{const e=node('button',cls,label);e.type='button';e.onclick=fn;return e;};
const years=['1867:1352','1867:1586','1867:1464','1867:1648','1867:1526'];
const comparisons=['1093:2247','1093:2185','1093:2321'];
const cardsOpen=new Set();let activeTurn=-1;
// Series prendidas (se pueden prender varias a la vez). Persiste al navegar entre pantallas.
const activeSeries=new Set(['ChatGPT']);
// Logo de cada popup de información (id del popup en Figma -> asset en assets/images).
const infoLogos={'1957:3250':'7baa8','1957:3276':'98bd2','1957:3307':'6bb58','1957:3329':'6c5ce','1957:3352':'fbe4f','1957:3375':'90704','1957:3397':'05610'};
function shell(title,back,next,navigate){
 const root=node('section','screen corrected');
 const header=button('',()=>navigate('1239:7025'),'corrected-brand');header.setAttribute('aria-label','Volver al inicio');const logo=node('img');logo.src='./assets/images/d79c9.svg';logo.alt='';header.append(logo,node('strong','','ChatGPT'),node('span','brand-divider'),node('span','brand-subtitle','De herramienta a compañía'));root.append(header);
 if(back){const b=button('‹',()=>navigate(back),'corrected-back');b.setAttribute('aria-label','Volver');root.append(b);}
 if(next){const b=button('›',()=>navigate(next),'corrected-next');b.setAttribute('aria-label','Continuar');root.append(b);}
 root.append(node('h1','corrected-title',title));return root;
}
const mouseIcon=()=>{const s=svg('svg',{viewBox:'0 0 24 24',width:22,height:22,'aria-hidden':'true',class:'hint-icon'});s.append(svg('circle',{cx:12,cy:12,r:11,fill:'none',stroke:'#b9b9b9','stroke-width':1.4}),svg('rect',{x:8.4,y:5.2,width:7.2,height:13.6,rx:3.6,fill:'none',stroke:'#fff','stroke-width':1.4}),svg('line',{x1:12,y1:8.6,x2:12,y2:11.4,stroke:'#fff','stroke-width':1.4,'stroke-linecap':'round'}));return s;};
function hint(root,text){const e=node('div','corrected-hint');e.append(mouseIcon(),node('span','',text));root.append(e);}
// El logo conserva su posición al navegar y recorre las curvas del camino.
const roadCurve='M 68 0 C 87 12 111 25 132 40 C 255 87 101 120 104 170 C 75 211 214 214 239 263 C 294 302 245 366 268 410 C 285 462 379 462 424 474';
function timeline(id,data,navigate){
 const i=years.indexOf(id),root=shell('ChatGPT evolucionó frente a nuestros ojos.','1239:7025','1743:189',navigate);
 root.classList.add('timeline-screen');
 const previous=document.querySelector('.road-traveler'),from=previous?Number(previous.dataset.distance):0;
 const row=node('div','timeline-layout'+(i>=0?' has-detail':''));
 const road=node('div','timeline-road'),img=node('img','road-original');img.src='./assets/images/4a408.svg';img.alt='Camino de evolución de ChatGPT';img.width=570;img.height=557;road.append(img);
 const route=svg('svg',{viewBox:'0 0 570 557',class:'road-motion-path','aria-hidden':'true'}),path=svg('path',{d:roadCurve,fill:'none'});route.append(path);road.append(route);
 const coords=[[132,40],[104,170],[239,263],[268,410],[424,474]];
 coords.forEach(([x,y],j)=>{const b=button('',()=>navigate(years[j]),'timeline-stop'+(i===j?' selected':''));b.style.left=x+'px';b.style.top=y+'px';b.setAttribute('aria-label','Ver etapa '+(2022+j));b.setAttribute('aria-pressed',String(i===j));road.append(b);});
 const logo=node('img','road-traveler');logo.src='./assets/images/ef2e2.svg';logo.alt='Etapa actual de ChatGPT';road.append(logo);row.append(road);
 if(i>=0){const texts=data.screens.find(x=>x.id===id).texts,panel=node('article','timeline-detail');const close=button('×',()=>navigate('1725:1287'),'timeline-close');close.setAttribute('aria-label','Cerrar etapa');panel.append(close,node('h2','',texts[4]));const list=node('ul');
 const emphases=['popularizo los chatbot','mantener una conversación','IA generativa','herramienta','Se incorporaron funciones','generación de imágenes','GPT-4o','GPT-4','ofrecer conversaciones por voz','textos y código','GPT-5','agentes','tareas de varios pasos','GPT-6 Astra','programas, archivos','memoria','respuestas personalizadas'];
 for(const t of texts[5].split('\n')){const li=node('li');const pattern=new RegExp('('+emphases.join('|')+')','g');for(const part of t.split(pattern))li.append(emphases.includes(part)?node('strong','',part):document.createTextNode(part));list.append(li);}panel.append(list);
 const nav=node('div','timeline-year-nav');nav.append(button('← Año anterior',()=>navigate(i?years[i-1]:'1725:1287')));if(i<4)nav.append(button('Siguiente año →',()=>navigate(years[i+1])));panel.append(nav);row.append(panel);}
 root.append(row);hint(root,'Presiona los puntos para ver las etapas por las que pasó ChatGPT');
 const length=path.getTotalLength();let target=0;
 if(i>=0){const [x,y]=coords[i];let best=Infinity;for(let d=0;d<=length;d+=.5){const p=path.getPointAtLength(d),delta=(p.x-x)**2+(p.y-y)**2;if(delta<best){best=delta;target=d;}}}
 const place=d=>{const p=path.getPointAtLength(d);logo.style.left=p.x+'px';logo.style.top=p.y+'px';logo.dataset.distance=String(d);};
 const start=Math.max(0,Math.min(length,from));place(start);const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,duration=reduced?0:Math.min(1500,450+Math.abs(target-start)*1.5);let begun;
 const tick=now=>{if(!root.isConnected)return;begun??=now;const progress=duration?Math.min(1,(now-begun)/duration):1,eased=progress*progress*(3-2*progress);place(start+(target-start)*eased);if(progress<1)requestAnimationFrame(tick);};requestAnimationFrame(tick);return root;
}
function approval(id,data,navigate){
 const i=comparisons.indexOf(id),root=shell('ChatGPT te da mucho más la razón que tus amigxs.','1083:2092',i===2?'1875:4453':null,navigate);
 root.append(node('p','approval-subtitle','El estudio comparó las respuestas de Chat GPT -4o contra lo que haría un humano en tres tipos de situaciones reales.'));
 const tabs=node('div','approval-tabs');tabs.setAttribute('role','tablist');['Consejos personales','“¿Soy yo el forr*?”','Acciones riesgosas.'].forEach((t,j)=>{const b=button(t,()=>navigate(comparisons[j]));b.setAttribute('role','tab');b.setAttribute('aria-selected',String(i===j));tabs.append(b)});root.classList.add('approval-screen');root.append(tabs);
 const desc=['Se analizaron las respuestas en base a 3.027 preguntas abiertas de consejos personales (Reddit y columnas de consejeros profesionales).','Sobre 2.000 publicaciones de la comunidad de Reddit “AmITheAssh*le?” donde la comunidad ya votó, por consenso, que el usuario estaba equivocado.','Sobre 6.560 frases que describen una acción riesgosa (mentir, autolesión, violencia, etc.).'];root.append(node('p','approval-description',desc[Math.max(0,i)]));
 const values=i<0?[0,0]:[[39,91],[0,51],[0,67]][i];const rows=node('div','approval-bars');values.forEach((v,j)=>{const row=node('div','approval-row');row.append(node('strong','approval-label',j?'Chat GPT':'Humanos'));const track=node('div','approval-track');track.style.setProperty('--percent',v+'%');const fill=node('div','approval-fill');fill.style.width=v+'%';const thumb=node('div','approval-thumb');thumb.style.left=`clamp(4px,calc(${v}% - 36px),calc(100% - 77px))`;const value=node('span','approval-value',v+'%');value.style.left=v<15?'90px':`calc(${v}% - 158px)`;track.append(fill,thumb,value);row.append(track);rows.append(row)});root.append(rows,node('p','approval-metric','Métrica: % de respuestas que te aprueban la acción explícitamente.'));return root;
}
function turns(id,data,navigate){
 const all=id==='1875:4273',root=shell('La IA complaciente te encierra en tu propia perspectiva.',all?'1875:4453':'1093:2321','1853:3248',navigate);
 root.classList.add('turns-screen');root.querySelector('h1').innerHTML='<span style="font-weight:500">La </span>IA complaciente <span style="font-weight:500">te encierra en</span> tu <span style="font-weight:500">propia</span> perspectiva.';root.append(node('p','turns-description','En conversaciones divididas en 6 turnos, donde ChatGPT era cada vez más complaciente al contestarte, se habló sobre un conflicto personal y se midió que tanto la IA menciona y considera la perspectiva de la otra persona involucrada.'));
 const description=root.querySelector('.turns-description');for(const phrase of ['conversaciones','6 turnos','cada vez más complaciente','la IA menciona y considera la perspectiva de la otra persona'])description.innerHTML=description.innerHTML.replace(phrase,'<strong>'+phrase+'</strong>');
 const level=node('div','complacency-level');level.setAttribute('role','progressbar');level.setAttribute('aria-label','Nivel de complacencia');level.setAttribute('aria-valuemin','0');level.setAttribute('aria-valuemax','6');const label=node('div','level-label','Nivel de complacencia.');const track=node('div','level-track'),fill=node('div','level-fill');track.append(fill);for(let j=0;j<6;j++){const dot=node('span','level-dot');dot.style.left=(j/5*100)+'%';const face=node('img');face.src='./assets/images/'+['7ffae','200d1','3f076','259b7','3a710','1c320'][j]+'.svg';face.alt='';dot.append(face);track.append(dot);}level.append(label,track);root.append(level);
 const grid=node('div','turns-grid');const standard=[25,35,45,55,62,67],personal=[5,5,7,7,9,7];
 const cards=[],inners=[],dots=[...track.querySelectorAll('.level-dot')];
 const tip=node('div','turn-bar-tip');tip.setAttribute('role','tooltip');tip.hidden=true;
 const sync=()=>{const selected=all?5:activeTurn;level.setAttribute('aria-valuenow',String(selected+1));level.setAttribute('aria-valuetext',selected<0?'Ningún turno abierto':'Turno '+(selected+1)+' de 6');fill.style.width=(selected<=0?0:selected/5*100)+'%';dots.forEach((d,j)=>d.classList.toggle('active',j<=selected));level.classList.toggle('has-open',selected>=0);cards.forEach((c,j)=>{const open=all||cardsOpen.has(j);c.classList.toggle('revealed',open);c.setAttribute('aria-pressed',String(open));});};
 // Al tocar una tarjeta se abren ella y todas las anteriores (en cascada); las posteriores se cierran.
 // Tocar de nuevo la última tarjeta abierta cierra todo.
 const choose=i=>{const prev=new Set(cardsOpen),next=activeTurn===i?-1:i,opening=[],closing=[];
  for(let j=0;j<6;j++){const willOpen=j<=next;if(willOpen&&!prev.has(j))opening.push(j);if(!willOpen&&prev.has(j))closing.push(j);}
  const delay=new Array(6).fill(0);opening.forEach((j,n)=>{delay[j]=n*110});closing.sort((x,y)=>y-x).forEach((j,n)=>{delay[j]=n*80});
  cardsOpen.clear();for(let j=0;j<=next;j++)cardsOpen.add(j);activeTurn=next;
  for(let j=0;j<6;j++){inners[j].style.transitionDelay=delay[j]+'ms';dots[j].style.transitionDelay=delay[j]+'ms';}
  fill.style.transitionDuration=(.5+Math.max(opening.length,closing.length)*.1)+'s';sync();};
 const showTip=(el,text)=>{const r=root.getBoundingClientRect(),q=el.getBoundingClientRect(),k=r.width/root.offsetWidth;tip.textContent=text;tip.hidden=false;tip.style.left=((q.left-r.left+q.width/2)/k)+'px';tip.style.top=((q.top-r.top)/k-24)+'px';};
 const hideTip=()=>{tip.hidden=true;};
 for(let i=0;i<6;i++){const item=node('div','turn-item');item.append(node('h2','','Turno '+(i+1)));const b=button('',()=>{if(all)return;choose(i);},'turn-card'+(all||cardsOpen.has(i)?' revealed':''));b.setAttribute('aria-label','Voltear tarjeta del turno '+(i+1));b.setAttribute('aria-pressed',String(all||cardsOpen.has(i)));const inner=node('div','turn-card-inner'),front=node('div','turn-front-face','Click para voltear\nla tarjeta y comparar'),back=node('div','turn-back-face');
 for(const n of [0,25,50,75,100]){const line=node('div','turn-gridline');line.style.bottom=(12+n*.78)+'%';line.append(node('span','',n+'%'));back.append(line);}
 const threshold=node('div','turn-threshold');threshold.style.bottom=(12+10*.78)+'%';threshold.append(node('span','','10%'));back.append(threshold);
 for(const [v,color,k]of [[standard[i],'#49ffd5',0],[personal[i],'#ffae00',1]]){const bar=node('div','turn-data-bar');bar.style.cssText=`height:${v*.78}%;left:${45+k*47}px;background:${color}`;bar.append(node('strong','',v+'%'));const name=k?'IA personalizada':'IA no personalizada';bar.dataset.tip=name;bar.addEventListener('pointerenter',()=>showTip(bar,name));bar.addEventListener('pointerleave',hideTip);back.append(bar);}inner.append(front,back);b.append(inner);cards[i]=b;inners[i]=inner;item.append(b);grid.append(item);}
 root.append(grid);const foot=node('div','turns-foot');foot.append(node('p','','Métrica: % de veces que la IA considera la perspectiva de la otra persona del conflicto.'),node('p','turns-threshold-note','*Porcentaje máximo que la IA personalizada consideró la perspectiva de la otra persona'));root.append(foot);root.append(tip);sync();return root;
}
function competitors(data,navigate){
 const root=shell('Competidores principales','1743:189','bibliografia',navigate);root.classList.add('competitors-screen');root.append(node('p','competitors-description','Compara los flujos de visitas web anuales de los ultimos 5 años (Noviembre 2022 - Marzo 2026) de ChatGPT y 6 de sus competidores'));
 const panel=node('div','competitors-panel'),chart=svg('svg',{viewBox:'0 0 1180 520',width:1180,height:520,'aria-label':'Visitas web anuales por asistente, en millones','role':'img'});
 // [nombre, color, valores que muestra el tooltip (millones), id del popup de info, posición de cada punto en el gráfico (millones)].
 // Las posiciones son las del Figma (leídas de los vectores originales de cada línea); los valores son los del tooltip.
 // null = la serie todavía no existe ese año (2022, 2023, 2024, 2025, 2026).
 const series=[
  ['ChatGPT','#fff',[267,16553,31850,64019,16655],'1957:3250',[165,15300,29300,49400,16300]],
  ['Gemini','#67b95f',[null,800,4575,11820,3545],'1957:3397',[null,534,2910,11900,3070]],
  ['Perplexity','#d24242',[6,349,1355,2054,558],'1957:3375',[5.42,179,1230,1560,309]],
  ['Claude','#dabd25',[null,60,640,2010,900],'1957:3307',[null,35.4,343,1400,949]],
  ['DeepSeek','#ce58a5',[null,4,97,2842,740],'1957:3352',[null,3.05,83.8,2080,412]],
  ['Grok','#c27a28',[null,40,875,2892,858],'1957:3329',[null,21,549,2300,731]],
  ['Copilot','#7138c2',[null,630,2335,3932,781],'1957:3276',[null,334,1770,3500,578]]];
 // Formato del Figma: punto de miles solo desde 5 cifras (16.553M, 100.000M) y sin punto en 4 cifras (2842M, 1000M).
 const fmt=n=>n>=10000?n.toLocaleString('es-AR'):String(n);
 const POSICIONES_FIGMA=true; // false = graficar exactamente los valores del tooltip
 // Posición horizontal de cada año (en el Figma no están a distancias iguales) y escala logarítmica vertical.
 const xs=[136,378,614,865,1100],x=i=>xs[i],y=v=>410-(Math.log10(v)-1)*97;
 chart.append(svg('path',{d:'M105 5 L105 470 L1140 470 M101 11 L105 5 L109 11 M1134 466 L1140 470 L1134 474',fill:'none',stroke:'#a6a6a6','stroke-width':1.5}));
 for(const v of [10,100,1000,10000,100000]){chart.append(svg('line',{x1:105,x2:1125,y1:y(v),y2:y(v),stroke:'#ffffff30','stroke-width':1}));const t=svg('text',{x:90,y:y(v)+6,fill:'#a6a6a6','text-anchor':'end','font-size':18});t.textContent=fmt(v)+'M';chart.append(t);}
 for(let i=0;i<5;i++){chart.append(svg('line',{x1:x(i),x2:x(i),y1:22,y2:470,stroke:'#ffffff13','stroke-dasharray':'5 8'}));const t=svg('text',{x:x(i),y:502,fill:'#a6a6a6','text-anchor':'middle','font-size':18});t.textContent=2022+i;chart.append(t);}
 const tip=node('div','competitor-tooltip');tip.setAttribute('role','tooltip');tip.hidden=true;panel.append(tip);
 let shown=null;
 const hideTip=()=>{shown=null;tip.hidden=true;};
 const showPoint=pt=>{
  if(!activeSeries.has(pt.name)){hideTip();return;}
  shown=pt;
  const dot=node('i','tip-dot');dot.style.background=pt.color;if(pt.color==='#fff')dot.style.boxShadow='inset 0 0 0 1px #9a9a9a';
  const row=node('div','tip-row');row.append(dot,node('span','tip-value',fmt(pt.v)+'M'),node('span','tip-name',pt.name));
  tip.replaceChildren(node('strong','tip-year',String(2022+pt.i)),row);
  tip.hidden=false;
  // Posición como en Figma: a la derecha del punto, con la base apenas por debajo del punto.
  const a=pt.dotEl.getBoundingClientRect(),p=panel.getBoundingClientRect(),W=panel.offsetWidth,s=p.width/W;
  const ax=(a.left+a.width/2-p.left)/s,ay=(a.top+a.height/2-p.top)/s,w=tip.offsetWidth,h=tip.offsetHeight;
  let left=ax+16;if(left+w>W-10)left=ax-16-w;
  tip.style.left=Math.max(10,left)+'px';tip.style.top=Math.max(5,ay+8-h)+'px';
 };
 const points=[];
 const legend=node('div','competitors-legend'),items=[];
 const sync=()=>items.forEach(({name:n,group,toggle,infoButton})=>{const active=activeSeries.has(n);group.classList.toggle('series-highlighted',active);toggle.setAttribute('aria-pressed',String(active));infoButton.classList.toggle('series-highlighted',active);});
 const highlight=name=>{activeSeries.add(name);sync();};
 for(const[name,color,values,info,plot]of series){
  const group=svg('g',{'data-series':name});group.style.color=color;
  const where=POSICIONES_FIGMA?plot:values;
  const pts=values.map((v,i)=>v===null?null:[x(i),y(where[i]),i,v]).filter(Boolean);
  const line=pts.map(p=>p[0]+','+p[1]).join(' ');
  group.append(svg('polyline',{points:line,fill:'none',stroke:color,'stroke-width':2,'stroke-linejoin':'round'}));
  const lineHit=svg('polyline',{points:line,fill:'none',stroke:'transparent','stroke-width':14,role:'button',tabindex:0,'aria-label':'Resaltar línea de '+name});
  lineHit.onclick=()=>highlight(name);lineHit.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();highlight(name);}};group.append(lineHit);
  for(const[px,py,i,v]of pts){
   const dotEl=svg('circle',{cx:px,cy:py,r:4,fill:color});group.append(dotEl);
   const pt={name,color,i,v,px,py,dotEl};points.push(pt);
   // Círculo invisible: sirve para activar la línea con un clic (si está apagada) y para el foco con teclado.
   const hit=svg('circle',{cx:px,cy:py,r:10,fill:'transparent',tabindex:0,role:'button','aria-label':name+' '+(2022+i)+': '+v+' millones'});
   hit.onclick=()=>highlight(name);hit.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();highlight(name);}};
   hit.onfocus=()=>showPoint(pt);hit.onblur=hideTip;group.append(hit);
  }
  chart.append(group);
  const row=node('div','competitor-legend-row');const toggle=button('',()=>{if(activeSeries.has(name))activeSeries.delete(name);else activeSeries.add(name);hideTip();sync();},'competitor-toggle');const dot=node('i');dot.style.background=color;toggle.append(dot,node('span','',name));toggle.setAttribute('aria-label','Resaltar '+name);const infoButton=button('i',()=>{highlight(name);showInfo(root,data,info);},'competitor-info');infoButton.setAttribute('aria-label','Información sobre '+name);items.push({name,group,toggle,infoButton});row.append(toggle,infoButton);legend.append(row);
 }
 sync();
 // Tooltip por cercanía: con el mouse sobre el gráfico se muestra el punto más cercano (hasta 14 unidades) de las líneas prendidas.
 // Así los puntos que quedan muy juntos entre sí (por ejemplo Grok, DeepSeek, Perplexity y Claude en 2025) siempre se pueden leer.
 chart.onpointermove=e=>{
  const m=chart.getScreenCTM();if(!m)return;
  const q=chart.createSVGPoint();q.x=e.clientX;q.y=e.clientY;const c=q.matrixTransform(m.inverse());
  let best=null,bd=14*14;
  for(const pt of points){if(!activeSeries.has(pt.name))continue;const d=(pt.px-c.x)**2+(pt.py-c.y)**2;if(d<bd){bd=d;best=pt;}}
  if(best===shown)return;
  if(best)showPoint(best);else hideTip();
 };
 chart.onpointerleave=hideTip;
 panel.append(chart,legend);root.append(panel);hint(root,'Posa el mouse sobre los puntos para leer los datos. Presiona los botones para comparar.');return root;
}

// Referencias bibliográficas. Completá `url` de cada una para que sea un link (si está vacía se muestra como texto subrayado).
const references=[
 [['Plataforma de inteligencia de búsqueda en IA','https://aisearch.similarweb.com/blog/most-used-ai/?utm_source=gemini'],['Estadísticas de ingresos y uso de ChatGPT (2026)','https://www.businessofapps.com/data/chatgpt-statistics/?utm_source=gemini'],['Análisis de tráfico, clasificación y audiencia de claude.ai','https://www.similarweb.com/website/claude.ai/?utm_source=gemini'],['Análisis de tráfico, clasificación y audiencia de chatgpt.com','https://www.similarweb.com/website/chatgpt.com/?utm_source=gemini#overview'],['Análisis de tráfico, clasificación y audiencia de perplexity.ai','https://www.similarweb.com/website/perplexity.ai/?utm_source=gemini'],['Los 100 sitios web más visitados en EE. UU. (mayo de 2026)','https://www.similarweb.com/blog/research/market-research/most-visited-websites-usa/?utm_source=gemini'],['El liderazgo de ChatGPT se reduce a medida que Gemini asciende en la guerra de tráfico de la IA','https://ppc.land/chatgpts-lead-shrinks-as-gemini-surges-in-ai-traffic-war/?utm_source=gemini'],['Análisis de la dependencia de los chatbots de IA: un modelo de doble vía de mecanismos cognitivos y afectivos','https://www.mdpi.com/2078-2489/16/12/1025'],['Investigación sobre el uso afectivo y el bienestar emocional en ChatGPT','https://cdn.openai.com/papers/15987609-5f71-433c-9972-e91131f399a1/openai-affective-use-study.pdf'],['La IA aduladora disminuye las intenciones prosociales y promueve la dependencia.','https://www.science.org/doi/10.1126/science.aec8352']],
 [['Greg Brockman – Wikipedia','https://en.wikipedia.org/wiki/Greg_Brockman?utm_source=gemini'],['Presentamos ChatGPT – OpenAI','https://openai.com/es-419/index/chatgpt/?utm_source=chatgpt.com'],['Notas de lanzamiento de modelos','https://help.openai.com/es-419/articles/9624314-model-release-notes?utm_source=chatgpt.com'],['Sam Altman – Wikipedia, la enciclopedia libre','https://es.wikipedia.org/wiki/Sam_Altman?utm_source=gemini'],['Ilya Sutskever – Wikipedia, la enciclopedia libre','https://es.wikipedia.org/wiki/Ilya_Sutskever?utm_source=gemini'],['Estadísticas de uso de ChatGPT: septiembre de 2026','https://firstpagesage.com/seo-blog/chatgpt-usage-statistics/?utm_source=gemini'],['Cuota de mercado de chatbots de IA en todo el mundo','https://gs.statcounter.com/ai-chatbot-market-share/all/worldwide/2025?utm_source=gemini'],['El tráfico web de ChatGPT disminuye mientras Google Gemini gana terreno','https://www.timesofai.com/news/similarweb-report-gemini-gains-chatgpt-traffic-drops/?utm_source=gemini'],['Cómo la IA y el comportamiento humano moldean los efectos psicosociales de los chatbots: un estudio longitudinal controlado aleatorizado','https://arxiv.org/pdf/2503.17473']]];
function bibliography(data,navigate,from){
 const back=from&&from!=='bibliografia'&&from!=='1239:7025'?from:'1770:3285';
 const root=shell('Referencias bibliográficas',back,null,navigate);root.classList.add('bibliography-screen');
 const wrap=node('div','bibliography-columns');
 for(const col of references){const panel=node('ul','bibliography-panel');for(const[text,url]of col){const li=node('li');let a;if(url){a=node('a','',text);a.href=url;a.target='_blank';a.rel='noopener noreferrer';}else a=node('span','bibliography-link',text);if(url)a.className='bibliography-link';li.append(a);panel.append(li);}wrap.append(panel);}
 root.append(wrap);return root;
}

function showInfo(root,data,id){
 const content=data.aux.find(s=>s.id===id)?.texts;if(!content)return;
 root.querySelector('.fixed-info-shade')?.remove();
 const previous=document.activeElement;
 const shade=node('div','fixed-info-shade'),modal=node('section','fixed-info');
 modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label',content[0]);
 const close=()=>{shade.remove();previous?.focus();document.removeEventListener('keydown',keys);};

 // Botón de cierre: X blanca simple (Figma).
 const b=button('',close,'fixed-info-close');b.setAttribute('aria-label','Cerrar información');
 const x=node('img');x.src='./assets/images/2da5c.svg';x.alt='';b.append(x);

 // Columna izquierda: logo del asistente + nombre.
 const brand=node('div','fixed-info-brand');
 const logoBox=node('div','fixed-info-logo');
 const logo=node('img');logo.src='./assets/images/'+(infoLogos[id]||'7baa8')+'.svg';logo.alt='';
 logoBox.append(logo);
 brand.append(logoBox,node('h2','',content[0]));

 // Columna derecha: dos filas (calendario + fecha, robot + descripción).
 const cal=node('span','boxicons--calendar fixed-info-cal');cal.setAttribute('aria-hidden','true');
 const bot=node('img','fixed-info-bot');bot.src='./assets/images/d92ea.svg';bot.alt='';
 const row1=node('div','fixed-info-row fixed-info-row-date'),row2=node('div','fixed-info-row fixed-info-row-desc');
 row1.append(cal,node('p','fixed-info-date',content[1]));
 row2.append(bot,node('p','fixed-info-description',content[2]));
 const body=node('div','fixed-info-body');body.append(row1,row2);

 modal.append(brand,body,b);
 shade.append(modal);root.append(shade);
 shade.onclick=e=>{if(e.target===shade)close()};
 const keys=e=>{if(e.key==='Escape')close();if(e.key==='Tab'){e.preventDefault();b.focus();}};
 document.addEventListener('keydown',keys);b.focus();
}
export function correctedView(id,data,navigate,from){if(id==='bibliografia')return bibliography(data,navigate,from);if(id==='1725:1287'||years.includes(id))return timeline(id,data,navigate);if(id==='1770:3285')return competitors(data,navigate);if(id==='1092:3752'||comparisons.includes(id))return approval(id,data,navigate);if(['1875:4453','1875:4273'].includes(id))return turns(id,data,navigate);return null;}
