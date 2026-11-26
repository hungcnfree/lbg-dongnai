# 🌻 Trợ Lý Tự Động CSDL & Lịch Báo Giảng (v5.5.4)

> **Phiên bản Hoa Mặt Trời & Nắng Vàng 🌻☀️:** Tiện ích mở rộng Google Chrome (Manifest V3) hỗ trợ tự động hóa nghiệp vụ Lịch báo giảng và CSDL Giáo dục: Tự động đăng nhập CSDL, 1-click nạp lịch/hoàn thành tuần, cùng tính năng đồng bộ thời khóa biểu trường.  
> Bản quyền: **© 2026 Cộng Đồng Giáo Viên Chuyển Đổi Số 🌻☀️**.

🌐 **Trang web hướng dẫn trực tuyến (GitHub Pages):**  
👉 **[https://hungcnfree.github.io/lbg-dongnai/](https://hungcnfree.github.io/lbg-dongnai/)**

📦 **Tải trực tiếp gói tiện ích đã đóng gói (ZIP ~230KB):**  
👉 **[Tải file TRO_LY_CSDL_NOI_BO_THCS_DAK_O_v5.5.4.zip](https://hungcnfree.github.io/lbg-dongnai/TRO_LY_CSDL_NOI_BO_THCS_DAK_O_v5.5.4.zip)**

💬 **Nhóm Zalo AI chia sẻ & hỗ trợ giáo viên:**  
👉 **[https://zalo.me/g/2vhbtmsqdr06gyfiuru8](https://zalo.me/g/2vhbtmsqdr06gyfiuru8)**

---

## Điểm mới v5.5.4

- Giữ mốc PPCT khi đổi thời khóa biểu để số tiết tiếp nối theo từng môn và lớp.
- Đã đối chiếu 15 tiết tuần 13 bằng hai thời khóa biểu gốc của THCS Đăk Ơ.
- Nếu đã cài tiện ích, chạy `CAP_NHAT_TU_DONG.bat` trong thư mục đang dùng, rồi bấm **Tải lại** tại `chrome://extensions`. Nút đồng bộ trong popup dùng để tải dữ liệu TKB.

---

## 🌟 TÍNH NĂNG VƯỢT TRỘI v5.5.4 (TIỆN ÍCH CHROME)

1. **Tự động điền 1-Click Lịch Báo Giảng:**
   - Hệ thống tự nhận biết tuần hiện tại (như Tuần 11, 12, 13...).
   - Tự động lấy Thời khóa biểu cá nhân của giáo viên đang chọn, tính bước nhảy lũy kế số tiết PPCT.
   - Tự động sinh file Excel trong bộ nhớ và bơm trực tiếp vào cửa sổ *Nhập từ Excel* của CSDL, tự bấm *Nhập*, đóng popup và tự bấm *Ghi*. Không cần bất kỳ thao tác thủ công nào.

2. **Tích hợp Thời khóa biểu toàn trường (60 giáo viên):**
   - Đã nhúng sẵn toàn bộ TKB của 60 thầy/cô trong trường.
   - Tự động nhận diện giáo viên đang đăng nhập trên hệ thống CSDL và chọn đúng lịch dạy.
   - Hỗ trợ đổi giáo viên siêu nhanh bằng thanh tìm kiếm trực tiếp trên thanh công cụ nổi.

3. **Cập nhật 1-Click hiển thị tiến trình 100%:**
   - Cập nhật Thời khóa biểu & cấu hình CSDL mới nhất từ GitHub chỉ với 1 click chuột, bảo toàn 100% mật khẩu đã lưu.

4. **Đăng nhập tự động 100% bằng Telerik RadComboBox Client Engine:**
   - Tự động điền Cấp học, Xã/Phường, Trường học, Số điện thoại và Mật khẩu.
   - Chuột tự động focus vào ô CAPTCHA, Thầy/Cô chỉ cần gõ 8 ký tự rồi ấn **ENTER** là vào ngay.

---

## 📁 CẤU TRÚC DỰ ÁN

```text
lbg-dongnai/
├── CAI_DAT_TIEN_ICH_CHROME.bat       # Script tự động mở chrome://extensions và sao chép đường dẫn
├── CAP_NHAT_TU_DONG.bat              # Script 1-click tự động cập nhật bản mới nhất từ GitHub
├── tu_dong_cap_nhat.ps1              # PowerShell tự động tải và giải nén bản mới
├── HUONG_DAN_DONG_NGHIEP.html        # Trang hướng dẫn cài đặt trực quan cho giáo viên
├── index.html                        # Bản build deploy trực tiếp lên GitHub Pages
├── infographic_huong_dan_lbg.png     # Ảnh Infographic hướng dẫn 3 bước điền lịch tuần
├── infographic_huong_dan_lbg.html    # Bản web tương tác của Infographic
├── version.json                      # Cấu hình kiểm tra cập nhật tự động v5.5.4
├── TRO_LY_CSDL_NOI_BO_THCS_DAK_O_v5.5.4.zip # Gói tiện ích cài đặt v5.5.4
├── skills/                           # Kỹ năng dành cho Antigravity AI Assistant
│   └── tu-dong-dien-lich-bao-giang/  # Kỹ năng tự động điền lịch tuần từ 2 files
│       ├── SKILL.md                  # Hướng dẫn chi tiết cho Agent
│       ├── scripts/dien_lich_bao_giang.py # Bộ xử lý tự động tính lũy kế & sinh Excel
│       └── README.md                 # Hướng dẫn giáo viên cài đặt và sử dụng
└── chrome_extension/                 # Thư mục Tiện ích mở rộng Google Chrome (Manifest V3)
    ├── manifest.json
    ├── popup.html
    ├── popup.js
    ├── content.js
    ├── default_school_tkb.js         # Dữ liệu TKB 60 giáo viên toàn trường
    ├── lbg_excel_engine.js           # Bộ giải mã và sinh file Excel LBG
    ├── page_bridge.js                # Cầu nối tương tác giao diện CSDL
    ├── template_lbg_base64.js        # Mẫu phôi Excel CSDL
    └── xlsx.mini.min.js              # Thư viện xử lý Excel
```

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT (CHỈ 3 BƯỚC)

1. Tải và giải nén file ZIP, nhấp đúp vào file **`CAI_DAT_TIEN_ICH_CHROME.bat`**.  
   *(Chương trình sẽ tự động sao chép đường dẫn thư mục `chrome_extension` vào Clipboard và mở sẵn trang quản lý tiện ích `chrome://extensions` trên Chrome).*
2. Tại trang `chrome://extensions`, bật công tắc **"Chế độ dành cho nhà phát triển"** ở góc trên cùng bên phải. Bấm nút **"Tải tiện ích đã giải nén"** ở góc trên bên trái ➔ Dán đường dẫn hoặc chọn thư mục `chrome_extension`.
3. Bấm vào biểu tượng Tiện ích (🧩) trên thanh công cụ Chrome ➔ Ghim 📌 Trợ Lý CSDL ➔ Mở tiện ích, chọn **Tên Thầy/Cô** (trong danh sách 60 giáo viên toàn trường Đăk Ơ), nhập SĐT + Mật khẩu CSDL ➔ Bấm **💾 Lưu Cấu Hình Của Tôi**.

---

## ⚡ QUY TRÌNH SỬ DỤNG HÀNG TUẦN (1-CLICK SIÊU TỐC)

1. **Đăng nhập tự động CSDL:** Mở trang `truong.dongnai.edu.vn` ➔ Robot tự động chọn Cấp - Xã - Trường và điền tài khoản. Thầy/Cô chỉ cần nhìn 8 ký tự CAPTCHA, gõ vào ô rồi ấn **Enter** là vào ngay.
2. **Mở mục 3.6.2 Khai báo:** Vào menu: `3. Kế hoạch giáo dục` ➔ `3.6 Lịch báo giảng` ➔ `3.6.2 Khai báo lịch báo giảng`. Chọn Tuần cần lên lịch.
3. **Thanh nổi 2 nút thông minh (có thể kéo di chuyển bằng tay cầm ⠿):**
   - ⚡ **Bấm `⚡ Tự Động Điền`**: Robot tự động nạp toàn bộ lịch dạy theo TKB cá nhân, tính lũy kế số tiết PPCT từng lớp và bấm Ghi thành công trong 0.5 giây!
   - ✅ **Bấm `✅ Hoàn Thành Tuần`**: Chuyển toàn bộ tiết dạy sang trạng thái 'Hoàn thành' và bấm Ghi xác nhận.

---

## 🔄 CẬP NHẬT KHI NHÀ TRƯỜNG ĐỔI THỜI KHÓA BIỂU
- **Cách 1:** Dùng nút **Đồng bộ TKB & kiểm tra phiên bản** trong tiện ích để tải TKB chuẩn của trường.
- **Cách 2:** Bấm **"📁 Nhập File TKB Mới (.xlsx, .csv)"** trong popup tiện ích để nạp file TKB toàn trường mới của BGH.

---

*Bản quyền © 2026 Cộng Đồng Giáo Viên Chuyển Đổi Số 🌻☀️.*
