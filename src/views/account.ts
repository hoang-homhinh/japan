// Tài khoản & sao lưu: đăng nhập email + mật khẩu (Supabase), trạng thái đồng bộ, xuất / nhập file sao lưu
import { S, exportJSON, importBackup } from "../core/store";
import { configError, hasSupabase, resetPassword, signIn, signOut, signUp, sync, syncNow, updatePassword } from "../core/sync";
import { $, dayStr, esc, toast } from "../core/util";
import { peekPath, setPathOption, setStart } from "../core/path";

let mode = "in"; // in | up | forgot
let msg = "", msgOk = false, busy = false;

const STATUS: any = {
  local: "Chưa cấu hình máy chủ đồng bộ: dữ liệu chỉ lưu trên máy này.",
  out: "Chưa đăng nhập: dữ liệu đang lưu trên máy này.",
  syncing: "Đang đồng bộ…",
  ok: "Đã đồng bộ",
  pending: "Có thay đổi chưa đẩy lên, sẽ tự đồng bộ sau giây lát.",
  error: "Chưa đồng bộ được. Dữ liệu vẫn còn trên máy, app sẽ thử lại lần lưu sau.",
  offline: "Đang mất mạng. Dữ liệu vẫn lưu trên máy, có mạng lại sẽ tự đồng bộ.",
};
export function syncLabel() {
  let t = STATUS[sync.status] || "";
  if (sync.status === "ok" && sync.last) t += " lúc " + sync.last.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  return t;
}

function counts() {
  const srs = Object.values<any>(S.progress.srs || {});
  return `${S.sentences.length} câu trong sổ · ${srs.length} từ/chữ đã học · ${(S.progress.days || []).length} ngày có học`;
}

export function renderAccount() {
  const u = sync.user;
  let auth = "";
  if (!hasSupabase() && configError) {
    auth = `<div class="res bad">Cấu hình đồng bộ bị sai: ${esc(configError)} App vẫn chạy và lưu trên máy này.</div>`;
  } else if (!hasSupabase()) {
    auth = `<p class="tip">Bản này chưa gắn máy chủ đồng bộ (thiếu <code>VITE_SUPABASE_URL</code> / <code>VITE_SUPABASE_ANON_KEY</code>). Mọi thứ vẫn chạy, chỉ là dữ liệu nằm trên máy này. Dùng “Xuất sao lưu” để chuyển sang máy khác.</p>`;
  } else if (sync.recovery) {
    auth = `<form class="acc" autocomplete="on">
      <div class="ask">Đặt mật khẩu mới</div>
      <input id="accNewPw" type="password" autocomplete="new-password" placeholder="Mật khẩu mới (ít nhất 6 ký tự)">
      <div class="row"><button class="btn accent" id="accSetPw">Lưu mật khẩu mới</button></div></form>`;
  } else if (u) {
    auth = `<div class="row" style="align-items:center;flex-wrap:wrap;gap:10px"><div style="flex:1;min-width:200px"><div class="tip">Đang đăng nhập</div><b>${esc(u.email || "")}</b></div>
      <button class="btn" id="accSync">Đồng bộ ngay</button><button class="btn ghost" id="accOut">Đăng xuất</button></div>
      <p class="tip">Học trên máy nào cũng được: tiến độ và sổ câu tự gộp với các máy khác đã đăng nhập cùng tài khoản.</p>`;
  } else {
    const tabs = `<div class="chips" style="margin-top:0">${[["in", "Đăng nhập"], ["up", "Tạo tài khoản"], ["forgot", "Quên mật khẩu"]].map(([k, t]) => `<button class="chip" data-accmode="${k}" aria-pressed="${k === mode}">${t}</button>`).join("")}</div>`;
    auth = `${tabs}<form class="acc" autocomplete="on">
      <input id="accEmail" type="email" autocomplete="email" placeholder="Email" inputmode="email">
      ${mode !== "forgot" ? `<input id="accPw" type="password" autocomplete="${mode === "up" ? "new-password" : "current-password"}" placeholder="Mật khẩu${mode === "up" ? " (ít nhất 6 ký tự)" : ""}">` : ""}
      <div class="row"><button class="btn accent" id="accGo" ${busy ? "disabled" : ""}>${mode === "in" ? "Đăng nhập" : mode === "up" ? "Tạo tài khoản" : "Gửi mail đặt lại mật khẩu"}</button></div></form>
      <p class="tip">${mode === "up" ? "Sau khi tạo, mở thư xác nhận trong hộp mail rồi quay lại đăng nhập." : mode === "forgot" ? "Mở đường link trong mail, app sẽ hỏi mật khẩu mới." : "Đăng nhập để học trên nhiều máy. Dữ liệu đang có trên máy này sẽ được gộp vào tài khoản, không mất."}</p>`;
  }
  $("#main").innerHTML = `
  <section class="step"><h2><span class="k">人</span>Tài khoản<span class="hint">đồng bộ nhiều máy</span></h2>
    <div class="card" style="margin-top:0">
      ${hasSupabase() ? `<div class="syncst st-${sync.status}"><i></i><span>${esc(syncLabel())}</span></div>${sync.err && sync.status === "error" ? `<div class="tip">Chi tiết: ${esc(sync.err)}</div>` : ""}` : ""}
      ${auth}
      ${msg ? `<div class="res ${msgOk ? "ok" : "bad"}">${esc(msg)}</div>` : ""}
    </div>
  </section>
  <section class="step"><h2><span class="k">旅</span>Hành trình<span class="hint">cài đặt học mỗi ngày</span></h2>
    <div class="card" style="margin-top:0">
      <div class="row" style="align-items:center;flex-wrap:wrap"><span>Mỗi ngày học</span>${[1, 2, 3].map(g => `<button class="chip" data-goal="${g}" aria-pressed="${peekPath().goal === g}">${g} lượt</button>`).join("")}</div>
      <div class="row" style="align-items:center;flex-wrap:wrap"><span>Âm thanh (nhạc tàu, chuông)</span><button class="chip" data-sound="1" aria-pressed="${peekPath().sound}">${peekPath().sound ? "Bật" : "Tắt"}</button></div>
      <div class="row" style="align-items:center;flex-wrap:wrap"><label for="accStart">Bắt đầu từ ga (bài)</label><select id="accStart">${Array.from({ length: 25 }, (_, i) => `<option value="${i + 1}" ${peekPath().start === i + 1 ? "selected" : ""}>Bài ${i + 1}</option>`).join("")}</select><button class="btn ghost" id="accSetStart">Đổi</button></div>
      <p class="tip">Đổi ga bắt đầu: các ga trước đó được coi là đã đi qua (mở hết, chưa đóng dấu). Không mất tiến độ đã có.</p>
    </div>
  </section>
  <section class="step"><h2><span class="k">保</span>Sao lưu<span class="hint">file .json</span></h2>
    <div class="card" style="margin-top:0">
      <div class="tip">Trên máy này: ${esc(counts())}</div>
      <div class="row" style="flex-wrap:wrap"><button class="btn" id="accExport">Xuất sao lưu (.json)</button><button class="btn ghost" id="accImport">Nhập sao lưu</button>
        <input type="file" id="accFile" accept=".json,application/json" hidden></div>
      <p class="tip">Nhập sao lưu sẽ <b>gộp</b> với dữ liệu đang có (không xoá gì). Nhận cả file xuất từ bản cũ.</p>
    </div>
  </section>`;
}

const val = (id: string) => (($("#" + id) || {}).value || "").trim();
async function act(f: () => Promise<any>) {
  if (busy) return; busy = true; msg = "";
  try { await f(); } catch (e: any) { msg = e?.message || String(e); msgOk = false; }
  busy = false; renderAccount();
}

function download() {
  const blob = new Blob([exportJSON()], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = `datcau-saoluu-${dayStr()}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
function pickFile() {
  const inp = $("#accFile"); if (!inp) return;
  inp.value = "";
  inp.onchange = async () => {
    const f = inp.files && inp.files[0]; if (!f) return;
    try {
      const r = importBackup(await f.text());
      msg = `Đã gộp sao lưu: ${r.sentences} câu, ${r.srs} từ/chữ.`; msgOk = true;
    } catch (e) { msg = "File không đúng định dạng sao lưu của app."; msgOk = false; }
    renderAccount();
  };
  inp.click();
}

export function onClick(t: any) {
  if (t.dataset.goal) { setPathOption("goal", +t.dataset.goal); renderAccount(); return true; }
  if (t.dataset.sound) { setPathOption("sound", !peekPath().sound); renderAccount(); return true; }
  if (t.id === "accSetStart") { setStart(+val("accStart")); toast("Đã đổi ga bắt đầu."); renderAccount(); return true; }
  if (t.dataset.accmode) { mode = t.dataset.accmode; msg = ""; renderAccount(); return true; }
  if (t.id === "accGo") {
    const email = val("accEmail"), pw = val("accPw");
    if (!email) { toast("Hãy nhập email."); return true; }
    if (mode !== "forgot" && !pw) { toast("Hãy nhập mật khẩu."); return true; }
    act(async () => {
      if (mode === "in") { await signIn(email, pw); msg = "Đã đăng nhập."; msgOk = true; }
      else if (mode === "up") { const confirm = await signUp(email, pw); msg = confirm ? "Đã tạo tài khoản. Mở thư xác nhận trong hộp mail rồi đăng nhập." : "Đã tạo tài khoản và đăng nhập."; msgOk = true; if (confirm) mode = "in"; }
      else { await resetPassword(email); msg = "Đã gửi mail đặt lại mật khẩu. Mở đường link trong mail."; msgOk = true; }
    });
    return true;
  }
  if (t.id === "accSetPw") { const pw = val("accNewPw"); if (!pw) { toast("Hãy nhập mật khẩu mới."); return true; } act(async () => { await updatePassword(pw); msg = "Đã đổi mật khẩu."; msgOk = true; }); return true; }
  if (t.id === "accOut") { act(async () => { await signOut(); msg = "Đã đăng xuất. Dữ liệu vẫn còn trên máy này."; msgOk = true; }); return true; }
  if (t.id === "accSync") { act(async () => { await syncNow(); if (sync.status === "ok") { msg = "Đã đồng bộ xong."; msgOk = true; } }); return true; }
  if (t.id === "accExport") { download(); return true; }
  if (t.id === "accImport") { pickFile(); return true; }
  return false;
}
