// Màn chính: bản đồ tuyến tàu 25 ga (khối sân ga nổi 3D trên đường ray), biển "Tiếp tục" cố định đáy.
// Lần đầu: hỏi "đang học tới bài mấy" để bắt đầu đúng ga.
import { penguin } from "../core/mascot";
import { STEP_NAMES, currentStation, nextStep, pathState, setStart, stationStatus } from "../core/path";
import { buildReview } from "../core/reviewq";
import { STATIONS, stationOf } from "../core/route";
import { S, dailyGet, streak } from "../core/store";
import { $, esc } from "../core/util";

const GAP = 118;                       // khoảng cách dọc giữa 2 ga (px)
const xOf = (n: number) => 50 + 30 * Math.sin(n * 0.95); // vị trí ngang (%), uốn lượn
let introDone = false;                 // khoảnh khắc mở màn (tàu lăn tới ga) chỉ 1 lần mỗi lần mở app

function railPath(): string {
  // đường cong mượt đi qua tâm các ga; toạ độ x theo % của bề rộng 100
  const pts = STATIONS.map(s => [xOf(s.n), (s.n - 1) * GAP + 60]);
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; const my = (y0 + y1) / 2; d += ` C ${x0} ${my}, ${x1} ${my}, ${x1} ${y1}`; }
  return d;
}

function onboardHTML() {
  const up = Math.min(Math.max(S.progress.upto || 13, 1), 25);
  return `<section class="onboard">
    <div class="pensay">${penguin("hi", 72)}<div class="bubble"><b>Chào mừng lên tàu N5!</b><span>Mỗi ga là một bài Minna. Bạn đang học tới bài mấy? Các ga trước đó sẽ được mở sẵn.</span></div></div>
    <div class="row" style="align-items:center;flex-wrap:wrap"><label for="obLesson">Tôi đang học tới</label>
      <select id="obLesson">${STATIONS.map(s => `<option value="${s.n}" ${s.n === up ? "selected" : ""}>Bài ${s.n} · ${s.code} ${s.name}</option>`).join("")}</select>
      <button class="btn accent" id="obGo">Bắt đầu hành trình</button></div>
  </section>`;
}

export function renderJourney() {
  if (!S.progress.path) { $("#main").innerHTML = onboardHTML(); return; }
  const P = pathState(), cur = currentStation(), st = stationOf(cur), step = nextStep(cur);
  const stamps = Object.values(P.st).filter(s => s.stamp).length;
  const due = buildReview(undefined, 15, 10, false).length;
  const node = (n: number) => {
    const s = stationOf(n), status = stationStatus(n);
    const lock = status === "locked";
    return `<button class="platform st-${status}" data-station="${n}" style="--x:${xOf(n)}%;--y:${(n - 1) * GAP + 60}px" aria-label="${s.code} ${s.name}, ${lock ? "chưa tới" : status === "stamped" ? "đã đóng dấu" : status === "current" ? "ga đang đi" : "đã đi qua"}">
      <span class="pf-top"><span class="pf-code">${s.code}</span><span class="pf-name">${esc(s.name)}</span></span>
      ${status === "stamped" ? `<span class="pf-stamp" aria-hidden="true">${s.motif}</span>` : lock ? `<span class="pf-lock" aria-hidden="true">🔒</span>` : ""}
    </button>`;
  };
  $("#main").innerHTML = `
  <section class="jhead">
    <div class="jstat"><b>${cur}</b><span>/25 ga</span></div>
    <div class="jstat"><b>${stamps}</b><span>dấu ga</span></div>
    <div class="jstat"><b>${streak()}</b><span>ngày liên tục</span></div>
    <button class="btn ghost" data-view="stamps">Sổ dấu</button>
  </section>
  <div class="goalrail" aria-label="Mục tiêu hôm nay"><span>Hôm nay ${Math.min(dailyGet().path || 0, P.goal)}/${P.goal} lượt</span><i style="--p:${Math.min(1, (dailyGet().path || 0) / P.goal)}"></i>${(dailyGet().path || 0) >= P.goal ? "<b>✓ tàu đã tới ga</b>" : ""}</div>
  <section class="routemap" style="height:${25 * GAP + 40}px" aria-label="Bản đồ tuyến N5">
    <svg class="rails" viewBox="0 0 100 ${25 * GAP + 40}" preserveAspectRatio="none" aria-hidden="true">
      <path class="rail-bed" d="${railPath()}"/><path class="rail-ties" d="${railPath()}"/><path class="rail-line" d="${railPath()}"/>
    </svg>
    ${STATIONS.map(s => node(s.n)).join("")}
    <div class="train${introDone ? "" : " arrive"}" style="--x:${xOf(cur)}%;--y:${(cur - 1) * GAP + 60}px;--from:${Math.max(cur - 2, 0) * GAP + 60}px" aria-hidden="true"><span class="car">🚃</span>${penguin("hi", 40)}</div>
  </section>
  <div class="continue">
    <div class="sign">
      <span class="sign-code">${st.code}</span>
      <span class="sign-name"><b>${esc(st.name)}</b><small>${esc(st.kana)}</small></span>
      <span class="sign-step">Bài ${cur} · Bước ${step}/6 — ${STEP_NAMES[step]}${due ? ` · ôn ${due} câu trước` : ""}</span>
    </div>
    <button class="btn accent big" id="jContinue">▶ Tiếp tục hành trình</button>
  </div>`;
  introDone = true;
  // cuộn tới ga đang đi sau khi setView đã cuộn về đầu trang
  setTimeout(() => { const el = document.querySelector(`.platform[data-station="${cur}"]`) as any; if (el) el.scrollIntoView({ block: "center" }); }, 0);
}

export function onClick(t: any): boolean {
  if (t.id === "obGo") { setStart(+($("#obLesson") as any).value); renderJourney(); return true; }
  return false;
}
