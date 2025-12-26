# 🔧 Troubleshooting - Không đăng nhập được

## Lỗi "Failed to fetch"

### Nguyên nhân:
1. **Supabase chưa được cấu hình** - Thiếu URL hoặc API Key
2. **Network error** - Không kết nối được đến Supabase
3. **CORS issue** - Browser chặn request

### Cách khắc phục:

#### Bước 1: Kiểm tra .env.local

Mở file `.env.local` và đảm bảo có đầy đủ:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Lưu ý:**
- URL phải bắt đầu với `https://`
- Không có khoảng trắng thừa
- Không có dấu ngoặc kép

#### Bước 2: Kiểm tra Console

Mở Browser Console (F12) và xem:
- Có log "✅ Supabase client initialized" không?
- Có log "⚠️ Supabase URL and Anon Key are not configured" không?

#### Bước 3: Khởi động lại server

Sau khi thêm/sửa `.env.local`:
```bash
# Dừng server (Ctrl + C)
npm run dev
```

#### Bước 4: Kiểm tra Supabase Dashboard

1. Vào Supabase Dashboard
2. **Authentication** > **Providers** > **Email**
3. Đảm bảo Email provider đã được **Enable**
4. (Tùy chọn) Tắt **"Confirm email"** để đăng nhập ngay không cần xác nhận

#### Bước 5: Kiểm tra Network Tab

1. Mở DevTools (F12)
2. Vào tab **Network**
3. Thử đăng nhập
4. Xem request `token?grant_type=password`:
   - Nếu **200** → Thành công
   - Nếu **401** → Sai email/password
   - Nếu **Failed** → Supabase chưa config hoặc network error

## Lỗi "Email not confirmed"

### Nguyên nhân:
"Confirm email" đang bật trong Supabase Settings

### Cách khắc phục:

**Option 1: Tắt Confirm Email (Khuyến nghị cho development)**
1. Vào Supabase Dashboard
2. **Authentication** > **Sign In / Providers**
3. Tắt toggle **"Confirm email"**
4. Click **"Save changes"**

**Option 2: Xác nhận email**
1. Kiểm tra email (cả spam folder)
2. Click link xác nhận trong email
3. Thử đăng nhập lại

## Lỗi "Invalid login credentials"

### Nguyên nhân:
- Email hoặc password sai
- User chưa được tạo

### Cách khắc phục:
1. Thử đăng ký tài khoản mới
2. Hoặc kiểm tra lại email/password

## Lỗi "Supabase chưa được cấu hình"

### Nguyên nhân:
`.env.local` thiếu hoặc sai format

### Cách khắc phục:
1. Tạo file `.env.local` trong thư mục gốc
2. Copy từ `.env.example` (nếu có)
3. Thêm đầy đủ keys
4. Khởi động lại server

## Test nhanh

Mở Browser Console và chạy:
```javascript
// Kiểm tra Supabase config
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '***' : 'MISSING');
```

Nếu thấy `undefined` → Supabase chưa được config đúng.

