cask 'bitwarden' do
    version '__version__'
    sha256 '__checksum__'
  
    # github.com/bitwarden/desktop was verified as official when first introduced to the cask
    url "https://github.com/bitwarden/desktop/releases/download/v#{version}/bitwarden-#{version}-mac.zip"
    appcast 'https://github.com/bitwarden/desktop/releases.atom',
            checkpoint: '__checkpoint__'
    name 'Bitwarden'
    homepage 'https://bitwarden.com/'
  
    app 'Bitwarden.app'
  end
