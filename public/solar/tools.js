/* Your Solar Advisor — theme toggle and free tools. No dependencies. */

// ── Config ────────────────────────────────────────────────────────────────
// "What's next?" links under each tool's results. An empty Etsy URL hides that card.
const LINKS = {
  etsySizer: "https://www.etsy.com/listing/4589854852/solar-panel-calculator-spreadsheet-diy",   // Etsy listing: Solar Sizing Calculator ($19)
  etsyCompare: "https://www.etsy.com/listing/4590108397/solar-quote-comparison-spreadsheet", // Etsy listing: Solar Quote Toolkit ($29)
  aiReview: "/solar/review", // $49 AI quote review
  fullReview: "https://buy.stripe.com/test_dRm14h17S3Qp8Uadbvffy00" // $249 Full Solar Review — Stripe TEST link; swap for the live link at launch
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
    if (!url) { (a.closest(".next-card") || a).hidden = true; return; }
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
  const PANEL_W = 400;  // 1-Inputs B15 — fixed for the free site version
  const DERATE = 0.8;   // 1-Inputs B14 — inverter, wiring, dust & heat losses

  // Excel ROUNDUP(x, 0), tolerant of float noise like 18.000000000004.
  const roundUp = (x) => Math.ceil(x - 1e-9);

  function sizeSystem(i) {
    const dailyUse = i.monthlyKwh / 30;                               // B5
    const targetDaily = dailyUse * i.offset;                           // B6
    const recommendedKw = targetDaily / (i.sunHours * DERATE);         // B7
    const panels = roundUp((recommendedKw * 1000) / PANEL_W);          // B8
    const actualKw = (panels * PANEL_W) / 1000;                        // B9
    const annualProduction = actualKw * i.sunHours * 365 * DERATE;     // B12
    const annualUsage = i.monthlyKwh * 12;                             // B13
    return { panels, actualKw, annualProduction, annualUsage, coverage: annualProduction / annualUsage }; // B14
  }

  const sz = (id) => $("#sz-" + id);
  const stateSel = sz("state");
  stateSel.innerHTML = '<option value="" selected disabled>Select your state</option>' +
    Object.keys(SUN_HOURS).map((st) => `<option>${st}</option>`).join("");
  stateSel.addEventListener("change", () => { sz("sun").value = SUN_HOURS[stateSel.value]; });

  function renderSizer() {
    const out = $("#sizer-result");
    const i = {
      monthlyKwh: num(sz("kwh").value),
      sunHours: num(sz("sun").value),
      offset: num(sz("offset").value) / 100
    };
    const missing = [
      [i.monthlyKwh > 0, "monthly kWh use"],
      [i.sunHours > 0, "your state (or peak sun hours)"],
      [i.offset > 0, "offset goal"]
    ].filter(([ok]) => !ok).map(([, label]) => label);
    if (missing.length) {
      out.innerHTML = `<p class="empty">${i.sunHours > 0 ? "Enter" : "Choose"} ${missing.join(", ")} to see your system size.</p>`;
      return;
    }

    const r = sizeSystem(i);
    const row = (label, value, hint) => `<div class="stat"><dt>${label}</dt><dd>${value}</dd>${hint ? `<span class="hint">${hint}</span>` : ""}</div>`;
    out.innerHTML = `
      <div class="result-hero">
        <div class="big">${fmt(r.actualKw, 1)} kW</div>
        <div class="unit">recommended system size</div>
      </div>
      <dl class="stats">
        ${row("Panels", String(r.panels), `${PANEL_W} W each, rounded up`)}
        ${row("Annual production", fmt(r.annualProduction) + " kWh")}
        ${row("Bill coverage", fmt(r.coverage * 100) + "%", `Of your ${fmt(r.annualUsage)} kWh/yr usage`)}
      </dl>`;
  }

  $("#sizer-form").addEventListener("input", renderSizer);
  $("#sizer-form").addEventListener("change", renderSizer);
  $("#sizer-form").addEventListener("submit", (e) => e.preventDefault());
  renderSizer();

  // ── Solar Quote Comparator ──────────────────────────────────────────────
  // Free site version of solar-quote-toolkit-v1.xlsx: ranks quotes by $/Watt (cash), 2-Comparison B10.
  const MAX_QUOTES = 3;
  const quotesEl = $("#quotes");
  const addBtn = $("#add-quote");
  const payLabel = { cash: "Cash", loan: "Loan", lease: "Lease / PPA" };
  const PAY_NOTES = {
    loan: "Enter the cash price, not the loan amount. Financed prices often hide 20–30% in dealer fees.",
    lease: "Leases are quoted per month. Ask what the system would cost to buy outright and enter that as the cash price."
  };

  const qField = (n, key, label, attrs, hint) => `
    <div class="field">
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
      <p class="pay-note" hidden></p>`;
    const note = $(".pay-note", el);
    $$('input[type="radio"]', el).forEach((r) => r.addEventListener("change", () => {
      el.dataset.pay = r.value;
      note.textContent = PAY_NOTES[r.value] || "";
      note.hidden = !PAY_NOTES[r.value];
    }));
    const rm = $(".remove", el);
    if (rm) rm.addEventListener("click", () => { el.remove(); syncQuotes(); renderComparison(); });
    return el;
  }

  function syncQuotes() {
    const count = $$(".quote-card", quotesEl).length;
    quotesEl.style.setProperty("--cols", count);
    addBtn.hidden = count >= MAX_QUOTES;
  }

  function renderComparison() {
    const out = $("#scorecard");
    const quotes = $$(".quote-card", quotesEl).map((card, i) => {
      const q = { label: "Quote " + String.fromCharCode(65 + i), pay: card.dataset.pay };
      $$("[data-k]", card).forEach((inp) => {
        q[inp.dataset.k] = inp.dataset.k === "name" ? inp.value.trim() : num(inp.value);
      });
      q.ppw = q.kw > 0 && q.cash > 0 ? q.cash / (q.kw * 1000) : NaN;
      return q;
    }).filter((q) => q.kw > 0 || q.cash > 0);

    if (!quotes.some((q) => Number.isFinite(q.ppw))) {
      out.innerHTML = '<p class="empty">Add a system size and cash price to see the $/Watt ranking.</p>';
      return;
    }

    const ranked = quotes.filter((q) => Number.isFinite(q.ppw)).sort((x, y) => x.ppw - y.ppw);
    const unranked = quotes.filter((q) => !Number.isFinite(q.ppw));
    const best = ranked[0].ppw;
    const multi = ranked.length > 1;

    const item = (q, rank) => {
      const details = [
        q.kw > 0 ? fmt(q.kw, 2) + " kW" : "",
        q.cash > 0 ? money(q.cash) + " cash" : "",
        q.prod > 0 ? fmt(q.prod) + " kWh/yr quoted" : ""
      ].filter(Boolean).join(" · ");
      const top = rank === 1 && multi;
      const diff = rank > 1 ? `<span class="rank-diff">+$${fmt(q.ppw - best, 2)}/W vs #1</span>` : "";
      return `
        <li class="rank-row${top ? " top" : ""}">
          <span class="rank-num">${rank ? "#" + rank : "—"}</span>
          <span class="rank-name">${esc(q.name || q.label)}<span class="pay-tag pay-${q.pay}">${payLabel[q.pay]}</span>${top ? '<span class="badge-best">Cheapest per watt</span>' : ""}<small>${details}</small></span>
          <span class="rank-ppw">${rank ? "$" + fmt(q.ppw, 2) + "<small>/W</small>" : `<small>Need ${q.kw > 0 ? "cash price" : "system size"}</small>`}${diff}</span>
        </li>`;
    };

    out.innerHTML = `
      <h3 class="rank-title">$/Watt ranking <small>cash price ÷ system watts · lower wins</small></h3>
      <ol class="ranking">
        ${ranked.map((q, i) => item(q, i + 1)).join("")}
        ${unranked.map((q) => item(q, 0)).join("")}
      </ol>`;
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
})();
