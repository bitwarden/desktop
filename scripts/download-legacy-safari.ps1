$dir = Split-Path -Parent $MyInvocation.MyCommand.Path;
$rootDir = $dir + "\..";
$pluginsAppex = $rootDir + "\PlugIns\safari-legacy.appex";
$downloadOutput = $pluginsAppex + ".zip"

Invoke-WebRequest -Uri "https://github.com/bitwarden/browser/releases/download/v1.48.1/safari-legacy.appex.zip" -OutFile $downloadOutput

Expand-Archive -Path $downloadOutput -DestinationPath $pluginsAppex

Remove-Item $downloadOutput
