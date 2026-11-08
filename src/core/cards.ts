// Thẻ dùng chung: dòng từ vựng, thẻ kanji, hình chữ cổ, hình minh hoạ từ vựng
import VOCAB_PIC from "../content/vocab_pic.json";
import { esc } from "./util";
import { kanaToRomaji } from "./kana";

// ---- hình chữ cổ: nạp lười (file lớn, tách chunk riêng). Chữ chưa có hình → không hiện gì.
let ANC: any = null;
export function loadAncient(onLoad?: () => void) {
  if (ANC) return Promise.resolve(ANC);
  return import("../content/kanji_ancient.json").then(m => { ANC = (m as any).default || m || {}; if (onLoad) onLoad(); return ANC; }).catch(() => (ANC = {}));
}
export const hasAncient = () => !!ANC && Object.keys(ANC).length > 0;
// Chữ cổ hiển thị qua <img src="data:…"> để SVG ngoài không chạy script và không đụng id trong trang.
const ANC_LBL: any = { o: "Giáp cốt", b: "Kim văn", s: "Triện" };
const ancSrc = (img: string) => img.startsWith("data:") ? img : "data:image/svg+xml;charset=utf-8," + encodeURIComponent(img); // SVG thô hoặc PNG đã là data URI
export function ancientHTML(ch: string) {
  const a = ANC && ANC[ch]; if (!a) return "";
  const fs = ["o", "b", "s"].filter(c => a[c]);
  if (!fs.length) return "";
  const src = a.src || {};
  return `<div class="anc" aria-label="Chữ ${esc(ch)} qua các thời kỳ">${fs.map(c => `<figure><img class="ancimg" src="${ancSrc(a[c])}" alt="${esc(ch)} – ${ANC_LBL[c]}" title="${esc(src[c] || "Wikimedia Commons")}"><figcaption>${ANC_LBL[c]}</figcaption></figure><span class="arr" aria-hidden="true">→</span>`).join("")}<figure><span class="ancnow jp">${esc(ch)}</span><figcaption>Ngày nay</figcaption></figure></div>`;
}
// "Gốc: … Hình: … Âm: …" → mỗi phần một dòng, nhãn in đậm
export function tipHTML(t: any) {
  const parts = String(t || "").split(/\s+(?=(?:Gốc|Hình|Âm|Lưu ý):)/);
  return parts.map(p => { const m = p.match(/^(Gốc|Hình|Âm|Lưu ý):\s*([\s\S]*)$/); return m ? `<div><b>${m[1]}:</b> ${esc(m[2].trim())}</div>` : `<div>${esc(p.trim())}</div>`; }).join("");
}
export const vPic = (w: any) => { const p = (VOCAB_PIC as any)[w[0] + "|" + w[3]]; return p ? `<span class="vpic" aria-hidden="true">${p}</span>` : ""; };

export function lvDots(st: any) { const lv = st ? st.lv : -1; return `<span class="lvd" title="${lv < 0 ? "chưa học" : lv >= 3 ? "đã thuộc" : "bậc " + lv + "/3"}">${[1, 2, 3].map(k => `<i class="${lv >= k ? "on" : ""}"></i>`).join("")}</span>`; }
export function vRow(w: any) {
  return `<div class="vrow"><button class="say" data-say="${esc(w[0])}" aria-label="Nghe"><svg class="i" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4zM17 8a5 5 0 0 1 0 8"/></svg></button>
    <div class="vmain"><div class="vjp"><span class="jp">${esc(w[0])}</span>${w[1] ? `<span class="vk jp">${esc(w[1])}</span>` : ""}</div><div class="ro">${esc(w[2])}</div></div>
    <div class="vmean"><div>${vPic(w)}${esc(w[3])}</div>${w[4] ? `<div class="vnote">${esc(w[4])}</div>` : ""}</div></div>`;
}
export function wordCard(w: any, big?: boolean) { return `<div class="vrow"><button class="say" data-say="${esc(w[0])}" aria-label="Nghe"><svg class="i" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4zM17 8a5 5 0 0 1 0 8"/></svg></button><div class="vmain"><div class="vjp"><span class="jp" ${big ? 'style="font-size:1.35rem"' : ""}>${esc(w[0])}</span>${w[1] ? `<span class="vk jp">${esc(w[1])}</span>` : ""}</div><div class="ro">${esc(w[2])}</div></div><div class="vmean"><div>${vPic(w).replace("vpic", "vpic big")}<b>${esc(w[3])}</b></div>${w[4] ? `<div class="vnote">${esc(w[4])}</div>` : ""}</div></div>`; }
export function kCard(k: any) { return `<div class="kcard"><div class="kbig">${esc(k.k)}</div><div class="kbody"><div><b>${esc(k.hv)}</b> · ${esc(k.mean)}</div>${ancientHTML(k.k)}<div class="kread"><span>On: <span class="jp">${esc(k.on)}</span></span><span>Kun: <span class="jp">${esc(k.kun)}</span></span></div><div class="ktip">${tipHTML(k.tip)}</div><div class="kex">${k.ex.map((e: any) => `<button class="kw" data-say="${esc(e[1])}"><span class="jp">${esc(e[0])}</span><span class="r">${esc(e[1])}</span><span class="m">${esc(e[2])}</span></button>`).join("")}</div></div></div>`; }

// câu vừa lưu vào Sổ câu: <svg class="i" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4zM17 8a5 5 0 0 1 0 8"/></svg> + romaji + 3 chấm "đọc to"
export function savedHTML(jp: string, vi: string, note: string, kana?: string) {
  const rd = kana || jp;
  return `<div class="fix ok"><span class="badge">✓ Đã lưu vào sổ câu</span>
    <div class="row" style="align-items:center"><div style="flex:1;min-width:0"><div class="jp">${esc(jp)}</div><div class="ro">${esc(kanaToRomaji(rd))}</div></div><button class="say" data-say="${esc(rd)}" aria-label="Nghe"><svg class="i" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4zM17 8a5 5 0 0 1 0 8"/></svg></button></div>
    ${vi ? `<div class="vi">${esc(vi)}</div>` : ""}${note ? `<div style="font-size:.88rem">${esc(note)}</div>` : ""}
    <div class="dots">Đọc to: <button class="dot" aria-pressed="false" aria-label="Lần 1"></button><button class="dot" aria-pressed="false" aria-label="Lần 2"></button><button class="dot" aria-pressed="false" aria-label="Lần 3"></button></div>
  </div>`;
}
// khung "Viết câu → so với ví dụ" (Kanji bước 四, Từ vựng bước 二). pre = tiền tố id
export function writeBoxHTML(pre: string, ask: string, hint: string) {
  return `<div class="prompt">
    <div class="ask">${ask}</div>
    <div class="h">${hint}</div>
    <textarea id="${pre}-txt" data-wsent="${pre}" rows="2" placeholder="Viết câu của bạn…" autocapitalize="off" spellcheck="false"></textarea>
    <div class="preview" id="${pre}-pv"></div>
    <input id="${pre}-vi" class="wvi" placeholder="Nghĩa tiếng Việt của câu (không bắt buộc, dùng khi ôn lại)" autocomplete="off">
    <div class="row" style="align-items:center;flex-wrap:wrap"><button class="btn accent" data-wcmp="${pre}">So với ví dụ</button><button class="btn ghost" data-wsave="${pre}">Lưu vào sổ câu</button><span class="status" id="${pre}-st"></span></div>
    <div id="${pre}-res"></div>
  </div>`;
}
// kết quả so: câu của người học + các câu ví dụ có chứa chữ/từ đang học
export function examplesHTML(own: string, ownKana: string, ex: any[], none: string) {
  return `<div class="fix"><span class="badge">So với ví dụ</span>
    ${own ? `<div><div class="tip">Câu của bạn</div><div class="jp">${esc(ownKana)}</div>${ownKana !== own ? `<div class="ro">${esc(own)}</div>` : ""}</div>` : ""}
    ${ex.length ? `<div class="tip">Câu ví dụ có chứa từ đang học (lấy từ bài ngữ pháp, bài luyện trợ từ, đề luyện thi):</div>
    <div class="exl">${ex.map(e => `<div class="row" style="align-items:center"><div style="flex:1;min-width:0"><div class="jp">${e.html}</div>${e.vi ? `<div class="tip">${esc(e.vi)}</div>` : ""}</div><button class="say" data-say="${esc(e.s)}" aria-label="Nghe"><svg class="i" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4zM17 8a5 5 0 0 1 0 8"/></svg></button></div>`).join("")}</div>`
    : `<div class="tip">${none}</div>`}
    <div class="tip">Tự đối chiếu: trợ từ, đuôi câu, cách dùng từ. Thấy ổn thì bấm “Lưu vào sổ câu” để hôm sau ôn lại.</div>
  </div>`;
}
