# 🔑 Hướng dẫn lấy YouTube API Key

## Bước 1: Truy cập Google Cloud Console

1. Mở trình duyệt và truy cập: https://console.cloud.google.com/
2. Đăng nhập bằng tài khoản Google của bạn

## Bước 2: Tạo hoặc chọn Project

1. Ở góc trên cùng bên trái, click vào dropdown project
2. Click **"New Project"** để tạo project mới (hoặc chọn project có sẵn)
3. Đặt tên project (ví dụ: "YT Music Hub")
4. Click **"Create"**

## Bước 3: Kích hoạt YouTube Data API v3

1. Vào menu **"APIs & Services"** > **"Library"** (hoặc **"API et services"** > **"Bibliothèque"**)
2. Tìm kiếm: **"YouTube Data API v3"**
3. Click vào kết quả tìm thấy
4. Click nút **"Enable"** (hoặc **"Activer"**)

> 💡 Nếu bạn đã kích hoạt rồi (như trong hình), có thể bỏ qua bước này.

## Bước 4: Tạo API Key

1. Vào menu **"APIs & Services"** > **"Credentials"** (hoặc **"Identifiants"**)
2. Click nút **"+ CREATE CREDENTIALS"** (hoặc **"+ CRÉER DES IDENTIFIANTS"**)
3. Chọn **"API key"**

## Bước 5: Copy API Key

1. Một popup sẽ hiện ra với API key của bạn
2. **Copy** API key này (dạng: `AIzaSy...`)
3. ⚠️ **Quan trọng**: Click **"Restrict key"** để bảo mật API key

### Bảo mật API Key (Khuyến nghị):

1. Trong phần **"API restrictions"**, chọn **"Restrict key"**
2. Chọn **"YouTube Data API v3"** trong danh sách
3. Click **"Save"**

## Bước 6: Thêm vào dự án

1. Tạo file `.env.local` trong thư mục gốc của dự án (nếu chưa có)
2. Thêm dòng sau:

```env
NEXT_PUBLIC_YOUTUBE_API_KEY=AIzaSy... (paste API key của bạn vào đây)
```

3. Lưu file

## Bước 7: Khởi động lại dev server

```bash
# Dừng server hiện tại (Ctrl + C)
# Chạy lại
npm run dev
```

## ✅ Kiểm tra

1. Mở http://localhost:3000
2. Dán một link YouTube vào input
3. Nếu thấy thông tin video hiện ra → API key hoạt động! 🎉

## ⚠️ Lưu ý

- **Miễn phí**: YouTube Data API v3 có quota miễn phí hàng ngày (10,000 units/ngày)
- **Bảo mật**: Không commit file `.env.local` lên Git (đã có trong .gitignore)
- **Giới hạn**: Nếu vượt quota, bạn sẽ cần đợi đến ngày hôm sau hoặc nâng cấp

## 🆘 Gặp lỗi?

### Lỗi: "API key not valid"
- Kiểm tra lại API key đã copy đúng chưa
- Đảm bảo đã kích hoạt YouTube Data API v3
- Kiểm tra API key restrictions

### Lỗi: "Quota exceeded"
- Bạn đã dùng hết quota miễn phí trong ngày
- Đợi đến ngày hôm sau hoặc tạo project mới

### Lỗi: "Video not found"
- Link YouTube không hợp lệ
- Video đã bị xóa hoặc private

