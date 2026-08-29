/* ============================================================
   practice.js - persistence for freeform practice + checklists
   ------------------------------------------------------------
   Lessons ask the learner to write about their own live work.
   That writing is worth keeping, so it survives a page reload
   and is still there weeks later when they revisit the lesson.

   Markup contract:

     <div class="practice">
       <label>Outcome <span>the metric they already care about</span></label>
       <textarea data-practice="outcome"></textarea>
       <p class="save-state" data-save-state></p>
     </div>

     <ul class="checklist">
       <li><label><input type="checkbox" data-check="booked">
           <span>Booked the review</span></label></li>
     </ul>

   Keys are namespaced per page via <body data-lesson="0001">, so
   two lessons can both use data-practice="outcome" without clashing.
   Storage is best-effort: every access is guarded, and the page
   works normally when storage is unavailable.
   ============================================================ */

(function () {
  "use strict";

  var ns = "hod:" + (document.body.getAttribute("data-lesson") || "x") + ":";

  function read(key) {
    try { return window.localStorage.getItem(ns + key); }
    catch (e) { return null; }
  }

  function write(key, value) {
    try { window.localStorage.setItem(ns + key, value); return true; }
    catch (e) { return false; }
  }

  function announce(el, text) {
    var box = el.closest(".practice") || el.parentNode;
    if (!box) return;
    var state = box.querySelector("[data-save-state]");
    if (state) state.textContent = text;
  }

  function initTextarea(el) {
    var key = el.getAttribute("data-practice");
    var saved = read(key);
    if (saved !== null) el.value = saved;

    var timer = null;
    el.addEventListener("input", function () {
      window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        var ok = write(key, el.value);
        announce(el, ok
          ? "Saved to this browser " + new Date().toLocaleTimeString()
          : "Not saved - this browser is blocking storage. Copy your text out.");
      }, 400);
    });
  }

  function initCheckbox(el) {
    var key = el.getAttribute("data-check");
    if (read(key) === "1") el.checked = true;
    el.addEventListener("change", function () {
      write(key, el.checked ? "1" : "0");
    });
  }

  /* Carry an answer forward from an earlier lesson, read-only.
     <div class="carry" data-carry="0001:sentence"
          data-carry-empty="Fallback shown when nothing was saved.">
     Lets a lesson build on what the learner actually wrote last time,
     which is what makes the course feel continuous rather than serial. */
  function initCarry(el) {
    var ref = (el.getAttribute("data-carry") || "").split(":");
    if (ref.length !== 2) return;

    var value = null;
    try { value = window.localStorage.getItem("hod:" + ref[0] + ":" + ref[1]); }
    catch (e) { value = null; }

    var label = el.getAttribute("data-carry-label") || "From lesson " + ref[0];
    var body = (value && value.trim())
      ? value.trim()
      : (el.getAttribute("data-carry-empty") || "Nothing saved yet.");

    if (!value || !value.trim()) el.classList.add("is-empty");
    el.textContent = "";

    var tag = document.createElement("span");
    tag.className = "carry-label";
    tag.textContent = label;
    el.appendChild(tag);
    el.appendChild(document.createTextNode(body));
  }

  function boot() {
    Array.prototype.forEach.call(
      document.querySelectorAll("textarea[data-practice]"), initTextarea);
    Array.prototype.forEach.call(
      document.querySelectorAll("input[data-check]"), initCheckbox);
    Array.prototype.forEach.call(
      document.querySelectorAll("[data-carry]"), initCarry);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
