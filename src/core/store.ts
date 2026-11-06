// Lưu trạng thái học: localStorage (khoá datcau_v1 như bản cũ) + móc đồng bộ (core/sync.ts)
import { $, $$, GOAL, addDays, clone, dayStr } from "./util";
import { mergePath } from "./path";

export const LS_KEY = "datcau_v1";
export const S: any = { progress: { days: [], counts: {}, drills: {}, last: null }, sentences: [] };

export function lsLoad() {
  try {
    const o = JSON.parse(localStorage.getItem(LS_KEY) || "null");
    if (o) { S.progress = Object.assign(S.progress, o.progress || {}); S.sentences = o.sentences || []; }
  } catch (e) {}
}
export function lsSave() {
  try { localStorage.setItem(LS_KEY, JSON.stringify({ progress: S.progress, sentences: S.sentences })); } catch (e) {}
}

// sync.ts đăng ký hàm này: mỗi lần dữ liệu đổi → hẹn đẩy lên mạng (debounce ở phía sync)
let changeHook: null | (() => void) = null;
export function setChangeHook(f: () => void) { changeHook = f; }
const changed = () => { if (changeHook) changeHook(); };

export function saveProgress() { lsSave(); changed(); }
export async function saveSentence(x: any) { x.upd = Date.now(); lsSave(); changed(); }
export async function delSentence(id: string) {
  S.sentences = S.sentences.filter((s: any) => s.id !== id);
  // ghi lại câu đã xoá để lần gộp sau không bị máy khác "hồi sinh"
  const d = S.progress.delSent || (S.progress.delSent = {});
  d[id] = Date.now();
  lsSave(); changed();
}
// câu mới cho Sổ câu (ôn Leitner, lần đầu vào ngày mai)
export function newSentence(o: any) {
  const s = Object.assign({ id: "s" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), box: 1, next: addDays(dayStr(), 1), created: dayStr() }, o);
  S.sentences.push(s); saveSentence(s);
  return s;
}

// ---- gộp dữ liệu 2 phía (port đúng quy tắc trong initStore của bản cũ) ----
export function mergeProgress(local: any, rem: any) {
  local = local || {}; rem = clone(rem || {}) || {};
  const P: any = {
    days: [...new Set<any>([...(rem.days || []), ...(local.days || [])])].sort().slice(-400),
    counts: Object.assign({}, rem.counts || {}), drills: Object.assign({}, rem.drills || {}), kanji: Object.assign({}, rem.kanji || {}), vocab: Object.assign({}, rem.vocab || {}), last: null,
  };
  for (const [k, v] of Object.entries<any>(local.counts || {})) P.counts[k] = Math.max(v, P.counts[k] || 0);
  for (const key of ["drills", "kanji", "vocab"]) for (const [k, v] of Object.entries<any>(local[key] || {})) P[key][k] = [...new Set<any>([...(P[key][k] || []), ...v])];
  P.srs = Object.assign({}, rem.srs || {});
  for (const [k, v] of Object.entries<any>(local.srs || {})) if (!P.srs[k] || (v.t || 0) > (P.srs[k].t || 0)) P.srs[k] = v;
  P.pt = Object.assign({}, rem.pt || {});
  for (const [k, v] of Object.entries<any>(local.pt || {})) if (!P.pt[k] || (v.t || 0) > (P.pt[k].t || 0)) P.pt[k] = v;
  // cài đặt (bài đang học, phạm vi đề, ngày thi): bên nào đổi sau thắng (setT = thời điểm đổi).
  // Dữ liệu cũ chưa có setT → quy tắc cũ. (Trước đây xoá ngày thi thì lần gộp sau lấy lại ngày cũ từ máy chủ.)
  const lT = local.setT || {}, rT = rem.setT || {};
  const setT: any = {};
  for (const k of ["upto", "exAll", "examDate"]) {
    const a = lT[k] || 0, b = rT[k] || 0;
    if (a || b) { P[k] = a >= b ? local[k] : rem[k]; setT[k] = Math.max(a, b); }
    else P[k] = k === "upto" ? local.upto || rem.upto : local[k] ?? rem[k];
  }
  if (Object.keys(setT).length) P.setT = setT;
  P.ex = mergeEx(local.ex, rem.ex);
  // hội thoại đã đọc: id → {n: số lần, d: ngày gần nhất}
  const tk: any = Object.assign({}, rem.talk || {});
  for (const [k, v] of Object.entries<any>(local.talk || {})) { const o = tk[k]; tk[k] = o ? { n: Math.max(v.n || 0, o.n || 0), d: (v.d || "") > (o.d || "") ? v.d : o.d } : v; }
  if (Object.keys(tk).length) P.talk = tk;
  P.daily = mergeDaily(local.daily, rem.daily);
  // hành trình N5: hợp bước đã xong, dấu ga sớm nhất (xem core/path.ts)
  const pa = mergePath(local.path, rem.path); if (pa) P.path = pa;
  // mới: danh sách câu đã xoá (id → thời điểm), giữ 1000 mục gần nhất
  const del = Object.assign({}, rem.delSent || {});
  for (const [k, v] of Object.entries<any>(local.delSent || {})) del[k] = Math.max(v, del[k] || 0);
  const dk = Object.entries<any>(del).sort((a, b) => b[1] - a[1]).slice(0, 1000);
  if (dk.length) P.delSent = Object.fromEntries(dk);
  for (const k of Object.keys(P)) if (P[k] === undefined) delete P[k];
  return P;
}
// luyện thi: không lấy nguyên cả khối theo t (mất câu đã làm ở máy kia) mà gộp từng câu + lịch sử thi thử
function mergeEx(l: any, r: any) {
  if (!l || !r) return l || r;
  const lw = (l.t || 0) > (r.t || 0), W = lw ? l : r, O = lw ? r : l;
  const q: any = Object.assign({}, O.q || {});
  for (const [k, v] of Object.entries<any>(W.q || {})) { const o = q[k]; if (!o || ((v.c || 0) + (v.w || 0)) >= ((o.c || 0) + (o.w || 0))) q[k] = v; }
  const seen = new Set<string>(), mocks: any[] = [];
  for (const m of [...(O.mocks || []), ...(W.mocks || [])]) { const key = JSON.stringify(m); if (!seen.has(key)) { seen.add(key); mocks.push(m); } }
  mocks.sort((a, b) => String(a.d || "").localeCompare(String(b.d || "")));
  return Object.assign({}, O, W, { q, mocks: mocks.slice(-30), t: Math.max(l.t || 0, r.t || 0) });
}
// việc hôm nay: ngày mới hơn thắng; cùng ngày (học trên 2 máy) thì lấy số lớn hơn của từng mục
function mergeDaily(l: any, r: any) {
  const ld = (l || {}).d || "", rd = (r || {}).d || "";
  if (!l || !r || ld !== rd) return ld >= rd ? l : r;
  const o: any = Object.assign({}, r, l);
  for (const k of ["gram", "pt", "ex", "talk"]) o[k] = Math.max(l[k] || 0, r[k] || 0);
  return o;
}
// đổi một cài đặt đồng bộ (upto / exAll / examDate) kèm thời điểm đổi để gộp đúng giữa các máy
export function setSetting(k: string, v: any) {
  S.progress[k] = v;
  (S.progress.setT || (S.progress.setT = {}))[k] = Date.now();
  saveProgress();
}
// sổ câu: gộp theo id, bản có upd mới hơn thắng; bỏ câu đã xoá ở một trong hai phía
export function mergeSentences(local: any[], rem: any[], delSent: any) {
  const byId = new Map<string, any>();
  for (const x of clone(rem || []) || []) if (x && x.id) byId.set(x.id, x);
  for (const x of local || []) { const r = byId.get(x.id); if (!r || (x.upd || 0) > (r.upd || 0)) byId.set(x.id, x); }
  const del = delSent || {};
  return [...byId.values()].filter(x => !(del[x.id] && del[x.id] >= (x.upd || 0)));
}
export function mergeData(local: any, rem: any) {
  const progress = mergeProgress(local.progress, rem.progress);
  return { progress, sentences: mergeSentences(local.sentences, rem.sentences, progress.delSent) };
}
// thay dữ liệu trong bộ nhớ bằng bản đã gộp
export function applyData(d: any) {
  S.progress = d.progress; S.sentences = d.sentences;
  lsSave(); renderStats();
}

// ---- sao lưu ra file / nhập lại ----
export function exportJSON() {
  return JSON.stringify({ app: "datcau", version: 2, exported: new Date().toISOString(), progress: S.progress, sentences: S.sentences }, null, 1);
}
// chấp nhận {progress, sentences}, {data:{progress,sentences}}, nguyên đối tượng progress, hoặc mảng câu
export function parseBackup(text: string) {
  let o: any = JSON.parse(text);
  if (o && o.data && (o.data.progress || o.data.sentences)) o = o.data;
  if (Array.isArray(o)) return { progress: {}, sentences: o.filter((x: any) => x && x.id && x.jp) };
  if (o && (o.progress || o.sentences)) return { progress: o.progress || {}, sentences: Array.isArray(o.sentences) ? o.sentences : [] };
  if (o && (o.days || o.counts || o.srs || o.drills)) return { progress: o, sentences: [] };
  throw new Error("format");
}
export function importBackup(text: string) {
  const d = parseBackup(text);
  const merged = mergeData({ progress: S.progress, sentences: S.sentences }, d);
  applyData(merged); changed();
  return { sentences: d.sentences.length, srs: Object.keys(d.progress.srs || {}).length };
}

// ---- tiến độ ----
export function bump(n = 1) {
  const t = dayStr(); const p = S.progress;
  p.counts[t] = (p.counts[t] || 0) + n;
  if (!p.days.includes(t)) { p.days.push(t); if (p.days.length > 400) p.days = p.days.slice(-400); }
  const keys = Object.keys(p.counts).sort(); if (keys.length > 60) keys.slice(0, keys.length - 60).forEach(k => delete p.counts[k]);
  saveProgress(); renderStats();
}
export function streak() {
  const set = new Set<any>(S.progress.days); let d = dayStr(); if (!set.has(d)) d = addDays(d, -1);
  let n = 0; while (set.has(d)) { n++; d = addDays(d, -1); } return n;
}
export const dueList = () => { const t = dayStr(); return S.sentences.filter((s: any) => (s.next || "") <= t); };
export function renderStats() {
  const n = S.progress.counts[dayStr()] || 0, st = streak();
  $("#streak").textContent = st + " ngày liên tiếp";
  $("#todayTxt").textContent = "Hôm nay " + n + " lượt đúng";
  $("#todayBar").style.width = Math.min(100, n / GOAL * 100) + "%";
  ($("#streak2") || {}).textContent = "🔥 " + st; ($("#today2") || {}).textContent = n + " lượt";
  const d = dueList().length; $$(".dueN,.dueN2").forEach(e => e.textContent = d ? d : "");
}
// đếm việc đã làm trong ngày (ngữ pháp, trợ từ, luyện thi)
export function dailyGet() { const t = dayStr(); const d = S.progress.daily; return d && d.d === t ? d : (S.progress.daily = { d: t, gram: 0, pt: 0, ex: 0 }); }
export function dailyInc(k: string) { const d = dailyGet(); d[k] = (d[k] || 0) + 1; }

export function initStore() { lsLoad(); renderStats(); }
