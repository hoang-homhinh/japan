// Con dấu ga (駅スタンプ): vòng tròn mực, tên ga chạy theo vành, số hiệu + hình đặc trưng ở giữa, ngày đóng.
// Mực hơi loang nhờ bộ lọc nhiễu SVG. Ga lẻ mực xanh tuyến, ga chẵn mực chàm.
import { stationOf } from "./route";

export function stampSVG(n: number, size = 120, date = ""): string {
  const s = stationOf(n), ink = n % 2 ? "#00A0A0" : "#1C3F7A", id = `st${n}-`;
  return `<svg class="stampsvg" viewBox="0 0 120 120" width="${size}" height="${size}" role="img" aria-label="Con dấu ga ${s.code} ${s.name}">
  <defs>
    <filter id="${id}ink"><feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" seed="${n}"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.9 1.3"/><feComposite in="SourceGraphic" operator="in"/></filter>
    <path id="${id}arc" d="M 22 62 A 38 38 0 0 1 98 62"/>
  </defs>
  <g filter="url(#${id}ink)" fill="none" stroke="${ink}" transform="rotate(${(n * 7) % 14 - 7} 60 60)">
    <circle cx="60" cy="60" r="55" stroke-width="3.5" stroke-dasharray="2.2 1.2"/>
    <circle cx="60" cy="60" r="48" stroke-width="2"/>
    <text font-family="Zen Kaku Gothic New, sans-serif" font-size="15" font-weight="700" fill="${ink}" stroke="none" text-anchor="middle"><textPath href="#${id}arc" startOffset="50%">${s.name} ・ ${s.kana}</textPath></text>
    <line x1="30" y1="82" x2="90" y2="82" stroke-width="1.5"/>
    <text x="60" y="97" font-family="Be Vietnam Pro, sans-serif" font-size="13" font-weight="800" fill="${ink}" stroke="none" text-anchor="middle">${s.code}${date ? " · " + date.slice(5).replace("-", "/") : ""}</text>
  </g>
  <text x="60" y="74" font-size="30" text-anchor="middle" opacity=".9">${s.motif}</text></svg>`;
}
