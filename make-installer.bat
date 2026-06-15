@echo off
set PROJECT_DIR=C:\Users\user\Desktop\void notes
set NSIS="%LOCALAPPDATA%\electron-builder\Cache\nsis\nsis-3.0.4.1\Bin\makensis.exe"
set OUT="%PROJECT_DIR%\release\Void-Notes-Setup-0.4.1-Custom.exe"

%NSIS% /DPRODUCT_VERSION=0.4.1 ^
  /DPROJECT_DIR="%PROJECT_DIR%" ^
  /DICON_PATH="%PROJECT_DIR%\icon.ico" ^
  /DINSTALLER_OUT="%OUT%" ^
  /DOUTPUT_DIR="%PROJECT_DIR%\release" ^
  "%PROJECT_DIR%\resources\installer\VoidNotesInstaller.nsi"

if errorlevel 1 (
    echo Failed!
    exit /b 1
)

echo Success! Created: %OUT%