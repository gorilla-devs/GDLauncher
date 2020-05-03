# For my application GUID (fix GUID to match what your application uses)
!macro customInit
    # Workaround for installer handing when the app directory is removed manually
    ${ifNot} ${FileExists} "$INSTDIR"
        DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_GUID}"
        DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\{${APP_GUID}}"
    ${EndIf}

    DeleteRegKey HKCU "Software\${APP_GUID}"
    DeleteRegKey HKCU "Software\{${APP_GUID}}"
    DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_GUID}"
    DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\{${APP_GUID}}"

    # Read appdata/gdlauncher_next/overrides
    # if it's present, delete the folder reported inside
    # then delete appdata/gdlauncher_next/overrides
    proceed:
!macroend