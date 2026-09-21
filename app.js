const RANKS = ["A","K","Q","J","T","9","8","7","6","5","4","3","2"];
const LABEL = { fold: "Fold", raise: "Raise 2", allin: "All-in 15" };
const COLOR = { fold: "var(--fold)", raise: "var(--raise)", allin: "var(--allin)" };
const PURE_RAISE = ["AA","KK","QQ","JJ","TT","99","88","77","66","AKs","AQs","AJs","ATs","A9s","A8s","A7s","KQs","KJs","KTs","K9s","K8s","K7s","K6s","K5s","Q9s","Q8s","Q7s","J9s","J8s","T8s","98s","97s","87s","86s","AKo","A7o","A6o","A5o","K9o","KTo","QJo","QTo","JTo"];
const PURE_ALLIN = ["A6s","A5s","A4s","A3s","QTs","JTs","T9s","A9o","A8o","44","33","22"];
const MIXED = {
  A2s:{raise:36,allin:64,fold:0}, AQo:{raise:91,allin:9,fold:0}, AJo:{raise:93,allin:7,fold:0},
  ATo:{raise:23,allin:77,fold:0}, A4o:{raise:81,allin:0,fold:19}, KQo:{raise:57,allin:43,fold:0},
  KJo:{raise:53,allin:47,fold:0}, QJs:{raise:72,allin:28,fold:0}, Q9o:{raise:27,allin:0,fold:73},
  J7s:{raise:39,allin:0,fold:61}, T9o:{raise:61,allin:0,fold:39}, T7s:{raise:36,allin:0,fold:64},
  "76s":{raise:45,allin:0,fold:55}, "55":{raise:53,allin:47,fold:0}
};
const RANGE = {};
PURE_RAISE.forEach(h => RANGE[h] = {raise:100,allin:0,fold:0});
PURE_ALLIN.forEach(h => RANGE[h] = {raise:0,allin:100,fold:0});
Object.assign(RANGE, MIXED);

function handAt(r,c){ const a=RANKS[r], b=RANKS[c]; if(r===c) return a+b; return c>r ? a+b+"s" : b+a+"o"; }
function allHands(){ const h=[]; for(let i=0;i<13;i++) for(let j=0;j<13;j++) h.push(handAt(i,j)); return h; }
const ALL = allHands();
function mix(h){ return RANGE[h] || {raise:0,allin:0,fold:100}; }
function primary(m){ if(m.raise>=m.allin && m.raise>=m.fold) return "raise"; if(m.allin>=m.fold) return "allin"; return "fold"; }
function segs(m){ return ["allin","raise","fold"].map(a=>({a,p:m[a]})).filter(s=>s.p>0); }
function isMix(m){ return Math.max(m.raise,m.allin,m.fold)<95; }
function grade(h, choice){
  const m = mix(h), f = m[choice];
  if(f<=0) return "wrong";
  if(choice===primary(m)) return "correct";
  if(f>=20) return "mix";
  return "wrong";
}

const KEY = "spin-drill-stats-v1";
function loadStats(){
  try { return JSON.parse(localStorage.getItem(KEY)) || {overall:{total:0,correct:0},hands:{}}; }
  catch { return {overall:{total:0,correct:0},hands:{}}; }
}
function saveStats(s){ localStorage.setItem(KEY, JSON.stringify(s)); }
let stats = loadStats();

function record(hand, ok){
  stats.overall.total++;
  if(ok) stats.overall.correct++;
  if(!stats.hands[hand]) stats.hands[hand]={total:0,correct:0};
  stats.hands[hand].total++;
  if(ok) stats.hands[hand].correct++;
  saveStats(stats);
}

function gridHtml(mode, selected){
  let html = '<div class="grid-wrap"><div class="grid">';
  for(let i=0;i<13;i++) for(let j=0;j<13;j++){
    const h = handAt(i,j), m = mix(h);
    const bars = segs(m).map(s=>`<i style="width:${s.p}%;background:${COLOR[s.a]}"></i>`).join("");
    const rec = stats.hands[h];
    const acc = rec && rec.total ? Math.round(rec.correct/rec.total*100) : null;
    html += `<button class="cell${selected===h?" active":""}" data-hand="${h}">
      <div class="bars">${bars}</div>
      <label>${h}${mode==="stats"&&acc!=null?`<span class="acc">${acc}%</span>`:""}</label>
    </button>`;
  }
  return html + "</div></div>";
}
function legend(){
  return `<div class="legend">
    <span><i class="swatch" style="background:var(--allin)"></i>All-in 15</span>
    <span><i class="swatch" style="background:var(--raise)"></i>Raise 2</span>
    <span><i class="swatch" style="background:var(--fold)"></i>Fold</span>
  </div>`;
}
function mixBars(h){
  return segs(mix(h)).map(s=>`<div class="mix-row"><div class="top"><span>${LABEL[s.a]}</span><span>${s.p}%</span></div>
    <div class="track"><i style="width:${s.p}%;background:${COLOR[s.a]}"></i></div></div>`).join("");
}
function inspector(h){
  if(!h) return "<p class='muted'>Нажмите на руку в матрице.</p>";
  const m = mix(h), rec = stats.hands[h];
  const acc = rec && rec.total ? Math.round(rec.correct/rec.total*100) : null;
  return `<p style="font-family:IBM Plex Mono,monospace;font-size:18px;font-weight:600;margin:0">${h}</p>
    <p class="muted">${isMix(m)?"Микс":"Чисто"} · ${LABEL[primary(m)]}</p>
    ${mixBars(h)}
    <div style="border-top:1px solid var(--border);margin-top:16px;padding-top:12px">
      <p class="muted" style="margin:0">Ваша статистика</p>
      <p>${rec&&rec.total?`${rec.correct}/${rec.total} · ${acc}%`:"Ещё не тренировали"}</p>
    </div>`;
}

let selected = "AA";
let liveHand = null;
let tab = "strategy";
let includeFolds = true;
let session = {total:0,correct:0,streak:0};
let current = null, cards = null, locked = false, lastGrade = null, lastChoice = null;

const SUITS = ["s","h","d","c"];
const PIP = {
  s: "M12 2C12 2 4 10.2 4 14.2C4 17.4 6.5 20 10 20C10.6 20 11.2 19.9 11.7 19.6C11.3 20.6 10.4 22 8.5 22H15.5C13.6 22 12.7 20.6 12.3 19.6C12.8 19.9 13.4 20 14 20C17.5 20 20 17.4 20 14.2C20 10.2 12 2 12 2Z",
  h: "M12 21S3 13.6 3 8.6C3 5.5 5.5 3 8.4 3C10.1 3 11.5 3.9 12 5.2C12.5 3.9 13.9 3 15.6 3C18.5 3 21 5.5 21 8.6C21 13.6 12 21 12 21Z",
  d: "M12 2L19 12L12 22L5 12L12 2Z",
  c: "M12 3C9.8 3 8 4.8 8 7C8 8.4 8.7 9.6 9.8 10.3C7.6 10.6 6 12.4 6 14.7C6 17.1 8 19 10.4 19C11 19 11.5 18.9 12 18.6C11.6 19.6 10.6 21 8.8 21H15.2C13.4 21 12.4 19.6 12 18.6C12.5 18.9 13 19 13.6 19C16 19 18 17.1 18 14.7C18 12.4 16.4 10.6 14.2 10.3C15.3 9.6 16 8.4 16 7C16 4.8 14.2 3 12 3Z"
};
function pick(xs){ return xs[Math.floor(Math.random()*xs.length)]; }
function dealCombo(hand){
  const r1=hand[0], r2=hand[1];
  if(hand.length===2){ const s1=pick(SUITS), s2=pick(SUITS.filter(s=>s!==s1)); return [{rank:r1,suit:s1},{rank:r2,suit:s2}]; }
  if(hand.endsWith("s")){ const s=pick(SUITS); return [{rank:r1,suit:s},{rank:r2,suit:s}]; }
  const s1=pick(SUITS), s2=pick(SUITS.filter(s=>s!==s1)); return [{rank:r1,suit:s1},{rank:r2,suit:s2}];
}
function playable(){ return ALL.filter(h => mix(h).raise + mix(h).allin > 0); }
function pickHand(){
  const p = playable();
  const pool = (!includeFolds || Math.random()<0.62) ? p : ALL;
  const weights = pool.map(h=>{
    const rec=stats.hands[h];
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
    <div class="c">${rank}<div style="font-size:16px">${c.suit==="s"?"♠":c.suit==="h"?"♥":c.suit==="d"?"♦":"♣"}</div></div>
    <svg class="pip" viewBox="0 0 24 24"><path fill="currentColor" d="${PIP[c.suit]}"/></svg>
  </div>`;
}

function deal(){
  current = pickHand();
  cards = dealCombo(current);
  liveHand = current;
  locked = false; lastGrade=null; lastChoice=null;
  render();
}
function answer(a){
  if(!current || locked) return;
  lastChoice = a;
  lastGrade = grade(current, a);
  locked = true;
  const ok = lastGrade !== "wrong";
  record(current, ok);
  session.total++;
  if(ok){ session.correct++; session.streak++; } else session.streak=0;
  render();
  setTimeout(()=>{ if(locked) deal(); }, 1700);
}

function renderStrategy(){
  document.getElementById("view-strategy").innerHTML = `
    <div class="panel">
      <div class="head-row"><div><div class="muted" style="font-family:IBM Plex Mono,monospace;font-size:10px;letter-spacing:.16em;text-transform:uppercase">Spin & Go chart</div>
      <strong>BTN vs SB/BB · 15bb</strong></div>${legend()}</div>
      ${gridHtml("strategy", selected)}
    </div>
    <aside class="panel">
      <div class="pos"><div style="display:flex;justify-content:space-between"><strong>BTN</strong><span style="font-family:IBM Plex Mono,monospace">15</span></div>
      <ul><li><i class="swatch" style="background:var(--fold)"></i>Fold</li>
      <li><i class="swatch" style="background:var(--raise)"></i>Raise 2</li>
      <li><i class="swatch" style="background:var(--allin)"></i>All-in 15</li></ul></div>
      ${inspector(selected)}
    </aside>`;
}
function renderPractice(){
  const pct = session.total?Math.round(session.correct/session.total*100):0;
  let fb = "Выберите действие", cls="fb";
  if(lastGrade==="correct"){ fb="Верно"; cls="fb ok"; }
  else if(lastGrade==="mix"){ fb="Микс · чаще "+LABEL[primary(mix(current))]; cls="fb mix"; }
  else if(lastGrade==="wrong"){ fb="Ошибка · нужно "+LABEL[primary(mix(current))]; cls="fb bad"; }
  document.getElementById("view-practice").innerHTML = `
    <div class="panel">
      <div class="head-row"><strong>BTN 15 · open</strong>${legend()}</div>
      ${gridHtml("strategy", liveHand)}
    </div>
    <div class="panel">
      <div class="head-row">
        <span style="font-family:IBM Plex Mono,monospace;font-size:13px;color:var(--muted)">Сессия ${session.correct}/${session.total} <b style="color:var(--fg)">${pct}%</b>${session.streak>1?` · ${session.streak} подряд`:""}</span>
        <label class="muted"><input type="checkbox" id="folds" ${includeFolds?"checked":""}/> Включать фолды</label>
      </div>
      <div class="cards">${cardHtml(cards&&cards[0],-6)}${cardHtml(cards&&cards[1],7)}</div>
      <div class="${cls}">${fb}</div>
      <p class="muted" style="text-align:center;font-family:IBM Plex Mono,monospace">${current||""}</p>
      <div class="actions">
        <button class="b-fold" data-act="fold" ${locked?"disabled":""}>Fold<kbd>F</kbd></button>
        <button class="b-raise" data-act="raise" ${locked?"disabled":""}>Raise 2<kbd>R</kbd></button>
        <button class="b-allin" data-act="allin" ${locked?"disabled":""}>All-in 15<kbd>A</kbd></button>
      </div>
      ${locked?`<div style="margin-top:14px">${mixBars(current)}<button class="ghost" id="next">Следующая рука</button></div>`:""}
    </div>`;
}
function renderStats(){
  const o = stats.overall;
  const pct = o.total? (o.correct/o.total*100).toFixed(1): "—";
  document.getElementById("view-stats").innerHTML = `
    <div class="panel">
      <div class="head-row">
        <div><strong>Точность по рукам</strong><p class="muted" style="margin:4px 0 0">Всего ${o.total} · верно ${o.correct} · ${pct}%</p></div>
        <button class="danger" id="reset">Сбросить</button>
      </div>
      ${gridHtml("stats", selected)}
    </div>
    <aside class="panel">${inspector(selected)}</aside>`;
}

function render(){
  document.querySelectorAll("nav button").forEach(b=>b.classList.toggle("active", b.dataset.tab===tab));
  document.getElementById("view-strategy").hidden = tab!=="strategy";
  document.getElementById("view-practice").hidden = tab!=="practice";
  document.getElementById("view-stats").hidden = tab!=="stats";
  if(tab==="strategy") renderStrategy();
  if(tab==="practice") renderPractice();
  if(tab==="stats") renderStats();
}

document.addEventListener("click", e=>{
  const t = e.target.closest("[data-tab]");
  if(t){ tab=t.dataset.tab; if(tab==="practice" && !current) deal(); else render(); return; }
  const cell = e.target.closest(".cell");
  if(cell){ selected=cell.dataset.hand; render(); return; }
  const act = e.target.closest("[data-act]");
  if(act){ answer(act.dataset.act); return; }
  if(e.target.id==="next"){ deal(); return; }
  if(e.target.id==="reset"){ if(confirm("Сбросить всю статистику?")){ stats={overall:{total:0,correct:0},hands:{}}; saveStats(stats); render(); } }
});
document.addEventListener("change", e=>{
  if(e.target.id==="folds") includeFolds = e.target.checked;
});
document.addEventListener("keydown", e=>{
  if(tab!=="practice") return;
  if(e.key==="f"||e.key==="F") answer("fold");
  if(e.key==="r"||e.key==="R") answer("raise");
  if(e.key==="a"||e.key==="A") answer("allin");
  if((e.key===" "||e.key==="Enter") && locked){ e.preventDefault(); deal(); }
});
render();
