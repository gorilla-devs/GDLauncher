# For my application GUID (fix GUID to match what your application uses)
!define NEW_GUID_INSTALLER "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\{${APP_GUID}}"
!define OLD_GUID_UNINSTALLER "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\${APP_GUID}"
!define SUPER_OLD_GUID_INSTALLER "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_GUID}"
!define SUPER_OLD_GUID_UNINSTALLER "Software\Microsoft\Windows\CurrentVersion\Uninstall\{${APP_GUID}}"

!ifndef BUILD_UNINSTALLER
    Function CheckForNewInstallation
        # Preserve stack
        Push $R1
        
        # Check if new electron app is installed
        ReadRegStr $R1 HKLM "${NEW_GUID_INSTALLER}" "Publisher"
        
        # Check if this key exists or not
        StrCmp $R1 "${COMPANY_NAME}" DeleteOldInstallation SkipOldInstallation
        
        DeleteOldInstallation:
            Call CleanOldInstallation
        SkipOldInstallation:
            
        # Restore stack
        Pop $R1
    FunctionEnd

    Function CleanOldInstallation
        # Preserve stack
        Push $R0
        
        # Check if old BL is installed
        ReadRegStr $R0 HKLM "${OLD_GUID_UNINSTALLER}" "Publisher"

        # Check if this key exists or not
        StrCmp $R0 "${COMPANY_NAME}" DeleteOldEntry SkipOldEntry
        
        DeleteOldEntry:
            # Just blindly ignore errors...worst case it does nothing harmful
            DeleteRegKey HKLM "${OLD_GUID_UNINSTALLER}"
        SkipOldEntry:
        
        # Restore stack
        Pop $R0
    FunctionEnd

    Function CleanSuperOldInstallation
        # Preserve stack
        Push $R2
        DeleteRegKey HKCU "${SUPER_OLD_GUID_INSTALLER}"
        DeleteRegKey HKCU "${SUPER_OLD_GUID_UNINSTALLER}"
        # Restore stack
        Pop $R2
    FunctionEnd
!endif

!macro customInit
    # Checks for if already updated to new version...so we can remove the old entry
    Call CheckForNewInstallation
!macroend

!macro customInstall
    # Remove old entry for installation for sure now if it exists, because we just installed the client
    Call CleanOldInstallation
    Call CleanSuperOldInstallation
!macroend