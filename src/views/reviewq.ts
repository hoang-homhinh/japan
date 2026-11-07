// Tab Ôn tập: (1) gói ôn hôm nay — từ, kanji, trợ từ, câu thi đến hạn + mục cũ của các ga đã qua; (2) Sổ câu.
import { penguin } from "../core/mascot";
import { buildReview } from "../core/reviewq";
import { S, dueList, streak } from "../core/store";
import { $ } from "../core/util";
import { startReview } from "./player";

export function renderReviewTab() {
  const n = S.progress.path ? buildReview(undefined, 15, 10, false).length : 0;
  const sent = dueList().length;
  $("#main").innerHTML = `
  <section class="rvq">
    <div class="pensay">${penguin(n ? "think" : "cheer", 64)}<div class="bubble"><b>${n ? `Hôm nay có ${n} câu cần ôn` : "Hôm nay đã ôn xong"}</b><span>${n ? "Ôn đúng lúc sắp quên là cách nhớ lâu nhất. Khoảng 3 phút." : "Quay lại ngày mai nhé. Chuỗi hiện tại: " + streak() + " ngày."}</span></div></div>
    <button class="btn accent big" id="rvStart" ${n ? "" : "disabled"}>${n ? `Ôn ngay ${n} câu` : "Không còn câu nào"}</button>
  </section>
  <section class="step"><h2><span class="k">句</span>Sổ câu<span class="hint">các câu bạn đã tự đặt</span></h2>
    <p class="tip">${sent ? `${sent} câu đến hạn ôn.` : "Không có câu nào đến hạn."} Câu bạn tự đặt ở Mẫu câu, Kanji, Từ vựng được lưu ở đây.</p>
    <button class="btn ghost" data-view="review">Mở sổ câu</button>
  </section>`;
}
export function onClick(t: any): boolean {
  if (t.id === "rvStart") { startReview(); return true; }
  return false;
}
