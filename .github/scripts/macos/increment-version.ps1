$rootPath = $env:GITHUB_WORKSPACE;
$packagePath = "$rootPath\package.json";
$buildNumber = 500 + [int]$env:GITHUB_RUN_NUMBER;
Write-Output "Setting build number to $buildNumber";
Write-Output "BUILD_NUMBER=$buildNumber" | Out-File -FilePath $env:GITHUB_ENV -Encoding utf8 -Append;
$package = Get-Content -Raw -Path $packagePath | ConvertFrom-Json;
$package.build | Add-Member -MemberType NoteProperty -Name buildVersion -Value "$buildNumber";
$package | ConvertTo-Json -Depth 32 | Set-Content $packagePath;
