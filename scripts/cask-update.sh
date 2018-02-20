# dependencies:
# brew install jq

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$DIR/.."
DIST_DIR="$ROOT_DIR/dist"
CASK_DIR="$ROOT_DIR/stores/homebrew-cask"
DIST_CASK_DIR="$DIST_DIR/homebrew-cask"

cp -r $CASK_DIR $DIST_CASK_DIR

if [ ! -d "$DIST_CASK_DIR" ]
then
    rm -rf $DIST_CASK_DIR
fi

cp -r $CASK_DIR $DIST_CASK_DIR

SRC_PACKAGE="$ROOT_DIR/src/package.json";
SRC_PACAKGE_VERSION=(jq 'version' SRC_PACKAGE)

ZIP="$DIST_DIR\Bitwarden-$SRC_PACAKGE_VERSION-mac.zip"
CHECKSUM=(shasum -a 256 $ZIP)
CHECKPOINT=(brew cask _appcast_checkpoint --calculate "https://github.com/bitwarden/desktop/releases.atom")
RB="$DIST_CASK_DIR/bitwarden.rb"

sed -i -e 's/__version__/'"$SRC_PACAKGE_VERSION"'/g' $RB
sed -i -e 's/__checksum__/'"$CHECKSUM"'/g' $RB
sed -i -e 's/__checkpoint__/'"$CHECKPOINT"'/g' $RB
