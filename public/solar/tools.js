/* Your Solar Advisor — theme toggle, free tools, Formspree forms. No dependencies. */

// ── Config ────────────────────────────────────────────────────────────────
// Paste your Formspree endpoint here, e.g. "https://formspree.io/f/abcdwxyz".
const FORMSPREE_ENDPOINT = "";

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
  const BATTERY_COST_PER_KWH = 1000; // rough installed cost used to back batteries out of $/W
  const MAX_QUOTES = 3;
  const quotesEl = $("#quotes");
  const addBtn = $("#add-quote");

  function quoteCard(n) {
    const id = (f) => `q${n}-${f}`;
    const el = document.createElement("fieldset");
    el.className = "quote-card";
    el.innerHTML = `
      <h3><span>Quote ${String.fromCharCode(64 + n)}</span>${n === 3 ? '<button type="button" class="remove">Remove</button>' : ""}</h3>
      <div class="field"><label for="${id("name")}">Installer</label><input id="${id("name")}" data-k="name" placeholder="Company name" /></div>
      <div class="field"><label for="${id("kw")}">System size (kW)</label><input id="${id("kw")}" data-k="kw" type="number" min="0" step="0.1" inputmode="decimal" placeholder="7.2" /></div>
      <div class="field"><label for="${id("price")}">Total price before incentives ($)</label><input id="${id("price")}" data-k="price" type="number" min="0" step="100" inputmode="decimal" placeholder="24000" /></div>
      <div class="field"><label for="${id("prod")}">Year-1 production (kWh)</label><input id="${id("prod")}" data-k="prod" type="number" min="0" step="100" inputmode="decimal" placeholder="11000" /></div>
      <div class="field"><label for="${id("batt")}">Battery (kWh, 0 if none)</label><input id="${id("batt")}" data-k="batt" type="number" min="0" step="0.5" inputmode="decimal" value="0" /></div>
      <div class="field"><label for="${id("warranty")}">Workmanship warranty (years)</label><input id="${id("warranty")}" data-k="warranty" type="number" min="0" step="1" inputmode="numeric" placeholder="10" /></div>
      <div class="field"><label for="${id("fin")}">Payment type</label>
        <select id="${id("fin")}" data-k="fin">
          <option value="cash">Cash</option>
          <option value="loan">Loan</option>
          <option value="lease">Lease</option>
          <option value="ppa">PPA</option>
        </select>
      </div>
      <div class="field"><label for="${id("fee")}">Dealer fee or annual escalator (%)</label><input id="${id("fee")}" data-k="fee" type="number" min="0" step="0.1" inputmode="decimal" value="0" /></div>`;
    const rm = $(".remove", el);
    if (rm) rm.addEventListener("click", () => { el.remove(); syncQuotes(); });
    return el;
  }

  function syncQuotes() {
    const count = $$(".quote-card", quotesEl).length;
    quotesEl.style.setProperty("--cols", count);
    addBtn.hidden = count >= MAX_QUOTES;
  }

  quotesEl.append(quoteCard(1), quoteCard(2));
  syncQuotes();
  addBtn.addEventListener("click", () => {
    if ($$(".quote-card", quotesEl).length < MAX_QUOTES) quotesEl.append(quoteCard(3));
    syncQuotes();
  });

  function analyzeQuote(q) {
    const watts = q.kw * 1000;
    const ppw = q.price / watts;
    const pvPrice = Math.max(q.price - q.batt * BATTERY_COST_PER_KWH, 0);
    const ppwExBatt = pvPrice / watts;
    const ratio = q.prod / q.kw;
    // Cap optimistic production so an inflated estimate can't buy a better score.
    const realisticProd = Math.min(q.prod, q.kw * 1700);
    let lifetime = 0;
    for (let y = 0; y < 25; y++) lifetime += realisticProd * Math.pow(0.995, y);
    const centsPerKwh = (q.price / lifetime) * 100;

    const flags = [];
    if (ppwExBatt > 4) flags.push(`High price: ${"$" + fmt(ppwExBatt, 2)}/W for the panels (CA fair range is roughly $2.75–$3.75/W).`);
    if (ratio > 1750) flags.push(`Production estimate looks optimistic (${fmt(ratio)} kWh per kW — most CA roofs make 1,350–1,700).`);
    if (ratio < 1200) flags.push(`Low production for the size (${fmt(ratio)} kWh per kW) — check shading and roof direction.`);
    if (q.fin === "loan" && q.fee > 0) flags.push(`Dealer fee of ${fmt(q.fee, 1)}% — about ${money(q.price * q.fee / 100)} of the price is financing cost.`);
    if ((q.fin === "lease" || q.fin === "ppa") && q.fee > 0) {
      const lift = (Math.pow(1 + q.fee / 100, 24) - 1) * 100;
      flags.push(`${fmt(q.fee, 1)}% escalator — payments will be ~${fmt(lift)}% higher by year 25.`);
    }
    if (q.fin === "lease" || q.fin === "ppa") flags.push("You won't own the system — it can complicate selling your home.");
    if (q.warranty > 0 && q.warranty < 10) flags.push(`Short workmanship warranty (${q.warranty} yrs) — 10+ years is standard.`);
    return { ...q, ppw, ppwExBatt, ratio, centsPerKwh, flags };
  }

  const finLabel = { cash: "Cash", loan: "Loan", lease: "Lease", ppa: "PPA" };

  $("#compare-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const out = $("#scorecard");
    const quotes = $$(".quote-card", quotesEl).map((card, i) => {
      const q = { label: "Quote " + String.fromCharCode(65 + i) };
      $$("[data-k]", card).forEach((inp) => {
        const k = inp.dataset.k;
        q[k] = k === "name" || k === "fin" ? inp.value.trim() : num(inp.value);
      });
      q.batt = q.batt > 0 ? q.batt : 0;
      q.fee = q.fee > 0 ? q.fee : 0;
      return q;
    });

    const incomplete = quotes.filter((q) => !(q.kw > 0 && q.price > 0 && q.prod > 0));
    if (incomplete.length) {
      out.innerHTML = `<p class="form-error">Fill in system size, price, and year-1 production for ${incomplete.map((q) => q.label).join(" and ")}.</p>`;
      return;
    }

    const rows = quotes.map(analyzeQuote);
    const minOf = (k) => Math.min(...rows.map((r) => r[k]));
    const maxOf = (k) => Math.max(...rows.map((r) => r[k]));
    const best = {
      ppwExBatt: minOf("ppwExBatt"),
      centsPerKwh: minOf("centsPerKwh"),
      warranty: maxOf("warranty"),
      flags: Math.min(...rows.map((r) => r.flags.length))
    };
    // Best value: lowest lifetime cost per kWh among the quotes with the fewest red flags.
    const contenders = rows.filter((r) => r.flags.length === best.flags);
    const winner = contenders.reduce((a, b) => (b.centsPerKwh < a.centsPerKwh ? b : a));

    const cell = (r, val, isBest) => `<td class="${rows.length > 1 && isBest ? "best" : ""}">${val}</td>`;
    const head = rows.map((r) => `<th scope="col">${esc(r.name || r.label)}${r === winner ? '<span class="badge-best">Best value</span>' : ""}</th>`).join("");

    out.innerHTML = `
      <table class="score-table">
        <thead><tr><th scope="col"><span class="sr-only">Metric</span></th>${head}</tr></thead>
        <tbody>
          <tr><th scope="row">System size</th>${rows.map((r) => `<td>${fmt(r.kw, 1)} kW${r.batt ? ` + ${fmt(r.batt, 1)} kWh battery` : ""}</td>`).join("")}</tr>
          <tr><th scope="row">Total price</th>${rows.map((r) => `<td>${money(r.price)}</td>`).join("")}</tr>
          <tr><th scope="row">Price per watt</th>${rows.map((r) => `<td>$${fmt(r.ppw, 2)}</td>`).join("")}</tr>
          <tr><th scope="row">Price per watt, panels only (est.)</th>${rows.map((r) => cell(r, "$" + fmt(r.ppwExBatt, 2), r.ppwExBatt === best.ppwExBatt)).join("")}</tr>
          <tr><th scope="row">25-yr cost per kWh</th>${rows.map((r) => cell(r, fmt(r.centsPerKwh, 1) + "¢", r.centsPerKwh === best.centsPerKwh)).join("")}</tr>
          <tr><th scope="row">Production per kW</th>${rows.map((r) => `<td>${fmt(r.ratio)} kWh</td>`).join("")}</tr>
          <tr><th scope="row">Workmanship warranty</th>${rows.map((r) => cell(r, r.warranty > 0 ? r.warranty + " yrs" : "—", r.warranty > 0 && r.warranty === best.warranty)).join("")}</tr>
          <tr><th scope="row">Payment type</th>${rows.map((r) => `<td>${finLabel[r.fin]}</td>`).join("")}</tr>
          <tr class="overall"><th scope="row">Red flags</th>${rows.map((r) => `<td>${r.flags.length
            ? `<ul class="flags">${r.flags.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>`
            : '<ul class="flags ok"><li>None found</li></ul>'}</td>`).join("")}</tr>
        </tbody>
      </table>
      <p class="fine">25-yr cost per kWh assumes 0.5%/yr panel degradation and caps production at 1,700 kWh per kW. Want a second opinion? <a href="#upload-bill">Send us your quotes.</a></p>`;
    out.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

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
