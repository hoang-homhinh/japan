// Tải thứ tự nét của các kanji đang học từ KanjiVG (© Ulrich Apel, CC BY-SA 3.0)
// → src/content/strokes.json = { "行": ["M…", …], … } (mỗi phần tử là một nét, đúng thứ tự viết).
// Chạy lại khi thêm chương kanji: npm run strokes
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const KANJI = JSON.parse(fs.readFileSync(path.join(ROOT, "src/content/generated/kanji.json"), "utf8"));
const OUT = path.join(ROOT, "src/content/strokes.json");
const chars = KANJI.flatMap(c => c.groups.flatMap(g => g.kanji.map(k => k.k)));
const out = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : {};
const sleep = ms => new Promise(r => setTimeout(r, ms));
const miss = [];
for (const ch of chars) {
  if (out[ch]) continue;
  const hex = ch.codePointAt(0).toString(16).padStart(5, "0");
  try {
    const res = await fetch(`https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hex}.svg`);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const svg = await res.text();
    const d = [...svg.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map(m => m[1]);
    if (!d.length) throw new Error("không có nét");
    out[ch] = d;
  } catch (e) { miss.push(ch + " (" + e.message + ")"); }
  await sleep(300);
}
fs.writeFileSync(OUT, JSON.stringify(out));
console.log(`nét: ${Object.keys(out).length}/${chars.length}` + (miss.length ? ` · lỗi: ${miss.join(", ")}` : ""));
