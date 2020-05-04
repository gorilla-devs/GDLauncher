# For my application GUID (fix GUID to match what your application uses)
!macro customInit
    push $4
    push $0

    SetShellVarContext current 
    # Workaround for installer handing when the app directory is removed manually
    ${ifNot} ${FileExists} "$INSTDIR"
        DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_GUID}"
        DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\{${APP_GUID}}"
    ${EndIf}

    DeleteRegKey HKCU "Software\${APP_GUID}"
    DeleteRegKey HKCU "Software\{${APP_GUID}}"
    DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_GUID}"
    DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\{${APP_GUID}}"

    ClearErrors
    FileOpen $4 "$APPDATA\gdlauncher_next\overrides" r
    FileRead $4 $0
    MessageBox MB_OK "Unable to find overrides file!  $AppData\gdlauncher_next\overrides $0"
    ${If} ${Errors}
        Abort "Unable to find overrides file!"
    ${EndIf}
        RMDir /r "$0"
        Delete "$APPDATA\gdlauncher_next\overrides"
        !appendfile "$APPDATA\gdlauncher_next\overrides" ""

    FileClose $4

    pop $4
    pop $0

    # Read appdata/gdlauncher_next/overrides
    # if it's present, delete the folder reported inside
    # then delete appdata/gdlauncher_next/overrides
!macroend