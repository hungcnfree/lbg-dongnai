# 🤖 TRỢ LÝ TỰ ĐỘNG CSDL ĐỒNG NAI (v5.1 TOÀN TỈNH)

> **Sáng kiến Chuyển đổi số & Tự động hóa nghiệp vụ CSDL Giáo dục tỉnh Đồng Nai.**  
> Tác giả: **Thầy Nông Văn Hùng** (Trường THCS Đăk Ơ, Huyện Bù Gia Mập, Tỉnh Đồng Nai) & Cộng đồng AI Giáo dục Đồng Nai.

---

## 🌟 TÍNH NĂNG CHÍNH

1. **Đăng nhập tự động 100%:**
   - Tự động điền: **Cấp học** (Mầm non, Tiểu học, THCS, THPT, GDTX), **Phường/Xã** (96 Xã/Phường), **Trường học** (2.178 trường), **Số điện thoại** & **Mật khẩu**.
   - Con trỏ chuột tự động focus vào ô CAPTCHA, Thầy/Cô chỉ cần gõ 4 ký tự rồi ấn **ENTER** là vào ngay.
   - Không can thiệp giải mã CAPTCHA, đảm bảo 100% tuân thủ bảo mật ngành Giáo dục.

2. **Xác nhận Hoàn thành Lịch báo giảng (0.5 giây):**
   - Tự động chọn "Hoàn thành" cho toàn bộ 15-18 tiết trong tuần và tự động bấm nút **Ghi**.

3. **Hai giải pháp linh hoạt:**
   - **Cách 1: Dấu trang 1-Click (Bookmarklet):** Dùng trực tiếp trên thanh Dấu trang của Chrome/Cốc Cốc, không cần cài đặt bất kỳ tiện ích hay phần mềm nào. Dùng được ở trường lẫn ở nhà.
   - **Cách 2: Chrome Extension (Tiện ích mở rộng v5.1):** Tự động nhận diện và điền ngay lập tức khi mở `https://truong.dongnai.edu.vn/Login.aspx`.

4. **Bảo mật tuyệt đối 100%:**
   - Hoàn toàn không có server backend trung gian. Toàn bộ thông tin tài khoản được lưu cục bộ trên trình duyệt máy tính của Thầy/Cô (`localStorage` / `chrome.storage.sync`).

---

## 📁 CẤU TRÚC THƯ MỤC

```text
BAN_CHIA_SE_DONG_NGHIEP/
├── 1_CAI_DAT_DAU_TRANG.bat           # File khởi chạy nhanh cài đặt Dấu trang 1-click
├── 2_CAI_DAT_TIEN_ICH_CHROME.bat     # File tự động mở chrome://extensions và chép đường dẫn
├── Cai_Dat_Dau_Trang_1Click.html     # Giao diện tạo Dấu trang đa trường
├── index.html                        # Bản sao để host trực tiếp trên GitHub Pages
├── dongnai_data.js                   # CSDL 96 Xã/Phường và 2.178 Trường học toàn tỉnh
├── HUONG_DAN_DONG_NGHIEP.html        # Hướng dẫn chi tiết bằng hình ảnh và các bước
├── TIN_NHAN_ZALO.txt                 # Mẫu tin nhắn gửi đồng nghiệp qua Zalo
└── chrome_extension/                 # Thư mục Tiện ích mở rộng Google Chrome (Manifest V3)
    ├── manifest.json
    ├── popup.html
    ├── popup.js
    ├── content.js
    └── dongnai_data.js
```

---

## 🚀 HƯỚNG DẪN DEPLOY LÊN GITHUB PAGES (DÙNG ONLINE 100%)

Để chia sẻ link web cho đồng nghiệp toàn tỉnh sử dụng mà không cần gửi file nén:

1. **Khởi tạo và đẩy lên GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Phát hành Trợ lý CSDL Đồng Nai v5.1 Toàn Tỉnh"
   git branch -M main
   git remote add origin https://github.com/hungdak-o/tro-ly-csdl-dong-nai.git
   git push -u origin main
   ```

2. **Kích hoạt GitHub Pages:**
   - Vào GitHub Repo: `Settings` ➔ `Pages`.
   - Tại mục **Build and deployment** / **Source**: Chọn `Deploy from a branch`.
   - Chọn nhánh `main`, thư mục `/ (root)` rồi bấm **Save**.
   - Sau 1 phút, trang web sẽ online tại: `https://hungdak-o.github.io/tro-ly-csdl-dong-nai/`

---

## 💬 CỘNG ĐỒNG & HỖ TRỢ

- **Nhóm Zalo AI Giáo Dục Đồng Nai:** [https://zalo.me/g/csdl-dongnai-ai](https://zalo.me/g/csdl-dongnai-ai)
- **Cập nhật mã nguồn & đóng góp ý kiến:** [https://github.com/hungdak-o/tro-ly-csdl-dong-nai](https://github.com/hungdak-o/tro-ly-csdl-dong-nai)

---
*Bản quyền © 2026 Thầy Nông Văn Hùng (Trường THCS Đăk Ơ) & Cộng đồng AI Giáo dục Đồng Nai.*
