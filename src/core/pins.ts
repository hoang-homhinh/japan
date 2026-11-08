// Ghim mục khó (từ "v13-4", kanji "k行") để ôn riêng. Lưu {on, t} để gộp giữa các máy: thao tác mới hơn thắng.
import type { Q } from "./q";
import { kanjiReadQ, meaningQ, typeQ } from "./steps";
import { VOCAB } from "../content/data";
import { S, saveProgress } from "./store";

const all = (): Record<string, { on: boolean; t: number }> => S.progress.pins || (S.progress.pins = {});
export const isPinned = (id: string) => !!all()[id]?.on;
export function togglePin(id: string) { all()[id] = { on: !isPinned(id), t: Date.now() }; saveProgress(); return isPinned(id); }
export const pinnedIds = () => Object.entries(all()).filter(([, v]) => v.on).sort((a, b) => b[1].t - a[1].t).map(([k]) => k);

// gói ôn mục đã ghim: từ → chọn nghĩa + gõ lại; kanji → cách đọc
export function buildPinned(): Q[] {
  const out: Q[] = [];
  for (const id of pinnedIds()) {
    if (id[0] === "k") { const q = kanjiReadQ(id.slice(1), Math.random); if (q) out.push(q); continue; }
    const m = id.match(/^v(\d+)-(\d+)$/); if (!m) continue;
    const li = VOCAB.findIndex((L: any) => L.n === +m[1]); if (li < 0) continue;
    out.push(meaningQ(li, +m[2], Math.random), typeQ(li, +m[2]));
  }
  return out;
}
