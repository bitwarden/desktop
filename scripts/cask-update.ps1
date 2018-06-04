param (
    [string] $version = ""
)

# Dependencies:
# 1. brew cask install powershell
# 2. brew install vitorgalvao/tiny-scripts/cask-repair
#    see https://github.com/Homebrew/homebrew-cask/blob/master/CONTRIBUTING.md#updating-a-cask
# 3. fork of homebrew-cask repo setup.
#    see https://github.com/caskroom/homebrew-cask/blob/master/CONTRIBUTING.md#getting-set-up-to-contribute
# 4. Environment variables for GITHUB_USER and GITHUB_TOKEN set.
#
# To run:
# sh ./cask-update.sh -version 1.3.0

cask-repair bitwarden --cask-version $version --blind-submit
