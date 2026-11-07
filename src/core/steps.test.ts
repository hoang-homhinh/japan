import { buildStep } from "./steps";
import { S } from "./store";
import { VFLAT, vid } from "./srs";
import { STATIONS } from "./route";
import { PT_DRILLS } from "../content/drills";

const rnd = () => 0.42;
beforeEach(() => { S.progress = { upto: 13, days: [], counts: {}, drills: {} }; });

test("step 1 is the a-dialogue", () => {
  expect(buildStep(13, 1).qs).toEqual([{ kind: "dialogue", id: "13a" }]);
});
test("vocab step part covers one lot with intro + mcq per word", () => {
  const r = buildStep(13, 2, rnd);
  expect(r.partTotal).toBeGreaterThan(1);
  expect(r.qs.filter(q => q.kind === "word-intro").length).toBe(r.qs.filter(q => q.kind === "mcq").length);
  expect(r.qs.some(q => q.kind === "match")).toBe(true);
});
test("vocab step done when all words known", () => {
  S.progress.srs = Object.fromEntries(VFLAT[12].map((_: any, i: number) => [vid(12, i), { lv: 3 }]));
  expect(buildStep(13, 2).partTotal).toBe(0);
});
test("build question tokens contain the answer plus distractors", () => {
  const b = buildStep(13, 3, rnd).qs.find(q => q.kind === "build") as any;
  for (const t of b.answer) expect(b.tokens).toContain(t);
  expect(b.tokens.length).toBeGreaterThan(b.answer.length);
});
test("particle step falls back to earlier lessons", () => {
  const avail = (n: number) => PT_DRILLS.filter((d: any) => d.l <= n).length;
  expect(buildStep(1, 4, rnd).qs.length).toBe(Math.min(10, avail(1)));
  expect(buildStep(3, 4, rnd).qs.length).toBeGreaterThanOrEqual(8);
  expect(buildStep(3, 4, rnd).qs.length).toBe(Math.min(10, avail(3)));
});
test("kanji step uses the station's kanji", () => {
  const intro = buildStep(13, 5, rnd).qs.filter(q => q.kind === "kanji-intro").map((q: any) => q.ch);
  expect(intro).toEqual(STATIONS[12].kanji);
});
test("checkpoint has 10-12 questions", () => {
  for (const n of [1, 13, 25]) {
    const len = buildStep(n, 6, rnd).qs.length;
    expect(len, "N" + n).toBeGreaterThanOrEqual(10);
    expect(len, "N" + n).toBeLessThanOrEqual(12);
  }
});
test("every mcq has its answer among options", () => {
  for (const step of [2, 3, 5, 6] as const) for (const q of buildStep(13, step, rnd).qs as any[])
    if (q.kind === "mcq" || q.kind === "listen") { expect(q.opts[q.a]).toBeDefined(); expect(new Set(q.opts).size).toBe(q.opts.length); }
});
test("without a Japanese voice there are no listening questions", () => {
  expect(buildStep(13, 2, rnd, { listen: false }).qs.some(q => q.kind === "listen")).toBe(false);
  const ck = buildStep(13, 6, rnd, { listen: false }).qs;
  expect(ck.some((q: any) => q.kind === "exam" && /^c/.test(q.id))).toBe(false);
  expect(ck.length).toBeGreaterThanOrEqual(10);
});
