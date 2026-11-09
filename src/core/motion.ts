// Chuyển động: vào trang (lần lượt hiện), số đếm chạy, đồng hồ vòng lấp đầy, ray tàu tự vẽ,
// giờ trên bảng lật số, ánh sáng theo con trỏ, gợn sóng khi bấm, pháo sáng khi trả lời đúng.
// Người dùng bật "giảm chuyển động" trong máy → bỏ hết.
const still = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

const REVEAL = ".board,.kpis,.m-card,.card,.pcard,.kcard,.libcard,.tile,.xcard,.pgcard,.panel,.drill,.vlist,.bdg,.ekisign,.more,.note";

// số nguyên trong phần tử (bỏ qua <small> đi kèm) đếm từ 0 lên
function countUp(el: HTMLElement, delay: number) {
  const node = [...el.childNodes].find(n => n.nodeType === 3 && /^\s*\d+\s*$/.test(n.textContent || ""));
  if (!node) return;
  const to = parseInt(node.textContent!, 10);
  if (!to) return;
  const dur = 900, t0 = performance.now() + delay;
  node.textContent = "0";
  const tick = (now: number) => {
    const p = Math.min(1, Math.max(0, (now - t0) / dur));
    node.textContent = String(Math.round(to * ease(p)));
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// chữ số LED quay ngẫu nhiên rồi dừng đúng giá trị — như bảng lật 発車案内
function flap(el: HTMLElement, delay: number) {
  const final = el.textContent || "";
  if (!/\d/.test(final)) return;
  const t0 = performance.now() + delay, dur = 520;
  const tick = (now: number) => {
    const p = (now - t0) / dur;
    if (p >= 1) { el.textContent = final; return; }
    if (p > 0) {
      const keep = Math.floor(Math.max(0, p) * final.length);
      el.textContent = [...final].map((c, i) => (i < keep || !/\d/.test(c) ? c : String((Math.random() * 10) | 0))).join("");
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/** Gọi sau mỗi lần đổi tab: các khối hiện lần lượt, số đếm, vòng lấp đầy, ray vẽ ra. */
export function enterView() {
  const main = document.getElementById("main");
  if (!main || still()) return;
  const blocks = [...main.querySelectorAll<HTMLElement>(REVEAL)].filter(el => !el.parentElement?.closest(REVEAL)).slice(0, 16);
  blocks.forEach((el, i) => { el.style.setProperty("--d", `${i * 70}ms`); el.classList.remove("rv"); void el.offsetWidth; el.classList.add("rv"); });
  main.querySelectorAll<HTMLElement>(".kpi b, .gauge b.led, .bign").forEach((el, i) => countUp(el, 150 + i * 60));
  main.querySelectorAll<HTMLElement>(".bd-r .t").forEach((el, i) => flap(el, 200 + i * 90));
  main.querySelectorAll<SVGCircleElement>(".gauge .g-on").forEach((c, i) => {
    const full = c.getAttribute("stroke-dasharray") || "";
    c.style.transition = "none"; c.setAttribute("stroke-dasharray", "0 999");
    void c.getBoundingClientRect();
    c.style.transition = `stroke-dasharray 1.1s cubic-bezier(.2,.8,.2,1) ${250 + i * 110}ms`;
    c.setAttribute("stroke-dasharray", full);
  });
  main.querySelectorAll<SVGPathElement>(".route .rl-on").forEach(p => {
    const L = p.getTotalLength?.() || 0;
    if (L) p.animate([{ strokeDasharray: `0 ${L}` }, { strokeDasharray: `${L} ${L}` }], { duration: 1400, easing: "cubic-bezier(.3,.7,.2,1)", delay: 200, fill: "backwards" });
  });
}

/** Pháo sáng nhỏ bắn ra từ giữa phần tử (trả lời đúng). */
export function burst(at: Element | null, n = 14) {
  if (!at || still()) return;
  const r = at.getBoundingClientRect(), box = document.createElement("div");
  box.className = "burst"; box.style.left = `${r.left + r.width / 2}px`; box.style.top = `${r.top + r.height / 2}px`;
  const cols = ["var(--accent)", "var(--ok)", "var(--cyan)", "#FFF3D6"];
  for (let k = 0; k < n; k++) {
    const i = document.createElement("i"), a = (k / n) * Math.PI * 2 + Math.random() * 0.4, d = 70 + Math.random() * 80;
    i.style.cssText = `--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d}px;background:${cols[k % cols.length]}`;
    box.appendChild(i);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 900);
}

const SPOT = ".m-card,.pcard,.kcard,.libcard,.kpis,.tile,.xcard";
/** Gắn một lần: ánh sáng theo con trỏ + gợn sóng khi bấm nút. */
export function initMotion() {
  document.addEventListener("pointermove", e => {
    const el = (e.target as Element)?.closest?.(SPOT) as HTMLElement | null;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`); el.style.setProperty("--my", `${e.clientY - r.top}px`);
  }, { passive: true });
  document.addEventListener("pointerdown", e => {
    if (still()) return;
    const b = (e.target as Element)?.closest?.(".btn,.popt,.chip") as HTMLElement | null;
    if (!b || (b as HTMLButtonElement).disabled) return;
    const r = b.getBoundingClientRect(), s = Math.max(r.width, r.height) * 2.2, w = document.createElement("span");
    w.className = "ripple"; w.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
    b.appendChild(w); setTimeout(() => w.remove(), 650);
  }, { passive: true });
}
