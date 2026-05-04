/* ========================================================================
   CardWise — Standalone Credit Card Finder app logic
   Wizard state, scoring engine, results renderer
   ======================================================================== */
(function () {
  'use strict';

  // ===== Theme toggle =====
  const themeBtn = document.getElementById('themeToggle');
  const stored = localStorage.getItem('cardwise-theme');
  if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
  themeBtn?.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('cardwise-theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('cardwise-theme', 'dark');
    }
  });

  // ===== Mobile nav =====
  const menuBtn = document.getElementById('menuBtn');
  const navLinks = document.getElementById('navLinks');
  menuBtn?.addEventListener('click', () => {
    menuBtn.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
  navLinks?.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => {
      menuBtn.classList.remove('open');
      navLinks.classList.remove('open');
    })
  );

  // ===== FAQ accordion =====
  document.querySelectorAll('.faq-item').forEach((it) => {
    it.addEventListener('click', () => it.classList.toggle('open'));
  });

  // ===== Wizard state =====
  const TOTAL_STEPS = 5;
  const state = { goal: null, spend: 1500, categories: [], fee: null, credit: null };
  let current = 1;

  // ===== DOM refs =====
  const stepEls = document.querySelectorAll('.wstep');
  const trail = document.getElementById('stepTrail');
  const stepLabel = document.getElementById('stepLabel');
  const spendValue = document.getElementById('spendValue');
  const spendRange = document.getElementById('spendRange');
  const chipCount = document.getElementById('chipCount');
  const backBtn = document.getElementById('backBtn');
  const nextBtn = document.getElementById('nextBtn');
  const wizardSection = document.getElementById('wizardSection');
  const resultsSection = document.getElementById('resultsSection');

  // ===== Build step trail pips =====
  function buildTrail() {
    trail.innerHTML = '';
    for (let i = 1; i <= TOTAL_STEPS; i++) {
      const pip = document.createElement('span');
      pip.className = 'pip';
      if (i < current) pip.classList.add('done');
      if (i === current) pip.classList.add('current');
      trail.appendChild(pip);
    }
    stepLabel.textContent = `Step ${current} of ${TOTAL_STEPS}`;
  }

  // ===== Step navigation =====
  function show(n) {
    current = n;
    stepEls.forEach((el) => el.classList.toggle('active', Number(el.dataset.step) === n));
    buildTrail();
    backBtn.disabled = n === 1;
    nextBtn.textContent = n === TOTAL_STEPS ? 'See My Cards' : 'Continue';
    if (n === TOTAL_STEPS) nextBtn.dataset.action = 'finish';
    else delete nextBtn.dataset.action;
    refreshNextEnabled();
  }

  function refreshNextEnabled() {
    let ok = false;
    switch (current) {
      case 1: ok = !!state.goal; break;
      case 2: ok = state.spend > 0; break;
      case 3: ok = state.categories.length > 0; break;
      case 4: ok = !!state.fee; break;
      case 5: ok = !!state.credit; break;
    }
    nextBtn.disabled = !ok;
  }

  // ===== Tile (single-select) handler =====
  document.querySelectorAll('[data-tile-group]').forEach((group) => {
    const key = group.dataset.tileGroup;
    group.querySelectorAll('.tile').forEach((tile) => {
      tile.addEventListener('click', () => {
        group.querySelectorAll('.tile').forEach((t) => t.classList.remove('selected'));
        tile.classList.add('selected');
        state[key] = tile.dataset.value;
        refreshNextEnabled();
      });
    });
  });

  // ===== Chip (multi-select) handler =====
  document.querySelectorAll('[data-chip-group]').forEach((group) => {
    group.querySelectorAll('.chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        chip.classList.toggle('selected');
        const v = chip.dataset.value;
        if (chip.classList.contains('selected')) {
          if (!state.categories.includes(v)) state.categories.push(v);
        } else {
          state.categories = state.categories.filter((c) => c !== v);
        }
        chipCount.textContent = state.categories.length;
        refreshNextEnabled();
      });
    });
  });

  // ===== Slider =====
  function setSliderFill() {
    const min = Number(spendRange.min);
    const max = Number(spendRange.max);
    const pct = ((Number(spendRange.value) - min) / (max - min)) * 100;
    spendRange.style.setProperty('--pct', pct + '%');
  }
  spendRange?.addEventListener('input', () => {
    state.spend = Number(spendRange.value);
    spendValue.textContent = '$' + state.spend.toLocaleString();
    setSliderFill();
    refreshNextEnabled();
  });
  setSliderFill();

  // ===== Buttons =====
  backBtn.addEventListener('click', () => {
    if (current > 1) show(current - 1);
  });
  nextBtn.addEventListener('click', () => {
    if (current < TOTAL_STEPS) show(current + 1);
    else renderResults();
  });

  // CTA buttons that scroll to wizard
  document.querySelectorAll('[data-scroll="wizard"]').forEach((b) =>
    b.addEventListener('click', (e) => {
      e.preventDefault();
      wizardSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    })
  );

  // ===== Scoring engine =====
  const CREDIT_LEVEL = { building: 0, fair: 1, good: 2, excellent: 3 };

  function scoreCard(card) {
    let s = 0;
    // Goal alignment (40)
    if (card.bestFor.includes(state.goal)) s += 40;
    else if (state.goal === 'cashback' && card.rewardType === 'cashback') s += 25;
    else if (state.goal === 'travel' && card.rewardType === 'points') s += 25;
    else s += 5;

    // Categories (25)
    const overlap = state.categories.filter((c) => card.idealSpend.includes(c)).length;
    s += (overlap / Math.max(state.categories.length, 1)) * 25;

    // Fee fit (15)
    const feeBudget = state.fee === '999' ? Infinity : Number(state.fee);
    if (state.fee === '0' && card.annualFee === 0) s += 15;
    else if (state.fee === '0' && card.annualFee > 0) s -= 10;
    else if (card.annualFee <= feeBudget) s += 12;
    else if (state.fee === '999') s += 10;

    // Credit eligibility (15)
    const u = CREDIT_LEVEL[state.credit] ?? 0;
    const m = CREDIT_LEVEL[card.minCredit] ?? 0;
    if (u >= m) s += 15;
    else s -= 20;

    // Spend value (5)
    if (state.spend >= 3000 && card.annualFee > 0 && card.cashbackBonus >= 3) s += 5;
    else if (state.spend < 1000 && card.annualFee === 0) s += 5;
    else s += 2;

    return Math.max(0, s);
  }

  function buildReason(card) {
    const out = [];
    const goalNames = {
      cashback: 'cashback rewards',
      travel: 'travel rewards',
      low_interest: 'low-interest cards',
      no_fee: 'no annual fee',
      build_credit: 'building credit',
      student: 'student cards',
    };
    if (card.bestFor.includes(state.goal)) {
      out.push(`This card directly aligns with your goal of ${goalNames[state.goal] || state.goal}.`);
    }
    const catMatch = state.categories.filter((c) => card.idealSpend.includes(c));
    if (catMatch.length) {
      const labels = {
        groceries: 'groceries', dining: 'dining', gas: 'gas/transport', travel: 'travel',
        online: 'online shopping', bills: 'bills', entertainment: 'entertainment', general: 'everyday spending',
      };
      out.push(`Strong rewards in your top categories: ${catMatch.map((c) => labels[c]).join(', ')}.`);
    }
    if (card.cashbackBonus > 0) out.push(`Earn up to ${card.cashbackBonus}% in bonus categories.`);
    if (card.annualFee === 0) out.push('No annual fee — every reward dollar is pure profit.');
    else {
      const monthly = Math.round((card.annualFee / Math.max(card.cashbackBonus, 0.1)) * 100 / 12);
      out.push(`The $${card.annualFee} fee pays for itself with ~$${monthly.toLocaleString()}/mo in bonus spend.`);
    }
    return out.join(' ');
  }

  // ===== Results renderer =====
  function renderResults() {
    const cards = window.CARDS || [];
    const ranked = cards.map((c) => ({ ...c, score: scoreCard(c) })).sort((a, b) => b.score - a.score);
    const top5 = ranked.slice(0, 5);

    const goalNames = {
      cashback: 'cashback', travel: 'travel rewards', low_interest: 'low interest',
      no_fee: 'no-fee', build_credit: 'credit-building', student: 'student',
    };
    const rankLabel = ['Best Match', 'Runner-up', 'Strong Pick', 'Great Option', 'Worth a Look'];

    const summary =
      `Based on your <b>${goalNames[state.goal]}</b> goal, ` +
      `<b>$${state.spend.toLocaleString()}/mo</b> spending, and <b>${state.credit}</b> credit — ` +
      `scored across <b>${cards.length}</b> Canadian cards.`;

    let html = `
      <div class="results-head">
        <div>
          <h2>Your <em>top picks</em>.</h2>
          <p>${summary}</p>
        </div>
        <button class="btn-restart" id="restartBtn">↻ Start over</button>
      </div>
      <div class="result-grid">
    `;

    top5.forEach((card, i) => {
      const feeLabel = card.annualFee === 0 ? 'FREE' : '$' + card.annualFee;
      const rateLabel = card.cashbackBonus > 0 ? card.cashbackBonus + '%' : card.interestRate + '%';
      const rateLine = card.cashbackBonus > 0 ? 'Top rate' : 'Interest';
      const typeLabel = card.rewardType === 'none' ? 'Low rate' : card.rewardType === 'cashback' ? 'Cash' : 'Points';

      html += `
        <article class="rcard r${i + 1}">
          <span class="rcard-rank">#${i + 1} · ${rankLabel[i]}</span>

          <div class="rcard-visual" style="background:${card.cardGradient}">
            <div class="top">
              <div class="cc-chip"></div>
              <div class="cc-net">${card.network}</div>
            </div>
            <div class="num">•••• •••• •••• ••${(1234 + i * 11).toString().slice(-2)}</div>
            <div>
              <div class="label">${card.name}</div>
              <div class="iss">${card.issuer}</div>
            </div>
          </div>

          <div class="rcard-info">
            <h3>${card.name}</h3>
            <div class="issuer">${card.issuer} · ${card.network}</div>

            <div class="metric-row">
              <div class="metric ${card.annualFee === 0 ? 'green' : ''}">
                <div class="v">${feeLabel}</div><div class="l">Annual fee</div>
              </div>
              <div class="metric">
                <div class="v">${rateLabel}</div><div class="l">${rateLine}</div>
              </div>
              <div class="metric">
                <div class="v">${typeLabel}</div><div class="l">Reward</div>
              </div>
              <div class="metric">
                <div class="v">${Math.round(card.score)}</div><div class="l">Match</div>
              </div>
            </div>

            <div class="reason-box">
              <div class="h">Why this card for you</div>
              <p>${buildReason(card)}</p>
            </div>

            ${
              card.welcomeBonus
                ? `<div class="welcome-line">🎁 Welcome bonus: ${card.welcomeBonus}</div>`
                : ''
            }

            <div class="pros-row">
              ${card.pros.map((p) => `<span class="pro">✓ ${p}</span>`).join('')}
            </div>
          </div>
        </article>
      `;
    });
    html += `</div>`;

    // Comparison table for top 3
    const top3 = top5.slice(0, 3);
    const minFee = Math.min(...top3.map((c) => c.annualFee));
    const minRate = Math.min(...top3.map((c) => c.interestRate));
    const maxBonus = Math.max(...top3.map((c) => c.cashbackBonus));

    html += `
      <div class="compare-block">
        <h3>Top 3 head-to-head</h3>
        <div class="compare-table-wrap">
          <table class="compare-table">
            <thead>
              <tr>
                <th>Feature</th>
                ${top3.map((c, i) => `<th>${i === 0 ? '🏆 ' : ''}${c.name.split(' ').slice(0, 3).join(' ')}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              <tr><td>Annual fee</td>${top3
                .map((c) => `<td class="${c.annualFee === minFee ? 'win' : ''}">${c.annualFee === 0 ? '$0' : '$' + c.annualFee}</td>`)
                .join('')}</tr>
              <tr><td>Interest rate</td>${top3
                .map((c) => `<td class="${c.interestRate === minRate ? 'win' : ''}">${c.interestRate}%</td>`)
                .join('')}</tr>
              <tr><td>Top reward rate</td>${top3
                .map((c) => `<td class="${c.cashbackBonus === maxBonus && maxBonus > 0 ? 'win' : ''}">${c.cashbackBonus > 0 ? c.cashbackBonus + '%' : '—'}</td>`)
                .join('')}</tr>
              <tr><td>Reward type</td>${top3.map((c) => `<td>${c.rewardType === 'none' ? 'Low rate' : c.rewardType}</td>`).join('')}</tr>
              <tr><td>Min credit</td>${top3.map((c) => `<td>${c.minCredit.charAt(0).toUpperCase() + c.minCredit.slice(1)}</td>`).join('')}</tr>
              <tr><td>Insurances</td>${top3.map((c) => `<td>${c.insurances.length || '—'}</td>`).join('')}</tr>
              <tr><td>Match score</td>${top3.map((c, i) => `<td class="${i === 0 ? 'win' : ''}">${Math.round(c.score)}/100</td>`).join('')}</tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="disclaimer">
        <b>Disclaimer:</b> CardWise provides general suggestions based on publicly available information. Card terms, rates, fees, and offers change often — always verify on the issuer's site before applying. This is not financial advice.
      </div>
    `;

    resultsSection.innerHTML = html;
    resultsSection.classList.add('active');
    wizardSection.style.display = 'none';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    document.getElementById('restartBtn')?.addEventListener('click', restart);
  }

  function restart() {
    state.goal = null;
    state.spend = 1500;
    state.categories = [];
    state.fee = null;
    state.credit = null;
    document.querySelectorAll('.tile').forEach((t) => t.classList.remove('selected'));
    document.querySelectorAll('.chip').forEach((c) => c.classList.remove('selected'));
    chipCount.textContent = '0';
    spendRange.value = 1500;
    spendValue.textContent = '$1,500';
    setSliderFill();
    resultsSection.classList.remove('active');
    resultsSection.innerHTML = '';
    wizardSection.style.display = '';
    show(1);
    wizardSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ===== Init =====
  show(1);
})();
