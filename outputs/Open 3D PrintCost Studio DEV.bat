@echo off
setlocal
set "ROOT=C:\Users\CG BAHO\Documents\Codex\2026-06-01\3d-printer-stock-filament-stock-filament"
set "DEV_EXE=%ROOT%\work\installer\build\launcher-dev\3D PrintCost Studio Dev.exe"
set "HTML=%ROOT%\outputs\3d-print-cost-calculator.html"
set "APP_URI_FILE=C:\Program Files\BAHO\3D PrintCost Studio\3d-print-cost-calculator.html"

if not exist "%DEV_EXE%" (
  echo Dev launcher not found:
  echo %DEV_EXE%
  echo.
  echo Ask Codex to rebuild the dev launcher.
  pause
  exit /b 1
)

if not exist "%HTML%" (
  echo HTML file not found:
  echo %HTML%
  pause
  exit /b 1
)

start "" "%DEV_EXE%" --external-html "%HTML%" --app-uri-file "%APP_URI_FILE%"
