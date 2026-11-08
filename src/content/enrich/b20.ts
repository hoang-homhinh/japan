// Bài 20 — nội dung "học dễ nhớ" (xem khuôn ở ../enrich.ts)
import type { LessonPlus } from "../enrich";

const L: LessonPlus = {
  gist: [
    { q: "Anh Tanaka rủ Hoàng đi ăn gì?", opts: ["Ramen", "Sushi", "Cơm bò", "Món Việt"], a: 0 },
    { q: "Quán ở đâu?", opts: ["Gần ga", "Trong công ty", "Cạnh nhà Hoàng", "Ở Kyoto"], a: 0 },
    { q: "Hẹn mấy giờ?", opts: ["7 giờ", "6 giờ", "8 giờ", "9 giờ"], a: 0 },
  ],
  keep: [0, 2, 3, 9],
  lots: [
    ["～くん", "うん", "ううん", "おなかが いっぱいです", "みんなで"],
    ["～けど", "ぼく", "きみ", "よかったら", "いろいろ"],
    ["いります", "ビザ", "しらべます", "でんわします", "しゅうりします"],
    ["こっち", "そっち", "あっち", "どっち"],
    ["サラリーマン", "ことば", "きもの", "はじめ", "おわり"],
  ],
  words: {
    "～くん": { ex: ["ホアンくん、こんばん ひま？", "Hoàng ơi, tối nay rảnh không?"], tip: "君 = “quân”: gọi thân mật nam giới trẻ hoặc ngang hàng, thay cho さん." },
    "うん": { ex: ["うん、ひま。", "Ừ, rảnh."], tip: "うん như “ừm” trong tiếng Việt: “ừ”, bản thân mật của はい." },
    "ううん": { ex: ["ううん、もう おなか いっぱい。", "Thôi, no rồi."], tip: "ううん kéo dài, giọng xuống rồi lên như lắc đầu “ừm-ừm”: không. Khác うん ngắn là “ừ”." },
    "おなかが いっぱいです": { ex: ["もう おなかが いっぱいです。", "Tôi no rồi."], tip: "いっぱい là đầy: bụng (おなか) đầy rồi, tức là no." },
    "みんなで": { ex: ["みんなで ラーメン、食べに 行かない？", "Cả nhóm đi ăn ramen không?"], tip: "みんな (mọi người) + で: cả nhóm cùng làm." },
    "～けど": { ex: ["ちょっと 高いけど、おいしいよ。", "Hơi đắt nhưng ngon lắm."], tip: "けど nghe như “kệ đó”: đắt kệ đó, nhưng ngon. Bản thân mật của が (nhưng)." },
    "ぼく": { ex: ["ぼくも 行く。", "Tớ cũng đi."], tip: "僕 = “bộc” (người hầu, tự hạ mình): nam giới xưng “tớ” với bạn bè." },
    "きみ": { ex: ["きみも 来る？", "Cậu cũng đến chứ?"], tip: "君 = “quân”: gọi “cậu, em”, chỉ dùng với người ngang hoặc dưới mình." },
    "よかったら": { ex: ["よかったら、いっしょに 行かない？", "Nếu được thì đi cùng không?"], tip: "Từ いい (tốt): “nếu thấy được thì…”, lời mời nhẹ nhàng không ép." },
    "いろいろ": { ex: ["いろいろ ありがとう。", "Cảm ơn vì mọi thứ."], tip: "いろいろ nghe như “i-rô i-rô”: đủ loại, nhiều thứ. Cảm ơn chung chung về mọi việc." },
    "いります": { ex: ["日本人は ビザが いりますか。", "Người Nhật có cần visa không?"], tip: "要 = “yếu” trong “thiết yếu”: cần. N が いります, nhóm I." },
    "ビザ": { ex: ["ベトナムの ビザが いる？", "Có cần visa Việt Nam không?"], tip: "Từ tiếng Anh “visa”: thị thực." },
    "しらべます": { ex: ["あとで しらべます。", "Lát nữa tôi tra rồi báo."], tip: "調 = “điều” trong “điều tra”: tìm hiểu, tra cứu. Nhóm II." },
    "でんわします": { ex: ["あとで でんわする。", "Lát tớ gọi điện nhé."], tip: "電話 = “điện thoại”. Thể thường: でんわする. N に でんわします." },
    "しゅうりします": { ex: ["パソコンを しゅうりした。", "Tớ đã sửa máy tính rồi."], tip: "修理 = “tu lý”: tu sửa cho đâu vào đấy, là sửa chữa." },
    "こっち": { ex: ["こっちの 店は どう？", "Quán bên này thì sao?"], tip: "Bản nói tắt thân mật của こちら: phía này. Nhớ cả bộ こっち・そっち・あっち・どっち." },
    "そっち": { ex: ["そっちは どう？", "Bên đó thế nào?"], tip: "Bản thân mật của そちら: phía đó, phía người nghe." },
    "あっち": { ex: ["駅は あっちだよ。", "Ga ở đằng kia đấy."], tip: "Bản thân mật của あちら: phía kia, xa cả hai người." },
    "どっち": { ex: ["ラーメンと すしと どっちが いい？", "Ramen với sushi, cái nào hơn?"], tip: "Bản thân mật của どちら: phía nào, cái nào (trong hai)." },
    "サラリーマン": { ex: ["父は サラリーマンだ。", "Bố tớ là nhân viên văn phòng."], tip: "Tiếng Anh kiểu Nhật “salary man”: người làm ăn lương, nhân viên văn phòng." },
    "ことば": { ex: ["この ことばの いみ、わかる？", "Cậu hiểu nghĩa từ này không?"], tip: "言葉: lời (言) + lá (葉): lời nói rơi ra như lá, là từ ngữ, ngôn ngữ." },
    "きもの": { ex: ["きものを 着た ことが ある？", "Cậu từng mặc kimono chưa?"], tip: "着 (mặc) + 物 (đồ): đồ để mặc, là áo kimono truyền thống." },
    "はじめ": { ex: ["来月の はじめに ベトナムへ 行く。", "Đầu tháng sau tớ đi Việt Nam."], tip: "初 = “sơ” trong “ban sơ”: lúc đầu. Cặp với おわり." },
    "おわり": { ex: ["今月の おわりは いそがしい。", "Cuối tháng này bận."], tip: "おわり từ おわります (kết thúc): lúc cuối. Cặp với はじめ." },
  },
  mine: {
    "20-1": [["あした ともだちと すしを たべに いく。", "Mai tớ đi ăn sushi với bạn."]],
    "20-2": [["かいしゃの しょくどうは やすい。", "Căng tin công ty rẻ."]],
    "20-3": [["きのうは かいしゃが やすみだった。", "Hôm qua công ty nghỉ."]],
    "20-4": [["こんばん ラーメン たべに いく？", "Tối nay đi ăn ramen không?"]],
    "20-5": [["その みせ、 たかいけど、 おいしいよ。", "Quán đó đắt nhưng ngon đấy."]],
  },
};
export default L;
