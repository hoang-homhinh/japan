// Thứ tự nét kanji (dữ liệu KanjiVG, CC BY-SA 3.0). Mỗi nét là một <path class="stk"> có --i = thứ tự;
// CSS trong journey.css vẽ lần lượt từng nét bằng stroke-dasharray + animation-delay.
import STROKES from "../content/strokes.json";

const S = STROKES as Record<string, string[]>;
export const hasStrokes = (ch: string) => !!S[ch]?.length;

export function strokeSVG(ch: string, size = 160): string {
  const d = S[ch]; if (!d?.length) return "";
  const paths = d.map((p, i) => `<path class="stk" style="--i:${i}" d="${p}" pathLength="1"/>`).join("");
  return `<svg class="strokes" viewBox="0 0 109 109" width="${size}" height="${size}" role="img" aria-label="Thứ tự nét chữ ${ch} (${d.length} nét)">`
    + `<g class="stk-ghost">${d.map(p => `<path d="${p}"/>`).join("")}</g><g class="stk-ink">${paths}</g></svg>`;
}
