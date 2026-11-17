# -*- coding: utf-8 -*-
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$versionUrl = "https://raw.githubusercontent.com/hungcnfree/lbg-dongnai/main/version.json?t=" + [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$tempZip = Join-Path $env:TEMP "csdl_dako_update.zip"
$tempExtract = Join-Path $env:TEMP "csdl_dako_extract"
$destDir = Join-Path $PSScriptRoot "chrome_extension"

Clear-Host
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   TRỢ LÝ TỰ ĐỘNG CSDL - BẢN NỘI BỘ TRƯỜNG TOÀN TỈNH ĐỒNG NAI" -ForegroundColor Yellow
Write-Host "   Tác quyền: (c) 2026 Thầy Nông Văn Hùng và Cộng đồng AI" -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[*] Đang kiểm tra thông tin phiên bản mới nhất từ GitHub..." -ForegroundColor White

try {
    $vData = Invoke-RestMethod -Uri $versionUrl -UseBasicParsing
    $latestVer = $vData.version
    $zipUrl = $vData.downloadUrls.provinceZip
    if (-not $zipUrl) {
        $zipUrl = "https://hungcnfree.github.io/lbg-dongnai/TRO_LY_CSDL_TOAN_TINH_DONG_NAI_v" + $latestVer + ".zip"
    }
    Write-Host "[*] Phát hiện phiên bản mới: v$latestVer" -ForegroundColor Green
    Write-Host "[*] Đang tải gói tiện ích: $zipUrl" -ForegroundColor Cyan
    Invoke-WebRequest -Uri $zipUrl -OutFile $tempZip -UseBasicParsing
} catch {
    Write-Host "[!] Đang thử tải gói cập nhật dự phòng..." -ForegroundColor Yellow
    $fallbackUrl = "https://hungcnfree.github.io/lbg-dongnai/TRO_LY_CSDL_TOAN_TINH_DONG_NAI_v5.2.zip"
    Invoke-WebRequest -Uri $fallbackUrl -OutFile $tempZip -UseBasicParsing
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
