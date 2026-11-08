// Bài 22 — nội dung "học dễ nhớ" (xem khuôn ở ../enrich.ts)
import type { LessonPlus } from "../enrich";

const L: LessonPlus = {
  gist: [
    { q: "Hoàng đến đây để làm gì?", opts: ["Tìm nhà thuê", "Mua đồ nội thất", "Gặp khách hàng", "Sửa máy tính"], a: 0 },
    { q: "Căn đầu tiên có điểm gì Hoàng chưa ưng?", opts: ["Hơi xa ga", "Quá đắt", "Quá chật", "Không có bếp"], a: 0 },
    { q: "Căn thứ hai cách ga bao xa?", opts: ["Đi bộ 5 phút", "Đi bộ 15 phút", "Đi xe buýt 10 phút", "Ngay trong ga"], a: 0 },
  ],
  keep: [1, 4, 6],
  lots: [
    ["やちん", "こちら", "うーん", "ダイニングキッチン", "わしつ"],
    ["おしいれ", "ふとん", "アパート", "よく", "おめでとう ございます"],
    ["きます", "はきます", "かぶります", "かけます", "します"],
    ["うまれます", "コート", "セーター", "スーツ", "ぼうし", "めがね"],
  ],
  words: {
    "やちん": { ex: ["こちらは いかがですか。やちんは 8万円です。", "Căn này anh thấy thế nào? Tiền nhà 80.000 yên."], tip: "家賃 = “gia nhẫm”: tiền thuê (nhẫm) nhà (gia)." },
    "こちら": { ex: ["じゃ、こちらは？ 駅から あるいて 5分ですよ。", "Vậy căn này thì sao? Đi bộ từ ga 5 phút thôi."], tip: "Bản lịch sự của これ: nhân viên bán hàng, môi giới hay dùng để giới thiệu “cái này”." },
    "うーん": { ex: ["うーん…。ちょっと 駅から とおいですね。", "Ừm… hơi xa ga nhỉ."], tip: "Như “ừm…” trong tiếng Việt: kéo dài khi đang phân vân, thường sắp nói “chưa ưng”." },
    "ダイニングキッチン": { ex: ["ダイニングキッチンと わしつですね。", "Có bếp ăn và phòng kiểu Nhật nhỉ."], tip: "Tiếng Anh “dining” + “kitchen”: bếp kiêm chỗ ăn, trên quảng cáo nhà viết DK." },
    "わしつ": { ex: ["わしつが ある アパートを さがして います。", "Tôi đang tìm căn hộ có phòng kiểu Nhật."], tip: "和室 = “hòa thất”: phòng (thất) kiểu Nhật (hòa), trải chiếu tatami." },
    "おしいれ": { ex: ["おしいれは ふとんを 入れる ところです。", "Tủ âm tường là chỗ cất chăn đệm."], tip: "おし (đẩy) + いれ (cho vào): chỗ đẩy đồ vào cất, tủ âm tường." },
    "ふとん": { ex: ["ふとんを おしいれに 入れます。", "Tôi cất chăn đệm vào tủ âm tường."], tip: "ふとん nghe như “phủ tôn”: tấm chăn đệm phủ kín người khi ngủ." },
    "アパート": { ex: ["駅から ちかい アパートが いいです。", "Tôi muốn căn hộ gần ga."], tip: "Rút gọn từ tiếng Anh “apartment”: nhà trọ, chung cư nhỏ." },
    "よく": { ex: ["週末 よく 映画を 見ます。", "Cuối tuần tôi hay xem phim."], tip: "よく ở đây là “hay, thường”: よく 行く là hay đi. Nhìn động từ để phân biệt với よく là “rõ”." },
    "おめでとう ございます": { ex: ["おたんじょうび おめでとう ございます。", "Chúc mừng sinh nhật."], tip: "めでたい là “đáng mừng”: câu chúc mừng sinh nhật, cưới hỏi, năm mới, thăng chức." },
    "きます": { ex: ["あの あかい セーターを きて いる 人は だれですか。", "Người mặc áo len đỏ kia là ai?"], tip: "着 là mặc, như trong きもの (着物): mặc áo, đồ phần trên người. Cùng âm 来ます, nhìn を mà phân biệt." },
    "はきます": { ex: ["くつを はいて ください。", "Đi giày vào nhé."], tip: "はき nghe như “há kín”: há ống giày, ống quần ra rồi xỏ chân vào kín. Đồ từ eo trở xuống." },
    "かぶります": { ex: ["ぼうしを かぶって いる 人は 田中さんです。", "Người đội mũ là anh Tanaka."], tip: "かぶり nghe như “cái búi”: đội mũ trùm lên búi tóc. Thứ trùm lên đầu." },
    "かけます": { ex: ["あの めがねを かけて いる 人は だれですか。", "Người đeo kính kia là ai?"], tip: "かけます là treo, móc: kính móc lên tai. Đeo kính dùng かけます." },
    "します": { ex: ["会社へ 行く とき、ネクタイを します。", "Khi đi làm tôi thắt cà vạt."], tip: "Phụ kiện nhỏ như cà vạt, đồng hồ, nhẫn thì dùng します." },
    "うまれます": { ex: ["わたしは ハノイで うまれました。", "Tôi sinh ra ở Hà Nội."], tip: "生 = “sinh”: sinh ra. Năm dùng に, nơi dùng で. Nhóm II." },
    "コート": { ex: ["さむいですから、コートを きます。", "Trời lạnh nên tôi mặc áo khoác."], tip: "Từ tiếng Anh “coat”: áo khoác dài." },
    "セーター": { ex: ["あかい セーターを きて いる 人は ミラーさんです。", "Người mặc áo len đỏ là anh Miller."], tip: "Từ tiếng Anh “sweater”: áo len." },
    "スーツ": { ex: ["スーツを きて、会社へ 行きます。", "Tôi mặc com-lê đi làm."], tip: "Từ tiếng Anh “suit”: bộ com-lê." },
    "ぼうし": { ex: ["ぼうしを かぶって いる 人は だれですか。", "Người đội mũ là ai?"], tip: "帽子 = “mạo tử”: cái mũ, như “mũ mão”. ぼうしを かぶります." },
    "めがね": { ex: ["めがねを かけて いる 人は 木村さんです。", "Người đeo kính là anh Kimura."], tip: "眼鏡 = “nhãn kính”: tấm gương (kính) cho mắt (nhãn), là kính đeo mắt." },
  },
  mine: {
    "22-1": [["これは ベトナムで かった ネクタイです。", "Đây là cà vạt tôi mua ở Việt Nam."]],
    "22-2": [["わたしが すんで いる アパートは えきから ちかいです。", "Căn hộ tôi đang ở gần ga."]],
    "22-3": [["かいしゃに ちかい アパートを さがして います。", "Tôi đang tìm căn hộ gần công ty."]],
    "22-4": [["あの めがねを かけて いる ひとは たなかさんです。", "Người đeo kính kia là anh Tanaka."]],
    "22-5": [["いそがしいですから、 ひるごはんを たべる じかんが ありません。", "Bận quá nên tôi không có thời gian ăn trưa."]],
  },
};
export default L;
