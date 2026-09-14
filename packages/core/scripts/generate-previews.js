// Generates dist/previews/index.html — a tabbed gallery of all 10 templates
// rendered with their built-in preview-data.json sample data.
// Runs after `tsc` as part of the build step.

'use strict';
const fs   = require('fs');
const path = require('path');

const { MailCraft } = require('../dist/index.js');

const OUT_DIR = path.join(__dirname, '../dist/previews');
fs.mkdirSync(OUT_DIR, { recursive: true });

const TEMPLATES = [
  'welcome', 'otp', 'password-reset', 'email-verification',
  'invoice', 'order-confirmation', 'event-invitation',
  'subscription', 'system-alert', 'account-warning',
];

async function main() {
  const mc = new MailCraft();
  const entries = mc.list();

  /** @type {{ id: string, name: string, description: string, html: string }[]} */
  const rendered = [];

  for (const entry of entries) {
    process.stdout.write(`  Rendering ${entry.id}...`);
    try {
      const { html } = await mc.render(entry.id, entry.previewData);
      rendered.push({ id: entry.id, name: entry.name, description: entry.description, html });
      process.stdout.write(' done\n');
    } catch (err) {
      process.stdout.write(` FAILED: ${err.message}\n`);
    }
  }

  const tabButtons = rendered.map((t, i) =>
    `<button class="tab-btn${i === 0 ? ' active' : ''}" data-id="${t.id}" onclick="selectTab('${t.id}')">${t.name}</button>`
  ).join('\n      ');

  const tabPanels = rendered.map((t, i) =>
    `<div class="tab-panel${i === 0 ? ' active' : ''}" id="panel-${t.id}">
        <div class="panel-header">
          <h2>${t.name}</h2>
          <p>${t.description}</p>
          <span class="badge">${t.id}</span>
        </div>
        <div class="email-frame-wrap">
          <iframe class="email-frame" srcdoc="${escapeAttr(t.html)}" title="${t.name} preview"></iframe>
        </div>
      </div>`
  ).join('\n      ');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MailCraft — Template Preview Gallery</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0f172a;
      color: #e2e8f0;
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
    }

    /* ── Top bar ── */
    .topbar {
      background: #1e293b;
      border-bottom: 1px solid #334155;
      padding: 0 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      min-height: 52px;
      flex-shrink: 0;
    }
    .topbar-logo {
      font-weight: 700;
      font-size: 15px;
      color: #f8fafc;
      white-space: nowrap;
      letter-spacing: -0.3px;
    }
    .topbar-logo span { color: #6366f1; }

    /* ── Sidebar ── */
    .layout {
      display: flex;
      flex: 1;
      overflow: hidden;
    }
    .sidebar {
      width: 230px;
      flex-shrink: 0;
      background: #1e293b;
      border-right: 1px solid #334155;
      overflow-y: auto;
      padding: 12px 8px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .sidebar-label {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #64748b;
      padding: 8px 8px 4px;
    }
    .tab-btn {
      width: 100%;
      text-align: left;
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 13px;
      padding: 8px 10px;
      border-radius: 6px;
      cursor: pointer;
      line-height: 1.4;
      transition: background 0.1s, color 0.1s;
    }
    .tab-btn:hover { background: #334155; color: #e2e8f0; }
    .tab-btn.active { background: #312e81; color: #a5b4fc; font-weight: 500; }

    /* ── Main content ── */
    .content {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      background: #0f172a;
    }
    .tab-panel { display: none; flex-direction: column; height: 100%; overflow: hidden; }
    .tab-panel.active { display: flex; }

    .panel-header {
      padding: 16px 24px 14px;
      background: #1e293b;
      border-bottom: 1px solid #334155;
      flex-shrink: 0;
      display: flex;
      align-items: baseline;
      gap: 12px;
      flex-wrap: wrap;
    }
    .panel-header h2 { font-size: 15px; font-weight: 600; color: #f1f5f9; }
    .panel-header p  { font-size: 13px; color: #64748b; flex: 1; }
    .badge {
      font-size: 11px;
      font-family: 'SF Mono', 'Fira Code', monospace;
      background: #0f172a;
      color: #6366f1;
      border: 1px solid #312e81;
      border-radius: 4px;
      padding: 2px 7px;
      white-space: nowrap;
    }

    .email-frame-wrap {
      flex: 1;
      overflow: auto;
      padding: 32px;
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }
    .email-frame {
      width: 620px;
      max-width: 100%;
      height: 2400px;
      border: none;
      border-radius: 8px;
      box-shadow: 0 4px 32px rgba(0,0,0,0.5);
      background: #ffffff;
    }
  </style>
</head>
<body>
  <div class="topbar">
    <div class="topbar-logo">Mail<span>Craft</span> &nbsp;·&nbsp; Template Preview Gallery</div>
  </div>
  <div class="layout">
    <nav class="sidebar">
      <div class="sidebar-label">Templates</div>
      ${tabButtons}
    </nav>
    <main class="content">
      ${tabPanels}
    </main>
  </div>
  <script>
    function selectTab(id) {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.id === id));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === 'panel-' + id));
      history.replaceState(null, '', '#' + id);
    }

    // Auto-select from URL fragment on load
    const frag = location.hash.slice(1);
    if (frag && document.getElementById('panel-' + frag)) selectTab(frag);
  </script>
</body>
</html>`;

  const outFile = path.join(OUT_DIR, 'index.html');
  fs.writeFileSync(outFile, html, 'utf-8');
  console.log(`\nPreview gallery written to: ${outFile}`);
}

function escapeAttr(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

main().catch(err => { console.error(err); process.exit(1); });
