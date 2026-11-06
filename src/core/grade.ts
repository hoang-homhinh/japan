// Chấm một câu trả lời và cập nhật lịch ôn chung (giữ đúng quy tắc của bản cũ):
// srs: từ/kanji (bậc 0–3, ôn 1→3→7→14→30 ngày) · pt: câu trợ từ · ex: câu thi.
import type { Track } from "./q";
import { IV, setSrs, srs } from "./srs";
import { S, bump, saveProgress } from "./store";
import { addDays, dayStr } from "./util";

// strength: 1 = nhận ra (chọn nghĩa), 2 = nhớ lại (nghe/nối/chọn chữ), 3 = dùng được (kiểm tra, ôn) → bậc 3
export function gradeTrack(t: Track, ok: boolean, strength: 1 | 2 | 3 = 1): void {
  const T = dayStr();
  if (t.type === "srs") {
    const st = srs(t.id) || { lv: 0, box: 0 };
    if (ok) {
      if (strength === 3) { const box = st.lv >= 3 ? Math.min(5, (st.box || 1) + 1) : 1; setSrs(t.id, { lv: 3, box, next: addDays(T, IV[box]) }); }
      else setSrs(t.id, { lv: Math.max(st.lv || 0, strength), next: addDays(T, 1) });
    } else setSrs(t.id, st.lv >= 3 ? { lv: 2, box: 0, next: T, wr: (st.wr || 0) + 1 } : { next: T, wr: (st.wr || 0) + 1 });
  } else {
    const bag = t.type === "pt" ? (S.progress.pt || (S.progress.pt = {})) : ((S.progress.ex || (S.progress.ex = { q: {}, mocks: [] })).q || (S.progress.ex.q = {}));
    const s = Object.assign({ c: 0, w: 0, box: 0 }, bag[t.id] || {});
    if (ok) { s.c++; s.box = Math.min(s.box + 1, 5); s.next = addDays(T, IV[s.box]); } else { s.w++; s.box = 1; s.next = T; }
    s.t = Date.now(); bag[t.id] = s;
    if (t.type === "ex") S.progress.ex.t = Date.now();
    saveProgress();
  }
  if (ok) bump(1);
}
// từ/kanji vừa được giới thiệu (thẻ intro): tạo mục ôn bậc 0 nếu chưa có
export function introduce(id: string): void { if (!srs(id)) setSrs(id, { lv: 0, next: dayStr() }); }
