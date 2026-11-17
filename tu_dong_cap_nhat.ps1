# -*- coding: utf-8 -*-
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$zipUrl = "https://hungcnfree.github.io/lbg-dongnai/TRO_LY_CSDL_TOAN_TINH_DONG_NAI_v5.2.zip"
$tempZip = Join-Path $env:TEMP "csdl_province_update.zip"
$tempExtract = Join-Path $env:TEMP "csdl_province_extract"
$destDir = Join-Path $PSScriptRoot "chrome_extension"

Clear-Host
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   TRỢ LÝ TỰ ĐỘNG CSDL - PHIÊN BẢN TOÀN TỈNH ĐỒNG NAI" -ForegroundColor Yellow
Write-Host "   Tác quyền: (c) 2026 Thầy Nông Văn Hùng và Cộng đồng AI" -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[*] Đang tải gói cập nhật mới nhất từ GitHub..." -ForegroundColor White
try {
    Invoke-WebRequest -Uri $zipUrl -OutFile $tempZip -UseBasicParsing
} catch {
    Write-Host "[!] Lỗi khi tải gói cập nhật: $_" -ForegroundColor Red
    Write-Host "Vui lòng kiểm tra kết nối Internet." -ForegroundColor Yellow
    Read-Host "Nhấn Enter để thoát"
    exit
}

if (Test-Path $tempExtract) { Remove-Item $tempExtract -Recurse -Force }
Write-Host "[*] Đang giải nén và cập nhật mã nguồn tiện ích..." -ForegroundColor White
Expand-Archive -Path $tempZip -DestinationPath $tempExtract -Force

$srcExt = Join-Path $tempExtract "chrome_extension"
if (-not (Test-Path $srcExt)) {
    $found = Get-ChildItem -Path $tempExtract -Filter "chrome_extension" -Recurse | Select-Object -First 1
    if ($found) { $srcExt = $found.FullName }
}

if ($srcExt -and (Test-Path $srcExt)) {
    Copy-Item -Path "$srcExt\*" -Destination $destDir -Recurse -Force
    Write-Host ""
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "  🎉 CẬP NHẬT THÀNH CÔNG TIỆN ÍCH LÊN PHIÊN BẢN MỚI NHẤT!" -ForegroundColor Green
    Write-Host "  - Toàn bộ MẬT KHẨU và THÔNG TIN đã lưu ĐƯỢC BẢO TỒN 100%." -ForegroundColor Green
    Write-Host "  - Không cần gỡ cài đặt hay làm lại bất cứ thao tác nào." -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Green
} else {
    Write-Host "[!] Không tìm thấy thư mục tiện ích trong gói tải về." -ForegroundColor Red
}

if (Test-Path $tempZip) { Remove-Item $tempZip -Force }
if (Test-Path $tempExtract) { Remove-Item $tempExtract -Recurse -Force }

Write-Host ""
Write-Host "[*] Đang mở trang Quản lý tiện ích Chrome..." -ForegroundColor Cyan
try {
    Start-Process "chrome" "chrome://extensions"
} catch {
    Start-Process "chrome://extensions"
}
Write-Host "Thầy/Cô chỉ cần bấm nút [Làm mới / Reload] ở góc tiện ích là xong!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Nhấn phím Enter để đóng cửa sổ..." -ForegroundColor Gray
Read-Host
