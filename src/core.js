// Lawnwell core: how much to buy for a lawn, whether you seed it or turf it.
// No DOM in here, so the same file runs in the page and under `node --test`.
//
// It comes down to area. Measure the ground, and the rest follows:
//   - Seed is sold by weight. You spread a set grams per square metre, so the
//     seed you need is area times that rate. New ground takes more than a thin
//     patch you are just thickening up.
//   - Turf is sold by the roll, and a roll covers about a square metre. You cut
//     rolls to fit the edges, so a few go to waste and you round up.
//   - New ground usually wants a bed of topsoil first, sold by volume like any
//     other loose load, so that is area times depth.
//
// The rates below are typical UK figures you can edit. New lawn from seed is
// about 35 g per square metre (RHS); thickening a thin lawn (overseeding) is
// lower, about 25. The RHS suggests adding half as much again to cover seed
// that never comes up, so there is a tick for that. A turf roll covers roughly
// one square metre. Confirm the rate on your own seed bag or with the turf yard.
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.Lawnwell = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var FT = 0.3048;        // metres per foot
  var YD = 0.9144;        // metres per yard

  // Typical rates. Edit to match your own bag or yard.
  var SEED_RATE = {
    "seed-new":  35,      // grams per square metre, bare ground (RHS standard)
    "seed-over": 25       // grams per square metre, thickening a thin lawn
  };
  var LOSS_BOOST = 0.5;   // RHS: up the rate by half again to cover losses
  var TURF_ROLL_M2 = 1;   // a turf roll covers about a square metre
  var TURF_WASTE = 0.05;  // cutting rolls to the edges wastes a little
  var TOPSOIL_DENSITY = 1.30; // tonnes per cubic metre, loose as delivered

  function num(v) {
    var n = typeof v === "number" ? v : parseFloat(String(v == null ? "" : v).replace(",", "."));
    return isFinite(n) ? n : NaN;
  }

  // Any length into metres. Feet carry inches along if you pass them separately.
  function toM(value, unit) {
    var n = num(value);
    if (!isFinite(n)) return NaN;
    switch (unit) {
      case "mm": return n / 1000;
      case "cm": return n / 100;
      case "ft": return n * FT;
      case "yd": return n * YD;
      default:   return n; // metres
    }
  }

  function round(n, dp) {
    var f = Math.pow(10, dp === undefined ? 2 : dp);
    return Math.round((n + Number.EPSILON) * f) / f;
  }

  // Add up the area of one or more patches. A patch is a length and a width in
  // the given unit, or a ready-made area. Anything that does not read as a
  // positive number is skipped, so a half-filled row does not poison the total.
  function areaFromPatches(patches, unit) {
    var total = 0;
    (patches || []).forEach(function (p) {
      if (p == null) return;
      if (p.area != null && String(p.area) !== "") {
        var a = toM(p.area, unit);
        // area is in unit squared, so convert twice
        var f = toM(1, unit);
        if (isFinite(a) && a > 0) total += num(p.area) * f * f;
        return;
      }
      var l = toM(p.length, unit);
      var w = toM(p.width, unit);
      if (isFinite(l) && isFinite(w) && l > 0 && w > 0) total += l * w;
    });
    return round(total, 2);
  }

  // Seed plan for an area. rate overrides the per-job default; boost adds the
  // RHS half-again for losses; boxKg is the bag size you are buying.
  function seedPlan(areaM2, opts) {
    opts = opts || {};
    var a = num(areaM2);
    if (!isFinite(a) || a <= 0) return null;
    var job = opts.job === "seed-over" ? "seed-over" : "seed-new";
    var baseRate = isFinite(num(opts.rate)) && num(opts.rate) > 0 ? num(opts.rate) : SEED_RATE[job];
    var rate = opts.boost ? baseRate * (1 + LOSS_BOOST) : baseRate;
    var grams = a * rate;
    var boxKg = isFinite(num(opts.boxKg)) && num(opts.boxKg) > 0 ? num(opts.boxKg) : null;
    var boxes = boxKg ? Math.ceil(grams / 1000 / boxKg) : null;
    return {
      job: job,
      ratePerM2: round(rate, 1),
      grams: Math.round(grams),
      kg: round(grams / 1000, 2),
      boxKg: boxKg,
      boxes: boxes,
      leftoverKg: boxes ? round(boxes * boxKg - grams / 1000, 2) : null
    };
  }

  // Turf plan: how many rolls, after waste, rounded up to whole rolls.
  function turfPlan(areaM2, opts) {
    opts = opts || {};
    var a = num(areaM2);
    if (!isFinite(a) || a <= 0) return null;
    var rollM2 = isFinite(num(opts.rollM2)) && num(opts.rollM2) > 0 ? num(opts.rollM2) : TURF_ROLL_M2;
    var waste = isFinite(num(opts.wastePct)) ? num(opts.wastePct) / 100 : TURF_WASTE;
    var withWaste = a * (1 + waste);
    var rolls = Math.ceil(withWaste / rollM2);
    return {
      rollM2: rollM2,
      wastePct: round(waste * 100, 0),
      coverM2: round(withWaste, 1),
      rolls: rolls
    };
  }

  // Topsoil for a new bed under seed or turf: area times finished depth, plus a
  // tenth because loose soil beds down. Depth is in centimetres.
  function topsoilPlan(areaM2, depthCm) {
    var a = num(areaM2);
    var d = num(depthCm);
    if (!isFinite(a) || a <= 0 || !isFinite(d) || d <= 0) return null;
    var settle = 0.10;
    var m3 = (a * (d / 100)) / (1 - settle);
    return {
      depthCm: d,
      cubicM: round(m3, 2),
      litres: Math.round(m3 * 1000),
      tonnes: round(m3 * TOPSOIL_DENSITY, 2)
    };
  }

  // Seed against turf on price alone, when you give both. Seed is cheaper but
  // takes weeks to grow in; turf is a lawn the same day. We report the money and
  // leave the wait to the person.
  function compare(seedCost, turfCost) {
    var s = num(seedCost);
    var t = num(turfCost);
    if (!isFinite(s) || !isFinite(t) || s < 0 || t < 0) return null;
    var cheaper = s <= t ? "seed" : "turf";
    var saving = Math.abs(t - s);
    return {
      seedCost: round(s, 2),
      turfCost: round(t, 2),
      cheaper: cheaper,
      saving: round(saving, 2)
    };
  }

  function plan(input) {
    input = input || {};
    var unit = input.unit === "ft" || input.unit === "yd" ? input.unit : "m";
    var area = input.areaM2 != null ? num(input.areaM2) : areaFromPatches(input.patches, unit);
    var out = { unit: unit, areaM2: round(area, 2), seed: null, turf: null, topsoil: null, compare: null };
    if (!isFinite(area) || area <= 0) return out;

    var job = input.job || "seed-new";
    if (job === "turf") {
      out.turf = turfPlan(area, input);
    } else {
      out.seed = seedPlan(area, { job: job, rate: input.rate, boost: input.boost, boxKg: input.boxKg });
    }
    if (input.topsoilDepthCm) out.topsoil = topsoilPlan(area, input.topsoilDepthCm);
    if (input.seedCost != null && input.turfCost != null) {
      out.compare = compare(input.seedCost, input.turfCost);
    }
    return out;
  }

  return {
    toM: toM,
    areaFromPatches: areaFromPatches,
    seedPlan: seedPlan,
    turfPlan: turfPlan,
    topsoilPlan: topsoilPlan,
    compare: compare,
    plan: plan,
    SEED_RATE: SEED_RATE,
    TURF_ROLL_M2: TURF_ROLL_M2
  };
});
