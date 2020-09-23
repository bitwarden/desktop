$rootPath = $env:GITHUB_WORKSPACE;

$decryptSecretPath = $($rootPath + "/.github/scripts/decrypt-secret.ps1");

Invoke-Expression "& `"$decryptSecretPath`" -filename bitwarden-desktop-key.p12.gpg"
Invoke-Expression "& `"$decryptSecretPath`" -filename appstore-app-cert.p12.gpg"
Invoke-Expression "& `"$decryptSecretPath`" -filename appstore-installer-cert.p12.gpg"
Invoke-Expression "& `"$decryptSecretPath`" -filename devid-app-cert.p12.gpg"
Invoke-Expression "& `"$decryptSecretPath`" -filename devid-installer-cert.p12.gpg"
Invoke-Expression "& `"$decryptSecretPath`" -filename macdev-cert.p12.gpg"
Invoke-Expression "& `"$decryptSecretPath`" -filename bitwarden_desktop_appstore.provisionprofile.gpg"
