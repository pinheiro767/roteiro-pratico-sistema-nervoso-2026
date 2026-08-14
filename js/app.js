const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const save=()=>{let o={}; $$('textarea[data-note]').forEach(x=>o[x.dataset.note]=x.value); localStorage.notes=JSON.stringify(o); localStorage.checks=JSON.stringify($$('input[type=checkbox][data-key]').filter(x=>x.checked).map(x=>x.dataset.key)); ['nome','ra','turma','data'].forEach(k=>localStorage[k]=$('#'+k)?.value||''); progress()};
let notes=JSON.parse(localStorage.notes||'{}'), checks=JSON.parse(localStorage.checks||'[]');
$$('textarea[data-note]').forEach(x=>{x.value=notes[x.dataset.note]||'';x.oninput=save}); $$('input[data-key]').forEach(x=>{x.checked=checks.includes(x.dataset.key);x.onchange=save}); ['nome','ra','turma','data'].forEach(k=>{if($('#'+k)){ $('#'+k).value=localStorage[k]||''; $('#'+k).oninput=save}});
function progress(){let a=$$('input[data-key]'),n=a.filter(x=>x.checked).length,p=a.length?Math.round(n/a.length*100):0;$('#bar').style.width=p+'%';$('#pct').textContent=p+'% concluído'} progress();
window.zoom=src=>{$('#modalImg').src=src;$('#modal').classList.add('show')};
let deferred; addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;$('#install').style.display='inline-block'}); $('#install').onclick=async()=>{if(deferred){deferred.prompt();deferred=null}else alert('No iPhone/iPad: use Compartilhar → Adicionar à Tela de Início.')};
if('serviceWorker'in navigator) navigator.serviceWorker.register('./service-worker.js');
const DB='NeuroRoteiro',STORE='photos'; function db(){return new Promise((res,rej)=>{let r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore(STORE,{keyPath:'id',autoIncrement:true});r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
async function renderPhotos(){let d=await db(),tx=d.transaction(STORE),r=tx.objectStore(STORE).getAll();r.onsuccess=()=>{$('#gallery').innerHTML='';r.result.forEach(p=>{let u=URL.createObjectURL(p.blob),f=document.createElement('figure');f.className='atlas-card';f.innerHTML=`<img src="${u}" onclick="zoom(this.src)"><figcaption><input value="${p.caption||''}" placeholder="Legenda" onchange="caption(${p.id},this.value)"> <button onclick="delPhoto(${p.id})">Excluir</button></figcaption>`;$('#gallery').append(f)})}}; renderPhotos();
$('#photos').onchange=async e=>{let d=await db(),tx=d.transaction(STORE,'readwrite'),s=tx.objectStore(STORE);for(let f of e.target.files)s.add({blob:f,caption:'',date:Date.now()});tx.oncomplete=renderPhotos};
window.delPhoto=async id=>{let d=await db(),tx=d.transaction(STORE,'readwrite');tx.objectStore(STORE).delete(id);tx.oncomplete=renderPhotos};
window.caption=async(id,v)=>{let d=await db(),tx=d.transaction(STORE,'readwrite'),s=tx.objectStore(STORE),r=s.get(id);r.onsuccess=()=>{r.result.caption=v;s.put(r.result)}};
let fz=parseInt(localStorage.fontSize||16);
function applyFont(){document.documentElement.style.setProperty('--fs',fz+'px');localStorage.fontSize=fz}
window.fontSize=d=>{fz=Math.max(13,Math.min(24,fz+d));applyFont()}; applyFont();
window.speakPage=()=>{speechSynthesis.cancel();let u=new SpeechSynthesisUtterance(document.querySelector('main').innerText);u.lang='pt-BR';u.rate=.92;speechSynthesis.speak(u)};
window.openLibras=()=>alert('Modo Libras: o aplicativo possui botão dedicado para acesso à tradução em Libras. Para tradução automática completa em produção, recomenda-se integrar o VLibras oficial ao publicar o site.');

window.generatePDF=async()=>{
  // Give lazy atlas images time to decode before the browser print/PDF engine lays out pages.
  const images=[...document.images];
  await Promise.all(images.map(img=>{
    if(img.complete) return img.decode ? img.decode().catch(()=>{}) : Promise.resolve();
    return new Promise(r=>{img.onload=img.onerror=r});
  }));
  window.print();
};
