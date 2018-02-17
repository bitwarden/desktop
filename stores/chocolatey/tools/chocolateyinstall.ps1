$ErrorActionPreference = 'Stop';

$url = 'https://github.com/bitwarden/desktop/releases/download/v0.0.5/bitwarden-web-setup-0.0.5.exe'
$checksum = '017E5B289EB583E93DB7F108FB5CB0AD28AB44EEE045A8A096B442CAF822567F'

$packageArgs = @{
  packageName   = 'bitwarden'
  fileType      = 'EXE'
  softwareName  = 'Bitwarden'
  url           = $url
  checksum      = $checksum
  checksumType  = 'sha256'
  silentArgs    = '/S'
  validExitCodes= @(0)
}

Install-ChocolateyPackage @packageArgs
