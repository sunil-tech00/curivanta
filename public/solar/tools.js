/* Your Solar Advisor — theme toggle, free tools, Formspree forms. No dependencies. */

// ── Config ────────────────────────────────────────────────────────────────
// Paste your Formspree endpoint here, e.g. "https://formspree.io/f/abcdwxyz".
const FORMSPREE_ENDPOINT = "";
// "What's next?" links under each tool's results. An empty Etsy URL hides that card.
const LINKS = {
  etsySizer: "",            // Etsy listing: Solar Sizing Calculator ($19)
  etsyCompare: "",          // Etsy listing: Solar Quote Toolkit ($29)
  booking: "#upload-bill"   // discovery-call booking page; falls back to the analysis form
};

(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const num = (v) => {
    const n = parseFloat(String(v).replace(/[^0-9.\-]/g, ""));
    return Number.isFinite(n) ? n : NaN;
  };
  const fmt = (n, d = 0) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  const money = (n) => "$" + fmt(Math.round(n));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // ── Theme ───────────────────────────────────────────────────────────────
  const root = document.documentElement;
  if (!root.getAttribute("data-theme")) root.setAttribute("data-theme", "dark");
  $(".theme-toggle").addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("ysa-theme", next); } catch (e) {}
  });

  $$("[data-link]").forEach((a) => {
    const url = LINKS[a.dataset.link];
    if (!url) { a.closest(".next-card").hidden = true; return; }
    a.href = url;
    if (!url.startsWith("#")) { a.target = "_blank"; a.rel = "noopener"; }
  });

  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  // ── Tool tabs ───────────────────────────────────────────────────────────
  const tabs = $$('[role="tab"]');
  function selectTab(tab) {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", on);
      t.tabIndex = on ? 0 : -1;
      $("#" + t.getAttribute("aria-controls")).hidden = !on;
    });
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => selectTab(tab));
    tab.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
      selectTab(next);
      next.focus();
    });
  });

  // ── Solar System Sizer ──────────────────────────────────────────────────
  // Direct port of Solar-Sizing-Calculator.xlsx (1-Inputs → 2-Results).
  // Cell references are noted so the two can be kept in sync.

  // 'Sun Hours' tab: average peak sun hours/day by state (NREL PVWatts, approximate).
  const SUN_HOURS = {
    "Alabama": 4.5, "Alaska": 2.5, "Arizona": 6.5, "Arkansas": 4.7, "California": 5.5,
    "Colorado": 5.4, "Connecticut": 4.0, "Delaware": 4.3, "District of Columbia": 4.2, "Florida": 5.2,
    "Georgia": 4.6, "Hawaii": 5.5, "Idaho": 4.8, "Illinois": 4.0, "Indiana": 4.1,
    "Iowa": 4.3, "Kansas": 5.0, "Kentucky": 4.3, "Louisiana": 4.7, "Maine": 3.8,
    "Maryland": 4.2, "Massachusetts": 3.9, "Michigan": 3.8, "Minnesota": 4.0, "Mississippi": 4.6,
    "Missouri": 4.6, "Montana": 4.6, "Nebraska": 4.9, "Nevada": 6.0, "New Hampshire": 3.9,
    "New Jersey": 4.1, "New Mexico": 6.2, "New York": 3.8, "North Carolina": 4.5, "North Dakota": 4.4,
    "Ohio": 3.9, "Oklahoma": 5.1, "Oregon": 3.8, "Pennsylvania": 3.8, "Rhode Island": 4.0,
    "South Carolina": 4.6, "South Dakota": 4.6, "Tennessee": 4.4, "Texas": 5.3, "Utah": 5.5,
    "Vermont": 3.8, "Virginia": 4.2, "Washington": 3.5, "West Virginia": 3.9, "Wisconsin": 3.9,
    "Wyoming": 5.2
  };
  const GRID_TIED = "Grid-tied (no battery)";
  const LITHIUM = "LiFePO4 (lithium)";

  // Excel ROUNDUP(x, 0), tolerant of float noise like 18.000000000004.
  const roundUp = (x) => Math.ceil(x - 1e-9);

  function sizeSystem(i) {
    const dailyUse = i.monthlyKwh / 30;                                   // B5
    const targetDaily = dailyUse * i.offset;                               // B6
    const recommendedKw = targetDaily / (i.sunHours * i.derate);           // B7
    const panels = roundUp((recommendedKw * 1000) / i.panelW);             // B8
    const actualKw = (panels * i.panelW) / 1000;                           // B9
    const annualProduction = actualKw * i.sunHours * 365 * i.derate;       // B12
    const annualUsage = i.monthlyKwh * 12;                                 // B13
    const coverage = annualProduction / annualUsage;                       // B14
    const dod = i.chemistry === LITHIUM ? 0.85 : 0.5;                      // 1-Inputs B18
    const hasBattery = i.systemType !== GRID_TIED;
    const batteryKwh = hasBattery ? (dailyUse * i.backupDays) / dod : 0;   // B17
    const batteryAh = hasBattery ? (batteryKwh * 1000) / i.bankVoltage : 0; // B18
    const inverterKw = Math.round(actualKw * 1.1 * 10) / 10;               // B19
    const costLow = actualKw * 1000 * i.costLow;                           // B22
    const costHigh = actualKw * 1000 * i.costHigh;                         // C22
    const annualSavings = Math.min(annualProduction, annualUsage) * i.rate; // B24
    const payback = annualSavings > 0 ? (costLow + costHigh) / 2 / annualSavings : NaN; // B25
    return {
      dailyUse, targetDaily, recommendedKw, panels, actualKw, annualProduction, annualUsage,
      coverage, dod, hasBattery, batteryKwh, batteryAh, inverterKw, costLow, costHigh,
      annualSavings, payback
    };
  }

  const sz = (id) => $("#sz-" + id);
  const stateSel = sz("state");
  stateSel.innerHTML = Object.keys(SUN_HOURS).map((st) => `<option${st === "California" ? " selected" : ""}>${st}</option>`).join("");
  sz("sun").value = SUN_HOURS.California;
  stateSel.addEventListener("change", () => { sz("sun").value = SUN_HOURS[stateSel.value]; });

  function renderSizer() {
    const out = $("#sizer-result");
    const systemType = sz("type").value;
    $("#sz-battery").hidden = systemType === GRID_TIED;

    const i = {
      monthlyKwh: num(sz("kwh").value),
      rate: num(sz("rate").value),
      sunHours: num(sz("sun").value),
      offset: num(sz("offset").value) / 100,
      derate: num(sz("derate").value),
      panelW: num(sz("panel").value),
      systemType,
      chemistry: sz("chem").value,
      backupDays: num(sz("days").value),
      bankVoltage: num(sz("volt").value),
      costLow: num(sz("costlo").value),
      costHigh: num(sz("costhi").value)
    };
    i.rate = i.rate >= 0 ? i.rate : 0;
    i.costLow = i.costLow >= 0 ? i.costLow : 0;
    i.costHigh = i.costHigh >= 0 ? i.costHigh : 0;
    i.backupDays = i.backupDays > 0 ? i.backupDays : 0;

    const missing = [
      [i.monthlyKwh > 0, "monthly kWh use"],
      [i.sunHours > 0, "peak sun hours"],
      [i.offset > 0, "offset goal"],
      [i.derate > 0 && i.derate <= 1, "a derate factor between 0 and 1"]
    ].filter(([ok]) => !ok).map(([, label]) => label);
    if (missing.length) {
      out.innerHTML = `<p class="empty">Enter ${missing.join(", ")} to see your system size.</p>`;
      return;
    }

    const r = sizeSystem(i);
    const row = (label, value, hint) => `<div class="stat"><dt>${label}</dt><dd>${value}</dd>${hint ? `<span class="hint">${hint}</span>` : ""}</div>`;
    out.innerHTML = `
      <div class="result-hero">
        <div class="big">${fmt(r.actualKw, 1)} kW</div>
        <div class="unit">${r.panels} panels × ${i.panelW} W · minimum needed ${fmt(r.recommendedKw, 2)} kW</div>
      </div>
      <p class="result-group">System size</p>
      <dl class="stats">
        ${row("Daily energy use", fmt(r.dailyUse, 1) + " kWh")}
        ${row("Target daily production", fmt(r.targetDaily, 1) + " kWh")}
        ${row("Suggested inverter", fmt(r.inverterKw, 1) + " kW", "Size up for AC, EV charger")}
        ${row("Panels", String(r.panels), "Rounded up")}
      </dl>
      <p class="result-group">Production</p>
      <dl class="stats">
        ${row("Est. annual production", fmt(r.annualProduction) + " kWh")}
        ${row("Your annual usage", fmt(r.annualUsage) + " kWh")}
        ${row("Bill coverage", fmt(r.coverage * 100) + "%", r.coverage > 1 ? "Surplus to sell or store" : "")}
      </dl>
      ${r.hasBattery ? `
      <p class="result-group">Battery</p>
      <dl class="stats">
        ${row("Battery bank (nominal)", fmt(r.batteryKwh, 1) + " kWh", `${Math.round(r.dod * 100)}% usable depth of discharge`)}
        ${row("Amp-hours", fmt(r.batteryAh) + " Ah", `At ${i.bankVoltage}V`)}
      </dl>` : ""}
      <p class="result-group">Cost &amp; payback</p>
      <dl class="stats">
        ${row("Est. installed cost", `${money(r.costLow)}–${money(r.costHigh)}`)}
        ${row("Est. annual bill savings", money(r.annualSavings))}
        ${row("Simple payback", Number.isFinite(r.payback) ? fmt(r.payback, 1) + " years" : "—", "On mid-range cost")}
      </dl>`;
  }

  $("#sizer-form").addEventListener("input", renderSizer);
  $("#sizer-form").addEventListener("change", renderSizer);
  $("#sizer-form").addEventListener("submit", (e) => e.preventDefault());
  renderSizer();

  // ── Solar Quote Comparator ──────────────────────────────────────────────
  // Direct port of solar-quote-toolkit-v1.xlsx (1-Quotes → 2-Comparison).
  const MAX_QUOTES = 3;
  const DEALER_FEE_LIMIT = 0.15;   // financed > 15% over cash
  const PRODUCTION_LIMIT = 1.10;   // quoted > 110% of expected
  const ESCALATOR_LIMIT = 0.029;   // lease/PPA escalator above 2.9%/yr
  const quotesEl = $("#quotes");
  const addBtn = $("#add-quote");
  const DASH = "—";

  const qField = (n, key, label, attrs, hint) => `
    <div class="field" data-for="${key}">
      <label for="q${n}-${key}">${label}</label>
      <input id="q${n}-${key}" data-k="${key}" ${attrs} />
      ${hint ? `<small>${hint}</small>` : ""}
    </div>`;

  function quoteCard(n) {
    const letter = String.fromCharCode(64 + n);
    const el = document.createElement("fieldset");
    el.className = "quote-card";
    el.dataset.pay = "cash";
    el.innerHTML = `
      <h3><span>Quote ${letter}</span>${n === 3 ? '<button type="button" class="remove">Remove</button>' : ""}</h3>
      ${qField(n, "name", "Installer name", 'placeholder="Company on the quote"')}
      ${qField(n, "kw", "System size (kW DC)", 'type="number" min="0" step="0.01" inputmode="decimal" placeholder="e.g. 7.2"')}
      ${qField(n, "panel", "Panel brand &amp; model", 'placeholder="e.g. REC Alpha Pure 410W"')}
      ${qField(n, "inverter", "Inverter brand &amp; type", 'placeholder="e.g. Enphase IQ8+ micros"')}
      ${qField(n, "prod", "Quoted annual production (kWh/yr)", 'type="number" min="0" step="1" inputmode="decimal" placeholder="e.g. 11000"', "The installer's estimate")}
      ${qField(n, "cash", "Cash price ($)", 'type="number" min="0" step="1" inputmode="decimal" placeholder="e.g. 21000"', "Always ask for this number!")}
      <div class="field">
        <span class="label">How is it paid for?</span>
        <div class="seg" role="radiogroup" aria-label="Quote ${letter} payment type">
          <label><input type="radio" name="q${n}-pay" value="cash" checked /><span>Cash</span></label>
          <label><input type="radio" name="q${n}-pay" value="loan" /><span>Loan</span></label>
          <label><input type="radio" name="q${n}-pay" value="lease" /><span>Lease / PPA</span></label>
        </div>
      </div>
      <div class="pay-group" data-group="loan">
        ${qField(n, "financed", "Financed price ($)", 'type="number" min="0" step="1" inputmode="decimal" placeholder="e.g. 27000"', "Loan price")}
        ${qField(n, "apr", "Loan APR (%)", 'type="number" min="0" step="0.01" inputmode="decimal" placeholder="e.g. 5.99"')}
        ${qField(n, "term", "Loan term (years)", 'type="number" min="1" step="1" inputmode="numeric" placeholder="e.g. 25"')}
      </div>
      <div class="pay-group" data-group="lease">
        ${qField(n, "lease", "Monthly lease/PPA payment ($)", 'type="number" min="0" step="1" inputmode="decimal" placeholder="e.g. 150"', "First-year monthly payment")}
        ${qField(n, "esc", "Annual escalator (%)", 'type="number" min="0" step="0.1" inputmode="decimal" placeholder="e.g. 2.9"', "Over a 25-year term")}
      </div>`;
    $$('input[type="radio"]', el).forEach((r) => r.addEventListener("change", () => { el.dataset.pay = r.value; }));
    const rm = $(".remove", el);
    if (rm) rm.addEventListener("click", () => { el.remove(); syncQuotes(); renderComparison(); });
    return el;
  }

  function syncQuotes() {
    const count = $$(".quote-card", quotesEl).length;
    quotesEl.style.setProperty("--cols", count);
    addBtn.hidden = count >= MAX_QUOTES;
  }

  // Excel PMT(rate, nper, pv) sign-flipped: the monthly payment on a loan of pv.
  function payment(rate, nper, pv) {
    return rate === 0 ? pv / nper : (pv * rate) / (1 - Math.pow(1 + rate, -nper));
  }

  function readQuote(card, i) {
    const q = { label: "Quote " + String.fromCharCode(65 + i), pay: card.dataset.pay };
    $$("[data-k]", card).forEach((inp) => {
      const k = inp.dataset.k;
      q[k] = k === "name" || k === "panel" || k === "inverter" ? inp.value.trim() : num(inp.value);
    });
    // Only the selected payment section counts — same as filling the loan OR lease rows in the sheet.
    if (q.pay !== "loan") q.financed = q.apr = q.term = NaN;
    if (q.pay !== "lease") q.lease = q.esc = NaN;
    return q;
  }

  function analyzeQuote(q, a) {
    const has = (v) => Number.isFinite(v) && v !== 0;
    const watts = q.kw * 1000;
    const r = { ...q };
    r.ppwCash = has(q.cash) ? q.cash / watts : NaN;                                   // B10
    r.ppwFinanced = has(q.financed) ? q.financed / watts : NaN;                       // B11
    r.markup = has(q.cash) && has(q.financed) ? (q.financed - q.cash) / q.cash : NaN; // B12
    r.expected = q.kw * a.sun * 365 * a.derate;                                       // B14
    r.quotedVsExpected = has(q.prod) ? q.prod / r.expected : NaN;                     // B15
    r.prod25 = a.degr > 0                                                             // B17
      ? (r.expected * (1 - Math.pow(1 - a.degr, 25))) / a.degr
      : r.expected * 25;

    // B18: lease/PPA → escalating payments; loan → total of payments; otherwise cash price.
    const esc = Number.isFinite(q.esc) ? q.esc / 100 : 0;
    if (q.lease > 0) {
      r.cost25 = esc === 0 ? q.lease * 12 * 25 : (q.lease * 12 * (Math.pow(1 + esc, 25) - 1)) / esc;
      r.costBasis = "25 yrs of lease payments";
    } else if (q.financed > 0 && q.term > 0) {
      const apr = Number.isFinite(q.apr) ? q.apr / 100 : 0;
      r.cost25 = payment(apr / 12, q.term * 12, q.financed) * q.term * 12;
      r.costBasis = "Total loan payments";
    } else if (q.cash > 0) {
      r.cost25 = q.cash;
      r.costBasis = "Cash price";
    } else {
      r.cost25 = NaN;
    }
    r.costPerKwh = r.prod25 > 0 ? r.cost25 / r.prod25 : NaN;                          // B19

    r.flagDealer = Number.isFinite(r.markup) ? r.markup > DEALER_FEE_LIMIT : null;    // B21
    r.flagProd = Number.isFinite(r.quotedVsExpected) ? r.quotedVsExpected > PRODUCTION_LIMIT : null; // B22
    r.flagEsc = q.lease > 0 ? esc > ESCALATOR_LIMIT : null;                           // B23
    return r;
  }

  function renderComparison() {
    const out = $("#scorecard");
    const a = {
      sun: num($("#cq-sun").value),
      derate: num($("#cq-derate").value),
      degr: (num($("#cq-degr").value) || 0) / 100
    };
    const rows = $$(".quote-card", quotesEl)
      .map(readQuote)
      .filter((q) => q.kw > 0)
      .map((q) => analyzeQuote(q, a));

    if (!(a.sun > 0 && a.derate > 0)) {
      out.innerHTML = '<p class="empty">Enter peak sun hours and a derate factor to compare.</p>';
      return;
    }
    if (!rows.length) {
      out.innerHTML = '<p class="empty">Add a system size (kW) and price to each quote to see the side-by-side comparison.</p>';
      return;
    }

    const multi = rows.length > 1;
    const lowest = (k) => { const v = rows.map((r) => r[k]).filter(Number.isFinite); return v.length ? Math.min(...v) : NaN; };
    const bestCash = lowest("ppwCash");
    const bestKwh = lowest("costPerKwh");
    const winner = multi && Number.isFinite(bestKwh) ? rows.find((r) => r.costPerKwh === bestKwh) : null;

    const pct = (v) => (Number.isFinite(v) ? fmt(v * 100, 1) + "%" : DASH);
    const usd2 = (v) => (Number.isFinite(v) ? "$" + fmt(v, 2) : DASH);
    const flag = (v, bad) => (v === null ? DASH : v ? `<span class="flag-bad">⚠ ${bad}</span>` : '<span class="flag-ok">✓ OK</span>');
    const cells = (fn, bestFn) => rows.map((r) => `<td class="${multi && bestFn && bestFn(r) ? "best" : ""}">${fn(r)}</td>`).join("");
    const section = (title) => `<tr class="sec"><th colspan="${rows.length + 1}" scope="colgroup">${title}</th></tr>`;
    const payLabel = { cash: "Cash", loan: "Loan", lease: "Lease / PPA" };

    const head = rows.map((r) => `
      <th scope="col">
        ${esc(r.name || r.label)}${r === winner ? '<span class="badge-best">Best value</span>' : ""}
        <small>${fmt(r.kw, 2)} kW · ${payLabel[r.pay]}${r.panel ? " · " + esc(r.panel) : ""}${r.inverter ? " · " + esc(r.inverter) : ""}</small>
      </th>`).join("");

    out.innerHTML = `
      <table class="score-table">
        <thead><tr><th scope="col"><span class="sr-only">Metric</span></th>${head}</tr></thead>
        <tbody>
          ${section("Price normalized")}
          <tr><th scope="row">$/Watt (cash)<small>~$2.50–$3.50 typical · lower wins</small></th>${cells((r) => usd2(r.ppwCash), (r) => r.ppwCash === bestCash)}</tr>
          <tr><th scope="row">$/Watt (financed)</th>${cells((r) => usd2(r.ppwFinanced))}</tr>
          <tr><th scope="row">Dealer-fee markup<small>(Loan − cash) ÷ cash</small></th>${cells((r) => pct(r.markup))}</tr>
          ${section("Production reality check")}
          <tr><th scope="row">Expected annual production<small>What your roof should produce</small></th>${cells((r) => fmt(r.expected) + " kWh")}</tr>
          <tr><th scope="row">Quoted vs expected<small>100% = honest estimate</small></th>${cells((r) => pct(r.quotedVsExpected))}</tr>
          ${section("25-year true cost")}
          <tr><th scope="row">25-yr production<small>With panel degradation</small></th>${cells((r) => fmt(r.prod25) + " kWh")}</tr>
          <tr><th scope="row">25-yr total cost</th>${cells((r) => Number.isFinite(r.cost25) ? `${money(r.cost25)}<small>${r.costBasis}</small>` : DASH)}</tr>
          <tr class="key"><th scope="row">True cost per kWh<small>The single best compare number</small></th>${cells((r) => Number.isFinite(r.costPerKwh) ? fmt(r.costPerKwh * 100, 1) + "¢" : DASH, (r) => r.costPerKwh === bestKwh)}</tr>
          ${section("Automatic flags")}
          <tr><th scope="row">Dealer fees</th>${cells((r) => flag(r.flagDealer, "HIGH — likely dealer fees"))}</tr>
          <tr><th scope="row">Production estimate</th>${cells((r) => flag(r.flagProd, "HIGH — inflated estimate"))}</tr>
          <tr><th scope="row">Escalator</th>${cells((r) => flag(r.flagEsc, "HIGH escalator"))}</tr>
        </tbody>
      </table>`;
  }

  quotesEl.append(quoteCard(1), quoteCard(2));
  syncQuotes();
  addBtn.addEventListener("click", () => {
    if ($$(".quote-card", quotesEl).length < MAX_QUOTES) quotesEl.append(quoteCard(3));
    syncQuotes();
  });
  const compareForm = $("#compare-form");
  compareForm.addEventListener("input", renderComparison);
  compareForm.addEventListener("change", renderComparison);
  compareForm.addEventListener("submit", (e) => e.preventDefault());
  renderComparison();

  // ── Formspree forms ─────────────────────────────────────────────────────
  const fileInput = $("#lf-file");
  if (fileInput) {
    fileInput.addEventListener("change", () => {
      const f = fileInput.files[0];
      const zone = fileInput.closest(".dropzone");
      zone.classList.toggle("has-file", !!f);
      $(".dz-title", zone).textContent = f ? f.name : "Click to upload your bill";
    });
  }

  $$(".js-formspree").forEach((form) => {
    const status = $(".form-status", form);
    const btn = $('button[type="submit"]', form);
    const btnText = btn.textContent;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      status.className = "form-status";
      status.textContent = "";

      if (!FORMSPREE_ENDPOINT) {
        status.classList.add("err");
        status.textContent = "This form isn't connected yet. Please email hello@curivanta.com.";
        return;
      }
      const file = fileInput && form.contains(fileInput) ? fileInput.files[0] : null;
      if (file && file.size > 10 * 1024 * 1024) {
        status.classList.add("err");
        status.textContent = "That file is over 10MB. Please upload a smaller PDF or photo.";
        return;
      }

      btn.disabled = true;
      btn.textContent = file ? "Uploading..." : "Sending...";
      try {
        const data = new FormData(form);
        if (!file) data.delete("bill");
        const res = await fetch(FORMSPREE_ENDPOINT, { method: "POST", body: data, headers: { Accept: "application/json" } });
        if (res.ok) {
          form.reset();
          if (fileInput && form.contains(fileInput)) fileInput.dispatchEvent(new Event("change"));
          status.classList.add("ok");
          status.textContent = file
            ? "Bill uploaded successfully. We'll review your utility bill and get back to you shortly."
            : "Thanks! We'll be in touch soon.";
        } else {
          const body = await res.json().catch(() => ({}));
          const msg = body.errors && body.errors.length ? body.errors.map((x) => x.message).join(" ") : "";
          throw new Error(msg || "Something went wrong.");
        }
      } catch (err) {
        status.classList.add("err");
        status.textContent = (err.message || "Something went wrong.") + " Please try again or email hello@curivanta.com.";
      } finally {
        btn.disabled = false;
        btn.textContent = btnText;
      }
    });
  });
})();
