// Đồng bộ nhiều máy qua Supabase: 1 hàng / người dùng trong bảng progress, cột data = {progress, sentences}.
// Không có VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY → chế độ chỉ lưu trên máy, mọi thứ vẫn chạy.
import { createClient } from "@supabase/supabase-js";
import { LS_KEY, S, applyData, mergeData, setChangeHook } from "./store";
import { baseUrl } from "./supaurl";

// nhận cả tên biến do tích hợp Supabase của Vercel tạo (NEXT_PUBLIC_…)
const ENV: any = import.meta.env;
const URL_ = baseUrl(String(ENV.VITE_SUPABASE_URL || ENV.NEXT_PUBLIC_SUPABASE_URL || ""));
const KEY_ = String(ENV.VITE_SUPABASE_ANON_KEY || ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY || ENV.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "").trim();
// cấu hình sai (vd dán nhầm khoá vào ô URL) → không làm sập app, chỉ báo trong ⚙ Tài khoản
export const configError = URL_ && !/^https:\/\/[^\s]+$/.test(URL_)
  ? "VITE_SUPABASE_URL phải là Project URL dạng https://xxxx.supabase.co (đang là: " + URL_.slice(0, 12) + "…). Có thể bạn dán nhầm khoá vào ô này."
  : URL_ && !KEY_ ? "Thiếu VITE_SUPABASE_ANON_KEY." : "";
let client: any = null;
if (URL_ && KEY_ && !configError) { try { client = createClient(URL_, KEY_); } catch (e) { client = null; } }
export const sb: any = client;
export const hasSupabase = () => !!sb;

// status: local (không cấu hình) · out (chưa đăng nhập) · syncing · ok · pending · error · offline
export const sync: any = { status: sb ? "out" : "local", user: null, last: null, err: "", recovery: false, checked: !sb };
let listeners: Array<() => void> = [];
export function onSyncChange(f: () => void) { listeners.push(f); }
const emit = () => { for (const f of listeners) { try { f(); } catch (e) {} } };
const setStatus = (st: string, err = "") => { sync.status = st; sync.err = err; emit(); };

let ready = false;          // đã gộp với bản trên mạng cho người dùng hiện tại chưa
let timer: any = null, busy: Promise<any> = Promise.resolve(), dirty = false;
let onMerged: null | (() => void) = null;

const OWNER_KEY = LS_KEY + "_owner"; // tài khoản sở hữu dữ liệu đang lưu trên máy
const errText = (e: any) => String(e?.message || e || "lỗi không rõ");
const isOffline = () => typeof navigator !== "undefined" && navigator.onLine === false;

async function fetchRemote() {
  const { data, error } = await sb.from("progress").select("data, updated_at").eq("user_id", sync.user.id).maybeSingle();
  if (error) throw error;
  return data ? (data.data || {}) : null;
}
async function upsert(d: any) {
  const { error } = await sb.from("progress").upsert({ user_id: sync.user.id, data: d, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (error) throw error;
}

// tải về → gộp → lưu cả 2 phía. rerender=true khi vừa mở app / vừa đăng nhập
async function pullMerge(rerender: boolean) {
  if (!sb || !sync.user) return;
  if (isOffline()) { setStatus("offline"); return; }
  // xoá cờ TRƯỚC khi tải: thay đổi trong lúc chờ mạng sẽ bật lại cờ. (Trước đây cờ bị xoá SAU upsert →
  // thay đổi làm trong lúc đó không được flush() đẩy khi ẩn tab.)
  dirty = false; setStatus("syncing");
  try {
    const rem = await fetchRemote();
    // dữ liệu trên máy thuộc tài khoản khác (đổi tài khoản trên cùng máy) → không gộp sang, lấy bản của tài khoản này
    let owner: string | null = null; try { owner = localStorage.getItem(OWNER_KEY); } catch (e) {}
    const foreign = !!owner && owner !== sync.user.id;
    const local = foreign ? { progress: {}, sentences: [] } : { progress: S.progress, sentences: S.sentences };
    const merged = rem ? mergeData(local, rem) : mergeData(local, {});
    applyData(merged);
    await upsert({ progress: S.progress, sentences: S.sentences });
    try { localStorage.setItem(OWNER_KEY, sync.user.id); } catch (e) {}
    ready = true; sync.last = new Date();
    setStatus(dirty ? "pending" : "ok");
    if (rerender && onMerged) onMerged();
  } catch (e) {
    dirty = true;
    setStatus(isOffline() ? "offline" : "error", errText(e));
  }
}
// đẩy lên: đọc bản trên mạng, gộp (máy khác có thể vừa ghi), rồi ghi lại
async function push() {
  if (!sb || !sync.user) return;
  if (!ready) return pullMerge(false);
  if (isOffline()) { setStatus("offline"); return; }
  dirty = false; setStatus("syncing");
  try {
    const rem = await fetchRemote();
    if (rem) applyData(mergeData({ progress: S.progress, sentences: S.sentences }, rem));
    await upsert({ progress: S.progress, sentences: S.sentences });
    sync.last = new Date(); setStatus(dirty ? "pending" : "ok");
  } catch (e) {
    dirty = true; // giữ trên máy, thử lại lần lưu sau / khi có mạng
    setStatus(isOffline() ? "offline" : "error", errText(e));
  }
}
const queue = (f: () => Promise<any>) => (busy = busy.then(f, f));

function schedule() {
  if (!sb || !sync.user) return;
  dirty = true;
  if (sync.status !== "syncing") setStatus("pending");
  clearTimeout(timer);
  timer = setTimeout(() => { timer = null; queue(push); }, 1500);
}
function flush() {
  if (!sb || !sync.user || !dirty) return;
  clearTimeout(timer); timer = null; queue(push);
}
export function syncNow() { if (!sb || !sync.user) return Promise.resolve(); clearTimeout(timer); timer = null; return queue(() => pullMerge(true)); }

function setUser(u: any) {
  const changed = (u?.id || null) !== (sync.user?.id || null);
  sync.user = u || null;
  if (changed) ready = false;
  if (!u) { clearTimeout(timer); timer = null; dirty = false; setStatus("out"); }
  return changed;
}

export async function initSync(afterMerge: () => void) {
  onMerged = afterMerge;
  setChangeHook(schedule);
  if (!sb) { emit(); return; }
  document.addEventListener("visibilitychange", () => { if (document.hidden) flush(); });
  window.addEventListener("pagehide", flush);
  window.addEventListener("online", () => { if (sync.user) queue(ready ? push : () => pullMerge(true)); });
  sb.auth.onAuthStateChange((ev: string, session: any) => {
    if (ev === "PASSWORD_RECOVERY") { sync.recovery = true; emit(); }
    const u = session?.user || null;
    // gọi Supabase bên trong callback có thể treo → để sang lượt sau
    if (setUser(u) && u) setTimeout(() => queue(() => pullMerge(true)), 0);
    else emit();
  });
  try {
    const { data } = await sb.auth.getSession();
    const u = data?.session?.user || null;
    sync.checked = true;
    if (setUser(u) && u) { emit(); queue(() => pullMerge(true)); }
    else emit();
  } catch (e) { sync.checked = true; emit(); }
}

// ---- tài khoản ----
const viErr = (e: any) => {
  const m = errText(e);
  if (/invalid login credentials/i.test(m)) return "Sai email hoặc mật khẩu.";
  if (/email not confirmed/i.test(m)) return "Email chưa được xác nhận. Hãy mở thư xác nhận trong hộp thư.";
  if (/already registered|already exists/i.test(m)) return "Email này đã có tài khoản. Hãy đăng nhập.";
  if (/password should be at least|weak password/i.test(m)) return "Mật khẩu quá ngắn (ít nhất 6 ký tự).";
  if (/rate limit|too many/i.test(m)) return "Thử quá nhiều lần. Đợi ít phút rồi thử lại.";
  if (/fetch|network/i.test(m)) return "Không kết nối được máy chủ. Kiểm tra mạng.";
  return m;
};
export async function signIn(email: string, password: string) {
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw new Error(viErr(error));
}
export async function signUp(email: string, password: string) {
  const { data, error } = await sb.auth.signUp({ email, password, options: { emailRedirectTo: location.origin } });
  if (error) throw new Error(viErr(error));
  return !data?.session; // true = cần xác nhận email
}
export async function signOut() {
  flush(); await busy;
  const { error } = await sb.auth.signOut();
  if (error) throw new Error(viErr(error));
}
export async function resetPassword(email: string) {
  const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin });
  if (error) throw new Error(viErr(error));
}
export async function updatePassword(password: string) {
  const { error } = await sb.auth.updateUser({ password });
  if (error) throw new Error(viErr(error));
  sync.recovery = false; emit();
}
