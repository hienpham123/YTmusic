# 🔐 Hướng dẫn Setup Google OAuth với Supabase

## Bước 1: Tạo Google OAuth Credentials

1. Vào [Google Cloud Console](https://console.cloud.google.com/)
2. Chọn project của bạn (hoặc tạo project mới)
3. Vào **APIs & Services** > **Credentials**
4. Click **"+ CREATE CREDENTIALS"** > **"OAuth client ID"**
5. Nếu chưa có, bạn sẽ cần cấu hình **OAuth consent screen** trước:
   - Chọn **User Type** (External cho development, Internal cho Google Workspace)
   - Điền thông tin app:
     - **App name**: `YT Music Hub` (hoặc tên bạn muốn)
     - **User support email**: Email của bạn
     - **Developer contact information**: Email của bạn
   - Click **"Save and Continue"** (có thể bỏ qua scopes và test users)
6. Quay lại **Credentials** > **"+ CREATE CREDENTIALS"** > **"OAuth client ID"**
7. Chọn **Application type**: **Web application**
8. Điền thông tin:
   - **Name**: `YT Music Hub` (hoặc tên bạn muốn)
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000` (cho development)
     - `https://your-domain.com` (cho production, nếu có)
   - **Authorized redirect URIs**: 
     - `https://xlajiamfriypsmrgkpze.supabase.co/auth/v1/callback`
     - ⚠️ **Quan trọng**: Thay `xlajiamfriypsmrgkpze` bằng project ID của bạn từ Supabase URL
9. Click **"Create"**
10. Một popup sẽ xuất hiện hiển thị **Client ID**
    - Popup này chỉ hiển thị **Client ID**, không hiển thị **Client Secret**
    - Để lấy **Client Secret**, bạn có 2 cách:
    
    **Cách 1: Tải file JSON (Khuyên dùng)**
    - Click **"Télécharger au format JSON"** (hoặc "Download in JSON format") trong popup
    - File JSON sẽ chứa cả `client_id` và `client_secret`
    - Mở file JSON và copy giá trị `client_secret`
    
    **Cách 2: Lấy từ trang chi tiết**
    - Click **"OK"** để đóng popup
    - Vào **APIs & Services** > **Credentials**
    - Click vào OAuth Client ID vừa tạo
    - Trong trang chi tiết, tìm phần **Client Secret**
    - Click icon mắt (👁️) hoặc nút "Show" để hiển thị Client Secret
    - Nếu không thấy, click **"RESET SECRET"** để tạo mới
    - ⚠️ Khi reset, Client Secret cũ sẽ không còn dùng được nữa
    
    - ⚠️ **Quan trọng**: Lưu lại Client Secret ngay vì đây là thông tin bảo mật, mất thì phải reset lại

**Nếu bạn đã tạo OAuth Client nhưng không có Client Secret:**
1. Vào **APIs & Services** > **Credentials**
2. Tìm và click vào OAuth Client ID của bạn (trong danh sách)
3. Trong trang chi tiết, bạn sẽ thấy:
   - **Client ID**: Đã có sẵn
   - **Client Secret**: Nếu thấy dấu "👁️" (eye icon) hoặc "Show", click vào để hiển thị
   - Nếu không thấy Client Secret, click nút **"RESET SECRET"** ở góc phải trên
   - ⚠️ Khi reset, Client Secret cũ sẽ không còn dùng được nữa, bạn phải cập nhật lại trong Supabase
4. Copy **Client Secret** và lưu lại an toàn

## Bước 2: Enable Google Provider trong Supabase

1. Vào Supabase Dashboard
2. **Authentication** > **Providers**
3. Tìm **"Google"** và click vào
4. Bật toggle **"Enable Google provider"**
5. Điền thông tin:
   - **Client ID (for OAuth)**: Paste Client ID từ Google Cloud Console
   - **Client Secret (for OAuth)**: Paste Client Secret từ Google Cloud Console
6. Click **"Save"**

## Bước 3: Cấu hình Redirect URL

1. Vào **Authentication** > **URL Configuration**
2. Đảm bảo đã có trong **Redirect URLs**:
   - `http://localhost:3000/auth/callback` (cho development)
   - `https://your-domain.com/auth/callback` (cho production)
3. Click **"Save"**

## Bước 4: Test

1. Khởi động lại dev server:
   ```bash
   npm run dev
   ```

2. Click nút **"Đăng nhập với Gmail"** trong modal
3. Sẽ redirect đến Google để authorize
4. Sau khi authorize, sẽ redirect về app và tự động đăng nhập

## ⚠️ Lưu ý

- **Authorized redirect URIs** trong Google Cloud Console phải khớp chính xác với Supabase callback URL
- Format callback URL: `https://[project-id].supabase.co/auth/v1/callback`
- **Client Secret** phải được giữ bí mật, không commit lên Git
- Nếu deploy lên production, cần update redirect URIs trong Google Cloud Console
- Google OAuth consent screen có thể cần verification nếu app ở chế độ production và có nhiều người dùng

## 🆘 Troubleshooting

### Lỗi "redirect_uri_mismatch"
- Kiểm tra redirect URI trong Google Cloud Console có khớp với Supabase callback URL không
- Đảm bảo format: `https://[project-id].supabase.co/auth/v1/callback`
- Đảm bảo đã thêm đúng URI vào **Authorized redirect URIs** (không phải JavaScript origins)

### Lỗi "Invalid client"
- Kiểm tra Client ID và Client Secret đã đúng chưa
- Đảm bảo đã enable Google provider trong Supabase
- Đảm bảo đã cấu hình OAuth consent screen

### Lỗi "Access blocked: This app's request is invalid"
- Đảm bảo đã cấu hình OAuth consent screen
- Nếu ở chế độ testing, đảm bảo đã thêm email test user vào OAuth consent screen

### Không redirect về app
- Kiểm tra redirect URL trong Supabase Settings
- Đảm bảo đã tạo route `/auth/callback` (đã có sẵn trong code)
- Kiểm tra browser console để xem có lỗi gì không

