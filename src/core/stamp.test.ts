import { stampSVG } from "./stamp";

test("stamp shows station code, name and motif", () => {
  const s = stampSVG(13);
  expect(s).toContain("N13");
  expect(s).toContain("伊勢");
  expect(s).toContain("🍚");
});
test("odd and even stations use different ink", () => {
  expect(stampSVG(1)).toContain("#00A0A0");
  expect(stampSVG(2)).toContain("#1C3F7A");
});
test("stamp ids are unique per station so filters do not clash", () => {
  expect(stampSVG(3)).not.toEqual(stampSVG(3).replace(/st3-/g, "st4-"));
});
