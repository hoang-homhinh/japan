// Tab Hội thoại: mỗi bài 2 đoạn — nghe cả đoạn (câu đang đọc được tô sáng) và đọc nhẩm theo,
// hoặc "đóng vai": app đọc lời người kia, tới câu của mình thì dừng cho mình tự đọc. Không cần micro.
import { DIALOGUES } from "../content/dialogues";
import { kanaToRomaji } from "../core/kana";
import { penguin } from "../core/mascot";
import { LS_KEY, S, bump, dailyInc, saveProgress } from "../core/store";
import { say } from "../core/tts";
import { $, $$, dayStr, esc, toast } from "../core/util";

const LESSON_NS: number[] = [...new Set<number>(DIALOGUES.map((d: any) => d.l))].sort((a, b) => a - b);
let tS: any = { l: 0, id: "", kanji: false, romaji: false, vi: true, hideMe: false, slow: false };
try { Object.assign(tS, JSON.parse(localStorage.getItem(LS_KEY + "_talk") || "{}")); } catch (e) {}
const save = () => { try { localStorage.setItem(LS_KEY + "_talk", JSON.stringify(tS)); } catch (e) {} };

let jaVoice: any = null;
const pickV = () => { try { jaVoice = speechSynthesis.getVoices().find(v => /^ja/i.test(v.lang)) || null; } catch (e) {} };
if ("speechSynthesis" in window) { pickV(); speechSynthesis.addEventListener?.("voiceschanged", pickV); }

// ---- phát cả đoạn: từng câu một, tô sáng câu đang đọc; chế độ đóng vai thì câu của mình = khoảng lặng ----
let run = 0, playing: "" | "listen" | "role" = "", cur = -1, timer: any = null;
const keep: any[] = []; // giữ tham chiếu utterance (Chrome có thể bỏ onend nếu bị dọn rác)
function stop() {
  run++; playing = ""; cur = -1; clearTimeout(timer);
  try { speechSynthesis.cancel(); } catch (e) {}
  mark(); ctrl();
}
function speakLine(text: string, g: string, done: () => void) {
  try {
    const u = new SpeechSynthesisUtterance(text.replace(/[ 　]/g, ""));
    u.lang = "ja-JP"; u.rate = tS.slow ? 0.65 : 0.9; u.pitch = g === "f" ? 1.3 : 0.85; if (jaVoice) u.voice = jaVoice;
    let fired = false; const fin = () => { if (!fired) { fired = true; done(); } };
    u.onend = fin; u.onerror = fin; keep.push(u); if (keep.length > 20) keep.shift();
    speechSynthesis.speak(u);
    // phòng khi trình duyệt không gọi onend
    setTimeout(fin, 2500 + text.length * (tS.slow ? 420 : 260));
  } catch (e) { done(); }
}
function play(mode: "listen" | "role", from = 0) {
  const D = curDialogue(); if (!D) return;
  if (!("speechSynthesis" in window)) { toast("Trình duyệt này không có chức năng đọc."); return; }
  stop(); const my = ++run; playing = mode; ctrl();
  try { speechSynthesis.cancel(); } catch (e) {}
  const step = (i: number) => {
    if (my !== run) return;
    if (i >= D.lines.length) { playing = ""; cur = -1; mark(); ctrl(); return; }
    cur = i; mark();
    const x = D.lines[i], role = D.roles[x.s] || {};
    const next = () => { if (my === run) timer = setTimeout(() => step(i + 1), 450); };
    if (mode === "role" && x.s === D.me) {
      // tới lượt mình: dừng đủ lâu để đọc to câu này
      timer = setTimeout(next, Math.max(2600, x.kana.replace(/\s/g, "").length * (tS.slow ? 420 : 300)));
    } else speakLine(x.kana, role.g, next);
  };
  step(from);
}
function mark() {
  $$(".tline").forEach((el: any) => el.classList.toggle("now", +el.dataset.i === cur));
  $$(".tline.now").forEach((el: any) => el.scrollIntoView({ block: "nearest", behavior: "smooth" }));
  const D = curDialogue();
  $$(".tline").forEach((el: any) => el.classList.toggle("myturn", playing === "role" && +el.dataset.i === cur && D && D.lines[cur]?.s === D.me));
}
function ctrl() {
  const b1 = $("#tPlay"), b2 = $("#tRole");
  if (b1) b1.textContent = playing === "listen" ? "■ Dừng" : "▶ Nghe cả đoạn";
  if (b2) b2.textContent = playing === "role" ? "■ Dừng" : "🎭 Đóng vai " + (curDialogue()?.roles[curDialogue()?.me]?.name || "");
}

function curLessonN() {
  if (!LESSON_NS.includes(tS.l)) tS.l = LESSON_NS.filter(n => n <= (S.progress.upto || 13)).pop() || LESSON_NS[0];
  return tS.l;
}
function curDialogue(): any {
  const n = curLessonN(), ds = DIALOGUES.filter((d: any) => d.l === n);
  return ds.find((d: any) => d.id === tS.id) || ds[0];
}
const talkDone = () => S.progress.talk || (S.progress.talk = {});

export function renderTalk() {
  stop();
  if (!DIALOGUES.length) { $("#main").innerHTML = `<p class="tip">Chưa có hội thoại.</p>`; return; }
  const n = curLessonN(), ds = DIALOGUES.filter((d: any) => d.l === n), D = curDialogue(), done = talkDone();
  tS.id = D.id; save();
  const T = dayStr(), readToday = done[D.id]?.d === T;
  const opt = (k: string, label: string) => `<button class="chip" data-topt="${k}" aria-pressed="${!!tS[k]}">${label}</button>`;
  const lineHTML = (x: any, i: number) => {
    const r = D.roles[x.s] || {}, me = x.s === D.me, hide = me && tS.hideMe;
    return `<div class="tline${me ? " me" : ""}" data-i="${i}">
      <div class="tname">${esc(r.name || x.s)}</div>
      <div class="tbub">
        ${hide ? `<div class="tvi"><b>Bạn nói:</b> ${esc(x.vi)}</div><button class="lnk" data-tpeek="${i}">xem câu</button><div class="tpeek" id="tpk-${i}" hidden>` : ""}
        <div class="tkana jp">${esc(x.kana)}</div>
        ${tS.kanji && x.jp && x.jp !== x.kana ? `<div class="tjp jp">${esc(x.jp)}</div>` : ""}
        ${tS.romaji ? `<div class="ro">${esc(kanaToRomaji(x.kana))}</div>` : ""}
        ${tS.vi && !hide ? `<div class="tvi">${esc(x.vi)}</div>` : ""}
        ${hide ? `</div>` : ""}
      </div>
      <button class="say" data-tsay="${i}" aria-label="Nghe câu này">🔊</button>
    </div>`;
  };
  $("#main").innerHTML = `
  <div class="chips tchips">${LESSON_NS.map(l => `<button class="chip" data-tl="${l}" aria-pressed="${l === n}">Bài ${l}${DIALOGUES.filter((d: any) => d.l === l).every((d: any) => done[d.id]) ? '<span class="done">✓</span>' : ""}</button>`).join("")}</div>
  <div class="chips">${ds.map((d: any) => `<button class="chip" data-tid="${esc(d.id)}" aria-pressed="${d.id === D.id}">${esc(d.t)}${done[d.id] ? '<span class="done">✓</span>' : ""}</button>`).join("")}</div>
  <section class="step"><h2><span class="k">話</span>${esc(D.t)}<span class="hint">Bài ${n}</span></h2>
    <div class="pensay">${penguin("hi", 56)}<div class="bubble"><span>${esc(D.scene)}</span></div></div>
    <div class="row tctl" style="flex-wrap:wrap"><button class="btn accent" id="tPlay">▶ Nghe cả đoạn</button><button class="btn" id="tRole">🎭 Đóng vai</button>
      <button class="chip" data-topt="slow" aria-pressed="${!!tS.slow}">🐢 Đọc chậm</button></div>
    <div class="chips" style="margin-top:0">${opt("kanji", "Hiện kanji")}${opt("romaji", "Hiện romaji")}${opt("vi", "Hiện nghĩa")}${opt("hideMe", "Che câu của tôi")}</div>
    <div class="tlines">${D.lines.map(lineHTML).join("")}</div>
    ${D.notes?.length ? `<div class="more"><b>Cụm nên thuộc</b><ul>${D.notes.map((x: string) => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}
    <div class="tip">Cách luyện: ① <b>Nghe cả đoạn</b> 1 lần, nhìn nghĩa. ② Nghe lại, <b>đọc nhẩm theo</b> từng câu (shadowing). ③ <b>Đóng vai</b>: app đọc lời người kia, tới câu của bạn thì dừng, bạn tự đọc to. Lần sau bật <b>Che câu của tôi</b> để tự nhớ câu.</div>
    <div class="row" style="align-items:center;flex-wrap:wrap"><button class="btn ${readToday ? "ghost" : "accent"}" id="tDone">${readToday ? "✓ Đã luyện hôm nay" : "Tôi đã luyện xong đoạn này"}</button>
      ${done[D.id] ? `<span class="tip">Đã luyện ${done[D.id].n} lần</span>` : ""}
      ${ds.length > 1 ? `<button class="btn ghost" id="tNext">Đoạn tiếp →</button>` : ""}</div>
  </section>`;
  ctrl(); scrollLessonChip();
}

export function onClick(t: any): boolean {
  if (t.dataset.tl) { tS.l = +t.dataset.tl; tS.id = ""; save(); renderTalk(); return true; }
  if (t.dataset.tid) { tS.id = t.dataset.tid; save(); renderTalk(); return true; }
  if (t.dataset.topt) { tS[t.dataset.topt] = !tS[t.dataset.topt]; save(); renderTalk(); return true; }
  if (t.dataset.tsay !== undefined) { stop(); const D = curDialogue(), x = D.lines[+t.dataset.tsay]; cur = +t.dataset.tsay; mark(); speakLine(x.kana, (D.roles[x.s] || {}).g, () => { cur = -1; mark(); }); return true; }
  if (t.dataset.tpeek !== undefined) { const el = $("#tpk-" + t.dataset.tpeek); if (el) el.hidden = !el.hidden; return true; }
  if (t.id === "tPlay") { playing === "listen" ? stop() : play("listen"); return true; }
  if (t.id === "tRole") { playing === "role" ? stop() : play("role"); return true; }
  if (t.id === "tNext") { const ds = DIALOGUES.filter((d: any) => d.l === curLessonN()); const i = ds.findIndex((d: any) => d.id === tS.id); tS.id = ds[(i + 1) % ds.length].id; save(); renderTalk(); window.scrollTo({ top: 0 }); return true; }
  if (t.id === "tDone") {
    const D = curDialogue(), T = dayStr(), o = talkDone()[D.id];
    if (o?.d === T) return true;
    talkDone()[D.id] = { n: (o?.n || 0) + 1, d: T }; dailyInc("talk"); bump(1); saveProgress();
    toast("おつかれさま！ Đã ghi nhận 1 đoạn hội thoại."); renderTalk(); return true;
  }
  return false;
}
export function leaveTalk() { stop(); }
export function openTalkForLesson(n: number, id = "") { if (LESSON_NS.includes(n)) { tS.l = n; tS.id = id; save(); } }
// trượt dải "Bài" tới bài đang chọn (điện thoại)
export function scrollLessonChip() { const b: any = document.querySelector('.tchips [aria-pressed="true"]'); if (b) b.scrollIntoView({ inline: "center", block: "nearest" }); }
