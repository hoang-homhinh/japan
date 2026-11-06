// Trạng thái "Hành trình": ga hiện tại, các bước đã xong, lượt đang làm dở, con dấu ga.
// Lưu ở S.progress.path (gộp giữa các máy bằng mergePath). Không đụng các khoá tiến độ cũ.
import { S, saveProgress, setSetting } from "./store";
import { dayStr } from "./util";

export type StepNo = 1 | 2 | 3 | 4 | 5 | 6;
export type StationStatus = "locked" | "open" | "current" | "passed" | "stamped";
export type StationProgress = { steps: number[]; part?: Record<string, number>; stamp?: string; best?: number };
export type PathState = { start: number; st: Record<string, StationProgress>; goal: number; sound: boolean; t?: number; oldFed?: Record<string, number> };

export const PASS = 0.7;

export function pathState(): PathState {
  const p = S.progress;
  if (!p.path) p.path = { start: Math.min(Math.max(p.upto || 13, 1), 25), st: {}, goal: 1, sound: true };
  return p.path;
}
const sp = (n: number): StationProgress => { const st = pathState().st; return st[n] || (st[n] = { steps: [] }); };

// ga đang đi = ga sau ga đã đóng dấu xa nhất, nhưng không trước ga bắt đầu
export function currentStation(): number {
  const P = pathState();
  let maxStamp = 0;
  for (const [k, v] of Object.entries(P.st)) if (v.stamp) maxStamp = Math.max(maxStamp, +k);
  return Math.min(Math.max(P.start, maxStamp + 1), 25);
}
export function stationStatus(n: number): StationStatus {
  if (pathState().st[n]?.stamp) return "stamped";
  const cur = currentStation();
  if (n === cur) return "current";
  return n < cur ? "passed" : "locked";
}
export function nextStep(n: number): StepNo {
  const done = new Set(pathState().st[n]?.steps || []);
  for (let s = 1; s <= 6; s++) if (!done.has(s)) return s as StepNo;
  return 6;
}
export const stepDone = (n: number, step: number) => !!pathState().st[n]?.steps.includes(step);

export const getPart = (n: number, step: number) => pathState().st[n]?.part?.[step] || 0;
export function setPart(n: number, step: number, v: number) { const s = sp(n); (s.part || (s.part = {}))[step] = v; saveProgress(); }
export function markStepDone(n: number, step: number) {
  const s = sp(n);
  if (!s.steps.includes(step)) s.steps.push(step);
  if (s.part) delete s.part[step];
  saveProgress();
}
// điểm bài Kiểm tra qua ga (0–1). Đạt ≥ 70% thì đóng dấu, mở ga sau, nâng "đang học tới bài"
export function stampStation(n: number, score: number): boolean {
  const s = sp(n);
  s.best = Math.max(s.best || 0, score);
  if (score < PASS) { saveProgress(); return false; }
  if (!s.stamp) s.stamp = dayStr();
  if (!s.steps.includes(6)) s.steps.push(6);
  setSetting("upto", Math.max(Math.min(n + 1, 25), S.progress.upto || 0));
  return true;
}
export function setStart(n: number) {
  const P = pathState(); P.start = Math.min(Math.max(n, 1), 25); P.t = Date.now();
  setSetting("upto", Math.max(P.start, S.progress.upto || 0));
}
export function setPathOption(k: "goal" | "sound", v: any) { const P: any = pathState(); P[k] = v; P.t = Date.now(); saveProgress(); }

// gộp hai bản (hai máy): hợp bước đã xong, lượt dở lấy max, dấu lấy ngày sớm hơn, điểm lấy max
export function mergePath(a: any, b: any): any {
  if (!a || !b) return a || b;
  const st: Record<string, StationProgress> = {};
  for (const k of new Set([...Object.keys(a.st || {}), ...Object.keys(b.st || {})])) {
    const x = a.st?.[k] || { steps: [] }, y = b.st?.[k] || { steps: [] };
    const o: StationProgress = { steps: [...new Set<number>([...(x.steps || []), ...(y.steps || [])])] };
    const part: Record<string, number> = {};
    for (const [s, v] of [...Object.entries(x.part || {}), ...Object.entries(y.part || {})]) part[s] = Math.max(part[s] || 0, v as number);
    for (const s of o.steps) delete part[s];
    if (Object.keys(part).length) o.part = part;
    const stamps = [x.stamp, y.stamp].filter(Boolean).sort();
    if (stamps.length) o.stamp = stamps[0];
    const best = Math.max(x.best || 0, y.best || 0); if (best) o.best = best;
    st[k] = o;
  }
  const newer = (a.t || 0) >= (b.t || 0) ? a : b;
  const fed: Record<string, number> = {};
  for (const [d, v] of [...Object.entries(a.oldFed || {}), ...Object.entries(b.oldFed || {})]) fed[d] = Math.max(fed[d] || 0, v as number);
  const out: any = { start: Math.max(a.start || 1, b.start || 1), st, goal: newer.goal ?? 1, sound: newer.sound ?? true };
  if (newer.t) out.t = newer.t;
  if (Object.keys(fed).length) out.oldFed = Object.fromEntries(Object.entries(fed).sort().slice(-14));
  return out;
}

// tên 6 bước của một ga (theo thứ tự)
export const STEP_NAMES = ["", "Nghe chuyện ở ga", "Từ mới", "Mẫu câu", "Trợ từ trong câu", "Kanji của ga", "Kiểm tra qua ga"];
