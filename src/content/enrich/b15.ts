// Bài 15 — nội dung "học dễ nhớ" (xem khuôn ở ../enrich.ts)
import type { LessonPlus } from "../enrich";

const L: LessonPlus = {
  gist: [
    { q: "Bố mẹ Hoàng sống ở đâu?", opts: ["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Tokyo"], a: 0 },
    { q: "Em gái Hoàng làm gì?", opts: ["Làm ở ngân hàng", "Là sinh viên", "Làm giáo viên", "Làm ở bệnh viện"], a: 0 },
    { q: "Hoàng đã kết hôn chưa?", opts: ["Chưa, còn độc thân", "Đã kết hôn", "Sắp kết hôn", "Không nói"], a: 0 },
  ],
  keep: [0, 1, 6, 8],
  lots: [
    ["すみます", "どくしん", "けっこんして います", "しって います", "しります"],
    ["すみません", "カタログ", "せいひん", "ソフト", "つくります"],
    ["しりょう", "おきます", "うります", "けんきゅうします", "けいざい"],
    ["じこくひょう", "ふく", "でんしじしょ", "おもいだします", "いらっしゃいます"],
    ["しやくしょ", "こうこう", "はいしゃ", "みなさん"],
  ],
  words: {
    "すみます": { ex: ["りょうしんと いもうとが ハノイに 住んで います。", "Bố mẹ và em gái tôi sống ở Hà Nội."], tip: "住 = “trú” trong “cư trú”. Nói chỗ đang sống: N に すんで います." },
    "どくしん": { ex: ["はい、どくしんです。", "Vâng, tôi độc thân."], tip: "独身 = “độc thân”, đọc gần giống tiếng Việt." },
    "けっこんして います": { ex: ["あには けっこんして います。", "Anh trai tôi đã lập gia đình."], tip: "結婚 = “kết hôn”; để ở dạng ～て います là đã cưới và vẫn đang có gia đình." },
    "しって います": { ex: ["この ソフトを 知って いますか。", "Anh có biết phần mềm này không?"], tip: "Hỏi “có biết không” dùng 知って いますか; trả lời không biết là 知りません." },
    "しります": { ex: ["いいえ、知りません。", "Không, tôi không biết."], tip: "知 = “tri” trong “tri thức”: biết. Phủ định là 知りません, không nói 知って いません." },
    "すみません": { ex: ["すみません。この カタログを もらっても いいですか。", "Xin lỗi, tôi lấy cuốn catalô này được không?"], tip: "Câu mở đầu khi xin phép hay muốn hỏi ai: “xin lỗi, cho tôi hỏi…”." },
    "カタログ": { ex: ["この カタログを もらっても いいですか。", "Tôi lấy cuốn catalô này được không?"], tip: "Từ tiếng Anh “catalog”: cuốn giới thiệu sản phẩm." },
    "せいひん": { ex: ["この せいひんの しゃしんを とっても いいですか。", "Tôi chụp ảnh sản phẩm này được không?"], tip: "製品 = “chế phẩm”: thứ được chế tạo ra, tức sản phẩm." },
    "ソフト": { ex: ["とても べんりな ソフトですよ。", "Phần mềm rất tiện đấy."], tip: "Rút gọn từ tiếng Anh “software”: phần mềm." },
    "つくります": { ex: ["サンケイは ソフトを 作って います。", "Sankei làm phần mềm."], tip: "作 = “tác” trong “sáng tác”: làm ra, chế tạo. N を つくります, nhóm I." },
    "しりょう": { ex: ["しりょうを つくえの 上に おいて ください。", "Để tài liệu lên bàn giúp tôi."], tip: "資料 = “tư liệu”: tài liệu dùng trong họp, làm việc." },
    "おきます": { ex: ["かばんを ここに おいても いいですか。", "Tôi để cặp ở đây được không?"], tip: "置 = “trí” trong “bố trí”: đặt để. N を (chỗ) に おきます. Khác 起きます (thức dậy)." },
    "うります": { ex: ["あの 店は ベトナムの 食べ物を 売って います。", "Cửa hàng kia bán đồ ăn Việt Nam."], tip: "売 = “mại” (bán), như trong “mãi mại” là mua bán. うり nghe như “ú, rẻ”: rao bán hàng rẻ." },
    "けんきゅうします": { ex: ["大学で けいざいを けんきゅうして います。", "Tôi đang nghiên cứu kinh tế ở đại học."], tip: "研究 = “nghiên cứu”, đọc gần giống tiếng Việt. Nhóm III." },
    "けいざい": { ex: ["日本の けいざいを 勉強して います。", "Tôi đang học về kinh tế Nhật."], tip: "経済 = “kinh tế”, Hán Việt trùng nghĩa." },
    "じこくひょう": { ex: ["駅で じこくひょうを 見ます。", "Tôi xem bảng giờ tàu ở ga."], tip: "時刻表 = “thời khắc biểu”: bảng (biểu) ghi giờ khắc tàu chạy." },
    "ふく": { ex: ["デパートで 服を 買いました。", "Tôi đã mua quần áo ở bách hóa."], tip: "服 = “phục” trong “y phục”: quần áo." },
    "でんしじしょ": { ex: ["でんしじしょを つかっても いいですか。", "Tôi dùng từ điển điện tử được không?"], tip: "電子辞書 = “điện tử từ thư”: cuốn từ điển chạy bằng điện." },
    "おもいだします": { ex: ["ときどき ハノイの 家族を おもいだします。", "Thỉnh thoảng tôi nhớ đến gia đình ở Hà Nội."], tip: "おもい (nghĩ) + だします (lôi ra): lôi ký ức ra, là nhớ ra, hồi tưởng." },
    "いらっしゃいます": { ex: ["ご家族は どちらに いらっしゃいますか。", "Gia đình anh sống ở đâu ạ?"], tip: "Cách nói kính trọng của います, dùng khi hỏi về người trên hoặc gia đình người khác." },
    "しやくしょ": { ex: ["しやくしょで じゅうしょを 書きます。", "Tôi khai địa chỉ ở tòa thị chính."], tip: "市役所 = “thị dịch sở”: cơ quan (dịch sở) của thành phố (thị), nơi làm thủ tục cư trú." },
    "こうこう": { ex: ["この 近くに こうこうが あります。", "Gần đây có trường cấp 3."], tip: "高校 = “cao hiệu”: trường bậc cao, tức trường cấp 3." },
    "はいしゃ": { ex: ["あした はいしゃへ 行きます。", "Ngày mai tôi đi nha sĩ."], tip: "歯医者 = “xỉ y giả”: thầy thuốc (y giả) chữa răng (xỉ), là nha sĩ." },
    "みなさん": { ex: ["みなさん、ここで たばこを すっては いけません。", "Mọi người, không được hút thuốc ở đây."], tip: "皆 = “giai” (tất cả) + さん: mọi người. Câu mở đầu khi nói với cả nhóm." },
  },
  mine: {
    "15-1": [["すみません、 きょう はやく かえっても いいですか。", "Xin lỗi, hôm nay tôi về sớm được không ạ?"]],
    "15-2": [["かいしゃの なかで しゃしんを とっては いけません。", "Trong công ty không được chụp ảnh."]],
    "15-3": [["りょうしんは ハノイに すんで います。", "Bố mẹ tôi sống ở Hà Nội."]],
    "15-4": [["わたしは サンケイで はたらいて います。", "Tôi làm việc ở Sankei."]],
    "15-5": [["しりょうを たなかさんの つくえの うえに おきました。", "Tôi đã để tài liệu lên bàn anh Tanaka."]],
  },
};
export default L;
