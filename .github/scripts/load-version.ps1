$rootPath = $env:GITHUB_WORKSPACE;
$packageVersion = (Get-Content -Raw -Path $rootPath\src\package.json | ConvertFrom-Json).version;

Write-Output "Setting package version to $packageVersion";
Write-Output "PACKAGE_VERSION=$packageVersion" | Out-File -FilePath $env:GITHUB_ENV -Encoding utf8 -Append;
