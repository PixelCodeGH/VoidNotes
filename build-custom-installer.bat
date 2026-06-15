@echo off
REM Void Notes Custom Installer Builder
REM This script builds the app and creates a custom NSIS installer

cd /d "%~dp0"

echo ============================================================
echo Building Void Notes...
echo ============================================================
npm run build
if errorlevel 1 (
    echo Build failed!
    exit /b 1
)

echo.
echo ============================================================
echo Creating custom installer with makensis...
echo ============================================================

REM Use the NSIS that comes with electron-builder
set NSIS_PATH=%LOCALAPPDATA%\electron-builder\Cache\nsis\nsis-3.0.4.1\Bin\makensis.exe

if not exist "%NSIS_PATH%" (
    echo NSIS not found at %NSIS_PATH%
    echo Trying system NSIS...
    set NSIS_PATH=makensis.exe
)

echo Using NSIS: %NSIS_PATH%

"%NSIS_PATH%" /DPRODUCT_VERSION=0.4.1 ^
    /DAPP_VERSION=0.4.1 ^
    /DPROJECT_DIR=%CD% ^
    /DICON_PATH=%CD%\icon.ico ^
    /DINSTALLER_OUT=%CD%\release\Void-Notes-Setup-0.4.1-Custom.exe ^
    /DOUTPUT_DIR=%CD%\release ^
    resources\installer\VoidNotesInstaller.nsi

if errorlevel 1 (
    echo Installer creation failed!
    exit /b 1
)

echo.
echo ============================================================
echo SUCCESS! Custom installer created:
echo %CD%\release\Void-Notes-Setup-0.4.1-Custom.exe
echo ============================================================