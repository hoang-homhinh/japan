import { PLUS, typeAnswers } from "../content/enrich";
import { DIALOGUES } from "../content/dialogues";
import { LESSONS } from "../content/lessons";
import { VOCAB } from "../content/data";
import { buildStep } from "./steps";
import { S } from "./store";
import { VFLAT, vid } from "./srs";

const rnd = () => 0.42;
beforeEach(() => { S.progress = { upto: 13, days: [], counts: {}, drills: {} }; });
const li = VOCAB.findIndex((L: any) => L.n === 13);

const done = Object.keys(PLUS).map(Number).sort((a, b) => a - b);
test("cả 25 bài đều có nội dung kiểu mới", () => {
  expect(done).toEqual(Array.from({ length: 25 }, (_, i) => i + 1));
});
describe.each(done)("bài %i", n => {
  const P = PLUS[n], L = VOCAB.findIndex((x: any) => x.n === n), kana = VFLAT[L].map((w: any) => w[0]);
  test("mọi từ có câu ví dụ + mẹo nhớ, nằm đúng một lô (4–6 từ, lô cuối ≥2)", () => {
    for (const k of kana) {
      expect(P.words[k]?.ex?.[0]?.trim(), k).toBeTruthy(); expect(P.words[k]?.ex?.[1]?.trim(), k).toBeTruthy(); expect(P.words[k]?.tip?.trim(), k).toBeTruthy();
    }
    for (const k of Object.keys(P.words)) expect(kana, "thừa: " + k).toContain(k);
    expect([...P.lots.flat()].sort()).toEqual([...kana].sort());
    P.lots.forEach((lot, i) => { expect(lot.length, "lô " + i).toBeLessThanOrEqual(6); expect(lot.length, "lô " + i).toBeGreaterThanOrEqual(i === P.lots.length - 1 ? 2 : 4); });
  });
  test("câu hỏi ý chính, câu dùng ngay, câu về mình", () => {
    const D = DIALOGUES.find((d: any) => d.id === `${n}a`);
    expect(P.gist.length).toBeGreaterThanOrEqual(2);
    for (const g of P.gist) { expect(g.opts.length).toBe(4); expect(new Set(g.opts).size).toBe(4); expect(g.opts[g.a]).toBeDefined(); }
    expect(P.keep.length).toBeGreaterThanOrEqual(2); expect(P.keep.length).toBeLessThanOrEqual(4);
    for (const i of P.keep) expect(D.lines[i], "keep " + i).toBeDefined();
    const ids = LESSONS.find((l: any) => l.n === n).patterns.map((p: any) => p.id);
    expect(Object.keys(P.mine).length).toBeGreaterThanOrEqual(Math.min(3, ids.length));
    for (const [id, ss] of Object.entries(P.mine)) {
      expect(ids).toContain(id);
      for (const [jp, vi] of ss) { expect(jp.replace(/[。？！]$/, "").split(/[ 　]+/).filter(Boolean).length, jp).toBeGreaterThanOrEqual(3); expect(vi.trim()).toBeTruthy(); }
    }
  });
});
test("typeAnswers bỏ ～, ？ và phần trong [ ]", () => {
  expect(typeAnswers("[しょうしょう] おまち ください")).toEqual(["おまち ください", "しょうしょう おまち ください"]);
  expect(typeAnswers("～ごろ")).toEqual(["ごろ"]);
  expect(typeAnswers("ごちゅうもんは？")).toEqual(["ごちゅうもんは"]);
});
test("typeAnswers nhận từng cách viết khi có ／, （ ）, ［ ］, …", () => {
  expect(typeAnswers("おっと／しゅじん")).toEqual(expect.arrayContaining(["おっと", "しゅじん"]));
  expect(typeAnswers("～ふん / ～ぷん")).toEqual(expect.arrayContaining(["ふん", "ぷん"]));
  expect(typeAnswers("いい（よい）")).toEqual(expect.arrayContaining(["いい", "よい"]));
  expect(typeAnswers("こうくうびん（エアメール）")).toEqual(expect.arrayContaining(["こうくうびん", "エアメール"]));
  expect(typeAnswers("[～は] ちょっと…")).toContain("ちょっと");
  expect(typeAnswers("［いいえ、］まだまだです")).toEqual(expect.arrayContaining(["まだまだです", "いいえ、まだまだです"]));
  for (const a of typeAnswers("おじいさん／おじいちゃん")) expect(a).not.toMatch(/[／（）\[\]［］…～]/);
});

test("bước 1 (bài có nội dung mới): nghe không chữ → câu ý chính → hội thoại → câu dùng ngay", () => {
  const kinds = buildStep(13, 1, rnd).qs.map(q => q.kind);
  expect(kinds[0]).toBe("dialogue-blind");
  expect(kinds.slice(1, 4)).toEqual(["mcq", "mcq", "mcq"]);
  expect(kinds.slice(4)).toEqual(["dialogue", "phrases"]);
});
test("bước 1: đáp án đúng của câu ý chính không luôn ở ô đầu", () => {
  const qs = buildStep(13, 1, () => 0.1).qs.filter(q => q.kind === "mcq") as any[];
  expect(qs.some(q => q.a !== 0)).toBe(true);
  for (const [i, q] of qs.entries()) expect(q.opts[q.a]).toBe(PLUS[13].gist[i].opts[PLUS[13].gist[i].a]);
});
test("bước 1 không có giọng đọc: bỏ phần nghe không chữ", () => {
  expect(buildStep(13, 1, rnd, { listen: false }).qs.map(q => q.kind)).toEqual(["dialogue", "phrases"]);
});
test("bước 2: lô 5 từ, mỗi từ có thẻ, nghe, chọn nghĩa và tự gõ lại", () => {
  const r = buildStep(13, 2, rnd), qs = r.qs as any[];
  expect(r.partTotal).toBe(6);
  const intro = qs.filter(q => q.kind === "word-intro");
  expect(intro.map(q => q.w[0])).toEqual(PLUS[13].lots[0]);
  expect(intro[0].plus.tip).toBe(PLUS[13].words["おなかが すきます"].tip);
  expect(qs.filter(q => q.kind === "listen").length).toBe(5);
  expect(qs.filter(q => q.kind === "mcq").length).toBe(5);
  const ty = qs.filter(q => q.kind === "type");
  expect(ty.length).toBe(5);
  expect(ty[0].track.id).toMatch(/^v13-/);
  // gõ lại đứng sau cùng (nhớ lại sau khi đã qua chọn)
  expect(qs.findIndex(q => q.kind === "type")).toBeGreaterThan(qs.map(q => q.kind).lastIndexOf("mcq"));
});
test("bước 2: lô sau mở khi lô đầu đã học", () => {
  const P = PLUS[13];
  S.progress.srs = Object.fromEntries(P.lots[0].map(k => [vid(li, VFLAT[li].findIndex((w: any) => w[0] === k)), { lv: 1 }]));
  const r = buildStep(13, 2, rnd);
  expect(r.partTotal).toBe(5);
  expect((r.qs as any[]).filter(q => q.kind === "word-intro").map(q => q.w[0])).toEqual(P.lots[1]);
});
test("bước 3: có câu ghép về chính mình", () => {
  const all = [0, 1, 2].flatMap(p => { S.progress.path = { st: { 13: { part: { 3: p } } } }; return buildStep(13, 3, rnd).qs as any[]; });
  const built = all.filter(q => q.kind === "build").map(q => q.answer.join(" "));
  for (const [jp] of Object.values(PLUS[13].mine).flat()) expect(built, jp).toContain(jp.replace(/。$/, ""));
});
test("bài chưa có nội dung mới giữ cách cũ", () => {
  const p = PLUS[12]; delete PLUS[12];
  try {
    expect(buildStep(12, 1).qs).toEqual([{ kind: "dialogue", id: "12a" }]);
    expect(buildStep(12, 2, rnd).qs.some(q => q.kind === "match")).toBe(true);
  } finally { if (p) PLUS[12] = p; }
});
