# 🤖 Trợ Lý Tự Động CSDL Đồng Nai (v5.2 Telerik Engine)

> **Tiện ích mở rộng Google Chrome (Manifest V3) chuyển đổi số & tự động hóa nghiệp vụ CSDL Giáo dục tỉnh Đồng Nai.**  
> Tác quyền: **Thầy Nông Văn Hùng & Cộng đồng AI Giáo dục Đồng Nai**.

🌐 **Trang web hướng dẫn trực tuyến (GitHub Pages):**  
👉 **[https://hungcnfree.github.io/lbg-dongnai/](https://hungcnfree.github.io/lbg-dongnai/)**

📦 **Tải trực tiếp gói tiện ích đã đóng gói (ZIP ~180KB):**  
👉 **[Tải file TRO_LY_CSDL_TOAN_TINH_DONG_NAI_v5.2.zip](https://github.com/hungcnfree/lbg-dongnai/releases/download/v5.2/TRO_LY_CSDL_TOAN_TINH_DONG_NAI_v5.2.zip)**

💬 **Nhóm Zalo AI chia sẻ & hỗ trợ giáo viên Đồng Nai:**  
👉 **[https://zalo.me/g/2vhbtmsqdr06gyfiuru8](https://zalo.me/g/2vhbtmsqdr06gyfiuru8)**

---

## 🌟 TÍNH NĂNG CHÍNH

1. **Đăng nhập tự động 100% bằng Telerik RadComboBox Client Engine:**
   - Tự động kích hoạt API `$find().findItemByText().select()` chuẩn của Telerik trên cổng ASP.NET WebForms.
   - Chọn tự động và cascade chuẩn: **Cấp học** (Mầm non, Tiểu học, THCS, THPT, GDTX) ➔ nạp AJAX ➔ **Phường/Xã** (96 Xã/Phường) ➔ nạp AJAX ➔ **Trường học** (2.178 trường) ➔ **Số điện thoại** & **Mật khẩu**.
   - Con trỏ chuột tự động focus vào ô CAPTCHA, Thầy/Cô chỉ cần gõ 8 ký tự CAPTCHA rồi ấn **ENTER** là vào ngay hệ thống.
   - Không can thiệp giải mã CAPTCHA, đảm bảo 100% tuân thủ quy chuẩn an toàn thông tin theo quy định hiện hành.

2. **Xác nhận Hoàn thành Lịch báo giảng (0.5 giây):**
   - Tại mục **3.6.2 Khai báo lịch báo giảng**, Robot tự động hiển thị nút bấm nổi `✅ BẤM ĐỂ HOÀN THÀNH`.
   - 1 click là tự động chuyển toàn bộ 15-18 tiết trong tuần sang "Hoàn thành" và tự động bấm nút **Ghi**.

3. **Hỗ trợ 2 chế độ thông minh:**
   - **Trường sở tại (Đăk Ơ):** Tích hợp sẵn danh bạ chọn nhanh 1 click ra ngay tên.
   - **Toàn tỉnh Đồng Nai (Trường khác / Xã khác):** Lựa chọn linh hoạt Cấp học, Phường/Xã trong 96 xã toàn tỉnh, danh sách trường học tự động lọc chuẩn xác tương ứng.

4. **Bảo mật tuyệt đối 100%:**
   - Toàn bộ thông tin tài khoản được lưu cục bộ trên trình duyệt máy tính của Thầy/Cô (`chrome.storage`), không gửi qua bất kỳ máy chủ nào.

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
4. **Sử dụng:** Mở `truong.dongnai.edu.vn` ➔ Robot tự động điền 100%, Thầy/Cô chỉ cần gõ 8 ký tự CAPTCHA rồi ấn **Enter**!

---

## 💬 HỖ TRỢ & ĐÓNG GÓP Ý KIẾN

- **Nhóm Zalo AI Giáo Dục Đồng Nai:** [https://zalo.me/g/2vhbtmsqdr06gyfiuru8](https://zalo.me/g/2vhbtmsqdr06gyfiuru8)
- **Kho lưu trữ GitHub:** [https://github.com/hungcnfree/lbg-dongnai](https://github.com/hungcnfree/lbg-dongnai)

---
*Bản quyền © 2026 Thầy Nông Văn Hùng & Cộng đồng AI Giáo dục Đồng Nai.*
