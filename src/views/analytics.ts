// Phân tích: lịch học 20 tuần, mức thành thạo, độ phủ từ vựng theo bài, toàn bộ kanji, mục hay sai.
import { KANJI } from "../content/data";
import { heatmap, lessonCoverage, mastery, weakItems } from "../core/metrics";
import { kid, srs } from "../core/srs";
import { S, streak } from "../core/store";
import { $, dayStr, esc } from "../core/util";

const lvl = (n: number) => (n <= 0 ? 0 : n < 5 ? 1 : n < 15 ? 2 : n < 30 ? 3 : 4);

export function renderAnalytics() {
  const today = dayStr(), hm = heatmap(today, 20), m = mastery(), cov = lessonCoverage(), weak = weakItems(10);
  const active = hm.filter(c => c.n > 0).length, total = hm.reduce((a, c) => a + c.n, 0);
  const pct = (p: number) => Math.round(p * 100);
  const kj = KANJI.flatMap((c: any) => c.groups.flatMap((g: any) => g.kanji.map((k: any) => k.k)));
  $("#main").innerHTML = `<div class="m-grid">
  <div class="m-col">
    <section class="m-card"><div class="m-ch"><h2>Lịch học 20 tuần</h2><span>${active} ngày có học · ${total} câu đúng · chuỗi hiện tại ${streak()} ngày</span></div>
      <div class="mheat" role="img" aria-label="${active} ngày có học trong 20 tuần">${hm.map(c => `<i class="h${lvl(c.n)}" title="${c.d}: ${c.n}"></i>`).join("")}</div>
      <div class="mheatl"><span>Ít</span>${[0, 1, 2, 3, 4].map(i => `<i class="h${i}"></i>`).join("")}<span>Nhiều</span></div></section>
    <section class="m-card"><div class="m-ch"><h2>Từ vựng theo bài</h2><span>đã thuộc / đã gặp / tổng</span></div>
      <div class="cov">${cov.map(c => `<div class="covr"><span class="mono">B${String(c.n).padStart(2, "0")}</span><div class="t"><i class="seen" style="width:${(c.seen / c.total) * 100}%"></i><i class="done" style="width:${(c.done / c.total) * 100}%"></i></div><span class="mono">${c.done}/${c.seen}/${c.total}</span></div>`).join("")}</div></section>
  </div>
  <aside class="m-col">
    <section class="m-card"><div class="m-ch"><h2>Mức thành thạo</h2></div>
      ${[["Từ vựng", m.vocab.p, `${m.vocab.done}/${m.vocab.total}`], ["Kanji", m.kanji.p, `${m.kanji.done}/${m.kanji.total}`], ["Ngữ pháp", m.grammar.p, `${m.grammar.done}/${m.grammar.total}`], ["Trợ từ", m.particle.p, m.particle.total ? `${m.particle.done}/${m.particle.total} đúng` : "—"], ["Nghe", m.listening.p, m.listening.total ? `${m.listening.done}/${m.listening.total} đúng` : "—"]]
        .map(([t, p, v]) => `<div class="mbar"><span style="text-align:left;font:13px var(--vi);color:var(--ink)">${t}</span><div class="t" role="img" aria-label="${t} ${pct(p as number)}%"><i style="width:${pct(p as number)}%"></i></div><span>${v}</span></div>`).join("")}</section>
    <section class="m-card"><div class="m-ch"><h2>Hay sai nhất</h2><span>${weak.length ? "ôn kỹ các mục này" : ""}</span></div>
      ${weak.length ? weak.map(w => `<div class="wl"><b lang="ja">${esc(w.jp)}</b><span>${esc(w.vi)}</span><em class="mono">sai ${w.wr}</em></div>`).join("") : `<p style="margin:0;color:var(--dim);font-size:13.5px">Chưa có mục nào bị sai. Học thêm vài bước để có số liệu.</p>`}</section>
    <section class="m-card"><div class="m-ch"><h2>${m.kanji.total} kanji N5</h2><span>${m.kanji.done} đã nhớ</span></div>
      <div class="kgrid">${kj.map((k: string) => { const l = srs(kid(k))?.lv || 0; return `<span class="kg l${Math.min(l, 3)}" lang="ja" title="${S.progress.srs?.[kid(k)] ? "bậc " + l : "chưa học"}">${esc(k)}</span>`; }).join("")}</div>
      <div class="mheatl" style="margin-top:10px"><span class="kg l0" style="width:auto;padding:0 6px">chưa học</span><span class="kg l1" style="width:auto;padding:0 6px">đang học</span><span class="kg l3" style="width:auto;padding:0 6px">đã nhớ</span></div></section>
  </aside></div>`;
}
