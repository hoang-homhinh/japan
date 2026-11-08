-- Nhắc học qua email. Chạy trong Supabase → SQL Editor (chạy lại nhiều lần không sao).
-- 1) Bảng cài đặt nhắc: 1 hàng / người dùng, người dùng tự sửa hàng của mình từ app.
create table if not exists public.reminders (
  user_id uuid primary key references auth.users on delete cascade,
  email text not null,
  name text,
  time_local text not null default '21:00',          -- "HH:MM" theo múi giờ tz
  tz text not null default 'Asia/Tokyo',
  enabled boolean not null default true,
  last_sent date,                                     -- ngày (theo tz) đã gửi gần nhất, để mỗi ngày gửi tối đa 1 lần
  updated_at timestamptz default now()
);
alter table public.reminders enable row level security;
drop policy if exists "reminders_select_own" on public.reminders;
drop policy if exists "reminders_insert_own" on public.reminders;
drop policy if exists "reminders_update_own" on public.reminders;
drop policy if exists "reminders_delete_own" on public.reminders;
create policy "reminders_select_own" on public.reminders for select using (auth.uid() = user_id);
create policy "reminders_insert_own" on public.reminders for insert with check (auth.uid() = user_id);
create policy "reminders_update_own" on public.reminders for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "reminders_delete_own" on public.reminders for delete using (auth.uid() = user_id);
grant select, insert, update, delete on table public.reminders to authenticated;

-- 2) Lịch chạy 15 phút/lần gọi hàm send-reminders. Làm SAU khi đã deploy hàm và đặt secrets (xem HUONG_DAN_NHAC_HOC.md).
--    Thay <ANON_KEY> bằng anon key của dự án, <CRON_SECRET> bằng đúng chuỗi đã đặt ở secrets.
-- create extension if not exists pg_cron;
-- create extension if not exists pg_net;
-- select cron.unschedule('michi-reminders') where exists (select 1 from cron.job where jobname = 'michi-reminders');
-- select cron.schedule('michi-reminders', '*/15 * * * *', $$
--   select net.http_post(
--     url := 'https://qwjwvsdphvwhnvugcdun.supabase.co/functions/v1/send-reminders',
--     headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer <ANON_KEY>', 'x-cron-secret', '<CRON_SECRET>'),
--     body := '{}'::jsonb
--   )
-- $$);
