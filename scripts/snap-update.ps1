param (
    [Parameter(Mandatory=$true)]
    [string] $version
)

# Dependencies:
# 1. Install powershell, ex `sudo apt-get install -y powershell`
#
# To run:
# pwsh ./snap-update.ps1 -version 1.5.0

$dir = Split-Path -Parent $MyInvocation.MyCommand.Path;
$rootDir = $dir + "/..";
$distDir = $rootDir + "/dist";
$distSnapDir = $distDir + "/snap";

if(Test-Path -Path $distSnapDir) {
    Remove-Item -Recurse -Force $distSnapDir
}
New-Item -ItemType directory -Path $distSnapDir | Out-Null

$snap = "bitwarden_" + $version + "_amd64.snap";
$distSnap = $distSnapDir + "/" + $snap;
$uri = "https://github.com/bitwarden/desktop/releases/download/v" + $version + "/" + $snap;
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Invoke-RestMethod -Uri $uri -OutFile $distSnap

snapcraft upload $distSnap --release stable
