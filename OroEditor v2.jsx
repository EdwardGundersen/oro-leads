import { useState, useRef } from "react";

const INITIAL_HTML = `<!DOCTYPE html>
<html lang="no">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ORO Leads</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@300;400&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0D0D0D; color: #E0E0E0; font-family: 'DM Sans', sans-serif; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #2A2A2A; border-radius: 3px; }

    /* PASSWORD */
    #pw-screen {
      position: fixed; inset: 0; background: #0D0D0D;
      display: flex; align-items: center; justify-content: center;
      z-index: 9999; flex-direction: column; gap: 20px;
    }
    #pw-screen h1 { font-family: 'Playfair Display', serif; font-size: 32px; color: #F5F0E8; }
    #pw-screen p  { font-size: 12px; color: #424242; font-family: 'DM Mono', monospace; letter-spacing: 0.1em; }
    #pw-screen input {
      background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px; padding: 12px 20px; color: #F5F0E8;
      font-size: 15px; font-family: 'DM Mono', monospace;
      outline: none; text-align: center; width: 260px; letter-spacing: 0.2em;
    }
    #pw-screen input:focus { border-color: rgba(255,255,255,0.25); }
    #pw-screen button {
      background: #F5F0E8; color: #0D0D0D; border: none; border-radius: 8px;
      padding: 12px 32px; font-size: 13px; font-weight: 500; cursor: pointer; width: 260px;
    }
    .pw-error { color: #EF9A9A; font-size: 12px; font-family: 'DM Mono', monospace; display: none; }
    #app { display: none; min-height: 100vh; }
    #app.visible { display: block; }

    /* HEADER */
    .header {
      border-bottom: 1px solid rgba(255,255,255,0.06);
      padding: 20px 32px; display: flex;
      justify-content: space-between; align-items: center;
    }
    .logo-row { display: flex; align-items: baseline; gap: 10px; }
    .logo     { font-family: 'Playfair Display', serif; font-size: 22px; color: #F5F0E8; }
    .logo-sub { color: #424242; font-size: 12px; font-family: 'DM Mono', monospace; letter-spacing: 0.15em; }
    .lead-count { font-size: 12px; color: #424242; margin-top: 2px; }

    /* PASTE BOX */
    .paste-area {
      margin: 24px 32px 0;
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 14px;
      padding: 20px;
      transition: border-color 0.2s;
    }
    .paste-area:focus-within { border-color: rgba(255,255,255,0.15); }
    .paste-label {
      font-size: 11px; color: #424242; font-family: 'DM Mono', monospace;
      letter-spacing: 0.1em; margin-bottom: 10px;
    }
    .paste-label span { color: #616161; }
    #paste-input {
      width: 100%; background: transparent; border: none; outline: none;
      color: #C0C0C0; font-size: 13px; font-family: 'DM Mono', monospace;
      line-height: 1.7; resize: none; min-height: 56px; max-height: 180px;
      overflow-y: auto;
    }
    #paste-input::placeholder { color: #2E2E2E; }
    .paste-footer {
      display: flex; align-items: center; justify-content: space-between;
      margin-top: 12px; flex-wrap: wrap; gap: 10px;
    }
    .ansvarlig-row { display: flex; align-items: center; gap: 8px; }
    .ansvarlig-label { font-size: 11px; color: #424242; font-family: 'DM Mono', monospace; }
    .ansvarlig-select {
      background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
      border-radius: 6px; padding: 6px 10px; color: #9E9E9E;
      font-size: 12px; font-family: 'DM Sans', sans-serif; outline: none; cursor: pointer;
    }
    .parse-btn {
      background: #F5F0E8; color: #0D0D0D; border: none; border-radius: 8px;
      padding: 9px 22px; font-size: 13px; font-weight: 500; cursor: pointer;
      transition: all 0.2s; display: flex; align-items: center; gap: 6px;
    }
    .parse-btn:disabled { opacity: 0.35; cursor: default; }
    .parse-btn.loading { background: rgba(245,240,232,0.4); }
    .parse-error { font-size: 11px; color: #EF9A9A; font-family: 'DM Mono', monospace; }

    /* FILTERS */
    .main { padding: 20px 32px; max-width: 940px; }
    .filters { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
    .filter-btn {
      border-radius: 20px; padding: 5px 14px; font-size: 12px;
      font-family: 'DM Mono', monospace; cursor: pointer; transition: all 0.2s;
      border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02); color: #616161;
    }

    /* CARDS */
    .lead-card {
      background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
      border-radius: 12px; padding: 18px 20px; margin-bottom: 10px; transition: background 0.2s;
    }
    .lead-card:hover { background: rgba(255,255,255,0.05); }
    .card-top  { display: flex; justify-content: space-between; align-items: flex-start; }
    .card-left { flex: 1; }
    .card-right{ display: flex; flex-direction: column; align-items: flex-end; gap: 8px; margin-left: 12px; }
    .card-name-row { display: flex; align-items: center; gap: 10px; margin-bottom: 5px; flex-wrap: wrap; }
    .card-name { font-family: 'Playfair Display', serif; font-size: 16px; color: #F5F0E8; font-weight: 600; }
    .source-badge { border-radius: 4px; padding: 2px 8px; font-size: 10px; font-family: 'DM Mono', monospace; }
    .card-sub  { font-size: 13px; color: #9E9E9E; margin-bottom: 7px; }
    .card-meta { display: flex; gap: 14px; flex-wrap: wrap; }
    .card-meta span { font-size: 12px; color: #B0BEC5; font-family: 'DM Mono', monospace; }
    .card-date { font-size: 10px; color: #555; font-family: 'DM Mono', monospace; }
    .card-bottom { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; }
    .card-ansvarlig { font-size: 11px; color: #555; }
    .card-actions { display: flex; gap: 10px; }
    .btn-slett  { background: none; border: none; color: #333; cursor: pointer; font-size: 12px; transition: color 0.2s; }
    .btn-slett:hover  { color: #EF9A9A; }
    .melding-box {
      margin-top: 10px; padding: 10px 14px;
      background: rgba(255,255,255,0.025); border-radius: 8px;
      border-left: 2px solid rgba(255,255,255,0.08);
      font-size: 12px; color: #888; line-height: 1.6;
      overflow: hidden; transition: max-height 0.3s ease; cursor: pointer;
    }
    .status-btn {
      border-radius: 20px; padding: 3px 10px; font-size: 11px;
      font-family: 'DM Mono', monospace; cursor: pointer;
      display: flex; align-items: center; gap: 5px;
      transition: all 0.2s; border: 1px solid transparent;
    }
    .status-dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; }

    .empty-state { text-align: center; padding: 60px 0; }
    .empty-icon  { font-size: 36px; margin-bottom: 14px; color: #222; }
    .empty-title { font-family: 'Playfair Display', serif; font-size: 17px; color: #333; margin-bottom: 6px; }
    .empty-sub   { font-size: 13px; color: #252525; }

    @keyframes spin { to { transform: rotate(360deg); } }
    .spinner { display: inline-block; width: 12px; height: 12px; border: 2px solid #0D0D0D; border-top-color: transparent; border-radius: 50%; animation: spin 0.7s linear infinite; }
  </style>
</head>
<body>

<div id="pw-screen">
  <div style="text-align:center">
    <h1>ORO</h1>
    <p style="margin-top:6px">LEADS DASHBOARD</p>
  </div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:12px">
    <input type="password" id="pw-input" placeholder="Passord" onkeydown="if(event.key==='Enter')checkPw()" />
    <p id="pw-error" class="pw-error">Feil passord. Prøv igjen.</p>
    <button onclick="checkPw()">Logg inn</button>
  </div>
  <p>Kun for ORO-ansatte</p>
</div>

<div id="app">
  <div class="header">
    <div>
      <div class="logo-row">
        <span class="logo">ORO</span>
        <span class="logo-sub">LEADS</span>
      </div>
      <div class="lead-count" id="lead-count">0 leads totalt</div>
    </div>
  </div>

  <!-- PASTE BOX -->
  <div class="paste-area">
    <div class="paste-label">✦ <span>Lim inn e-post fra FINN.no, NE.meet eller annen kilde</span></div>
    <textarea id="paste-input" rows="2" placeholder="Lim inn e-posttekst her og trykk «Legg til» ..."></textarea>
    <div class="paste-footer">
      <div class="ansvarlig-row">
        <span class="ansvarlig-label">Ansvarlig:</span>
        <select class="ansvarlig-select" id="ansvarlig-select">
          <option>Edward Gundersen</option>
          <option>Knut</option>
          <option>Sara</option>
          <option>Thomas</option>
          <option>Maria</option>
          <option>Annen ansatt</option>
        </select>
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        <span class="parse-error" id="parse-error"></span>
        <button class="parse-btn" id="parse-btn" onclick="parseEmail()" disabled>
          Legg til
        </button>
      </div>
    </div>
  </div>

  <div class="main">
    <div class="filters" id="filters"></div>
    <div id="lead-list"></div>
  </div>
</div>

<script>
const PASSORD     = "oro2024";
const STORAGE_KEY = "oro-leads-v3";

const STATUS_CONFIG = {
  "Ny":        { color: "#4FC3F7", bg: "rgba(79,195,247,0.12)",  dot: "#4FC3F7" },
  "Kontaktet": { color: "#FFB74D", bg: "rgba(255,183,77,0.12)",  dot: "#FFB74D" },
  "I prosess": { color: "#CE93D8", bg: "rgba(206,147,216,0.12)", dot: "#CE93D8" },
  "Vunnet":    { color: "#81C784", bg: "rgba(129,199,132,0.12)", dot: "#81C784" },
  "Tapt":      { color: "#EF9A9A", bg: "rgba(239,154,154,0.12)", dot: "#EF9A9A" },
};
const STATUSES = Object.keys(STATUS_CONFIG);

let leads        = [];
let activeFilter = "Alle";
const expanded   = new Set();

// AUTH
function checkPw() {
  if (document.getElementById('pw-input').value === PASSORD) {
    document.getElementById('pw-screen').style.display = 'none';
    document.getElementById('app').classList.add('visible');
    sessionStorage.setItem('oro-auth', '1');
    init();
  } else {
    document.getElementById('pw-error').style.display = 'block';
    document.getElementById('pw-input').value = '';
  }
}
if (sessionStorage.getItem('oro-auth') === '1') {
  document.getElementById('pw-screen').style.display = 'none';
  document.getElementById('app').classList.add('visible');
  document.addEventListener('DOMContentLoaded', init);
}

// STORAGE
function loadLeads() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; } }
function saveLeads()  { localStorage.setItem(STORAGE_KEY, JSON.stringify(leads)); }

function init() {
  leads = loadLeads();
  renderFilters();
  renderLeads();

  const input = document.getElementById('paste-input');
  const btn   = document.getElementById('parse-btn');
  input.addEventListener('input', () => {
    btn.disabled = !input.value.trim();
    document.getElementById('parse-error').textContent = '';
  });
  input.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') parseEmail();
  });
}

// PARSE
async function parseEmail() {
  const text = document.getElementById('paste-input').value.trim();
  if (!text) return;
  const btn = document.getElementById('parse-btn');
  btn.disabled = true;
  btn.classList.add('loading');
  btn.innerHTML = '<span class="spinner"></span> Analyserer…';
  document.getElementById('parse-error').textContent = '';

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 800,
        system: \`Du hjelper norske eiendomsmeglere å strukturere leads fra e-post.
Svar KUN med et JSON-objekt, ingen forklaring, ingen markdown-formatering:
{"navn":"fullt navn på interessenten","telefon":"telefonnummer eller null","epost":"e-postadresse eller null","kilde":"FINN.no eller NE.meet eller Bekjent eller Annet","eiendom":"eiendomsnavn eller adresse eller null","areal":"areal f.eks 200-250m² eller null","melding":"kort sammendrag av hva de vil/spør om"}\`,
        messages: [{ role: "user", content: text }]
      })
    });
    const data   = await res.json();
    const parsed = JSON.parse(data.content[0].text.replace(/\`\`\`json|\`\`\`/g, '').trim());
    leads = [{
      ...parsed,
      id:        Date.now(),
      status:    "Ny",
      ansvarlig: document.getElementById('ansvarlig-select').value,
      dato:      new Date().toLocaleDateString('nb-NO', { day:'2-digit', month:'short', year:'numeric' })
    }, ...leads];
    saveLeads();
    document.getElementById('paste-input').value = '';
    renderFilters();
    renderLeads();
  } catch(e) {
    document.getElementById('parse-error').textContent = 'Noe gikk galt – prøv igjen';
  }

  btn.disabled  = false;
  btn.classList.remove('loading');
  btn.innerHTML = 'Legg til';
}

// STATUS
function nextStatus(id) {
  leads = leads.map(l => {
    if (l.id !== id) return l;
    return { ...l, status: STATUSES[(STATUSES.indexOf(l.status) + 1) % STATUSES.length] };
  });
  saveLeads(); renderFilters(); renderLeads();
}

// DELETE
function deleteLead(id) {
  leads = leads.filter(l => l.id !== id);
  saveLeads(); renderFilters(); renderLeads();
}

// TOGGLE MELDING
function toggleMelding(id) {
  expanded.has(id) ? expanded.delete(id) : expanded.add(id);
  renderLeads();
}

// FILTERS
function renderFilters() {
  const counts = {};
  STATUSES.forEach(s => counts[s] = leads.filter(l => l.status === s).length);
  document.getElementById('filters').innerHTML = ['Alle', ...STATUSES].map(s => {
    const cfg    = STATUS_CONFIG[s];
    const count  = s === 'Alle' ? leads.length : (counts[s] || 0);
    const active = activeFilter === s;
    let style = '';
    if (active && cfg)  style = \`background:\${cfg.bg};border-color:\${cfg.color}40;color:\${cfg.color}\`;
    else if (active)    style = 'background:rgba(255,255,255,0.1);border-color:rgba(255,255,255,0.2);color:#F5F0E8';
    return \`<button class="filter-btn" style="\${style}" onclick="setFilter('\${s}')">\${s} · \${count}</button>\`;
  }).join('');
  document.getElementById('lead-count').textContent = leads.length + ' leads totalt';
}

function setFilter(s) { activeFilter = s; renderFilters(); renderLeads(); }

// RENDER LEADS
function renderLeads() {
  const filtered = activeFilter === 'Alle' ? leads : leads.filter(l => l.status === activeFilter);
  const container = document.getElementById('lead-list');
  if (!filtered.length) {
    container.innerHTML = \`<div class="empty-state">
      <div class="empty-icon">◇</div>
      <div class="empty-title">Ingen leads ennå</div>
      <div class="empty-sub">Lim inn en e-post fra FINN.no eller NE.meet for å komme i gang</div>
    </div>\`;
    return;
  }
  container.innerHTML = filtered.map(lead => {
    const cfg        = STATUS_CONFIG[lead.status] || STATUS_CONFIG['Ny'];
    const kildeColor = lead.kilde === 'FINN.no' ? '#FF6B35' : lead.kilde === 'NE.meet' ? '#60A5FA' : '#A5D6A7';
    const kildeBg    = lead.kilde === 'FINN.no' ? 'rgba(255,60,0,0.15)' : lead.kilde === 'NE.meet' ? 'rgba(0,120,255,0.15)' : 'rgba(100,200,100,0.15)';
    const isExp      = expanded.has(lead.id);
    return \`
    <div class="lead-card">
      <div class="card-top">
        <div class="card-left">
          <div class="card-name-row">
            <span class="card-name">\${lead.navn || 'Ukjent'}</span>
            <span class="source-badge" style="color:\${kildeColor};background:\${kildeBg};border:1px solid \${kildeColor}40">\${lead.kilde || ''}</span>
          </div>
          <div class="card-sub">\${lead.eiendom || lead.areal || '—'}</div>
          <div class="card-meta">
            \${lead.telefon ? \`<span>📞 \${lead.telefon}</span>\` : ''}
            \${lead.epost   ? \`<span>✉️ \${lead.epost}</span>\`   : ''}
            \${lead.areal && lead.eiendom ? \`<span>📐 \${lead.areal}</span>\` : ''}
          </div>
        </div>
        <div class="card-right">
          <button class="status-btn" style="background:\${cfg.bg};color:\${cfg.color};border-color:\${cfg.color}40" onclick="nextStatus(\${lead.id})">
            <span class="status-dot" style="background:\${cfg.dot}"></span>\${lead.status}
          </button>
          <span class="card-date">\${lead.dato}</span>
        </div>
      </div>
      \${lead.melding ? \`<div class="melding-box" style="max-height:\${isExp?'200px':'40px'}" onclick="toggleMelding(\${lead.id})">\${lead.melding}</div>\` : ''}
      <div class="card-bottom">
        <span class="card-ansvarlig">👤 \${lead.ansvarlig || '—'}</span>
        <div class="card-actions">
          <button class="btn-slett" onclick="deleteLead(\${lead.id})">slett</button>
        </div>
      </div>
    </div>\`;
  }).join('');
}
</script>
</body>
</html>`;

export default function OroEditor() {
  const [code, setCode] = useState(INITIAL_HTML);
  const [srcdoc, setSrcdoc] = useState(INITIAL_HTML);
  const debounce = useRef(null);

  const handleChange = (e) => {
    const val = e.target.value;
    setCode(val);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => setSrcdoc(val), 700);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = e.target;
      const s = ta.selectionStart, end = ta.selectionEnd;
      const nv = code.substring(0, s) + "  " + code.substring(end);
      setCode(nv);
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = s + 2; }, 0);
    }
  };

  const download = () => {
    const blob = new Blob([code], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "index.html";
    a.click();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#0a0a0a" }}>
      <div style={{ background: "#111", borderBottom: "1px solid #1e1e1e", padding: "8px 16px", display: "flex", alignItems: "center", flexShrink: 0 }}>
        <span style={{ color: "#333", fontSize: 11, fontFamily: "monospace", letterSpacing: "0.12em" }}>ORO LEADS — LIVE EDITOR</span>
        <button onClick={download} style={{ marginLeft: "auto", background: "#F5F0E8", color: "#111", border: "none", borderRadius: 6, padding: "6px 16px", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
          ⬇ Last ned index.html
        </button>
      </div>
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div style={{ width: "50%", display: "flex", flexDirection: "column", borderRight: "1px solid #1a1a1a" }}>
          <div style={{ background: "#0e0e0e", padding: "5px 14px", fontSize: 10, color: "#2a2a2a", fontFamily: "monospace", borderBottom: "1px solid #181818" }}>index.html</div>
          <textarea value={code} onChange={handleChange} onKeyDown={handleKeyDown} spellCheck={false}
            style={{ flex: 1, background: "#080808", color: "#bbb", fontFamily: "monospace", fontSize: 11, lineHeight: 1.65, padding: 14, border: "none", outline: "none", resize: "none", overflowY: "auto", whiteSpace: "pre", tabSize: 2 }}
          />
        </div>
        <div style={{ width: "50%", display: "flex", flexDirection: "column" }}>
          <div style={{ background: "#0e0e0e", padding: "5px 14px", fontSize: 10, color: "#2a2a2a", fontFamily: "monospace", borderBottom: "1px solid #181818", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4CAF50", display: "inline-block" }} /> FORHÅNDSVISNING
          </div>
          <iframe srcDoc={srcdoc} sandbox="allow-scripts" style={{ flex: 1, border: "none" }} />
        </div>
      </div>
    </div>
  );
}
