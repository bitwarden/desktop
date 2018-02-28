$dir = Split-Path -Parent $MyInvocation.MyCommand.Path;
$rootDir = $dir + "\..";
$distDir = $rootDir + "\dist";
$chocoDir = $rootDir + "\stores\chocolatey";
$distChocoDir = $distDir + "\chocolatey";

if(Test-Path -Path $distChocoDir) {
  Remove-Item -Recurse -Force $distChocoDir
}

Copy-Item -Path $chocoDir -Destination $distChocoDir –Recurse

$srcPackage = $rootDir + "\src\package.json";
$srcPackageVersion = (Get-Content -Raw -Path $srcPackage | ConvertFrom-Json).version;

$exe = $distDir + "\nsis-web\Bitwarden-Installer-" + $srcPackageVersion + ".exe";
$checksum = checksum -t sha256 $exe
$nuspec = $distChocoDir + "\bitwarden.nuspec";
$chocoInstall = $distChocoDir + "\tools\chocolateyinstall.ps1";

(Get-Content $chocoInstall).replace('__version__', $srcPackageVersion).replace('__checksum__', $checksum) | Set-Content $chocoInstall
choco pack $nuspec --version $srcPackageVersion --out $distChocoDir
