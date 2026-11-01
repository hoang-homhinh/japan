// Tab Trợ từ → "Tổng hợp": nội dung soạn tay (không sinh từ datcau, sửa trực tiếp ở đây).
// c = mã màu trợ từ (khớp CSS .pc-*), q = câu tự hỏi mà cụm đó trả lời.

// 1) Câu chứa hết — mỗi câu là danh sách cụm [chữ, trợ từ, câu hỏi, mã màu]; trợ từ "" = vị ngữ, "×" = không trợ từ
export const PG_MASTERS: any[] = [
  { t: "Một ngày đi chơi", l: 6, vi: "Hôm qua lúc 7 giờ tôi cùng bạn đi tàu đến công viên. Ở công viên, tôi ăn bánh sandwich.", lines: [
    [["わたし", "は", "Đang nói VỀ ai?", "wa"], ["きのう", "×", "Khi nào? (không có con số → không trợ từ)", "x"], ["7じ", "に", "Lúc MẤY giờ? (có con số)", "ni"],
     ["ともだち", "と", "CÙNG ai?", "to"], ["でんしゃ", "で", "BẰNG gì?", "de"], ["こうえん", "へ", "Đi TỚI đâu?", "e"], ["いきました。", "", "Động từ: đi", "v"]],
    [["こうえん", "で", "LÀM ở đâu? (có hành động ăn)", "de"], ["サンドイッチ", "を", "Ăn CÁI GÌ?", "wo"], ["たべました。", "", "Động từ: ăn", "v"]]] },
  { t: "Có gì, thích gì", l: 10, vi: "Trong phòng tôi có con mèo. Tôi rất thích mèo.", lines: [
    [["わたし", "の", "Phòng CỦA ai?", "no"], ["へや", "に", "CÓ MẶT ở đâu? (chỉ ở đó, không làm gì)", "ni"], ["ねこ", "が", "Ở đó CÓ cái gì? (thông tin mới)", "ga"], ["います。", "", "Động từ: có (con vật)", "v"]],
    [["わたし", "は", "Đang nói VỀ ai?", "wa"], ["ねこ", "が", "Thích CÁI GÌ? (すき luôn đi với が)", "ga"], ["だいすきです。", "", "Tính từ: rất thích", "v"]]] },
  { t: "Giờ làm việc", l: 7, vi: "Tôi làm việc ở công ty từ 9 giờ đến 6 giờ. Tôi gửi email cho anh Tanaka bằng máy tính.", lines: [
    [["わたし", "は", "Đang nói VỀ ai?", "wa"], ["かいしゃ", "で", "LÀM ở đâu?", "de"], ["9じ", "から", "TỪ lúc nào?", "kara"], ["6じ", "まで", "ĐẾN lúc nào?", "kara"], ["はたらきます。", "", "Động từ: làm việc", "v"]],
    [["パソコン", "で", "BẰNG gì?", "de"], ["たなかさん", "に", "Gửi CHO ai? (một chiều)", "ni"], ["メール", "を", "Gửi CÁI GÌ?", "wo"], ["おくります。", "", "Động từ: gửi", "v"]]] },
  { t: "Di chuyển (Bài 13–16)", l: 16, vi: "Hoàng ra khỏi nhà, lên tàu ở ga, xuống tàu ở Shibuya rồi đi dạo trong công viên. Sau đó đi đến cửa hàng để mua sắm.", lines: [
    [["ホアンさん", "は", "Đang nói VỀ ai?", "wa"], ["うち", "を", "Ra KHỎI đâu? (nơi rời đi)", "wo"], ["でて、", "", "Động từ: ra khỏi", "v"]],
    [["えき", "で", "LÀM ở đâu? (lên tàu ở ga)", "de"], ["でんしゃ", "に", "Lên / DÍNH VÀO cái gì?", "ni"], ["のって、", "", "Động từ: lên xe", "v"]],
    [["しぶや", "で", "LÀM ở đâu? (xuống ở Shibuya)", "de"], ["でんしゃ", "を", "Xuống / RỜI KHỎI cái gì?", "wo"], ["おりて、", "", "Động từ: xuống xe", "v"]],
    [["こうえん", "を", "Đi QUA / dọc theo đâu?", "wo"], ["さんぽしました。", "", "Động từ: đi dạo", "v"]],
    [["それから", "×", "", "x"], ["デパート", "へ", "Đi TỚI đâu?", "e"], ["かいもの", "に", "Đi ĐỂ LÀM GÌ?", "ni"], ["いきました。", "", "Động từ: đi", "v"]]] }
];

// 2) Mỗi trợ từ = 1 hình + 1 ý chính. ps = các trợ từ trong PT_USES thuộc thẻ này.
export const PG_CORE: any[] = [
  { p: "は", c: "wa", ico: "🔦", key: "Đèn chiếu", one: "Chiếu đèn vào thứ mình sắp nói: “nói VỀ X thì…”. Câu nào cũng có thể bắt đầu bằng X は.", ex: ["わたしは ホアンです。", "Tôi là Hoàng."], ps: ["は"] },
  { p: "が", c: "ga", ico: "👆", key: "Ngón tay chỉ", one: "Chỉ thẳng vào ĐÚNG cái đó: cái mới xuất hiện, AI làm (khi hỏi だれが), và cái mình thích / hiểu / có / muốn.", ex: ["にほんごが わかります。", "Tôi hiểu tiếng Nhật."], ps: ["が"] },
  { p: "を", c: "wo", ico: "🎯", key: "Mũi tên trúng đích", one: "Hành động bắn vào vật nào: ăn GÌ, mua GÌ. Mở rộng: con đường mình đi QUA, nơi mình RỜI KHỎI.", ex: ["パンを たべます。", "Ăn bánh mì."], ps: ["を"] },
  { p: "に", c: "ni", ico: "📍", key: "Ghim một điểm", one: "Ghim đúng một ĐIỂM: điểm thời gian, điểm đến, người nhận, chỗ đang có mặt, chỗ mình dính vào.", ex: ["7じに おきます。", "Dậy lúc 7 giờ."], ps: ["に", "に／へ"] },
  { p: "で", c: "de", ico: "🏟️", key: "Sân khấu", one: "Cái KHUNG mà hành động diễn ra bên trong: làm ở đâu, bằng gì, trong phạm vi nào.", ex: ["しょくどうで たべます。", "Ăn ở nhà ăn."], ps: ["で"] },
  { p: "へ", c: "e", ico: "➡️", key: "Mũi tên hướng", one: "Đi VỀ HƯỚNG đâu. Chỉ đi với いきます / きます / かえります… Thay bằng に cũng đúng.", ex: ["にほんへ きました。", "Tôi đã đến Nhật."], ps: ["へ"] },
  { p: "と", c: "to", ico: "🤝", key: "Nắm tay", one: "CÙNG ai, hoặc A VÀ B (kể đủ). Từ Bài 21: trích lời “rằng…”.", ex: ["ともだちと いきます。", "Đi cùng bạn."], ps: ["と"] },
  { p: "から・まで", c: "kara", ico: "🏁", key: "Xuất phát → đích", one: "TỪ … ĐẾN …. Đứng sau cả một câu thì から = “vì”.", ex: ["9じから 5じまで はたらきます。", "Làm từ 9 giờ đến 5 giờ."], ps: ["から", "まで", "までに"] },
  { p: "も・の・や・より・だけ", c: "no", ico: "🧩", key: "Mấy miếng ghép nhỏ", one: "も = cũng · の = của · や = …, … (kể vài cái) · より = so với · だけ = chỉ.", ex: ["わたしも エンジニアです。", "Tôi cũng là kỹ sư."], ps: ["も", "の", "や", "より", "だけ"] },
  { p: "×", c: "x", ico: "∅", key: "Không cần gì", one: "Thời gian không có số (あした, まいにち), và số lượng (3つ, 2じかん) thì KHÔNG thêm trợ từ.", ex: ["りんごを 3つ かいます。", "Mua 3 quả táo."], ps: ["×"] }
];

// 3) Cặp hay nhầm — hai câu chỉ khác nhau đúng chỗ trợ từ. mode = chế độ luyện (set:… hoặc u:…).
export const PG_PAIRS: any[] = [
  { t: "Ở đâu: に 📍 hay で 🏟️?", l: 6, mode: "set:place",
    a: ["へやに います。", "ni", "ĐANG Ở trong phòng — chỉ có mặt."], b: ["へやで べんきょうします。", "de", "HỌC trong phòng — có hành động."],
    rule: "Chỉ có mặt (あります, います, すんで います) → に. Có làm gì ở đó → で." },
  { t: "Thời gian: に hay không có gì?", l: 4, mode: "set:time",
    a: ["7じに おきます。", "ni", "Có con số (giờ, ngày, tháng) → に."], b: ["あした やすみます。", "x", "Không có số (あした, まいにち, きのう…) → không trợ từ."],
    rule: "Nhìn xem có con số không. いつ (khi nào) cũng không có に. Thứ trong tuần: có hay không に đều được." },
  { t: "Người: に hay と?", l: 7, mode: "set:person",
    a: ["ともだちに プレゼントを あげます。", "ni", "CHO bạn — một chiều, từ mình sang bạn."], b: ["ともだちと えいがを みます。", "to", "CÙNG bạn xem phim — hai người cùng làm."],
    rule: "Hướng về người đó (cho, gửi, dạy, gọi điện, gặp) → に. Hai người cùng làm một việc → と." },
  { t: "は 🔦 hay が 👆?", l: 9, mode: "set:wa_ga",
    a: ["わたしは にほんごが すきです。", "wa", "わたし là chủ đề (は). Cái được thích → が."], b: ["だれが きましたか。", "ga", "Từ để hỏi làm chủ ngữ → luôn が. Trả lời: たなかさんが きました。"],
    rule: "Mặc định dùng は. Đổi sang が khi: (1) đi với すき / きらい / じょうず / へた / わかります / あります / ほしい; (2) だれ / なに / どこ làm chủ ngữ; (3) giới thiệu “ở đó có cái gì”." },
  { t: "Đi đâu へ, đi để làm gì に", l: 13, mode: "u:ni_purpose",
    a: ["デパートへ いきます。", "e", "Đi TỚI cửa hàng."], b: ["デパートへ かいものに いきます。", "ni", "Đi tới cửa hàng ĐỂ mua sắm."],
    rule: "Nơi đến + へ, việc định làm + に. Hai cái đứng chung một câu được: (nơi)へ (việc)に いきます." },
  { t: "Ở công viên: で hay を?", l: 13, mode: "set:move",
    a: ["こうえんで あそびます。", "de", "CHƠI ở công viên — công viên là sân khấu."], b: ["こうえんを さんぽします。", "wo", "ĐI DẠO qua công viên — công viên là con đường."],
    rule: "Động từ đi lại trên một chỗ (さんぽします, あるきます, わたります, まがります) → を. Các việc khác làm ở đó → で." },
  { t: "Vào に, ra を", l: 14, mode: "set:move",
    a: ["きっさてんに はいります。", "ni", "VÀO quán — điểm mình đi đến."], b: ["きっさてんを でます。", "wo", "RA KHỎI quán — nơi mình rời đi."],
    rule: "Vào, lên, ngồi xuống → に (điểm dính vào). Ra khỏi, xuống → を (nơi rời đi)." },
  { t: "Lên xe に, xuống xe を", l: 16, mode: "set:move",
    a: ["でんしゃに のります。", "ni", "LÊN tàu — dính VÀO tàu."], b: ["でんしゃを おります。", "wo", "XUỐNG tàu — rời KHỎI tàu."],
    rule: "Cùng một cặp với はいります / でます. Nhớ một cặp là nhớ cả hai." },
  { t: "まで hay までに?", l: 17, mode: "set:time",
    a: ["5じまで はたらきます。", "kara", "Làm LIÊN TỤC tới 5 giờ."], b: ["5じまでに かえります。", "kara", "Về TRƯỚC 5 giờ (xảy ra một lần)."],
    rule: "Việc kéo dài liền tới lúc đó → まで. Hạn chót, xong trước lúc đó → までに." },
  { t: "Sự kiện: で, không phải に", l: 21, mode: "set:place",
    a: ["へやに テレビが あります。", "ni", "Đồ vật NẰM ở đâu → に."], b: ["ホテルで パーティーが あります。", "de", "Sự kiện ĐƯỢC TỔ CHỨC ở đâu → で."],
    rule: "Cùng là あります: đồ vật nằm đó → に; buổi tiệc, cuộc họp diễn ra → で." }
];

// 4) Tra nhanh: "Tôi muốn nói…" → trợ từ
export const PG_LOOKUP: any[] = [
  ["Nói VỀ ai / cái gì", "は", "わたしは がくせいです。", "wa", 1],
  ["Làm CÁI GÌ", "を", "パンを たべます。", "wo", 6],
  ["Đi TỚI đâu", "へ／に", "かいしゃへ いきます。", "e", 5],
  ["Đang Ở đâu (chỉ có mặt)", "に", "へやに います。", "ni", 10],
  ["LÀM ở đâu", "で", "しょくどうで たべます。", "de", 6],
  ["Lúc mấy giờ / ngày mấy", "に", "7じに おきます。", "ni", 4],
  ["Hôm nay, ngày mai… (không số)", "×", "あした いきます。", "x", 4],
  ["CÙNG ai", "と", "ともだちと いきます。", "to", 5],
  ["BẰNG gì (xe, đồ, tiếng)", "で", "バスで いきます。", "de", 5],
  ["CHO / gửi / gặp ai", "に", "ははに てがみを かきます。", "ni", 7],
  ["Nhận TỪ ai", "に／から", "ともだちに もらいました。", "ni", 7],
  ["TỪ đâu / từ lúc nào", "から", "9じから はたらきます。", "kara", 4],
  ["ĐẾN đâu / đến lúc nào", "まで", "5じまで はたらきます。", "kara", 4],
  ["Thích / hiểu / có CÁI GÌ", "が", "にほんごが わかります。", "ga", 9],
  ["AI làm? (hỏi)", "が", "だれが きましたか。", "ga", 10],
  ["So với cái gì", "より", "バスより でんしゃが はやいです。", "no", 12],
  ["Mấy cái / bao lâu", "×", "りんごを 3つ かいます。", "x", 11],
  ["Đi ĐỂ làm gì", "に", "かいものに いきます。", "ni", 13],
  ["Đi QUA / dọc theo đâu", "を", "こうえんを さんぽします。", "wo", 13],
  ["VÀO / lên / ngồi đâu", "に", "いすに すわります。", "ni", 14],
  ["RA KHỎI / xuống đâu", "を", "うちを でます。", "wo", 14],
  ["TRƯỚC hạn nào", "までに", "あしたまでに だします。", "kara", 17],
  ["Trở THÀNH gì", "に", "エンジニアに なりました。", "ni", 19],
  ["Nghĩ / nói RẰNG…", "と", "あめが ふると おもいます。", "to", 21]
];
