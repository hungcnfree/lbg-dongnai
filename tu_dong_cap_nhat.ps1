# -*- coding: utf-8 -*-
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$versionUrl = "https://raw.githubusercontent.com/hungcnfree/lbg-dongnai/main/version.json?t=" + [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$tempZip = Join-Path $env:TEMP "csdl_dako_update.zip"
$tempExtract = Join-Path $env:TEMP "csdl_dako_extract"
$destDir = Join-Path $PSScriptRoot "chrome_extension"

Clear-Host
Write-Host "==========================================================" -ForegroundColor Yellow
Write-Host "   🌻 TRỢ LÝ TỰ ĐỘNG CSDL - HOA MẶT TRỜI & NẮNG VÀNG v5.5.1" -ForegroundColor Yellow
Write-Host "   Tác quyền: (c) 2026 Cộng Đồng Giáo Viên Chuyển Đổi Số" -ForegroundColor DarkYellow
Write-Host "==========================================================" -ForegroundColor Yellow
Write-Host ""

function Show-ProgressBar ($percent, $message) {
    $bars = [math]::Round(($percent / 5))
    $progress = ("█" * $bars) + ("░" * (20 - $bars))
    Write-Host "`r  [$progress] $percent% - $message" -NoNewline -ForegroundColor Green
    if ($percent -ge 100) { Write-Host "" }
}

Show-ProgressBar 15 "Đang kiểm tra phiên bản mới từ GitHub..."

try {
    $vData = Invoke-RestMethod -Uri $versionUrl -UseBasicParsing
    $latestVer = $vData.version
    $zipUrl = $vData.downloadUrls.dakoZip
    if (-not $zipUrl) {
        $zipUrl = "https://hungcnfree.github.io/lbg-dongnai/TRO_LY_CSDL_NOI_BO_THCS_DAK_O_v" + $latestVer + ".zip"
    }
    Show-ProgressBar 40 "Đang tải gói tiện ích v$latestVer..."
    Invoke-WebRequest -Uri $zipUrl -OutFile $tempZip -UseBasicParsing
} catch {
    Show-ProgressBar 35 "Đang tải gói cập nhật dự phòng..."
    $fallbackUrl = "https://hungcnfree.github.io/lbg-dongnai/TRO_LY_CSDL_NOI_BO_THCS_DAK_O_v5.5.1.zip"
    Invoke-WebRequest -Uri $fallbackUrl -OutFile $tempZip -UseBasicParsing
}

Show-ProgressBar 70 "Đang giải nén và đồng bộ mã nguồn..."
if (Test-Path $tempExtract) { Remove-Item $tempExtract -Recurse -Force }
Expand-Archive -Path $tempZip -DestinationPath $tempExtract -Force

$srcExt = Join-Path $tempExtract "chrome_extension"
if (-not (Test-Path $srcExt)) {
    $found = Get-ChildItem -Path $tempExtract -Filter "chrome_extension" -Recurse | Select-Object -First 1
    if ($found) { $srcExt = $found.FullName }
}

if ($srcExt -and (Test-Path $srcExt)) {
    Copy-Item -Path "$srcExt\*" -Destination $destDir -Recurse -Force
    Show-ProgressBar 100 "Cập nhật thành công 100%!"
    Write-Host ""
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "  🎉 CẬP NHẬT THÀNH CÔNG TIỆN ÍCH LÊN PHIÊN BẢN v$latestVer!" -ForegroundColor Green
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
