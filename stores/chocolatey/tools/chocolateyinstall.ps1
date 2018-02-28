$ErrorActionPreference = 'Stop';

$url = 'https://github.com/bitwarden/desktop/releases/download/v__version__/Bitwarden-Installer-__version__.exe'
$checksum = '__checksum__'

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
