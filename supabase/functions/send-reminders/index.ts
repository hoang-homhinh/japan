// Supabase Edge Function: chạy 15 phút/lần (pg_cron), gửi mail nhắc học qua Brevo cho người
// đã bật nhắc, tới giờ hẹn mà hôm nay chưa học. Bí mật cần đặt (supabase secrets set …):
//   BREVO_API_KEY   khoá API của Brevo
//   REMINDER_FROM   email người gửi đã xác minh trên Brevo (vd Gmail của bạn)
//   CRON_SECRET     chuỗi ngẫu nhiên, lịch chạy gửi kèm ở header x-cron-secret
//   APP_URL         địa chỉ app trên Vercel (link trong mail)
// SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY có sẵn trong môi trường Edge Function.
import { createClient } from "npm:@supabase/supabase-js@2";
import { localParts, mailContent, shouldSend, streakFrom, type Reminder } from "../_shared/remind.ts";

Deno.serve(async req => {
  if (req.headers.get("x-cron-secret") !== Deno.env.get("CRON_SECRET")) return new Response("forbidden", { status: 403 });
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: rows, error } = await sb.from("reminders").select("*").eq("enabled", true);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  const now = new Date();
  let sent = 0, skipped = 0;
  const fails: string[] = [];
  for (const r of (rows || []) as Reminder[]) {
    const { data: p } = await sb.from("progress").select("data").eq("user_id", r.user_id).maybeSingle();
    const prog = p?.data?.progress || {};
    const days: string[] = prog.days || [];
    if (!shouldSend(r, now, days)) { skipped++; continue; }
    const today = localParts(now, r.tz).date;
    const st = prog.path?.st || {};
    const stamped = Object.keys(st).map(Number).filter(n => st[n]?.stamp);
    const lesson = Math.min(Math.max(prog.path?.start || 1, (stamped.length ? Math.max(...stamped) : 0) + 1), 25);
    const m = mailContent({ name: r.name || prog.profile?.name, streak: streakFrom(days, today), lesson, app: Deno.env.get("APP_URL") || "" });
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": Deno.env.get("BREVO_API_KEY")!, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ sender: { email: Deno.env.get("REMINDER_FROM"), name: "Michi" }, to: [{ email: r.email }], subject: m.subject, htmlContent: m.html, textContent: m.text }),
    });
    if (res.ok) { await sb.from("reminders").update({ last_sent: today }).eq("user_id", r.user_id); sent++; }
    else fails.push(`${res.status}`);
  }
  return Response.json({ sent, skipped, fails });
});
