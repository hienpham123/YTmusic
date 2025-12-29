# 📋 Các Case Phát Nhạc - Logic Playback

Tài liệu này mô tả chi tiết tất cả các trường hợp (case) khi phát nhạc trong ứng dụng.

## 🎵 Các Trạng Thái

- **Queue (Hàng đợi)**: Danh sách bài hát được thêm vào hàng đợi
- **Source Playlist**: Playlist gốc chứa bài hát đang phát (ví dụ: playlist từ library, search results, etc.)
- **currentIndex**: Vị trí hiện tại trong queue (-1 nếu không phát từ queue)
- **sourceIndex**: Vị trí hiện tại trong source playlist (-1 nếu không có source playlist)
- **Repeat Mode**: `off` | `one` | `all`
- **Shuffle**: Bật/tắt trộn bài

---

## 🔄 Case 1: Khi Video Kết Thúc (handleVideoEnd)

### 1.1. Repeat Mode = "one"

**Điều kiện**: `repeatMode === "one"`

**Hành động**:

- Lặp lại bài hát hiện tại
- Load lại video từ đầu (time = 0)
- Tự động phát

---

### 1.2. Đang Phát Từ Queue (Priority 1)

**Điều kiện**: `currentIndex >= 0 && currentIndex < playlist.length`

#### 1.2.1. Queue Còn Bài Sau Khi Remove Bài Hiện Tại

**Điều kiện**: `!isLastInQueue && newPlaylist.length > 0`

**Hành động**:

- Xóa bài hiện tại khỏi queue
- Phát bài tiếp theo trong queue (cùng index, nhưng là bài khác)
- Clear source playlist (`setSourcePlaylist([])`, `setSourceIndex(-1)`)

#### 1.2.2. Queue Rỗng Sau Khi Remove, Có Source Playlist

**Điều kiện**: Queue rỗng sau khi remove + `sourcePlaylist.length > 0`

**Hành động**:

- Xóa bài hiện tại khỏi queue
- Chuyển sang source playlist:
  - Nếu `sourceIndex >= 0 && sourceIndex < sourcePlaylist.length - 1`: Phát bài tiếp theo trong source playlist
  - Nếu `sourceIndex < 0`: Phát từ đầu source playlist (index 0)
  - Nếu `sourceIndex >= sourcePlaylist.length - 1`: Phát từ đầu source playlist
- Set `currentIndex = -1` (không còn phát từ queue)

#### 1.2.3. Queue Rỗng, Không Có Source Playlist

**Điều kiện**: Queue rỗng + `sourcePlaylist.length === 0`

**Hành động**:

- Dừng phát (`setIsPlaying(false)`)

---

### 1.3. Queue Có Bài Nhưng Không Phát Từ Queue (Priority 2)

**Điều kiện**: `playlist.length > 0 && (currentIndex < 0 || currentIndex >= playlist.length)`

**Hành động**:

- Phát bài đầu tiên trong queue (index 0)
- Clear source playlist
- Set `currentIndex = 0`

---

### 1.4. Queue Rỗng, Đang Phát Từ Source Playlist (Priority 3)

**Điều kiện**: `playlist.length === 0 && currentIndex < 0 && sourcePlaylist.length > 0`

#### 1.4.1. Có Source Index và Chưa Hết Playlist

**Điều kiện**: `sourceIndex >= 0 && sourceIndex < sourcePlaylist.length - 1`

**Hành động**:

- Phát bài tiếp theo trong source playlist (`sourceIndex + 1`)

#### 1.4.2. Không Có Source Index

**Điều kiện**: `sourceIndex < 0`

**Hành động**:

- Phát từ đầu source playlist (index 0)

---

### 1.5. Repeat Mode = "all"

**Điều kiện**: `repeatMode === "all"` (sau khi check các priority trên)

#### 1.5.1. Queue Có Bài

**Điều kiện**: `playlist.length > 0`

**Hành động**:

- Lặp lại từ đầu queue (index 0)
- Clear source playlist

#### 1.5.2. Queue Rỗng, Có Source Playlist

**Điều kiện**: `playlist.length === 0 && sourcePlaylist.length > 0`

**Hành động**:

- Lặp lại từ đầu source playlist (index 0)

---

### 1.6. Không Còn Bài Nào

**Điều kiện**: Tất cả các case trên không match

**Hành động**:

- Dừng phát (`setIsPlaying(false)`)

---

## ⏭️ Case 2: Next Button (next)

### 2.1. Repeat Mode = "one"

**Hành động**: Lặp lại bài hiện tại

---

### 2.2. Priority 1: Queue Có Bài

**Điều kiện**: `playlist.length > 0`

#### 2.2.1. Đang Phát Từ Queue, Chưa Hết

**Điều kiện**: `currentIndex >= 0 && currentIndex < playlist.length - 1`

**Hành động**:

- Phát bài tiếp theo trong queue (`currentIndex + 1`)
- Clear source playlist

#### 2.2.2. Không Phát Từ Queue Hoặc Đã Hết Queue

**Điều kiện**: `currentIndex < 0 || currentIndex >= playlist.length`

**Hành động**:

- Phát từ đầu queue (index 0)
- Clear source playlist

---

### 2.3. Priority 2: Queue Rỗng, Có Source Playlist

**Điều kiện**: `playlist.length === 0 && sourcePlaylist.length > 0`

#### 2.3.1. Có Source Index và Chưa Hết

**Điều kiện**: `sourceIndex >= 0 && sourceIndex < sourcePlaylist.length - 1`

**Hành động**:

- Phát bài tiếp theo trong source playlist (`sourceIndex + 1`)

---

### 2.4. Repeat Mode = "all"

**Điều kiện**: `repeatMode === "all"` (sau khi check queue)

#### 2.4.1. Queue Có Bài

**Hành động**: Lặp lại từ đầu queue

#### 2.4.2. Queue Rỗng, Có Source Playlist

**Hành động**: Lặp lại từ đầu source playlist

---

## ⏮️ Case 3: Previous Button (previous)

### 3.1. Repeat Mode = "one"

**Hành động**: Lặp lại bài hiện tại

---

### 3.2. Priority 1: Đang Phát Từ Queue, Chưa Đến Đầu

**Điều kiện**: `playlist.length > 0 && currentIndex > 0`

**Hành động**:

- Phát bài trước đó trong queue (`currentIndex - 1`)

---

### 3.3. Priority 2: Ở Đầu Queue Hoặc Không Phát Từ Queue, Có Source Playlist

**Điều kiện**: `sourcePlaylist.length > 0 && sourceIndex > 0`

**Hành động**:

- Phát bài trước đó trong source playlist (`sourceIndex - 1`)

---

### 3.4. Repeat Mode = "all"

**Điều kiện**: `repeatMode === "all"`

#### 3.4.1. Queue Có Bài

**Hành động**: Nhảy đến bài cuối cùng trong queue

#### 3.4.2. Queue Rỗng, Có Source Playlist

**Hành động**: Nhảy đến bài cuối cùng trong source playlist

---

## 🎲 Case 4: Shuffle (Trộn Bài)

### 4.1. Bật Shuffle (isShuffled = false → true)

**Điều kiện**: `!isShuffled && playlist.length > 0`

**Hành động**:

- Lưu thứ tự gốc vào `originalPlaylist`
- Trộn ngẫu nhiên queue
- Tìm lại vị trí bài hiện tại trong queue đã trộn
- Set `isShuffled = true`

---

### 4.2. Tắt Shuffle (isShuffled = true → false)

**Điều kiện**: `isShuffled === true`

**Hành động**:

- Khôi phục thứ tự gốc từ `originalPlaylist`
- Tìm lại vị trí bài hiện tại trong queue gốc
- Set `isShuffled = false`

---

## 🎯 Case 5: Play Track (playTrack)

**Hành động**:

- Tìm bài trong queue:
  - Nếu có: Set `currentIndex` = vị trí trong queue
  - Nếu không: Set `currentIndex` = `playlist.length` (sẽ được thêm vào queue)
- Load và phát video

**Lưu ý**: `playTrack` sẽ thêm bài vào queue nếu chưa có

---

## 🎯 Case 6: Play Track Only (playTrackOnly)

**Hành động**:

- Kiểm tra bài có trong queue không:
  - **Có trong queue**: Ưu tiên queue, set `currentIndex` = vị trí trong queue, clear source playlist
  - **Không trong queue**:
    - Nếu có `sourcePlaylistTracks`: Set source playlist và tìm index
    - Nếu không: Clear source playlist
    - Set `currentIndex = -1` (không phát từ queue)
- Load và phát video

**Lưu ý**: `playTrackOnly` không thêm bài vào queue, chỉ phát trực tiếp

---

## ➕ Case 7: Add To Queue (addToPlaylist)

**Điều kiện**: Bài chưa có trong queue

**Hành động**:

- Thêm bài vào cuối queue
- Không tự động phát

---

## ➖ Case 8: Remove From Queue (removeFromPlaylist)

**Hành động**:

- Xóa bài khỏi queue theo `trackId`
- Nếu bài đang phát bị xóa, logic sẽ được xử lý trong `handleVideoEnd`

---

## 🔁 Case 9: Repeat Mode Toggle

### 9.1. Off → All

**Hành động**: Set `repeatMode = "all"`

### 9.2. All → One

**Hành động**: Set `repeatMode = "one"`

### 9.3. One → Off

**Hành động**: Set `repeatMode = "off"`

---

## 📊 Tóm Tắt Priority Khi Video Kết Thúc

1. **Priority 1**: Đang phát từ queue → Xóa bài hiện tại, tiếp tục queue hoặc chuyển sang source playlist
2. **Priority 2**: Queue có bài nhưng không phát từ queue → Phát từ đầu queue
3. **Priority 3**: Queue rỗng, đang phát từ source playlist → Tiếp tục source playlist
4. **Repeat Mode**: Nếu bật "all", lặp lại từ đầu queue hoặc source playlist
5. **Dừng**: Nếu không còn bài nào

---

## 📊 Tóm Tắt Priority Khi Next

1. **Priority 1**: Queue có bài → Ưu tiên queue
2. **Priority 2**: Queue rỗng, có source playlist → Tiếp tục source playlist
3. **Repeat Mode**: Nếu bật "all", lặp lại

---

## ⚠️ Lưu Ý Quan Trọng

1. **Queue luôn được ưu tiên** khi có bài
2. **Khi queue rỗng**, tự động chuyển sang source playlist
3. **Khi phát từ queue**, bài sẽ bị xóa khỏi queue sau khi phát xong
4. **playTrackOnly** ưu tiên queue nếu bài đã có trong queue
5. **Shuffle chỉ áp dụng cho queue**, không shuffle source playlist
