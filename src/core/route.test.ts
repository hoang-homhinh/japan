import { assignKanji, STATIONS } from "./route";
import { VOCAB, KANJI } from "../content/data";

const all: string[] = KANJI.flatMap((c: any) => c.groups.flatMap((g: any) => g.kanji.map((k: any) => k.k)));

test("25 stations coded N01..N25", () => {
  expect(STATIONS).toHaveLength(25);
  expect(STATIONS[12].code).toBe("N13");
  expect(STATIONS[0].name).toBe("東京");
});
test("every kanji assigned exactly once", () => {
  const flat = Object.values(assignKanji(VOCAB, all)).flat();
  expect([...flat].sort()).toEqual([...all].sort());
});
test("each station holds at most 5 kanji", () => {
  const m = assignKanji(VOCAB, all);
  for (const n in m) expect(m[n].length).toBeLessThanOrEqual(5);
});
test("kanji never earlier than its first vocab lesson", () => {
  const m = assignKanji(VOCAB, all);
  const at = Number(Object.entries(m).find(([, ks]) => ks.includes("泳"))![0]);
  expect(at).toBeGreaterThanOrEqual(13);
});
test("STATIONS kanji equals assignKanji output", () => {
  const m = assignKanji(VOCAB, all);
  expect(STATIONS[0].kanji).toEqual(m[1] || []);
});
test("each station holds at least 3 kanji", () => {
  const m = assignKanji(VOCAB, all);
  for (let n = 1; n <= 25; n++) expect(m[n].length, "N" + n).toBeGreaterThanOrEqual(3);
});
