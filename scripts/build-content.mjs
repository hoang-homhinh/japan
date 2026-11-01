// Sinh src/content/generated/vocab.json + kanji.json từ ../n5/*.md
// Port y nguyên datcau/build_vocab.py + datcau/build_kanji.py sang Node.
// Không thấy thư mục ../n5 (vd. khi build trên Vercel chỉ có repo n5app) → giữ nguyên JSON đã có.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const N5 = process.env.N5_DIR ? path.resolve(process.env.N5_DIR) : path.resolve(ROOT, "..", "n5");
const OUT = path.join(ROOT, "src", "content", "generated");

const lines = s => s.split(/\r\n|\r|\n/);
const stripPipes = s => s.replace(/^\|+/, "").replace(/\|+$/, "");

// ---------- từ vựng (build_vocab.py) ----------
function buildVocab() {
  const HEADER = /^\|\s*Kana\s*\|\s*Kanji\s*\|/;
  const cells = line => stripPipes(line.trim()).split("|").map(c => c.trim());
  const clean = s => s.replace(/\*\*|`/g, "").replace(/\t/g, " ").trim();
  const files = fs.readdirSync(N5).filter(f => /^bai\d\d_tuvung\.md$/.test(f)).sort();
  const out = [], log = [];
  let total = 0;
  for (const f of files) {
    const md = fs.readFileSync(path.join(N5, f), "utf8");
    const n = parseInt(f.slice(3, 5), 10);
    const m = md.match(/^> Chủ đề bài \d+:\s*(.+)$/m);
    const topic = m ? clean(m[1]) : "";
    const lesson = { n, topic, groups: [] };
    let inTable = false, heading = "", grp = null;
    for (const line of lines(md)) {
      if (line.startsWith("#")) heading = line;
      if (HEADER.test(line)) {
        inTable = true;
        const title = heading.replace(/^#+\s*(\d+[a-z]?\.\s*)?/, "").trim();
        grp = { t: clean(title), w: [] };
        lesson.groups.push(grp);
        continue;
      }
      if (inTable) {
        if (!line.startsWith("|")) { inTable = false; continue; }
        if ([...line.replace(/\|/g, "").trim()].every(ch => "-: ".includes(ch))) continue;
        const c = cells(line);
        while (c.length < 5) c.push("");
        if ((heading.startsWith("## ") && heading.includes("Tên riêng")) || c[4].includes("giả định")) continue;
        let [kana, kanji, romaji, nghia, note] = c.slice(0, 5).map(clean);
        if (kanji === "–" || kanji === "-") kanji = "";
        grp.w.push([kana, kanji, romaji, nghia, note]);
        total++;
      }
    }
    lesson.groups = lesson.groups.filter(g => g.w.length);
    log.push(`bai${String(n).padStart(2, "0")}: ${lesson.groups.reduce((a, g) => a + g.w.length, 0)} từ, ${lesson.groups.length} nhóm`);
    out.push(lesson);
  }
  return { out, log: log.join("\n") + `\nTổng: ${total}` };
}

// ---------- kanji (build_kanji.py) ----------
function buildKanji() {
  const dir = path.join(N5, "kanji");
  const files = fs.readdirSync(dir).filter(f => /^chuong0.*_kanji\.md$/.test(f)).sort();
  const chapters = [];
  for (const f of files) {
    const txt = fs.readFileSync(path.join(dir, f), "utf8");
    const title = txt.match(/^# Kanji – (Chương \d+): (.+?)\s*\(\d+ chữ\)/m);
    const ch = { name: title[1], title: title[2], groups: [] };
    for (const sec of txt.split(/^## /m).slice(1)) {
      const secLines = lines(sec);
      const g = { title: secLines[0].trim(), kanji: [] };
      for (const line of secLines) {
        if (!line.startsWith("|") || line.startsWith("| Kanji") || line.startsWith("|---")) continue;
        const cells = stripPipes(line.trim()).split("|").map(c => c.trim());
        if (cells.length < 7) { console.error("BAD ROW", f, line); continue; }
        const [k, hv, on, kun, mean, ex, tip] = cells;
        const exs = [];
        for (const part of ex.split(" · ")) {
          const m = part.trim().match(/^(.+?)（(.+?)）\s*(.*)$/s);
          if (m) exs.push([m[1], m[2], m[3]]);
          else console.error("BAD EX", k, part);
        }
        g.kanji.push({ k, hv, on, kun, mean, ex: exs, tip });
      }
      ch.groups.push(g);
    }
    chapters.push(ch);
  }
  return chapters;
}

if (!fs.existsSync(N5) || !fs.existsSync(path.join(N5, "kanji"))) {
  console.warn(`[content] Không thấy ${N5} → giữ nguyên src/content/generated/*.json`);
  if (!fs.existsSync(path.join(OUT, "vocab.json")) || !fs.existsSync(path.join(OUT, "kanji.json"))) {
    console.error("[content] Thiếu cả JSON đã sinh. Đặt biến N5_DIR trỏ tới thư mục n5.");
    process.exit(1);
  }
} else {
  fs.mkdirSync(OUT, { recursive: true });
  const v = buildVocab();
  const k = buildKanji();
  const write = (f, s) => { const p = path.join(OUT, f); if (!fs.existsSync(p) || fs.readFileSync(p, "utf8") !== s) fs.writeFileSync(p, s, "utf8"); };
  write("vocab.json", JSON.stringify(v.out));
  write("kanji.json", JSON.stringify(k));
  const nk = k.reduce((a, c) => a + c.groups.reduce((b, g) => b + g.kanji.length, 0), 0);
  console.log(`[content] vocab: ${v.out.length} bài, ${v.log.split("\n").pop()} · kanji: ${k.length} chương, ${nk} chữ`);
}
