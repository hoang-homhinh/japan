// Từ vựng + kanji: sinh bởi scripts/build-content.mjs từ ../n5/*.md (đừng sửa JSON bằng tay)
import vocab from "./generated/vocab.json";
import kanji from "./generated/kanji.json";

// VOCAB[bài].groups[nhóm].w = [kana, kanji, romaji, nghĩa, ghi chú]
export const VOCAB: any[] = vocab as any;
// KANJI[chương].groups[nhóm].kanji = {k, hv, on, kun, mean, ex:[[từ, cách đọc, nghĩa]], tip}
export const KANJI: any[] = kanji as any;
