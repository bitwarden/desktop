param (
    [Parameter(Mandatory=$true)]
    [string] $version
)

# Dependencies:
# 1. brew cask install powershell
#
# To run:
# pwsh ./build-safari-appex.ps1 -version 1.41.0

$dir = Split-Path -Parent $MyInvocation.MyCommand.Path;
$rootDir = $dir + "\..";
$distDir = $rootDir + "\dist";
$distSafariDir = $distDir + "\safari";
$distSafariAppex = $distSafariDir + "\src\dist\Safari\build\Release\safari.appex";
$pluginsAppex = $rootDir + "\PlugIns\safari.appex";

cd $distSafariDir
git clone https://github.com/bitwarden/browser.github
cd browser
git checkout tags/$version
npm i
npm run dist:safari
Copy-Item -Path $distSafariAppex -Destination $pluginsAppex
cd $rootDir
