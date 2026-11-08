// Màn đăng nhập riêng (toàn trang): khi app có máy chủ đồng bộ thì phải đăng nhập mới vào học.
// Bản không có máy chủ (chạy thử trên máy) thì không chặn. Dữ liệu đã học trên máy sẽ gộp vào tài khoản.
import { peng } from "../core/brand";
import { hasSupabase, resetPassword, signIn, signUp, sync, updatePassword } from "../core/sync";
import { $, esc } from "../core/util";

type Mode = "in" | "up" | "forgot";
let mode: Mode = "in", msg = "", ok = false, busy = false;

export const gateNeeded = () => hasSupabase() && (sync.recovery || (!sync.user && sync.checked));
export const gateLoading = () => hasSupabase() && !sync.checked;

function form() {
  if (sync.recovery) return `<h1>Đặt mật khẩu mới</h1><p class="gsub">Nhập mật khẩu mới cho tài khoản của bạn.</p>
    <form class="gform" data-gate="pw"><label for="gNewPw">Mật khẩu mới</label><input id="gNewPw" type="password" autocomplete="new-password" minlength="6" required>
    <button class="btn big" type="submit" ${busy ? "disabled" : ""}>Lưu mật khẩu</button></form>`;
  const t = { in: ["Đăng nhập", "Học tiếp từ chỗ bạn dừng, trên mọi máy."], up: ["Tạo tài khoản", "Miễn phí. Tiến độ học được lưu và đồng bộ giữa các máy."], forgot: ["Quên mật khẩu", "Nhập email, Michi gửi đường link để đặt lại mật khẩu."] }[mode];
  return `<h1>${t[0]}</h1><p class="gsub">${t[1]}</p>
    <form class="gform" data-gate="${mode}">
      <label for="gEmail">Email</label><input id="gEmail" type="email" autocomplete="email" inputmode="email" required>
      ${mode !== "forgot" ? `<label for="gPw">Mật khẩu${mode === "up" ? " (ít nhất 6 ký tự)" : ""}</label><input id="gPw" type="password" autocomplete="${mode === "up" ? "new-password" : "current-password"}" minlength="6" required>` : ""}
      <button class="btn big" type="submit" ${busy ? "disabled" : ""}>${busy ? "Đang xử lý…" : t[0] === "Quên mật khẩu" ? "Gửi đường link" : t[0]}</button>
    </form>
    <div class="glinks">${mode !== "in" ? `<button class="lnk" data-gmode="in">Đã có tài khoản? Đăng nhập</button>` : `<button class="lnk" data-gmode="up">Chưa có tài khoản? Tạo mới</button><button class="lnk" data-gmode="forgot">Quên mật khẩu</button>`}</div>`;
}

export function renderGate() {
  const g = $("#gate"); if (!g) return;
  const show = gateNeeded() || gateLoading();
  g.hidden = !show; document.body.classList.toggle("gated", show);
  if (!show) return;
  const keepEmail = ($("#gEmail") as any)?.value || "";
  g.innerHTML = `<div class="gwrap">
  <aside class="gside" aria-hidden="true">
    <div class="gbrand"><span class="logo">${peng(34, "")}</span><div><b>Michi</b><small>Tiếng Nhật theo lộ trình</small></div></div>
    <h2>Học N5 theo 25 bài Minna, như đi qua từng ga tàu.</h2>
    <ul>
      <li><b>10–15 phút mỗi ngày.</b> Mỗi bài 6 bước: hội thoại, từ mới, mẫu câu, trợ từ, kanji, kiểm tra.</li>
      <li><b>Ôn đúng lúc sắp quên.</b> Từ khó được hỏi lại sau 1, 3, 7, 14, 30 ngày.</li>
      <li><b>Học trên mọi máy.</b> Tiến độ tự đồng bộ giữa máy tính và điện thoại.</li>
    </ul>
    <div class="gline"><span>東京</span><i></i><span>名古屋</span><i></i><span>京都</span><i></i><span>長崎</span></div>
  </aside>
  <main class="gcard">
    <div class="gbrand gbrand-m"><span class="logo">${peng(34, "Michi")}</span><div><b>Michi</b><small>Tiếng Nhật theo lộ trình · N5</small></div></div>
    ${gateLoading() ? `<p class="gsub" role="status">Đang kiểm tra đăng nhập…</p>` : form()}
    ${msg ? `<div class="gmsg ${ok ? "ok" : "bad"}" role="${ok ? "status" : "alert"}">${esc(msg)}</div>` : ""}
  </main></div>`;
  const e = $("#gEmail") as any; if (e) { e.value = keepEmail; (keepEmail ? $("#gPw") as any : e)?.focus(); }
  ($("#gNewPw") as any)?.focus();
}

const val = (id: string) => (($("#" + id) as any)?.value || "").trim();
async function run(f: () => Promise<void>) {
  if (busy) return; busy = true; msg = ""; renderGate();
  try { await f(); } catch (e: any) { msg = e?.message || String(e); ok = false; }
  busy = false; renderGate();
}

export function bindGate() {
  const g = $("#gate"); if (!g) return;
  g.addEventListener("click", (ev: any) => {
    const b = ev.target.closest("[data-gmode]"); if (!b) return;
    ev.stopPropagation(); mode = b.dataset.gmode; msg = ""; renderGate();
  });
  g.addEventListener("submit", (ev: any) => {
    ev.preventDefault(); ev.stopPropagation();
    const kind = ev.target.dataset.gate;
    if (kind === "pw") return run(async () => { await updatePassword(val("gNewPw")); msg = "Đã đổi mật khẩu."; ok = true; });
    const email = val("gEmail"), pw = val("gPw");
    if (kind === "in") return run(async () => { await signIn(email, pw); msg = ""; });
    if (kind === "up") return run(async () => { const confirm = await signUp(email, pw); msg = confirm ? "Đã tạo tài khoản. Mở thư xác nhận trong hộp mail rồi đăng nhập." : ""; ok = true; if (confirm) mode = "in"; });
    if (kind === "forgot") return run(async () => { await resetPassword(email); msg = "Đã gửi đường link đặt lại mật khẩu. Hãy mở hộp mail."; ok = true; mode = "in"; });
  }, true);
}
