// Âm thanh nhỏ bằng Web Audio (không cần file): nhạc báo tàu chạy khi xong một lượt, chuông khi đúng liên tiếp.
// Giai điệu tự soạn (không dùng nhạc của JR). Tắt khi người học tắt âm hoặc trình duyệt không có Web Audio.
import { peekPath } from "./path";

let ctx: any = null;
function ac(): any {
  if (!peekPath().sound) return null;
  const AC = (globalThis as any).AudioContext || (globalThis as any).webkitAudioContext;
  if (!AC) return null;
  try { ctx = ctx || new AC(); if (ctx.state === "suspended") ctx.resume(); return ctx; } catch (e) { return null; }
}
function tone(c: any, freq: number, at: number, dur: number, vol = 0.12, type = "triangle") {
  const o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(vol, at + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  o.connect(g); g.connect(c.destination); o.start(at); o.stop(at + dur + 0.05);
}
// 発車メロディ ngắn ~2,4 giây: đi lên rồi kết ở nốt chủ
const MELODY: [number, number][] = [[659, .22], [784, .22], [880, .22], [988, .34], [880, .22], [1047, .26], [988, .26], [1319, .6]];
export function playDeparture() {
  const c = ac(); if (!c) return;
  let t = c.currentTime + 0.05;
  for (const [f, d] of MELODY) { tone(c, f, t, d * 1.1, 0.1); tone(c, f / 2, t, d * 1.1, 0.04, "sine"); t += d; }
}
export function playChime(level: 3 | 5 | 10) {
  const c = ac(); if (!c) return;
  const notes = level === 3 ? [1047, 1319] : level === 5 ? [1047, 1319, 1568] : [1047, 1319, 1568, 2093];
  notes.forEach((f, i) => tone(c, f, c.currentTime + 0.04 + i * 0.09, 0.35, 0.09, "sine"));
}
