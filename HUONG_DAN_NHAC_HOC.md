# Bật nhắc học qua email (Brevo + Supabase)

Mỗi 15 phút, Supabase chạy hàm `send-reminders`. Hàm này tìm người đã bật nhắc, đã tới giờ hẹn (trễ không quá 1 giờ) mà hôm đó chưa học, rồi gửi một email qua Brevo. Mỗi người nhận tối đa 1 mail mỗi ngày.

## 1. Brevo (miễn phí)

1. Đăng ký tại https://www.brevo.com.
2. Vào **Senders, Domains & Dedicated IPs → Senders → Add a sender** và thêm email gửi, ví dụ Gmail của bạn. Mở mail xác nhận mà Brevo gửi tới.
3. Vào **SMTP & API → API Keys → Generate a new API key**. Chép khoá (dạng `xkeysib-…`). Không dán khoá vào chat hay vào code.

## 2. Tạo bảng trên Supabase

Supabase → **SQL Editor** → dán phần 1 của file `supabase/reminders.sql` (từ `create table` tới `grant …`) → **Run**.

Xong bước này, mục **Tài khoản → Nhắc học qua email** trong app đã lưu được cài đặt.

## 3. Deploy hàm gửi mail

Cần cài Supabase CLI (https://supabase.com/docs/guides/cli). Chạy trong thư mục `n5app`:

```bash
npx supabase login
npx supabase link --project-ref qwjwvsdphvwhnvugcdun
npx supabase secrets set BREVO_API_KEY=xkeysib-... REMINDER_FROM=email-da-xac-minh@gmail.com APP_URL=https://<app-cua-ban>.vercel.app CRON_SECRET=<chuoi-ngau-nhien-dai>
npx supabase functions deploy send-reminders
```

Lấy `CRON_SECRET` là một chuỗi ngẫu nhiên tự đặt, ví dụ 32 ký tự bất kỳ. Ghi lại để dùng ở bước 4.

## 4. Lịch chạy 15 phút/lần

Supabase → **SQL Editor** → dán phần 2 của `supabase/reminders.sql`, bỏ dấu `--` ở đầu các dòng.

- Thay `<ANON_KEY>` bằng anon key (Project Settings → API).
- Thay `<CRON_SECRET>` bằng đúng chuỗi đã đặt ở bước 3.

Rồi bấm **Run**.

## 5. Thử

1. Trong app: **Tài khoản → Nhắc học qua email**. Bật nhắc, đặt giờ sớm hơn hiện tại vài phút, rồi bấm **Lưu**.
2. Đợi tối đa 15 phút. Nếu hôm nay bạn chưa học thì sẽ có mail. Hôm nào đã học thì không gửi.
3. Xem nhật ký trong Supabase → **Edge Functions → send-reminders → Logs**. Kết quả trả về dạng `{ sent, skipped, fails }`.
