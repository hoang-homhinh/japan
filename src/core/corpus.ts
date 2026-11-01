// Kho câu ví dụ có sẵn (không cần AI): câu mẫu ngữ pháp, đáp án bài thay thế, câu luyện trợ từ, câu trong đề thi.
// Dùng cho: câu điền từ ở bậc 3 (Hôm nay) và "Viết câu → so với ví dụ" (Kanji, Từ vựng).
import { LESSONS } from "../content/lessons";
import { PT_DRILLS } from "../content/drills";
import { EXAM_BANK } from "../content/exam/index";
import { VOCAB } from "../content/data";
import { VFLAT } from "./srs";
import { esc, fold, hashStr, seeded } from "./util";
import { vVariants } from "../views/vocab";

type Sent = { s: string; vi: string; l: number };
let CORPUS: Sent[] | null = null;

const fillBlank = (s: string, a: string) => s.replace(/（[\s　]*）/, a === "×" ? "" : a);
export function corpus(): Sent[] {
  if (CORPUS) return CORPUS;
  const seen = new Set<string>(), out: Sent[] = [];
  const add = (s: any, vi: any, l: any) => {
    String(s || "").split("\n").forEach(line => {
      const t = line.replace(/^[A-ZＡ-Ｚ男女]\s*[：:]\s*/, "").trim();
      if (!t || /（[\s　]*）|【|】/.test(t) || seen.has(t)) return;
      seen.add(t); out.push({ s: t, vi: String(vi || ""), l: +l || 1 });
    });
  };
  for (const L of LESSONS) for (const P of L.patterns) {
    for (const e of P.ex || []) add(e[0], e[1], L.n);
    for (const d of P.drills || []) if (d.a && d.a[0]) add(d.a[0], "", L.n);
  }
  for (const d of PT_DRILLS) add(fillBlank(d.s, d.a[0]), d.vi, d.l);
  for (const q of EXAM_BANK) {
    if (q.k === "goi_ctx" || q.k === "bun_form") add(fillBlank(q.q, q.opts[q.a]), q.vi, q.l);
    else if (q.k === "ch_kadai") (q.script || []).forEach((x: any) => add(x[1], "", q.l));
    else if (q.k === "ch_sokuji") { add(q.line, "", q.l); add(q.opts[q.a], "", q.l); }
    else if (q.k === "ch_hatsuwa") add(q.opts[q.a], "", q.l);
  }
  return (CORPUS = out);
}

// ---- tìm một từ (kana) trong câu: phải đứng đầu cụm, theo sau chỉ là trợ từ / です… ----
const BEFORE = /[\s　、。「」『』：:（）()！？!?・…〜～]/;
// な chỉ được đứng cuối cụm (tính từ đuôi な trước danh từ); không cho "は|なを" (= はなを) khớp từ "は"
const REST = /^(?:までに|から|まで|より|だけ|など|ので|けど|でした|でしょう|です|じゃ|では|だ|が|は|を|に|へ|で|と|も|の|や|か|ね|よ)*な?$/;
const VERB_END = "(?:ませんでした|ましょう|ませんか|ました|ません|ます)";
const cleanForm = (v: string) => v.replace(/^[～〜]+|[～〜…。、！？!?]+$/g, "").trim();
const reEsc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// forms: [{re, mid}] — mid=true: hậu tố (～さん) nên không cần đứng đầu cụm
function wordForms(kana: string) {
  const out: any[] = [], seen = new Set<string>();
  for (const raw of vVariants(kana)) {
    const mid = /^[～〜]/.test(raw), v = cleanForm(raw);
    if (!v || (mid && v.length < 2)) continue;
    const src = v.length > 2 && v.endsWith("ます") ? reEsc(v.slice(0, -2)) + VERB_END : reEsc(v);
    if (seen.has(src)) continue; seen.add(src);
    out.push({ re: new RegExp(src, "g"), mid });
  }
  return out;
}
function matchIn(s: string, forms: any[]) {
  for (const f of forms) {
    f.re.lastIndex = 0; let m;
    while ((m = f.re.exec(s))) {
      const i = m.index, j = i + m[0].length;
      if (!f.mid && i > 0 && !BEFORE.test(s[i - 1])) continue;
      let k = j; while (k < s.length && !BEFORE.test(s[k])) k++;
      if (!REST.test(s.slice(j, k))) continue;
      return { i, len: m[0].length, a: m[0] };
    }
  }
  return null;
}

// từ cần kiểm nghĩa: đồng âm khác nghĩa với từ khác (きます đến/mặc, はな hoa/mũi…) hoặc chỉ 1 chữ kana (き, は…)
// → trả về các cụm nghĩa (đã bỏ dấu) để dò trong bản dịch của câu; null = không cần kiểm
let HOMO: Map<string, string[][]> | null = null;
const baseKana = (k: string) => cleanForm(String(k).replace(/[\[\]［］]/g, ""));
const senseParts = (m: string) => fold(m).replace(/[\[(（][^\])）]*[\])）]/g, ",").split(/[,;/、]/).map(t => t.replace(/[~～…]/g, "").trim()).filter(t => t.length >= 2);
function homoKeys(w: any): string[] | null {
  if (!HOMO) {
    HOMO = new Map();
    for (const L of VFLAT) for (const x of L) { const k = baseKana(x[0]); if (!HOMO.has(k)) HOMO.set(k, []); HOMO.get(k)!.push(senseParts(x[3])); }
    // dạng た/て của động từ nhóm II/III (します→した, きます→きた) trùng với danh từ (した = dưới)
    for (const L of VFLAT) for (const x of L) { const v = baseKana(x[0]); if (v.length > 2 && v.endsWith("ます")) for (const e of ["た", "て"]) { const k = v.slice(0, -2) + e; if (HOMO.has(k)) HOMO.get(k)!.push([]); } }
  }
  const k = baseKana(w[0]), mine = senseParts(w[3]);
  // khác nghĩa = không có cụm nghĩa chung (でんき/どれ… ghi 2 lần cùng nghĩa thì không tính)
  const clash = (HOMO.get(k) || []).some(o => !o.some(t => mine.includes(t)));
  if (!clash && [...k].length > 1) return null;
  return mine.length ? mine : null;
}

// câu điền từ cho từ VFLAT[li][i]: {s:"…（　）…", a, vi} hoặc null (→ dạng "Nghe → gõ lại")
const CLOZE = new Map<string, any>();
export function clozeFor(li: number, i: number) {
  const key = li + "-" + i;
  if (CLOZE.has(key)) return CLOZE.get(key);
  const w = VFLAT[li][i], n = VOCAB[li].n, forms = wordForms(w[0]);
  const hits: any[] = [];
  // bỏ câu mà ngoài chỗ trống gần như không còn gì (vd. chỉ có từ đó) → không có ngữ cảnh để đoán
  const ctxLen = (x: any, m: any) => (x.s.slice(0, m.i) + x.s.slice(m.i + m.len)).replace(/[\s　、。！？!?・…→／/～〜「」]/g, "").length;
  // từ đồng âm khác nghĩa (きます đến/mặc, はな hoa/mũi…): câu chỉ hợp lệ khi bản dịch có nghĩa của đúng từ này
  const keys = homoKeys(w);
  const okSense = (x: any) => !keys || (!!x.vi && keys.some(k => fold(x.vi).includes(k)));
  // không để lộ đáp án: phần còn lại của câu không được chứa lại từ đó (kana ≥2 chữ hoặc kanji)
  const leaks = (x: any, m: any) => { const rest = x.s.slice(0, m.i) + "|" + x.s.slice(m.i + m.len); return (m.a.length >= 2 && rest.includes(m.a)) || (!!w[1] && rest.includes(w[1])); };
  if (forms.length) for (const x of corpus()) { if (/[→／]/.test(x.s)) continue; /* bảng chia động từ, không phải câu */ const m = matchIn(x.s, forms); if (m && ctxLen(x, m) >= 3 && okSense(x) && !leaks(x, m)) hits.push({ x, m }); }
  let c = null;
  if (hits.length) {
    const near = hits.filter(h => h.x.l <= Math.max(n, 3));
    const pool = (near.length ? near : hits).sort((a, b) => a.x.s.length - b.x.s.length || (a.x.s < b.x.s ? -1 : 1));
    const h = pool[Math.floor(seeded(hashStr(w[0] + "|" + w[3]))() * pool.length)];
    c = { s: h.x.s.slice(0, h.m.i) + "（　）" + h.x.s.slice(h.m.i + h.m.len), a: h.m.a, vi: h.x.vi };
  }
  CLOZE.set(key, c);
  return c;
}

// câu ví dụ có chứa một trong các từ: terms = [{kana?, kanji?}] → [{html, s, vi}]
export function findExamples(terms: any[], limit = 8) {
  const per: any[][] = terms.map(t => {
    const forms = t.kana ? wordForms(t.kana) : [];
    const res: any[] = [];
    for (const x of corpus()) {
      let m: any = forms.length ? matchIn(x.s, forms) : null;
      if (!m && t.kanji && t.kanji.length >= 1) { const i = x.s.indexOf(t.kanji); if (i >= 0) m = { i, len: t.kanji.length }; }
      if (m) res.push({ x, m });
    }
    return res.sort((a, b) => a.x.l - b.x.l || a.x.s.length - b.x.s.length);
  });
  // lấy xen kẽ giữa các từ để từ nào cũng có ví dụ
  const out: any[] = [], seen = new Set<string>();
  for (let r = 0; out.length < limit && per.some(p => p.length > r); r++)
    for (const p of per) { const h = p[r]; if (h && !seen.has(h.x.s) && out.length < limit) { seen.add(h.x.s); out.push(h); } }
  return out.map(({ x, m }) => ({ s: x.s, vi: x.vi, html: esc(x.s.slice(0, m.i)) + `<b class="hl">${esc(x.s.slice(m.i, m.i + m.len))}</b>` + esc(x.s.slice(m.i + m.len)) }));
}
