// Gói ôn đầu buổi (và tab Ôn tập): mục đến hạn trước, rồi tối đa ~10 mục CŨ mỗi ngày — từ/kanji của các ga
// đã đi qua mà chưa từng vào lịch ôn — cho tới khi hết. Tổng không quá `cap` câu.
import { VOCAB } from "../content/data";
import { EXAM_BANK } from "../content/exam";
import { PT_DRILLS } from "../content/drills";
import { pathState, stationStatus } from "./path";
import type { Q } from "./q";
import { STATIONS } from "./route";
import { kanjiReadQ, listenQ, meaningQ, typeQ } from "./steps";
import { VFLAT, kid, srs, srsAll, vid } from "./srs";
import { S, saveProgress } from "./store";
import { dayStr } from "./util";

const EXAM_IDS = new Set(EXAM_BANK.map((q: any) => q.id));
const PT_IDS = new Set(PT_DRILLS.map((d: any) => d.id));
const lessonIdx = (n: number) => VOCAB.findIndex((L: any) => L.n === n);
// "v13-4" → câu nghĩa/nghe; "k行" → câu cách đọc
function srsQ(id: string, k: number, listen = true): Q | null {
  if (id[0] === "k") return kanjiReadQ(id.slice(1), Math.random);
  const m = id.match(/^v(\d+)-(\d+)$/); if (!m) return null;
  const li = lessonIdx(+m[1]), i = +m[2];
  if (li < 0 || !VFLAT[li]?.[i]) return null;
  // đã lên bậc 2 trở lên: bắt tự nhớ lại (gõ), nhớ lâu hơn chọn đáp án
  if ((srs(id)?.lv || 0) >= 2) return typeQ(li, i);
  return k % 2 && listen ? listenQ(li, i, Math.random) : meaningQ(li, i, Math.random);
}

export function buildReview(today = dayStr(), cap = 15, oldPerDay = 10, commit = true, listen = true): Q[] {
  const out: Q[] = [];
  // 1) đến hạn: từ/kanji, rồi câu trợ từ và câu thi đã sai
  const due = Object.entries<any>(srsAll()).filter(([, v]) => (v.next || "") <= today).sort((a, b) => (a[1].next || "").localeCompare(b[1].next || ""));
  for (const [id] of due) { if (out.length >= cap) break; const q = srsQ(id, out.length, listen); if (q) out.push(q); }
  for (const [id, v] of Object.entries<any>(S.progress.pt || {})) { if (out.length >= cap) break; if (v.w > 0 && (v.next || "") <= today && PT_IDS.has(id)) out.push({ kind: "particle", drill: id }); }
  for (const [id, v] of Object.entries<any>(S.progress.ex?.q || {})) { if (out.length >= cap) break; if (v.w > 0 && (v.next || "") <= today && EXAM_IDS.has(id)) out.push({ kind: "exam", id }); }
  // 2) mục cũ của các ga đã đi qua (chưa có trong lịch ôn), theo thứ tự ga
  if (!S.progress.path) return out;
  const P = pathState(), fed = (P.oldFed || (P.oldFed = {}));
  let room = Math.min(cap - out.length, oldPerDay - (fed[today] || 0));
  if (room <= 0) return out;
  let took = 0;
  for (const s of STATIONS) {
    if (room <= 0) break;
    const stt = stationStatus(s.n); if (stt !== "passed" && stt !== "stamped") continue;
    const li = lessonIdx(s.n);
    for (let i = 0; li >= 0 && i < VFLAT[li].length && room > 0; i++) if (!srs(vid(li, i))) { out.push(meaningQ(li, i, Math.random)); room--; took++; }
    for (const ch of s.kanji) { if (room <= 0) break; if (!srs(kid(ch))) { const q = kanjiReadQ(ch, Math.random); if (q) { out.push(q); room--; took++; } } }
  }
  if (took && commit) { fed[today] = (fed[today] || 0) + took; saveProgress(); }
  return out;
}
