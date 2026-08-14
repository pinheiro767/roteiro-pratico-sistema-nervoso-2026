
// Imagens auxiliares de acessibilidade são opcionais.
// Se um arquivo não existir, o card inteiro é ocultado para não mostrar imagem quebrada.
document.querySelectorAll(".optional-support-image").forEach(img => {
  img.addEventListener("error", () => {
    const figure = img.closest("figure");
    if (figure) figure.remove();
    else img.remove();
  });
});
const $=(s,c=document)=>c.querySelector(s);
const $$=(s,c=document)=>[...c.querySelectorAll(s)];
let font=Number(localStorage.getItem("s6-font")||18);
let soundOn=localStorage.getItem("s6-sound")!=="0";
let volume=Number(localStorage.getItem("s6-volume")||.8);
let audio=null, ambienteAudio=null, deferredPrompt=null;

function placeholder(img){
  img.classList.add("missing");
  const name=img.dataset.name||img.getAttribute("src");
  img.removeAttribute("src");
  img.alt=`ESPAÇO PARA INSERIR: ${name}`;
  img.setAttribute("title",`Coloque ${name} em assets/img`);
}
$$(".required-image").forEach(img=>img.addEventListener("error",()=>placeholder(img)));

function applyFont(){document.documentElement.style.setProperty("--font",`${font}px`);localStorage.setItem("s6-font",font)}
function updateProgress(){
  const items=$$(".step-check"),done=items.filter(x=>x.checked).length,p=Math.round(done/items.length*100);
  $("#progressText").textContent=`${p}%`;$("#progressBar").style.width=`${p}%`;
  $("#conclusion").classList.toggle("hidden",p!==100);
}
function play(src, loop=false){
  if(!soundOn){alert("O som está desligado. Clique em Som desligado para ativar.");return}
  const isAmbiente = src.includes("ambiente");
  if(isAmbiente){
    if(ambienteAudio && !ambienteAudio.paused){ambienteAudio.pause();ambienteAudio.currentTime=0; ambienteAudio=null; setStatus("Som ambiente parado."); return}
    ambienteAudio=new Audio(src); ambienteAudio.loop=true; ambienteAudio.volume=volume;
    ambienteAudio.play().then(()=>setStatus("Som ambiente tocando. Clique novamente para parar.")).catch(()=>missingSound(src));
    return;
  }
  if(audio){audio.pause();audio.currentTime=0}
  audio=new Audio(src);audio.loop=loop;audio.volume=volume;
  audio.play().then(()=>setStatus(`Tocando: ${src.split('/').pop()}`)).catch(()=>missingSound(src));
}
function setStatus(text){const el=document.getElementById("audioStatus");if(el)el.textContent=text}
function missingSound(src){setStatus(`Arquivo não encontrado: ${src}`);alert(`Não encontrei ${src}. Confira o nome, a extensão .mp3 e a pasta assets/audio.`)}
function playClick(){if(soundOn){const c=new Audio("assets/audio/clique.mp3");c.volume=volume;c.play().catch(()=>{})}}
async function copyText(t,b){try{await navigator.clipboard.writeText(t);const old=b.textContent;b.textContent="Copiado!";setTimeout(()=>b.textContent=old,1200)}catch{alert("Selecione e copie manualmente.")}}

document.addEventListener("DOMContentLoaded",()=>{
  applyFont();
  if(localStorage.getItem("s6-dark")==="1")document.body.classList.add("dark");
  if(localStorage.getItem("s6-contrast")==="1")document.body.classList.add("contrast");
  $$(".step-check,.test-check").forEach((x,i)=>{x.checked=localStorage.getItem(`s6-check-${i}`)==="1";x.addEventListener("change",()=>{localStorage.setItem(`s6-check-${i}`,x.checked?"1":"0");updateProgress()})});
  updateProgress();

  $("#fontPlus").onclick=()=>{font=Math.min(28,font+2);applyFont()};
  $("#fontMinus").onclick=()=>{font=Math.max(14,font-2);applyFont()};
  $("#dark").onclick=()=>{document.body.classList.toggle("dark");localStorage.setItem("s6-dark",document.body.classList.contains("dark")?"1":"0")};
  $("#contrast").onclick=()=>{document.body.classList.toggle("contrast");localStorage.setItem("s6-contrast",document.body.classList.contains("contrast")?"1":"0")};
  $("#sound").textContent=soundOn?"Som ligado":"Som desligado";
  $("#sound").onclick=()=>{soundOn=!soundOn;localStorage.setItem("s6-sound",soundOn?"1":"0");$("#sound").textContent=soundOn?"Som ligado":"Som desligado";if(!soundOn){if(audio)audio.pause();if(ambienteAudio)ambienteAudio.pause()}};
  $("#volume").value=volume;$("#volume").oninput=e=>{volume=Number(e.target.value);localStorage.setItem("s6-volume",volume);if(audio)audio.volume=volume;if(ambienteAudio)ambienteAudio.volume=volume};
  $("#read").onclick=()=>{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance($("#main").innerText);u.lang="pt-BR";u.rate=.95;u.volume=volume;speechSynthesis.speak(u)};
  $("#stopRead").onclick=()=>speechSynthesis.cancel();

  $$("[data-scroll]").forEach(b=>b.onclick=()=>document.getElementById(b.dataset.scroll).scrollIntoView({behavior:"smooth"}));
  $$(".audio, .sound-test").forEach(b=>b.onclick=()=>{playClick();play(b.dataset.audio,b.dataset.loop==="true")});
  $$(".copy").forEach(b=>b.onclick=()=>copyText(b.dataset.copy||document.getElementById(b.dataset.target).value,b));
  $$(".game").forEach(b=>b.onclick=()=>{
    $$(".game").forEach(x=>x.classList.remove("selected"));
    b.classList.add("selected");
    const exampleLinks = {
      "Sudoku": "https://pinheiro767.github.io/sudoku-game-neuro/",
      "Caça-palavras": "https://pinheiro767.github.io/palavras-cruzadas-neuro/"
    };
    const exampleLink = exampleLinks[b.dataset.game]
      ? ` — <a href="${exampleLinks[b.dataset.game]}" target="_blank" rel="noopener noreferrer">abrir exemplo jogável</a>`
      : "";
    $("#selectedGame").innerHTML=`<strong>Jogo selecionado:</strong> ${b.dataset.game}${exampleLink}`;
  });


  const stopBtn=document.getElementById("stopAllSounds");
  if(stopBtn)stopBtn.onclick=()=>{if(audio){audio.pause();audio.currentTime=0}if(ambienteAudio){ambienteAudio.pause();ambienteAudio.currentTime=0}setStatus("Todos os sons foram parados.")};
  document.addEventListener("click",e=>{if(e.target.closest("button")&&!e.target.closest(".sound-test")&&!e.target.closest(".audio"))playClick()});

  $("#openLibras").onclick=()=>$("#librasModal").classList.remove("hidden");
  $("#closeLibras").onclick=()=>$("#librasModal").classList.add("hidden");
  $("#librasModal").onclick=e=>{if(e.target===$("#librasModal"))$("#librasModal").classList.add("hidden")};

  window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;$("#install").classList.remove("hidden")});
  $("#install").onclick=async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$("#install").classList.add("hidden")};

  if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js"));
});


/* RELATÓRIO DO DIA */
const REPORT_FIELDS = [
  "reportDate", "reportGroup", "reportGame", "reportParticipants",
  "reportIntroduction", "reportMethodology", "reportResults",
  "reportDifficulties", "reportConclusion"
];

function getSelectedGameName() {
  const selected = document.querySelector(".game.selected");
  return selected?.dataset.game || localStorage.getItem("s6-report-game") || "jogo educativo de Neuroanatomia";
}

function saveReportData(showMessage = false) {
  REPORT_FIELDS.forEach(id => {
    const element = document.getElementById(id);
    if (element) localStorage.setItem(`s6-${id}`, element.value);
  });
  if (showMessage) alert("Relatório salvo neste dispositivo.");
}

function loadReportData() {
  REPORT_FIELDS.forEach(id => {
    const element = document.getElementById(id);
    const saved = localStorage.getItem(`s6-${id}`);
    if (element && saved !== null) element.value = saved;
  });
  const date = document.getElementById("reportDate");
  if (date && !date.value) date.value = new Date().toISOString().slice(0, 10);
}

function robotFillReport() {
  const game = getSelectedGameName();
  const completed = [...document.querySelectorAll(".step-check")].filter(item => item.checked).length;
  const total = document.querySelectorAll(".step-check").length;
  const tested = [...document.querySelectorAll(".test-check")].filter(item => item.checked).length;

  document.getElementById("reportGame").value =
    document.getElementById("reportGame").value || game;

  document.getElementById("reportIntroduction").value =
`A atividade da Semana 6 teve como objetivo finalizar o ${game}, desenvolvido como recurso educativo em Neuroanatomia para o público com 60 anos ou mais. A proposta integrou conteúdo científico, tecnologia, acessibilidade e princípios de usabilidade, buscando produzir um aplicativo claro, interativo e adequado para uso em celular, tablet e computador.`;

  document.getElementById("reportMethodology").value =
`O trabalho foi desenvolvido em etapas. Inicialmente, o grupo revisou o tipo de jogo e organizou a estrutura do projeto com os arquivos index.html, style.css, app.js, manifest.json e sw.js. Em seguida, preparou e nomeou as imagens, inseriu os conteúdos educativos e utilizou inteligência artificial como apoio para criação e revisão do código. O grupo pesquisou áudios com licença adequada, organizou os arquivos na pasta assets/audio e utilizou um prompt para solicitar sua integração ao projeto. Também foram adicionados sons de ambiente, clique, acerto, erro, mudança de fase e vitória, com controle de volume e opção para desligar o áudio. Foram implementados recursos de acessibilidade, como aumento de fonte, alto contraste, modo escuro, leitura em voz alta, botões grandes e Libras. Ao final, o jogo foi testado em diferentes tamanhos de tela e quanto ao funcionamento offline.`;

  document.getElementById("reportResults").value =
`Ao término da atividade, ${completed} de ${total} etapas principais estavam marcadas como concluídas e ${tested} itens do checklist de testes haviam sido verificados. O grupo produziu uma versão funcional do ${game}, com interface visual, imagens educativas, recursos sonoros, acessibilidade e configuração de PWA. O aplicativo foi preparado para publicação no GitHub Pages e para instalação no dispositivo do usuário.`;

  document.getElementById("reportDifficulties").value =
`Durante o desenvolvimento, foram observadas dificuldades relacionadas à organização dos arquivos, aos nomes e caminhos das imagens e dos sons, à atualização do cache do service worker e à adaptação do layout para diferentes dispositivos. As soluções envolveram conferência dos nomes dos arquivos, revisão dos caminhos das pastas, atualização da versão do cache, testes no navegador e ajustes no HTML, CSS e JavaScript. Este texto deve ser revisado pelo grupo para registrar somente as dificuldades realmente encontradas.`;

  document.getElementById("reportConclusion").value =
`A atividade permitiu integrar conhecimentos de Neuroanatomia, produção de recursos educacionais e desenvolvimento de aplicações web. O ${game} apresenta potencial para apoiar ações educativas com o público 60+, desde que seja submetido a novos testes de clareza, acessibilidade, conteúdo e funcionamento. Como próximos passos, o grupo deverá corrigir eventuais falhas, revisar as informações científicas e preparar a apresentação e a testagem com os usuários.`;

  saveReportData(false);
  alert("O Robô Neuro criou uma versão inicial. Revise e adapte o texto antes de gerar o PDF.");
}

let reportImageItems = [];

function renderReportGallery() {
  const gallery = document.getElementById("reportGallery");
  if (!gallery) return;
  gallery.innerHTML = "";

  if (!reportImageItems.length) {
    gallery.innerHTML = '<p class="empty-gallery">Nenhuma imagem adicionada ao relatório.</p>';
    return;
  }

  reportImageItems.forEach((item, index) => {
    const figure = document.createElement("figure");
    figure.className = "report-figure";
    figure.innerHTML = `
      <div class="report-image-frame">
        <img src="${item.src}" alt="${item.caption || `Imagem ${index + 1}`}">
      </div>
      <figcaption>
        <strong>Figura ${index + 1}.</strong>
        <input class="caption-input" type="text" value="${item.caption || ""}" aria-label="Legenda da figura ${index + 1}">
      </figcaption>
    `;
    const captionInput = figure.querySelector(".caption-input");
    captionInput.addEventListener("input", event => {
      reportImageItems[index].caption = event.target.value;
    });
    gallery.appendChild(figure);
  });
}

function addUploadedReportImages(files) {
  [...files].forEach(file => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = event => {
      reportImageItems.push({
        src: event.target.result,
        caption: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ")
      });
      renderReportGallery();
    };
    reader.readAsDataURL(file);
  });
}

function addApplicationImages() {
  const game = getSelectedGameName();
  const gameFileMap = {
    "Memória": "memoria.png",
    "Sudoku": "sudoku.png",
    "Caça-palavras": "caca-palavras.png",
    "Quiz": "quiz.png",
    "Cartas": "cartas.png",
    "Bolha Neuro Shop": "bolhas.png"
  };

  const images = [
    ["assets/img/capa-semana6.png", "Tela de abertura da Semana 6"],
    ...(gameFileMap[game] ? [[`assets/img/${gameFileMap[game]}`, `Capa do jogo ${game}`]] : []),
    ["assets/img/1.png", "Abertura e apresentação da missão"],
    ["assets/img/2.png", "Organização das pastas do projeto"],
    ["assets/img/3.png", "Preparação e nomeação das imagens"],
    ["assets/img/4.png", "Criação do código com inteligência artificial"],
    ["assets/img/5.png", "Inserção dos recursos sonoros"],
    ["assets/img/6.png", "Acessibilidade e Libras"],
    ["assets/img/7.png", "Testes finais do jogo"]
  ];

  const existing = new Set(reportImageItems.map(item => item.src));
  images.forEach(([src, caption]) => {
    if (!existing.has(src)) reportImageItems.push({ src, caption });
  });
  renderReportGallery();
}

function prepareReportForPrint() {
  saveReportData(false);
  document.querySelectorAll(".caption-input").forEach((input, index) => {
    if (reportImageItems[index]) reportImageItems[index].caption = input.value;
  });
  document.getElementById("reportGeneratedAt").textContent =
    `Gerado em ${new Date().toLocaleString("pt-BR")}.`;
  document.title = "Relatorio-Semana-6-Neuro-Games";
  document.body.classList.add("printing-report");
  window.print();
  setTimeout(() => document.body.classList.remove("printing-report"), 800);
}

document.addEventListener("DOMContentLoaded", () => {
  loadReportData();

  REPORT_FIELDS.forEach(id => {
    const element = document.getElementById(id);
    if (element) element.addEventListener("input", () => saveReportData(false));
  });

  const robotButton = document.getElementById("robotFillReport");
  if (robotButton) robotButton.addEventListener("click", robotFillReport);

  const saveButton = document.getElementById("saveReport");
  if (saveButton) saveButton.addEventListener("click", () => saveReportData(true));

  const clearButton = document.getElementById("clearReport");
  if (clearButton) clearButton.addEventListener("click", () => {
    if (!confirm("Deseja apagar o texto do relatório?")) return;
    REPORT_FIELDS.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.value = id === "reportDate" ? new Date().toISOString().slice(0,10) : "";
        localStorage.removeItem(`s6-${id}`);
      }
    });
  });

  const imageInput = document.getElementById("reportImages");
  if (imageInput) imageInput.addEventListener("change", event => addUploadedReportImages(event.target.files));

  const appImagesButton = document.getElementById("addAppImages");
  if (appImagesButton) appImagesButton.addEventListener("click", addApplicationImages);

  const clearImagesButton = document.getElementById("clearImages");
  if (clearImagesButton) clearImagesButton.addEventListener("click", () => {
    reportImageItems = [];
    renderReportGallery();
    if (imageInput) imageInput.value = "";
  });

  const pdfButton = document.getElementById("generatePdf");
  if (pdfButton) pdfButton.addEventListener("click", prepareReportForPrint);

  document.querySelectorAll(".game").forEach(button => {
    button.addEventListener("click", () => {
      localStorage.setItem("s6-report-game", button.dataset.game);
      const gameField = document.getElementById("reportGame");
      if (gameField && !gameField.value) gameField.value = button.dataset.game;
    });
  });
});