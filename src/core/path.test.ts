import { S, mergeProgress } from "./store";
import { peekPath, currentStation, getPart, markStepDone, mergePath, nextStep, setPart, stampStation, stationStatus } from "./path";

beforeEach(() => { S.progress = { upto: 13, days: [], counts: {}, drills: {} }; });

test("new learner starts at upto", () => {
  expect(currentStation()).toBe(13);
  expect(stationStatus(5)).toBe("passed");
  expect(stationStatus(13)).toBe("current");
  expect(stationStatus(14)).toBe("locked");
});
test("steps unlock in order", () => {
  expect(nextStep(13)).toBe(1);
  markStepDone(13, 1);
  expect(nextStep(13)).toBe(2);
});
test("resumes part after reload", () => {
  setPart(13, 2, 3);
  S.progress = JSON.parse(JSON.stringify(S.progress));
  expect(getPart(13, 2)).toBe(3);
});
test("stamp at 70% moves current and raises upto", () => {
  expect(stampStation(13, 0.69)).toBe(false);
  expect(stampStation(13, 0.7)).toBe(true);
  expect(currentStation()).toBe(14);
  expect(S.progress.upto).toBe(14);
  expect(stationStatus(13)).toBe("stamped");
});
test("skip ahead by passing a later checkpoint", () => {
  stampStation(16, 0.8);
  expect(stationStatus(14)).toBe("passed");
  expect(currentStation()).toBe(17);
});
test("mergePath unions steps and keeps earliest stamp", () => {
  const a = { start: 13, st: { "13": { steps: [1, 2], stamp: "2026-11-07" } }, goal: 1, sound: true };
  const b = { start: 13, st: { "13": { steps: [3], stamp: "2026-11-06" }, "14": { steps: [1] } }, goal: 2, sound: true };
  const m = mergePath(a, b);
  expect([...m.st["13"].steps].sort()).toEqual([1, 2, 3]);
  expect(m.st["13"].stamp).toBe("2026-11-06");
  expect(m.st["14"].steps).toEqual([1]);
});
test("mergeProgress keeps journey progress from both devices", () => {
  const P = mergeProgress({ path: { start: 13, st: { "13": { steps: [1] } }, goal: 1, sound: true } }, { path: { start: 13, st: { "14": { steps: [2] } }, goal: 1, sound: true } });
  expect(P.path.st["13"].steps).toEqual([1]);
  expect(P.path.st["14"].steps).toEqual([2]);
});
test("same-day journey rounds from two devices keep the larger count", () => {
  const P = mergeProgress({ daily: { d: "2026-11-06", gram: 0, pt: 0, ex: 0, path: 1 } }, { daily: { d: "2026-11-06", gram: 0, pt: 0, ex: 0, path: 3 } });
  expect(P.daily.path).toBe(3);
});
test("a device that only read the path does not override the learner's start", () => {
  const m = mergePath({ start: 13, st: {}, goal: 1, sound: true }, { start: 5, st: { "5": { steps: [1], stamp: "2026-11-01" } }, goal: 1, sound: true, t: 100 });
  expect(m.start).toBe(5);
});
test("peeking at the path does not create one", () => {
  expect(peekPath().start).toBe(13);
  expect(S.progress.path).toBeUndefined();
});
