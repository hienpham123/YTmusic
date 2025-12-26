# 🗄️ Hướng dẫn Setup Supabase

## Bước 1: Tạo Supabase Project

1. Truy cập https://supabase.com
2. Đăng ký/Đăng nhập tài khoản
3. Click **"New Project"**
4. Điền thông tin:
   - **Name**: yt-music-hub (hoặc tên bạn muốn)
   - **Database Password**: Tạo password mạnh (lưu lại!)
   - **Region**: Chọn region gần bạn nhất
5. Click **"Create new project"** và đợi project được tạo (2-3 phút)

## Bước 2: Lấy API Keys

1. Vào project vừa tạo
2. Vào **Settings** > **API**
3. Copy các keys sau:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Giữ bí mật!)

## Bước 3: Tạo Database Schema

1. Vào **SQL Editor** trong Supabase Dashboard
2. Click **"New query"**
3. Copy toàn bộ nội dung file `supabase/schema.sql`
4. Paste vào SQL Editor
5. Click **"Run"** để chạy migration
6. Kiểm tra kết quả - nên thấy "Success. No rows returned"

## Bước 4: Cấu hình Environment Variables

Tạo/update file `.env.local` trong project:

```env
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key_here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Bước 5: Test Connection

1. Khởi động lại dev server:
```bash
npm run dev
```

2. Mở browser console và kiểm tra xem có lỗi Supabase không

## 📋 Database Schema

Project sử dụng 3 bảng chính:

### `users`
- Lưu thông tin user (link với Supabase Auth)
- Fields: `id`, `email`, `name`, `avatar`, `created_at`

### `playlists`
- Lưu danh sách playlist của user
- Fields: `id`, `user_id`, `name`, `created_at`, `updated_at`

### `tracks`
- Lưu các bài hát trong playlist
- Fields: `id`, `playlist_id`, `youtube_video_id`, `title`, `thumbnail`, `channel_name`, `duration`, `mood`, `created_at`

## 🔒 Row Level Security (RLS)

Tất cả tables đều có RLS enabled:
- Users chỉ có thể xem/sửa data của chính họ
- Playlists và tracks được bảo vệ theo user_id

## 🚀 Next Steps

Sau khi setup xong:
1. Implement authentication (Supabase Auth)
2. Sync playlists với database
3. Auto-save khi user thêm/xóa tracks

## ⚠️ Lưu ý

- **Service Role Key**: Chỉ dùng ở server-side, không expose ra client
- **Anon Key**: Safe để dùng ở client-side (có RLS bảo vệ)
- **Database Password**: Lưu lại ở nơi an toàn, cần để reset nếu quên

