@echo off
chcp 65001 >nul
title CÀI ĐẶT TIỆN ÍCH CHROME - CSDL TOÀN TỈNH ĐỒNG NAI
cls
echo ====================================================================
echo   🤖 TRỢ LÝ TỰ ĐỘNG CSDL ĐỒNG NAI v5.1 - TOÀN TỈNH ĐỒNG NAI
echo ====================================================================
echo.
set EXT_DIR=%~dp0chrome_extension
echo 📁 ĐƯỜNG DẪN THƯ MỤC TIỆN ÍCH TRÊN Ổ CỨNG:
echo    "%EXT_DIR%"
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
echo   HƯỚNG DẪN 3 BƯỚC NẠP VÀO GOOGLE CHROME:
echo ====================================================================
echo.
echo   [BƯỚC 1] Bật công tắc "Chế độ dành cho nhà phát triển"
echo            (Ở góc trên cùng bên phải màn hình Chrome).
echo.
echo   [BƯỚC 2] Bấm nút "Tải tiện ích đã giải nén" (Góc trên cùng bên trái)
echo            và dán hoặc chọn thư mục "chrome_extension" vừa mở ra!
echo.
echo   [BƯỚC 3] Nhấp vào biểu tượng Tiện ích ở góc trên Chrome,
echo            chọn Trường/Tên Thầy Cô và nhập SĐT + Mật khẩu rồi bấm Lưu!
echo.
echo   [BƯỚC 4] Mở trang https://truong.dongnai.edu.vn:
echo            Robot sẽ TỰ ĐỘNG ĐIỀN TOÀN BỘ và nhắc Thầy/Cô nhập CAPTCHA!
echo ====================================================================
echo.
pause
