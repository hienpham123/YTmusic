# 🔐 Hướng dẫn Setup GitHub OAuth với Supabase

## Bước 1: Tạo GitHub OAuth App

1. Vào https://github.com/settings/developers
2. Click **"New OAuth App"** (hoặc **"OAuth Apps"** > **"New OAuth App"**)
3. Điền thông tin:
   - **Application name**: `YT Music Hub` (hoặc tên bạn muốn)
   - **Homepage URL**: `http://localhost:3000` (cho development)
   - **Authorization callback URL**: `https://xlajiamfriypsmrgkpze.supabase.co/auth/v1/callback`
     - ⚠️ **Quan trọng**: Thay `xlajiamfriypsmrgkpze` bằng project ID của bạn từ Supabase URL
4. Click **"Register application"**
5. Copy **Client ID** và **Client Secret** (sẽ cần dùng ở bước sau)

## Bước 2: Enable GitHub Provider trong Supabase

1. Vào Supabase Dashboard
2. **Authentication** > **Providers**
3. Tìm **"GitHub"** và click vào
4. Bật toggle **"Enable GitHub provider"**
5. Điền thông tin:
   - **Client ID**: Paste Client ID từ GitHub
   - **Client Secret**: Paste Client Secret từ GitHub
6. Click **"Save"**

## Bước 3: Cấu hình Redirect URL

1. Vào **Authentication** > **URL Configuration**
2. Thêm vào **Redirect URLs**:
   - `http://localhost:3000/auth/callback` (cho development)
   - `https://your-domain.com/auth/callback` (cho production)
3. Click **"Save"**

## Bước 4: Test

1. Khởi động lại dev server:
   ```bash
   npm run dev
   ```

2. Click nút **"Đăng nhập với GitHub"** trong modal
3. Sẽ redirect đến GitHub để authorize
4. Sau khi authorize, sẽ redirect về app và tự động đăng nhập

## ⚠️ Lưu ý

- **Callback URL** phải khớp chính xác với URL trong Supabase
- **Client Secret** phải được giữ bí mật, không commit lên Git
- Nếu deploy lên production, cần update callback URL trong GitHub OAuth App

## 🆘 Troubleshooting

### Lỗi "redirect_uri_mismatch"
- Kiểm tra callback URL trong GitHub OAuth App có khớp với Supabase không
- Đảm bảo format: `https://[project-id].supabase.co/auth/v1/callback`

### Lỗi "Invalid client"
- Kiểm tra Client ID và Client Secret đã đúng chưa
- Đảm bảo đã enable GitHub provider trong Supabase

### Không redirect về app
- Kiểm tra redirect URL trong Supabase Settings
- Đảm bảo đã tạo route `/auth/callback` (đã có sẵn trong code)

