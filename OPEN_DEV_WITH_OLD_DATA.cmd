@echo off
setlocal

set "ROOT=%~dp0"
set "HTML=%ROOT%outputs\3d-print-cost-calculator.html"
set "LAUNCHER_PROJECT=%ROOT%work\installer\Launcher\PrintCostLauncher.csproj"

if not exist "%HTML%" (
  echo Cannot find app HTML:
  echo %HTML%
  pause
  exit /b 1
)

if not exist "%LAUNCHER_PROJECT%" (
  echo Cannot find launcher project:
  echo %LAUNCHER_PROJECT%
  pause
  exit /b 1
)

echo Opening 3D PrintCost Studio DEV with old saved data...
echo HTML: %HTML%
echo.
dotnet run --project "%LAUNCHER_PROJECT%" -- --external-html "%HTML%"

if errorlevel 1 (
  echo.
  echo Failed to open the DEV app.
  pause
)
