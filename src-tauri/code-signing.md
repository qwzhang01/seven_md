# Windows Code Signing Configuration

## Overview
This document describes the code signing setup for Windows builds of Seven MD.

## Prerequisites
- Valid code signing certificate (EV certificate recommended)
- Certificate stored in Windows Certificate Store or as PFX file
- Access to certificate password (if using PFX)

## Configuration

### Tauri Configuration
Update `tauri.conf.json5` with your certificate information:

```json5
"windows": {
  "certificateThumbprint": "YOUR_CERTIFICATE_THUMBPRINT",
  "digestAlgorithm": "sha256",
  "timestampUrl": "http://timestamp.digicert.com"
}
```

### Environment Variables (for CI/CD)
```bash
# For PFX certificate
TAURI_WINDOWS_CERTIFICATE_FILE=path/to/certificate.pfx
TAURI_WINDOWS_CERTIFICATE_PASSWORD=your_password

# For certificate store
TAURI_WINDOWS_CERTIFICATE_THUMBPRINT=your_thumbprint
```

## Certificate Thumbprint
To get the certificate thumbprint:
1. Open Certificate Manager (`certmgr.msc`)
2. Find your code signing certificate
3. View certificate details
4. Copy the thumbprint (remove spaces)

## Timestamp Servers
Recommended timestamp servers:
- `http://timestamp.digicert.com`
- `http://timestamp.comodoca.com`
- `http://timestamp.globalsign.com`

## GitHub Actions Setup
Add these secrets to your GitHub repository:
- `WINDOWS_CERTIFICATE` (base64 encoded PFX file)
- `WINDOWS_CERTIFICATE_PASSWORD`

## Manual Signing (Alternative)
If automatic signing fails, use `signtool` manually:
```bash
signtool sign /f certificate.pfx /p password /t http://timestamp.digicert.com SevenMD.exe
```

## Troubleshooting
- Ensure certificate is valid and not expired
- Check certificate permissions
- Verify timestamp server accessibility
- Test with a simple executable first