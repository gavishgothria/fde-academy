(function(){
  const STORAGE_KEY = "fde_academy_v25_state";
  let state = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{"operator":"Gavish Gothria","role":"Senior Spark / Iceberg Data Engineer","track":"Palantir / Ontology & Operational Apps FDE","exercises":{},"scenarios":{},"questions":{}}");
  function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); updateKPIs(); }
  window.switchTab = function(tabId, btn){
    document.querySelectorAll(".tab-pane").forEach(function(el){ el.classList.add("hidden"); });
    document.getElementById("tab-" + tabId).classList.remove("hidden");
    document.querySelectorAll(".tab-btn").forEach(function(b){ b.classList.remove("active"); });
    if(btn) btn.classList.add("active");
  };
  window.openLogin = function(){
    document.getElementById("loginNameInput").value = state.operator || "";
    document.getElementById("loginModal").classList.add("open");
  };
  window.closeLogin = function(){ document.getElementById("loginModal").classList.remove("open"); };
  window.saveLogin = function(){
    const name = document.getElementById("loginNameInput").value.trim() || "Operator DE";
    state.operator = name;
    state.role = document.getElementById("loginRoleInput").value;
    state.track = document.getElementById("loginTrackInput").value;
    saveState(); closeLogin();
  };
  function updateKPIs(){
    const exCount = Object.keys(state.exercises || {}).length;
    const scCount = Object.keys(state.scenarios || {}).filter(function(k){ return state.scenarios[k] === 3; }).length;
    const qCount = Object.keys(state.questions || {}).length;
    const xp = exCount * 100 + scCount * 250 + qCount * 25;
    document.getElementById("opNameDisplay").textContent = "👤 " + state.operator;
    document.getElementById("opScoreDisplay").textContent = xp + " XP";
    document.getElementById("kpiOperator").textContent = state.operator;
    document.getElementById("kpiTrack").textContent = state.track;
    document.getElementById("kpiExercises").textContent = exCount + " / 16";
    document.getElementById("kpiScenarios").textContent = scCount + " / 5";
    document.getElementById("kpiQuestions").textContent = qCount + " / 150";
  }
  window.checkMCQ = function(exId, chosen, ans){
    const fb = document.getElementById("fb-" + exId);
    if(chosen === ans){ state.exercises[exId] = true; saveState(); fb.innerHTML = "<span style=color:var(--emerald)>✅ Verified! +100 XP — Deterministic FDE pattern mastered.</span>"; }
    else { fb.innerHTML = "<span style=color:var(--rose)>❌ Incorrect architecture choice. Re-read the FDE shift above and retry.</span>"; }
  };
  window.checkCodeEx = function(exId, expected){
    const val = (document.getElementById("in-" + exId).value || "").trim();
    const fb = document.getElementById("fb-" + exId);
    if(val.toLowerCase() === expected.toLowerCase()){ state.exercises[exId] = true; saveState(); fb.innerHTML = "<span style=color:var(--emerald)>✅ Exact match verified (" + expected + ")! +100 XP</span>"; }
    else { fb.innerHTML = "<span style=color:var(--rose)>❌ Expected exact token: <code>" + expected + "</code></span>"; }
  };
  window.checkStage = function(scId, stageIdx, chosen, ans){
    const fb = document.getElementById("wfb-" + scId + "-" + stageIdx);
    if(chosen === ans){ const cur = state.scenarios[scId] || 0; if(stageIdx + 1 > cur) state.scenarios[scId] = stageIdx + 1; saveState(); fb.innerHTML = "<span style=color:var(--emerald)>✅ Stage " + (stageIdx+1) + " Cleared! Field SLA protected.</span>"; }
    else { fb.innerHTML = "<span style=color:var(--rose)>❌ SLA Breach! That choice causes production downtime or data leakage.</span>"; }
  };
  window.runWorkbench = function(wbId, idx){
    const wb = window.FDE_WORKBENCHES[idx];
    document.getElementById("wb-out-" + wbId).innerHTML = "<div style=color:var(--emerald);font-family:monospace;margin-top:8px>▶ " + wb.expect + "</div>";
  };
  window.toggleQuestion = function(qid){
    document.getElementById("qcard-" + qid).classList.toggle("open");
    state.questions[qid] = true; saveState();
  };
  window.renderQuestions = function(){
    const q = (document.getElementById("qSearch").value || "").toLowerCase();
    const cat = document.getElementById("qCat").value;
    const list = (window.FDE_QUESTIONS || []).filter(function(item){ return (cat === "ALL" || item.cat === cat) && (!q || item.q.toLowerCase().indexOf(q) !== -1 || item.a.toLowerCase().indexOf(q) !== -1 || item.cat.toLowerCase().indexOf(q) !== -1); });
    document.getElementById("questionsContainer").innerHTML = list.map(function(item){
      const cls = state.questions[item.id] ? "q-item open" : "q-item";
      return "<div class="" + cls + "" id="qcard-" + item.id + "" onclick="toggleQuestion(" + item.id + ")"><div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><span class="tag">" + item.cat + "</span><span style="font-size:.75rem;color:var(--muted)">Click to toggle answer & mark mastered</span></div><div style="font-weight:700;margin-top:6px">" + item.q + "</div><div class="q-ans">" + item.a + "</div></div>";
    }).join("");
  };
  function init(){
    document.getElementById("pillarsContainer").innerHTML = (window.FDE_PILLARS || []).map(function(p){
      const opts = p.ex1.opts.map(function(o,idx){ return "<button class="btn btn-outline" style="text-align:left;justify-content:flex-start" onclick="checkMCQ('" + p.ex1.id + "'," + idx + "," + p.ex1.ans + ")">" + (idx+1) + ". " + o + "</button>"; }).join("");
      return "<div class="card"><div class="card-header"><span class="tag">" + p.id + "</span><span class="tag emerald">DE: " + p.de + " ➔ FDE: " + p.fde + "</span></div><h3>" + p.title + "</h3><p style="font-size:.88rem;color:#CBD5E1">" + p.theory + "</p><div style="background:var(--card);padding:12px;border-radius:8px;margin-top:4px"><div style="font-size:.82rem;font-weight:700;color:var(--amber)">Exercise A: Architecture Decision</div><p style="font-size:.85rem;margin:6px 0">" + p.ex1.q + "</p><div style="display:flex;flex-direction:column;gap:6px">" + opts + "</div><div id="fb-" + p.ex1.id + "" style="font-size:.82rem;margin-top:6px"></div></div><div style="background:var(--card);padding:12px;border-radius:8px"><div style="font-size:.82rem;font-weight:700;color:var(--cyan)">Exercise B: Production Code Verification</div><pre style="margin:6px 0">" + p.ex2.code + "</pre><p style="font-size:.84rem;margin-bottom:6px">" + p.ex2.q + "</p><div style="display:flex;gap:8px"><input id="in-" + p.ex2.id + "" placeholder="Type exact token..."><button class="btn" onclick="checkCodeEx('" + p.ex2.id + "','" + p.ex2.ans + "')">Verify</button></div><div id="fb-" + p.ex2.id + "" style="font-size:.82rem;margin-top:6px"></div></div></div>";
    }).join("");
    document.getElementById("warroomContainer").innerHTML = (window.FDE_SCENARIOS || []).map(function(w){
      const stHtml = w.stages.map(function(s,sIdx){
        const bHtml = s.opts.map(function(o,oIdx){ return "<button class="btn btn-outline" style="text-align:left;justify-content:flex-start" onclick="checkStage('" + w.id + "'," + sIdx + "," + oIdx + "," + s.ans + ")">" + o + "</button>"; }).join("");
        return "<div style="background:var(--card);padding:12px;border-radius:8px;margin-top:6px"><p style="font-size:.86rem;font-weight:600;margin-bottom:8px">" + s.q + "</p><div style="display:flex;flex-direction:column;gap:6px">" + bHtml + "</div><div id="wfb-" + w.id + "-" + sIdx + "" style="font-size:.82rem;margin-top:6px"></div></div>";
      }).join("");
      return "<div class="card"><div class="card-header"><span class="tag rose">" + w.client + "</span><span class="tag">SLA: " + w.sla + "</span></div><h3>" + w.title + "</h3>" + stHtml + "</div>";
    }).join("");
    document.getElementById("workbenchesContainer").innerHTML = (window.FDE_WORKBENCHES || []).map(function(wb,idx){
      return "<div class="card"><span class="tag emerald">Interactive Simulator</span><h3>" + wb.title + "</h3><p style="font-size:.86rem;color:var(--muted)">" + wb.desc + "</p><textarea rows="4" style="font-family:monospace;font-size:.8rem">" + wb.sample + "</textarea><button class="btn" onclick="runWorkbench('" + wb.id + "'," + idx + ")">▶ Execute FDE Verification Pipeline</button><div id="wb-out-" + wb.id + ""></div></div>";
    }).join("");
    const cats = Array.from(new Set((window.FDE_QUESTIONS || []).map(function(x){ return x.cat; })));
    const sel = document.getElementById("qCat");
    cats.forEach(function(c){ const o = document.createElement("option"); o.value = c; o.textContent = c; sel.appendChild(o); });
    window.renderQuestions();
    document.getElementById("resourcesContainer").innerHTML = (window.FDE_RESOURCES || []).map(function(r){
      return "<div class="card"><span class="tag">" + r.cat + "</span><h4 style="font-size:.95rem">" + r.title + "</h4><a class="btn btn-outline" href="" + r.url + "" target="_blank" rel="noopener noreferrer" style="margin-top:auto">🔗 Open Verified Resource</a></div>";
    }).join("");
    updateKPIs();
    if("serviceWorker" in navigator){ navigator.serviceWorker.register("./sw.js").catch(function(){}); }
  }
  document.addEventListener("DOMContentLoaded", init);
})();