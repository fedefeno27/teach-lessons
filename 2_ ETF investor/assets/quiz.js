/* ============================================================
   ETF Investor — reusable retrieval-practice quiz
   ------------------------------------------------------------
   Markup contract:

   <div class="quiz" data-quiz="lesson-0001-costs">
     <h4>Retrieval check</h4>
     <p class="quiz-hint">Close the notes. Answer from memory.</p>
     <ol class="quiz-list">
       <li class="quiz-q" data-correct="1">
         <p class="quiz-stem">Question text</p>
         <div class="quiz-opts">
           <button type="button" data-why="Feedback shown if picked">A</button>
           <button type="button" data-why="Feedback shown if picked">B</button>
         </div>
         <div class="quiz-fb" hidden></div>
       </li>
     </ol>
     <div class="quiz-score" hidden></div>
   </div>

   data-correct is the ZERO-BASED index of the right button.
   Options are shuffled on load unless data-noshuffle is set,
   so position carries no information across revisits.

   Storage: only the date and tally of the last attempt are kept
   (localStorage). Answers are never restored — re-reading a
   revealed answer is recognition, not retrieval, and recognition
   does not build storage strength.
   ============================================================ */

(function () {
  "use strict";

  var STORE = "etf-course-quiz-v1";

  function loadStore() {
    try { return JSON.parse(localStorage.getItem(STORE) || "{}"); }
    catch (e) { return {}; }
  }

  function saveStore(obj) {
    try { localStorage.setItem(STORE, JSON.stringify(obj)); }
    catch (e) { /* private mode, blocked storage — feature is optional */ }
  }

  function fmtDate(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return "";
    return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  }

  function daysSince(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return null;
    return Math.floor((Date.now() - d.getTime()) / 86400000);
  }

  function shuffle(nodes, correctIndex) {
    var items = nodes.map(function (n, i) { return { node: n, wasCorrect: i === correctIndex }; });
    for (var i = items.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = items[i]; items[i] = items[j]; items[j] = t;
    }
    var newCorrect = 0;
    items.forEach(function (it, i) { if (it.wasCorrect) newCorrect = i; });
    return { items: items, correct: newCorrect };
  }

  function initQuiz(quiz) {
    var key = quiz.getAttribute("data-quiz") || "unkeyed";
    var questions = Array.prototype.slice.call(quiz.querySelectorAll(".quiz-q"));
    var scoreBox = quiz.querySelector(".quiz-score");
    var total = questions.length;
    var answered = 0;
    var right = 0;

    // Prior-attempt line: spacing cue, never the answers.
    var store = loadStore();
    var prior = store[key];
    if (prior && prior.date) {
      var line = document.createElement("p");
      line.className = "quiz-last";
      var gap = daysSince(prior.date);
      var when = gap === 0 ? "earlier today"
        : gap === 1 ? "yesterday"
        : gap !== null && gap < 30 ? gap + " days ago"
        : "on " + fmtDate(prior.date);
      line.textContent = "Last attempt " + when + ": " + prior.right + "/" + prior.total +
        ". Answers are not restored on purpose — recall them again from memory.";
      var hint = quiz.querySelector(".quiz-hint");
      if (hint && hint.parentNode) hint.parentNode.insertBefore(line, hint.nextSibling);
      else quiz.insertBefore(line, quiz.querySelector(".quiz-list"));
    }

    questions.forEach(function (q) {
      var opts = q.querySelector(".quiz-opts");
      var fb = q.querySelector(".quiz-fb");
      var buttons = Array.prototype.slice.call(opts.querySelectorAll("button"));
      var correct = parseInt(q.getAttribute("data-correct"), 10) || 0;

      if (!q.hasAttribute("data-noshuffle") && buttons.length > 1) {
        var res = shuffle(buttons, correct);
        correct = res.correct;
        res.items.forEach(function (it) { opts.appendChild(it.node); });
        buttons = Array.prototype.slice.call(opts.querySelectorAll("button"));
      }

      buttons.forEach(function (btn, idx) {
        btn.addEventListener("click", function () {
          if (q.getAttribute("data-done") === "1") return;
          q.setAttribute("data-done", "1");
          answered++;

          var isRight = idx === correct;
          if (isRight) right++;

          buttons.forEach(function (b, i) {
            b.disabled = true;
            if (i === correct) b.classList.add("correct");
            else if (i === idx) b.classList.add("wrong");
            else b.classList.add("muted");
          });

          if (fb) {
            var why = btn.getAttribute("data-why") || "";
            var truth = buttons[correct].getAttribute("data-why") || "";
            fb.className = "quiz-fb " + (isRight ? "ok" : "no");
            fb.innerHTML = "";
            var v = document.createElement("span");
            v.className = "verdict";
            v.textContent = isRight ? "Correct" : "Not quite";
            fb.appendChild(v);
            var body = document.createElement("span");
            body.innerHTML = isRight ? why : (why + " <em>The right answer:</em> " + truth);
            fb.appendChild(body);
            fb.hidden = false;
          }

          if (answered === total && scoreBox) renderScore();
        });
      });
    });

    function renderScore() {
      var pct = Math.round((right / total) * 100);
      var verdict =
        pct === 100 ? "Clean sweep. This is ready to be built on — the next lesson can assume it."
        : pct >= 60 ? "Solid, with a gap. Re-read the section behind the miss, then come back in a few days."
        : "Worth another pass. Re-read the lesson, then retry tomorrow rather than right now — the delay is what makes it stick.";

      scoreBox.innerHTML = "";
      var p = document.createElement("p");
      p.style.margin = "0";
      var t = document.createElement("span");
      t.className = "tally";
      t.textContent = right + "/" + total;
      p.appendChild(t);
      p.appendChild(document.createTextNode(verdict));
      scoreBox.appendChild(p);

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "quiz-reset";
      btn.textContent = "Reset and try again";
      btn.addEventListener("click", function () { location.reload(); });
      scoreBox.appendChild(btn);

      scoreBox.hidden = false;

      var s = loadStore();
      s[key] = { date: new Date().toISOString(), right: right, total: total };
      saveStore(s);
    }
  }

  function boot() {
    Array.prototype.slice.call(document.querySelectorAll("[data-quiz]")).forEach(initQuiz);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
