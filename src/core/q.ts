// Một "câu" trong trình học (player). Mọi bước của ga và gói ôn đều là danh sách Q.
export type Track = { type: "srs" | "pt" | "ex"; id: string };
export type Q =
  | { kind: "dialogue"; id: string }                                       // nghe hội thoại, nút "Đã nghe xong"
  | { kind: "word-intro"; vid: string; w: any[] }                          // thẻ giới thiệu từ
  | { kind: "mcq"; prompt: string; jp?: string; say?: string; opts: string[]; a: number; why?: string; track?: Track; optJp?: boolean }
  | { kind: "listen"; say: string; opts: string[]; a: number; track?: Track } // nghe rồi chọn từ đúng
  | { kind: "match"; pairs: [string, string, string][] }                  // [nghĩa, kana, id]
  | { kind: "pattern-intro"; pid: string }
  | { kind: "build"; vi: string; tokens: string[]; answer: string[]; track?: Track } // chạm khối để ghép câu
  | { kind: "particle"; drill: string }                                    // id trong PT_DRILLS
  | { kind: "kanji-intro"; ch: string }
  | { kind: "exam"; id: string };                                          // id trong EXAM_BANK
