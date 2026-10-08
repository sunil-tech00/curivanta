/* AI Quote Review (prototype) — upload → confirm → report. Talks to /api/review/*. */
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = (n, d = 0) => Number(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  const money = (n) => "$" + fmt(Math.round(n));
  const pct = (x, d = 0) => fmt(x * 100, d) + "%";
  const has = (v) => typeof v === "number" && Number.isFinite(v);
  const numOrNull = (v) => { const n = parseFloat(String(v).replace(/[^0-9.\-]/g, "")); return Number.isFinite(n) ? n : null; };

  const STATES = ["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","District of Columbia","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"];
  const MAX_PDF = 3 * 1024 * 1024;
  // Report CTA: the paid Full Solar Review. Swap in its booking/checkout link when it exists.
  const FULL_REVIEW_URL = "/solar#full-review"; // section holds the $249 payment button
  const VERDICT = {
    sign: { label: "Sign", cls: "v-sign" },
    renegotiate: { label: "Renegotiate", cls: "v-reneg" },
    walk_away: { label: "Walk away", cls: "v-walk" }
  };

  const state = { passcode: "", files: { quote: [null, null, null], bill: [null] }, extracted: null, config: null, paid: "" };
  const bypass = new URLSearchParams(location.search).has("bypass"); // owner test runs: passcode + ?bypass
  // Analytics (see /analytics.js); owner test runs aren't counted.
  const track = (name, data) => { try { if (!bypass && window.cvTrack) window.cvTrack(name, data); } catch (e) {} };
  const store = {
    get(k) { try { return JSON.parse(sessionStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    del(k) { try { sessionStorage.removeItem(k); } catch (e) {} }
  };

  // ── Theme (shared with /solar) ──────────────────────────────────────────
  const root = document.documentElement;
  if (!root.getAttribute("data-theme")) root.setAttribute("data-theme", "dark");
  $(".theme-toggle").addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("ysa-theme", next); } catch (e) {}
  });

  // ── Steps & errors ──────────────────────────────────────────────────────
  function show(step) {
    ["pass", "upload", "confirm", "report"].forEach((s) => { $("#step-" + s).hidden = s !== step; });
    $$(".stepper li").forEach((li) => {
      const order = ["upload", "confirm", "report"];
      li.classList.toggle("active", li.dataset.step === step);
      li.classList.toggle("done", order.indexOf(li.dataset.step) < order.indexOf(step));
    });
    $(".stepper").hidden = step === "pass";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function showError(msg) {
    const el = $("#error");
    el.textContent = msg || "";
    el.hidden = !msg;
    if (msg) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  // Shows "label… 0:42" while a slow step runs; returns a stop function.
  function ticker(el, label) {
    const start = Date.now();
    const draw = () => {
      const t = Math.floor((Date.now() - start) / 1000);
      el.innerHTML = `<span class="spinner"></span> ${label} <span class="elapsed">${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}</span>`;
    };
    draw();
    const id = setInterval(draw, 1000);
    return { set(text) { label = text; draw(); }, stop() { clearInterval(id); el.textContent = ""; } };
  }

  async function api(path, body) {
    const res = await fetch("/api/review/" + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode: state.passcode, ...body })
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) {
      try { sessionStorage.removeItem("ysa-review-pass"); } catch (e) {}
      state.passcode = "";
      show("pass");
    }
    if (!res.ok) throw new Error((data.error || "Request failed (" + res.status + ").") + (data.detail ? ` [${data.detail}]` : ""));
    return data;
  }

  // ── Passcode ────────────────────────────────────────────────────────────
  $("#pass-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    showError("");
    state.passcode = $("#passcode").value.trim();
    try {
      await api("auth", {});
      try { sessionStorage.setItem("ysa-review-pass", state.passcode); } catch (e2) {}
      show("upload");
    } catch (err) {
      showError(err.message);
    }
  });

  // ── Uploads ─────────────────────────────────────────────────────────────
  const tpl = $("#slot-template");
  $$(".upload-slot").forEach((slot) => {
    slot.append(tpl.content.cloneNode(true));
    const input = $("input", slot);
    const zone = $(".dropzone", slot);
    const clear = $(".slot-clear", slot);
    const { kind, index } = slot.dataset;

    input.addEventListener("change", async () => {
      showError("");
      const file = input.files[0];
      if (!file) return;
      try {
        state.files[kind][index] = await prepareFile(file);
        $(".dz-title", zone).textContent = file.name;
        $(".dz-sub", zone).textContent = "Ready";
        zone.classList.add("has-file");
        clear.hidden = false;
      } catch (err) {
        input.value = "";
        showError(err.message);
      }
      syncReadButton();
    });
    clear.addEventListener("click", () => {
      state.files[kind][index] = null;
      input.value = "";
      $(".dz-title", zone).textContent = "Choose file";
      $(".dz-sub", zone).textContent = "PDF or photo";
      zone.classList.remove("has-file");
      clear.hidden = true;
      syncReadButton();
    });
  });

  function syncReadButton() {
    $("#read-btn").disabled = !state.files.quote[0];
  }

  // PDFs are sent as-is; photos are downscaled to keep requests small.
  async function prepareFile(file) {
    if (file.type === "application/pdf") {
      if (file.size > MAX_PDF) throw new Error(`${file.name} is over 3 MB. Try a smaller PDF or a photo of the pricing page.`);
      return { name: file.name, mediaType: "application/pdf", data: await toBase64(file) };
    }
    if (!file.type.startsWith("image/")) throw new Error("Please upload a PDF or an image.");
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    return { name: file.name, mediaType: "image/jpeg", data: dataUrl.split(",")[1] };
  }
  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result).split(",")[1]);
      r.onerror = () => reject(new Error("Couldn't read " + file.name));
      r.readAsDataURL(file);
    });
  }

  $("#read-btn").addEventListener("click", async () => {
    showError("");
    const btn = $("#read-btn");
    const progress = $("#read-progress");
    const jobs = [];
    state.files.quote.forEach((f, i) => { if (f) jobs.push({ kind: "quote", i, f, label: "Quote " + "ABC"[i] }); });
    if (state.files.bill[0]) jobs.push({ kind: "bill", i: 0, f: state.files.bill[0], label: "utility bill" });

    btn.disabled = true;
    track("review_read_docs", { quotes: jobs.filter((j) => j.kind === "quote").length, bill: Boolean(state.files.bill[0]) });
    let done = 0;
    const tick = ticker(progress, `Reading ${jobs.length} document${jobs.length > 1 ? "s" : ""}…`);
    try {
      const results = await Promise.all(jobs.map(async (j) => {
        const { fields } = await api("extract", { kind: j.kind, mediaType: j.f.mediaType, data: j.f.data });
        done++;
        tick.set(`Read ${done} of ${jobs.length}…`);
        return { ...j, fields };
      }).map((p, k) => p.catch((err) => { throw new Error(`${jobs[k].label}: ${err.message}`); })));
      state.extracted = {
        quotes: results.filter((r) => r.kind === "quote").sort((a, b) => a.i - b.i).map((r) => r.fields),
        bill: results.find((r) => r.kind === "bill")?.fields || null
      };
      renderConfirm();
      syncUnlockButton();
      show("confirm");
      refreshPreview();
      track("review_read_ok");
    } catch (err) {
      showError(err.message);
      track("review_error", { step: "read" });
    } finally {
      btn.disabled = false;
      tick.stop();
    }
  });

  // ── Confirm ─────────────────────────────────────────────────────────────
  const field = (id, label, value, attrs = 'type="number" min="0" step="any" inputmode="decimal"', hint = "") => `
    <div class="field">
      <label for="${id}">${label}</label>
      <input id="${id}" ${attrs} value="${value === null || value === undefined ? "" : esc(value)}" />
      ${hint ? `<small>${hint}</small>` : ""}
    </div>`;

  function guessPay(q) {
    if (q.lease_monthly_payment || q.ppa_rate_per_kwh) return "lease";
    if (q.financed_price || q.monthly_loan_payment) return "loan";
    return "cash";
  }

  function renderConfirm() {
    const wrap = $("#confirm-quotes");
    wrap.innerHTML = state.extracted.quotes.map((q, i) => {
      const L = "ABC"[i];
      const id = (f) => `q${i}-${f}`;
      const pay = guessPay(q);
      const warn = q.is_solar_quote === false
        ? `<p class="warn">This doesn't look like a solar quote. Check the file, or fill the numbers in by hand.</p>` : "";
      const notes = (q.notes || []).length
        ? `<details class="notes"><summary>Notes from the document (${q.notes.length})</summary><ul>${q.notes.map((n) => `<li>${esc(n)}</li>`).join("")}</ul></details>` : "";
      return `
        <fieldset class="confirm-card" data-i="${i}" data-pay="${pay}">
          <h3>Quote ${L}</h3>
          ${warn}
          <div class="grid-3">
            ${field(id("installer_name"), "Installer", q.installer_name, 'type="text"')}
            ${field(id("system_size_kw"), "System size (kW DC)", q.system_size_kw, undefined, "Required")}
            ${field(id("quoted_annual_production_kwh"), "Quoted production (kWh/yr)", q.quoted_annual_production_kwh)}
            ${field(id("cash_price"), "Cash price ($)", q.cash_price, undefined, "Before incentives")}
            ${field(id("panel"), "Panels", q.panel, 'type="text"')}
            ${field(id("inverter"), "Inverter", q.inverter, 'type="text"')}
            ${field(id("battery_kwh"), "Battery (kWh)", q.battery_kwh, undefined, "Leave blank if none")}
            ${field(id("battery_price"), "Battery price ($)", q.battery_price, undefined, "Only if listed separately")}
            ${field(id("battery"), "Battery model", q.battery, 'type="text"')}
          </div>
          <div class="field">
            <span class="label">How is it paid for?</span>
            <div class="seg" role="radiogroup" aria-label="Quote ${L} payment type">
              ${["cash", "loan", "lease"].map((v) => `<label><input type="radio" name="${id("pay")}" value="${v}" ${v === pay ? "checked" : ""} /><span>${{ cash: "Cash", loan: "Loan", lease: "Lease / PPA" }[v]}</span></label>`).join("")}
            </div>
          </div>
          <div class="grid-3 pay-fields" data-for="loan">
            ${field(id("financed_price"), "Financed price ($)", q.financed_price)}
            ${field(id("loan_apr_pct"), "Loan APR (%)", q.loan_apr_pct)}
            ${field(id("loan_term_years"), "Loan term (years)", q.loan_term_years)}
            ${field(id("monthly_loan_payment"), "Monthly payment ($)", q.monthly_loan_payment, undefined, "If shown")}
            ${field(id("dealer_fee_amount"), "Dealer fee ($)", q.dealer_fee_amount, undefined, "If the quote states one")}
          </div>
          <div class="grid-3 pay-fields" data-for="lease">
            ${field(id("lease_monthly_payment"), "Monthly payment ($)", q.lease_monthly_payment, undefined, "First year (estimate for a PPA)")}
            ${field(id("ppa_rate_per_kwh"), "PPA rate ($/kWh)", q.ppa_rate_per_kwh, undefined, "PPA only — first-year price per kWh")}
            ${field(id("lease_escalator_pct"), "Annual escalator (%)", q.lease_escalator_pct)}
          </div>
          <label class="check tax-check"><input type="checkbox" id="${id("tax")}" ${q.mentions_federal_tax_credit ? "checked" : ""} /> Quote counts the 30% federal tax credit in its price or savings <small>(homeowners can't claim it for systems installed after 2025)</small></label>
          ${notes}
        </fieldset>`;
    }).join("");

    $$(".confirm-card[data-i]", wrap).forEach((card) => {
      $$('input[type="radio"]', card).forEach((r) => r.addEventListener("change", () => { card.dataset.pay = r.value; }));
    });

    // The bill wins; otherwise fall back to what a quote says about the homeowner.
    const bill = state.extracted.bill?.is_utility_bill === false ? null : state.extracted.bill;
    const fromQuote = (k) => state.extracted.quotes.map((q) => q[k]).find((v) => v !== null && v !== undefined);
    const st = bill?.state || fromQuote("state");
    const quoteUsage = fromQuote("customer_annual_usage_kwh");
    const quoteRate = fromQuote("customer_utility_rate_per_kwh");
    const monthly = bill?.annual_kwh ? Math.round(bill.annual_kwh / 12)
      : bill?.monthly_kwh ?? (has(quoteUsage) ? Math.round(quoteUsage / 12) : null);
    const rate = has(bill?.avg_rate_per_kwh) ? bill.avg_rate_per_kwh : quoteRate;

    $("#b-state").innerHTML = '<option value="">Select your state</option>' + STATES.map((s) => `<option${st === s ? " selected" : ""}>${s}</option>`).join("");
    $("#b-monthly").value = monthly ?? "";
    $("#b-rate").value = has(rate) ? rate.toFixed(3) : "";
    const usedQuote = !bill && (has(quoteUsage) || has(quoteRate));
    $("#bill-note").textContent = state.extracted.bill?.is_utility_bill === false
      ? "That file didn't look like a utility bill — please check these numbers."
      : bill
        ? (bill.annual_kwh ? "Monthly usage is your 12-month average from the bill." : "Usage is from one bill period; a 12-month average is more accurate if you know it.")
        : usedQuote
          ? "Filled in from your quote — check them against a recent bill if you can."
          : "No bill uploaded — add your monthly usage and rate for sizing and savings checks.";
  }

  $("#back-upload").addEventListener("click", () => show("upload"));

  function readForm() {
    const quotes = $$("#confirm-quotes .confirm-card").map((card) => {
      const i = card.dataset.i;
      const v = (f) => $(`#q${i}-${f}`).value;
      const pay = card.dataset.pay;
      const extracted = state.extracted.quotes[i];
      return {
        installer_name: v("installer_name").trim() || null,
        system_size_kw: numOrNull(v("system_size_kw")),
        quoted_annual_production_kwh: numOrNull(v("quoted_annual_production_kwh")),
        cash_price: numOrNull(v("cash_price")),
        panel: v("panel").trim() || null,
        inverter: v("inverter").trim() || null,
        battery_kwh: numOrNull(v("battery_kwh")),
        battery_price: numOrNull(v("battery_price")),
        battery: v("battery").trim() || null,
        workmanship_warranty_years: extracted.workmanship_warranty_years ?? null,
        financed_price: pay === "loan" ? numOrNull(v("financed_price")) : null,
        loan_apr_pct: pay === "loan" ? numOrNull(v("loan_apr_pct")) : null,
        loan_term_years: pay === "loan" ? numOrNull(v("loan_term_years")) : null,
        monthly_loan_payment: pay === "loan" ? numOrNull(v("monthly_loan_payment")) : null,
        dealer_fee_amount: pay === "loan" ? numOrNull(v("dealer_fee_amount")) : null,
        lease_monthly_payment: pay === "lease" ? numOrNull(v("lease_monthly_payment")) : null,
        ppa_rate_per_kwh: pay === "lease" ? numOrNull(v("ppa_rate_per_kwh")) : null,
        lease_escalator_pct: pay === "lease" ? numOrNull(v("lease_escalator_pct")) : null,
        mentions_federal_tax_credit: pay !== "lease" && $(`#q${i}-tax`).checked,
        notes: extracted.notes || [],
        _pay: pay
      };
    });
    return {
      quotes,
      state: $("#b-state").value,
      bill: { monthly_kwh: numOrNull($("#b-monthly").value), avg_rate_per_kwh: numOrNull($("#b-rate").value) }
    };
  }

  // Puts saved answers back into the Confirm form (after returning from checkout).
  function applyForm(req) {
    req.quotes.forEach((q, i) => {
      const card = $(`#confirm-quotes .confirm-card[data-i="${i}"]`);
      if (!card) return;
      for (const [k, val] of Object.entries(q)) {
        const el = $(`#q${i}-${k}`);
        if (el && el.type !== "checkbox") el.value = val ?? "";
      }
      const radio = $(`input[name="q${i}-pay"][value="${q._pay}"]`, card);
      if (radio) { radio.checked = true; card.dataset.pay = q._pay; }
      const tax = $(`#q${i}-tax`);
      if (tax) tax.checked = !!q.mentions_federal_tax_credit;
    });
    $("#b-state").value = req.state || "";
    $("#b-monthly").value = req.bill?.monthly_kwh ?? "";
    $("#b-rate").value = req.bill?.avg_rate_per_kwh ?? "";
  }

  // ── Free red-flag preview (code-only check, no AI) ─────────────────────
  let previewTimer = null;
  let previewSeq = 0;
  let previewTracked = false;
  function refreshPreview() {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(loadPreview, 400);
  }
  async function loadPreview() {
    const box = $("#preview");
    if (state.paid) { box.hidden = true; return; }
    const req = readForm();
    if (!req.state || req.quotes.some((q) => !(q.system_size_kw > 0))) { box.hidden = true; return; }
    const seq = ++previewSeq;
    try {
      const body = { ...req, quotes: req.quotes.map(({ _pay, ...q }) => q) };
      const data = await api("preview", body);
      if (seq !== previewSeq) return;
      box.innerHTML = previewHtml(data);
      box.hidden = false;
      if (!previewTracked) { previewTracked = true; track("review_preview", { flags: data.total }); }
    } catch (e) {
      box.hidden = true;
    }
  }
  function previewHtml(d) {
    const many = d.quotes.length > 1;
    const unlock = `<p class="preview-locked"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg><span>The full report adds the <strong>verdict</strong> (sign, renegotiate or walk away), the <strong>true 25-year cost</strong> against your utility bill${many ? ", <strong>how the quotes compare</strong>" : ""}, and <strong>exactly what to say</strong> to the installer.</span></p>`;
    if (!d.total) {
      return `<h3>No major red flags in these numbers</h3>
        <p class="preview-sub">That's a good sign. The full report confirms whether it's actually a good deal.</p>${unlock}`;
    }
    const quotes = d.quotes.filter((q) => q.flags.length).map((q) => `
      <li><strong>${esc(q.label)}${q.name ? " — " + esc(q.name) : ""}</strong>
        <ul>${q.flags.map((f) => `<li class="sev-${f.severity}">${esc(f.title)}</li>`).join("")}</ul>
      </li>`).join("");
    const top = d.top ? `<div class="preview-top"><span class="tag">Most serious${many ? " · " + esc(d.top.label) : ""}</span><p>${esc(d.top.text)}</p></div>` : "";
    return `<h3>We found ${d.total} red flag${d.total === 1 ? "" : "s"}${many ? " across your quotes" : " in your quote"}</h3>
      <ul class="preview-list">${quotes}</ul>${top}${unlock}`;
  }
  $("#confirm-form").addEventListener("input", refreshPreview);
  $("#confirm-form").addEventListener("change", refreshPreview);

  function syncUnlockButton() {
    const btn = $("#report-btn");
    const price = "$" + ((state.config?.priceCents ?? 4900) / 100).toFixed(0);
    btn.textContent = state.paid || bypass ? "Generate my report" : `Unlock my report — ${price}`;
    const left = store.get("ysa-runs-left");
    $("#unlock-note").textContent = state.paid
      ? (left !== null ? `${left} report run${left === 1 ? "" : "s"} left with your purchase.` : "")
      : bypass ? "Test mode: no payment." : `One-time payment, secure checkout by Stripe. Includes up to ${state.config?.maxRuns ?? 3} report runs if you need to correct a number.`;
  }

  $("#confirm-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    showError("");
    const req = readForm();
    const missing = req.quotes.findIndex((q) => !(q.system_size_kw > 0));
    if (missing >= 0) return showError(`Quote ${"ABC"[missing]} needs a system size.`);
    if (!req.state) return showError("Select your state so we can estimate production.");

    if (state.paid || bypass) return generate(req);

    // Not paid yet: keep the confirmed numbers, then hand off to Stripe Checkout.
    const btn = $("#report-btn");
    btn.disabled = true;
    const tick = ticker($("#report-progress"), "Opening secure checkout…");
    try {
      store.set("ysa-pending", { extracted: state.extracted, req });
      const { url } = await api("checkout", {});
      track("review_checkout");
      location.href = url;
    } catch (err) {
      showError(err.message);
      track("review_error", { step: "checkout" });
      btn.disabled = false;
      tick.stop();
    }
  });

  async function generate(req) {
    const btn = $("#report-btn");
    const progress = $("#report-progress");
    btn.disabled = true;
    const tick = ticker(progress, "Analyzing your quotes and writing your report…");
    try {
      const body = { ...req, quotes: req.quotes.map(({ _pay, ...q }) => q) };
      const { metrics, report, runsLeft, reportUrl, test } = await api("report", state.paid ? { ...body, sessionId: state.paid } : { ...body, bypass: true });
      if (state.paid) store.set("ysa-runs-left", runsLeft);
      store.set("ysa-pending", { extracted: state.extracted, req });
      renderReport(metrics, report, { url: reportUrl, test, createdAt: new Date().toISOString() });
      history.replaceState(null, "", new URL(reportUrl).pathname);
      syncUnlockButton();
      show("report");
      track("review_report", { verdict: report?.verdict || "", quotes: req.quotes.length });
    } catch (err) {
      showError(err.message);
      track("review_error", { step: "report" });
    } finally {
      btn.disabled = false;
      tick.stop();
    }
  }

  // ── Report ──────────────────────────────────────────────────────────────
  function renderReport(m, r, saved = null) {
    const v = VERDICT[r.verdict] || VERDICT.renegotiate;
    const byLabel = Object.fromEntries((r.quotes || []).map((q) => [q.label, q]));
    const qs = m.quotes;
    const cell = (fn) => qs.map((q) => `<td>${fn(q)}</td>`).join("");
    const lowest = m.lowest_cost_per_kwh;

    const usage = m.usage ? `
      <div class="usage-box">
        <div><span>Your usage</span><strong>${fmt(m.usage.annual_kwh)} kWh/yr</strong></div>
        ${has(m.usage.utility_rate) ? `<div><span>Utility rate</span><strong>${fmt(m.usage.utility_rate * 100, 1)}¢/kWh</strong></div>` : ""}
        <div><span>1-day backup battery</span><strong>${fmt(m.usage.battery_for_one_day_backup_kwh, 1)} kWh</strong><small>${fmt(m.usage.daily_kwh, 1)} kWh/day ÷ 85% usable</small></div>
        <div><span>Right-sized system</span><strong>${fmt(m.usage.recommended.kw, 1)} kW</strong><small>${m.usage.recommended.panels} × 400 W panels at ${m.assumptions.sun_hours} sun hrs</small></div>
      </div>` : "";

    $("#report").innerHTML = `
      <article class="report">
        <div class="print-only print-head">
          <strong>Your Solar Advisor — Quote Review</strong>
          <span>${new Date(saved?.createdAt || Date.now()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} · curivanta.com/solar</span>
        </div>
        ${saved ? `
        <div class="saved-link no-print">
          <div>
            <strong>Your report is saved.</strong> Bookmark this private link — it's kept for 12 months${saved.test ? " (test run)" : ""}:
            <a href="${esc(saved.url)}">${esc(saved.url.replace(/^https?:\/\//, ""))}</a>
          </div>
          <button type="button" class="btn btn-outline btn-sm copy-link" data-url="${esc(saved.url)}">Copy link</button>
        </div>` : ""}
        <header class="verdict ${v.cls}">
          <span class="verdict-label">Our verdict</span>
          <strong class="verdict-word">${v.label}</strong>
          <h1>${esc(r.headline)}</h1>
          <p>${esc(r.summary)}</p>
          ${r.recommended_quote ? `<p class="rec">Best option: <strong>${esc(r.recommended_quote)}</strong> (${esc(qs.find((q) => q.label === r.recommended_quote)?.installer || "")})</p>` : ""}
        </header>

        ${usage}

        <h2>The numbers</h2>
        <div class="table-wrap">
          <table class="num-table">
            <thead><tr><th scope="col"><span class="sr-only">Metric</span></th>${qs.map((q) => `<th scope="col">${esc(q.installer)}<small>${q.label} · ${{ cash: "Cash", loan: "Loan", lease: "Lease", ppa: "PPA" }[q.payment_type]}</small></th>`).join("")}</tr></thead>
            <tbody>
              <tr><th scope="row">System size</th>${cell((q) => has(q.system_size_kw) ? fmt(q.system_size_kw, 2) + " kW" : "—")}</tr>
              <tr><th scope="row">Battery</th>${cell((q) => has(q.battery_kwh) ? `${fmt(q.battery_kwh, 1)} kWh${has(q.battery_vs_daily_use) ? `<small>${pct(q.battery_vs_daily_use)} of a day's use</small>` : ""}` : "None")}</tr>
              <tr><th scope="row">$/Watt (cash)<small>Typical $2.50–$3.50 for solar</small></th>${cell((q) => has(q.ppw_cash) ? "$" + fmt(q.ppw_cash, 2) + (has(q.ppw_solar_only) ? `<small>$${fmt(q.ppw_solar_only, 2)} solar only</small>` : has(q.battery_kwh) ? "<small>includes battery</small>" : "") : "—")}</tr>
              <tr><th scope="row">Dealer-fee markup<small>Financed vs cash</small></th>${cell((q) => has(q.dealer_fee_markup) ? pct(q.dealer_fee_markup, 1) : "—")}</tr>
              <tr><th scope="row">Expected production<small>What the roof should make</small></th>${cell((q) => has(q.expected_annual_kwh) ? fmt(q.expected_annual_kwh) + " kWh/yr" : "—")}</tr>
              <tr><th scope="row">Quoted vs expected<small>Over 110% is a red flag</small></th>${cell((q) => has(q.quoted_vs_expected) ? pct(q.quoted_vs_expected) : "—")}</tr>
              ${m.usage ? `<tr><th scope="row">Covers your usage</th>${cell((q) => has(q.usage_coverage) ? pct(q.usage_coverage) : "—")}</tr>` : ""}
              <tr><th scope="row">25-year total cost</th>${cell((q) => has(q.cost_25yr) ? `${money(q.cost_25yr)}<small>${esc(q.cost_basis)}</small>` : "—")}</tr>
              <tr class="key"><th scope="row">True cost per kWh<small>Lower wins</small></th>${cell((q) => has(q.cost_per_kwh) ? `${fmt(q.cost_per_kwh * 100, 1)}¢${q.label === lowest ? " ✓" : ""}` : "—")}</tr>
              ${m.usage?.utility_rate ? `<tr><th scope="row">vs. your utility rate</th>${cell((q) => has(q.vs_utility_rate) ? pct(q.vs_utility_rate) + " of utility" : "—")}</tr>` : ""}
            </tbody>
          </table>
        </div>

        <h2>Quote by quote</h2>
        <div class="quote-reviews">
          ${qs.map((q) => {
            const rq = byLabel[q.label] || { findings: [], talking_points: [] };
            const qv = VERDICT[rq.verdict] || null;
            return `
              <section class="quote-review">
                <header>
                  <h3>${esc(q.installer)} <small>${q.label}</small></h3>
                  ${qv ? `<span class="pill-verdict ${qv.cls}">${qv.label}</span>` : ""}
                </header>
                ${q.flags.length ? `<ul class="flag-list">${q.flags.map((f) => `<li class="sev-${f.severity}">${esc(f.text)}</li>`).join("")}</ul>` : '<p class="ok">No automatic red flags.</p>'}
                ${rq.findings?.length ? `<h4>What we found</h4><ul>${rq.findings.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
                ${rq.talking_points?.length ? `<h4>What to say to the installer</h4><ul class="say">${rq.talking_points.map((x) => `<li>“${esc(x.replace(/^["“]|["”]$/g, ""))}”</li>`).join("")}</ul>` : ""}
              </section>`;
          }).join("")}
        </div>

        ${r.questions_to_ask?.length ? `<h2>Questions to ask before you sign</h2><ol class="questions">${r.questions_to_ask.map((x) => `<li>${esc(x)}</li>`).join("")}</ol>` : ""}

        <aside class="caveats">
          <h4>What this review can't see</h4>
          <ul>${(r.caveats || []).map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
          <p>Planning analysis based on the documents you provided, not financial or legal advice. Production estimates use ${m.assumptions.sun_hours} peak sun hours (${esc(m.assumptions.state || "your location")}), a ${m.assumptions.derate} derate, and ${m.assumptions.degradation * 100}%/yr panel degradation over ${m.assumptions.years} years.</p>
        </aside>

        <div class="upsell no-print">
          <div>
            <p class="upsell-title"><strong>Want an expert to take it from here?</strong></p>
            <p>The <strong>Full Solar Review — $249 flat</strong>: we go through your actual quotes and bills line by line, vet the installers, and walk you through a written report and negotiation playbook — then review the contract before you sign, with 14 days of email support.</p>
          </div>
          <a class="btn btn-primary" href="${FULL_REVIEW_URL}">Get the Full Solar Review →</a>
        </div>
      </article>`;
  }

  $("#print-btn").addEventListener("click", () => window.print());
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".copy-link");
    if (!btn) return;
    try { await navigator.clipboard.writeText(btn.dataset.url); btn.textContent = "Copied ✓"; }
    catch (err) { window.prompt("Copy your report link:", btn.dataset.url); }
  });
  $("#restart-btn").addEventListener("click", () => {
    store.del("ysa-pending");
    if (location.pathname !== "/solar/review") history.replaceState(null, "", "/solar/review" + (bypass ? "?bypass" : ""));
    $$(".slot-clear").forEach((b) => b.click());
    state.extracted = null;
    show("upload");
  });

  // ── Start ───────────────────────────────────────────────────────────────
  async function showSaved(query) {
    const res = await fetch("/api/review/saved?" + query, { cache: "no-store" });
    const doc = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(doc.error || "Couldn't load the report.");
    renderReport(doc.metrics, doc.report, { url: doc.url, test: doc.test, createdAt: doc.createdAt });
    history.replaceState(null, "", new URL(doc.url).pathname);
    show("report");
  }

  (async function start() {
    // A saved report link works for anyone holding it — no passcode or payment check.
    const savedId = location.pathname.match(/^\/solar\/report\/([A-Za-z0-9_-]{24})\/?$/)?.[1];
    if (savedId) {
      try { await showSaved("id=" + savedId); track("report_viewed"); }
      catch (err) { show("upload"); showError(err.message); }
      return;
    }
    try { state.passcode = sessionStorage.getItem("ysa-review-pass") || ""; } catch (e) {}
    state.paid = store.get("ysa-paid") || "";
    syncReadButton();
    try {
      state.config = await (await fetch("/api/review/config", { cache: "no-store" })).json();
    } catch (e) {
      state.config = { public: false };
    }

    const params = new URLSearchParams(location.search);
    const paidId = params.get("paid");
    const canceled = params.has("canceled");
    if (paidId || canceled) {
      history.replaceState(null, "", location.pathname + (bypass ? "?bypass" : ""));
      if (paidId) {
        // $49 conversion; the URL is cleaned right after, so a refresh doesn't count it again.
        if (store.get("ysa-paid") !== paidId) track("review_purchased");
        state.paid = paidId;
        store.set("ysa-paid", paidId);
        store.del("ysa-runs-left");
      } else {
        track("review_checkout_canceled");
      }
    }

    if (!state.config.public && !state.passcode) return show("pass");

    const pending = store.get("ysa-pending");
    if ((paidId || canceled) && pending?.extracted) {
      state.extracted = pending.extracted;
      renderConfirm();
      applyForm(pending.req);
      syncUnlockButton();
      show("confirm");
      refreshPreview();
      if (paidId) {
        $("#unlock-note").textContent = "Payment received — writing your report now.";
        generate(pending.req);
      } else {
        showError("Checkout was canceled — your numbers are still here when you're ready.");
      }
      return;
    }
    if (paidId) {
      // Tab closed or opened elsewhere: recover the latest report for this payment if there is one.
      try { return await showSaved("session=" + encodeURIComponent(paidId)); }
      catch (err) { showError("Payment received. Upload your documents to generate your report."); }
    }
    show("upload");
  })();
})();
