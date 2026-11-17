// Sprout, the tuft of grass in the corner. Pure UI, no maths. Sprout leans
// toward your pointer, gives a tip for the box you're in, cheers when there's a
// result, frowns when a number can't be right, and hides when you tap the x.
// Everything Sprout says also lands in a screen-reader status line.
(function (root) {
  "use strict";

  function Sprout(el) {
    if (!el) return null;
    var bubble = el.querySelector("#sproutBubble");
    var mouth = el.querySelector("#sproutMouth");
    var blades = el.querySelectorAll(".blade");
    var hideBtn;
    var taps = 0, tapTimer = null, bubbleTimer = null;
    var reduce = root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var tips = {
      "seed-new": "Starting from bare soil. I'll use the heavier seed rate for a new lawn.",
      "seed-over": "Just thickening up. That takes less seed than a fresh lawn.",
      "turf": "Turf is a lawn today. I'll count whole rolls with a bit for cutting.",
      length: "Pace it out if you like, one big step is about a metre.",
      width: "The short way across. Patches can be any shape, near enough is fine.",
      boxKg: "Whatever size bag your shop sells, so I can tell you how many.",
      rollM2: "Most rolls are about a square metre. Check yours if you like.",
      topsoil: "Four inches, about 10 cm, is a common bed for a new lawn.",
      boost: "The RHS says sow a bit heavy so gaps don't show. This adds that."
    };

    el.hidden = false;

    el.querySelector(".hide-me") || (function () {
      hideBtn = document.createElement("button");
      hideBtn.className = "hide-me";
      hideBtn.type = "button";
      hideBtn.textContent = "×";
      hideBtn.setAttribute("aria-label", "Hide Sprout");
      el.appendChild(hideBtn);
      hideBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        el.hidden = true;
      });
    })();

    function say(text, ms) {
      if (!text) return;
      bubble.textContent = text;
      bubble.classList.add("show");
      clearTimeout(bubbleTimer);
      bubbleTimer = setTimeout(function () { bubble.classList.remove("show"); }, ms || 4200);
    }

    function mood(kind) {
      if (kind === "sad") mouth.setAttribute("d", "M32 48 q4 -3 8 0");
      else if (kind === "happy") mouth.setAttribute("d", "M31 46 q5 5 10 0");
      else mouth.setAttribute("d", "M32 47 q4 3 8 0");
    }

    el.addEventListener("click", function () {
      taps++;
      clearTimeout(tapTimer);
      tapTimer = setTimeout(function () { taps = 0; }, 900);
      if (taps >= 5) {
        taps = 0;
        mood("happy");
        say("Freshly mown. Go on, walk on it.", 3000);
        if (!reduce) {
          blades.forEach(function (b, i) {
            b.animate([{ transform: "rotate(0deg)" }, { transform: "rotate(" + (i % 2 ? 10 : -10) + "deg)" }, { transform: "rotate(0deg)" }], { duration: 700, iterations: 2 });
          });
        }
        return;
      }
      mood("happy");
      say(el.dataset.lastTip || "Measure the ground and pick seed or turf. I'll do the sums.");
    });

    // Lean toward the pointer.
    if (!reduce) {
      root.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var t = Math.max(-12, Math.min(12, dx / 30));
        blades.forEach(function (b) { b.style.transform = "rotate(" + t + "deg)"; });
      }, { passive: true });
    }

    return {
      tip: function (key) {
        var t = tips[key];
        if (t) { el.dataset.lastTip = t; mood("neutral"); say(t); }
      },
      cheer: function (text) { mood("happy"); say(text); },
      frown: function (text) { mood("sad"); say(text); }
    };
  }

  root.Sprout = Sprout;
})(typeof self !== "undefined" ? self : this);
