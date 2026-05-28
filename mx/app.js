// =============================================================
// SISTEMA IMÓVEL CERTO™ · APP.JS
// Quiz one-per-screen · Premium animations · Cinematic loading
// =============================================================

// WhatsApp do André Cunha Lima · +1 (305) 684-9224
const WHATSAPP_PHONE = '13056849224';
const WHATSAPP_URL = (msg) => `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`;

// =============================================================
// LEAD SUMMARY — formats quiz answers for the agent WhatsApp
// =============================================================
const ANSWER_LABELS = {
  purpose: {
    label: 'Objetivo',
    values: {
      live: '🏡 Morar com a família',
      invest: '📈 Investir e gerar renda',
      vacation: '🌴 Casa de férias',
      protection: '🛡️ Proteger patrimônio'
    }
  },
  lifestyle: {
    label: 'Estilo de vida',
    values: {
      urban: '🏙️ Urbano vibrante (Brickell, downtown)',
      beach: '🏖️ Pé na areia (Sunny Isles, Surfside)',
      family: '👨‍👩‍👧 Família calma (Aventura, Coral Gables)',
      luxury: '💎 Luxo discreto (Bal Harbour, Pinecrest)',
      calm: '🌿 Vida tranquila (Tampa, Doral)'
    }
  },
  budget: {
    label: 'Ticket',
    values: {
      '150-300': 'US$ 150-300 mil',
      '300-500': 'US$ 300-500 mil',
      '500-1000': 'US$ 500K-1M',
      '1000+': 'Acima de US$ 1M'
    }
  },
  kids: {
    label: 'Família',
    values: {
      yes_small: '👶 Filhos pequenos (0-12 anos)',
      yes_teen: '🎓 Filhos adolescentes (13-18)',
      no: '🥂 Sem filhos em casa',
      planning: '🌱 Planejando ter'
    }
  },
  timeline: {
    label: 'Decisão',
    values: {
      now: '🚀 Pronto agora (próximos 90 dias)',
      '6mo': '📅 Próximos 6 meses',
      '12mo': '⏳ Próximos 12 meses',
      research: '🔍 Apenas pesquisando'
    }
  }
};

function buildLeadSummary(specificRegion = null) {
  if (!answers || !Object.keys(answers).length) {
    return '¡Hola André! Vi El Sistema Inmueble Correcto y quisiera hacer algunas preguntas sobre propiedades en Florida — sin compromiso.';
  }

  const lines = ['¡Hola André! Acabo de completar el diagnóstico en El Siema Imóvel Certo™.', ''];
  lines.push('📋 *MEU PERFIL:*');
  ['purpose', 'lifestyle', 'budget', 'kids', 'timeline'].forEach(key => {
    const val = answers[key];
    if (!val) return;
    const spec = ANSWER_LABELS[key];
    if (!spec) return;
    const display = spec.values[val] || val;
    lines.push(`• ${spec.label}: ${display}`);
  });

  // Match de las 3 regiones (calcula al momento del llamado para reflejar estado actual)
  const matches = getMatchedRegions();
  if (matches && matches.length) {
    lines.push('');
    lines.push('📍 *MINHAS 3 REGIÕES MATCH:*');
    matches.forEach((m, idx) => {
      lines.push(`${idx + 1}. ${m.name} — ${m.matchScore}% match`);
    });
  }

  lines.push('');
  if (specificRegion) {
    lines.push(`Gostaria de conversar especificamente sobre *${specificRegion}* — orientação sem compromisso.`);
  } else {
    lines.push('Gostaria de orientação sobre as melhores opções pro meu perfil — sem compromisso.');
  }

  return lines.join('\n');
}

// Stripe payment link da assessoria 30min — TROCAR pelo link real do Bruno
const STRIPE_CONSULTORIA_URL = 'https://buy.stripe.com/REPLACE_WITH_REAL_LINK';

let REGIONS = [];
let LISTINGS = {};
let currentQ = 0;
let answers = {};
let bodyScrollY = 0;

// Carga regions + listings (propiedades reales).
// Cache-bust con versión — sube cuando cambies la estructura del JSON para invalidar cache do browser.
const DATA_VERSION = '2026052301';
fetch('regions.json?v=' + DATA_VERSION, { cache: 'no-cache' })
  .then(r => r.json())
  .then(data => { REGIONS = data; })
  .catch(err => console.error('[Sistema] Falha ao carregar regions.json:', err));

fetch('listings.json?v=' + DATA_VERSION, { cache: 'no-cache' })
  .then(r => r.json())
  .then(data => { LISTINGS = data; console.log('[Sistema] listings carregados:', Object.keys(LISTINGS)); })
  .catch(err => console.warn('[El Sistema Inmueble Correcto] listings.json falló:', err));

// Toma 6 propiedades (2 entry + 2 mid + 2 premium) — escala de precio completa por usuario.
// Combinación única (hasta C(4,2)×C(4,2)×C(5,2) = 6×6×10 = 360 combinaciones por región).
function getRandomListings(regionId) {
  const region = LISTINGS[regionId];
  if (!region || !region.samples) return [];
  const pickN = (arr, n) => {
    if (!arr || !arr.length) return [];
    const pool = [...arr];
    const out = [];
    while (out.length < n && pool.length) {
      out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    }
    return out;
  };
  return [
    ...pickN(region.samples.entry, 2),
    ...pickN(region.samples.mid, 2),
    ...pickN(region.samples.premium, 2)
  ];
}

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
// PREMIUM SVG ICONS — biblioteca minimalist stroke-based
// Style: 24x24 viewBox, fill none, stroke currentColor 1.8, line caps round
// =============================================================
const ICON_BASE = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
const ICONS = {
  // PURPOSE — 4 ícones
  live: `<svg ${ICON_BASE}><path d="M3 11l9-8 9 8v10a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2z"/></svg>`,
  invest: `<svg ${ICON_BASE}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  vacation: `<svg ${ICON_BASE}><path d="M2 21c5-2 8-7 10-13"/><path d="M22 21c-5-2-8-7-10-13"/><path d="M12 21V8"/><circle cx="12" cy="6" r="2"/><path d="M5 14c2-4 5-6 7-6s5 2 7 6"/></svg>`,
  protection: `<svg ${ICON_BASE}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>`,

  // BUDGET — 4 ícones (escala de moeda)
  budgetLow: `<svg ${ICON_BASE}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  budgetMid: `<svg ${ICON_BASE}><circle cx="8" cy="12" r="6"/><circle cx="16" cy="12" r="6"/></svg>`,
  budgetHigh: `<svg ${ICON_BASE}><path d="M6 3v18"/><path d="M12 3v18"/><path d="M18 3v18"/><path d="M3 8h18"/><path d="M3 16h18"/></svg>`,
  budgetPremium: `<svg ${ICON_BASE}><polygon points="6 3 18 3 22 9 12 22 2 9"/><line x1="12" y1="22" x2="12" y2="9"/><line x1="2" y1="9" x2="22" y2="9"/><line x1="6" y1="3" x2="12" y2="9"/><line x1="18" y1="3" x2="12" y2="9"/></svg>`,

  // KIDS / FAMILY — 4 ícones
  kidsSmall: `<svg ${ICON_BASE}><circle cx="12" cy="7" r="4"/><path d="M5 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2"/><path d="M9 11c0 1 1 2 3 2s3-1 3-2"/></svg>`,
  kidsTeen: `<svg ${ICON_BASE}><path d="M22 10v6"/><path d="M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
  kidsNone: `<svg ${ICON_BASE}><path d="M8 21h8"/><path d="M12 21v-3"/><path d="M7 4h10l-1 8a4 4 0 0 1-8 0z"/></svg>`,
  kidsPlanning: `<svg ${ICON_BASE}><path d="M12 22a7 7 0 0 0 7-7c0-2-1-4-3-5.5C14 8 14 7 14 6c0-2-1-3-2-4-1 1-2 2-2 4 0 1 0 2-2 3.5-2 1.5-3 3.5-3 5.5a7 7 0 0 0 7 7z"/></svg>`,

  // TIMELINE — 4 ícones
  timelineNow: `<svg ${ICON_BASE}><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/><circle cx="5" cy="12" r="2" fill="currentColor"/></svg>`,
  timeline6mo: `<svg ${ICON_BASE}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  timeline12mo: `<svg ${ICON_BASE}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  timelineResearch: `<svg ${ICON_BASE}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`
};

// =============================================================
// QUESTIONS — 5 perguntas, premium UX
// =============================================================
const QUESTIONS = [
  {
    key: 'purpose',
    msg: 'Entendiendo tu objetivo',
    title: '¿Por qué quieres una propiedad en EE. UU.?',
    sub: 'La respuesta correcta cambia todo el resto del diagnóstico.',
    type: 'options',
    cols: 2,
    options: [
      { value: 'live', icon: ICONS.live, text: 'Vivir con la familia', sub: 'Mudanza definitiva o parcial' },
      { value: 'invest', icon: ICONS.invest, text: 'Invertir y generar renta', sub: 'Renta pasiva en USD' },
      { value: 'vacation', icon: ICONS.vacation, text: 'Casa de vacaciones', sub: 'Usar por temporada' },
      { value: 'protection', icon: ICONS.protection, text: 'Proteger patrimonio', sub: 'Blindaje en moneda fuerte' }
    ]
  },
  {
    key: 'lifestyle',
    msg: 'Analizando tu estilo de vida',
    title: '¿En qué lugar te imaginas despertando?',
    sub: 'Elige el escenario que más resuena con la vida que quieres construir.',
    type: 'lifestyle',
    options: [
      { value: 'urban', bg: 'urban', text: 'Urbano vibrante', sub: 'Brickell, downtown' },
      { value: 'beach', bg: 'beach', text: 'En la playa', sub: 'Sunny Isles, Surfside' },
      { value: 'family', bg: 'family', text: 'Familia tranquila', sub: 'Aventura, Coral Gables' },
      { value: 'luxury', bg: 'luxury', text: 'Lujo discreto', sub: 'Bal Harbour, Pinecrest' },
      { value: 'calm', bg: 'calm', text: 'Vida tranquila', sub: 'Tampa, Doral' }
    ]
  },
  {
    key: 'budget',
    msg: 'Calculando rangos compatibles',
    title: '¿Cuánto cash tienes disponible para entrar?',
    sub: 'Precio total de la propiedad en USD. Banco estadounidense financia hasta 70%, entonces el cash inicial define tu ticket real.',
    type: 'options',
    cols: 2,
    options: [
      { value: '150-300', icon: ICONS.budgetLow, text: 'US$ 150-300K', sub: 'Studios + 1 recámara Edgewater, Aventura outskirts' },
      { value: '300-500', icon: ICONS.budgetMid, text: 'US$ 300-500K', sub: '1 recámara Aventura, Sunny Isles, Brickell' },
      { value: '500-1000', icon: ICONS.budgetHigh, text: 'US$ 500K-1M', sub: '2 recámaras prime, Brickell vista, Sunny Isles' },
      { value: '1000+', icon: ICONS.budgetPremium, text: 'Arriba de US$ 1M', sub: 'Luxury alto nivel · Bal Harbour, penthouse' }
    ]
  },
  {
    key: 'kids',
    msg: 'Evaluando composición familiar',
    title: '¿Quién vivirá o usará la propiedad contigo?',
    sub: 'Esto cambia completamente qué school zone y qué perímetro de seguridad importan.',
    type: 'options',
    cols: 2,
    options: [
      { value: 'yes_small', icon: ICONS.kidsSmall, text: 'Tengo hijos pequeños', sub: '0-12 años · school zone importa' },
      { value: 'yes_teen', icon: ICONS.kidsTeen, text: 'Tengo hijos adolescentes', sub: '13-18 años · high school top' },
      { value: 'no', icon: ICONS.kidsNone, text: 'Sin hijos en casa', sub: 'Pareja, single o hijos adultos' },
      { value: 'planning', icon: ICONS.kidsPlanning, text: 'Planeando tener', sub: 'Pensando en el futuro familiar' }
    ]
  },
  {
    key: 'timeline',
    msg: 'Cruzando regiones compatibles',
    title: '¿Cuándo necesitas tener cerrada esta decisión?',
    sub: 'Última pregunta. La ventana de 18 meses antes del próximo ciclo electoral mexicano — quien decide primero asegura el régimen actual y los precios de hoy.',
    type: 'options',
    cols: 2,
    options: [
      { value: 'now', icon: ICONS.timelineNow, text: 'Estoy listo ahora', sub: 'Decisión en los próximos 90 días' },
      { value: '6mo', icon: ICONS.timeline6mo, text: 'Próximos 6 meses', sub: 'Organizando estructura financiera' },
      { value: '12mo', icon: ICONS.timeline12mo, text: 'Próximos 12 meses', sub: 'Planeando con calma' },
      { value: 'research', icon: ICONS.timelineResearch, text: 'Solo investigando', sub: 'Quiero entender opciones' }
    ]
  }
];

// =============================================================
// FLOW CONTROL
// =============================================================
function lockBody() {
  // overflow:hidden is safer than position:fixed for mobile/iOS Safari
  // (position:fixed breaks inputs inside fullscreen overlays)
  bodyScrollY = window.scrollY;
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';
}

function unlockBody() {
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
}

function startFlow() {
  lockBody();
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
  unlockBody();
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

  // Reset quiz container scroll
  const quizSection = document.querySelector('.quiz-section');
  if (quizSection) quizSection.scrollTop = 0;
}

function selectOption(key, value) {
  answers[key] = value;
  fbqTrack('QuestionAnswered', { question: key, answer: value });
  currentQ++;
  if (currentQ < QUESTIONS.length) {
    // Small delay to give selection feedback
    setTimeout(renderQuestion, 280);
  } else {
    finishFlow();
  }
}

// =============================================================
// CAPTURE GATE — pre-results
// =============================================================
function finishFlow() {
  // Goes from quiz to capture BEFORE loading/results
  document.querySelector('.quiz-section').classList.remove('active');
  document.getElementById('quiz').setAttribute('aria-hidden', 'true');
  document.getElementById('capture').setAttribute('aria-hidden', 'false');
  document.querySelector('.capture-section').classList.add('active');
  setTimeout(() => {
    const cs = document.querySelector('.capture-section');
    if (cs) cs.scrollTop = 0;
    // Auto-focus on first field
    const firstInput = document.querySelector('#capture input[name="name"]');
    if (firstInput) firstInput.focus();
  }, 60);
  fbqTrack('FlowCompleted');
}

function runLoadingAndShowResults() {
  document.querySelector('.capture-section').classList.remove('active');
  document.getElementById('capture').setAttribute('aria-hidden', 'true');
  document.getElementById('loading').setAttribute('aria-hidden', 'false');
  document.getElementById('loading').classList.add('active');

  const steps = document.querySelectorAll('.loading-step');
  steps.forEach(s => s.classList.remove('active', 'done'));

  let i = 0;
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
  // Body permanece com overflow:hidden — inputs funcionam normalmente nesse modo.
  setTimeout(() => {
    const rs = document.getElementById('results');
    if (rs) rs.scrollTop = 0;
  }, 30);

  const matches = getMatchedRegions();

  // Renderiza oferta de assessoria DEPOIS dos region cards
  setTimeout(() => renderConsultoria(matches), 0);

  document.getElementById('regionsGrid').innerHTML = matches.map((r, idx) => {
    const waMsg = buildLeadSummary(r.name);

    const diningHTML = (r.dining || []).map(d => `
      <div class="region-poi">
        <div class="region-poi-name">${d.name} <span class="region-poi-tag">${d.cuisine || ''}</span></div>
        <div class="region-poi-note">${d.note || ''}</div>
      </div>
    `).join('');

    const groceriesHTML = (r.groceries || []).map(g => `
      <div class="region-poi">
        <div class="region-poi-name">${g.name} <span class="region-poi-tag">${g.type || ''}</span></div>
        <div class="region-poi-note">${g.note || ''}</div>
      </div>
    `).join('');

    const schoolsHTML = (r.schools || []).map(s => `
      <div class="region-poi">
        <div class="region-poi-name">${s.name} <span class="region-poi-tag">${s.type || ''}</span></div>
        <div class="region-poi-note">${s.rank || ''}</div>
      </div>
    `).join('');

    const momentsHTML = (r.lifestyle_moments || []).map(m => `
      <li class="region-moment">${m}</li>
    `).join('');

    const buildingsHTML = (r.buildings || []).map(b => `<span class="region-building">${b}</span>`).join('');

    return `
    <article class="region-card">
      <div class="region-img" data-bg="${r.image}">
        <div class="region-rank">${String(idx + 1).padStart(2, '0')}</div>
        <div class="region-match">${r.matchScore}% match</div>
        <div class="region-overlay-text">
          <h3>${r.name}</h3>
          <span>${r.state}</span>
        </div>
      </div>

      <div class="region-body">
        <div class="region-body-top">
          <p class="region-tagline">"${r.tagline}"</p>

          <div class="region-stats">
            <div class="region-stat"><div class="region-stat-label">Plusvalía</div><div class="region-stat-value">${r.appreciation}</div></div>
            <div class="region-stat"><div class="region-stat-label">Ticket típico</div><div class="region-stat-value">${r.ticket_range}</div></div>
            <div class="region-stat"><div class="region-stat-label">Renta mensual</div><div class="region-stat-value">${r.rental_income}</div></div>
            <div class="region-stat"><div class="region-stat-label">Compatibilidad</div><div class="region-stat-value">${r.matchScore}%</div></div>
          </div>
        </div>

        ${r.identity ? `
        <div class="region-identity">
          <div class="region-identity-label">Por dentro de ${r.name}</div>
          <p class="region-identity-text">${r.identity}</p>
          ${r.landmark ? `<div class="region-landmark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>${r.landmark}</div>` : ''}
        </div>
        ` : ''}

        ${momentsHTML ? `
        <div class="region-block">
          <div class="region-block-label">Un día típico aquí</div>
          <ul class="region-moments">${momentsHTML}</ul>
        </div>
        ` : ''}

        ${diningHTML ? `
        <div class="region-block">
          <div class="region-block-label">Dónde se come</div>
          <div class="region-pois">${diningHTML}</div>
        </div>
        ` : ''}

        ${groceriesHTML ? `
        <div class="region-block">
          <div class="region-block-label">Mercados de la rutina</div>
          <div class="region-pois">${groceriesHTML}</div>
        </div>
        ` : ''}

        ${schoolsHTML ? `
        <div class="region-block">
          <div class="region-block-label">Escuelas que importan</div>
          <div class="region-pois">${schoolsHTML}</div>
        </div>
        ` : ''}

        ${buildingsHTML ? `
        <div class="region-block">
          <div class="region-block-label">Edificios de referencia</div>
          <div class="region-buildings">${buildingsHTML}</div>
        </div>
        ` : ''}

        <div class="region-profile">
          <strong>Perfil inversionista:</strong> ${r.investor_profile}<br>
          <strong>Perfil familiar:</strong> ${r.family_profile}
        </div>

        ${(() => {
          const listings = getRandomListings(r.id);
          const listingsMeta = LISTINGS[r.id];
          if (!listings.length) {
            if (listingsMeta && listingsMeta.see_all_url) {
              return `
              <div class="region-block">
                <div class="region-block-label">Propiedades disponibles ahora</div>
                <a class="region-listings-cta-empty" href="${listingsMeta.see_all_url}" target="_blank" rel="noopener" onclick="fbqTrack('SeeAllListings',{region:'${r.id}'})">
                  Ver propiedades en ${r.name} en el sitio oficial
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </a>
              </div>`;
            }
            return '';
          }
          const total = listingsMeta && listingsMeta.total_available ? listingsMeta.total_available.toLocaleString('es-MX') : '';
          const seeAllUrl = listingsMeta && listingsMeta.see_all_url ? listingsMeta.see_all_url : '#';
          // 6 cards: [0,1]=entry · [2,3]=mid · [4,5]=premium
          const tierByIdx = ['Accesible','Accesible','Intermedio','Intermedio','Premium','Premium'];
          const tierClassByIdx = ['entry','entry','mid','mid','premium','premium'];
          return `
          <div class="region-block">
            <div class="region-block-label">${listings.length} propiedades ideales para ti · entre ${total} disponibles en ${r.name}</div>
            <div class="region-listings">
              ${listings.map((l, idx) => {
                const tier = tierByIdx[idx] || '';
                const tierClass = tierClassByIdx[idx] || '';
                return `
                <a class="region-listing" href="${seeAllUrl}" target="_blank" rel="noopener" onclick="fbqTrack('ListingClick',{region:'${r.id}',mls:'${l.mls}',tier:'${tierClass}'})">
                  <div class="region-listing-img" data-bg="${l.img}">
                    <span class="region-listing-tier region-listing-tier--${tierClass}">${tier}</span>
                    <span class="region-listing-mls">${l.mls}</span>
                  </div>
                  <div class="region-listing-body">
                    <div class="region-listing-price">${l.price}</div>
                    <div class="region-listing-condo">${l.condo}</div>
                    <div class="region-listing-meta">
                      ${l.beds ? `<span>${l.beds} recámaras</span>` : ''}
                      ${l.baths ? `<span>${l.baths} baños</span>` : ''}
                      ${l.sqft && l.sqft !== '0' ? `<span>${l.sqft} ft²</span>` : ''}
                    </div>
                  </div>
                </a>`;
              }).join('')}
            </div>
            <a class="region-listings-cta" href="${seeAllUrl}" target="_blank" rel="noopener" onclick="fbqTrack('SeeAllListings',{region:'${r.id}'})">
              Ver todas las ${total} propiedades en ${r.name} →
            </a>
          </div>`;
        })()}

        <a class="region-wa" href="${WHATSAPP_URL(waMsg)}" target="_blank" rel="noopener" onclick="fbqTrack('RegionWhatsApp', {region: '${r.id}'})">
          <span class="region-wa-ico">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
          </span>
          <span class="region-wa-text">
            <span class="region-wa-title">Hablar con André sobre ${r.name}</span>
            <span class="region-wa-sub">Orientación sin compromiso · respuesta en hasta 1 hora</span>
          </span>
          <span class="region-wa-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </span>
        </a>
      </div>
    </article>
  `;
  }).join('');

  fbqTrack('ResultsShown', { matchCount: matches.length });

  // Lazy load das imagens de fundo (regiones + listings) — só carrega
  // o que entra no viewport. Mobile economiza ~80% de bandwidth na 1ª tela.
  hydrateLazyBackgrounds();
}

// =============================================================
// LAZY BACKGROUNDS — IntersectionObserver para imágenes de fondo
// (CSS background-image no tiene loading=lazy nativo)
// =============================================================
let _bgObserver = null;
function hydrateLazyBackgrounds() {
  const targets = document.querySelectorAll('[data-bg]:not([data-bg-loaded])');
  if (!targets.length) return;

  // Fallback: browsers antigos (~0.5% do tráfego BR) carregam tudo de uma vez
  if (typeof IntersectionObserver === 'undefined') {
    targets.forEach(el => {
      el.style.backgroundImage = `url('${el.dataset.bg}')`;
      el.setAttribute('data-bg-loaded', '1');
    });
    return;
  }

  if (!_bgObserver) {
    _bgObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const url = el.dataset.bg;
        if (!url) return;
        // Pre-load via Image() to trigger fade-in only when download finishes
        const img = new Image();
        img.onload = () => {
          el.style.backgroundImage = `url('${url}')`;
          el.setAttribute('data-bg-loaded', '1');
          el.classList.add('bg-loaded');
        };
        img.src = url;
        obs.unobserve(el);
      });
    }, {
      rootMargin: '200px 0px',  // começa a carregar 200px antes do viewport
      threshold: 0.01
    });
  }

  targets.forEach(el => _bgObserver.observe(el));
}

// =============================================================
// CAPTURE FORM SUBMIT — gate antes do results
// =============================================================
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('captureForm');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = document.getElementById('captureError');
    if (errEl) errEl.classList.remove('show');

    // Basic validation
    const fd = new FormData(form);
    const name = (fd.get('name') || '').toString().trim();
    const email = (fd.get('email') || '').toString().trim();
    const whatsapp = (fd.get('whatsapp') || '').toString().trim();
    if (!name || !email.includes('@') || whatsapp.replace(/\D/g, '').length < 8) {
      if (errEl) {
        errEl.textContent = 'Revisa que nombre, email y teléfono estén completos.';
        errEl.classList.add('show');
      }
      return;
    }

    // Compute match BEFORE submit to include in payload
    const matches = getMatchedRegions();
    const matchData = JSON.stringify({
      answers: answers,
      matches: matches.map(m => ({ id: m.id, name: m.name, score: m.matchScore }))
    });
    document.getElementById('matchData').value = matchData;
    fd.set('match_data', matchData);

    // Custom subject (Formspree uses _subject as email subject)
    const firstName = name.split(' ')[0] || name;
    const top1 = matches[0] ? matches[0].name : '';
    const subject = `LEAD CALIENTE - ${firstName} (${top1}) - El Sistema Inmueble Correcto`;
    const subjEl = document.getElementById('formSubject');
    if (subjEl) subjEl.value = subject;
    fd.set('_subject', subject);

    // Reply-to = lead email (so you can reply directly from Gmail)
    const replyEl = document.getElementById('formReplyTo');
    if (replyEl) replyEl.value = email;
    fd.set('_replyto', email);

    // Lead summary nicely formatted for the email body
    const summaryLines = [
      '====================================',
      `NUEVO LEAD: ${name}`,
      '====================================',
      '',
      `Nombre:   ${name}`,
      `Email:    ${email}`,
      `Teléfono: ${whatsapp}`,
      `Data:     ${new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })} (CDMX)`,
      '',
      '--- PERFIL DEL QUIZ ---',
    ];
    Object.entries(answers || {}).forEach(([key, val]) => {
      const spec = ANSWER_LABELS[key];
      if (!spec) return;
      const labelVal = (spec.values && spec.values[val]) || val;
      summaryLines.push(`${spec.label}: ${labelVal}`);
    });
    summaryLines.push('');
    summaryLines.push('--- 3 REGIONES CON MATCH ---');
    matches.slice(0, 3).forEach((m, i) => {
      summaryLines.push(`${i + 1}. ${m.name} - ${m.matchScore}% match`);
    });
    summaryLines.push('');
    summaryLines.push('--- ACCION RECOMENDADA ---');
    summaryLines.push(`WhatsApp directo: https://wa.me/${whatsapp.replace(/\D/g, '')}`);
    summaryLines.push(`Responder email: ${email}`);
    summaryLines.push('');
    summaryLines.push('El Sistema Inmueble Correcto - sistema-imovel-certo.vercel.app/mx/');
    const leadSummary = summaryLines.join('\n');
    const summaryEl = document.getElementById('leadSummary');
    if (summaryEl) summaryEl.value = leadSummary;
    fd.set('lead_summary', leadSummary);

    const btn = form.querySelector('.capture-submit');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = 'Enviando…';
    btn.disabled = true;

    // Fire loading IMMEDIATELY (UX feels instant)
    // And submits to Formspree in parallel (background)
    fetch(form.action, {
      method: 'POST',
      body: fd,
      headers: { 'Accept': 'application/json' }
    }).then(r => {
      if (r.ok) fbqTrack('Lead', { name, email });
      else console.warn('[El Sistema Inmueble Correcto] Error Formspree:', r.status);
    }).catch(err => {
      console.warn('[El Sistema Inmueble Correcto] Error de red al enviar lead:', err);
    });

    // Lead captured — NOW release the WhatsApp FAB (with full quiz profile).
    // Before that, FAB stays hidden so every lead reaches the agent fully qualified.
    revealWhatsAppFab();

    // UX: loading + results
    runLoadingAndShowResults();

    // Restore button (in case user comes back somehow)
    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.disabled = false;
    }, 2000);
  });
});

// =============================================================
// TRACKING
// =============================================================
// Maps custom funnel events to each platform's standard events.
// Los eventos estándar son optimizables en Ads Manager / GA4 — los custom no.
const STANDARD_EVENT_MAP = {
  StartFlow:            { meta: 'InitiateCheckout', ga4: 'begin_checkout',  tiktok: 'InitiateCheckout' },
  QuestionAnswered:     { meta: 'AddToCart',        ga4: 'add_to_cart',     tiktok: 'AddToCart' },
  FlowCompleted:        { meta: 'AddPaymentInfo',   ga4: 'add_payment_info',tiktok: 'AddPaymentInfo' },
  ResultsShown:         { meta: 'ViewContent',      ga4: 'view_item',       tiktok: 'ViewContent' },
  Lead:                 { meta: 'Lead',             ga4: 'generate_lead',   tiktok: 'CompleteRegistration' },
  ListingClick:         { meta: 'ViewContent',      ga4: 'select_item',     tiktok: 'ViewContent' },
  SeeAllListings:       { meta: 'ViewContent',      ga4: 'view_item_list',  tiktok: 'ViewContent' },
  RegionWhatsApp:       { meta: 'Contact',          ga4: 'contact',         tiktok: 'Contact' },
  WhatsAppFAB:          { meta: 'Contact',          ga4: 'contact',         tiktok: 'Contact' },
  ConsultoriaCheckout:  { meta: 'InitiateCheckout', ga4: 'begin_checkout',  tiktok: 'InitiateCheckout' }
};

function fbqTrack(eventName, params = {}) {
  const mapping = STANDARD_EVENT_MAP[eventName];

  // Meta Pixel — fires standard event (trackable in Ads Manager) + custom (keeps granularity)
  if (typeof fbq === 'function') {
    if (mapping) fbq('track', mapping.meta, params);
    fbq('trackCustom', eventName, params);
  }

  // Google Analytics 4 / Google Ads
  if (typeof gtag === 'function') {
    if (mapping) gtag('event', mapping.ga4, params);
    gtag('event', eventName, params); // custom name for GA4 explore reports
  }

  // TikTok Pixel
  if (typeof ttq !== 'undefined' && ttq && typeof ttq.track === 'function') {
    if (mapping) ttq.track(mapping.tiktok, params);
  }

  // Microsoft Clarity
  if (window.clarity) clarity('event', eventName);

  console.log('[El Sistema Inmueble Correcto]', eventName, params);
}

// =============================================================
// ESC key fecha quiz
// =============================================================
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && document.querySelector('.quiz-section.active')) {
    closeFlow();
  }
});

// =============================================================
// WHATSAPP FAB — escondido até lead submeter form
//
// Strategic decision: FAB invisible on landing/quiz protects the agent from leads
// who click WhatsApp without filling the quiz. Every lead arriving
// no WhatsApp dele agora vem com match_data completo (3 regiones + ticket + objetivo).
// Release happens in revealWhatsAppFab(), called after fetch(formspree) initiated.
// =============================================================
function revealWhatsAppFab() {
  const fab = document.getElementById('waFab');
  if (!fab) return;
  fab.classList.add('is-visible');
}

// =============================================================
// CONSULTATION LINK — single source (Stripe → fallback mailto if placeholder)
// Consolidated hierarchy: Results + Thanks point to the SAME destination
// and fire the SAME tracking event (ConsultoriaCheckout)
// =============================================================
function getConsultoriaCheckoutUrl() {
  const isPlaceholder = !STRIPE_CONSULTORIA_URL || STRIPE_CONSULTORIA_URL.includes('REPLACE_WITH') || STRIPE_CONSULTORIA_URL.includes('TODO');
  if (isPlaceholder) {
    return 'mailto:contato@sistemaimovelcerto.com?subject=Quero%20a%20consultoria%20de%201h%20com%20Andr%C3%A9';
  }
  return STRIPE_CONSULTORIA_URL;
}

function bindThanksConsultoriaLink() {
  const link = document.getElementById('thanksConsultoriaLink');
  if (!link) return;
  link.href = getConsultoriaCheckoutUrl();
  link.addEventListener('click', () => {
    fbqTrack('ConsultoriaCheckout', { source: 'thanks_page', price: 500 });
  });
}
document.addEventListener('DOMContentLoaded', bindThanksConsultoriaLink);

(function setupFab(){
  const fab = document.getElementById('waFab');
  if (!fab) return;
  // initial empty href — configured only when user clicks (with quiz filled)
  fab.href = '#';
  fab.addEventListener('click', (e) => {
    fab.href = WHATSAPP_URL(buildLeadSummary());
    fbqTrack('WhatsAppFAB', { has_quiz: Object.keys(answers).length > 0 });
  });
})();

// =============================================================
// CONSULTATION $500 / 1h — The Right Closing Map™ (Amanda copy)
// =============================================================
function renderConsultoria(matches) {
  const target = document.getElementById('consultoriaSlot');
  if (!target) return;
  const topRegion = matches[0] ? matches[0].name : 'tu región #1';
  target.innerHTML = `
    <div class="consultoria-card">
      <div class="consultoria-tag">
        <span class="consultoria-tag-dot"></span>
        El Mapa de Compra Correcta™ · 1:1 con André
      </div>

      <h3 class="consultoria-title">
        60 minutos com André Cunha Lima.<br>
        <em>El precio de no perder US$ 80,000</em><br>
        comprando en el condado equivocado.
      </h3>

      <p class="consultoria-lead">
        Acabas de ver tus 3 regiones. Ahora viene la parte que destruye al HNW mexicano: <strong>elegir el edificio equivocado dentro de la región correcta</strong>, abrir <strong>LLC equivocada</strong>, conseguir <strong>financiamiento con tasa 1.5% arriba del mercado</strong>, o descubrir 6 meses después que <strong>el condominio prohíbe short-term rental</strong> — exactamente lo que compraste para hacer.
      </p>
      <p class="consultoria-lead">
        Cada uno de estos errores cuesta entre <strong>US$ 80,000 y US$ 880,000</strong>. Lo vi pasar 17 veces en los últimos 4 años con compradores que decidieron solos. <strong>1 hora conmigo en Zoom evita los 5 errores de una vez.</strong>
      </p>

      <div class="consultoria-includes-label">Lo que sale de esta 1 hora</div>

      <div class="consultoria-grid">
        <div class="consultoria-cell">
          <span class="consultoria-cell-num">01</span>
          <div>
            <div class="consultoria-cell-title">Auditoría EN VIVO de tus 3 regiones match</div>
            <div class="consultoria-cell-sub">Miro tu ticket, tu familia, tu objetivo, y te indico CUÁL de las tres es tu jugada definitiva (con números aplicados, no vago) — empezando por ${topRegion}.</div>
          </div>
        </div>

        <div class="consultoria-cell">
          <span class="consultoria-cell-num">02</span>
          <div>
            <div class="consultoria-cell-title">Estrategia fiscal + sucesoria</div>
            <div class="consultoria-cell-sub">LLC o título personal para tu caso. Florida vs Delaware. Cómo blindar para tus hijos pagando casi cero de inventario americano. Calculado, no genérico.</div>
          </div>
        </div>

        <div class="consultoria-cell">
          <span class="consultoria-cell-num">03</span>
          <div>
            <div class="consultoria-cell-title">Financiamiento Foreign National real</div>
            <div class="consultoria-cell-sub">Wells Fargo, City National, Truist — qué banco aprueba tu perfil, en cuántos días, tasa esperada hoy, mensualidad aplicada a tu ticket. Presentación directa a 1-2 bankers partners.</div>
          </div>
        </div>

        <div class="consultoria-cell">
          <span class="consultoria-cell-num">04</span>
          <div>
            <div class="consultoria-cell-title">5 a 8 edificios curados, en tu región-match</div>
            <div class="consultoria-cell-sub">No MLS scrape. Curaduría personal: short-term rental permitido, school zone correcta, comisión de developer, plusvalía histórica. Con link, planos y precio.</div>
          </div>
        </div>

        <div class="consultoria-cell">
          <span class="consultoria-cell-num">05</span>
          <div>
            <div class="consultoria-cell-title">Los 5 errores que cuestan US$ 200K-880K</div>
            <div class="consultoria-cell-sub">Título personal en lugar de LLC. Edificio que prohíbe rental. Delaware sin foreign LLC en FL. Zoning futuro negativo. Developer que se atrasa 14 meses. Sales sabiendo el nombre de cada trampa — y cómo evitarla.</div>
          </div>
        </div>

        <div class="consultoria-cell">
          <span class="consultoria-cell-num">06</span>
          <div>
            <div class="consultoria-cell-title">Plan de 90 días hasta closing</div>
            <div class="consultoria-cell-sub">Cronograma impreso en tu email al final del call. Día 1 → closing. Documentos, plazos, cuentas que abrir, ITIN, mortgage application. Sin "después te mando".</div>
          </div>
        </div>

        <div class="consultoria-cell">
          <span class="consultoria-cell-num">07</span>
          <div>
            <div class="consultoria-cell-title">Acceso al pipeline completo</div>
            <div class="consultoria-cell-sub">CPA americano especialista en non-resident alien. Abogado fiscal cross-border. Gestor de short-term rental. Concierge escolar. Decorador. No vas a construir esta red solo.</div>
          </div>
        </div>
      </div>

      <div class="consultoria-promise">
        <span class="consultoria-promise-label">Promesa directa:</span>
        Sales del call de 1 hora sabiendo <strong>exactamente</strong>: en qué condado vas a comprar, qué ticket cabe en tu cash, qué banco te va a financiar, qué LLC abrir, y en cuántos días cierras. Plan impreso en el email al final del call. <em>Sin "voy a pensarlo". Sin "después te mando".</em>
      </div>

      <div class="consultoria-price-row">
        <div class="consultoria-price">
          <span class="consultoria-price-currency">US$</span>
          <span class="consultoria-price-value">500</span>
          <span class="consultoria-price-unit">/ 60 min · 1:1</span>
        </div>
        <div class="consultoria-anchor">
          <strong>Crédito 100% reembolsado</strong> no closing<br>
          si cierras propiedad conmigo en los próximos 12 meses.
        </div>
      </div>

      <div class="consultoria-roi">
        <span class="consultoria-roi-strike">US$ 80.000 a US$ 880.000</span>
        <span class="consultoria-roi-text">es la pérdida promedio documentada de compradores que decidieron solos. <strong>US$ 500 es el precio de evitar ese error.</strong> ROI mínimo: <strong>160×</strong>. Real.</span>
      </div>

      <a class="consultoria-cta" href="${STRIPE_CONSULTORIA_URL}" target="_blank" rel="noopener" onclick="fbqTrack('ConsultoriaCheckout',{region:'${matches[0] ? matches[0].id : 'unknown'}',price:500})">
        Reservar mi consultoría · US$ 500
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </a>

      <div class="consultoria-trust">
        <div class="consultoria-trust-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          Después del pago, email automático con link de agendamiento (eliges tu horario)
        </div>
        <div class="consultoria-trust-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          Stripe seguro · tarjeta internacional ok · pago único
        </div>
        <div class="consultoria-trust-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          Zoom 1:1 en ES/EN/PT · 9 años Miami-Dade · 142 familias cerradas
        </div>
        <div class="consultoria-trust-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          Reembolso total si no sales del call con plan ejecutable
        </div>
      </div>

      <div class="consultoria-disqualifier">
        <strong>Aviso directo, sin rodeo:</strong> esta consultoría es para quien tiene mínimo US$ 300K cash disponible y seriamente va a decidir en los próximos 12 meses. <strong>Si aún estás solo investigando o cash abajo de eso — no compres ahora. En serio.</strong> US$ 500 tiene sentido solo cuando se vuelve jugada real, no estudio. Quédate con el resultado gratis de arriba. Sin resentimientos.
      </div>
    </div>
  `;
}

// =============================================================
// LIVE COUNTER — social proof "X compradores online ahora"
// =============================================================
(function liveCounter(){
  const el = document.getElementById('liveCounterNum');
  if (!el) return;
  // Base anclado en la hora del día — pico 12-14 + 19-22 hora CDMX
  const h = new Date().getHours();
  const peak = (h >= 11 && h <= 14) || (h >= 18 && h <= 23);
  const baseMin = peak ? 240 : 160;
  const baseMax = peak ? 340 : 230;
  let current = Math.floor(baseMin + Math.random() * (baseMax - baseMin));
  el.textContent = current;
  // Oscila +/-3 cada 6-10s
  setInterval(() => {
    const delta = Math.floor(Math.random() * 7) - 3; // -3 a +3
    current = Math.max(baseMin, Math.min(baseMax, current + delta));
    el.style.color = delta > 0 ? '#22c55e' : delta < 0 ? '#fff' : '#fff';
    el.textContent = current;
    setTimeout(() => el.style.color = '#fff', 600);
  }, 6000 + Math.random() * 4000);
})();

// Expose
window.startFlow = startFlow;
window.closeFlow = closeFlow;
window.selectOption = selectOption;
