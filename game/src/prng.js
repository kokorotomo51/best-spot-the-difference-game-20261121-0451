// Seeded pseudo-random generator (mulberry32) so a ?seed= value
// reproduces the exact same decorative layout every run.
export function makeRandom(seed) {
  let a = seed >>> 0;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickSeed(params) {
  const raw = Number.parseInt(params.get('seed') || '1', 10);
  return Number.isFinite(raw) ? raw : 1;
}
