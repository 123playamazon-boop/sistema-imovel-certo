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
    return 'Hi André! I saw The Right Property Method and would like to ask a few questions about Florida property — no commitment.';
  }

  const lines = ['Hi André! I just completed the diagnostic at The Right Prema Imóvel Certo™.', ''];
  lines.push('📋 *MEU PERFIL:*');
  ['purpose', 'lifestyle', 'budget', 'kids', 'timeline'].forEach(key => {
    const val = answers[key];
    if (!val) return;
    const spec = ANSWER_LABELS[key];
    if (!spec) return;
    const display = spec.values[val] || val;
    lines.push(`• ${spec.label}: ${display}`);
  });

  // Match the 3 regions (computed at call time to reflect current state)
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

// Load regions + listings (real properties).
// Cache-bust with version — bump when changing JSON structure to invalidar cache do browser.
const DATA_VERSION = '2026052301';
fetch('regions.json?v=' + DATA_VERSION, { cache: 'no-cache' })
  .then(r => r.json())
  .then(data => { REGIONS = data; })
  .catch(err => console.error('[Sistema] Falha ao carregar regions.json:', err));

fetch('listings.json?v=' + DATA_VERSION, { cache: 'no-cache' })
  .then(r => r.json())
  .then(data => { LISTINGS = data; console.log('[Sistema] listings carregados:', Object.keys(LISTINGS)); })
  .catch(err => console.warn('[The Right Property Method] listings.json failed:', err));

// Pulls 6 listings (2 entry + 2 mid + 2 premium) — full price range per user.
// Unique combination (up to C(4,2)×C(4,2)×C(5,2) = 6×6×10 = 360 combinations per region).
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
    msg: 'Understanding your goal',
    title: 'Why do you want a Florida property?',
    sub: 'The right answer reshapes everything else in the diagnostic.',
    type: 'options',
    cols: 2,
    options: [
      { value: 'live', icon: ICONS.live, text: 'Live with family', sub: 'Permanent or partial relocation' },
      { value: 'invest', icon: ICONS.invest, text: 'Invest and generate yield', sub: 'Passive USD income' },
      { value: 'vacation', icon: ICONS.vacation, text: 'Vacation home', sub: 'Seasonal use' },
      { value: 'protection', icon: ICONS.protection, text: 'Protect wealth', sub: 'Hard currency hedge' }
    ]
  },
  {
    key: 'lifestyle',
    msg: 'Analyzing your lifestyle',
    title: 'Where do you picture waking up?',
    sub: 'Pick the scenario that matches the life you want to build.',
    type: 'lifestyle',
    options: [
      { value: 'urban', bg: 'urban', text: 'Vibrant urban', sub: 'Brickell, downtown' },
      { value: 'beach', bg: 'beach', text: 'Beachfront', sub: 'Sunny Isles, Surfside' },
      { value: 'family', bg: 'family', text: 'Calm family', sub: 'Aventura, Coral Gables' },
      { value: 'luxury', bg: 'luxury', text: 'Quiet luxury', sub: 'Bal Harbour, Pinecrest' },
      { value: 'calm', bg: 'calm', text: 'Quiet life', sub: 'Tampa, Doral' }
    ]
  },
  {
    key: 'budget',
    msg: 'Computing compatible ranges',
    title: 'How much cash do you have available?',
    sub: 'Total property price in USD. US banks finance up to 70%, so your down payment defines your real ticket.',
    type: 'options',
    cols: 2,
    options: [
      { value: '150-300', icon: ICONS.budgetLow, text: 'US$ 150-300K', sub: 'Studios + 1BR Edgewater, Aventura outskirts' },
      { value: '300-500', icon: ICONS.budgetMid, text: 'US$ 300-500K', sub: '1BR Aventura, Sunny Isles, Brickell' },
      { value: '500-1000', icon: ICONS.budgetHigh, text: 'US$ 500K-1M', sub: '2BR prime, Brickell waterview, Sunny Isles' },
      { value: '1000+', icon: ICONS.budgetPremium, text: 'Above US$ 1M', sub: 'Luxury · Bal Harbour, penthouse' }
    ]
  },
  {
    key: 'kids',
    msg: 'Assessing household profile',
    title: 'Who will live in or use the property with you?',
    sub: 'This changes which school zone and which safety perimeter actually matter.',
    type: 'options',
    cols: 2,
    options: [
      { value: 'yes_small', icon: ICONS.kidsSmall, text: 'Young kids at home', sub: '0-12 years · school zone matters' },
      { value: 'yes_teen', icon: ICONS.kidsTeen, text: 'Teens at home', sub: '13-18 years · top high school' },
      { value: 'no', icon: ICONS.kidsNone, text: 'No kids at home', sub: 'Couple, single, or grown kids' },
      { value: 'planning', icon: ICONS.kidsPlanning, text: 'Planning to have', sub: 'Thinking about future family' }
    ]
  },
  {
    key: 'timeline',
    msg: 'Cross-referencing matching regions',
    title: 'When does this decision need to be locked?',
    sub: 'Last question. The 24-month window until the next FEMA flood map revision shapes premium pricing — buyers who decide first lock in today\'s premiums.',
    type: 'options',
    cols: 2,
    options: [
      { value: 'now', icon: ICONS.timelineNow, text: 'Ready now', sub: 'Decision in the next 90 days' },
      { value: '6mo', icon: ICONS.timeline6mo, text: 'Next 6 months', sub: 'Lining up financial structure' },
      { value: '12mo', icon: ICONS.timeline12mo, text: 'Next 12 months', sub: 'Planning carefully' },
      { value: 'research', icon: ICONS.timelineResearch, text: 'Just researching', sub: 'I want to understand options' }
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

  // Consultoria removida a pedido do Bruno — desativada em todos os idiomas
  // setTimeout(() => renderConsultoria(matches), 0);

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
            <div class="region-stat"><div class="region-stat-label">Appreciation</div><div class="region-stat-value">${r.appreciation}</div></div>
            <div class="region-stat"><div class="region-stat-label">Typical ticket</div><div class="region-stat-value">${r.ticket_range}</div></div>
            <div class="region-stat"><div class="region-stat-label">Monthly rent</div><div class="region-stat-value">${r.rental_income}</div></div>
            <div class="region-stat"><div class="region-stat-label">Compatibility</div><div class="region-stat-value">${r.matchScore}%</div></div>
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
          <div class="region-block-label">A typical day here</div>
          <ul class="region-moments">${momentsHTML}</ul>
        </div>
        ` : ''}

        ${diningHTML ? `
        <div class="region-block">
          <div class="region-block-label">Where to eat</div>
          <div class="region-pois">${diningHTML}</div>
        </div>
        ` : ''}

        ${groceriesHTML ? `
        <div class="region-block">
          <div class="region-block-label">Daily groceries</div>
          <div class="region-pois">${groceriesHTML}</div>
        </div>
        ` : ''}

        ${schoolsHTML ? `
        <div class="region-block">
          <div class="region-block-label">Schools that matter</div>
          <div class="region-pois">${schoolsHTML}</div>
        </div>
        ` : ''}

        ${buildingsHTML ? `
        <div class="region-block">
          <div class="region-block-label">Reference buildings</div>
          <div class="region-buildings">${buildingsHTML}</div>
        </div>
        ` : ''}

        <div class="region-profile">
          <strong>Investor profile:</strong> ${r.investor_profile}<br>
          <strong>Family profile:</strong> ${r.family_profile}
        </div>

        ${(() => {
          const listings = getRandomListings(r.id);
          const listingsMeta = LISTINGS[r.id];
          if (!listings.length) {
            if (listingsMeta && listingsMeta.see_all_url) {
              return `
              <div class="region-block">
                <div class="region-block-label">Listings available now</div>
                <a class="region-listings-cta-empty" href="${listingsMeta.see_all_url}" target="_blank" rel="noopener" onclick="fbqTrack('SeeAllListings',{region:'${r.id}'})">
                  See listings in ${r.name} on the official site
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </a>
              </div>`;
            }
            return '';
          }
          const total = listingsMeta && listingsMeta.total_available ? listingsMeta.total_available.toLocaleString('en-US') : '';
          const seeAllUrl = listingsMeta && listingsMeta.see_all_url ? listingsMeta.see_all_url : '#';
          // 6 cards: [0,1]=entry · [2,3]=mid · [4,5]=premium
          const tierByIdx = ['Accessible','Accessible','Mid-range','Mid-range','Premium','Premium'];
          const tierClassByIdx = ['entry','entry','mid','mid','premium','premium'];
          return `
          <div class="region-block">
            <div class="region-block-label">${listings.length} ideal listings for you · among ${total} available in ${r.name}</div>
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
                      ${l.beds ? `<span>${l.beds} beds</span>` : ''}
                      ${l.baths ? `<span>${l.baths} baths</span>` : ''}
                      ${l.sqft && l.sqft !== '0' ? `<span>${l.sqft} ft²</span>` : ''}
                    </div>
                  </div>
                </a>`;
              }).join('')}
            </div>
            <a class="region-listings-cta" href="${seeAllUrl}" target="_blank" rel="noopener" onclick="fbqTrack('SeeAllListings',{region:'${r.id}'})">
              See all ${total} listings in ${r.name} →
            </a>
          </div>`;
        })()}

        <a class="region-wa" href="${WHATSAPP_URL(waMsg)}" target="_blank" rel="noopener" onclick="fbqTrack('RegionWhatsApp', {region: '${r.id}'})">
          <span class="region-wa-ico">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
          </span>
          <span class="region-wa-text">
            <span class="region-wa-title">Talk to André about ${r.name}</span>
            <span class="region-wa-sub">No-pressure guidance · response within 1 hour</span>
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

  // Lazy load background images (regions + listings) — only loads
  // what enters viewport. Mobile saves ~80% bandwidth on first screen.
  hydrateLazyBackgrounds();
}

// =============================================================
// LAZY BACKGROUNDS — IntersectionObserver for background images
// (CSS background-image has no native loading=lazy)
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
        errEl.textContent = 'Please check that name, email and phone are complete.';
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
    const subject = `HOT LEAD - ${firstName} (${top1}) - The Right Property Method`;
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
      `NEW LEAD: ${name}`,
      '====================================',
      '',
      `Name:     ${name}`,
      `Email:    ${email}`,
      `Phone:    ${whatsapp}`,
      `Data:     ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} (ET)`,
      '',
      '--- QUIZ PROFILE ---',
    ];
    Object.entries(answers || {}).forEach(([key, val]) => {
      const spec = ANSWER_LABELS[key];
      if (!spec) return;
      const labelVal = (spec.values && spec.values[val]) || val;
      summaryLines.push(`${spec.label}: ${labelVal}`);
    });
    summaryLines.push('');
    summaryLines.push('--- 3 MATCHED REGIONS ---');
    matches.slice(0, 3).forEach((m, i) => {
      summaryLines.push(`${i + 1}. ${m.name} - ${m.matchScore}% match`);
    });
    summaryLines.push('');
    summaryLines.push('--- RECOMMENDED ACTION ---');
    summaryLines.push(`Direct phone: https://wa.me/${whatsapp.replace(/\D/g, '')}`);
    summaryLines.push(`Reply email: ${email}`);
    summaryLines.push('');
    summaryLines.push('The Right Property Method - sistema-imovel-certo.vercel.app/us/');
    const leadSummary = summaryLines.join('\n');
    const summaryEl = document.getElementById('leadSummary');
    if (summaryEl) summaryEl.value = leadSummary;
    fd.set('lead_summary', leadSummary);

    const btn = form.querySelector('.capture-submit');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = 'Sending…';
    btn.disabled = true;

    // Fire loading IMMEDIATELY (UX feels instant)
    // And submits to Formspree in parallel (background)
    fetch(form.action, {
      method: 'POST',
      body: fd,
      headers: { 'Accept': 'application/json' }
    }).then(r => {
      if (r.ok) fbqTrack('Lead', { name, email });
      else console.warn('[The Right Property Method] Formspree error:', r.status);
    }).catch(err => {
      console.warn('[The Right Property Method] Network error sending lead:', err);
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
// Standard events are optimizable in Ads Manager / GA4 — custom ones are not.
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

  console.log('[The Right Property Method]', eventName, params);
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
// his WhatsApp now comes with full match_data (3 regions + ticket + goal).
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
  const topRegion = matches[0] ? matches[0].name : 'your #1 region';
  target.innerHTML = `
    <div class="consultoria-card">
      <div class="consultoria-tag">
        <span class="consultoria-tag-dot"></span>
        The Right Closing Map™ · 1:1 with André
      </div>

      <h3 class="consultoria-title">
        60 minutos com André Cunha Lima.<br>
        <em>The price of not losing US$ 80,000</em><br>
        buying the wrong Florida county.
      </h3>

      <p class="consultoria-lead">
        You just saw your 3 regions. Now comes the part that crushes Northeast retirees: <strong>picking the wrong building inside the right county</strong>, the wrong <strong>LLC structure</strong>, a <strong>mortgage rate 1.5% above market</strong>, or discovering 6 months in that <strong>the HOA bans short-term rentals</strong> — exactly what you bought it for.
      </p>
      <p class="consultoria-lead">
        Each of these mistakes costs <strong>US$ 80,000 to US$ 880,000</strong>. I have seen it happen 17 times in the last 4 years with Northeast buyers who went alone. <strong>1 hour with me on Zoom prevents all 5 mistakes at once.</strong>
      </p>

      <div class="consultoria-includes-label">What comes out of this 1 hour</div>

      <div class="consultoria-grid">
        <div class="consultoria-cell">
          <span class="consultoria-cell-num">01</span>
          <div>
            <div class="consultoria-cell-title">Live audit of your 3 matched regions</div>
            <div class="consultoria-cell-sub">I look at your ticket, your household, your goal, and tell you WHICH of the three is your decisive play (with applied numbers, not vague) — starting with ${topRegion}.</div>
          </div>
        </div>

        <div class="consultoria-cell">
          <span class="consultoria-cell-num">02</span>
          <div>
            <div class="consultoria-cell-title">Tax + estate strategy</div>
            <div class="consultoria-cell-sub">LLC or personal title. Florida vs Delaware. How to shield for your kids paying near-zero US estate tax. Calculated, not generic.</div>
          </div>
        </div>

        <div class="consultoria-cell">
          <span class="consultoria-cell-num">03</span>
          <div>
            <div class="consultoria-cell-title">Real domestic + Foreign National financing</div>
            <div class="consultoria-cell-sub">Wells Fargo, City National, Truist — which bank approves your profile, in how many days, expected rate today, monthly payment applied to your ticket. Direct introduction to 1-2 partner bankers.</div>
          </div>
        </div>

        <div class="consultoria-cell">
          <span class="consultoria-cell-num">04</span>
          <div>
            <div class="consultoria-cell-title">5 to 8 hand-picked buildings in your match region</div>
            <div class="consultoria-cell-sub">Not MLS scrape. Personal curation: short-term rental allowed, correct school zone, developer kickback, appreciation history. With link, floor plan and price.</div>
          </div>
        </div>

        <div class="consultoria-cell">
          <span class="consultoria-cell-num">05</span>
          <div>
            <div class="consultoria-cell-title">The 5 mistakes that cost US$ 200K-880K</div>
            <div class="consultoria-cell-sub">Personal title instead of LLC. Building that bans rentals. Delaware without foreign LLC in FL. Negative future zoning. Developer that delays 14 months. You leave knowing each trap by name — and how to avoid it.</div>
          </div>
        </div>

        <div class="consultoria-cell">
          <span class="consultoria-cell-num">06</span>
          <div>
            <div class="consultoria-cell-title">90-day plan until closing</div>
            <div class="consultoria-cell-sub">Timeline printed in your email at the end of the call. Day 1 → closing. Documents, deadlines, accounts to open, ITIN, mortgage application. No "I will send it later".</div>
          </div>
        </div>

        <div class="consultoria-cell">
          <span class="consultoria-cell-num">07</span>
          <div>
            <div class="consultoria-cell-title">Access to the full pipeline</div>
            <div class="consultoria-cell-sub">US CPA specializing in non-resident alien. Cross-border tax attorney. Short-term rental manager. School concierge. Decorator. You will not build this network alone.</div>
          </div>
        </div>
      </div>

      <div class="consultoria-promise">
        <span class="consultoria-promise-label">Direct promise:</span>
        You leave the 1-hour call knowing <strong>exactly</strong>: which county you will buy in, which ticket fits your cash, which bank will finance you, which LLC to open, and in how many days you close. Plan printed in your email at the end of the call. <em>No "I will think about it". No "I will send it later".</em>
      </div>

      <div class="consultoria-price-row">
        <div class="consultoria-price">
          <span class="consultoria-price-currency">US$</span>
          <span class="consultoria-price-value">500</span>
          <span class="consultoria-price-unit">/ 60 min · 1:1</span>
        </div>
        <div class="consultoria-anchor">
          <strong>100% credit refunded</strong> no closing<br>
          if you close a property with me within 12 months.
        </div>
      </div>

      <div class="consultoria-roi">
        <span class="consultoria-roi-strike">US$ 80.000 a US$ 880.000</span>
        <span class="consultoria-roi-text">is the documented average loss of Northeast buyers who decided alone. <strong>US$ 500 is the price of avoiding that mistake.</strong> Minimum ROI: <strong>160×</strong>. Real.</span>
      </div>

      <a class="consultoria-cta" href="${STRIPE_CONSULTORIA_URL}" target="_blank" rel="noopener" onclick="fbqTrack('ConsultoriaCheckout',{region:'${matches[0] ? matches[0].id : 'unknown'}',price:500})">
        Book my consultation · US$ 500
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </a>

      <div class="consultoria-trust">
        <div class="consultoria-trust-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          After payment, automatic email with scheduling link (you pick the time)
        </div>
        <div class="consultoria-trust-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          Secure Stripe · domestic + international card ok · one-time payment
        </div>
        <div class="consultoria-trust-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          Zoom 1:1 in EN/PT/ES · 9 years Miami-Dade · 142 families closed
        </div>
        <div class="consultoria-trust-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          Full refund if you do not leave the call with an executable plan
        </div>
      </div>

      <div class="consultoria-disqualifier">
        <strong>Direct disclaimer, no spin:</strong> this consultation is for people with at least US$ 300K cash available and a serious decision within 12 months. <strong>If you are still just researching or cash is below that — do not buy now. Seriously.</strong> US$ 500 makes sense only when it becomes a real move, not study. Keep the free result above. No hard feelings.
      </div>
    </div>
  `;
}

// =============================================================
// LIVE COUNTER — social proof "X buyers online now"
// =============================================================
(function liveCounter(){
  const el = document.getElementById('liveCounterNum');
  if (!el) return;
  // Base anchored on time of day — peak 12-14 + 19-22 ET
  const h = new Date().getHours();
  const peak = (h >= 11 && h <= 14) || (h >= 18 && h <= 23);
  const baseMin = peak ? 240 : 160;
  const baseMax = peak ? 340 : 230;
  let current = Math.floor(baseMin + Math.random() * (baseMax - baseMin));
  el.textContent = current;
  // Oscillates +/-3 every 6-10s
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
