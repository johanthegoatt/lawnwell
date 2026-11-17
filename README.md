# Lawnwell

Seed it or turf it, and how much to buy. Measure the ground and Lawnwell works out the grass seed, or the turf rolls, with the topsoil for new ground. Three jobs: starting a lawn from bare soil, thickening a thin one, or laying turf for a lawn the same day.

**Use it:** https://lawnwell.johanthegoat.xyz

## Why

The seed bag tells you grams per square metre and leaves the rest to you: how many bags is that, is a part-bag enough, do I need more because it's a new lawn. Turf is sold by the roll, and you always buy a few extra because rolls get cut to fit the edges. People guess both and either run short or leave a half-bag in the shed. Lawnwell does the square metres once and turns them into a shopping list.

## How it works

- **Seed, by weight.** A new lawn from bare soil takes about **35 g/m²**, the RHS standard rate; thickening a thin lawn (overseeding) is lower, about **25 g/m²**, because the grass that's already there fills in. Type the rate from your own bag to override it. ([RHS: lawns from seed](https://www.rhs.org.uk/lawns/lawns-from-seed))
- **Sow a little heavy.** The RHS suggests upping the rate by half again so seed that never comes up doesn't leave bare patches. That's a tick, off by default.
- **Boxes.** Put in your bag size and it rounds up to whole bags and shows what's left over.
- **Turf, by the roll.** A roll covers about **1 m²**. Rolls are cut to the edges, so it adds 5% for waste and rounds up to whole rolls. Roll size and waste are both editable.
- **Topsoil for new ground.** A new lawn usually wants a bed of topsoil first. Put in a depth (about 10 cm / 4 in is common) and it works out the volume, with a tenth on top because loose soil beds down.
- **Area your way.** Measure in metres, feet or yards, and add as many patches as the garden has. A half-filled patch is skipped, not counted as a zero.

Rates, roll sizes and densities vary by supplier and seed mix, so every figure is one you can edit. Confirm against your own bag or the turf yard before ordering.

## Sprout

Sprout is the tuft of grass in the corner. Sprout leans toward your pointer, gives a tip for the box you're filling, cheers when there's a result and frowns when a number can't be right. Tap for a tip, tap five times fast for a surprise, and the × tucks Sprout away. Everything Sprout says is also read out by screen readers, and Sprout sits still if you've asked for less motion.

## Running the tests

```
npm test
```

Pure functions in `src/core.js`, no build step. The page is `index.html` with `src/app.js` for the wiring and `src/sprout.js` for the mascot.

## Licence

MIT.
