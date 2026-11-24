@echo off
title CAI DAT TIEN ICH CHROME - BAN NOI BO THCS DAK O
cls
echo ====================================================================
echo   TRO LY TU DONG CSDL - HOA MAT TROI VA NANG VANG (v5.5.3)
echo   Ban quyen: Cong Dong Giao Vien Chuyen Doi So
echo ====================================================================
echo.
set EXT_DIR=%~dp0chrome_extension
echo [*] DUONG DAN THU MUC TIEN ICH TREN MAY TINH:
echo     "%EXT_DIR%"
echo.
:: Tu dong sao chep duong dan thu muc vao Clipboard
echo %EXT_DIR%| clip
echo  --^> [DA TU DONG SAO CHEP DUONG DAN TREN VAO BO NHO TAM CLIPBOARD!]
echo.
echo --------------------------------------------------------------------
echo 1. Dang mo trang Quan ly tien ich Chrome (chrome://extensions)...
start chrome "chrome://extensions"
echo.
echo 2. Dang mo thu muc tien ich trong may tinh...
explorer "%EXT_DIR%"
echo.
echo ====================================================================
echo   HUONG DAN 3 BUOC NAP VAO GOOGLE CHROME / COC COC:
echo ====================================================================
echo.
echo   [BUOC 1] Bat cong tac "Che do danh cho nha phat trien"
echo            (O goc tren cung ben phai man hinh Chrome).
echo.
echo   [BUOC 2] Bam nut "Tai tien ich da giai nen" (Goc tren cung ben trai)
echo            va DAN hoac CHON thu muc "chrome_extension" vua mo ra!
echo.
echo   [BUOC 3] Nhap vao bieu tuong Tien ich o goc tren Chrome (hinh manh ghep),
echo            chon Ten Thay/Co va nhap SDT + Mat khau roi bam LUU!
echo.
echo   [BUOC 4] Mo trang https://truong.dongnai.edu.vn:
echo            Robot se TU DONG CHON DUNG TRUONG va dien tai khoan!
echo            Thay/Co chi can go 8 ky tu CAPTCHA roi an ENTER la vao ngay!
echo ====================================================================
echo.
echo [*] Nhom Zalo AI chia se va ho tro: https://zalo.me/g/2vhbtmsqdr06gyfiuru8
echo [*] GitHub cap nhat phien ban moi: https://github.com/hungcnfree/lbg-dongnai
echo.
pause
