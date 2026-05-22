// =============================================================
// SISTEMA IMÓVEL CERTO™ · APP.JS
// Quiz one-per-screen · Premium animations · Cinematic loading
// =============================================================

let REGIONS = [];
let currentQ = 0;
let answers = {};
let bodyScrollY = 0;

// Load regions
fetch('regions.json')
  .then(r => r.json())
  .then(data => { REGIONS = data; })
  .catch(err => console.error('[Sistema] Falha ao carregar regions.json:', err));

// =============================================================
// HERO SLIDESHOW — cinematic crossfade
// =============================================================
(function heroSlideshow(){
  const stage = document.getElementById('heroStage');
  if (!stage) return;
  const slides = stage.querySelectorAll('.hero-slide');
  if (slides.length < 2) return;
  let i = 0;
  setInterval(() => {
    slides[i].classList.remove('active');
    i = (i + 1) % slides.length;
    slides[i].classList.add('active');
  }, 6500);
})();

// =============================================================
// NAV — scroll state
// =============================================================
(function navScroll(){
  const nav = document.getElementById('nav');
  if (!nav) return;
  const onScroll = () => {
    if (window.scrollY > 60) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();
})();

// =============================================================
// REVEAL on scroll
// =============================================================
(function revealOnScroll(){
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || !els.length) {
    els.forEach(el => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, {threshold: 0.12, rootMargin: '0px 0px -60px 0px'});
  els.forEach(el => io.observe(el));
})();

// =============================================================
// QUESTIONS — 5 perguntas, premium UX
// =============================================================
const QUESTIONS = [
  {
    key: 'purpose',
    msg: 'Estamos entendendo seu objetivo',
    title: 'O que você busca?',
    sub: 'Vamos começar pelo essencial.',
    type: 'options',
    cols: 2,
    options: [
      { value: 'live', icon: '🏡', text: 'Morar com a família', sub: 'Mudança definitiva ou parcial' },
      { value: 'invest', icon: '📈', text: 'Investir e gerar renda', sub: 'Renda passiva em dólar' },
      { value: 'vacation', icon: '🌴', text: 'Casa de férias', sub: 'Usar por temporada' },
      { value: 'protection', icon: '🛡️', text: 'Proteger patrimônio', sub: 'Blindagem em moeda forte' }
    ]
  },
  {
    key: 'lifestyle',
    msg: 'Analisando seu estilo de vida',
    title: 'Qual ambiente combina com você?',
    sub: 'Escolha o cenário que mais ressoa com a vida que você quer.',
    type: 'lifestyle',
    options: [
      { value: 'urban', bg: 'urban', text: 'Urbano vibrante', sub: 'Brickell, downtown' },
      { value: 'beach', bg: 'beach', text: 'Pé na areia', sub: 'Sunny Isles, Surfside' },
      { value: 'family', bg: 'family', text: 'Família calma', sub: 'Aventura, Coral Gables' },
      { value: 'luxury', bg: 'luxury', text: 'Luxo discreto', sub: 'Bal Harbour, Pinecrest' },
      { value: 'calm', bg: 'calm', text: 'Vida tranquila', sub: 'Tampa, Doral' }
    ]
  },
  {
    key: 'budget',
    msg: 'Calculando faixas compatíveis',
    title: 'Qual o ticket aproximado?',
    sub: 'Preço do imóvel, em dólar. O sistema vai filtrar regiões compatíveis.',
    type: 'options',
    cols: 2,
    options: [
      { value: '150-300', icon: '$', text: 'US$ 150-300 mil', sub: 'Studios e 1 quarto Edgewater, Aventura outskirts' },
      { value: '300-500', icon: '$$', text: 'US$ 300-500 mil', sub: '1 quarto Aventura, Sunny Isles, Brickell' },
      { value: '500-1000', icon: '$$$', text: 'US$ 500K-1M', sub: '2 quartos prime, Brickell vista, Sunny Isles' },
      { value: '1000+', icon: '$$$$', text: 'Acima de US$ 1M', sub: 'Luxury alto padrão · Bal Harbour, penthouse' }
    ]
  },
  {
    key: 'kids',
    msg: 'Avaliando perfil familiar',
    title: 'Como é sua família?',
    sub: 'Isso muda muito a recomendação de região e escola.',
    type: 'options',
    cols: 2,
    options: [
      { value: 'yes_small', icon: '👶', text: 'Tenho filhos pequenos', sub: '0-12 anos · school zone importa' },
      { value: 'yes_teen', icon: '🎓', text: 'Tenho filhos adolescentes', sub: '13-18 anos · ensino médio top' },
      { value: 'no', icon: '🥂', text: 'Sem filhos em casa', sub: 'Casal, single ou filhos adultos' },
      { value: 'planning', icon: '🌱', text: 'Planejando ter', sub: 'Pensando no futuro família' }
    ]
  },
  {
    key: 'timeline',
    msg: 'Cruzando regiões compatíveis',
    title: 'Quando você pretende decidir?',
    sub: 'Última pergunta. Em seguida o sistema processa seu match.',
    type: 'options',
    cols: 2,
    options: [
      { value: 'now', icon: '🚀', text: 'Estou pronto agora', sub: 'Decisão nos próximos 90 dias' },
      { value: '6mo', icon: '📅', text: 'Próximos 6 meses', sub: 'Organizando estrutura financeira' },
      { value: '12mo', icon: '⏳', text: 'Próximos 12 meses', sub: 'Planejando com calma' },
      { value: 'research', icon: '🔍', text: 'Apenas pesquisando', sub: 'Quero entender opções' }
    ]
  }
];

// =============================================================
// FLOW CONTROL
// =============================================================
function startFlow() {
  // Bloqueia scroll do body, abre quiz fullscreen
  bodyScrollY = window.scrollY;
  document.body.style.position = 'fixed';
  document.body.style.top = `-${bodyScrollY}px`;
  document.body.style.width = '100%';

  document.getElementById('quiz').setAttribute('aria-hidden', 'false');
  document.querySelector('.quiz-section').classList.add('active');
  currentQ = 0;
  answers = {};
  renderQuestion();
  fbqTrack('StartFlow');
}

function closeFlow() {
  document.querySelector('.quiz-section').classList.remove('active');
  document.getElementById('quiz').setAttribute('aria-hidden', 'true');
  // Restaura scroll
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  window.scrollTo(0, bodyScrollY);
}

function renderQuestion() {
  const q = QUESTIONS[currentQ];
  const total = QUESTIONS.length;
  const pct = ((currentQ + 1) / total) * 100;

  document.getElementById('quizProgress').style.width = pct + '%';
  document.getElementById('quizMsg').textContent = q.msg;
  // Force re-animation of msg
  const msgEl = document.getElementById('quizMsg');
  msgEl.style.animation = 'none';
  msgEl.offsetHeight;
  msgEl.style.animation = '';

  let optionsHTML = '';
  if (q.type === 'lifestyle') {
    optionsHTML = `
      <div class="quiz-options cols-3">
        ${q.options.map(opt => `
          <button class="quiz-lifestyle" data-bg="${opt.bg}" onclick="selectOption('${q.key}','${opt.value}')">
            <div class="quiz-lifestyle-content">
              <div class="quiz-lifestyle-text">${opt.text}</div>
              <div class="quiz-lifestyle-sub">${opt.sub}</div>
            </div>
          </button>
        `).join('')}
      </div>
    `;
  } else {
    const colsClass = q.cols === 3 ? 'cols-3' : 'cols-2';
    optionsHTML = `
      <div class="quiz-options ${colsClass}">
        ${q.options.map(opt => `
          <button class="quiz-option" onclick="selectOption('${q.key}','${opt.value}')">
            <div class="quiz-option-ico">${opt.icon}</div>
            <div class="quiz-option-body">
              <div class="quiz-option-text">${opt.text}</div>
              <div class="quiz-option-sub">${opt.sub}</div>
            </div>
            <span class="quiz-option-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </span>
          </button>
        `).join('')}
      </div>
    `;
  }

  document.getElementById('qContent').innerHTML = `
    <div class="quiz-question">
      <h2>${q.title}</h2>
      <p>${q.sub}</p>
    </div>
    ${optionsHTML}
  `;

  // Reset scroll do quiz container
  const quizSection = document.querySelector('.quiz-section');
  if (quizSection) quizSection.scrollTop = 0;
}

function selectOption(key, value) {
  answers[key] = value;
  fbqTrack('QuestionAnswered', { question: key, answer: value });
  currentQ++;
  if (currentQ < QUESTIONS.length) {
    // Pequeno delay pra dar feedback de seleção
    setTimeout(renderQuestion, 280);
  } else {
    finishFlow();
  }
}

// =============================================================
// LOADING — cinematic 5-step animation
// =============================================================
function finishFlow() {
  document.querySelector('.quiz-section').classList.remove('active');
  document.getElementById('quiz').setAttribute('aria-hidden', 'true');
  document.getElementById('loading').setAttribute('aria-hidden', 'false');
  document.getElementById('loading').classList.add('active');
  fbqTrack('FlowCompleted');

  const steps = document.querySelectorAll('.loading-step');
  steps.forEach(s => s.classList.remove('active', 'done'));

  let i = 0;
  // Highlight cada step sequencialmente
  function nextStep() {
    if (i > 0) {
      steps[i - 1].classList.remove('active');
      steps[i - 1].classList.add('done');
    }
    if (i < steps.length) {
      steps[i].classList.add('active');
      i++;
      setTimeout(nextStep, 1000);
    } else {
      // Done
      setTimeout(showResults, 600);
    }
  }
  setTimeout(nextStep, 400);
}

// =============================================================
// MATCHING ALGORITHM
// =============================================================
function calculateRegionMatch(region) {
  let score = 0;
  let maxScore = 0;

  // Lifestyle (peso 30)
  if (region.lifestyle_score && region.lifestyle_score[answers.lifestyle]) {
    score += region.lifestyle_score[answers.lifestyle] * 6;
  }
  maxScore += 30;

  // Purpose (peso 25)
  if (region.purpose_score && region.purpose_score[answers.purpose]) {
    score += region.purpose_score[answers.purpose] * 5;
  }
  maxScore += 25;

  // Budget (peso 25)
  const budgetMin = { '150-300': 150000, '300-500': 300000, '500-1000': 500000, '1000+': 1000000 };
  const budgetMax = { '150-300': 300000, '300-500': 500000, '500-1000': 1000000, '1000+': 50000000 };
  const userMin = budgetMin[answers.budget];
  const userMax = budgetMax[answers.budget];

  const ticketMatch = region.ticket_range.match(/\$\s*(\d+)K?\s*[—-]\s*\$?\s*(\d+\.?\d*)\s*([KM])/i);
  if (ticketMatch && userMin !== undefined) {
    const regionMin = parseInt(ticketMatch[1]) * 1000;
    const regionMaxNum = parseFloat(ticketMatch[2]);
    const regionMaxUnit = ticketMatch[3].toUpperCase();
    const regionMax = regionMaxUnit === 'M' ? regionMaxNum * 1000000 : regionMaxNum * 1000;
    if (userMin <= regionMax && userMax >= regionMin) score += 25;
    else if (Math.abs(userMin - regionMax) < 200000 || Math.abs(userMax - regionMin) < 200000) score += 12;
  }
  maxScore += 25;

  // Kids bonus (peso 20)
  if (answers.kids === 'yes_small' || answers.kids === 'yes_teen') {
    if (region.lifestyle_score && region.lifestyle_score.family >= 4) score += 20;
    else if (region.lifestyle_score && region.lifestyle_score.family >= 3) score += 12;
    else score += 4;
  } else if (answers.kids === 'no') {
    if (region.lifestyle_score && (region.lifestyle_score.urban >= 4 || region.lifestyle_score.luxury >= 4)) score += 20;
    else score += 12;
  } else {
    score += 14;
  }
  maxScore += 20;

  return Math.round((score / maxScore) * 100);
}

function getMatchedRegions() {
  if (!REGIONS.length) return [];
  const scored = REGIONS.map(r => ({ ...r, matchScore: calculateRegionMatch(r) }));
  scored.sort((a, b) => b.matchScore - a.matchScore);
  return scored.slice(0, 3);
}

// =============================================================
// RESULTS — Netflix-style cinematic
// =============================================================
function showResults() {
  document.getElementById('loading').classList.remove('active');
  document.getElementById('loading').setAttribute('aria-hidden', 'true');
  document.getElementById('results').setAttribute('aria-hidden', 'false');
  document.getElementById('results').classList.add('active');
  // Mantém body lock — results é fullscreen overlay. Scroll fica interno.
  // Garante que o overlay inicia rolado pro topo:
  setTimeout(() => {
    const rs = document.getElementById('results');
    if (rs) rs.scrollTop = 0;
  }, 30);

  const matches = getMatchedRegions();

  document.getElementById('matchData').value = JSON.stringify({
    answers: answers,
    matches: matches.map(m => ({ id: m.id, name: m.name, score: m.matchScore }))
  });

  document.getElementById('regionsGrid').innerHTML = matches.map((r, idx) => `
    <article class="region-card">
      <div class="region-img" style="background-image:url('${r.image}')">
        <div class="region-rank">${String(idx + 1).padStart(2, '0')}</div>
        <div class="region-match">${r.matchScore}% match</div>
        <div class="region-overlay-text">
          <h3>${r.name}</h3>
          <span>${r.state}</span>
        </div>
      </div>
      <div class="region-body">
        <div>
          <p class="region-tagline">"${r.tagline}"</p>
          <div class="region-stats">
            <div class="region-stat">
              <div class="region-stat-label">Valorização</div>
              <div class="region-stat-value">${r.appreciation}</div>
            </div>
            <div class="region-stat">
              <div class="region-stat-label">Ticket típico</div>
              <div class="region-stat-value">${r.ticket_range}</div>
            </div>
            <div class="region-stat">
              <div class="region-stat-label">Renda mensal</div>
              <div class="region-stat-value">${r.rental_income}</div>
            </div>
            <div class="region-stat">
              <div class="region-stat-label">Compatibilidade</div>
              <div class="region-stat-value">${r.matchScore}%</div>
            </div>
          </div>
          <p class="region-profile">
            <strong>Perfil investidor:</strong> ${r.investor_profile}<br><br>
            <strong>Perfil família:</strong> ${r.family_profile}
          </p>
        </div>
        <div class="region-highlights">
          ${r.highlights.map(h => `<span class="region-highlight">${h}</span>`).join('')}
        </div>
      </div>
    </article>
  `).join('');

  fbqTrack('ResultsShown', { matchCount: matches.length });
}

// =============================================================
// EMAIL CAPTURE
// =============================================================
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('captureForm');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('.capture-submit');
    const originalText = btn.textContent;
    btn.textContent = 'Enviando…';
    btn.disabled = true;

    const formData = new FormData(form);
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        document.getElementById('results').classList.remove('active');
        document.getElementById('results').setAttribute('aria-hidden', 'true');
        document.getElementById('thanks').setAttribute('aria-hidden', 'false');
        document.getElementById('thanks').classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        fbqTrack('Lead');
      } else {
        btn.textContent = originalText;
        btn.disabled = false;
        alert('Não conseguimos enviar agora. Tenta de novo em alguns segundos.');
      }
    } catch (err) {
      btn.textContent = originalText;
      btn.disabled = false;
      alert('Sem conexão. Verifica sua internet e tenta de novo.');
    }
  });
});

// =============================================================
// TRACKING
// =============================================================
function fbqTrack(eventName, params = {}) {
  if (typeof fbq === 'function') fbq('trackCustom', eventName, params);
  if (window.clarity) clarity('event', eventName);
  console.log('[Sistema Imóvel Certo]', eventName, params);
}

// =============================================================
// ESC key fecha quiz
// =============================================================
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && document.querySelector('.quiz-section.active')) {
    closeFlow();
  }
});

// Expose
window.startFlow = startFlow;
window.closeFlow = closeFlow;
window.selectOption = selectOption;
