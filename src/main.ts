// Điểm vào: nạp CSS, dữ liệu trên máy, khung + sự kiện, mở tab Hôm nay, rồi đồng bộ (nếu có Supabase)
import "./styles/base.css";
import "./styles/layout.css";
import "./styles/components.css";
import "./styles/views.css";
import { initStore } from "./core/store";
import { initSync, onSyncChange, sync } from "./core/sync";
import { loadAncient } from "./core/cards";
import { bindEvents, refreshView, setView, view } from "./app/shell";
import { syncLabel } from "./views/account";
import { $$ } from "./core/util";
import "./styles/journey.css";
import "./styles/michi.css";
import { icon, peng } from "./core/brand";
import { openCmd } from "./views/cmdk";
import { openStation } from "./views/station";
import { applyTheme } from "./core/theme";
import { bindGate, renderGate } from "./views/gate";
import { updateMe } from "./app/shell";

applyTheme();

// logo chim cánh cụt + icon nét mảnh cho menu
$$(".logo").forEach(el => { el.innerHTML = peng(30, "Michi"); });
$$("[data-i]").forEach(el => { el.innerHTML = icon(el.dataset.i!, 18); });

initStore();
bindEvents();
bindGate();
renderGate();
export const HOME = "home";
// mở thẳng một tab qua đường link, vd …/#particle (tiện để ghim tab hay dùng)
const VIEWS = ["home", "analytics", "journey", "stamps", "library", "reviewq", "vocab", "kanji", "match", "learn", "talk", "particle", "notes", "exam", "review", "account"];
const startView = location.hash.slice(1);
setView(VIEWS.includes(startView) ? startView : HOME);
window.addEventListener("hashchange", () => { const h = location.hash.slice(1); if (VIEWS.includes(h) && h !== view) setView(h); });

// hình chữ cổ nạp sau (file lớn); xong thì vẽ lại tab đang có thẻ kanji
loadAncient(() => { if (view === "kanji" || view === "match") refreshView(); });

// trạng thái đồng bộ nhỏ ở nút ⚙
let wasGated = document.body.classList.contains("gated");
onSyncChange(() => {
  renderGate(); updateMe();
  const g = document.body.classList.contains("gated");
  if (wasGated && !g) setView(view); // vừa đăng nhập xong: vẽ lại màn đang mở
  wasGated = g;
  $$(".gear").forEach(b => { b.className = "pill gear st-" + sync.status; b.title = "Tài khoản & sao lưu · " + syncLabel(); });
  if (view === "account") refreshView();
});
initSync(refreshView);

// PWA (autoUpdate): trình duyệt chỉ kiểm tra bản mới khi tải trang. App để mở lâu / mở lại từ nền trên điện thoại
// thì không tải lại trang → hỏi máy chủ mỗi khi quay lại app; bản mới cài ngầm, lần mở sau dùng bản mới.
if ("serviceWorker" in navigator) {
  const checkUpdate = () => navigator.serviceWorker.getRegistration().then(r => r && r.update()).catch(() => {});
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") checkUpdate(); });
  checkUpdate();
  // bản mới đã cài xong và nắm quyền trang → tải lại 1 lần để dùng code mới ngay (lần cài đầu tiên thì không cần)
  const hadController = !!navigator.serviceWorker.controller;
  let reloaded = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!hadController || reloaded) return;
    reloaded = true;
    // đang gõ dở thì đợi rời trang/ẩn app mới tải lại, tránh mất chữ
    const typing = [...document.querySelectorAll("input,textarea")].some((el: any) => el.value);
    if (typing) document.addEventListener("visibilitychange", () => { if (document.hidden) location.reload(); }, { once: true });
    else location.reload();
  });
}

// tìm nhanh: Ctrl K / ⌘K hoặc nút tìm trên thanh trên
const goCmd = (target: string) => { const [k, v] = target.split(":"); if (k === "view") setView(v); else if (k === "station") openStation(+v); };
document.addEventListener("keydown", e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openCmd(goCmd); } });
document.getElementById("cmdOpen")?.addEventListener("click", () => openCmd(goCmd));
