import { adviceStep, isGradable } from "./q";

test("intro and dialogue cards are not graded", () => {
  expect(isGradable({ kind: "word-intro", vid: "v1-0", w: [] })).toBe(false);
  expect(isGradable({ kind: "dialogue", id: "1a" })).toBe(false);
  expect(isGradable({ kind: "particle", drill: "p001" })).toBe(true);
});
test("checkpoint advice points to the step that teaches the missed item", () => {
  expect(adviceStep({ kind: "mcq", prompt: "", opts: [], a: 0, track: { type: "srs", id: "k行" } })).toBe(5);
  expect(adviceStep({ kind: "mcq", prompt: "", opts: [], a: 0, track: { type: "srs", id: "v13-1" } })).toBe(2);
  expect(adviceStep({ kind: "exam", id: "c001" }, "ch_kadai")).toBe(1);
  expect(adviceStep({ kind: "exam", id: "b001" }, "bun_form")).toBe(3);
  expect(adviceStep({ kind: "particle", drill: "p1" })).toBe(4);
});
