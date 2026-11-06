// Màn Ga: biển tên ga + bảng giờ tàu 6 bước (bước sau mở khi bước trước xong).
// Ga phía trước có nút "Kiểm tra vượt ga"; ga đã đóng dấu mở thêm hội thoại "b" để đóng vai.
import { DIALOGUES } from "../content/dialogues";
import { STEP_NAMES, getPart, nextStep, pathState, stationStatus, stepDone, type StepNo } from "../core/path";
import { stationOf } from "../core/route";
import { buildStep } from "../core/steps";
import { $, esc } from "../core/util";
import { setView } from "../app/shell";
import { startStep } from "./player";
import { openTalkForLesson } from "./talk";

let sN = 1;
export function openStation(n: number) { sN = n; setView("station"); }

const STEP_HINT = ["", "Nghe hội thoại của bài, xem nghĩa", "Từ mới theo từng lô ~7 từ", "Ghép câu bằng khối chữ", "Chọn trợ từ đúng trong câu", "Chữ cổ, thứ tự nét, cách nhớ", "10–12 câu, đạt 70% để đóng dấu"];

export function renderStation() {
  const s = stationOf(sN), status = stationStatus(sN), P = pathState().st[sN];
  const open = status !== "locked";
  const nx = nextStep(sN);
  const row = (k: number) => {
    const done = stepDone(sN, k);
    const avail = open && (done || status === "passed" || status === "stamped" || k <= nx);
    let info = done ? "✓ xong" : avail ? (k === nx ? "● đang tới" : "mở") : "🔒";
    if (avail && !done && (k === 2 || k === 3)) { const b = buildStep(sN, k as StepNo, () => 0.5); if (b.partTotal > 1) info += ` · lượt ${Math.min(getPart(sN, k) + 1, b.partTotal)}/${b.partTotal}`; }
    return `<li class="brow${done ? " done" : ""}${avail && k === nx && !done ? " now" : ""}">
      <span class="bno">${k}</span><span class="bname"><b>${STEP_NAMES[k]}</b><small>${STEP_HINT[k]}</small></span>
      <span class="binfo">${info}</span>
      ${avail ? `<button class="btn ${k === nx && !done ? "accent" : "ghost"}" data-step="${k}">${done ? "Học lại" : "Học"}</button>` : ""}</li>`;
  };
  const hasB = DIALOGUES.some((d: any) => d.id === `${sN}b`);
  $("#main").innerHTML = `
  <div class="row" style="margin-top:12px"><button class="lnk" data-view="journey">← Bản đồ tuyến</button></div>
  <section class="stsign">
    <span class="sign-code">${s.code}</span>
    <span class="sign-name"><b>${esc(s.name)}</b><small>${esc(s.kana)}</small></span>
    <span class="sign-step">Bài ${sN} · ${status === "stamped" ? `đã đóng dấu ${esc(P?.stamp || "")}` : status === "current" ? "ga đang đi" : status === "passed" ? "đã đi qua, chưa đóng dấu" : "chưa tới"}</span>
    ${status === "stamped" ? `<span class="stmini" aria-hidden="true">${s.motif}</span>` : ""}
  </section>
  ${!open ? `<section class="skipbox"><p>Lớp của bạn đã học tới bài này? Làm <b>Kiểm tra qua ga</b> ngay: đạt 70% là đóng dấu và nhảy tới đây, các ga ở giữa vẫn mở để học lại.</p>
    <button class="btn accent" data-skip="${sN}">Kiểm tra vượt ga ${s.code}</button></section>` : ""}
  <section class="board" aria-label="Bảng các bước của ga">
    <div class="board-h"><span>Bước</span><span>${s.code} ${esc(s.name)}</span></div>
    <ol>${[1, 2, 3, 4, 5, 6].map(row).join("")}</ol>
  </section>
  ${(status === "stamped" || status === "passed") && hasB ? `<section class="step"><h2><span class="k">話</span>Luyện thêm sau khi qua ga</h2>
    <p class="tip">Hội thoại thứ hai của bài: nghe, đọc nhẩm theo, rồi đóng vai.</p>
    <button class="btn ghost" data-talkb="${sN}">Mở hội thoại thứ hai →</button></section>` : ""}`;
}

export function onClick(t: any): boolean {
  if (t.dataset.step) { startStep(sN, +t.dataset.step as StepNo); return true; }
  if (t.dataset.skip) { startStep(+t.dataset.skip, 6, { skip: true }); return true; }
  if (t.dataset.talkb) { openTalkForLesson(+t.dataset.talkb, `${t.dataset.talkb}b`); setView("talk"); return true; }
  return false;
}
