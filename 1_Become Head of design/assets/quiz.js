/* ============================================================
   quiz.js - reusable retrieval-practice component
   ------------------------------------------------------------
   Markup contract:

     <div class="quiz" data-quiz>
       <p class="quiz-tag">Retrieval check</p>
       <p class="quiz-q">Question text?</p>
       <div class="quiz-opts">
         <button class="quiz-opt" data-correct
                 data-fb="Why this is right.">Option one</button>
         <button class="quiz-opt"
                 data-fb="Why this is wrong.">Option two</button>
       </div>
     </div>

   Options are shuffled on load so revisiting the lesson is real
   retrieval, not position memory. Add data-no-shuffle to pin order.
   Feedback is per-option, so the loop is immediate and specific.
   ============================================================ */

(function () {
  "use strict";

  function shuffle(nodes) {
    for (var i = nodes.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = nodes[i];
      nodes[i] = nodes[j];
      nodes[j] = tmp;
    }
    return nodes;
  }

  function initQuiz(quiz) {
    var opts = Array.prototype.slice.call(quiz.querySelectorAll(".quiz-opt"));
    var wrap = quiz.querySelector(".quiz-opts");
    if (!opts.length || !wrap) return;

    if (!quiz.hasAttribute("data-no-shuffle")) {
      shuffle(opts).forEach(function (o) { wrap.appendChild(o); });
    }

    var fb = document.createElement("div");
    fb.className = "quiz-fb";
    quiz.appendChild(fb);

    function reset() {
      opts.forEach(function (o) {
        o.disabled = false;
        o.classList.remove("is-right", "is-wrong");
      });
      fb.className = "quiz-fb";
      fb.innerHTML = "";
    }

    opts.forEach(function (opt) {
      opt.setAttribute("type", "button");
      opt.addEventListener("click", function () {
        var right = opt.hasAttribute("data-correct");

        opts.forEach(function (o) {
          o.disabled = true;
          if (o.hasAttribute("data-correct")) o.classList.add("is-right");
        });
        if (!right) opt.classList.add("is-wrong");

        fb.className = "quiz-fb show " + (right ? "right" : "wrong");
        fb.innerHTML =
          "<p><strong>" + (right ? "Yes. " : "Not quite. ") + "</strong>" +
          (opt.getAttribute("data-fb") || "") + "</p>";

        if (!right) {
          var retry = document.createElement("button");
          retry.type = "button";
          retry.className = "quiz-retry";
          retry.textContent = "Try again";
          retry.addEventListener("click", reset);
          fb.appendChild(retry);
        }
      });
    });
  }

  function boot() {
    var quizzes = document.querySelectorAll("[data-quiz]");
    Array.prototype.forEach.call(quizzes, initQuiz);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
