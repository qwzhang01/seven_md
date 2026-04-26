# Windows Installation Test Plan

## Overview
This document outlines the testing procedures for Windows installation and uninstallation of Seven MD.

## Test Environment
- **OS Versions**: Windows 10, Windows 11
- **Architectures**: x64
- **Installation Types**: MSI, NSIS
- **User Contexts**: Standard User, Administrator

## Pre-requisites
- Built Windows installer packages (MSI and NSIS)
- Test machines with clean Windows installations
- Network connectivity for dependency downloads

## Test Cases

### 1. MSI Installer Tests

#### 1.1 Basic Installation
- **Description**: Install using MSI package with default settings
- **Steps**:
  1. Double-click `SevenMarkdown-1.0.0-x64.msi`
  2. Follow installation wizard
  3. Accept license agreement
  4. Choose installation directory
  5. Complete installation
- **Expected Results**:
  - Application installs successfully
  - Shortcut created in Start Menu
  - Desktop shortcut created (if selected)
  - Application launches successfully

#### 1.2 Silent Installation
- **Description**: Install using command line silently
- **Steps**:
  ```cmd
  msiexec /i SevenMarkdown-1.0.0-x64.msi /qn
  ```
- **Expected Results**:
  - Installation completes without user interaction
  - Application appears in Programs and Features

#### 1.3 Custom Installation Path
- **Description**: Install to custom directory
- **Steps**:
  1. Run installer
  2. Choose custom installation path
  3. Complete installation
- **Expected Results**:
  - Files installed to specified directory
  - Application functions correctly

### 2. NSIS Installer Tests

#### 2.1 Standard Installation
- **Description**: Install using NSIS installer
- **Steps**:
  1. Run `SevenMarkdown-Setup-1.0.0.exe`
  2. Follow installation wizard
  3. Choose components
  4. Complete installation
- **Expected Results**:
  - Application installs successfully
  - All selected components installed
  - Application launches

#### 2.2 Portable Installation
- **Description**: Install as portable application
- **Steps**:
  1. Run installer
  2. Choose portable mode
  3. Select destination folder
- **Expected Results**:
  - Application runs without system installation
  - No registry entries created
  - Can be moved between systems

### 3. Uninstallation Tests

#### 3.1 Standard Uninstall
- **Description**: Uninstall via Control Panel
- **Steps**:
  1. Open Programs and Features
  2. Select Seven MD
  3. Click Uninstall
  4. Follow uninstall wizard
- **Expected Results**:
  - Application removed completely
  - All files and registry entries removed
  - Shortcuts removed

#### 3.2 Silent Uninstall
- **Description**: Uninstall via command line
- **Steps**:
  ```cmd
  # For MSI
  msiexec /x {PRODUCT-GUID} /qn
  
  # For NSIS
  "C:\Program Files\Seven MD\uninstall.exe" /S
  ```
- **Expected Results**:
  - Silent uninstallation
  - No user interaction required

### 4. Upgrade Tests

#### 4.1 In-place Upgrade
- **Description**: Upgrade from previous version
- **Steps**:
  1. Install previous version
  2. Run new installer
  3. Follow upgrade process
- **Expected Results**:
  - Settings and data preserved
  - New version installed successfully

## Test Automation

### PowerShell Test Script
```powershell
# Installation test script
param(
    [string]$InstallerPath,
    [string]$InstallType = "msi"
)

if ($InstallType -eq "msi") {
    # MSI installation
    Start-Process msiexec -ArgumentList "/i `"$InstallerPath`" /qn" -Wait
} else {
    # NSIS installation
    Start-Process $InstallerPath -ArgumentList "/S" -Wait
}

# Verify installation
$installed = Test-Path "C:\Program Files\Seven MD\SevenMarkdown.exe"
Write-Host "Installation successful: $installed"
```

## Success Criteria
- All installation methods complete without errors
- Application launches and functions correctly
- Uninstallation removes all components
- Upgrade preserves user data
- No system instability or conflicts

## Reporting
- Document any installation failures
- Record system information for troubleshooting
- Capture screenshots of error messages
- Log installation and uninstallation events