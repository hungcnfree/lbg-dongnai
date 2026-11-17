# 🤖 Trợ Lý Tự Động CSDL Đồng Nai (v5.1 Toàn Tỉnh)

> **Tiện ích mở rộng Google Chrome (Manifest V3) chuyển đổi số & tự động hóa nghiệp vụ CSDL Giáo dục tỉnh Đồng Nai.**  
> Tác giả: **Thầy Nông Văn Hùng** (Trường THCS Đăk Ơ, Huyện Bù Gia Mập, Tỉnh Đồng Nai) & Cộng đồng AI Giáo dục Đồng Nai.

🌐 **Trang web hướng dẫn trực tuyến (GitHub Pages):**  
👉 **[https://hungcnfree.github.io/csdl-dongnai-extension/](https://hungcnfree.github.io/csdl-dongnai-extension/)**

💬 **Nhóm Zalo AI chia sẻ & hỗ trợ giáo viên Đồng Nai:**  
👉 **[https://zalo.me/g/2vhbtmsqdr06gyfiuru8](https://zalo.me/g/2vhbtmsqdr06gyfiuru8)**

---

## 🌟 TÍNH NĂNG CHÍNH

1. **Đăng nhập tự động 100%:**
   - Tự động điền đầy đủ: **Cấp học** (Mầm non, Tiểu học, THCS, THPT, GDTX), **Phường/Xã** (96 Xã/Phường), **Trường học** (2.178 trường), **Số điện thoại** & **Mật khẩu**.
   - Con trỏ chuột tự động focus vào ô CAPTCHA, Thầy/Cô chỉ cần gõ 4 ký tự rồi ấn **ENTER** là vào ngay hệ thống.
   - Không can thiệp giải mã CAPTCHA, đảm bảo 100% tuân thủ quy chuẩn an toàn thông tin của ngành Giáo dục.

2. **Xác nhận Hoàn thành Lịch báo giảng (0.5 giây):**
   - Tại mục **3.6.2 Khai báo lịch báo giảng**, Robot tự động hiển thị nút bấm nổi `✅ BẤM ĐỂ HOÀN THÀNH`.
   - 1 click là tự động chuyển toàn bộ 15-18 tiết trong tuần sang "Hoàn thành" và tự động bấm nút **Ghi**.

3. **Hỗ trợ 2 chế độ thông minh:**
   - **THCS Đăk Ơ (Mặc định):** Tích hợp sẵn danh sách 60 giáo viên THCS Đăk Ơ chọn 1 click ra ngay tên.
   - **Toàn tỉnh Đồng Nai (Trường khác / Xã khác):** Lựa chọn linh hoạt Cấp học, Phường/Xã trong 96 xã toàn tỉnh, danh sách trường học tự động lọc chuẩn xác tương ứng.

4. **Bảo mật tuyệt đối 100%:**
   - Toàn bộ thông tin tài khoản được lưu cục bộ trên trình duyệt máy tính của Thầy/Cô (`chrome.storage.sync`), không gửi qua bất kỳ máy chủ nào.

---

## 📁 CẤU TRÚC DỰ ÁN

```text
BAN_CHIA_SE_DONG_NGHIEP/
├── CAI_DAT_TIEN_ICH_CHROME.bat       # Script tự động mở chrome://extensions và sao chép đường dẫn
├── HUONG_DAN_DONG_NGHIEP.html        # Trang hướng dẫn cài đặt trực quan cho giáo viên
├── index.html                        # Bản build deploy trực tiếp lên GitHub Pages
├── TIN_NHAN_ZALO.txt                 # Mẫu tin nhắn gửi đồng nghiệp qua Zalo
├── dongnai_data.js                   # Cơ sở dữ liệu 96 Xã/Phường và 2.178 Trường học
├── schools_by_level_ward.json        # Dữ liệu JSON phân cấp theo Cấp học & Xã/Phường
├── csdl_dongnai_master_database.json # Dữ liệu gốc đã bóc tách từ cổng CSDL Đồng Nai
└── chrome_extension/                 # Thư mục Tiện ích mở rộng Google Chrome (Manifest V3)
    ├── manifest.json
    ├── popup.html
    ├── popup.js
    ├── content.js
    └── dongnai_data.js
```

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT EXTENSION (CHỈ 3 BƯỚC)

1. Nhấp đúp vào file: **`CAI_DAT_TIEN_ICH_CHROME.bat`**.  
   *(Chương trình sẽ tự động sao chép đường dẫn ổ cứng vào Clipboard và mở sẵn trang quản lý tiện ích `chrome://extensions` trên Chrome).*
2. Tại trang `chrome://extensions`, bật công tắc **"Chế độ dành cho nhà phát triển"** ở góc trên cùng bên phải. Bấm nút **"Tải tiện ích đã giải nén"** ở góc trên bên trái ➔ Dán đường dẫn hoặc chọn thư mục `chrome_extension`.
3. Bấm vào biểu tượng Tiện ích (🧩) trên thanh công cụ Chrome ➔ Chọn Tên/Trường và nhập SĐT + Mật khẩu ➔ Bấm **Lưu cấu hình của tôi**.
4. **Sử dụng:** Mở `truong.dongnai.edu.vn` ➔ Robot tự động điền 100%, Thầy/Cô chỉ cần gõ 4 ký tự CAPTCHA rồi ấn **Enter**!

---

## 🌐 HƯỚNG DẪN DEPLOY LÊN GITHUB & GITHUB PAGES

Để đưa trang hướng dẫn và mã nguồn lên GitHub của Thầy Hùng:

1. **Đẩy mã nguồn lên GitHub:**
   ```bash
   git init
   git remote add origin https://github.com/hungcnfree/csdl-dongnai-extension.git
   git branch -M main
   git add .
   git commit -m "Release v5.1: CSDL Dong Nai Chrome Extension"
   git push -u origin main
   ```

2. **Bật GitHub Pages:**
   - Vào GitHub Repository: `https://github.com/hungcnfree/csdl-dongnai-extension`.
   - Chọn **Settings** (Cài đặt) ➔ chọn mục **Pages** ở menu bên trái.
   - Tại phần **Build and deployment** ➔ **Source**: Chọn **Deploy from a branch**.
   - Tại phần **Branch**: Chọn nhánh `main`, thư mục giữ nguyên `/ (root)` ➔ bấm **Save**.
   - Sau 1 phút, trang web hướng dẫn sẽ trực tuyến tại:  
     👉 **`https://hungcnfree.github.io/csdl-dongnai-extension/`**

---

## 💬 HỖ TRỢ & ĐÓNG GÓP Ý KIẾN

- **Nhóm Zalo AI Giáo Dục Đồng Nai:** [https://zalo.me/g/2vhbtmsqdr06gyfiuru8](https://zalo.me/g/2vhbtmsqdr06gyfiuru8)
- **Kho lưu trữ GitHub:** [https://github.com/hungcnfree/csdl-dongnai-extension](https://github.com/hungcnfree/csdl-dongnai-extension)

---
*Bản quyền © 2026 Thầy Nông Văn Hùng (Trường THCS Đăk Ơ) & Cộng đồng AI Giáo dục Đồng Nai.*
