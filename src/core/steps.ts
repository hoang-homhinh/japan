// Tạo câu hỏi cho 6 bước của một ga từ dữ liệu sẵn có. Bước dài chia thành nhiều "lượt" (part).
// 1 Nghe chuyện ở ga · 2 Từ mới · 3 Mẫu câu · 4 Trợ từ · 5 Kanji · 6 Kiểm tra qua ga
import { KANJI, VOCAB } from "../content/data";
import { LESSONS } from "../content/lessons";
import { PT_DRILLS } from "../content/drills";
import { PLUS, typeAnswers } from "../content/enrich";
import { EXAM_BANK } from "../content/exam";
import { KJ_SIM, kjWrongReads } from "./examgen";
import { getPart, type StepNo } from "./path";
import type { Q } from "./q";
import { stationOf } from "./route";
import { LOTS, VFLAT, kid, srs, vid } from "./srs";

type Rnd = () => number;
const shuffle = <T,>(a: T[], rnd: Rnd): T[] => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const uniq = <T,>(a: T[]) => [...new Set(a)];
// 1 đáp án + tối đa 3 nhiễu khác nhau → {opts, a}
function choices(right: string, pool: string[], rnd: Rnd, n = 4) {
  const wrong = shuffle(uniq(pool.filter(x => x && x !== right)), rnd).slice(0, n - 1);
  const opts = shuffle([right, ...wrong], rnd);
  return { opts, a: opts.indexOf(right) };
}
const KMAP: Record<string, any> = Object.fromEntries(KANJI.flatMap((c: any) => c.groups.flatMap((g: any) => g.kanji.map((k: any) => [k.k, k]))));
const lessonIdx = (n: number) => VOCAB.findIndex((L: any) => L.n === n);
const PARTS = ["は", "が", "を", "に", "で", "へ", "と", "も"];

// ---- từ vựng ----
export function meaningQ(li: number, i: number, rnd: Rnd): Q {
  const w = VFLAT[li][i];
  return { kind: "mcq", prompt: "Từ này nghĩa là gì?", jp: w[0], say: w[0], ...choices(w[3], VFLAT[li].map((x: any) => x[3]), rnd), track: { type: "srs", id: vid(li, i) } };
}
export function listenQ(li: number, i: number, rnd: Rnd): Q {
  const w = VFLAT[li][i];
  return { kind: "listen", say: w[0], ...choices(w[0], VFLAT[li].map((x: any) => x[0]), rnd), track: { type: "srs", id: vid(li, i) } };
}

// ---- mẫu câu: cắt câu kana theo dấu cách thành khối; khối nhiễu = đổi trợ từ cuối một khối ----
const toks = (jp: string) => jp.replace(/[。？！]$/, "").split(/[ 　]+/).filter(Boolean);
function swapParticle(t: string, rnd: Rnd): string | null {
  const last = t.slice(-1); if (!PARTS.includes(last) || t.length < 2) return null;
  const other = shuffle(PARTS.filter(p => p !== last), rnd)[0];
  return t.slice(0, -1) + other;
}
function buildQ(jp: string, vi: string, others: string[], rnd: Rnd): Q | null {
  const answer = toks(jp); if (answer.length < 3) return null;
  const dist: string[] = [];
  for (const t of shuffle(answer, rnd)) { const s = swapParticle(t, rnd); if (s && !answer.includes(s)) { dist.push(s); break; } }
  const extra = shuffle(others.flatMap(toks).filter(t => !answer.includes(t) && !dist.includes(t)), rnd)[0];
  if (extra) dist.push(extra);
  return { kind: "build", vi, answer, tokens: shuffle([...answer, ...dist], rnd) };
}
function clozeQ(jp: string, vi: string, others: string[], rnd: Rnd): Q | null {
  const t = toks(jp); if (t.length < 3) return null;
  const hide = Math.floor(rnd() * (t.length - 1));
  const right = t[hide];
  const pool = [swapParticle(right, rnd) || "", ...others.flatMap(toks)];
  return { kind: "mcq", prompt: vi, jp: t.map((x, i) => (i === hide ? "（　）" : x)).join(" "), say: jp, optJp: true, ...choices(right, pool, rnd) };
}
function patternQs(P: any, all: string[], rnd: Rnd, mine: [string, string][] = []): Q[] {
  const out: Q[] = [{ kind: "pattern-intro", pid: P.id }];
  const sents: [string, string][] = [...(P.ex || []).map((e: any) => [e[0], e[1]]), ...(P.drills || []).map((d: any) => [d.a[0], d.cue || ""])];
  const usable = sents.filter(([jp]) => toks(jp).length >= 3);
  for (const [jp, vi] of usable.slice(0, 2)) { const q = buildQ(jp, vi || P.mean, all, rnd); if (q) out.push(q); }
  const c = usable[2] || usable[0];
  if (c) { const q = clozeQ(c[0], c[1] || P.mean, all, rnd); if (q) out.push(q); }
  for (const [jp, vi] of mine) { const q = buildQ(jp, vi, all, rnd); if (q) out.push(q); } // câu về chính mình, để cuối
  return out;
}

// ---- kanji ----
export function kanjiReadQ(ch: string, rnd: Rnd): Q | null {
  const k = KMAP[ch]; if (!k?.ex?.length) return null;
  const [word, read] = k.ex[0];
  const pool = [...kjWrongReads(read), ...k.ex.slice(1).map((e: any) => e[1])];
  return { kind: "mcq", prompt: "Từ này đọc thế nào?", jp: word, say: read, optJp: true, ...choices(read, pool, rnd), track: { type: "srs", id: kid(ch) } };
}
function kanjiPickQ(ch: string, mates: string[], rnd: Rnd): Q | null {
  const k = KMAP[ch]; if (!k) return null;
  const pool = [...(KJ_SIM[ch] || "").split(""), ...mates, ...Object.keys(KMAP)];
  return { kind: "mcq", prompt: `Chữ nào là ${k.hv} (${k.mean})?`, optJp: true, ...choices(ch, pool, rnd), track: { type: "srs", id: kid(ch) } };
}

// ---- trợ từ ----
function particleIds(n: number, want: number, rnd: Rnd): string[] {
  const exact = shuffle(PT_DRILLS.filter((d: any) => d.l === n), rnd);
  const before = PT_DRILLS.filter((d: any) => d.l < n).sort((a: any, b: any) => b.l - a.l);
  return [...exact, ...before].slice(0, want).map((d: any) => d.id);
}

export function buildStep(n: number, step: StepNo, rnd: Rnd = Math.random, opt: { listen?: boolean } = {}): { qs: Q[]; partTotal: number; part: number } {
  const canListen = opt.listen !== false;
  const li = lessonIdx(n), L = LESSONS.find((x: any) => x.n === n), st = stationOf(n);
  const plus = PLUS[n];
  if (step === 1) {
    if (!plus) return { qs: [{ kind: "dialogue", id: `${n}a` }], partTotal: 1, part: 0 };
    const qs: Q[] = [];
    if (canListen) { qs.push({ kind: "dialogue-blind", id: `${n}a` }); for (const g of plus.gist) qs.push({ kind: "mcq", prompt: g.q, opts: g.opts, a: g.a }); }
    qs.push({ kind: "dialogue", id: `${n}a` }, { kind: "phrases", id: `${n}a`, keep: plus.keep });
    return { qs, partTotal: 1, part: 0 };
  }

  if (step === 2) {
    // lượt = lô đầu tiên còn từ chưa từng học (từ đã thuộc/đã gặp thì bỏ qua)
    const src: number[][] = plus ? plus.lots.map(l => l.map(k => VFLAT[li].findIndex((w: any) => w[0] === k)).filter((i: number) => i >= 0)) : (LOTS[li] || []).map((lot: any) => lot.ids);
    const lots = src.map((ids: number[]) => ids.filter((i: number) => !srs(vid(li, i)))).filter((ids: number[]) => ids.length);
    if (!lots.length) return { qs: [], partTotal: 0, part: 0 };
    const ids: number[] = lots[0], qs: Q[] = [];
    if (plus) {
      // thẻ (câu ví dụ + mẹo nhớ) → nghe chọn từ → chọn nghĩa → tự gõ lại (nhớ lại khó nhất để cuối)
      for (const i of ids) { const w = VFLAT[li][i]; qs.push({ kind: "word-intro", vid: vid(li, i), w, plus: plus.words[w[0]] }); }
      if (canListen) for (const i of shuffle(ids, rnd)) qs.push(listenQ(li, i, rnd));
      for (const i of shuffle(ids, rnd)) qs.push(meaningQ(li, i, rnd));
      for (const i of shuffle(ids, rnd)) { const w = VFLAT[li][i]; qs.push({ kind: "type", vi: w[3], answers: typeAnswers(w[0]), say: w[0], track: { type: "srs", id: vid(li, i) } }); }
      return { qs, partTotal: lots.length, part: 0 };
    }
    for (const i of ids) qs.push({ kind: "word-intro", vid: vid(li, i), w: VFLAT[li][i] }, meaningQ(li, i, rnd));
    if (canListen) for (const i of shuffle(ids, rnd)) qs.push(listenQ(li, i, rnd));
    qs.push({ kind: "match", pairs: ids.map(i => [VFLAT[li][i][3], VFLAT[li][i][0], vid(li, i)] as [string, string, string]) });
    return { qs, partTotal: lots.length, part: 0 };
  }

  if (step === 3) {
    const pats = L?.patterns || [], total = Math.ceil(pats.length / 2), part = Math.min(getPart(n, 3), Math.max(total - 1, 0));
    const all = pats.flatMap((p: any) => (p.ex || []).map((e: any) => e[0]));
    return { qs: pats.slice(part * 2, part * 2 + 2).flatMap((p: any) => patternQs(p, all, rnd, plus?.mine[p.id])), partTotal: total, part };
  }

  if (step === 4) return { qs: particleIds(n, 10, rnd).map(id => ({ kind: "particle", drill: id }) as Q), partTotal: 1, part: 0 };

  if (step === 5) {
    const qs: Q[] = [];
    for (const ch of st.kanji) {
      qs.push({ kind: "kanji-intro", ch });
      const r = kanjiReadQ(ch, rnd), p = kanjiPickQ(ch, st.kanji, rnd);
      if (r) qs.push(r); if (p) qs.push(p);
    }
    return { qs, partTotal: 1, part: 0 };
  }

  // bước 6: Kiểm tra qua ga — 3 từ, 2 kanji, 3 ngữ pháp/từ vựng kiểu đề, 2 trợ từ, 1 nghe
  const qs: Q[] = [];
  for (const i of shuffle<number>(VFLAT[li].map((_: any, i: number) => i), rnd).slice(0, 3)) qs.push(meaningQ(li, i, rnd));
  for (const ch of shuffle(st.kanji, rnd).slice(0, 2)) { const q = kanjiReadQ(ch, rnd) || kanjiPickQ(ch, st.kanji, rnd); if (q) qs.push(q); }
  const exams = shuffle(EXAM_BANK.filter((q: any) => (q.k === "bun_form" || q.k === "goi_ctx") && q.l === n), rnd).slice(0, 3);
  for (const q of exams) qs.push({ kind: "exam", id: q.id });
  if (exams.length < 3) {
    const all = (L?.patterns || []).flatMap((p: any) => (p.ex || []).map((e: any) => e[0]));
    for (const p of shuffle<any>(L?.patterns || [], rnd)) { if (qs.length >= 8) break; const e = (p.ex || []).find((x: any) => toks(x[0]).length >= 3); const q = e && buildQ(e[0], e[1], all, rnd); if (q) qs.push(q); }
  }
  for (const id of particleIds(n, 2, rnd)) qs.push({ kind: "particle", drill: id });
  const listen = shuffle(EXAM_BANK.filter((q: any) => /^ch_/.test(q.k) && q.l <= n), rnd).sort((a: any, b: any) => b.l - a.l)[0];
  if (listen && canListen) qs.push({ kind: "exam", id: listen.id });
  while (qs.length < 10) { const i = Math.floor(rnd() * VFLAT[li].length); qs.push(meaningQ(li, (i + qs.length) % VFLAT[li].length, rnd)); }
  return { qs: shuffle(qs, rnd).slice(0, 12), partTotal: 1, part: 0 };
}
