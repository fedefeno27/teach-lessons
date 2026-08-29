/* ============================================================
   ETF Investor — persistent task checklists
   ------------------------------------------------------------
   Any <ul class="checklist" data-checklist="unique-key"> with
   <input type="checkbox" id="..."> children remembers its ticks
   in localStorage, so a task spread over several evenings
   survives closing the tab.

   Unlike the quiz, persistence here is the point: this is a
   real-world to-do, not a retrieval exercise.
   ============================================================ */

(function () {
  "use strict";

  var STORE = "etf-course-checklist-v1";

  function load() {
    try { return JSON.parse(localStorage.getItem(STORE) || "{}"); }
    catch (e) { return {}; }
  }

  function save(obj) {
    try { localStorage.setItem(STORE, JSON.stringify(obj)); }
    catch (e) { /* storage blocked — checkboxes still work, just not remembered */ }
  }

  function init(list) {
    var key = list.getAttribute("data-checklist");
    if (!key) return;

    var store = load();
    var state = store[key] || {};
    var boxes = Array.prototype.slice.call(list.querySelectorAll('input[type="checkbox"]'));

    boxes.forEach(function (box, i) {
      var id = box.id || (key + "-" + i);
      if (state[id]) box.checked = true;
      box.addEventListener("change", function () {
        var s = load();
        s[key] = s[key] || {};
        s[key][id] = box.checked;
        save(s);
        paint();
      });
    });

    var status = list.parentNode.querySelector("[data-checklist-status]");

    function paint() {
      if (!status) return;
      var done = boxes.filter(function (b) { return b.checked; }).length;
      status.textContent = done === boxes.length
        ? "All " + boxes.length + " done — tell your teacher what you found."
        : done + " of " + boxes.length + " done";
    }

    paint();
  }

  function boot() {
    Array.prototype.slice.call(document.querySelectorAll("[data-checklist]")).forEach(init);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
