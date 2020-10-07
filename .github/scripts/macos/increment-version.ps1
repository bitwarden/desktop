$rootPath = $env:GITHUB_WORKSPACE;
$packagePath = "$rootPath\package.json";
$buildNumber = 100 + [int]$env:GITHUB_RUN_NUMBER;

Write-Output "Setting build number to $buildNumber";
Write-Output "::set-env name=BUILD_NUMBER::$buildNumber";

$package = Get-Content -Raw -Path $packagePath | ConvertFrom-Json;
$package.build | Add-Member -MemberType NoteProperty -Name buildVersion -Value "$buildNumber";
$package | ConvertTo-Json -Depth 32 | Set-Content $packagePath;
