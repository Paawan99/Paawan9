/* ============================================
   PAAWAN SHAH — CHATBOT WIDGET
   Fixed AI assistant for site navigation
   Mini robot trigger
   ============================================ */
(function(){
'use strict';

// ─── Inject CSS ───
const css = document.createElement('style');
css.textContent = `
/* ═══ CHATBOT TRIGGER ═══ */
.cb-trigger{position:fixed;z-index:9999;width:64px;height:64px;border-radius:18px;background:linear-gradient(145deg,#ffffff,#e9f2f7);border:1px solid rgba(17,35,53,0.14);cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 16px 38px rgba(17,35,53,0.18);font-size:26px;line-height:1;overflow:visible;bottom:24px;right:24px;transition:transform .25s cubic-bezier(.16,1,.3,1),box-shadow .25s ease,opacity .25s ease}
.cb-trigger:hover{transform:translateY(-3px) scale(1.04) !important;box-shadow:0 20px 46px rgba(8,127,140,0.24)}
.cb-trigger.open{transform:scale(0) !important;opacity:0;pointer-events:none}
.cb-trigger .cb-badge{position:absolute;top:-4px;right:-4px;width:16px;height:16px;background:#22c55e;border-radius:50%;border:2px solid #fff;animation:cb-pulse 2s infinite}
@keyframes cb-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.25)}}

.cb-trigger.idle:not(.open):not(:hover) .cb-robot-head{animation:cb-breathe 2.8s ease-in-out infinite}
@keyframes cb-breathe{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}

.cb-robot{width:46px;height:46px;position:relative;display:block}
.cb-robot-head{position:absolute;inset:9px 6px 6px;border-radius:13px;background:linear-gradient(145deg,#087f8c,#5266d9);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.34)}
.cb-robot-head::before{content:'';position:absolute;left:10px;right:10px;top:-7px;height:8px;border-radius:8px 8px 0 0;background:#5266d9}
.cb-eye{position:absolute;top:14px;width:7px;height:7px;border-radius:50%;background:#ffffff;box-shadow:0 0 10px rgba(255,255,255,0.9)}
.cb-eye.left{left:14px}.cb-eye.right{right:14px}
.cb-mouth{position:absolute;left:16px;right:16px;bottom:12px;height:3px;border-radius:3px;background:rgba(255,255,255,0.82)}

/* speech bubble tail on the icon */
.cb-tail{position:absolute;bottom:-6px;right:4px;width:14px;height:14px;overflow:hidden}
.cb-tail::before{content:'';display:block;width:14px;height:14px;background:linear-gradient(135deg,#6c5ce7,#a855f7);border-radius:0 0 0 10px;transform:rotate(0deg)}

/* ═══ CHATBOT PANEL ═══ */
.cb-panel{position:fixed;bottom:24px;right:24px;z-index:10000;width:380px;height:560px;background:#f8fbfd;border-radius:20px;box-shadow:0 24px 70px rgba(17,35,53,0.28);border:1px solid rgba(17,35,53,0.1);display:flex;flex-direction:column;overflow:hidden;transform:scale(0.4) translateY(40px);opacity:0;pointer-events:none;transform-origin:bottom right;transition:all .35s cubic-bezier(.16,1,.3,1)}
.cb-panel.open{transform:scale(1) translateY(0);opacity:1;pointer-events:all}

/* header */
.cb-head{background:linear-gradient(135deg,#087f8c,#5266d9);padding:16px 18px;display:flex;align-items:center;gap:12px;flex-shrink:0}
.cb-avatar{width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,0.18);display:flex;align-items:center;justify-content:center;font-size:22px;backdrop-filter:blur(8px)}
.cb-head-info h2{color:#fff;font-size:15px;font-weight:700;font-family:'Outfit',sans-serif;margin:0}
.cb-head-info p{color:rgba(255,255,255,0.7);font-size:11px;margin:2px 0 0;font-family:'JetBrains Mono',monospace}
.cb-close{margin-left:auto;background:rgba(255,255,255,0.15);border:none;width:32px;height:32px;border-radius:50%;color:#fff;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s}
.cb-close:hover{background:rgba(255,255,255,0.3)}

/* messages area */
.cb-body{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;scroll-behavior:smooth}
.cb-body::-webkit-scrollbar{width:3px}
.cb-body::-webkit-scrollbar-thumb{background:rgba(108,92,231,0.3);border-radius:3px}

/* messages */
.cb-msg{max-width:88%;animation:cb-slide .3s cubic-bezier(.16,1,.3,1)}
@keyframes cb-slide{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.cb-bot{align-self:flex-start}
.cb-bot .cb-bubble{background:#ffffff;color:#24384c;padding:12px 16px;border-radius:4px 16px 16px 16px;font-size:13.5px;line-height:1.6;border:1px solid rgba(17,35,53,0.08);font-family:'Outfit',sans-serif}
.cb-user{align-self:flex-end}
.cb-user .cb-bubble{background:linear-gradient(135deg,#6c5ce7,#a855f7);color:#fff;padding:12px 16px;border-radius:16px 4px 16px 16px;font-size:13.5px;line-height:1.6;font-family:'Outfit',sans-serif}

/* options */
.cb-opts{display:flex;flex-wrap:wrap;gap:7px;margin-top:8px;animation:cb-slide .35s cubic-bezier(.16,1,.3,1)}
.cb-opt{background:rgba(8,127,140,0.08);border:1px solid rgba(8,127,140,0.24);color:#087f8c;padding:9px 16px;border-radius:20px;cursor:pointer;font-size:12.5px;font-family:'Outfit',sans-serif;font-weight:500;transition:all .2s;line-height:1.3}
.cb-opt:hover{background:rgba(8,127,140,0.18);border-color:#087f8c;color:#112335;transform:translateY(-1px);box-shadow:0 3px 12px rgba(8,127,140,0.14)}

/* typing dots */
.cb-typing{display:flex;gap:4px;padding:12px 16px;align-self:flex-start}
.cb-typing span{width:7px;height:7px;background:#6c5ce7;border-radius:50%;animation:cb-bounce 1.4s infinite}
.cb-typing span:nth-child(2){animation-delay:.2s}
.cb-typing span:nth-child(3){animation-delay:.4s}
@keyframes cb-bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-7px)}}

/* result card */
.cb-result{background:linear-gradient(135deg,rgba(108,92,231,0.12),rgba(168,85,247,0.08));border:1px solid rgba(108,92,231,0.25);border-radius:14px;padding:16px;margin-top:6px}
.cb-result h4{color:#087f8c;font-size:14px;margin:0 0 6px;font-family:'Outfit',sans-serif}
.cb-result p{color:#34475b;font-size:12.5px;line-height:1.5;margin:0;font-family:'Outfit',sans-serif}
.cb-go-btn{display:inline-block;margin-top:10px;padding:8px 18px;background:linear-gradient(135deg,#6c5ce7,#a855f7);color:#fff;border:none;border-radius:12px;font-size:12px;font-family:'Outfit',sans-serif;font-weight:600;cursor:pointer;transition:all .2s}
.cb-go-btn:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(108,92,231,0.35)}
.cb-restart{background:rgba(108,92,231,0.1);border:1px dashed rgba(108,92,231,0.35);color:#a78bfa;padding:8px 18px;border-radius:12px;cursor:pointer;font-size:12px;font-family:'Outfit',sans-serif;font-weight:600;margin-top:8px;transition:all .2s;display:inline-block}
.cb-restart:hover{background:rgba(108,92,231,0.25);color:#fff}
.cb-search{display:flex;gap:8px;margin-top:10px}
.cb-search input{flex:1;min-width:0;border:1px solid rgba(17,35,53,0.12);border-radius:12px;padding:10px 12px;font-size:13px;color:#24384c;background:#fff;font-family:'Outfit',sans-serif;outline:none}
.cb-search input:focus{border-color:#087f8c;box-shadow:0 0 0 3px rgba(8,127,140,0.12)}
.cb-search button{border:none;border-radius:12px;padding:10px 12px;background:linear-gradient(135deg,#087f8c,#5266d9);color:#fff;font-size:12px;font-weight:700;font-family:'Outfit',sans-serif;cursor:pointer}
.cb-link-list{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.cb-link-list a{color:#087f8c;text-decoration:none;border-bottom:1px solid rgba(8,127,140,0.25)}
.cb-mini-note{display:block;margin-top:8px;color:#6b7b8c;font-size:11.5px;line-height:1.45}

/* mobile */
@media(max-width:500px){
  .cb-panel{bottom:0;right:0;left:0;width:100%;height:100%;border-radius:0;max-height:100dvh}
  .cb-trigger{width:54px;height:54px;font-size:22px}
}
`;
document.head.appendChild(css);

// ─── Inject HTML ───
const trigger = document.createElement('button');
trigger.className = 'cb-trigger idle';
trigger.setAttribute('aria-label','Open chat assistant');
trigger.innerHTML = `<span class="cb-robot" aria-hidden="true"><span class="cb-robot-head"><span class="cb-eye left"></span><span class="cb-eye right"></span><span class="cb-mouth"></span></span></span><span class="cb-badge"></span>`;
document.body.appendChild(trigger);

const panel = document.createElement('div');
panel.className = 'cb-panel';
panel.innerHTML = `
<div class="cb-head">
  <div class="cb-avatar">💬</div>
  <div class="cb-head-info">
    <h2>Paawan's Assistant</h2>
    <p>● online &middot; here to help</p>
  </div>
  <button class="cb-close" aria-label="Close chat">&times;</button>
</div>
<div class="cb-body" id="cbBody"></div>
`;
document.body.appendChild(panel);

const body = document.getElementById('cbBody');

let chatOpen = false;
const siteData = { banks: [], cards: [], loaded: false, loading: null, error: null };

function dataUrl(file) {
  return new URL('/data/' + file, window.location.origin).toString();
}

async function loadSiteData() {
  if (siteData.loaded) return siteData;
  if (siteData.loading) return siteData.loading;
  siteData.loading = Promise.all([
    fetch(dataUrl('bank-kb-lite.json'), { cache: 'no-store' }).then(r => {
      if (!r.ok) throw new Error('Bank data HTTP ' + r.status);
      return r.json();
    }),
    fetch(dataUrl('credit-cards.json'), { cache: 'no-store' }).then(r => {
      if (!r.ok) throw new Error('Card data HTTP ' + r.status);
      return r.json();
    })
  ]).then(([bankPayload, cardPayload]) => {
    siteData.banks = Array.isArray(bankPayload.banks) ? bankPayload.banks : [];
    siteData.cards = Array.isArray(cardPayload.cards) ? cardPayload.cards : [];
    siteData.loaded = true;
    siteData.error = null;
    return siteData;
  }).catch(err => {
    siteData.error = err;
    siteData.loaded = false;
    console.error('Unable to load bank/card chatbot data:', err);
    return siteData;
  });
  return siteData.loading;
}

function esc(value) {
  return String(value ?? '').replace(/[&<>'"]/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[ch]));
}

function norm(value) {
  return String(value || '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9+]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function compact(value, max = 260) {
  const text = String(value || '').replace(/^#+\s*/gm, '').replace(/\s+/g, ' ').trim();
  return text.length > max ? text.slice(0, max - 1).trim() + '...' : text;
}

function bankCards(bank) {
  return siteData.cards.filter(card => card.dataSource && card.dataSource.institutionId === bank.institutionId);
}

function findBanks(query) {
  const q = norm(query);
  if (!q) return [];
  const stopWords = new Set(['a','an','and','the','of','for','bank','banks','credit','union','unions','financial','real','not']);
  const terms = q.split(' ').filter(term => term.length >= 3 && !stopWords.has(term));
  if (!terms.length && !['big 6','big six','digital'].some(kind => q.includes(kind))) return [];
  return siteData.banks.map(bank => {
    const aliases = [bank.title, bank.institutionId, bank.category, bank.type, bank.headquarters, bank.locationSummary, ...(bank.aliases || [])].map(norm).join(' ');
    let score = 0;
    if (norm(bank.title) === q || norm(bank.institutionId) === q) score += 50;
    if ((bank.aliases || []).some(a => norm(a) === q)) score += 45;
    if (aliases.includes(q)) score += 20;
    terms.forEach(term => { if (aliases.includes(term)) score += 5; });
    return { bank, score };
  }).filter(item => item.score > 0).sort((a, b) => b.score - a.score).map(item => item.bank).slice(0, 6);
}

function banksByCategory(kind) {
  const match = kind === 'credit-union' ? 'credit union' : kind === 'digital' ? 'digital' : 'big 6';
  return siteData.banks.filter(bank => norm(bank.category).includes(match));
}

function renderBankProfile(bank) {
  const cards = bankCards(bank);
  const businessCards = Array.isArray(bank.businessCreditCards) ? bank.businessCreditCards : [];
  const sources = (bank.sources || []).slice(0, 4);
  const sourceLinks = sources.length
    ? `<span class="cb-link-list">${sources.map(src => `<a href="${esc(src.url)}" target="_blank" rel="noopener">${esc(src.label || 'Source')}</a>`).join('')}</span>`
    : '<span class="cb-mini-note">No public source links are available in the current bank database.</span>';
  const cardText = cards.length
    ? cards.slice(0, 5).map(card => esc(card.name)).join('<br>')
    : (bank.cardsSectionPresent ? 'Personal card section exists in the source notes, but no structured card names are linked yet.' : 'No personal card data confirmed in the current database.');
  const businessText = businessCards.length
    ? businessCards.slice(0, 5).map(card => esc(card.name)).join('<br>')
    : 'No business credit card data confirmed in the current database.';
  const caveats = [];
  if (!bank.locationSummary) caveats.push('Physical presence is not confirmed in the current data.');
  if (!cards.length && !businessCards.length) caveats.push('Card availability is incomplete or not confirmed.');
  if (String(bank.locationSummary || '').toUpperCase().includes('UNVERIFIED')) caveats.push('Some location details are marked UNVERIFIED in the source notes.');
  return `
    <strong>${esc(bank.title)}</strong><br>
    ${esc(bank.category || 'Institution')} ${bank.type ? '&middot; ' + esc(bank.type) : ''}<br>
    ${bank.headquarters ? '<strong>HQ:</strong> ' + esc(bank.headquarters) + '<br>' : ''}
    ${bank.status ? '<strong>Status:</strong> ' + esc(bank.status) + '<br>' : ''}
    <br><strong>Physical presence</strong><br>${esc(compact(bank.locationSummary || 'The current bank database does not confirm physical branch presence.'))}
    <br><br><strong>Personal credit cards</strong><br>${cardText}
    <br><br><strong>Business credit cards</strong><br>${businessText}
    <br><br><strong>Sources</strong><br>${sourceLinks}
    ${caveats.length ? `<span class="cb-mini-note"><strong>Caveat:</strong> ${esc(caveats.join(' '))}</span>` : ''}
  `;
}

trigger.addEventListener('mouseenter', () => {
  trigger.classList.remove('idle');
});
trigger.addEventListener('mouseleave', () => {
  if (!chatOpen) trigger.classList.add('idle');
});

// Open / Close
trigger.addEventListener('click', () => { openChat(); });
panel.querySelector('.cb-close').addEventListener('click', () => { closeChat(); });

function openChat(){
  chatOpen = true;
  trigger.classList.add('open');
  trigger.classList.remove('idle');
  panel.classList.add('open');
  if(!body.hasChildNodes()) boot();
}
function closeChat(){
  chatOpen = false;
  trigger.classList.remove('open');
  panel.classList.remove('open');
  if(!chatOpen) trigger.classList.add('idle');
}

// ─── Conversation Tree ───
const T = {
  start: {
    msg: "Hey! 👋 I'm Paawan's site assistant. I can help you explore anything here — credit cards, games, markets, or just get to know Paawan. What brings you here today?",
    opts: [
      { text: "🔍 Help me explore", next: "explore" },
      { text: "💳 Credit cards", next: "cc_start" },
      { text: "🏦 Banks & credit unions", next: "banks_start" },
      { text: "🎮 Play a game", next: "games" },
      { text: "📈 Markets info", next: "markets" },
      { text: "👤 About Paawan", next: "about" }
    ]
  },

  // ─── EXPLORE ───
  explore: {
    msg: "Great! This site has a lot packed in. What sounds interesting?",
    opts: [
      { text: "💳 Find the best credit card for me", next: "cc_start" },
      { text: "🏦 Search banks & credit unions", next: "banks_start" },
      { text: "🎮 I want to play games", next: "games" },
      { text: "📈 Tell me about Markets", next: "markets" },
      { text: "✍️ Read some blogs", next: "blogs" },
      { text: "👤 Who is Paawan?", next: "about" },
      { text: "📬 Contact info", next: "contact" }
    ]
  },

  // ─── CREDIT CARDS ───
  cc_start: {
    msg: "Nice — the Credit Card Finder has **63 Canadian cards** from every major bank and credit union. Let me point you in the right direction. What's your main goal?",
    opts: [
      { text: "💰 Earn cashback", next: "cc_cashback" },
      { text: "✈️ Travel rewards", next: "cc_travel" },
      { text: "📉 Low interest rate", next: "cc_low" },
      { text: "🆓 No annual fee", next: "cc_nofee" },
      { text: "🏗️ Build my credit", next: "cc_build" },
      { text: "🔍 Take the full quiz", next: "cc_quiz" }
    ]
  },
  cc_cashback: {
    msg: "Cashback is king! 👑 How much do you spend per month roughly?",
    opts: [
      { text: "Under $1,000", next: "cc_cb_low" },
      { text: "$1,000 – $3,000", next: "cc_cb_mid" },
      { text: "$3,000+", next: "cc_cb_high" }
    ]
  },
  cc_cb_low: {
    msg: "For lower spend, no-fee cards are your best bet so rewards aren't eaten by fees.",
    result: true, emoji: "💳", title: "Top Picks for You",
    desc: "• Tangerine Money-Back (2% in 3 categories, $0 fee)\n• BMO CashBack MC (3% groceries, $0 fee)\n• PC World Elite MC (4.5% at Shoppers, $0 fee)",
    action: { type: "link", label: "Take the Full Quiz →", url: "/" }
  },
  cc_cb_mid: {
    msg: "Mid-range spender — you can justify a small annual fee for much better rates.",
    result: true, emoji: "🔥", title: "Top Picks for You",
    desc: "• CIBC Dividend Visa Infinite (4% groceries, $99/yr)\n• Scotia Momentum Infinite (4% groceries & bills)\n• Amex SimplyCash Preferred (4% groceries & gas)",
    action: { type: "link", label: "Take the Full Quiz →", url: "/" }
  },
  cc_cb_high: {
    msg: "High spender! Premium cards will pay for themselves easily with your volume.",
    result: true, emoji: "👑", title: "Top Picks for You",
    desc: "• BMO CashBack World Elite (5% groceries, 4% transit)\n• RBC Cash Back Preferred WE (1.5% on EVERYTHING)\n• Neo World Elite MC (5% groceries, 3% gas)",
    action: { type: "link", label: "Take the Full Quiz →", url: "/" }
  },
  cc_travel: {
    msg: "Travel rewards — great choice! ✈️ Do you prefer Aeroplan (Air Canada) or flexible points?",
    opts: [
      { text: "Aeroplan all the way", next: "cc_travel_ap" },
      { text: "Flexible points", next: "cc_travel_flex" },
      { text: "Just no foreign fees", next: "cc_travel_nofx" }
    ]
  },
  cc_travel_ap: {
    result: true, emoji: "✈️", title: "Best Aeroplan Cards",
    desc: "• TD Aeroplan Visa Infinite ($139/yr, buddy pass)\n• CIBC Aeroplan Visa Infinite (1.5x groceries & gas)\n• Amex Aeroplan Card (2x on Air Canada)",
    action: { type: "link", label: "Take the Full Quiz →", url: "/" }
  },
  cc_travel_flex: {
    result: true, emoji: "🌍", title: "Best Flexible Travel Cards",
    desc: "• Amex Cobalt (5x dining & groceries, MR-S points)\n• TD First Class Travel Infinite (3x on travel)\n• Scotiabank Passport Infinite (no FX fee + Scene+)",
    action: { type: "link", label: "Take the Full Quiz →", url: "/" }
  },
  cc_travel_nofx: {
    result: true, emoji: "🌎", title: "No Foreign Transaction Fee Cards",
    desc: "• Home Trust Preferred Visa ($0 fee, 0% FX, 1% CB)\n• Scotiabank Passport Visa Infinite (0% FX + Scene+)\n• Scotiabank Gold Amex (0% FX, 5x dining & groceries)",
    action: { type: "link", label: "Take the Full Quiz →", url: "/" }
  },
  cc_low: {
    result: true, emoji: "📉", title: "Best Low Interest Cards",
    desc: "• Desjardins Flexi Visa (10.90% — lowest in Canada!)\n• Servus Low Rate MC (11.99%)\n• TD Emerald Flex Rate (8.99% — super low)\n• MBNA True Line (12.99% + 0% intro on transfers)",
    action: { type: "link", label: "Take the Full Quiz →", url: "/" }
  },
  cc_nofee: {
    result: true, emoji: "🆓", title: "Best No-Fee Cards",
    desc: "• Tangerine Money-Back (2% in 3 chosen categories)\n• PC World Elite MC (4.5% Shoppers, 3% grocery — $0!)\n• Triangle World Elite MC (3% grocery, insurance — $0!)\n• Rogers World Elite MC (1.5% everything — $0!)",
    action: { type: "link", label: "Take the Full Quiz →", url: "/" }
  },
  cc_build: {
    result: true, emoji: "🏗️", title: "Best Cards to Build Credit",
    desc: "• Neo Secured MC ($0 fee, min $50 deposit, cashback)\n• Home Trust Secured Visa (reports to bureaus)\n• BMO CashBack MC (good starter, $0 fee)\n• Scene+ Visa ($0 fee, easy approval)",
    action: { type: "link", label: "Take the Full Quiz →", url: "/" }
  },
  cc_quiz: {
    msg: "Smart move — the full quiz scores all 63 cards against your exact profile. Let me take you there!",
    result: true, emoji: "🧠", title: "Credit Card Finder Quiz",
    desc: "Answer 5 quick questions about your goals, spending, and credit score — get personalized top 5 recommendations from 63 Canadian cards.",
    action: { type: "link", label: "Start the Quiz →", url: "/" }
  },

  // BANKS AND CREDIT UNIONS
  banks_start: {
    handler: 'banksMenu'
  },
  banks_search: {
    handler: 'bankSearch'
  },
  banks_big6: {
    handler: 'bankBrowse',
    category: 'big6',
    title: 'Big 6 Banks'
  },
  banks_credit_unions: {
    handler: 'bankBrowse',
    category: 'credit-union',
    title: 'Credit Unions'
  },
  banks_digital: {
    handler: 'bankBrowse',
    category: 'digital',
    title: 'Digital Banks'
  },

  // ─── GAMES ───
  games: {
    msg: "Game time! 🎮 We've got 4 games built right into the site. What sounds fun?",
    opts: [
      { text: "🐍 Snake", next: "game_snake" },
      { text: "🔢 2048", next: "game_2048" },
      { text: "🧠 Memory Match", next: "game_memory" },
      { text: "⌨️ Typing Speed", next: "game_typing" },
      { text: "🎲 Surprise me!", next: "game_random" }
    ]
  },
  game_snake: {
    result: true, emoji: "🐍", title: "Snake",
    desc: "The classic! Use arrow keys or swipe to grow your snake. Don't hit the walls or yourself.",
    action: { type: "link", label: "Play Snake →", url: "https://paawanshah99.com/games.html#snake", newTab: true }
  },
  game_2048: {
    result: true, emoji: "🔢", title: "2048",
    desc: "Slide tiles to combine numbers. Can you reach 2048? It's deceptively addictive.",
    action: { type: "link", label: "Play 2048 →", url: "https://paawanshah99.com/games.html#2048", newTab: true }
  },
  game_memory: {
    result: true, emoji: "🧠", title: "Memory Match",
    desc: "Flip cards and find matching pairs. Tests your memory in the best way.",
    action: { type: "link", label: "Play Memory →", url: "https://paawanshah99.com/games.html#memory", newTab: true }
  },
  game_typing: {
    result: true, emoji: "⌨️", title: "Typing Speed Test",
    desc: "How fast can you type? Race against the clock and measure your WPM.",
    action: { type: "link", label: "Play Typing →", url: "https://paawanshah99.com/games.html#typing", newTab: true }
  },
  game_random: {
    msg: "Let fate decide... 🎲",
    auto: function(){ return ['game_snake','game_2048','game_memory','game_typing'][Math.floor(Math.random()*4)]; }
  },

  // ─── MARKETS ───
  markets: {
    msg: "The Markets section covers equity research and capital markets insights. What interests you?",
    opts: [
      { text: "📊 What's covered?", next: "markets_info" },
      { text: "🔍 Take me there", next: "markets_go" }
    ]
  },
  markets_info: {
    result: true, emoji: "📊", title: "Markets & Analytics",
    desc: "Equity research, M&A advisory insights, portfolio construction frameworks, and capital markets intelligence — Paawan's professional domain.",
    action: { type: "slide", label: "Go to Markets →", slide: 2 }
  },
  markets_go: {
    msg: "Taking you to the Markets slide!",
    action: { type: "slide", slide: 2, autoNav: true }
  },

  // ─── BLOGS ───
  blogs: {
    msg: "The Blog section has Paawan's thoughts on finance, tech, and more. Want to check it out?",
    opts: [
      { text: "📝 Take me there", next: "blogs_go" },
      { text: "← Back to menu", next: "explore" }
    ]
  },
  blogs_go: {
    msg: "Navigating to Blogs!",
    action: { type: "slide", slide: 4, autoNav: true }
  },

  // ─── ABOUT ───
  about: {
    msg: "Paawan Shah is a Finance & Analytics professional. What would you like to know?",
    opts: [
      { text: "🎓 Background & skills", next: "about_skills" },
      { text: "💼 Experience", next: "about_exp" },
      { text: "🔗 See full About page", next: "about_go" },
      { text: "📬 Get in touch", next: "contact" }
    ]
  },
  about_skills: {
    result: true, emoji: "🎓", title: "Skills & Background",
    desc: "Specializes in equity research, M&A advisory, portfolio construction, financial modeling, and data analytics. Proficient in Python, SQL, Excel/VBA, and visualization tools.",
    action: { type: "slide", label: "View About Section →", slide: 5 }
  },
  about_exp: {
    result: true, emoji: "💼", title: "Professional Experience",
    desc: "Background in finance with hands-on experience in capital markets, research analysis, and building data-driven insights for investment decisions.",
    action: { type: "slide", label: "View About Section →", slide: 5 }
  },
  about_go: {
    msg: "Taking you to the About section!",
    action: { type: "slide", slide: 5, autoNav: true }
  },

  // ─── CONTACT ───
  contact: {
    result: true, emoji: "📬", title: "Get in Touch",
    desc: "Email, LinkedIn, or GitHub — all the ways to reach Paawan are on the Contact slide.",
    action: { type: "slide", label: "Go to Contact →", slide: 6 }
  }
};

// ─── Engine ───
function addBot(text){
  const d = document.createElement('div');
  d.className = 'cb-msg cb-bot';
  // support **bold**
  const html = text.replace(/\*\*(.*?)\*\*/g,'<strong style="color:#c4b5fd">$1</strong>');
  d.innerHTML = '<div class="cb-bubble">' + html + '</div>';
  body.appendChild(d);
  scrollBottom();
}
function addUser(text){
  const d = document.createElement('div');
  d.className = 'cb-msg cb-user';
  d.innerHTML = '<div class="cb-bubble">' + text + '</div>';
  body.appendChild(d);
  scrollBottom();
}
function showTyping(){
  const d = document.createElement('div');
  d.className = 'cb-typing';
  d.id = 'cbTyping';
  d.innerHTML = '<span></span><span></span><span></span>';
  body.appendChild(d);
  scrollBottom();
}
function hideTyping(){
  const el = document.getElementById('cbTyping');
  if(el) el.remove();
}
function showOpts(opts){
  const c = document.createElement('div');
  c.className = 'cb-opts';
  c.id = 'cbOpts';
  opts.forEach(o => {
    const b = document.createElement('button');
    b.className = 'cb-opt';
    b.textContent = o.text;
    b.onclick = () => pick(o);
    c.appendChild(b);
  });
  body.appendChild(c);
  scrollBottom();
}
function showResult(node){
  const n = typeof node === 'string' ? T[node] : node;
  const d = document.createElement('div');
  d.className = 'cb-msg cb-bot';
  const descHtml = (n.desc||'').replace(/\n/g,'<br>');
  let actionHtml = '';
  if(n.action){
    if(n.action.type === 'link'){
      const target = n.action.newTab ? 'target="_blank" rel="noopener"' : '';
      actionHtml = '<a href="'+n.action.url+'" '+target+' class="cb-go-btn">'+n.action.label+'</a>';
    } else if(n.action.type === 'slide'){
      actionHtml = '<button class="cb-go-btn" onclick="goToSlide('+n.action.slide+')">'+( n.action.label || 'Go there →')+'</button>';
    }
  }
  d.innerHTML = `<div class="cb-bubble">
    <div style="font-size:28px;margin-bottom:6px">${n.emoji||'✨'}</div>
    <div class="cb-result">
      <h4>${n.title||''}</h4>
      <p>${descHtml}</p>
      ${actionHtml}
    </div>
    <button class="cb-restart" onclick="window._cbRestart()">🔄 Ask me something else</button>
  </div>`;
  body.appendChild(d);
  scrollBottom();
}

function addBotHtml(html){
  const d = document.createElement('div');
  d.className = 'cb-msg cb-bot';
  d.innerHTML = '<div class="cb-bubble">' + html + '</div>';
  body.appendChild(d);
  scrollBottom();
}

function showBankCard(title, html){
  addBotHtml(`<div class="cb-result"><h4>${esc(title)}</h4><p>${html}</p><a class="cb-go-btn" href="/">View credit card finder →</a></div><button class="cb-restart" onclick="window._cbRestart()">🔄 Ask me something else</button>`);
}

async function showBanksMenu(){
  await loadSiteData();
  if (siteData.error || !siteData.banks.length) {
    addBot('I could not load the bank and credit-union database right now. Please refresh and try again.');
    return;
  }
  addBot(`I have source-backed data for **${siteData.banks.length} banks and credit unions** plus **${siteData.cards.length} Canadian card records**. You can search a name or browse by type.`);
  showOpts([
    { text: 'Search by name or city', next: 'banks_search' },
    { text: 'Big 6 banks', next: 'banks_big6' },
    { text: 'Credit unions', next: 'banks_credit_unions' },
    { text: 'Digital banks', next: 'banks_digital' },
    { text: 'Back to credit cards', next: 'cc_start' }
  ]);
}

function showBankSearchBox(){
  const d = document.createElement('div');
  d.className = 'cb-msg cb-bot';
  d.innerHTML = `<div class="cb-bubble">
    <div>Search the bank database by name, city, category, or credit union type.</div>
    <form class="cb-search" id="cbBankSearch">
      <input name="q" type="search" placeholder="Try BMO, Vancity, Vancouver..." autocomplete="off">
      <button type="submit">Search</button>
    </form>
    <span class="cb-mini-note">Answers come only from the local bank/card JSON database.</span>
  </div>`;
  body.appendChild(d);
  const input = d.querySelector('input');
  const form = d.querySelector('form');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return;
    addUser(query);
    showTyping();
    setTimeout(async () => {
      hideTyping();
      await handleBankQuery(query);
    }, 350);
  });
  input.focus();
  scrollBottom();
}

async function handleBankQuery(query){
  await loadSiteData();
  if (siteData.error || !siteData.banks.length) {
    addBot('The bank database is unavailable right now, so I cannot confirm that from source data.');
    return;
  }
  const lowered = norm(query);
  if (lowered.includes('credit union') || lowered === 'cu') {
    showBankList('Credit unions', banksByCategory('credit-union'));
    return;
  }
  if (lowered.includes('digital')) {
    showBankList('Digital banks', banksByCategory('digital'));
    return;
  }
  if (lowered.includes('big 6') || lowered.includes('big six')) {
    showBankList('Big 6 banks', banksByCategory('big6'));
    return;
  }
  const matches = findBanks(query);
  if (!matches.length) {
    addBot(`The current bank database does not confirm a match for **${esc(query)}**. Try a bank name like BMO, RBC, Vancity, Coast Capital, Tangerine, or a city like Vancouver.`);
    showBankSearchBox();
    return;
  }
  if (matches.length === 1 || norm(matches[0].title) === lowered || (matches[0].aliases || []).some(a => norm(a) === lowered)) {
    showBankProfile(matches[0]);
    return;
  }
  showBankList('Matching institutions', matches);
}

function showBankList(title, banks){
  if (!banks.length) {
    addBot('The current bank database does not confirm any institutions in that category.');
    return;
  }
  const html = banks.slice(0, 8).map(bank => {
    const cards = bankCards(bank).length;
    const loc = bank.locationSummary ? compact(bank.locationSummary, 110) : 'Physical presence not confirmed.';
    return `<strong>${esc(bank.title)}</strong><br>${esc(bank.category || 'Institution')} ${cards ? '&middot; ' + cards + ' linked card records' : ''}<br><span class="cb-mini-note">${esc(loc)}</span>`;
  }).join('<br><br>');
  showBankCard(title, html);
  showOpts([
    ...banks.slice(0, 6).map(bank => ({ text: bank.title, next: 'bank_profile', bankId: bank.institutionId })),
    { text: 'Search another bank', next: 'banks_search' }
  ]);
}

function showBankProfile(bank){
  showBankCard(bank.title, renderBankProfile(bank));
  showOpts([
    { text: 'Search another bank', next: 'banks_search' },
    { text: 'Browse credit unions', next: 'banks_credit_unions' },
    { text: 'Back to menu', next: 'banks_start' }
  ]);
}

function showBankProfileById(id){
  const bank = siteData.banks.find(item => item.institutionId === id);
  if (!bank) {
    addBot('The current bank database does not confirm that institution.');
    return;
  }
  showBankProfile(bank);
}

function scrollBottom(){
  requestAnimationFrame(() => { body.scrollTop = body.scrollHeight; });
}

function pick(opt){
  // remove options
  const old = document.getElementById('cbOpts');
  if(old) old.remove();
  addUser(opt.text);
  showTyping();
  const delay = 500 + Math.random()*600;
  setTimeout(() => {
    hideTyping();
    if(opt.bankId){
      showBankProfileById(opt.bankId);
      return;
    }
    const node = T[opt.next];
    if(!node) return;
    if(node.handler){
      if(node.handler === 'banksMenu') showBanksMenu();
      if(node.handler === 'bankSearch') showBankSearchBox();
      if(node.handler === 'bankBrowse') {
        loadSiteData().then(() => showBankList(node.title || 'Institutions', banksByCategory(node.category)));
      }
      return;
    }
    // handle auto-redirect (random game, etc)
    if(node.auto){
      const resolved = node.auto();
      const rNode = T[resolved];
      if(node.msg) addBot(node.msg);
      setTimeout(() => {
        if(rNode.result) showResult(resolved);
        else { addBot(rNode.msg); if(rNode.opts) setTimeout(()=>showOpts(rNode.opts),250); }
      }, 400);
      return;
    }
    // handle auto-navigate
    if(node.action && node.action.autoNav){
      addBot(node.msg || 'Navigating...');
      setTimeout(() => {
        if(node.action.type === 'slide' && typeof goToSlide === 'function') goToSlide(node.action.slide);
        showResult({ emoji:'✅', title:'Done!', desc:'I\'ve navigated you there. Enjoy exploring!', action: null });
        // add restart
        const rb = document.createElement('button');
        rb.className = 'cb-restart';
        rb.textContent = '🔄 Ask me something else';
        rb.onclick = window._cbRestart;
        body.lastChild.querySelector('.cb-bubble').appendChild(rb);
      }, 500);
      return;
    }
    // normal node
    if(node.msg) addBot(node.msg);
    if(node.result){
      setTimeout(() => showResult(node), 300);
    } else if(node.opts){
      setTimeout(() => showOpts(node.opts), 250);
    }
  }, delay);
}

// boot
function boot(){
  body.innerHTML = '';
  showTyping();
  setTimeout(() => {
    hideTyping();
    addBot(T.start.msg);
    setTimeout(() => showOpts(T.start.opts), 300);
  }, 800);
}

// restart
window._cbRestart = function(){
  boot();
};

})();
