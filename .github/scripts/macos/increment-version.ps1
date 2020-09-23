$rootPath = $env:GITHUB_WORKSPACE;
$buildNumber = 100 + [int]$env:GITHUB_RUN_NUMBER;
# See https://www.electron.build/configuration/configuration#configuration
Write-Output "Setting build number to $buildNumber";
Write-Output "::set-env name=BUILD_NUMBER::$buildNumber";
