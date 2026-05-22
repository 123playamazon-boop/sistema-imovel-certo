// ==============================================================
// SISTEMA CASA CERTA™ — Sistema de match por lifestyle
// ==============================================================

let REGIONS = [];
let answers = {};
let currentQ = 0;

fetch('regions.json')
  .then(r => r.json())
  .then(data => { REGIONS = data; })
  .catch(err => console.error('Falha ao carregar regions:', err));

// ==============================================================
// 5 QUESTIONS
// ==============================================================
const QUESTIONS = [
  {
    key: 'purpose',
    title: 'Qual seu principal objetivo?',
    sub: 'Saber o porquê da compra muda completamente a recomendação.',
    type: 'cards',
    options: [
      { value: 'live', text: 'Morar nos EUA', sub: 'Mudança permanente da família', icon: '🏠' },
      { value: 'invest', text: 'Investir em dólar', sub: 'Renda passiva + valorização', icon: '💵' },
      { value: 'vacation', text: 'Casa de férias', sub: 'Uso recorrente + opcional aluguel', icon: '🌴' },
      { value: 'protection', text: 'Proteção patrimonial', sub: 'LLC + blindagem sucessória', icon: '🛡️' },
      { value: 'family_move', text: 'Mudança com família', sub: 'Estrutura completa: imóvel + escola + visto', icon: '👨‍👩‍👧' }
    ]
  },
  {
    key: 'lifestyle',
    title: 'Qual estilo de vida combina mais com você?',
    sub: 'Cada região tem uma personalidade. Qual ressoa?',
    type: 'lifestyle',
    options: [
      { value: 'beach', text: 'Praia & lifestyle', sub: 'Pé na areia, ocean view', bg: 'beach' },
      { value: 'urban', text: 'Vida urbana moderna', sub: 'Restaurantes, walking lifestyle', bg: 'urban' },
      { value: 'family', text: 'Ambiente familiar', sub: 'Comunidade BR, escolas top', bg: 'family' },
      { value: 'luxury', text: 'Luxo & exclusividade', sub: 'Edifícios premium, ultra-luxo', bg: 'luxury' },
      { value: 'calm', text: 'Vida tranquila', sub: 'Bairros calmos, espaço, natureza', bg: 'calm' }
    ]
  },
  {
    key: 'budget',
    title: 'Quanto pretende investir?',
    sub: 'Faixa total do imóvel — entrada típica é 30% pra brasileiro não-residente.',
    type: 'cards',
    options: [
      { value: '150-300', text: 'US$ 150K — US$ 300K', sub: 'Entrada US$ 45-90K', icon: '🌱' },
      { value: '300-500', text: 'US$ 300K — US$ 500K', sub: 'Entrada US$ 90-150K', icon: '✨' },
      { value: '500-1000', text: 'US$ 500K — US$ 1M', sub: 'Entrada US$ 150-300K', icon: '💎' },
      { value: '1000+', text: 'US$ 1M ou mais', sub: 'Tier premium / ultra-luxo', icon: '👑' }
    ]
  },
  {
    key: 'kids',
    title: 'Você possui filhos?',
    sub: 'Filhos mudam tudo: escola, school zone, perímetro de segurança.',
    type: 'cards',
    options: [
      { value: 'yes_small', text: 'Sim, pequenos (0-10 anos)', sub: 'Foco escolas + parques + segurança', icon: '👶' },
      { value: 'yes_teen', text: 'Sim, adolescentes (11-18)', sub: 'Foco escola top + universidade', icon: '👨‍🎓' },
      { value: 'yes_adult', text: 'Sim, adultos (fora de casa)', sub: 'Lifestyle livre, casal', icon: '👴' },
      { value: 'no', text: 'Não', sub: 'Foco lifestyle / investimento puro', icon: '🚀' }
    ]
  },
  {
    key: 'timeline',
    title: 'Quando você pretende fechar?',
    sub: 'Última pergunta. Isso define urgência da estrutura.',
    type: 'cards',
    options: [
      { value: 'q90', text: 'Próximos 90 dias', sub: 'Decisão tomada, pronto pra agir', icon: '🚀' },
      { value: 'q180', text: '3 a 6 meses', sub: 'Planejamento ativo', icon: '📅' },
      { value: 'q365', text: '6 a 12 meses', sub: 'Comparando opções', icon: '🔍' },
      { value: 'research', text: 'Só pesquisando', sub: 'Educacional, sem urgência', icon: '📚' }
    ]
  }
];

// ==============================================================
// FLOW CONTROL
// ==============================================================
function startFlow() {
  document.querySelector('.quiz-section').classList.add('active');
  document.querySelectorAll('.section, .hero, .emotional, .footer, .testimonials').forEach(s => {
    if (!s.classList.contains('quiz-section')) s.style.display = 'none';
  });
  document.querySelector('.nav').style.display = 'none';
  currentQ = 0;
  answers = {};
  renderQuestion();
  window.scrollTo({top:0,behavior:'smooth'});
  fbqTrack('StartFlow');
}

function renderQuestion() {
  const q = QUESTIONS[currentQ];
  const total = QUESTIONS.length;
  const pct = ((currentQ+1)/total)*100;
  document.getElementById('quizProgress').style.width = pct + '%';
  document.getElementById('qNum').textContent = currentQ+1;

  let optionsHTML = '';
  if (q.type === 'lifestyle') {
    optionsHTML = `
      <div class="quiz-lifestyle-grid">
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
    optionsHTML = `
      <div class="quiz-options">
        ${q.options.map(opt => `
          <button class="quiz-option" onclick="selectOption('${q.key}','${opt.value}')">
            <div class="quiz-option-icon">${opt.icon}</div>
            <div class="quiz-option-text">${opt.text}</div>
            <div class="quiz-option-sub">${opt.sub}</div>
            <span class="quiz-option-arrow">→</span>
          </button>
        `).join('')}
      </div>
    `;
  }

  const html = `
    <div class="quiz-question">
      <h2>${q.title}</h2>
      <p>${q.sub}</p>
    </div>
    ${optionsHTML}
  `;
  document.getElementById('qContent').innerHTML = html;
}

function selectOption(key, value) {
  answers[key] = value;
  fbqTrack('QuestionAnswered', {question: key, answer: value});
  currentQ++;
  if (currentQ < QUESTIONS.length) {
    renderQuestion();
    window.scrollTo({top:0,behavior:'smooth'});
  } else {
    finishFlow();
  }
}

function finishFlow() {
  document.querySelector('.quiz-section').classList.remove('active');
  document.getElementById('loading').classList.add('active');
  window.scrollTo({top:0,behavior:'smooth'});
  fbqTrack('FlowCompleted');

  const steps = [
    'Cruzando 305.000 imóveis em 5 regiões...',
    'Analisando lifestyle compatível...',
    'Verificando escolas e school zones...',
    'Calculando cap rate e rendimento projetado...',
    'Identificando as 3 regiões ideais...'
  ];
  let i = 0;
  const interval = setInterval(() => {
    if (i < steps.length) {
      document.getElementById('loadingStep').textContent = steps[i];
      i++;
    } else {
      clearInterval(interval);
      showResults();
    }
  }, 800);
}

// ==============================================================
// MATCHING ALGORITHM (regions)
// ==============================================================
function calculateRegionMatch(region) {
  let score = 0;
  let maxScore = 0;

  // Lifestyle match (peso 30)
  if (region.lifestyle_score && region.lifestyle_score[answers.lifestyle]) {
    score += region.lifestyle_score[answers.lifestyle] * 6;
  }
  maxScore += 30;

  // Purpose match (peso 25)
  if (region.purpose_score && region.purpose_score[answers.purpose]) {
    score += region.purpose_score[answers.purpose] * 5;
  }
  maxScore += 25;

  // Budget match (peso 25)
  const budgetMin = {
    '150-300': 150000, '300-500': 300000, '500-1000': 500000, '1000+': 1000000
  };
  const budgetMax = {
    '150-300': 300000, '300-500': 500000, '500-1000': 1000000, '1000+': 50000000
  };
  const userMin = budgetMin[answers.budget];
  const userMax = budgetMax[answers.budget];

  // Parse region ticket range
  const ticketMatch = region.ticket_range.match(/\$\s*(\d+)K?\s*[—-]\s*\$?\s*(\d+\.?\d*)\s*([KM])/i);
  if (ticketMatch) {
    const regionMin = parseInt(ticketMatch[1]) * 1000;
    const regionMaxNum = parseFloat(ticketMatch[2]);
    const regionMaxUnit = ticketMatch[3].toUpperCase();
    const regionMax = regionMaxUnit === 'M' ? regionMaxNum * 1000000 : regionMaxNum * 1000;

    // Check overlap
    if (userMin <= regionMax && userMax >= regionMin) {
      score += 25; // Full match if budgets overlap
    } else if (Math.abs(userMin - regionMax) < 200000 || Math.abs(userMax - regionMin) < 200000) {
      score += 12; // Partial match if close
    }
  }
  maxScore += 25;

  // Kids/family bonus (peso 20)
  if (answers.kids === 'yes_small' || answers.kids === 'yes_teen') {
    // Family-friendly regions get bonus
    if (region.lifestyle_score && region.lifestyle_score.family >= 4) {
      score += 20;
    } else if (region.lifestyle_score && region.lifestyle_score.family >= 3) {
      score += 12;
    } else {
      score += 4;
    }
  } else if (answers.kids === 'no') {
    // No kids = bonus for urban/luxury
    if (region.lifestyle_score && (region.lifestyle_score.urban >= 4 || region.lifestyle_score.luxury >= 4)) {
      score += 20;
    } else {
      score += 12;
    }
  } else {
    score += 14; // neutral
  }
  maxScore += 20;

  return Math.round((score/maxScore)*100);
}

function getMatchedRegions() {
  const scored = REGIONS.map(r => ({
    ...r,
    matchScore: calculateRegionMatch(r)
  }));
  scored.sort((a,b) => b.matchScore - a.matchScore);
  return scored.slice(0, 3); // Top 3 regions
}

// ==============================================================
// RESULTS DISPLAY
// ==============================================================
function showResults() {
  document.getElementById('loading').classList.remove('active');
  document.getElementById('results').classList.add('active');
  window.scrollTo({top:0,behavior:'smooth'});

  const matches = getMatchedRegions();

  document.getElementById('matchData').value = JSON.stringify({
    answers: answers,
    matches: matches.map(m => ({id: m.id, name: m.name, score: m.matchScore}))
  });

  document.getElementById('regionsGrid').innerHTML = matches.map((r, idx) => `
    <div class="region-card">
      <div class="region-img" style="background-image:url('${r.image}')">
        <span class="region-rank">${idx+1}</span>
        <span class="region-match">${r.matchScore}% match</span>
      </div>
      <div class="region-body">
        <div class="region-name">${r.name}</div>
        <div class="region-state">${r.state}</div>
        <div class="region-tagline">${r.tagline}</div>
        <div class="region-stats">
          <div>
            <div class="region-stat-label">Valorização anual</div>
            <div class="region-stat-value">${r.appreciation}</div>
          </div>
          <div>
            <div class="region-stat-label">Ticket típico</div>
            <div class="region-stat-value">${r.ticket_range}</div>
          </div>
          <div>
            <div class="region-stat-label">Renda mensal</div>
            <div class="region-stat-value">${r.rental_income}</div>
          </div>
          <div>
            <div class="region-stat-label">Match score</div>
            <div class="region-stat-value">${r.matchScore}%</div>
          </div>
        </div>
        <div class="region-profile">
          <strong>Perfil investidor:</strong> ${r.investor_profile}<br><br>
          <strong>Perfil família:</strong> ${r.family_profile}
        </div>
        <div class="region-highlights">
          ${r.highlights.map(h => `<div class="region-highlight">${h}</div>`).join('')}
        </div>
      </div>
    </div>
  `).join('');

  fbqTrack('ResultsShown', {matchCount: matches.length});
}

// ==============================================================
// EMAIL CAPTURE
// ==============================================================
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('captureForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('.capture-submit');
      const originalText = btn.textContent;
      btn.textContent = 'Enviando...';
      btn.disabled = true;

      const formData = new FormData(form);
      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: {'Accept': 'application/json'}
        });
        if (response.ok) {
          document.getElementById('results').classList.remove('active');
          document.getElementById('thanks').classList.add('active');
          window.scrollTo({top:0,behavior:'smooth'});
          fbqTrack('Lead');
        } else {
          btn.textContent = originalText;
          btn.disabled = false;
          alert('Erro ao enviar. Tenta novamente.');
        }
      } catch (err) {
        btn.textContent = originalText;
        btn.disabled = false;
        alert('Erro de conexão. Tenta novamente.');
      }
    });
  }
});

// ==============================================================
// TRACKING
// ==============================================================
function fbqTrack(eventName, params = {}) {
  if (typeof fbq === 'function') fbq('trackCustom', eventName, params);
  if (window.clarity) clarity('event', eventName);
  console.log('[Track]', eventName, params);
}
