// Số liệu cho Dashboard / Analytics / Thành tích — hàm thuần đọc S.progress, không ghi gì.
import { EXAM_BANK } from "../content/exam";
import { LESSONS } from "../content/lessons";
import { currentStation, peekPath } from "./path";
import { KLIST, VFLAT, kid, vid } from "./srs";
import { S } from "./store";
import { addDays } from "./util";

export type Cell = { d: string; n: number };

// lưới hoạt động kiểu GitHub: weeks*7 ô, ô cuối là hôm nay
export function heatmap(today: string, weeks = 20): Cell[] {
  const c = S.progress.counts || {}, days = new Set(S.progress.days || []), out: Cell[] = [];
  for (let i = weeks * 7 - 1; i >= 0; i--) { const d = addDays(today, -i); out.push({ d, n: c[d] || (days.has(d) ? 1 : 0) }); }
  return out;
}

const pct = (a: number, b: number) => (b ? a / b : 0);
export function mastery() {
  const srs = S.progress.srs || {};
  let vd = 0, vt = 0;
  VFLAT.forEach((ws: any[], li: number) => ws.forEach((_: any, i: number) => { vt++; if ((srs[vid(li, i)]?.lv || 0) >= 3) vd++; }));
  const kt = KLIST.length, kd = KLIST.filter((x: any) => (srs[kid(x.k.k)]?.lv || 0) >= 3).length;
  const pats = LESSONS.flatMap((l: any) => l.patterns), gd = pats.filter((p: any) => (S.progress.drills?.[p.id] || []).length >= p.drills.length).length;
  let pc = 0, pw = 0; for (const v of Object.values<any>(S.progress.pt || {})) { pc += v.c || 0; pw += v.w || 0; }
  const ch = new Set(EXAM_BANK.filter((q: any) => /^ch_/.test(q.k)).map((q: any) => q.id));
  let lc = 0, lw = 0; for (const [id, v] of Object.entries<any>(S.progress.ex?.q || {})) if (ch.has(id)) { lc += v.c || 0; lw += v.w || 0; }
  return {
    vocab: { done: vd, total: vt, p: pct(vd, vt) },
    kanji: { done: kd, total: kt, p: pct(kd, kt) },
    grammar: { done: gd, total: pats.length, p: pct(gd, pats.length) },
    particle: { done: pc, total: pc + pw, p: pct(pc, pc + pw) },
    listening: { done: lc, total: lc + lw, p: pct(lc, lc + lw) },
  };
}

// số mục đến hạn ôn trong `days` ngày tới (ô đầu gồm cả mục quá hạn)
export function reviewForecast(today: string, days = 7): Cell[] {
  const out: Cell[] = Array.from({ length: days }, (_, i) => ({ d: addDays(today, i), n: 0 }));
  for (const v of Object.values<any>(S.progress.srs || {})) {
    const nx = v.next || today;
    if (nx <= today) { out[0].n++; continue; }
    const k = out.findIndex(c => c.d === nx); if (k >= 0) out[k].n++;
  }
  return out;
}

// dự báo ngày học xong N5 theo tốc độ qua bài gần đây
export function readiness(today: string) {
  const st = peekPath().st || {};
  const stamps = Object.values<any>(st).map(s => s.stamp).filter(Boolean).sort();
  const left = 25 - currentStation() + 1 - (st[25]?.stamp ? 1 : 0);
  if (!stamps.length || left <= 0) return { left: Math.max(left, 0), perWeek: 0, date: left <= 0 ? today : null };
  const span = Math.max(7, (Date.parse(today) - Date.parse(stamps[0])) / 864e5);
  const perDay = stamps.length / span;
  return { left, perWeek: +(perDay * 7).toFixed(1), date: addDays(today, Math.ceil(left / perDay)) };
}

function streakAt(today: string) {
  const set = new Set(S.progress.days || []); let d = set.has(today) ? today : addDays(today, -1), n = 0;
  while (set.has(d)) { n++; d = addDays(d, -1); }
  return n;
}
export type Badge = { id: string; t: string; d: string; got: boolean; v: number; goal: number };
export function badges(today: string): Badge[] {
  const m = mastery(), s = streakAt(today);
  const passed = Object.values<any>(peekPath().st || {}).filter(x => x.stamp).length;
  const b = (id: string, t: string, d: string, v: number, goal: number): Badge => ({ id, t, d, v, goal, got: v >= goal });
  return [
    b("streak3", "Khởi động", "Học 3 ngày liên tiếp", s, 3), b("streak7", "Một tuần bền bỉ", "Học 7 ngày liên tiếp", s, 7), b("streak30", "Thói quen", "Học 30 ngày liên tiếp", s, 30),
    b("mod1", "Module đầu tiên", "Qua 1 module", passed, 1), b("mod5", "Đà tăng tốc", "Qua 5 module", passed, 5), b("mod13", "Nửa chặng N5", "Qua 13 module", passed, 13), b("mod25", "Hoàn thành N5", "Qua cả 25 module", passed, 25),
    b("kanji25", "25 kanji", "Thuộc 25 kanji", m.kanji.done, 25), b("kanji50", "50 kanji", "Thuộc 50 kanji", m.kanji.done, 50), b("kanji95", "Trọn bộ kanji", "Thuộc 95 kanji", m.kanji.done, 95),
    b("words100", "100 từ", "Thuộc 100 từ", m.vocab.done, 100), b("words500", "500 từ", "Thuộc 500 từ", m.vocab.done, 500), b("words1000", "1000 từ", "Thuộc 1000 từ", m.vocab.done, 1000),
  ];
}
