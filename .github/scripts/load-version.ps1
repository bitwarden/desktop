$rootPath = $env:GITHUB_WORKSPACE;
$packageVersion = (Get-Content -Raw -Path $rootPath\src\package.json | ConvertFrom-Json).version;

Write-Output "Setting package version to $packageVersion";
Write-Output "::set-env name=PACKAGE_VERSION::$packageVersion";
