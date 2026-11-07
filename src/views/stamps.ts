// Thành tích: sổ dấu 25 bài + huy hiệu; và khoảnh khắc "đóng dấu" khi vừa qua bài.
import { icon } from "../core/brand";
import { badges } from "../core/metrics";
import { pathState } from "../core/path";
import { STATIONS, stationOf } from "../core/route";
import { stampSVG } from "../core/stamp";
import { $, dayStr, esc } from "../core/util";
import { setView } from "../app/shell";
import { ekiSign, lessonTitle } from "./ui";

let moment: { n: number; score: number } | null = null;

export function showStampMoment(n: number, score: number) { moment = { n, score }; setView("stamps"); }

export function renderStamps() {
  const st = pathState().st;
  if (moment) {
    const { n, score } = moment; moment = null;
    const nx = n < 25 ? stationOf(n + 1) : null;
    $("#main").innerHTML = `<section class="m-card" style="max-width:640px;margin:8px auto;display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center">
      <div class="sdrop">${stampSVG(n, 180, st[n]?.stamp || "")}</div>
      <div class="eyebrow"><i></i>Đã qua bài ${n} · đúng ${Math.round(score * 100)}%</div>
      <h2 style="margin:0;font-size:22px">${esc(lessonTitle(n))}</h2>
      <p style="margin:0;color:var(--muted)">Con dấu ${esc(stationOf(n).name)} đã vào sổ. ${nx ? `Bài tiếp theo: ${nx.code} ${esc(nx.name)} · ${esc(lessonTitle(nx.n))}.` : "Bạn đã đi hết tuyến N5."}</p>
      ${nx ? ekiSign(nx.n) : ""}
      <div class="row" style="flex-wrap:wrap;justify-content:center;gap:8px">${nx ? `<button class="btn big" data-station="${nx.n}">Sang bài ${nx.n}</button>` : ""}<button class="btn ghost" data-view="stamps">Xem sổ dấu</button></div>
    </section>`;
    return;
  }
  const have = STATIONS.filter(s => st[s.n]?.stamp).length, B = badges(dayStr()), got = B.filter(b => b.got).length;
  $("#main").innerHTML = `<div class="m-col" style="margin-top:4px">
  <section class="m-card"><div class="m-ch"><h2>Sổ dấu</h2><span>${have}/25 · qua bài kiểm tra (đạt 70%) để nhận dấu của bài</span></div>
    <div class="sbook">${STATIONS.map(s => st[s.n]?.stamp
      ? `<button class="sslot has" data-station="${s.n}" aria-label="${s.code} ${esc(s.name)}, đã đóng dấu">${stampSVG(s.n, 96, st[s.n].stamp)}</button>`
      : `<button class="sslot" data-station="${s.n}"><span>${s.code}</span><small lang="ja">${esc(s.name)}</small></button>`).join("")}</div></section>
  <section class="m-card"><div class="m-ch"><h2>Huy hiệu</h2><span>${got}/${B.length}</span></div>
    <div class="badges">${B.map(b => `<div class="bdg${b.got ? " got" : ""}"><span class="bi">${icon(b.got ? "check" : "medal", 18)}</span><div style="flex:1;min-width:0"><b>${esc(b.t)}</b><small>${esc(b.d)} · ${Math.min(b.v, b.goal)}/${b.goal}</small>
      <div class="pg"><i style="width:${Math.min(100, (b.v / b.goal) * 100)}%"></i></div></div></div>`).join("")}</div></section></div>`;
}
