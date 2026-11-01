// Chép dữ liệu từ dự án cũ ../datcau sang src/content (chỉ đọc ../datcau, không sửa gì ở đó).
// Chạy khi dữ liệu bên datcau thay đổi:  node scripts/import-datcau.mjs [lessons|particles|exam|pics ...]
// Không truyền tham số = chép tất cả. Ngữ pháp Bài 1–10 đã nằm hẳn ở src/content/lessons.ts (sửa trực tiếp ở đó).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const DC = process.env.DATCAU_DIR ? path.resolve(process.env.DATCAU_DIR) : path.resolve(ROOT, "..", "datcau");
const C = path.join(ROOT, "src", "content");
const want = new Set(process.argv.slice(2));
const on = k => !want.size || want.has(k);
const rd = (...p) => fs.readFileSync(path.join(DC, ...p), "utf8").replace(/\r\n/g, "\n").trim();
const wr = (p, s) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, s, "utf8"); console.log("  ghi", path.relative(ROOT, p), Math.round(s.length / 1024) + "KB"); };
const HDR = "// Sinh bởi scripts/import-datcau.mjs từ ../datcau — sửa ở nguồn rồi chạy lại.\n";

if (on("lessons")) {
  for (const f of fs.readdirSync(path.join(DC, "lessons")).filter(f => /^b\d+_\d+\.js$/.test(f)).sort()) {
    const body = rd("lessons", f);
    wr(path.join(C, "lessons", f.replace(/\.js$/, ".ts")),
      HDR + "const DATA_PARTS: any[] = [];\n" + body + "\nexport default DATA_PARTS[0];\n");
  }
}

// const X=… ở đầu dòng → export const X: any = …
const exportConsts = s => s.replace(/^const (\w+)=/gm, "export const $1: any = ");

if (on("particles")) {
  wr(path.join(C, "particles.ts"), HDR + exportConsts(rd("particles", "system.js")) + "\n");
  wr(path.join(C, "drills.ts"), HDR + exportConsts(rd("particles", "drills.js")) + "\n");
}

if (on("exam")) {
  for (const f of ["goi.js", "bunpou.js", "chokai.js"]) {
    wr(path.join(C, "exam", f.replace(/\.js$/, ".ts")),
      HDR + "const EXAM_PARTS: any[] = [];\n" + rd("exam", f) + "\nexport default EXAM_PARTS.flat();\n");
  }
}

if (on("pics")) {
  const grab = (file, name) => {
    const p = path.join(DC, "img", file);
    if (!fs.existsSync(p)) return null;
    // file chỉ khai báo 1 hằng số dữ liệu → chạy trong hàm rỗng để lấy object
    return new Function(fs.readFileSync(p, "utf8") + `\n;return ${name};`)();
  };
  const anc = grab("kanji_ancient.js", "KANJI_ANCIENT");
  const ancOut = path.join(C, "kanji_ancient.json");
  if (anc) wr(ancOut, JSON.stringify(anc));
  else if (!fs.existsSync(ancOut)) { console.warn("  chưa có datcau/img/kanji_ancient.js → tạm ghi {} (app vẫn chạy, chỉ thiếu hình chữ cổ)"); wr(ancOut, "{}"); }
  else console.warn("  chưa có datcau/img/kanji_ancient.js → giữ kanji_ancient.json cũ");
  const pic = grab("vocab_pic.js", "VOCAB_PIC");
  if (pic) wr(path.join(C, "vocab_pic.json"), JSON.stringify(pic));
}
