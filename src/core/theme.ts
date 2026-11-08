// Giao diện sáng / tối / theo máy — lưu trên máy này (không đồng bộ), áp dụng qua <html data-theme>.
const KEY = "michi_theme";
export type Theme = "auto" | "light" | "dark";
export function getTheme(): Theme { try { const v = localStorage.getItem(KEY); return v === "light" || v === "dark" ? v : "auto"; } catch (e) { return "auto"; } }
export function applyTheme(t: Theme = getTheme()) { if (t === "auto") document.documentElement.removeAttribute("data-theme"); else document.documentElement.dataset.theme = t; }
export function setTheme(t: string) { const v: Theme = t === "light" || t === "dark" ? t : "auto"; try { localStorage.setItem(KEY, v); } catch (e) {} applyTheme(v); }
