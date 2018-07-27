# Dependencies:
# 1. Install powershell, ex `sudo apt-get install -y powershell`
#
# To run:
# pwsh ./snap-update.ps1

$dir = Split-Path -Parent $MyInvocation.MyCommand.Path;
$rootDir = $dir + "/..";
$distDir = $rootDir + "/dist";
$distSnap = $distDir + "/bitwarden*.snap";

snapcraft push $distSnap --release stable
