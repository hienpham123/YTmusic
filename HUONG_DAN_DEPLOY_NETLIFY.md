# 🚀 Hướng dẫn Deploy lên Netlify và Cấu hình Supabase

## Vấn đề: Redirect về localhost sau khi deploy

Sau khi deploy lên Netlify, khi đăng nhập thành công với OAuth (GitHub/Google), bạn có thể bị redirect về `localhost:3000` thay vì URL của Netlify. Đây là do cấu hình trong Supabase Dashboard chưa có URL của Netlify.

## ✅ Giải pháp: Cấu hình Redirect URLs trong Supabase

### Bước 1: Lấy URL của Netlify

URL của bạn sẽ có dạng: `https://your-app-name.netlify.app`

### Bước 2: Thêm Redirect URL vào Supabase

1. Vào [Supabase Dashboard](https://app.supabase.com/)
2. Chọn project của bạn
3. Vào **Authentication** > **URL Configuration** (hoặc **Authentication** > **Settings** > **URL Configuration**)
4. Trong phần **Redirect URLs**, bạn sẽ thấy:
   - `http://localhost:3000/auth/callback` (cho development)

5. **Thêm URL của Netlify** vào danh sách:
   - Click vào ô input hoặc nút **"+ Add URL"**
   - Thêm: `https://your-app-name.netlify.app/auth/callback`
     - ⚠️ **Quan trọng**: Thay `your-app-name` bằng tên thực tế của app Netlify của bạn
   - Bạn có thể thêm nhiều URL nếu có nhiều môi trường (staging, production, etc.)

6. Click **"Save"** hoặc **"Update"**

### Ví dụ:

Nếu URL Netlify của bạn là `https://my-ytmusic-app.netlify.app`, bạn cần thêm:
```
https://my-ytmusic-app.netlify.app/auth/callback
```

Danh sách Redirect URLs sẽ trông như thế này:
```
http://localhost:3000/auth/callback
https://my-ytmusic-app.netlify.app/auth/callback
```

## 📝 Cấu hình Biến Môi trường trên Netlify

Đảm bảo bạn đã cấu hình các biến môi trường trên Netlify:

1. Vào Netlify Dashboard
2. Chọn site của bạn
3. Vào **Site settings** > **Environment variables**
4. Thêm các biến sau:
   - `NEXT_PUBLIC_SUPABASE_URL`: URL của Supabase project (ví dụ: `https://xxxxx.supabase.co`)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anon key của Supabase project

## 🔄 Cập nhật GitHub OAuth App (nếu dùng GitHub OAuth)

Nếu bạn dùng GitHub OAuth, bạn cần cập nhật trong GitHub OAuth App:

1. Vào [GitHub OAuth Apps](https://github.com/settings/developers)
2. Chọn OAuth App của bạn
3. Cập nhật **Homepage URL**:
   - Thêm: `https://your-app-name.netlify.app`
   - Bạn có thể giữ cả `http://localhost:3000` nếu vẫn cần development

**Lưu ý**: Authorization callback URL trong GitHub OAuth App vẫn giữ nguyên:
```
https://[project-id].supabase.co/auth/v1/callback
```
(Không cần thay đổi phần này)

## 🔄 Cập nhật Google OAuth (nếu dùng Google OAuth)

Nếu bạn dùng Google OAuth, bạn cần cập nhật trong Google Cloud Console:

1. Vào [Google Cloud Console](https://console.cloud.google.com/)
2. Vào **APIs & Services** > **Credentials**
3. Chọn OAuth client ID của bạn
4. Cập nhật **Authorized JavaScript origins**:
   - Thêm: `https://your-app-name.netlify.app`
   - Giữ: `http://localhost:3000` (cho development)

**Lưu ý**: **Authorized redirect URIs** trong Google Cloud Console vẫn giữ nguyên:
```
https://[project-id].supabase.co/auth/v1/callback
```
(Không cần thay đổi phần này)

## ✅ Kiểm tra sau khi cấu hình

1. Deploy lại trên Netlify (nếu cần)
2. Mở URL Netlify của bạn
3. Thử đăng nhập với OAuth (GitHub/Google)
4. Sau khi đăng nhập thành công, bạn sẽ được redirect về URL Netlify, không phải localhost

## 🆘 Troubleshooting

### Vẫn redirect về localhost

- ✅ Kiểm tra lại đã thêm đúng URL vào Supabase chưa (bao gồm `/auth/callback` ở cuối)
- ✅ Đảm bảo đã click "Save" sau khi thêm URL
- ✅ Thử clear cache và đăng nhập lại
- ✅ Kiểm tra browser console để xem có lỗi gì không

### Lỗi "redirect_uri_mismatch"

- ✅ Kiểm tra URL trong Supabase có khớp chính xác với URL Netlify không
- ✅ Đảm bảo format: `https://your-app-name.netlify.app/auth/callback` (không có dấu `/` ở cuối nếu không có trong cấu hình)

### Lỗi "Invalid redirect URL"

- ✅ Kiểm tra đã thêm URL vào Supabase Redirect URLs chưa
- ✅ Đảm bảo URL có protocol (`https://`) đầy đủ
- ✅ Đảm bảo URL có đầy đủ path `/auth/callback`

## 📌 Tóm tắt nhanh

**Điều quan trọng nhất**: Thêm URL Netlify vào **Supabase Dashboard** > **Authentication** > **URL Configuration** > **Redirect URLs**:

```
https://your-app-name.netlify.app/auth/callback
```

Đây là bước **BẮT BUỘC** để OAuth redirect về đúng URL sau khi deploy!

