const TEAM = ["Young_Goosy", "Kaji", "Toon", "Eternal", "Jolteon", "Menkyo", "White Toe"];
const MAPS = ["Abyss", "Ascent", "Bind", "Breeze", "Corrode", "Fracture", "Haven", "Icebox", "Lotus", "Pearl", "Split", "Sunset"];

const FALLBACK_AGENTS = [
  ["Astra","Controller"],["Breach","Initiator"],["Brimstone","Controller"],["Chamber","Sentinel"],["Clove","Controller"],["Cypher","Sentinel"],["Deadlock","Sentinel"],["Fade","Initiator"],["Gekko","Initiator"],["Harbor","Controller"],["Iso","Duelist"],["Jett","Duelist"],["KAY/O","Initiator"],["Killjoy","Sentinel"],["Neon","Duelist"],["Omen","Controller"],["Phoenix","Duelist"],["Raze","Duelist"],["Reyna","Duelist"],["Sage","Sentinel"],["Skye","Initiator"],["Sova","Initiator"],["Tejo","Initiator"],["Viper","Controller"],["Vyse","Sentinel"],["Waylay","Duelist"],["Yoru","Duelist"]
].map(([displayName, role]) => ({ displayName, role, displayIcon: "", fullPortrait: "" }));

const RECOMMENDED = {
  Abyss: { comp:["Jett","Omen","Sova","Killjoy","Breach"], note:"Balanced entry, recon, stun pressure, and safe site anchoring." },
  Ascent: { comp:["Jett","Omen","Sova","Killjoy","KAY/O"], note:"Classic Ascent structure with recon, suppress, smoke, and lockdown." },
  Bind: { comp:["Raze","Brimstone","Gekko","Viper","Cypher"], note:"Explosive site hits, strong post-plant, and trap control." },
  Breeze: { comp:["Jett","Viper","Sova","Cypher","Harbor"], note:"Double controller helps long-range space and safer plants." },
  Corrode: { comp:["Neon","Omen","Fade","Killjoy","Breach"], note:"Fast pressure with layered initiator utility and sentinel safety." },
  Fracture: { comp:["Raze","Brimstone","Breach","Killjoy","Fade"], note:"Breach and Raze pressure both sides while Brim enables quick hits." },
  Haven: { comp:["Jett","Omen","Sova","Killjoy","Breach"], note:"Triple-site map with recon, stun support, and strong sentinel coverage." },
  Icebox: { comp:["Jett","Viper","Sova","Killjoy","Harbor"], note:"Viper plus Harbor gives safer lane control and plant coverage." },
  Lotus: { comp:["Raze","Omen","Fade","Killjoy","Viper"], note:"Good for close fights, rotating control, and multi-site pressure." },
  Pearl: { comp:["Jett","Astra","Fade","Killjoy","Harbor"], note:"Long lanes, layered utility, and strong post-plant options." },
  Split: { comp:["Raze","Omen","Cypher","Breach","Viper"], note:"Strong mid control, site anchoring, and explosive execute utility." },
  Sunset: { comp:["Neon","Omen","Cypher","Breach","Sova"], note:"Mid control and fast entry with strong info gathering." }
};

const MAP_NOTES = {
  Abyss: ["Favor early mid info before hard committing.", "Sova dart plus Breach stun helps force defenders off angles.", "Killjoy anchors the weak side while Jett threatens fast space."],
  Ascent: ["Default for mid control before exploding onto site.", "KAY/O knife can deny common operator and sentinel setups.", "Killjoy lockdown is a strong late-round closer."],
  Bind: ["Use teleporter pressure to fake rotations and split defender attention.", "Viper plus Brimstone enables strong post-plant lineups and site denial.", "Cypher trap coverage protects flanks during long executes."],
  Breeze: ["Double controller is strongest when spacing utility instead of dumping it together.", "Harbor helps crossing open lanes and safer spike plants.", "Cypher cameras and trips reduce lurk pressure on the long rotates."],
  Corrode: ["Neon and Breach work best when timed for fast, layered entry.", "Fade utility can clear close corners before committing.", "Killjoy keeps retake paths safer after the plant."],
  Fracture: ["Lean into split pressure from both sides of the map.", "Breach should help open the first duel rather than save all utility for late round.", "Fade plus Killjoy makes post-plant very stable."],
  Haven: ["Recon is high value because of the third site and frequent rotations.", "Breach can punish stacked defenders on tight site hits.", "Killjoy should flex setup by site based on opponent tendencies."],
  Icebox: ["Viper wall timing matters more than raw speed on executes.", "Harbor can secure plant zones when defenders fight hard for lanes.", "Sova helps clear deep angles and backsite utility."],
  Lotus: ["Fast rotations reward comps that can retake space quickly.", "Fade utility is great for close-range site clearing.", "Viper helps isolate fights on the crunch-heavy entrances."],
  Pearl: ["Harbor and Astra should layer utility, not overlap it.", "Fade helps break stubborn long-angle defenders.", "Killjoy keeps flanks and post-plant safer on long lane rounds."],
  Split: ["Mid control often decides the round more than instant site rushing.", "Breach should support choke breaks and rope pressure.", "Cypher and Viper together can heavily slow defender or attacker pivots."],
  Sunset: ["Fight for mid with coordinated initiator utility.", "Neon thrives when Breach or Sova creates clean entry timing.", "Cypher gives stable anti-flank value during faster rounds."]
};

const DEFAULT_PREFS = {
  Young_Goosy: ["Killjoy", "Cypher", "Vyse"],
  Kaji: ["Fade", "Sova", "Gekko"],
  Menkyo: ["Jett", "Neon", "Raze"],
  Toon: ["Chamber", "Cypher", "Omen"],
  Eternal: ["Chamber", "Omen", "Cypher"],
  Jolteon: ["Omen", "Gekko", "Sova"],
  "White Toe": ["Breach", "Clove", "Raze"]
};

let agents = FALLBACK_AGENTS;
let state = {
  selectedPlayers: ["Young_Goosy", "Kaji", "Toon", "Eternal", "Menkyo"],
  lineup: {},
  locked: false,
  activePlayer: null
};

const $ = id => document.getElementById(id);
const saved = key => JSON.parse(localStorage.getItem(key) || "null");
const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));

function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2200);
}

function normalize(name) {
  return String(name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function agentByName(name) {
  return agents.find(a => normalize(a.displayName) === normalize(name));
}

function selectedAgents() {
  return Object.values(state.lineup).filter(Boolean);
}

function isTaken(agent, player) {
  return Object.entries(state.lineup).some(([p, a]) => p !== player && normalize(a) === normalize(agent));
}

function currentMap() {
  return $("mapSelect").value;
}

function currentBench() {
  return TEAM.filter(p => !state.selectedPlayers.includes(p));
}

function getWarnings() {
  const roles = roleCounts();
  const warnings = [];
  if (state.selectedPlayers.length !== 5) warnings.push("Choose exactly 5 starting players.");
  if (selectedAgents().length !== state.selectedPlayers.length) warnings.push("Some players still need agents.");
  if (!roles.Controller) warnings.push("No Controller selected.");
  if (!roles.Initiator) warnings.push("No Initiator selected.");
  if (!roles.Sentinel) warnings.push("No Sentinel selected.");
  if (roles.Duelist > 2) warnings.push("More than two Duelists selected.");
  return warnings;
}

function roleCounts() {
  const roles = { Duelist: 0, Controller: 0, Initiator: 0, Sentinel: 0, Unknown: 0 };
  selectedAgents().forEach(n => {
    const r = agentByName(n)?.role || "Unknown";
    roles[r] = (roles[r] || 0) + 1;
  });
  return roles;
}

async function loadAgents() {
  try {
    const res = await fetch("https://valorant-api.com/v1/agents?isPlayableCharacter=true");
    const json = await res.json();
    agents = json.data.map(a => ({
      displayName: a.displayName,
      role: a.role?.displayName || "Unknown",
      displayIcon: a.displayIcon,
      fullPortrait: a.fullPortrait || a.displayIcon
    })).sort((a, b) => a.displayName.localeCompare(b.displayName));
  } catch (e) {
    console.warn("Using fallback agents", e);
  }
  renderAll();
}

function init() {
  const today = new Date();
  $("matchDate").value = today.toISOString().slice(0, 10);
  $("matchTime").value = "20:00";
  MAPS.forEach(m => $("mapSelect").insertAdjacentHTML("beforeend", `<option>${m}</option>`));
  $("mapSelect").value = "Haven";
  const last = saved("yg-current-state");
  if (last) state = { ...state, ...last, locked: false };
  bindEvents();
  loadAgents();
}

function bindEvents() {
  $("newMatchBtn").onclick = () => {
    state.lineup = {};
    state.locked = false;
    $("opponent").value = "";
    renderAll();
    toast("New match started");
  };
  $("mapSelect").onchange = () => renderAll();
  $("loadRecommendedBtn").onclick = loadRecommended;
  $("saveMapCompBtn").onclick = saveMapComp;
  $("loadSavedMapBtn").onclick = loadSavedMapComp;
  $("lockBtn").onclick = lockComp;
  $("unlockBtn").onclick = () => {
    state.locked = false;
    persist();
    renderAll();
    toast("Comp unlocked");
  };
  $("copyBtn").onclick = copySummary;
  $("clearHistoryBtn").onclick = () => {
    localStorage.removeItem("yg-history");
    renderHistory();
    toast("History cleared");
  };
  $("closeModal").onclick = () => $("agentModal").close();
  $("agentSearch").oninput = renderAgentGrid;
  $("roleFilter").onchange = renderAgentGrid;
  ["opponent", "matchDate", "matchTime", "eventType"].forEach(id => $(id).oninput = renderHeader);
}

function persist() {
  save("yg-current-state", state);
}

function renderAll() {
  renderHeader();
  renderPlayers();
  renderRecommended();
  renderLineup();
  renderStats();
  renderHistory();
  persist();
}

function renderHeader() {
  const opp = $("opponent").value || "New Match";
  $("matchTitle").textContent = opp;
  $("matchMeta").textContent = `${$("eventType").value} • ${currentMap()} • ${$("matchDate").value || "No date"} ${$("matchTime").value || ""}`;
  const badge = $("lockBadge");
  badge.textContent = state.locked ? "Locked" : "Unlocked";
  badge.className = `badge ${state.locked ? "locked" : "unlocked"}`;
}

function renderPlayers() {
  $("playerCount").textContent = `${state.selectedPlayers.length}/5 selected`;
  $("playerGrid").innerHTML = TEAM.map(p => `<div class="player-pill ${state.selectedPlayers.includes(p) ? "active" : ""}" data-player="${p}"><span class="avatar">${p[0]}</span><strong>${p}</strong></div>`).join("");
  document.querySelectorAll(".player-pill").forEach(el => el.onclick = () => togglePlayer(el.dataset.player));
  const bench = currentBench();
  $("benchList").textContent = bench.length ? bench.join(", ") : "None";
}

function togglePlayer(p) {
  if (state.locked) return toast("Unlock the comp before changing players");
  if (state.selectedPlayers.includes(p)) {
    state.selectedPlayers = state.selectedPlayers.filter(x => x !== p);
    delete state.lineup[p];
  } else {
    if (state.selectedPlayers.length >= 5) return toast("Only 5 players can start. Remove someone first.");
    state.selectedPlayers.push(p);
  }
  renderAll();
}

function loadRecommended() {
  if (state.locked) return toast("Unlock first");
  const rec = RECOMMENDED[currentMap()]?.comp || [];
  state.lineup = {};
  const players = [...state.selectedPlayers];
  const priority = ["Young_Goosy", "Menkyo", "Kaji", "Toon", "Eternal", "Jolteon", "White Toe"];
  const sortedPlayers = players.sort((a, b) => priority.indexOf(a) - priority.indexOf(b));
  rec.forEach((agent, i) => {
    if (sortedPlayers[i]) state.lineup[sortedPlayers[i]] = agent;
  });
  renderAll();
  toast("Recommended comp loaded");
}

function saveMapComp() {
  const map = currentMap();
  const comps = saved("yg-map-comps") || {};
  comps[map] = { players: state.selectedPlayers, lineup: state.lineup, savedAt: new Date().toISOString() };
  save("yg-map-comps", comps);
  toast(`${map} comp saved`);
}

function loadSavedMapComp() {
  if (state.locked) return toast("Unlock first");
  const map = currentMap();
  const comps = saved("yg-map-comps") || {};
  if (!comps[map]) return toast(`No saved comp for ${map} yet`);
  state.selectedPlayers = comps[map].players;
  state.lineup = comps[map].lineup;
  renderAll();
  toast(`${map} saved comp loaded`);
}

function renderRecommended() {
  const map = currentMap();
  const rec = RECOMMENDED[map];
  $("mapNote").textContent = rec?.note || "";
  $("recommendedGrid").innerHTML = (rec?.comp || []).map((name, i) => {
    const a = agentByName(name);
    return `<div class="rec-card"><strong>${i + 1}. ${name}</strong><span>${a?.role || "Recommended"}</span></div>`;
  }).join("");

  const tips = MAP_NOTES[map] || [];
  const notesEl = $("mapTips");
  if (notesEl) {
    notesEl.innerHTML = tips.map(tip => `<li>${tip}</li>`).join("");
  }
}

function renderLineup() {
  $("lineupGrid").innerHTML = state.selectedPlayers.map(p => {
    const name = state.lineup[p];
    const a = agentByName(name) || {};
    const prefs = DEFAULT_PREFS[p] || [];
    return `<article class="lineup-card">
      <div class="player-name"><span>${p}</span><small>⭐ ${prefs.slice(0, 2).join(" / ")}</small></div>
      ${a.fullPortrait ? `<img alt="${a.displayName}" src="${a.fullPortrait}">` : ""}
      <div class="role">${a.role || "No agent selected"}</div>
      <div class="agent-name">${a.displayName || "Open Pick"}</div>
      <button class="change-btn" data-player="${p}" ${state.locked ? "disabled" : ""}>Choose Agent</button>
    </article>`;
  }).join("");
  document.querySelectorAll(".change-btn").forEach(btn => btn.onclick = () => openAgentModal(btn.dataset.player));
  renderStats();
}

function openAgentModal(player) {
  state.activePlayer = player;
  $("modalTitle").textContent = `Pick agent for ${player}`;
  $("modalSub").textContent = "Duplicates are blocked. Everything else is allowed.";
  renderAgentGrid();
  $("agentModal").showModal();
}

function renderAgentGrid() {
  const grid = $("agentGrid");
  if (!grid || !state.activePlayer) return;

  const q = ($("agentSearch").value || "").toLowerCase();
  const role = $("roleFilter").value;
  const player = state.activePlayer;
  const prefs = DEFAULT_PREFS[player] || [];
  const ordered = [...agents].sort((a, b) => (prefs.includes(b.displayName) - prefs.includes(a.displayName)) || a.displayName.localeCompare(b.displayName));
  grid.innerHTML = ordered
    .filter(a => (!q || a.displayName.toLowerCase().includes(q)) && (role === "All" || a.role === role))
    .map(a => {
      const disabled = isTaken(a.displayName, player);
      const owner = Object.entries(state.lineup).find(([p, n]) => p !== player && normalize(n) === normalize(a.displayName))?.[0];
      return `<div class="agent-tile ${disabled ? "disabled" : ""}" data-agent="${a.displayName}" title="${disabled ? `Taken by ${owner}` : ""}">
        ${a.displayIcon ? `<img alt="${a.displayName}" src="${a.displayIcon}">` : ""}
        <strong>${prefs.includes(a.displayName) ? "⭐ " : ""}${a.displayName}</strong><small>${a.role}${disabled ? ` • ${owner}` : ""}</small>
      </div>`;
    }).join("");

  document.querySelectorAll(".agent-tile").forEach(tile => tile.onclick = () => {
    if (tile.classList.contains("disabled")) return toast("That agent is already picked");
    state.lineup[player] = tile.dataset.agent;
    $("agentModal").close();
    renderAll();
  });
}

function renderStats() {
  const roles = roleCounts();
  $("roleStats").innerHTML = Object.entries(roles)
    .filter(([r]) => r !== "Unknown" || roles.Unknown)
    .map(([r, c]) => `<div class="role-row"><span>${r}</span><strong>${c}</strong></div>`)
    .join("");

  const warnings = getWarnings();
  $("warnings").innerHTML = warnings.map(w => `<div class="warn">⚠️ ${w}</div>`).join("") || `<div class="role-row"><span>✅ Team structure looks good</span><strong>Ready</strong></div>`;
  $("metaScore").textContent = `${metaScore()}%`;
}

function metaScore() {
  const rec = RECOMMENDED[currentMap()]?.comp || [];
  if (!rec.length) return 0;
  const picks = selectedAgents().map(normalize);
  const exact = rec.filter(a => picks.includes(normalize(a))).length;
  const roleCoverage = ["Controller", "Initiator", "Sentinel"].reduce((s, r) => s + (Object.values(state.lineup).some(n => agentByName(n)?.role === r) ? 1 : 0), 0);
  return Math.min(100, Math.round((exact / 5) * 70 + (roleCoverage / 3) * 30));
}

function lockComp() {
  const warnings = getWarnings();
  if (state.selectedPlayers.length !== 5) return toast("Pick 5 players first");
  if (selectedAgents().length !== 5) return toast("Every starter needs an agent");
  if (warnings.length) return toast("Fix comp warnings before locking");

  state.locked = true;
  const history = saved("yg-history") || [];
  history.unshift({
    id: Date.now(),
    opponent: $("opponent").value || "Unknown Opponent",
    date: $("matchDate").value,
    time: $("matchTime").value,
    eventType: $("eventType").value,
    map: currentMap(),
    players: state.selectedPlayers,
    lineup: state.lineup,
    score: metaScore()
  });
  save("yg-history", history.slice(0, 50));
  renderAll();
  toast("Comp locked and saved to history");
}

function renderHistory() {
  const history = saved("yg-history") || [];
  $("historyList").innerHTML = history.length ? history.map(h => `<div class="history-card">
    <div class="history-top"><strong>${h.eventType} vs ${h.opponent}</strong><span>${h.map} • ${h.date} ${h.time} • Meta ${h.score}%</span></div>
    <div class="history-comp">${h.players.map(p => `<div><strong>${p}</strong><br><span>${h.lineup[p] || "Open"}</span></div>`).join("")}</div>
  </div>`).join("") : `<p class="hint">No locked comps yet. Lock your first comp to save it here.</p>`;
}

async function copySummary() {
  const map = currentMap();
  const notes = MAP_NOTES[map] || [];
  const text = `YG PREMIER COMP\n${$("eventType").value} vs ${$("opponent").value || "TBD"}\n${map} • ${$("matchDate").value} ${$("matchTime").value}\n\n${state.selectedPlayers.map(p => `${p}: ${state.lineup[p] || "Open"}`).join("\n")}\n\nBench: ${currentBench().join(", ") || "None"}\n\nPlan:\n${notes.map((n, i) => `${i + 1}. ${n}`).join("\n")}`;
  try {
    await navigator.clipboard.writeText(text);
    toast("Discord summary copied");
  } catch {
    prompt("Copy this:", text);
  }
}

init();
