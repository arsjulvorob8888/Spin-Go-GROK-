const RANKS = ["A","K","Q","J","T","9","8","7","6","5","4","3","2"];
const COLOR = { fold: "var(--fold)", call: "var(--call)", raise: "var(--raise)", allin: "var(--allin)" };
const ORDER = ["allin","raise","call","fold"];

function handAt(r,c){ const a=RANKS[r], b=RANKS[c]; if(r===c) return a+b; return c>r ? a+b+"s" : b+a+"o"; }
function allHands(){ const h=[]; for(let i=0;i<13;i++) for(let j=0;j<13;j++) h.push(handAt(i,j)); return h; }
const ALL = allHands();
function z(){ return {fold:0,call:0,raise:0,allin:0}; }
function fill(list, action){
  const o={};
  list.forEach(h => { const m=z(); m[action]=100; o[h]=m; });
  return o;
}
function pack(spec){
  const o={};
  Object.entries(spec).forEach(([h,parts])=>{
    const m=z();
    Object.assign(m, parts);
    o[h]=m;
  });
  return o;
}

const BTN_RAISE = ["AA","KK","QQ","JJ","TT","99","88","77","66","AKs","AQs","AJs","ATs","A9s","A8s","A7s","KQs","KJs","KTs","K9s","K8s","K7s","K6s","K5s","Q9s","Q8s","Q7s","J9s","J8s","T8s","98s","97s","87s","86s","AKo","A7o","A6o","A5o","K9o","KTo","QJo","QTo","JTo"];
const BTN_ALLIN = ["A6s","A5s","A4s","A3s","QTs","JTs","T9s","A9o","A8o","44","33","22"];
const BTN_MIX = {
  A2s:{raise:36,allin:64}, AQo:{raise:91,allin:9}, AJo:{raise:93,allin:7},
  ATo:{raise:23,allin:77}, A4o:{raise:81,fold:19}, KQo:{raise:57,allin:43},
  KJo:{raise:53,allin:47}, QJs:{raise:72,allin:28}, Q9o:{raise:27,fold:73},
  J7s:{raise:39,fold:61}, T9o:{raise:61,fold:39}, T7s:{raise:36,fold:64},
  "76s":{raise:45,fold:55}, "55":{raise:53,allin:47}
};
const RANGE_BTN = Object.assign({}, fill(BTN_RAISE,"raise"), fill(BTN_ALLIN,"allin"), pack(BTN_MIX));

const SBF_RAISE = ["AA","AKs","AQs","ATs","A9s","A8s","A6s","A5s","KK","KQs","KJs","KTs","K9s","K8s","QQ","QTs","Q9s","Q8s","Q3s","Q2s","JJ","JTo","TT","T9s","99","98s","88","AQo","AJo","ATo","A9o","A8o","A7o","A6o","A5o","A4o","A3o"];
const SBF_ALLIN = ["A3s","A2s","KJo","J6s","44","33","22"];
const SBF_CALL = ["K3s","K2s","J2s","T3s","T2s","94s","93s","K3o","K2o"];
const SBF_MIX = {
  AJs:{raise:70,call:30}, A7s:{raise:72,call:28}, A4s:{raise:62,call:38},
  AKo:{raise:75,call:25}, A2o:{allin:60,raise:40},
  KQo:{raise:80,call:20}, K7s:{raise:70,call:30}, K6s:{raise:65,call:35},
  K5s:{allin:55,raise:45}, K4s:{raise:60,call:40},
  QJs:{raise:68,call:32}, Q7s:{raise:65,call:35}, Q6s:{allin:55,raise:45},
  Q5s:{raise:58,call:42}, Q4s:{raise:55,call:45},
  QJo:{allin:60,raise:40},
  JTs:{raise:70,call:30}, J9s:{raise:62,call:38}, J8s:{raise:58,call:42},
  J7s:{raise:55,call:45}, J5s:{raise:58,call:42}, J4s:{raise:55,call:45},
  J3s:{raise:52,call:48},
  KTo:{raise:70,call:30}, QTo:{raise:62,call:38},
  T8s:{raise:65,call:35}, T7s:{raise:60,call:40}, T6s:{raise:55,call:45},
  T5s:{raise:52,call:48}, T4s:{raise:50,call:50},
  K9o:{raise:68,call:32}, Q9o:{raise:60,call:40}, J9o:{raise:55,call:45},
  T9o:{raise:58,call:42}, "97s":{raise:62,call:38}, "96s":{raise:55,call:45},
  "95s":{raise:52,call:48},
  K8o:{raise:62,call:38}, Q8o:{raise:55,call:45}, J8o:{raise:52,call:48},
  T8o:{raise:50,call:50}, "98o":{allin:55,raise:45},
  "87s":{raise:60,call:40}, "86s":{raise:55,call:45}, "85s":{raise:52,call:48},
  "84s":{raise:50,call:50},
  K7o:{raise:58,call:42}, Q7o:{raise:52,call:48}, J7o:{raise:50,call:50},
  T7o:{fold:55,call:45}, "97o":{raise:52,call:48}, "87o":{raise:50,call:50},
  "77":{raise:70,call:30}, "76s":{allin:55,raise:45}, "75s":{raise:55,call:45},
  "74s":{raise:50,call:50},
  K6o:{raise:55,call:45}, Q6o:{fold:55,call:45}, J6o:{fold:58,call:42},
  "86o":{raise:40,call:60}, "76o":{fold:60,call:40}, "66":{raise:65,call:35},
  "65s":{raise:58,call:42}, "64s":{raise:52,call:48},
  K5o:{raise:55,call:45}, Q5o:{raise:50,call:50}, J5o:{fold:60,call:40},
  "65o":{fold:62,call:38}, "55":{allin:55,raise:45},
  "54s":{raise:60,call:40}, "53s":{raise:55,call:45}, "52s":{raise:50,call:50},
  K4o:{raise:52,call:48}, "43s":{raise:55,call:45}, "42s":{raise:50,call:50},
  "32s":{raise:45,call:55}
};
const RANGE_SB_FOLD = Object.assign({}, fill(SBF_RAISE,"raise"), fill(SBF_ALLIN,"allin"), fill(SBF_CALL,"call"), pack(SBF_MIX));

const SBR_ALLIN = ["AA","KK","QQ","JJ","TT","99","88","77","66","55","44","33","22",
  "AKs","AQs","AJs","ATs","A9s","A8s","A7s","A6s","A5s","A4s","A3s","A2s",
  "AKo","AQo","AJo","ATo","A9o","A8o",
  "KQs","KJs","KTs","KQo","KJo","KTo","K9o",
  "QJs","QTs","JTs","T9s","98s"];
const SBR_MIX = {
  K9s:{allin:82,raise:18}, Q9s:{allin:80,raise:20}, J9s:{allin:78,raise:22},
  T8s:{allin:80,raise:20}, QJo:{fold:82,raise:18}, A7o:{fold:78,raise:22}
};
const RANGE_SB_RAISE = Object.assign({}, fill(SBR_ALLIN,"allin"), pack(SBR_MIX));

const SBP_CALL = ["AA","KK","QQ","JJ","TT","99","88","77","66","55","44","33","22",
  "AKs","AQs","AJs","ATs","A9s","A8s","A7s",
  "AKo","AQo","AJo","ATo","A9o",
  "KQs","KJs","KQo","KJo","QJs"];
const RANGE_SB_PUSH = fill(SBP_CALL,"call");

const SBL_ALLIN = ["ATs","A6s","A5s","A4s","A3s","A2s","KTs","JTs","J9s","T9s","99","88","77","66","44","33"];
const SBL_RAISE = ["AKs","AQs","AJs","A9s","JJ","TT"];
const SBL_CALL = ["K8s","K7s","K3s","Q8s","Q7s","Q6s","J7s","T7s","97s","96s","86s","75s","65s","64s","54s","22"];
const SBL_MIX = {
  AA:{raise:64,call:36}, A8s:{raise:70,call:22,allin:8}, A7s:{raise:50,call:50},
  AKo:{allin:62,raise:38}, AQo:{allin:70,raise:30}, AJo:{allin:68,raise:32},
  ATo:{allin:72,raise:28}, A9o:{allin:70,raise:30}, A8o:{allin:75,call:25},
  A7o:{allin:48,raise:32,call:20}, A6o:{call:68,raise:32},
  A5o:{allin:50,raise:30,call:20}, A4o:{allin:50,call:32,raise:18},
  A3o:{call:78,raise:22}, A2o:{call:64,raise:36},
  KK:{raise:70,call:24,allin:6}, KQs:{raise:72,allin:28}, KJs:{call:64,raise:36},
  K9s:{allin:74,raise:26}, K6s:{call:72,raise:28}, K5s:{call:62,raise:38},
  K4s:{call:88,raise:12}, K2s:{fold:70,call:30},
  KQo:{allin:72,raise:28}, KJo:{allin:80,raise:20}, KTo:{call:72,allin:28},
  K9o:{call:78,raise:22},
  QQ:{raise:78,call:16,allin:6}, QJs:{allin:78,call:22}, QTs:{allin:74,raise:26},
  Q9s:{allin:80,raise:20}, QJo:{call:76,raise:24}, QTo:{call:76,raise:24},
  J8s:{call:60,raise:40}, JTo:{call:64,raise:36},
  T8s:{allin:58,raise:30,call:12}, "98s":{allin:76,raise:24},
  "87s":{allin:60,raise:32,call:8}, "85s":{fold:62,call:38},
  "76s":{call:74,raise:26}, "55":{allin:58,raise:22,call:20},
  "22":{call:80,allin:20}
};
const RANGE_SB_LIMP = Object.assign({}, fill(SBL_ALLIN,"allin"), fill(SBL_RAISE,"raise"), fill(SBL_CALL,"call"), pack(SBL_MIX));
