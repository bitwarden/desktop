$dir = Split-Path -Parent $MyInvocation.MyCommand.Path;
$rootDir = $dir + "\..";
$distDir = $rootDir + "\dist";
$nuspec = $rootDir + "\stores\chocolatey\bitwarden.nuspec";
$srcPackage = $rootDir + "\src\package.json";
$srcPackageVersion = (Get-Content -Raw -Path $srcPackage | ConvertFrom-Json).version;

choco pack $nuspec --version $srcPackageVersion --out $distDir
