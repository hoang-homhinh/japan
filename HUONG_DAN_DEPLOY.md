# Hướng dẫn đưa app lên mạng (Supabase + Vercel)

Làm **một lần**, mất khoảng 15 phút. Cả hai dịch vụ đều có gói miễn phí, đủ dùng cho người học.

- **Supabase**: lưu tài khoản và tiến độ học, để học trên điện thoại hay máy tính đều thấy tiến độ giống nhau.
- **Vercel**: đưa trang web lên mạng, cho bạn một đường link kiểu `https://n5-cua-hoang.vercel.app`.

Không làm bước 1 thì app vẫn chạy được, nhưng chỉ lưu tiến độ trên từng máy.

---

## Bước 1. Tạo Supabase (lưu tiến độ)

1. Vào https://supabase.com → **Start your project** → đăng nhập bằng GitHub hoặc email.
2. **New project**:
   - Name: `n5app`
   - Database Password: bấm Generate, rồi lưu lại ở đâu đó (app không cần đến mật khẩu này)
   - Region: **Northeast Asia (Tokyo)**
   - Bấm **Create new project** và đợi khoảng 1–2 phút.
3. Tạo bảng: ở menu trái chọn **SQL Editor** → **New query** → mở file `supabase/schema.sql` trong thư mục dự án, copy toàn bộ, dán vào → **Run**. Thấy báo `Success` là được.
4. Tắt xác nhận email cho nhanh (không bắt buộc): **Authentication → Sign In / Providers → Email** → tắt **Confirm email** → Save.
   *Nếu để bật: sau khi đăng ký, phải mở email bấm link xác nhận rồi mới đăng nhập được.*
5. Lấy 2 khoá: **Project Settings → API** (hoặc **Data API**), copy:
   - **Project URL** → dùng làm `VITE_SUPABASE_URL`
   - **anon public** key → dùng làm `VITE_SUPABASE_ANON_KEY`

   Khoá *anon* được phép công khai. Dữ liệu vẫn an toàn vì bảng đã bật RLS: mỗi tài khoản chỉ đọc và ghi được dòng của chính mình. **Tuyệt đối không dùng khoá `service_role`.**

## Bước 2. Chạy thử trên máy

```bash
cd D:\Vinh\training\japanese\n5app
npm install
copy .env.example .env.local      # rồi mở .env.local, dán 2 khoá ở Bước 1
npm run dev                        # mở http://localhost:5173
```

## Bước 3. Đưa code lên GitHub

1. Tạo repo mới trên https://github.com/new, tên `n5app`, chọn **Private**.
2. Trong thư mục dự án:
   ```bash
   git init
   git add .
   git commit -m "N5 app"
   git branch -M main
   git remote add origin https://github.com/<tên-github-của-bạn>/n5app.git
   git push -u origin main
   ```
   File `.env.local` đã nằm trong `.gitignore`, nên khoá **không** bị đẩy lên GitHub.

## Bước 4. Deploy trên Vercel

1. Vào https://vercel.com → đăng nhập bằng GitHub → **Add New… → Project** → chọn repo `n5app` → **Import**.
2. Framework: Vercel tự nhận ra **Vite**. Các mục khác giữ nguyên.
3. Mở **Environment Variables**, thêm 2 biến giống trong `.env.local`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Bấm **Deploy**. Khoảng 1 phút sau sẽ có link `https://n5app-xxx.vercel.app`.
5. Quay lại Supabase → **Authentication → URL Configuration** → **Site URL** dán link Vercel vào. Bước này để link "quên mật khẩu" trong email trỏ đúng về app.

Từ giờ, mỗi lần `git push` thì Vercel tự build và cập nhật app.

## Bước 5. Cài lên điện thoại như một app

- **Android (Chrome):** mở link → menu ⋮ → **Thêm vào màn hình chính / Cài đặt ứng dụng**.
- **iPhone (Safari):** mở link → nút Chia sẻ → **Thêm vào MH chính**.

App vẫn mở được khi không có mạng. Lúc có mạng lại, tiến độ tự đồng bộ.

## Bước 6. Chuyển tiến độ cũ từ claude.ai sang

File `backup/tien_do_tu_claude.json` chứa tiến độ đã lấy từ bản claude.ai: 154 từ/kanji đang ôn và 5 ngày học.
Mở app → ⚙ **Tài khoản & sao lưu** → đăng nhập → **Nhập sao lưu** → chọn file đó.
App gộp file vào tiến độ hiện có, không ghi đè mất dữ liệu.

---

## Sửa nội dung về sau

| Muốn sửa | Sửa ở đâu |
|---|---|
| Từ vựng | `n5/baiXX_tuvung.md` (bảng `Kana / Kanji / Romaji / Nghĩa / Ghi chú`) |
| Kanji, cách nhớ | `n5/kanji/chuongXX_kanji.md` |
| Hình chữ cổ (khi thêm chương) | `python ..\datcau\img\fetch_kanji_img.py` rồi `npm run import-datcau pics` |
| Ngữ pháp, trợ từ, đề thi | `src/content/…` (xem README.md) |

Sau khi sửa file `.md` từ vựng/kanji: `npm run content` (hoặc `npm run build`, đã bao gồm).

Sửa xong thì `npm run build` để kiểm tra, rồi `git commit` + `git push` để Vercel tự cập nhật.
