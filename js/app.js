(function () {
  var STORAGE_KEY = 'fde_academy_v30_state';
  var defaultState = {
    operator: 'Gavish Gothria',
    role: 'Senior Spark / Iceberg Data Engineer',
    track: 'Palantir / Ontology & Operational Apps FDE',
    roadmapSteps: {},
    exercises: {},
    scenarios: {},
    workbenches: {},
    questions: {},
    resources: {}
  };

  var state = defaultState;
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      var parsed = JSON.parse(raw);
      state = {
        operator: parsed.operator || defaultState.operator,
        role: parsed.role || defaultState.role,
        track: parsed.track || defaultState.track,
        roadmapSteps: parsed.roadmapSteps || {},
        exercises: parsed.exercises || {},
        scenarios: parsed.scenarios || {},
        workbenches: parsed.workbenches || {},
        questions: parsed.questions || {},
        resources: parsed.resources || {}
      };
    }
  } catch (e) {
    state = defaultState;
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
    updateKPIs();
    renderNextStepBanner();
  }

  window.switchTab = function (tabId, btnEl) {
    var panes = document.querySelectorAll('.tab-pane');
    for (var i = 0; i < panes.length; i++) {
      panes[i].classList.add('hidden');
    }
    var targetPane = document.getElementById('tab-' + tabId);
    if (targetPane) {
      targetPane.classList.remove('hidden');
    }
    var btns = document.querySelectorAll('.tab-btn');
    for (var j = 0; j < btns.length; j++) {
      btns[j].classList.remove('active');
      if (btns[j].getAttribute('data-tab') === tabId) {
        btns[j].classList.add('active');
      }
    }
    if (btnEl) {
      btnEl.classList.add('active');
    }
  };

  window.jumpToTarget = function (tabId, elementId, filterCat) {
    window.switchTab(tabId, null);
    if (tabId === 'interview' && filterCat) {
      var sel = document.getElementById('qCat');
      if (sel) {
        sel.value = filterCat;
        window.renderQuestions();
      }
    }
    if (elementId) {
      setTimeout(function () {
        var el = document.getElementById(elementId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('highlight-pulse');
          setTimeout(function () {
            el.classList.remove('highlight-pulse');
          }, 2200);
        }
      }, 80);
    }
  };

  window.toggleRoadmapStep = function (stepId) {
    if (state.roadmapSteps[stepId]) {
      delete state.roadmapSteps[stepId];
    } else {
      state.roadmapSteps[stepId] = true;
    }
    saveState();
    renderRoadmap();
  };

  window.completeAndAdvance = function (stepId) {
    state.roadmapSteps[stepId] = true;
    saveState();
    renderRoadmap();
  };

  function getNextIncompleteStep() {
    var rm = window.FDE_ROADMAP || [];
    for (var i = 0; i < rm.length; i++) {
      var phase = rm[i];
      for (var j = 0; j < phase.steps.length; j++) {
        var st = phase.steps[j];
        if (!state.roadmapSteps[st.id]) {
          return { phase: phase, step: st, stepIndex: j + 1, totalPhaseSteps: phase.steps.length };
        }
      }
    }
    return null;
  }

  function renderNextStepBanner() {
    var banner = document.getElementById('nextStepBanner');
    if (!banner) return;
    var rm = window.FDE_ROADMAP || [];
    var totalSteps = 0;
    var doneSteps = 0;
    for (var i = 0; i < rm.length; i++) {
      for (var j = 0; j < rm[i].steps.length; j++) {
        totalSteps++;
        if (state.roadmapSteps[rm[i].steps[j].id]) doneSteps++;
      }
    }
    var pct = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0;
    var nextObj = getNextIncompleteStep();

    if (!nextObj) {
      banner.innerHTML =
        '<div style="flex:1">' +
          '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">' +
            '<span class="tag emerald">🎉 ALL 40 ROADMAP STEPS COMPLETED (100%)</span>' +
          '</div>' +
          '<div style="font-weight:800;font-size:1.02rem">Forward Deployed Engineer Readiness Achieved!</div>' +
          '<div style="font-size:0.84rem;color:var(--muted)">You have completed all 8 Phases (Video ➔ Study ➔ Lab ➔ Practice ➔ Interview Gate).</div>' +
        '</div>';
      return;
    }

    var p = nextObj.phase;
    var s = nextObj.step;
    var actionBtnHtml = '';
    if (s.url) {
      actionBtnHtml = '<a class="btn" href="' + s.url + '" target="_blank" rel="noopener noreferrer" onclick="completeAndAdvance(\'' + s.id + '\')">▶ Open Video/Resource & Mark Done</a>';
    } else {
      actionBtnHtml = '<button class="btn" onclick="jumpToTarget(\'' + (s.targetTab || 'pillars') + '\', \'' + (s.targetId || '') + '\', \'' + (s.filterCat || '') + '\')">▶ Launch ' + s.type + ' Now</button>';
    }

    banner.innerHTML =
      '<div style="flex:1;min-width:280px">' +
        '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px">' +
          '<span class="tag amber">🚀 UP NEXT FOR OPERATOR</span>' +
          '<span class="tag">' + p.phase + ' — ' + p.title + '</span>' +
          '<span class="tag emerald">Step ' + nextObj.stepIndex + ' of ' + nextObj.totalPhaseSteps + ' (' + s.type + ' • ' + s.duration + ')</span>' +
        '</div>' +
        '<div style="font-weight:800;font-size:1.02rem;margin-bottom:4px">' + s.label + '</div>' +
        '<div style="font-size:0.84rem;color:#CBD5E1;margin-bottom:10px">' + s.desc + '</div>' +
        '<div class="progress-track"><div class="progress-fill" style="width:' + pct + '%"></div></div>' +
        '<div style="font-size:0.75rem;color:var(--muted);margin-top:4px">Guided Roadmap Progress: ' + doneSteps + ' / ' + totalSteps + ' steps completed (' + pct + '%)</div>' +
      '</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">' +
        actionBtnHtml +
        '<button class="btn btn-outline" onclick="completeAndAdvance(\'' + s.id + '\')">✅ Complete & Next Step ➔</button>' +
      '</div>';
  }

  function renderRoadmap() {
  window.renderRoadmap = renderRoadmap;
    var container = document.getElementById('roadmapContainer');
    if (!container) return;
    var rm = window.FDE_ROADMAP || [];
    var html = [];
    for (var i = 0; i < rm.length; i++) {
      var p = rm[i];
      var doneCount = 0;
      var stepsHtml = [];
      for (var j = 0; j < p.steps.length; j++) {
        var s = p.steps[j];
        var isDone = !!state.roadmapSteps[s.id];
        if (isDone) doneCount++;
        var typeBadgeClass = s.type === 'VIDEO' ? 'tag amber' : (s.type === 'LAB' ? 'tag emerald' : (s.type === 'PRACTICE' ? 'tag rose' : 'tag'));
        var stepAction = '';
        if (s.url) {
          stepAction = '<a class="btn btn-sm btn-outline" href="' + s.url + '" target="_blank" rel="noopener noreferrer">🔗 Watch / Read (' + s.duration + ')</a>';
        } else {
          stepAction = '<button class="btn btn-sm btn-outline" onclick="jumpToTarget(\'' + (s.targetTab || 'pillars') + '\', \'' + (s.targetId || '') + '\', \'' + (s.filterCat || '') + '\')">▶ Go to ' + s.type + ' (' + s.duration + ')</button>';
        }
        stepsHtml.push(
          '<div class="step-row ' + (isDone ? 'done' : '') + '">' +
            '<div style="flex:1;min-width:240px">' +
              '<div style="display:flex;align-items:center;gap:8px;margin-bottom:3px">' +
                '<span class="' + typeBadgeClass + '">' + s.type + '</span>' +
                '<span style="font-weight:700;font-size:0.88rem">' + s.label + '</span>' +
              '</div>' +
              '<div style="font-size:0.8rem;color:var(--muted)">' + s.desc + '</div>' +
            '</div>' +
            '<div style="display:flex;gap:8px;align-items:center">' +
              stepAction +
              '<button class="btn btn-sm ' + (isDone ? '' : 'btn-outline') + '" onclick="toggleRoadmapStep(\'' + s.id + '\')">' +
                (isDone ? '✅ Done' : 'Mark Done') +
              '</button>' +
            '</div>' +
          '</div>'
        );
      }
      var phasePct = Math.round((doneCount / p.steps.length) * 100);
      html.push(
        '<div class="card" id="rm-card-' + p.id + '">' +
          '<div class="card-header">' +
            '<div>' +
              '<span class="tag amber">' + p.phase + '</span> ' +
              '<span class="tag emerald">' + doneCount + ' / ' + p.steps.length + ' Steps (' + phasePct + '%)</span>' +
              '<h3 style="margin-top:6px">' + p.title + '</h3>' +
            '</div>' +
          '</div>' +
          '<p style="font-size:0.86rem;color:#CBD5E1">' + p.goal + '</p>' +
          '<div class="progress-track"><div class="progress-fill" style="width:' + phasePct + '%"></div></div>' +
          '<div style="display:flex;flex-direction:column;gap:8px;margin-top:4px">' +
            stepsHtml.join('') +
          '</div>' +
        '</div>'
      );
    }
    container.innerHTML = html.join('');
  };

  window.openLogin = function () {
    var inp = document.getElementById('loginNameInput');
    if (inp) inp.value = state.operator || '';
    var modal = document.getElementById('loginModal');
    if (modal) modal.classList.add('open');
  };

  window.closeLogin = function () {
    var modal = document.getElementById('loginModal');
    if (modal) modal.classList.remove('open');
  };

  window.saveLogin = function () {
    var inp = document.getElementById('loginNameInput');
    var name = inp && inp.value.trim() ? inp.value.trim() : 'Operator DE';
    state.operator = name;
    var roleEl = document.getElementById('loginRoleInput');
    var trackEl = document.getElementById('loginTrackInput');
    if (roleEl) state.role = roleEl.value;
    if (trackEl) state.track = trackEl.value;
    saveState();
    window.closeLogin();
  };

  function updateKPIs() {
    var exCount = Object.keys(state.exercises || {}).length;
    var scKeys = Object.keys(state.scenarios || {});
    var scCount = 0;
    for (var i = 0; i < scKeys.length; i++) {
      if (state.scenarios[scKeys[i]] >= 3) scCount++;
    }
    var qCount = Object.keys(state.questions || {}).length;
    var rmCount = Object.keys(state.roadmapSteps || {}).length;
    var wbCount = Object.keys(state.workbenches || {}).length;
    var xp = exCount * 100 + scCount * 250 + qCount * 25 + rmCount * 75 + wbCount * 100;

    var elOp = document.getElementById('opNameDisplay');
    var elXp = document.getElementById('opScoreDisplay');
    var kOp = document.getElementById('kpiOperator');
    var kTr = document.getElementById('kpiTrack');
    var kEx = document.getElementById('kpiExercises');
    var kSc = document.getElementById('kpiScenarios');
    var kQs = document.getElementById('kpiQuestions');

    if (elOp) elOp.textContent = '👤 ' + state.operator;
    if (elXp) elXp.textContent = xp + ' XP';
    if (kOp) kOp.textContent = state.operator;
    if (kTr) kTr.textContent = state.track;
    if (kEx) kEx.textContent = exCount + ' / 16';
    if (kSc) kSc.textContent = scCount + ' / 5';
    if (kQs) kQs.textContent = qCount + ' / 150';
  }

  window.checkMCQ = function (exId, chosenIdx, ansIdx, pillarIdx) {
    var p = (window.FDE_PILLARS || [])[pillarIdx];
    var fb = document.getElementById('fb-' + exId);
    if (!fb || !p) return;
    if (chosenIdx === ansIdx) {
      state.exercises[exId] = true;
      var rmStepId = 'RM' + (pillarIdx + 1) + '_S2';
      state.roadmapSteps[rmStepId] = true;
      saveState();
      renderRoadmap();
      fb.innerHTML = '<div style="color:var(--emerald);margin-top:6px">✅ <strong>Verified (+100 XP):</strong> ' + (p.ex1.explain || 'Correct FDE architecture.') + '</div>';
    } else {
      fb.innerHTML = '<div style="color:var(--rose);margin-top:6px">❌ <strong>Not quite:</strong> Hint — ' + (p.ex1.hint || 'Review the FDE Blueprint above.') + '</div>';
    }
  };

  window.checkCodeEx = function (exId, expected, pillarIdx) {
    var p = (window.FDE_PILLARS || [])[pillarIdx];
    var inp = document.getElementById('in-' + exId);
    var fb = document.getElementById('fb-' + exId);
    if (!fb || !inp) return;
    var val = (inp.value || '').trim();
    if (val.toLowerCase() === expected.toLowerCase()) {
      state.exercises[exId] = true;
      var rmStepId = 'RM' + (pillarIdx + 1) + '_S4';
      state.roadmapSteps[rmStepId] = true;
      saveState();
      renderRoadmap();
      fb.innerHTML = '<div style="color:var(--emerald);margin-top:6px">✅ <strong>Exact Token Verified (' + expected + ')! +100 XP:</strong> ' + (p && p.ex2.explain ? p.ex2.explain : '') + '</div>';
    } else {
      fb.innerHTML = '<div style="color:var(--rose);margin-top:6px">❌ <strong>Mismatch:</strong> Hint — ' + (p && p.ex2.hint ? p.ex2.hint : '') + ' (Expected: <code>' + expected + '</code>)</div>';
    }
  };

  window.fillCodeSolution = function (exId, expected, pillarIdx) {
    var inp = document.getElementById('in-' + exId);
    if (inp) {
      inp.value = expected;
      window.checkCodeEx(exId, expected, pillarIdx);
    }
  };

  window.checkStage = function (scId, scIdx, stageIdx, chosenIdx, ansIdx) {
    var w = (window.FDE_SCENARIOS || [])[scIdx];
    var st = w && w.stages ? w.stages[stageIdx] : null;
    var fb = document.getElementById('wfb-' + scId + '-' + stageIdx);
    if (!fb || !st) return;
    if (chosenIdx === ansIdx) {
      var cur = state.scenarios[scId] || 0;
      if (stageIdx + 1 > cur) state.scenarios[scId] = stageIdx + 1;
      saveState();
      fb.innerHTML = '<div style="color:var(--emerald);margin-top:6px">✅ <strong>Stage ' + (stageIdx + 1) + ' SLA Protected:</strong> ' + (st.debrief || '') + '</div>';
    } else {
      fb.innerHTML = '<div style="color:var(--rose);margin-top:6px">❌ <strong>SLA Breach Warning:</strong> That choice causes production downtime or data leakage. Re-evaluate the operational constraint!</div>';
    }
  };

  window.loadWorkbenchPreset = function (wbId, idx, mode) {
    var wb = (window.FDE_WORKBENCHES || [])[idx];
    var ta = document.getElementById('wb-ta-' + wbId);
    if (!wb || !ta) return;
    ta.value = mode === 'fail' ? (wb.failSample || wb.sample) : wb.sample;
    window.runWorkbench(wbId, idx, mode);
  };

  window.runWorkbench = function (wbId, idx, forcedMode) {
    var wb = (window.FDE_WORKBENCHES || [])[idx];
    var ta = document.getElementById('wb-ta-' + wbId);
    var out = document.getElementById('wb-out-' + wbId);
    if (!wb || !out) return;
    var txt = ta ? ta.value : '';
    var isFail = forcedMode === 'fail' || txt.indexOf('LEVEL_1') !== -1 || txt.indexOf('WAIT_FOR_ENTERPRISE') !== -1 || txt.indexOf('DIRECT_OVERWRITE') !== -1 || txt.indexOf('OLAP_BATCH_ONLY') !== -1 || txt.indexOf('\"executor_heap_gb\":16') !== -1 || txt.indexOf('FORK_GIT_REPO') !== -1 || txt.indexOf('POST_FILTER') !== -1 || txt.indexOf('Unbounded_ReAct') !== -1;

    if (isFail) {
      out.innerHTML = '<div class="failure-box" style="margin-top:8px">' + (wb.failExpect || 'Validation failed.') + '</div>';
    } else {
      state.workbenches[wbId] = true;
      var rmStepId = 'RM' + (idx + 1) + '_S3';
      state.roadmapSteps[rmStepId] = true;
      saveState();
      renderRoadmap();
      out.innerHTML = '<div style="background:rgba(16,185,129,0.1);border-left:3px solid var(--emerald);padding:10px 12px;border-radius:6px;color:var(--emerald);font-family:monospace;font-size:0.82rem;margin-top:8px">' + wb.expect + '</div>';
    }
  };

  window.toggleQuestion = function (qid) {
    var el = document.getElementById('qcard-' + qid);
    if (el) el.classList.toggle('open');
    state.questions[qid] = true;
    saveState();
  };

  window.expandAllQuestions = function (openState) {
    var cards = document.querySelectorAll('.q-item');
    for (var i = 0; i < cards.length; i++) {
      if (openState) cards[i].classList.add('open');
      else cards[i].classList.remove('open');
    }
  };

  window.renderQuestions = function () {
    var qEl = document.getElementById('qSearch');
    var catEl = document.getElementById('qCat');
    var container = document.getElementById('questionsContainer');
    if (!container) return;
    var q = qEl ? (qEl.value || '').toLowerCase() : '';
    var cat = (catEl && catEl.value) ? catEl.value : 'ALL';
    var allQs = window.FDE_QUESTIONS || [];
    var filtered = [];
    for (var i = 0; i < allQs.length; i++) {
      var item = allQs[i];
      var matchCat = (cat === 'ALL' || item.cat === cat);
      var matchQ = (!q || item.q.toLowerCase().indexOf(q) !== -1 || item.a.toLowerCase().indexOf(q) !== -1 || item.cat.toLowerCase().indexOf(q) !== -1);
      if (matchCat && matchQ) filtered.push(item);
    }
    var countBadge = document.getElementById('qCountBadge');
    if (countBadge) countBadge.textContent = 'Showing ' + filtered.length + ' of ' + allQs.length + ' Questions';

    var html = [];
    for (var j = 0; j < filtered.length; j++) {
      var it = filtered[j];
      var isDone = !!state.questions[it.id];
      html.push(
        '<div class="q-item ' + (isDone ? 'open' : '') + '" id="qcard-' + it.id + '" onclick="toggleQuestion(' + it.id + ')">' +
          '<div style="display:flex;justify-content:space-between;gap:8px;align-items:center;flex-wrap:wrap">' +
            '<span class="tag">' + it.cat + '</span>' +
            '<span class="tag ' + (isDone ? 'emerald' : 'amber') + '">' + (isDone ? '✅ Mastered (+25 XP)' : 'Click to Reveal Blueprint') + '</span>' +
          '</div>' +
          '<div style="font-weight:700;margin-top:6px;font-size:0.93rem">' + it.q + '</div>' +
          '<div class="q-ans">' + it.a + '</div>' +
        '</div>'
      );
    }
    container.innerHTML = html.join('');
  };

  window.toggleResourceDone = function (idx) {
    if (state.resources[idx]) delete state.resources[idx];
    else state.resources[idx] = true;
    saveState();
    renderResources();
  };

  function renderResources() {
    var container = document.getElementById('resourcesContainer');
    if (!container) return;
    var list = window.FDE_RESOURCES || [];
    var html = [];
    for (var i = 0; i < list.length; i++) {
      var r = list[i];
      var isDone = !!state.resources[i];
      html.push(
        '<div class="card">' +
          '<div class="card-header">' +
            '<span class="tag">' + r.cat + '</span>' +
            '<button class="btn btn-sm ' + (isDone ? '' : 'btn-outline') + '" onclick="toggleResourceDone(' + i + ')">' + (isDone ? '✅ Watched' : 'Mark Watched') + '</button>' +
          '</div>' +
          '<h4 style="font-size:0.95rem">' + r.title + '</h4>' +
          '<a class="btn btn-outline" href="' + r.url + '" target="_blank" rel="noopener noreferrer" style="margin-top:auto" onclick="toggleResourceDone(' + i + ')">🔗 Open Verified Resource</a>' +
        '</div>'
      );
    }
    container.innerHTML = html.join('');
  }

  function renderPillars() {
    var container = document.getElementById('pillarsContainer');
    if (!container) return;
    var list = window.FDE_PILLARS || [];
    var html = [];
    for (var i = 0; i < list.length; i++) {
      var p = list[i];
      var optsHtml = [];
      for (var k = 0; k < p.ex1.opts.length; k++) {
        optsHtml.push(
          '<button class="btn btn-outline" style="text-align:left;justify-content:flex-start" onclick="checkMCQ(\'' + p.ex1.id + '\',' + k + ',' + p.ex1.ans + ',' + i + ')">' +
            (k + 1) + '. ' + p.ex1.opts[k] +
          '</button>'
        );
      }
      html.push(
        '<div class="card" id="card-' + p.id + '">' +
          '<div class="card-header">' +
            '<span class="tag amber">' + (p.phase || p.id) + '</span>' +
            '<span class="tag emerald">DE ➔ FDE Architecture Shift</span>' +
          '</div>' +
          '<h3>' + p.title + '</h3>' +
          '<div style="font-size:0.8rem;color:var(--muted)"><strong>DE Baseline:</strong> ' + p.de + ' <br><strong>FDE Target:</strong> <span style="color:var(--cyan)">' + p.fde + '</span></div>' +
          '<p style="font-size:0.88rem;color:#CBD5E1">' + p.theory + '</p>' +
          (p.blueprint ? '<div class="blueprint-box"><strong>📐 FDE Production Blueprint:</strong>\n' + p.blueprint + '</div>' : '') +
          (p.codeSnippet ? '<pre>' + p.codeSnippet + '</pre>' : '') +
          (p.failureMode ? '<div class="failure-box">⚠️ ' + p.failureMode + '</div>' : '') +
          '<div style="background:var(--card);padding:12px;border-radius:8px;margin-top:4px">' +
            '<div style="font-size:0.82rem;font-weight:700;color:var(--amber)">Exercise A: Field Architecture Decision (' + p.ex1.id + ')</div>' +
            '<p style="font-size:0.85rem;margin:6px 0">' + p.ex1.q + '</p>' +
            '<div style="display:flex;flex-direction:column;gap:6px">' + optsHtml.join('') + '</div>' +
            '<div id="fb-' + p.ex1.id + '" style="font-size:0.82rem"></div>' +
          '</div>' +
          '<div style="background:var(--card);padding:12px;border-radius:8px">' +
            '<div style="font-size:0.82rem;font-weight:700;color:var(--cyan)">Exercise B: Production Code & Query Verification (' + p.ex2.id + ')</div>' +
            '<pre style="margin:6px 0">' + p.ex2.code + '</pre>' +
            '<p style="font-size:0.84rem;margin-bottom:6px">' + p.ex2.q + '</p>' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
              '<input id="in-' + p.ex2.id + '" placeholder="Type exact token..." style="flex:1;min-width:180px">' +
              '<button class="btn" onclick="checkCodeEx(\'' + p.ex2.id + '\',\'' + p.ex2.ans + '\',' + i + ')">Verify</button>' +
              '<button class="btn btn-outline" onclick="fillCodeSolution(\'' + p.ex2.id + '\',\'' + p.ex2.ans + '\',' + i + ')">Show Solution</button>' +
            '</div>' +
            '<div id="fb-' + p.ex2.id + '" style="font-size:0.82rem"></div>' +
          '</div>' +
        '</div>'
      );
    }
    container.innerHTML = html.join('');
  }

  function renderWarRooms() {
    var container = document.getElementById('warroomContainer');
    if (!container) return;
    var list = window.FDE_SCENARIOS || [];
    var html = [];
    for (var i = 0; i < list.length; i++) {
      var w = list[i];
      var stagesHtml = [];
      for (var sIdx = 0; sIdx < w.stages.length; sIdx++) {
        var s = w.stages[sIdx];
        var btns = [];
        for (var oIdx = 0; oIdx < s.opts.length; oIdx++) {
          btns.push(
            '<button class="btn btn-outline" style="text-align:left;justify-content:flex-start" onclick="checkStage(\'' + w.id + '\',' + i + ',' + sIdx + ',' + oIdx + ',' + s.ans + ')">' +
              (oIdx + 1) + '. ' + s.opts[oIdx] +
            '</button>'
          );
        }
        stagesHtml.push(
          '<div style="background:var(--card);padding:12px;border-radius:8px;margin-top:6px">' +
            '<p style="font-size:0.86rem;font-weight:600;margin-bottom:8px">' + s.q + '</p>' +
            '<div style="display:flex;flex-direction:column;gap:6px">' + btns.join('') + '</div>' +
            '<div id="wfb-' + w.id + '-' + sIdx + '" style="font-size:0.82rem"></div>' +
          '</div>'
        );
      }
      html.push(
        '<div class="card" id="card-' + w.id + '">' +
          '<div class="card-header">' +
            '<span class="tag rose">' + w.client + '</span>' +
            '<span class="tag amber">SLA: ' + w.sla + '</span>' +
          '</div>' +
          '<h3>' + w.title + '</h3>' +
          stagesHtml.join('') +
        '</div>'
      );
    }
    container.innerHTML = html.join('');
  }

  function renderWorkbenches() {
    var container = document.getElementById('workbenchesContainer');
    if (!container) return;
    var list = window.FDE_WORKBENCHES || [];
    var html = [];
    for (var i = 0; i < list.length; i++) {
      var wb = list[i];
      html.push(
        '<div class="card" id="card-' + wb.id + '">' +
          '<div class="card-header">' +
            '<span class="tag emerald">' + (wb.phase || 'Interactive Lab') + '</span>' +
            '<div style="display:flex;gap:6px">' +
              '<button class="btn btn-sm btn-outline" onclick="loadWorkbenchPreset(\'' + wb.id + '\',' + i + ',\'pass\')">Load Production Fix</button>' +
              '<button class="btn btn-sm btn-outline" onclick="loadWorkbenchPreset(\'' + wb.id + '\',' + i + ',\'fail\')">Simulate Failure Case</button>' +
            '</div>' +
          '</div>' +
          '<h3>' + wb.title + '</h3>' +
          '<p style="font-size:0.85rem;color:var(--muted)">' + wb.desc + '</p>' +
          '<textarea id="wb-ta-' + wb.id + '" rows="4" style="font-family:monospace;font-size:0.8rem">' + wb.sample + '</textarea>' +
          '<button class="btn" onclick="runWorkbench(\'' + wb.id + '\',' + i + ')">▶ Execute FDE Verification Pipeline</button>' +
          '<div id="wb-out-' + wb.id + '"></div>' +
        '</div>'
      );
    }
    container.innerHTML = html.join('');
  }

  window.initFDEAcademy = function () {
    renderRoadmap();
    renderPillars();
    renderWarRooms();
    renderWorkbenches();

    var sel = document.getElementById('qCat');
    if (sel && sel.options.length <= 1) {
      var seen = {};
      var qs = window.FDE_QUESTIONS || [];
      for (var i = 0; i < qs.length; i++) {
        var c = qs[i].cat;
        if (!seen[c]) {
          seen[c] = true;
          var o = document.createElement('option');
          o.value = c;
          o.textContent = c;
          sel.appendChild(o);
        }
      }
    }
    window.renderQuestions();
    renderResources();
    updateKPIs();
    renderNextStepBanner();

    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(function () {});
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initFDEAcademy);
  } else {
    window.initFDEAcademy();
  }
})();
