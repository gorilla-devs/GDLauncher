# For my application GUID (fix GUID to match what your application uses)
!macro customInit
    # Workaround for installer handing when the app directory is removed manually
    ${ifNot} ${FileExists} "$INSTDIR"
        DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\{${APP_GUID}}"
    ${EndIf}

    ReadRegStr $0 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_GUID}" "QuietUninstallString"
    StrCmp $0 "" proceed 0
    DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_GUID}"
    proceed:
!macroend

!macro customUnInstall
    push $4
    push $0
    
    SetShellVarContext current 
    ClearErrors


    ${ifNot} ${isUpdated}
        FileOpen $4 "$APPDATA\gdlauncher_next\override.data" r
        FileRead $4 $0
        RMDir /r "$0\instances"
        RMDir /r "$0\java"
        RMDir /r "$0\datastore"
        RMDir /r "$0\blob_storage"
        RMDir /r "$0\Local Storage"
        RMDir /r "$0\Cache"
        RMDir /r "$0\Code Cache"
        RMDir /r "$0\Dictionaries"
        RMDir /r "$0\GPUCache"
        RMDir /r "$0\Session Storage"
        RMDir /r "$0\shared_proto_db"
        RMDir /r "$0\temp"
        Delete "$0\Cookies"
        Delete "$0\.updaterId"
        Delete "$0\7za.exe"
        Delete "$0\Cookies-journal"
        Delete "$0\Network Persistent State"
        Delete "$0\Preferences"
        Delete "$0\TransportSecurity"
        Delete "$0\Config"
        Delete "$0\rChannel"
        
        FileClose $4

        RMDir /r "$APPDATA\gdlauncher_next"
    ${endIf}
    

    pop $4
    pop $0
!macroend