# To run:
# ./snap-release.ps1

$dir = Split-Path -Parent $MyInvocation.MyCommand.Path;
$rootDir = $dir + "/..";
$distDir = $rootDir + "/dist";
$distSnap = $distDir + "/bitwarden*.snap";

snap push $distSnap --release stable
