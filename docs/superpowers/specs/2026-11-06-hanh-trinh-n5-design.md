# Hành trình N5 — thiết kế lại cách học và giao diện (phần 1/4)

Ngày: 2026-11-06 · Dự án: `D:\Vinh\training\japanese\n5app` (Vite + TypeScript, PWA, Vercel, Supabase)

## 1. Vì sao làm lại

Người học (Hoàng, kỹ sư người Việt ở công ty Sankei tại Nhật, đang ở Bài 13 Minna) thấy app hiện tại **khó học**: 10 màn hình rời nhau (Hôm nay, Từ vựng, Kanji, Nối từ, Mẫu câu, Hội thoại, Trợ từ, Sổ ngữ pháp, Luyện thi, Sổ câu), phải tự chọn học gì, nhiều bài bắt gõ romaji. Nội dung thì đã đủ: 1049 từ, 95 kanji, 138 mẫu, 319 câu trợ từ, ~570 câu thi, 50 hội thoại.

Người học muốn (lời của họ): **đổi cách dạy**, **gom thành một lộ trình để học được N5**, **có phần kanji**, **giao diện đẹp hiện đại, có cảm giác 3D, đẳng cấp**, **vừa học vừa thích thú**. Người học giao quyền chọn cách học cho người làm ("cứ đưa cái app đẳng cấp nhất có thể").

Dự án lớn được chia 4 phần, làm lần lượt. **Tài liệu này chỉ thiết kế phần 1.**
1. Lộ trình + cách dạy + giao diện mới ← tài liệu này
2. Email nhắc học theo giờ tự đặt (Supabase lịch chạy định kỳ + dịch vụ gửi mail) — thiết kế sau
3. Hoàn thiện đăng ký/đăng nhập email, tiến độ theo từng người (đã có phần lõi qua Supabase) — thiết kế sau
4. Chuyển tiến độ cũ — gộp vào phần 1 ở mức "không làm mất dữ liệu cũ" (mục 9)

## 2. Mục tiêu, không làm, phải tránh

**Mục tiêu**
- Mở app ra chỉ thấy **một việc chính: "Tiếp tục hành trình"**. Không phải tự quyết học gì.
- Mỗi bài Minna = **một ga**, chia thành **các bước 5–7 phút**; đi hết 25 ga = đủ kiến thức N5.
- Cách dạy mới: **ngữ cảnh trước → chia nhỏ → nhớ lại bằng chạm/chọn → ôn đúng lúc sắp quên**.
- Kanji có bước riêng trong mỗi ga, dạy theo nguồn gốc chữ + thứ tự nét.
- Học **thấy vui**: cảm giác đi tàu qua nước Nhật, sưu tầm con dấu ga, Pen-chan phản ứng, thưởng nhỏ liên tục.
- Giao diện có chiều sâu 3D, đẹp trên điện thoại (người học chủ yếu dùng điện thoại).

**Không làm (ở phần 1)**: AI chấm câu (đã bỏ theo yêu cầu trước), nhận giọng nói (người học không muốn), email nhắc (phần 2), app native.

**Phải tránh** (dù chạy đúng vẫn coi là hỏng):
- Màn chính lại thành nhiều nút/tab ngang hàng như cũ.
- Gõ romaji là cách trả lời chính (chỉ được là tuỳ chọn).
- Giao diện trông như mẫu có sẵn (kiểu thẻ bo tròn giống nhau, nền kem + màu đất).
- Mất tiến độ đã học (154 mục ôn tập, chuỗi ngày, sổ câu).
- Nặng/giật trên điện thoại tầm trung.

## 3. Các hướng đã cân nhắc

| Hướng | Mô tả | Được | Mất |
|---|---|---|---|
| **A. Hành trình N5 (đã chọn)** | Tuyến tàu 25 ga = 25 bài; mỗi ga 6 bước ngắn, mở khoá tuần tự; ôn tập tự chèn đầu buổi; các công cụ cũ vào "Thư viện" | Rõ ràng, luôn biết làm gì tiếp; bám sát Minna/N5; tận dụng hết nội dung sẵn có | Phải dựng lại phần khung + giao diện |
| B. Học qua câu chuyện | Mỗi ngày 1 truyện/hội thoại, chạm từ nào học từ đó | Tự nhiên, cuốn | Khó bám đề N5, khó đo tiến độ |
| C. Giữ tab cũ + kế hoạch ngày | Thêm bảng kế hoạch trên các tab cũ | Nhanh | Không đổi cách dạy → không chữa "khó học" |

Người học chọn A (giao quyền chọn; người làm đề xuất A, người học đồng ý "oke").

## 4. Cách dạy mới — một ga (một bài)

Mỗi ga có 6 bước, làm theo thứ tự; bước sau mở khi bước trước xong. Mỗi bước 5–7 phút, có thể dừng giữa chừng và quay lại đúng chỗ.

| # | Bước | Học gì | Người học làm gì | Nguồn nội dung |
|---|---|---|---|---|
| 1 | **Nghe chuyện ở ga** | Hội thoại "a" của bài | Nghe cả đoạn (câu đang đọc sáng lên), xem nghĩa, nghe lại từng câu. Không chấm điểm. | `DIALOGUES` (l = bài) |
| 2 | **Từ mới** | Từ của bài, chia lô ~7 từ | Thẻ giới thiệu (hình, âm 🔊, kanji, mẹo) → chọn nghĩa đúng (4 lựa chọn) → nghe chọn từ → nối cặp nhanh. Từ đã thuộc (srs bậc 3) được bỏ qua. | `VOCAB`, `VOCAB_PIC`, srs |
| 3 | **Mẫu câu** | Các mẫu ngữ pháp của bài | Xem mẫu + ví dụ → **ghép câu bằng cách chạm khối chữ** (khối được cắt từ câu đúng, xáo trộn, kèm 1–2 khối gây nhiễu) → điền chỗ trống chọn đáp án. Gõ kana/romaji chỉ là tuỳ chọn ("Tự gõ"). | `LESSONS[].patterns` (ex, drills.a) |
| 4 | **Trợ từ trong câu** | Trợ từ dùng ở bài | 8–10 câu điền trợ từ bằng nút; sai thì hiện "câu tự hỏi" + cặp hay nhầm liên quan | `PT_DRILLS` (l ≤ bài, ưu tiên l = bài), `PG_PAIRS` |
| 5 | **Kanji của ga** | 3–5 chữ (mục 5) | Mỗi chữ: hình chữ cổ → chữ nay, **hoạt hình thứ tự nét**, Gốc/Hình/Âm, 🔊 từ ví dụ → luyện: chọn cách đọc, chọn chữ đúng (chữ na ná), nhận ra chữ trong từ của bài | `KANJI`, `KANJI_ANCIENT`, dữ liệu nét (mục 5) |
| 6 | **Kiểm tra qua ga** | Tổng hợp cả ga | 10–12 câu kiểu đề JLPT (từ vựng, đọc kanji, ngữ pháp, nghe 1–2 câu). Đạt ≥ 70% → **đóng dấu ga** và mở ga tiếp. Chưa đạt → chỉ ra bước nên ôn lại. | đề thi (l = bài), gen kanji, PT, hội thoại "b" |

Sau khi qua ga: hội thoại "b" + "Đóng vai" mở trong mục ôn của ga (luyện nói đọc nhẩm, không chấm).

**Ôn tập tự động**: mỗi lần bấm "Tiếp tục", nếu có mục đến hạn (từ, kanji, câu trợ từ/thi đã sai), app chèn **một gói ôn ngắn (tối đa ~15 câu, ~3 phút)** trước bước mới. Dùng lại lịch ôn hiện có (1 → 3 → 7 → 14 → 30 ngày).

**Nhịp mỗi ngày**: mục tiêu mặc định = **gói ôn + 1 bước mới (~10 phút)**; người học có thể đặt 1/2/3 bước mỗi ngày.

**Bắt đầu ở đâu**: lần đầu mở bản mới, hỏi "Bạn đang học tới bài mấy?" (mặc định lấy `upto` = 13). Các ga trước đó ở trạng thái **"đã đi qua — chưa đóng dấu"**: được mở hết, có thể làm bài Kiểm tra qua ga để lấy dấu ngay mà không cần đi lại 5 bước.

## 5. Kanji

- **Chia kanji vào ga**: mỗi chữ gán vào bài đầu tiên có từ vựng chứa nó (73/95 chữ, đã tính: Bài 1 có 11 chữ, Bài 2: 4, Bài 4: 12…). Cân bằng lại để mỗi ga **3–5 chữ**: ga thừa đẩy chữ sang ga sau gần nhất; 22 chữ không có trong từ vựng (二…十, 畑氷雲太京林森石夕米飯毛光) điền vào các ga còn ít chữ, giữ thứ tự chương kanji của người học. Bảng gán được tính lúc build và lưu thành dữ liệu cố định để không đổi giữa các lần.
- **Thứ tự nét**: dùng dữ liệu **KanjiVG** (giấy phép CC BY-SA 3.0, ghi nguồn trong app), tải 1 lần lúc chuẩn bị dữ liệu cho 95 chữ, lưu trong `src/content`. Hiển thị: nét vẽ lần lượt (hoạt hình SVG), nút "Xem lại", số thứ tự nét.
- Giữ nội dung cũ: hình chữ cổ (90/95 chữ), Gốc/Hình/Âm, ví dụ.
- Tab Kanji theo 8 chương cũ vẫn còn trong Thư viện.

## 6. Thích thú khi học

Cái "đáng nhớ" của app là **đi tàu qua nước Nhật**; các phần thưởng đều xoay quanh chuyện đó.

- **Sổ con dấu ga (駅スタンプ)**: ở Nhật mỗi ga có con dấu riêng để du khách sưu tầm. Qua mỗi ga, app **đóng một con dấu** hình tròn mực đỏ/chàm (vẽ SVG: tên ga + hình đặc trưng của bài, vd Bài 13 = bát cơm) kèm hoạt cảnh dấu ấn xuống. Có trang "Sổ dấu" 25 ô.
- **Tên ga theo địa danh thật** dọc một tuyến tưởng tượng Tokyo → Kyoto → Osaka → … (gán sẵn 25 địa danh), mỗi ga có số hiệu như ga tàu Nhật: `N01 … N25`.
- **Pen-chan đi cùng**: ngồi trên tàu ở bản đồ; phản ứng khi đúng/sai (đã có 5 biểu cảm); câu khen tiếng Nhật xoay vòng.
- **Chuỗi đúng liên tiếp** trong một bước (3, 5, 10 câu) → hiệu ứng nhỏ + tiếng chuông.
- **Nhạc báo tàu chạy (発車メロディ)** ngắn 2–3 giây khi xong một bước (tổng hợp bằng Web Audio, không cần file âm thanh); có nút tắt âm.
- **Chuỗi ngày** (đã có) hiển thị như "số ngày tàu chạy liên tục".
- **Mục tiêu ngày** dạng thanh đường ray: đầy ray = tàu tới ga.
- Không dùng điểm số cạnh tranh hay bảng xếp hạng (1 người học).

## 7. Giao diện

### Hướng thẩm mỹ (theo plugin frontend-design, tránh kiểu mặc định)
Ngôn ngữ **biển báo nhà ga Nhật**: biển tên ga trắng có dải màu tuyến, số hiệu ga, bảng giờ tàu, đèn tín hiệu. Đây là chủ đề gắn với "hành trình" và quen mắt với người sống ở Nhật. Bỏ nền kem + đỏ đất của giao diện cũ.

- **Màu** (4–6 màu gốc):
  - Mực biển ga `#1C2230` — chữ, khung chính
  - Nền sân ga `#EEF2F5` — nền lạnh, sáng (không phải kem)
  - Màu tuyến N5 `#00A0A0` (xanh ngọc kiểu tuyến tàu) — đường ray, tiến độ, ga hiện tại
  - Xanh Shinkansen `#1659C7` — nút hành động chính
  - Vàng vạch an toàn `#F2B300` — dấu, thành tích, chuỗi
  - Đỏ đèn tín hiệu `#D7263D` — chỉ dùng cho sai/lỗi
  - Chế độ tối: "tàu đêm" nền `#121826`, đường ray phát sáng nhẹ.
- **Chữ**: tiếng Việt **Be Vietnam Pro** (thiết kế cho tiếng Việt; đậm kiểu biển báo cho tiêu đề), tiếng Nhật **Zen Kaku Gothic New** (gothic kiểu biển ga). Riêng thẻ kanji dùng **Klee One** (nét bút tay, nhìn rõ nét viết).
- **Bố cục**:
  - Màn chính = **bản đồ tuyến 3D** cuộn dọc (phần táo bạo duy nhất). Đường ray chạy ngoằn ngoèo, mỗi ga là **một khối sân ga nổi 3D** (CSS `perspective` + `transform`, bóng nhiều lớp), ga hiện tại sáng lên và có tàu + Pen-chan đỗ. Ga đã qua mang con dấu. Ga chưa mở mờ, có ổ khoá.
  - Cố định dưới đáy: **biển "Tiếp tục"** kiểu biển tên ga: `N13 · Gọi món · Bước 3/6 — Mẫu câu` + nút lớn.
  - Màn ga = **bảng giờ tàu** liệt kê 6 bước (đây đúng là chuỗi tuần tự nên dùng số thứ tự), bước hiện tại nhấp nháy như đèn bảng điện tử.
  - Màn làm bài = **một câu một màn**, chữ to, thanh tiến độ là đường ray có tàu chạy; kết quả đúng/sai trượt lên từ đáy (xanh ngọc/đỏ tín hiệu) kèm Pen-chan.
  - Thư viện: danh sách các công cụ cũ (Từ điển từ vựng, Kanji theo chương, Nối từ, Sổ ngữ pháp, Trợ từ tổng hợp, Hội thoại, Luyện thi & thi thử, Sổ câu).
  - Thanh điều hướng còn 3 mục: **Hành trình · Ôn tập · Thư viện** (+ ⚙ tài khoản ở góc).
- **3D và chuyển động**: chỉ dùng chuyển động khi người học làm gì đó (tàu chạy tới ga mới khi mở khoá, dấu đóng xuống, thẻ lật khi xem đáp án). Một khoảnh khắc mở màn: tàu lăn bánh tới ga hiện tại khi vào app. Tôn trọng "giảm chuyển động" của máy. Không dùng thư viện 3D nặng; tất cả bằng CSS 3D + SVG.
- **Chuẩn tối thiểu**: đẹp ở 360px, có focus bàn phím, đủ tương phản, chạy mượt điện thoại tầm trung.

### Phác thảo
```
Màn chính (điện thoại)                 Màn ga                         Làm bài
┌───────────────────────────┐         ┌─────────────────────────┐    ┌─────────────────────────┐
│ 🔥 12 ngày   ● 8/10 phút  ⚙│         │ N13  食堂 Shokudō        │    │ ▬▬▬▬🚃▬▬▬▬▬▬  4/10       │
│        ╱▔▔▔▔╲             │         │ Bài 13 · Gọi món         │    │                         │
│   [N15]🔒     ╲            │         │ ┌ BẢNG GIỜ TÀU ────────┐ │    │  Ghép câu:              │
│              [N14]🔒       │         │ │1 Nghe chuyện ở ga  ✓ │ │    │  "Tôi muốn ăn sushi."   │
│        ╱▔▔▔▔▔             │         │ │2 Từ mới            ✓ │ │    │  [すし][を][たべ][たい] │
│  ▣[N13]🚃🐧  ← đang ở     │         │ │3 Mẫu câu      ● đang │ │    │  [です][が][に]          │
│     ╲___                  │         │ │4 Trợ từ            🔒│ │    │  ───────────────        │
│        [N12]㊞             │         │ │5 Kanji của ga      🔒│ │    │  すし を ...            │
│   ╱▔▔▔                    │         │ │6 Kiểm tra qua ga   🔒│ │    │                         │
├───────────────────────────┤         │ └──────────────────────┘ │    │ ┌─────────────────────┐ │
│ N13 Gọi món · Bước 3/6    │         │  Dấu ga: (chưa có)       │    │ │🐧 すごい！ Đúng rồi │ │
│ [   ▶ Tiếp tục hành trình ]│         │  [ ▶ Học bước 3 ]        │    │ │ [ Tiếp ]            │ │
├───────────────────────────┤         └─────────────────────────┘    │ └─────────────────────┘ │
│ 🚃 Hành trình  ↻ Ôn  📚 Thư viện │                                    └─────────────────────────┘
└───────────────────────────┘
```

## 8. Kiến trúc (giữ nền cũ, thay phần trên)

- Giữ: `core/` (store, sync Supabase, srs, kana, tts, corpus, examgen, mascot), toàn bộ `content/`, các view cũ (chuyển vào Thư viện, chỉnh nhẹ giao diện cho hợp phong cách mới).
- Thêm:
  - `content/route.ts` — 25 ga: số hiệu, tên địa danh, hình con dấu, kanji của ga (sinh lúc build từ thuật toán mục 5, lưu cố định).
  - `content/strokes.json` — nét KanjiVG cho 95 chữ (script lấy dữ liệu, lưu sẵn).
  - `core/path.ts` — trạng thái hành trình, tạo nội dung từng bước từ dữ liệu sẵn có, chấm điểm bước, mở khoá, gói ôn.
  - `views/journey.ts` (bản đồ), `views/station.ts` (bảng giờ tàu), `views/player.ts` (trình chạy câu hỏi dùng chung cho mọi bước, các dạng: chọn 1, nghe chọn, ghép khối, nối cặp, điền trợ từ, thẻ kanji + nét, thẻ giới thiệu từ, nghe hội thoại), `views/stamps.ts` (sổ dấu), `views/library.ts`.
  - `core/sound.ts` — nhạc báo tàu chạy + chuông chuỗi đúng (Web Audio), có tắt âm.
  - `styles/` — bộ token màu/chữ mới thay `theme.css` cũ.
- Tiến độ mới lưu trong `S.progress.path` = `{ start: số bài bắt đầu, st: { "<bài>": { steps: [bước đã xong], stamp: ngày đóng dấu, best: điểm kiểm tra } }, goal: số bước/ngày, sound: bật/tắt }`; thêm quy tắc gộp giữa các máy trong `mergeProgress` (hợp các bước đã xong, dấu lấy ngày sớm nhất, best lấy max).
- Mọi câu trả lời trong player cập nhật **chung một lịch ôn** (srs cho từ/kanji, pt cho trợ từ, ex cho câu thi) như hiện tại, để ôn tập và thống kê cũ vẫn đúng.

## 9. Dữ liệu cũ
- Không đổi khoá/ý nghĩa của `srs`, `pt`, `ex`, `sentences`, `days`, `counts`. Bản mới chỉ thêm `path`.
- Từ đã thuộc (srs bậc 3) được bỏ qua trong bước "Từ mới"; kanji đã thuộc tương tự.
- File sao lưu `backup/tien_do_tu_claude.json` vẫn nhập được.

## 9b. Quyết định thêm sau khi rà thiết kế (quyết định của người làm)
- **Tab "Ôn tập"** = (1) gói ôn đến hạn: từ, kanji (srs), câu trợ từ (pt) và câu thi (ex) đã sai — cùng một hàng đợi với gói ôn tự chèn đầu buổi; (2) **Sổ câu** (Leitner, `S.sentences`) như cũ.
- **Màn "Hôm nay" cũ bỏ hẳn**, kể cả cơ chế tự đưa 14 từ mới/ngày (`planNewLots`) và tự mở kanji (`kanjiUnlocked`). `core/path.ts` là **nguồn duy nhất** đưa từ/kanji mới vào lịch ôn (qua bước 2 và bước 5 của từng ga). Trang mở đầu của app là bản đồ hành trình.
- **`upto` đi theo hành trình**: mỗi khi đóng dấu một ga hoặc trả lời "đang học tới bài mấy", đặt `upto` = max(ga hiện tại, `upto` cũ) qua `setSetting` (giữ quy tắc gộp `setT`). Người học vẫn chỉnh tay trong ⚙. Thư viện tiếp tục lọc theo `upto`.

## 9c. Quyết định của người học (2026-11-06)
- **Từ/kanji của các ga đã đi qua mà chưa có trong lịch ôn**: đưa dần vào gói ôn, **khoảng 10 mục cũ mỗi ngày**, theo thứ tự ga, trộn vào gói ôn đầu buổi cho tới khi hết (giới hạn gói ôn vẫn ~15 câu; mục cũ chỉ lấp phần còn trống, mục đến hạn ưu tiên trước).
- **Lớp đi nhanh hơn app**: mọi ga phía trước có nút **"Kiểm tra vượt ga"** — làm bài Kiểm tra qua ga của ga đó; đạt ≥ 70% thì đóng dấu, ga đó thành ga hiện tại, các ga bị nhảy qua ở trạng thái "đã đi qua — chưa đóng dấu" (mở hết, học lại được). Từ/kanji của các ga bị nhảy qua cũng đi vào hàng "10 mục cũ mỗi ngày".

## 10. Việc để người làm tự quyết (đã ghi là quyết định của người làm)
- Số câu chính xác mỗi bước, ngưỡng đạt 70%, giới hạn gói ôn 15 câu — chỉnh khi chạy thử.
- 25 địa danh và hình con dấu cụ thể.
- Cách cắt câu thành khối ghép (theo dấu cách kiểu Minna; khối gây nhiễu lấy từ trợ từ/từ cùng bài).
- Giai điệu báo tàu (tự sáng tác, không chép giai điệu có bản quyền của JR).

## 11. Kiểm tra trước khi giao
- `npm run build` sạch; chạy thử bằng Chrome (CDP) đi hết 1 ga: 6 bước, qua kiểm tra, đóng dấu, mở ga sau; gói ôn xuất hiện khi có mục đến hạn; bắt đầu từ Bài 13; dữ liệu cũ còn nguyên; điện thoại 360–390px không tràn ngang; chế độ tối; không lỗi console.
