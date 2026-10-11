# App Giáo Dục - Hệ Sinh Thái Học Thuật & Trực Quan Hóa Hóa Học 12 (GDPT 2018)

> Ứng dụng tích hợp Trợ lý Trí tuệ Nhân tạo Gemini 3, phân tích sách giáo khoa đa bộ sách (Kết nối tri thức, Cánh Diều, Chân trời sáng tạo), thiết kế kế hoạch bài dạy chuẩn Công văn 5512/BGDĐT, mô phỏng 3D phân tử và tương tác lớp học thời gian thực.

---

## 🌟 Tính Năng Nổi Bật

1. **Phân Tích Sách Giáo Khoa (SGK) Thông Minh:**
   - Hỗ trợ tải tệp (.txt, .md, .docx), dán văn bản hoặc đính kèm ảnh chụp trang SGK.
   - Trích xuất tự động: Yêu cầu cần đạt (YCCĐ), Đồ thị tri thức, Bẫy tư duy & quan niệm sai lầm (misconceptions).
   - Xuất Kế hoạch bài dạy chuẩn CV 5512 và Bộ câu hỏi 4 mức độ (Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao).

2. **Cơ Chế AI Fallback Siêu Tin Cậy (Multi-Model Resilience):**
   - Model mặc định: `gemini-3-flash-preview` / `gemini-3-pro-preview` / `gemini-2.5-flash`.
   - Tự động chuyển đổi sang model tiếp theo nếu gặp quá tải (429 RESOURCE_EXHAUSTED).
   - Bảo toàn tiến trình các bước trước đó, không làm gián đoạn trải nghiệm người dùng.

3. **Cơ Chế Nhập API Key Trực Tiếp (Client-Side Autonomy):**
   - Người dùng tự nhập API Key cá nhân từ [Google AI Studio](https://aistudio.google.com/api-keys).
   - Lưu trữ bảo mật tại `localStorage` trình duyệt, không thông qua server trung gian.
   - Nút **Settings (API Key)** với dòng chữ màu đỏ *"Lấy API key để sử dụng app"* luôn hiển thị trên Header giúp người dùng đổi key tức thì khi hết quota.

4. **Thư Viện Phân Tử 3D & Đấu Trường Lớp Học:**
   - Trực quan hóa mô hình phân tử 3D (Ball-and-stick, Space-filling).
   - Đấu trường câu hỏi trắc nghiệm, xếp hạng học sinh thời gian thực.

---

## 🚀 Hướng Dẫn Triển Khai Lên Vercel Từ GitHub

### Bước 1: Đẩy mã nguồn lên kho lưu trữ GitHub của bạn
1. Nếu bạn đang sử dụng Git trên máy tính:
   ```bash
   git init
   git add .
   git commit -m "Deploy App Giao Duc to Vercel"
   git branch -M main
   git remote add origin https://github.com/<tai-khoan-cua-ban>/<ten-repo>.git
   git push -u origin main
   ```
2. Hoặc tải trực tiếp mã nguồn lên GitHub thông qua giao diện web hoặc GitHub Desktop.

### Bước 2: Nhập dự án vào Vercel (Import Project)
1. Truy cập [vercel.com](https://vercel.com) và đăng nhập bằng tài khoản GitHub của bạn.
2. Tại bảng điều khiển Vercel, chọn **Add New...** $\rightarrow$ **Project**.
3. Chọn kho lưu trữ GitHub chứa mã nguồn ứng dụng này và bấm **Import**.

### Bước 3: Cấu hình cài đặt Build & Biến môi trường
- **Framework Preset**: Chọn `Vite` (Vercel sẽ tự động nhận diện).
- **Root Directory**: `./` (để mặc định).
- **Build Command**: `vite build` (hoặc `npm run build`).
- **Output Directory**: `dist`.
- **Install Command**: `npm install`.

*(Tùy chọn)* Nếu muốn cấp một API Key dùng chung cho người dùng khi họ chưa tự nhập key:
- Tại mục **Environment Variables**, thêm:
  - **Key**: `VITE_GEMINI_API_KEY`
  - **Value**: `<Mã Gemini API Key của bạn>`

### Bước 4: Nhấn "Deploy"
- Vercel sẽ tự động tiến hành build và xuất bản trang web trong khoảng 1 phút.
- Sau khi hoàn tất, bạn sẽ nhận được đường dẫn dạng: `https://<ten-project>.vercel.app`.

---

## 🛠️ Cấu Hình SPA Routing (`vercel.json`)

Dự án đã được tích hợp sẵn file `vercel.json` ở thư mục gốc để đảm bảo định tuyến Single Page Application (SPA) hoạt động mượt mà khi người dùng tải lại trang (F5) hoặc truy cập các đường dẫn con:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 🔑 Hướng Dẫn Lấy & Nhập Google Gemini API Key

1. **Lấy API Key:**
   - Truy cập: [https://aistudio.google.com/api-keys](https://aistudio.google.com/api-keys)
   - Đăng nhập tài khoản Google và nhấn **Create API key** (Tạo khóa API).
   - Sao chép khóa bí mật (dạng `AIzaSy...`).

2. **Sử dụng trên ứng dụng:**
   - Mở website App Giáo Dục đã triển khai.
   - Khi vào lần đầu, hộp thoại cài đặt sẽ tự động bật lên.
   - Dán khóa API vào ô **Google Gemini API Key** và nhấn **Kiểm tra kết nối**.
   - Nhấn **Lưu Thiết Lập** để bắt đầu sử dụng đầy đủ các tính năng sinh giáo án, phân tích SGK và hỏi đáp trợ lý AI.
   - Bạn có thể bấm vào nút **Settings (API Key)** trên Header bất kỳ lúc nào để đổi sang key mới nếu hết hạn ngạch (quota).

---

## 💻 Chạy Ứng Dụng Ở Môi Trường Local (Máy Tính Cá Nhân)

Yêu cầu máy tính có cài đặt [Node.js](https://nodejs.org/):

```bash
# 1. Cài đặt các gói phụ thuộc
npm install

# 2. Khởi chạy máy chủ phát triển
npm run dev

# 3. Mở trình duyệt tại địa chỉ http://localhost:5173
```
