// Khung app: 5 mục chính + mục con, việc hôm nay, đếm ngược kỳ thi, bộ định tuyến sự kiện
import { pvText } from "../core/kana";
import { LS_KEY, S, dailyGet } from "../core/store";
import { say } from "../core/tts";
import { $, $$, esc, toast } from "../core/util";
import * as today from "../views/today";
import * as learn from "../views/learn";
import * as vocab from "../views/vocab";
import * as kanji from "../views/kanji";
import * as match from "../views/match";
import * as notes from "../views/notes";
import * as review from "../views/review";
import * as particle from "../views/particle";
import * as exam from "../views/exam";
import * as account from "../views/account";
import * as talk from "../views/talk";
import * as library from "../views/library";
import * as journey from "../views/journey";
import * as station from "../views/station";
import * as player from "../views/player";
import * as stamps from "../views/stamps";
import * as reviewq from "../views/reviewq";

export let view = "today";

const NAV_GROUPS: any = { journey: ["journey", "station", "player", "stamps"], reviewq: ["reviewq", "review"], library: ["library", "vocab", "kanji", "match", "learn", "talk", "particle", "notes", "exam"] };
const NO_SUBNAV = new Set(["journey"]);
const SUB_NAME: any = { library: "Tất cả", reviewq: "Ôn hôm nay", review: "Sổ câu", vocab: "Từ vựng", kanji: "Kanji", match: "Nối từ", learn: "Mẫu câu", talk: "Hội thoại", particle: "Trợ từ", notes: "Sổ ngữ pháp" };
export const navGroupOf = (v: string) => Object.keys(NAV_GROUPS).find(g => NAV_GROUPS[g].includes(v)) || v;
const LASTSUB: any = {};
try { Object.assign(LASTSUB, JSON.parse(localStorage.getItem(LS_KEY + "_sub") || "{}")); } catch (e) {}
function renderSubnav(v: string) {
  const g = navGroupOf(v), box = $("#subnav"); if (!box) return;
  LASTSUB[g] = v; try { localStorage.setItem(LS_KEY + "_sub", JSON.stringify(LASTSUB)); } catch (e) {}
  const subs = NO_SUBNAV.has(g) ? [] : NAV_GROUPS[g] || [];
  box.innerHTML = subs.length > 1 ? subs.map((s: string) => `<button class="subi" data-view="${s}" aria-pressed="${s === v}">${esc(SUB_NAME[s] || s)}</button>`).join("") : "";
  box.hidden = subs.length < 2;
}
const DAILY_GOAL = { gram: 4, pt: 10, ex: 10, talk: 1 };
export function dailyPanel(vocabLeft: number) {
  const d = dailyGet();
  const rows = [
    { k: "vocab", ico: "語", t: "Từ vựng + kanji", sub: vocabLeft ? `còn ${vocabLeft} lượt` : "xong ✓", done: !vocabLeft, btn: "dStart", bl: "Học" },
    { k: "gram", ico: "文", t: "1 mẫu ngữ pháp", sub: `${Math.min(d.gram, DAILY_GOAL.gram)}/${DAILY_GOAL.gram} câu thay thế đúng`, done: d.gram >= DAILY_GOAL.gram, btn: "dGram", bl: "Học" },
    { k: "talk", ico: "話", t: "1 đoạn hội thoại", sub: (d.talk || 0) >= DAILY_GOAL.talk ? "xong ✓" : "nghe + đọc nhẩm theo", done: (d.talk || 0) >= DAILY_GOAL.talk, btn: "dTalk", bl: "Đọc" },
    { k: "pt", ico: "助", t: "10 câu trợ từ", sub: `${Math.min(d.pt, DAILY_GOAL.pt)}/${DAILY_GOAL.pt}`, done: d.pt >= DAILY_GOAL.pt, btn: "dPt", bl: "Luyện" },
    { k: "ex", ico: "試", t: "10 câu luyện thi N5", sub: `${Math.min(d.ex, DAILY_GOAL.ex)}/${DAILY_GOAL.ex}`, done: d.ex >= DAILY_GOAL.ex, btn: "dEx", bl: "Luyện" },
  ];
  const n = rows.filter(r => r.done).length;
  return `<section class="panel span12"><h3>Việc hôm nay · ${n}/${rows.length}</h3><div class="todo">${rows.map(r => `<div class="td${r.done ? " done" : ""}"><span class="tdi">${r.done ? "✓" : r.ico}</span><div><b>${esc(r.t)}</b><div class="tip">${r.sub}</div></div>${r.done ? "" : `<button class="btn ghost" id="${r.btn}">${r.bl}</button>`}</div>`).join("")}</div>
    <div class="tip">Thứ tự gợi ý: từ vựng → ngữ pháp → hội thoại → trợ từ → luyện thi. Hôm bận chỉ cần làm dòng đầu.</div></section>`;
}
export function examCountdown() {
  if (!S.progress.examDate) return "";
  const d = Math.ceil((+new Date(S.progress.examDate + "T09:00:00") - +new Date()) / 86400000);
  return d >= 0 ? `<span class="pill">試 ${d === 0 ? "Hôm nay thi!" : "Còn " + d + " ngày tới kỳ thi"}</span>` : "";
}

const VIEW_NAME: any = { library: "Thư viện", reviewq: "Ôn tập", journey: "Hành trình", station: "Ga", player: "Đang học", stamps: "Sổ dấu ga", today: "Hôm nay", learn: "Ngữ pháp", vocab: "Từ vựng", kanji: "Kanji", match: "Nối từ", review: "Ôn sổ câu", notes: "Sổ ngữ pháp", particle: "Trợ từ", talk: "Hội thoại", exam: "Luyện thi N5", account: "Tài khoản & sao lưu" };
const RENDER: any = {
  library: () => library.renderLibrary(),
  journey: () => journey.renderJourney(), station: () => station.renderStation(), player: () => player.renderPlayer(), stamps: () => stamps.renderStamps(), reviewq: () => reviewq.renderReviewTab(),
  today: () => setView("journey"), // màn cũ đã thay bằng Hành trình learn: () => learn.renderLearn(), notes: () => notes.renderNotes(), kanji: () => kanji.renderKanji(), vocab: () => vocab.renderVocab(),
  match: () => match.renderMatch(), particle: () => particle.renderParticles(), exam: () => exam.renderExam(), account: () => account.renderAccount(), talk: () => talk.renderTalk(), review: () => review.openReview(),
};
export function setView(v: string) {
  if (!RENDER[v]) v = "review";
  view = v;
  $$(".navi,.bni").forEach(b => b.setAttribute("aria-selected", String(navGroupOf(b.dataset.view) === navGroupOf(v))));
  $$(".gear").forEach(b => b.setAttribute("aria-pressed", String(v === "account")));
  renderSubnav(v);
  talk.leaveTalk(); // dừng phát hội thoại khi đổi tab
  if ("speechSynthesis" in window && v !== "exam") speechSynthesis.cancel();
  const c = $("#crumb"); if (c) c.textContent = VIEW_NAME[v] || "";
  RENDER[v]();
  // giữ đường link …/#tab khớp tab đang mở (tải lại trang vẫn ở đúng tab)
  if (location.hash.slice(1) !== v) history.replaceState(null, "", "#" + v);
  window.scrollTo({ top: 0 });
}

// sau khi gộp dữ liệu từ máy khác: vẽ lại tab hiện tại nếu không làm mất việc đang làm dở (như initStore cũ)
export function refreshView() {
  const typing = $$("#main input,#main textarea").some(el => el.value && !["checkbox", "date", "email", "password"].includes(el.type));
  if (view === "review") review.openReview();
  else if (view === "today") { if (!today.SES) today.renderToday(); }
  else if (view === "account") { if (!$$("#main input").some(el => el.value && el.type !== "file")) account.renderAccount(); }
  else if (typing) { if (view === "learn") learn.renderLearnChips(); }
  else if (view === "learn") learn.renderLearn(); else if (view === "kanji") kanji.renderKanji(); else if (view === "vocab") vocab.renderVocab(); else if (view === "match") match.renderMatch(); else if (view === "particle" && !particle.PQ) particle.renderParticles(); else if (view === "exam" && !exam.XS) exam.renderExam(); else if (view === "notes") notes.renderNotes();
}

// ---- bộ định tuyến sự kiện: hỏi lần lượt từng view, view nào nhận thì dừng ----
export function bindEvents() {
  document.addEventListener("submit", e => e.preventDefault());
  document.addEventListener("click", (e: any) => {
    const t = e.target.closest("button");
    if (!t) { const r = e.target.closest(".cover-m .vrow,.cover-w .vrow"); if (r) r.classList.toggle("peek"); return; }
    if (player.onClick(t)) return;
    if (view === "reviewq" && reviewq.onClick(t)) return;
    if (view === "journey" && journey.onClick(t)) return;
    if (t.dataset.station) return station.openStation(+t.dataset.station);
    if (view === "station" && station.onClick(t)) return;
    if (match.onClick(t)) return;
    if (view === "talk" && talk.onClick(t)) return;
    if (t.id === "dTalk") return setView("talk");
    if (t.dataset.view) { const v = t.dataset.view; if (t.classList.contains("navi") || t.classList.contains("bni")) return setView(NO_SUBNAV.has(navGroupOf(v)) ? v : LASTSUB[navGroupOf(v)] || v); return setView(v); }
    if (t.dataset.say) return say(t.dataset.say);
    if (view === "particle" && particle.ptClick(t)) return;
    if (view === "exam" && exam.exClick(t)) return;
    if (view === "account" && account.onClick(t)) return;
    if (today.onClick(t)) return;
    if (vocab.onClick(t)) return;
    if (kanji.onClick(t)) return;
    if (notes.onClick(t)) return;
    if (learn.onClick(t)) return;
    if (t.classList.contains("dot")) { t.setAttribute("aria-pressed", String(t.getAttribute("aria-pressed") !== "true")); const all = [...t.parentElement.querySelectorAll(".dot")]; if (all.every((d: any) => d.getAttribute("aria-pressed") === "true")) toast("Tốt lắm! Đọc to đủ 3 lần."); return; }
    if (review.onClick(t)) return;
  });
  document.addEventListener("input", (e: any) => {
    const el = e.target;
    let pv: any = null;
    if (el.dataset?.wsent) { pv = $(`#${el.dataset.wsent}-pv`); el.style.height = "auto"; el.style.height = el.scrollHeight + "px"; if (pv) pv.textContent = pvText(el.value); return; }
    if (view === "today") { if (el.id === "sIn") { pv = $("#sPv"); if (pv) pv.textContent = pvText(el.value); } return; }
    if (view === "vocab") {
      if (el.id === "vSearch") return vocab.vSearch(el.value);
      if (el.dataset.vq !== undefined) pv = $(`#vpv-${vocab.vL}-${el.dataset.vq}`);
      if (pv) pv.textContent = pvText(el.value); return;
    }
    if (view === "kanji") {
      if (el.dataset.kread !== undefined) pv = $(`#kpv-${kanji.gid()}-${el.dataset.kread}`);
      if (pv) pv.textContent = pvText(el.value); return;
    }
    if (view !== "learn") return;
    const P = learn.curPattern(); if (!P) return;
    if (el.dataset.drill !== undefined) pv = $(`#pv-${P.id}-${el.dataset.drill}`);
    if (el.dataset.prompt !== undefined) { pv = $(`#ppv-${P.id}-${el.dataset.prompt}`); el.style.height = "auto"; el.style.height = el.scrollHeight + "px"; }
    if (pv) pv.textContent = pvText(el.value);
  });
  document.addEventListener("change", (e: any) => {
    if (view === "exam") exam.onChange(e);
    if (view === "particle") particle.onChange(e);
  });
  document.addEventListener("keydown", (e: any) => {
    if (view === "player" && player.onKey(e)) return;
    if (view === "exam" && exam.onKey(e)) return;
    if (view === "particle" && particle.onKey(e)) return;
    if (view === "today" && today.onKey(e)) return;
    const ds = e.target.dataset || {};
    if (e.key === "Enter" && !e.isComposing && e.keyCode !== 229) {
      if (ds.drill !== undefined) { e.preventDefault(); learn.checkDrill(+ds.drill); }
      if (ds.vq !== undefined) { e.preventDefault(); vocab.vCheck(+ds.vq); }
      if (ds.kread !== undefined) { e.preventDefault(); kanji.kCheck(+ds.kread); }
    }
  });
}
