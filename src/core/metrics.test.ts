import { S } from "./store";
import { heatmap, mastery, reviewForecast, readiness, badges, weakItems, lessonCoverage } from "./metrics";

beforeEach(() => { S.progress = { upto: 13, days: [], counts: {}, drills: {}, srs: {} }; });

test("heatmap has weeks*7 cells ending today with counts", () => {
  S.progress.counts = { "2026-11-07": 12, "2026-11-01": 3 };
  const h = heatmap("2026-11-07", 4);
  expect(h).toHaveLength(28);
  expect(h[h.length - 1]).toEqual({ d: "2026-11-07", n: 12 });
  expect(h.find(c => c.d === "2026-11-01")!.n).toBe(3);
});
test("mastery counts only level-3 items", () => {
  S.progress.srs = { "v1-0": { lv: 3 }, "v1-1": { lv: 1 }, "k一": { lv: 3 } };
  const m = mastery();
  expect(m.vocab.done).toBe(1);
  expect(m.kanji.done).toBe(1);
  expect(m.kanji.total).toBe(95);
});
test("review forecast buckets due items into the next 7 days", () => {
  S.progress.srs = { a: { next: "2026-11-05" }, b: { next: "2026-11-07" }, c: { next: "2026-11-09" }, d: { next: "2026-12-30" } };
  const f = reviewForecast("2026-11-07", 7);
  expect(f).toHaveLength(7);
  expect(f[0]).toEqual({ d: "2026-11-07", n: 2 });
  expect(f[2].n).toBe(1);
});
test("readiness projects a date from recent pace", () => {
  S.progress.path = { start: 13, st: { "13": { steps: [1, 2, 3, 4, 5, 6], stamp: "2026-11-01" }, "14": { steps: [1, 2, 3, 4, 5, 6], stamp: "2026-11-07" } }, goal: 1, sound: true };
  const r = readiness("2026-11-07");
  expect(r.left).toBe(11);
  expect(r.date && r.date > "2026-11-07").toBe(true);
});
test("readiness without any passed module has no date", () => {
  expect(readiness("2026-11-07").date).toBeNull();
});
test("badges unlock from real progress", () => {
  S.progress.days = ["2026-11-05", "2026-11-06", "2026-11-07"];
  const b = badges("2026-11-07");
  expect(b.find(x => x.id === "streak3")!.got).toBe(true);
  expect(b.find(x => x.id === "streak7")!.got).toBe(false);
});

test("weakItems: mục sai nhiều nhất trước, kèm chữ và nghĩa", () => {
  S.progress.srs = { "v13-0": { lv: 1, wr: 4 }, "v13-1": { lv: 2, wr: 1 }, "k一": { lv: 0, wr: 6 }, "v13-2": { lv: 3, wr: 0 } };
  const w = weakItems(5);
  expect(w.map(x => x.id)).toEqual(["k一", "v13-0", "v13-1"]);
  expect(w[0].jp).toBe("一");
  expect(w[1].jp).toBe("あそびます");
  expect(w[1].vi).toBe("chơi");
});
test("lessonCoverage: % từ đã thuộc theo từng bài", () => {
  S.progress.srs = { "v1-0": { lv: 3 }, "v1-1": { lv: 3 }, "v1-2": { lv: 2 } };
  const c = lessonCoverage();
  expect(c).toHaveLength(25);
  expect(c[0].n).toBe(1);
  expect(c[0].done).toBe(2);
  expect(c[0].seen).toBe(3);
  expect(c[1].done).toBe(0);
});
