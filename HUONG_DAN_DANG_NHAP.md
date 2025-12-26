# 🔐 Hướng dẫn Đăng nhập/Đăng ký

## Cách sử dụng

### 1. Đăng ký tài khoản mới

1. Click nút **"Đăng nhập"** ở góc trên bên phải
2. Click **"Chưa có tài khoản? Đăng ký"**
3. Nhập:
   - **Email**: Email của bạn
   - **Mật khẩu**: Tối thiểu 6 ký tự
4. Click **"Đăng ký"**
5. Kiểm tra email để xác nhận tài khoản (nếu Supabase yêu cầu)

### 2. Đăng nhập

1. Click nút **"Đăng nhập"** ở góc trên bên phải
2. Nhập email và mật khẩu
3. Click **"Đăng nhập"**

### 3. Sau khi đăng nhập

- ✅ Playlists sẽ tự động load từ Supabase
- ✅ Khi thêm bài hát, sẽ tự động lưu vào Supabase
- ✅ Dữ liệu được đồng bộ giữa các thiết bị

## ⚙️ Cấu hình Supabase Auth

### Bước 1: Enable Email Auth trong Supabase

1. Vào Supabase Dashboard
2. **Authentication** > **Providers**
3. Tìm **Email** và bật nó lên
4. (Tùy chọn) Cấu hình:
   - **Confirm email**: Bật nếu muốn yêu cầu xác nhận email
   - **Secure email change**: Bật để bảo mật hơn

### Bước 2: Cấu hình Email Templates (Tùy chọn)

1. **Authentication** > **Email Templates**
2. Tùy chỉnh email xác nhận, reset password, etc.

### Bước 3: Test

1. Đăng ký tài khoản mới
2. Kiểm tra email (hoặc Supabase Dashboard > Authentication > Users)
3. Đăng nhập và test thêm bài hát

## 🔒 Bảo mật

- Mật khẩu được hash bằng Supabase (bcrypt)
- Session được quản lý tự động
- RLS (Row Level Security) đảm bảo user chỉ thấy data của mình

## 🆘 Xử lý lỗi

### "Email hoặc mật khẩu không đúng"
- Kiểm tra lại email và mật khẩu
- Thử reset password nếu quên

### "Vui lòng xác nhận email"
- Kiểm tra hộp thư email (cả spam)
- Hoặc tắt "Confirm email" trong Supabase Settings

### "Supabase is not configured"
- Kiểm tra `.env.local` có đầy đủ keys
- Khởi động lại dev server sau khi thêm keys

## 📝 Lưu ý

- **Guest mode**: Nếu chưa đăng nhập, dữ liệu chỉ lưu tạm thời (mất khi refresh)
- **Đăng nhập**: Dữ liệu được lưu vĩnh viễn trong Supabase
- **Đăng xuất**: Click nút "Đăng xuất" ở header

