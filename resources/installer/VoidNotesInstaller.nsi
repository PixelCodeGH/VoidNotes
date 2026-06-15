;============================================================
; DEFINES — only those NOT already provided by electron-builder
;============================================================
!ifndef PRODUCT_DIR_REGKEY
  !define PRODUCT_DIR_REGKEY "Software\Microsoft\Windows\CurrentVersion\App Paths\Void Notes.exe"
!endif
!ifndef PRODUCT_UNINST_KEY
  !define PRODUCT_UNINST_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"
!endif
!ifndef PRODUCT_PUBLISHER
  !define PRODUCT_PUBLISHER "brutal-build"
!endif
!ifndef PRODUCT_WEB_SITE
  !define PRODUCT_WEB_SITE "https://github.com/brutal-build/VoidNotes"
!endif

;============================================================
; SECTIONS
;============================================================
Section "Main" SecMain
  SetOutPath "$INSTDIR"
  File /r "${PROJECT_DIR}\dist\*"
  File /r "${PROJECT_DIR}\dist-electron\*"
  File "${PROJECT_DIR}\package.json"
  
  CreateDirectory "$SMPROGRAMS\Void Notes"
  CreateShortcut "$SMPROGRAMS\Void Notes\Void Notes.lnk" "$INSTDIR\Void Notes.exe" "" "$INSTDIR\icon.ico" 0
  CreateShortcut "$DESKTOP\Void Notes.lnk" "$INSTDIR\Void Notes.exe" "" "$INSTDIR\icon.ico" 0
  
  WriteRegStr HKCU "${PRODUCT_DIR_REGKEY}" "" "$INSTDIR\Void Notes.exe"
  WriteRegStr HKCU "${PRODUCT_UNINST_KEY}" "DisplayName" "${PRODUCT_NAME}"
  WriteRegStr HKCU "${PRODUCT_UNINST_KEY}" "UninstallString" "$INSTDIR\Uninstall.exe"
  WriteRegStr HKCU "${PRODUCT_UNINST_KEY}" "DisplayVersion" "${VERSION}"
  WriteRegStr HKCU "${PRODUCT_UNINST_KEY}" "Publisher" "${PRODUCT_PUBLISHER}"
  WriteRegStr HKCU "${PRODUCT_UNINST_KEY}" "URLInfoAbout" "${PRODUCT_WEB_SITE}"
  
  WriteUninstaller "$INSTDIR\Uninstall.exe"
SectionEnd

Section "Uninstall"
  RMDir /r "$INSTDIR"
  Delete "$SMPROGRAMS\Void Notes\Void Notes.lnk"
  RMDir "$SMPROGRAMS\Void Notes"
  Delete "$DESKTOP\Void Notes.lnk"
  DeleteRegKey HKCU "Software\Void Notes"
  DeleteRegKey HKCU "${PRODUCT_UNINST_KEY}"
SectionEnd

;============================================================
; CALLBACKS
;============================================================
Function .onUserAbort
  MessageBox MB_YESNO|MB_ICONQUESTION "Are you sure you want to cancel?" IDYES +2
  Abort
FunctionEnd

Function .onInit
FunctionEnd

Function .onInstSuccess
FunctionEnd