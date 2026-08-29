/* ============================================================
   ETF Investor — compounding maths + cost-leak widget
   ------------------------------------------------------------
   Exposes window.Compound for use by any lesson, and
   auto-wires any element carrying [data-costleak].

   Markup contract for the widget:

   <div class="widget" data-costleak>
     <div class="fields">
       <div class="field"><label>Pot <span class="unit">GBP</span></label>
         <input type="number" data-field="start" value="20000"></div>
       <div class="field"><label>Monthly <span class="unit">GBP</span></label>
         <input type="number" data-field="monthly" value="500"></div>
       <div class="field"><label>Years</label>
         <input type="number" data-field="years" value="20"></div>
       <div class="field"><label>Gross return <span class="unit">%</span></label>
         <input type="number" data-field="gross" value="7" step="0.1"></div>
       <div class="field is-a"><label>Fund A drag <span class="unit">%</span></label>
         <input type="number" data-field="dragA" value="0.60" step="0.01"></div>
       <div class="field is-b"><label>Fund B drag <span class="unit">%</span></label>
         <input type="number" data-field="dragB" value="0.12" step="0.01"></div>
     </div>
     <div class="readout">
       <div class="cell"><span class="k">Fund A</span><span class="v" data-out="fvA"></span></div>
       <div class="cell"><span class="k">Fund B</span><span class="v" data-out="fvB"></span></div>
       <div class="cell hero"><span class="k">Cost of choosing A</span>
         <span class="v" data-out="gap"></span>
         <span class="s" data-out="gapPct"></span></div>
     </div>
   </div>
   ============================================================ */

(function () {
  "use strict";

  var Compound = {
    /**
     * Future value of a pot plus level monthly contributions.
     * @param {number} start    opening balance
     * @param {number} monthly  contribution at the end of each month
     * @param {number} years    horizon
     * @param {number} annual   net annual return as a decimal (0.07 = 7%)
     */
    fv: function (start, monthly, years, annual) {
      var n = Math.round(years * 12);
      if (n <= 0) return start;
      var r = Math.pow(1 + annual, 1 / 12) - 1;
      if (Math.abs(r) < 1e-12) return start + monthly * n;
      return start * Math.pow(1 + r, n) +
             monthly * (Math.pow(1 + r, n) - 1) / r;
    },

    /**
     * Total contributed over the horizon — the money you actually put in.
     */
    contributed: function (start, monthly, years) {
      return start + monthly * Math.round(years * 12);
    },

    /**
     * Fund-level dividend withholding drag on total return.
     * @param {number} exposure   share of the fund in the taxing market (0.63 = 63%)
     * @param {number} yieldPct   dividend yield of that sleeve as a decimal
     * @param {number} rate       withholding rate suffered as a decimal
     */
    whtDrag: function (exposure, yieldPct, rate) {
      return exposure * yieldPct * rate;
    },

    gbp: function (v) {
      return "£" + Math.round(v).toLocaleString("en-GB");
    },

    gbpShort: function (v) {
      var a = Math.abs(v);
      if (a >= 1e6) return "£" + (v / 1e6).toFixed(2).replace(/\.00$/, "") + "m";
      if (a >= 1e4) return "£" + Math.round(v / 1e3) + "k";
      return "£" + Math.round(v).toLocaleString("en-GB");
    },

    pct: function (v, dp) {
      return (v * 100).toFixed(dp === undefined ? 2 : dp) + "%";
    }
  };

  window.Compound = Compound;

  function initCostLeak(root) {
    function read(name, fallback) {
      var el = root.querySelector('[data-field="' + name + '"]');
      if (!el) return fallback;
      var v = parseFloat(el.value);
      return isNaN(v) ? fallback : v;
    }

    function put(name, text) {
      var el = root.querySelector('[data-out="' + name + '"]');
      if (el) el.textContent = text;
    }

    function recalc() {
      var start   = Math.max(0, read("start", 0));
      var monthly = Math.max(0, read("monthly", 0));
      var years   = Math.min(60, Math.max(0, read("years", 20)));
      var gross   = read("gross", 7) / 100;
      var dragA   = read("dragA", 0.6) / 100;
      var dragB   = read("dragB", 0.12) / 100;

      var fvA = Compound.fv(start, monthly, years, gross - dragA);
      var fvB = Compound.fv(start, monthly, years, gross - dragB);
      var gap = fvB - fvA;
      var paid = Compound.contributed(start, monthly, years);

      put("fvA", Compound.gbpShort(fvA));
      put("fvB", Compound.gbpShort(fvB));
      put("gap", Compound.gbpShort(Math.abs(gap)));
      put("gapPct", fvB > 0
        ? Compound.pct(Math.abs(gap) / fvB, 1) + " of the better outcome — " +
          "on " + Compound.gbpShort(paid) + " actually contributed"
        : "");
      put("paid", Compound.gbpShort(paid));
    }

    Array.prototype.slice.call(root.querySelectorAll("[data-field]")).forEach(function (el) {
      el.addEventListener("input", recalc);
      el.addEventListener("change", recalc);
    });

    recalc();
  }

  function boot() {
    Array.prototype.slice.call(document.querySelectorAll("[data-costleak]")).forEach(initCostLeak);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
