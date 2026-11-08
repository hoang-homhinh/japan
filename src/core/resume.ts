// Học tiếp lượt dở: lưu lượt đang làm (trên máy này) để mở lại đúng câu đang dừng, trong cùng ngày.
const KEY = "michi_run";
export function saveRun(run: { n: number; step: number; part: number; pos: number; items: any[] }, day: string) {
  try { localStorage.setItem(KEY, JSON.stringify({ day, run })); } catch (e) {}
}
export function loadRun(n: number, step: number, day: string): any | null {
  try {
    const o = JSON.parse(localStorage.getItem(KEY) || "null");
    if (!o || o.day !== day || o.run?.n !== n || o.run?.step !== step) return null;
    if (!Array.isArray(o.run.items) || o.run.pos <= 0 || o.run.pos >= o.run.items.length) return null;
    return o.run;
  } catch (e) { return null; }
}
export function clearRun() { try { localStorage.removeItem(KEY); } catch (e) {} }
