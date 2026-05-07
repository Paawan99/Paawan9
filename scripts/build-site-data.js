#!/usr/bin/env node
/* Build public site data from the local bank knowledge base. */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repoRoot = path.resolve(__dirname, '..');
const defaultKbRoot = 'C:\\Users\\Paawan\\OneDrive\\Desktop\\bank_knowledge_base';
const kbRoot = process.env.BANK_KB_ROOT || defaultKbRoot;
const dataDir = path.join(repoRoot, 'data');
const finderPath = path.join(repoRoot, 'credit-card-finder.html');
const cardsPath = path.join(dataDir, 'credit-cards.json');
const bankLitePath = path.join(dataDir, 'bank-kb-lite.json');

const REQUIRED_CARD_FIELDS = [
  'id',
  'name',
  'issuer',
  'annualFee',
  'interestRate',
  'rewardType',
  'minCredit',
  'bestFor',
  'idealSpend',
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9+]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractEmbeddedCards() {
  if (!fs.existsSync(finderPath)) return null;
  const html = fs.readFileSync(finderPath, 'utf8');
  const startMarker = 'const cards = [';
  const endMarker = '// ========== SCORING ENGINE ==========';
  const start = html.indexOf(startMarker);
  const end = html.indexOf(endMarker, start);
  if (start === -1 || end === -1) return null;

  const declaration = html.slice(start, end).trim().replace(/;\s*$/, '');
  const context = {};
  vm.createContext(context);
  return vm.runInContext(`${declaration}; cards;`, context, { timeout: 1000 });
}

function loadBaseCards() {
  const embedded = extractEmbeddedCards();
  if (embedded && embedded.length) return embedded;
  if (fs.existsSync(cardsPath)) return readJson(cardsPath).cards;
  throw new Error('No embedded card database or generated data/credit-cards.json found.');
}

function loadBankIndex() {
  const indexPath = path.join(kbRoot, 'data', 'banks_index.json');
  if (!fs.existsSync(indexPath)) {
    return { generated_at: null, banks: [] };
  }
  return readJson(indexPath);
}

function issuerOverrides(card) {
  const haystack = normalize(`${card.id} ${card.name} ${card.issuer}`);
  const checks = [
    ['tangerine', ['tangerine']],
    ['simplii', ['simplii']],
    ['neo-financial', ['neo']],
    ['bmo', ['bmo', 'bank of montreal']],
    ['cibc', ['cibc']],
    ['td', [' td ', 'td bank', 'td canada trust']],
    ['scotiabank', ['scotia', 'scene+']],
    ['rbc', ['rbc', 'royal bank']],
    ['national-bank', ['national bank']],
    ['vancity', ['vancity']],
    ['wealthsimple', ['wealthsimple']],
    ['eq-bank', ['eq bank']],
    ['koho', ['koho']],
    ['manulife-bank', ['manulife']],
    ['coast-capital', ['coast capital']],
  ];
  for (const [institutionId, needles] of checks) {
    if (needles.some((needle) => haystack.includes(normalize(needle)))) return institutionId;
  }
  return null;
}

function matchBank(card, banks) {
  const override = issuerOverrides(card);
  if (override) {
    const found = banks.find((bank) => bank.institution_id === override);
    if (found) return found;
  }

  const issuer = normalize(`${card.issuer} ${card.name}`);
  const candidates = banks
    .map((bank) => {
      const aliases = [bank.title, ...(bank.aliases || []), bank.institution_id]
        .filter(Boolean)
        .map(normalize)
        .filter((item) => item.length >= 3);
      const score = aliases.reduce((total, alias) => {
        if (issuer.includes(alias)) return total + Math.min(20, alias.length);
        const firstWord = alias.split(' ')[0];
        if (firstWord.length >= 4 && issuer.includes(firstWord)) return total + 4;
        return total;
      }, 0);
      return { bank, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return candidates[0]?.bank || null;
}

function publicBankRecord(bank) {
  return {
    institutionId: bank.institution_id,
    title: bank.title,
    aliases: bank.aliases || [],
    category: bank.category || null,
    type: bank.type || null,
    status: bank.status || null,
    headquarters: bank.hq || null,
    sourceFile: bank.source_file,
    lastSourceModified: bank.last_modified,
    locationSummary: bank.location_summary || null,
    cardsSectionPresent: Boolean(bank.cards_section_present),
    personalCardMentions: bank.card_mentions || [],
    businessCreditCards: (bank.business_credit_cards || []).map((card) => ({
      name: card.name,
      network: card.network || null,
      annualFeeCad: card.annual_fee_cad ?? null,
      notes: card.notes || null,
      source: card.source || null,
    })),
    sources: (bank.sources || []).slice(0, 12),
  };
}

function cleanCard(card, bank) {
  const cleaned = { ...card };
  for (const key of ['source_path', 'sourcePath', 'localPath']) delete cleaned[key];
  cleaned.dataSource = {
    type: bank ? 'bank_knowledge_base_match' : 'site_seed',
    institutionId: bank?.institution_id || null,
    institutionTitle: bank?.title || null,
    sourceFile: bank?.source_file || null,
    lastSourceModified: bank?.last_modified || null,
    sourceUrls: bank?.sources || [],
  };
  return cleaned;
}

function validateCards(cards) {
  const errors = [];
  const seen = new Set();
  cards.forEach((card, index) => {
    for (const field of REQUIRED_CARD_FIELDS) {
      if (card[field] === undefined || card[field] === null || card[field] === '') {
        errors.push(`card[${index}] ${card.name || card.id || '(unknown)'} missing ${field}`);
      }
    }
    if (seen.has(card.id)) errors.push(`duplicate card id: ${card.id}`);
    seen.add(card.id);
    if (!Array.isArray(card.bestFor)) errors.push(`${card.id} bestFor must be an array`);
    if (!Array.isArray(card.idealSpend)) errors.push(`${card.id} idealSpend must be an array`);
    if (typeof card.annualFee !== 'number') errors.push(`${card.id} annualFee must be a number`);
    if (typeof card.interestRate !== 'number') errors.push(`${card.id} interestRate must be a number`);
  });
  if (errors.length) {
    throw new Error(`Credit card data validation failed:\n${errors.join('\n')}`);
  }
}

function main() {
  fs.mkdirSync(dataDir, { recursive: true });

  const bankIndex = loadBankIndex();
  const banks = bankIndex.banks || [];
  const rawCards = loadBaseCards();
  const cards = rawCards.map((card) => cleanCard(card, matchBank(card, banks)));
  validateCards(cards);

  const matchedCount = cards.filter((card) => card.dataSource.institutionId).length;
  const generatedAt = new Date().toISOString();
  const cardPayload = {
    schemaVersion: 1,
    generatedAt,
    source: {
      builder: 'scripts/build-site-data.js',
      bankKnowledgeBaseGeneratedAt: bankIndex.generated_at || null,
      cardSeed: extractEmbeddedCards() ? 'credit-card-finder.html embedded array' : 'data/credit-cards.json',
    },
    stats: {
      totalCards: cards.length,
      matchedToBankKnowledgeBase: matchedCount,
      unmatchedCards: cards.length - matchedCount,
    },
    cards,
  };

  const bankPayload = {
    schemaVersion: 1,
    generatedAt,
    source: {
      builder: 'scripts/build-site-data.js',
      bankKnowledgeBaseGeneratedAt: bankIndex.generated_at || null,
    },
    stats: {
      institutions: banks.length,
      withPersonalCardMentions: banks.filter((bank) => bank.cards_section_present).length,
      withBusinessCreditCards: banks.filter((bank) => (bank.business_credit_cards || []).length > 0).length,
    },
    banks: banks.map(publicBankRecord),
  };

  fs.writeFileSync(cardsPath, JSON.stringify(cardPayload, null, 2) + '\n');
  fs.writeFileSync(bankLitePath, JSON.stringify(bankPayload, null, 2) + '\n');
  console.log(`Wrote ${path.relative(repoRoot, cardsPath)} (${cards.length} cards, ${matchedCount} KB matches).`);
  console.log(`Wrote ${path.relative(repoRoot, bankLitePath)} (${banks.length} institutions).`);
}

main();
