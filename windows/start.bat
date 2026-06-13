@echo off
title Voice Llama Server
cd /d "%~dp0"
echo Iniciando o Voice Llama...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start.ps1"
pause
