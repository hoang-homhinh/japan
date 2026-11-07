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

test("bài 13: mọi từ có câu ví dụ + mẹo nhớ, và nằm đúng một lô (tối đa 6 từ)", () => {
  const P = PLUS[13], kana = VFLAT[li].map((w: any) => w[0]);
  for (const k of kana) { expect(P.words[k]?.ex?.[0], k).toBeTruthy(); expect(P.words[k]?.tip, k).toBeTruthy(); }
  const flat = P.lots.flat();
  expect([...flat].sort()).toEqual([...kana].sort());
  for (const lot of P.lots) expect(lot.length).toBeLessThanOrEqual(6);
});
test("bài 13: câu hỏi ý chính có đáp án, câu 'dùng ngay' tồn tại, câu về mình gắn đúng mẫu", () => {
  const P = PLUS[13], D = DIALOGUES.find((d: any) => d.id === "13a");
  for (const g of P.gist) expect(g.opts[g.a]).toBeDefined();
  for (const i of P.keep) expect(D.lines[i]).toBeDefined();
  const ids = LESSONS.find((l: any) => l.n === 13).patterns.map((p: any) => p.id);
  for (const id of Object.keys(P.mine)) expect(ids).toContain(id);
});
test("typeAnswers bỏ ～, ？ và phần trong [ ]", () => {
  expect(typeAnswers("[しょうしょう] おまち ください")).toEqual(["おまち ください", "しょうしょう おまち ください"]);
  expect(typeAnswers("～ごろ")).toEqual(["ごろ"]);
  expect(typeAnswers("ごちゅうもんは？")).toEqual(["ごちゅうもんは"]);
});

test("bước 1 (bài có nội dung mới): nghe không chữ → câu ý chính → hội thoại → câu dùng ngay", () => {
  const kinds = buildStep(13, 1, rnd).qs.map(q => q.kind);
  expect(kinds[0]).toBe("dialogue-blind");
  expect(kinds.slice(1, 4)).toEqual(["mcq", "mcq", "mcq"]);
  expect(kinds.slice(4)).toEqual(["dialogue", "phrases"]);
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
  expect(buildStep(12, 1).qs).toEqual([{ kind: "dialogue", id: "12a" }]);
  expect(buildStep(12, 2, rnd).qs.some(q => q.kind === "match")).toBe(true);
});
