/* ============================================================
   ETF Investor — portfolio look-through X-ray
   ------------------------------------------------------------
   Computes weighted exposure to any characteristic (a sector,
   a country, a single stock) across a set of funds, and
   compares the result to a benchmark weight.

   The whole idea in one line:

       exposure = Σ (portfolio_weight × exposure_within_fund)

   Markup contract:

   <div class="widget" data-xray
        data-benchmark="17.18"
        data-benchmark-label="MSCI ACWI">
     <div class="xray">
       <table class="xray-table">
         <thead>…</thead>
         <tbody>
           <tr data-row data-equity="1">
             <td class="fund">X7PP <span class="desc">Europe 600 Banks</span></td>
             <td><input data-x="weight"   value="18.26" step="0.01"></td>
             <td><input data-x="exposure" value="100"   step="0.1"></td>
             <td data-x="out">—</td>
           </tr>
         </tbody>
         <tfoot>
           <tr><td class="label" colspan="3">Total</td><td data-out="total">—</td></tr>
         </tfoot>
       </table>
     </div>
     <div class="conc">
       <div class="conc-row you">…<span class="conc-fill" data-bar="you"></span>
            <span class="cv" data-out="ofEquity">—</span></div>
       <div class="conc-row bench">…</div>
       <p class="conc-verdict" data-out="verdict"></p>
     </div>
   </div>

   data-equity="1" marks a row as equity, so the widget can
   express the result as a share of the equity sleeve — which is
   the number that matters, since gold and cash dilute a sector
   figure without reducing the underlying bet.

   Add class="est" to an input whose value is an estimate; it
   renders dashed, and the widget counts how many remain.
   ============================================================ */

(function () {
  "use strict";

  function num(el, fallback) {
    if (!el) return fallback;
    var v = parseFloat(el.value);
    return isNaN(v) ? fallback : v;
  }

  function init(root) {
    var benchmark = parseFloat(root.getAttribute("data-benchmark"));
    var benchLabel = root.getAttribute("data-benchmark-label") || "benchmark";
    var rows = Array.prototype.slice.call(root.querySelectorAll("[data-row]"));

    function put(name, text) {
      Array.prototype.slice.call(root.querySelectorAll('[data-out="' + name + '"]'))
        .forEach(function (el) { el.textContent = text; });
    }

    function bar(name, pct) {
      var el = root.querySelector('[data-bar="' + name + '"]');
      if (el) el.style.width = Math.max(0, Math.min(100, pct)) + "%";
    }

    function recalc() {
      var total = 0;
      var equityWeight = 0;
      var portfolioWeight = 0;
      var estimates = 0;

      rows.forEach(function (row) {
        var wEl = row.querySelector('[data-x="weight"]');
        var eEl = row.querySelector('[data-x="exposure"]');
        var w = num(wEl, 0);
        var e = num(eEl, 0);
        var contribution = (w * e) / 100;

        var out = row.querySelector('[data-x="out"]');
        if (out) out.textContent = contribution < 0.005 ? "—" : contribution.toFixed(2) + "%";
        row.classList.toggle("zero", contribution < 0.005);

        if (wEl && wEl.classList.contains("est")) estimates++;
        if (eEl && eEl.classList.contains("est")) estimates++;

        total += contribution;
        portfolioWeight += w;
        if (row.getAttribute("data-equity") === "1") equityWeight += w;
      });

      var ofEquity = equityWeight > 0 ? (total / equityWeight) * 100 : 0;

      put("total", total.toFixed(2) + "%");
      put("equityWeight", equityWeight.toFixed(1) + "%");
      put("portfolioWeight", portfolioWeight.toFixed(1) + "%");
      put("ofPortfolio", total.toFixed(1) + "%");
      put("ofEquity", ofEquity.toFixed(1) + "%");

      // Scale both bars against the larger of the two, so the
      // comparison is visually honest rather than clipped.
      if (!isNaN(benchmark)) {
        var scale = Math.max(ofEquity, benchmark) * 1.15 || 1;
        bar("you", (ofEquity / scale) * 100);
        bar("bench", (benchmark / scale) * 100);
        put("bench", benchmark.toFixed(1) + "%");

        var ratio = benchmark > 0 ? ofEquity / benchmark : 0;
        var verdict;
        if (ratio >= 1.15) {
          verdict = "You hold <b>" + ratio.toFixed(1) + "×</b> the " + benchLabel +
            " weight. That is a position, not a portfolio setting — it needs a reason " +
            "you can state in one sentence.";
        } else if (ratio <= 0.85) {
          verdict = "You hold <b>" + ratio.toFixed(1) + "×</b> the " + benchLabel +
            " weight — an underweight. Deliberate, or a gap nobody chose?";
        } else {
          verdict = "You are within roughly 15% of the " + benchLabel +
            " weight. This is close to neutral: no strong bet either way.";
        }
        var vEl = root.querySelector('[data-out="verdict"]');
        if (vEl) {
          vEl.innerHTML = verdict + (estimates > 0
            ? " <em>" + estimates + " figure" + (estimates === 1 ? " is" : "s are") +
              " still an estimate (dashed box) — replace with the real factsheet number " +
              "and watch what moves.</em>"
            : "");
        }
      }
    }

    Array.prototype.slice.call(root.querySelectorAll("[data-x]")).forEach(function (el) {
      if (el.tagName === "INPUT") {
        el.addEventListener("input", recalc);
        el.addEventListener("change", recalc);
      }
    });

    recalc();
  }

  function boot() {
    Array.prototype.slice.call(document.querySelectorAll("[data-xray]")).forEach(init);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
