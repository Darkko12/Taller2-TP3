export function h(tag,props,...children){
 if(tag==='img'&&/\/(8d773|6cbb5)\.svg$/.test(props?.src||''))return document.createTextNode('');
 if(typeof tag==='function')return tag({...props,children});
 const el=document.createElement(tag);
 for(const [k,v] of Object.entries(props||{})){
  if(v==null||v===false)continue;
  if(k==='className')el.className=v;
  else if(k==='style')for(const [p,value]of Object.entries(v)){
   if(p.startsWith('--'))el.style.setProperty(p,value);
   else el.style[p]=typeof value==='number'&&!['opacity','zIndex','fontWeight','flex','flexGrow','flexShrink','order'].includes(p)?value+'px':value;
  }
  else if(k==='children')continue;
  else el.setAttribute(k,v===true?'':v);
 }
 for(const c of children.flat(Infinity))if(c!=null&&c!==false)el.append(c instanceof Node?c:document.createTextNode(String(c)));
 return el;
}
