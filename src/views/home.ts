// Tổng quan: bài đang học + 6 bước, số liệu chính, sơ đồ tuyến, ôn tập hôm nay, mức thành thạo, sổ dấu.
import { icon } from "../core/brand";
import { heatmap, mastery, readiness, reviewForecast } from "../core/metrics";
import { STEP_NAMES, currentStation, nextStep, pathState } from "../core/path";
import type { Q } from "../core/q";
import { buildReview } from "../core/reviewq";
import { S, streak } from "../core/store";
import { $, dayStr, esc } from "../core/util";
import { onboardHTML } from "./journey";
import { phraseOfDay } from "../core/phrase";
import { startReview } from "./player";
import { STEP_MIN, fmtMonth, lessonForms, lessonTitle, routeSVG } from "./ui";
import { stationOf } from "../core/route";
import { stepDone, stationStatus } from "../core/path";

// Bảng giờ tàu 発車案内: các việc còn lại hôm nay xếp thành chuyến, giờ tính từ bây giờ.
const STEP_JP = ["", "会話", "語彙", "文型", "助詞", "漢字", "試験"];
const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
let clockTimer = 0;
function tickClock() {
  if (clockTimer) return;
  clockTimer = window.setInterval(() => { const c = document.getElementById("hClock"); if (c) c.textContent = hhmm(new Date()); }, 15000);
}
export function boardRows(cur: number, due: number) {
  const st = stationOf(cur), nx = cur < 25 ? stationOf(cur + 1).name : "終点", all = stationStatus(cur) === "stamped";
  const rows: { k: string; n: string; g: string; m: number }[] = [];
  if (due) rows.push({ k: "復習", n: `Ôn ${due} mục đến hạn`, g: "—", m: Math.max(1, Math.ceil(due * 0.25)) });
  if (!all) for (let k = 1; k <= 6; k++) if (!stepDone(cur, k)) rows.push({ k: STEP_JP[k], n: `${STEP_NAMES[k]} · Bài ${cur}`, g: k === 6 ? "→ " + nx : st.name, m: STEP_MIN[k] });
  return rows;
}
function boardHTML(cur: number, due: number, step: number) {
  const st = stationOf(cur), rows = boardRows(cur, due), now = new Date();
  let t = now.getTime() + 60000, total = 0;
  const forms = lessonForms(cur).slice(0, 3).map(f => esc(f)).join("　·　");
  const body = rows.length ? rows.map((r, i) => {
    const at = hhmm(new Date(t)); t += r.m * 60000; total += r.m;
    const cls = i === 0 ? "on" : i === 1 ? "rdy" : "", stt = i === 0 ? "Đang mở cửa" : i === 1 ? "Sẵn sàng" : "Chờ";
    return `<div class="bd-r ${cls}" style="--i:${i}" role="row"><span class="t" role="cell">${at}</span><span class="k" role="cell" lang="ja"><span>${r.k}</span></span><span class="n" role="cell">${esc(r.n)}</span><span class="g" role="cell" lang="ja">${esc(r.g)}</span><span class="d" role="cell">${r.m} phút</span><span class="s" role="cell"><i></i>${stt}</span></div>`;
  }).join("") : `<div class="bd-r empty" style="--i:0">Hôm nay đã chạy hết các chuyến. Mở Lộ trình để chọn bài khác hoặc ôn thêm.</div>`;
  const label = due ? `Lên tàu · Ôn ${due} mục` : `Lên tàu · ${STEP_NAMES[step]}`;
  return `<section class="board" aria-label="Việc học hôm nay">
    <header class="bd-h"><span class="bd-ring" aria-hidden="true"></span><b lang="ja">発車案内</b><span class="sub">Tuyến N5 · Ga hiện tại <b lang="ja">${esc(st.name)}</b> · Bài ${cur}</span><span class="led bd-clock" id="hClock" aria-label="Giờ hiện tại">${hhmm(now)}</span></header>
    <div class="bd-ls"><div class="bd-no"><div><small>${st.code}</small><b>${String(cur).padStart(2, "0")}</b></div></div><div style="min-width:0"><h2>${esc(lessonTitle(cur))}</h2><p lang="ja">${forms}</p></div><div class="st" lang="ja"><b>${esc(st.name)}</b><small>${esc(st.kana)}</small></div></div>
    <div class="bd-cols" aria-hidden="true"><span>GIỜ</span><span>BƯỚC</span><span>NỘI DUNG</span><span>GA</span><span>THỜI LƯỢNG</span><span>TRẠNG THÁI</span></div>
    <div role="table" aria-label="Các chuyến hôm nay">${body}</div>
    <footer class="bd-f"><span class="sum">Tổng ${total} phút · chạy hết là tới ga <b lang="ja">${esc(cur < 25 ? stationOf(cur + 1).name : st.name)}</b></span>
      <span class="acts"><button class="lnk" data-station="${cur}">Xem bài ${cur}</button><button class="btn big go" id="jContinue">${label} <kbd>↵</kbd></button></span></footer>
  </section>`;
}

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
  const pct = (p: number) => Math.round(p * 100);
  tickClock();
  $("#main").innerHTML = `<div class="m-grid">
  <div class="m-col">
    ${boardHTML(cur, due, step)}
    <section class="kpis">
      <div class="kpi"><small>Chuỗi ngày học</small><b>${streak()}</b><em>14 ngày gần đây</em><div class="spark" aria-hidden="true">${hm.map(c => `<i class="${c.n ? "on" : ""}"></i>`).join("")}</div></div>
      <div class="kpi${due ? " hot" : ""}"><small>Cần ôn hôm nay</small><b>${due}</b><em>${due ? `~${Math.max(1, Math.ceil(due * 0.25))} phút` : "Đã ôn xong"}</em></div>
      <div class="kpi"><small>Từ đã thuộc</small><b>${m.vocab.done}</b><em>${pct(m.vocab.p)}% của ${m.vocab.total} từ</em></div>
      <div class="kpi"><small>Dự kiến xong N5</small><b>${fmtMonth(rd.date)}</b><em>${rd.perWeek ? `${String(rd.perWeek).replace(".", ",")} bài mỗi tuần` : "Qua 1 bài để ước tính"}</em></div>
    </section>
    <section class="m-card"><div class="m-ch"><h2>Lộ trình N5 · 東京 → 長崎</h2><span>${stamps}/25 bài đã đóng dấu · <button class="lnk" data-view="journey">Xem lộ trình</button></span></div>${routeSVG(cur)}</section>
  </div>
  <aside class="m-col">
    ${(() => { const ph = phraseOfDay(cur, today); return ph ? `<section class="m-card"><div class="m-ch"><h2>Câu của ngày</h2><span>Bài ${cur}</span></div>
      <div style="display:flex;gap:10px;align-items:flex-start"><button class="say" data-say="${esc(ph.kana)}" aria-label="Nghe">${icon("vol", 16)}</button><div><div lang="ja" style="font:500 16px/1.5 var(--jp)">${esc(ph.jp)}</div><div style="font-size:13px;color:var(--muted)">${esc(ph.vi)}</div></div></div>
      <p style="margin:10px 0 0;font-size:12.5px;color:var(--dim)">Đọc to 3 lần, thử dùng câu này một lần trong hôm nay.</p></section>` : ""; })()}
    ${reviewCard(due, br, today)}
    <section class="m-card"><div class="m-ch"><h2>Mức thành thạo</h2><button class="lnk" data-view="analytics">Chi tiết</button></div>
      ${[["Từ vựng", m.vocab.p, `${m.vocab.done}/${m.vocab.total}`, "var(--cyan)"], ["Kanji", m.kanji.p, `${m.kanji.done}/${m.kanji.total}`, "var(--accent)"], ["Ngữ pháp", m.grammar.p, `${m.grammar.done}/${m.grammar.total}`, "var(--ok)"], ["Trợ từ", m.particle.p, m.particle.total ? pct(m.particle.p) + "%" : "—", "var(--ok)"], ["Nghe", m.listening.p, m.listening.total ? pct(m.listening.p) + "%" : "—", "var(--bad)"]]
        .map(([t, p, v, c]) => `<div class="mbar" style="--c:${c}"><span style="text-align:left;font:13px var(--vi);color:var(--ink)">${t}</span><div class="t" role="img" aria-label="${t} ${pct(p as number)}%"><i style="width:${pct(p as number)}%"></i></div><span>${v}</span></div>`).join("")}</section>
    <section class="m-card"><div class="m-ch"><h2>Sổ dấu</h2><span>${stamps}/25</span></div>
      <div class="dots" role="img" aria-label="${stamps} trên 25 con dấu">${Array.from({ length: 25 }, (_, i) => `<i class="${P.st[i + 1]?.stamp ? "on" : i + 1 === cur ? "c" : ""}"></i>`).join("")}</div></section>
  </aside></div>`;
}

export function onClick(t: any): boolean {
  if (t.id === "rvStart") { startReview(); return true; }
  return false;
}
export const _icon = icon;
