const TEAM = ["Team Take Off", "Kaji", "Toon", "Eternal", "Jolteon", "Menkyo", "White Toe"];
const MAPS = ["Abyss", "Ascent", "Bind", "Breeze", "Corrode", "Fracture", "Haven", "Icebox", "Lotus", "Pearl", "Split", "Sunset"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const FALLBACK_AGENTS = [
  ["Astra","Controller"],["Breach","Initiator"],["Brimstone","Controller"],["Chamber","Sentinel"],["Clove","Controller"],["Cypher","Sentinel"],["Deadlock","Sentinel"],["Fade","Initiator"],["Gekko","Initiator"],["Harbor","Controller"],["Iso","Duelist"],["Jett","Duelist"],["KAY/O","Initiator"],["Killjoy","Sentinel"],["Neon","Duelist"],["Omen","Controller"],["Phoenix","Duelist"],["Raze","Duelist"],["Reyna","Duelist"],["Sage","Sentinel"],["Skye","Initiator"],["Sova","Initiator"],["Tejo","Initiator"],["Viper","Controller"],["Vyse","Sentinel"],["Waylay","Duelist"],["Yoru","Duelist"]
].map(([displayName, role]) => ({ displayName, role, displayIcon: "", fullPortrait: "" }));

const RECOMMENDED = {
  Abyss: { comp:["Jett","Omen","Sova","Killjoy","Chamber"], note:"Requested double-sentinel structure with Chamber for angle control and Killjoy for anchoring." },
  Ascent: { comp:["Raze","Omen","Sova","KAY/O","Chamber"], note:"Raze added by request; Chamber is prioritized here for aggressive sentinel/operator value." },
  Bind: { comp:["Raze","Brimstone","Gekko","Cypher","Chamber"], note:"Double sentinel variation with Cypher flank control and Chamber for picks." },
  Breeze: { comp:["Jett","Viper","Sova","Cypher","Chamber"], note:"Long sightline map where Chamber gets more operator value with Cypher support." },
  Corrode: { comp:["Neon","Omen","Fade","Killjoy","Chamber"], note:"Fast pace plus double sentinel stability." },
  Fracture: { comp:["Raze","Brimstone","Breach","Killjoy","Chamber"], note:"Raze pressure with Chamber explicitly prioritized as your preferred sentinel." },
  Haven: { comp:["Jett","Omen","Sova","Killjoy","Chamber"], note:"Flexible triple-site structure with Chamber pick threat and Killjoy site safety." },
  Icebox: { comp:["Jett","Viper","Sova","Killjoy","Chamber"], note:"Requested double sentinel angle-holding version with Chamber replacing Harbor." },
  Lotus: { comp:["Raze","Omen","Fade","Killjoy","Chamber"], note:"Close-fight map with Chamber added to fit your preferred double-sentinel style." },
  Pearl: { comp:["Jett","Astra","Fade","Killjoy","Chamber"], note:"Layered utility plus Chamber for long-lane fights." },
  Split: { comp:["Raze","Omen","Breach","Viper","Chamber"], note:"Raze is emphasized and Chamber is locked in as the sentinel choice per your request." },
  Sunset: { comp:["Neon","Omen","Sova","Cypher","Chamber"], note:"Fast entry with info and a Chamber/Cypher double-sentinel shell." }
};

const MAP_NOTES = {
  Abyss:["Double sentinel here is a style choice, not the only meta option.","Chamber helps control long angles while Killjoy secures the opposite side.","Use Sova utility early so Jett can choose cleaner entry paths."],
  Ascent:["Raze is a strong comfort-style recommendation for tighter site takes and utility clears.","Chamber is viable for aggressive picks, though many teams still prefer Killjoy or Cypher depending on setup style.","Use KAY/O and Sova to open space before committing to explosive Raze entries."],
  Bind:["Double sentinel gives safer flank control and post-plant setups.","Raze and Gekko provide your hit power while Chamber looks for opener value.","Play around teleport pressure to keep defenders guessing."],
  Breeze:["Chamber has value on long lines, but this map often changes with patch and pro trends.","Cypher helps stabilize lurk defense across the large map.","Do not overlap Viper wall timing with early Chamber peek utility."],
  Corrode:["Fast duelists need layered setup, not solo swings.","Killjoy plus Chamber creates safer hold structure.","Fade should clear danger zones before the main hit starts."],
  Fracture:["Raze remains one of the strongest pressure agents here.","Chamber can work in the sentinel slot if your team wants an op-focused hold style.","Breach timing matters more than raw speed."],
  Haven:["Triple-site maps reward info and flexible sentinel placement.","Chamber can rotate for pick pressure while Killjoy protects a weaker lane.","Do not over-stack utility on early rounds; keep answers for rotates."],
  Icebox:["This version is your preferred style build rather than a universal pro default.","Chamber can hold aggressive off-angles while Killjoy secures post-plant space.","Sova recon should support plant lane control."],
  Lotus:["Fast rotates make disciplined sentinel utility even more valuable.","Fade helps break compact defensive positions.","Chamber can punish over-aggression when defenders fight for space."],
  Pearl:["Long lanes reward Chamber pick threat.","Fade and Astra should create layered windows for Jett to commit.","Killjoy protects the slower round shape and post-plant positions."],
  Split:["Raze is one of the clearest map fits here and deserves recommendation.","Chamber on Split is your requested preference, though broader meta discussions often debate Chamber versus other utility-heavy structures.","Breach and Viper should help isolate tight-angle fights for Raze entries."],
  Sunset:["Cypher plus Chamber creates strong anti-flank and pick pressure.","Neon can exploit mid timing if info tools are used first.","Keep one sentinel tool for late-round stabilization." ]
};

const DEFAULT_PREFS = {
  "Team Take Off": ["Killjoy", "Cypher", "Vyse"],
  Kaji: ["Fade", "Sova", "Gekko"],
  Menkyo: ["Jett", "Neon", "Raze"],
  Toon: ["Chamber", "Cypher", "Omen"],
  Eternal: ["Chamber", "Omen", "Cypher"],
  Jolteon: ["Omen", "Gekko", "Sova"],
  "White Toe": ["Breach", "Clove", "Raze"]
};

let agents = FALLBACK_AGENTS;
let state = {
  selectedPlayers: ["Team Take Off", "Kaji", "Toon", "Eternal", "Menkyo"],
  lineup: {},
  locked: false,
  activePlayer: null,
  weekly: buildDefaultWeekly()
};

const $ = id => document.getElementById(id);
const saved = key => JSON.parse(localStorage.getItem(key) || "null");
const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));

function buildDefaultWeekly(){
  const weekly = {};
  DAYS.forEach(day => {
    weekly[day] = { enabled:false, players:[...TEAM.slice(0,5)], lineup:{}, locked:false };
  });
  weekly.Monday.enabled = true;
  weekly.Thursday.enabled = true;
  return weekly;
}

function toast(msg){ const t=$("toast"); t.textContent=msg; t.classList.add("show"); setTimeout(()=>t.classList.remove("show"),2200); }
function normalize(name){ return String(name||"").toLowerCase().replace(/[^a-z0-9]/g,""); }
function agentByName(name){ return agents.find(a => normalize(a.displayName) === normalize(name)); }
function selectedAgents(){ return Object.values(state.lineup).filter(Boolean); }
function isTaken(agent, player){ return Object.entries(state.lineup).some(([p,a]) => p !== player && normalize(a) === normalize(agent)); }
function currentMap(){ return $("mapSelect").value; }
function currentBench(){ return TEAM.filter(p => !state.selectedPlayers.includes(p)); }
function roleCounts(){ const roles={Duelist:0,Controller:0,Initiator:0,Sentinel:0,Unknown:0}; selectedAgents().forEach(n=>{ const r=agentByName(n)?.role||"Unknown"; roles[r]=(roles[r]||0)+1;}); return roles; }
function getWarnings(){ const roles=roleCounts(); const warnings=[]; if(state.selectedPlayers.length!==5) warnings.push("Choose exactly 5 starting players."); if(selectedAgents().length!==state.selectedPlayers.length) warnings.push("Some players still need agents."); if(!roles.Controller) warnings.push("No Controller selected."); if(!roles.Initiator) warnings.push("No Initiator selected."); if(!roles.Sentinel) warnings.push("No Sentinel selected."); if(roles.Sentinel<2) warnings.push("Less than two Sentinels selected for your target style."); if(roles.Duelist>2) warnings.push("More than two Duelists selected."); return warnings; }

async function loadAgents(){
  try{
    const res = await fetch("https://valorant-api.com/v1/agents?isPlayableCharacter=true");
    const json = await res.json();
    agents = json.data.map(a => ({ displayName:a.displayName, role:a.role?.displayName || "Unknown", displayIcon:a.displayIcon, fullPortrait:a.fullPortrait || a.displayIcon })).sort((a,b)=>a.displayName.localeCompare(b.displayName));
  }catch(e){ console.warn("Using fallback agents", e); }
  renderAll();
}

function init(){
  const today = new Date();
  $("matchDate").value = today.toISOString().slice(0,10);
  $("matchTime").value = "20:00";
  MAPS.forEach(m => $("mapSelect").insertAdjacentHTML("beforeend", `<option value="${m}">${m}</option>`));
  $("mapSelect").value = "Haven";
  const last = saved("tto-current-state");
  if(last) state = { ...state, ...last, locked:false, weekly:last.weekly || buildDefaultWeekly() };
  bindEvents();
  renderAll();
  loadAgents();
}

function bindEvents(){
  $("newMatchBtn").onclick=()=>{ state.lineup={}; state.locked=false; $("opponent").value=""; $("eventType").value="Scrim"; renderAll(); toast("New operation started"); };
  $("mapSelect").onchange=()=>{ renderAll(); };
  $("loadRecommendedBtn").onclick=loadRecommended;
  $("saveMapCompBtn").onclick=saveMapComp;
  $("loadSavedMapBtn").onclick=loadSavedMapComp;
  $("lockBtn").onclick=lockComp;
  $("unlockBtn").onclick=()=>{ state.locked=false; persist(); renderAll(); toast("Comp unlocked"); };
  $("copyBtn").onclick=copySummary;
  $("saveWeeklyBtn").onclick=()=>{ persist(); toast("Weekly plan saved"); };
  $("clearHistoryBtn").onclick=()=>{ localStorage.removeItem("tto-history"); renderHistory(); toast("History cleared"); };
  $("closeModal").onclick=()=>$("agentModal").close();
  $("agentSearch").oninput=renderAgentGrid;
  $("roleFilter").onchange=renderAgentGrid;
  ["opponent","matchDate","matchTime","eventType"].forEach(id => $(id).oninput=renderHeader);
}

function persist(){ save("tto-current-state", state); }
function renderAll(){ renderHeader(); renderPlayers(); renderRecommended(); renderLineup(); renderStats(); renderWeeklyPlanner(); renderHistory(); persist(); }
function renderHeader(){ const opp=$("opponent").value || "TEAM TAKE OFF"; $("matchTitle").textContent=opp; $("matchMeta").textContent=`${$("eventType").value} • ${currentMap()} • ${$("matchDate").value || "No date"} ${$("matchTime").value || ""}`; const badge=$("lockBadge"); badge.textContent=state.locked?"LOCKED":"UNLOCKED"; badge.className=`badge ${state.locked?"locked":"unlocked"}`; }
function renderPlayers(){ $("playerCount").textContent=`${state.selectedPlayers.length}/5 selected`; $("playerGrid").innerHTML=TEAM.map(p=>`<div class="player-pill ${state.selectedPlayers.includes(p)?"active":""}" data-player="${p}"><span class="avatar">${p[0]}</span><strong>${p}</strong></div>`).join(""); document.querySelectorAll(".player-pill").forEach(el=>el.onclick=()=>togglePlayer(el.dataset.player)); const bench=currentBench(); $("benchList").textContent=bench.length?bench.join(", "):"None"; }
function togglePlayer(p){ if(state.locked) return toast("Unlock the comp before changing players"); if(state.selectedPlayers.includes(p)){ state.selectedPlayers=state.selectedPlayers.filter(x=>x!==p); delete state.lineup[p]; } else { if(state.selectedPlayers.length>=5) return toast("Only 5 players can start. Remove someone first."); state.selectedPlayers.push(p); } renderAll(); }
function loadRecommended(){ if(state.locked) return toast("Unlock first"); const rec=RECOMMENDED[currentMap()]?.comp || []; state.lineup={}; const players=[...state.selectedPlayers]; const priority=["Team Take Off","Menkyo","Kaji","Toon","Eternal","Jolteon","White Toe"]; players.sort((a,b)=>priority.indexOf(a)-priority.indexOf(b)); rec.forEach((agent,i)=>{ if(players[i]) state.lineup[players[i]]=agent; }); renderAll(); toast("Recommended comp loaded"); }
function saveMapComp(){ const map=currentMap(); const comps=saved("tto-map-comps") || {}; comps[map]={ players:state.selectedPlayers, lineup:state.lineup, savedAt:new Date().toISOString() }; save("tto-map-comps", comps); toast(`${map} comp saved`); }
function loadSavedMapComp(){ if(state.locked) return toast("Unlock first"); const map=currentMap(); const comps=saved("tto-map-comps") || {}; if(!comps[map]) return toast(`No saved comp for ${map} yet`); state.selectedPlayers=comps[map].players; state.lineup=comps[map].lineup; renderAll(); toast(`${map} saved comp loaded`); }
function renderRecommended(){ const map=currentMap(); const rec=RECOMMENDED[map]; $("mapNote").textContent=rec?.note || ""; $("recommendedGrid").innerHTML=(rec?.comp || []).map((name,i)=>{ const a=agentByName(name); return `<div class="rec-card"><strong>${i+1}. ${name}</strong><span>${a?.role || "Recommended"}</span></div>`; }).join(""); const tips=MAP_NOTES[map] || []; $("mapTips").innerHTML=tips.map(t=>`<li>${t}</li>`).join(""); }
function renderLineup(){ $("lineupGrid").innerHTML=state.selectedPlayers.map(p=>{ const name=state.lineup[p]; const a=agentByName(name) || {}; const prefs=DEFAULT_PREFS[p] || []; return `<article class="lineup-card"><div class="player-name"><span>${p}</span><small>⭐ ${prefs.slice(0,2).join(" / ")}</small></div>${a.fullPortrait ? `<img alt="${a.displayName}" src="${a.fullPortrait}">` : ""}<div class="role">${a.role || "No agent selected"}</div><div class="agent-name">${a.displayName || "Open Pick"}</div><button class="change-btn" data-player="${p}" ${state.locked?"disabled":""}>Choose Agent</button></article>`; }).join(""); document.querySelectorAll(".change-btn").forEach(btn=>btn.onclick=()=>openAgentModal(btn.dataset.player)); }
function openAgentModal(player){ state.activePlayer=player; $("modalTitle").textContent=`Pick agent for ${player}`; $("modalSub").textContent="Duplicates are blocked. Everything else is allowed."; renderAgentGrid(); $("agentModal").showModal(); }
function renderAgentGrid(){ const grid=$("agentGrid"); if(!grid || !state.activePlayer) return; const q=($("agentSearch").value || "").toLowerCase(); const role=$("roleFilter").value; const player=state.activePlayer; const prefs=DEFAULT_PREFS[player] || []; const ordered=[...agents].sort((a,b)=>(prefs.includes(b.displayName)-prefs.includes(a.displayName)) || a.displayName.localeCompare(b.displayName)); grid.innerHTML=ordered.filter(a=>(!q || a.displayName.toLowerCase().includes(q)) && (role==="All" || a.role===role)).map(a=>{ const disabled=isTaken(a.displayName, player); const owner=Object.entries(state.lineup).find(([p,n])=>p!==player && normalize(n)===normalize(a.displayName))?.[0]; return `<div class="agent-tile ${disabled?"disabled":""}" data-agent="${a.displayName}" title="${disabled?`Taken by ${owner}`:""}">${a.displayIcon ? `<img alt="${a.displayName}" src="${a.displayIcon}">` : ""}<strong>${prefs.includes(a.displayName)?"⭐ ":""}${a.displayName}</strong><small>${a.role}${disabled?` • ${owner}`:""}</small></div>`; }).join(""); document.querySelectorAll(".agent-tile").forEach(tile=>tile.onclick=()=>{ if(tile.classList.contains("disabled")) return toast("That agent is already picked"); state.lineup[player]=tile.dataset.agent; $("agentModal").close(); renderAll(); }); }
function renderStats(){ const roles=roleCounts(); $("roleStats").innerHTML=Object.entries(roles).filter(([r])=>r!=="Unknown" || roles.Unknown).map(([r,c])=>`<div class="role-row"><span>${r}</span><strong>${c}</strong></div>`).join(""); const warnings=getWarnings(); $("warnings").innerHTML=warnings.map(w=>`<div class="warn">⚠️ ${w}</div>`).join("") || `<div class="role-row"><span>✅ Team structure looks mission ready</span><strong>READY</strong></div>`; $("metaScore").textContent=`${metaScore()}%`; }
function metaScore(){ const rec=RECOMMENDED[currentMap()]?.comp || []; if(!rec.length) return 0; const picks=selectedAgents().map(normalize); const exact=rec.filter(a=>picks.includes(normalize(a))).length; const roles=roleCounts(); const roleCoverage=["Controller","Initiator","Sentinel"].reduce((s,r)=>s+(roles[r]>0?1:0),0); const sentinelBonus=roles.Sentinel>=2 ? 15 : 0; return Math.min(100, Math.round((exact/5)*65 + (roleCoverage/3)*20 + sentinelBonus)); }
function lockComp(){ const warnings=getWarnings(); if(state.selectedPlayers.length!==5) return toast("Pick 5 players first"); if(selectedAgents().length!==5) return toast("Every starter needs an agent"); if(warnings.length) return toast("Fix comp warnings before locking"); state.locked=true; const history=saved("tto-history") || []; history.unshift({ id:Date.now(), opponent:$("opponent").value || "Unknown Opponent", date:$("matchDate").value, time:$("matchTime").value, eventType:$("eventType").value, map:currentMap(), players:state.selectedPlayers, lineup:state.lineup, score:metaScore() }); save("tto-history", history.slice(0,50)); renderAll(); toast("Comp locked and saved to history"); }
function renderHistory(){ const history=saved("tto-history") || []; $("historyList").innerHTML=history.length ? history.map(h=>`<div class="history-card"><div class="history-top"><strong>${h.eventType} vs ${h.opponent}</strong><span>${h.map} • ${h.date} ${h.time} • Meta ${h.score}%</span></div><div class="history-comp">${h.players.map(p=>`<div><strong>${p}</strong><br><span>${h.lineup[p] || "Open"}</span></div>`).join("")}</div></div>`).join("") : `<p class="hint">No locked comps yet. Lock your first comp to save it here.</p>`; }
function renderWeeklyPlanner(){ const root=$("weeklyPlanner"); root.innerHTML=DAYS.map(day=>{ const d=state.weekly[day] || { enabled:false, players:[...TEAM.slice(0,5)], lineup:{}, locked:false }; return `<div class="day-card"><div class="day-top"><h3>${day}</h3><label><input type="checkbox" data-day-enable="${day}" ${d.enabled?"checked":""}> Active</label></div><div class="day-meta"><div class="day-players">${Array.from({length:5}).map((_,i)=>`<div class="day-slot"><select data-day-player="${day}" data-slot="${i}">${TEAM.map(player=>`<option value="${player}" ${d.players[i]===player?"selected":""}>${player}</option>`).join("")}</select></div>`).join("")}</div><div class="day-agents">${(d.players || []).slice(0,5).map((player,i)=>`<div class="day-agent"><strong>${player}</strong><select data-day-agent="${day}" data-player="${player}"><option value="">Open</option>${agents.map(a=>`<option value="${a.displayName}" ${d.lineup[player]===a.displayName?"selected":""}>${a.displayName}</option>`).join("")}</select></div>`).join("")}</div><div class="quick-actions"><button class="secondary" data-day-lock="${day}">${d.locked?"Locked In":"Lock Day"}</button><button class="ghost" data-day-copy="${day}">Copy Day</button></div></div></div>`; }).join(""); bindWeeklyEvents(); }
function bindWeeklyEvents(){ document.querySelectorAll("[data-day-enable]").forEach(el=>el.onchange=()=>{ const day=el.dataset.dayEnable; state.weekly[day].enabled=el.checked; persist(); }); document.querySelectorAll("[data-day-player]").forEach(el=>el.onchange=()=>{ const day=el.dataset.dayPlayer; const slot=Number(el.dataset.slot); const nextPlayers=[...state.weekly[day].players]; nextPlayers[slot]=el.value; state.weekly[day].players=nextPlayers.slice(0,5); const nextLineup={}; state.weekly[day].players.forEach(p=>{ if(state.weekly[day].lineup[p]) nextLineup[p]=state.weekly[day].lineup[p]; }); state.weekly[day].lineup=nextLineup; renderWeeklyPlanner(); persist(); }); document.querySelectorAll("[data-day-agent]").forEach(el=>el.onchange=()=>{ const day=el.dataset.dayAgent; const player=el.dataset.player; state.weekly[day].lineup[player]=el.value; persist(); }); document.querySelectorAll("[data-day-lock]").forEach(el=>el.onclick=()=>lockWeeklyDay(el.dataset.dayLock)); document.querySelectorAll("[data-day-copy]").forEach(el=>el.onclick=()=>copyWeeklyDay(el.dataset.dayCopy)); }
function lockWeeklyDay(day){ const d=state.weekly[day]; if(!d.enabled) return toast(`${day} is not active`); if((d.players || []).length!==5) return toast(`Select 5 players for ${day}`); const filled=d.players.every(p=>d.lineup[p]); if(!filled) return toast(`Assign all agents for ${day}`); d.locked=true; persist(); toast(`${day} locked in`); renderWeeklyPlanner(); }
async function copyWeeklyDay(day){ const d=state.weekly[day]; const text=`TEAM TAKE OFF WEEKLY LOCK-IN\nDay: ${day}\nMap Focus: ${currentMap()}\n\n${d.players.map(p=>`${p}: ${d.lineup[p] || "Open"}`).join("\n")}`; try{ await navigator.clipboard.writeText(text); toast(`${day} copied`); }catch{ window.prompt("Copy this:", text); } }
async function copySummary(){ const map=currentMap(); const notes=MAP_NOTES[map] || []; const text=`TEAM TAKE OFF - DISCORD OP ORDER\n${$("eventType").value} vs ${$("opponent").value || "TBD"}\nMap: ${map}\nDate: ${$("matchDate").value || "TBD"} ${$("matchTime").value || ""}\n\n${state.selectedPlayers.map(p=>`${p}: ${state.lineup[p] || "Open"}`).join("\n")}\n\nBench: ${currentBench().join(", ") || "None"}\n\nTactical Notes:\n${notes.map((n,i)=>`${i+1}. ${n}`).join("\n")}`; try{ if(navigator.clipboard && window.isSecureContext){ await navigator.clipboard.writeText(text); toast("Discord summary copied"); } else { const ta=document.createElement("textarea"); ta.value=text; ta.style.position="fixed"; ta.style.left="-9999px"; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta); toast("Discord summary copied"); } }catch{ window.prompt("Copy this:", text); } }
init();
