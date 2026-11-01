// Sinh bởi scripts/import-datcau.mjs từ ../datcau — sửa ở nguồn rồi chạy lại.
// ================= HỆ THỐNG TRỢ TỪ (Bài 1–25) =================
// Mỗi "cách dùng" có mã u. Bài luyện (PT_DRILLS) gắn mã này để thống kê điểm yếu.
// l = bài gặp lần đầu. q = câu tự hỏi để nhận ra cách dùng này.
export const PT_USES: any = [
 {u:"wa_topic",p:"は",l:1,q:"Đang nói VỀ ai / cái gì?",rule:"Chủ đề của câu: “nói về X thì…”. Đứng đầu câu, thường là thứ người nghe đã biết.",ex:["わたしは エンジニアです。","Tôi là kỹ sư."]},
 {u:"wa_contrast",p:"は",l:5,q:"Đang so sánh / tách riêng một thứ ra?",rule:"Thay cho を／が hoặc chèn sau に／で… để nhấn “còn cái này thì…”, hay gặp trong câu phủ định.",ex:["おさけは のみません。","Rượu thì tôi không uống."]},
 {u:"ga_like",p:"が",l:9,q:"Thích / giỏi / hiểu / có / muốn CÁI GÌ?",rule:"Nhóm từ “trạng thái” không đi với を: すき, きらい, じょうず, へた, わかります, あります (sở hữu), ほしい, できます, いります.",ex:["わたしは サッカーが すきです。","Tôi thích bóng đá."]},
 {u:"ga_exist",p:"が",l:10,q:"Ở đó CÓ cái gì (thông tin mới)?",rule:"(nơi)に N が あります／います: giới thiệu cái mới xuất hiện.",ex:["こうえんに こどもが います。","Ở công viên có trẻ con."]},
 {u:"ga_q",p:"が",l:10,q:"Từ để hỏi đang làm CHỦ NGỮ?",rule:"だれ／なに／どこ／どちら đứng làm chủ ngữ thì luôn が, không bao giờ は. Câu trả lời cũng dùng が.",ex:["だれが きましたか。","Ai đã đến?"]},
 {u:"ga_sub",p:"が",l:14,q:"Hiện tượng tự xảy ra, hoặc chủ ngữ trong câu nhỏ?",rule:"あめが ふります; N1は N2が adj (かみが ながい); chủ ngữ trong mệnh đề nhỏ (～とき, ～と, N bổ nghĩa) luôn が.",ex:["あめが ふって います。","Trời đang mưa."]},
 {u:"wo_obj",p:"を",l:6,q:"Làm CÁI GÌ? (ăn gì, mua gì, xem gì)",rule:"Đối tượng mà hành động tác động vào.",ex:["パンを たべます。","Ăn bánh mì."]},
 {u:"wo_leave",p:"を",l:14,q:"RA KHỎI đâu? XUỐNG khỏi đâu?",rule:"Nơi rời đi: でます, おります (xe), (かいしゃを) やめます… Hình dung: rời KHỎI nơi đó.",ex:["でんしゃを おります。","Xuống tàu."]},
 {u:"wo_move",p:"を",l:13,q:"Đi QUA / dọc theo đâu?",rule:"Nơi mình di chuyển trên đó: さんぽします, わたります, まがります, あるきます.",ex:["こうえんを さんぽします。","Đi dạo trong công viên."]},
 {u:"ni_time",p:"に",l:4,q:"Lúc MẤY giờ / ngày MẤY? (có con số)",rule:"Thời điểm có số: 7じに, 5がつ 10かに. Thứ trong tuần: có hay không に đều được.",ex:["しちじに おきます。","Dậy lúc 7 giờ."]},
 {u:"ni_dest",p:"に／へ",l:5,q:"Đi / đến / về ĐÂU?",rule:"Đích của いきます／きます／かえります. へ và に đều đúng.",ex:["かいしゃへ いきます。","Đi đến công ty."]},
 {u:"ni_target",p:"に",l:7,q:"Cho AI / gặp AI / gọi AI / hỏi AI?",rule:"Người đứng ở đầu nhận của hành động: あげます, おしえます, かします, でんわします, あいます, ききます, いいます.",ex:["やまださんに でんわします。","Gọi điện cho anh Yamada."]},
 {u:"ni_from",p:"に",l:7,q:"Nhận / mượn / học TỪ AI (là người)?",rule:"もらいます, かります, ならいます: người đưa cho mình đi với に (hoặc から).",ex:["ともだちに もらいました。","Nhận từ bạn."]},
 {u:"ni_exist",p:"に",l:10,q:"Ở ĐÂU — chỉ có mặt, không làm gì?",rule:"Chỗ tồn tại: あります, います, すんで います, つとめて います, とまります.",ex:["たなかさんは かいぎしつに います。","Anh Tanaka đang ở phòng họp."]},
 {u:"ni_freq",p:"に",l:11,q:"Bao nhiêu lần TRONG một khoảng?",rule:"(khoảng thời gian)に (số lần): 1しゅうかんに 2かい.",ex:["1しゅうかんに 2かい プールへ いきます。","Một tuần đi bể bơi 2 lần."]},
 {u:"ni_purpose",p:"に",l:13,q:"Đi ĐỂ LÀM GÌ?",rule:"(V-ます bỏ ます)に／(N hành động)に + いきます／きます／かえります.",ex:["こうえんへ あそびに いきます。","Đi công viên để chơi."]},
 {u:"ni_into",p:"に",l:14,q:"Lên / vào / ngồi / đặt — DÍNH VÀO đâu?",rule:"Điểm cuối mà người hay vật bám vào: のります, はいります, すわります, つきます, のぼります, おきます (đặt), いれます, かきます (viết vào).",ex:["いすに すわります。","Ngồi lên ghế."]},
 {u:"ni_become",p:"に",l:19,q:"Trở THÀNH cái gì?",rule:"N／adj な + に なります (adj い đổi thành ～く なります).",ex:["エンジニアに なりました。","Đã trở thành kỹ sư."]},
 {u:"de_place",p:"で",l:6,q:"LÀM ở đâu? (có hành động)",rule:"Nơi xảy ra hành động: ăn, học, làm việc, mua… ở đó.",ex:["しょくどうで たべます。","Ăn ở nhà ăn."]},
 {u:"de_means",p:"で",l:5,q:"BẰNG gì? (xe, đồ dùng, tiếng)",rule:"Phương tiện, công cụ, ngôn ngữ: でんしゃで, はしで, にほんごで. Đi bộ là あるいて (không で).",ex:["バスで いきます。","Đi bằng xe buýt."]},
 {u:"de_total",p:"で",l:5,q:"Mấy NGƯỜI cùng làm / tổng cộng bao nhiêu?",rule:"ひとりで, みんなで, ふたりで; 3つで 100えん.",ex:["ひとりで にほんへ きました。","Tôi sang Nhật một mình."]},
 {u:"de_scope",p:"で",l:12,q:"Trong PHẠM VI nào (nhất trong…)?",rule:"N[の なか]で ～が いちばん ～.",ex:["くだものの なかで なにが いちばん すきですか。","Trong các loại quả, thích gì nhất?"]},
 {u:"de_event",p:"で",l:21,q:"SỰ KIỆN diễn ra ở đâu?",rule:"(nơi)で (sự kiện)が あります: あります ở đây là “được tổ chức”, nên dùng で chứ không phải に.",ex:["ホテルで パーティーが あります。","Có bữa tiệc ở khách sạn."]},
 {u:"to_and",p:"と",l:4,q:"A VÀ B (kể đủ hết)?",rule:"Nối danh từ, liệt kê đầy đủ.",ex:["パンと たまごを たべます。","Ăn bánh mì và trứng."]},
 {u:"to_with",p:"と",l:5,q:"CÙNG với ai?",rule:"Làm chung với ai: いきます, すみます, けっこんします, はなします (nói chuyện qua lại).",ex:["ともだちと いきます。","Đi cùng bạn."]},
 {u:"to_quote",p:"と",l:21,q:"Nghĩ / nói RẰNG…?",rule:"Trích nội dung: ～と おもいます, ～と いいました.",ex:["あした あめが ふると おもいます。","Tôi nghĩ mai trời mưa."]},
 {u:"e_dir",p:"へ",l:5,q:"Hướng đi tới đâu?",rule:"Chỉ hướng của động từ di chuyển. Đọc là “e”. Dùng được thay cho に với いきます／きます／かえります.",ex:["くにへ かえります。","Về nước."]},
 {u:"kara_from",p:"から",l:4,q:"TỪ đâu / từ lúc nào?",rule:"Điểm bắt đầu (thời gian, nơi chốn).",ex:["9じから はたらきます。","Làm việc từ 9 giờ."]},
 {u:"kara_giver",p:"から",l:7,q:"Nhận TỪ ai / tổ chức nào?",rule:"Người hoặc tổ chức đưa cho mình. Tổ chức (công ty, trường) thì chỉ dùng から.",ex:["かいしゃから もらいました。","Nhận từ công ty."]},
 {u:"kara_reason",p:"から",l:9,q:"VÌ sao? (sau cả một câu)",rule:"Câu + から = vì…",ex:["じかんが ありませんから、タクシーで いきます。","Vì không có thời gian nên đi taxi."]},
 {u:"made_to",p:"まで",l:4,q:"ĐẾN đâu / đến lúc nào?",rule:"Điểm kết thúc. Đi cặp với から.",ex:["9じから 5じまで はたらきます。","Làm từ 9 giờ đến 5 giờ."]},
 {u:"madeni",p:"までに",l:17,q:"TRƯỚC hạn chót nào?",rule:"Làm xong trước một thời điểm (một lần). まで = kéo dài liên tục tới lúc đó.",ex:["きんようびまでに だして ください。","Hãy nộp trước thứ sáu."]},
 {u:"yori",p:"より",l:12,q:"SO VỚI cái gì?",rule:"N1は N2より adj = N1 hơn N2.",ex:["とうきょうは おおさかより おおきいです。","Tokyo lớn hơn Osaka."]},
 {u:"mo_also",p:"も",l:1,q:"CŨNG vậy?",rule:"Thay vào chỗ của は／が／を. Với に／で／へ thì ghép: にも, でも, へも.",ex:["わたしも エンジニアです。","Tôi cũng là kỹ sư."]},
 {u:"mo_neg",p:"も",l:5,q:"KHÔNG… gì / ai / đâu cả?",rule:"Từ để hỏi + も + phủ định: なにも, だれも, どこ[へ]も.",ex:["なにも たべません。","Không ăn gì cả."]},
 {u:"no_link",p:"の",l:1,q:"CỦA ai / thuộc cái gì?",rule:"Nối 2 danh từ: N1 bổ nghĩa cho N2.",ex:["さんけいの エンジニア","Kỹ sư của Sankei"]},
 {u:"ya_list",p:"や",l:10,q:"Kể VÀI cái tiêu biểu?",rule:"N1や N2[など]: ngầm hiểu còn thứ khác.",ex:["ほんや ノートが あります。","Có sách, vở…"]},
 {u:"dake",p:"だけ",l:11,q:"CHỈ bấy nhiêu?",rule:"Đứng sau số lượng hoặc danh từ.",ex:["やすみは にちようびだけです。","Ngày nghỉ chỉ có Chủ nhật."]},
 {u:"none_time",p:"×",l:4,q:"Thời gian KHÔNG có con số?",rule:"いま, きょう, あした, まいにち, らいしゅう, けさ… không thêm に. いつ cũng không có に.",ex:["あした いきます。","Mai tôi đi."]},
 {u:"none_qty",p:"×",l:11,q:"SỐ LƯỢNG (mấy cái, mấy người, bao lâu)?",rule:"Số lượng đứng ngay trước động từ, không thêm trợ từ: りんごを 4つ かいます. Khoảng thời gian cũng vậy: 2じかん べんきょうします.",ex:["きってを 2まい かいます。","Mua 2 con tem."]}
];

// Bảng "Hỏi danh từ câu gì" — bước 2 của cách chọn. Thứ tự = thứ tự nên tự hỏi.
export const PT_ASK: any = [
 ["Danh từ này là CHỦ ĐỀ (đang nói về nó)?","は","わたしは…, かいしゃは…"],
 ["Ai/cái gì đi với すき・わかります・ほしい・あります・できます…?","が","にほんごが わかります"],
 ["Từ để hỏi làm chủ ngữ? Câu nhỏ bên trong?","が","だれが／あめが ふる とき"],
 ["Làm CÁI GÌ?","を","パンを たべます"],
 ["RA KHỎI / ĐI QUA đâu?","を","うちを でます／はしを わたります"],
 ["Đi / đến / về ĐÂU?","へ／に","とうきょうへ いきます"],
 ["Lên / vào / ngồi / đặt — dính VÀO đâu?","に","でんしゃに のります"],
 ["Đi ĐỂ làm gì?","に","かいものに いきます"],
 ["Chỉ CÓ MẶT ở đâu (không làm gì)?","に","へやに います"],
 ["LÀM ở đâu (có hành động)?","で","しょくどうで たべます"],
 ["Lúc MẤY giờ / ngày mấy?","に (không số: ×)","7じに／あした×"],
 ["Cho / gặp / gọi / hỏi AI?","に","ともだちに あいます"],
 ["CÙNG ai?","と","ともだちと いきます"],
 ["BẰNG gì?","で","バスで／にほんごで"],
 ["Trong PHẠM VI nào (nhất)?","で","クラスで いちばん"],
 ["TỪ đâu / lúc nào / ai?","から","9じから／ははから"],
 ["ĐẾN đâu / lúc nào? Trước HẠN nào?","まで／までに","5じまで／あしたまでに"],
 ["SO VỚI cái gì?","より","バスより はやい"],
 ["SỐ LƯỢNG / bao lâu?","×","3つ かいます／2じかん"]
];

// Cụm dễ nhầm — dùng cho chế độ luyện "theo cặp".
export const PT_SETS: any = [
 {id:"place",t:"に hay で (nơi chốn)",uses:["ni_exist","de_place","de_event","ni_into"],tip:"Chỉ CÓ MẶT ở đó → に. Có HÀNH ĐỘNG ở đó → で. Sự kiện được tổ chức (あります) → で."},
 {id:"move",t:"へ／に hay を (di chuyển)",uses:["ni_dest","e_dir","ni_into","wo_leave","wo_move"],tip:"Đi TỚI → へ／に. Dính VÀO (lên xe, vào phòng) → に. Rời KHỎI hoặc đi QUA → を."},
 {id:"wa_ga",t:"は hay が",uses:["wa_topic","wa_contrast","ga_like","ga_exist","ga_q","ga_sub"],tip:"Mặc định は. Đổi sang が khi: từ để hỏi làm chủ ngữ, có すき／わかる／ほしい／ある…, hiện tượng, câu nhỏ bên trong."},
 {id:"person",t:"Người: に, と hay から",uses:["ni_target","ni_from","to_with","kara_giver"],tip:"Hành động một chiều hướng tới người đó → に. Làm CÙNG nhau → と. Người/tổ chức đưa cho mình → から (người thì に cũng được)."},
 {id:"time",t:"Thời gian & số lượng: に hay ×",uses:["ni_time","none_time","ni_freq","none_qty","kara_from","made_to","madeni"],tip:"Có con số chỉ thời điểm → に. Không số (あした) → ×. Số lượng／bao lâu → ×. Tần suất → (khoảng)に (số lần)."},
 {id:"de",t:"Bốn nghĩa của で",uses:["de_place","de_means","de_total","de_scope","de_event"],tip:"Nơi làm, bằng gì, mấy người, trong phạm vi nào, sự kiện ở đâu."},
 {id:"ni",t:"Các nghĩa của に",uses:["ni_time","ni_dest","ni_target","ni_from","ni_exist","ni_freq","ni_purpose","ni_into","ni_become"],tip:"に = “điểm đích”: điểm thời gian, điểm đến, người nhận, chỗ có mặt, chỗ dính vào, mục đích, trạng thái mới."}
];

// Khung trợ từ của động từ — khung riêng thắng quy tắc chung. Thứ tự: bài (theo từ vựng của bạn).
export const PT_FRAMES: any = [
 {g:"Đi lại",rows:[
  ["いきます／きます／かえります","(nơi)へ／に ・ (người)と ・ (xe)で ・ (V-ます)に",5],
  ["あるいて いきます","(nơi)へ — あるいて, không có で",5],
  ["のります","(xe)に のります",16],["おります","(xe)を おります",16],
  ["はいります","(phòng, quán, trường)に はいります",14],["でます","(nơi)を でます",14],
  ["さんぽします","(công viên)を さんぽします",13],
  ["まがります","(góc, ngã tư)を まがります ・ (hướng)へ まがります",14],
  ["わたります／あるきます","(cầu, đường)を …",23],
  ["つきます","(nơi)に つきます",25],
  ["のぼります","(núi)に のぼります",19],["とまります","(khách sạn)に とまります",19]]},
 {g:"Có mặt · sống · làm",rows:[
  ["あります／います","(nơi)に N が あります",10],
  ["すんで います","(nơi)に すんで います",15],
  ["つとめて います","(công ty)に つとめて います",15],
  ["はたらきます","(nơi)で はたらきます",4],
  ["あります (sự kiện)","(nơi)で (sự kiện)が あります",21],
  ["うまれます","(nơi)で／に うまれます",22]]},
 {g:"Người nhận · người cho",rows:[
  ["あげます／かします／おしえます","(người)に (vật)を …",7],
  ["もらいます／かります／ならいます","(người)に／から (vật)を …",7],
  ["くれます","(người)が わたしに (vật)を くれます",24],
  ["でんわします／あいます","(người)に …",6],
  ["ききます (hỏi)","(người)に ききます",23],
  ["いいます","(người)に「…」と いいます",21],
  ["けっこんします","(người)と けっこんします",13]]},
 {g:"Đặt · đưa vào",rows:[
  ["すわります","(ghế)に すわります",14],
  ["おきます (đặt)","(vật)を (chỗ)に おきます",15],
  ["いれます","(vật)を (chỗ)に いれます",16],
  ["かきます","(chỗ)に (chữ)を かきます",6],
  ["さわります","(vật)に さわります",23]]},
 {g:"Đi với が (không phải を)",rows:[
  ["すき／きらい／じょうず／へた","N が すきです",9],
  ["わかります","N が わかります",9],
  ["あります (sở hữu)","N が あります",9],
  ["ほしい","N が ほしいです",13],
  ["V-たい","N を／が V-たいです",13],
  ["できます","N が できます",18],
  ["いります","N が いります",20],
  ["ふります／うごきます／でます (tự xảy ra)","N が …",14]]},
 {g:"Nghĩ · nói · trở thành",rows:[
  ["おもいます","(câu thể thường)と おもいます",21],
  ["なります","N／adj な に なります ・ adj い → く なります",19],
  ["かちます／まけます","(đối thủ)に かちます",21],
  ["きを つけます","N に きを つけます",23]]}
];
export const PT_BTNS: any = ["は","が","を","に","へ","で","と","から","まで","までに","より","も","の","や","だけ","×"];
