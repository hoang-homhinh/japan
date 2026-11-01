-- Bảng tiến độ học: 1 hàng / người dùng. data = {"progress": {...}, "sentences": [...]}
-- Chạy trong Supabase → SQL Editor.
create table if not exists public.progress (
  user_id uuid primary key references auth.users on delete cascade,
  data jsonb not null,
  updated_at timestamptz default now()
);

alter table public.progress enable row level security;

-- chỉ chủ sở hữu được đọc / ghi / xoá hàng của mình
drop policy if exists "progress_select_own" on public.progress;
drop policy if exists "progress_insert_own" on public.progress;
drop policy if exists "progress_update_own" on public.progress;
drop policy if exists "progress_delete_own" on public.progress;
create policy "progress_select_own" on public.progress for select using (auth.uid() = user_id);
create policy "progress_insert_own" on public.progress for insert with check (auth.uid() = user_id);
create policy "progress_update_own" on public.progress for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "progress_delete_own" on public.progress for delete using (auth.uid() = user_id);

-- quyền bảng cho vai trò đã đăng nhập (dự án Supabase mới có thể không tự cấp cho bảng tạo bằng SQL;
-- RLS ở trên vẫn giới hạn mỗi người chỉ thấy hàng của mình). Chạy lại nhiều lần không sao.
grant select, insert, update, delete on table public.progress to authenticated;
