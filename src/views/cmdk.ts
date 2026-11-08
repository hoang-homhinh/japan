// Bảng lệnh Ctrl K: tìm từ vựng, kanji, mẫu câu, ga và màn hình. <dialog> mở bằng showModal(),
// đóng bằng Esc / bấm ra ngoài (closedby="any" + dự phòng cho trình duyệt chưa hỗ trợ).
import { KANJI, VOCAB } from "../content/data";
import { LESSONS } from "../content/lessons";
import { STATIONS } from "../core/route";
import { esc } from "../core/util";

type Hit = { k: string; m: string; g: string; go: string };
let INDEX: Hit[] | null = null;
const VIEWS: [string, string][] = [["home", "Tổng quan"], ["journey", "Lộ trình N5"], ["reviewq", "Ôn tập hôm nay"], ["analytics", "Phân tích"], ["exam", "Luyện thi N5"], ["library", "Thư viện"], ["stamps", "Thành tích & sổ dấu"], ["vocab", "Tra từ vựng"], ["kanji", "Kanji theo chương"], ["particle", "Trợ từ"], ["talk", "Hội thoại"], ["learn", "Mẫu câu"], ["account", "Tài khoản & sao lưu"]];

function index(): Hit[] {
  if (INDEX) return INDEX;
  const out: Hit[] = VIEWS.map(([v, t]) => ({ k: t, m: "", g: "Màn hình", go: "view:" + v }));
  for (const s of STATIONS) out.push({ k: `${s.code} ${s.name}`, m: `Bài ${s.n} · ${LESSONS.find((l: any) => l.n === s.n)?.title || ""}`, g: "Bài", go: "station:" + s.n });
  for (const L of VOCAB) for (const g of L.groups) for (const w of g.w) out.push({ k: w[1] ? `${w[0]} ${w[1]}` : w[0], m: `${w[3]} · ${w[2]}`, g: `Từ · bài ${L.n}`, go: "station:" + Math.min(L.n, 25) });
  for (const c of KANJI) for (const g of c.groups) for (const k of g.kanji) out.push({ k: k.k, m: `${k.hv} · ${k.mean}`, g: "Kanji", go: "view:kanji" });
  for (const L of LESSONS) for (const p of L.patterns) out.push({ k: p.form, m: p.mean, g: `Mẫu câu · bài ${L.n}`, go: "station:" + L.n });
  return (INDEX = out);
}
const fold = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");

function search(q: string): Hit[] {
  const f = fold(q.trim());
  if (!f) return index().slice(0, 12);
  const hits: [number, Hit][] = [];
  for (const h of index()) {
    const a = fold(h.k), b = fold(h.m);
    const s = a.startsWith(f) ? 0 : a.includes(f) ? 1 : b.includes(f) ? 2 : -1;
    if (s >= 0) hits.push([s, h]);
    if (hits.length > 400) break;
  }
  return hits.sort((x, y) => x[0] - y[0]).slice(0, 40).map(x => x[1]);
}

let dlg: HTMLDialogElement | null = null, sel = 0, hits: Hit[] = [];
function list() {
  const ul = dlg!.querySelector("ul")!;
  ul.innerHTML = hits.length ? hits.map((h, i) => `<li><button type="button" data-cmd="${esc(h.go)}" aria-selected="${i === sel}"><span class="k">${esc(h.k)}</span><span class="m">${esc(h.m)}</span><span class="g">${esc(h.g)}</span></button></li>`).join("") : `<li class="empty">Không tìm thấy. Thử gõ nghĩa tiếng Việt, kana hoặc romaji.</li>`;
  ul.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
}
export function openCmd(go: (target: string) => void) {
  if (!dlg) {
    dlg = document.createElement("dialog");
    dlg.className = "cmdk"; dlg.setAttribute("closedby", "any"); dlg.setAttribute("aria-label", "Tìm kiếm");
    dlg.innerHTML = `<input type="search" autofocus placeholder="Tìm từ, kanji, mẫu câu, bài…" aria-label="Tìm kiếm"><ul role="listbox"></ul>`;
    document.body.append(dlg);
    const inp = dlg.querySelector("input")!;
    inp.addEventListener("input", () => { sel = 0; hits = search(inp.value); list(); });
    inp.addEventListener("keydown", e => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(0, Math.min(hits.length - 1, sel + (e.key === "ArrowDown" ? 1 : -1))); list(); }
      if (e.key === "Enter" && !e.isComposing && hits[sel]) { e.preventDefault(); dlg!.close(); go(hits[sel].go); }
    });
    dlg.addEventListener("click", e => { const b = (e.target as HTMLElement).closest("[data-cmd]") as HTMLElement | null; if (b) { dlg!.close(); go(b.dataset.cmd!); } });
    // dự phòng light-dismiss cho trình duyệt chưa có closedby
    if (!("closedBy" in HTMLDialogElement.prototype)) dlg.addEventListener("click", e => {
      if (e.target !== dlg) return;
      const r = dlg!.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dlg!.close();
    });
  }
  const inp = dlg.querySelector("input")!;
  inp.value = ""; sel = 0; hits = search(""); list();
  dlg.showModal();
}
export const _search = search; // cho kiểm thử
