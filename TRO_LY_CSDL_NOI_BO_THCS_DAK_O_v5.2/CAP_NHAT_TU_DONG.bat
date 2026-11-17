@echo off
chcp 65001 >nul
title TRỢ LÝ CSDL - TỰ ĐỘNG CẬP NHẬT
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tu_dong_cap_nhat.ps1"
