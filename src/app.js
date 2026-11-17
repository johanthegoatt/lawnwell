// Lawnwell page wiring. Reads the boxes, calls the core, writes the result.
(function () {
  "use strict";
  var core = window.Lawnwell;
  var $ = function (id) { return document.getElementById(id); };

  var job = "seed-new";
  var sprout = window.Sprout ? window.Sprout($("sprout")) : null;

  var patchesEl = $("patches");
  var unitEl = $("unit");

  function unitLabel() {
    return unitEl.value === "ft" ? "ft" : unitEl.value === "yd" ? "yd" : "m";
  }

  function addPatch(l, w) {
    var u = unitLabel();
    var row = document.createElement("div");
    row.className = "patch";
    row.innerHTML =
      '<label class="field">Length<span class="with-unit"><input type="number" class="pl" min="0" step="0.1" inputmode="decimal" value="' + (l || "") + '"><span class="unit">' + u + '</span></span></label>' +
      '<label class="field">Width<span class="with-unit"><input type="number" class="pw" min="0" step="0.1" inputmode="decimal" value="' + (w || "") + '"><span class="unit">' + u + '</span></span></label>' +
      '<button type="button" class="drop" aria-label="Remove this patch">−</button>';
    patchesEl.appendChild(row);
    row.querySelectorAll("input").forEach(function (inp) {
      inp.addEventListener("input", render);
      inp.addEventListener("focus", function () {
        if (sprout) sprout.tip(inp.classList.contains("pl") ? "length" : "width");
      });
    });
    row.querySelector(".drop").addEventListener("click", function () {
      if (patchesEl.children.length > 1) { row.remove(); render(); }
    });
  }

  function readPatches() {
    return Array.prototype.map.call(patchesEl.children, function (row) {
      return { length: row.querySelector(".pl").value, width: row.querySelector(".pw").value };
    });
  }

  function setJob(next) {
    job = next;
    document.querySelectorAll(".job").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.job === next));
    });
    var turf = next === "turf";
    $("boxField").hidden = turf;
    $("rollField").hidden = !turf;
    $("boostWrap").style.display = turf ? "none" : "";
    if (sprout) sprout.tip(next);
    render();
  }

  function render() {
    var input = {
      unit: unitLabel(),
      patches: readPatches(),
      job: job,
      boxKg: $("boxKg").value,
      rollM2: $("rollM2").value,
      boost: $("boost").checked,
      topsoilDepthCm: $("topsoil").value
    };
    var r = core.plan(input);
    var lines = $("lines");
    lines.innerHTML = "";

    if (!r.areaM2) {
      $("headline").textContent = "Add a patch to start";
      $("area").textContent = "";
      $("hint").textContent = "";
      return;
    }

    var unitArea = unitLabel() === "ft" ? Math.round(r.areaM2 / 0.3048 / 0.3048) + " sq ft"
      : unitLabel() === "yd" ? Math.round(r.areaM2 / 0.9144 / 0.9144) + " sq yd"
      : r.areaM2 + " m²";
    $("area").textContent = "Lawn area " + unitArea + " (" + r.areaM2 + " m²)";

    function li(k, v) {
      var el = document.createElement("li");
      el.innerHTML = '<span class="k">' + k + '</span><span class="v">' + v + '</span>';
      lines.appendChild(el);
    }

    if (r.seed) {
      var s = r.seed;
      $("headline").innerHTML = '<span class="pill seed">Seed</span> ' + (s.kg >= 1 ? s.kg + " kg" : s.grams + " g") + " of grass seed";
      li("Seed rate", s.ratePerM2 + " g/m²" + (s.job === "seed-over" ? " (thickening)" : " (new lawn)"));
      li("Seed needed", s.grams + " g (" + s.kg + " kg)");
      if (s.boxes) li("Boxes to buy", s.boxes + " × " + s.boxKg + " kg");
      if (s.boxes && s.leftoverKg > 0) li("Left over", s.leftoverKg + " kg");
      $("hint").textContent = "Seed is the cheap way in, but give it a few weeks to grow in before you walk on it.";
    } else if (r.turf) {
      var t = r.turf;
      $("headline").innerHTML = '<span class="pill turf">Turf</span> ' + t.rolls + " roll" + (t.rolls === 1 ? "" : "s");
      li("Area with cutting waste", t.coverM2 + " m² (+" + t.wastePct + "%)");
      li("Roll covers", t.rollM2 + " m²");
      li("Rolls to buy", t.rolls);
      $("hint").textContent = "Turf is a lawn the same day. Lay it within a day of delivery and water it in.";
    }

    if (r.topsoil) {
      var tp = r.topsoil;
      li("Topsoil for the bed", tp.cubicM + " m³ (" + tp.litres + " L, about " + tp.tonnes + " t)");
    }

    if (sprout) sprout.cheer(r.seed ? "That's your seed sorted." : "Rolls counted, edges and all.");
  }

  // Wire up.
  document.querySelectorAll(".job").forEach(function (b) {
    b.addEventListener("click", function () { setJob(b.dataset.job); });
  });
  unitEl.addEventListener("change", function () {
    // relabel the unit chips on each patch
    var u = unitLabel();
    patchesEl.querySelectorAll(".unit").forEach(function (sp) { sp.textContent = u; });
    render();
  });
  ["boxKg", "rollM2", "boost", "topsoil"].forEach(function (id) {
    $(id).addEventListener("input", render);
    $(id).addEventListener("change", render);
    $(id).addEventListener("focus", function () { if (sprout) sprout.tip(id); });
  });
  $("add").addEventListener("click", function () { addPatch(); render(); });

  addPatch(8, 5);
  setJob("seed-new");
})();
