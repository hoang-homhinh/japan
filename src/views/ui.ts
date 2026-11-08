// Khối giao diện dùng chung của Michi: biển tên ga, thanh 6 bước, sơ đồ tuyến 25 ga.
import { LESSONS } from "../content/lessons";
import { STEP_NAMES, nextStep, stationStatus, stepDone } from "../core/path";
import { STATIONS, stationOf } from "../core/route";
import { esc } from "../core/util";

export const STEP_MIN = [0, 3, 6, 8, 4, 5, 6];
export const lessonTitle = (n: number) => LESSONS.find((l: any) => l.n === n)?.title || "";
export const lessonForms = (n: number) => (LESSONS.find((l: any) => l.n === n)?.patterns || []).map((p: any) => p.form);

export function ekiSign(n: number, lg = false) {
  const s = stationOf(n), prev = n > 1 ? stationOf(n - 1).name : "", next = n < 25 ? stationOf(n + 1).name : "";
  return `<div class="ekisign${lg ? " lg" : ""}" lang="ja"><div class="ek-top"><span class="ek-num"><small>N</small>${n}</span><div><span class="ek-nm">${esc(s.name)}</span><span class="ek-rd">${esc(s.kana)} · ${s.code}</span></div></div>
  <div class="ek-bar"><span>${prev ? "← " + esc(prev) : ""}</span><span>${next ? esc(next) + " →" : "終点"}</span></div></div>`;
}

// thanh 6 bước của một ga: xong / đang tới / chưa
export function stepper(n: number, compact = false) {
  const status = stationStatus(n), nx = nextStep(n), all = status === "stamped";
  return `<ol class="stp${compact ? " sm" : ""}" aria-label="6 bước của bài">${[1, 2, 3, 4, 5, 6].map(k => {
    const d = all || stepDone(n, k), c = !d && k === nx && status !== "locked";
    return `<li class="${d ? "d" : c ? "c" : ""}"><span class="nd">${d ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>` : ""}</span><b>${STEP_NAMES[k]}</b><small>${d ? "Xong" : c ? "Đang học" : `~${STEP_MIN[k]} phút`}</small><span class="sr-only">${d ? "đã xong" : c ? "đang học" : "chưa học"}</span></li>`;
  }).join("")}</ol>`;
}

// sơ đồ tuyến kiểu tàu điện: 2 hàng (13 + 12 ga), quay đầu ở phải
export function routeSVG(cur: number) {
  const pos: [number, number][] = [];
  for (let i = 0; i < 13; i++) pos.push([40 + i * 62, 70]);
  for (let i = 0; i < 12; i++) pos.push([747 - i * 62, 220]);
  const full = `M20 70 H778 A75 75 0 0 1 778 220 H${pos[24][0] - 20}`;
  // đoạn đã đi: tới ga hiện tại
  const [cx, cy] = pos[cur - 1];
  const done = cur <= 13 ? `M20 70 H${cx}` : `M20 70 H778 A75 75 0 0 1 778 220 H${cx}`;
  let s = `<path class="rl-bg" d="${full}"/><path class="rl-on" d="${done}"/><path class="rl-flow" d="${done}" pathLength="100"/>`;
  STATIONS.forEach((st, i) => {
    const [x, y] = pos[i], status = stationStatus(st.n);
    const cls = status === "current" ? "cur" : status === "stamped" ? "stamped done" : status === "passed" ? "done" : "lock";
    const label = `${st.code} ${st.name}, ${status === "current" ? "đang học" : status === "stamped" ? "đã đóng dấu" : status === "passed" ? "đã đi qua" : "chưa tới"}`;
    s += `<g class="st ${cls}" data-station="${st.n}" tabindex="0" role="button" aria-label="${esc(label)}">`;
    if (status === "current") s += `<circle class="halo" cx="${x}" cy="${y}" r="16"/><circle class="dot" cx="${x}" cy="${y}" r="9"/>`;
    else s += `<circle class="dot" cx="${x}" cy="${y}" r="5.5"/>`;
    s += `<rect x="${x - 30}" y="${y - 14}" width="60" height="62" fill="transparent"/>`;
    s += `<text x="${x}" y="${y + 28}" lang="ja">${esc(st.name)}</text><text class="cd" x="${x}" y="${y + 43}">${st.code}</text></g>`;
  });
  s += `<g class="here" aria-hidden="true" transform="translate(${cx - 44},${cy - 60})"><rect width="88" height="24" rx="6"/><path d="M38 24 L44 30 L50 24Z"/><text x="44" y="16.5">Bạn ở đây</text></g>`;
  return `<div class="route"><svg viewBox="0 0 870 280" role="group" aria-label="Sơ đồ tuyến N5, 25 bài">${s}</svg></div>`;
}

export const fmtMonth = (d: string | null) => (d ? `${d.slice(5, 7)}/${d.slice(0, 4)}` : "—");
