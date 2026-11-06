# Hành trình N5 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thay khung app (10 màn hình rời) bằng một lộ trình 25 ga, mỗi ga 6 bước ngắn, kèm ôn tập tự động, sổ con dấu và giao diện biển ga tàu Nhật có chiều sâu 3D.

**Architecture:** Logic thuần (route, path, steps, reviewq) nằm trong `src/core/` và có test Vitest; chúng tạo ra danh sách câu hỏi kiểu `Q` từ dữ liệu sẵn có trong `src/content/`. Ba màn mới (journey, station, player) + review + library thay màn "Hôm nay"; các view cũ giữ nguyên, vào qua Thư viện. Tiến độ mới nằm ở `S.progress.path`, gộp giữa các máy qua `mergeProgress`.

**Tech Stack:** Vite 8, TypeScript 7 (vanilla DOM, template string), vite-plugin-pwa, Supabase (đã có), Vitest 5 (mới), Web Audio, CSS 3D transforms + SVG. Dữ liệu nét chữ: KanjiVG (CC BY-SA 3.0).

**Spec:** `docs/superpowers/specs/2026-11-06-hanh-trinh-n5-design.md`

## Global Constraints
- Không AI, không nhận giọng nói, không email (phần sau).
- Không đổi khoá/ý nghĩa `srs` (`v<bài>-<i>`, `k<chữ>`), `pt`, `ex`, `sentences`, `days`, `counts`; chỉ thêm `S.progress.path`. Khoá localStorage giữ tiền tố `datcau_v1`.
- 25 ga = 25 bài Minna; mỗi ga 6 bước: 1 Nghe chuyện ở ga · 2 Từ mới · 3 Mẫu câu · 4 Trợ từ trong câu · 5 Kanji của ga · 6 Kiểm tra qua ga.
- Qua ga khi Kiểm tra ≥ 70%. Kiểm tra 10–12 câu. Gói ôn tối đa 15 câu. Mục cũ đưa vào ôn ~10/ngày.
- Mỗi ga 3–5 kanji; đủ 95 chữ, mỗi chữ đúng một ga.
- Gõ kana/romaji chỉ là tuỳ chọn; cách trả lời chính là chạm/chọn.
- Màu: mực `#1C2230`, nền sân ga `#EEF2F5`, tuyến N5 `#00A0A0`, Shinkansen `#1659C7`, vàng `#F2B300`, đỏ tín hiệu `#D7263D` (chỉ cho sai/lỗi); tối: nền `#121826`. Chữ: Be Vietnam Pro (Việt), Zen Kaku Gothic New (Nhật), Klee One (thẻ kanji).
- Điều hướng còn 3 mục: Hành trình · Ôn tập · Thư viện (+ ⚙). Màn "Hôm nay" cũ và `planNewLots`/`kanjiUnlocked` không còn được dùng.
- `upto` = max(ga hiện tại, `upto` cũ) qua `setSetting` mỗi khi đóng dấu hoặc chọn bài bắt đầu.
- Chuyển động chỉ khi người dùng thao tác + 1 khoảnh khắc mở màn; tôn trọng `prefers-reduced-motion`; mượt ở 360px; không thư viện 3D.
- Nhạc báo tàu tự soạn (Web Audio), có tắt âm (`path.sound`).

## Review Focus
- Người học bỏ dở giữa bước (đóng app ở câu 5/10) → mở lại vào đúng phần/bước, không mất phần đã làm (Task 3: test `resumes part after reload`).
- Hai máy cùng học các ga khác nhau → gộp không mất bước/dấu nào (Task 3: test `mergePath unions steps and keeps earliest stamp`).
- Bài có ít câu trợ từ/đề thi đúng bài (vd Bài 1, 2) → bước 4/6 vẫn đủ câu nhờ lấy bài trước (Task 4: test `particle step falls back to earlier lessons`).
- Ga mà mọi từ đã thuộc (srs bậc 3) → bước 2 tự hoàn thành, không treo (Task 4: test `vocab step done when all words known`).
- Không có giọng Nhật / không có Web Audio → app vẫn chạy, chỉ thiếu âm (Task 9: CDP check với `speechSynthesis` bị xoá).

---

### Task 1: Vitest + bản đồ 25 ga và chia kanji

**Files:**
- Modify: `package.json` (thêm `vitest@^5.1.0` devDependency, script `"test": "vitest run"`)
- Create: `vitest.config.ts` (môi trường `node`, include `src/**/*.test.ts`)
- Create: `src/core/route.ts`
- Test: `src/core/route.test.ts`

**Interfaces:**
- Produces:
  - `type Station = { n: number; code: string; name: string; kana: string; motif: string; kanji: string[] }` — `code` = `"N01"…"N25"`.
  - `STATIONS: Station[]` (25 phần tử, `n` = 1…25)
  - `assignKanji(vocab: any[], kanjiChars: string[], cap = 5, min = 3): Record<number, string[]>` (hàm thuần)
  - `stationOf(n: number): Station`

Tên ga (theo thứ tự n=1…25): 東京 とうきょう, 上野 うえの, 浅草 あさくさ, 新宿 しんじゅく, 渋谷 しぶや, 横浜 よこはま, 鎌倉 かまくら, 箱根 はこね, 富士 ふじ, 静岡 しずおか, 浜松 はままつ, 名古屋 なごや, 伊勢 いせ, 奈良 なら, 京都 きょうと, 大阪 おおさか, 神戸 こうべ, 姫路 ひめじ, 岡山 おかやま, 倉敷 くらしき, 広島 ひろしま, 宮島 みやじま, 下関 しものせき, 福岡 ふくおか, 長崎 ながさき. `motif` = 1 emoji hợp chủ đề bài (người làm chọn, vd Bài 13 `🍚`).

Thuật toán `assignKanji`: (1) mỗi chữ gán vào bài nhỏ nhất có từ vựng (`w[1]`) chứa chữ đó; (2) duyệt ga 1→25, ga nào > `cap` thì đẩy các chữ thừa (giữ chữ có thứ tự chương sớm hơn ở lại) sang ga kế; (3) các chữ không có trong từ vựng, theo thứ tự chương kanji, lần lượt điền vào ga có số chữ < `min` nhỏ nhất (ga sớm trước); còn dư thì điền vào ga < `cap` sớm nhất.

- [ ] **Step 1: Cài vitest, viết test thất bại**

```ts
import { assignKanji, STATIONS } from "./route";
import { VOCAB, KANJI } from "../content/data";
const all = KANJI.flatMap((c: any) => c.groups.flatMap((g: any) => g.kanji.map((k: any) => k.k)));
test("25 stations coded N01..N25", () => { expect(STATIONS).toHaveLength(25); expect(STATIONS[12].code).toBe("N13"); expect(STATIONS[0].name).toBe("東京"); });
test("every kanji assigned exactly once", () => { const m = assignKanji(VOCAB, all); const flat = Object.values(m).flat(); expect(flat.sort()).toEqual([...all].sort()); });
test("each station holds at most 5 kanji", () => { const m = assignKanji(VOCAB, all); for (const n in m) expect(m[n].length).toBeLessThanOrEqual(5); });
test("kanji never earlier than its first vocab lesson", () => { const m = assignKanji(VOCAB, all); expect(Object.entries(m).find(([, ks]) => ks.includes("泳"))![0]).not.toBe("1"); });
test("STATIONS kanji equals assignKanji output", () => { const m = assignKanji(VOCAB, all); expect(STATIONS[0].kanji).toEqual(m[1] || []); });
```

- [ ] **Step 2: Chạy** `npx vitest run src/core/route.test.ts` → FAIL (chưa có module)
- [ ] **Step 3: Viết `src/core/route.ts`** theo Interfaces + thuật toán trên.
- [ ] **Step 4: Chạy lại** → 5 PASS; `npm run build` sạch.
- [ ] **Step 5: Commit** `feat: route of 25 stations with balanced kanji`

---

### Task 2: Dữ liệu nét KanjiVG + hoạt hình thứ tự nét

**Files:**
- Create: `scripts/fetch-strokes.mjs` (tải `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/<mã 5 hex>.svg` cho 95 chữ trong `src/content/generated/kanji.json`, lấy các `path@d` theo thứ tự, ghi `src/content/strokes.json` = `{ "<chữ>": ["M…", …] }`; chờ 300ms giữa các lần tải; chữ tải lỗi thì bỏ qua và in ra)
- Create: `src/core/strokes.ts`
- Test: `src/core/strokes.test.ts`
- Modify: `package.json` script `"strokes": "node scripts/fetch-strokes.mjs"`

**Interfaces:**
- Produces: `strokeSVG(ch: string, size = 160): string` — SVG `viewBox="0 0 109 109"`, mỗi nét là `<path class="stk" style="--i:<thứ tự>" d=…>` + số thứ tự nét nhỏ; rỗng `""` nếu không có dữ liệu. `hasStrokes(ch: string): boolean`. CSS hoạt hình (Task 6) dùng `stroke-dasharray` + `animation-delay: calc(var(--i) * .45s)`.

- [ ] **Step 1: Chạy** `npm run strokes` → in số chữ tải được; kỳ vọng ≥ 90/95. Ghi nguồn "KanjiVG © Ulrich Apel, CC BY-SA 3.0" vào `README.md`.
- [ ] **Step 2: Viết test thất bại**

```ts
import { strokeSVG, hasStrokes } from "./strokes";
test("行 has 6 strokes in order", () => { const s = strokeSVG("行"); expect((s.match(/class="stk"/g) || []).length).toBe(6); expect(s).toContain("--i:0"); expect(s).toContain("--i:5"); });
test("unknown char gives empty string", () => { expect(hasStrokes("𠀋")).toBe(false); expect(strokeSVG("𠀋")).toBe(""); });
```
- [ ] **Step 3: Chạy** → FAIL; **Step 4:** viết `strokes.ts`; **Step 5:** chạy → PASS
- [ ] **Step 6: Commit** `feat: KanjiVG stroke order data and renderer`

---

### Task 3: Trạng thái hành trình (`core/path.ts`) + gộp giữa các máy

**Files:**
- Create: `src/core/path.ts`
- Modify: `src/core/store.ts` (`mergeProgress` gọi `mergePath`)
- Test: `src/core/path.test.ts`

**Interfaces:**
- Consumes: `S`, `saveProgress`, `setSetting` (store); `STATIONS` (Task 1); `dayStr` (util).
- Produces:
  - `type StepNo = 1|2|3|4|5|6`; `type StationStatus = "locked"|"open"|"current"|"passed"|"stamped"`
  - `type PathState = { start: number; st: Record<string,{ steps: number[]; part?: Record<string,number>; stamp?: string; best?: number }>; goal: number; sound: boolean; oldFed?: Record<string,number> }`
  - `pathState(): PathState` (tạo mặc định `{start: S.progress.upto||13, st:{}, goal:1, sound:true}` nếu chưa có)
  - `currentStation(): number` — ga nhỏ nhất ≥ `start` chưa đóng dấu (25 nếu hết)
  - `stationStatus(n): StationStatus` — `< start` và chưa dấu → `"passed"`; có `stamp` → `"stamped"`; `=== currentStation()` → `"current"`; ga ngay sau các ga đã dấu/passed → `"open"`; còn lại `"locked"` (vẫn có thể "Kiểm tra vượt ga").
  - `nextStep(n): StepNo` — bước nhỏ nhất chưa có trong `steps` (bước k mở khi k-1 xong).
  - `getPart(n, step): number`, `setPart(n, step, v)`; `markStepDone(n, step)` (xoá `part[step]`).
  - `stampStation(n, score)` — đặt `stamp=dayStr()` nếu `score ≥ 0.7`, `best=max`, rồi `setSetting("upto", Math.max(n+1>25?25:n+1, S.progress.upto||0))`; trả về `boolean` đã đạt.
  - `setStart(n)` — đặt `start`, `setSetting("upto", max(n, upto))`.
  - `mergePath(a, b): PathState` — `steps` hợp; `part` lấy max; `stamp` lấy ngày sớm hơn; `best` max; `start` lấy max; `goal`/`sound` lấy của bên có `t` lớn hơn (thêm trường `t` khi đổi).

- [ ] **Step 1: Viết test thất bại**

```ts
beforeEach(() => { S.progress = { upto: 13 }; });
test("new learner starts at upto", () => { expect(currentStation()).toBe(13); expect(stationStatus(5)).toBe("passed"); expect(stationStatus(13)).toBe("current"); expect(stationStatus(14)).toBe("locked"); });
test("steps unlock in order", () => { expect(nextStep(13)).toBe(1); markStepDone(13, 1); expect(nextStep(13)).toBe(2); });
test("resumes part after reload", () => { setPart(13, 2, 3); const saved = JSON.parse(JSON.stringify(S.progress)); S.progress = saved; expect(getPart(13, 2)).toBe(3); });
test("stamp at 70% moves current and raises upto", () => { expect(stampStation(13, 0.69)).toBe(false); expect(stampStation(13, 0.7)).toBe(true); expect(currentStation()).toBe(14); expect(S.progress.upto).toBe(14); });
test("skip ahead by passing a later checkpoint", () => { stampStation(16, 0.8); expect(stationStatus(14)).toBe("passed"); expect(currentStation()).toBe(17); });
test("mergePath unions steps and keeps earliest stamp", () => { const a = { start: 13, st: { "13": { steps: [1, 2], stamp: "2026-11-07" } }, goal: 1, sound: true }; const b = { start: 13, st: { "13": { steps: [3], stamp: "2026-11-06" }, "14": { steps: [1] } }, goal: 2, sound: true }; const m = mergePath(a, b); expect(m.st["13"].steps.sort()).toEqual([1, 2, 3]); expect(m.st["13"].stamp).toBe("2026-11-06"); expect(m.st["14"].steps).toEqual([1]); });
```
Lưu ý: `stampStation(16)` phải coi 14, 15 là `"passed"` (đặt `start` không đổi nhưng `currentStation` = ga nhỏ nhất > ga dấu lớn nhất khi có ga dấu vượt; ghi rõ quy tắc này trong code).
- [ ] **Step 2: Chạy** → FAIL; **Step 3:** viết `path.ts` + nối `mergePath` vào `mergeProgress` (`P.path = mergePath(local.path, rem.path)` khi một trong hai có); **Step 4:** chạy → PASS
- [ ] **Step 5: Commit** `feat: journey state with ordered steps, stamps, skip-ahead and merge`

---

### Task 4: Tạo câu hỏi cho từng bước (`core/steps.ts`)

**Files:**
- Create: `src/core/q.ts` (kiểu câu hỏi), `src/core/steps.ts`
- Test: `src/core/steps.test.ts`

**Interfaces:**
- Consumes: `VOCAB`, `LESSONS`, `PT_DRILLS`, `DIALOGUES`, `EXAM_BANK`, `KANJI`, `VOCAB_PIC`; `srs`, `vid`, `kid`, `VFLAT`, `LOTS` (srs.ts); `STATIONS`; `getPart`; `KJ_SIM` (examgen).
- Produces (`q.ts`):
  ```ts
  type Q =
    | { kind: "dialogue"; id: string }                                   // bước 1: hiện hội thoại, nút "Đã nghe xong"
    | { kind: "word-intro"; vid: string; w: any[] }
    | { kind: "mcq"; prompt: string; jp?: string; say?: string; opts: string[]; a: number; why?: string; track?: Track }
    | { kind: "listen"; say: string; opts: string[]; a: number; track?: Track }  // nghe rồi chọn
    | { kind: "match"; pairs: [string, string, string][] }                // [trái(nghĩa), phải(kana), id]
    | { kind: "pattern-intro"; pid: string }
    | { kind: "build"; vi: string; tokens: string[]; answer: string[]; track?: Track } // tokens đã xáo, có 1–2 khối nhiễu
    | { kind: "particle"; drill: string }                                 // id PT_DRILLS
    | { kind: "kanji-intro"; ch: string }
    | { kind: "exam"; id: string };                                       // id trong EXAM_BANK / đề sinh
  type Track = { type: "srs"|"pt"|"ex"; id: string };
  ```
- Produces (`steps.ts`): `buildStep(n: number, step: StepNo, rnd = Math.random): { qs: Q[]; partTotal: number; part: number }` — trả về **một lượt** của bước (bước dài chia lượt), `partTotal` = số lượt của bước. Quy tắc:
  - B1: `[{kind:"dialogue", id:`${n}a`}]`, partTotal 1.
  - B2: lượt = 1 lô trong `LOTS[n-1]` chưa giới thiệu hết (bỏ từ srs lv≥3); mỗi từ: `word-intro` → `mcq` nghĩa (4 lựa chọn cùng bài) ; cuối lượt 1 `listen` mỗi từ + 1 `match` cả lô. Bài mà mọi từ đã thuộc → `qs=[]`, partTotal 0 (bước coi như xong).
  - B3: lượt = tối đa 2 mẫu; mỗi mẫu: `pattern-intro` → 2 `build` (từ `ex[i][0]` và `drills[j].a[0]`, tách theo dấu cách, thêm 1–2 khối nhiễu là trợ từ khác trong `["は","が","を","に","で","へ","と","も"]` không có trong câu) → 1 `mcq` điền chỗ trống (che 1 cụm).
  - B4: 8–10 `particle`: ưu tiên `l === n`, thiếu thì lấy `l < n` gần nhất.
  - B5: với mỗi chữ của ga: `kanji-intro` → `mcq` cách đọc (từ ví dụ của chữ, nhiễu bằng `kjWrongReads`) → `mcq` chọn chữ đúng (nhiễu từ `KJ_SIM`).
  - B6: 10–12 câu: 3 `mcq` nghĩa từ của bài, 2 `mcq` kanji của ga, 3 `exam` (`bun_form`/`goi_ctx` có `l === n`, thiếu lấy `build`), 2 `particle` (`l === n`), 1–2 `exam` nghe (`ch_*` có `l ≤ n`).

- [ ] **Step 1: Viết test thất bại** (dùng `rnd` cố định `() => 0.42`)

```ts
test("step 1 is the a-dialogue", () => { expect(buildStep(13, 1).qs).toEqual([{ kind: "dialogue", id: "13a" }]); });
test("vocab step part covers one lot with intro + mcq per word", () => { const r = buildStep(13, 2, rnd); expect(r.partTotal).toBeGreaterThan(1); expect(r.qs.filter(q => q.kind === "word-intro").length).toBe(r.qs.filter(q => q.kind === "mcq").length); expect(r.qs.some(q => q.kind === "match")).toBe(true); });
test("vocab step done when all words known", () => { S.progress.srs = Object.fromEntries(VFLAT[12].map((_: any, i: number) => [vid(12, i), { lv: 3 }])); expect(buildStep(13, 2).partTotal).toBe(0); });
test("build question tokens contain the answer plus distractors", () => { const b = buildStep(13, 3, rnd).qs.find(q => q.kind === "build") as any; for (const t of b.answer) expect(b.tokens).toContain(t); expect(b.tokens.length).toBeGreaterThan(b.answer.length); });
test("particle step falls back to earlier lessons", () => { const qs = buildStep(1, 4, rnd).qs; expect(qs.length).toBeGreaterThanOrEqual(8); });
test("kanji step uses the station's kanji", () => { const ks = STATIONS[12].kanji; const intro = buildStep(13, 5, rnd).qs.filter(q => q.kind === "kanji-intro").map((q: any) => q.ch); expect(intro).toEqual(ks); });
test("checkpoint has 10-12 questions", () => { const n = buildStep(13, 6, rnd).qs.length; expect(n).toBeGreaterThanOrEqual(10); expect(n).toBeLessThanOrEqual(12); });
```
- [ ] **Step 2: Chạy** → FAIL; **Step 3:** viết `q.ts`, `steps.ts`; **Step 4:** chạy → PASS
- [ ] **Step 5: Commit** `feat: question builders for the six station steps`

---

### Task 5: Chấm câu + gói ôn (`core/grade.ts`, `core/reviewq.ts`)

**Files:**
- Create: `src/core/grade.ts` (rút logic chấm srs từ `views/today.ts` `grade()` ra hàm dùng chung), `src/core/reviewq.ts`
- Modify: `src/views/today.ts` (dùng `gradeTrack` thay logic cũ — chỉ để không trùng code; view này sẽ bị gỡ khỏi điều hướng ở Task 6)
- Test: `src/core/reviewq.test.ts`

**Interfaces:**
- Produces:
  - `gradeTrack(t: Track, ok: boolean): void` — srs: như `grade()` cũ (lên bậc / về bậc, `next` theo `IV`); pt: như `ptAnswer`; ex: như `exAnswer`. Gọi `saveProgress`.
  - `introduce(id: string): void` — tạo mục srs mới (`lv:0`, `next: hôm nay`) nếu chưa có (dùng ở bước 2/5).
  - `buildReview(today = dayStr(), cap = 15, oldPerDay = 10): Q[]` — (1) mục đến hạn: srs (từ → `mcq` nghĩa/`listen`, kanji → `mcq` cách đọc), pt sai đến hạn → `particle`, ex sai đến hạn → `exam`; (2) còn chỗ thì thêm tối đa `oldPerDay - path.oldFed[today]` **mục cũ** = từ/kanji của các ga `"passed"`/`"stamped"` chưa có trong srs, theo thứ tự ga; đánh dấu đã đưa vào `path.oldFed[today]`. Tổng ≤ `cap`.

- [ ] **Step 1: Viết test thất bại**

```ts
test("review caps at 15", () => { seedDue(40); expect(buildReview("2026-11-06").length).toBe(15); });
test("due items come before old backlog", () => { seedDue(3); S.progress.path = { start: 13, st: {}, goal: 1, sound: true }; const qs = buildReview("2026-11-06"); expect(qs.slice(0, 3).every(isDueQ)).toBe(true); });
test("old backlog at most 10 per day", () => { seedDue(0); S.progress.path = { start: 13, st: {}, goal: 1, sound: true }; expect(buildReview("2026-11-06").length).toBe(10); expect(buildReview("2026-11-06").length).toBe(0); });
test("gradeTrack srs wrong resets to due today", () => { gradeTrack({ type: "srs", id: "v13-0" }, false); expect(S.progress.srs["v13-0"].next).toBe(dayStr()); });
```
(`seedDue(k)` = helper trong file test tạo k mục srs `next` ≤ hôm nay; `isDueQ` kiểm `track.id` thuộc nhóm đã seed.)
- [ ] **Step 2: Chạy** → FAIL; **Step 3:** viết; **Step 4:** chạy → PASS, `npm run build` sạch
- [ ] **Step 5: Commit** `feat: shared grading and daily review queue with old-item backlog`

---

### Task 6: Bộ token giao diện mới + khung 3 mục + Thư viện

**Files:**
- Create: `src/styles/tokens.css` (màu/chữ/khoảng cách theo Global Constraints, sáng + tối "tàu đêm"), `src/styles/journey.css` (phần dùng chung cho journey/station/player/stamps, gồm hoạt hình nét `.stk`)
- Modify: `index.html` (Google Fonts: Be Vietnam Pro 400/600/800, Zen Kaku Gothic New 500/700, Klee One 600; nav 3 mục), `src/main.ts` (nạp CSS mới thay `theme.css`; trang mở đầu `journey`; `VIEWS` thêm `journey`, `station`, `player`, `reviewq`, `library`, `stamps`)
- Modify: `src/app/shell.ts` (`NAV_GROUPS = { journey: ["journey","station","player","stamps"], reviewq: ["reviewq","review"], library: ["library","vocab","kanji","match","learn","talk","particle","notes","exam"] }`; bỏ `today`; subnav chỉ hiện trong Thư viện)
- Create: `src/views/library.ts` (lưới công cụ: Từ điển từ vựng, Kanji theo chương, Nối từ, Mẫu câu, Hội thoại, Trợ từ, Sổ ngữ pháp, Luyện thi & thi thử — mỗi ô tên + 1 dòng mô tả)
- Delete từ điều hướng: `today` (file giữ lại, không còn đường vào)

**Interfaces:**
- Produces: `renderLibrary(): void`; nav ids `journey | reviewq | library`; class CSS dùng chung: `.sign` (biển tên ga), `.board` (bảng giờ tàu), `.rail` (thanh ray tiến độ), `.platform` (khối ga 3D), `.stamp`.

- [ ] **Step 1:** Viết token + nav; `npm run build` sạch.
- [ ] **Step 2: Kiểm tra bằng CDP** (script trong scratchpad, dựa trên `cdp.mjs` cũ): mở `#library` → 8 ô công cụ, bấm từng ô mở đúng view cũ, không lỗi console; bottom nav đúng 3 mục ở 390px; chế độ tối hiển thị đúng.
- [ ] **Step 3: Commit** `feat: station-sign design tokens, 3-tab shell and library`

---

### Task 7: Màn Hành trình (bản đồ tuyến 3D) + chọn bài bắt đầu

**Files:**
- Create: `src/views/journey.ts`
- Modify: `src/styles/journey.css`

**Interfaces:**
- Consumes: `STATIONS`, `stationStatus`, `currentStation`, `nextStep`, `setStart`, `pathState`, `buildReview` (để hiện số câu ôn), `penguin`.
- Produces: `renderJourney(): void`; nút `#jContinue` → nếu `buildReview().length` > 0 thì mở player chế độ ôn trước, rồi bước kế của ga hiện tại; chạm ga → `#station?n=`.

Bố cục: đường ray SVG uốn lượn dọc màn, 25 khối `.platform` (CSS `transform: perspective(700px) rotateX(18deg)`, 2–3 lớp bóng tạo độ dày), ga hiện tại sáng màu tuyến + tàu 🚃 + Pen-chan; ga đã dấu mang mini-stamp; ga khoá mờ + 🔒. Biển "Tiếp tục" cố định đáy: `N13 · 食堂 · Bước 3/6 — Mẫu câu`. Lần đầu (chưa có `path`) hiện hộp "Bạn đang học tới bài mấy?" (1–25, mặc định `upto`) → `setStart`. Mở màn: tàu trượt tới ga hiện tại 1 lần (tắt khi giảm chuyển động).

- [ ] **Step 1:** Viết view; `npm run build` sạch.
- [ ] **Step 2: CDP** hồ sơ mới: hiện hộp chọn bài, chọn 13 → ga 1–12 có trạng thái passed, N13 sáng, biển ghi "Bước 1/6"; cuộn tới N13 tự động; 360px không tràn ngang; chụp màn hình xem lại thẩm mỹ.
- [ ] **Step 3: Commit** `feat: 3D route map with continue signboard and start-lesson picker`

---

### Task 8: Màn Ga (bảng giờ tàu) + Kiểm tra vượt ga

**Files:**
- Create: `src/views/station.ts`

**Interfaces:**
- Consumes: `stationOf`, `stationStatus`, `nextStep`, `pathState`, `buildStep` (để biết `partTotal`), `DIALOGUES`.
- Produces: `openStation(n: number): void`; nút bước → `startStep(n, step)` (Task 9); nút `#sSkip` (chỉ ở ga locked/open phía trước) → `startStep(n, 6, { skip: true })`; khi ga đã dấu: mở hội thoại "b" và nút "Đóng vai" (dùng `views/talk.ts` với `tS.l = n`).

Bảng: 6 dòng đánh số (đây là chuỗi tuần tự), trạng thái ✓ / ● đang (nhấp nháy kiểu đèn bảng điện) / 🔒; dòng đang làm dở ghi `lượt 2/5`. Đầu màn: biển tên ga `.sign` (số hiệu, tên kanji + kana, dải màu tuyến), con dấu nếu có.

- [ ] **Step 1:** Viết view; build sạch.
- [ ] **Step 2: CDP**: N13 hiện 6 bước, chỉ bước 1 bấm được; N16 có nút "Kiểm tra vượt ga"; N12 (passed) mở được mọi bước.
- [ ] **Step 3: Commit** `feat: station departure board with skip-ahead checkpoint`

---

### Task 9: Player (một câu một màn) + âm thanh + chuỗi đúng

**Files:**
- Create: `src/views/player.ts`, `src/core/sound.ts`
- Modify: `src/styles/journey.css`

**Interfaces:**
- Consumes: `buildStep`, `buildReview`, `gradeTrack`, `introduce`, `markStepDone`, `setPart`, `stampStation`, `strokeSVG`, `ancientHTML`, `tipHTML`, `penguin`, `penLine`, `say`, `norm`, `showKana`, `bump`, `dailyInc`.
- Produces: `startStep(n: number, step: StepNo, opts?: { skip?: boolean }): void`; `startReview(): void`; `sound.ts`: `playDeparture(): void` (giai điệu 2–3 giây, 6–8 nốt, Web Audio OscillatorNode + gain envelope), `playChime(level: 3|5|10): void`, cả hai không làm gì khi `pathState().sound === false` hoặc không có `AudioContext`.

Hành vi:
- Một câu/màn; thanh `.rail` có tàu chạy theo tiến độ; nút trả lời to (≥ 48px).
- Phản hồi trượt lên từ đáy: đúng = xanh tuyến + Pen-chan happy + câu khen; sai = đỏ tín hiệu + Pen-chan oops + đáp án đúng + `why`. Câu sai được đưa lại cuối lượt 1 lần.
- `build`: chạm khối để xếp vào dòng trả lời, chạm lại để gỡ; nút "Tự gõ" mở ô nhập (chấm bằng `norm`).
- `kanji-intro`: chữ lớn Klee One, `ancientHTML`, `strokeSVG` (nút "Xem lại nét"), `tipHTML`, ví dụ có 🔊.
- `dialogue`: dùng lại phần hiển thị câu + phát cả đoạn của `views/talk.ts` (xuất hàm `dialogueHTML(id)` từ talk.ts nếu cần), nút "Đã nghe xong".
- Chuỗi đúng 3/5/10 → `playChime`. Hết lượt → `setPart`/`markStepDone`, `playDeparture`, màn tóm tắt + "Tiếp tục".
- Bước 6: tính điểm → `stampStation`; đạt → chuyển sang màn đóng dấu (Task 10); chưa đạt → chỉ ra bước có nhiều câu sai nhất và nút "Ôn lại bước đó".
- Mọi câu có `track` → `gradeTrack`; `word-intro`/`kanji-intro` → `introduce`. Đúng → `bump(1)`; xong lượt → `dailyInc("path")`.

- [ ] **Step 1:** Viết `sound.ts` + `player.ts`; build sạch.
- [ ] **Step 2: CDP** hồ sơ mới bắt đầu ở 13: chạy hết bước 1→5 (trả lời đúng theo `a`/`answer` đọc từ DOM data), bước 6 đạt → dấu N13, ga hiện tại thành N14, `upto` = 14; đóng tab giữa bước 2 rồi mở lại → vào đúng lượt; xoá `window.speechSynthesis` và `AudioContext` trước khi nạp → không lỗi console.
- [ ] **Step 3: Commit** `feat: one-question player with build blocks, kanji strokes, sounds and checkpoint`

---

### Task 10: Sổ con dấu ga

**Files:**
- Create: `src/views/stamps.ts`, `src/core/stamp.ts`

**Interfaces:**
- Produces: `stampSVG(n: number, size = 120): string` — vòng tròn mực (màu tuyến cho ga lẻ, chàm cho ga chẵn), viền răng cưa nhẹ, tên ga kanji + `N13` + `motif` ở giữa, ngày đóng dấu; `renderStamps(): void` — lưới 25 ô (ô chưa có = khung nét đứt + số hiệu); `showStampMoment(n)` — hoạt cảnh dấu ấn xuống (scale 1.4→1 + xoay nhẹ + "mực loang"), rồi nút "Đi tiếp tới N14".

- [ ] **Step 1:** Viết; build sạch.
- [ ] **Step 2: CDP**: sau khi đạt bước 6 ở Task 9, màn đóng dấu hiện; `#stamps` có 1 dấu N13 + các ga passed để trống; chụp màn hình xem lại.
- [ ] **Step 3: Commit** `feat: station stamp book`

---

### Task 11: Tab Ôn tập + mục tiêu ngày + dọn màn cũ

**Files:**
- Create: `src/views/reviewq.ts`
- Modify: `src/views/journey.ts` (thanh mục tiêu ngày `.rail` = số lượt xong hôm nay / `goal`), `src/app/shell.ts` (`dailyPanel` không còn dùng), `src/core/store.ts` (`mergeDaily` gộp thêm khoá `"path"`; `dailyGet` khởi tạo `path: 0`), `src/views/account.ts` (thêm chọn `goal` 1/2/3 bước/ngày, bật/tắt âm, đổi "đang học tới bài mấy")

**Interfaces:**
- Produces: `renderReviewTab(): void` — khối 1: "Ôn ngay (k câu)" → `startReview()`; khối 2: Sổ câu (mở `views/review.ts` cũ). Hiện chuỗi ngày.

- [ ] **Step 1:** Viết; build sạch; `npx vitest run` toàn bộ PASS.
- [ ] **Step 2: CDP tổng** (hồ sơ có nhập `backup/tien_do_tu_claude.json`): Ôn tập hiện số câu đến hạn ≤ 15, làm hết → còn 0; 154 mục srs vẫn còn; chuỗi ngày giữ; Thư viện mở đủ công cụ cũ; 360/390px không tràn; chế độ tối; 0 lỗi console.
- [ ] **Step 3: Commit** `feat: review tab, daily goal, settings; retire old Today screen`
