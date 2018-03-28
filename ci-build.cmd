@echo off
cd %~dp0
SETLOCAL

SET DIST_DIR=%APPVEYOR_BUILD_FOLDER%\dist\
SET DIST_SRC_DIR=%DIST_DIR%Source\
SET REPO_URL=https://github.com/%APPVEYOR_REPO_NAME%.git

call git clone %REPO_URL% %DIST_SRC_DIR%
cd %DIST_SRC_DIR%
call git checkout %APPVEYOR_REPO_COMMIT%
call git submodule update --init --recursive
cd %DIST_DIR%
call 7z a browser-source-%APPVEYOR_BUILD_NUMBER%.zip %DIST_SRC_DIR%
cd %APPVEYOR_BUILD_FOLDER%
