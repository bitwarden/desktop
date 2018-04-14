@echo off
cd %~dp0
SETLOCAL

SET DIST_DIR=%APPVEYOR_BUILD_FOLDER%\dist\
SET DIST_SRC_DIR=%DIST_DIR%Source\
SET REPO_URL=https://github.com/%APPVEYOR_REPO_NAME%.git

:: Do normal build
ECHO ## Build dist
CALL npm run dist

ECHO ## Run test
CALL npm run test

ECHO ## Package coverage report
CALL gulp ci

:: Build sources for reviewers
ECHO ## Build sources
CALL git clone --branch=%APPVEYOR_REPO_BRANCH% %REPO_URL% %DIST_SRC_DIR%
cd %DIST_SRC_DIR%
CALL git checkout %APPVEYOR_REPO_COMMIT%
CALL git submodule update --init --recursive
cd %DIST_DIR%
DEL /S/Q "%DIST_SRC_DIR%.git\objects\pack\*"
CALL 7z a browser-source-%APPVEYOR_BUILD_NUMBER%.zip "%DIST_SRC_DIR%\*"
cd %APPVEYOR_BUILD_FOLDER%
