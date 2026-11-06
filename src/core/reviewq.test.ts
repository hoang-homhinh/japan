import { S } from "./store";
import { buildReview } from "./reviewq";
import { gradeTrack } from "./grade";
import { dayStr } from "./util";
import { VFLAT, vid } from "./srs";

const T = "2026-11-06";
let seeded = new Set<string>();
function seedDue(k: number) {
  const srs: any = {}; seeded = new Set();
  for (let i = 0; i < k; i++) { const li = Math.floor(i / VFLAT[0].length), id = vid(li, i % VFLAT[0].length); srs[id] = { lv: 3, box: 2, next: "2026-11-01", t: 1 }; seeded.add(id); }
  S.progress.srs = srs;
}
const isDueQ = (q: any) => seeded.has(q.track?.id);
beforeEach(() => { S.progress = { upto: 13, days: [], counts: {}, drills: {} }; });

test("review caps at 15", () => { seedDue(40); expect(buildReview(T)).toHaveLength(15); });
test("due items come before old backlog", () => {
  seedDue(3); S.progress.path = { start: 13, st: {}, goal: 1, sound: true };
  const qs = buildReview(T);
  expect(qs.slice(0, 3).every(isDueQ)).toBe(true);
  expect(qs.length).toBe(13);
});
test("old backlog at most 10 per day", () => {
  seedDue(0); S.progress.path = { start: 13, st: {}, goal: 1, sound: true };
  expect(buildReview(T)).toHaveLength(10);
  expect(buildReview(T)).toHaveLength(0);
});
test("no backlog for a learner starting at station 1", () => {
  seedDue(0); S.progress.path = { start: 1, st: {}, goal: 1, sound: true };
  expect(buildReview(T)).toHaveLength(0);
});
test("gradeTrack srs wrong resets to due today", () => {
  gradeTrack({ type: "srs", id: "v13-0" }, false);
  expect(S.progress.srs["v13-0"].next).toBe(dayStr());
});
test("gradeTrack pt right schedules later", () => {
  gradeTrack({ type: "pt", id: "p001" }, true);
  expect(S.progress.pt.p001.c).toBe(1);
  expect(S.progress.pt.p001.next > dayStr()).toBe(true);
});
test("peeking at the review does not use up the daily backlog", () => {
  seedDue(0); S.progress.path = { start: 13, st: {}, goal: 1, sound: true };
  expect(buildReview(T, 15, 10, false)).toHaveLength(10);
  expect(buildReview(T)).toHaveLength(10);
});
