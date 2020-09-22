$homePath = Resolve-Path "~" | Select-Object -ExpandProperty Path;
$secretsPath = $homePath + "/secrets"
$rootPath = $env:GITHUB_WORKSPACE
$pprofile = "bitwarden_desktop_appstore.provisionprofile"

Copy-Item "$secretsPath/$pprofile" -destination "$rootPath/$pprofile"
