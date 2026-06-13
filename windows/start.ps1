# Voice Llama - Windows Startup Script (PowerShell HTTP Listener)

$port = 8000
$address = "http://localhost:$port/"

# Check if the port is in use, and increment it if so
while ($true) {
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connection) {
        $port++
        $address = "http://localhost:$port/"
    } else {
        break
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Iniciando Servidor Voice Llama (Windows)" -ForegroundColor Green
Write-Host "  Servidor ativo em: $address" -ForegroundColor Cyan
Write-Host "  Pressione Ctrl+C para encerrar." -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Open the address in the default browser
Start-Process $address

# Create and configure .NET HTTP Listener (no Python/Ruby needed!)
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($address)
$listener.Start()

# Helper function to get Content-Type
function Get-ContentType($filePath) {
    if ($filePath.EndsWith(".html")) { return "text/html; charset=utf-8" }
    elseif ($filePath.EndsWith(".css")) { return "text/css" }
    elseif ($filePath.EndsWith(".js")) { return "application/javascript" }
    elseif ($filePath.EndsWith(".png")) { return "image/png" }
    elseif ($filePath.EndsWith(".jpg") -or $filePath.EndsWith(".jpeg")) { return "image/jpeg" }
    elseif ($filePath.EndsWith(".ico")) { return "image/x-icon" }
    return "application/octet-stream"
}

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        # Build local path
        $urlPath = $request.Url.LocalPath
        if ($urlPath -eq "/") {
            $urlPath = "/index.html"
        }
        
        # Replace forward slashes with Windows backslashes
        $localPath = Join-Path $PSScriptRoot $urlPath.Replace("/", "\")
        
        if (Test-Path $localPath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($localPath)
            
            $response.ContentType = Get-ContentType($localPath)
            $response.ContentLength64 = $bytes.Length
            $response.Headers.Add("Access-Control-Allow-Origin", "*")
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("Ficheiro nao encontrado: $urlPath")
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }
        $response.OutputStream.Close()
    }
} catch {
    Write-Host "Erro no servidor: $_" -ForegroundColor Red
} finally {
    $listener.Close()
    Write-Host "Servidor encerrado." -ForegroundColor Yellow
}
