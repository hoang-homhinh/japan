// Thư viện: các công cụ tra cứu & luyện tự do (màn cũ). Lộ trình chính nằm ở "Hành trình".
import { esc } from "../core/util";
import { $ } from "../core/util";

const TOOLS: [string, string, string, string][] = [
  ["vocab", "語", "Từ vựng", "Tra 1049 từ theo bài, kiểm tra nhanh, nối từ cả bài"],
  ["kanji", "漢", "Kanji theo chương", "95 chữ, 8 chương: chữ cổ, cách nhớ, đọc từ"],
  ["match", "結", "Nối từ", "Nối nghĩa ↔ từ, nghĩa ↔ chữ theo ván hoặc cả bài"],
  ["learn", "文", "Mẫu câu", "138 mẫu ngữ pháp Bài 1–25, thay thế và tự đặt câu"],
  ["talk", "話", "Hội thoại", "50 đoạn hội thoại, nghe cả đoạn, đóng vai"],
  ["particle", "助", "Trợ từ", "Tổng hợp cách dùng, khung động từ, luyện điền"],
  ["notes", "帳", "Sổ ngữ pháp", "Cấu trúc theo bài, trường hợp đặc biệt, cặp dễ nhầm"],
  ["exam", "試", "Luyện thi N5", "10 dạng đề JLPT và thi thử có chấm điểm"],
];

export function renderLibrary() {
  $("#main").innerHTML = `<div class="mobquick"><button class="libcard" data-view="analytics"><span class="libt">Phân tích</span><span class="libd">Lịch học, từ theo bài, mục hay sai</span></button><button class="libcard" data-view="stamps"><span class="libt">Thành tích</span><span class="libd">Sổ dấu và huy hiệu</span></button><button class="libcard" data-view="account"><span class="libt">Tài khoản</span><span class="libd">Đồng bộ, giao diện, sao lưu</span></button></div>
  <p class="lead-lib">Công cụ để tra và luyện thêm. Lộ trình học chính nằm ở <button class="lnk" data-view="journey">Lộ trình</button>.</p>
  <div class="libgrid">${TOOLS.map(([v, ico, t, d]) => `<button class="libcard" data-view="${v}"><span class="libico">${ico}</span><span class="libt">${esc(t)}</span><span class="libd">${esc(d)}</span></button>`).join("")}</div>`;
}
