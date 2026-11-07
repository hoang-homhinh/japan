// Nội dung "học dễ nhớ" theo từng bài (làm thử bài 13 trước, đạt thì nhân rộng).
// - gist: nghe lần 1 không chữ, hỏi ý chính; keep: chỉ số câu "đem dùng được ngay" trong hội thoại a
// - lots: từ theo lô 5 từ (khoá = kana đúng như trong vocab), xếp theo thứ tự gặp trong hội thoại trước
// - words: câu ví dụ (ưu tiên câu trong hội thoại) + mẹo nhớ Hình + Âm bằng tiếng Việt phổ thông
// - mine: câu "về chính mình" cho từng mẫu câu (id mẫu trong lessons)
export type Gist = { q: string; opts: string[]; a: number };
export type WordPlus = { ex: [string, string]; tip: string };
export type LessonPlus = { gist: Gist[]; keep: number[]; lots: string[][]; words: Record<string, WordPlus>; mine: Record<string, [string, string][]> };

export const PLUS: Record<number, LessonPlus> = {
  13: {
    gist: [
      { q: "Hai người đi đâu?", opts: ["Quán ăn gần ga", "Siêu thị", "Bưu điện", "Công viên"], a: 0 },
      { q: "Hoàng gọi món gì?", opts: ["Cơm bò", "Suất cơm", "Mì ramen", "Sushi"], a: 0 },
      { q: "Cuối cùng trả tiền thế nào?", opts: ["Mỗi người trả riêng", "Anh Tanaka trả hết", "Hoàng trả hết", "Chưa trả"], a: 0 },
    ],
    keep: [1, 4, 7],
    lots: [
      ["おなかが すきます", "のどが かわきます", "なにか", "ごちゅうもんは？", "ぎゅうどん"],
      ["ていしょく", "[しょうしょう] おまち ください", "べつべつに", "～で ございます", "そう しましょう"],
      ["ほしい", "どこか", "～ごろ", "しゅうまつ", "かいものします"],
      ["あそびます", "およぎます", "プール", "かわ", "つり"],
      ["さんぽします", "しょくじします", "びじゅつ", "スキー", "[お]しょうがつ"],
      ["むかえます", "つかれます", "けっこんします", "たいへん[な]", "ひろい", "せまい"],
    ],
    words: {
      "おなかが すきます": { ex: ["もう 12時ですね。おなかが すきました。", "12 giờ rồi nhỉ. Đói bụng quá."], tip: "すき nghe như “xỉu kìa”: bụng (おなか) đói tới xỉu kìa." },
      "のどが かわきます": { ex: ["のどが かわきましたから、おちゃを ください。", "Khát quá, cho tôi trà."], tip: "かわき nghe như “khô hết”: cổ họng (のど) khô hết là khát." },
      "なにか": { ex: ["何か 食べに 行きませんか。", "Mình đi ăn gì đó không?"], tip: "なに (cái gì) + か = cái gì đó. Sau なにか bỏ を." },
      "ごちゅうもんは？": { ex: ["いらっしゃいませ。ごちゅうもんは？", "Xin mời vào. Quý khách gọi món gì ạ?"], tip: "ちゅうもん nghe như “chú món”: nhân viên hỏi chú gọi món gì." },
      "ぎゅうどん": { ex: ["わたしは ぎゅうどんが いいです。", "Tôi lấy cơm bò."], tip: "牛 đọc ぎゅう = “ngưu” (bò), どん là bát tô: tô cơm bò." },
      "ていしょく": { ex: ["わたしは ていしょくが いいです。", "Tôi lấy suất cơm."], tip: "定食 = “định thực”: suất ăn định sẵn, có cơm, canh, món chính trên một khay." },
      "[しょうしょう] おまち ください": { ex: ["ぎゅうどんと ていしょくですね。少々 おまち ください。", "Cơm bò và suất cơm ạ. Xin chờ một chút."], tip: "まち nghe như “mải chờ”: nhân viên xin mình ngồi chờ một chút (しょうしょう)." },
      "べつべつに": { ex: ["すみません、べつべつに おねがいします。", "Xin lỗi, cho tính tiền riêng ạ."], tip: "別 = “biệt” trong riêng biệt, nói hai lần べつべつ: ai trả phần nấy." },
      "～で ございます": { ex: ["ぎゅうどんは 500円で ございます。", "Cơm bò là 500 yên ạ."], tip: "Là です mặc vest: nhân viên nói với khách cho lịch sự." },
      "そう しましょう": { ex: ["じゃ、そう しましょう。", "Vậy làm thế nhé."], tip: "そう (vậy) + しましょう (làm thôi): chốt vậy đi." },
      "ほしい": { ex: ["新しい カメラが ほしいです。", "Tôi muốn có máy ảnh mới."], tip: "ほしい nghe như “hố sâu”: lòng muốn có như hố sâu không đáy. Dùng cho đồ vật, đi với が." },
      "どこか": { ex: ["週末 どこか 行きましたか。", "Cuối tuần anh có đi đâu đó không?"], tip: "どこ (đâu) + か = đâu đó. Sau どこか bỏ へ." },
      "～ごろ": { ex: ["10時ごろ 駅で 会いましょう。", "Khoảng 10 giờ gặp ở ga nhé."], tip: "ごろ nghe như “gần”: 10時ごろ là gần 10 giờ. Chỉ dùng cho thời điểm." },
      "しゅうまつ": { ex: ["週末は 何を しますか。", "Cuối tuần anh làm gì?"], tip: "週末 = “chu mạt”: mạt (cuối) của chu (tuần)." },
      "かいものします": { ex: ["土曜日に 買い物に 行きます。", "Thứ Bảy tôi đi mua sắm."], tip: "かい (mua) + もの (đồ): mua đồ là mua sắm." },
      "あそびます": { ex: ["子どもと 公園で 遊びます。", "Tôi chơi với con ở công viên."], tip: "あそび nghe như “à, xơi bi”: trẻ con rủ nhau chơi bi." },
      "およぎます": { ex: ["プールで 泳ぎます。", "Tôi bơi ở bể bơi."], tip: "およぎ nghe như “ơ, dô đi”: hô một tiếng rồi nhảy xuống bơi." },
      "プール": { ex: ["プールへ 泳ぎに 行きます。", "Tôi đi bể bơi để bơi."], tip: "Từ tiếng Anh “pool”: bể bơi." },
      "かわ": { ex: ["川で 釣りを します。", "Tôi câu cá ở sông."], tip: "Chữ 川 có ba nét như ba dòng nước chảy: sông." },
      "つり": { ex: ["週末 釣りに 行きたいです。", "Cuối tuần tôi muốn đi câu cá."], tip: "釣 = “điếu”: ông lão vừa câu cá vừa rít điếu thuốc." },
      "さんぽします": { ex: ["朝 公園を さんぽします。", "Buổi sáng tôi đi dạo công viên."], tip: "散歩 = “tản bộ”. Đi dạo qua nơi nào dùng を." },
      "しょくじします": { ex: ["友達と 食事に 行きます。", "Tôi đi ăn với bạn."], tip: "食事 = “thực sự”: chuyện ăn uống." },
      "びじゅつ": { ex: ["美術館へ 絵を 見に 行きます。", "Tôi đến bảo tàng mỹ thuật xem tranh."], tip: "美術 = “mỹ thuật”, đọc gần giống tiếng Việt." },
      "スキー": { ex: ["冬 スキーに 行きたいです。", "Mùa đông tôi muốn đi trượt tuyết."], tip: "Từ tiếng Anh “ski”: trượt tuyết." },
      "[お]しょうがつ": { ex: ["お正月に 国へ 帰ります。", "Tết tôi về nước."], tip: "正月 = “chính nguyệt”: tháng Giêng, Tết. Ở Nhật là Tết dương lịch." },
      "むかえます": { ex: ["空港へ 友達を 迎えに 行きます。", "Tôi ra sân bay đón bạn."], tip: "むかえ nghe như “mời khách về”: ra tận nơi đón khách." },
      "つかれます": { ex: ["今日は 疲れました。", "Hôm nay mệt quá."], tip: "つかれ nghe như “sụp cả rồi”: mệt sụp cả người. Đang mệt thì nói 疲れました." },
      "けっこんします": { ex: ["姉は 来月 結婚します。", "Chị tôi tháng sau kết hôn."], tip: "結婚 = “kết hôn”, y như tiếng Việt." },
      "たいへん[な]": { ex: ["仕事は 大変です。", "Công việc vất vả."], tip: "大変 = “đại biến”: chuyện lớn, vất vả lắm." },
      "ひろい": { ex: ["この 部屋は 広いです。", "Phòng này rộng."], tip: "広 = “quảng” trong quảng trường: rộng." },
      "せまい": { ex: ["わたしの 部屋は せまいです。", "Phòng tôi chật."], tip: "せまい nghe như “xé may”: áo chật quá, xé cả đường may." },
    },
    mine: {
      "13-1": [["あたらしい パソコンが ほしいです。", "Tôi muốn có máy tính mới."]],
      "13-2": [["ベトナムの りょうりが たべたいです。", "Tôi muốn ăn món Việt."]],
      "13-3": [["ひるやすみに コンビニへ べんとうを かいに いきます。", "Giờ nghỉ trưa tôi đi konbini mua cơm hộp."]],
      "13-4": [["しゅうまつ どこか いきたいです。", "Cuối tuần tôi muốn đi đâu đó."]],
      "13-5": [["ていしょくと おちゃを ください。", "Cho tôi suất cơm và trà."]],
      "13-6": [["あさ かいしゃの ちかくの こうえんを さんぽします。", "Buổi sáng tôi đi dạo công viên gần công ty."]],
    },
  },
};

// kana cần gõ khi tự nhớ lại: bỏ ～ và phần trong [ ] (gõ kèm phần đó cũng được)
export function typeAnswers(kana: string): string[] {
  const strip = (s: string) => s.replace(/[～~？?]/g, "").trim();
  return [...new Set([strip(kana.replace(/\[[^\]]*\]/g, "")), strip(kana.replace(/[\[\]]/g, ""))])];
}
