# Đặc tả: chuyển app "Đặt câu mỗi ngày" sang dự án Vite + TypeScript (deploy Vercel)

## Nguồn hiện tại
- `D:\Vinh\training\japanese\datcau\datcau_source.html` — 1 file ~4.950 dòng (CSS + HTML + 1 thẻ `<script>`). Đây là bản ĐÃ build (các khối `/*@@…*/` đã được ghép), là nguồn sự thật cho logic.
- Dữ liệu tách sẵn (là nguồn sự thật cho nội dung, KHÔNG lấy từ HTML):
  - Ngữ pháp Bài 11–25: `datcau/lessons/b11_15.js`, `b16_20.js`, `b21_25.js` (dạng `DATA_PARTS.push({lessons,special,pairs})`).
  - Trợ từ: `datcau/particles/system.js` (PT_USES, PT_ASK, PT_SETS, PT_FRAMES, PT_BTNS), `drills.js` (PT_DRILLS).
  - Luyện thi: `datcau/exam/goi.js`, `bunpou.js`, `chokai.js` (dạng `EXAM_PARTS.push([...])`), sinh từ `datcau/exam/_src/*_gen.js`.
  - Hình: `datcau/img/kanji_ancient.js` (KANJI_ANCIENT), `datcau/img/vocab_pic.js` (VOCAB_PIC).
  - Từ vựng: `n5/baiXX_tuvung.md` → logic parse ở `datcau/build_vocab.py`. Kanji: `n5/kanji/chuong0X_kanji.md` → `datcau/build_kanji.py` (giờ có 8 chương, 95 chữ).
  - Ngữ pháp Bài 1–10 chỉ có trong HTML: mảng `LESSONS` + `EXTRA_PATTERNS` + `MORE` + `SPECIAL_EXTRA` + khối IIFE "SỬA SAU RÀ SOÁT" (dòng ~384–1031) và `SPECIAL`, `PAIRS` (~2591–2617), `CONFUSE`, `KPAIRS`, `HVRULE` (~2632–2634).

## Đích: `D:\Vinh\training\japanese\n5app`
```
package.json            scripts: dev, build (= node scripts/build-content.mjs && tsc --noEmit && vite build), preview, content
vite.config.ts          vite-plugin-pwa (manifest tiếng Việt, icon, offline cache toàn bộ asset)
tsconfig.json           strict: false, noImplicitAny: false (cho phép any), target ES2022, moduleResolution bundler
index.html              khung HTML (sidebar + bottomnav + #subnav + #main + #toast) như bản cũ
vercel.json             framework vite, SPA fallback
.env.example            VITE_SUPABASE_URL=, VITE_SUPABASE_ANON_KEY=
scripts/build-content.mjs   md → src/content/generated/vocab.json + kanji.json (port y nguyên build_vocab.py + build_kanji.py sang Node; đọc ../n5/)
public/icons/           icon PWA (tự vẽ SVG đơn giản chữ 文 nền cam #C2552A, xuất PNG 192/512 bằng sharp hoặc vẽ SVG + dùng SVG)
src/
  main.ts               nạp CSS, dựng shell, gọi initStore(), setView("today")
  styles/               tách CSS cũ thành vài file (base, layout, components, views…) — giữ nguyên giao diện, giữ dark mode
  core/util.ts          $, $$, esc, dayStr, addDays, toast, clone, pick, segBtns, seeded, shuffleWith, hashStr…
  core/kana.ts          K2R…, romajiToKana, kanaToRomaji, norm, showKana, pvText
  core/tts.ts           say, speakSeq, chọn giọng ja
  core/store.ts         S, lưu localStorage, saveProgress (debounce), saveSentence/delSentence, bump/streak/renderStats, mergeProgress(local, remote), export/import JSON
  core/sync.ts          Supabase (xem dưới). Không có env → chế độ chỉ lưu trên máy, mọi thứ vẫn chạy
  content/              dữ liệu (TS/JSON): lessons (1–10 chuyển thành TS, 11–25 chuyển từ datcau/lessons thành `export default`), notes (SPECIAL, PAIRS, SPECIAL_EXTRA), kanji-extra (CONFUSE, KPAIRS, HVRULE), particles, drills, exam/*.ts, pics (ancient, vocab_pic), generated/*.json
  views/                today.ts, learn.ts, review.ts, notes.ts, kanji.ts, vocab.ts, match.ts, particle.ts, exam.ts, account.ts
  app/shell.ts          nav 5 mục + subnav, setView, dailyPanel, examCountdown, bộ định tuyến sự kiện
```
- Mỗi view sở hữu trạng thái của nó (`let` trong module) và xuất `render…()` + `onClick(t): boolean`, `onInput(e)`, `onKey(e)` khi cần. Bộ xử lý sự kiện chung trong shell gọi lần lượt. Module khác cần đổi trạng thái của view thì gọi hàm xuất ra (vd `gotoPattern(l,p)`), không gán trực tiếp biến import (ESM không cho).
- Nạp lười (dynamic import) cho view nặng: exam (ngân hàng đề), match là không bắt buộc; ưu tiên chạy đúng.
- `npm run build` phải qua `tsc --noEmit` không lỗi. Dùng `any` thoải mái, không cần type đẹp.

## Giữ nguyên 100% hành vi (trừ phần AI)
Tất cả tab: Hôm nay (phiên học 3 bậc, ôn ngắt quãng, việc hôm nay, đếm ngược thi), Từ vựng (bài, kiểm tra nhanh, tìm kiếm, che nghĩa/che từ), Kanji (8 chương, đọc từ, chọn chữ, ảnh chữ cổ, tipHTML Gốc/Hình/Âm), Nối từ (ván / cả bài / danh sách), Ngữ pháp (25 bài, drill gõ kana/romaji, chấm bằng norm), Trợ từ (cách chọn / khung động từ / luyện điền / điểm yếu), Sổ ngữ pháp, Luyện thi (10 dạng, thi thử, kết quả), Sổ câu (ôn Leitner). Phím tắt, TTS, các khoá localStorage (`datcau_v1…`) giữ y nguyên để không mất trạng thái trên máy.

## BỎ AI (không còn `window.claude`, `sample`, `getSample`, `buildPrompt`, `runAI`, `runKanjiAI`, `runVocabAI`, `ensureCloze` gọi AI)
1. Ngữ pháp bước 三 "Tự đặt câu": người học viết câu → bấm "So với câu mẫu" → hiện câu mẫu (`prompt.ex`, có 🔊 và romaji) cạnh câu của họ, kèm 2 nút "Câu tôi đúng ý" / "Tôi viết sai, lưu câu mẫu". Cả hai đều lưu vào Sổ câu (`own` = câu người học, `jp` = câu mẫu; nếu chọn "đúng ý" thì `jp` = câu người học sau `showKana`). Câu tự do: lưu chính câu người học (không chấm). Logic gần với hàm `fallback()` hiện có.
2. Kanji bước 四 và Từ vựng "đặt câu với 3 từ": thay bằng "Viết câu → so với ví dụ": hiện các câu ví dụ có chứa chữ/từ đó (tìm trong ví dụ kanji, câu ví dụ ngữ pháp `ex`, câu luyện trợ từ, đề thi) để tự đối chiếu, nút "Lưu vào sổ câu".
3. Hôm nay bậc 3 "điền câu" (trước dùng AI tạo cloze): sinh KHÔNG cần AI. Lập chỉ mục 1 lần các câu kana có sẵn: `LESSONS[].patterns[].ex` + `drills[].a[0]`, PT_DRILLS (đã điền đáp án), đề thi (goi_ctx/bun_form với đáp án điền vào, ch_* script). Với một từ (kana, bỏ đuôi ます→ cũng tìm dạng ます nguyên), chọn câu chứa nguyên chuỗi kana đó, thay bằng `（　）` → người học gõ từ. Không có câu nào → dùng dạng "Nghe → gõ lại" (đọc TTS từ đó, gõ kana). Giữ cơ chế chấm/bậc như cũ.
Xoá mọi chữ "AI" trong giao diện/hướng dẫn cho khớp.

## Đồng bộ nhiều máy (Supabase)
- `supabase/schema.sql`: bảng `progress(user_id uuid primary key references auth.users on delete cascade, data jsonb not null, updated_at timestamptz default now())` + RLS: chỉ chủ sở hữu select/insert/update/delete hàng của mình.
- `data` = `{progress, sentences}` (gộp sổ câu vào cùng 1 tài liệu cho đơn giản).
- Đăng nhập email + mật khẩu (đăng ký / đăng nhập / đăng xuất / quên mật khẩu gửi mail) trong view `account.ts`, truy cập từ một nút ⚙ ở topbar và sidebar ("Tài khoản & sao lưu"). Ở đó cũng có: trạng thái đồng bộ, "Xuất sao lưu (.json)", "Nhập sao lưu", "Đồng bộ ngay".
- Lúc mở app / đăng nhập: tải remote → `mergeProgress` (port đúng quy tắc gộp trong `initStore` cũ: days hợp, counts max, drills/kanji/vocab hợp mảng, srs/pt theo `t` mới hơn, ex theo `t`, upto/exAll/examDate, daily theo ngày; sentences gộp theo id + `upd` mới hơn) → lưu cả 2 phía. Sau đó mỗi `saveProgress`/`saveSentence` → debounce 1,5s upsert. Khi tab ẩn → đẩy ngay. Lỗi mạng → giữ local, thử lại lần sau, hiện trạng thái nhỏ.
- File nhập sao lưu chấp nhận cả định dạng `{progress, sentences}` lẫn bản xuất từ app cũ.

## Kiểm tra trước khi xong
- `npm install`, `npm run build` sạch lỗi. `npx vite preview` rồi mở bằng Chrome headless (`"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --dump-dom`, script test đặt trong trang hoặc dùng `--remote-debugging`?) — đơn giản nhất: thêm tạm 1 file test HTML gọi các hàm qua `window.__app` (export debug) để: mở từng tab, chạy 1 phiên Hôm nay, làm 1 drill, 1 câu trợ từ, 1 câu thi, 1 thi thử, nối từ; không có lỗi console. Xoá phần test khi xong hoặc chỉ bật khi `import.meta.env.DEV`.
- README.md tiếng Việt: chạy local, cấu trúc thư mục, sửa nội dung ở đâu, build.
