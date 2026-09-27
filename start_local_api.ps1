# FireWatch SIH PS 162 - Windows Native Local API Server (Zero Dependency)
$port = 5000
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  FireWatch Windows Local API Server (SIH PS 162)" -ForegroundColor Green
Write-Host "  API Endpoint: http://localhost:$port/api/fires" -ForegroundColor Yellow
Write-Host "  Listening for requests... (Press Ctrl+C to stop)" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Cyan

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    # CORS Headers
    $response.AddHeader("Access-Control-Allow-Origin", "*")
    $response.AddHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
    $response.AddHeader("Access-Control-Allow-Headers", "Content-Type")

    if ($request.HttpMethod -eq "OPTIONS") {
        $response.StatusCode = 200
        $response.Close()
        continue
    }

    $csvPath = Join-Path $PSScriptRoot "sample_fires_dataset.csv"
    if (Test-Path $csvPath) {
        $data = Import-Csv $csvPath
        $json = $data | ConvertTo-Json
    } else {
        $json = '[{"latitude":21.85,"longitude":86.32,"frp":72.4,"confidence":95,"type":"wildfire","location":"Simlipal"}]'
    }

    $buffer = [System.Text.Encoding]::UTF8.GetBytes($json)
    $response.ContentType = "application/json"
    $response.ContentLength64 = $buffer.Length
    $response.OutputStream.Write($buffer, 0, $buffer.Length)
    $response.Close()
    Write-Host "[Synced] Served $($data.Count) fire records to dashboard" -ForegroundColor Green
}
