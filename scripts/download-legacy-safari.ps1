$dir = Split-Path -Parent $MyInvocation.MyCommand.Path;
$rootDir = $dir + "\..";
$outputPath = $rootDir + "\PlugIns";
$downloadOutput = $outputPath + "\safari-legacy.appex.zip"

Invoke-WebRequest -Uri "https://github.com/bitwarden/browser/releases/download/v1.48.1/safari-legacy.appex.zip" -OutFile $downloadOutput

Expand-Archive -Path $downloadOutput -DestinationPath $outputPath

Remove-Item $downloadOutput
