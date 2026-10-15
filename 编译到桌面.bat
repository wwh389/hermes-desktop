@echo off
chcp 65001 >nul
echo ===== 编译并复制到桌面 =====
cd /d D:\tauri\my-chat
echo [1/2] 编译中...
call npm run tauri build
echo.
echo [2/2] 复制到桌面...
copy /Y "D:\tauri\my-chat\src-tauri\target\release\my-chat.exe" "%USERPROFILE%\Desktop\my-chat.exe"
echo.
if exist "%USERPROFILE%\Desktop\my-chat.exe" (
    echo ✅ 桌面已有 my-chat.exe
) else (
    echo ❌ 复制失败
)
pause
