// Genera las piezas SVG del README de perfil (portada, tarjetas y cubo).
// Uso: node scripts/build-assets.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets');
mkdirSync(out, { recursive: true });

const SANS = `-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif`;
const MONO = `ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace`;

const themes = {
  dark: {
    bg: '#111316', panel: '#181B20', line: '#2B3038', text: '#ECE9E1', soft: '#B9BEC6',
    muted: '#858C97', accent: '#F2A93B', ok: '#7FD1A0', stop: '#F2786A',
  },
  light: {
    bg: '#F5F2E9', panel: '#FCFBF7', line: '#D8D2C1', text: '#1A1C20', soft: '#3D424A',
    muted: '#666C75', accent: '#A8590A', ok: '#1F7A4C', stop: '#B5301F',
  },
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ---------------------------------------------------------------- portada
const events = [
  { time: '09:12', what: 'Cash in, morning shift', result: 'validated and posted', tone: 'ok' },
  { time: '11:40', what: 'Supplier payment', result: 'validated and posted', tone: 'ok' },
  { time: '14:05', what: 'Transfer to treasury', result: 'posted', tone: 'ok' },
  { time: '20:30', what: 'Daily closing', result: 'ledger locked', tone: 'ok' },
  { time: '20:42', what: 'Edit on the closed day', result: 'rejected: ledger locked', tone: 'stop' },
];
const nodes = [
  { name: 'Branch cash drawer', sub: 'shifts and movements' },
  { name: 'Business rules', sub: 'Django + PostgreSQL' },
  { name: 'Central treasury', sub: 'daily closing, audit' },
];
const stats = [
  { value: '4h → 5min', label: 'daily manual sync, automated' },
  { value: '100%', label: 'of the spreadsheets replaced' },
  { value: '5', label: 'systems in production' },
  { value: '~1,400', label: 'automated tests on one system' },
];

function hero(t) {
  const W = 900, H = 600;
  const starts = [6, 18, 30, 42, 56]; // % del ciclo en que entra cada fila
  const rowKf = starts.map((p, i) => `
    @keyframes r${i} { 0%, ${p}% { opacity: 0; transform: translateY(6px); } ${p + 3}%, 93% { opacity: 1; transform: none; } 98%, 100% { opacity: 0; transform: none; } }
    .r${i} { animation: r${i} 14s ease-out infinite; }`).join('');

  const tabs = ['Cash', 'Time clocks', 'Site gate', 'AI'];
  let tx = 72;
  const tabsSvg = tabs.map((name, i) => {
    const w = name.length * 7.3;
    const s = `<text x="${tx}" y="256" class="mono" font-size="12" fill="${i === 0 ? t.text : t.muted}">${name}</text>` +
      (i === 0 ? `<rect x="${tx}" y="267" width="${w}" height="2" fill="${t.accent}"/>` : '');
    tx += w + 26;
    return s;
  }).join('');

  const nodeX = [72, 340, 608];
  const nodesSvg = nodes.map((n, i) => `
    <rect x="${nodeX[i]}" y="288" width="220" height="50" rx="8" fill="${t.bg}" stroke="${t.line}"/>
    <text x="${nodeX[i] + 16}" y="309" font-size="13.5" font-weight="600" fill="${t.text}">${esc(n.name)}</text>
    <text x="${nodeX[i] + 16}" y="327" class="mono" font-size="11" fill="${t.muted}">${esc(n.sub)}</text>`).join('');
  const links = [292, 560].map((x, i) => `
    <line x1="${x}" y1="313" x2="${x + 48}" y2="313" stroke="${t.line}" stroke-width="1.5"/>
    <circle class="dot d${i}" cx="${x}" cy="313" r="3.5" fill="${t.accent}"/>`).join('');

  const rowsSvg = events.map((e, i) => {
    const y = 376 + i * 24;
    const c = t[e.tone];
    return `
    <g class="row r${i}">
      ${e.tone === 'stop' ? `<rect class="flash" x="60" y="${y - 16}" width="780" height="23" rx="4" fill="${c}" opacity="0.12"/>` : ''}
      <text x="72" y="${y}" class="mono" font-size="13" fill="${t.muted}">${e.time}</text>
      <text x="134" y="${y}" class="mono" font-size="13" fill="${t.text}">${esc(e.what)}</text>
      <circle cx="424" cy="${y - 4.5}" r="3.5" fill="${c}"/>
      <text x="438" y="${y}" class="mono" font-size="13" fill="${c}">${esc(e.result)}</text>
    </g>`;
  }).join('');

  const statsSvg = stats.map((s, i) => {
    const x = 48 + i * 201;
    return `
    ${i ? `<line x1="${x}" y1="522" x2="${x}" y2="566" stroke="${t.line}"/>` : ''}
    <text x="${x + (i ? 20 : 0)}" y="541" font-size="22" font-weight="700" fill="${t.text}">${esc(s.value)}</text>
    <text x="${x + (i ? 20 : 0)}" y="562" font-size="12" fill="${t.muted}">${esc(s.label)}</text>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="t d">
  <title id="t">Mateo Coca, systems analyst and developer</title>
  <desc id="d">Spreadsheets, time clocks and cash drawers, turned into systems you can audit. A sample cash log shows four movements posted and an edit on a closed day rejected.</desc>
  <style>
    text { font-family: ${SANS}; }
    .mono { font-family: ${MONO}; }
    .row { transform-box: fill-box; }${rowKf}
    @keyframes travel { 0% { transform: translateX(0); opacity: 0; } 15%, 85% { opacity: 1; } 100% { transform: translateX(48px); opacity: 0; } }
    .dot { animation: travel 1.8s linear infinite; }
    .d1 { animation-delay: 0.9s; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
    .live { animation: pulse 2.4s ease-in-out infinite; }
    @keyframes flash { 0%, 56% { opacity: 0; } 59% { opacity: 0.32; } 66%, 93% { opacity: 0.12; } 98%, 100% { opacity: 0; } }
    .flash { animation: flash 14s ease-out infinite; }
    @media (prefers-reduced-motion: reduce) { .row, .dot, .live, .flash { animation: none; } }
  </style>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="16" fill="${t.bg}" stroke="${t.line}"/>

  <text x="48" y="60" class="mono" font-size="12.5" letter-spacing="1.6" fill="${t.accent}">MATEO COCA  /  SYSTEMS ANALYST AND DEVELOPER</text>
  <circle class="live" cx="632" cy="56" r="4" fill="${t.ok}"/>
  <text x="852" y="60" text-anchor="end" class="mono" font-size="12.5" fill="${t.soft}">Available · remote, from Salta</text>

  <text x="48" y="118" font-size="33" font-weight="700" letter-spacing="-0.4" fill="${t.text}">Spreadsheets, time clocks and cash drawers,</text>
  <text x="48" y="160" font-size="33" font-weight="700" letter-spacing="-0.4" fill="${t.text}">turned into <tspan fill="${t.accent}">systems you can audit.</tspan></text>
  <text x="48" y="198" font-size="15.5" fill="${t.soft}">APIs and internal tools that run day-to-day operations: treasury, attendance, compliance.</text>

  <rect x="48.5" y="230.5" width="803" height="262" rx="12" fill="${t.panel}" stroke="${t.line}"/>
  ${tabsSvg}
  <text x="828" y="256" text-anchor="end" class="mono" font-size="11.5" fill="${t.muted}">simulation with sample data</text>
  <line x1="49" y1="269.5" x2="851" y2="269.5" stroke="${t.line}"/>
  ${nodesSvg}
  ${links}
  ${rowsSvg}
  ${statsSvg}
</svg>
`;
}

// ---------------------------------------------------------------- tarjetas
const cards = [
  {
    id: 'gerayse', tag: 'FINANCE · IN PRODUCTION', title: 'Gerayse',
    desc: ['Operations and finance for a multi-branch business:', 'cash drawers, treasury, payables, banks and attendance.', 'It replaced the spreadsheets.'],
    tech: 'Django · PostgreSQL · HTMX · ~1,400 tests',
  },
  {
    id: 'odoo-mcp', tag: 'ERP · AI', title: 'Read-only AI connector for Odoo',
    desc: ['An MCP server inside Odoo 19: each person asks Claude', 'about the ERP with their own permissions. Writing is', 'not blocked by a filter; it does not exist in the code.'],
    tech: 'Odoo 19 · Python · MCP · OAuth 2',
  },
  {
    id: 'zkteco-bridge', tag: 'INTEGRATION', title: 'Time-clock bridge',
    desc: ['A Flask API between ZKTeco biometric clocks and Odoo.', "It speaks the clocks' PUSH protocol and persists every", 'punch before it reaches the ERP.'],
    tech: 'Flask · SQLAlchemy · XML-RPC · pytest',
  },
  {
    id: 'obrastaff', tag: 'COMPLIANCE', title: 'ObraStaff',
    desc: ['Document compliance for mining and construction.', 'One eligibility rule decides, with a traffic light,', 'who is cleared to enter a site.'],
    tech: 'Laravel 12 · Livewire 3 · PostgreSQL',
  },
  {
    id: 'laburo', tag: 'OPEN SOURCE · MIT', title: 'laburo',
    desc: ['A command-line tool for job hunting with method:', 'who you wrote to, who answered, what you charge', 'and what you learned. No dependencies.'],
    tech: 'Node.js · CLI',
  },
  {
    id: 'salta-rubik', tag: 'MOBILE · WEB', title: 'Salta Rubik',
    desc: ['A speedcubing timer with WCA-style scrambles,', 'sessions, statistics and a compete mode.', 'Mobile-first, and it also runs on the web.'],
    tech: 'Flutter · flutter_bloc · sqflite',
  },
];

function card(c, t) {
  const W = 440, H = 210;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(c.title)}: ${esc(c.desc.join(' '))}">
  <style>text { font-family: ${SANS}; } .mono { font-family: ${MONO}; }</style>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="12" fill="${t.panel}" stroke="${t.line}"/>
  <rect x="24" y="27" width="7" height="7" fill="${t.accent}"/>
  <text x="40" y="35" class="mono" font-size="11" letter-spacing="1.3" fill="${t.accent}">${esc(c.tag)}</text>
  <path d="M404 36 L416 24 M407 24 H416 V33" fill="none" stroke="${t.muted}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="24" y="74" font-size="21" font-weight="700" letter-spacing="-0.2" fill="${t.text}">${esc(c.title)}</text>
  ${c.desc.map((l, i) => `<text x="24" y="${102 + i * 20}" font-size="13.5" fill="${t.soft}">${esc(l)}</text>`).join('\n  ')}
  <line x1="24" y1="164.5" x2="416" y2="164.5" stroke="${t.line}"/>
  <text x="24" y="188" class="mono" font-size="11.5" fill="${t.muted}">${esc(c.tech)}</text>
</svg>
`;
}

// ---------------------------------------------------------------- cubo
function cube() {
  const S = 34, cx = 130, cy = 40;
  const P = (x, y, z) => [cx + (x - y) * S * 0.866, cy + (x + y) * S * 0.5 + (3 - z) * S].map((n) => n.toFixed(1)).join(',');
  const col = { W: '#F4F1E8', G: '#2FA35C', R: '#D8402F', B: '#2F6FD8', O: '#F08A24', Y: '#F2CB3B' };
  const keys = Object.keys(col);
  let seed = 7;
  const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const g = 0.07;
  const faces = [
    { solved: 'W', quad: (i, j) => [P(i + g, j + g, 3), P(i + 1 - g, j + g, 3), P(i + 1 - g, j + 1 - g, 3), P(i + g, j + 1 - g, 3)] },
    { solved: 'G', quad: (i, j) => [P(i + g, 3, 3 - j - g), P(i + 1 - g, 3, 3 - j - g), P(i + 1 - g, 3, 2 - j + g), P(i + g, 3, 2 - j + g)] },
    { solved: 'R', quad: (i, j) => [P(3, 3 - i - g, 3 - j - g), P(3, 2 - i + g, 3 - j - g), P(3, 2 - i + g, 2 - j + g), P(3, 3 - i - g, 2 - j + g)] },
  ];
  let n = 0;
  const stickers = faces.map((f) => {
    let s = '';
    for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) {
      const isCenter = i === 1 && j === 1;
      const from = isCenter ? f.solved : keys[Math.floor(rnd() * 6)];
      s += `<polygon points="${f.quad(i, j).join(' ')}" fill="${col[f.solved]}" style="--a:${col[from]};--b:${col[f.solved]};animation-delay:${(n++ * 0.07).toFixed(2)}s"/>`;
    }
    return s;
  }).join('\n  ');
  const body = [P(0, 0, 3), P(3, 0, 3), P(3, 0, 0), P(3, 3, 0), P(0, 3, 0), P(0, 3, 3)].join(' ');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="260" height="260" viewBox="0 0 260 260" role="img" aria-label="A Rubik's cube that scrambles and solves itself">
  <style>
    @keyframes solve { 0%, 12% { fill: var(--a); } 38%, 80% { fill: var(--b); } 96%, 100% { fill: var(--a); } }
    polygon[style] { animation: solve 9s ease-in-out infinite; }
    @media (prefers-reduced-motion: reduce) { polygon[style] { animation: none; } }
  </style>
  <polygon points="${body}" fill="#15171A" stroke="#15171A" stroke-width="6" stroke-linejoin="round"/>
  ${stickers}
</svg>
`;
}

// ---------------------------------------------------------------- salida
for (const [name, t] of Object.entries(themes)) {
  writeFileSync(join(out, `hero-${name}.svg`), hero(t));
  for (const c of cards) writeFileSync(join(out, `card-${c.id}-${name}.svg`), card(c, t));
}
writeFileSync(join(out, 'cube.svg'), cube());
console.log('ok:', 2 + cards.length * 2 + 1, 'archivos en assets/');
