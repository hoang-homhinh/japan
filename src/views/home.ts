// Tổng quan: bài đang học + 6 bước, số liệu chính, sơ đồ tuyến, ôn tập hôm nay, mức thành thạo, sổ dấu.
import { icon } from "../core/brand";
import { heatmap, mastery, readiness, reviewForecast } from "../core/metrics";
import { STEP_NAMES, currentStation, nextStep, pathState } from "../core/path";
import type { Q } from "../core/q";
import { buildReview } from "../core/reviewq";
import { S, streak } from "../core/store";
import { $, dayStr, esc } from "../core/util";
import { onboardHTML } from "./journey";
import { startReview } from "./player";
import { ekiSign, fmtMonth, lessonForms, lessonTitle, routeSVG, stepper } from "./ui";

const WD = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
export function reviewBreakdown(qs: Q[]) {
  const c = { v: 0, k: 0, g: 0 };
  for (const q of qs) { if (q.kind === "particle" || q.kind === "exam") c.g++; else if ((q as any).track?.id?.[0] === "k") c.k++; else c.v++; }
  return c;
}
export function reviewCard(due: number, br: { v: number; k: number; g: number }, today: string, btnId = "rvStart") {
  const fc = reviewForecast(today, 7), max = Math.max(1, ...fc.map(c => c.n));
  return `<section class="m-card"><div class="m-ch"><h2>Ôn tập hôm nay</h2><span>${due ? `~${Math.max(1, Math.ceil(due * 0.25))} phút` : "Đã xong"}</span></div>
    <div class="bign">${due}<small>mục đến hạn</small></div>
    <div class="brk"><div><i style="background:var(--accent)"></i>Từ vựng<span>${br.v}</span></div><div><i style="background:var(--navy)"></i>Kanji<span>${br.k}</span></div><div><i style="background:var(--dim)"></i>Trợ từ, đề thi<span>${br.g}</span></div></div>
    <button class="btn ${due ? "" : "ghost"}" id="${btnId}" style="width:100%;justify-content:center" ${due ? "" : "disabled"}>${due ? "Bắt đầu ôn" : "Không còn mục nào"}</button>
    <div style="margin:16px 0 6px;font-size:12.5px;color:var(--dim)">7 ngày tới</div>
    <div class="fc" aria-hidden="true">${fc.map((c, i) => `<div class="${i ? "" : "t"}" style="height:${(c.n / max) * 100}%"></div>`).join("")}</div>
    <div class="fcl">${fc.map((c, i) => `<span>${i ? WD[new Date(c.d + "T00:00:00").getDay()] : "Nay"}</span>`).join("")}</div>
    <p class="sr-only">${fc.map(c => `${c.d}: ${c.n} mục`).join(", ")}</p></section>`;
}

export function renderHome() {
  if (!S.progress.path) { $("#main").innerHTML = onboardHTML(); return; }
  const today = dayStr(), P = pathState(), cur = currentStation(), step = nextStep(cur);
  const qs = buildReview(undefined, 15, 10, false), due = qs.length, br = reviewBreakdown(qs);
  const m = mastery(), rd = readiness(today), hm = heatmap(today, 2).slice(-14);
  const stamps = Object.values<any>(P.st).filter(s => s.stamp).length;
  const forms = lessonForms(cur).slice(0, 3).map(f => esc(f)).join(" · ");
  const pct = (p: number) => Math.round(p * 100);
  $("#main").innerHTML = `<div class="m-grid">
  <div class="m-col">
    <section class="m-card hero2"><div class="hrow">${ekiSign(cur)}
      <div class="hmeta"><div class="eyebrow"><i></i>Đang học · Bài ${cur}</div><h2>${esc(lessonTitle(cur))}</h2><p lang="ja">${forms}</p></div>
      <div class="hcta"><button class="btn big" id="jContinue">${due ? `Ôn ${due} mục, rồi học ${STEP_NAMES[step]}` : `Tiếp tục · ${STEP_NAMES[step]}`} <kbd>↵</kbd></button>
        <span class="sub"><button class="lnk" data-station="${cur}">Xem bài ${cur}</button></span></div></div>
      ${stepper(cur)}</section>
    <section class="kpis">
      <div class="kpi"><small>Chuỗi ngày học</small><b>${streak()}</b><em>14 ngày gần đây</em><div class="spark" aria-hidden="true">${hm.map(c => `<i class="${c.n ? "on" : ""}"></i>`).join("")}</div></div>
      <div class="kpi"><small>Cần ôn hôm nay</small><b>${due}</b><em>${due ? `~${Math.max(1, Math.ceil(due * 0.25))} phút` : "Đã ôn xong"}</em></div>
      <div class="kpi"><small>Từ đã thuộc</small><b>${m.vocab.done}</b><em>${pct(m.vocab.p)}% của ${m.vocab.total} từ</em></div>
      <div class="kpi"><small>Dự kiến xong N5</small><b>${fmtMonth(rd.date)}</b><em>${rd.perWeek ? `${String(rd.perWeek).replace(".", ",")} bài mỗi tuần` : "Qua 1 bài để ước tính"}</em></div>
    </section>
    <section class="m-card"><div class="m-ch"><h2>Lộ trình N5 · 東京 → 長崎</h2><span>${stamps}/25 bài đã đóng dấu · <button class="lnk" data-view="journey">Xem lộ trình</button></span></div>${routeSVG(cur)}</section>
  </div>
  <aside class="m-col">
    ${reviewCard(due, br, today)}
    <section class="m-card"><div class="m-ch"><h2>Mức thành thạo</h2><button class="lnk" data-view="analytics">Chi tiết</button></div>
      ${[["Từ vựng", m.vocab.p, `${m.vocab.done}/${m.vocab.total}`], ["Kanji", m.kanji.p, `${m.kanji.done}/${m.kanji.total}`], ["Ngữ pháp", m.grammar.p, `${m.grammar.done}/${m.grammar.total}`], ["Trợ từ", m.particle.p, m.particle.total ? pct(m.particle.p) + "%" : "—"], ["Nghe", m.listening.p, m.listening.total ? pct(m.listening.p) + "%" : "—"]]
        .map(([t, p, v]) => `<div class="mbar"><span style="text-align:left;font:13px var(--vi);color:var(--ink)">${t}</span><div class="t" role="img" aria-label="${t} ${pct(p as number)}%"><i style="width:${pct(p as number)}%"></i></div><span>${v}</span></div>`).join("")}</section>
    <section class="m-card"><div class="m-ch"><h2>Sổ dấu</h2><span>${stamps}/25</span></div>
      <div class="dots" role="img" aria-label="${stamps} trên 25 con dấu">${Array.from({ length: 25 }, (_, i) => `<i class="${P.st[i + 1]?.stamp ? "on" : i + 1 === cur ? "c" : ""}"></i>`).join("")}</div></section>
  </aside></div>`;
}

export function onClick(t: any): boolean {
  if (t.id === "rvStart") { startReview(); return true; }
  return false;
}
export const _icon = icon;
