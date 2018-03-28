$distDir = $env:APPVEYOR_BUILD_FOLDER + "\dist\"
$distSrcDir = $distDir + "Source\"
$repoUrl = "https://github.com/" + $env:APPVEYOR_REPO_NAME + ".git"
git clone -q --branch=master $repoUrl $distSrcDir
cd $distSrcDir
git checkout -qf $env:APPVEYOR_REPO_COMMIT
git submodule update --init --recursive
cd $distSrcDir
7z a browser-source-$env:APPVEYOR_BUILD_NUMBER.zip $distSrcDir
cd $env:APPVEYOR_BUILD_FOLDER
