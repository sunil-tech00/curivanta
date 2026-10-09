/* Solar guides: theme toggle + the small calculators embedded in articles. */
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const num = (v) => { const n = parseFloat(String(v).replace(/[^0-9.\-]/g, "")); return Number.isFinite(n) ? n : 0; };
  const fmt = (n, d = 0) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  const money = (n) => "$" + fmt(Math.round(n));
  const track = (name, data) => { try { window.cvTrack && window.cvTrack(name, data); } catch (e) {} };
  const guide = location.pathname.split("/").filter(Boolean).pop() || "guides";

  // Theme
  const root = document.documentElement;
  if (!root.getAttribute("data-theme")) root.setAttribute("data-theme", "dark");
  const toggle = $(".theme-toggle");
  if (toggle) toggle.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("ysa-theme", next); } catch (e) {}
  });
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  // Monthly payment for a fixed-rate loan.
  const pmt = (apr, months, principal) => {
    const r = apr / 12;
    return r ? principal * r / (1 - Math.pow(1 + r, -months)) : principal / months;
  };
  // The interest rate that gives the same payment on the cash price — the loan's real cost.
  const trueApr = (payment, months, principal) => {
    let lo = 0, hi = 1;
    for (let i = 0; i < 80; i++) { const mid = (lo + hi) / 2; if (pmt(mid, months, principal) > payment) hi = mid; else lo = mid; }
    return (lo + hi) / 2;
  };
  const stat = (label, value) => `<div class="stat"><dt>${label}</dt><dd>${value}</dd></div>`;

  const CALCS = {
    ppw(v) {
      const kw = v.kw, price = v.price - (v.battery || 0);
      if (!(kw > 0) || !(price > 0)) return null;
      const ppw = price / (kw * 1000);
      const verdict = ppw > 3.5
        ? `<p class="verdict bad">Above the typical $2.50–$3.50/W range. Ask for an itemized price and get a competing quote.</p>`
        : ppw < 2.5
          ? `<p class="verdict ok">Below the typical range: a good price, as long as the equipment and warranty are solid.</p>`
          : `<p class="verdict ok">Within the typical $2.50–$3.50/W range.</p>`;
      return `<dl class="stats">${stat(v.battery ? "Solar-only price" : "Price", money(price))}${stat("Cost per watt", "$" + fmt(ppw, 2))}</dl>${verdict}`;
    },
    dealer(v) {
      if (!(v.cash > 0) || !(v.financed > 0) || !(v.years > 0)) return null;
      const months = Math.round(v.years * 12);
      const fee = v.financed - v.cash;
      const pay = pmt(v.apr / 100, months, v.financed);
      const real = trueApr(pay, months, v.cash);
      const verdict = fee / v.cash > 0.15
        ? `<p class="verdict bad">That's ${fmt(fee / v.cash * 100)}% on top of the cash price. Compare the true rate with a credit union loan on the cash price.</p>`
        : fee > 0
          ? `<p class="verdict">A ${fmt(fee / v.cash * 100)}% markup: modest, but you still pay interest on the fee.</p>`
          : `<p class="verdict ok">No dealer fee: the loan amount matches the cash price.</p>`;
      return `<dl class="stats">${stat("Dealer fee", fee > 0 ? money(fee) : "$0")}${stat("Monthly payment", money(pay))}${stat("Total of payments", money(pay * months))}${stat("True interest rate", fmt(real * 100, 2) + "%")}</dl>${verdict}`;
    },
    ev(v) {
      if (!(v.miles > 0) || !(v.eff > 0) || !(v.sun > 0)) return null;
      const kwh = v.miles / v.eff;
      const panels = Math.ceil((kwh / (v.sun * 365 * 0.8)) * 1000 / 400 - 1e-9);
      return `<dl class="stats">${stat("EV charging", fmt(kwh) + " kWh/yr")}${stat("Per month", "≈ " + fmt(kwh / 12) + " kWh")}${stat("Extra panels", panels + " × 400 W")}${stat("Extra system", fmt(panels * 0.4, 1) + " kW")}</dl>`;
    },
    escalator(v) {
      if (!(v.start > 0) || !(v.years > 0)) return null;
      const e = v.esc / 100;
      let total = 0;
      for (let y = 0; y < v.years; y++) total += v.start * 12 * Math.pow(1 + e, y);
      const last = v.start * Math.pow(1 + e, v.years - 1);
      return `<dl class="stats">${stat("Year 1 payment", money(v.start) + "/mo")}${stat(`Year ${fmt(v.years)} payment`, money(last) + "/mo")}${stat("Total paid", money(total))}${stat("Extra vs. no escalator", money(total - v.start * 12 * v.years))}</dl>`;
    }
  };

  $$("[data-calc]").forEach((form) => {
    const kind = form.dataset.calc;
    const out = $(".calc-out", form.closest(".calc"));
    let used = false;
    const render = () => {
      const v = {};
      $$("input[name]", form).forEach((i) => { v[i.name] = num(i.value); });
      const html = CALCS[kind](v);
      out.innerHTML = html || `<p class="empty">${out.dataset.empty || "Fill in the numbers above."}</p>`;
      if (html && !used) { used = true; track("guide_calc_used", { guide, calc: kind }); }
    };
    form.addEventListener("input", render);
    form.addEventListener("submit", (e) => e.preventDefault());
    render();
  });
})();
