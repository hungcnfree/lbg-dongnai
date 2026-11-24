[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$versionUrl = "https://raw.githubusercontent.com/hungcnfree/lbg-dongnai/main/version.json?t=" + [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$tempZip = Join-Path $env:TEMP "csdl_dako_update.zip"
$tempExtract = Join-Path $env:TEMP "csdl_dako_extract"
$destDir = Join-Path $PSScriptRoot "chrome_extension"

Clear-Host
Write-Host "==========================================================" -ForegroundColor Yellow
Write-Host "   TRO LY TU DONG CSDL - HOA MAT TROI VA NANG VANG v5.5.3" -ForegroundColor Yellow
Write-Host "   Tac quyen: Ban quyen 2026 Cong Dong Giao Vien Chuyen Doi So" -ForegroundColor DarkYellow
Write-Host "==========================================================" -ForegroundColor Yellow
Write-Host ""

function Show-ProgressBar ($percent, $message) {
    $bars = [math]::Round(($percent / 5))
    $progress = ("=" * $bars) + ("." * (20 - $bars))
    $line = "  [$progress] $percent% - $message"
    Write-Host ("`r" + $line.PadRight(70)) -NoNewline -ForegroundColor Green
    if ($percent -ge 100) { Write-Host "" }
}

Show-ProgressBar 15 "Dang kiem tra phien ban moi tu GitHub..."

try {
    $vData = Invoke-RestMethod -Uri $versionUrl -UseBasicParsing
    $latestVer = $vData.version
    $zipUrl = $vData.downloadUrls.dakoZip
    if (-not $zipUrl) {
        $zipUrl = "https://hungcnfree.github.io/lbg-dongnai/TRO_LY_CSDL_NOI_BO_THCS_DAK_O_v" + $latestVer + ".zip"
    }
    Show-ProgressBar 40 "Dang tai goi tien ich v$latestVer..."
    Invoke-WebRequest -Uri $zipUrl -OutFile $tempZip -UseBasicParsing
} catch {
    Show-ProgressBar 35 "Dang tai goi cap nhat du phong..."
    $fallbackUrl = "https://hungcnfree.github.io/lbg-dongnai/TRO_LY_CSDL_NOI_BO_THCS_DAK_O_v5.5.3.zip"
    Invoke-WebRequest -Uri $fallbackUrl -OutFile $tempZip -UseBasicParsing
}

Show-ProgressBar 70 "Dang giai nen va dong bo ma nguon..."
if (Test-Path $tempExtract) { Remove-Item $tempExtract -Recurse -Force }
Expand-Archive -Path $tempZip -DestinationPath $tempExtract -Force

$srcExt = Join-Path $tempExtract "chrome_extension"
if (-not (Test-Path $srcExt)) {
    $found = Get-ChildItem -Path $tempExtract -Filter "chrome_extension" -Recurse | Select-Object -First 1
    if ($found) { $srcExt = $found.FullName }
}

if ($srcExt -and (Test-Path $srcExt)) {
    Copy-Item -Path "$srcExt\*" -Destination $destDir -Recurse -Force
    Show-ProgressBar 100 "Cap nhat thanh cong 100%!"
    Write-Host ""
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "  [OK] CAP NHAT THANH CONG TIEN ICH LEN PHIEN BAN v$latestVer!" -ForegroundColor Green
    Write-Host "  - Toan bo MAT KHAU va THONG TIN da luu DUOC BAO TOAN 100%." -ForegroundColor Green
    Write-Host "  - Khong can go cai dat hay lam lai bat cu thao tac nao." -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Green
} else {
    Write-Host "[!] Khong tim thay thu muc tien ich trong goi tai ve." -ForegroundColor Red
}

if (Test-Path $tempZip) { Remove-Item $tempZip -Force }
if (Test-Path $tempExtract) { Remove-Item $tempExtract -Recurse -Force }

Write-Host ""
Write-Host "[*] Dang mo trang Quan ly tien ich Chrome..." -ForegroundColor Cyan
try {
    Start-Process "chrome" "chrome://extensions"
} catch {
    Start-Process "chrome://extensions"
}
Write-Host "Thay/Co chi can bam nut [Lam moi / Reload] o goc tien ich la xong!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Nhan phim Enter de dong cua so..." -ForegroundColor Gray
Read-Host
