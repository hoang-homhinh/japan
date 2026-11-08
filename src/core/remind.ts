// Cài đặt nhắc học qua email: lưu ở bảng reminders trên Supabase (mỗi người 1 hàng, RLS).
// Hàm send-reminders (supabase/functions) đọc bảng này 15 phút/lần và gửi mail qua Brevo.
import { sb, sync } from "./sync";

export type RemindRow = { enabled: boolean; time_local: string; tz: string; email: string; name?: string | null };
export const localTz = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Tokyo"; } catch (e) { return "Asia/Tokyo"; } };
const notReady = (e: any) => /reminders|relation|PGRST20[45]|schema cache/i.test(String(e?.message || e?.code || ""));
export const NOT_READY = "Máy chủ chưa bật tính năng nhắc học (cần chạy supabase/reminders.sql, xem HUONG_DAN_NHAC_HOC.md).";

export async function loadReminder(): Promise<RemindRow | null> {
  if (!sb || !sync.user) return null;
  const { data, error } = await sb.from("reminders").select("enabled,time_local,tz,email,name").eq("user_id", sync.user.id).maybeSingle();
  if (error) throw new Error(notReady(error) ? NOT_READY : error.message);
  return data;
}
export async function saveReminder(r: RemindRow) {
  if (!sb || !sync.user) throw new Error("Hãy đăng nhập trước.");
  if (!/^\d{2}:\d{2}$/.test(r.time_local)) throw new Error("Giờ nhắc chưa đúng dạng HH:MM.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email)) throw new Error("Email nhận nhắc chưa đúng.");
  const { error } = await sb.from("reminders").upsert({ user_id: sync.user.id, ...r, updated_at: new Date().toISOString() });
  if (error) throw new Error(notReady(error) ? NOT_READY : error.message);
}
