// Trang bài (ga): biển tên ga + 6 bước dạng bảng (bước sau mở khi bước trước xong).
// Bài phía trước có "Kiểm tra vượt bài"; bài đã qua mở thêm hội thoại "b" để đóng vai.
import { DIALOGUES } from "../content/dialogues";
import { PLUS } from "../content/enrich";
import { KANJI, VOCAB } from "../content/data";
import { STEP_NAMES, getPart, nextStep, pathState, stationStatus, stepDone, type StepNo } from "../core/path";
import { stationOf } from "../core/route";
import { LOTS, VFLAT, kid, srs, vid } from "../core/srs";
import { buildStep } from "../core/steps";
import { $, esc } from "../core/util";
import { setView } from "../app/shell";
import { startStep } from "./player";
import { openTalkForLesson } from "./talk";
import { STEP_MIN, ekiSign, lessonTitle, stepper } from "./ui";

let sN = 1;
export function openStation(n: number) { sN = n; setView("station"); }
export const stationN = () => sN;

const STEP_HINT = ["", "Nghe đoạn hội thoại của bài, đọc nhẩm theo", "Từ mới theo lô, có câu ví dụ và mẹo nhớ", "Ghép khối chữ thành câu theo mẫu", "Chọn trợ từ đúng trong câu", "Chữ, thứ tự nét, cách nhớ", "10–12 câu, đạt 70% để đóng dấu bài"];
const KMAP: Record<string, any> = Object.fromEntries(KANJI.flatMap((c: any) => c.groups.flatMap((g: any) => g.kanji.map((k: any) => [k.k, k]))));

// lô từ đang học (lô đầu còn từ chưa gặp), để xem trước bên phải
function curLot(n: number): any[] {
  const li = VOCAB.findIndex((L: any) => L.n === n); if (li < 0) return [];
  const lots: number[][] = PLUS[n] ? PLUS[n].lots.map(l => l.map(k => VFLAT[li].findIndex((w: any) => w[0] === k))) : (LOTS[li] || []).map((l: any) => l.ids);
  const lot = lots.find(ids => ids.some(i => i >= 0 && !srs(vid(li, i)))) || lots[0] || [];
  return lot.filter(i => i >= 0).map(i => VFLAT[li][i]);
}

export function renderStation() {
  const s = stationOf(sN), status = stationStatus(sN), P = pathState().st[sN];
  const open = status !== "locked", nx = nextStep(sN), all = status === "stamped";
  const c = $("#crumb"), cs = $("#crumbSub");
  if (c) c.textContent = `Bài ${sN} · ${lessonTitle(sN)}`;
  if (cs) cs.textContent = `Lộ trình N5 / ${s.code} ${s.name}`;
  const row = (k: number) => {
    const done = all || stepDone(sN, k);
    const avail = open && (done || status === "passed" || k <= nx);
    const now = avail && !done && k === nx;
    let info = STEP_HINT[k];
    if (avail && !done && (k === 2 || k === 3)) { const b = buildStep(sN, k as StepNo, () => 0.5); if (b.partTotal > 1) info = `Lượt ${Math.min(getPart(sN, k) + 1, b.partTotal)}/${b.partTotal} · ${info}`; }
    return `<div class="tt${done ? " d" : now ? " c" : ""}${avail ? "" : " lock"}"><span class="n">${done ? "✓" : k}</span><div><b>${STEP_NAMES[k]}</b><small>${esc(info)}</small></div>
      <span class="t">${STEP_MIN[k]} phút</span><span class="s"><i></i>${done ? "Hoàn thành" : now ? "Đang học" : avail ? "Mở" : "Chưa mở"}</span>
      <span class="b">${avail ? `<button class="btn${now ? "" : " ghost"}" data-step="${k}">${done ? "Học lại" : now ? "Tiếp tục" : "Bắt đầu"}</button>` : ""}</span></div>`;
  };
  const hasB = DIALOGUES.some((d: any) => d.id === `${sN}b`), D = DIALOGUES.find((d: any) => d.id === `${sN}a`);
  const words = curLot(sN);
  $("#main").innerHTML = `<div class="m-grid">
  <div class="m-col">
    <section class="m-card" style="display:flex;gap:28px;align-items:center;flex-wrap:wrap">${ekiSign(sN, true)}
      <div style="flex:1;min-width:280px"><div class="eyebrow"><i></i>${status === "stamped" ? `Đã đóng dấu ${esc(P?.stamp || "")}` : status === "current" ? `Đang học · ${[1, 2, 3, 4, 5, 6].filter(k => stepDone(sN, k)).length}/6 bước xong` : status === "passed" ? "Đã đi qua, chưa đóng dấu" : "Chưa tới bài này"}</div>
        <div style="margin-top:14px">${stepper(sN)}</div></div></section>
    ${!open ? `<section class="m-card"><div class="m-ch"><h2>Lớp bạn đã học tới bài này?</h2></div><p style="margin:0 0 12px;color:var(--muted)">Làm bài kiểm tra vượt: đạt 70% là đóng dấu và chuyển tới bài ${sN}. Các bài ở giữa vẫn mở để học lại.</p>
      <button class="btn" data-skip="${sN}">Kiểm tra vượt bài ${sN}</button></section>` : ""}
    <section class="m-card" style="padding-block:6px" aria-label="6 bước của bài">${[1, 2, 3, 4, 5, 6].map(row).join("")}</section>
    ${(status === "stamped" || status === "passed") && hasB ? `<section class="m-card"><div class="m-ch"><h2>Luyện thêm</h2></div><p style="margin:0 0 12px;color:var(--muted)">Hội thoại thứ hai của bài: nghe, đọc nhẩm theo, rồi đóng vai.</p><button class="btn ghost" data-talkb="${sN}">Mở hội thoại thứ hai</button></section>` : ""}
  </div>
  <aside class="m-col">
    ${s.kanji.length ? `<section class="m-card"><div class="m-ch"><h2>Kanji của bài</h2><span>${s.kanji.filter(k => (srs(kid(k))?.lv || 0) >= 3).length}/${s.kanji.length} đã nhớ</span></div>
      <div class="kjs">${s.kanji.map(k => `<div class="${(srs(kid(k))?.lv || 0) >= 3 ? "ok" : ""}"><b lang="ja">${esc(k)}</b><small>${esc(KMAP[k]?.hv || "")}</small></div>`).join("")}</div></section>` : ""}
    ${words.length ? `<section class="m-card"><div class="m-ch"><h2>Từ mới lô tiếp theo</h2><span>${words.length} từ</span></div>
      ${words.map((w: any) => `<div class="wl"><b lang="ja">${esc(w[0])}</b><em lang="ja">${esc(w[1] || "")}</em><span>${esc(w[3])}</span></div>`).join("")}</section>` : ""}
    ${D?.notes?.length ? `<section class="m-card"><div class="m-ch"><h2>Ghi chú của bài</h2></div>${D.notes.map((x: string) => `<p style="margin:0 0 8px;font-size:13px;color:var(--muted)">${esc(x)}</p>`).join("")}</section>` : ""}
  </aside></div>`;
}

export function onClick(t: any): boolean {
  if (t.dataset.step) { startStep(sN, +t.dataset.step as StepNo); return true; }
  if (t.dataset.skip) { startStep(+t.dataset.skip, 6, { skip: true }); return true; }
  if (t.dataset.talkb) { openTalkForLesson(+t.dataset.talkb, `${t.dataset.talkb}b`); setView("talk"); return true; }
  return false;
}
