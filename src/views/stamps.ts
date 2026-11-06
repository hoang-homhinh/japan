// Sổ con dấu ga: 25 ô, ô đã qua ga có dấu; và khoảnh khắc "đóng dấu" khi vừa qua ga.
import { penguin } from "../core/mascot";
import { pathState } from "../core/path";
import { STATIONS, stationOf } from "../core/route";
import { stampSVG } from "../core/stamp";
import { $, esc } from "../core/util";
import { setView } from "../app/shell";

let moment: { n: number; score: number } | null = null;

export function showStampMoment(n: number, score: number) { moment = { n, score }; setView("stamps"); }

export function renderStamps() {
  const st = pathState().st;
  if (moment) {
    const { n, score } = moment; moment = null;
    const s = stationOf(n), nx = n < 25 ? stationOf(n + 1) : null;
    $("#main").innerHTML = `<section class="smoment">
      <div class="sdrop">${stampSVG(n, 220, st[n]?.stamp || "")}</div>
      <h2>Đã qua ga ${s.code} ${esc(s.name)}!</h2>
      <p>Kiểm tra đúng ${Math.round(score * 100)}%. Con dấu đã vào sổ.</p>
      <div class="pensay" style="justify-content:center">${penguin("cheer", 72)}<div class="bubble"><span class="jp">おめでとう！</span><span>${nx ? `Ga tiếp theo: ${nx.code} ${esc(nx.name)}` : "Bạn đã đi hết tuyến N5!"}</span></div></div>
      <div class="row" style="flex-wrap:wrap;justify-content:center">${nx ? `<button class="btn accent big" data-view="journey">Đi tiếp tới ${nx.code} →</button>` : ""}<button class="btn ghost" data-view="stamps">Xem sổ dấu</button></div>
    </section>`;
    return;
  }
  const have = STATIONS.filter(s => st[s.n]?.stamp).length;
  $("#main").innerHTML = `
  <div class="row" style="margin-top:12px"><button class="lnk" data-view="journey">← Bản đồ tuyến</button></div>
  <h2 class="sbook-h">Sổ dấu ga · ${have}/25</h2>
  <p class="tip">Ở Nhật, mỗi ga có một con dấu riêng để du khách sưu tầm. Qua mỗi ga (đạt bài Kiểm tra) bạn nhận được con dấu của ga đó.</p>
  <div class="sbook">${STATIONS.map(s => st[s.n]?.stamp
    ? `<div class="sslot has">${stampSVG(s.n, 104, st[s.n].stamp)}</div>`
    : `<div class="sslot"><span>${s.code}</span><small>${esc(s.name)}</small></div>`).join("")}</div>`;
}
