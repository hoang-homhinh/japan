// Ôn tập: gói ôn hôm nay (từ, kanji, trợ từ, câu thi đến hạn + mục cũ của các bài đã qua) và Sổ câu.
import { buildReview } from "../core/reviewq";
import { S, dueList } from "../core/store";
import { $, dayStr } from "../core/util";
import { reviewBreakdown, reviewCard } from "./home";
import { startReview } from "./player";

export function renderReviewTab() {
  const qs = S.progress.path ? buildReview(undefined, 15, 10, false) : [];
  const sent = dueList().length;
  $("#main").innerHTML = `<div class="m-grid">
  <div class="m-col">${reviewCard(qs.length, reviewBreakdown(qs), dayStr())}
    <section class="m-card"><div class="m-ch"><h2>Vì sao ôn mỗi ngày?</h2></div><p style="margin:0;color:var(--muted);font-size:13.5px">Mỗi mục được hỏi lại đúng lúc bạn sắp quên: sau 1, 3, 7, 14 rồi 30 ngày. Trả lời đúng thì giãn ra, sai thì hỏi lại sớm. Mỗi ngày khoảng 3–10 phút là đủ giữ những gì đã học.</p></section>
  </div>
  <aside class="m-col"><section class="m-card"><div class="m-ch"><h2>Sổ câu</h2><span>${sent} câu đến hạn</span></div>
    <p style="margin:0 0 12px;color:var(--muted);font-size:13.5px">Các câu bạn tự đặt ở Mẫu câu, Kanji, Từ vựng được lưu ở đây để ôn lại.</p>
    <button class="btn ghost" data-view="review">Mở sổ câu</button></section></aside></div>`;
}
export function onClick(t: any): boolean {
  if (t.id === "rvStart") { startReview(); return true; }
  return false;
}
