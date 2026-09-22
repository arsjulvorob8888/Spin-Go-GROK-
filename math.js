function num(id, fallback){
  const el = document.getElementById(id);
  const v = parseFloat(String(el && el.value || "").replace(",", "."));
  return Number.isFinite(v) ? v : fallback;
}
function updateOddsCalc(){
  const pot = Math.max(0, num("m-pot", 3.5));
  const call = Math.max(0.01, num("m-call", 13));
  const eq = Math.min(100, Math.max(0, num("m-eq", 42)));
  const need = call / (pot + call) * 100;
  const finalPot = pot + call;
  const ev = (eq/100) * finalPot - call;
  const box = document.getElementById("m-result");
  if(!box) return;
  const ok = eq + 0.05 >= need;
  box.className = "m-result " + (ok ? "ok" : "bad");
  box.innerHTML = `
    <div class="m-kpi">${need.toFixed(1)}%</div>
    <p>Нужно эквити, чтобы колл был безубыточным.</p>
    <p>Банк после колла: <b>${finalPot.toFixed(1)} bb</b>. EV колла при твоём эквити ${eq.toFixed(1)}%: <b>${ev>=0?"+":""}${ev.toFixed(2)} bb</b>.</p>
    <p><strong>${ok ? "Колл плюсовый" : "Фолд. Эквити не хватает."}</strong></p>`;
}
function renderMath(){
  const el = document.getElementById("view-math");
  if(!el) return;
  el.innerHTML = `
  <div class="panel" style="grid-column:1/-1">
    <div class="m-hero">
      <div>
        <div class="muted" style="font-family:IBM Plex Mono,monospace;font-size:10px;letter-spacing:.16em;text-transform:uppercase">Spin & Go · 3-max · 15bb</div>
        <h2>Математика, которая поднимает лимит</h2>
        <p>На стеке 15bb почти нет «глубокой игры». Решения короткие: пуш, колл пуша, фолд. Если считать банк и эквити, ты перестаёшь гадать и начинаешь забирать мёртвые деньги оппонентов.</p>
      </div>
      <ol class="m-toc">
        <li>EV — прибыль в среднем</li>
        <li>Банковые шансы</li>
        <li>Эквити руки</li>
        <li>Колл олл-ина за 15 секунд</li>
        <li>Фолд-эквити пуша</li>
        <li>ICM в спинах</li>
        <li>Комбинации и ауты</li>
      </ol>
    </div>

    <article class="m-card">
      <div class="m-n">01</div>
      <div>
        <h3>EV — сколько решение приносит в длинную</h3>
        <p>EV (expected value) — средний результат, если разыграть одну и ту же ситуацию тысячу раз. Одна рука врёт. Сотня рук уже показывает правду.</p>
        <div class="m-formula">EV = (шанс выиграть × сколько выиграешь) − (шанс проиграть × сколько проиграешь)</div>
        <div class="m-ex">
          <strong>Пример.</strong> Ты ставишь 2 bb, банк станет 4.5 bb. Если блеф проходит в 50% случаев, EV = 0.5×2.5 − 0.5×2 = +0.25 bb. Крошечный плюс, но за вечер таких спотов десятки.
        </div>
        <p class="m-apply"><b>Как применять:</b> не спрашивай «угадал ли я эту руку». Спрашивай «если так играть всегда — я в плюсе?»</p>
      </div>
    </article>

    <article class="m-card">
      <div class="m-n">02</div>
      <div>
        <h3>Банковые шансы — цена колла</h3>
        <p>Ты платишь кусок банка, чтобы претендовать на весь банк. Чем больше уже лежит в середине, тем дешевле колл.</p>
        <div class="m-formula">Нужное эквити = колл ÷ (банк + колл)</div>
        <div class="m-grid2">
          <div class="m-ex">
            <strong>Открытие 2 bb.</strong> Блайнды 0.5 / 1. Банк до открытия 1.5. BTN поднимает до 2. SB хочет уравнять ещё 1.5. Нужно 1.5 / (2 + 1 + 1.5) ≈ 33%. Лимп/колл слабой руки почти никогда не даёт 33% на флоп.
          </div>
          <div class="m-ex">
            <strong>Пуш 15 bb в твой рейз.</strong> Ты открыл 2, банк ≈ 3.5, оппонент запушил 15. Тебе доставить 13. Банк после колла ≈ 31.5 → <b>≈ 41%</b>. Нет 41% против его диапазона — фолд.
          </div>
        </div>
        <p class="m-apply"><b>Как применять:</b> перед коллом олл-ина всегда в голове: «сколько я доставляю и какой станет банк».</p>
      </div>
    </article>

    <article class="m-card">
      <div class="m-n">03</div>
      <div>
        <h3>Эквити — как часто рука забирает банк</h3>
        <p>Эквити считают до вскрытия: процент раздач, где твоя рука лучше или делит банк. На 15bb чаще всего это префлоп-эквити против диапазона, а не против одной руки.</p>
        <div class="m-table-wrap">
          <table class="m-table">
            <thead><tr><th>Ты</th><th>Оппонент</th><th>Эквити</th><th>Памятка</th></tr></thead>
            <tbody>
              <tr><td>AA</td><td>случайная рука</td><td>85%</td><td>Всегда впереди</td></tr>
              <tr><td>KK / QQ</td><td>широкий пуш</td><td>~80% / 70%</td><td>Колл почти любого пуша</td></tr>
              <tr><td>AKs</td><td>77</td><td>~46%</td><td>Почти монетка</td></tr>
              <tr><td>AKo</td><td>22–99</td><td>42–48%</td><td>На границе колла 40%</td></tr>
              <tr><td>22</td><td>AKo</td><td>~52%</td><td>Пара чуть впереди двух оверкарт</td></tr>
              <tr><td>A5s</td><td>KQ / KJ</td><td>~55%</td><td>Доминируешь кикер, плюс колесо</td></tr>
              <tr><td>J9s</td><td>AQ+</td><td>~35%</td><td>Мало для колла 40%+</td></tr>
              <tr><td>72o</td><td>топ-10%</td><td>~20%</td><td>Фолд всегда</td></tr>
            </tbody>
          </table>
        </div>
        <p class="m-apply"><b>Как применять:</b> не против «одной руки», а против <i>диапазона</i>. Если SB пушит широко, ATo жив. Если пушит только QQ+, ATo мёртв.</p>
      </div>
    </article>

    <article class="m-card">
      <div class="m-n">04</div>
      <div>
        <h3>Колл олл-ина за 15 секунд</h3>
        <ol class="m-steps">
          <li>Сложи банк. Блайнды + уже вложенные фишки + пуш оппонента.</li>
          <li>Отдели, сколько тебе осталось доставить.</li>
          <li>Нужное эквити = доставка / (банк после колла).</li>
          <li>Спроси: его пуш узкий или широкий? Узкий — нужно сильнее. Широкий — можно шире.</li>
          <li>Если рука выше порога — колл. На границе в WTA-спине можно чуть шире.</li>
        </ol>
        <div class="m-ex">
          <strong>Спот из тренажёра.</strong> BTN открыл 2 bb, SB пушит 15. Тебе (как BTN) нужно ~40–42%. Коллируй пары 55+, ATs+, AJo+, KQs. J9s и KJo чаще фолд: красиво выглядят, эквити около 35–38%.
        </div>
      </div>
    </article>

    <article class="m-card">
      <div class="m-n">05</div>
      <div>
        <h3>Фолд-эквити — зачем пушить «мусор»</h3>
        <p>Когда ты пушишь, часть прибыли — не вскрытие, а фолд оппонента. Он отдаёт уже лежащие блайнды без борьбы.</p>
        <div class="m-formula">Чем чаще фолдят, тем слабее рука, которой выгодно пушить</div>
        <div class="m-grid2">
          <div class="m-ex">
            <strong>BTN на 15bb.</strong> В банке 1.5 bb. Пуш 15. Если SB+BB вместе фолдят в 55% случаев, ты забираешь 1.5 «бесплатно» больше половины времени. Даже 87s и A4o становятся плюсовыми.
          </div>
          <div class="m-ex">
            <strong>Когда фолд-эквити нет.</strong> Оппонент уже в олл-ине. Фолдить он не может. Считай только эквити. «Я бы сам пушил» — не аргумент для колла.
          </div>
        </div>
        <p class="m-apply"><b>Как применять:</b> пуш и колл пуша — разные формулы. Пушить можно шире, чем коллировать тот же пуш.</p>
      </div>
    </article>

    <article class="m-card">
      <div class="m-n">06</div>
      <div>
        <h3>ICM — когда фишки ≠ деньги</h3>
        <p>В кеше 1 bb = 1 bb. В турнире приз за место ломает равенство. В Spin&Go это решает, насколько широко коллировать.</p>
        <div class="m-grid2">
          <div class="m-ex">
            <strong>Множитель 2x–3x, winner takes all.</strong> Платят только победителя. Фишки почти равны деньгам. Играй ближе к чип-EV: пуши и коллы шире.
          </div>
          <div class="m-ex">
            <strong>Платят 2 места (часто 5x+).</strong> Вылет = 0, второе место уже деньги. Коллировать маргинальный пуш опасно. Коллы уже. Не геройствуй с KJo, если за столом есть коротыш.
          </div>
        </div>
      </div>
    </article>

    <article class="m-card">
      <div class="m-n">07</div>
      <div>
        <h3>Комбинации, ауты и правило 4/2</h3>
        <p>Диапазон — это не «руки», а <b>комбинации</b>. Пара: 6 комбо. Одномастные: 4. Разномастные: 12. AKo встречается втрое чаще AKs.</p>
        <div class="m-grid2">
          <div class="m-ex">
            <strong>Ауты после флопа.</strong> Флеш-дро: 9. Открытый стрит: 8. Гатешот: 4. Сет до фулл-хауса на парном борде: обычно 7.
          </div>
          <div class="m-ex">
            <strong>Правило 4 и 2.</strong> Флоп → ривер: ауты × 4. Терн → ривер: ауты × 2. Девять аутов: ~36% до ривера, ~18% на одну карту.
          </div>
        </div>
        <p class="m-apply"><b>Как применять:</b> флеш-дро против пуша, где нужно 40% — фолд. 18% на карту не покупают 40%.</p>
      </div>
    </article>

    <article class="m-card m-calc">
      <div class="m-n">∑</div>
      <div>
        <h3>Калькулятор колла</h3>
        <p>Подставь спот в bb. Калькулятор скажет порог эквити и плюсовый ли колл.</p>
        <div id="odds-calc" class="m-calc-grid">
          <label>Банк до колла, bb<input id="m-pot" type="number" step="0.5" value="18.5"></label>
          <label>Доставить, bb<input id="m-call" type="number" step="0.5" value="13"></label>
          <label>Твоё эквити, %<input id="m-eq" type="number" step="0.5" value="42"></label>
        </div>
        <div id="m-result" class="m-result"></div>
        <p class="muted">Пример: BTN открыл 2 bb и лицом к пушу 15 bb.</p>
      </div>
    </article>

    <article class="m-card">
      <div class="m-n">✓</div>
      <div>
        <h3>Чек-лист за столом</h3>
        <ul class="m-check">
          <li>Перед коллом пуша: доставка / новый банк = порог в %.</li>
          <li>Пушить шире, чем коллировать тот же стек.</li>
          <li>Пара бьёт две оверкарты примерно 52/48 — это норма, не «обсосали».</li>
          <li>AKo чаще, чем AKs. Не рисуй оппоненту только suited.</li>
          <li>Дро на 15bb почти не имеют implied odds. Либо банк даёт цену, либо фолд.</li>
          <li>WTA-спин: играй ближе к чартам. Платят 2 места — режь коллы.</li>
          <li>Не уверен в эквити — сверь руку со Стратегией, потом скрой рендж и тренируй.</li>
        </ul>
      </div>
    </article>
  </div>`;
  updateOddsCalc();
}
document.addEventListener("input", e=>{
  if(e.target && (e.target.id==="m-pot" || e.target.id==="m-call" || e.target.id==="m-eq")) updateOddsCalc();
});
