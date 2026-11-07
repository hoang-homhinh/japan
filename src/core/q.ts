// Một "câu" trong trình học (player). Mọi bước của ga và gói ôn đều là danh sách Q.
export type Track = { type: "srs" | "pt" | "ex"; id: string };
export type Q =
  | { kind: "dialogue"; id: string }                                       // nghe hội thoại, nút "Đã nghe xong"
  | { kind: "dialogue-blind"; id: string }                                 // nghe lần 1, chưa hiện chữ
  | { kind: "phrases"; id: string; keep: number[] }                        // các câu đem dùng được ngay
  | { kind: "type"; vi: string; answers: string[]; say: string; track?: Track } // tự nhớ lại: nghĩa → gõ kana
  | { kind: "word-intro"; vid: string; w: any[]; plus?: { ex: [string, string]; tip: string } } // thẻ giới thiệu từ
  | { kind: "mcq"; prompt: string; jp?: string; say?: string; opts: string[]; a: number; why?: string; track?: Track; optJp?: boolean }
  | { kind: "listen"; say: string; opts: string[]; a: number; track?: Track } // nghe rồi chọn từ đúng
  | { kind: "match"; pairs: [string, string, string][] }                  // [nghĩa, kana, id]
  | { kind: "pattern-intro"; pid: string }
  | { kind: "build"; vi: string; tokens: string[]; answer: string[]; track?: Track } // chạm khối để ghép câu
  | { kind: "particle"; drill: string }                                    // id trong PT_DRILLS
  | { kind: "kanji-intro"; ch: string }
  | { kind: "exam"; id: string };                                          // id trong EXAM_BANK

// câu có chấm điểm (thẻ giới thiệu / hội thoại thì không)
export const isGradable = (q: Q) => !["dialogue", "dialogue-blind", "phrases", "word-intro", "pattern-intro", "kanji-intro"].includes(q.kind);
// trượt bài kiểm tra: câu sai thuộc bước nào để khuyên ôn lại (examKind = loại đề của câu exam)
export function adviceStep(q: Q, examKind = ""): number {
  if (q.kind === "particle") return 4;
  if (q.kind === "build") return 3;
  if (q.kind === "exam") return /^ch_/.test(examKind) ? 1 : 3;
  if ((q.kind === "mcq" || q.kind === "listen") && q.track?.id?.[0] === "k") return 5;
  if (q.kind === "mcq" && !q.track && !q.jp) return 1; // câu hỏi ý chính của hội thoại
  return 2;
}
