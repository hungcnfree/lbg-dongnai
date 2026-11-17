@echo off
chcp 65001 >nul
title CÀI ĐẶT TIỆN ÍCH CHROME - BẢN NỘI BỘ THCS ĐĂK Ơ
cls
echo ====================================================================
echo   TRỢ LÝ TỰ ĐỘNG CSDL - BẢN NỘI BỘ THCS ĐĂK Ơ (v5.2.1)
echo   Tác quyền: Thầy Nông Văn Hùng và Cộng đồng AI Giáo dục Đồng Nai
echo ====================================================================
echo.
set EXT_DIR=%~dp0chrome_extension
echo [*] ĐƯỜNG DẪN THƯ MỤC TIỆN ÍCH TRÊN MÁY TÍNH:
echo     "%EXT_DIR%"
echo.
:: Tự động sao chép đường dẫn thư mục vào Clipboard
echo %EXT_DIR%| clip
echo  --^> [ĐÃ TỰ ĐỘNG SAO CHÉP ĐƯỜNG DẪN TRÊN VÀO BỘ NHỚ TẠM CLIPBOARD!]
echo.
echo --------------------------------------------------------------------
echo 1. Đang mở trang Quản lý tiện ích Chrome (chrome://extensions)...
start chrome "chrome://extensions"
echo.
echo 2. Đang mở thư mục tiện ích trong máy tính...
explorer "%EXT_DIR%"
echo.
echo ====================================================================
echo   HƯỚNG DẪN 3 BƯỚC NẠP VÀO GOOGLE CHROME / CỐC CỐC:
echo ====================================================================
echo.
echo   [BƯỚC 1] Bật công tắc "Chế độ dành cho nhà phát triển"
echo            (Ở góc trên cùng bên phải màn hình Chrome).
echo.
echo   [BƯỚC 2] Bấm nút "Tải tiện ích đã giải nén" (Góc trên cùng bên trái)
echo            và DÁN hoặc CHỌN thư mục "chrome_extension" vừa mở ra!
echo.
echo   [BƯỚC 3] Nhấp vào biểu tượng Tiện ích ở góc trên Chrome (hình mảnh ghép),
echo            chọn Tên Thầy Cô và nhập SĐT + Mật khẩu rồi bấm LƯU!
echo.
echo   [BƯỚC 4] Mở trang https://truong.dongnai.edu.vn:
echo            Robot sẽ TỰ ĐỘNG CHỌN ĐÚNG TRƯỜNG THCS ĐĂK Ơ và điền tài khoản!
echo            Thầy/Cô chỉ cần gõ 8 ký tự CAPTCHA rồi ấn ENTER là vào ngay!
echo ====================================================================
echo.
echo [*] Nhóm Zalo AI chia sẻ và hỗ trợ: https://zalo.me/g/2vhbtmsqdr06gyfiuru8
echo [*] GitHub cập nhật phiên bản mới: https://github.com/hungcnfree/lbg-dongnai
echo.
pause
