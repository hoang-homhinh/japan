// Logic nhắc học qua email (thuần, không phụ thuộc Deno) — dùng chung cho hàm send-reminders và kiểm thử.
export type Reminder = { user_id: string; email: string; time_local: string; tz: string; enabled: boolean; last_sent: string | null; name?: string | null };

// ngày "YYYY-MM-DD" và giờ "HH:MM" tại múi giờ tz
export function localParts(now: Date, tz: string) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: tz || "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
    .formatToParts(now).map(x => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, hm: `${p.hour === "24" ? "00" : p.hour}:${p.minute}` };
}
const mins = (hm: string) => { const [h, m] = hm.split(":").map(Number); return h * 60 + m; };

// gửi khi: đang bật, có email, đã tới giờ hẹn (trễ không quá 60 phút — lịch chạy 15 phút/lần),
// hôm nay chưa gửi và hôm nay chưa học
export function shouldSend(r: Reminder, now: Date, studiedDays: string[]) {
  if (!r.enabled || !r.email || !/^\d{2}:\d{2}$/.test(r.time_local || "")) return false;
  const { date, hm } = localParts(now, r.tz);
  const late = mins(hm) - mins(r.time_local);
  if (late < 0 || late >= 60) return false;
  if (r.last_sent === date) return false;
  return !studiedDays.includes(date);
}

const addDays = (d: string, n: number) => { const t = new Date(d + "T00:00:00Z"); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); };
export function streakFrom(days: string[], today: string) {
  const set = new Set(days); let d = set.has(today) ? today : addDays(today, -1), n = 0;
  while (set.has(d)) { n++; d = addDays(d, -1); }
  return n;
}

const esc = (s: string) => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
export function mailContent(o: { name?: string | null; streak: number; lesson?: number; title?: string; app: string }) {
  const hi = o.name ? `Chào ${o.name},` : "Chào bạn,";
  const keep = o.streak > 0 ? `Bạn đang có chuỗi ${o.streak} ngày học liên tiếp. Học vài phút hôm nay để giữ chuỗi nhé.` : "Hôm nay bạn chưa học. Chỉ cần 10 phút là đủ một lượt.";
  const now = o.lesson ? `Đang học: Bài ${o.lesson}${o.title ? " · " + o.title : ""}.` : "";
  const text = `${hi}\n\n${keep}\n${now}\n\nMở Michi: ${o.app}\n\n— Michi · Tiếng Nhật theo lộ trình\n(Tắt nhắc học trong Tài khoản của app.)`;
  const html = `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.55;color:#111A33;max-width:520px">
<p>${esc(hi)}</p><p>${esc(keep)}</p>${now ? `<p style="color:#4E5872">${esc(now)}</p>` : ""}
<p><a href="${esc(o.app)}" style="display:inline-block;background:#111A33;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:600">Mở Michi và học tiếp</a></p>
<p style="color:#6B7591;font-size:12.5px">Michi · Tiếng Nhật theo lộ trình. Tắt nhắc học trong mục Tài khoản của app.</p></div>`;
  return { subject: o.streak > 0 ? `Michi: giữ chuỗi ${o.streak} ngày học hôm nay` : "Michi: 10 phút tiếng Nhật hôm nay", text, html };
}
