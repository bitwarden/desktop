$homePath = Resolve-Path "~" | Select-Object -ExpandProperty Path;
$secretsPath = $homePath + "/secrets"

$desktopKeyPath = $($secretsPath + "/bitwarden-desktop-key.p12");
$devidAppCertPath = $($secretsPath + "/devid-app-cert.p12");
$devidInstallerCertPath = $($secretsPath + "/devid-installer-cert.p12");
$appstoreAppCertPath = $($secretsPath + "/appstore-app-cert.p12");
$appstoreInstallerCertPath = $($secretsPath + "/appstore-installer-cert.p12");

security create-keychain -p $env:KEYCHAIN_PASSWORD build.keychain
security default-keychain -s build.keychain
security unlock-keychain -p $env:KEYCHAIN_PASSWORD build.keychain
security set-keychain-settings -lut 1200 build.keychain
security add-generic-password -k build.keychain -a "AC_USERNAME" -w $env:APPLE_ID_PASSWORD -s "AC_PASSWORD"
security import $desktopKeyPath -k build.keychain -P $env:DESKTOP_KEY_PASSWORD -T /usr/bin/codesign -T /usr/bin/security
security import $devidAppCertPath -k build.keychain -P $env:DEVID_CERT_PASSWORD -T /usr/bin/codesign -T /usr/bin/security
security import $devidInstallerCertPath -k build.keychain -P $env:DEVID_CERT_PASSWORD -T /usr/bin/codesign -T /usr/bin/security
security import $appstoreAppCertPath -k build.keychain -P $env:APPSTORE_CERT_PASSWORD -T /usr/bin/codesign -T /usr/bin/security
security import $appstoreInstallerCertPath -k build.keychain -P $env:APPSTORE_CERT_PASSWORD -T /usr/bin/codesign -T /usr/bin/security
security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k $env:KEYCHAIN_PASSWORD build.keychain
