// QUIZ DA REDAÇÃO — front-end
// Todas as perguntas e o gabarito ficam no servidor (Flask).
// Este arquivo só cuida de exibição, áudio e chamadas fetch à API.

// -------------------------------------------------------------------
// PERSONAGEM DO APRESENTADOR — desenhado 100% em <canvas> (sem imagens).
// A mesma função desenha o mascote da tela inicial e o apresentador da
// tela de resultado, cada um com sua pose/expressão e uma animação
// contínua (respiração, piscar de olhos, antenas balançando).
// -------------------------------------------------------------------
const HOST_COLORS = {
  head: '#eef0fb',
  headShade: '#c4c9e8',
  headOutline: '#33334f',
  suit: '#e0293f',
  suitDark: '#9c1730',
  suitShade: '#bd2138',
  glove: '#fff9ec',
  gloveOutline: '#c9bfa0',
  legs: '#22222e',
  shoes: '#ffcf4d',
  shoesDark: '#d9a730',
  belt: '#ffcf4d',
  antenna: '#33334f',
  ballNavy: '#33334f',
  ballGold: '#ffcf4d',
  screenFace: '#2b2b45',
};

function hostRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function hostDrawGlove(ctx, x, y) {
  ctx.fillStyle = HOST_COLORS.glove;
  ctx.strokeStyle = HOST_COLORS.gloveOutline;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function hostDrawArm(ctx, x1, y1, x2, y2, width) {
  ctx.strokeStyle = HOST_COLORS.suit;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function hostDrawFace(ctx, pose, blink) {
  ctx.fillStyle = '#fbfcff';
  hostRoundRect(ctx, 88, 66, 64, 50, 10);
  ctx.fill();
  ctx.strokeStyle = HOST_COLORS.headOutline;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.strokeStyle = HOST_COLORS.screenFace;
  ctx.fillStyle = HOST_COLORS.screenFace;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const cx = 120, cy = 90;

  if (pose === 'cheer') {
    ctx.beginPath();
    ctx.moveTo(cx - 24, cy - 6); ctx.lineTo(cx - 16, cy - 13); ctx.lineTo(cx - 8, cy - 6);
    ctx.moveTo(cx + 8, cy - 6); ctx.lineTo(cx + 16, cy - 13); ctx.lineTo(cx + 24, cy - 6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 20, cy + 6);
    ctx.quadraticCurveTo(cx - 4, cy + 22, cx + 22, cy + 2);
    ctx.quadraticCurveTo(cx + 4, cy + 14, cx - 20, cy + 6);
    ctx.fill();
  } else if (pose === 'talk') {
    if (blink) {
      ctx.beginPath();
      ctx.moveTo(cx - 22, cy - 4); ctx.lineTo(cx - 8, cy - 4);
      ctx.moveTo(cx + 8, cy - 4); ctx.lineTo(cx + 22, cy - 4);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(cx - 15, cy - 4, 4, 0, Math.PI * 2);
      ctx.arc(cx + 15, cy - 4, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.ellipse(cx, cy + 14, 10, 7, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (pose === 'oops') {
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 25, cy - 20); ctx.lineTo(cx - 7, cy - 13);
    ctx.moveTo(cx + 25, cy - 20); ctx.lineTo(cx + 7, cy - 13);
    ctx.stroke();
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx - 14, cy - 2, 3.6, 0, Math.PI * 2);
    ctx.arc(cx + 14, cy - 2, 3.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx, cy + 15, 5.5, 6.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,140,140,0.55)';
    ctx.beginPath(); ctx.ellipse(cx - 22, cy + 10, 5, 3.2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + 22, cy + 10, 5, 3.2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#8fd6ff';
    ctx.beginPath();
    ctx.moveTo(cx + 30, cy - 20);
    ctx.quadraticCurveTo(cx + 36, cy - 8, cx + 30, cy - 3);
    ctx.quadraticCurveTo(cx + 24, cy - 8, cx + 30, cy - 20);
    ctx.fill();
  } else {
    if (blink) {
      ctx.beginPath();
      ctx.moveTo(cx - 22, cy - 4); ctx.lineTo(cx - 8, cy - 4);
      ctx.moveTo(cx + 8, cy - 4); ctx.lineTo(cx + 22, cy - 4);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(cx - 15, cy - 4, 4.5, 0, Math.PI * 2);
      ctx.arc(cx + 15, cy - 4, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.moveTo(cx - 14, cy + 12);
    ctx.quadraticCurveTo(cx, cy + 20, cx + 14, cy + 12);
    ctx.stroke();
  }
}

function drawHostFigure(ctx, pose, t) {
  const bob = Math.sin(t * 2) * 3;
  const armSwing = Math.sin(t * 2.4) * 4;
  const antennaSwing = Math.sin(t * 1.6) * 6;
  const blink = (t % 3.2) < 0.12;

  ctx.save();
  ctx.translate(0, bob);

  ctx.fillStyle = HOST_COLORS.suitDark;
  ctx.beginPath();
  ctx.moveTo(96, 188);
  ctx.quadraticCurveTo(78, 222, 68 + armSwing * 0.3, 258);
  ctx.quadraticCurveTo(90, 230, 101, 200);
  ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(134, 188);
  ctx.quadraticCurveTo(152, 222, 162 - armSwing * 0.3, 258);
  ctx.quadraticCurveTo(140, 230, 129, 200);
  ctx.closePath(); ctx.fill();

  ctx.fillStyle = HOST_COLORS.legs;
  hostRoundRect(ctx, 96, 203, 20, 64, 8); ctx.fill();
  hostRoundRect(ctx, 114, 203, 20, 64, 8); ctx.fill();

  ctx.fillStyle = HOST_COLORS.shoes;
  ctx.strokeStyle = HOST_COLORS.shoesDark;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(101, 266, 17, 10, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(129, 266, 17, 10, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

  ctx.fillStyle = HOST_COLORS.suit;
  hostRoundRect(ctx, 80, 136, 80, 72, 20); ctx.fill();
  ctx.fillStyle = HOST_COLORS.suitShade;
  ctx.beginPath();
  ctx.moveTo(142, 136); ctx.quadraticCurveTo(160, 170, 150, 208); ctx.lineTo(132, 208);
  ctx.quadraticCurveTo(142, 170, 130, 136); ctx.closePath(); ctx.fill();

  ctx.fillStyle = HOST_COLORS.belt;
  ctx.fillRect(86, 194, 68, 9);
  ctx.fillStyle = HOST_COLORS.suitDark;
  ctx.fillRect(111, 192, 18, 13);

  ctx.fillStyle = '#fffdf6';
  ctx.beginPath();
  ctx.moveTo(107, 136); ctx.lineTo(120, 150); ctx.lineTo(133, 136); ctx.closePath(); ctx.fill();

  if (pose === 'cheer') {
    hostDrawArm(ctx, 86, 148, 58, 92 + armSwing * 0.3, 19);
    hostDrawArm(ctx, 134, 148, 162, 92 - armSwing * 0.3, 19);
    hostDrawGlove(ctx, 56, 86 + armSwing * 0.3);
    hostDrawGlove(ctx, 164, 86 - armSwing * 0.3);
  } else if (pose === 'talk') {
    hostDrawArm(ctx, 86, 150, 64, 182, 17);
    hostDrawGlove(ctx, 62, 186);
    hostDrawArm(ctx, 134, 150, 150, 104 + armSwing, 17);
    hostDrawGlove(ctx, 151, 98 + armSwing);
  } else if (pose === 'oops') {
    hostDrawArm(ctx, 86, 150, 100, 168, 17);
    hostDrawGlove(ctx, 102, 172);
    hostDrawArm(ctx, 134, 148, 148, 100, 17);
    hostDrawGlove(ctx, 150, 92);
  } else {
    hostDrawArm(ctx, 86, 152, 70 + armSwing * 0.4, 188, 17);
    hostDrawArm(ctx, 134, 152, 150 - armSwing * 0.4, 188, 17);
    hostDrawGlove(ctx, 68 + armSwing * 0.4, 192);
    hostDrawGlove(ctx, 152 - armSwing * 0.4, 192);
  }

  ctx.fillStyle = HOST_COLORS.headShade;
  ctx.fillRect(108, 116, 24, 22);

  ctx.strokeStyle = HOST_COLORS.antenna;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(106, 58); ctx.lineTo(92 + antennaSwing * 0.3, 22); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(134, 58); ctx.lineTo(148 - antennaSwing * 0.3, 22); ctx.stroke();
  ctx.fillStyle = HOST_COLORS.ballNavy;
  ctx.beginPath(); ctx.arc(92 + antennaSwing * 0.3, 20, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = HOST_COLORS.ballGold;
  ctx.beginPath(); ctx.arc(148 - antennaSwing * 0.3, 20, 6, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = HOST_COLORS.head;
  ctx.beginPath();
  ctx.moveTo(76, 62);
  ctx.quadraticCurveTo(74, 56, 82, 55);
  ctx.lineTo(158, 55);
  ctx.quadraticCurveTo(166, 56, 164, 62);
  ctx.lineTo(150, 120);
  ctx.quadraticCurveTo(148, 126, 142, 126);
  ctx.lineTo(98, 126);
  ctx.quadraticCurveTo(92, 126, 90, 120);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = HOST_COLORS.headOutline;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.fillStyle = HOST_COLORS.headShade;
  ctx.beginPath();
  ctx.moveTo(164, 62); ctx.lineTo(150, 120); ctx.quadraticCurveTo(148, 126, 142, 126);
  ctx.lineTo(150, 126); ctx.lineTo(166, 63); ctx.closePath(); ctx.fill();

  hostDrawFace(ctx, pose, blink);

  ctx.restore();
}

// Cada mascote (canvas) tem sua própria animação em loop e sua própria
// pose atual, para que a tela inicial e a tela de resultado possam
// mostrar expressões diferentes ao mesmo tempo.
function createHostAnimator(canvas) {
  const ctx = canvas.getContext('2d');
  const BASE_W = 230, BASE_H = 300;
  let pose = 'idle';
  let rafId = null;
  const start = performance.now();

  function frame(now) {
    const t = (now - start) / 1000;
    const scale = Math.min(canvas.width / BASE_W, canvas.height / BASE_H);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate((canvas.width - BASE_W * scale) / 2, (canvas.height - BASE_H * scale) / 2);
    ctx.scale(scale, scale);
    drawHostFigure(ctx, pose, t);
    ctx.restore();
    rafId = requestAnimationFrame(frame);
  }

  return {
    setPose(p) { pose = p; },
    start() { if (!rafId) rafId = requestAnimationFrame(frame); },
    stop() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } },
  };
}

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
const ALL_AUDIO = [audioTheme, audioTvtime, audioCorrect, audioWrong];

// apresentador desenhado em canvas: um para a tela de resultado, outro
// (menor) como mascote animado da tela inicial
const resultHostAnim = createHostAnimator(document.getElementById('result-host'));
const introMascotAnim = createHostAnimator(document.getElementById('intro-mascot'));
introMascotAnim.setPose('talk');

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

  // liga/desliga as animações de canvas conforme a tela ativa, para
  // não gastar CPU desenhando mascotes que não estão visíveis
  if (el === screenIntro) { introMascotAnim.start(); } else { introMascotAnim.stop(); }
  if (el === screenResult) { resultHostAnim.start(); } else { resultHostAnim.stop(); }
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
    resultHostAnim.setPose('cheer');
  } else if (ratio >= 0.7) {
    msg = 'MUITO BOM! Você manja bem das regras da redação. Só faltam alguns detalhes!';
    resultHostAnim.setPose('talk');
  } else if (ratio >= 0.4) {
    msg = 'RAZOÁVEL! Dá pra melhorar — revise coesão, coerência e repertório!';
    resultHostAnim.setPose('idle');
  } else {
    msg = 'HORA DE ESTUDAR! Volte para a plateia, assista de novo e tente mais uma vez!';
    resultHostAnim.setPose('oops');
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

// estado inicial: foco no botão "COMEÇAR" da tela de intro,
// e o mascote da tela inicial já começa animado
resetFocus();
introMascotAnim.start();
