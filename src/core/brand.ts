// Nhận diện Michi: chim cánh cụt trưởng ga (vẽ phẳng, nhỏ gọn) + bộ icon nét mảnh dùng chung.
export function peng(size = 32, label = "") {
  return `<svg class="peng" width="${size}" height="${size}" viewBox="0 0 40 40" ${label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"'}>
<g transform="translate(1.2,-6.6) scale(.94)">
<ellipse cx="8.6" cy="32" rx="3.2" ry="9" fill="#18213D" transform="rotate(16 8.6 25)"/><ellipse cx="31.4" cy="32" rx="3.2" ry="9" fill="#18213D" transform="rotate(-16 31.4 25)"/>
<ellipse cx="20" cy="30.5" rx="12.5" ry="17" fill="#1F2B4D"/><ellipse cx="20" cy="34" rx="8.6" ry="12.2" fill="#fff"/>
<ellipse cx="16.4" cy="22" rx="3.4" ry="3.7" fill="#fff"/><ellipse cx="23.6" cy="22" rx="3.4" ry="3.7" fill="#fff"/>
<circle cx="16.8" cy="22.3" r="1.55" fill="#0B1020"/><circle cx="23.2" cy="22.3" r="1.55" fill="#0B1020"/>
<path d="M17.6 25.2 L22.4 25.2 L20 28.4Z" fill="#F2A900"/>
<ellipse cx="15.4" cy="47.4" rx="3.6" ry="1.5" fill="#F2A900"/><ellipse cx="24.6" cy="47.4" rx="3.6" ry="1.5" fill="#F2A900"/>
<path d="M9.6 16.2 Q11 7.2 20 6.8 Q29 7.2 30.4 16.2Z" fill="#1A2647"/><rect x="9.8" y="13.6" width="20.4" height="2.8" fill="#C8364A"/>
<path d="M10.4 16.3 Q20 19.6 29.6 16.3 L29.4 17.8 Q20 21.4 10.6 17.8Z" fill="#0B1020"/></g></svg>`;
}

const IC: Record<string, string> = {
  home: '<path d="M4 11 12 4l8 7v9h-5v-6H9v6H4z"/>',
  map: '<circle cx="6" cy="6" r="2.2"/><circle cx="18" cy="18" r="2.2"/><path d="M8 6h6a4 4 0 0 1 0 8h-4a4 4 0 0 0 0 8"/>',
  rev: '<path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  exam: '<path d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h5"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM8 7h7"/>',
  medal: '<circle cx="12" cy="14" r="6"/><path d="M8 3l4 5 4-5"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5"/>',
  check: '<path d="M5 12l5 5 9-10"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  play: '<path d="M7 4l13 8-13 8z"/>',
  vol: '<path d="M4 9h4l5-4v14l-5-4H4zM17 8a5 5 0 0 1 0 8"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
};
export const icon = (k: string, size = 18, sw = 1.7) =>
  `<svg class="i" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[k] || ""}</svg>`;
