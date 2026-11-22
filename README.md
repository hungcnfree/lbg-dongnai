# 🤖 Trợ Lý Tự Động CSDL & Lịch Báo Giảng (v5.4.1)

> **Hệ sinh thái tự động hóa nghiệp vụ Lịch báo giảng và CSDL Giáo dục gồm:**  
> 1. **Kỹ năng Antigravity AI**: Tự động điền phôi Lịch báo giảng tuần chỉ với 2 tệp đầu vào trong 3 giây.  
> 2. **Tiện ích mở rộng Google Chrome (Manifest V3)**: Tự động đăng nhập CSDL và 1-click nạp lịch/hoàn thành tuần.  
> Tác quyền: **© 2026 Thầy Nông Văn Hùng & Cộng đồng AI Giáo dục Đồng Nai**.

🌐 **Trang web hướng dẫn trực tuyến (GitHub Pages):**  
👉 **[https://hungcnfree.github.io/lbg-dongnai/](https://hungcnfree.github.io/lbg-dongnai/)**

📦 **Tải trực tiếp gói tiện ích đã đóng gói (ZIP ~230KB):**  
👉 **[Tải file TRO_LY_CSDL_NOI_BO_THCS_DAK_O_v5.4.1.zip](https://hungcnfree.github.io/lbg-dongnai/TRO_LY_CSDL_NOI_BO_THCS_DAK_O_v5.4.1.zip)**

💬 **Nhóm Zalo AI chia sẻ & hỗ trợ giáo viên:**  
👉 **[https://zalo.me/g/2vhbtmsqdr06gyfiuru8](https://zalo.me/g/2vhbtmsqdr06gyfiuru8)**

---

## ⚡ KỸ NĂNG ANTIGRAVITY AI: TỰ ĐỘNG ĐIỀN LỊCH TUẦN (2-FILE RULE)

> **Dành cho Thầy/Cô sử dụng Antigravity AI:** Không cần cài đặt extension nếu chỉ muốn tạo file Excel lịch báo giảng tuần. Thầy/Cô chỉ cần cung cấp đúng **2 tệp duy nhất**:
> 1. **File Mẫu Tuần (`.xlsx`)**: Tải từ CSDL hoặc file lịch tuần trước của mình.
> 2. **File TKB Toàn Trường (`.csv` hoặc `.xlsx`)**: File thời khóa biểu chung do BGH/nhà trường xuất ra.

### 🖼️ Hướng Dẫn 3 Bước Bằng Ảnh Infographic:

![Hướng Dẫn 3 Bước Tự Động Điền Lịch Báo Giảng](infographic_huong_dan_lbg.png)

### 3 Bước Thao Tác Siêu Nhanh:
1. Kéo thả 2 file vào khung chat Antigravity AI.
2. Gõ lệnh: `"Điền lịch báo giảng tuần 12 cho tôi"` (hoặc `"Tạo lịch tuần tiếp theo từ 2 file này"`).
3. Nhận ngay file `LichBaoGiang_Tuan[X]_[TenGV].xlsx` hoàn tất 100% (tự nhận diện GV, tự tính lũy kế số tiết PPCT, khớp đúng 54 ô CSDL)!

📁 **Mã nguồn kỹ năng Antigravity:** Thư mục [`skills/tu-dong-dien-lich-bao-giang/`](skills/tu-dong-dien-lich-bao-giang/)

---

## 🌟 TÍNH NĂNG VƯỢT TRỘI v5.4.1 (TIỆN ÍCH CHROME)

1. **Tự động điền 1-Click Lịch Báo Giảng:**
   - Hệ thống tự nhận biết tuần hiện tại (như Tuần 11, 12, 13...).
   - Tự động lấy Thời khóa biểu cá nhân của giáo viên đang chọn, tính bước nhảy lũy kế số tiết PPCT.
   - Tự động sinh file Excel trong bộ nhớ và bơm trực tiếp vào cửa sổ *Nhập từ Excel* của CSDL, tự bấm *Nhập*, đóng popup và tự bấm *Ghi*. Không cần bất kỳ thao tác thủ công nào.

2. **Tích hợp Thời khóa biểu toàn trường (60 giáo viên):**
   - Đã nhúng sẵn toàn bộ TKB của 60 thầy/cô trong trường.
   - Tự động nhận diện giáo viên đang đăng nhập trên hệ thống CSDL và chọn đúng lịch dạy.
   - Hỗ trợ đổi giáo viên siêu nhanh bằng thanh tìm kiếm trực tiếp trên thanh công cụ nổi.

3. **Xác nhận Hoàn thành tuần trong 0.5s:**
   - Chỉ đánh dấu *"Hoàn thành"* cho những tiết thực tế có dạy.
   - Tự động xóa/bỏ qua các tiết trống, tránh lỗi lưu tiết trống thành hoàn thành.

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
├── version.json                      # Cấu hình kiểm tra cập nhật tự động
├── TRO_LY_CSDL_NOI_BO_THCS_DAK_O_v5.4.1.zip # Gói tiện ích cài đặt v5.4.1
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

1. Nhấp đúp vào file **`CAI_DAT_TIEN_ICH_CHROME.bat`**.  
   *(Chương trình sẽ tự động sao chép đường dẫn ổ cứng vào Clipboard và mở sẵn trang quản lý tiện ích `chrome://extensions` trên Chrome).*
2. Tại trang `chrome://extensions`, bật công tắc **"Chế độ dành cho nhà phát triển"** ở góc trên cùng bên phải. Bấm nút **"Tải tiện ích đã giải nén"** ở góc trên bên trái ➔ Dán đường dẫn hoặc chọn thư mục `chrome_extension`.
3. Bấm vào biểu tượng Tiện ích (🧩) trên thanh công cụ Chrome ➔ Chọn Tên Thầy/Cô và nhập SĐT + Mật khẩu ➔ Bấm **Lưu cấu hình của tôi**.
4. **Sử dụng:** Mở `truong.dongnai.edu.vn` ➔ Robot tự động điền 100%, Thầy/Cô chỉ cần gõ 8 ký tự CAPTCHA rồi ấn **Enter**!

---

*Bản quyền © 2026 Thầy Nông Văn Hùng & Cộng đồng AI Giáo dục Đồng Nai.*
