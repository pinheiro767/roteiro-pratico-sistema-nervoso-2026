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

function sdb(){return new Promise((ok,no)=>{let r=indexedDB.open('NeuroEstruturas',1);r.onupgradeneeded=()=>r.result.createObjectStore('p',{keyPath:'id',autoIncrement:true});r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)})}
window.addSP=async(i,files)=>{let d=await sdb(),t=d.transaction('p','readwrite'),s=t.objectStore('p');for(let f of files)s.add({i:String(i),blob:f});t.oncomplete=renderSP}
async function renderSP(){let d=await sdb(),t=d.transaction('p'),r=t.objectStore('p').getAll();r.onsuccess=()=>{document.querySelectorAll('.structure-photos').forEach(e=>e.innerHTML='');r.result.forEach(p=>{let b=document.getElementById('sp-'+p.i);if(!b)return;let u=URL.createObjectURL(p.blob),e=document.createElement('div');e.className='structure-shot';e.innerHTML=`<img src="${u}" onclick="zoom(this.src)"><button onclick="delSP(${p.id})">✕</button>`;b.appendChild(e)})}}
window.delSP=async id=>{let d=await sdb(),t=d.transaction('p','readwrite');t.objectStore('p').delete(id);t.oncomplete=renderSP}
window.filterSP=q=>{q=q.toLocaleLowerCase('pt-BR');document.querySelectorAll('.structure-card').forEach(e=>e.style.display=e.dataset.structure.toLocaleLowerCase('pt-BR').includes(q)?'':'none')};renderSP();

/* ===== COMPLEMENTO DIDÁTICO: função + caso cotidiano + áudio por estrutura ===== */
const DIDATICO={
'Tálamo':['Estação de processamento e retransmissão de grande parte das informações sensitivas para o córtex.','De olhos fechados, alguém toca sua mão: vias sensitivas passam pelo tálamo antes da percepção cortical.'],
'Sulco hipotalâmico':['Marco anatômico da parede do III ventrículo que ajuda a separar as regiões talâmica e hipotalâmica.','No corte mediano, use o III ventrículo e este sulco para orientar tálamo e hipotálamo.'],
'Aderência intertalâmica':['União variável entre os tálamos; seu principal valor na prática é como referência anatômica.','Ao observar o III ventrículo, procure uma pequena ponte de tecido entre os tálamos; ela pode estar ausente.'],
'Hipotálamo':['Participa da homeostase, temperatura, fome, sede, respostas autonômicas e controle endócrino.','Depois de correr no calor, você sua e sente sede: o hipotálamo participa dessa regulação.'],
'Epitálamo':['Inclui a glândula pineal e participa da organização dos ritmos circadianos.','A alternância entre claro e escuro ajuda a sincronizar o ciclo sono-vigília.'],
'Fissura longitudinal':['Separa anatomicamente os hemisférios cerebrais direito e esquerdo.','Olhando o cérebro por cima, é a grande separação mediana entre os hemisférios.'],
'Sulco lateral':['Marco que separa o lobo temporal dos lobos frontal e parietal.','Achou o sulco lateral? Procure o lobo temporal logo abaixo.'],
'Sulco central':['Separa principalmente os lobos frontal e parietal e orienta as áreas motora e somestésica primárias.','Na frente está o giro pré-central; atrás, o giro pós-central.'],
'Lobo frontal':['Participa de planejamento, funções executivas, comportamento e controle motor voluntário.','Você organiza o que estudar primeiro e depois levanta a mão para responder.'],
'Giro pré-central':['Contém a área motora primária, importante para execução de movimentos voluntários.','Você decide levantar a mão: o córtex motor participa da execução desse movimento.'],
'Área de Broca':['Participa da rede de produção motora da linguagem no hemisfério dominante.','Uma lesão nessa rede pode deixar a fala pouco fluente mesmo quando a pessoa sabe o que quer dizer.'],
'Lobo temporal':['Participa de audição, memória e redes de linguagem, entre outras funções.','Você reconhece a voz de uma pessoa conhecida ao telefone.'],
'Giro temporal superior':['Relaciona-se a regiões auditivas e, no hemisfério dominante, a redes de linguagem.','Ao ouvir uma frase, regiões temporais superiores participam do processamento do som e da linguagem.'],
'Giro temporal transverso anterior':['Relaciona-se ao córtex auditivo primário.','O sinal da aula toca e a informação auditiva alcança o córtex.'],
'Área de Wernicke':['No modelo clássico, participa fortemente da compreensão da linguagem.','Uma lesão na rede pode fazer a pessoa ouvir a frase, mas ter dificuldade para compreender seu significado.'],
'Lobo parietal':['Participa do processamento somatossensitivo e da integração espacial.','De olhos fechados, você percebe onde sua mão foi tocada.'],
'Giro pós-central':['Contém a área somestésica primária, que processa informações sensitivas do corpo.','Um cubo de gelo toca sua mão e você identifica onde ocorreu o estímulo.'],
'Área gustativa primária':['Participa do processamento cortical do paladar.','Ao provar limão, sinais gustativos chegam a redes corticais que permitem perceber o sabor.'],
'Lobo occipital':['Principal lobo relacionado ao processamento visual cortical.','Você olha uma flor e o córtex occipital participa do processamento da imagem.'],
'Ínsula':['Participa de redes gustativas, viscerais e da percepção de estados internos do corpo.','O sabor de um alimento e sensações internas associadas envolvem redes que incluem a ínsula.'],
'Corpo caloso':['Grande comissura de substância branca que conecta os dois hemisférios.','Pense nele como uma grande ponte de fibras entre direita e esquerda.'],
'Sulco calcarino':['Marco do lobo occipital; o córtex visual primário situa-se em suas margens.','Ao localizar o sulco calcarino, você encontra uma referência essencial da área visual primária.'],
'Giro do cíngulo':['Participa de redes de emoção, motivação, atenção e comportamento dirigido a objetivos.','Você mantém a atenção em uma tarefa importante apesar das distrações.'],
'Úncus':['Região medial do lobo temporal relacionada a circuitos olfatórios e límbicos.','Um perfume conhecido pode despertar rapidamente uma lembrança.'],
'Giro para-hipocampal':['Participa de redes de memória e contexto espacial.','Você entra na universidade e reconhece o caminho até o laboratório.'],
'Bulbo olfatório':['Recebe as fibras olfatórias provenientes da cavidade nasal.','Você sente cheiro de café antes de vê-lo.'],
'Trato olfatório':['Conduz informação olfatória a partir do bulbo para regiões encefálicas.','Depois de o odor chegar ao bulbo, o sinal segue pelo trato olfatório.'],
'Raiz ventral do nervo espinal':['Conduz fibras motoras que saem da medula em direção aos efetores.','Em uma resposta motora, o comando deixa a medula pela raiz ventral.'],
'Raiz dorsal do nervo espinal':['Conduz fibras sensitivas em direção à medula.','Ao pisar em algo pontiagudo, sinais sensitivos entram pela raiz dorsal.'],
'Gânglio dorsal':['Contém corpos celulares de neurônios sensitivos e aparece como uma dilatação da raiz dorsal.','Na peça, procure a dilatação: ela ajuda a identificar a raiz dorsal.'],
'Cone medular':['Extremidade inferior afilada da medula espinal; no adulto termina geralmente em torno de L1–L2.','Ajuda a entender por que a punção lombar é realizada abaixo do término da medula.'],
'Cauda equina':['Conjunto de raízes lombares, sacrais e coccígea que descem abaixo do cone medular.','Compressão importante dessas raízes pode causar alterações motoras, sensitivas e esfincterianas.'],
'Filamento terminal':['Fino prolongamento de pia-máter que segue inferiormente a partir do cone medular e auxilia na fixação longitudinal.','Na peça, procure um filamento fino central entre as raízes da cauda equina.'],
'Oliva':['Elevação ovalada na face anterolateral do bulbo, produzida principalmente pelo núcleo olivar inferior; participa de circuitos importantes para aprendizagem e coordenação motora por suas conexões com o cerebelo.','Ao aprender um movimento novo e corrigir erros de execução, circuitos olivocerebelares participam desse ajuste. Na peça, procure a oliva lateralmente à pirâmide.'],
'Fascículo grácil':['Via ascendente do funículo posterior que conduz principalmente tato discriminativo, vibração e propriocepção consciente do tronco inferior e membro inferior, abaixo de T6.','De olhos fechados, perceber a posição do pé e discriminar um toque fino na perna depende de vias que incluem o fascículo grácil.'],
'Fascículo cuneiforme':['Via ascendente do funículo posterior presente a partir de aproximadamente T6, conduzindo tato discriminativo, vibração e propriocepção consciente do tronco superior e membro superior.','De olhos fechados, perceber a posição dos dedos da mão depende de vias que incluem o fascículo cuneiforme.'],
'Decussação das pirâmides':['Região caudal do bulbo onde a maior parte das fibras do trato corticoespinal cruza para o lado oposto.','Quando o córtex motor esquerdo comanda muitos movimentos do lado direito do corpo, esse controle contralateral se relaciona ao cruzamento das fibras na decussação das pirâmides.'],
'Nervo olfatório (I)':['Olfato. É sensitivo.','Você entra em casa e sente cheiro de café.'],
'Nervo óptico (II)':['Visão. É sensitivo.','Você lê uma mensagem no celular.'],
'Nervo oculomotor (III)':['Move a maior parte dos músculos extrínsecos do olho, eleva a pálpebra e participa da constrição pupilar.','Ao entrar em ambiente muito iluminado, a pupila diminui.'],
'Nervo troclear (IV)':['Inerva o músculo oblíquo superior do olho.','Uma lesão pode produzir visão dupla em determinadas posições do olhar.'],
'Nervo trigêmeo (V)':['Principal sensibilidade da face e componente motor da mastigação.','Você mastiga uma maçã e sente uma gota escorrendo pela bochecha.'],
'Nervo abducente (VI)':['Inerva o músculo reto lateral e participa da abdução do olho.','Sem virar a cabeça, você olha para o lado.'],
'Nervo facial (VII)':['Move músculos da expressão facial e participa da gustação dos dois terços anteriores da língua, além de outras funções.','Você prova chocolate e sorri.'],
'Nervo vestibulococlear (VIII)':['Audição e equilíbrio. É sensitivo.','Você ouve música e caminha mantendo o equilíbrio.'],
'Nervo glossofaríngeo (IX)':['Participa da gustação do terço posterior da língua e de funções sensitivas e motoras da faringe, entre outras.','Um estímulo na região posterior da língua e da faringe envolve este nervo.'],
'Nervo vago (X)':['Participa de funções da faringe e laringe e da inervação parassimpática de vísceras torácicas e abdominais.','Depois do almoço, várias funções digestivas são reguladas automaticamente.'],
'Nervo acessório (XI)':['Inerva principalmente esternocleidomastóideo e trapézio.','Eleve os ombros contra resistência: esse teste avalia principalmente o nervo acessório.'],
'Nervo hipoglosso (XII)':['Move a maior parte dos músculos da língua.','Coloque a língua para fora: esse movimento avalia principalmente o nervo hipoglosso.']
};
function norm(s){return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim()}
function findInfo(name){let n=norm(name); for(const [k,v] of Object.entries(DIDATICO)){let q=norm(k); if(n===q||n.includes(q)||q.includes(n)) return v} return null}
document.querySelectorAll('.structure-card').forEach(card=>{const name=card.dataset.structure||card.querySelector('h3')?.textContent||'';const info=findInfo(name);if(!info)return;const box=document.createElement('div');box.className='didactic';box.innerHTML=`<div><b>⚙️ Função fácil</b><p>${info[0]}</p></div><div><b>🩺 Caso do cotidiano</b><p>${info[1]}</p></div><button type="button" class="speak-structure">🔊 Ouvir explicação</button>`;card.querySelector('h3').after(box);box.querySelector('button').onclick=()=>{speechSynthesis.cancel();let u=new SpeechSynthesisUtterance(`${name}. Função: ${info[0]} Situação do cotidiano: ${info[1]}`);u.lang='pt-BR';u.rate=.92;speechSynthesis.speak(u)}});

/* PDF/IMPRESSÃO: expande integralmente as anotações antes de imprimir. */
const _oldGeneratePDF=window.generatePDF;
window.generatePDF=async()=>{document.body.classList.add('printing-notes');document.querySelectorAll('textarea').forEach(t=>{t.dataset.oldHeight=t.style.height||'';t.style.height='auto';t.style.height=(t.scrollHeight+8)+'px'});const images=[...document.images];await Promise.all(images.map(img=>img.complete?(img.decode?img.decode().catch(()=>{}):Promise.resolve()):new Promise(r=>{img.onload=img.onerror=r})));window.print()};
window.addEventListener('afterprint',()=>{document.body.classList.remove('printing-notes');document.querySelectorAll('textarea').forEach(t=>{t.style.height=t.dataset.oldHeight||'';delete t.dataset.oldHeight})});
