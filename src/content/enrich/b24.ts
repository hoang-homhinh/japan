// Bài 24 — nội dung "học dễ nhớ" (xem khuôn ở ../enrich.ts)
import type { LessonPlus } from "../enrich";

const L: LessonPlus = {
  gist: [
    { q: "Ngày mai Hoàng làm gì?", opts: ["Chuyển nhà", "Đi công tác", "Về Việt Nam", "Đi dự tiệc"], a: 0 },
    { q: "Anh Tanaka sẽ giúp gì?", opts: ["Chở đồ bằng xe van", "Nấu cơm hộp", "Mua đồ uống", "Dọn phòng cũ"], a: 0 },
    { q: "Hoàng sẽ chuẩn bị gì?", opts: ["Đồ uống", "Cơm hộp", "Bánh kẹo", "Xe chở đồ"], a: 0 },
  ],
  keep: [2, 5, 9],
  lots: [
    ["ひっこし", "じゅんび", "ワゴンしゃ", "[お]べんとう", "くれます"],
    ["ほかに", "ぜんぶ", "じぶんで", "なおします", "いれます"],
    ["おくります", "つれて いきます", "つれて きます", "あんないします", "しょうかいします"],
    ["せつめいします", "[お]かし", "ははの ひ", "ホームステイ"],
    ["おじいさん／おじいちゃん", "おばあさん／おばあちゃん"],
  ],
  words: {
    "ひっこし": { ex: ["ホアンさん、あした ひっこしですね。", "Anh Hoàng, mai anh chuyển nhà nhỉ."], tip: "引っ越し: kéo (引) đồ vượt qua (越) sang chỗ mới, là việc chuyển nhà." },
    "じゅんび": { ex: ["じゅんびは もう できましたか。", "Chuẩn bị xong chưa?"], tip: "準備 = “chuẩn bị”, đọc gần giống tiếng Việt." },
    "ワゴンしゃ": { ex: ["うちに ワゴンしゃが ありますから、にもつを はこんで あげますよ。", "Nhà tôi có xe van nên tôi chở đồ giúp cho."], tip: "Từ tiếng Anh “wagon” + 車 (xe): xe rộng, chở được nhiều đồ." },
    "[お]べんとう": { ex: ["佐藤さんが おべんとうを つくって くれました。", "Chị Satō làm cơm hộp cho tôi."], tip: "べんとう nghe như “bên tô”: hộp cơm mang theo bên mình. 弁当 = cơm hộp." },
    "くれます": { ex: ["佐藤さんは わたしに 花を くれました。", "Chị Satō tặng hoa cho tôi."], tip: "くれます là người khác cho mình: người nhận luôn là “tôi” hoặc người nhà tôi. Mình cho người khác thì dùng あげます." },
    "ほかに": { ex: ["ほかに 何か てつだう ことは ありますか。", "Còn việc gì khác cần giúp không?"], tip: "他 = “tha” (khác): ほかに là ngoài ra, còn gì khác không." },
    "ぜんぶ": { ex: ["いいえ、それで ぜんぶです。", "Không ạ, thế là đủ rồi."], tip: "全部 = “toàn bộ”: tất cả." },
    "じぶんで": { ex: ["パソコンを じぶんで なおしました。", "Tôi tự sửa máy tính."], tip: "自分 = “tự phận”: bản thân mình. じぶんで là tự mình làm, không nhờ ai." },
    "なおします": { ex: ["田中さんに パソコンを なおして もらいました。", "Tôi được anh Tanaka sửa máy tính giúp."], tip: "直 = “trực” (thẳng): nắn cho thẳng lại, tức sửa chữa. Nhóm I." },
    "いれます": { ex: ["佐藤さんが コーヒーを いれて くれました。", "Chị Satō pha cà phê cho tôi."], tip: "入れます là cho vào: cho nước vào cà phê, trà, tức là pha." },
    "おくります": { ex: ["田中さんが 駅まで おくって くれました。", "Anh Tanaka đưa tôi ra ga."], tip: "送 = “tống” trong “tiễn tống”: đưa tiễn người. Gửi đồ cũng là おくります." },
    "つれて いきます": { ex: ["ともだちを 京都へ つれて いきました。", "Tôi đã dẫn bạn đi Kyoto."], tip: "連 = “liên” (đi liền nhau): dẫn người đi theo mình. Chỉ dùng cho người, con vật." },
    "つれて きます": { ex: ["田中さんは 子どもを 会社へ つれて きました。", "Anh Tanaka đã dẫn con đến công ty."], tip: "つれて (dẫn theo) + きます (đến): dẫn ai đến chỗ mình đang ở." },
    "あんないします": { ex: ["わたしが 京都を あんないして あげます。", "Tôi sẽ dẫn anh đi tham quan Kyoto."], tip: "案内 = “án nội”: dẫn vào bên trong, tức hướng dẫn, dẫn đường." },
    "しょうかいします": { ex: ["ともだちを しょうかいします。", "Tôi giới thiệu bạn tôi."], tip: "紹介 = “thiệu giới”: đảo lại là “giới thiệu”." },
    "せつめいします": { ex: ["ぶちょうに 新しい しごとを せつめいして もらいました。", "Tôi được trưởng ban giải thích công việc mới."], tip: "説明 = “thuyết minh”: giảng cho rõ, tức giải thích." },
    "[お]かし": { ex: ["田中さんは おかしを くれました。", "Anh Tanaka cho tôi bánh kẹo."], tip: "菓子 = “quả tử”: bánh trái nhỏ, bánh kẹo. Mang おかし chia đồng nghiệp là thói quen ở công ty Nhật." },
    "ははの ひ": { ex: ["ははの ひに 花を おくりました。", "Ngày của Mẹ tôi đã gửi hoa."], tip: "はは (mẹ) + の + ひ (ngày): Ngày của Mẹ, Chủ nhật thứ hai tháng 5." },
    "ホームステイ": { ex: ["日本で ホームステイを した ことが あります。", "Tôi từng ở homestay tại Nhật."], tip: "Từ tiếng Anh “homestay”: ở nhờ nhà dân bản xứ." },
    "おじいさん／おじいちゃん": { ex: ["おじいさんに 道を おしえて あげました。", "Tôi chỉ đường cho một cụ ông."], tip: "おじいさん (じい kéo dài) là ông; おじさん (じ ngắn) là chú, bác. ちゃん là gọi thân mật." },
    "おばあさん／おばあちゃん": { ex: ["おばあさんの にもつを もって あげました。", "Tôi xách đồ giúp một cụ bà."], tip: "おばあさん (ばあ kéo dài) là bà; おばさん (ば ngắn) là cô, dì. Đọc sai độ dài là gọi nhầm." },
  },
  mine: {
    "24-1": [["たなかさんは わたしに じしょを くれました。", "Anh Tanaka tặng tôi cuốn từ điển."]],
    "24-2": [["わたしは やまださんに ベトナムりょうりの つくりかたを おしえて あげました。", "Tôi đã dạy chị Yamada cách nấu món Việt."]],
    "24-3": [["わたしは たなかさんに にもつを はこんで もらいました。", "Tôi được anh Tanaka chở đồ giúp."]],
    "24-4": [["さとうさんが おべんとうを つくって くれました。", "Chị Satō đã làm cơm hộp cho tôi."]],
    "24-5": [["この ネクタイは ははが くれました。", "Cái cà vạt này là mẹ tôi cho."]],
    "24-6": [["わたしは ははの ひに ははに はなを あげました。", "Ngày của Mẹ tôi đã tặng hoa cho mẹ."]],
  },
};
export default L;
