// Hồ sơ: tên hiển thị (đồng bộ giữa các máy, đổi sau thắng), chữ viết tắt cho avatar, lời chào.
import { S, saveProgress } from "./store";

export const getName = (): string => String(S.progress.profile?.name || "");
export function setName(n: string) { S.progress.profile = { name: String(n || "").trim().slice(0, 40), t: Date.now() }; saveProgress(); }
export function initials(name: string, email: string) {
  const w = (name || "").trim().split(/\s+/).filter(Boolean);
  if (w.length >= 2) return (w[0][0] + w[w.length - 1][0]).toUpperCase();
  const s = w[0] || (email || "").split("@")[0];
  return s ? s.slice(0, 2).toUpperCase() : "?";
}
export function greeting(d: Date, name: string) {
  const h = d.getHours(), p = h < 11 ? "sáng" : h < 18 ? "chiều" : "tối";
  return `Chào buổi ${p}${name ? ", " + name : ""}`;
}
