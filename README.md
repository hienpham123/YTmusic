# 🎧 YT Music Hub – Notion for Music

Một website nghe nhạc **tìm kiếm và phát nhạc từ YouTube**. Không download, không lách luật, tập trung vào **trải nghiệm lưu trữ – sắp xếp – nghe nhạc như Notion**.

## ✨ Tính năng

- 🎵 **Tìm kiếm YouTube**: Tìm kiếm và phát nhạc trực tiếp từ YouTube
- 🎨 **Metadata tự động**: Tự động lấy title, thumbnail, duration từ YouTube
- 🎭 **Mood Detection**: Tự động gợi ý mood (Chill, Sad, Night, Focus)
- 📝 **Playlist cá nhân**: Tạo và quản lý playlist của riêng bạn
- 🎮 **Mini Player**: Player cố định dưới màn hình, không làm gián đoạn trải nghiệm
- 🌙 **Dark Mode**: Giao diện tối mặc định, dễ nhìn

## 🚀 Bắt đầu

### Yêu cầu

- Node.js 18+ 
- npm hoặc yarn
- YouTube Data API v3 Key (miễn phí từ Google Cloud Console)

### Cài đặt

1. **Clone repository**
```bash
git clone <your-repo-url>
cd music-player
```

2. **Cài đặt dependencies**
```bash
npm install
```

3. **Cấu hình environment variables**

Tạo file `.env.local`:
```env
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

Lấy YouTube API Key:
1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Enable YouTube Data API v3
4. Tạo API Key trong Credentials
5. Copy API Key vào `.env.local`

4. **Chạy development server**
```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trong browser.

## 📁 Cấu trúc dự án

```
src/
├── app/
│   ├── api/          # API routes
│   ├── layout.tsx    # Root layout
│   └── page.tsx      # Home page
├── components/
│   ├── ui/           # shadcn/ui components
│   └── music/        # Music-related components
├── hooks/            # Custom React hooks
├── lib/              # Utility functions
└── types/            # TypeScript types
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: TailwindCSS, shadcn/ui
- **Animation**: Framer Motion
- **Player**: YouTube IFrame API
- **API**: YouTube Data API v3

## 📝 Sử dụng

1. **Tìm kiếm YouTube**: Gõ từ khóa vào ô tìm kiếm để tìm video YouTube
2. **Nghe ngay**: Click "Phát" để nghe ngay
3. **Thêm vào playlist**: Click nút "+" để thêm vào playlist
4. **Quản lý playlist**: Xem danh sách phát ở sidebar, click để phát

## 🔒 Tuân thủ YouTube ToS

- ✅ Không download video/audio
- ✅ Không tách audio
- ✅ Chỉ sử dụng YouTube IFrame Embed API
- ✅ Tuân thủ đầy đủ Terms of Service của YouTube

## 🎯 Roadmap

- [ ] Google OAuth authentication
- [ ] Lưu playlist vào database
- [ ] Share playlist
- [ ] Nghe cùng nhau (collaborative listening)
- [ ] Hotkey support
- [ ] History tracking
- [ ] Gợi ý theo thời điểm

## 📄 License

MIT

## 🙏 Credits

- Design inspired by Notion
- Built with Next.js and shadcn/ui
