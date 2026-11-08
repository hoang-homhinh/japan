import { buildReview } from "./reviewq";
import { buildStep } from "./steps";
import { S, mergeProgress } from "./store";
import { STATIONS } from "./route";
import { kid } from "./srs";
import { isPinned, pinnedIds, togglePin, buildPinned } from "./pins";
import { phraseOfDay } from "./phrase";
import { clearRun, loadRun, saveRun } from "./resume";
import { DIALOGUES } from "../content/dialogues";
import { PLUS } from "../content/enrich";

const rnd = () => 0.42;
beforeEach(() => { S.progress = { upto: 13, days: [], counts: {}, drills: {}, srs: {} }; });

describe("ôn tập bắt tự nhớ lại", () => {
  test("từ đã lên bậc 2 trở lên thì ôn bằng gõ lại (type)", () => {
    S.progress.srs = { "v13-0": { lv: 2, next: "2000-01-01" } };
    const qs = buildReview("2026-11-07", 15, 0, false) as any[];
    expect(qs[0].kind).toBe("type");
    expect(qs[0].answers).toContain("あそびます");
    expect(qs[0].track.id).toBe("v13-0");
  });
  test("từ mới chập chững (bậc 0–1) vẫn ôn bằng chọn đáp án", () => {
    S.progress.srs = { "v13-0": { lv: 1, next: "2000-01-01" } };
    const qs = buildReview("2026-11-07", 15, 0, false) as any[];
    expect(["mcq", "listen"]).toContain(qs[0].kind);
  });
});

describe("bước Kanji bỏ chữ đã thuộc", () => {
  test("chữ đã thuộc (bậc 3) không giới thiệu lại", () => {
    const ks = STATIONS[12].kanji;
    S.progress.srs = { [kid(ks[0])]: { lv: 3 } };
    const intro = buildStep(13, 5, rnd).qs.filter(q => q.kind === "kanji-intro").map((q: any) => q.ch);
    expect(intro).toEqual(ks.slice(1));
  });
  test("thuộc hết thì ôn lại tất cả (không để bước trống)", () => {
    const ks = STATIONS[12].kanji;
    S.progress.srs = Object.fromEntries(ks.map(k => [kid(k), { lv: 3 }]));
    expect(buildStep(13, 5, rnd).qs.filter(q => q.kind === "kanji-intro").length).toBe(ks.length);
  });
});

describe("ghim mục khó", () => {
  test("bật / tắt ghim", () => {
    expect(isPinned("v13-0")).toBe(false);
    togglePin("v13-0"); expect(isPinned("v13-0")).toBe(true); expect(pinnedIds()).toEqual(["v13-0"]);
    togglePin("v13-0"); expect(isPinned("v13-0")).toBe(false); expect(pinnedIds()).toEqual([]);
  });
  test("gộp giữa 2 máy: thao tác mới hơn thắng (kể cả bỏ ghim)", () => {
    const a = { pins: { "v1-0": { on: true, t: 10 }, "v1-1": { on: false, t: 30 } } };
    const b = { pins: { "v1-0": { on: false, t: 20 }, "v1-1": { on: true, t: 5 }, "k一": { on: true, t: 1 } } };
    const m = mergeProgress(a, b);
    expect(m.pins["v1-0"].on).toBe(false);
    expect(m.pins["v1-1"].on).toBe(false);
    expect(m.pins["k一"].on).toBe(true);
  });
  test("gói ôn mục đã ghim: từ → chọn nghĩa + gõ lại; kanji → cách đọc", () => {
    togglePin("v13-0"); togglePin(kid(STATIONS[12].kanji[0]));
    const kinds = buildPinned().map(q => q.kind);
    expect(kinds.filter(k => k === "type").length).toBe(1);
    expect(kinds.filter(k => k === "mcq").length).toBe(2);
  });
});

describe("câu của ngày", () => {
  test("lấy từ các câu 'dùng ngay' của bài, cố định trong một ngày", () => {
    const a = phraseOfDay(13, "2026-11-07"), b = phraseOfDay(13, "2026-11-07");
    expect(a).toEqual(b);
    const D = DIALOGUES.find((d: any) => d.id === "13a");
    expect(PLUS[13].keep.map(i => D.lines[i].kana)).toContain(a!.kana);
  });
  test("đổi theo ngày", () => {
    const seen = new Set(["2026-11-07", "2026-11-08", "2026-11-09"].map(d => phraseOfDay(13, d)!.kana));
    expect(seen.size).toBeGreaterThan(1);
  });
});

describe("học tiếp lượt dở", () => {
  const mem: Record<string, string> = {};
  beforeAll(() => { (globalThis as any).localStorage = { getItem: (k: string) => mem[k] ?? null, setItem: (k: string, v: string) => { mem[k] = v; }, removeItem: (k: string) => { delete mem[k]; } }; });
  afterAll(() => { delete (globalThis as any).localStorage; });
  test("lưu rồi đọc lại đúng lượt, cùng ngày", () => {
    saveRun({ n: 13, step: 2, part: 0, pos: 4, items: Array.from({ length: 6 }, () => ({ q: { kind: "dialogue", id: "13a" } })) } as any, "2026-11-07");
    expect(loadRun(13, 2, "2026-11-07")?.pos).toBe(4);
    expect(loadRun(13, 3, "2026-11-07")).toBeNull();
  });
  test("sang ngày khác hoặc đã xoá thì không học tiếp", () => {
    expect(loadRun(13, 2, "2026-11-08")).toBeNull();
    clearRun(); expect(loadRun(13, 2, "2026-11-07")).toBeNull();
  });
});
