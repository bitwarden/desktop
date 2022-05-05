$dir = Split-Path -Parent $MyInvocation.MyCommand.Path;
$rootDir = $dir + "\..";
$outputPath = $rootDir + "\PlugIns";
$zipFileName = "safari-legacy.appex.zip";
$downloadOutput = $outputPath + "\" + $zipFileName;

Invoke-WebRequest -Uri "https://github.com/bitwarden/browser/releases/download/v1.48.1/safari-legacy.appex.zip" -OutFile $downloadOutput

Set-Location $outputPath
Invoke-Expression -Command "unzip $zipFileName"

Remove-Item $downloadOutput
