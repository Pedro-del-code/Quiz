// QUIZ DA REDAÇÃO — front-end
// Todas as perguntas e o gabarito ficam no servidor (Flask).
// Este arquivo só cuida de exibição, áudio e chamadas fetch à API.

const screenIntro = document.getElementById('screen-intro');
const screenQuiz = document.getElementById('screen-quiz');
const screenResult = document.getElementById('screen-result');
const screenCredits = document.getElementById('screen-credits');
const questionText = document.getElementById('question-text');
const optionsDiv = document.getElementById('options');
const progressLabel = document.getElementById('quiz-progress-label');
const scoreLabel = document.getElementById('quiz-score-label');
const feedbackBanner = document.getElementById('feedback-banner');
const progressDots = document.getElementById('progress-dots');
const resultScore = document.getElementById('result-score');
const resultMsg = document.getElementById('result-msg');
const audioTheme = document.getElementById('audio-theme');
const audioTvtime = document.getElementById('audio-tvtime');
const audioCorrect = document.getElementById('audio-correct');
const audioWrong = document.getElementById('audio-wrong');
const muteBtn = document.getElementById('mute-btn');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const appEl = document.getElementById('app');
const resultHost = document.getElementById('result-host');
const ALL_AUDIO = [audioTheme, audioTvtime, audioCorrect, audioWrong];

function playSfx(audioEl) {
  if (!audioEl) return;
  audioEl.currentTime = 0;
  audioEl.play().catch(() => {});
}

let answered = false;
let total = TOTAL_QUESTIONS;
let progress = 1;
let score = 0;

// -------------------------------------------------------------------
// Tela cheia (útil ao apresentar em Smart TV / TV conectada a um PC)
// -------------------------------------------------------------------
fullscreenBtn.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    appEl.requestFullscreen?.().catch(() => {});
  } else {
    document.exitFullscreen?.();
  }
});

// -------------------------------------------------------------------
// Navegação por controle remoto / teclado (setas + Enter/OK)
// Funciona em Smart TVs e navegadores em TV Box que mapeiam o
// controle remoto para as teclas de seta e Enter.
// -------------------------------------------------------------------
let focusIndex = 0;

function focusableElements() {
  const activeScreen = document.querySelector('.screen.active');
  if (!activeScreen) return [];
  return Array.from(
    activeScreen.querySelectorAll('.option-bar:not(.disabled), .btn-start')
  );
}

function applyFocus() {
  const els = focusableElements();
  els.forEach((el, i) => el.classList.toggle('focused', i === focusIndex));
  if (els[focusIndex]) {
    els[focusIndex].scrollIntoView({ block: 'nearest' });
  }
}

function moveFocus(delta) {
  const els = focusableElements();
  if (els.length === 0) return;
  focusIndex = (focusIndex + delta + els.length) % els.length;
  applyFocus();
}

function activateFocused() {
  const els = focusableElements();
  if (els[focusIndex]) els[focusIndex].click();
}

document.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowDown':
    case 'ArrowRight':
      e.preventDefault();
      moveFocus(1);
      break;
    case 'ArrowUp':
    case 'ArrowLeft':
      e.preventDefault();
      moveFocus(-1);
      break;
    case 'Enter':
    case ' ':
      e.preventDefault();
      activateFocused();
      break;
  }
});

function resetFocus() {
  focusIndex = 0;
  applyFocus();
}

// Fundo da tela de perguntas = mesmo cenário de palco da tela de resultado
// (a "moldura de TV" com a pergunta é desenhada em CSS, ver #tv-frame)
// Fundo da tela de perguntas = a arte da "tela azul": o quiz-frame usa
// essa imagem como fundo, nas proporções exatas em que a caixa branca
// e a área azul foram desenhadas, e o conteúdo HTML é encaixado por
// cima alinhado a essas mesmas proporções (ver #quiz-content/#options
// no CSS, medidos em % a partir da arte original).
document.getElementById('tv-frame').style.backgroundImage = `url('${BG_QUESTION}')`;
document.getElementById('screen-result').style.backgroundImage = `url('${BG_STAGE}')`;

let muted = false;
muteBtn.addEventListener('click', () => {
  muted = !muted;
  ALL_AUDIO.forEach((a) => { a.muted = muted; });
  muteBtn.textContent = muted ? '🔇' : '🔊';
});

function showScreen(el) {
  [screenIntro, screenQuiz, screenResult, screenCredits].forEach((s) => s.classList.remove('active'));
  el.classList.add('active');
  resetFocus();
}

function buildDots() {
  progressDots.innerHTML = '';
  for (let i = 0; i < total; i++) {
    const d = document.createElement('div');
    d.className = 'dot' + (i < progress - 1 ? ' filled' : '');
    progressDots.appendChild(d);
  }
}

function renderQuestion(questionObj) {
  answered = false;
  questionText.textContent = questionObj.q;
  progressLabel.textContent = `PERGUNTA ${progress}/${total}`;
  scoreLabel.textContent = `PONTOS: ${score}`;
  buildDots();

  optionsDiv.innerHTML = '';
  questionObj.options.forEach((opt, idx) => {
    const btn = document.createElement('div');
    btn.className = 'option-bar';
    btn.textContent = opt;
    btn.addEventListener('click', () => selectOption(idx, btn));
    optionsDiv.appendChild(btn);
  });
  resetFocus();
}

function flashBanner(text, cls) {
  feedbackBanner.textContent = text;
  feedbackBanner.className = '';
  void feedbackBanner.offsetWidth; // reinicia a animação
  feedbackBanner.classList.add(cls, 'show');
}

async function startQuiz() {
  audioTvtime.currentTime = 0;
  audioTvtime.play().catch(() => {});
  audioTheme.volume = 0.55;
  audioTheme.play().catch(() => {});

  const res = await fetch('/api/start');
  const data = await res.json();

  progress = data.progress;
  total = data.total;
  score = data.score;

  showScreen(screenQuiz);
  renderQuestion(data.question);
}

async function selectOption(idx, btnEl) {
  if (answered) return;
  answered = true;

  const allBtns = optionsDiv.querySelectorAll('.option-bar');
  allBtns.forEach((b) => b.classList.add('disabled'));

  const res = await fetch('/api/answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ option: idx }),
  });
  const data = await res.json();

  score = data.score;

  if (data.correct) {
    btnEl.classList.add('correct');
    flashBanner('CORRETO! ✔', 'fb-correct');
    playSfx(audioCorrect);
  } else {
    btnEl.classList.add('wrong');
    allBtns[data.correct_index].classList.add('correct');
    flashBanner('ERROU!', 'fb-wrong');
    playSfx(audioWrong);
  }

  setTimeout(() => {
    if (data.finished) {
      showResult(score, total);
    } else {
      progress = data.progress;
      total = data.total;
      renderQuestion(data.next_question);
    }
  }, 1600);
}

function showResult(finalScore, totalQuestions) {
  showScreen(screenResult);
  resultScore.textContent = `${finalScore}/${totalQuestions}`;

  let msg;
  const ratio = finalScore / totalQuestions;
  if (ratio >= 0.9) {
    msg = 'IMPECÁVEL! Redator(a) nota mil, digno(a) do próprio quadro de honra da TV!';
    resultHost.src = HOST_CHEER;
  } else if (ratio >= 0.7) {
    msg = 'MUITO BOM! Você manja bem das regras da redação. Só faltam alguns detalhes!';
    resultHost.src = HOST_TALK;
  } else if (ratio >= 0.4) {
    msg = 'RAZOÁVEL! Dá pra melhorar — revise coesão, coerência e repertório!';
    resultHost.src = HOST_IDLE;
  } else {
    msg = 'HORA DE ESTUDAR! Volte para a plateia, assista de novo e tente mais uma vez!';
    resultHost.src = HOST_OOPS;
  }
  resultMsg.textContent = msg;
  resetFocus();
}

document.getElementById('btn-start').addEventListener('click', startQuiz);
document.getElementById('btn-retry').addEventListener('click', startQuiz);

// -------------------------------------------------------------------
// Tela de créditos: rolagem estilo "fim de filme" com o nome do autor
// e do grupo. Reinicia a animação toda vez que a tela é aberta.
// -------------------------------------------------------------------
const creditsTrack = document.getElementById('credits-track');

function showCredits() {
  showScreen(screenCredits);
  // força reinício da animação CSS (senão ela só roda uma vez e para)
  creditsTrack.style.animation = 'none';
  void creditsTrack.offsetWidth; // reflow
  creditsTrack.style.animation = '';
}

document.getElementById('btn-credits').addEventListener('click', showCredits);
document.getElementById('btn-credits-back').addEventListener('click', () => showScreen(screenIntro));

// estado inicial: foco no botão "COMEÇAR" da tela de intro
resetFocus();
