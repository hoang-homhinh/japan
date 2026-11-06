import { strokeSVG, hasStrokes } from "./strokes";

test("行 has 6 strokes in order", () => {
  const s = strokeSVG("行");
  expect((s.match(/class="stk"/g) || []).length).toBe(6);
  expect(s).toContain("--i:0");
  expect(s).toContain("--i:5");
});
test("unknown char gives empty string", () => {
  expect(hasStrokes("𠀋")).toBe(false);
  expect(strokeSVG("𠀋")).toBe("");
});
