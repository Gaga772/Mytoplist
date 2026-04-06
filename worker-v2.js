export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204 });
    }

    if (request.method === "POST" && url.pathname === "/api") {
      try {
        const body = await request.json();
        const resp = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": env.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify(body),
        });
        const data = await resp.json();
        return new Response(JSON.stringify(data), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
      }
    }

    return new Response(`<!DOCTYPE html>
<html lang="lt">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
<meta name="theme-color" content="#0d0d0d">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Mano Lenta">
<title>Mano Lenta</title>
<style>
:root {
  --bg: #0d0d0d; --bg2: #111; --bg3: #161616; --bg4: #1e1e1e;
  --text: #f0e8dc; --text2: #a09888; --text3: #555; --text4: #333;
  --border: #1e1e1e; --border2: #2a2a2a;
  --accent: #e85d04;
}
.light {
  --bg: #f5f0ea; --bg2: #fff; --bg3: #faf7f4; --bg4: #ede8e2;
  --text: #1a1208; --text2: #5a4a38; --text3: #999; --text4: #ccc;
  --border: #e0d8ce; --border2: #d0c8be;
  --accent: #e85d04;
}
* { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
html, body { height: 100%; background: var(--bg); color: var(--text); font-family: Georgia, serif; overflow: hidden; transition: background .3s, color .3s; }
::-webkit-scrollbar { width: 3px; }
::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }

#app { height: 100vh; display: flex; flex-direction: column; }

#header { padding: 12px 16px 10px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 10px; flex-shrink: 0; background: var(--bg); }
#header h1 { font-size: 17px; font-weight: 400; color: var(--text); }
#header small { display: block; font-size: 10px; color: var(--text3); font-family: monospace; letter-spacing: .05em; margin-top: 1px; }
#theme-btn { background: var(--bg4); border: 1px solid var(--border); color: var(--text2); border-radius: 20px; padding: 5px 12px; font-size: 12px; cursor: pointer; margin-left: auto; }
#add-btn { background: var(--accent); border: none; color: #fff; border-radius: 8px; padding: 7px 14px; font-size: 13px; cursor: pointer; margin-left: 8px; }

#tabs { display: flex; border-bottom: 1px solid var(--border); flex-shrink: 0; background: var(--bg); }
#tabs button { flex: 1; padding: 10px 6px; background: none; border: none; border-bottom: 2px solid transparent; color: var(--text3); font-size: 11px; font-family: monospace; cursor: pointer; letter-spacing: .04em; }
#tabs button.active { color: var(--text); border-bottom-color: var(--accent); }

#board-view { flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 10px; background: var(--bg); }

.col-block { background: var(--bg2); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
.col-header { padding: 12px 14px; display: flex; justify-content: space-between; align-items: center; }
.col-header-label { font-size: 11px; font-family: monospace; letter-spacing: .06em; color: var(--text); font-weight: 600; }
.col-count { border-radius: 20px; padding: 1px 9px; font-size: 11px; font-family: monospace; }
.col-cards { padding: 8px 10px 10px; display: flex; flex-direction: column; gap: 7px; }
.empty-col { color: var(--text4); font-size: 11px; font-style: italic; padding: 8px 4px; text-align: center; }

.card { border-left: 4px solid; border-radius: 7px; padding: 10px 12px; background: var(--bg3); border-top: 1px solid var(--border); border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); transition: transform .15s, box-shadow .15s; } .card:active { transform: scale(.98); }
.card.done { opacity: 0.5; }
.card-title { font-size: 14px; color: var(--text); line-height: 1.4; }
.card.done .card-title { text-decoration: line-through; color: var(--text3); }
.card-desc { font-size: 12px; color: var(--text2); margin-top: 4px; line-height: 1.4; }
.card-actions { display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap; }
.card-btn { background: var(--bg4); border: 1px solid var(--border); color: var(--text2); border-radius: 5px; padding: 4px 9px; font-size: 11px; cursor: pointer; font-family: monospace; }

#chat-view { flex: 1; display: none; flex-direction: column; overflow: hidden; background: var(--bg); }
#messages { flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 10px; }
.msg { display: flex; }
.msg.user { justify-content: flex-end; }
.bubble { max-width: 85%; padding: 10px 14px; font-size: 13px; line-height: 1.5; }
.msg.bot .bubble { background: var(--bg2); border: 1px solid var(--border); border-radius: 12px 12px 12px 2px; color: var(--text2); }
.msg.user .bubble { background: #e85d0422; border: 1px solid #e85d0444; border-radius: 12px 12px 2px 12px; color: var(--text); }
.action-tags { display: flex; flex-wrap: wrap; gap: 3px; margin-top: 5px; }
.action-tag { background: var(--bg4); border-radius: 3px; padding: 1px 5px; font-size: 9px; color: var(--text3); font-family: monospace; }
.dots { display: flex; gap: 5px; padding: 4px 6px; }
.dot { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); animation: pulse 1.2s infinite ease-in-out; }
.dot:nth-child(2) { animation-delay: .2s; }
.dot:nth-child(3) { animation-delay: .4s; }
@keyframes pulse { 0%,100%{opacity:.2;transform:scale(.8)} 50%{opacity:1;transform:scale(1)} }

#input-row { padding: 10px 14px; border-top: 1px solid var(--border); display: flex; gap: 8px; flex-shrink: 0; background: var(--bg); }
#chat-input { flex: 1; background: var(--bg2); border: 1px solid var(--border2); border-radius: 8px; padding: 10px 12px; color: var(--text); font-size: 14px; outline: none; font-family: Georgia, serif; }
#send-btn { background: var(--accent); border: none; border-radius: 8px; padding: 0 16px; color: #fff; font-size: 18px; cursor: pointer; }
#send-btn:disabled { background: var(--bg4); color: var(--text3); }

#modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: none; align-items: center; justify-content: center; z-index: 200; padding: 20px; }
#modal { background: var(--bg2); border: 1px solid var(--border2); border-radius: 14px; padding: 24px; width: 100%; max-width: 380px; }
#modal h3 { font-weight: 400; font-size: 18px; color: var(--text); margin-bottom: 16px; }
.field-label { font-size: 10px; color: var(--text3); font-family: monospace; letter-spacing: .08em; margin-top: 4px; }
.field-input { display: block; width: 100%; margin-top: 5px; margin-bottom: 12px; background: var(--bg); border: 1px solid var(--border2); border-radius: 7px; padding: 10px 12px; color: var(--text); font-size: 14px; outline: none; font-family: Georgia, serif; }
textarea.field-input { resize: vertical; min-height: 70px; }
.modal-btns { display: flex; gap: 8px; justify-content: flex-end; margin-top: 4px; }
.btn-cancel { background: var(--bg4); border: none; color: var(--text2); border-radius: 7px; padding: 10px 18px; font-size: 13px; cursor: pointer; }
.btn-save { background: var(--accent); border: none; color: #fff; border-radius: 7px; padding: 10px 18px; font-size: 13px; cursor: pointer; }
.move-option { padding: 12px 14px; border-radius: 7px; cursor: pointer; font-size: 14px; color: var(--text2); margin-bottom: 6px; border: 1px solid var(--border); background: var(--bg3); }
</style>
</head>
<body>
<div id="app">
  <div id="header">
    <span style="font-size:20px">&#x1F9E0;</span>
    <div>
      <h1>Mano Lenta</h1>
      <small id="card-count">kraunama...</small>
    </div>
    <button id="theme-btn" onclick="toggleTheme()">☀️ Diena</button>
    <button id="add-btn" onclick="openAddModal(null)">+ Prid&#x117;ti</button>
  </div>
  <div id="tabs">
    <button id="tab-board" class="active" onclick="showTab('board')">&#x1F4CB; LENTA</button>
    <button id="tab-chat" onclick="showTab('chat')">&#x1F4AC; AI</button>
  </div>
  <div id="board-view"></div>
  <div id="chat-view">
    <div id="messages"></div>
    <div id="input-row">
      <input id="chat-input" type="text" placeholder="Komanda lietuviškai..." autocomplete="off">
      <button id="send-btn" onclick="sendChat()">&#x2192;</button>
    </div>
  </div>
</div>

<div id="modal-overlay" onclick="if(event.target===this)closeModal()">
  <div id="modal">
    <h3 id="modal-title">Nauja kortel&#x117;</h3>
    <div class="field-label">PAVADINIMAS</div>
    <input id="field-title" class="field-input" type="text">
    <div class="field-label">APRA&#x160;YMAS</div>
    <textarea id="field-desc" class="field-input"></textarea>
    <div class="field-label">KOLONA</div>
    <select id="field-col" class="field-input">
      <option value="priorities">&#x1F3AF; Prioritetai</option>
      <option value="dreams">&#x2728; Svajones</option>
      <option value="doing">&#x26A1; Daroma</option>
      <option value="done">&#x2705; Padaryta</option>
    </select>
    <div class="modal-btns">
      <button class="btn-cancel" onclick="closeModal()">At&#x161;aukti</button>
      <button class="btn-save" onclick="saveModal()">I&#x161;saugoti</button>
    </div>
  </div>
</div>

<script>
var COLS = [
  { id: "priorities", label: "Prioritetai", emoji: "🎯", color: "#e85d04" },
  { id: "dreams",     label: "Svajones",    emoji: "✨", color: "#7209b7" },
  { id: "doing",      label: "Daroma",      emoji: "⚡", color: "#0077b6" },
  { id: "done",       label: "Padaryta",    emoji: "✅", color: "#2d6a4f" },
];

var SK = "mlenta-v4";
var INITIAL = [
  { id: "p1", col: "priorities", title: "I\\u0161silaikyti teises",   desc: "" },
  { id: "p2", col: "priorities", title: "Sutvarkyti spint\\u0105",    desc: "" },
  { id: "p3", col: "priorities", title: "Pakabinti d\\u017eiovykl\\u0119", desc: "" },
  { id: "p4", col: "priorities", title: "Nusipirkti vitamin\\u0173",  desc: "" },
  { id: "d1", col: "dreams",     title: "Nusipirkti motocikl\\u0105", desc: "" },
];

var cards = [];
var editingId = null;
var loading = false;
var darkMode = true;

function genId() { return Math.random().toString(36).slice(2, 9); }

function save() {
  try { localStorage.setItem(SK, JSON.stringify(cards)); } catch(e) {}
}

function load() {
  try {
    var s = localStorage.getItem(SK);
    if (s) {
      var p = JSON.parse(s);
      if (Array.isArray(p) && p.length > 0) return p;
    }
  } catch(e) {}
  return JSON.parse(JSON.stringify(INITIAL));
}

function esc(s) {
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

function toggleTheme() {
  darkMode = !darkMode;
  document.body.classList.toggle("light", !darkMode);
  document.getElementById("theme-btn").innerHTML = darkMode ? "☀️ Diena" : "🌙 Naktis";
}

function showTab(tab) {
  document.getElementById("board-view").style.display = tab === "board" ? "flex" : "none";
  document.getElementById("chat-view").style.display  = tab === "chat"  ? "flex" : "none";
  document.getElementById("tab-board").className = tab === "board" ? "active" : "";
  document.getElementById("tab-chat").className  = tab === "chat"  ? "active" : "";
  if (tab === "board") renderBoard();
}

function renderBoard() {
  var el = document.getElementById("board-view");
  document.getElementById("card-count").textContent = cards.length + " korteli\\u0173(-i\\u0173)";
  var html = "";
  COLS.forEach(function(col) {
    var cc = cards.filter(function(c) { return c.col === col.id; });
    html += '<div class="col-block">';
    html += '<div class="col-header" style="border-bottom:2px solid ' + col.color + ';background:' + col.color + '18' + '">';
    html += '<span class="col-header-label">' + col.emoji + ' ' + col.label.toUpperCase() + '</span>';
    html += '<span class="col-count" style="background:' + col.color + '33;color:' + col.color + '">' + cc.length + '</span>';
    html += '</div><div class="col-cards">';
    if (cc.length === 0) {
      html += '<div class="empty-col">tu\\u0161\\u010dia</div>';
    }
    cc.forEach(function(card) {
      html += '<div class="card ' + (card.col === "done" ? "done" : "") + '" style="border-left-color:' + col.color + ';background:' + col.color + '11' + '">';
      html += '<div class="card-title">' + esc(card.title) + '</div>';
      if (card.desc) html += '<div class="card-desc">' + esc(card.desc) + '</div>';
      html += '<div class="card-actions">';
      html += '<button class="card-btn" onclick="toggleDone(\\'' + card.id + '\\')">' + (card.col === "done" ? "&#x21A9; Atstatyti" : "&#x2713; Padaryta") + '</button>';
      html += '<button class="card-btn" onclick="openMoveModal(\\'' + card.id + '\\')">&#x2194; Perkelti</button>';
      html += '<button class="card-btn" onclick="openEditModal(\\'' + card.id + '\\')">&#x270F;</button>';
      html += '<button class="card-btn" onclick="deleteCard(\\'' + card.id + '\\')" style="color:#e85d04">&#x1F5D1;</button>';
      html += '</div></div>';
    });
    html += '</div></div>';
  });
  el.innerHTML = html;
}

function toggleDone(id) {
  var c = cards.find(function(c) { return c.id === id; });
  if (c) c.col = c.col === "done" ? "doing" : "done";
  save(); renderBoard();
}

function deleteCard(id) {
  cards = cards.filter(function(c) { return c.id !== id; });
  save(); renderBoard();
}

function openAddModal(col) {
  editingId = null;
  document.getElementById("modal-title").textContent = "Nauja kortele";
  document.getElementById("field-title").value = "";
  document.getElementById("field-desc").value = "";
  document.getElementById("field-col").value = col || "priorities";
  document.getElementById("modal-overlay").style.display = "flex";
  setTimeout(function() { document.getElementById("field-title").focus(); }, 100);
}

function openEditModal(id) {
  var c = cards.find(function(c) { return c.id === id; });
  if (!c) return;
  editingId = id;
  document.getElementById("modal-title").textContent = "Redaguoti";
  document.getElementById("field-title").value = c.title;
  document.getElementById("field-desc").value = c.desc;
  document.getElementById("field-col").value = c.col;
  document.getElementById("modal-overlay").style.display = "flex";
}

function closeModal() {
  document.getElementById("modal-overlay").style.display = "none";
}

function saveModal() {
  var title = document.getElementById("field-title").value.trim();
  if (!title) return;
  var desc = document.getElementById("field-desc").value.trim();
  var col  = document.getElementById("field-col").value;
  if (editingId) {
    var c = cards.find(function(c) { return c.id === editingId; });
    if (c) { c.title = title; c.desc = desc; c.col = col; }
  } else {
    cards.push({ id: genId(), col: col, title: title, desc: desc });
  }
  save(); renderBoard(); closeModal();
}

function openMoveModal(id) {
  var c = cards.find(function(c) { return c.id === id; });
  if (!c) return;
  var modal = document.getElementById("modal");
  var html = "<h3>Perkelti kortele</h3>";
  html += '<div style="font-size:13px;color:var(--text2);margin-bottom:12px">' + esc(c.title) + '</div>';
  COLS.filter(function(col) { return col.id !== c.col; }).forEach(function(col) {
    html += '<div class="move-option" onclick="doMove(\\'' + id + '\\',\\'' + col.id + '\\')" style="border-left:3px solid ' + col.color + '">' + col.emoji + ' ' + col.label + '</div>';
  });
  html += '<div class="modal-btns"><button class="btn-cancel" onclick="closeModal()">Atsaukti</button></div>';
  modal.innerHTML = html;
  document.getElementById("modal-overlay").style.display = "flex";
}

function doMove(id, toCol) {
  var c = cards.find(function(c) { return c.id === id; });
  if (c) c.col = toCol;
  save(); renderBoard(); closeModal();
}

document.addEventListener("keydown", function(e) {
  if (e.key === "Escape") closeModal();
});

// --- AI Chat ---
var SYSTEM = 'Tu esi asmeninis lentu asistentas. Valdyk Kanban lenta su 4 kolonomis: "priorities" (Prioritetai), "dreams" (Svajones), "doing" (Daroma), "done" (Padaryta). Atsakyk TIKTAI JSON (be markdown): {"actions":[{"type":"add","col":"...","title":"...","desc":"..."},{"type":"move","id":"...","toCol":"..."},{"type":"delete","id":"..."},{"type":"edit","id":"...","title":"...","desc":"..."}],"reply":"Trumpas atsakymas lietuviškai"}';

var msgs = [{ role: "bot", text: "Sveiki! Sakykite ka daryti. Pvz.: Pridek i prioritetus: sutvarkyti soda" }];

function renderMsgs() {
  var el = document.getElementById("messages");
  var html = msgs.map(function(m) {
    return '<div class="msg ' + m.role + '"><div class="bubble">' + esc(m.text) +
      (m.actions && m.actions.length ? '<div class="action-tags">' + m.actions.map(function(a) {
        return '<span class="action-tag">' + a.type + (a.toCol ? ' ->' + a.toCol : '') + '</span>';
      }).join('') + '</div>' : '') + '</div></div>';
  }).join('');
  if (loading) html += '<div class="dots"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>';
  el.innerHTML = html;
  el.scrollTop = el.scrollHeight;
}

document.getElementById("chat-input").addEventListener("keydown", function(e) {
  if (e.key === "Enter") { e.preventDefault(); sendChat(); }
});

async function sendChat() {
  var input = document.getElementById("chat-input");
  var text = input.value.trim();
  if (!text || loading) return;
  input.value = "";
  msgs.push({ role: "user", text: text });
  loading = true;
  renderMsgs();
  document.getElementById("send-btn").disabled = true;

  var boardCtx = cards.length
    ? cards.map(function(c) { return "[" + c.id + "] \\"" + c.title + "\\" | " + c.col; }).join("\\n")
    : "(lenta tuscia)";

  try {
    var res = await fetch("/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: SYSTEM,
        messages: [{ role: "user", content: "Lenta:\\n" + boardCtx + "\\n\\nKomanda: " + text }],
      }),
    });
    var data = await res.json();
    var raw = ((data.content && data.content[0] && data.content[0].text) || "{}").replace(/\`\`\`json|\`\`\`/g,"").trim();
    var parsed = {};
    try { parsed = JSON.parse(raw); } catch(e) {}
    var actions = parsed.actions || [];
    var reply = parsed.reply || "Atlikta!";

    actions.forEach(function(a) {
      if (a.type === "add") cards.push({ id: genId(), col: a.col || "priorities", title: a.title, desc: a.desc || "" });
      if (a.type === "move") { var c = cards.find(function(c) { return c.id === a.id; }); if(c) c.col = a.toCol; }
      if (a.type === "delete") cards = cards.filter(function(c) { return c.id !== a.id; });
      if (a.type === "edit") { var c = cards.find(function(c) { return c.id === a.id; }); if(c) { if(a.title) c.title=a.title; if(a.desc!==undefined) c.desc=a.desc; } }
    });
    save();
    msgs.push({ role: "bot", text: reply, actions: actions });
  } catch(e) {
    msgs.push({ role: "bot", text: "Klaida. Bandykite dar karta." });
  }
  loading = false;
  document.getElementById("send-btn").disabled = false;
  renderMsgs();
  renderBoard();
}

// Init
cards = load();
renderBoard();
renderMsgs();
</script>
</body>
</html>
`, {
      headers: { "Content-Type": "text/html;charset=UTF-8" },
    });
  },
};
