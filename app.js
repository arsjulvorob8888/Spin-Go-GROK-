const SPOTS = {
  btn: {
    id:"btn", hero:"BTN", title:"BTN open", detail:"BTN vs SB/BB · 15bb",
    actions:["fold","raise","allin"],
    labels:{fold:"Fold", raise:"Raise 2", allin:"All-in 15"},
    keys:{fold:"F", raise:"R", allin:"A"},
    range: RANGE_BTN
  },
  sb_fold: {
    id:"sb_fold", hero:"SB", title:"SB vs BTN Fold", detail:"BTN сфолдил · SB vs BB",
    actions:["fold","call","raise","allin"],
    labels:{fold:"Fold", call:"Call", raise:"Raise 2.5", allin:"All-in 15"},
    keys:{fold:"F", call:"C", raise:"R", allin:"A"},
    range: RANGE_SB_FOLD
  },
  sb_raise: {
    id:"sb_raise", hero:"SB", title:"SB vs BTN Raise 2", detail:"BTN открыл Raise 2",
    actions:["fold","call","raise","allin"],
    labels:{fold:"Fold", call:"Call", raise:"Raise 4", allin:"All-in 15"},
    keys:{fold:"F", call:"C", raise:"R", allin:"A"},
    range: RANGE_SB_RAISE
  },
  sb_push: {
    id:"sb_push", hero:"SB", title:"SB vs BTN All-in", detail:"BTN запушил All-in 15",
    actions:["fold","call"],
    labels:{fold:"Fold", call:"Call"},
    keys:{fold:"F", call:"C"},
    range: RANGE_SB_PUSH
  },
  sb_limp: {
    id:"sb_limp", hero:"SB", title:"SB vs BTN Limp", detail:"BTN заколлировал / лимп",
    actions:["fold","call","raise","allin"],
    labels:{fold:"Fold", call:"Call", raise:"Raise 4", allin:"All-in 15"},
    keys:{fold:"F", call:"C", raise:"R", allin:"A"},
    range: RANGE_SB_LIMP
  }
};

let spotId = "btn";
function spot(){ return SPOTS[spotId]; }
function mix(h){
  const m = spot().range[h];
  if(m) return Object.assign(z(), m);
  return Object.assign(z(), {fold:100});
}
function primary(m){
  return ORDER.reduce((b,a)=> (m[a]||0) > (m[b]||0) ? a : b, "fold");
}
function segs(m){ return ORDER.map(a=>({a,p:m[a]||0})).filter(s=>s.p>0); }
function isMix(m){ return Math.max(m.fold||0,m.call||0,m.raise||0,m.allin||0) < 95; }
function grade(h, choice){
  const m = mix(h), f = m[choice]||0;
  if(f<=0) return "wrong";
  if(choice===primary(m)) return "correct";
  if(f>=20) return "mix";
  return "wrong";
}

const KEY = "spin-drill-stats-v2";
function emptySpotStats(){ return {overall:{total:0,correct:0},hands:{}}; }
function loadStats(){
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    if(raw && raw.spots) return raw;
  } catch {}
  try {
    const old = JSON.parse(localStorage.getItem("spin-drill-stats-v1"));
    if(old) return {spots:{btn: old}};
  } catch {}
  return {spots:{}};
}
function saveStats(s){ localStorage.setItem(KEY, JSON.stringify(s)); }
let stats = loadStats();
function ss(){
  if(!stats.spots[spotId]) stats.spots[spotId] = emptySpotStats();
  return stats.spots[spotId];
}
function record(hand, ok){
  const s = ss();
  s.overall.total++;
  if(ok) s.overall.correct++;
  if(!s.hands[hand]) s.hands[hand]={total:0,correct:0};
  s.hands[hand].total++;
  if(ok) s.hands[hand].correct++;
  saveStats(stats);
}

function legend(){
  return `<div class="legend">${spot().actions.map(a=>`<span><i class="swatch" style="background:${COLOR[a]}"></i>${spot().labels[a]}</span>`).join("")}</div>`;
}
function gridHtml(mode, selected){
  const s = ss();
  let html = '<div class="grid-wrap"><div class="grid">';
  for(let i=0;i<13;i++) for(let j=0;j<13;j++){
    const h = handAt(i,j), m = mix(h);
    const bars = segs(m).map(x=>`<i style="width:${x.p}%;background:${COLOR[x.a]}"></i>`).join("");
    const rec = s.hands[h];
    const acc = rec && rec.total ? Math.round(rec.correct/rec.total*100) : null;
    html += `<button class="cell${selected===h?" active":""}" data-hand="${h}">
      <div class="bars">${bars}</div>
      <label>${h}${mode==="stats"&&acc!=null?`<span class="acc">${acc}%</span>`:""}</label>
    </button>`;
  }
  return html + "</div></div>";
}
function mixBars(h){
  return segs(mix(h)).map(s=>`<div class="mix-row"><div class="top"><span>${spot().labels[s.a]}</span><span>${s.p}%</span></div>
    <div class="track"><i style="width:${s.p}%;background:${COLOR[s.a]}"></i></div></div>`).join("");
}
function inspector(h){
  if(!h) return "<p class='muted'>Нажмите на руку в матрице.</p>";
  const m = mix(h), rec = ss().hands[h];
  const acc = rec && rec.total ? Math.round(rec.correct/rec.total*100) : null;
  return `<p style="font-family:IBM Plex Mono,monospace;font-size:18px;font-weight:600;margin:0">${h}</p>
    <p class="muted">${isMix(m)?"Микс":"Чисто"} · ${spot().labels[primary(m)]}</p>
    ${mixBars(h)}
    <div style="border-top:1px solid var(--border);margin-top:16px;padding-top:12px">
      <p class="muted" style="margin:0">Статистика спота</p>
      <p>${rec&&rec.total?`${rec.correct}/${rec.total} · ${acc}%`:"Ещё не тренировали"}</p>
    </div>`;
}
function spotPills(){
  const pos = spotId==="btn" ? "btn" : "sb";
  let html = `<div class="pills">
    <button data-pos="btn" class="${pos==="btn"?"on":""}">BTN</button>
    <button data-pos="sb" class="${pos==="sb"?"on":""}">SB</button>
  </div>`;
  if(pos==="sb"){
    html += `<div class="pills" style="margin-top:8px">
      <button data-spot="sb_fold" class="${spotId==="sb_fold"?"on":""}">vs Fold</button>
      <button data-spot="sb_raise" class="${spotId==="sb_raise"?"on":""}">vs Raise 2</button>
      <button data-spot="sb_push" class="${spotId==="sb_push"?"on":""}">vs All-in</button>
      <button data-spot="sb_limp" class="${spotId==="sb_limp"?"on":""}">vs Limp</button>
    </div>`;
  }
  return html;
}

let selected = "AA";
let liveHand = null;
let tab = "strategy";
let includeFolds = true;
let hideRange = localStorage.getItem("spin-hide-range")==="1";
let session = {total:0,correct:0,streak:0};
let current = null, cards = null, locked = false, lastGrade = null;
let quiz = null;

const SUITS = ["s","h","d","c"];
const PIP = {
  s: "M12 2C12 2 4 10.2 4 14.2C4 17.4 6.5 20 10 20C10.6 20 11.2 19.9 11.7 19.6C11.3 20.6 10.4 22 8.5 22H15.5C13.6 22 12.7 20.6 12.3 19.6C12.8 19.9 13.4 20 14 20C17.5 20 20 17.4 20 14.2C20 10.2 12 2 12 2Z",
  h: "M12 21S3 13.6 3 8.6C3 5.5 5.5 3 8.4 3C10.1 3 11.5 3.9 12 5.2C12.5 3.9 13.9 3 15.6 3C18.5 3 21 5.5 21 8.6C21 13.6 12 21 12 21Z",
  d: "M12 2L19 12L12 22L5 12L12 2Z",
  c: "M12 3C9.8 3 8 4.8 8 7C8 8.4 8.7 9.6 9.8 10.3C7.6 10.6 6 12.4 6 14.7C6 17.1 8 19 10.4 19C11 19 11.5 18.9 12 18.6C11.6 19.6 10.6 21 8.8 21H15.2C13.4 21 12.4 19.6 12 18.6C12.5 18.9 13 19 13.6 19C16 19 18 17.1 18 14.7C18 12.4 16.4 10.6 14.2 10.3C15.3 9.6 16 8.4 16 7C16 4.8 14.2 3 12 3Z"
};
const SUIT_GLYPH = {s:"♠",h:"♥",d:"♦",c:"♣"};
function pick(xs){ return xs[Math.floor(Math.random()*xs.length)]; }
function dealCombo(hand){
  const r1=hand[0], r2=hand[1];
  if(hand.length===2){ const s1=pick(SUITS), s2=pick(SUITS.filter(s=>s!==s1)); return [{rank:r1,suit:s1},{rank:r2,suit:s2}]; }
  if(hand.endsWith("s")){ const s=pick(SUITS); return [{rank:r1,suit:s},{rank:r2,suit:s}]; }
  const s1=pick(SUITS), s2=pick(SUITS.filter(s=>s!==s1)); return [{rank:r1,suit:s1},{rank:r2,suit:s2}];
}
function playable(){ return ALL.filter(h => (mix(h).raise||0)+(mix(h).allin||0)+(mix(h).call||0) > 0); }
function pickHand(){
  const p = playable();
  const pool = (!includeFolds || Math.random()<0.62) ? (p.length?p:ALL) : ALL;
  const s = ss();
  const weights = pool.map(h=>{
    const rec=s.hands[h];
    if(!rec||!rec.total) return 1.4;
    return 1+(1-rec.correct/rec.total)*3;
  });
  let t = Math.random()*weights.reduce((a,b)=>a+b,0);
  for(let i=0;i<pool.length;i++){ t-=weights[i]; if(t<=0) return pool[i]; }
  return pool[pool.length-1];
}
function cardHtml(c, tilt){
  if(!c) return `<div class="pcard empty"></div>`;
  const red = c.suit==="h"||c.suit==="d";
  const rank = c.rank==="T"?"10":c.rank;
  const col = red?"var(--heart)":"var(--ink)";
  return `<div class="pcard" style="transform:rotate(${tilt}deg);color:${col}">
    <div class="c">${rank}<div style="font-size:16px">${SUIT_GLYPH[c.suit]}</div></div>
    <svg class="pip" viewBox="0 0 24 24"><path fill="currentColor" d="${PIP[c.suit]}"/></svg>
  </div>`;
}
function setSpot(id){
  if(!SPOTS[id] || id===spotId) return;
  spotId = id;
  session = {total:0,correct:0,streak:0};
  current = null; cards = null; locked = false; lastGrade = null; liveHand = null; quiz = null;
  const el = document.getElementById("hdr-spot");
  if(el) el.textContent = spot().title;
  if(tab==="practice") deal(); else render();
}
function deal(){
  quiz = null;
  current = pickHand();
  cards = dealCombo(current);
  liveHand = current;
  locked = false; lastGrade=null;
  render();
}
function afterHand(){
  if(quiz || !locked) return;
  if(session.total>0 && session.total%6===0){ openQuiz(); return; }
  deal();
}
function answer(a){
  if(quiz || !current || locked) return;
  if(!spot().actions.includes(a)) return;
  lastGrade = grade(current, a);
  locked = true;
  const ok = lastGrade !== "wrong";
  record(current, ok);
  session.total++;
  if(ok){ session.correct++; session.streak++; } else session.streak=0;
  render();
  setTimeout(()=>{ afterHand(); }, 1700);
}
function actionButtons(){
  const n = spot().actions.length;
  const cls = n===2?"n2":n===4?"n4":"n3";
  return `<div class="actions ${cls}">${spot().actions.map(a=>
    `<button class="b-${a}" data-act="${a}" ${locked?"disabled":""}>${spot().labels[a]}<kbd>${spot().keys[a]}</kbd></button>`
  ).join("")}</div>`;
}

const COMBOS = [
  {n:1, name:"Роял-флеш", en:"Royal Flush", val:0.0032, pct:"0.0032%", odds:"1 из 30 940", text:"Пять старших карт от 10 до туза одной масти. Абсолютно непобедимая комбинация.", cards:[{r:"A",s:"s"},{r:"K",s:"s"},{r:"Q",s:"s"},{r:"J",s:"s"},{r:"T",s:"s"}]},
  {n:2, name:"Стрит-флеш", en:"Straight Flush", val:0.0279, pct:"0.0279%", odds:"1 из 3 590", text:"Пять карт подряд одной масти. Выше та, где старшая карта больше. Без роял-флеша.", cards:[{r:"9",s:"h"},{r:"8",s:"h"},{r:"7",s:"h"},{r:"6",s:"h"},{r:"5",s:"h"}]},
  {n:3, name:"Каре", en:"Four of a Kind", val:0.168, pct:"0.168%", odds:"1 из 594", text:"Четыре карты одного номинала. Пятая карта — кикер, решает при равном каре.", cards:[{r:"J",s:"s"},{r:"J",s:"h"},{r:"J",s:"d"},{r:"J",s:"c"},{r:"4",s:"s",dim:true}]},
  {n:4, name:"Фулл-хаус", en:"Full House", val:2.60, pct:"2.60%", odds:"1 из 37.5", text:"Тройка плюс пара. Сначала сравнивают тройку, затем пару.", cards:[{r:"Q",s:"d"},{r:"Q",s:"s"},{r:"Q",s:"c"},{r:"8",s:"h"},{r:"8",s:"s"}]},
  {n:5, name:"Флеш", en:"Flush", val:3.03, pct:"3.03%", odds:"1 из 33", text:"Пять карт одной масти без последовательности. Сравнение по старшей карте.", cards:[{r:"K",s:"c"},{r:"T",s:"c"},{r:"8",s:"c"},{r:"6",s:"c"},{r:"3",s:"c"}]},
  {n:6, name:"Стрит", en:"Straight", val:4.62, pct:"4.62%", odds:"1 из 21.6", text:"Пять карт подряд разных мастей. Туз работает и сверху, и снизу: A-2-3-4-5.", cards:[{r:"T",s:"d"},{r:"9",s:"s"},{r:"8",s:"h"},{r:"7",s:"c"},{r:"6",s:"d"}]},
  {n:7, name:"Сет / Тройка", en:"Three of a Kind", val:4.83, pct:"4.83%", odds:"1 из 20.7", text:"Три карты одного номинала и две несвязанные карты.", cards:[{r:"7",s:"h"},{r:"7",s:"s"},{r:"7",s:"d"},{r:"K",s:"c",dim:true},{r:"2",s:"h",dim:true}]},
  {n:8, name:"Две пары", en:"Two Pair", val:23.5, pct:"23.5%", odds:"1 из 4.3", text:"Две разные пары. Решает старшая пара, затем младшая, затем кикер.", cards:[{r:"A",s:"d"},{r:"A",s:"c"},{r:"5",s:"s"},{r:"5",s:"h"},{r:"9",s:"d",dim:true}]},
  {n:9, name:"Пара", en:"One Pair", val:43.8, pct:"43.8%", odds:"1 из 2.3", text:"Две карты одного номинала. При равных парах спор решают кикеры.", cards:[{r:"T",s:"s"},{r:"T",s:"h"},{r:"K",s:"d",dim:true},{r:"7",s:"c",dim:true},{r:"3",s:"s",dim:true}]},
  {n:10, name:"Старшая карта", en:"High Card", val:17.4, pct:"17.4%", odds:"1 из 5.7", text:"Комбинации нет — играет самая старшая карта на руках.", cards:[{r:"A",s:"h"},{r:"J",s:"s",dim:true},{r:"8",s:"d",dim:true},{r:"5",s:"c",dim:true},{r:"2",s:"h",dim:true}]}
];
function closeEnough(guess, truth){
  if(Number.isNaN(guess)) return false;
  if(truth < 0.01) return guess >= 0.001 && guess <= 0.01;
  if(truth < 0.1) return Math.abs(guess-truth) <= 0.02;
  if(truth < 1) return Math.abs(guess-truth) <= 0.08;
  if(truth < 10) return Math.abs(guess-truth) <= 0.8;
  return Math.abs(guess-truth) <= 2;
}
function openQuiz(){
  quiz = {checked:false, ok:0, guesses:{}};
  render();
}
function readQuizGuesses(){
  const o = {};
  COMBOS.forEach(c=>{
    const el = document.getElementById("q-"+c.n);
    o[c.n] = el ? el.value : (quiz && quiz.guesses[c.n]) || "";
  });
  return o;
}
function gradeQuiz(){
  if(!quiz || quiz.checked) return;
  quiz.guesses = readQuizGuesses();
  quiz.ok = 0;
  COMBOS.forEach(c=>{
    const g = parseFloat(String(quiz.guesses[c.n]||"").replace(",", ".").replace("%",""));
    if(closeEnough(g, c.val)) quiz.ok++;
  });
  quiz.checked = true;
  render();
}
function quizPanel(){
  const rows = COMBOS.map(c=>{
    const guess = quiz.guesses[c.n] || "";
    const g = parseFloat(String(guess).replace(",", ".").replace("%",""));
    const cls = !quiz.checked ? "" : closeEnough(g, c.val) ? "ok" : "bad";
    const hint = quiz.checked ? `<span class="muted">${c.pct}</span>` : `<span class="muted">%</span>`;
    return `<label class="quiz-row ${cls}">
      <span class="muted">${c.n}</span>
      <span>${c.name}</span>
      <input id="q-${c.n}" inputmode="decimal" placeholder="%" value="${guess}" ${quiz.checked?"disabled":""} />
    </label><div style="text-align:right;margin:-2px 8px 4px">${hint}</div>`;
  }).join("");
  const score = quiz.checked ? `<p class="fb ${quiz.ok===10?"ok":quiz.ok>=7?"mix":"bad"}">${quiz.ok}/10 верно</p>` : "";
  return `<div>
    <p style="margin:0 0 6px"><strong>Квиз · вероятности 2+5</strong></p>
    <p class="muted" style="margin:0 0 10px">Введите % для каждой комбинации. Допуск небольшой.</p>
    <div class="quiz-list">${rows}</div>
    ${score}
    ${quiz.checked
      ? `<button class="primary" id="quiz-next">Дальше к рукам</button>`
      : `<button class="primary" id="quiz-check">Проверить</button><button class="ghost" id="quiz-skip">Пропустить</button>`}
  </div>`;
}
function miniCard(c){
  const red = c.s==="h"||c.s==="d";
  const rank = c.r==="T"?"10":c.r;
  const col = c.dim ? "#c8c8cc" : (red ? "var(--heart)" : "var(--ink)");
  return `<div class="mc${c.dim?" dim":""}" style="color:${col}"><span class="r">${rank}</span><span class="s">${SUIT_GLYPH[c.s]}</span></div>`;
}
function renderHands(){
  const rows = COMBOS.map(x=>`<article class="combo">
    <div class="n">${x.n}</div>
    <div><h3>${x.name}<small>${x.en}</small></h3></div>
    <div class="mini-cards">${x.cards.map(miniCard).join("")}</div>
    <p>${x.text}<br><strong style="color:var(--fg)">${x.pct}</strong> <span class="muted">· ${x.odds} · 2+5 карт</span></p>
  </article>`).join("");
  document.getElementById("view-hands").innerHTML = `
    <div class="panel" style="grid-column:1/-1">
      <div class="head-row">
        <div>
          <div class="muted" style="font-family:IBM Plex Mono,monospace;font-size:10px;letter-spacing:.16em;text-transform:uppercase">Texas Hold'em · 7 cards</div>
          <strong>Комбинации по старшинству</strong>
          <p class="muted" style="margin:4px 0 0">Вероятность — лучшие 5 из 7 карт (2 свои + 5 на борде). Всего 133 784 560 раздач.</p>
        </div>
      </div>
      <div class="combo-list">${rows}</div>
      <div class="combo-notes">
        <div>Как сравнивать: сначала ранг комбинации, и только при равных рангах — старшинство карт внутри неё, затем кикер.</div>
        <div>Масти равны: ♦ ♥ ♣ ♠ не имеют старшинства. Частоты — Wikipedia, 7-card poker hands.</div>
      </div>
    </div>`;
}

function renderStrategy(){
  document.getElementById("view-strategy").innerHTML = `
    <div class="panel">
      ${spotPills()}
      <div class="head-row" style="margin-top:12px"><div>
        <div class="muted" style="font-family:IBM Plex Mono,monospace;font-size:10px;letter-spacing:.16em;text-transform:uppercase">Spin & Go chart</div>
        <strong>${spot().detail}</strong></div>${legend()}</div>
      ${gridHtml("strategy", selected)}
    </div>
    <aside class="panel">
      <div class="pos"><div style="display:flex;justify-content:space-between"><strong>${spot().hero}</strong><span style="font-family:IBM Plex Mono,monospace">15</span></div>
      <p class="muted" style="margin:8px 0 0">${spot().title}</p>
      <ul>${spot().actions.map(a=>`<li><i class="swatch" style="background:${COLOR[a]}"></i>${spot().labels[a]}</li>`).join("")}</ul></div>
      ${inspector(selected)}
    </aside>`;
}
function renderPractice(){
  const pct = session.total?Math.round(session.correct/session.total*100):0;
  let fb = "Выберите действие", cls="fb";
  if(lastGrade==="correct"){ fb="Верно"; cls="fb ok"; }
  else if(lastGrade==="mix"){ fb="Микс · чаще "+spot().labels[primary(mix(current))]; cls="fb mix"; }
  else if(lastGrade==="wrong"){ fb="Ошибка · нужно "+spot().labels[primary(mix(current))]; cls="fb bad"; }
  const right = quiz ? quizPanel() : `
      <div class="head-row">
        <span style="font-family:IBM Plex Mono,monospace;font-size:13px;color:var(--muted)">Сессия ${session.correct}/${session.total} <b style="color:var(--fg)">${pct}%</b>${session.streak>1?` · ${session.streak} подряд`:""}</span>
        <label class="muted"><input type="checkbox" id="folds" ${includeFolds?"checked":""}/> Фолды</label>
      </div>
      <div class="cards">${cardHtml(cards&&cards[0],-6)}${cardHtml(cards&&cards[1],7)}</div>
      <div class="${cls}">${fb}</div>
      <p class="muted" style="text-align:center;font-family:IBM Plex Mono,monospace">${current||""}</p>
      ${actionButtons()}
      ${locked?`<div style="margin-top:14px">${mixBars(current)}<button class="ghost" id="next">Следующая рука</button></div>`:""}
      <button class="ghost" id="quiz-now">Квиз вероятностей</button>`;
  document.getElementById("view-practice").classList.toggle("blind", hideRange);
  document.getElementById("view-practice").innerHTML = `
    <div class="panel">
      ${spotPills()}
      <div class="head-row" style="margin-top:12px">
        <strong>${spot().title}</strong>
        <label class="muted"><input type="checkbox" id="hide-range" ${hideRange?"checked":""}/> Скрыть рендж</label>
      </div>
      ${hideRange
        ? `<p class="muted" style="margin:0">Таблица диапазона скрыта. Снимите галочку, чтобы открыть.</p>`
        : `${legend()}${gridHtml("strategy", liveHand)}`}
    </div>
    <div class="panel">${right}</div>`;
}
function renderStats(){
  const o = ss().overall;
  const pct = o.total? (o.correct/o.total*100).toFixed(1): "—";
  document.getElementById("view-stats").innerHTML = `
    <div class="panel">
      ${spotPills()}
      <div class="head-row" style="margin-top:12px">
        <div><strong>Точность · ${spot().title}</strong><p class="muted" style="margin:4px 0 0">Всего ${o.total} · верно ${o.correct} · ${pct}%</p></div>
        <button class="danger" id="reset">Сбросить спот</button>
      </div>
      ${gridHtml("stats", selected)}
    </div>
    <aside class="panel">${inspector(selected)}</aside>`;
}
function render(){
  const hdr = document.getElementById("hdr-spot");
  if(hdr) hdr.textContent = tab==="hands" ? "Комбинации" : (quiz ? "Квиз вероятностей" : spot().title);
  document.querySelectorAll("nav button").forEach(b=>b.classList.toggle("active", b.dataset.tab===tab));
  document.getElementById("view-strategy").hidden = tab!=="strategy";
  document.getElementById("view-practice").hidden = tab!=="practice";
  document.getElementById("view-hands").hidden = tab!=="hands";
  document.getElementById("view-stats").hidden = tab!=="stats";
  if(tab==="strategy") renderStrategy();
  if(tab==="practice") renderPractice();
  if(tab==="hands") renderHands();
  if(tab==="stats") renderStats();
}

document.addEventListener("click", e=>{
  const t = e.target.closest("[data-tab]");
  if(t){ tab=t.dataset.tab; if(tab==="practice" && !current && !quiz) deal(); else render(); return; }
  const pos = e.target.closest("[data-pos]");
  if(pos){ setSpot(pos.dataset.pos==="btn"?"btn":"sb_fold"); return; }
  const sp = e.target.closest("[data-spot]");
  if(sp){ setSpot(sp.dataset.spot); return; }
  const cell = e.target.closest(".cell");
  if(cell && !quiz){ selected=cell.dataset.hand; render(); return; }
  const act = e.target.closest("[data-act]");
  if(act){ answer(act.dataset.act); return; }
  if(e.target.id==="next"){ afterHand(); return; }
  if(e.target.id==="quiz-now"){ openQuiz(); return; }
  if(e.target.id==="quiz-check"){ gradeQuiz(); return; }
  if(e.target.id==="quiz-next" || e.target.id==="quiz-skip"){ deal(); return; }
  if(e.target.id==="reset"){
    if(confirm("Сбросить статистику этого спота?")){
      stats.spots[spotId] = emptySpotStats();
      saveStats(stats); render();
    }
  }
});
document.addEventListener("change", e=>{
  if(e.target.id==="folds") includeFolds = e.target.checked;
  if(e.target.id==="hide-range"){
    hideRange = e.target.checked;
    localStorage.setItem("spin-hide-range", hideRange?"1":"0");
    render();
  }
});
document.addEventListener("keydown", e=>{
  if(tab!=="practice" || quiz) return;
  const map = {f:"fold",F:"fold",c:"call",C:"call",r:"raise",R:"raise",a:"allin",A:"allin"};
  if(map[e.key]) answer(map[e.key]);
  if((e.key===" "||e.key==="Enter") && locked){ e.preventDefault(); afterHand(); }
});
render();
