// Nội dung "học dễ nhớ" theo từng bài (làm thử bài 13 trước, đạt thì nhân rộng).
// - gist: nghe lần 1 không chữ, hỏi ý chính; keep: chỉ số câu "đem dùng được ngay" trong hội thoại a
// - lots: từ theo lô 5 từ (khoá = kana đúng như trong vocab), xếp theo thứ tự gặp trong hội thoại trước
// - words: câu ví dụ (ưu tiên câu trong hội thoại) + mẹo nhớ Hình + Âm bằng tiếng Việt phổ thông
// - mine: câu "về chính mình" cho từng mẫu câu (id mẫu trong lessons)
export type Gist = { q: string; opts: string[]; a: number };
export type WordPlus = { ex: [string, string]; tip: string };
export type LessonPlus = { gist: Gist[]; keep: number[]; lots: string[][]; words: Record<string, WordPlus>; mine: Record<string, [string, string][]> };

// mỗi bài một file enrich/bNN.ts (export default LessonPlus), gom tự động
const FILES = import.meta.glob<{ default: LessonPlus }>("./enrich/b*.ts", { eager: true });
export const PLUS: Record<number, LessonPlus> = Object.fromEntries(
  Object.entries(FILES).map(([p, m]) => [Number(p.match(/b(\d+)\.ts$/)![1]), m.default]),
);

// kana cần gõ khi tự nhớ lại: bỏ ～ và phần trong [ ] (gõ kèm phần đó cũng được)
export function typeAnswers(kana: string): string[] {
  const strip = (s: string) => s.replace(/[～~？?]/g, "").trim();
  return [...new Set([strip(kana.replace(/\[[^\]]*\]/g, "")), strip(kana.replace(/[\[\]]/g, ""))])];
}
