$distDir = $env:APPVEYOR_BUILD_FOLDER + "\dist\"
$distSrcDir = $distDir + "Source\"
git clone https://github.com/ + $env:APPVEYOR_REPO_NAME + ".git" $distSrcDir
cd $distSrcDir
git checkout $env:APPVEYOR_REPO_COMMIT
git submodule update --init --recursive
cd $distSrcDir
7z a browser-source-$env:APPVEYOR_BUILD_NUMBER.zip $distSrcDir
cd $env:APPVEYOR_BUILD_FOLDER
