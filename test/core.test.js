"use strict";
const test = require("node:test");
const assert = require("node:assert");
const L = require("../src/core.js");

test("area adds up patches in metres", () => {
  assert.strictEqual(L.areaFromPatches([{ length: 5, width: 4 }], "m"), 20);
  assert.strictEqual(L.areaFromPatches([{ length: 5, width: 4 }, { length: 2, width: 3 }], "m"), 26);
});

test("area converts feet to square metres", () => {
  // 10ft x 10ft = 100 sq ft = 9.29 m2
  assert.ok(Math.abs(L.areaFromPatches([{ length: 10, width: 10 }], "ft") - 9.29) < 0.02);
});

test("a ready-made area is taken as given, in unit squared", () => {
  assert.strictEqual(L.areaFromPatches([{ area: 50 }], "m"), 50);
});

test("a half-filled patch is skipped, not counted as zero area", () => {
  assert.strictEqual(L.areaFromPatches([{ length: 5, width: 4 }, { length: 3 }], "m"), 20);
});

test("new-lawn seed uses 35 g per m2 by default", () => {
  const p = L.seedPlan(100, { job: "seed-new" });
  assert.strictEqual(p.ratePerM2, 35);
  assert.strictEqual(p.grams, 3500);
  assert.strictEqual(p.kg, 3.5);
});

test("overseeding uses the lower rate", () => {
  const p = L.seedPlan(100, { job: "seed-over" });
  assert.strictEqual(p.ratePerM2, 25);
  assert.strictEqual(p.grams, 2500);
});

test("the loss boost adds half as much again", () => {
  const p = L.seedPlan(100, { job: "seed-new", boost: true });
  assert.strictEqual(p.ratePerM2, 52.5);
  assert.strictEqual(p.grams, 5250);
});

test("seed boxes round up and report what is left over", () => {
  const p = L.seedPlan(100, { job: "seed-new", boxKg: 1 }); // need 3.5 kg
  assert.strictEqual(p.boxes, 4);
  assert.strictEqual(p.leftoverKg, 0.5);
});

test("turf rolls round up after cutting waste", () => {
  const p = L.turfPlan(20, {}); // 20 m2 + 5% = 21, roll = 1 m2
  assert.strictEqual(p.rolls, 21);
});

test("turf honours a custom roll size and waste", () => {
  const p = L.turfPlan(20, { rollM2: 1.65, wastePct: 10 }); // 22 / 1.65 = 13.3 -> 14
  assert.strictEqual(p.rolls, 14);
});

test("topsoil is area times depth, plus a tenth for settling", () => {
  const p = L.topsoilPlan(10, 10); // 1 m3 / 0.9 = 1.11
  assert.strictEqual(p.cubicM, 1.11);
  assert.ok(p.tonnes > 1.4 && p.tonnes < 1.5);
});

test("compare names the cheaper and the saving", () => {
  const c = L.compare(40, 120);
  assert.strictEqual(c.cheaper, "seed");
  assert.strictEqual(c.saving, 80);
});

test("plan routes a turf job to the turf plan and skips seed", () => {
  const out = L.plan({ unit: "m", patches: [{ length: 5, width: 4 }], job: "turf" });
  assert.strictEqual(out.areaM2, 20);
  assert.ok(out.turf);
  assert.strictEqual(out.seed, null);
});

test("plan with no usable area returns empty plan, not a crash", () => {
  const out = L.plan({ unit: "m", patches: [{ length: "", width: "" }], job: "seed-new" });
  assert.strictEqual(out.areaM2, 0);
  assert.strictEqual(out.seed, null);
  assert.strictEqual(out.turf, null);
});
