// "Câu của ngày": một câu dùng được ngay của bài đang học, cố định trong một ngày.
import { DIALOGUES } from "../content/dialogues";
import { PLUS } from "../content/enrich";

export function phraseOfDay(n: number, day: string): { kana: string; jp: string; vi: string } | null {
  const D = DIALOGUES.find((d: any) => d.id === `${n}a`); if (!D) return null;
  const lines = (PLUS[n]?.keep?.length ? PLUS[n].keep.map(i => D.lines[i]) : D.lines).filter(Boolean);
  if (!lines.length) return null;
  let h = n; for (const c of day) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const x = lines[h % lines.length];
  return { kana: x.kana, jp: x.jp, vi: x.vi };
}
