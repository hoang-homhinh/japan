// Ôn tập: gói ôn hôm nay (từ, kanji, trợ từ, câu thi đến hạn + mục cũ của các bài đã qua) và Sổ câu.
import { buildReview } from "../core/reviewq";
import { S, dueList } from "../core/store";
import { $, dayStr } from "../core/util";
import { reviewBreakdown, reviewCard } from "./home";
import { startPinned, startReview } from "./player";
import { pinnedIds } from "../core/pins";
import { VOCAB, KANJI } from "../content/data";
import { VFLAT } from "../core/srs";
import { esc } from "../core/util";

const KM: Record<string, any> = Object.fromEntries(KANJI.flatMap((c: any) => c.groups.flatMap((g: any) => g.kanji.map((k: any) => [k.k, k]))));
function pinLabel(id: string): [string, string] {
  if (id[0] === "k") { const k = KM[id.slice(1)]; return [id.slice(1), k ? `${k.hv} · ${k.mean}` : ""]; }
  const m = id.match(/^v(\d+)-(\d+)$/); const li = m ? VOCAB.findIndex((L: any) => L.n === +m[1]) : -1; const w = li >= 0 ? VFLAT[li][+m![2]] : null;
  return w ? [w[0], w[3]] : [id, ""];
}

export function renderReviewTab() {
  const qs = S.progress.path ? buildReview(undefined, 15, 10, false) : [];
  const sent = dueList().length, pins = pinnedIds();
  $("#main").innerHTML = `<div class="m-grid">
  <div class="m-col">${reviewCard(qs.length, reviewBreakdown(qs), dayStr())}
    <section class="m-card"><div class="m-ch"><h2>Vì sao ôn mỗi ngày?</h2></div><p style="margin:0;color:var(--muted);font-size:13.5px">Mỗi mục được hỏi lại đúng lúc bạn sắp quên: sau 1, 3, 7, 14 rồi 30 ngày. Trả lời đúng thì giãn ra, sai thì hỏi lại sớm. Mỗi ngày khoảng 3–10 phút là đủ giữ những gì đã học.</p></section>
  </div>
  <aside class="m-col">
    <section class="m-card"><div class="m-ch"><h2>Mục đã ghim</h2><span>${pins.length}</span></div>
      ${pins.length ? pins.slice(0, 8).map(id => { const [j, v] = pinLabel(id); return `<div class="wl"><b lang="ja">${esc(j)}</b><span>${esc(v)}</span></div>`; }).join("") + (pins.length > 8 ? `<p style="margin:6px 0 0;font-size:12.5px;color:var(--dim)">và ${pins.length - 8} mục khác</p>` : "") : `<p style="margin:0;color:var(--dim);font-size:13.5px">Bấm “Ghim” trên thẻ từ hoặc ở phần xem lại câu sai để gom các mục khó vào đây.</p>`}
      ${pins.length ? `<button class="btn ghost" id="rvPins" style="margin-top:12px;width:100%;justify-content:center">Ôn ${pins.length} mục đã ghim</button>` : ""}</section>
    <section class="m-card"><div class="m-ch"><h2>Sổ câu</h2><span>${sent} câu đến hạn</span></div>
    <p style="margin:0 0 12px;color:var(--muted);font-size:13.5px">Các câu bạn tự đặt ở Mẫu câu, Kanji, Từ vựng được lưu ở đây để ôn lại.</p>
    <button class="btn ghost" data-view="review">Mở sổ câu</button></section></aside></div>`;
}
export function onClick(t: any): boolean {
  if (t.id === "rvStart") { startReview(); return true; }
  if (t.id === "rvPins") { startPinned(); return true; }
  return false;
}
