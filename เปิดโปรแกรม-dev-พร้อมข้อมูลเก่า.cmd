@echo off
setlocal

set "ROOT=%~dp0"
set "HTML=%ROOT%outputs\3d-print-cost-calculator.html"
set "LAUNCHER=%ROOT%work\installer\payload\3D PrintCost Studio.exe"

if not exist "%HTML%" (
  echo Cannot find app HTML:
  echo %HTML%
  pause
  exit /b 1
)

if not exist "%LAUNCHER%" (
  echo Cannot find launcher:
  echo %LAUNCHER%
  pause
  exit /b 1
)

start "" "%LAUNCHER%" --external-html "%HTML%"
