// Bài 25 — nội dung "học dễ nhớ" (xem khuôn ở ../enrich.ts)
import type { LessonPlus } from "../enrich";

const L: LessonPlus = {
  gist: [
    { q: "Buổi tiệc này để làm gì?", opts: ["Chia tay anh Tanaka chuyển công tác", "Mừng sinh nhật anh Tanaka", "Chào đón nhân viên mới", "Mừng năm mới"], a: 0 },
    { q: "Anh Tanaka chuyển đi đâu?", opts: ["Osaka", "Tokyo", "Kyoto", "Việt Nam"], a: 0 },
    { q: "Hai người hẹn gì khi Hoàng đến đó?", opts: ["Cùng đi uống một ly", "Cùng đi xem lễ hội", "Cùng đi leo núi", "Cùng đi mua sắm"], a: 0 },
  ],
  keep: [1, 2, 6, 8],
  lots: [
    ["てんきん", "がんばります", "[いろいろ] おせわに なりました", "いっぱい のみましょう", "どうぞ おげんきで"],
    ["つきます", "もし", "いくら", "かんがえます", "チャンス"],
    ["りゅうがくします", "たいしかん", "グループ", "おく", "とります"],
    ["いなか", "こと"],
  ],
  words: {
    "てんきん": { ex: ["田中さん、大阪へ てんきんですね。", "Anh Tanaka chuyển công tác sang Osaka nhỉ."], tip: "転勤 = “chuyển cần”: chuyển (転) chỗ đi làm (勤) sang chi nhánh khác." },
    "がんばります": { ex: ["大阪でも がんばって ください。", "Ở Osaka cũng cố gắng nhé."], tip: "がんばり nghe như “gan bền”: gan lì bền chí, cố gắng. がんばって ください là “cố lên”." },
    "[いろいろ] おせわに なりました": { ex: ["みなさん、いろいろ おせわに なりました。", "Cảm ơn mọi người đã giúp đỡ tôi bấy lâu nay."], tip: "世話 = sự chăm sóc: “tôi đã được chăm sóc”. Câu người ra đi nói khi chuyển việc, về nước." },
    "いっぱい のみましょう": { ex: ["大阪へ 行ったら、いっぱい 飲みましょう。", "Khi nào tôi sang Osaka, mình đi làm một ly nhé."], tip: "一杯 = “nhất bôi”: một chén. Lời rủ đi uống chút gì sau giờ làm." },
    "どうぞ おげんきで": { ex: ["どうぞ お元気で。", "Anh giữ gìn sức khỏe nhé."], tip: "元気 = khỏe: “mong anh mãi khỏe”. Chỉ dùng khi chia tay lâu dài." },
    "つきます": { ex: ["駅に ついたら、電話して ください。", "Đến ga thì gọi cho tôi nhé."], tip: "Chữ 着 (mặc) khi đọc つきます lại là đến nơi: (nơi) に つきます, như 駅に つきます." },
    "もし": { ex: ["もし 人が 多かったら、どこで 会いましょうか。", "Nếu đông người thì mình gặp ở đâu?"], tip: "もし nghe như “mơ thử”: mơ thử một giả sử. Đi với ～たら." },
    "いくら": { ex: ["いくら 食べても、3,000円ぐらいで だいじょうぶです。", "Ăn bao nhiêu thì khoảng 3.000 yên là đủ."], tip: "いくら vốn là “bao nhiêu”; đi với ～ても thành “dù bao nhiêu… cũng”." },
    "かんがえます": { ex: ["よく かんがえて ください。", "Hãy suy nghĩ kỹ nhé."], tip: "考 = “khảo” trong “khảo sát”: suy xét, cân nhắc. Nhóm II." },
    "チャンス": { ex: ["チャンスが あったら、りゅうがくしたいです。", "Nếu có cơ hội, tôi muốn đi du học."], tip: "Từ tiếng Anh “chance”: cơ hội." },
    "りゅうがくします": { ex: ["いもうとは 日本へ りゅうがくしたいと 言いました。", "Em gái tôi nói muốn du học Nhật."], tip: "留学 = “lưu học”: ở lại (lưu) nước ngoài để học, du học." },
    "たいしかん": { ex: ["ベトナム たいしかんで パスポートを つくりました。", "Tôi làm hộ chiếu ở đại sứ quán Việt Nam."], tip: "大使館 = “đại sứ quán”, đọc gần giống tiếng Việt." },
    "グループ": { ex: ["グループで りょこうしたら、たのしいです。", "Đi du lịch theo nhóm thì vui."], tip: "Từ tiếng Anh “group”: nhóm." },
    "おく": { ex: ["もし 1おく円 あったら、何を しますか。", "Giả sử có 100 triệu yên thì anh làm gì?"], tip: "億 = “ức”: một trăm triệu, mốc lớn sau 万 (vạn)." },
    "とります": { ex: ["年を とっても、はたらきたいです。", "Dù có tuổi tôi vẫn muốn đi làm."], tip: "年を とります: “lấy thêm năm tuổi”, tức là có tuổi, già đi." },
    "いなか": { ex: ["田中さんの いなかは 北海道です。", "Quê anh Tanaka ở Hokkaido."], tip: "田舎: ruộng (田) và nhà (舎): nhà giữa đồng ruộng, là quê, nông thôn." },
    "こと": { ex: ["ベトナムの ことを おしえて ください。", "Kể cho tôi nghe về Việt Nam nhé."], tip: "こと là “việc, chuyện”: N の こと là chuyện về N. Gặp rồi trong ～ことが できます." },
  },
  mine: {
    "25-1": [["やすかったら、 あたらしい パソコンを かいます。", "Nếu rẻ thì tôi sẽ mua máy tính mới."]],
    "25-2": [["しごとが おわったら、 かぞくに でんわします。", "Làm xong việc thì tôi gọi điện cho gia đình."]],
    "25-3": [["あめが ふっても、 じてんしゃで えきへ いきます。", "Dù trời mưa tôi vẫn đi xe đạp ra ga."]],
    "25-4": [["もし いちおくえん あったら、 ベトナムに うちを かいたいです。", "Giả sử có 100 triệu yên, tôi muốn mua nhà ở Việt Nam."]],
    "25-5": [["りょうしんが にほんへ きたら、 きょうとを あんないしたいです。", "Khi bố mẹ sang Nhật, tôi muốn dẫn bố mẹ đi tham quan Kyoto."]],
  },
};
export default L;
