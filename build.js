const fs = require('fs');
const path = require('path');

const root = __dirname;
const out = path.join(root, '_site');
const contentDir = path.join(root, 'content', 'posts');
const site = JSON.parse(fs.readFileSync(path.join(root, 'content', 'site.json'), 'utf8'));

const esc = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const safeUrl = (value = '') => {
  const v = String(value).trim();
  return /^https?:\/\//i.test(v) ? v : '#';
};

const dateValue = (value) => {
  const d = new Date(`${String(value).slice(0, 10)}T12:00:00`);
  return Number.isNaN(d.getTime()) ? new Date(0) : d;
};

const displayDate = (value) => dateValue(value).toLocaleDateString('en-US', {
  month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'
});

const posts = fs.readdirSync(contentDir)
  .filter((f) => f.endsWith('.json'))
  .map((file) => {
    const data = JSON.parse(fs.readFileSync(path.join(contentDir, file), 'utf8'));
    return {
      ...data,
      slug: path.basename(file, '.json'),
      displayDate: displayDate(data.date),
      timestamp: dateValue(data.date).getTime()
    };
  })
  .sort((a, b) => b.timestamp - a.timestamp);

const latest = posts.find((p) => p.featured) || posts[0];

function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }
function write(rel, html) {
  const file = path.join(out, rel);
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, html);
}

function nav(active = '') {
  const link = (href, label, key, extra = '') => `<a href="${href}" class="${active === key ? 'active ' : ''}${extra}">${label}</a>`;
  return `<header class="site-header"><div class="shell nav">
    <a class="brand" href="/" aria-label="${esc(site.name)} home">
      <span class="brand-mark"><span class="lens-core"></span></span>
      <span class="brand-copy"><strong>${esc(site.name)}</strong><small>${esc(site.eyebrow)}</small></span>
    </a>
    <button class="mobile-menu" aria-label="Open menu" onclick="document.querySelector('.nav-links').classList.toggle('open')">☰</button>
    <nav class="nav-links">
      ${link('/', 'Home', 'home')}
      ${link('/analysis/', 'Analysis', 'analysis')}
      ${link('/about/', 'About', 'about')}
      ${link('/admin/', 'Write a Post', 'admin', 'nav-cta')}
    </nav>
  </div></header>`;
}

function footer() {
  return `<footer><div class="shell footer-grid">
    <div class="footer-copy"><strong>${esc(site.name)}</strong><br>${esc(site.disclaimer)}</div>
    <div class="footer-links"><a href="/analysis/">Analysis</a><a href="/about/">About</a><a href="/admin/">Publisher</a></div>
  </div></footer>`;
}

function layout(title, body, active = '', description = '') {
  return `<!doctype html><html lang="en"><head>
    <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="theme-color" content="#06111f">
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description || site.homeIntro)}">
    <link rel="icon" href="/assets/logo.svg" type="image/svg+xml">
    <link rel="stylesheet" href="/assets/styles.css">
  </head><body>${nav(active)}${body}${footer()}</body></html>`;
}

function toneClass(tone) {
  return ['up', 'down', 'flat'].includes(tone) ? tone : 'flat';
}

function snapshotCards(post) {
  const items = Array.isArray(post?.snapshot) ? post.snapshot : [];
  return items.map((s) => `<div class="snapshot-card"><small>${esc(s.name)}</small><strong>${esc(s.value)}</strong><span class="change ${toneClass(s.tone)}">${esc(s.change)}</span></div>`).join('');
}

function featuredPost(post) {
  if (!post) return '<div class="empty">Your first analysis will appear here after you publish it.</div>';
  const side = (post.snapshot || []).slice(0, 4).map((s) => `<div class="stat-card"><small>${esc(s.name)}</small><strong class="${toneClass(s.tone)}">${esc(s.change)}</strong></div>`).join('');
  const tags = (post.tags || []).slice(0, 3).map((t) => `<span class="tag">${esc(t)}</span>`).join('');
  return `<div class="featured-main"><div class="meta"><span>${esc(post.displayDate)}</span><span>•</span><span>${esc(post.readTime || 'Weekly analysis')}</span>${tags}</div>
    <h3>${esc(post.title)}</h3><p>${esc(post.deck)}</p>
    <a class="btn btn-primary" href="/analysis/${encodeURIComponent(post.slug)}/">Read this week’s analysis →</a></div>
    <aside class="featured-side">${side}</aside>`;
}

function ticker(post) {
  if (!post || !Array.isArray(post.snapshot)) return '';
  const one = post.snapshot.map((s) => `<div class="ticker-item"><strong>${esc(s.name)}</strong><span>${esc(s.value)}</span><em class="${toneClass(s.tone)}" style="font-style:normal">${esc(s.change)}</em></div>`).join('');
  return one + one;
}

const lead = latest?.snapshot?.[0] || { name: 'S&P 500', value: '—', change: '—', tone: 'flat' };
const home = `<main>
<section class="hero"><div class="shell hero-grid"><div>
  <div class="eyebrow"><span class="dot"></span>${esc(site.eyebrow)} · New every Saturday</div>
  <h1><span class="gradient-text">${esc(site.tagline)}</span></h1>
  <p class="hero-copy">${esc(site.homeIntro)}</p>
  <div class="hero-actions"><a class="btn btn-primary" href="${latest ? `/analysis/${encodeURIComponent(latest.slug)}/` : '/analysis/'}">Read the Latest Lens →</a><a class="btn btn-secondary" href="/analysis/">Browse All Analysis</a></div>
  <div class="signal-row"><span>EQUITIES</span><i></i><span>MACRO</span><i></i><span>RATES</span><i></i><span>EARNINGS</span></div>
</div><div class="market-orbit"><div class="glow-ring"></div><div class="orbit-card">
  <div class="orbit-title"><strong>Weekly Market Pulse</strong><span class="live-pill">LATEST</span></div>
  <div class="sparkline"><svg viewBox="0 0 320 110" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2de2e6" stop-opacity=".30"/><stop offset="1" stop-color="#2de2e6" stop-opacity="0"/></linearGradient></defs><path d="M0 88 C28 75,40 76,61 71 S96 92,120 67 S158 56,177 62 S211 26,234 38 S272 23,320 16 V110 H0Z" fill="url(#g)"/><path d="M0 88 C28 75,40 76,61 71 S96 92,120 67 S158 56,177 62 S211 26,234 38 S272 23,320 16" stroke="#2de2e6" stroke-width="3" stroke-linecap="round" fill="none"/></svg></div>
  <div class="big-index"><div><small style="color:var(--muted)">${esc(lead.name)}</small><div class="value">${esc(lead.value)}</div></div><strong class="${toneClass(lead.tone)}">${esc(lead.change)}</strong></div>
</div></div></div></section>
<div class="ticker-wrap"><div class="ticker shell">${ticker(latest)}</div></div>
<section class="section"><div class="shell"><div class="section-head"><div><div class="kicker">Latest Lens</div><h2>This week’s market view</h2></div><p>A focused review of what moved markets, what actually mattered beneath the headlines, and the signals worth watching next.</p></div><div class="featured">${featuredPost(latest)}</div></div></section>
<section class="section"><div class="shell"><div class="section-head"><div><div class="kicker">The Framework</div><h2>What I cover every week</h2></div></div><div class="cards">
  <div class="card"><div class="icon">↗</div><h3>Market Performance</h3><p>Major indexes, sector leadership, yields, commodities, and the moves that mattered most.</p></div>
  <div class="card"><div class="icon">◎</div><h3>Macro & Fed</h3><p>Jobs, inflation, growth, and interest-rate expectations — translated into what they mean for markets.</p></div>
  <div class="card"><div class="icon">◫</div><h3>Next Week</h3><p>The events, data releases, earnings, and risks I think investors should have on their radar.</p></div>
</div></div></section>
<section class="section"><div class="shell about-strip"><div class="avatar-placeholder"></div><div><div class="kicker">About the Analyst</div><h2>${esc(site.aboutTitle)}</h2>${(site.aboutParagraphs || []).map((p) => `<p>${esc(p)}</p>`).join('')}<a class="btn btn-secondary" href="/about/">Read more about the project →</a></div></div></section>
</main>`;
write('index.html', layout(`${site.name} — ${site.eyebrow}`, home, 'home'));

const archiveCards = posts.map((p) => {
  const tags = (p.tags || []).slice(0, 3).join(' · ');
  return `<a class="archive-card" href="/analysis/${encodeURIComponent(p.slug)}/" data-search="${esc(`${p.title} ${p.deck} ${tags} ${p.displayDate}`.toLowerCase())}">
    <div class="archive-date">${esc(p.displayDate)}</div><div><div class="meta">${esc(p.readTime || '')}${tags ? ` · ${esc(tags)}` : ''}</div><h3>${esc(p.title)}</h3><p>${esc(p.deck)}</p></div><div class="arrow">→</div>
  </a>`;
}).join('') || '<div class="empty">No analysis has been published yet.</div>';

const archive = `<main><section class="page-hero"><div class="shell"><div class="kicker">Analysis Archive</div><h1>Every Lens,<br><span class="gradient-text">newest to oldest.</span></h1><p>Weekly market analysis covering equities, macroeconomics, rates, earnings, commodities, and the events shaping financial markets.</p></div></section>
<section class="section" style="padding-top:20px"><div class="shell"><div class="archive-tools"><input id="archiveSearch" class="search" type="search" placeholder="Search analysis, themes, dates…" aria-label="Search analysis"></div><div class="archive" id="archiveList">${archiveCards}</div></div></section></main>
<script>const q=document.getElementById('archiveSearch');if(q){q.addEventListener('input',()=>{const s=q.value.trim().toLowerCase();document.querySelectorAll('[data-search]').forEach(c=>c.style.display=c.dataset.search.includes(s)?'grid':'none')})}</script>`;
write(path.join('analysis', 'index.html'), layout(`Analysis — ${site.name}`, archive, 'analysis', 'Browse all weekly market analysis from The Capital Lens.'));

const about = `<main><section class="page-hero"><div class="shell"><div class="kicker">About The Capital Lens</div><h1>Studying markets.<br><span class="gradient-text">Building a point of view.</span></h1><p>The Capital Lens is a weekly market-analysis project built around consistency, evidence, and learning in public.</p></div></section>
<section class="section" style="padding-top:20px"><div class="shell"><div class="prose-card"><h2>${esc(site.aboutTitle)}</h2>${(site.aboutParagraphs || []).map((p) => `<p>${esc(p)}</p>`).join('')}</div>
<div class="values-grid"><div class="value-card"><strong>Evidence First</strong><span>Use market data and credible sources before forming a conclusion.</span></div><div class="value-card"><strong>Clear Thinking</strong><span>Separate the signal from the daily noise and explain why a move matters.</span></div><div class="value-card"><strong>Consistency</strong><span>Publish every Saturday and build a record of how the market view evolves.</span></div></div>
<div class="prose-card" style="margin-top:20px"><h2>What readers can expect</h2><p>Each weekly report starts with a market snapshot, then breaks down the biggest drivers of the week, the macro backdrop, the areas I’m watching, and the events that could matter next.</p><p>${esc(site.disclaimer)}</p></div></div></section></main>`;
write(path.join('about', 'index.html'), layout(`About — ${site.name}`, about, 'about'));

for (const p of posts) {
  const tags = (p.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join('');
  const quick = (p.quickTake || []).map((x) => `<li>${esc(x)}</li>`).join('');
  const sections = (p.sections || []).map((s) => `<section><h2>${esc(s.heading)}</h2>${(s.body || []).map((b) => `<p>${esc(b)}</p>`).join('')}${s.callout ? `<div class="callout">${esc(s.callout)}</div>` : ''}</section>`).join('');
  const sources = (p.sources || []).map((s) => `<li><a href="${safeUrl(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)} ↗</a></li>`).join('');
  const article = `<main><article><header class="article-hero"><div class="article-shell"><div class="meta"><span>${esc(p.displayDate)}</span><span>•</span><span>${esc(p.readTime || '')}</span>${tags}</div><h1>${esc(p.title)}</h1><p class="article-deck">${esc(p.deck)}</p><div class="snapshot-grid">${snapshotCards(p)}</div></div></header>
  <div class="article-shell article-body">${quick ? `<div class="quick-take"><h3>This Week in 30 Seconds</h3><ul>${quick}</ul></div>` : ''}${sections}${sources ? `<h2>Sources</h2><ul class="sources">${sources}</ul>` : ''}<p class="disclaimer">${esc(site.disclaimer)}</p><a class="btn btn-secondary" href="/analysis/">← Back to all analysis</a></div></article></main>`;
  write(path.join('analysis', p.slug, 'index.html'), layout(`${p.title} — ${site.name}`, article, 'analysis', p.deck));
}

// Copy static assets and CMS files after pages are generated.
fs.cpSync(path.join(root, 'assets'), path.join(out, 'assets'), { recursive: true });
fs.cpSync(path.join(root, 'admin'), path.join(out, 'admin'), { recursive: true });

console.log(`Built ${posts.length} market analysis post(s) into ${out}`);
