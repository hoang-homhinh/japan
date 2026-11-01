// Linh vật ペンちゃん (Pen-chan): chim cánh cụt đeo khăn hachimaki. SVG tự vẽ, không cần file ảnh.
// mood: hi (vẫy tay) · happy (đúng) · oops (sai, động viên) · cheer (xong buổi) · think (đang nghĩ / trống)
export type Mood = "hi" | "happy" | "oops" | "cheer" | "think";

const NAVY = "#24324F", NAVY_D = "#16203A", BELLY = "#FFFFFF", BEAK = "#F4A13A", FEET = "#F08C2E",
  BLUSH = "#F7A8B8", BAND = "#FFFFFF", SUN = "#E2543B";

function eyes(m: Mood) {
  if (m === "happy" || m === "cheer")
    return `<path d="M44 57 q5 -6 10 0" fill="none" stroke="${NAVY_D}" stroke-width="3" stroke-linecap="round"/><path d="M66 57 q5 -6 10 0" fill="none" stroke="${NAVY_D}" stroke-width="3" stroke-linecap="round"/>`;
  const dot = (x: number) => `<circle cx="${x}" cy="56" r="4.6" fill="${NAVY_D}"/><circle cx="${x + 1.6}" cy="54.3" r="1.6" fill="#fff"/>`;
  const brow = m === "oops" ? `<path d="M43 49 l9 -3" stroke="${NAVY_D}" stroke-width="2.4" stroke-linecap="round"/><path d="M77 49 l-9 -3" stroke="${NAVY_D}" stroke-width="2.4" stroke-linecap="round"/>` : "";
  return dot(49) + dot(71) + brow;
}
function wings(m: Mood) {
  const wing = (side: number, angle: number) =>
    `<ellipse cx="${60 + side * 36}" cy="76" rx="8" ry="19" fill="${NAVY}" stroke="${NAVY_D}" stroke-width="2" transform="rotate(${angle} ${60 + side * 30} 66)"/>`;
  if (m === "hi") return wing(-1, 18) + wing(1, -110);
  if (m === "cheer") return wing(-1, 115) + wing(1, -115);
  if (m === "think") return wing(-1, 18) + wing(1, -70);
  return wing(-1, 18) + wing(1, -18);
}
function extras(m: Mood) {
  if (m === "oops") return `<path d="M88 40 q4 7 0 10 q-4 -3 0 -10z" fill="#7CC4F2" stroke="#3E8FD0" stroke-width="1"/>`;
  if (m === "cheer") return `<path d="M14 26 l2.5 6 6 2.5 -6 2.5 -2.5 6 -2.5 -6 -6 -2.5 6 -2.5z" fill="#F2C14E"/><path d="M104 18 l2 4.6 4.6 2 -4.6 2 -2 4.6 -2 -4.6 -4.6 -2 4.6 -2z" fill="#F2C14E"/><circle cx="100" cy="46" r="2.4" fill="#F7A8B8"/><circle cx="20" cy="50" r="2" fill="#7CC4F2"/>`;
  if (m === "think") return `<circle cx="96" cy="30" r="3" fill="#C9D3E3"/><circle cx="103" cy="20" r="4.4" fill="#C9D3E3"/>`;
  return "";
}
function beak(m: Mood) {
  return m === "happy" || m === "cheer" || m === "hi"
    ? `<path d="M53 65 q7 -3 14 0 q-7 10 -14 0z" fill="${BEAK}" stroke="#C97A1E" stroke-width="1"/><path d="M56 67 q4 3 8 0" fill="#E2543B"/>`
    : `<path d="M54 64 q6 -3 12 0 q-6 7 -12 0z" fill="${BEAK}" stroke="#C97A1E" stroke-width="1"/>`;
}

export function penguin(m: Mood = "hi", size = 96, label = "ペンちゃん") {
  return `<svg class="pen pen-${m}" viewBox="0 0 120 120" width="${size}" height="${size}" role="img" aria-label="${label}">
  <ellipse cx="60" cy="112" rx="30" ry="4" fill="#000" opacity=".08"/>
  ${wings(m)}
  <ellipse cx="60" cy="68" rx="37" ry="43" fill="${NAVY}" stroke="${NAVY_D}" stroke-width="2"/>
  <ellipse cx="60" cy="80" rx="25" ry="28" fill="${BELLY}"/>
  <ellipse cx="60" cy="58" rx="25" ry="19" fill="${BELLY}"/>
  <path d="M24 37 Q60 25 96 37 L95 46 Q60 34 25 46 Z" fill="${BAND}" stroke="#D9DEE8" stroke-width="1"/>
  <circle cx="60" cy="38.5" r="4.6" fill="${SUN}"/>
  <path d="M95 40 q9 -6 13 -2 q-6 1 -9 7z M95 43 q8 3 10 9 q-6 -2 -10 -5z" fill="${BAND}" stroke="#D9DEE8" stroke-width="1"/>
  ${eyes(m)}
  <ellipse cx="42" cy="66" rx="5.5" ry="3.6" fill="${BLUSH}" opacity=".85"/><ellipse cx="78" cy="66" rx="5.5" ry="3.6" fill="${BLUSH}" opacity=".85"/>
  ${beak(m)}
  <ellipse cx="48" cy="109" rx="9" ry="4.2" fill="${FEET}"/><ellipse cx="72" cy="109" rx="9" ry="4.2" fill="${FEET}"/>
  ${extras(m)}
</svg>`;
}
// dùng trong CSS (background-image) và icon PWA
export const penguinDataURI = (m: Mood) => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(penguin(m, 120).replace('class="pen pen-' + m + '" ', 'xmlns="http://www.w3.org/2000/svg" '));

// lời ペンちゃん — xoay vòng cho đỡ nhàm
const LINES: Record<string, [string, string][]> = {
  happy: [["すごい！", "Giỏi lắm!"], ["いいね！", "Chuẩn rồi!"], ["そのとおり！", "Đúng y luôn!"], ["さすが！", "Đỉnh thật!"], ["ばっちり！", "Hoàn hảo!"]],
  oops: [["だいじょうぶ！", "Không sao, nhớ lại lần sau nhé."], ["おしい！", "Suýt đúng rồi!"], ["がんばって！", "Cố lên, đọc phần “vì sao” nhé."], ["ドンマイ！", "Sai mới nhớ lâu!"]],
  cheer: [["おつかれさま！", "Xong buổi rồi, nghỉ chút nhé!"], ["よくできました！", "Hôm nay làm tốt lắm!"]],
};
let k = 0;
export function penLine(kind: "happy" | "oops" | "cheer") { const a = LINES[kind]; return a[(k++) % a.length]; }

// khối linh vật + bong bóng lời nói
export function penSay(m: Mood, jp: string, vi: string, size = 64) {
  return `<div class="pensay">${penguin(m, size)}<div class="bubble"><span class="jp">${jp}</span>${vi ? `<span>${vi}</span>` : ""}</div></div>`;
}
