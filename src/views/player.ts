// Trình học: một câu một màn, phản hồi trượt lên từ đáy (Pen-chan), thanh ray có tàu chạy theo tiến độ.
// Dùng cho cả 6 bước của ga và gói ôn. Câu sai được hỏi lại 1 lần ở cuối lượt.
import { DIALOGUES } from "../content/dialogues";
import { KANJI } from "../content/data";
import { EXAM_BANK } from "../content/exam";
import { LESSONS } from "../content/lessons";
import { PT_DRILLS } from "../content/drills";
import { ancientHTML, tipHTML, vPic } from "../core/cards";
import { gradeTrack, introduce } from "../core/grade";
import { kanaToRomaji, norm, pvText, showKana } from "../core/kana";
import { penguin, penLine } from "../core/mascot";
import { pathState, STEP_NAMES, getPart, markStepDone, nextStep, currentStation, setPart, stampStation, type StepNo } from "../core/path";
import { adviceStep, isGradable, type Q } from "../core/q";
import { buildReview } from "../core/reviewq";
import { stationOf } from "../core/route";
import { buildStep } from "../core/steps";
import { playChime, playDeparture } from "../core/sound";
import { kid } from "../core/srs";
import { dailyInc, saveProgress } from "../core/store";
import { strokeSVG } from "../core/strokes";
import { say, speakSeq } from "../core/tts";
import { $, esc, toast } from "../core/util";
import { setView } from "../app/shell";
import { showStampMoment } from "./stamps";
import { openStation } from "./station";
import { canListen } from "../core/tts";

type Item = { q: Q; retry?: boolean };
type Run = { mode: "step" | "review"; n: number; step: StepNo; part: number; partTotal: number; skip?: boolean; then?: { n: number; step: StepNo };
  items: Item[]; pos: number; ans: any; ok: boolean | null; firstOk: number; firstTotal: number; combo: number; wrongByKind: Record<string, number>;
  build?: string[]; typed?: boolean; match?: { sel: string | null; done: Set<number>; miss: Set<number>; L: number[]; R: number[] } };
let R: Run | null = null;

const KMAP: Record<string, any> = Object.fromEntries(KANJI.flatMap((c: any) => c.groups.flatMap((g: any) => g.kanji.map((k: any) => [k.k, k]))));
const EX = new Map<string, any>(EXAM_BANK.map((q: any) => [q.id, q]));
const PT = new Map<string, any>(PT_DRILLS.map((d: any) => [d.id, d]));
const PBTN = ["は", "が", "を", "に", "へ", "で", "と", "から", "まで", "より", "も", "の", "や", "×"];
const shuffle = <T,>(a: T[]): T[] => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

// ---- bắt đầu ----
function begin(run: Omit<Run, "pos" | "ans" | "ok" | "firstOk" | "firstTotal" | "combo" | "wrongByKind">) {
  R = { ...run, pos: 0, ans: null, ok: null, firstOk: 0, firstTotal: run.items.filter(it => isGradable(it.q)).length, combo: 0, wrongByKind: {} };
  setView("player");
}
export function startStep(n: number, step: StepNo, opts?: { skip?: boolean }) {
  const b = buildStep(n, step, Math.random, { listen: canListen() });
  if (step === 2 && b.partTotal === 0) { markStepDone(n, 2); toast("Từ của ga này bạn đã học hết, bước Từ mới tự hoàn thành."); openStation(n); return; }
  if (!b.qs.length) { markStepDone(n, step); openStation(n); return; }
  begin({ mode: "step", n, step, part: b.part, partTotal: b.partTotal, skip: opts?.skip, items: b.qs.map(q => ({ q })) });
}
export function startReview(then?: { n: number; step: StepNo }) {
  const qs = buildReview(undefined, 15, 10, true, canListen());
  if (!qs.length) { if (then) return startStep(then.n, then.step); toast("Hôm nay không còn câu nào cần ôn."); return; }
  begin({ mode: "review", n: then?.n || 0, step: then?.step || 1, part: 0, partTotal: 1, then, items: qs.map(q => ({ q })) });
}
// nút "Tiếp tục hành trình": ôn trước (nếu có), rồi bước kế của ga đang đi
export function startContinue() {
  const n = currentStation();
  if (n === 25 && pathState().st[25]?.stamp) { toast("Bạn đã đi hết tuyến N5! Ôn tập và luyện thi trong Thư viện."); setView("stamps"); return; }
  startReview({ n, step: nextStep(n) });
}

// ---- vẽ ----
function rail() {
  const p = R ? Math.round((R.pos / R.items.length) * 100) : 0;
  return `<div class="prail" role="progressbar" aria-valuemin="0" aria-valuemax="${R!.items.length}" aria-valuenow="${R!.pos}"><i style="width:${p}%"></i><span class="ptrain" style="left:${p}%">🚃</span></div>`;
}
function head() {
  const s = R!.mode === "review" ? "Ôn tập" : `${stationOf(R!.n).code} · Bước ${R!.step} — ${STEP_NAMES[R!.step]}${R!.partTotal > 1 ? ` · lượt ${R!.part + 1}/${R!.partTotal}` : ""}`;
  return `<div class="phead"><button class="lnk" id="pQuit">✕ Dừng</button><span>${esc(s)}</span><span class="pcount">${Math.min(R!.pos + 1, R!.items.length)}/${R!.items.length}</span></div>${rail()}`;
}
const sayBtn = (t: string, big = false) => `<button class="say${big ? " saybig" : ""}" data-say="${esc(t)}" aria-label="Nghe">🔊</button>`;
const optBtns = (opts: string[], jp: boolean) => `<div class="popts">${opts.map((o, i) => `<button class="popt${jp ? " jp" : ""}" data-pa="${i}"><span class="pk">${i + 1}</span>${esc(o)}</button>`).join("")}</div>`;

function body(q: Q): string {
  switch (q.kind) {
    case "dialogue": {
      const D = DIALOGUES.find((d: any) => d.id === q.id); if (!D) return `<p>Chưa có hội thoại.</p>`;
      return `<div class="pcard"><p class="pprompt">${esc(D.t)}</p><p class="tip">${esc(D.scene)}</p>
        <div class="row"><button class="btn accent" id="pDlgPlay">▶ Nghe cả đoạn</button></div>
        <div class="pdlg">${D.lines.map((x: any, i: number) => { const r = D.roles[x.s] || {}; return `<div class="pdl${x.s === D.me ? " me" : ""}" data-dl="${i}"><span class="pdn">${esc(r.name || x.s)}</span><div><div class="jp">${esc(x.kana)}</div><div class="tip">${esc(x.vi)}</div></div>${sayBtn(x.kana)}</div>`; }).join("")}</div>
        <button class="btn accent big" id="pNext">Đã nghe xong →</button></div>`;
    }
    case "dialogue-blind": {
      const D = DIALOGUES.find((d: any) => d.id === q.id); if (!D) return `<p>Chưa có hội thoại.</p>`;
      return `<div class="pcard"><p class="tip">Nghe lần 1 · chưa xem chữ</p><p class="pprompt">${esc(D.t)}</p><p class="tip">${esc(D.scene)}</p>
        <p>Nghe 1–2 lần và đoán chuyện gì đang xảy ra. Không cần hiểu hết từng chữ. Sau đó trả lời 3 câu hỏi ngắn.</p>
        <div class="row"><button class="btn accent" id="pDlgPlay">▶ Nghe cả đoạn</button></div>
        <button class="btn big" id="pNext">Đã nghe, trả lời câu hỏi →</button></div>`;
    }
    case "phrases": {
      const D = DIALOGUES.find((d: any) => d.id === q.id); if (!D) return "";
      return `<div class="pcard"><p class="tip">Đem dùng được ngay</p><p class="pprompt">${q.keep.length} câu nên thuộc lòng</p>
        <div class="pex">${q.keep.map(i => D.lines[i]).filter(Boolean).map((x: any) => `<div class="pexl">${sayBtn(x.kana)}<div><div class="jp">${esc(x.kana)}</div><div class="tip">${esc(x.vi)}</div></div></div>`).join("")}</div>
        <p class="tip">Bấm nghe từng câu và đọc nhẩm theo 2–3 lần.</p><button class="btn accent big" id="pNext">Xong, sang bước tiếp →</button></div>`;
    }
    case "type":
      return `<div class="pcard"><p class="pprompt">Tự nhớ lại: gõ từ này bằng kana hoặc romaji</p><div class="pmean">${esc(q.vi)}</div>
        <div class="row"><input id="pType" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="ví dụ: teishoku" ${R!.ok !== null ? "disabled" : ""}></div><div class="tip" id="pPv"></div>
        ${R!.ok === null ? `<div class="row"><button class="btn accent" id="pCheck">Kiểm tra</button></div>` : ""}</div>`;
    case "word-intro": {
      const w = q.w, P = q.plus;
      return `<div class="pcard pintro"><p class="tip">Từ mới</p><div class="pword">${vPic(w)}<span class="jp">${esc(w[0])}</span>${w[1] ? `<span class="pk2 jp">${esc(w[1])}</span>` : ""}${sayBtn(w[0], true)}</div>
        <div class="ro">${esc(w[2])}</div><div class="pmean">${esc(w[3])}</div>
        ${P ? `<div class="pexl pwex">${sayBtn(P.ex[0])}<div><div class="jp">${esc(P.ex[0])}</div><div class="tip">${esc(P.ex[1])}</div></div></div><div class="pmemo"><b>Mẹo nhớ</b>${esc(P.tip)}</div>`
          : (w[4] ? `<div class="pnote">${esc(w[4])}</div>` : "")}
        <button class="btn accent big" id="pNext">Đã nhớ, tiếp →</button></div>`;
    }
    case "pattern-intro": {
      const P = LESSONS.flatMap((l: any) => l.patterns).find((p: any) => p.id === q.pid);
      return `<div class="pcard"><p class="tip">Mẫu câu</p><div class="pform jp">${esc(P.form)}</div><div class="pmean">${esc(P.mean)}</div>
        <p>${esc(P.explain)}</p>${P.trap ? `<p class="trap"><b>Bẫy:</b> ${esc(P.trap)}</p>` : ""}
        <div class="pex">${(P.ex || []).slice(0, 3).map((e: any) => `<div class="pexl">${sayBtn(e[0])}<div><div class="jp">${esc(e[0])}</div><div class="tip">${esc(e[1])}</div></div></div>`).join("")}</div>
        <button class="btn accent big" id="pNext">Hiểu rồi, luyện →</button></div>`;
    }
    case "kanji-intro":
      return `<div class="pcard pkanji"><p class="tip">Kanji của ga</p><div class="pkrow"><div class="pkbig">${esc(q.ch)}</div><div class="pkstroke">${strokeSVG(q.ch, 150)}<button class="lnk" id="pReplay">↻ Xem lại nét</button></div></div>
        ${ancientHTML(q.ch)}${kanjiInfo(q.ch)}<button class="btn accent big" id="pNext">Đã nhớ chữ này →</button></div>`;
    case "mcq":
      return `<div class="pcard"><p class="pprompt">${esc(q.prompt)}</p>${q.jp ? `<div class="pjp jp">${esc(q.jp)}${q.say ? sayBtn(q.say) : ""}</div>` : ""}${optBtns(q.opts, !!q.optJp)}</div>`;
    case "listen":
      return `<div class="pcard"><p class="pprompt">Nghe rồi chọn từ đúng</p><div class="pcenter">${sayBtn(q.say, true)}</div>${optBtns(q.opts, true)}</div>`;
    case "match": {
      const M = R!.match!;
      const cell = (side: "L" | "R", i: number) => { const p = q.pairs[i], done = M.done.has(i); return `<button class="pm${done ? " ok" : ""}${M.sel === side + i ? " sel" : ""}${side === "R" ? " jp" : ""}" data-pm="${side}${i}" ${done ? "disabled" : ""}>${esc(side === "L" ? p[0] : p[1])}</button>`; };
      return `<div class="pcard"><p class="pprompt">Nối nghĩa với từ</p><div class="pmgrid"><div>${M.L.map(i => cell("L", i)).join("")}</div><div>${M.R.map(i => cell("R", i)).join("")}</div></div></div>`;
    }
    case "build": {
      const used = R!.build || [];
      const pool = q.tokens.map((t, i) => ({ t, i })).filter(x => !used.includes(String(x.i)));
      return `<div class="pcard"><p class="pprompt">Ghép thành câu: “${esc(q.vi)}”</p>
        <div class="pbuild" aria-label="Câu của bạn">${used.length ? used.map(i => `<button class="ptok jp" data-tu="${i}">${esc(q.tokens[+i])}</button>`).join("") : `<span class="tip">Chạm các khối bên dưới theo đúng thứ tự</span>`}</div>
        <div class="ppool">${pool.map(x => `<button class="ptok jp" data-tp="${x.i}">${esc(x.t)}</button>`).join("")}</div>
        ${R!.typed ? `<div class="row"><input id="pType" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Gõ kana hoặc romaji…"></div>` : ""}
        <div class="row" style="flex-wrap:wrap"><button class="btn accent" id="pCheck">Kiểm tra</button><button class="btn ghost" id="pTypeT">${R!.typed ? "Dùng khối chữ" : "Tự gõ"}</button></div></div>`;
    }
    case "particle": {
      const d = PT.get(q.drill);
      return `<div class="pcard"><p class="pprompt">Chọn trợ từ đúng</p><div class="pjp jp">${esc(d.s).replace("（　）", `<span class="pblank">？</span>`)}</div><p class="tip">${esc(d.vi)}</p>
        <div class="popts pgrid">${PBTN.map(p => `<button class="popt jp" data-pp="${esc(p)}">${esc(p)}</button>`).join("")}</div></div>`;
    }
    case "exam": {
      const e = EX.get(q.id); if (!e) return `<p>Không tìm thấy câu.</p>`;
      const listen = /^ch_/.test(e.k);
      return `<div class="pcard"><p class="pprompt">${listen ? "Nghe rồi chọn" : "Chọn đáp án đúng"}</p>
        ${listen ? `<div class="pcenter"><button class="btn accent" id="pExPlay">🔊 Nghe</button></div>${e.sit ? `<p>${esc(e.sit)}</p>` : ""}${e.q ? `<div class="pjp jp">${esc(e.q)}</div>` : ""}`
          : `<div class="pjp jp">${esc(e.q || "").replace("（　）", `<span class="pblank">？</span>`)}</div>`}
        ${optBtns(e.opts, true)}</div>`;
    }
  }
  return "";
}
function kanjiInfo(ch: string) {
  const k = KMAP[ch];
  if (!k) return "";
  return `<div class="pkinfo"><div><b>${esc(k.hv)}</b> · ${esc(k.mean)}</div><div class="tip">On: <span class="jp">${esc(k.on)}</span> · Kun: <span class="jp">${esc(k.kun)}</span></div>
    <div class="ktip">${tipHTML(k.tip)}</div><div class="kex">${(k.ex || []).map((e: any) => `<button class="kw" data-say="${esc(e[1])}"><span class="jp">${esc(e[0])}</span><span class="r">${esc(e[1])}</span><span class="m">${esc(e[2])}</span></button>`).join("")}</div></div>`;
}
function feedback(): string {
  if (R!.ok === null) return "";
  const q = R!.items[R!.pos].q, ok = R!.ok;
  const L = penLine(ok ? "happy" : "oops");
  let ans = "", why = "";
  if (!ok) {
    if (q.kind === "mcq" || q.kind === "listen") ans = q.opts[q.a];
    if (q.kind === "build") ans = q.answer.join(" ");
    if (q.kind === "type") ans = q.answers[0];
    if (q.kind === "particle") { const d = PT.get(q.drill); ans = d.a.join(" / "); }
    if (q.kind === "exam") { const e = EX.get(q.id); ans = e.opts[e.a]; }
  }
  if (q.kind === "particle") why = PT.get(q.drill).why;
  if (q.kind === "exam") why = EX.get(q.id).why || "";
  if (q.kind === "mcq" && q.why) why = q.why;
  return `<div class="psheet ${ok ? "ok" : "bad"}" role="status">${penguin(ok ? "happy" : "oops", 54)}<div class="psb"><b class="jp">${L[0]}</b> ${esc(L[1])}
    ${ans ? `<div>Đáp án: <b class="jp">${esc(ans)}</b></div>` : ""}${why ? `<div class="tip">${esc(why)}</div>` : ""}${R!.combo >= 3 && ok ? `<div class="pcombo">🔥 ${R!.combo} câu đúng liên tiếp</div>` : ""}</div>
    <button class="btn ${ok ? "accent" : ""} big" id="pNext">Tiếp →</button></div>`;
}
export function renderPlayer() {
  if (!R) { setView("journey"); return; }
  if (R.pos >= R.items.length) return finish();
  const q = R.items[R.pos].q;
  if (q.kind === "match" && !R.match) { const ix = q.pairs.map((_, i) => i); R.match = { sel: null, done: new Set(), miss: new Set(), L: shuffle(ix), R: shuffle(ix) }; }
  $("#main").innerHTML = `<div class="player">${head()}${body(q)}${feedback()}</div>`;
  if (R.ok === null) {
    if (q.kind === "word-intro") say(q.w[0]);
    if (q.kind === "listen") say(q.say);
    if (q.kind === "mcq" && q.say && /Từ này/.test(q.prompt)) say(q.say);
  }
  if ((q.kind === "build" && R.typed) || (q.kind === "type" && R.ok === null)) ($("#pType") as any)?.focus();
  if (q.kind === "type" && R.ok !== null) say(q.say);
}

// ---- chấm ----
function strength(q: Q): 1 | 2 | 3 { if (R!.mode === "review" || R!.step === 6) return 3; return q.kind === "listen" || q.kind === "match" || q.kind === "type" ? 2 : 1; }
function answer(ok: boolean) {
  const it = R!.items[R!.pos], q = it.q;
  R!.ok = ok;
  if (!it.retry && ok) R!.firstOk++;
  if (ok) { R!.combo++; if ([3, 5, 10].includes(R!.combo)) playChime(R!.combo as 3 | 5 | 10); } else { R!.combo = 0; const st = String(adviceStep(q, q.kind === "exam" ? EX.get(q.id)?.k : "")); R!.wrongByKind[st] = (R!.wrongByKind[st] || 0) + 1; }
  // ghi lịch ôn
  if (q.kind === "mcq" || q.kind === "listen" || q.kind === "build" || q.kind === "type") { if (q.track) gradeTrack(q.track, ok, strength(q)); }
  if (q.kind === "particle") gradeTrack({ type: "pt", id: q.drill }, ok);
  if (q.kind === "exam") gradeTrack({ type: "ex", id: q.id }, ok);
  if (!ok && !it.retry) R!.items.push({ q, retry: true });
  renderPlayer();
  ($("#pNext") as any)?.focus();
}
function next() {
  const q = R!.items[R!.pos].q;
  if (q.kind === "word-intro") introduce(q.vid);
  if (q.kind === "kanji-intro") introduce(kid(q.ch));
  R!.pos++; R!.ok = null; R!.ans = null; R!.build = undefined; R!.typed = false; R!.match = undefined;
  renderPlayer(); window.scrollTo({ top: 0 });
}

// ---- kết thúc lượt ----
function finish() {
  const run = R!; R = null;
  playDeparture();
  // mục tiêu ngày đếm lượt học MỚI (gói ôn không tính); lưu ngay để tải lại trang không mất
  if (run.mode === "step") { dailyInc("path"); saveProgress(); }
  if (run.mode === "review") {
    if (run.then) return startStep(run.then.n, run.then.step);
    return summary("Xong phần ôn hôm nay", `Đúng ${run.firstOk}/${run.firstTotal} câu ngay lần đầu.`, run);
  }
  const { n, step } = run;
  if (step === 6) {
    const score = run.firstTotal ? run.firstOk / run.firstTotal : 0;
    const pass = stampStation(n, score);
    if (pass) return showStampMoment(n, score);
    const worst = Object.entries(run.wrongByKind).sort((a, b) => b[1] - a[1])[0];
    const back = worst ? +worst[0] : 2;
    return summary("Chưa qua ga lần này", `Đúng ${Math.round(score * 100)}% (cần 70%). Nên ôn lại bước ${back} — ${STEP_NAMES[back]} rồi thử lại.`, run, back);
  }
  if (step === 3) { const p = getPart(n, 3) + 1; if (p >= run.partTotal) markStepDone(n, 3); else setPart(n, 3, p); }
  else if (step === 2) { if (buildStep(n, 2).partTotal === 0) markStepDone(n, 2); }
  else markStepDone(n, step);
  summary(`Xong ${STEP_NAMES[step]}${run.partTotal > 1 ? ` · lượt ${run.part + 1}/${run.partTotal}` : ""}`, run.firstTotal ? `Đúng ${run.firstOk}/${run.firstTotal} câu ngay lần đầu.` : "Đã xong phần này.", run);
}
function summary(title: string, sub: string, run: Run, back?: number) {
  setView("player");
  $("#main").innerHTML = `<div class="player"><div class="pcard pdone">${penguin(back ? "oops" : "cheer", 96)}<h2>${esc(title)}</h2><p>${esc(sub)}</p>
    <div class="row" style="flex-wrap:wrap;justify-content:center">
      ${back ? `<button class="btn accent big" data-step-go="${run.n}:${back}">Ôn lại bước ${back}</button>` : `<button class="btn accent big" id="jContinue">▶ Tiếp tục hành trình</button>`}
      ${run.n ? `<button class="btn ghost" data-station="${run.n}">Về ga ${stationOf(run.n).code}</button>` : ""}<button class="btn ghost" data-view="journey">Bản đồ</button></div></div></div>`;
}

// ---- sự kiện ----
export function onClick(t: any): boolean {
  if (t.id === "jContinue") { startContinue(); return true; }
  if (t.dataset.stepGo) { const [n, s] = t.dataset.stepGo.split(":").map(Number); startStep(n, s as StepNo); return true; }
  if (!R) return false;
  const q = R.items[R.pos]?.q;
  if (t.id === "pQuit") { R = null; setView("journey"); return true; }
  if (t.id === "pNext") { if (q && (q.kind === "dialogue" || q.kind === "dialogue-blind" || q.kind === "phrases" || q.kind === "word-intro" || q.kind === "pattern-intro" || q.kind === "kanji-intro") && R.ok === null) { next(); return true; } if (R.ok !== null) next(); return true; }
  if (t.id === "pReplay") { const s = $(".pkstroke"); if (s && q?.kind === "kanji-intro") s.innerHTML = strokeSVG(q.ch, 150) + `<button class="lnk" id="pReplay">↻ Xem lại nét</button>`; return true; }
  if (t.id === "pDlgPlay" && (q?.kind === "dialogue" || q?.kind === "dialogue-blind")) { const D = DIALOGUES.find((d: any) => d.id === q.id); speakSeq(D.lines.map((x: any) => [x.kana, (D.roles[x.s] || {}).g === "f" ? 1.3 : 0.85])); return true; }
  if (t.id === "pExPlay" && q?.kind === "exam") { const e = EX.get(q.id); const parts: any[] = []; if (e.intro) parts.push([e.intro, 1]); (e.script || []).forEach((x: any) => parts.push([x[1], x[0] === "F" ? 1.3 : 0.8])); if (e.line) parts.push([e.line, 1.2]); if (e.q && e.k === "ch_kadai") parts.push([e.q, 1]); speakSeq(parts); return true; }
  if (R.ok !== null) return t.dataset.pa !== undefined || t.dataset.pp !== undefined;
  if (t.dataset.pa !== undefined && q) {
    const i = +t.dataset.pa;
    if (q.kind === "mcq" || q.kind === "listen") answer(i === q.a);
    else if (q.kind === "exam") answer(i === EX.get(q.id).a);
    return true;
  }
  if (t.dataset.pp !== undefined && q?.kind === "particle") { answer(PT.get(q.drill).a.includes(t.dataset.pp)); return true; }
  if (t.dataset.tp !== undefined) { R.build = [...(R.build || []), t.dataset.tp]; renderPlayer(); return true; }
  if (t.dataset.tu !== undefined) { R.build = (R.build || []).filter(x => x !== t.dataset.tu); renderPlayer(); return true; }
  if (t.id === "pTypeT") { R.typed = !R.typed; renderPlayer(); return true; }
  if (t.id === "pCheck" && q?.kind === "type") {
    const got = showKana(($("#pType") as any)?.value || "");
    if (!got.trim()) { toast("Hãy gõ từ trước."); return true; }
    answer(q.answers.some(a => norm(a) === norm(got))); return true;
  }
  if (t.id === "pCheck" && q?.kind === "build") {
    const want = q.answer.join("");
    const got = R.typed ? showKana(($("#pType") as any)?.value || "") : (R.build || []).map(i => q.tokens[+i]).join("");
    if (!got.trim()) { toast("Hãy ghép hoặc gõ câu trước."); return true; }
    answer(norm(got) === norm(want)); return true;
  }
  if (t.dataset.pm && q?.kind === "match") {
    const M = R.match!, side = t.dataset.pm[0], i = +t.dataset.pm.slice(1);
    if (side === "R") say(q.pairs[i][1]);
    if (!M.sel || M.sel[0] === side) { M.sel = t.dataset.pm; renderPlayer(); return true; }
    const j = +M.sel.slice(1); M.sel = null;
    if (i === j) { M.done.add(i); if (M.done.size === q.pairs.length) { for (let k = 0; k < q.pairs.length; k++) gradeTrack({ type: "srs", id: q.pairs[k][2] }, !M.miss.has(k), 2); R.ok = M.miss.size === 0; if (R.ok) { R.firstOk++; R.combo++; } else R.combo = 0; renderPlayer(); return true; } }
    else { M.miss.add(i); M.miss.add(j); toast("Chưa khớp, thử cặp khác."); }
    renderPlayer(); return true;
  }
  return false;
}
export function onKey(e: any): boolean {
  if (!R || $("#main .player") === null) return false;
  if (e.target?.tagName === "INPUT" && e.key === "Enter" && !e.isComposing && e.keyCode !== 229) { e.preventDefault(); ($("#pCheck") as any)?.click(); return true; }
  if (e.target?.tagName === "INPUT") return false;
  if (/^[1-4]$/.test(e.key)) { const b = document.querySelector(`[data-pa="${+e.key - 1}"]`) as any; if (b && R.ok === null) { b.click(); return true; } }
  if (e.key === "Enter") { const b = $("#pNext") as any; if (b) { e.preventDefault(); b.click(); return true; } }
  return false;
}
// cửa cho kiểm thử tự động (chỉ khi URL có ?e2e): đọc trạng thái lượt học và tra đáp án
if (typeof location !== "undefined" && location.search.includes("e2e")) (globalThis as any).__player = () => ({ R, ex: (id: string) => EX.get(id), pt: (id: string) => PT.get(id) });

// xem trước kana khi gõ romaji ở câu "tự nhớ lại"
if (typeof document !== "undefined") document.addEventListener("input", e => { const t = e.target as any; if (t?.id === "pType" && R?.items[R.pos]?.q.kind === "type") { const pv = $("#pPv"); if (pv) pv.textContent = pvText(t.value); } });
