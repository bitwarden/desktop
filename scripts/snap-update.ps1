# To run:
# ./snap-update.ps1

$dir = Split-Path -Parent $MyInvocation.MyCommand.Path;
$rootDir = $dir + "/..";
$distDir = $rootDir + "/dist";
$distSnap = $distDir + "/bitwarden*.snap";

snapcraft push $distSnap --release stable
