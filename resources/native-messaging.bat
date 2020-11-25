@echo off
:: Helper script for starting the Native Messaging Proxy on Windows.

cd ../
set ELECTRON_RUN_AS_NODE=1
set ELECTRON_NO_ATTACH_CONSOLE=1
Bitwarden.exe resources/app.asar %*
