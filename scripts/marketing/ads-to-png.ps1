param(
  [string]$OutDir = "E:\SECUVION\marketing-out"
)

if (-not (Test-Path $OutDir)) { New-Item -ItemType Directory -Path $OutDir | Out-Null }

# Format: input PPTX, output PNG, width px, height px
$jobs = @(
  @{ Pptx = "E:\SECUVION\scripts\marketing\ad-square-1080.pptx";       Png = "$OutDir\ad-square-1080.png";       W = 1080; H = 1080 },
  @{ Pptx = "E:\SECUVION\scripts\marketing\ad-story-1080x1920.pptx";   Png = "$OutDir\ad-story-1080x1920.png";   W = 1080; H = 1920 },
  @{ Pptx = "E:\SECUVION\scripts\marketing\ad-linkedin-1200x627.pptx"; Png = "$OutDir\ad-linkedin-1200x627.png"; W = 1200; H = 627  }
)

Write-Host "Booting PowerPoint COM..."
$ppt = New-Object -ComObject PowerPoint.Application

try {
  foreach ($j in $jobs) {
    if (-not (Test-Path $j.Pptx)) { Write-Warning "Missing: $($j.Pptx)"; continue }
    if (Test-Path $j.Png) { Remove-Item $j.Png -Force -ErrorAction SilentlyContinue }

    Write-Host "→ $($j.Pptx)"
    $deck = $ppt.Presentations.Open($j.Pptx, $true, $false, $false)
    $slide = $deck.Slides.Item(1)
    # Slide.Export(filename, format, width, height)
    $slide.Export($j.Png, "PNG", $j.W, $j.H)
    $deck.Close()
    Write-Host "    wrote: $($j.Png)  ($($j.W) x $($j.H))"
  }
} finally {
  $ppt.Quit()
  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($ppt) | Out-Null
}

Write-Host ""
Write-Host "Done. Open: $OutDir"
Get-ChildItem $OutDir -Filter "*.png" | Format-Table Name, Length -AutoSize
