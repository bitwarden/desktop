param (
  [string] $version,
  [switch] $mas,
  [switch] $masdev,
  [switch] $skipcheckout
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
$distSafariAppexDmg = $distSafariDir + "\browser\dist\Safari\dmg\build\Release\safari.appex";
$distSafariAppexMas = $distSafariDir + "\browser\dist\Safari\mas\build\Release\safari.appex";
$distSafariAppexMasDev = $distSafariDir + "\browser\dist\Safari\masdev\build\Release\safari.appex";
$pluginsAppex = $rootDir + "\PlugIns\safari.appex";

if (Test-Path -Path $pluginsAppex) {
  Remove-Item -Recurse -Force $pluginsAppex
}

if(-not $skipcheckout) {
  if (Test-Path -Path $distSafariDir) {
    Remove-Item -Recurse -Force $distSafariDir
  }
  New-Item $distSafariDir -ItemType Directory -ea 0
}

ls
cd $distDir
ls
cd $distSafariDir
ls

if(-not $skipcheckout) {
  git clone git@github.com:bitwarden/browser.git
}

cd browser

if (-not ([string]::IsNullOrEmpty($version))) {
  $tag = "v" + $version
  git checkout tags/$tag
}

npm i
if ($mas) {
  npm run dist:safari:mas
  Copy-Item -Path $distSafariAppexMas -Destination $pluginsAppex –Recurse
}
elseif ($masdev) {
  npm run dist:safari
  Copy-Item -Path $distSafariAppexMasDev -Destination $pluginsAppex –Recurse
}
else {
  npm run dist:safari:dmg
  Copy-Item -Path $distSafariAppexDmg -Destination $pluginsAppex –Recurse
}
cd $rootDir
