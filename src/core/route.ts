// Tuyến tàu N5: 25 ga = 25 bài Minna. Mỗi ga có số hiệu kiểu ga Nhật (N01…N25), tên địa danh,
// hình đặc trưng cho con dấu, và 3–5 kanji (chia đều theo bài đầu tiên có từ vựng chứa chữ đó).
import { KANJI, VOCAB } from "../content/data";

export type Station = { n: number; code: string; name: string; kana: string; motif: string; kanji: string[] };

// [tên, cách đọc, hình con dấu theo chủ đề bài]
const PLACES: [string, string, string][] = [
  ["東京", "とうきょう", "🙇"], ["上野", "うえの", "🎁"], ["浅草", "あさくさ", "🏬"], ["新宿", "しんじゅく", "⏰"], ["渋谷", "しぶや", "🚃"],
  ["横浜", "よこはま", "🍙"], ["鎌倉", "かまくら", "🎀"], ["箱根", "はこね", "♨️"], ["富士", "ふじ", "🗻"], ["静岡", "しずおか", "🍵"],
  ["浜松", "はままつ", "📮"], ["名古屋", "なごや", "🏯"], ["伊勢", "いせ", "🍚"], ["奈良", "なら", "🦌"], ["京都", "きょうと", "⛩️"],
  ["大阪", "おおさか", "🏧"], ["神戸", "こうべ", "🏥"], ["姫路", "ひめじ", "🎸"], ["岡山", "おかやま", "🍑"], ["倉敷", "くらしき", "🗣️"],
  ["広島", "ひろしま", "💭"], ["宮島", "みやじま", "🏠"], ["下関", "しものせき", "🧭"], ["福岡", "ふくおか", "🤝"], ["長崎", "ながさき", "🎐"],
];

const firstLesson = (vocab: any[], ch: string): number | null => {
  for (const L of vocab) for (const g of L.groups) for (const w of g.w) if ((w[1] || "").includes(ch)) return L.n;
  return null;
};

// Gán mỗi chữ vào một ga: (1) bài đầu tiên có từ chứa chữ; (2) ga quá `cap` đẩy chữ thừa sang ga kế;
// (3) chữ không có trong từ vựng điền vào ga đang ít chữ nhất (ga sớm trước). Giữ thứ tự chương. `min` chỉ để kiểm tra.
export function assignKanji(vocab: any[], kanjiChars: string[], cap = 5, min = 3): Record<number, string[]> {
  const m: Record<number, string[]> = {};
  for (let n = 1; n <= 25; n++) m[n] = [];
  const order = new Map(kanjiChars.map((c, i) => [c, i]));
  const loose: string[] = [];
  for (const ch of kanjiChars) { const n = firstLesson(vocab, ch); if (n && n <= 25) m[n].push(ch); else loose.push(ch); }
  // dồn chữ thừa theo mức trung bình (95 chữ / 25 ga ≈ 4) để ga cuối không bị trống
  const soft = Math.min(cap, Math.ceil(kanjiChars.length / 25));
  for (let n = 1; n <= 25; n++) {
    m[n].sort((a, b) => order.get(a)! - order.get(b)!);
    if (m[n].length > soft) {
      const extra = m[n].splice(soft);
      if (n < 25) m[n + 1].push(...extra); else loose.push(...extra);
    }
  }
  for (const ch of loose) {
    let best = 1;
    for (let n = 2; n <= 25; n++) if (m[n].length < m[best].length) best = n;
    m[best].push(ch);
  }
  return m;
}

const ALL_KANJI: string[] = KANJI.flatMap((c: any) => c.groups.flatMap((g: any) => g.kanji.map((k: any) => k.k)));
const ASSIGNED = assignKanji(VOCAB, ALL_KANJI);

export const STATIONS: Station[] = PLACES.map(([name, kana, motif], i) => ({
  n: i + 1, code: "N" + String(i + 1).padStart(2, "0"), name, kana, motif, kanji: ASSIGNED[i + 1] || [],
}));
export const stationOf = (n: number): Station => STATIONS[Math.min(Math.max(n, 1), 25) - 1];
