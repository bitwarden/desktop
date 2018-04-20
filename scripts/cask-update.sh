#!/usr/bin/env bash
set -e

# Dependencies:
# 1. brew install jq
# 2. fork of homebrew-cask repo setup.
#    see https://github.com/caskroom/homebrew-cask/blob/master/CONTRIBUTING.md#getting-set-up-to-contribute
#
# To run:
# sh ./cask-update.sh
#
# then submit PR from fork repo

FORK_GITHUB_USER="kspearrin"
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PWD_DIR="$(pwd)"
ROOT_DIR="$DIR/.."
DIST_DIR="$ROOT_DIR/dist"
CASK_DIR="$ROOT_DIR/stores/homebrew-cask"
DIST_CASK_DIR="$DIST_DIR/homebrew-cask"
GIT_CASKS_DIR=""$(brew --repository)"/Library/Taps/caskroom/homebrew-cask/Casks"

if [ -d "$DIST_CASK_DIR" ]
then
    rm -rf $DIST_CASK_DIR
fi

cp -r $CASK_DIR $DIST_DIR

SRC_PACKAGE="$ROOT_DIR/src/package.json";
SRC_PACAKGE_VERSION=$(jq -r '.version' $SRC_PACKAGE)

ZIP="$DIST_DIR/Bitwarden-$SRC_PACAKGE_VERSION-mac.zip"
CHECKSUM=($(shasum -a 256 $ZIP))
CHECKPOINT=$(brew cask _appcast_checkpoint --calculate "https://github.com/bitwarden/desktop/releases.atom")
RB="$DIST_CASK_DIR/bitwarden.rb"
RB_NEW="$DIST_CASK_DIR/bitwarden.rb.new"

sed -e 's/__version__/'"$SRC_PACAKGE_VERSION"'/g; s/__checksum__/'"$CHECKSUM"'/g; s/__checkpoint__/'"$CHECKPOINT"'/g' $RB > $RB_NEW
mv -f $RB_NEW $RB

cd $GIT_CASKS_DIR
git checkout master
git pull
git reset --hard origin/master
git push $FORK_GITHUB_USER master
git push -d $FORK_GITHUB_USER bitwarden || true
git branch -D bitwarden || true
git checkout -b bitwarden
GIT_CASKS_RB="$GIT_CASKS_DIR/bitwarden.rb"
cp $RB $GIT_CASKS_RB
git add $GIT_CASKS_RB
git commit -m "Update Bitwarden.app to v$SRC_PACAKGE_VERSION"
git push $FORK_GITHUB_USER bitwarden
cd $PWD_DIR
