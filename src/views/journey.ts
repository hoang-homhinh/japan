// Lộ trình N5: sơ đồ tuyến 25 bài + danh sách từng bài với trạng thái. Lần đầu: chọn "đang học tới bài mấy".
import { icon } from "../core/brand";
import { currentStation, nextStep, pathState, setStart, stationStatus, STEP_NAMES } from "../core/path";
import { STATIONS } from "../core/route";
import { S } from "../core/store";
import { $, esc } from "../core/util";
import { lessonTitle, routeSVG } from "./ui";

export function onboardHTML() {
  const up = Math.min(Math.max(S.progress.upto || 13, 1), 25);
  return `<section class="m-card" style="max-width:640px;margin-top:8px">
    <div class="eyebrow"><i></i>Bắt đầu</div>
    <h2 style="font-size:20px;margin:6px 0">Bạn đang học tới bài mấy?</h2>
    <p style="color:var(--muted);margin:0 0 16px">Lộ trình N5 gồm 25 bài theo Minna no Nihongo, mỗi bài là một ga trên tuyến 東京 → 長崎. Các bài trước bài bạn chọn sẽ mở sẵn để ôn lại.</p>
    <div class="row" style="align-items:center;flex-wrap:wrap;gap:10px"><label for="obLesson" class="sr-only">Bài đang học</label>
      <select id="obLesson" style="font:inherit;padding:9px 12px;border-radius:8px;border:1px solid var(--line);background:var(--card);color:var(--ink)">${STATIONS.map(s => `<option value="${s.n}" ${s.n === up ? "selected" : ""}>Bài ${s.n} · ${s.code} ${s.name} · ${esc(lessonTitle(s.n))}</option>`).join("")}</select>
      <button class="btn" id="obGo">Bắt đầu học</button></div>
  </section>`;
}

export function renderJourney() {
  if (!S.progress.path) { $("#main").innerHTML = onboardHTML(); return; }
  const P = pathState(), cur = currentStation();
  const passed = STATIONS.filter(s => ["passed", "stamped"].includes(stationStatus(s.n))).length;
  const row = (n: number) => {
    const s = STATIONS[n - 1], st = stationStatus(n), stamp = String(P.st[n]?.stamp || "");
    const txt = st === "current" ? `Đang học · ${STEP_NAMES[nextStep(n)]}` : st === "stamped" ? `Đóng dấu ${esc(stamp.slice(8, 10))}/${esc(stamp.slice(5, 7))}` : st === "passed" ? "Đã đi qua" : "Chưa tới";
    return `<button class="str${st === "current" ? " cur" : st === "locked" ? " lock" : ""}" data-station="${n}">
      <span class="cd">${s.code}</span><span class="nm" lang="ja">${esc(s.name)}</span><span class="ti">Bài ${n} · ${esc(lessonTitle(n))}</span>
      <span class="stt">${st === "stamped" ? `<span class="hk" lang="ja" aria-hidden="true">${esc(s.name[0])}</span>` : ""}${txt}</span>${icon("arrow", 16)}</button>`;
  };
  $("#main").innerHTML = `<div class="m-col" style="margin-top:4px">
    <section class="m-card"><div class="m-ch"><h2>Tuyến N5 · 東京 → 長崎</h2><span>${passed}/25 bài đã qua</span></div>${routeSVG(cur)}</section>
    <section class="m-card" style="padding-block:8px"><div class="stlist">${STATIONS.map(s => row(s.n)).join("")}</div></section>
  </div>`;
}

export function onClick(t: any): boolean {
  if (t.id === "obGo") { setStart(+($("#obLesson") as any).value); renderJourney(); return true; }
  return false;
}
