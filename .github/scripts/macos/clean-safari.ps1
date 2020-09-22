$rootPath = $env:GITHUB_WORKSPACE;
$distDir = $rootPath + "\dist";
$distSafariDir = $distDir + "\safari";

if (Test-Path -Path $distSafariDir) {
  Remove-Item -Recurse -Force $distSafariDir
}
New-Item $distSafariDir -ItemType Directory -ea 0
